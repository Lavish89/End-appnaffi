import React, { useEffect, useRef, useState } from 'react';
import { Hash, Send, Flag, Trash2, Users, ShieldCheck, Loader2 } from 'lucide-react';
import { CHANNELS, COMMUNITY_RULES } from './shared';
import { getJson, postJson, timeAgo, ui } from './api';
import { useAuth } from '../auth/AuthGate';

interface Msg { id: string; channel: string; userId: string; name: string; role: 'owner' | 'member'; text: string; at: string; reported?: boolean; hidden?: boolean; reportCount?: number }

const initials = (n: string) => n.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
const linkify = (t: string) => t.split(/(https?:\/\/\S+)/g).map((p, i) => (/^https?:\/\//.test(p) ? <a key={i} href={p} target="_blank" rel="noreferrer noopener nofollow" className="text-amber-300 underline break-all">{p}</a> : <React.Fragment key={i}>{p}</React.Fragment>));

export const CommunityPage: React.FC = () => {
  const auth = useAuth();
  const [channel, setChannel] = useState<string>(CHANNELS[0].id);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const test = Boolean((window as any).__GF_TEST__);

  const load = async (scroll = false) => {
    try {
      const d = await getJson(`/api/community/messages?channel=${channel}`);
      setMsgs(d.messages);
      setCounts(d.counts);
      if (scroll) requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setLoading(true);
    load(true);
    const t = setInterval(() => load(false), 5000);
    return () => clearInterval(t);
  }, [channel]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setErr('');
    setSending(true);
    try {
      await postJson('/api/community/messages', { channel, text });
      setText('');
      await load(true);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSending(false);
    }
  };
  const act = async (url: string, id: string) => { try { await postJson(url, { id }); await load(); } catch (e: any) { setErr(e.message); } };
  const ch = CHANNELS.find(c => c.id === channel)!;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400">Community</div>
        <h2 className="text-xl font-bold text-slate-100">Austausch mit anderen Creatorn</h2>
        <p className="text-xs text-slate-400 mt-1">Fragen stellen, Erfolge teilen, Feedback zu Inhalten bekommen. Erwähne jemanden mit @Vorname.</p>
      </div>
      {test && <p className="text-xs text-sky-200 bg-sky-500/10 border border-sky-500/30 rounded-xl px-4 py-2.5">Testversion: Nachrichten bleiben nur in diesem Browser. Leg ein zweites Konto an, um den Austausch zu testen.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        <aside className="space-y-3">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto" aria-label="Kanäle">
            {CHANNELS.map(c => (
              <button key={c.id} onClick={() => setChannel(c.id)} aria-current={channel === c.id}
                className={`flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg whitespace-nowrap ${channel === c.id ? 'bg-amber-400/10 text-amber-200 border border-amber-400/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'}`}>
                <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />{c.name}</span>
                <span className="text-[10px] font-mono text-slate-500">{counts[c.id] ?? ''}</span>
              </button>
            ))}
          </nav>
          <div className="hidden lg:block bg-slate-900/40 border border-slate-800 rounded-xl p-3 space-y-1.5">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Regeln</div>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">{COMMUNITY_RULES.map(r => <li key={r}>{r}</li>)}</ul>
          </div>
        </aside>

        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col min-h-[60vh] min-w-0">
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5"><Hash className="w-4 h-4 text-amber-400" />{ch.name}</div>
            <div className="text-[11px] text-slate-500">{ch.description}</div>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]" aria-live="polite">
            {loading && <div className="flex justify-center py-8 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /></div>}
            {!loading && msgs.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm text-slate-400">Noch keine Nachrichten in #{ch.name}.</p>
                <p className="text-xs text-slate-500">Schreib die erste – zum Beispiel, woran du gerade arbeitest.</p>
              </div>
            )}
            {msgs.map(m => {
              const own = m.userId === auth?.user.id;
              return (
                <div key={m.id} className={`flex gap-3 group ${m.hidden ? 'opacity-50' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${m.role === 'owner' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>{initials(m.name)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-100">{m.name}</span>
                      {m.role === 'owner' && <span className="text-[9px] font-bold uppercase px-1 rounded bg-amber-400/20 text-amber-300">Team</span>}
                      <span className="text-[11px] text-slate-500">{timeAgo(m.at)}</span>
                      {m.hidden && <span className="text-[10px] text-rose-300">ausgeblendet (gemeldet)</span>}
                      {m.reportCount ? <span className="text-[10px] text-rose-300">{m.reportCount}× gemeldet</span> : null}
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">{linkify(m.text)}</p>
                  </div>
                  <div className="flex items-start gap-1 opacity-70 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {(own || auth?.user.role === 'owner') && <button onClick={() => act('/api/community/messages/delete', m.id)} className="p-1 text-slate-500 hover:text-rose-300" aria-label="Nachricht löschen"><Trash2 className="w-3.5 h-3.5" /></button>}
                    {!own && <button onClick={() => act('/api/community/messages/report', m.id)} disabled={m.reported} className="p-1 text-slate-500 hover:text-amber-300 disabled:text-amber-500" aria-label={m.reported ? 'Gemeldet' : 'Nachricht melden'} title={m.reported ? 'Gemeldet' : 'Melden'}><Flag className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={send} className="p-3 border-t border-slate-800 space-y-2">
            {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
            <div className="flex gap-2">
              <label htmlFor="chat-text" className="sr-only">Nachricht</label>
              <textarea id="chat-text" rows={1} value={text} maxLength={1000} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e as any); } }} placeholder={`Nachricht an #${ch.name} …`} className={`${ui.input} resize-none`} />
              <button type="submit" disabled={sending || !text.trim()} className={`${ui.primary} !px-3`} aria-label="Senden">{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
            </div>
            <div className="text-[10px] text-slate-500 text-right">{text.length}/1000 · Enter zum Senden, Shift+Enter für neue Zeile</div>
          </form>
        </section>
      </div>
    </div>
  );
};
