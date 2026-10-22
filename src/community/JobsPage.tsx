import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Plus, Search, Flag, Trash2, X, Users, Check, Loader2, MapPin, Calendar, Lock, Unlock } from 'lucide-react';
import { Job, JobApplication, JOB_TYPES, JOB_PLATFORMS } from './shared';
import { getJson, postJson, timeAgo, ui } from './api';
import { useAuth } from '../auth/AuthGate';

type JobRow = Job & { reported?: boolean; applied?: boolean; reportCount?: number };
type Sub = 'find' | 'post' | 'mine';

export const JobsPage: React.FC = () => {
  const auth = useAuth();
  const [sub, setSub] = useState<Sub>('find');
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [apps, setApps] = useState<{ received: JobApplication[]; sent: JobApplication[] }>({ received: [], sent: [] });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [open, setOpen] = useState<JobRow | null>(null);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [platform, setPlatform] = useState('');
  const test = Boolean((window as any).__GF_TEST__);

  const load = async () => {
    try {
      const [j, a] = await Promise.all([getJson('/api/jobs'), getJson('/api/jobs/applications')]);
      setJobs(j.jobs);
      setApps(a);
    } catch (e: any) {
      setErr(e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => jobs.filter(j => j.status === 'open' && j.ownerId !== auth?.user.id && (!type || j.type === type) && (!platform || j.platforms.includes(platform)) && (!q || `${j.title} ${j.company} ${j.niche} ${j.description}`.toLowerCase().includes(q.toLowerCase()))), [jobs, q, type, platform, auth]);
  const mine = jobs.filter(j => j.ownerId === auth?.user.id);
  const newApps = apps.received.filter(a => a.status === 'neu').length;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400">Jobbörse</div>
          <h2 className="text-xl font-bold text-slate-100">Kooperationen & Aufträge für Creator</h2>
          <p className="text-xs text-slate-400 mt-1">Marken und Creator finden sich hier: bezahlte Kooperationen, UGC-Aufträge, Affiliate-Partnerschaften.</p>
        </div>
        <div className="flex gap-1.5" role="tablist">
          {([['find', 'Jobs finden'], ['post', 'Job einstellen'], ['mine', `Meine Jobs${newApps ? ` (${newApps} neu)` : ''}`]] as [Sub, string][]).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={sub === k} onClick={() => { setSub(k); setMsg(''); }} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${sub === k ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>{l}</button>
          ))}
        </div>
      </div>
      {test && <p className="text-xs text-sky-200 bg-sky-500/10 border border-sky-500/30 rounded-xl px-4 py-2.5">Testversion: Jobs und Bewerbungen bleiben nur in diesem Browser. Mit einem zweiten Konto kannst du dich auf deine eigenen Jobs bewerben.</p>}
      {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
      {msg && <p role="status" className="text-xs text-emerald-300">{msg}</p>}

      {sub === 'find' && (
        <>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Suchen: Nische, Marke, Stichwort …" aria-label="Jobs suchen" className={`${ui.input} pl-9`} />
            </div>
            <select aria-label="Art" value={type} onChange={e => setType(e.target.value)} className={`${ui.input} !w-auto`}><option value="">Alle Arten</option>{JOB_TYPES.map(t => <option key={t}>{t}</option>)}</select>
            <select aria-label="Plattform" value={platform} onChange={e => setPlatform(e.target.value)} className={`${ui.input} !w-auto`}><option value="">Alle Plattformen</option>{JOB_PLATFORMS.map(t => <option key={t}>{t}</option>)}</select>
          </div>
          {filtered.length === 0 ? (
            <div className={`${ui.card} text-center space-y-2 py-10`}>
              <Briefcase className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm text-slate-400">{jobs.length ? 'Keine Jobs zu deinen Filtern.' : 'Noch keine offenen Jobs.'}</p>
              <button onClick={() => setSub('post')} className={`${ui.primary} mx-auto`}><Plus className="w-3.5 h-3.5" /> Ersten Job einstellen</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(j => <JobCard key={j.id} job={j} onOpen={() => setOpen(j)} />)}
            </div>
          )}
        </>
      )}

      {sub === 'post' && <PostJob onDone={async () => { await load(); setSub('mine'); setMsg('Dein Job ist online.'); }} />}

      {sub === 'mine' && (
        <div className="space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">Meine Jobs ({mine.length})</h3>
            {mine.length === 0 && <p className="text-xs text-slate-500">Du hast noch keinen Job eingestellt.</p>}
            {mine.map(j => (
              <div key={j.id} className={`${ui.card} !p-4 space-y-3`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100 flex items-center gap-2 flex-wrap">{j.title} <span className={`text-[10px] px-1.5 py-0.5 rounded border ${j.status === 'open' ? 'border-emerald-500/40 text-emerald-300' : 'border-slate-700 text-slate-400'}`}>{j.status === 'open' ? 'offen' : 'geschlossen'}</span></div>
                    <div className="text-[11px] text-slate-500">{j.type} · eingestellt {timeAgo(j.createdAt)} · {j.applications || 0} Bewerbungen</div>
                  </div>
                  <div className="flex gap-2">
                    <button className={ui.ghost} onClick={async () => { await postJson('/api/jobs/close', { id: j.id }); load(); }}>{j.status === 'open' ? <><Lock className="w-3.5 h-3.5" /> Schließen</> : <><Unlock className="w-3.5 h-3.5" /> Wieder öffnen</>}</button>
                    <button className={`${ui.ghost} hover:!text-rose-300`} onClick={async () => { await postJson('/api/jobs/delete', { id: j.id }); load(); }} aria-label={`${j.title} löschen`}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {apps.received.filter(a => a.jobId === j.id).map(a => (
                  <div key={a.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-100">{a.name} <span className="text-[11px] font-normal text-slate-500">· {timeAgo(a.at)}{a.followers ? ` · ${a.followers.toLocaleString('de-DE')} Follower` : ''}</span></div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${a.status === 'angenommen' ? 'border-emerald-500/40 text-emerald-300' : a.status === 'abgelehnt' ? 'border-rose-500/40 text-rose-300' : 'border-amber-500/40 text-amber-300'}`}>{a.status}</span>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap">{a.message}</p>
                    {a.links && <p className="text-[11px] text-slate-400 break-all">Links: {a.links}</p>}
                    <p className="text-[11px] text-slate-400">E-Mail: <span className="text-slate-200 select-all">{a.email}</span></p>
                    {a.status !== 'angenommen' && a.status !== 'abgelehnt' && (
                      <div className="flex gap-2 pt-1">
                        <button className={ui.primary} onClick={async () => { await postJson('/api/jobs/applications/status', { id: a.id, status: 'angenommen' }); load(); }}><Check className="w-3.5 h-3.5" /> Annehmen</button>
                        <button className={ui.ghost} onClick={async () => { await postJson('/api/jobs/applications/status', { id: a.id, status: 'abgelehnt' }); load(); }}>Absagen</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-100">Meine Bewerbungen ({apps.sent.length})</h3>
            {apps.sent.length === 0 && <p className="text-xs text-slate-500">Du hast dich noch nicht beworben.</p>}
            {apps.sent.map(a => (
              <div key={a.id} className="bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-200 truncate">{a.jobTitle}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${a.status === 'angenommen' ? 'border-emerald-500/40 text-emerald-300' : a.status === 'abgelehnt' ? 'border-rose-500/40 text-rose-300' : 'border-slate-700 text-slate-400'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {open && <JobDetail job={open} onClose={() => setOpen(null)} onChanged={async () => { await load(); }} />}
    </div>
  );
};

const JobCard: React.FC<{ job: JobRow; onOpen: () => void }> = ({ job: j, onOpen }) => (
  <button onClick={onOpen} className={`${ui.card} !p-4 text-left space-y-2 hover:border-amber-400/40 transition-colors`}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-100">{j.title}</div>
        <div className="text-xs text-slate-400">{j.company}</div>
      </div>
      {j.applied && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shrink-0">beworben</span>}
    </div>
    <div className="flex flex-wrap gap-1.5">
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-200">{j.type}</span>
      {j.platforms.map(p => <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{p}</span>)}
    </div>
    <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
      {j.budget && <span>💶 {j.budget}</span>}
      {j.minFollowers > 0 && <span>ab {j.minFollowers.toLocaleString('de-DE')} Follower</span>}
      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>
      <span>{timeAgo(j.createdAt)}</span>
    </div>
  </button>
);

const JobDetail: React.FC<{ job: JobRow; onClose: () => void; onChanged: () => void }> = ({ job: j, onClose, onChanged }) => {
  const [message, setMessage] = useState('');
  const [links, setLinks] = useState('');
  const [followers, setFollowers] = useState('');
  const [share, setShare] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(j.applied || false);
  const [busy, setBusy] = useState(false);
  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await postJson('/api/jobs/apply', { jobId: j.id, message, links, followers: Number(followers) || 0, shareEmail: share });
      setDone(true);
      onChanged();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[60] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="jobd-title">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="jobd-title" className="text-lg font-bold text-slate-100">{j.title}</h2>
            <div className="text-sm text-slate-400">{j.company} · eingestellt von {j.ownerName}</div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white" aria-label="Schließen"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-200">{j.type}</span>
          {j.platforms.map(p => <span key={p} className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{p}</span>)}
        </div>
        <dl className="grid grid-cols-2 gap-3 text-xs">
          {[['Budget', j.budget || 'nach Absprache'], ['Mindest-Follower', j.minFollowers ? j.minFollowers.toLocaleString('de-DE') : 'keine'], ['Nische', j.niche || '–'], ['Ort', j.location], ['Bewerbungsschluss', j.deadline ? new Date(j.deadline).toLocaleDateString('de-DE') : 'offen'], ['Eingestellt', timeAgo(j.createdAt)]].map(([k, v]) => (
            <div key={k} className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5"><dt className="text-slate-500">{k}</dt><dd className="text-slate-200 font-medium">{v}</dd></div>
          ))}
        </dl>
        <p className="text-sm text-slate-300 whitespace-pre-wrap">{j.description}</p>

        {done ? (
          <div role="status" className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-200">Bewerbung gesendet. Du bekommst eine Benachrichtigung, sobald der Anbieter antwortet.</div>
        ) : (
          <form onSubmit={apply} className="space-y-3 border-t border-slate-800 pt-4">
            <h3 className="text-sm font-semibold text-slate-100">Jetzt bewerben</h3>
            <label htmlFor="ap-msg" className="block space-y-1"><span className="text-xs text-slate-400">Warum passt du? (mind. 20 Zeichen)</span><textarea id="ap-msg" rows={4} className={ui.input} value={message} onChange={e => setMessage(e.target.value)} placeholder="Kurz zu dir, deiner Zielgruppe und einer Idee für den Job …" /></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label htmlFor="ap-links" className="space-y-1"><span className="text-xs text-slate-400">Profil-Links</span><input id="ap-links" className={ui.input} value={links} onChange={e => setLinks(e.target.value)} placeholder="instagram.com/…, tiktok.com/@…" /></label>
              <label htmlFor="ap-followers" className="space-y-1"><span className="text-xs text-slate-400">Follower (gesamt)</span><input id="ap-followers" type="number" inputMode="numeric" className={ui.input} value={followers} onChange={e => setFollowers(e.target.value)} /></label>
            </div>
            <label htmlFor="ap-share" className="flex items-start gap-2 text-xs text-slate-400"><input id="ap-share" type="checkbox" className="mt-0.5 w-4 h-4 accent-amber-400" checked={share} onChange={e => setShare(e.target.checked)} /> Der Anbieter darf meinen Namen, meine E-Mail-Adresse und meine Angaben sehen, um mich zu kontaktieren.</label>
            {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button type="submit" disabled={busy} className={ui.primary}>{busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />} Bewerbung senden</button>
              <button type="button" disabled={j.reported} onClick={async () => { await postJson('/api/jobs/report', { id: j.id }); onChanged(); onClose(); }} className="text-[11px] text-slate-500 hover:text-rose-300 flex items-center gap-1 disabled:text-rose-400"><Flag className="w-3 h-3" /> {j.reported ? 'Gemeldet' : 'Job melden'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const PostJob: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [f, setF] = useState({ title: '', company: '', type: JOB_TYPES[0], niche: '', budget: '', minFollowers: '', location: 'Remote', deadline: '', description: '' });
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF(x => ({ ...x, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await postJson('/api/jobs', { ...f, minFollowers: Number(f.minFollowers) || 0, platforms });
      onDone();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  const field = (k: keyof typeof f, label: string, el: React.ReactNode, wide = false) => <label htmlFor={`job-${k}`} className={`space-y-1 min-w-0 ${wide ? 'sm:col-span-2' : ''}`}><span className="text-xs text-slate-400">{label}</span>{el}</label>;
  return (
    <form onSubmit={submit} className={`${ui.card} grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl`}>
      {field('title', 'Titel', <input id="job-title" className={ui.input} value={f.title} onChange={e => set('title', e.target.value)} placeholder="z. B. UGC-Video für Fitness-Produkt" />, true)}
      {field('company', 'Marke / Firma (optional)', <input id="job-company" className={ui.input} value={f.company} onChange={e => set('company', e.target.value)} />)}
      {field('type', 'Art', <select id="job-type" className={ui.input} value={f.type} onChange={e => set('type', e.target.value)}>{JOB_TYPES.map(t => <option key={t}>{t}</option>)}</select>)}
      <fieldset className="sm:col-span-2 space-y-1.5">
        <legend className="text-xs text-slate-400">Plattformen</legend>
        <div className="flex flex-wrap gap-1.5">
          {JOB_PLATFORMS.map(p => (
            <button type="button" key={p} aria-pressed={platforms.includes(p)} onClick={() => setPlatforms(x => (x.includes(p) ? x.filter(y => y !== p) : [...x, p]))} className={`px-2.5 py-1 text-xs rounded-full border ${platforms.includes(p) ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}>{p}</button>
          ))}
        </div>
      </fieldset>
      {field('niche', 'Nische', <input id="job-niche" className={ui.input} value={f.niche} onChange={e => set('niche', e.target.value)} placeholder="z. B. Fitness, Beauty, Tech" />)}
      {field('budget', 'Budget / Vergütung', <input id="job-budget" className={ui.input} value={f.budget} onChange={e => set('budget', e.target.value)} placeholder="z. B. 150–250 € oder Produkt" />)}
      {field('minFollowers', 'Mindest-Follower (optional)', <input id="job-minFollowers" type="number" inputMode="numeric" className={ui.input} value={f.minFollowers} onChange={e => set('minFollowers', e.target.value)} />)}
      {field('location', 'Ort', <input id="job-location" className={ui.input} value={f.location} onChange={e => set('location', e.target.value)} />)}
      {field('deadline', 'Bewerbungsschluss (optional)', <input id="job-deadline" type="date" className={ui.input} value={f.deadline} onChange={e => set('deadline', e.target.value)} />)}
      {field('description', 'Beschreibung (mind. 30 Zeichen)', <textarea id="job-description" rows={6} className={ui.input} value={f.description} onChange={e => set('description', e.target.value)} placeholder="Was genau soll entstehen? Bis wann? Was bekommt der Creator? Welche Rechte brauchst du?" />, true)}
      <p className="sm:col-span-2 text-[11px] text-slate-500 flex items-start gap-1.5"><Calendar className="w-3.5 h-3.5 shrink-0" /> Bewerber sehen deinen Namen. Du siehst Name, E-Mail und Angaben der Bewerber. Bezahlte Kooperationen müssen als Werbung gekennzeichnet werden.</p>
      {err && <p role="alert" className="sm:col-span-2 text-xs text-rose-300">{err}</p>}
      <div className="sm:col-span-2"><button type="submit" disabled={busy} className={ui.primary}>{busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Job veröffentlichen</button></div>
    </form>
  );
};
