import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard, Link2, Handshake, Wallet, Zap, FileText, ListChecks, Scale, Settings as SettingsIcon,
  GraduationCap, Lightbulb, X, ChevronLeft, ChevronRight,
  Plus, Copy, Check, Trash2, ExternalLink, Pause, Play, RefreshCw, Loader2, Sparkles, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import {
  Workspace, AffLink, Program, Earning, Draft, Task, Rule, Action, HubEvent, TriggerType, ActionType, EarningStatus, ProgramStatus,
  emptyWorkspace, processEvent, stats, earningsByLink, uid, today, eur, slugify, isValidUrl, draftText, disclosureLine,
  RECIPES, TRIGGER_LABEL, ACTION_LABEL, DRAFT_CHANNELS, AMAZON_NOTICE,
} from './engine';
import { NETWORKS, LEGAL_CHECKLIST } from './networks';
import { useAuth, isPro } from '../auth/AuthGate';
import { FREE_LINK_LIMIT, FREE_RECIPES } from '../billing/plans';
import { TOUR, LESSONS, TAB_HELP, Lesson } from './tutorials';

// ---------- kleine UI-Bausteine im Stil der App ----------
const inputCls =
  'w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/70';
const btnPrimary = 'px-3.5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors';
const btnGhost = 'px-2.5 py-1.5 text-xs text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors';
const card = 'bg-slate-900/60 border border-slate-800 rounded-2xl p-5';

const Field: React.FC<{ label: string; id: string; children: React.ReactNode; wide?: boolean }> = ({ label, id, children, wide }) => (
  <label htmlFor={id} className={`space-y-1 min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
    <span className="text-xs text-slate-400 font-medium">{label}</span>
    {children}
  </label>
);

const CopyBtn: React.FC<{ text: string; label?: string }> = ({ text, label = 'Kopieren' }) => {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className={btnGhost}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1400);
        } catch {
          /* Zwischenablage nicht verfuegbar */
        }
      }}
    >
      {ok ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      {ok ? 'Kopiert' : label}
    </button>
  );
};

const Empty: React.FC<{ text: string }> = ({ text }) => (
  <p className="text-sm text-slate-500 border border-dashed border-slate-800 rounded-xl p-6 text-center">{text}</p>
);

const Pill: React.FC<{ tone: 'ok' | 'warn' | 'muted' | 'bad' | 'accent'; children: React.ReactNode }> = ({ tone, children }) => {
  const m = {
    ok: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    warn: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    muted: 'bg-slate-800 text-slate-400 border-slate-700',
    bad: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    accent: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  }[tone];
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap ${m}`}>{children}</span>;
};

const UpgradeHint: React.FC<{ text: string }> = ({ text }) => {
  const auth = useAuth();
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5">
      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
      <span className="flex-1 min-w-[180px]">{text}</span>
      <button onClick={() => auth?.openAccount('membership')} className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300">Pro ansehen</button>
    </div>
  );
};
const ProPill = () => <span className="text-[9px] font-bold uppercase px-1 py-px rounded bg-amber-400 text-slate-950">Pro</span>;

const earningTone = (s: EarningStatus) => (s === 'ausgezahlt' ? 'ok' : s === 'bestätigt' ? 'accent' : s === 'storniert' ? 'bad' : 'warn');
const programTone = (s: ProgramStatus) => (s === 'aktiv' ? 'ok' : s === 'beworben' ? 'warn' : s === 'abgelehnt' ? 'bad' : 'muted');

type TabKey = 'overview' | 'learn' | 'links' | 'programs' | 'earnings' | 'automations' | 'drafts' | 'tasks' | 'legal' | 'settings';
const TABS: { key: TabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'overview', label: 'Übersicht', icon: LayoutDashboard },
  { key: 'learn', label: 'Lernen', icon: GraduationCap },
  { key: 'links', label: 'Links', icon: Link2 },
  { key: 'programs', label: 'Partnerprogramme', icon: Handshake },
  { key: 'earnings', label: 'Einnahmen', icon: Wallet },
  { key: 'automations', label: 'Automationen', icon: Zap },
  { key: 'drafts', label: 'Entwürfe', icon: FileText },
  { key: 'tasks', label: 'Aufgaben', icon: ListChecks },
  { key: 'legal', label: 'Rechtliches', icon: Scale },
  { key: 'settings', label: 'Einstellungen', icon: SettingsIcon },
];

// ---------- Daten laden & speichern ----------
function useWorkspace(defaultName: string) {
  const [ws, setWs] = useState<Workspace | null>(null);
  const [meta, setMeta] = useState<{ userKey: string; testMode: boolean }>({ userKey: '', testMode: false });
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loadError, setLoadError] = useState('');
  const loaded = useRef(false);

  const shortUrl = useCallback(
    (l: AffLink) => (meta.testMode || !meta.userKey ? l.targetUrl : `${window.location.origin}/go/${meta.userKey}/${l.slug}`),
    [meta],
  );

  useEffect(() => {
    fetch('/api/me/workspace', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => {
        if (!d.success) throw new Error(d.error);
        const m = { userKey: d.userKey || '', testMode: Boolean(d.testMode) };
        setMeta(m);
        let w: Workspace = d.workspace && d.workspace.version === 1 ? d.workspace : emptyWorkspace(defaultName);
        const clicks = d.clicks || {};
        w = { ...w, links: w.links.map(l => ({ ...l, clicks: clicks[l.slug]?.count ?? l.clicks ?? 0 })) };
        const su = (l: AffLink) => (m.testMode || !m.userKey ? l.targetUrl : `${window.location.origin}/go/${m.userKey}/${l.slug}`);
        w = processEvent(w, { type: 'clicks_updated' }, su);
        w = processEvent(w, { type: 'daily_check' }, su);
        setWs(w);
        loaded.current = true;
      })
      .catch(e => setLoadError(e?.message || 'Daten konnten nicht geladen werden.'));
  }, [defaultName]);

  // Automatisch speichern (kurz verzoegert)
  useEffect(() => {
    if (!ws || !loaded.current) return;
    setSaveState('saving');
    const t = setTimeout(() => {
      fetch('/api/me/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ workspace: ws }),
      })
        .then(r => r.json())
        .then(d => setSaveState(d.success ? 'saved' : 'error'))
        .catch(() => setSaveState('error'));
    }, 600);
    return () => clearTimeout(t);
  }, [ws]);

  const update = useCallback(
    (fn: (w: Workspace) => Workspace, event?: (w: Workspace) => HubEvent) => {
      setWs(prev => {
        if (!prev) return prev;
        let next = fn(prev);
        if (event) next = processEvent(next, event(next), shortUrl);
        return next;
      });
    },
    [shortUrl],
  );

  return { ws, update, shortUrl, meta, saveState, loadError };
}

