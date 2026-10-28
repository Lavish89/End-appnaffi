import React from 'react';
import { Truck, ShieldCheck, AlertTriangle, Globe, Clock } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  region: string;
  euCompliant: boolean;
  deliveryDaysDE: string;
  categories: string;
  note: string;
}

const SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'EU-Lager (DE) – Fulfillment-Partner', region: 'Deutschland', euCompliant: true, deliveryDaysDE: '1–3 Tage', categories: 'Kraft, Zubehör, Regeneration', note: 'Schnellster Versand, beste Retourenquote.' },
  { id: 's2', name: 'EU-Lager (NL)', region: 'Niederlande', euCompliant: true, deliveryDaysDE: '2–4 Tage', categories: 'Cardio, Mobility', note: 'Gute Preise, EU-konform.' },
  { id: 's3', name: 'EU-Lager (PT) – nachhaltig', region: 'Portugal', euCompliant: true, deliveryDaysDE: '3–5 Tage', categories: 'Yoga, Kork-Produkte', note: 'Nachhaltige Materialien, Öko-Fokus.' },
  { id: 's4', name: 'Import (CN) + EU-Bevollmächtigter', region: 'China → EU', euCompliant: false, deliveryDaysDE: '8–15 Tage', categories: 'Elektronik, Rotlicht', note: 'Nur mit EU-Responsible-Person (GPSR) & CE-Nachweis einsetzen.' },
];

export const SupplierAuditView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <div className="text-xs font-mono text-amber-400">PHASE 3 · LIEFERANTEN-AUDIT</div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">Lieferanten &amp; GPSR-Konformität</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Bewertung nach Lieferzeit DE, EU-Konformität (GPSR 2024) und Eignung. EU-Lager werden bevorzugt –
          sie sind schneller und rechtlich einfacher.
        </p>
      </div>

      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>GPSR 2024:</strong> Bei Import aus Nicht-EU-Ländern brauchst du einen „verantwortlichen
          Wirtschaftsakteur" in der EU und Produktsicherheits-Infos. Deshalb: EU-Lieferanten bevorzugen.
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono">
                <th className="py-3 px-4">Lieferant</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Lieferzeit DE</th>
                <th className="py-3 px-4">Kategorien</th>
                <th className="py-3 px-4">GPSR / EU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SUPPLIERS.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-slate-500" />{s.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{s.note}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300"><span className="inline-flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-slate-500" />{s.region}</span></td>
                  <td className="py-3 px-4"><span className="inline-flex items-center gap-1 text-emerald-400 font-mono"><Clock className="w-3.5 h-3.5" />{s.deliveryDaysDE}</span></td>
                  <td className="py-3 px-4 text-slate-400">{s.categories}</td>
                  <td className="py-3 px-4">
                    {s.euCompliant ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold"><ShieldCheck className="w-3.5 h-3.5" />EU-konform</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-semibold"><AlertTriangle className="w-3.5 h-3.5" />EU-RP nötig</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
