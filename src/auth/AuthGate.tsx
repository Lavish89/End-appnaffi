import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { LogIn, UserPlus, Eye, EyeOff, Loader2, ShieldCheck, LogOut, KeyRound, X, ChevronDown, Sparkles, CreditCard, Mail } from 'lucide-react';
import { LegalPagesModal } from '../components/LegalPagesModal';
import { AccountPage, AccountTab, ThankYou } from '../account/AccountPage';
import { Landing } from '../landing/Landing';
import { TestInbox } from './TestInbox';
import type { Interval, PlanId, PlanStatus } from '../billing/plans';
import { COUNTRIES, CHANNELS, EXPERIENCE, SOURCES } from '../../server-auth-rules';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  createdAt: string;
  profile?: { firstName?: string; lastName?: string; country?: string; niche?: string; mainChannel?: string; experience?: string; website?: string; source?: string; newsletter?: boolean };
  plan?: PlanId;
  planStatus?: PlanStatus;
  planInterval?: Interval;
  planRenewsAt?: string;
  bonusProUntil?: string;
  effectivePlan?: PlanId;
  hasPassword?: boolean;
  providers?: string[];
}

interface AuthState {
  user: AuthUser;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  openAccount: (tab?: AccountTab, interval?: Interval) => void;
}

const AuthContext = createContext<AuthState | null>(null);
export const useAuth = () => useContext(AuthContext);
export const isPro = (u?: AuthUser | null) => Boolean(u && (u.role === 'owner' || u.effectivePlan === 'pro'));

const post = async (url: string, body: unknown) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.error || 'Etwas ist schiefgelaufen. Bitte versuche es erneut.');
  return data;
};

const inputCls =
  'w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20';

const INTENT_KEY = 'gf_intent';
const readQuery = () => {
  try { return new URLSearchParams(window.location.search); } catch { return new URLSearchParams(); }
};
const clearQuery = () => {
  try { window.history.replaceState(null, '', window.location.pathname + window.location.hash); } catch { /* */ }
};

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [account, setAccount] = useState<{ tab: AccountTab; interval?: Interval } | null>(null);
  const [thanks, setThanks] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const loadMe = useCallback(async () => {
    const d = await fetch('/api/auth/me', { credentials: 'same-origin' }).then(r => r.json()).catch(() => ({}));
    setUser(d.user || null);
    setRegistrationOpen(d.registrationOpen !== false);
    return (d.user || null) as AuthUser | null;
  }, []);

  useEffect(() => {
    const q = readQuery();
    if (q.get('reset')) setResetToken(q.get('reset'));
    if (q.get('login_error')) setNotice(q.get('login_error')!);
    const checkout = q.get('checkout');
    if (q.toString()) clearQuery();
    loadMe().then(u => {
      if (u && checkout === 'success') setThanks(true);
      if (u && checkout === 'cancel') setAccount({ tab: 'membership' });
    }).finally(() => setChecking(false));
    const onReset = (e: Event) => setResetToken((e as CustomEvent).detail);
    window.addEventListener('gf-open-reset', onReset);
    return () => window.removeEventListener('gf-open-reset', onReset);
  }, [loadMe]);

  const onAuthed = (u: AuthUser) => {
    setUser(u);
    setResetToken(null);
    setNotice('');
    try {
      const intent = sessionStorage.getItem(INTENT_KEY);
      if (intent && u.effectivePlan !== 'pro') setAccount({ tab: 'membership', interval: intent === 'year' ? 'year' : 'month' });
      sessionStorage.removeItem(INTENT_KEY);
    } catch { /* */ }
  };

  const logout = async () => {
    try { await post('/api/auth/logout', {}); } finally { setUser(null); setAccount(null); loadMe(); }
  };
  const refresh = async () => { await loadMe(); };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Wird geladen …
      </div>
    );
  }

  const testInbox = (window as any).__GF_TEST__ ? <TestInbox /> : null;

  if (!user) {
    return (
      <>
        <Landing
          authForm={<AuthForm onAuthed={onAuthed} registrationOpen={registrationOpen} resetToken={resetToken} notice={notice} onResetDone={() => setResetToken(null)} />}
          onChoosePlan={(plan, interval) => { try { if (plan === 'pro') sessionStorage.setItem(INTENT_KEY, interval); } catch { /* */ } window.dispatchEvent(new CustomEvent('gf-show-register')); }}
        />
        {testInbox}
      </>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout, refresh, openAccount: (tab = 'profile', interval) => setAccount({ tab, interval }) }}>
      {children}
      {account && <AccountPage user={user} initialTab={account.tab} initialInterval={account.interval} onClose={() => setAccount(null)} refresh={refresh} />}
      {thanks && <ThankYou name={user.profile?.firstName || user.name} onClose={() => setThanks(false)} />}
      {testInbox}
    </AuthContext.Provider>
  );
};