// ---------- Hauptkomponente ----------
export const AffiliateHub: React.FC<{ initialTab?: string }> = ({ initialTab }) => {
  const auth = useAuth();
  const { ws, update, shortUrl, meta, saveState, loadError } = useWorkspace(auth?.user.name || '');
  const [tab, setTab] = useState<TabKey>((TABS.some(t => t.key === initialTab) ? initialTab : 'overview') as TabKey);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const tourStarted = useRef(false);
  useEffect(() => {
    if (ws && !ws.settings.tourDone && !tourStarted.current) {
      tourStarted.current = true;
      setTourStep(0);
    }
  }, [ws]);

  if (loadError) return <div className={`${card} max-w-3xl mx-auto text-sm text-rose-300`}>{loadError}</div>;
  if (!ws) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-slate-400 py-20">
        <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Dein Affiliate-Hub wird geladen …
      </div>
    );
  }

  const openTasks = ws.tasks.filter(t => !t.done).length;
  const startTour = () => { setTourStep(0); setTab('overview'); };
  const endTour = () => { setTourStep(null); update(w => ({ ...w, settings: { ...w.settings, tourDone: true } })); };
  const props = { ws, update, shortUrl, testMode: meta.testMode, goTo: setTab, startTour };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400">Affiliate-Hub</div>
          <h2 className="text-xl font-bold text-slate-100">Hallo {ws.settings.displayName || auth?.user.name}, so läuft dein Affiliate-Business</h2>
          <p className="text-xs text-slate-400 mt-1">Links, Partnerprogramme, Provisionen und Automationen an einem Ort. Alle Zahlen stammen aus deinen Klicks und Einträgen.</p>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5" aria-live="polite">
          {saveState === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /> Speichert …</>}
          {saveState === 'saved' && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Gespeichert</>}
          {saveState === 'error' && <span className="text-rose-300">Speichern fehlgeschlagen – bitte neu laden</span>}
        </div>
      </div>

      {meta.testMode && (
        <div className="text-xs text-sky-200 bg-sky-500/10 border border-sky-500/30 rounded-xl px-4 py-2.5">
          Testversion: Deine Daten bleiben nur in diesem Browser. Kurzlinks mit Klickzählung und die Link-Prüfung funktionieren erst, wenn die App auf einem Server läuft.
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-slate-800" role="tablist">
        {TABS.map(t => {
          const Icon = t.icon;
          const lessonsLeft = LESSONS.length - Object.values(ws.settings.lessonsDone || {}).filter(Boolean).length;
          const badge = t.key === 'tasks' && openTasks ? openTasks : t.key === 'drafts' && ws.drafts.length ? ws.drafts.length : t.key === 'learn' && lessonsLeft ? lessonsLeft : 0;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap flex items-center gap-1.5 border-b-2 -mb-px transition-colors ${
                tab === t.key ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {badge > 0 && <span className="text-[10px] bg-slate-800 text-slate-300 rounded px-1.5 font-mono">{badge}</span>}
            </button>
          );
        })}
      </div>

      {!ws.settings.hideTips && <HelpTip text={TAB_HELP[tab]} onHide={() => update(w => ({ ...w, settings: { ...w.settings, hideTips: true } }))} />}

      {tab === 'overview' && <Overview {...props} />}
      {tab === 'learn' && <Learn {...props} />}
      {tab === 'links' && <Links {...props} />}
      {tab === 'programs' && <Programs {...props} />}
      {tab === 'earnings' && <Earnings {...props} />}
      {tab === 'automations' && <Automations {...props} />}
      {tab === 'drafts' && <Drafts {...props} />}
      {tab === 'tasks' && <Tasks {...props} />}
      {tab === 'legal' && <Legal {...props} />}
      {tab === 'settings' && <SettingsTab {...props} />}

      {tourStep !== null && (
        <Tour
          step={tourStep}
          onStep={i => { setTourStep(i); setTab(TOUR[i].tab as TabKey); }}
          onClose={endTour}
        />
      )}
    </div>
  );
};

// ---------- Hilfe & Tour ----------
const HelpTip: React.FC<{ text: string; onHide: () => void }> = ({ text, onHide }) => (
  <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5">
    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-px" />
    <span className="flex-1">{text}</span>
    <button onClick={onHide} className="text-slate-500 hover:text-slate-300 whitespace-nowrap">Tipps ausblenden</button>
  </div>
);

