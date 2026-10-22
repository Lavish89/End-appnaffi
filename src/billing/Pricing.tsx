import React, { useEffect, useState } from 'react';
import { Check, Minus, Sparkles } from 'lucide-react';
import { BillingSettings, DEFAULT_BILLING, Interval, PLAN_FEATURES, formatPrice, yearlySavingPercent } from './plans';

export function useBillingSettings() {
  const [s, setS] = useState<{ settings: BillingSettings; paymentsEnabled: boolean; testMode?: boolean }>({ settings: DEFAULT_BILLING, paymentsEnabled: false });
  useEffect(() => {
    fetch('/api/billing/plans')
      .then(r => r.json())
      .then(d => d.success && setS({ settings: d.settings, paymentsEnabled: d.paymentsEnabled, testMode: d.testMode }))
      .catch(() => {});
  }, []);
  return s;
}

const Cell: React.FC<{ v: string | boolean }> = ({ v }) =>
  v === true ? <Check className="w-4 h-4 text-emerald-400" aria-label="enthalten" /> : v === false ? <Minus className="w-4 h-4 text-slate-600" aria-label="nicht enthalten" /> : <span className="text-xs text-slate-200">{v}</span>;

export const Pricing: React.FC<{
  onChoose: (plan: 'free' | 'pro', interval: Interval) => void;
  currentPlan?: 'free' | 'pro';
  freeLabel?: string;
  proLabel?: string;
}> = ({ onChoose, currentPlan, freeLabel = 'Kostenlos starten', proLabel = 'Pro wählen' }) => {
  const { settings } = useBillingSettings();
  const [interval, setIv] = useState<Interval>('year');
  const saving = yearlySavingPercent(settings);
  const price = interval === 'year' ? settings.priceYearCents : settings.priceMonthCents;
  const perMonth = interval === 'year' ? settings.priceYearCents / 12 : settings.priceMonthCents;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="inline-grid grid-cols-2 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl" role="radiogroup" aria-label="Abrechnung">
          {(['month', 'year'] as Interval[]).map(i => (
            <button
              key={i}
              role="radio"
              aria-checked={interval === i}
              onClick={() => setIv(i)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${interval === i ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {i === 'month' ? 'Monatlich' : 'Jährlich'}
              {i === 'year' && saving > 0 && <span className={`ml-1.5 text-[10px] ${interval === i ? 'text-slate-800' : 'text-emerald-300'}`}>−{saving} %</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-300">Free</div>
            <div className="text-3xl font-bold text-slate-100 mt-1">0 €</div>
            <div className="text-xs text-slate-500">für immer</div>
          </div>
          <p className="text-sm text-slate-400">Alles, um mit Affiliate-Marketing zu starten.</p>
          <button
            onClick={() => onChoose('free', interval)}
            disabled={currentPlan === 'free'}
            className="mt-auto w-full py-2.5 text-sm font-semibold rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
          >
            {currentPlan === 'free' ? 'Dein aktueller Plan' : freeLabel}
          </button>
        </div>

        <div className="relative bg-slate-900 border-2 border-amber-400/70 rounded-2xl p-6 flex flex-col gap-4 shadow-xl shadow-amber-500/5">
          <span className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-1 rounded-md flex items-center gap-1"><Sparkles className="w-3 h-3" /> Beliebt</span>
          <div>
            <div className="text-sm font-semibold text-amber-300">Pro</div>
            <div className="text-3xl font-bold text-slate-100 mt-1 font-mono tabular-nums">{formatPrice(price)}</div>
            <div className="text-xs text-slate-500">
              {interval === 'year' ? `pro Jahr · entspricht ${formatPrice(Math.round(perMonth))} im Monat` : 'pro Monat · monatlich kündbar'}
            </div>
          </div>
          <p className="text-sm text-slate-300">Unbegrenzt Links, alle Automationen, KI-Texte und Link-Prüfung.{settings.trialDays > 0 ? ` ${settings.trialDays} Tage kostenlos testen.` : ''}</p>
          <button
            onClick={() => onChoose('pro', interval)}
            disabled={currentPlan === 'pro'}
            className="mt-auto w-full py-2.5 text-sm font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-50"
          >
            {currentPlan === 'pro' ? 'Dein aktueller Plan' : proLabel}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-slate-900/40 border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
              <th className="p-3 font-medium">Funktion</th>
              <th className="p-3 font-medium text-center w-24">Free</th>
              <th className="p-3 font-medium text-center w-24 text-amber-300">Pro</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_FEATURES.map(f => (
              <tr key={f.label} className="border-b border-slate-800/60 last:border-0">
                <td className="p-3 text-slate-300">{f.label}</td>
                <td className="p-3"><div className="flex justify-center"><Cell v={f.free} /></div></td>
                <td className="p-3"><div className="flex justify-center"><Cell v={f.pro} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-center text-slate-500">{settings.priceNote}</p>
    </div>
  );
};
