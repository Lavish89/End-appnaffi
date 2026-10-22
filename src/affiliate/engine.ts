// Affiliate-Hub: Datenmodell und Automations-Engine.
// Alles sind reine Funktionen: (Workspace, Ereignis) -> neuer Workspace. Keine erfundenen Zahlen –
// Kennzahlen entstehen nur aus Klicks (Weiterleitung /go/...) und Einnahmen, die der Nutzer einträgt.

export type ProgramStatus = 'geplant' | 'beworben' | 'aktiv' | 'abgelehnt';
export interface Program {
  id: string;
  network: string;
  name: string;
  commission: string; // frei, z. B. "3 %" oder "15 € pro Lead"
  cookieDays?: number;
  status: ProgramStatus;
  url?: string;
  notes?: string;
}
export interface AffLink {
  id: string;
  slug: string;
  title: string;
  targetUrl: string;
  programId?: string;
  tags: string[];
  active: boolean;
  createdAt: string;
  clicks: number; // wird vom Server geliefert
}
export type EarningStatus = 'offen' | 'bestätigt' | 'ausgezahlt' | 'storniert';
export interface Earning {
  id: string;
  date: string; // JJJJ-MM-TT
  programId?: string;
  linkId?: string;
  amount: number;
  status: EarningStatus;
  note?: string;
}
export interface Draft {
  id: string;
  channel: string;
  text: string;
  linkId?: string;
  createdAt: string;
  source: string; // welche Regel oder manuell
}
export interface Task {
  id: string;
  text: string;
  done: boolean;
  due?: string;
  createdAt: string;
  source: string;
}
export type TriggerType = 'link_created' | 'earning_added' | 'weekly' | 'clicks_threshold' | 'link_inactive';
export type ActionType =
  | 'add_subid'
  | 'social_drafts'
  | 'create_task'
  | 'weekly_report'
  | 'add_tag'
  | 'pause_link'
  | 'follow_up_task';
export interface Action {
  type: ActionType;
  params?: Record<string, string>;
}
export interface Rule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: TriggerType;
  params?: { threshold?: number; days?: number };
  actions: Action[];
  runs: number;
  lastRun?: string;
}
export interface LogEntry {
  at: string;
  rule: string;
  text: string;
}
export interface Settings {
  disclosure: string; // Kennzeichnung, z. B. "Anzeige"
  amazonNotice: boolean;
  subIdParam: string; // z. B. "subid" oder "tag"
  displayName: string;
  niche: string;
  legal?: Record<string, boolean>;
  tourDone?: boolean;
  hideTips?: boolean;
  lessonsDone?: Record<string, boolean>;
}
export interface Workspace {
  version: 1;
  programs: Program[];
  links: AffLink[];
  earnings: Earning[];
  drafts: Draft[];
  tasks: Task[];
  rules: Rule[];
  log: LogEntry[];
  settings: Settings;
  lastWeekly?: string;
  firedThresholds: Record<string, number>; // linkId -> höchste bereits gemeldete Schwelle
}

export type HubEvent =
  | { type: 'link_created'; link: AffLink }
  | { type: 'earning_added'; earning: Earning }
  | { type: 'weekly' }
  | { type: 'clicks_updated' }
  | { type: 'daily_check' };

// ---------- Helfer ----------
export const uid = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
export const today = () => new Date().toISOString().slice(0, 10);
export const eur = (x: number) => x.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
export const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);

export const isValidUrl = (u: string) => {
  try {
    const x = new URL(u);
    return x.protocol === 'https:' || x.protocol === 'http:';
  } catch {
    return false;
  }
};

export const AMAZON_NOTICE = 'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.';

export const disclosureLine = (s: Settings, link?: AffLink) => {
  const parts = [`*${s.disclosure}: Affiliate-Link – ich erhalte bei einem Kauf eine Provision, für dich ändert sich der Preis nicht.`];
  if (s.amazonNotice && link && /amazon\.|amzn\./i.test(link.targetUrl)) parts.push(AMAZON_NOTICE);
  return parts.join(' ');
};

export function withSubId(url: string, param: string, value: string) {
  try {
    const u = new URL(url);
    if (!u.searchParams.has(param)) u.searchParams.set(param, value);
    return u.toString();
  } catch {
    return url;
  }
}

