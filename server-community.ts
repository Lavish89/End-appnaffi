// Community-Chat, Jobboerse, Feedback, Benachrichtigungen, Ankuendigungen und Gluecksrad.
// Ohne Node-Abhaengigkeiten: Der Speicher wird uebergeben (Server: JSON-Dateien, Testversion: localStorage).
import {
  CHANNELS, ChatMessage, Job, JobApplication, Feedback, Notification, Announcement, Rewards, WHEEL, WHEEL_TIPS,
  JOB_TYPES, JOB_PLATFORMS, FEEDBACK_TYPES, ApplicationStatus, FeedbackStatus,
} from './src/community/shared';

export interface KV {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
}
export interface CommunityDeps {
  store: KV;
  grantProDays: (userId: string, days: number) => void;
}

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const clean = (s: unknown, max: number) => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
const day = (d = new Date()) => d.toISOString().slice(0, 10);
const AUTO_HIDE_REPORTS = 3;

/** Gewichtete Zufallsauswahl eines Gluecksrad-Feldes (kryptografischer Zufall). */
export function pickSegment(rand = () => { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0]; }) {
  const total = WHEEL.reduce((s, x) => s + x.weight, 0);
  let pick = rand() % total;
  for (const s of WHEEL) { if (pick < s.weight) return s; pick -= s.weight; }
  return WHEEL[0];
}

