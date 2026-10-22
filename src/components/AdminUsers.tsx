import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Users, UserPlus, UserX, KeyRound, Trash2, Loader2, Crown, Copy, Check, RefreshCw, Sparkles, CreditCard, Mail, CircleDot } from 'lucide-react';
import { BillingSettings, formatPrice } from '../billing/plans';
import { useAuth } from '../auth/AuthGate';

interface Row {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  createdAt: string;
  lastLoginAt?: string;
  disabled?: boolean;
  plan?: 'free' | 'pro';
  planStatus?: string;
  planInterval?: 'month' | 'year';
  planRenewsAt?: string;
  effectivePlan?: 'free' | 'pro';
  profile?: { country?: string; mainChannel?: string; experience?: string; niche?: string; source?: string; newsletter?: boolean };
  providers?: string[];
  isMainAdmin: boolean;
  stats: { links: number; clicks: number; earnings: number } | null;
}
interface Data {
  users: Row[];
  summary: { total: number; owners: number; members: number; newThisWeek: number; disabled: number; pro: number; monthly: number; yearly: number };
  registrationOpen: boolean;
  ownerEmail: string;
}

const post = async (url: string, body: unknown) => {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.success) throw new Error(d.error || 'Aktion fehlgeschlagen.');
  return d;
};
const eur = (x: number) => x.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
const date = (s?: string) => (s ? new Date(s).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–');
const btn = 'px-2.5 py-1.5 text-xs border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40';

export const AdminUsers: React.FC = () => {
  const auth = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [query, setQuery] = useState('');
  const [tempPw, setTempPw] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const load = useCallback(() => {
    fetch('/api/admin/users', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => (d.success ? setData(d) : setError(d.error || 'Keine Berechtigung.')))
      .catch(() => setError('Nutzerliste konnte nicht geladen werden.'));
  }, []);
  useEffect(load, [load]);

  const act = async (fn: () => Promise<any>, success: string) => {
    setMsg('');
    setError('');
    try {
      const r = await fn();
      setMsg(success);
      load();
      return r;
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (error && !data) return <div className="max-w-3xl mx-auto bg-slate-900/60 border border-rose-500/30 rounded-2xl p-5 text-sm text-rose-300">{error}</div>;
  if (!data) return <div className="flex justify-center gap-2 text-sm text-slate-400 py-16"><Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Lade Nutzer …</div>;

  const q = query.trim().toLowerCase();
  const rows = data.users.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.includes(q));
  const tiles = [
    { label: 'Konten gesamt', value: data.summary.total, icon: Users },
    { label: 'Admins', value: data.summary.owners, icon: Crown },
    { label: 'Mitglieder', value: data.summary.members, icon: Users },
    { label: 'Neu (7 Tage)', value: data.summary.newThisWeek, icon: UserPlus },
    { label: 'Gesperrt', value: data.summary.disabled, icon: UserX },
    { label: 'Pro-Mitglieder', value: data.summary.pro, icon: Sparkles },
    { label: 'Abos monatlich', value: data.summary.monthly, icon: CreditCard },
    { label: 'Abos jährlich', value: data.summary.yearly, icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400">Admin</div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-400" /> Nutzerverwaltung</h2>
          <p className="text-xs text-slate-400 mt-1">
            Haupt-Admin: <span className="text-slate-200">{data.ownerEmail}</span>. Dieses Konto hat immer volle Rechte und kann nicht gesperrt oder gelöscht werden.
          </p>
        </div>
        <button className={btn} onClick={load}><RefreshCw className="w-3.5 h-3.5" /> Aktualisieren</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tiles.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" /> {t.label}</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-100">{t.value}</div>
            </div>
          );
        })}
      </div>

      <AdminBilling />

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-100">Registrierung für neue Nutzer</div>
          <div className="text-xs text-slate-400">{data.registrationOpen ? 'Offen – jeder kann ein Konto anlegen.' : 'Geschlossen – nur du kannst dich noch registrieren.'}</div>
        </div>
        <button
          role="switch"
          aria-checked={data.registrationOpen}
          aria-label="Registrierung offen"
          onClick={() => act(() => post('/api/admin/registration', { open: !data.registrationOpen }), data.registrationOpen ? 'Registrierung geschlossen.' : 'Registrierung geöffnet.')}
          className={`w-11 h-6 rounded-full relative transition-colors ${data.registrationOpen ? 'bg-amber-400' : 'bg-slate-700'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${data.registrationOpen ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>

      {(msg || error) && <p role="status" className={`text-xs ${error ? 'text-rose-300' : 'text-emerald-300'}`}>{error || msg}</p>}

      {tempPw && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <div className="text-sm font-semibold text-amber-200">Neues Passwort für {tempPw.email}</div>
          <div className="flex flex-wrap items-center gap-2">
            <code className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 select-all">{tempPw.password}</code>
            <button className={btn} onClick={async () => { try { await navigator.clipboard.writeText(tempPw.password); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch { /* */ } }}>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Kopieren
            </button>
            <button className={btn} onClick={() => setTempPw(null)}>Fertig</button>
          </div>
          <p className="text-[11px] text-slate-400">Wird nur jetzt angezeigt. Gib es der Person persönlich weiter; sie sollte es nach dem Anmelden im Kontomenü ändern.</p>
        </div>
      )}

      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Name oder E-Mail suchen …" aria-label="Nutzer suchen" className="w-full sm:w-80 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/70" />

      <div className="space-y-2">
        {rows.map(u => {
          const me = auth?.user.id === u.id;
          return (
            <div key={u.id} className={`bg-slate-900/60 border rounded-xl p-4 flex flex-col lg:flex-row lg:items-center gap-3 ${u.disabled ? 'border-rose-500/30 opacity-70' : 'border-slate-800'}`}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-100 flex items-center gap-2 flex-wrap">
                  {u.name}
                  {u.isMainAdmin && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 flex items-center gap-1"><Crown className="w-3 h-3" /> Haupt-Admin</span>}
                  {!u.isMainAdmin && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${u.role === 'owner' ? 'border-amber-400/40 text-amber-300' : 'border-slate-700 text-slate-400'}`}>{u.role === 'owner' ? 'Admin' : 'Mitglied'}</span>}
                  {u.disabled && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border border-rose-500/40 text-rose-300">gesperrt</span>}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${u.effectivePlan === 'pro' ? 'bg-amber-400 text-slate-950' : 'border border-slate-700 text-slate-400'}`}>{u.effectivePlan === 'pro' ? 'Pro' : 'Free'}{u.plan === 'pro' && u.planInterval ? ` · ${u.planInterval === 'year' ? 'jährlich' : 'monatlich'}` : ''}{u.planStatus === 'canceling' ? ' · gekündigt' : u.planStatus === 'past_due' ? ' · Zahlung offen' : ''}</span>
                  {me && <span className="text-[10px] text-slate-500">(du)</span>}
                </div>
                <div className="text-xs text-slate-400 break-all">{u.email}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Registriert {date(u.createdAt)} · zuletzt angemeldet {date(u.lastLoginAt)}
                  {u.stats ? ` · ${u.stats.links} Links · ${u.stats.clicks} Klicks · ${eur(u.stats.earnings)} eingetragen` : ' · noch keine Hub-Daten'}
                </div>
                {u.profile && (u.profile.country || u.profile.mainChannel || u.profile.experience || u.profile.niche) && (
                  <div className="text-[11px] text-slate-500">{[u.profile.country, u.profile.mainChannel, u.profile.experience, u.profile.niche, u.profile.source && `über ${u.profile.source}`, u.profile.newsletter && 'Newsletter: ja', u.providers?.length ? `Login: ${u.providers.join(', ')}` : ''].filter(Boolean).join(' · ')}</div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button className={btn} disabled={u.isMainAdmin} onClick={() => act(() => post('/api/admin/users/role', { id: u.id, role: u.role === 'owner' ? 'member' : 'owner' }), u.role === 'owner' ? `${u.name} ist jetzt Mitglied.` : `${u.name} ist jetzt Admin.`)}>
                  <Crown className="w-3.5 h-3.5" /> {u.role === 'owner' ? 'Zum Mitglied' : 'Zum Admin'}
                </button>
                {u.role !== 'owner' && (
                  <button className={btn} onClick={() => act(() => post('/api/admin/users/plan', { id: u.id, plan: u.effectivePlan === 'pro' ? 'free' : 'pro' }), u.effectivePlan === 'pro' ? `${u.name} ist jetzt Free. Ein bezahltes Abo bitte zusätzlich in Stripe kündigen.` : `${u.name} hat jetzt Pro (kostenlos).`)}>
                    <Sparkles className="w-3.5 h-3.5" /> {u.effectivePlan === 'pro' ? 'Pro entziehen' : 'Pro schenken'}
                  </button>
                )}
                <button className={btn} disabled={u.isMainAdmin} onClick={() => act(() => post('/api/admin/users/disable', { id: u.id, disabled: !u.disabled }), u.disabled ? `${u.name} entsperrt.` : `${u.name} gesperrt.`)}>
                  <UserX className="w-3.5 h-3.5" /> {u.disabled ? 'Entsperren' : 'Sperren'}
                </button>
                <button className={btn} disabled={me} title={me ? 'Ändere dein eigenes Passwort im Kontomenü' : undefined} onClick={async () => { const r = await act(() => post('/api/admin/users/reset-password', { id: u.id }), 'Passwort zurückgesetzt.'); if (r?.password) setTempPw({ email: u.email, password: r.password }); }}>
                  <KeyRound className="w-3.5 h-3.5" /> Passwort zurücksetzen
                </button>
                <button className={`${btn} hover:!text-rose-300`} disabled={u.isMainAdmin} onClick={() => { setConfirmDelete(u); setConfirmText(''); }} aria-label={`${u.name} löschen`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-slate-500 text-center py-6">Keine Nutzer gefunden.</p>}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="del-title">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-5 space-y-3">
            <h3 id="del-title" className="text-base font-bold text-slate-100">Konto endgültig löschen?</h3>
            <p className="text-sm text-slate-300">Das Konto von <strong>{confirmDelete.name}</strong> und alle Hub-Daten (Links, Einnahmen, Entwürfe) werden gelöscht. Das lässt sich nicht rückgängig machen.</p>
            <label htmlFor="del-confirm" className="block space-y-1">
              <span className="text-xs text-slate-400">Zur Bestätigung die E-Mail eintippen: {confirmDelete.email}</span>
              <input id="del-confirm" value={confirmText} onChange={e => setConfirmText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-400/70" />
            </label>
            <div className="flex justify-end gap-2">
              <button className={btn} onClick={() => setConfirmDelete(null)}>Abbrechen</button>
              <button
                disabled={confirmText.trim().toLowerCase() !== confirmDelete.email}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 rounded-lg"
                onClick={async () => { const u = confirmDelete; setConfirmDelete(null); await act(() => post('/api/admin/users/delete', { id: u.id, confirmEmail: confirmText.trim().toLowerCase() }), `${u.name} wurde gelöscht.`); }}
              >
                Endgültig löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Preise, Integrationen und E-Mail-Protokoll ----------
const AdminBilling: React.FC = () => {
  const [d, setD] = useState<{ settings: BillingSettings; integrations: Record<string, boolean | string>; testMode?: boolean } | null>(null);
  const [f, setF] = useState({ month: '', year: '', trial: '', note: '' });
  const [msg, setMsg] = useState('');
  const [mails, setMails] = useState<{ at: string; to: string; subject: string; status: string; error?: string }[]>([]);
  const [showMails, setShowMails] = useState(false);
  useEffect(() => {
    fetch('/api/admin/billing', { credentials: 'same-origin' }).then(r => r.json()).then(x => {
      if (!x.success) return;
      setD(x);
      setF({ month: (x.settings.priceMonthCents / 100).toFixed(2).replace('.', ','), year: (x.settings.priceYearCents / 100).toFixed(2).replace('.', ','), trial: String(x.settings.trialDays), note: x.settings.priceNote });
    }).catch(() => {});
  }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = (v: string) => Math.round(parseFloat(v.replace(',', '.')) * 100);
    try {
      const r = await post('/api/admin/billing', { priceMonthCents: c(f.month), priceYearCents: c(f.year), trialDays: Number(f.trial) || 0, priceNote: f.note });
      setD(x => (x ? { ...x, settings: r.settings } : x));
      setMsg('Preise gespeichert.');
    } catch (err: any) {
      setMsg(err.message);
    }
  };
  const loadMails = () => fetch('/api/admin/mail-log', { credentials: 'same-origin' }).then(r => r.json()).then(x => x.success && setMails(x.mails));
  if (!d) return null;
  const integ = [
    { key: 'stripe', label: 'Stripe-Bezahlung', env: 'STRIPE_SECRET_KEY' },
    { key: 'stripeWebhook', label: 'Stripe-Webhook', env: 'STRIPE_WEBHOOK_SECRET' },
    { key: 'mail', label: 'E-Mail-Versand (Resend)', env: 'RESEND_API_KEY, MAIL_FROM' },
    { key: 'google', label: 'Login mit Google', env: 'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET' },
    { key: 'facebook', label: 'Login mit Facebook', env: 'FACEBOOK_APP_ID, FACEBOOK_APP_SECRET' },
  ];
  const inp = 'w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400/70';
  const yearly = Math.round(parseFloat(f.year.replace(',', '.')) * 100) || 0;
  const monthly = Math.round(parseFloat(f.month.replace(',', '.')) * 100) || 0;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <form onSubmit={save} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="text-sm font-semibold text-slate-100 flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-400" /> Preise der Mitgliedschaft</div>
        <div className="grid grid-cols-3 gap-3">
          <label htmlFor="bp-month" className="space-y-1"><span className="text-[11px] text-slate-400">Pro monatlich (€)</span><input id="bp-month" inputMode="decimal" className={inp} value={f.month} onChange={e => setF({ ...f, month: e.target.value })} /></label>
          <label htmlFor="bp-year" className="space-y-1"><span className="text-[11px] text-slate-400">Pro jährlich (€)</span><input id="bp-year" inputMode="decimal" className={inp} value={f.year} onChange={e => setF({ ...f, year: e.target.value })} /></label>
          <label htmlFor="bp-trial" className="space-y-1"><span className="text-[11px] text-slate-400">Testtage</span><input id="bp-trial" type="number" min={0} max={60} className={inp} value={f.trial} onChange={e => setF({ ...f, trial: e.target.value })} /></label>
        </div>
        <label htmlFor="bp-note" className="block space-y-1"><span className="text-[11px] text-slate-400">Preishinweis (z. B. Umsatzsteuer)</span><input id="bp-note" className={inp} value={f.note} onChange={e => setF({ ...f, note: e.target.value })} /></label>
        <div className="text-[11px] text-slate-500">{monthly > 0 && yearly > 0 ? `Jahrespreis entspricht ${formatPrice(Math.round(yearly / 12))} im Monat (${Math.max(0, Math.round((1 - yearly / (monthly * 12)) * 100))} % günstiger).` : ''} Neue Preise gelten für neue Abos.</div>
        <div className="flex items-center gap-3"><button type="submit" className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950">Preise speichern</button>{msg && <span role="status" className="text-xs text-slate-400">{msg}</span>}</div>
      </form>
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div className="text-sm font-semibold text-slate-100">Integrationen</div>
        {d.testMode && <p className="text-[11px] text-sky-300">Testversion: Zahlungen, E-Mails und Social Login werden simuliert.</p>}
        {integ.map(i => (
          <div key={i.key} className="flex items-start gap-2 text-xs">
            <CircleDot className={`w-3.5 h-3.5 mt-px shrink-0 ${d.integrations[i.key] ? 'text-emerald-400' : 'text-slate-600'}`} />
            <div className="min-w-0"><span className="text-slate-200">{i.label}</span> <span className={d.integrations[i.key] ? 'text-emerald-300' : 'text-slate-500'}>{d.integrations[i.key] ? 'eingerichtet' : `fehlt – in .env: ${i.env}`}</span></div>
          </div>
        ))}
        <button className={`${btn} mt-1`} onClick={() => { setShowMails(!showMails); if (!showMails) loadMails(); }}><Mail className="w-3.5 h-3.5" /> {showMails ? 'E-Mail-Protokoll ausblenden' : 'E-Mail-Protokoll anzeigen'}</button>
        {showMails && (
          <ul className="max-h-56 overflow-y-auto space-y-1.5 pt-1">
            {mails.length === 0 && <li className="text-xs text-slate-500">Noch keine E-Mails.</li>}
            {mails.map((m, i) => (
              <li key={i} className="text-[11px] flex gap-2">
                <span className={`shrink-0 ${m.status === 'sent' ? 'text-emerald-400' : m.status === 'failed' ? 'text-rose-400' : 'text-slate-500'}`}>{m.status === 'sent' ? 'gesendet' : m.status === 'failed' ? 'Fehler' : 'protokolliert'}</span>
                <span className="text-slate-300 truncate">{m.subject}</span>
                <span className="text-slate-500 truncate">→ {m.to}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