export function stats(ws: Workspace) {
  const valid = ws.earnings.filter(e => e.status !== 'storniert');
  const total = valid.reduce((s, e) => s + e.amount, 0);
  const paid = valid.filter(e => e.status === 'ausgezahlt').reduce((s, e) => s + e.amount, 0);
  const open = valid.filter(e => e.status === 'offen' || e.status === 'bestätigt').reduce((s, e) => s + e.amount, 0);
  const clicks = ws.links.reduce((s, l) => s + (l.clicks || 0), 0);
  const month = today().slice(0, 7);
  const thisMonth = valid.filter(e => e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0);
  return { total, paid, open, clicks, epc: clicks ? total / clicks : 0, thisMonth, activePrograms: ws.programs.filter(p => p.status === 'aktiv').length };
}

export function earningsByLink(ws: Workspace) {
  const m = new Map<string, number>();
  for (const e of ws.earnings) if (e.linkId && e.status !== 'storniert') m.set(e.linkId, (m.get(e.linkId) || 0) + e.amount);
  return m;
}

// ---------- Leerer Arbeitsbereich ----------
export function emptyWorkspace(displayName = ''): Workspace {
  return {
    version: 1,
    programs: [],
    links: [],
    earnings: [],
    drafts: [],
    tasks: [],
    rules: RECIPES.filter(r => r.defaultOn).map(r => r.make()),
    log: [],
    settings: { disclosure: 'Anzeige', amazonNotice: true, subIdParam: 'subid', displayName, niche: '' },
    firedThresholds: {},
  };
}

// ---------- Fertige Automationen (Rezepte) ----------
export interface Recipe {
  key: string;
  name: string;
  description: string;
  defaultOn?: boolean;
  make: () => Rule;
}
const rule = (name: string, trigger: TriggerType, actions: Action[], params?: Rule['params']): Rule => ({
  id: uid(), name, enabled: true, trigger, actions, params, runs: 0,
});

export const RECIPES: Recipe[] = [
  {
    key: 'subid', name: 'SubID automatisch anhängen', defaultOn: true,
    description: 'Jeder neue Link bekommt eine SubID, damit du im Partnerprogramm siehst, welcher Link verkauft hat.',
    make: () => rule('SubID automatisch anhängen', 'link_created', [{ type: 'add_subid' }]),
  },
  {
    key: 'social', name: 'Social-Posts zu neuen Links', defaultOn: true,
    description: 'Erstellt für jeden neuen Link Entwürfe für Instagram, TikTok und Pinterest – mit Kennzeichnung.',
    make: () => rule('Social-Posts zu neuen Links', 'link_created', [{ type: 'social_drafts', params: { channels: 'Instagram,TikTok,Pinterest' } }]),
  },
  {
    key: 'weekly', name: 'Wochenbericht', defaultOn: true,
    description: 'Jeden Montag eine Zusammenfassung: Klicks, Einnahmen, beste Links, offene Aufgaben.',
    make: () => rule('Wochenbericht', 'weekly', [{ type: 'weekly_report' }]),
  },
  {
    key: 'payout', name: 'Auszahlung nachverfolgen', defaultOn: true,
    description: 'Nach jeder eingetragenen Provision: Aufgabe, in 30 Tagen den Auszahlungsstatus zu prüfen.',
    make: () => rule('Auszahlung nachverfolgen', 'earning_added', [{ type: 'follow_up_task', params: { days: '30', text: 'Auszahlungsstatus prüfen' } }]),
  },
  {
    key: 'top', name: 'Top-Link markieren', defaultOn: true,
    description: 'Sobald ein Link 100 Klicks erreicht: Tag „top“ und Aufgabe, mehr Content dazu zu machen.',
    make: () => rule('Top-Link markieren', 'clicks_threshold', [{ type: 'add_tag', params: { tag: 'top' } }, { type: 'create_task', params: { text: 'Mehr Content für {link} erstellen – der Link läuft gut' } }], { threshold: 100 }),
  },
  {
    key: 'inactive', name: 'Ungenutzte Links aufräumen',
    description: 'Links ohne Klick nach 30 Tagen bekommen eine Aufgabe: bewerben oder pausieren.',
    make: () => rule('Ungenutzte Links aufräumen', 'link_inactive', [{ type: 'create_task', params: { text: '{link} hat seit 30 Tagen keinen Klick – neu bewerben oder pausieren' } }], { days: 30 }),
  },
  {
    key: 'autopause', name: 'Ungenutzte Links pausieren',
    description: 'Pausiert Links automatisch, die 60 Tage keinen Klick hatten.',
    make: () => rule('Ungenutzte Links pausieren', 'link_inactive', [{ type: 'pause_link' }], { days: 60 }),
  },
  {
    key: 'milestone', name: 'Meilenstein 1.000 Klicks',
    description: 'Bei 1.000 Klicks auf einen Link: Aufgabe, beim Partnerprogramm nach besserer Provision zu fragen.',
    make: () => rule('Meilenstein 1.000 Klicks', 'clicks_threshold', [{ type: 'create_task', params: { text: '{link}: 1.000 Klicks – beim Programm nach höherer Provision fragen' } }], { threshold: 1000 }),
  },
  {
    key: 'newsletter', name: 'Newsletter-Entwurf zu neuen Links',
    description: 'Erstellt zu jedem neuen Link einen kurzen Newsletter-Abschnitt.',
    make: () => rule('Newsletter-Entwurf zu neuen Links', 'link_created', [{ type: 'social_drafts', params: { channels: 'Newsletter' } }]),
  },
  {
    key: 'review', name: 'Erfahrungsbericht planen',
    description: 'Nach jedem neuen Link: Aufgabe in 14 Tagen, einen ehrlichen Erfahrungsbericht zu schreiben.',
    make: () => rule('Erfahrungsbericht planen', 'link_created', [{ type: 'follow_up_task', params: { days: '14', text: 'Erfahrungsbericht zu {link} schreiben' } }]),
  },
];