// ---------- Anmelde- / Registrierungsformular ----------
type Mode = 'login' | 'register' | 'forgot' | 'reset';

const AuthForm: React.FC<{ onAuthed: (u: AuthUser) => void; registrationOpen: boolean; resetToken: string | null; notice: string; onResetDone: () => void }> = ({ onAuthed, registrationOpen, resetToken, notice, onResetDone }) => {
  const [mode, setMode] = useState<Mode>(resetToken ? 'reset' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profile, setProfile] = useState({ country: '', mainChannel: '', experience: '', niche: '', source: '', newsletter: false });
  const [error, setError] = useState(notice);
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [providers, setProviders] = useState<{ google: boolean; facebook: boolean; passwordReset: boolean; testMode?: boolean }>({ google: false, facebook: false, passwordReset: false });

  useEffect(() => {
    fetch('/api/auth/providers').then(r => r.json()).then(d => d.success && setProviders(d)).catch(() => {});
    const show = () => { setMode('register'); document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    window.addEventListener('gf-show-register', show);
    return () => window.removeEventListener('gf-show-register', show);
  }, []);
  useEffect(() => { if (resetToken) setMode('reset'); }, [resetToken]);

  const isRegister = mode === 'register';
  const pwChecks = [
    { ok: password.length >= 8, label: 'Mind. 8 Zeichen' },
    { ok: /[a-zA-Z]/.test(password), label: 'Ein Buchstabe' },
    { ok: /\d/.test(password), label: 'Eine Zahl' },
  ];
  const switchMode = (m: Mode) => { setMode(m); setError(''); setInfo(''); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      if (mode === 'register') onAuthed((await post('/api/auth/register', { name, email, password, acceptPrivacy, profile: { ...profile, firstName: name.split(' ')[0] } })).user);
      else if (mode === 'login') onAuthed((await post('/api/auth/login', { email, password })).user);
      else if (mode === 'forgot') setInfo((await post('/api/auth/forgot', { email })).message + (providers.testMode ? ' (Testversion: Schau ins Test-Postfach unten rechts.)' : ''));
      else if (mode === 'reset') { const d = await post('/api/auth/reset', { token: resetToken, password }); onResetDone(); onAuthed(d.user); }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const social = (id: 'google' | 'facebook', label: string, enabled: boolean, icon: React.ReactNode) => (
    <a
      href={enabled ? `/api/auth/oauth/${id}` : undefined}
      aria-disabled={!enabled}
      onClick={e => { if (!enabled) { e.preventDefault(); setError(providers.testMode ? `${label}-Login funktioniert nur in der Server-Version mit eingerichteten Zugangsdaten.` : `${label}-Login ist noch nicht eingerichtet.`); } }}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg border transition-colors ${enabled ? 'border-slate-700 text-slate-100 hover:bg-slate-800' : 'border-slate-800 text-slate-500 cursor-not-allowed'}`}
    >
      {icon} {label}
    </a>
  );
  const showSocial = mode === 'login' || mode === 'register';

  return (
    <div id="auth-card" className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      {(mode === 'login' || mode === 'register') && (
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800" role="tablist">
          {(['login', 'register'] as Mode[]).map(m => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchMode(m)}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${mode === m ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>
              {m === 'login' ? <><LogIn className="w-3.5 h-3.5" /> Anmelden</> : <><UserPlus className="w-3.5 h-3.5" /> Registrieren</>}
            </button>
          ))}
        </div>
      )}
      {mode === 'forgot' && <div><h2 className="text-base font-bold text-slate-100">Passwort vergessen</h2><p className="text-xs text-slate-400 mt-1">Wir schicken dir einen Link, mit dem du ein neues Passwort festlegst.</p></div>}
      {mode === 'reset' && <div><h2 className="text-base font-bold text-slate-100">Neues Passwort festlegen</h2><p className="text-xs text-slate-400 mt-1">Danach bist du direkt angemeldet.</p></div>}

      {showSocial && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {social('google', 'Google', providers.google, <span className="w-4 h-4 rounded-full bg-white text-[10px] font-bold text-slate-900 flex items-center justify-center">G</span>)}
            {social('facebook', 'Facebook', providers.facebook, <span className="w-4 h-4 rounded-full bg-[#1877F2] text-[10px] font-bold text-white flex items-center justify-center">f</span>)}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500"><span className="flex-1 h-px bg-slate-800" />oder mit E-Mail<span className="flex-1 h-px bg-slate-800" /></div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        {isRegister && !registrationOpen && (
          <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">Die Registrierung ist im Moment geschlossen. Nur der Admin kann sich noch registrieren.</p>
        )}
        {isRegister && (
          <label className="block space-y-1.5" htmlFor="auth-name">
            <span className="text-xs font-medium text-slate-400">Vor- und Nachname</span>
            <input id="auth-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Max Mustermann" required />
          </label>
        )}
        {mode !== 'reset' && (
          <label className="block space-y-1.5" htmlFor="auth-email">
            <span className="text-xs font-medium text-slate-400">E-Mail</span>
            <input id="auth-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="du@beispiel.de" required />
          </label>
        )}
        {mode !== 'forgot' && (
          <label className="block space-y-1.5" htmlFor="auth-password">
            <span className="text-xs font-medium text-slate-400 flex justify-between">
              {mode === 'reset' ? 'Neues Passwort' : 'Passwort'}
              {mode === 'login' && <button type="button" onClick={() => switchMode('forgot')} className="text-amber-400 hover:text-amber-300 font-medium">Passwort vergessen?</button>}
            </span>
            <div className="relative">
              <input id="auth-password" type={showPw ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className={`${inputCls} pr-10`} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-200" aria-label={showPw ? 'Passwort verbergen' : 'Passwort anzeigen'}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>
        )}

        {(isRegister || mode === 'reset') && (
          <div className="flex flex-wrap gap-2">
            {pwChecks.map(c => (
              <span key={c.label} className={`text-[11px] px-2 py-0.5 rounded-full border ${c.ok ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-slate-700 text-slate-500'}`}>{c.ok ? '✓ ' : ''}{c.label}</span>
            ))}
          </div>
        )}

        {isRegister && (
          <div className="border border-slate-800 rounded-xl">
            <button type="button" onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen} className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-slate-300">
              <span>Mehr über dich <span className="text-slate-500">(freiwillig – damit wir dir passende Tipps geben)</span></span>
              <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 pt-0">
                {([['country', 'Land', COUNTRIES], ['mainChannel', 'Wichtigster Kanal', CHANNELS], ['experience', 'Erfahrung', EXPERIENCE], ['source', 'Wie hast du uns gefunden?', SOURCES]] as const).map(([k, label, list]) => (
                  <label key={k} htmlFor={`reg-${k}`} className="space-y-1 min-w-0">
                    <span className="text-[11px] text-slate-400">{label}</span>
                    <select id={`reg-${k}`} className={`${inputCls} !py-2`} value={(profile as any)[k]} onChange={e => setProfile(p => ({ ...p, [k]: e.target.value }))}>
                      <option value="">– wählen –</option>
                      {list.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </label>
                ))}
                <label htmlFor="reg-niche" className="space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-slate-400">Deine Nische / dein Thema</span>
                  <input id="reg-niche" className={`${inputCls} !py-2`} value={profile.niche} onChange={e => setProfile(p => ({ ...p, niche: e.target.value }))} placeholder="z. B. Home-Fitness, Kochen, Technik" />
                </label>
              </div>
            )}
          </div>
        )}

        {isRegister && (
          <>
            <label className="flex items-start gap-2.5 text-xs text-slate-400" htmlFor="auth-newsletter">
              <input id="auth-newsletter" type="checkbox" checked={profile.newsletter} onChange={e => setProfile(p => ({ ...p, newsletter: e.target.checked }))} className="mt-0.5 w-4 h-4 accent-amber-400" />
              <span>Ja, ich möchte Tipps zu Affiliate-Marketing per E-Mail erhalten (jederzeit abbestellbar).</span>
            </label>
            <label className="flex items-start gap-2.5 text-xs text-slate-400" htmlFor="auth-privacy">
              <input id="auth-privacy" type="checkbox" checked={acceptPrivacy} onChange={e => setAcceptPrivacy(e.target.checked)} className="mt-0.5 w-4 h-4 accent-amber-400" />
              <span>Ich habe die <button type="button" onClick={() => setLegalOpen(true)} className="text-amber-400 underline hover:text-amber-300">Datenschutzhinweise</button> gelesen und stimme der Speicherung meiner Kontodaten zu.</span>
            </label>
          </>
        )}

        {error && <p role="alert" className="text-xs text-rose-300 bg-rose-950/30 border border-rose-500/30 rounded-lg px-3 py-2">{error}</p>}
        {info && <p role="status" className="text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 rounded-lg px-3 py-2">{info}</p>}

        <button type="submit" disabled={busy} className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'register' ? <UserPlus className="w-4 h-4" /> : mode === 'forgot' ? <Mail className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          {mode === 'register' ? 'Kostenloses Konto erstellen' : mode === 'login' ? 'Anmelden' : mode === 'forgot' ? 'Link anfordern' : 'Passwort speichern'}
        </button>
      </form>

      <p className="text-xs text-center text-slate-500">
        {mode === 'register' ? 'Schon ein Konto? ' : mode === 'login' ? 'Noch kein Konto? ' : ''}
        <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} className="text-amber-400 hover:text-amber-300 font-semibold">
          {mode === 'login' ? 'Jetzt kostenlos registrieren' : 'Zur Anmeldung'}
        </button>
      </p>
      <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Passwörter werden verschlüsselt gespeichert.
      </p>
      <LegalPagesModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} initialTab="datenschutz" />
    </div>
  );
};

