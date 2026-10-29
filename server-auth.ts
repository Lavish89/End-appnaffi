// Konten, Anmeldung und Sitzungen fuer den Goalsforce-Server.
// - Passwoerter werden mit scrypt + zufaelligem Salt gehasht (nie im Klartext gespeichert).
// - Sitzung als HttpOnly-Cookie, damit Skripte im Browser das Token nicht auslesen koennen.
// - Konten liegen in data/users.json (bei Cloud Run fluechtig – fuer Dauerbetrieb eine Datenbank anbinden).
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { Express, Request, Response, NextFunction } from 'express';
import { validateRegistration, roleFor, DEFAULT_OWNER_EMAIL, isOwner, cleanProfile, passwordProblem, Profile } from './server-auth-rules';
import { installAdmin } from './server-admin';
import { effectivePlan, PlanId, PlanStatus, Interval } from './src/billing/plans';
import type { Mailer } from './server-mail';
import type { KV } from './server-community';

export { validateRegistration };

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  createdAt: string;
  lastLoginAt?: string;
  disabled?: boolean;
  profile?: Profile;
  plan?: PlanId;
  planStatus?: PlanStatus;
  planInterval?: Interval;
  planRenewsAt?: string;
  bonusProUntil?: string;
  effectivePlan?: PlanId;
  hasPassword?: boolean;
  providers?: string[];
}
export interface StoredUser extends Omit<PublicUser, 'effectivePlan' | 'providers'> {
  salt: string;
  hash: string;
  oauth?: { google?: string; facebook?: string };
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

const COOKIE = 'gf_session';
// API-Bereiche, die jedes angemeldete Konto nutzen darf
export const MEMBER_PATHS = ['/me', '/gemini/generate-marketing', '/billing', '/community', '/jobs', '/feedback'];
// Oeffentliche API-Bereiche (ohne Anmeldung)
const PUBLIC_PATHS = ['/auth/', '/health', '/billing/plans', '/billing/webhook'];
const SESSION_DAYS = 7;

export const toPublic = ({ salt: _s, hash: _h, oauth, stripeCustomerId: _c, stripeSubscriptionId: _sub, ...u }: StoredUser): PublicUser => ({
  ...u,
  effectivePlan: effectivePlan(u),
  hasPassword: u.hasPassword !== false,
  providers: oauth ? Object.keys(oauth).filter(k => (oauth as any)[k]) : [],
});

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}
function verifyPassword(password: string, user: StoredUser) {
  const { hash } = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.hash, 'hex'));
}

export function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

export interface AuthApi {
  currentUser: (req: Request) => PublicUser | undefined;
  getUser: (id: string) => StoredUser | undefined;
  findByEmail: (email: string) => StoredUser | undefined;
  findBy: (fn: (u: StoredUser) => boolean) => StoredUser | undefined;
  updateUser: (id: string, patch: Partial<StoredUser>) => StoredUser | undefined;
  createUser: (d: { name: string; email: string; profile?: Profile; oauth?: StoredUser['oauth'] }) => StoredUser;
  startSession: (res: Response, userId: string) => void;
  ownerEmail: string;
  isProd: boolean;
  // Konten/Einstellungen neu aus dem Speicher laden (z. B. nachdem der Postgres-Cache bereit ist).
  reload: () => void;
}