export const TRIGGER_LABEL: Record<TriggerType, string> = {
  link_created: 'Wenn ein neuer Link angelegt wird',
  earning_added: 'Wenn eine Provision eingetragen wird',
  weekly: 'Jede Woche (beim ersten Öffnen ab Montag)',
  clicks_threshold: 'Wenn ein Link eine Klickzahl erreicht',
  link_inactive: 'Wenn ein Link lange keinen Klick hatte',
};
export const ACTION_LABEL: Record<ActionType, string> = {
  add_subid: 'SubID an den Ziel-Link anhängen',
  social_drafts: 'Post-Entwürfe mit Kennzeichnung erstellen',
  create_task: 'Aufgabe anlegen',
  weekly_report: 'Wochenbericht erstellen',
  add_tag: 'Tag hinzufügen',
  pause_link: 'Link pausieren',
  follow_up_task: 'Aufgabe mit Termin anlegen',
};

// ---------- Texte für Entwürfe ----------
const POST_TEMPLATES: Record<string, (title: string, link: string, d: string, niche: string) => string> = {
  Instagram: (t, l, d, n) => `${t} – mein ehrlicher Eindruck 👇\n\nWas mir gefällt:\n• …\n• …\nWas besser sein könnte:\n• …\n\nLink in der Bio (${l})\n\n${d}\n\n#${slugify(n || t).replace(/-/g, '')} #empfehlung #erfahrung`,
  TikTok: (t, l, d) => `Hook (0–2 s): „Ich habe ${t} getestet – das hat mich überrascht.“\nSzene 1: Problem zeigen\nSzene 2: ${t} in Aktion\nSzene 3: Ehrliches Fazit + Link in der Bio\n\nCaption: ${t} im Test. Link in der Bio. ${d}`,
  Pinterest: (t, l, d) => `Titel: ${t} – lohnt sich das?\nBeschreibung: Vorteile, Nachteile und für wen ${t} passt. ${d}\nZiel-Link: ${l}`,
  Newsletter: (t, l, d) => `Empfehlung der Woche: ${t}\n\nKurz gesagt: … (1–2 Sätze, warum es dir geholfen hat)\n\n→ Ansehen: ${l}\n\n${d}`,
  Blog: (t, l, d) => `# ${t}: Test & Erfahrung\n\n${d}\n\n## Kurzfazit\n…\n\n## Vorteile\n- …\n\n## Nachteile\n- …\n\n## Für wen lohnt es sich?\n…\n\n[Zum Angebot](${l})`,
};
export const DRAFT_CHANNELS = Object.keys(POST_TEMPLATES);
export function draftText(channel: string, link: AffLink, s: Settings, shortUrl: string) {
  const fn = POST_TEMPLATES[channel] || POST_TEMPLATES.Instagram;
  return fn(link.title, shortUrl, disclosureLine(s, link), s.niche);
}

