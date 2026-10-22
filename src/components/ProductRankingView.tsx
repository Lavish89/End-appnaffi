import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Search, 
  ArrowUpDown, 
  Calculator, 
  ShieldCheck, 
  Video, 
  Truck, 
  ChevronRight, 
  Info,
  DollarSign
} from 'lucide-react';
import { PRODUCT_CANDIDATES } from '../data/ecommerceData';
import { ProductCandidate } from '../types';

export const ProductRankingView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [sortBy, setSortBy] = useState<'rank' | 'db2Percent' | 'db2Amount' | 'viralScore'>('rank');
  const [selectedProduct, setSelectedProduct] = useState<ProductCandidate | null>(null);

  // Calculator customizer in drawer
  const [customVK, setCustomVK] = useState<number>(0);
  const [customEK, setCustomEK] = useState<number>(0);

  const categories = useMemo(() => {
    const set = new Set(PRODUCT_CANDIDATES.map(p => p.category));
    return ['Alle', ...Array.from(set)];
  }, []);

  const sortedAndFiltered = useMemo(() => {
    let list = PRODUCT_CANDIDATES.filter(p => selectedCategory === 'Alle' || p.category === selectedCategory);
    return list.sort((a, b) => {
      if (sortBy === 'rank') return a.rank - b.rank;
      if (sortBy === 'db2Percent') return b.db2Percent - a.db2Percent;
      if (sortBy === 'db2Amount') return b.db2Amount - a.db2Amount;
      if (sortBy === 'viralScore') return b.shortVideoViralScore - a.shortVideoViralScore;
      return 0;
    });
  }, [selectedCategory, sortBy]);

  const handleOpenDetail = (prod: ProductCandidate) => {
    setSelectedProduct(prod);
    setCustomVK(prod.sellingPriceVK);
    setCustomEK(prod.purchasePriceEK);
  };

  // Real-time recalculation in inspector
  const calculatedMetrics = useMemo(() => {
    if (!selectedProduct) return null;
    const vk = customVK || selectedProduct.sellingPriceVK;
    const ek = customEK || selectedProduct.purchasePriceEK;
    const shipping = selectedProduct.shippingCostDE;
    const payment = Number((vk * 0.029 + 0.30).toFixed(2));
    const returnCost = Number((vk * (selectedProduct.estimatedReturnRate / 100)).toFixed(2));
    const db1 = Number((vk - ek - shipping).toFixed(2));
    const db1Pct = Number(((db1 / vk) * 100).toFixed(1));
    const db2 = Number((db1 - payment - returnCost).toFixed(2));
    const db2Pct = Number(((db2 / vk) * 100).toFixed(1));
    return { vk, ek, shipping, payment, returnCost, db1, db1Pct, db2, db2Pct };
  }, [selectedProduct, customVK, customEK]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400">PHASE 2 · PRODUKT-SCORING</div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Rangliste der 30 besten Produktkandidaten
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Bewertet nach dem 12-Faktoren-Modell: Nachfrage, Wettbewerb, Einkaufspreis, Versand DE, Zahlungsgebühren (2.9% + 0.30€), Retourenquote, Lieferzeit, Video-Eignung und EU/GPSR-Konformität.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sortieren:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="rank">Rang (1 bis 30)</option>
            <option value="db2Percent">Höchste DB II % Marge</option>
            <option value="db2Amount">Höchster DB II € Betrag</option>
            <option value="viralScore">Beste Video-Viralität</option>
          </select>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table view with tabular numbers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Produktkandidat & Kategorie</th>
                <th className="py-3 px-4">Suchinteresse DE</th>
                <th className="py-3 px-4 text-right">EK / VK</th>
                <th className="py-3 px-4 text-right">Versand DE</th>
                <th className="py-3 px-4 text-right">Deckungsbeitrag (DB II)</th>
                <th className="py-3 px-4 text-center">Lieferzeit DE</th>
                <th className="py-3 px-4 text-center">Video Viral</th>
                <th className="py-3 px-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedAndFiltered.map((prod) => (
                <tr
                  key={prod.id}
                  onClick={() => handleOpenDetail(prod)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 text-center font-mono text-amber-400 font-semibold">
                    {prod.rank}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                      {prod.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {prod.category} · <span className="text-slate-400">{prod.highlightUSP}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {prod.searchVolumeDE}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                    <div className="text-slate-200 font-semibold">{prod.sellingPriceVK.toFixed(2)} €</div>
                    <div className="text-[11px] text-slate-500">EK: {prod.purchasePriceEK.toFixed(2)} €</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-400">
                    {prod.shippingCostDE.toFixed(2)} €
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                    <div className="text-emerald-400 font-semibold">{prod.db2Amount.toFixed(2)} €</div>
                    <div className="text-[11px] text-slate-400">{prod.db2Percent}% Netto</div>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-300">
                    <span className="font-mono text-[11px] text-emerald-400">{prod.deliveryDaysDE}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className="text-amber-400 font-bold">{prod.shortVideoViralScore}</span>
                    <span className="text-slate-500 text-[10px]"> / 10</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(prod);
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 rounded-md transition-colors"
                    >
                      Kalkulation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed 12-Factor Calculation Drawer/Modal */}
      {selectedProduct && calculatedMetrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono font-bold text-sm">#{selectedProduct.rank}</span>
                  <h2 className="text-base font-bold text-slate-100">{selectedProduct.name}</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedProduct.category} · Status: {selectedProduct.sampleStatus}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              {/* Interactive Price & Cost Simulator */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-400" />
                    Deckungsbeitrags-Wasserfall (DB I & DB II)
                  </div>
                  <span className="text-[11px] text-slate-500">Interaktive Simulation</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Verkaufspreis (VK in €):</label>
                    <input
                      type="number"
                      step="0.50"
                      value={customVK}
                      onChange={(e) => setCustomVK(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Einkaufspreis (EK in €):</label>
                    <input
                      type="number"
                      step="0.50"
                      value={customEK}
                      onChange={(e) => setCustomEK(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Waterfall breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 font-mono text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>1. Brutto-Verkaufspreis (VK):</span>
                    <span className="font-semibold">{calculatedMetrics.vk.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-rose-400/90">
                    <span>- Wareneinsatz (EK):</span>
                    <span>- {calculatedMetrics.ek.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-rose-400/90">
                    <span>- Versandkosten DE (DHL):</span>
                    <span>- {calculatedMetrics.shipping.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-semibold pt-1 border-t border-slate-800/80">
                    <span>= Deckungsbeitrag I (DB I):</span>
                    <span>{calculatedMetrics.db1.toFixed(2)} € ({calculatedMetrics.db1Pct}%)</span>
                  </div>
                  <div className="flex justify-between text-rose-400/80">
                    <span>- Zahlungsgebühren (2.9% + 0.30€):</span>
                    <span>- {calculatedMetrics.payment.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-rose-400/80">
                    <span>- Retouren-Risikorücklage ({selectedProduct.estimatedReturnRate}%):</span>
                    <span>- {calculatedMetrics.returnCost.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold text-sm pt-1.5 border-t border-slate-700">
                    <span>= Reiner Deckungsbeitrag II (DB II):</span>
                    <span>{calculatedMetrics.db2.toFixed(2)} € ({calculatedMetrics.db2Pct}%)</span>
                  </div>
                </div>
              </div>

              {/* 12-Faktoren Bewertung Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-200">Logistik & Lieferant</h4>
                  <p><span className="text-slate-500">Lieferant / Hub:</span> <span className="text-slate-200">{selectedProduct.supplierDE}</span></p>
                  <p><span className="text-slate-500">Lieferzeit DE:</span> <span className="text-emerald-400 font-semibold">{selectedProduct.deliveryDaysDE}</span></p>
                  <p><span className="text-slate-500">Retourenrisiko:</span> <span className="text-slate-200">{selectedProduct.returnRiskScore} ({selectedProduct.estimatedReturnRate}%)</span></p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    EU- & DE-Rechtskonformität
                  </h4>
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div>• GPSR 2024: <span className="text-emerald-400 font-semibold">Konform</span></div>
                    <div>• LUCID VerpackG: <span className="text-emerald-400 font-semibold">Erfüllt</span></div>
                    <div>• CE/WEEE: {selectedProduct.euLegalCompliance.ceMark ? <span className="text-amber-400">Zertifiziert</span> : <span>Nicht erforderlich</span>}</div>
                    <div className="text-slate-500 pt-1">{selectedProduct.euLegalCompliance.notes}</div>
                  </div>
                </div>
              </div>

              {/* Short Video Viral Hook Idea */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                <div className="font-semibold text-slate-200 flex items-center gap-2">
                  <Video className="w-4 h-4 text-amber-400" />
                  Eignung für kurze Videos (Viralitäts-Score: {selectedProduct.shortVideoViralScore}/10)
                </div>
                <p className="text-xs text-slate-400">
                  Ideal für Vorher/Nachher-Demonstrationen, Klick-Effekte, haptische Unboxings und ASMR-Desk-Setups.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">Exakte Kalkulation nach DACH-E-Commerce Standards</span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
