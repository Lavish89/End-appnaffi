import React, { useState } from 'react';
import { X, User, CreditCard, KeyRound, Loader2, Check, Sparkles, PartyPopper, AlertTriangle } from 'lucide-react';
import type { AuthUser } from '../auth/AuthGate';
import { Pricing, useBillingSettings } from '../billing/Pricing';
import { Interval, formatPrice } from '../billing/plans';
import { COUNTRIES, CHANNELS, EXPERIENCE } from '../../server-auth-rules';
import { LegalPagesModal } from '../components/LegalPagesModal';

export type AccountTab = 'profile' | 'membership' | 'security';

const inputCls = 'w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/70';
const btnPrimary = 'px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-lg flex items-center justify-center gap-2';
const btnGhost = 'px-3 py-2 text-xs text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 rounded-lg';

export const post = async (url: string, body: unknown) => {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.success) throw new Error(d.error || 'Etwas ist schiefgelaufen.');
  return d;
};
const date = (s?: string) => (s ? new Date(s).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }) : '');

export const ThankYou: React.FC<{ onClose: () => void; name: string }> = ({ onClose, name }) => (
  <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="ty-title">
    <div className="bg-slate-900 border border-amber-400/50 rounded-2xl max-w-md w-full p-7 text-center space-y-4">
      <div className="w-14 h-14 mx-auto rounded-full bg-amber-400 flex items-center justify-center"><PartyPopper className="w-7 h-7 text-slate-950" /></div>
      <h2 id="ty-title" className="text-xl font-bold text-slate-100">Danke, {name}! Pro ist freigeschaltet.</h2>
      <p className="text-sm text-slate-400">Du kannst jetzt unbegrenzt Links anlegen, alle Automationen nutzen und Posts per KI schreiben lassen. Eine Bestätigung kommt per E-Mail.</p>
      <button onClick={onClose} className={`${btnPrimary} w-full`}>Los geht’s</button>
    </div>
  </div>
);

export const AccountPage: React.FC<{ user: AuthUser; initialTab?: AccountTab; initialInterval?: Interval; onClose: () => void; refresh: () => Promise<void> }> = ({ user, initialTab = 'profile', initialInterval, onClose, refresh }) => {
  const [tab, setTab] = useState<AccountTab>(initialTab);
  const tabs: { key: AccountTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'profile', label: 'Profil', icon: User },
    { key: 'membership', label: 'Mitgliedschaft', icon: CreditCard },
    { key: 'security', label: 'Sicherheit', icon: KeyRound },
  ];
  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="acc-title">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-5" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400">Konto</div>
            <h1 id="acc-title" className="text-2xl font-bold text-slate-100">Konto & Mitgliedschaft</h1>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800" aria-label="Schließen"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex gap-1.5 border-b border-slate-800" role="tablist">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-sm flex items-center gap-1.5 border-b-2 -mb-px ${tab === t.key ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>
        {tab === 'profile' && <ProfileTab user={user} refresh={refresh} />}
        {tab === 'membership' && <MembershipTab user={user} refresh={refresh} initialInterval={initialInterval} />}
        {tab === 'security' && <SecurityTab user={user} />}
      </div>
    </div>
  );
};