const Tour: React.FC<{ step: number; onStep: (i: number) => void; onClose: () => void }> = ({ step, onStep, onClose }) => {
  const s = TOUR[step];
  const last = step === TOUR.length - 1;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 flex justify-center pointer-events-none" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <div role="dialog" aria-modal="false" aria-labelledby="tour-title" className="pointer-events-auto w-full max-w-lg bg-slate-900 border border-amber-400/40 rounded-2xl shadow-2xl shadow-black/50 p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400">Tour · Schritt {step + 1} von {TOUR.length}</div>
            <h3 id="tour-title" className="text-base font-bold text-slate-100 mt-0.5">{s.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white" aria-label="Tour beenden"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{s.text}</p>
        <div className="flex gap-1" aria-hidden="true">
          {TOUR.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-amber-400' : 'bg-slate-700'}`} />)}
        </div>
        <div className="flex items-center justify-between gap-2">
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-200">Überspringen</button>
          <div className="flex gap-2">
            {step > 0 && <button onClick={() => onStep(step - 1)} className={btnGhost}><ChevronLeft className="w-3.5 h-3.5" /> Zurück</button>}
            <button onClick={() => (last ? onClose() : onStep(step + 1))} className={btnPrimary}>{last ? 'Los geht’s' : <>Weiter <ChevronRight className="w-3.5 h-3.5" /></>}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Lernen ----------
const Learn: React.FC<TabProps> = ({ ws, update, goTo }) => {
  const done = ws.settings.lessonsDone || {};
  const count = LESSONS.filter(l => done[l.id]).length;
  const [open, setOpen] = useState<string | null>(LESSONS.find(l => !done[l.id])?.id || null);
  return (
    <div className="max-w-3xl space-y-4">
      <div className={`${card} space-y-2`}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-100">Dein Lernfortschritt</span>
          <span className="font-mono text-slate-300">{count} / {LESSONS.length}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={LESSONS.length} aria-valuenow={count} aria-label="Lernfortschritt">
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${(count / LESSONS.length) * 100}%` }} />
        </div>
        <p className="text-xs text-slate-400">{count === LESSONS.length ? 'Alle Lektionen geschafft – stark! Jetzt heißt es: dranbleiben.' : 'Eine Lektion dauert 3–5 Minuten. Beantworte die Quizfrage richtig, um sie abzuschließen.'}</p>
      </div>
      {LESSONS.map((l, i) => (
        <LessonCard
          key={l.id}
          index={i}
          lesson={l}
          done={Boolean(done[l.id])}
          open={open === l.id}
          onToggle={() => setOpen(open === l.id ? null : l.id)}
          onDone={() => {
            update(w => ({ ...w, settings: { ...w.settings, lessonsDone: { ...(w.settings.lessonsDone || {}), [l.id]: true } } }));
          }}
          onNext={() => setOpen(LESSONS[i + 1]?.id || null)}
          goTo={goTo}
        />
      ))}
    </div>
  );
};

const LessonCard: React.FC<{ index: number; lesson: Lesson; done: boolean; open: boolean; onToggle: () => void; onDone: () => void; onNext: () => void; goTo: (t: TabKey) => void }> = ({ index, lesson: l, done, open, onToggle, onDone, onNext, goTo }) => {
  const [answer, setAnswer] = useState<number | null>(null);
  const correct = answer === l.quiz.correct;
  return (
    <div className={`${card} !p-0 overflow-hidden ${done ? 'border-emerald-500/30' : ''}`}>
      <button onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-800/30">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>{done ? <Check className="w-3.5 h-3.5" /> : index + 1}</span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-slate-100">{l.title}</span>
          <span className="block text-[11px] text-slate-500">{l.level} · {l.minutes} Min.</span>
        </span>
        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-800 pt-4">
          <p className="text-sm text-slate-300 leading-relaxed">{l.intro}</p>
          <ol className="space-y-2">
            {l.steps.map((st, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full border border-slate-600 text-[10px] text-slate-400 flex items-center justify-center shrink-0 mt-px">{i + 1}</span>
                <span>{st}</span>
              </li>
            ))}
          </ol>
          {l.tryIt && <button onClick={() => goTo(l.tryIt!.tab as TabKey)} className={btnGhost}><Play className="w-3.5 h-3.5 text-amber-400" /> Jetzt ausprobieren: {l.tryIt.label}</button>}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="text-xs font-semibold text-amber-300">Quiz: {l.quiz.q}</div>
            <div className="space-y-1.5" role="radiogroup" aria-label={l.quiz.q}>
              {l.quiz.options.map((o, i) => (
                <button
                  key={i}
                  role="radio"
                  aria-checked={answer === i}
                  onClick={() => { setAnswer(i); if (i === l.quiz.correct) onDone(); }}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                    answer === i ? (i === l.quiz.correct ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/50 bg-rose-500/10 text-rose-200') : 'border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
            {answer !== null && (
              <p className={`text-xs ${correct ? 'text-emerald-300' : 'text-rose-300'}`}>{correct ? 'Richtig! ' : 'Noch nicht ganz. '}{l.quiz.explain}</p>
            )}
            {(correct || done) && <button onClick={onNext} className={btnPrimary}>Nächste Lektion <ChevronRight className="w-3.5 h-3.5" /></button>}
          </div>
        </div>
      )}
    </div>
  );
};

interface TabProps {
  ws: Workspace;
  update: (fn: (w: Workspace) => Workspace, event?: (w: Workspace) => HubEvent) => void;
  shortUrl: (l: AffLink) => string;
  testMode: boolean;
  goTo: (t: TabKey) => void;
  startTour: () => void;
}

// ---------- Übersicht ----------
const Overview: React.FC<TabProps> = ({ ws, goTo }) => {
  const st = stats(ws);
  const months = useMemo(() => {
    const out: { key: string; label: string; sum: number }[] = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
      out.push({ key, label: x.toLocaleDateString('de-DE', { month: 'short' }), sum: 0 });
    }
    for (const e of ws.earnings) {
      if (e.status === 'storniert') continue;
      const m = out.find(o => e.date.startsWith(o.key));
      if (m) m.sum += e.amount;
    }
    return out;
  }, [ws.earnings]);
  const max = Math.max(1, ...months.map(m => m.sum));
  const steps = [
    { done: Boolean(ws.settings.lessonsDone?.basics), text: 'Lektion „Was ist Affiliate-Marketing?“', tab: 'learn' as TabKey },
    { done: ws.programs.length > 0, text: 'Partnerprogramm anlegen', tab: 'programs' as TabKey },
    { done: ws.links.length > 0, text: 'Ersten Affiliate-Link anlegen', tab: 'links' as TabKey },
    { done: ws.rules.some(r => r.enabled), text: 'Automationen prüfen', tab: 'automations' as TabKey },
    { done: Object.values(ws.settings.legal || {}).filter(Boolean).length >= 3, text: 'Rechts-Checkliste durchgehen', tab: 'legal' as TabKey },
    { done: ws.earnings.length > 0, text: 'Erste Provision eintragen', tab: 'earnings' as TabKey },
  ];
  const tiles = [
    { label: 'Einnahmen gesamt', value: eur(st.total) },
    { label: 'Diesen Monat', value: eur(st.thisMonth) },
    { label: 'Offen / bestätigt', value: eur(st.open) },
    { label: 'Klicks', value: st.clicks.toLocaleString('de-DE') },
    { label: 'Verdienst pro Klick', value: st.clicks ? eur(st.epc) : '–' },
    { label: 'Aktive Programme', value: String(st.activePrograms) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {tiles.map(t => (
          <div key={t.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400">{t.label}</div>
            <div className="text-lg font-bold text-slate-100 font-mono tabular-nums mt-0.5">{t.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {steps.some(s => !s.done) && (
          <div className={card}>
            <h3 className="text-sm font-semibold text-slate-100 mb-3">Erste Schritte</h3>
            <ol className="space-y-2">
              {steps.map((s, i) => (
                <li key={s.text}>
                  <button onClick={() => goTo(s.tab)} className="w-full flex items-center gap-2.5 text-left text-sm group">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${s.done ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600 text-slate-400'}`}>
                      {s.done ? <Check className="w-3 h-3" /> : i + 1}
                    </span>
                    <span className={s.done ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-amber-300'}>{s.text}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className={`${card} ${steps.some(s => !s.done) ? '' : 'lg:col-span-2'}`}>
          <h3 className="text-sm font-semibold text-slate-100 mb-4">Einnahmen der letzten 6 Monate</h3>
          <div className="flex items-end gap-3 h-36" role="img" aria-label="Balkendiagramm der Einnahmen pro Monat">
            {months.map(m => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end min-w-0">
                <span className="text-[10px] text-slate-400 font-mono tabular-nums">{m.sum ? Math.round(m.sum) + ' €' : ''}</span>
                <div className="w-full max-w-[40px] rounded-t bg-amber-400/80" style={{ height: `${Math.max(2, (m.sum / max) * 100)}%`, opacity: m.sum ? 1 : 0.2 }} />
                <span className="text-[10px] text-slate-500">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <h3 className="text-sm font-semibold text-slate-100 mb-3">Zuletzt automatisch erledigt</h3>
          {ws.log.length === 0 ? (
            <p className="text-xs text-slate-500">Noch nichts. Lege einen Link an – die Automationen legen dann sofort los.</p>
          ) : (
            <ul className="space-y-2">
              {ws.log.slice(0, 6).map((l, i) => (
                <li key={i} className="text-xs">
                  <div className="text-slate-200">{l.text}</div>
                  <div className="text-slate-500">{l.rule} · {new Date(l.at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------- Links ----------
const Links: React.FC<TabProps> = ({ ws, update, shortUrl, testMode }) => {
  const auth = useAuth();
  const pro = isPro(auth?.user);
  const atLimit = !pro && ws.links.length >= FREE_LINK_LIMIT;
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [programId, setProgramId] = useState('');
  const [tags, setTags] = useState('');
  const [err, setErr] = useState('');
  const [checks, setChecks] = useState<Record<string, string>>({});
  const byLink = earningsByLink(ws);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (atLimit) return setErr(`Mit Free kannst du bis zu ${FREE_LINK_LIMIT} Links anlegen. Mit Pro sind es unbegrenzt viele.`);
    if (!title.trim()) return setErr('Bitte gib dem Link einen Namen.');
    if (!isValidUrl(url.trim())) return setErr('Bitte füge den vollständigen Affiliate-Link mit https:// ein.');
    const s = slugify(slug || title) || uid().slice(0, 6);
    if (ws.links.some(l => l.slug === s)) return setErr(`Der Kurzname „${s}“ ist schon vergeben.`);
    const link: AffLink = {
      id: uid(), slug: s, title: title.trim(), targetUrl: url.trim(), programId: programId || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean), active: true, createdAt: new Date().toISOString(), clicks: 0,
    };
    update(w => ({ ...w, links: [link, ...w.links] }), () => ({ type: 'link_created', link }));
    setTitle(''); setUrl(''); setSlug(''); setTags('');
  };

  const check = async (l: AffLink) => {
    if (!pro) { auth?.openAccount('membership'); return; }
    setChecks(c => ({ ...c, [l.id]: 'prüft …' }));
    try {
      const r = await fetch('/api/me/check-link', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ url: l.targetUrl }) });
      const d = await r.json();
      setChecks(c => ({ ...c, [l.id]: !d.success ? d.error : d.ok ? `✓ erreichbar (${d.status})` : `✗ Problem (${d.status || d.error})` }));
    } catch {
      setChecks(c => ({ ...c, [l.id]: 'Prüfung fehlgeschlagen' }));
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5 items-start">
      <form onSubmit={add} className={`${card} space-y-3`}>
        <h3 className="text-sm font-semibold text-slate-100">Neuer Affiliate-Link</h3>
        <Field label="Name (z. B. Produkt)" id="l-title"><input id="l-title" className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="Massagepistole X200" /></Field>
        <Field label="Affiliate-Link aus dem Partnerprogramm" id="l-url"><input id="l-url" className={inputCls} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" inputMode="url" /></Field>
        <Field label="Kurzname für deinen Link (optional)" id="l-slug"><input id="l-slug" className={inputCls} value={slug} onChange={e => setSlug(e.target.value)} placeholder={slugify(title) || 'massagepistole'} /></Field>
        <Field label="Partnerprogramm" id="l-prog">
          <select id="l-prog" className={inputCls} value={programId} onChange={e => setProgramId(e.target.value)}>
            <option value="">– keins –</option>
            {ws.programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.network})</option>)}
          </select>
        </Field>
        <Field label="Tags (Komma-getrennt)" id="l-tags"><input id="l-tags" className={inputCls} value={tags} onChange={e => setTags(e.target.value)} placeholder="fitness, instagram" /></Field>
        {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
        <button type="submit" className={btnPrimary}><Plus className="w-3.5 h-3.5" /> Link anlegen</button>
        {!pro && <div className="text-[11px] text-slate-500">{ws.links.length} von {FREE_LINK_LIMIT} Links im Free-Plan</div>}
        {atLimit && <UpgradeHint text="Limit erreicht. Mit Pro legst du unbegrenzt viele Links an." />}
        <p className="text-[11px] text-slate-500">Aktive Automationen laufen sofort: SubID anhängen, Post-Entwürfe mit Kennzeichnung erstellen und mehr.</p>
      </form>

      <div className="space-y-3 min-w-0">
        {ws.links.length === 0 && <Empty text="Noch keine Links. Leg links deinen ersten Affiliate-Link an." />}
        {ws.links.map(l => {
          const prog = ws.programs.find(p => p.id === l.programId);
          const short = shortUrl(l);
          return (
            <div key={l.id} className={`${card} !p-4 space-y-2.5 ${l.active ? '' : 'opacity-60'}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-2 flex-wrap">
                    {l.title}
                    {!l.active && <Pill tone="muted">pausiert</Pill>}
                    {l.tags.map(t => <Pill key={t} tone={t === 'top' ? 'ok' : 'muted'}>{t}</Pill>)}
                  </div>
                  <div className="text-[11px] text-slate-500">{prog ? `${prog.name} · ` : ''}angelegt {new Date(l.createdAt).toLocaleDateString('de-DE')}</div>
                </div>
                <div className="flex gap-4 text-right">
                  <div><div className="text-[10px] text-slate-500">Klicks</div><div className="text-sm font-mono font-bold text-slate-100">{l.clicks || 0}</div></div>
                  <div><div className="text-[10px] text-slate-500">Provision</div><div className="text-sm font-mono font-bold text-slate-100">{eur(byLink.get(l.id) || 0)}</div></div>
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-200 break-all">{short}</div>
              {!testMode && <div className="text-[11px] text-slate-500 break-all">Ziel: {l.targetUrl}</div>}
              <div className="flex flex-wrap gap-2">
                <CopyBtn text={short} label="Link kopieren" />
                <CopyBtn text={disclosureLine(ws.settings, l)} label="Hinweistext kopieren" />
                <button type="button" className={btnGhost} onClick={() => update(w => ({ ...w, links: w.links.map(x => (x.id === l.id ? { ...x, active: !x.active } : x)) }))}>
                  {l.active ? <><Pause className="w-3.5 h-3.5" /> Pausieren</> : <><Play className="w-3.5 h-3.5" /> Aktivieren</>}
                </button>
                <button type="button" className={btnGhost} onClick={() => check(l)}><RefreshCw className="w-3.5 h-3.5" /> Prüfen {!pro && <ProPill />}</button>
                <a href={l.targetUrl} target="_blank" rel="noreferrer noopener sponsored" className={btnGhost}><ExternalLink className="w-3.5 h-3.5" /> Öffnen</a>
                <button type="button" className={`${btnGhost} hover:!text-rose-300`} onClick={() => update(w => ({ ...w, links: w.links.filter(x => x.id !== l.id) }))} aria-label={`${l.title} löschen`}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {checks[l.id] && <div className="text-[11px] text-slate-400">{checks[l.id]}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Partnerprogramme ----------
const Programs: React.FC<TabProps> = ({ ws, update }) => {
  const blank = { network: NETWORKS[0].name, name: '', commission: '', cookieDays: '', status: 'geplant' as ProgramStatus, url: '', notes: '' };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof blank, v: string) => setF(x => ({ ...x, [k]: v }));
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    const p: Program = { id: uid(), network: f.network, name: f.name.trim(), commission: f.commission.trim(), cookieDays: f.cookieDays ? Number(f.cookieDays) : undefined, status: f.status, url: f.url.trim() || undefined, notes: f.notes.trim() || undefined };
    update(w => ({ ...w, programs: [p, ...w.programs] }));
    setF(blank);
  };
  const takeOver = (n: typeof NETWORKS[number]) => {
    setF({ ...blank, network: n.name, name: n.name, url: n.url });
    document.getElementById('p-name')?.focus();
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5 items-start">
        <form onSubmit={add} className={`${card} space-y-3`}>
          <h3 className="text-sm font-semibold text-slate-100">Partnerprogramm hinzufügen</h3>
          <Field label="Netzwerk" id="p-net">
            <select id="p-net" className={inputCls} value={f.network} onChange={e => set('network', e.target.value)}>
              {NETWORKS.map(n => <option key={n.name}>{n.name}</option>)}
              <option>Eigenes Programm / direkt beim Händler</option>
            </select>
          </Field>
          <Field label="Programm / Händler" id="p-name"><input id="p-name" className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} placeholder="z. B. Sportartikel-Shop" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Provision" id="p-com"><input id="p-com" className={inputCls} value={f.commission} onChange={e => set('commission', e.target.value)} placeholder="z. B. 8 %" /></Field>
            <Field label="Cookie (Tage)" id="p-cookie"><input id="p-cookie" type="number" className={inputCls} value={f.cookieDays} onChange={e => set('cookieDays', e.target.value)} placeholder="30" /></Field>
          </div>
          <Field label="Status" id="p-status">
            <select id="p-status" className={inputCls} value={f.status} onChange={e => set('status', e.target.value)}>
              {(['geplant', 'beworben', 'aktiv', 'abgelehnt'] as ProgramStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Notizen" id="p-notes"><textarea id="p-notes" rows={2} className={inputCls} value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="Regeln, Ansprechpartner, Login …" /></Field>
          <button type="submit" className={btnPrimary} disabled={!f.name.trim()}><Plus className="w-3.5 h-3.5" /> Speichern</button>
          <p className="text-[11px] text-slate-500">Provision und Cookie-Laufzeit bitte aus deinem Partnerprogramm übernehmen – sie ändern sich je Programm.</p>
        </form>

        <div className="space-y-3 min-w-0">
          {ws.programs.length === 0 && <Empty text="Noch keine Programme. Wähle unten ein Netzwerk aus dem Verzeichnis oder trag eins ein." />}
          {ws.programs.map(p => (
            <div key={p.id} className={`${card} !p-4 flex flex-wrap items-center justify-between gap-3`}>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100 flex items-center gap-2 flex-wrap">{p.name} <Pill tone={programTone(p.status)}>{p.status}</Pill></div>
                <div className="text-[11px] text-slate-400">{p.network}{p.commission ? ` · Provision ${p.commission}` : ''}{p.cookieDays ? ` · Cookie ${p.cookieDays} Tage` : ''}</div>
                {p.notes && <div className="text-[11px] text-slate-500 mt-1">{p.notes}</div>}
              </div>
              <div className="flex gap-2">
                <select aria-label={`Status von ${p.name}`} className={`${inputCls} !w-auto !py-1 text-xs`} value={p.status} onChange={e => update(w => ({ ...w, programs: w.programs.map(x => (x.id === p.id ? { ...x, status: e.target.value as ProgramStatus } : x)) }))}>
                  {(['geplant', 'beworben', 'aktiv', 'abgelehnt'] as ProgramStatus[]).map(s => <option key={s}>{s}</option>)}
                </select>
                {p.url && <a href={p.url} target="_blank" rel="noreferrer" className={btnGhost}><ExternalLink className="w-3.5 h-3.5" /></a>}
                <button className={btnGhost} onClick={() => update(w => ({ ...w, programs: w.programs.filter(x => x.id !== p.id) }))} aria-label={`${p.name} löschen`}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-100 mb-3">Verzeichnis: Affiliate-Netzwerke im DACH-Raum</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {NETWORKS.map(n => (
            <div key={n.name} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
              <div className="text-sm font-semibold text-slate-100">{n.name}</div>
              <div className="text-[11px] text-amber-300/90">{n.focus}</div>
              <p className="text-xs text-slate-400 flex-1">{n.tip}</p>
              <div className="flex gap-2">
                <button className={btnGhost} onClick={() => takeOver(n)}><Plus className="w-3.5 h-3.5" /> Übernehmen</button>
                <a href={n.url} target="_blank" rel="noreferrer" className={btnGhost}><ExternalLink className="w-3.5 h-3.5" /> Anmelden</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- Einnahmen ----------
const Earnings: React.FC<TabProps> = ({ ws, update }) => {
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState('');
  const [programId, setProgramId] = useState('');
  const [linkId, setLinkId] = useState('');
  const [status, setStatus] = useState<EarningStatus>('offen');
  const [note, setNote] = useState('');
  const st = stats(ws);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(amount.replace(',', '.'));
    if (!(a > 0)) return;
    const earning: Earning = { id: uid(), date, amount: Math.round(a * 100) / 100, status, programId: programId || undefined, linkId: linkId || undefined, note: note.trim() || undefined };
    update(w => ({ ...w, earnings: [earning, ...w.earnings] }), () => ({ type: 'earning_added', earning }));
    setAmount(''); setNote('');
  };
  const csv = ['Datum;Betrag;Status;Programm;Link;Notiz', ...ws.earnings.map(e => [e.date, e.amount.toFixed(2).replace('.', ','), e.status, ws.programs.find(p => p.id === e.programId)?.name || '', ws.links.find(l => l.id === e.linkId)?.title || '', (e.note || '').replace(/;/g, ',')].join(';'))].join('\n');

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5 items-start">
      <form onSubmit={add} className={`${card} space-y-3`}>
        <h3 className="text-sm font-semibold text-slate-100">Provision eintragen</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Datum" id="e-date"><input id="e-date" type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} /></Field>
          <Field label="Betrag (€)" id="e-amount"><input id="e-amount" inputMode="decimal" className={inputCls} value={amount} onChange={e => setAmount(e.target.value)} placeholder="12,50" /></Field>
        </div>
        <Field label="Partnerprogramm" id="e-prog">
          <select id="e-prog" className={inputCls} value={programId} onChange={e => setProgramId(e.target.value)}>
            <option value="">– wählen –</option>
            {ws.programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Über welchen Link?" id="e-link">
          <select id="e-link" className={inputCls} value={linkId} onChange={e => setLinkId(e.target.value)}>
            <option value="">– unbekannt –</option>
            {ws.links.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </Field>
        <Field label="Status" id="e-status">
          <select id="e-status" className={inputCls} value={status} onChange={e => setStatus(e.target.value as EarningStatus)}>
            {(['offen', 'bestätigt', 'ausgezahlt', 'storniert'] as EarningStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Notiz" id="e-note"><input id="e-note" className={inputCls} value={note} onChange={e => setNote(e.target.value)} placeholder="Bestell-Nr., Kampagne …" /></Field>
        <button type="submit" className={btnPrimary} disabled={!(parseFloat(amount.replace(',', '.')) > 0)}><Plus className="w-3.5 h-3.5" /> Eintragen</button>
      </form>

      <div className="space-y-3 min-w-0">
        <div className="grid grid-cols-3 gap-3">
          {[['Gesamt', st.total], ['Offen/bestätigt', st.open], ['Ausgezahlt', st.paid]].map(([l, v]) => (
            <div key={l as string} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">{l}</div>
              <div className="text-base font-bold font-mono tabular-nums text-slate-100">{eur(v as number)}</div>
            </div>
          ))}
        </div>
        {ws.earnings.length === 0 ? (
          <Empty text="Noch keine Provisionen. Trag sie aus deinem Partner-Dashboard ein, um Verdienst pro Link zu sehen." />
        ) : (
          <div className={`${card} !p-0 overflow-x-auto`}>
            <table className="w-full text-xs">
              <thead><tr className="text-left text-slate-500 border-b border-slate-800"><th className="p-3 font-medium">Datum</th><th className="p-3 font-medium">Programm / Link</th><th className="p-3 font-medium text-right">Betrag</th><th className="p-3 font-medium">Status</th><th className="p-3" /></tr></thead>
              <tbody>
                {ws.earnings.map(e => (
                  <tr key={e.id} className="border-b border-slate-800/60 last:border-0">
                    <td className="p-3 font-mono text-slate-300 whitespace-nowrap">{new Date(e.date).toLocaleDateString('de-DE')}</td>
                    <td className="p-3 text-slate-200">{ws.programs.find(p => p.id === e.programId)?.name || '–'}<div className="text-slate-500">{ws.links.find(l => l.id === e.linkId)?.title || ''}{e.note ? ` · ${e.note}` : ''}</div></td>
                    <td className="p-3 text-right font-mono tabular-nums text-slate-100 whitespace-nowrap">{eur(e.amount)}</td>
                    <td className="p-3">
                      <select aria-label="Status" className={`bg-transparent text-xs border-0 p-0 focus:outline-none ${{ ok: 'text-emerald-300', accent: 'text-sky-300', bad: 'text-rose-300', warn: 'text-amber-300' }[earningTone(e.status)]}`} value={e.status} onChange={ev => update(w => ({ ...w, earnings: w.earnings.map(x => (x.id === e.id ? { ...x, status: ev.target.value as EarningStatus } : x)) }))}>
                        {(['offen', 'bestätigt', 'ausgezahlt', 'storniert'] as EarningStatus[]).map(s => <option key={s} className="bg-slate-900">{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3"><button className="text-slate-500 hover:text-rose-300" onClick={() => update(w => ({ ...w, earnings: w.earnings.filter(x => x.id !== e.id) }))} aria-label="Eintrag löschen"><Trash2 className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {ws.earnings.length > 0 && (
          <div className="flex items-center gap-2"><CopyBtn text={csv} label="Als CSV kopieren (für Excel / Steuer)" /></div>
        )}
      </div>
    </div>
  );
};

// ---------- Automationen ----------
const Automations: React.FC<TabProps> = ({ ws, update }) => {
  const auth = useAuth();
  const pro = isPro(auth?.user);
  const [trigger, setTrigger] = useState<TriggerType>('link_created');
  const [param, setParam] = useState('100');
  const [action, setAction] = useState<ActionType>('create_task');
  const [actionText, setActionText] = useState('');
  const [channels, setChannels] = useState('Instagram');
  const [name, setName] = useState('');

  const addCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pro) { auth?.openAccount('membership'); return; }
    const params: Rule['params'] = trigger === 'clicks_threshold' ? { threshold: Number(param) || 100 } : trigger === 'link_inactive' ? { days: Number(param) || 30 } : undefined;
    const a: Action = { type: action, params: action === 'social_drafts' ? { channels } : action === 'add_tag' ? { tag: actionText || 'markiert' } : action === 'follow_up_task' ? { text: actionText || 'Nachfassen', days: '7' } : action === 'create_task' ? { text: actionText || 'Aufgabe zu {link}' } : undefined };
    const r: Rule = { id: uid(), name: name.trim() || `${TRIGGER_LABEL[trigger]} → ${ACTION_LABEL[action]}`, enabled: true, trigger, params, actions: [a], runs: 0 };
    update(w => ({ ...w, rules: [...w.rules, r] }));
    setName(''); setActionText('');
  };

  return (
    <div className="space-y-5">
      <div className={card}>
        <h3 className="text-sm font-semibold text-slate-100 mb-1">Fertige Automationen</h3>
        <p className="text-xs text-slate-400 mb-4">Ein Klick genügt. Sie laufen, wenn du Links anlegst, Provisionen einträgst oder den Hub öffnest.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RECIPES.map(rc => {
            const existing = ws.rules.find(r => r.name === rc.name);
            const locked = !pro && !FREE_RECIPES.includes(rc.key);
            return (
              <div key={rc.key} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> {rc.name} {locked && <ProPill />}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{rc.description}</p>
                  {existing && <div className="text-[10px] text-slate-500 mt-1">{existing.runs}× ausgeführt{existing.lastRun ? ` · zuletzt ${new Date(existing.lastRun).toLocaleDateString('de-DE')}` : ''}</div>}
                </div>
                <button
                  role="switch"
                  aria-checked={Boolean(existing?.enabled)}
                  aria-label={rc.name}
                  onClick={() =>
                    locked && !existing?.enabled ? auth?.openAccount('membership') : update(w =>
                      existing
                        ? { ...w, rules: w.rules.map(r => (r.id === existing.id ? { ...r, enabled: !r.enabled } : r)) }
                        : { ...w, rules: [...w.rules, rc.make()] },
                    )
                  }
                  className={`shrink-0 w-10 h-6 rounded-full relative transition-colors ${existing?.enabled ? 'bg-amber-400' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${existing?.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <form onSubmit={addCustom} className={`${card} space-y-3`}>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">Eigene Automation bauen {!pro && <ProPill />}</h3>
          {!pro && <UpgradeHint text="Eigene Regeln sind in Pro enthalten. Die fertigen Automationen kannst du kostenlos nutzen." />}
          <Field label="Wenn …" id="r-trigger">
            <select id="r-trigger" className={inputCls} value={trigger} onChange={e => setTrigger(e.target.value as TriggerType)}>
              {(Object.keys(TRIGGER_LABEL) as TriggerType[]).map(t => <option key={t} value={t}>{TRIGGER_LABEL[t]}</option>)}
            </select>
          </Field>
          {(trigger === 'clicks_threshold' || trigger === 'link_inactive') && (
            <Field label={trigger === 'clicks_threshold' ? 'Ab wie vielen Klicks?' : 'Nach wie vielen Tagen ohne Klick?'} id="r-param">
              <input id="r-param" type="number" className={inputCls} value={param} onChange={e => setParam(e.target.value)} />
            </Field>
          )}
          <Field label="… dann" id="r-action">
            <select id="r-action" className={inputCls} value={action} onChange={e => setAction(e.target.value as ActionType)}>
              {(Object.keys(ACTION_LABEL) as ActionType[]).map(a => <option key={a} value={a}>{ACTION_LABEL[a]}</option>)}
            </select>
          </Field>
          {action === 'social_drafts' && (
            <Field label="Kanäle" id="r-ch">
              <select id="r-ch" className={inputCls} value={channels} onChange={e => setChannels(e.target.value)}>
                {DRAFT_CHANNELS.map(c => <option key={c}>{c}</option>)}
                <option value={DRAFT_CHANNELS.join(',')}>Alle Kanäle</option>
              </select>
            </Field>
          )}
          {(action === 'create_task' || action === 'follow_up_task' || action === 'add_tag') && (
            <Field label={action === 'add_tag' ? 'Tag' : 'Aufgabentext ({link} = Name des Links)'} id="r-text">
              <input id="r-text" className={inputCls} value={actionText} onChange={e => setActionText(e.target.value)} placeholder={action === 'add_tag' ? 'z. B. prüfen' : 'z. B. Story zu {link} posten'} />
            </Field>
          )}
          <Field label="Name (optional)" id="r-name"><input id="r-name" className={inputCls} value={name} onChange={e => setName(e.target.value)} /></Field>
          <button type="submit" className={btnPrimary}><Plus className="w-3.5 h-3.5" /> Automation anlegen</button>
        </form>

        <div className={`${card} space-y-3`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">Deine Automationen ({ws.rules.length})</h3>
            <button className={btnGhost} onClick={() => update(w => w, () => ({ type: 'weekly' }))}><Play className="w-3.5 h-3.5" /> Wochen-Regeln jetzt ausführen</button>
          </div>
          {ws.rules.length === 0 && <p className="text-xs text-slate-500">Keine Automationen aktiv.</p>}
          {ws.rules.map(r => (
            <div key={r.id} className="flex items-center justify-between gap-3 border-b border-slate-800/70 last:border-0 pb-2.5">
              <div className="min-w-0">
                <div className={`text-xs font-semibold ${r.enabled ? 'text-slate-100' : 'text-slate-500'}`}>{r.name}</div>
                <div className="text-[11px] text-slate-500">{TRIGGER_LABEL[r.trigger]}{r.params?.threshold ? ` (${r.params.threshold})` : ''}{r.params?.days ? ` (${r.params.days} Tage)` : ''} → {r.actions.map(a => ACTION_LABEL[a.type]).join(', ')}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Pill tone={r.enabled ? 'ok' : 'muted'}>{r.enabled ? 'an' : 'aus'}</Pill>
                <button className="text-xs text-slate-400 hover:text-slate-100" onClick={() => update(w => ({ ...w, rules: w.rules.map(x => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)) }))}>{r.enabled ? 'Aus' : 'An'}</button>
                <button className="text-slate-500 hover:text-rose-300" onClick={() => update(w => ({ ...w, rules: w.rules.filter(x => x.id !== r.id) }))} aria-label={`${r.name} löschen`}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={card}>
        <h3 className="text-sm font-semibold text-slate-100 mb-3">Protokoll</h3>
        {ws.log.length === 0 ? <p className="text-xs text-slate-500">Noch keine automatischen Aktionen.</p> : (
          <ul className="space-y-1.5 max-h-72 overflow-y-auto">
            {ws.log.map((l, i) => (
              <li key={i} className="text-xs flex gap-3"><span className="text-slate-500 font-mono whitespace-nowrap">{new Date(l.at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</span><span className="text-slate-300">{l.text} <span className="text-slate-500">· {l.rule}</span></span></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// ---------- Entwürfe ----------
const Drafts: React.FC<TabProps> = ({ ws, update, shortUrl }) => {
  const auth = useAuth();
  const pro = isPro(auth?.user);
  const [linkId, setLinkId] = useState(ws.links[0]?.id || '');
  const [channel, setChannel] = useState(DRAFT_CHANNELS[0]);
  const [ai, setAi] = useState<'idle' | 'busy' | string>('idle');
  const create = () => {
    const l = ws.links.find(x => x.id === linkId);
    if (!l) return;
    const d: Draft = { id: uid(), channel, text: draftText(channel, l, ws.settings, shortUrl(l)), linkId: l.id, createdAt: new Date().toISOString(), source: 'manuell' };
    update(w => ({ ...w, drafts: [d, ...w.drafts] }));
  };
  const createAi = async () => {
    if (!pro) { auth?.openAccount('membership'); return; }
    const l = ws.links.find(x => x.id === linkId);
    if (!l) return;
    setAi('busy');
    try {
      const r = await fetch('/api/gemini/generate-marketing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ productName: l.title, channel: channel.toLowerCase(), targetAudience: ws.settings.niche || 'Interessierte in Deutschland' }) });
      const j = await r.json();
      if (!j.success) throw new Error(j.error);
      const dd = j.data || {};
      const text = `${dd.hook || ''}\n\n${dd.scriptOrBody || ''}\n\n${dd.callToAction || ''} ${shortUrl(l)}\n\n${disclosureLine(ws.settings, l)}\n${(dd.hashtags || []).join(' ')}`.trim();
      update(w => ({ ...w, drafts: [{ id: uid(), channel, text, linkId: l.id, createdAt: new Date().toISOString(), source: String(j.source || '').startsWith('gemini') ? 'KI (Gemini)' : 'Vorlage (ohne KI-Schlüssel)' }, ...w.drafts] }));
      setAi('idle');
    } catch (e: any) {
      setAi(e?.message || 'KI nicht verfügbar');
    }
  };
  return (
    <div className="space-y-5">
      <div className={`${card} flex flex-wrap items-end gap-3`}>
        <Field label="Link" id="d-link">
          <select id="d-link" className={inputCls} value={linkId} onChange={e => setLinkId(e.target.value)}>
            {ws.links.length === 0 && <option value="">Erst einen Link anlegen</option>}
            {ws.links.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </Field>
        <Field label="Kanal" id="d-channel">
          <select id="d-channel" className={inputCls} value={channel} onChange={e => setChannel(e.target.value)}>
            {DRAFT_CHANNELS.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <button className={btnPrimary} onClick={create} disabled={!linkId}><Plus className="w-3.5 h-3.5" /> Vorlage erstellen</button>
        <button className={btnGhost} onClick={createAi} disabled={!linkId || ai === 'busy'}>{ai === 'busy' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />} Mit KI schreiben {!pro && <ProPill />}</button>
        {ai !== 'idle' && ai !== 'busy' && <span className="text-xs text-rose-300">{ai}</span>}
      </div>
      {ws.drafts.length === 0 && <Empty text="Noch keine Entwürfe. Sie entstehen automatisch, sobald du einen Link anlegst." />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {ws.drafts.map(d => (
          <div key={d.id} className={`${card} !p-4 space-y-2 min-w-0`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2"><Pill tone={d.channel === 'Bericht' ? 'accent' : 'warn'}>{d.channel}</Pill><span className="text-[11px] text-slate-500">{d.source} · {new Date(d.createdAt).toLocaleDateString('de-DE')}</span></div>
              <div className="flex gap-2">
                <CopyBtn text={d.text} />
                <button className={btnGhost} onClick={() => update(w => ({ ...w, drafts: w.drafts.filter(x => x.id !== d.id) }))} aria-label="Entwurf löschen"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <textarea
              aria-label={`Entwurf ${d.channel}`}
              className={`${inputCls} font-mono text-xs min-h-[160px]`}
              value={d.text}
              onChange={e => update(w => ({ ...w, drafts: w.drafts.map(x => (x.id === d.id ? { ...x, text: e.target.value } : x)) }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Aufgaben ----------
const Tasks: React.FC<TabProps> = ({ ws, update }) => {
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [showDone, setShowDone] = useState(false);
  const list = ws.tasks.filter(t => showDone || !t.done).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const t: Task = { id: uid(), text: text.trim(), due: due || undefined, done: false, createdAt: new Date().toISOString(), source: 'manuell' };
    update(w => ({ ...w, tasks: [t, ...w.tasks] }));
    setText(''); setDue('');
  };
  return (
    <div className="max-w-3xl space-y-4">
      <form onSubmit={add} className={`${card} flex flex-wrap gap-3 items-end`}>
        <div className="flex-1 min-w-[200px]"><Field label="Neue Aufgabe" id="t-text"><input id="t-text" className={inputCls} value={text} onChange={e => setText(e.target.value)} placeholder="z. B. Reel zu Massagepistole drehen" /></Field></div>
        <Field label="Fällig" id="t-due"><input id="t-due" type="date" className={inputCls} value={due} onChange={e => setDue(e.target.value)} /></Field>
        <button className={btnPrimary} type="submit"><Plus className="w-3.5 h-3.5" /> Hinzufügen</button>
      </form>
      <label className="flex items-center gap-2 text-xs text-slate-400" htmlFor="t-showdone"><input id="t-showdone" type="checkbox" className="accent-amber-400" checked={showDone} onChange={e => setShowDone(e.target.checked)} /> Erledigte anzeigen</label>
      {list.length === 0 && <Empty text="Keine offenen Aufgaben." />}
      <ul className="space-y-2">
        {list.map(t => {
          const overdue = t.due && !t.done && t.due < today();
          return (
            <li key={t.id} className={`${card} !p-3 flex items-start gap-3`}>
              <input type="checkbox" aria-label={t.text} className="mt-0.5 w-4 h-4 accent-amber-400" checked={t.done} onChange={() => update(w => ({ ...w, tasks: w.tasks.map(x => (x.id === t.id ? { ...x, done: !x.done } : x)) }))} />
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${t.done ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{t.text}</div>
                <div className="text-[11px] text-slate-500 flex gap-2 flex-wrap">{t.due && <span className={overdue ? 'text-rose-300' : ''}>fällig {new Date(t.due).toLocaleDateString('de-DE')}{overdue ? ' · überfällig' : ''}</span>}<span>{t.source}</span></div>
              </div>
              <button className="text-slate-500 hover:text-rose-300" onClick={() => update(w => ({ ...w, tasks: w.tasks.filter(x => x.id !== t.id) }))} aria-label="Aufgabe löschen"><Trash2 className="w-3.5 h-3.5" /></button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ---------- Rechtliches ----------
const Legal: React.FC<TabProps> = ({ ws, update }) => {
  const legal = ws.settings.legal || {};
  const done = LEGAL_CHECKLIST.filter(c => legal[c.title]).length;
  return (
    <div className="max-w-3xl space-y-4">
      <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Allgemeine Hinweise für Deutschland, keine Rechtsberatung. {done} von {LEGAL_CHECKLIST.length} Punkten erledigt.</span>
      </div>
      {LEGAL_CHECKLIST.map(c => (
        <label key={c.title} htmlFor={`legal-${slugify(c.title)}`} className={`${card} !p-4 flex gap-3 cursor-pointer`}>
          <input id={`legal-${slugify(c.title)}`} type="checkbox" className="mt-0.5 w-4 h-4 accent-amber-400" checked={Boolean(legal[c.title])} onChange={e => update(w => ({ ...w, settings: { ...w.settings, legal: { ...(w.settings.legal || {}), [c.title]: e.target.checked } } }))} />
          <span>
            <span className="block text-sm font-semibold text-slate-100">{c.title}</span>
            <span className="block text-xs text-slate-400 mt-0.5">{c.text}</span>
          </span>
        </label>
      ))}
      <div className={`${card} space-y-2`}>
        <h3 className="text-sm font-semibold text-slate-100">Fertige Hinweistexte</h3>
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300">{disclosureLine(ws.settings)}</div>
        <div className="flex gap-2 flex-wrap"><CopyBtn text={disclosureLine(ws.settings)} label="Affiliate-Hinweis kopieren" /><CopyBtn text={AMAZON_NOTICE} label="Amazon-Hinweis kopieren" /></div>
      </div>
    </div>
  );
};

// ---------- Einstellungen ----------
const SettingsTab: React.FC<TabProps> = ({ ws, update, startTour }) => {
  const s = ws.settings;
  const set = (patch: Partial<typeof s>) => update(w => ({ ...w, settings: { ...w.settings, ...patch } }));
  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
      <div className={`${card} space-y-3`}>
        <h3 className="text-sm font-semibold text-slate-100">Profil & Texte</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Anzeigename" id="s-name"><input id="s-name" className={inputCls} value={s.displayName} onChange={e => set({ displayName: e.target.value })} /></Field>
          <Field label="Deine Nische" id="s-niche"><input id="s-niche" className={inputCls} value={s.niche} onChange={e => set({ niche: e.target.value })} placeholder="z. B. Home-Fitness" /></Field>
          <Field label="Kennzeichnung" id="s-disc">
            <select id="s-disc" className={inputCls} value={s.disclosure} onChange={e => set({ disclosure: e.target.value })}>
              <option>Anzeige</option><option>Werbung</option>
            </select>
          </Field>
          <Field label="SubID-Parameter deines Netzwerks" id="s-sub"><input id="s-sub" className={inputCls} value={s.subIdParam} onChange={e => set({ subIdParam: e.target.value.replace(/[^\w-]/g, '') })} placeholder="subid" /></Field>
        </div>
        <label htmlFor="s-amazon" className="flex items-center gap-2 text-xs text-slate-300"><input id="s-amazon" type="checkbox" className="accent-amber-400" checked={s.amazonNotice} onChange={e => set({ amazonNotice: e.target.checked })} /> Amazon-Pflichthinweis automatisch bei Amazon-Links einfügen</label>
        <label htmlFor="s-tips" className="flex items-center gap-2 text-xs text-slate-300"><input id="s-tips" type="checkbox" className="accent-amber-400" checked={!s.hideTips} onChange={e => set({ hideTips: !e.target.checked })} /> Hilfetexte in jedem Bereich anzeigen</label>
        <button type="button" className={btnGhost} onClick={startTour}><GraduationCap className="w-3.5 h-3.5" /> Tour erneut starten</button>
        <p className="text-[11px] text-slate-500">Der SubID-Name unterscheidet sich je Netzwerk (z. B. „clickref“ bei AWIN). Er steht in der Hilfe deines Netzwerks.</p>
      </div>

      <div className={`${card} space-y-3`}>
        <h3 className="text-sm font-semibold text-slate-100">Sicherung</h3>
        <CopyBtn text={JSON.stringify(ws)} label="Alle Daten kopieren (Sicherung)" />
        <Field label="Sicherung einfügen und wiederherstellen" id="s-import"><textarea id="s-import" rows={3} className={`${inputCls} font-mono text-xs`} value={importText} onChange={e => setImportText(e.target.value)} placeholder='{"version":1,…}' /></Field>
        <div className="flex gap-2 flex-wrap">
          <button className={btnGhost} onClick={() => {
            try {
              const w = JSON.parse(importText);
              if (w?.version !== 1 || !Array.isArray(w.links)) throw new Error();
              update(() => w);
              setMsg('Wiederhergestellt.');
              setImportText('');
            } catch {
              setMsg('Das ist keine gültige Sicherung.');
            }
          }}>Wiederherstellen</button>
          {!confirmReset ? (
            <button className={`${btnGhost} hover:!text-rose-300`} onClick={() => setConfirmReset(true)}>Alles zurücksetzen</button>
          ) : (
            <>
              <button className="px-2.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg" onClick={() => { update(w => emptyWorkspace(w.settings.displayName)); setConfirmReset(false); setMsg('Zurückgesetzt.'); }}>Ja, alles löschen</button>
              <button className={btnGhost} onClick={() => setConfirmReset(false)}>Abbrechen</button>
            </>
          )}
        </div>
        {msg && <p className="text-xs text-slate-400">{msg}</p>}
      </div>
    </div>
  );
};