// ---------- Engine ----------
const fill = (text: string, link?: AffLink) => text.replace(/\{link\}/g, link ? `„${link.title}“` : 'Link');
const addDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

function applyAction(ws: Workspace, r: Rule, a: Action, ctx: { link?: AffLink; earning?: Earning }, shortUrl: (l: AffLink) => string): { ws: Workspace; text: string } | null {
  const now = new Date().toISOString();
  const link = ctx.link ? ws.links.find(l => l.id === ctx.link!.id) : undefined;
  switch (a.type) {
    case 'add_subid': {
      if (!link) return null;
      // Amazon wertet keine SubIDs aus; dort stattdessen eigene Tracking-IDs je Kanal anlegen
      if (/amazon\.|amzn\./i.test(link.targetUrl)) return null;
      const next = withSubId(link.targetUrl, ws.settings.subIdParam || 'subid', link.slug);
      if (next === link.targetUrl) return null;
      return { ws: { ...ws, links: ws.links.map(l => (l.id === link.id ? { ...l, targetUrl: next } : l)) }, text: `SubID „${link.slug}“ an ${link.title} angehängt` };
    }
    case 'social_drafts': {
      if (!link) return null;
      const channels = (a.params?.channels || 'Instagram').split(',').map(c => c.trim()).filter(Boolean);
      const drafts: Draft[] = channels.map(c => ({ id: uid(), channel: c, text: draftText(c, link, ws.settings, shortUrl(link)), linkId: link.id, createdAt: now, source: r.name }));
      return { ws: { ...ws, drafts: [...drafts, ...ws.drafts] }, text: `${drafts.length} Entwurf/Entwürfe für ${link.title} erstellt (${channels.join(', ')})` };
    }
    case 'create_task':
    case 'follow_up_task': {
      const text = fill(a.params?.text || 'Aufgabe', link);
      const days = a.type === 'follow_up_task' ? Number(a.params?.days || 7) : undefined;
      const extra = ctx.earning ? ` (${eur(ctx.earning.amount)} vom ${ctx.earning.date})` : '';
      const task: Task = { id: uid(), text: text + extra, done: false, due: days ? addDays(days) : undefined, createdAt: now, source: r.name };
      return { ws: { ...ws, tasks: [task, ...ws.tasks] }, text: `Aufgabe: ${task.text}${task.due ? ` – fällig ${task.due}` : ''}` };
    }
    case 'add_tag': {
      if (!link) return null;
      const tag = a.params?.tag || 'top';
      if (link.tags.includes(tag)) return null;
      return { ws: { ...ws, links: ws.links.map(l => (l.id === link.id ? { ...l, tags: [...l.tags, tag] } : l)) }, text: `Tag „${tag}“ zu ${link.title} hinzugefügt` };
    }
    case 'pause_link': {
      if (!link || !link.active) return null;
      return { ws: { ...ws, links: ws.links.map(l => (l.id === link.id ? { ...l, active: false } : l)) }, text: `${link.title} pausiert` };
    }
    case 'weekly_report': {
      const st = stats(ws);
      const byLink = earningsByLink(ws);
      const top = [...ws.links].sort((x, y) => (y.clicks || 0) - (x.clicks || 0)).slice(0, 3);
      const openTasks = ws.tasks.filter(t => !t.done).length;
      const text = [
        `Wochenbericht vom ${today()}`,
        `Klicks gesamt: ${st.clicks}`,
        `Einnahmen gesamt: ${eur(st.total)} · diesen Monat: ${eur(st.thisMonth)}`,
        `Offen/bestätigt: ${eur(st.open)} · ausgezahlt: ${eur(st.paid)}`,
        `Verdienst pro Klick (EPC): ${st.clicks ? eur(st.epc) : '–'}`,
        top.length ? `Beste Links:\n${top.map(l => `• ${l.title}: ${l.clicks || 0} Klicks, ${eur(byLink.get(l.id) || 0)}`).join('\n')}` : 'Noch keine Links.',
        `Offene Aufgaben: ${openTasks}`,
      ].join('\n');
      return { ws: { ...ws, drafts: [{ id: uid(), channel: 'Bericht', text, createdAt: now, source: r.name }, ...ws.drafts] }, text: 'Wochenbericht erstellt' };
    }
  }
  return null;
}

