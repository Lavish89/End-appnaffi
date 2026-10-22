// Affiliate-Hub auf dem Server: Daten pro Nutzer, Kurzlinks mit Klickzaehlung und Link-Pruefung.
import fs from 'fs';
import path from 'path';
import type { Express, Request } from 'express';
import type { PublicUser } from './server-auth';
import { FREE_LINK_LIMIT } from './src/billing/plans';

const MAX_BYTES = 1_000_000;
const BOT_RE = /bot|crawler|spider|preview|facebookexternalhit|slackbot|whatsapp|telegram|discord/i;

export const userKey = (id: string) => id.replace(/-/g, '').slice(0, 8);

interface ClickStats { [slug: string]: { count: number; last: string } }

export function installWorkspace(app: Express, opts: { dataDir: string; currentUser: (req: Request) => PublicUser | undefined }) {
  const wsDir = path.join(opts.dataDir, 'workspaces');
  const clickDir = path.join(opts.dataDir, 'clicks');
  fs.mkdirSync(wsDir, { recursive: true });
  fs.mkdirSync(clickDir, { recursive: true });

  const wsFile = (id: string) => path.join(wsDir, `${id.replace(/[^a-z0-9-]/gi, '')}.json`);
  const clickFile = (id: string) => path.join(clickDir, `${id.replace(/[^a-z0-9-]/gi, '')}.json`);
  const readJson = <T,>(f: string, fallback: T): T => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; } };

  // Index: userKey/slug -> Ziel-URL (nur aktive Links mit http/https)
  const index = new Map<string, { userId: string; url: string }>();
  const indexUser = (userId: string, ws: any) => {
    const key = userKey(userId);
    for (const k of [...index.keys()]) if (k.startsWith(key + '/')) index.delete(k);
    for (const l of Array.isArray(ws?.links) ? ws.links : []) {
      if (!l?.active || typeof l.slug !== 'string' || typeof l.targetUrl !== 'string') continue;
      try {
        const u = new URL(l.targetUrl);
        if (u.protocol === 'https:' || u.protocol === 'http:') index.set(`${key}/${l.slug}`, { userId, url: u.toString() });
      } catch { /* ungueltige URL ignorieren */ }
    }
  };
  for (const f of fs.readdirSync(wsDir)) if (f.endsWith('.json')) indexUser(f.slice(0, -5), readJson(path.join(wsDir, f), {}));

  const me = (req: Request) => (req as any).user as PublicUser || opts.currentUser(req);

  app.get('/api/me/workspace', (req, res) => {
    const u = me(req);
    if (!u) return res.status(401).json({ success: false, error: 'Bitte melde dich an.' });
    res.json({ success: true, workspace: readJson(wsFile(u.id), null), clicks: readJson<ClickStats>(clickFile(u.id), {}), userKey: userKey(u.id) });
  });

  app.post('/api/me/workspace', (req, res) => {
    const u = me(req);
    if (!u) return res.status(401).json({ success: false, error: 'Bitte melde dich an.' });
    const ws = req.body?.workspace;
    if (!ws || typeof ws !== 'object' || ws.version !== 1) return res.status(400).json({ success: false, error: 'Ungültige Daten.' });
    const isPro = u.role === 'owner' || u.effectivePlan === 'pro';
    if (!isPro && Array.isArray(ws.links) && ws.links.length > FREE_LINK_LIMIT) {
      return res.status(402).json({ success: false, error: `Mit Free kannst du bis zu ${FREE_LINK_LIMIT} Links speichern. Mit Pro sind es unbegrenzt viele.` });
    }
    const json = JSON.stringify(ws);
    if (json.length > MAX_BYTES) return res.status(413).json({ success: false, error: 'Zu viele Daten. Bitte alte Entwürfe oder Protokolle löschen.' });
    fs.writeFileSync(wsFile(u.id), json, { mode: 0o600 });
    indexUser(u.id, ws);
    res.json({ success: true, savedAt: new Date().toISOString() });
  });

  // Erreichbarkeit eines Ziel-Links pruefen (nur oeffentliche Adressen)
  app.post('/api/me/check-link', async (req, res) => {
    const me0 = me(req);
    if (me0 && me0.role !== 'owner' && me0.effectivePlan !== 'pro') return res.status(402).json({ success: false, error: 'Die Link-Prüfung ist in Pro enthalten.' });
    let u: URL;
    try { u = new URL(String(req.body?.url || '')); } catch { return res.status(400).json({ success: false, error: 'Ungültige Adresse.' }); }
    const host = u.hostname.toLowerCase();
    if (!/^https?:$/.test(u.protocol) || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|\[?::1\]?$)/.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) || host.endsWith('.internal') || host.endsWith('.local')) {
      return res.status(400).json({ success: false, error: 'Nur öffentliche http(s)-Adressen können geprüft werden.' });
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const r = await fetch(u, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (Goalsforce Link-Check)' } });
      res.json({ success: true, ok: r.status < 400, status: r.status, finalUrl: r.url });
    } catch (e: any) {
      res.json({ success: true, ok: false, status: 0, error: e?.name === 'AbortError' ? 'Zeitüberschreitung' : 'Nicht erreichbar' });
    } finally {
      clearTimeout(timer);
    }
  });

  // Oeffentliche Kurzlinks: /go/<nutzer>/<slug> -> Ziel, Klick wird gezaehlt
  app.get('/go/:key/:slug', (req, res) => {
    const hit = index.get(`${req.params.key}/${req.params.slug}`);
    if (!hit) return res.status(404).send('Link nicht gefunden oder pausiert.');
    if (!BOT_RE.test(String(req.headers['user-agent'] || ''))) {
      const stats = readJson<ClickStats>(clickFile(hit.userId), {});
      const s = stats[req.params.slug] || { count: 0, last: '' };
      stats[req.params.slug] = { count: s.count + 1, last: new Date().toISOString() };
      fs.writeFileSync(clickFile(hit.userId), JSON.stringify(stats), { mode: 0o600 });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.redirect(302, hit.url);
  });
}
