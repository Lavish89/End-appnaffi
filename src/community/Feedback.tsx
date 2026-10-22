import React, { useEffect, useState } from 'react';
import { MessageSquareHeart, X, Star, Loader2, Bell, CheckCheck } from 'lucide-react';
import { FEEDBACK_TYPES, Feedback } from './shared';
import { getJson, postJson, timeAgo, ui } from './api';

export const FeedbackModal: React.FC<{ onClose: () => void; page?: string }> = ({ onClose, page }) => {
  const [type, setType] = useState<string>('Idee');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [mine, setMine] = useState<Feedback[]>([]);
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = () => getJson('/api/feedback/mine').then(d => setMine(d.feedback)).catch(() => {});
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await postJson('/api/feedback', { type, rating: rating || undefined, text, page });
      setSent(true);
      setText('');
      setRating(0);
      load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[60] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="fb-title">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="fb-title" className="text-base font-bold text-slate-100 flex items-center gap-2"><MessageSquareHeart className="w-5 h-5 text-amber-400" /> Feedback geben</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white" aria-label="Schließen"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Art des Feedbacks">
            {FEEDBACK_TYPES.map(t => (
              <button type="button" role="radio" aria-checked={type === t} key={t} onClick={() => setType(t)} className={`px-3 py-1.5 text-xs rounded-full border ${type === t ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}>{t}</button>
            ))}
          </div>
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Wie zufrieden bist du?">
            <span className="text-xs text-slate-400 mr-2">Wie zufrieden bist du?</span>
            {[1, 2, 3, 4, 5].map(i => (
              <button type="button" key={i} role="radio" aria-checked={rating === i} aria-label={`${i} Sterne`} onClick={() => setRating(i)} className="p-0.5">
                <Star className={`w-5 h-5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>
          <label htmlFor="fb-text" className="block space-y-1">
            <span className="text-xs text-slate-400">{type === 'Fehler' ? 'Was ist passiert? Wo? Was hast du erwartet?' : type === 'Idee' ? 'Was wünschst du dir?' : 'Deine Nachricht'}</span>
            <textarea id="fb-text" rows={5} className={ui.input} value={text} onChange={e => setText(e.target.value)} maxLength={3000} />
          </label>
          {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
          {sent && <p role="status" className="text-xs text-emerald-300">Danke! Dein Feedback ist angekommen. Du bekommst eine Benachrichtigung, wenn wir antworten.</p>}
          <button type="submit" disabled={busy} className={ui.primary}>{busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Feedback senden</button>
        </form>
        {mine.length > 0 && (
          <div className="space-y-2 border-t border-slate-800 pt-4">
            <h3 className="text-sm font-semibold text-slate-100">Dein bisheriges Feedback</h3>
            {mine.map(f => (
              <div key={f.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px]"><span className="text-slate-400">{f.type} · {timeAgo(f.at)}</span><span className="text-amber-300">{f.status}</span></div>
                <p className="text-xs text-slate-300 whitespace-pre-wrap">{f.text}</p>
                {f.reply && <p className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">Antwort: {f.reply}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface Notif { id: string; at: string; type: string; text: string; tab?: string; read?: boolean }

export function useNotifications() {
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const load = () => getJson('/api/me/notifications').then(d => { setItems(d.notifications); setUnread(d.unread); }).catch(() => {});
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);
  const markRead = async () => { await postJson('/api/me/notifications/read').catch(() => {}); load(); };
  return { items, unread, load, markRead };
}

export const NotificationBell: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { items, unread, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative w-8 h-8 rounded-full bg-slate-900 border border-slate-700 hover:border-amber-400/60 flex items-center justify-center text-slate-300" aria-label={`Benachrichtigungen${unread ? `, ${unread} ungelesen` : ''}`} aria-expanded={open}>
        <Bell className="w-4 h-4" />
        {unread > 0 && <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
            <span className="text-sm font-semibold text-slate-100">Benachrichtigungen</span>
            {unread > 0 && <button onClick={markRead} className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1"><CheckCheck className="w-3.5 h-3.5" /> Alle gelesen</button>}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 && <li className="p-4 text-xs text-slate-500 text-center">Keine Benachrichtigungen.</li>}
            {items.slice(0, 30).map(n => (
              <li key={n.id}>
                <button onClick={() => { setOpen(false); if (n.tab && onNavigate) onNavigate(n.tab); }} className={`w-full text-left px-3 py-2.5 border-b border-slate-800/60 text-xs hover:bg-slate-800/50 ${n.read ? 'text-slate-400' : 'text-slate-100'}`}>
                  <div className="flex gap-2">{!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />}<span>{n.type === 'announcement' ? '📢 ' : ''}{n.text}</span></div>
                  <div className="text-[10px] text-slate-500 mt-0.5 pl-3.5">{timeAgo(n.at)}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