const ProfileTab: React.FC<{ user: AuthUser; refresh: () => Promise<void> }> = ({ user, refresh }) => {
  const p = user.profile || {};
  const [f, setF] = useState({ name: user.name, firstName: p.firstName || '', lastName: p.lastName || '', country: p.country || '', niche: p.niche || '', mainChannel: p.mainChannel || '', experience: p.experience || '', website: p.website || '', newsletter: Boolean(p.newsletter) });
  const [msg, setMsg] = useState('');
  const set = (k: keyof typeof f, v: string | boolean) => setF(x => ({ ...x, [k]: v }));
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { name, ...profile } = f;
      await post('/api/me/profile', { name, profile });
      await refresh();
      setMsg('Gespeichert.');
    } catch (err: any) {
      setMsg(err.message);
    }
  };
  const field = (k: keyof typeof f, label: string, el: React.ReactNode) => (
    <label htmlFor={`pf-${k}`} className="space-y-1 min-w-0"><span className="text-xs text-slate-400">{label}</span>{el}</label>
  );
  return (
    <form onSubmit={save} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {field('name', 'Anzeigename', <input id="pf-name" className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} />)}
      <div className="space-y-1"><span className="text-xs text-slate-400">E-Mail</span><div className="text-sm text-slate-300 py-2 break-all">{user.email}</div></div>
      {field('firstName', 'Vorname', <input id="pf-firstName" className={inputCls} value={f.firstName} onChange={e => set('firstName', e.target.value)} autoComplete="given-name" />)}
      {field('lastName', 'Nachname', <input id="pf-lastName" className={inputCls} value={f.lastName} onChange={e => set('lastName', e.target.value)} autoComplete="family-name" />)}
      {field('country', 'Land', <select id="pf-country" className={inputCls} value={f.country} onChange={e => set('country', e.target.value)}><option value="">– wählen –</option>{COUNTRIES.map(c => <option key={c}>{c}</option>)}</select>)}
      {field('niche', 'Deine Nische', <input id="pf-niche" className={inputCls} value={f.niche} onChange={e => set('niche', e.target.value)} placeholder="z. B. Home-Fitness" />)}
      {field('mainChannel', 'Wichtigster Kanal', <select id="pf-mainChannel" className={inputCls} value={f.mainChannel} onChange={e => set('mainChannel', e.target.value)}><option value="">– wählen –</option>{CHANNELS.map(c => <option key={c}>{c}</option>)}</select>)}
      {field('experience', 'Erfahrung', <select id="pf-experience" className={inputCls} value={f.experience} onChange={e => set('experience', e.target.value)}><option value="">– wählen –</option>{EXPERIENCE.map(c => <option key={c}>{c}</option>)}</select>)}
      {field('website', 'Website oder Profil', <input id="pf-website" className={inputCls} value={f.website} onChange={e => set('website', e.target.value)} placeholder="https://… oder @name" />)}
      <label htmlFor="pf-newsletter" className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
        <input id="pf-newsletter" type="checkbox" className="w-4 h-4 accent-amber-400" checked={f.newsletter} onChange={e => set('newsletter', e.target.checked)} />
        Tipps und Neuigkeiten per E-Mail erhalten (jederzeit abbestellbar)
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button type="submit" className={btnPrimary}>Speichern</button>
        {msg && <span role="status" className="text-xs text-slate-400">{msg}</span>}
      </div>
    </form>
  );
};