export function installAuth(app: Express, opts: { dataDir: string; isProd: boolean; mailer: Mailer; store?: KV }): AuthApi {
  const file = path.join(opts.dataDir, 'users.json');
  const settingsFile = path.join(opts.dataDir, 'settings.json');
  const store = opts.store;
  const ownerEmail = (process.env.OWNER_EMAIL ?? DEFAULT_OWNER_EMAIL).trim().toLowerCase();
  const appUrl = process.env.APP_URL || '';

  // Speicher: mit store (Postgres via DATABASE_URL) bleiben Konten erhalten; sonst Datei-Fallback
  // (auf Free-Hosting fluechtig). Die Schnittstelle (get/set) ist in beiden Faellen gleich.
  const defaultSettings = { registrationOpen: process.env.ALLOW_REGISTRATION !== 'false' };
  const loadSettings = (): { registrationOpen: boolean } => {
    if (store) return { ...defaultSettings, ...store.get<{ registrationOpen?: boolean }>('auth_settings', {}) };
    try { return { ...defaultSettings, ...JSON.parse(fs.readFileSync(settingsFile, 'utf8')) }; } catch { return { ...defaultSettings }; }
  };
  let settings = loadSettings();
  const saveSettings = () => {
    if (store) { store.set('auth_settings', settings); return; }
    fs.mkdirSync(opts.dataDir, { recursive: true });
    fs.writeFileSync(settingsFile, JSON.stringify(settings), { mode: 0o600 });
  };

  const loadUsers = (): StoredUser[] => {
    if (store) return store.get<StoredUser[]>('auth_users', []);
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
  };
  let users: StoredUser[] = loadUsers();
  const save = () => {
    if (store) { store.set('auth_users', users); return; }
    fs.mkdirSync(opts.dataDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(users, null, 2), { mode: 0o600 });
  };
  // Haupt-Admin hat immer volle Rechte, auch wenn sein Konto schon vorher existierte
  const ensureOwner = (u: StoredUser) => {
    if (isOwner(u.email, ownerEmail) && (u.role !== 'owner' || u.disabled)) {
      u.role = 'owner';
      u.disabled = false;
      return true;
    }
    return false;
  };
  // Nach dem Vorab-Laden des (Postgres-)Caches erneut einlesen und Owner-Rechte sicherstellen.
  const reload = () => {
    users = loadUsers();
    settings = loadSettings();
    if (users.map(ensureOwner).some(Boolean)) save();
  };
  if (users.map(ensureOwner).some(Boolean)) save();

  const sessions = new Map<string, { userId: string; expires: number }>();
  const startSession = (res: Response, userId: string) => {
    const token = crypto.randomBytes(32).toString('hex');
    const maxAge = SESSION_DAYS * 86400;
    sessions.set(token, { userId, expires: Date.now() + maxAge * 1000 });
    res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${opts.isProd ? '; Secure' : ''}`);
  };
  const dropSessions = (userId: string) => { for (const [t, s] of sessions) if (s.userId === userId) sessions.delete(t); };
  const currentUser = (req: Request): StoredUser | undefined => {
    const token = readCookie(req, COOKIE);
    const s = token ? sessions.get(token) : undefined;
    if (!s) return undefined;
    if (s.expires < Date.now()) {
      sessions.delete(token!);
      return undefined;
    }
    const u = users.find(x => x.id === s.userId);
    return u && !u.disabled ? u : undefined;
  };

  // Schutz vor Passwort-Raten: max. 10 Versuche pro 15 Minuten und IP
  const attempts = new Map<string, number[]>();
  const tooManyAttempts = (req: Request) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const list = (attempts.get(key) || []).filter(t => now - t < 15 * 60_000);
    list.push(now);
    attempts.set(key, list);
    return list.length > 10;
  };

  const createUser: AuthApi['createUser'] = d => {
    const now = new Date().toISOString();
    const user: StoredUser = {
      id: crypto.randomUUID(),
      name: d.name,
      email: d.email,
      role: roleFor(d.email, ownerEmail, users.length === 0),
      createdAt: now,
      lastLoginAt: now,
      profile: d.profile,
      plan: 'free',
      oauth: d.oauth,
      hasPassword: !d.oauth,
      ...hashPassword(crypto.randomBytes(24).toString('hex')),
    };
    users.push(user);
    save();
    opts.mailer.send(user.email, 'welcome', { name: user.profile?.firstName || user.name }).catch(() => {});
    return user;
  };

  app.get('/api/auth/me', (req, res) => {
    const u = currentUser(req);
    res.json({ success: true, user: u ? toPublic(u) : null, registrationOpen: settings.registrationOpen || users.length === 0 });
  });

  app.get('/api/auth/providers', (_req, res) => {
    res.json({
      success: true,
      google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      facebook: Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
      passwordReset: opts.mailer.configured,
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const wanted = String(req.body?.email ?? '').trim().toLowerCase();
    if (!settings.registrationOpen && users.length > 0 && !isOwner(wanted, ownerEmail)) {
      return res.status(403).json({ success: false, error: 'Die Registrierung ist geschlossen. Bitte wende dich an den Inhaber.' });
    }
    if (tooManyAttempts(req)) return res.status(429).json({ success: false, error: 'Zu viele Versuche. Bitte warte 15 Minuten.' });
    const v = validateRegistration(req.body);
    if (typeof v === 'string') return res.status(400).json({ success: false, error: v });
    if (users.some(u => u.email === v.email)) {
      return res.status(409).json({ success: false, error: 'Mit dieser E-Mail-Adresse gibt es schon ein Konto. Bitte melde dich an.' });
    }
    const user = createUser({ name: v.name, email: v.email, profile: cleanProfile(req.body?.profile) });
    Object.assign(user, hashPassword(v.password), { hasPassword: true });
    save();
    startSession(res, user.id);
    res.json({ success: true, user: toPublic(user) });
  });

  app.post('/api/auth/login', (req, res) => {
    if (tooManyAttempts(req)) return res.status(429).json({ success: false, error: 'Zu viele Versuche. Bitte warte 15 Minuten.' });
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const user = users.find(u => u.email === email);
    if (!user || !verifyPassword(password, user)) {
      const hint = user && user.hasPassword === false ? ' Du hast dich mit Google oder Facebook registriert – nutze diesen Button oder „Passwort vergessen“.' : '';
      return res.status(401).json({ success: false, error: 'E-Mail oder Passwort ist falsch.' + hint });
    }
    if (user.disabled && !isOwner(user.email, ownerEmail)) {
      return res.status(403).json({ success: false, error: 'Dieses Konto ist gesperrt. Bitte wende dich an den Inhaber.' });
    }
    attempts.delete(req.ip || 'unknown');
    ensureOwner(user);
    user.lastLoginAt = new Date().toISOString();
    save();
    startSession(res, user.id);
    res.json({ success: true, user: toPublic(user) });
  });

  app.post('/api/auth/logout', (req, res) => {
    const token = readCookie(req, COOKIE);
    if (token) sessions.delete(token);
    res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    res.json({ success: true });
  });

  // Passwort vergessen: Link per E-Mail (60 Minuten gueltig). Antwort verraet nicht, ob die E-Mail existiert.
  const resetTokens = new Map<string, { userId: string; expires: number }>();
  const tokenHash = (t: string) => crypto.createHash('sha256').update(t).digest('hex');
  app.post('/api/auth/forgot', async (req, res) => {
    if (tooManyAttempts(req)) return res.status(429).json({ success: false, error: 'Zu viele Versuche. Bitte warte 15 Minuten.' });
    if (!opts.mailer.configured) return res.status(503).json({ success: false, error: 'E-Mail-Versand ist noch nicht eingerichtet. Bitte wende dich an den Admin.' });
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const user = users.find(u => u.email === email && !u.disabled);
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      resetTokens.set(tokenHash(token), { userId: user.id, expires: Date.now() + 60 * 60_000 });
      const base = appUrl || `${req.protocol}://${req.get('host')}`;
      await opts.mailer.send(user.email, 'password_reset', { name: user.profile?.firstName || user.name, resetUrl: `${base}/?reset=${token}` });
    }
    res.json({ success: true, message: 'Wenn es ein Konto mit dieser E-Mail gibt, ist ein Link unterwegs.' });
  });
  app.post('/api/auth/reset', (req, res) => {
    const t = resetTokens.get(tokenHash(String(req.body?.token ?? '')));
    if (!t || t.expires < Date.now()) return res.status(400).json({ success: false, error: 'Der Link ist abgelaufen oder ungültig. Fordere bitte einen neuen an.' });
    const pw = String(req.body?.password ?? '');
    const problem = passwordProblem(pw);
    if (problem) return res.status(400).json({ success: false, error: problem });
    const u = users.find(x => x.id === t.userId);
    if (!u) return res.status(400).json({ success: false, error: 'Konto nicht gefunden.' });
    Object.assign(u, hashPassword(pw), { hasPassword: true });
    save();
    for (const [k, v] of resetTokens) if (v.userId === u.id) resetTokens.delete(k);
    dropSessions(u.id);
    startSession(res, u.id);
    res.json({ success: true, user: toPublic(u) });
  });

  app.post('/api/auth/change-password', (req, res) => {
    const u = currentUser(req);
    if (!u) return res.status(401).json({ success: false, error: 'Bitte melde dich an.' });
    if (u.hasPassword !== false && !verifyPassword(String(req.body?.currentPassword ?? ''), u)) {
      return res.status(400).json({ success: false, error: 'Das aktuelle Passwort ist falsch.' });
    }
    const problem = passwordProblem(String(req.body?.newPassword ?? ''));
    if (problem) return res.status(400).json({ success: false, error: problem });
    Object.assign(u, hashPassword(String(req.body.newPassword)), { hasPassword: true });
    save();
    res.json({ success: true });
  });

  // Alle uebrigen API-Routen nur fuer angemeldete Nutzer.
  // Mitglieder sehen nur ihren eigenen Hub, Toolkit und Mitgliedschaft; das Shop-Cockpit bleibt gesperrt.
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    if (PUBLIC_PATHS.some(p => req.path === p || req.path.startsWith(p))) return next();
    const u = currentUser(req);
    if (!u) return res.status(401).json({ success: false, error: 'Bitte melde dich an.' });
    (req as any).user = toPublic(u);
    if (u.role !== 'owner' && !MEMBER_PATHS.some(p => req.path === p || req.path.startsWith(p + '/'))) {
      return res.status(403).json({ success: false, error: 'Dieser Bereich ist nur für den Inhaber.' });
    }
    next();
  });

  // Profil bearbeiten
  app.post('/api/me/profile', (req, res) => {
    const u = currentUser(req)!;
    const name = String(req.body?.name ?? '').trim().slice(0, 80);
    if (name.length >= 2) u.name = name;
    u.profile = cleanProfile({ ...(u.profile || {}), ...(req.body?.profile || {}) });
    save();
    res.json({ success: true, user: toPublic(u) });
  });

  // Nutzerverwaltung (nur Inhaber – durch die Rollen-Pruefung oben geschuetzt)
  const readJson = (f: string) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
  installAdmin(app, {
    ownerEmail,
    list: () => users.map(toPublic),
    update: (id, patch) => { const u = users.find(x => x.id === id); if (u) { Object.assign(u, patch); save(); } },
    remove: id => {
      users = users.filter(x => x.id !== id);
      save();
      for (const dir of ['workspaces', 'clicks']) fs.rmSync(path.join(opts.dataDir, dir, `${id}.json`), { force: true });
    },
    setPassword: (id, pw) => { const u = users.find(x => x.id === id); if (u) { Object.assign(u, hashPassword(pw), { hasPassword: true }); save(); } },
    dropSessions,
    getRegistrationOpen: () => settings.registrationOpen,
    setRegistrationOpen: v => { settings.registrationOpen = v; saveSettings(); },
    workspaceStats: id => {
      const ws = readJson(path.join(opts.dataDir, 'workspaces', `${id}.json`));
      if (!ws) return null;
      const clicks = readJson(path.join(opts.dataDir, 'clicks', `${id}.json`)) || {};
      return {
        links: Array.isArray(ws.links) ? ws.links.length : 0,
        clicks: Object.values(clicks).reduce((s: number, c: any) => s + (c?.count || 0), 0) as number,
        earnings: Array.isArray(ws.earnings) ? ws.earnings.filter((e: any) => e.status !== 'storniert').reduce((s: number, e: any) => s + (Number(e.amount) || 0), 0) : 0,
      };
    },
    mailLog: () => opts.mailer.log(),
  });

  const updateUser: AuthApi['updateUser'] = (id, patch) => {
    const u = users.find(x => x.id === id);
    if (!u) return undefined;
    Object.assign(u, patch);
    save();
    return u;
  };

  return {
    currentUser: (req: Request) => { const u = currentUser(req); return u ? toPublic(u) : undefined; },
    getUser: id => users.find(u => u.id === id),
    findByEmail: email => users.find(u => u.email === email.trim().toLowerCase()),
    findBy: fn => users.find(fn),
    updateUser,
    createUser,
    startSession,
    ownerEmail,
    isProd: opts.isProd,
    reload,
  };
}
