// Kleine Helfer fuer API-Aufrufe der Community-Seiten.
export const getJson = async <T = any>(url: string): Promise<T> => {
  const r = await fetch(url, { credentials: 'same-origin' });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.success === false) throw new Error(d.error || 'Laden fehlgeschlagen.');
  return d;
};
export const postJson = async <T = any>(url: string, body: unknown = {}): Promise<T> => {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.success === false) throw new Error(d.error || 'Aktion fehlgeschlagen.');
  return d;
};
export const timeAgo = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'gerade eben';
  if (s < 3600) return `vor ${Math.floor(s / 60)} Min.`;
  if (s < 86400) return `vor ${Math.floor(s / 3600)} Std.`;
  if (s < 7 * 86400) return `vor ${Math.floor(s / 86400)} Tag${s >= 172800 ? 'en' : ''}`;
  return new Date(iso).toLocaleDateString('de-DE');
};
export const ui = {
  card: 'bg-slate-900/60 border border-slate-800 rounded-2xl p-5',
  input: 'w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/70',
  primary: 'px-3.5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors',
  ghost: 'px-2.5 py-1.5 text-xs text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40',
};
