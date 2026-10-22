import React, { useEffect, useState } from 'react';
import { Mail, X } from 'lucide-react';

// Nur Testversion: zeigt die E-Mails, die die App verschicken wuerde (Willkommen, Danke, Kuendigung, Passwort).
interface Entry { at: string; to: string; subject: string; text: string; kind: string }
const KEY = 'gf_test_outbox';
const read = (): Entry[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

export const TestInbox: React.FC = () => {
  const [mails, setMails] = useState<Entry[]>(read);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const [fresh, setFresh] = useState(0);
  useEffect(() => {
    const on = () => { setMails(read()); setFresh(n => n + 1); setSel(0); };
    window.addEventListener('gf-test-mail', on);
    return () => window.removeEventListener('gf-test-mail', on);
  }, []);

  const renderText = (t: string) =>
    t.split(/(\S+\?reset=[a-f0-9]+|https?:\/\/\S+)/g).map((part, i) => {
      const reset = part.match(/\?reset=([a-f0-9]+)/);
      if (reset) return <button key={i} onClick={() => { window.dispatchEvent(new CustomEvent('gf-open-reset', { detail: reset[1] })); setOpen(false); }} className="text-amber-300 underline break-all text-left">Neues Passwort festlegen (Link öffnen)</button>;
      if (/^https?:\/\//.test(part)) return <span key={i} className="text-amber-300 break-all">{part}</span>;
      return <span key={i}>{part}</span>;
    });

  const m = mails[sel];
  return (
    <>
      <button
        onClick={() => { setOpen(true); setFresh(0); }}
        className="fixed z-[80] flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full bg-sky-500 text-white shadow-lg hover:bg-sky-400"
        style={{ right: 'max(1rem, env(safe-area-inset-right))', bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        aria-label={`Test-Postfach, ${mails.length} E-Mails`}
      >
        <Mail className="w-4 h-4" /> Test-Postfach {mails.length > 0 && <span className="bg-white text-sky-600 rounded-full px-1.5 text-[10px]">{mails.length}</span>}
        {fresh > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-pulse" />}
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="inbox-title">
          <div className="bg-slate-900 border border-sky-500/40 w-full sm:max-w-2xl max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div>
                <h2 id="inbox-title" className="text-sm font-bold text-slate-100">Test-Postfach</h2>
                <p className="text-[11px] text-slate-400">In der Testversion werden E-Mails hier gezeigt statt verschickt.</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 text-slate-400 hover:text-white" aria-label="Schließen"><X className="w-4 h-4" /></button>
            </div>
            {mails.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 text-center">Noch keine E-Mails. Registriere dich, um die Willkommens-E-Mail zu sehen.</p>
            ) : (
              <div className="flex flex-col sm:flex-row min-h-0 flex-1">
                <ul className="sm:w-56 border-b sm:border-b-0 sm:border-r border-slate-800 overflow-y-auto max-h-40 sm:max-h-none">
                  {mails.map((x, i) => (
                    <li key={i}>
                      <button onClick={() => setSel(i)} className={`w-full text-left px-3 py-2.5 text-xs border-b border-slate-800/60 ${i === sel ? 'bg-sky-500/10' : 'hover:bg-slate-800/50'}`}>
                        <div className="font-semibold text-slate-200 truncate">{x.subject}</div>
                        <div className="text-slate-500 truncate">{x.to} · {new Date(x.at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                      </button>
                    </li>
                  ))}
                </ul>
                {m && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 min-w-0">
                    <div className="text-[11px] text-slate-500">An: {m.to}</div>
                    <div className="text-sm font-bold text-slate-100">{m.subject}</div>
                    <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{renderText(m.text)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