// ---------- Kontomenue im Header ----------
export const AccountMenu: React.FC = () => {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  if (!auth) return null;
  const { user, logout, openAccount } = auth;
  const initials = user.name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const pro = isPro(user);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-[11px] font-bold text-amber-300 flex items-center justify-center" aria-label="Konto" aria-expanded={open}>
        {initials || '?'}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 space-y-2 z-50">
          <div>
            <div className="text-sm font-semibold text-slate-100 truncate">{user.name}</div>
            <div className="text-xs text-slate-400 truncate">{user.email}</div>
            <div className="mt-1.5 flex gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">{user.role === 'owner' ? 'Admin' : 'Mitglied'}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${pro ? 'bg-amber-400 text-slate-950 border-amber-400' : 'border-slate-700 text-slate-400'}`}>{pro ? 'Pro' : 'Free'}</span>
            </div>
          </div>
          <button onClick={() => { setOpen(false); openAccount('profile'); }} className="w-full flex items-center gap-2 text-xs text-slate-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-800">
            <KeyRound className="w-3.5 h-3.5" /> Konto & Mitgliedschaft
          </button>
          {!pro && (
            <button onClick={() => { setOpen(false); openAccount('membership'); }} className="w-full flex items-center gap-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-2 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" /> Auf Pro upgraden
            </button>
          )}
          {pro && user.role !== 'owner' && (
            <button onClick={() => { setOpen(false); openAccount('membership'); }} className="w-full flex items-center gap-2 text-xs text-slate-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-800">
              <CreditCard className="w-3.5 h-3.5" /> Abo verwalten
            </button>
          )}
          <button onClick={logout} className="w-full flex items-center gap-2 text-xs text-rose-300 hover:text-rose-200 px-2 py-1.5 rounded-lg hover:bg-rose-950/30">
            <LogOut className="w-3.5 h-3.5" /> Abmelden
          </button>
          <button onClick={() => setOpen(false)} className="sr-only">Menü schließen <X /></button>
        </div>
      )}
    </div>
  );
};
