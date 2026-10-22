import React, { useMemo, useState } from 'react';
import { Search, Copy, Check, Play, Sparkles, Wrench } from 'lucide-react';
import type { MarketingTool, ToolValues } from '../data/marketingTools';
import { ALL_TOOLS as MARKETING_TOOLS, ALL_CATEGORIES as TOOL_CATEGORIES } from '../data/allTools';
type ToolCategory = string;

const defaultsFor = (tool: MarketingTool): ToolValues =>
  Object.fromEntries(tool.fields.map(f => [f.key, f.default !== undefined ? String(f.default) : '']));

const inputCls =
  'w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60';

export const MarketingToolkit: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ToolCategory | 'Alle'>('Alle');
  const [activeId, setActiveId] = useState<string>(MARKETING_TOOLS[0].id);
  const [values, setValues] = useState<Record<string, ToolValues>>({});
  const [result, setResult] = useState<{ id: string; text: string; error?: boolean } | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MARKETING_TOOLS.filter(
      tl =>
        (category === 'Alle' || tl.category === category) &&
        (!q || tl.name.toLowerCase().includes(q) || tl.description.toLowerCase().includes(q)),
    );
  }, [query, category]);

  const active = MARKETING_TOOLS.find(tl => tl.id === activeId) || MARKETING_TOOLS[0];
  const activeValues = values[active.id] || defaultsFor(active);

  const setField = (key: string, val: string) =>
    setValues(prev => ({ ...prev, [active.id]: { ...(prev[active.id] || defaultsFor(active)), [key]: val } }));

  const run = async () => {
    setRunning(true);
    setCopied(false);
    try {
      const text = await active.run(activeValues);
      setResult({ id: active.id, text: text || 'Kein Ergebnis.' });
    } catch (e: any) {
      setResult({ id: active.id, text: e?.message || 'Fehler bei der Berechnung.', error: true });
    } finally {
      setRunning(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Zwischenablage nicht verfuegbar */
    }
  };

  const selectTool = (id: string) => {
    setActiveId(id);
    setResult(null);
    setCopied(false);
  };

  const shownResult = result && result.id === active.id ? result : null;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Marketing-Toolkit
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {MARKETING_TOOLS.length} Werkzeuge für Kalkulation, Anzeigen, SEO, Content, Influencer, Finanzen, Produktivität und mehr. Alle Ergebnisse basieren nur auf deinen Eingaben.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tool suchen …"
            aria-label="Tool suchen"
            className={`${inputCls} pl-9`}
          />
        </div>
      </div>

      <div className="text-xs text-slate-300 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center gap-2">
        <span className="text-amber-300 font-semibold">Neu hier? Starte mit diesen drei:</span>
        {['unit-economics', 'utm', 'hooks'].map(id => {
          const tl = MARKETING_TOOLS.find(x => x.id === id);
          return tl ? (
            <button key={id} onClick={() => { setCategory('Alle'); setQuery(''); selectTool(id); }} className="px-2 py-1 rounded-md border border-slate-700 hover:border-amber-400/60 hover:text-white">
              {tl.name}
            </button>
          ) : null;
        })}
        <span className="text-slate-500">Felder sind mit Beispielwerten gefüllt – einfach „Berechnen“ tippen und dann eigene Zahlen eintragen.</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(['Alle', ...TOOL_CATEGORIES] as const).map(c => {
          const count = c === 'Alle' ? MARKETING_TOOLS.length : MARKETING_TOOLS.filter(tl => tl.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap border transition-colors ${
                category === c
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold'
                  : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {c} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        {/* Tool-Liste */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-2 max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 && <p className="text-xs text-slate-500 p-3">Kein Tool gefunden.</p>}
          {filtered.map(tl => (
            <button
              key={tl.id}
              onClick={() => selectTool(tl.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                tl.id === active.id ? 'bg-amber-500/10 border border-amber-500/30' : 'border border-transparent hover:bg-slate-800/60'
              }`}
            >
              <div className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-mono w-5">{MARKETING_TOOLS.indexOf(tl) + 1}</span>
                {tl.name}
                {tl.usesAi && <Sparkles className="w-3 h-3 text-amber-400" aria-label="nutzt KI" />}
              </div>
              <div className="text-[11px] text-slate-500 pl-6 leading-snug">{tl.category} · {tl.description}</div>
            </button>
          ))}
        </div>

        {/* Aktives Tool */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 min-w-0">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-amber-400 font-semibold">{active.category}</div>
            <h3 className="text-lg font-semibold text-slate-100">{active.name}</h3>
            <p className="text-xs text-slate-400">{active.description}</p>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              run();
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {active.fields.map(f => {
              const id = `${active.id}-${f.key}`;
              const wide = f.type === 'textarea';
              return (
                <label key={f.key} htmlFor={id} className={`space-y-1 ${wide ? 'sm:col-span-2' : ''}`}>
                  <span className="text-xs text-slate-400">{f.label}</span>
                  {f.type === 'textarea' ? (
                    <textarea
                      id={id}
                      rows={5}
                      value={activeValues[f.key] ?? ''}
                      placeholder={f.placeholder}
                      onChange={e => setField(f.key, e.target.value)}
                      className={inputCls}
                    />
                  ) : f.type === 'select' ? (
                    <select id={id} value={activeValues[f.key] ?? ''} onChange={e => setField(f.key, e.target.value)} className={inputCls}>
                      {(f.options || []).map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={id}
                      type={f.type === 'number' ? 'number' : 'text'}
                      inputMode={f.type === 'number' ? 'decimal' : undefined}
                      step="any"
                      value={activeValues[f.key] ?? ''}
                      placeholder={f.placeholder}
                      onChange={e => setField(f.key, e.target.value)}
                      className={inputCls}
                    />
                  )}
                </label>
              );
            })}
            <div className="sm:col-span-2 flex gap-2">
              <button
                type="submit"
                disabled={running}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-semibold text-sm rounded-lg flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                {running ? 'Läuft …' : 'Berechnen'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setValues(prev => ({ ...prev, [active.id]: defaultsFor(active) }));
                  setResult(null);
                }}
                className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg"
              >
                Zurücksetzen
              </button>
            </div>
          </form>

          {shownResult && (
            <div
              role="status"
              className={`relative rounded-xl border p-4 ${shownResult.error ? 'border-rose-500/40 bg-rose-950/20' : 'border-slate-800 bg-slate-950'}`}
            >
              {!shownResult.error && (
                <button
                  onClick={copy}
                  className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-100 rounded-md hover:bg-slate-800"
                  aria-label="Ergebnis kopieren"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
              <pre className={`whitespace-pre-wrap break-words text-sm font-mono pr-8 ${shownResult.error ? 'text-rose-300' : 'text-slate-200'}`}>
                {shownResult.text}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
