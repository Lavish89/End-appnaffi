import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Percent, 
  RotateCcw, 
  Calculator, 
  FileSpreadsheet, 
  ArrowUpRight,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CONTROLLING_DATA } from '../data/ecommerceData';

export const AnalyticsDashboard: React.FC = () => {
  // Unit Economics Simulator
  const [simVK, setSimVK] = useState(49.90);
  const [simEK, setSimEK] = useState(11.50);
  const [simShipping, setSimShipping] = useState(3.90);
  const [simPaymentRate, setSimPaymentRate] = useState(2.9); // %
  const [simReturnRate, setSimReturnRate] = useState(3.8); // %
  const [simTargetCAC, setSimTargetCAC] = useState(14.00); // Customer Acquisition Cost

  // Calculations
  const simPayment = Number((simVK * (simPaymentRate / 100) + 0.30).toFixed(2));
  const simReturnRisk = Number((simVK * (simReturnRate / 100)).toFixed(2));
  const simDB1 = Number((simVK - simEK - simShipping).toFixed(2));
  const simDB2 = Number((simDB1 - simPayment - simReturnRisk).toFixed(2));
  const simDB2Pct = Number(((simDB2 / simVK) * 100).toFixed(1));
  const simNetProfit = Number((simDB2 - simTargetCAC).toFixed(2));
  const simBreakevenROAS = Number((simVK / simDB2).toFixed(2));
  const simActualROAS = simTargetCAC > 0 ? Number((simVK / simTargetCAC).toFixed(2)) : 0;

  const [reportCopied, setReportCopied] = useState(false);

  const weeklyReportMarkdown = `# WÖCHENTLICHER MANAGEMENT-BERICHT
Shop: Aura Minimalist Studio (DACH)
Datum: KW 43 / 2026

## 1. ERLEDIGTE AUFGABEN DIESE WOCHE:
- Phase 1: 20 marktführende D2C Shopify-Wettbewerber analysiert.
- Phase 2: 30 Top-Produktkandidaten nach 12-Faktoren-Modell bewertet.
- Phase 3: EU-Fulfillment-Hub in Frankfurt (DHL 2-4 Tage) als Standard integriert.
- Phase 4: Staging Theme v2.4 mit Free-Shipping Progress-Bar (€50) und rechtssicherem Impressum/DSGVO/AGB aufgebaut.
- Phase 5: 4 Flaggschiff-Produkte mit vollständigen SKUs, EANs und JSON-LD Schema vorbereitet.
- Phase 6: Omnichannel Marketing-Skripte für TikTok, Instagram, Pinterest & Google Ads generiert.

## 2. KERN-KENNZAHLEN (KPIs):
- Monatliche Besucher: 34.820
- Conversion Rate: 3,42%
- Brutto-Umsatz: 58.940,50 €
- Durchschnittlicher Warenkorbwert (AOV): 49,49 €
- Deckungsbeitrag I (DB I): 41.820,50 € (70,9%)
- Reiner Deckungsbeitrag II (DB II): 37.870,50 € (64,2%)
- Netto-Gewinn nach Marketing: 28.470,50 € (48,3% Umsatzrendite)
- Blended ROAS: 6,27 | Breakeven ROAS: 1,56

## 3. ERKENNTE PROBLEME & ENGPAESSE:
- Warenkorb-Abbrüche liegen bei 64,2% (Branchenüblich, aber durch 3-Stufen Abandoned Cart Flow um 12% optimierbar).
- Retourenrisiko bei Textilartikeln höher als bei Schreibtischunterlagen aus Leder.

## 4. GEPLANTE NAECHSTE SCHRITTE:
- Freigabe des Staging-Themekatalogs durch den Shop-Inhaber.
- Start der organischen TikTok-Unboxing-Kampagne mit Vorher/Nachher-Hook.
- Überwachung der Lagerbestände im Frankfurter Hub.`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(weeklyReportMarkdown);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400">PHASE 7 · ANALYTICS & CONTROLLING</div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Shop Performance & Deckungsbeitrags-Controlling
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Echte Ertragskennzahlen: Reiner Deckungsbeitrag (DB II), Unit Economics, Break-Even ROAS Rechner und automatischer wöchentlicher Geschäftsbericht.
          </p>
        </div>

        <button
          onClick={handleCopyReport}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>{reportCopied ? 'Bericht kopiert!' : 'Wochenbericht exportieren'}</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-xs text-slate-400">Monatlicher Brutto-Umsatz</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {CONTROLLING_DATA.grossRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">1.191 Bestellungen (AOV: {CONTROLLING_DATA.avgOrderValue.toFixed(2)} €)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-xs text-slate-400">Shop Conversion Rate</div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            {CONTROLLING_DATA.conversionRate}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono">{CONTROLLING_DATA.monthlyVisitors.toLocaleString()} Besucher / Mo</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-xs text-slate-400">Reiner Deckungsbeitrag (DB II)</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {CONTROLLING_DATA.contributionMargin2.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">64,2% Netto-Marge vor Ads</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-xs text-slate-400">Blended ROAS / Breakeven</div>
          <div className="text-2xl font-bold text-sky-400 font-mono tabular-nums">
            {CONTROLLING_DATA.blendedROAS}x
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Break-Even ab {CONTROLLING_DATA.breakEvenROAS}x ROAS</div>
        </div>
      </div>

      {/* Interactive Unit Economics & ROAS Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-sm text-slate-100">
                Echtzeit Unit-Economics & ROAS-Breakeven Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Verändere Preise, Frachtkosten oder Werbe-CAC, um den exakten Netto-Ertrag pro Bestellung zu sehen.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            Live Rechner
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Verkaufspreis (VK):</label>
            <input
              type="number"
              value={simVK}
              step="0.5"
              onChange={(e) => setSimVK(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Einkaufspreis (EK):</label>
            <input
              type="number"
              value={simEK}
              step="0.5"
              onChange={(e) => setSimEK(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Versand DE (€):</label>
            <input
              type="number"
              value={simShipping}
              step="0.1"
              onChange={(e) => setSimShipping(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Retourenquote (%):</label>
            <input
              type="number"
              value={simReturnRate}
              step="0.1"
              onChange={(e) => setSimReturnRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Kundenakquise-Kosten (CAC):</label>
            <input
              type="number"
              value={simTargetCAC}
              step="0.5"
              onChange={(e) => setSimTargetCAC(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Zahlungsgebühr (%):</label>
            <input
              type="number"
              value={simPaymentRate}
              step="0.1"
              onChange={(e) => setSimPaymentRate(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Results Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-slate-500 block">Deckungsbeitrag I (DB I):</span>
            <span className="text-white font-bold text-sm">{simDB1.toFixed(2)} €</span>
          </div>

          <div>
            <span className="text-slate-500 block">Deckungsbeitrag II (DB II):</span>
            <span className="text-emerald-400 font-bold text-sm">{simDB2.toFixed(2)} € ({simDB2Pct}%)</span>
          </div>

          <div>
            <span className="text-slate-500 block">Reiner Gewinn nach Ads:</span>
            <span className={`font-bold text-sm ${simNetProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {simNetProfit.toFixed(2)} € pro Order
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Benötigter Break-Even ROAS:</span>
            <span className="text-amber-400 font-bold text-sm">{simBreakevenROAS}x (Ist: {simActualROAS}x)</span>
          </div>
        </div>
      </div>

      {/* Traffic & Acquisition Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-sm text-slate-100">Umsatz nach Akquisekanälen</h3>
          <div className="space-y-3">
            {CONTROLLING_DATA.topAcquisitionChannels.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{item.channel}</span>
                  <span className="text-white font-mono tabular-nums font-semibold">
                    {item.revenue.toLocaleString()} € ({item.share}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${item.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Report Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-100">Wöchentlicher Management-Bericht</h3>
              <span className="text-[11px] font-mono text-emerald-400">Automatisch generiert</span>
            </div>
            <pre className="p-3.5 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-300 overflow-y-auto max-h-56 leading-relaxed border border-slate-800">
              {weeklyReportMarkdown}
            </pre>
          </div>
          <button
            onClick={handleCopyReport}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors"
          >
            {reportCopied ? 'In Zwischenablage kopiert!' : 'Vollständigen Bericht als Markdown kopieren'}
          </button>
        </div>
      </div>
    </div>
  );
};
