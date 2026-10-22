import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, Info, ArrowRight, MessageSquareHeart, Hash, Briefcase, Lightbulb, Bell } from 'lucide-react';
import { useAuth, isPro } from '../auth/AuthGate';
import { getJson, timeAgo, ui } from './api';
import { Wheel } from './Wheel';
import { FeedbackModal, useNotifications } from './Feedback';
import { LESSONS } from '../affiliate/tutorials';
import { FREE_LINK_LIMIT } from '../billing/plans';
import { today } from '../affiliate/engine';

export type MainTab = 'home' | 'hub' | 'community' | 'jobs' | 'toolkit';
interface Props { onNavigate: (tab: MainTab, hubTab?: string) => void }

interface Alert { tone: 'warn' | 'info' | 'ok'; text: string; action?: { label: string; go: () => void } }
interface Suggestion { title: string; text: string; cta: string; go: () => void }

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const auth = useAuth();
  const user = auth!.user;
  const [ws, setWs] = useState<any>(null);
  const [latestMsgs, setLatestMsgs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { items: notifications, unread, markRead } = useNotifications();

  useEffect(() => {
    getJson('/api/me/workspace').then(d => setWs(d.workspace)).catch(() => {});
    getJson('/api/community/messages?channel=allgemein').then(d => setLatestMsgs(d.messages.slice(-3).reverse())).catch(() => {});
    getJson('/api/jobs').then(d => setJobs(d.jobs.filter((j: any) => j.status === 'open' && j.ownerId !== user.id))).catch(() => {});
  }, [user.id]);

  const pro = isPro(user);
  const links = ws?.links?.length || 0;
  const openTasks = (ws?.tasks || []).filter((t: any) => !t.done);
  const overdue = openTasks.filter((t: any) => t.due && t.due < today());
  const lessonsDone = Object.values(ws?.settings?.lessonsDone || {}).filter(Boolean).length;
  const nextLesson = LESSONS.find(l => !ws?.settings?.lessonsDone?.[l.id]);
  const niche = (user.profile?.niche || ws?.settings?.niche || '').toLowerCase();
  const nicheJobs = niche ? jobs.filter(j => `${j.niche} ${j.title} ${j.description}`.toLowerCase().includes(niche.split(/[ ,]/)[0])) : [];
  const firstName = user.profile?.firstName || user.name.split(' ')[0];

  // ---------- Hinweise (Alerts) ----------
  const alerts: Alert[] = [];
  if (user.planStatus === 'past_due') alerts.push({ tone: 'warn', text: 'Deine letzte Zahlung ist fehlgeschlagen. Bitte prüfe deine Zahlungsmethode, damit Pro aktiv bleibt.', action: { label: 'Prüfen', go: () => auth!.openAccount('membership') } });
  if (user.planStatus === 'canceling' && user.planRenewsAt) alerts.push({ tone: 'info', text: `Dein Pro-Abo ist gekündigt und läuft am ${new Date(user.planRenewsAt).toLocaleDateString('de-DE')} aus.`, action: { label: 'Verwalten', go: () => auth!.openAccount('membership') } });
  if (user.bonusProUntil && new Date(user.bonusProUntil).getTime() > Date.now() && user.plan !== 'pro' && user.role !== 'owner') alerts.push({ tone: 'ok', text: `Glücksrad-Bonus: Pro ist bis ${new Date(user.bonusProUntil).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })} aktiv.` });
  if (overdue.length) alerts.push({ tone: 'warn', text: `${overdue.length} Aufgabe${overdue.length > 1 ? 'n sind' : ' ist'} überfällig.`, action: { label: 'Ansehen', go: () => onNavigate('hub', 'tasks') } });
  if (!pro && links >= FREE_LINK_LIMIT - 2) alerts.push({ tone: links >= FREE_LINK_LIMIT ? 'warn' : 'info', text: `Du nutzt ${links} von ${FREE_LINK_LIMIT} Links im Free-Plan.`, action: { label: 'Pro ansehen', go: () => auth!.openAccount('membership') } });
  if ((ws?.drafts || []).length >= 3) alerts.push({ tone: 'info', text: `${ws.drafts.length} Entwürfe warten darauf, gepostet zu werden.`, action: { label: 'Zu den Entwürfen', go: () => onNavigate('hub', 'drafts') } });

  // ---------- Vorschlaege ----------
  const sug: Suggestion[] = [];
  if (!ws?.programs?.length) sug.push({ title: 'Erstes Partnerprogramm', text: 'Wähle ein Netzwerk aus dem Verzeichnis und melde dich an.', cta: 'Programme', go: () => onNavigate('hub', 'programs') });
  if (!links) sug.push({ title: 'Ersten Link anlegen', text: 'Füg deinen Affiliate-Link ein – die Automationen erstellen sofort Post-Entwürfe.', cta: 'Link anlegen', go: () => onNavigate('hub', 'links') });
  if (nextLesson) sug.push({ title: `Lektion: ${nextLesson.title}`, text: `${lessonsDone} von ${LESSONS.length} Lektionen geschafft. Dauer: ${nextLesson.minutes} Min.`, cta: 'Lernen', go: () => onNavigate('hub', 'learn') });
  if (!user.profile?.niche) sug.push({ title: 'Nische eintragen', text: 'Dann bekommst du passende Jobs und bessere Textvorschläge.', cta: 'Profil', go: () => auth!.openAccount('profile') });
  if (nicheJobs.length) sug.push({ title: `${nicheJobs.length} Job${nicheJobs.length > 1 ? 's' : ''} in deiner Nische`, text: nicheJobs.slice(0, 2).map(j => j.title).join(' · '), cta: 'Jobs ansehen', go: () => onNavigate('jobs') });
  else if (jobs.length) sug.push({ title: `${jobs.length} offene Jobs`, text: 'Kooperationen, UGC-Aufträge und Affiliate-Partnerschaften.', cta: 'Jobbörse', go: () => onNavigate('jobs') });
  sug.push({ title: 'Stell dich vor', text: 'Sag in der Community kurz Hallo und woran du arbeitest.', cta: 'Community', go: () => onNavigate('community') });
  sug.push({ title: 'Neues Werkzeug ausprobieren', text: 'Zum Beispiel den Kooperationspreis-Rechner oder den Bio-Generator.', cta: 'Toolkit', go: () => onNavigate('toolkit') });
  if (!pro) sug.push({ title: 'Pro freischalten', text: 'Unbegrenzte Links, KI-Texte und eigene Automationen.', cta: 'Pro ansehen', go: () => auth!.openAccount('membership') });

  const tone = { warn: 'border-amber-500/40 bg-amber-500/10 text-amber-100', info: 'border-sky-500/30 bg-sky-500/10 text-sky-100', ok: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100' };
  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Hallo' : 'Guten Abend';

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400">Start</div>
          <h2 className="text-2xl font-bold text-slate-100">{greet}, {firstName}!</h2>
          <p className="text-xs text-slate-400 mt-1">Hier siehst du, was heute wichtig ist und was du als Nächstes tun kannst.</p>
        </div>
        <button onClick={() => setFeedbackOpen(true)} className={ui.ghost}><MessageSquareHeart className="w-3.5 h-3.5 text-amber-400" /> Feedback geben</button>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2" aria-label="Hinweise">
          {alerts.map((a, i) => (
            <div key={i} className={`flex flex-wrap items-center gap-2 border rounded-xl px-3.5 py-2.5 text-sm ${tone[a.tone]}`}>
              {a.tone === 'warn' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
              <span className="flex-1 min-w-[180px]">{a.text}</span>
              {a.action && <button onClick={a.action.go} className="text-xs font-semibold underline">{a.action.label}</button>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <div className={ui.card}>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-amber-400" /> Vorschläge für dich</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sug.slice(0, 6).map(s => (
                <button key={s.title} onClick={s.go} className="text-left bg-slate-950/60 border border-slate-800 hover:border-amber-400/40 rounded-xl p-3.5 space-y-1 transition-colors">
                  <div className="text-sm font-semibold text-slate-100">{s.title}</div>
                  <div className="text-xs text-slate-400">{s.text}</div>
                  <div className="text-xs text-amber-300 font-semibold flex items-center gap-1 pt-1">{s.cta} <ArrowRight className="w-3 h-3" /></div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={ui.card}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2"><Hash className="w-4 h-4 text-amber-400" /> Community</h3>
                <button onClick={() => onNavigate('community')} className="text-xs text-amber-300">Öffnen</button>
              </div>
              {latestMsgs.length === 0 ? <p className="text-xs text-slate-500">Noch ruhig hier – schreib die erste Nachricht!</p> : (
                <ul className="space-y-2.5">{latestMsgs.map(m => <li key={m.id} className="text-xs"><span className="font-semibold text-slate-200">{m.name}</span> <span className="text-slate-500">· {timeAgo(m.at)}</span><p className="text-slate-400 line-clamp-2">{m.text}</p></li>)}</ul>
              )}
            </div>
            <div className={ui.card}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2"><Briefcase className="w-4 h-4 text-amber-400" /> Neue Jobs</h3>
                <button onClick={() => onNavigate('jobs')} className="text-xs text-amber-300">Alle Jobs</button>
              </div>
              {jobs.length === 0 ? <p className="text-xs text-slate-500">Noch keine offenen Jobs. Du kannst selbst einen einstellen.</p> : (
                <ul className="space-y-2.5">{jobs.slice(0, 3).map(j => <li key={j.id} className="text-xs"><span className="font-semibold text-slate-200">{j.title}</span><p className="text-slate-500">{j.type}{j.budget ? ` · ${j.budget}` : ''} · {timeAgo(j.createdAt)}</p></li>)}</ul>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <Wheel compact />
          <div className={ui.card}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2"><Bell className="w-4 h-4 text-amber-400" /> Benachrichtigungen {unread > 0 && <span className="text-[10px] bg-amber-400 text-slate-950 rounded px-1.5 font-bold">{unread}</span>}</h3>
              {unread > 0 && <button onClick={markRead} className="text-xs text-amber-300">Alle gelesen</button>}
            </div>
            {notifications.length === 0 ? <p className="text-xs text-slate-500">Nichts Neues.</p> : (
              <ul className="space-y-2">{notifications.slice(0, 5).map(n => <li key={n.id} className={`text-xs ${n.read ? 'text-slate-500' : 'text-slate-200'}`}>{n.type === 'announcement' ? '📢 ' : ''}{n.text} <span className="text-slate-600">· {timeAgo(n.at)}</span></li>)}</ul>
            )}
          </div>
          {!pro && (
            <button onClick={() => auth!.openAccount('membership')} className="w-full text-left bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-5 text-slate-950 space-y-1">
              <div className="text-sm font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Mehr mit Pro</div>
              <div className="text-xs">Unbegrenzte Links, KI-Texte, eigene Automationen und Link-Prüfung.</div>
            </button>
          )}
        </div>
      </div>
      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} page="Start" />}
    </div>
  );
};
