import React, { useEffect, useState } from 'react';
import { MessageSquareHeart, Flag, Megaphone, Trash2, Check, Star, Loader2 } from 'lucide-react';
import { Feedback, FeedbackStatus, Announcement } from './shared';
import { getJson, postJson, timeAgo, ui } from './api';

// Admin: Feedback beantworten, gemeldete Inhalte moderieren, Ankuendigungen an alle schicken.
export const AdminCommunity: React.FC = () => {
  const [fb, setFb] = useState<{ feedback: Feedback[]; summary: { total: number; open: number; avgRating: number | null } } | null>(null);
  const [mod, setMod] = useState<{ messages: any[]; jobs: any[]; stats: { messages: number; jobs: number; openJobs: number }; announcements: Announcement[] } | null>(null);
  const [filter, setFilter] = useState<FeedbackStatus | 'alle'>('neu');
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [ann, setAnn] = useState('');
  const [msg, setMsg] = useState('');
  const load = () => {
    getJson('/api/admin/feedback').then(setFb).catch(e => setMsg(e.message));
    getJson('/api/admin/moderation').then(setMod).catch(e => setMsg(e.message));
  };
  useEffect(load, []);
  const act = async (url: string, body: unknown, ok: string) => { try { await postJson(url, body); setMsg(ok); load(); } catch (e: any) { setMsg(e.message); } };
  if (!fb || !mod) return <div className="flex justify-center py-16 text-slate-400"><Loader2 className="w-4 h-4 animate-spin" /></div>;
  const list = fb.feedback.filter(f => filter === 'alle' || f.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400">Admin</div>
        <h2 className="text-xl font-bold text-slate-100">Feedback & Community</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[['Feedback gesamt', fb.summary.total], ['Feedback offen', fb.summary.open], ['Ø Bewertung', fb.summary.avgRating ? fb.summary.avgRating.toFixed(1).replace('.', ',') + ' ★' : '–'], ['Chat-Nachrichten', mod.stats.messages], ['Offene Jobs', mod.stats.openJobs]].map(([l, v]) => (
          <div key={l as string} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5"><div className="text-[11px] text-slate-400">{l}</div><div className="text-xl font-bold text-slate-100 font-mono tabular-nums">{v}</div></div>
        ))}
      </div>
      {msg && <p role="status" className="text-xs text-emerald-300">{msg}</p>}

      <div className={`${ui.card} space-y-3`}>
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2"><Megaphone className="w-4 h-4 text-amber-400" /> Ankündigung an alle Nutzer</h3>
        <div className="flex gap-2">
          <label htmlFor="ann-text" className="sr-only">Ankündigung</label>
          <input id="ann-text" className={ui.input} value={ann} onChange={e => setAnn(e.target.value)} maxLength={500} placeholder="z. B. Neu: 100 weitere Werkzeuge im Toolkit!" />
          <button className={ui.primary} disabled={ann.trim().length < 5} onClick={async () => { await act('/api/admin/announce', { text: ann }, 'Ankündigung verschickt.'); setAnn(''); }}>Senden</button>
        </div>
        {mod.announcements.length > 0 && (
          <ul className="space-y-1.5">{mod.announcements.map(a => <li key={a.id} className="text-xs text-slate-300 flex items-center justify-between gap-2"><span>📢 {a.text} <span className="text-slate-500">· {timeAgo(a.at)}</span></span><button onClick={() => act('/api/admin/announce/delete', { id: a.id }, 'Ankündigung entfernt.')} className="text-slate-500 hover:text-rose-300" aria-label="Ankündigung entfernen"><Trash2 className="w-3.5 h-3.5" /></button></li>)}</ul>
        )}
      </div>

      <div className={`${ui.card} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2"><MessageSquareHeart className="w-4 h-4 text-amber-400" /> Feedback</h3>
          <div className="flex gap-1">{(['neu', 'geplant', 'erledigt', 'abgelehnt', 'alle'] as const).map(s => <button key={s} onClick={() => setFilter(s)} className={`px-2.5 py-1 text-[11px] rounded-lg ${filter === s ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800'}`}>{s}</button>)}</div>
        </div>
        {list.length === 0 && <p className="text-xs text-slate-500">Kein Feedback mit diesem Status.</p>}
        {list.map(f => (
          <div key={f.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-300 font-semibold">{f.type} · {f.name} <span className="text-slate-500 font-normal">({f.email}) · {timeAgo(f.at)}{f.page ? ` · ${f.page}` : ''}</span></span>
              {f.rating && <span className="text-amber-300 flex items-center gap-0.5">{Array.from({ length: f.rating }, (_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</span>}
            </div>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{f.text}</p>
            {f.reply && <p className="text-xs text-emerald-200">Deine Antwort: {f.reply}</p>}
            <div className="flex flex-wrap gap-2 items-center">
              <label htmlFor={`rep-${f.id}`} className="sr-only">Antwort</label>
              <input id={`rep-${f.id}`} className={`${ui.input} flex-1 min-w-[200px]`} value={replies[f.id] || ''} onChange={e => setReplies(r => ({ ...r, [f.id]: e.target.value }))} placeholder="Antwort (Nutzer bekommt eine Benachrichtigung)" />
              <select aria-label="Status" className={`${ui.input} !w-auto`} value={f.status} onChange={e => act('/api/admin/feedback/reply', { id: f.id, status: e.target.value }, 'Status geändert.')}>
                {['neu', 'geplant', 'erledigt', 'abgelehnt'].map(s => <option key={s}>{s}</option>)}
              </select>
              <button className={ui.primary} disabled={!replies[f.id]?.trim()} onClick={async () => { await act('/api/admin/feedback/reply', { id: f.id, reply: replies[f.id] }, 'Antwort gesendet.'); setReplies(r => ({ ...r, [f.id]: '' })); }}>Antworten</button>
            </div>
          </div>
        ))}
      </div>

      <div className={`${ui.card} space-y-3`}>
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2"><Flag className="w-4 h-4 text-rose-400" /> Gemeldete Inhalte</h3>
        {mod.messages.length + mod.jobs.length === 0 && <p className="text-xs text-slate-500">Nichts gemeldet. 👍</p>}
        {mod.messages.map(m => (
          <div key={m.id} className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-3 space-y-1.5">
            <div className="text-[11px] text-slate-400">Chat #{m.channel} · {m.name} · {timeAgo(m.at)} · <span className="text-rose-300">{m.reportCount}× gemeldet{m.hidden ? ' · ausgeblendet' : ''}</span></div>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">{m.text}</p>
            <div className="flex gap-2">
              <button className={`${ui.ghost} hover:!text-rose-300`} onClick={() => act('/api/admin/moderation/resolve', { kind: 'message', id: m.id, action: 'delete' }, 'Nachricht gelöscht.')}><Trash2 className="w-3.5 h-3.5" /> Löschen</button>
              <button className={ui.ghost} onClick={() => act('/api/admin/moderation/resolve', { kind: 'message', id: m.id, action: 'dismiss' }, 'Meldung verworfen.')}><Check className="w-3.5 h-3.5" /> In Ordnung</button>
            </div>
          </div>
        ))}
        {mod.jobs.map(j => (
          <div key={j.id} className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-3 space-y-1.5">
            <div className="text-[11px] text-slate-400">Job · {j.ownerName} · {timeAgo(j.createdAt)} · <span className="text-rose-300">{j.reportCount}× gemeldet{j.hidden ? ' · ausgeblendet' : ''}</span></div>
            <p className="text-sm font-semibold text-slate-200">{j.title}</p>
            <p className="text-xs text-slate-400 line-clamp-3">{j.description}</p>
            <div className="flex gap-2">
              <button className={`${ui.ghost} hover:!text-rose-300`} onClick={() => act('/api/admin/moderation/resolve', { kind: 'job', id: j.id, action: 'delete' }, 'Job gelöscht.')}><Trash2 className="w-3.5 h-3.5" /> Löschen</button>
              <button className={ui.ghost} onClick={() => act('/api/admin/moderation/resolve', { kind: 'job', id: j.id, action: 'dismiss' }, 'Meldung verworfen.')}><Check className="w-3.5 h-3.5" /> In Ordnung</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
