// Anmelden mit Google oder Facebook (OAuth 2.0, Authorization-Code-Flow).
// Aktiv nur, wenn GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET bzw. FACEBOOK_APP_ID/FACEBOOK_APP_SECRET gesetzt sind.
// Redirect-URIs, die in der Google-/Facebook-Konsole eingetragen werden muessen:
//   <APP_URL>/api/auth/oauth/google/callback
//   <APP_URL>/api/auth/oauth/facebook/callback
import crypto from 'crypto';
import type { Express, Request, Response } from 'express';
import { readCookie, type AuthApi } from './server-auth';

const STATE_COOKIE = 'gf_oauth_state';

interface Provider {
  id: 'google' | 'facebook';
  enabled: () => boolean;
  authUrl: (redirectUri: string, state: string) => string;
  profile: (code: string, redirectUri: string) => Promise<{ sub: string; email?: string; verified: boolean; name?: string }>;
}

const fbVersion = () => process.env.FACEBOOK_API_VERSION || 'v21.0';

const PROVIDERS: Provider[] = [
  {
    id: 'google',
    enabled: () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    authUrl: (redirect, state) =>
      `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: redirect, response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account' })}`,
    profile: async (code, redirect) => {
      const tok = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: redirect, grant_type: 'authorization_code' }),
      }).then(r => r.json());
      if (!tok.access_token) throw new Error('Google hat keinen Zugang erteilt.');
      const me = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tok.access_token}` } }).then(r => r.json());
      return { sub: String(me.sub), email: me.email, verified: me.email_verified === true, name: me.name };
    },
  },
  {
    id: 'facebook',
    enabled: () => Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
    authUrl: (redirect, state) =>
      `https://www.facebook.com/${fbVersion()}/dialog/oauth?${new URLSearchParams({ client_id: process.env.FACEBOOK_APP_ID!, redirect_uri: redirect, state, scope: 'email,public_profile' })}`,
    profile: async (code, redirect) => {
      const tok = await fetch(`https://graph.facebook.com/${fbVersion()}/oauth/access_token?${new URLSearchParams({ client_id: process.env.FACEBOOK_APP_ID!, client_secret: process.env.FACEBOOK_APP_SECRET!, redirect_uri: redirect, code })}`).then(r => r.json());
      if (!tok.access_token) throw new Error('Facebook hat keinen Zugang erteilt.');
      const me = await fetch(`https://graph.facebook.com/me?${new URLSearchParams({ fields: 'id,name,email', access_token: tok.access_token })}`).then(r => r.json());
      // Facebook gibt nur bestaetigte E-Mail-Adressen heraus
      return { sub: String(me.id), email: me.email, verified: Boolean(me.email), name: me.name };
    },
  },
];

export function installOAuth(app: Express, auth: AuthApi) {
  const base = (req: Request) => process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const back = (res: Response, msg?: string) => res.redirect(302, msg ? `/?login_error=${encodeURIComponent(msg)}` : '/');

  for (const p of PROVIDERS) {
    const redirectUri = (req: Request) => `${base(req)}/api/auth/oauth/${p.id}/callback`;

    app.get(`/api/auth/oauth/${p.id}`, (req, res) => {
      if (!p.enabled()) return back(res, 'Diese Anmeldung ist noch nicht eingerichtet.');
      const state = crypto.randomBytes(16).toString('hex');
      res.setHeader('Set-Cookie', `${STATE_COOKIE}=${state}; Path=/api/auth/oauth; HttpOnly; SameSite=Lax; Max-Age=600${auth.isProd ? '; Secure' : ''}`);
      res.redirect(302, p.authUrl(redirectUri(req), state));
    });

    app.get(`/api/auth/oauth/${p.id}/callback`, async (req, res) => {
      const state = String(req.query.state || '');
      if (!state || state !== readCookie(req, STATE_COOKIE)) return back(res, 'Die Anmeldung ist abgelaufen. Bitte versuche es erneut.');
      if (req.query.error || !req.query.code) return back(res, 'Anmeldung abgebrochen.');
      try {
        const prof = await p.profile(String(req.query.code), redirectUri(req));
        if (!prof.email || !prof.verified) return back(res, 'Dein Konto hat keine bestätigte E-Mail-Adresse.');
        const email = prof.email.trim().toLowerCase();
        let u = auth.findBy(x => x.oauth?.[p.id] === prof.sub) || auth.findByEmail(email);
        if (u?.disabled && u.email !== auth.ownerEmail) return back(res, 'Dieses Konto ist gesperrt.');
        if (!u) {
          u = auth.createUser({ name: (prof.name || email.split('@')[0]).slice(0, 80), email, oauth: { [p.id]: prof.sub } });
        } else if (u.oauth?.[p.id] !== prof.sub) {
          auth.updateUser(u.id, { oauth: { ...(u.oauth || {}), [p.id]: prof.sub } });
        }
        auth.updateUser(u.id, { lastLoginAt: new Date().toISOString(), ...(u.email === auth.ownerEmail ? { role: 'owner', disabled: false } : {}) });
        auth.startSession(res, u.id);
        back(res);
      } catch (e: any) {
        console.error(`[oauth:${p.id}]`, e?.message);
        back(res, 'Die Anmeldung hat nicht geklappt. Bitte versuche es erneut.');
      }
    });
  }
}