export function installCommunity(app: any, deps: CommunityDeps) {
  const { store } = deps;
  const me = (req: any) => req.user as { id: string; name: string; email: string; role: 'owner' | 'member' };
  const isAdmin = (req: any) => me(req)?.role === 'owner';
  const bad = (res: any, msg: string, code = 400) => res.status(code).json({ success: false, error: msg });

  // ---------- Rate-Limits pro Nutzer ----------
  const hits = new Map<string, number[]>();
  const limited = (key: string, max: number, windowMs: number) => {
    const t = Date.now();
    const list = (hits.get(key) || []).filter(x => t - x < windowMs);
    if (list.length >= max) return true;
    list.push(t);
    hits.set(key, list);
    return false;
  };

  // ---------- Benachrichtigungen ----------
  const notify = (userId: string, n: Omit<Notification, 'id' | 'at'>) => {
    const list = store.get<Notification[]>(`notifications-${userId}`, []);
    store.set(`notifications-${userId}`, [{ id: uid(), at: now(), ...n }, ...list].slice(0, 100));
  };
  const giveBadge = (userId: string, badge: string) => {
    const r = store.get<Rewards>(`rewards-${userId}`, { points: 0, badges: [], history: [] });
    if (r.badges.includes(badge)) return;
    r.badges.push(badge);
    store.set(`rewards-${userId}`, r);
    notify(userId, { type: 'reward', text: `Neues Abzeichen: ${badge}`, tab: 'home' });
  };

  app.get('/api/me/notifications', (req: any, res: any) => {
    const list = store.get<Notification[]>(`notifications-${me(req).id}`, []);
    const seen = store.get<string[]>(`announce-seen-${me(req).id}`, []);
    const ann = store.get<Announcement[]>('announcements', []).filter(a => !seen.includes(a.id)).map(a => ({ id: a.id, at: a.at, type: 'announcement', text: a.text, tab: 'home', read: false }));
    res.json({ success: true, notifications: [...ann, ...list].sort((a, b) => b.at.localeCompare(a.at)), unread: ann.length + list.filter(n => !n.read).length });
  });
  app.post('/api/me/notifications/read', (req: any, res: any) => {
    const id = me(req).id;
    store.set(`notifications-${id}`, store.get<Notification[]>(`notifications-${id}`, []).map(n => ({ ...n, read: true })));
    store.set(`announce-seen-${id}`, store.get<Announcement[]>('announcements', []).map(a => a.id).slice(0, 200));
    res.json({ success: true });
  });

  // ---------- Gluecksrad ----------
  app.get('/api/me/rewards', (req: any, res: any) => {
    const r = store.get<Rewards>(`rewards-${me(req).id}`, { points: 0, badges: [], history: [] });
    res.json({ success: true, rewards: r, canSpin: r.lastSpin !== day(), segments: WHEEL.map(({ weight: _w, ...s }) => s) });
  });
  app.post('/api/me/wheel/spin', (req: any, res: any) => {
    const u = me(req);
    const r = store.get<Rewards>(`rewards-${u.id}`, { points: 0, badges: [], history: [] });
    if (r.lastSpin === day()) return bad(res, 'Du hast heute schon gedreht. Morgen wieder!', 429);
    // Ergebnis entscheidet der Server (kryptografischer Zufall, gewichtet)
    const seg = pickSegment();
    const yesterday = day(new Date(Date.now() - 864e5));
    r.streak = r.lastSpin === yesterday ? (r.streak || 0) + 1 : 1;
    r.lastSpin = day();
    let detail = seg.label;
    if (seg.type === 'points') r.points += Number(seg.value);
    if (seg.type === 'badge') {
      if (r.badges.includes(String(seg.value))) { r.points += 25; detail = 'Abzeichen schon vorhanden – 25 Punkte'; }
      else r.badges.push(String(seg.value));
    }
    if (seg.type === 'pro_days') deps.grantProDays(u.id, Number(seg.value));
    let tip: string | undefined;
    if (seg.type === 'tip') { const b2 = new Uint32Array(1); crypto.getRandomValues(b2); tip = WHEEL_TIPS[b2[0] % WHEEL_TIPS.length]; r.points += 5; detail = 'Profi-Tipp + 5 Punkte'; }
    if (r.streak >= 7 && !r.badges.includes('Treue Woche')) r.badges.push('Treue Woche');
    r.history = [{ at: now(), label: detail }, ...r.history].slice(0, 30);
    store.set(`rewards-${u.id}`, r);
    res.json({ success: true, segment: { id: seg.id, label: seg.label, type: seg.type, value: seg.value }, index: WHEEL.indexOf(seg), tip, rewards: r });
  });

  // ---------- Community-Chat ----------
  const visible = (m: ChatMessage, req: any) => !m.deleted && (!m.hidden || isAdmin(req) || m.userId === me(req).id);
  app.get('/api/community/messages', (req: any, res: any) => {
    const channel = String(req.query?.channel || 'allgemein');
    const after = String(req.query?.after || '');
    const all = store.get<ChatMessage[]>('chat', []);
    const list = all.filter(m => m.channel === channel && visible(m, req) && (!after || m.at > after)).slice(-150);
    const counts = Object.fromEntries(CHANNELS.map(c => [c.id, all.filter(m => m.channel === c.id && !m.deleted).length]));
    const latest = all.filter(m => !m.deleted && !m.hidden).slice(-1)[0]?.at || '';
    res.json({ success: true, messages: list.map(m => ({ ...m, reports: undefined, reported: m.reports.includes(me(req).id), reportCount: isAdmin(req) ? m.reports.length : undefined })), counts, latest });
  });
  app.post('/api/community/messages', (req: any, res: any) => {
    const u = me(req);
    const channel = String(req.body?.channel || '');
    if (!CHANNELS.some(c => c.id === channel)) return bad(res, 'Unbekannter Kanal.');
    const text = clean(req.body?.text, 1000);
    if (text.length < 2) return bad(res, 'Bitte schreib eine Nachricht.');
    if ((text.match(/https?:\/\//g) || []).length > 2) return bad(res, 'Bitte höchstens zwei Links pro Nachricht.');
    if (limited(`chat-fast-${u.id}`, 1, 2000) || limited(`chat-${u.id}`, 30, 10 * 60_000)) return bad(res, 'Du schreibst sehr schnell. Warte kurz und versuch es dann noch einmal.', 429);
    const msg: ChatMessage = { id: uid(), channel, userId: u.id, name: u.name, role: u.role, text, at: now(), reports: [] };
    const all = store.get<ChatMessage[]>('chat', []);
    if (!all.some(m => m.userId === u.id)) giveBadge(u.id, 'Erster Beitrag');
    store.set('chat', [...all, msg].slice(-3000));
    // Erwaehnungen @Name benachrichtigen (nur Nutzer, die im Chat aktiv sind)
    const mentioned = new Set((text.match(/@([\p{L}][\p{L}\p{N}_.-]{1,30})/gu) || []).map(x => x.slice(1).toLowerCase()));
    if (mentioned.size) {
      const people = new Map(all.map(m => [m.name.split(' ')[0].toLowerCase(), m.userId]));
      for (const n of mentioned) { const id = people.get(n); if (id && id !== u.id) notify(id, { type: 'community', text: `${u.name} hat dich im Kanal #${channel} erwähnt.`, tab: 'community' }); }
    }
    res.json({ success: true, message: { ...msg, reports: undefined } });
  });
  app.post('/api/community/messages/delete', (req: any, res: any) => {
    const all = store.get<ChatMessage[]>('chat', []);
    const m = all.find(x => x.id === req.body?.id);
    if (!m) return bad(res, 'Nachricht nicht gefunden.', 404);
    if (m.userId !== me(req).id && !isAdmin(req)) return bad(res, 'Du kannst nur eigene Nachrichten löschen.', 403);
    m.deleted = true;
    store.set('chat', all);
    res.json({ success: true });
  });
  app.post('/api/community/messages/report', (req: any, res: any) => {
    const all = store.get<ChatMessage[]>('chat', []);
    const m = all.find(x => x.id === req.body?.id);
    if (!m) return bad(res, 'Nachricht nicht gefunden.', 404);
    if (m.userId === me(req).id) return bad(res, 'Eigene Nachrichten kannst du löschen statt melden.');
    if (!m.reports.includes(me(req).id)) m.reports.push(me(req).id);
    if (m.reports.length >= AUTO_HIDE_REPORTS) m.hidden = true;
    store.set('chat', all);
    res.json({ success: true });
  });

  // ---------- Jobboerse ----------
  app.get('/api/jobs', (req: any, res: any) => {
    const u = me(req);
    const apps = store.get<JobApplication[]>('job-applications', []);
    const jobs = store.get<Job[]>('jobs', [])
      .filter(j => (j.status === 'open' && !j.hidden) || j.ownerId === u.id || isAdmin(req))
      .map(j => ({ ...j, reports: undefined, reported: j.reports.includes(u.id), reportCount: isAdmin(req) ? j.reports.length : undefined, applications: j.ownerId === u.id || isAdmin(req) ? apps.filter(a => a.jobId === j.id).length : undefined, applied: apps.some(a => a.jobId === j.id && a.userId === u.id) }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ success: true, jobs, types: JOB_TYPES, platforms: JOB_PLATFORMS });
  });
  app.post('/api/jobs', (req: any, res: any) => {
    const u = me(req);
    const b = req.body || {};
    const title = clean(b.title, 100), description = clean(b.description, 3000), company = clean(b.company, 80);
    if (title.length < 5) return bad(res, 'Bitte gib einen aussagekräftigen Titel ein (mind. 5 Zeichen).');
    if (description.length < 30) return bad(res, 'Bitte beschreibe den Job genauer (mind. 30 Zeichen).');
    if (!JOB_TYPES.includes(b.type)) return bad(res, 'Bitte wähle eine Art aus.');
    if (limited(`job-${u.id}`, 5, 24 * 3600_000)) return bad(res, 'Du kannst höchstens 5 Jobs pro Tag einstellen.', 429);
    const platforms = (Array.isArray(b.platforms) ? b.platforms : []).filter((p: string) => JOB_PLATFORMS.includes(p)).slice(0, 8);
    const job: Job = {
      id: uid(), ownerId: u.id, ownerName: u.name, title, company: company || u.name, type: b.type, platforms, niche: clean(b.niche, 60),
      budget: clean(b.budget, 60), minFollowers: Math.max(0, Math.min(100_000_000, Math.round(Number(b.minFollowers) || 0))), location: clean(b.location, 60) || 'Remote',
      description, deadline: /^\d{4}-\d{2}-\d{2}$/.test(String(b.deadline || '')) ? b.deadline : undefined, createdAt: now(), status: 'open', reports: [],
    };
    store.set('jobs', [job, ...store.get<Job[]>('jobs', [])].slice(0, 2000));
    giveBadge(u.id, 'Job-Anbieter');
    res.json({ success: true, job });
  });
  const ownJob = (req: any, res: any): Job[] | null => {
    const jobs = store.get<Job[]>('jobs', []);
    const j = jobs.find(x => x.id === req.body?.id);
    if (!j) { bad(res, 'Job nicht gefunden.', 404); return null; }
    if (j.ownerId !== me(req).id && !isAdmin(req)) { bad(res, 'Das ist nicht dein Job.', 403); return null; }
    return jobs;
  };
  app.post('/api/jobs/close', (req: any, res: any) => {
    const jobs = ownJob(req, res); if (!jobs) return;
    const j = jobs.find(x => x.id === req.body.id)!;
    j.status = j.status === 'open' ? 'closed' : 'open';
    store.set('jobs', jobs);
    res.json({ success: true, status: j.status });
  });
  app.post('/api/jobs/delete', (req: any, res: any) => {
    const jobs = ownJob(req, res); if (!jobs) return;
    store.set('jobs', jobs.filter(x => x.id !== req.body.id));
    store.set('job-applications', store.get<JobApplication[]>('job-applications', []).filter(a => a.jobId !== req.body.id));
    res.json({ success: true });
  });
  app.post('/api/jobs/report', (req: any, res: any) => {
    const jobs = store.get<Job[]>('jobs', []);
    const j = jobs.find(x => x.id === req.body?.id);
    if (!j) return bad(res, 'Job nicht gefunden.', 404);
    if (!j.reports.includes(me(req).id)) j.reports.push(me(req).id);
    if (j.reports.length >= AUTO_HIDE_REPORTS) j.hidden = true;
    store.set('jobs', jobs);
    res.json({ success: true });
  });
  app.post('/api/jobs/apply', (req: any, res: any) => {
    const u = me(req);
    const j = store.get<Job[]>('jobs', []).find(x => x.id === req.body?.jobId);
    if (!j || j.status !== 'open') return bad(res, 'Dieser Job ist nicht mehr offen.');
    if (j.ownerId === u.id) return bad(res, 'Auf eigene Jobs kannst du dich nicht bewerben.');
    const apps = store.get<JobApplication[]>('job-applications', []);
    if (apps.some(a => a.jobId === j.id && a.userId === u.id)) return bad(res, 'Du hast dich schon beworben.');
    const message = clean(req.body?.message, 2000);
    if (message.length < 20) return bad(res, 'Schreib bitte ein paar Sätze zu dir (mind. 20 Zeichen).');
    if (req.body?.shareEmail !== true) return bad(res, 'Bitte stimme zu, dass der Anbieter deine E-Mail-Adresse sieht.');
    if (limited(`apply-${u.id}`, 20, 24 * 3600_000)) return bad(res, 'Du hast heute schon viele Bewerbungen geschickt. Morgen wieder!', 429);
    const a: JobApplication = { id: uid(), jobId: j.id, jobTitle: j.title, ownerId: j.ownerId, userId: u.id, name: u.name, email: u.email, message, links: clean(req.body?.links, 300), followers: Math.max(0, Math.round(Number(req.body?.followers) || 0)) || undefined, at: now(), status: 'neu' };
    store.set('job-applications', [a, ...apps].slice(0, 10000));
    notify(j.ownerId, { type: 'application', text: `Neue Bewerbung von ${u.name} auf „${j.title}“.`, tab: 'jobs' });
    res.json({ success: true });
  });
  app.get('/api/jobs/applications', (req: any, res: any) => {
    const u = me(req);
    const apps = store.get<JobApplication[]>('job-applications', []);
    res.json({ success: true, received: apps.filter(a => a.ownerId === u.id), sent: apps.filter(a => a.userId === u.id).map(({ email: _e, ...a }) => a) });
  });
  app.post('/api/jobs/applications/status', (req: any, res: any) => {
    const apps = store.get<JobApplication[]>('job-applications', []);
    const a = apps.find(x => x.id === req.body?.id);
    if (!a || a.ownerId !== me(req).id) return bad(res, 'Bewerbung nicht gefunden.', 404);
    const status = req.body?.status as ApplicationStatus;
    if (!['gesehen', 'angenommen', 'abgelehnt'].includes(status)) return bad(res, 'Ungültiger Status.');
    a.status = status;
    store.set('job-applications', apps);
    if (status !== 'gesehen') notify(a.userId, { type: 'job', text: status === 'angenommen' ? `Gute Nachricht: Deine Bewerbung auf „${a.jobTitle}“ wurde angenommen. Der Anbieter meldet sich per E-Mail.` : `Deine Bewerbung auf „${a.jobTitle}“ wurde leider abgelehnt.`, tab: 'jobs' });
    res.json({ success: true });
  });

  // ---------- Feedback ----------
  app.post('/api/feedback', (req: any, res: any) => {
    const u = me(req);
    const text = clean(req.body?.text, 3000);
    if (text.length < 5) return bad(res, 'Bitte beschreibe dein Feedback kurz.');
    if (!(FEEDBACK_TYPES as readonly string[]).includes(req.body?.type)) return bad(res, 'Bitte wähle eine Art aus.');
    if (limited(`fb-${u.id}`, 10, 24 * 3600_000)) return bad(res, 'Danke für so viel Feedback! Morgen kannst du wieder schreiben.', 429);
    const rating = Number(req.body?.rating);
    const f: Feedback = { id: uid(), userId: u.id, name: u.name, email: u.email, type: req.body.type, rating: rating >= 1 && rating <= 5 ? Math.round(rating) : undefined, text, page: clean(req.body?.page, 40), at: now(), status: 'neu' };
    const all = store.get<Feedback[]>('feedback', []);
    store.set('feedback', [f, ...all].slice(0, 5000));
    if (all.filter(x => x.userId === u.id).length + 1 >= 3) giveBadge(u.id, 'Feedback-Held');
    res.json({ success: true });
  });
  app.get('/api/feedback/mine', (req: any, res: any) => {
    res.json({ success: true, feedback: store.get<Feedback[]>('feedback', []).filter(f => f.userId === me(req).id) });
  });

  // ---------- Admin: Feedback, Moderation, Ankuendigungen ----------
  app.get('/api/admin/feedback', (_req: any, res: any) => {
    const all = store.get<Feedback[]>('feedback', []);
    const rated = all.filter(f => f.rating);
    res.json({ success: true, feedback: all, summary: { total: all.length, open: all.filter(f => f.status === 'neu').length, avgRating: rated.length ? rated.reduce((s, f) => s + (f.rating || 0), 0) / rated.length : null } });
  });
  app.post('/api/admin/feedback/reply', (req: any, res: any) => {
    const all = store.get<Feedback[]>('feedback', []);
    const f = all.find(x => x.id === req.body?.id);
    if (!f) return bad(res, 'Feedback nicht gefunden.', 404);
    const status = req.body?.status as FeedbackStatus;
    if (status && ['neu', 'geplant', 'erledigt', 'abgelehnt'].includes(status)) f.status = status;
    const reply = clean(req.body?.reply, 2000);
    if (reply) { f.reply = reply; f.replyAt = now(); notify(f.userId, { type: 'feedback', text: `Antwort auf dein Feedback: „${reply.slice(0, 80)}${reply.length > 80 ? '…' : ''}“`, tab: 'home' }); }
    store.set('feedback', all);
    res.json({ success: true });
  });
  app.get('/api/admin/moderation', (_req: any, res: any) => {
    res.json({
      success: true,
      messages: store.get<ChatMessage[]>('chat', []).filter(m => !m.deleted && m.reports.length > 0).map(m => ({ ...m, reportCount: m.reports.length })),
      jobs: store.get<Job[]>('jobs', []).filter(j => j.reports.length > 0).map(j => ({ ...j, reportCount: j.reports.length })),
      stats: { messages: store.get<ChatMessage[]>('chat', []).filter(m => !m.deleted).length, jobs: store.get<Job[]>('jobs', []).length, openJobs: store.get<Job[]>('jobs', []).filter(j => j.status === 'open').length },
      announcements: store.get<Announcement[]>('announcements', []),
    });
  });
  app.post('/api/admin/moderation/resolve', (req: any, res: any) => {
    const { kind, id, action } = req.body || {};
    if (kind === 'message') {
      const all = store.get<ChatMessage[]>('chat', []); const m = all.find(x => x.id === id);
      if (!m) return bad(res, 'Nicht gefunden.', 404);
      if (action === 'delete') m.deleted = true; else { m.reports = []; m.hidden = false; }
      store.set('chat', all);
    } else if (kind === 'job') {
      const all = store.get<Job[]>('jobs', []); const j = all.find(x => x.id === id);
      if (!j) return bad(res, 'Nicht gefunden.', 404);
      if (action === 'delete') store.set('jobs', all.filter(x => x.id !== id)); else { j.reports = []; j.hidden = false; store.set('jobs', all); }
    } else return bad(res, 'Unbekannte Art.');
    res.json({ success: true });
  });
  app.post('/api/admin/announce', (req: any, res: any) => {
    const text = clean(req.body?.text, 500);
    if (text.length < 5) return bad(res, 'Bitte schreib eine Ankündigung.');
    store.set('announcements', [{ id: uid(), at: now(), text }, ...store.get<Announcement[]>('announcements', [])].slice(0, 50));
    res.json({ success: true });
  });
  app.post('/api/admin/announce/delete', (req: any, res: any) => {
    store.set('announcements', store.get<Announcement[]>('announcements', []).filter(a => a.id !== req.body?.id));
    res.json({ success: true });
  });
}