function runRule(ws: Workspace, r: Rule, ctx: { link?: AffLink; earning?: Earning }, shortUrl: (l: AffLink) => string): Workspace {
  let cur = ws;
  const texts: string[] = [];
  for (const a of r.actions) {
    const res = applyAction(cur, r, a, ctx, shortUrl);
    if (res) {
      cur = res.ws;
      texts.push(res.text);
    }
  }
  if (!texts.length) return ws;
  const now = new Date().toISOString();
  const log = [...texts.map(text => ({ at: now, rule: r.name, text })), ...cur.log].slice(0, 200);
  return { ...cur, log, rules: cur.rules.map(x => (x.id === r.id ? { ...x, runs: x.runs + 1, lastRun: now } : x)) };
}

export function mondayOf(d = new Date()) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (x.getUTCDay() + 6) % 7;
  x.setUTCDate(x.getUTCDate() - day);
  return x.toISOString().slice(0, 10);
}

export function processEvent(ws: Workspace, ev: HubEvent, shortUrl: (l: AffLink) => string, now = new Date()): Workspace {
  let cur = ws;
  const active = () => cur.rules.filter(r => r.enabled);
  if (ev.type === 'link_created') {
    for (const r of active().filter(r => r.trigger === 'link_created')) cur = runRule(cur, r, { link: ev.link }, shortUrl);
  } else if (ev.type === 'earning_added') {
    const link = ev.earning.linkId ? cur.links.find(l => l.id === ev.earning.linkId) : undefined;
    for (const r of active().filter(r => r.trigger === 'earning_added')) cur = runRule(cur, r, { earning: ev.earning, link }, shortUrl);
  } else if (ev.type === 'weekly') {
    for (const r of active().filter(r => r.trigger === 'weekly')) cur = runRule(cur, r, {}, shortUrl);
  } else if (ev.type === 'clicks_updated') {
    for (const r of active().filter(r => r.trigger === 'clicks_threshold')) {
      const th = r.params?.threshold || 100;
      for (const l of cur.links) {
        const key = `${r.id}:${l.id}`;
        if ((l.clicks || 0) >= th && (cur.firedThresholds[key] || 0) < th) {
          cur = runRule(cur, r, { link: l }, shortUrl);
          cur = { ...cur, firedThresholds: { ...cur.firedThresholds, [key]: th } };
        }
      }
    }
  } else if (ev.type === 'daily_check') {
    // Woechentliche Regeln: einmal pro Kalenderwoche
    const week = mondayOf(now);
    if (cur.lastWeekly !== week && cur.links.length + cur.earnings.length > 0) {
      cur = processEvent({ ...cur, lastWeekly: week }, { type: 'weekly' }, shortUrl, now);
    } else if (cur.lastWeekly !== week) {
      cur = { ...cur, lastWeekly: week };
    }
    // Inaktive Links
    for (const r of active().filter(r => r.trigger === 'link_inactive')) {
      const days = r.params?.days || 30;
      for (const l of cur.links) {
        const key = `${r.id}:${l.id}`;
        const age = (now.getTime() - new Date(l.createdAt).getTime()) / 86400000;
        if (l.active && (l.clicks || 0) === 0 && age >= days && !cur.firedThresholds[key]) {
          cur = runRule(cur, r, { link: l }, shortUrl);
          cur = { ...cur, firedThresholds: { ...cur.firedThresholds, [key]: 1 } };
        }
      }
    }
  }
  return cur;
}

// Gesamtzahl Funktionen fuer die Startseite
export const HUB_FEATURES = [
  'Link-Manager mit Kurzlinks',
  'Klick-Tracking pro Link',
  'Automatische SubIDs',
  'Partnerprogramm-Verwaltung',
  'Verzeichnis der großen Netzwerke',
  'Provisions-Tracking',
  'Auszahlungs-Status',
  'Verdienst pro Klick (EPC)',
  'Wochenbericht',
  '10 fertige Automationen',
  'Eigene Automations-Regeln',
  'Post-Entwürfe für 5 Kanäle',
  'Automatische Werbekennzeichnung',
  'Amazon-Pflichthinweis',
  'Aufgaben mit Terminen',
  'CSV-Export',
  'Rechts-Checkliste',
  'Geführte Tour für Anfänger',
  '10 Lektionen mit Quiz',
  '150 Marketing-Werkzeuge',
];