const MembershipTab: React.FC<{ user: AuthUser; refresh: () => Promise<void>; initialInterval?: Interval }> = ({ user, refresh, initialInterval }) => {
  const { settings, paymentsEnabled, testMode } = useBillingSettings();
  const [chosen, setChosen] = useState<Interval | null>(initialInterval || null);
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [testCheckout, setTestCheckout] = useState<Interval | null>(null);
  const [thanks, setThanks] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelDone, setCancelDone] = useState<{ until?: string; receivedAt: string } | null>(null);
  const [legalOpen, setLegalOpen] = useState(false);
  const isOwner = user.role === 'owner';
  const pro = user.effectivePlan === 'pro';
  const paidPro = user.plan === 'pro' && user.planStatus !== 'canceled' && !isOwner;

  const checkout = async () => {
    if (!chosen) return;
    setErr('');
    setBusy(true);
    try {
      const d = await post('/api/billing/checkout', { interval: chosen, acceptTerms: accept });
      if (d.testCheckout) setTestCheckout(chosen);
      else if (d.url) window.location.href = d.url;
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  const completeTest = async () => {
    setBusy(true);
    try {
      await post('/api/billing/test-complete', { interval: testCheckout });
      await refresh();
      setTestCheckout(null);
      setChosen(null);
      setThanks(true);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => {
    setBusy(true);
    try {
      const d = await post('/api/billing/cancel', {});
      setCancelDone({ until: d.until, receivedAt: d.receivedAt });
      setCancelOpen(false);
      await refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  const statusText = isOwner ? 'Admin – alle Pro-Funktionen inklusive'
    : user.planStatus === 'canceling' ? `Gekündigt – Pro läuft bis ${date(user.planRenewsAt)}`
    : user.planStatus === 'past_due' ? 'Zahlung offen – bitte Zahlungsmethode prüfen'
    : user.plan === 'pro' && user.planStatus === 'active' ? (user.planInterval ? `Aktiv · ${user.planInterval === 'year' ? 'jährlich' : 'monatlich'}${user.planRenewsAt ? ` · verlängert sich am ${date(user.planRenewsAt)}` : ''}` : 'Aktiv · vom Admin freigeschaltet')
    : 'Kostenloser Plan';

  return (
    <div className="space-y-5">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400">Dein Plan</div>
          <div className="text-xl font-bold text-slate-100 flex items-center gap-2">{pro ? <><Sparkles className="w-5 h-5 text-amber-400" /> Pro</> : 'Free'}</div>
          <div className="text-xs text-slate-400 mt-0.5">{statusText}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!testMode && paidPro && <button className={btnGhost} onClick={async () => { try { const d = await post('/api/billing/portal', {}); window.location.href = d.url; } catch (e: any) { setErr(e.message); } }}>Zahlungsmethode & Rechnungen</button>}
          {user.planStatus === 'canceling' && !isOwner && <button className={btnGhost} onClick={async () => { try { await post('/api/billing/resume', {}); await refresh(); } catch (e: any) { setErr(e.message); } }}>Kündigung zurücknehmen</button>}
        </div>
      </div>

      {cancelDone && (
        <div role="status" className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-sm text-emerald-200">
          Deine Kündigung ist am {new Date(cancelDone.receivedAt).toLocaleString('de-DE')} eingegangen.{cancelDone.until ? ` Pro bleibt bis ${date(cancelDone.until)} aktiv.` : ''} Eine Bestätigung haben wir dir per E-Mail geschickt.
        </div>
      )}
      {err && <p role="alert" className="text-sm text-rose-300">{err}</p>}

      {!pro && !chosen && <Pricing currentPlan="free" onChoose={(plan, iv) => plan === 'pro' && setChosen(iv)} proLabel="Weiter zu Pro" />}

      {!pro && chosen && (
        <div className="bg-slate-900 border border-amber-400/40 rounded-2xl p-5 space-y-4 max-w-xl">
          <h2 className="text-lg font-bold text-slate-100">Deine Bestellung</h2>
          <div className="flex items-center justify-between text-sm bg-slate-950 border border-slate-800 rounded-xl p-3.5">
            <span className="text-slate-300">Goalsforce Pro · {chosen === 'year' ? 'jährlich' : 'monatlich'}</span>
            <span className="font-mono font-bold text-slate-100">{formatPrice(chosen === 'year' ? settings.priceYearCents : settings.priceMonthCents)} / {chosen === 'year' ? 'Jahr' : 'Monat'}</span>
          </div>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
            <li>Verlängert sich automatisch um {chosen === 'year' ? 'ein Jahr' : 'einen Monat'}, jederzeit zum Ende der Laufzeit kündbar.</li>
            {settings.trialDays > 0 && <li>Die ersten {settings.trialDays} Tage sind kostenlos.</li>}
            <li>{settings.priceNote}</li>
          </ul>
          <label htmlFor="acc-terms" className="flex items-start gap-2.5 text-xs text-slate-300">
            <input id="acc-terms" type="checkbox" className="mt-0.5 w-4 h-4 accent-amber-400" checked={accept} onChange={e => setAccept(e.target.checked)} />
            <span>Ich habe die <button type="button" onClick={() => setLegalOpen(true)} className="text-amber-400 underline">AGB und die Widerrufsbelehrung</button> gelesen. Ich verlange ausdrücklich, dass Pro sofort startet.</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button className={btnPrimary} disabled={!accept || busy || (!paymentsEnabled && !testMode)} onClick={checkout}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Zahlungspflichtig abonnieren
            </button>
            <button className={btnGhost} onClick={() => setChosen(null)}>Zurück</button>
          </div>
          {!paymentsEnabled && !testMode && <p className="text-xs text-amber-200">Die Bezahlung wird gerade eingerichtet. Bitte versuche es später erneut.</p>}
          <p className="text-[11px] text-slate-500">Sichere Bezahlung über Stripe – Karte, PayPal, SEPA-Lastschrift oder Klarna, je nach Verfügbarkeit.</p>
        </div>
      )}

      {pro && !isOwner && user.plan === 'pro' && user.planStatus === 'active' && user.planInterval && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          {!cancelOpen ? (
            <button className="text-sm text-slate-300 underline hover:text-white" onClick={() => setCancelOpen(true)}>Verträge hier kündigen</button>
          ) : (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-100">Abo kündigen</h3>
              <div className="text-sm text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                <div>Vertrag: Goalsforce Pro ({user.planInterval === 'year' ? 'jährlich' : 'monatlich'})</div>
                <div>Konto: {user.name} · {user.email}</div>
                <div>Art: ordentliche Kündigung zum nächstmöglichen Zeitpunkt{user.planRenewsAt ? ` (${date(user.planRenewsAt)})` : ''}</div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-lg disabled:opacity-50" disabled={busy} onClick={cancel}>Jetzt kündigen</button>
                <button className={btnGhost} onClick={() => setCancelOpen(false)}>Abbrechen</button>
              </div>
            </div>
          )}
        </div>
      )}

      {testCheckout && (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="tc-title">
          <div className="bg-slate-900 border border-sky-500/50 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-sky-300 text-xs font-bold uppercase tracking-wider"><AlertTriangle className="w-4 h-4" /> Testkasse</div>
            <h2 id="tc-title" className="text-lg font-bold text-slate-100">Keine echte Zahlung</h2>
            <p className="text-sm text-slate-400">In der Testversion ersetzt dieses Fenster die Stripe-Kasse. In der echten App bezahlst du hier mit Karte, PayPal oder SEPA.</p>
            <div className="text-sm text-slate-200 bg-slate-950 border border-slate-800 rounded-xl p-3 flex justify-between"><span>Pro {testCheckout === 'year' ? 'jährlich' : 'monatlich'}</span><span className="font-mono">{formatPrice(testCheckout === 'year' ? settings.priceYearCents : settings.priceMonthCents)}</span></div>
            <div className="flex gap-2">
              <button className={`${btnPrimary} flex-1`} disabled={busy} onClick={completeTest}><Check className="w-4 h-4" /> Testzahlung abschließen</button>
              <button className={btnGhost} onClick={() => setTestCheckout(null)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
      {thanks && <ThankYou name={user.profile?.firstName || user.name} onClose={() => setThanks(false)} />}
      <LegalPagesModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} initialTab="agb" />
    </div>
  );
};

const SecurityTab: React.FC<{ user: AuthUser }> = ({ user }) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const hasPw = user.hasPassword !== false;
  return (
    <div className="space-y-4 max-w-xl">
      <form
        className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3"
        onSubmit={async e => {
          e.preventDefault();
          try {
            await post('/api/auth/change-password', { currentPassword: current, newPassword: next });
            setMsg({ ok: true, t: 'Passwort geändert.' });
            setCurrent(''); setNext('');
          } catch (err: any) {
            setMsg({ ok: false, t: err.message });
          }
        }}
      >
        <h2 className="text-base font-bold text-slate-100">{hasPw ? 'Passwort ändern' : 'Passwort festlegen'}</h2>
        {hasPw && <label htmlFor="sec-cur" className="block space-y-1"><span className="text-xs text-slate-400">Aktuelles Passwort</span><input id="sec-cur" type="password" autoComplete="current-password" className={inputCls} value={current} onChange={e => setCurrent(e.target.value)} /></label>}
        <label htmlFor="sec-new" className="block space-y-1"><span className="text-xs text-slate-400">Neues Passwort (mind. 8 Zeichen, Buchstabe und Zahl)</span><input id="sec-new" type="password" autoComplete="new-password" className={inputCls} value={next} onChange={e => setNext(e.target.value)} /></label>
        {msg && <p role="status" className={`text-xs ${msg.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{msg.t}</p>}
        <button type="submit" className={btnPrimary}>Speichern</button>
      </form>
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-sm text-slate-300 space-y-1">
        <div className="font-semibold text-slate-100">Anmeldemethoden</div>
        <div>E-Mail & Passwort: {hasPw ? 'eingerichtet' : 'noch nicht festgelegt'}</div>
        <div>Google: {user.providers?.includes('google') ? 'verbunden' : 'nicht verbunden'}</div>
        <div>Facebook: {user.providers?.includes('facebook') ? 'verbunden' : 'nicht verbunden'}</div>
      </div>
    </div>
  );
};
