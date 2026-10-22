// Nutzerverwaltung fuer den Inhaber (Admin). Ohne Node-Abhaengigkeiten, damit Server und
// Browser-Testversion dieselben Regeln nutzen. Nur nach der Anmelde-Pruefung einhaengen –
// /api/admin/* ist fuer Mitglieder bereits durch die Rollen-Pruefung gesperrt.

import { isOwner } from './server-auth-rules';

export type Role = 'owner' | 'member';
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  lastLoginAt?: string;
  disabled?: boolean;
  plan?: 'free' | 'pro';
  planStatus?: 'active' | 'canceling' | 'past_due' | 'canceled';
  planInterval?: 'month' | 'year';
  planRenewsAt?: string;
  effectivePlan?: 'free' | 'pro';
  profile?: any;
  providers?: string[];
}
export interface AdminStore {
  ownerEmail: string;
  list(): AdminUser[];
  update(id: string, patch: Partial<Pick<AdminUser, 'role' | 'disabled' | 'name' | 'plan' | 'planStatus' | 'planInterval' | 'planRenewsAt'>>): void;
  remove(id: string): void;
  setPassword(id: string, password: string): void | Promise<void>;
  dropSessions(id: string): void;
  getRegistrationOpen(): boolean;
  setRegistrationOpen(v: boolean): void;
  workspaceStats(id: string): { links: number; clicks: number; earnings: number } | null;
  mailLog(): { at: string; to: string; kind: string; subject: string; status: string; error?: string; html: string }[];
}

export function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const buf = new Uint32Array(12);
  crypto.getRandomValues(buf);
  const pw = Array.from(buf, x => chars[x % chars.length]).join('');
  return /\d/.test(pw) ? pw : pw.slice(0, 11) + '7';
}

export function installAdmin(app: any, store: AdminStore) {
  const isProtected = (u: AdminUser) => isOwner(u.email, store.ownerEmail);
  const find = (id: unknown) => store.list().find(u => u.id === id);
  const deny = (res: any, msg: string) => res.status(400).json({ success: false, error: msg });

  app.get('/api/admin/users', (_req: any, res: any) => {
    const users = store.list().map(u => ({ ...u, isMainAdmin: isProtected(u), stats: store.workspaceStats(u.id) }));
    const weekAgo = Date.now() - 7 * 86400000;
    res.json({
      success: true,
      users,
      summary: {
        total: users.length,
        owners: users.filter(u => u.role === 'owner').length,
        members: users.filter(u => u.role === 'member').length,
        newThisWeek: users.filter(u => new Date(u.createdAt).getTime() > weekAgo).length,
        disabled: users.filter(u => u.disabled).length,
        pro: users.filter(u => u.effectivePlan === 'pro' && u.role !== 'owner').length,
        monthly: users.filter(u => u.plan === 'pro' && u.planInterval === 'month' && u.planStatus !== 'canceled').length,
        yearly: users.filter(u => u.plan === 'pro' && u.planInterval === 'year' && u.planStatus !== 'canceled').length,
      },
      registrationOpen: store.getRegistrationOpen(),
      ownerEmail: store.ownerEmail,
    });
  });

  app.post('/api/admin/users/role', (req: any, res: any) => {
    const u = find(req.body?.id);
    const role = req.body?.role;
    if (!u) return deny(res, 'Nutzer nicht gefunden.');
    if (role !== 'owner' && role !== 'member') return deny(res, 'Ungültige Rolle.');
    if (isProtected(u)) return deny(res, 'Das Haupt-Admin-Konto behält immer volle Rechte.');
    store.update(u.id, { role });
    store.dropSessions(u.id); // neue Rechte gelten ab der naechsten Anmeldung
    res.json({ success: true });
  });

  app.post('/api/admin/users/disable', (req: any, res: any) => {
    const u = find(req.body?.id);
    if (!u) return deny(res, 'Nutzer nicht gefunden.');
    if (isProtected(u)) return deny(res, 'Das Haupt-Admin-Konto kann nicht gesperrt werden.');
    const disabled = Boolean(req.body?.disabled);
    store.update(u.id, { disabled });
    if (disabled) store.dropSessions(u.id);
    res.json({ success: true });
  });

  app.post('/api/admin/users/reset-password', async (req: any, res: any) => {
    const u = find(req.body?.id);
    if (!u) return deny(res, 'Nutzer nicht gefunden.');
    const password = randomPassword();
    await store.setPassword(u.id, password);
    store.dropSessions(u.id);
    res.json({ success: true, password });
  });

  app.post('/api/admin/users/delete', (req: any, res: any) => {
    const u = find(req.body?.id);
    if (!u) return deny(res, 'Nutzer nicht gefunden.');
    if (isProtected(u)) return deny(res, 'Das Haupt-Admin-Konto kann nicht gelöscht werden.');
    if (req.body?.confirmEmail !== u.email) return deny(res, 'Zum Löschen bitte die E-Mail-Adresse des Kontos bestätigen.');
    store.dropSessions(u.id);
    store.remove(u.id);
    res.json({ success: true });
  });

  // Pro kostenlos vergeben oder entziehen (z. B. fuer Partner, Tester)
  app.post('/api/admin/users/plan', (req: any, res: any) => {
    const u = find(req.body?.id);
    if (!u) return deny(res, 'Nutzer nicht gefunden.');
    const plan = req.body?.plan === 'pro' ? 'pro' : 'free';
    store.update(u.id, plan === 'pro' ? { plan, planStatus: 'active', planInterval: undefined, planRenewsAt: undefined } : { plan, planStatus: undefined, planInterval: undefined, planRenewsAt: undefined });
    res.json({ success: true });
  });

  app.get('/api/admin/mail-log', (_req: any, res: any) => {
    res.json({ success: true, mails: store.mailLog().slice(0, 100) });
  });

  app.post('/api/admin/registration', (req: any, res: any) => {
    store.setRegistrationOpen(Boolean(req.body?.open));
    res.json({ success: true, registrationOpen: store.getRegistrationOpen() });
  });
}
