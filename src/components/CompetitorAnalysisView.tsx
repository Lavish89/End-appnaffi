import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, ArrowUpRight, TrendingUp, ShieldCheck, Eye, Sparkles } from 'lucide-react';
import { COMPETITORS } from '../data/ecommerceData';
import { Competitor } from '../types';

export const CompetitorAnalysisView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);

  const categories = useMemo(() => {
    const set = new Set(COMPETITORS.map(c => c.category));
    return ['Alle', ...Array.from(set)];
  }, []);

  const filteredCompetitors = useMemo(() => {
    return COMPETITORS.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Alle' || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400">PHASE 1 · WETTBEWERBSANALYSE</div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            20+ Führende Shopify-Shops im Benchmark
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Öffentlich zugängliche Daten, Designmuster, Conversion-Treiber, Preisstrategien und Akquisekanäle erfolgreicher D2C-Marken im DACH- und internationalen Markt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono">
            Untersucht: <strong className="text-amber-400">{COMPETITORS.length} Shops</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Wettbewerber, Domain oder Kategorie suchen..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Categories as clean segmented buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
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
      </div>

      {/* Competitor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompetitors.map((comp) => (
          <div
            key={comp.id}
            onClick={() => setSelectedCompetitor(comp)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 space-y-4 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                    {comp.name}
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{comp.domain}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono tabular-nums text-slate-300 font-medium">~{comp.monthlyTrafficEst}</div>
                  <div className="text-[10px] text-slate-500">Besucher / Mo</div>
                </div>
              </div>

              {/* Category & Hero statement */}
              <div className="text-xs text-slate-400">
                <span className="text-slate-500">Kategorie:</span> <span className="text-slate-300">{comp.category}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 italic">
                "{comp.heroHeadline}"
              </div>

              {/* Color Palette Indicators */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-500">Farbwelt:</span>
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: comp.palette.primary }} title="Primary" />
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: comp.palette.accent }} title="Accent" />
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: comp.palette.secondary }} title="Secondary" />
                </div>
              </div>

              {/* Top Sales Arguments */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] text-slate-500 font-medium">Stärkstes Verkaufsargument:</div>
                <div className="text-xs text-slate-300 line-clamp-2">
                  • {comp.salesArguments[0]}
                </div>
              </div>
            </div>

            {/* Bottom Key Takeaway Badge */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-amber-400/90 font-medium text-[11px]">Empfohlene Übernahme</span>
              <span className="text-slate-400 group-hover:text-slate-200 transition-colors">Details ansehen →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal / Inspector */}
      {selectedCompetitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-100">{selectedCompetitor.name}</h2>
                  <a
                    href={`https://${selectedCompetitor.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-xs"
                  >
                    {selectedCompetitor.domain} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCompetitor.category} · Ø Warenkorb: {selectedCompetitor.avgOrderValue}</p>
              </div>
              <button
                onClick={() => setSelectedCompetitor(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              {/* Traffic Sources Breakdown */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  Traffic- und Akquisekanäle (Geschätzt)
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <div className="text-amber-400 font-bold">{selectedCompetitor.trafficSources.googleOrganic}%</div>
                    <div className="text-[10px] text-slate-500">Google SEO</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <div className="text-amber-400 font-bold">{selectedCompetitor.trafficSources.socialAds}%</div>
                    <div className="text-[10px] text-slate-500">Paid Social</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <div className="text-amber-400 font-bold">{selectedCompetitor.trafficSources.influencers}%</div>
                    <div className="text-[10px] text-slate-500">Creator/UGC</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg">
                    <div className="text-amber-400 font-bold">{selectedCompetitor.trafficSources.email}%</div>
                    <div className="text-[10px] text-slate-500">E-Mail CRM</div>
                  </div>
                </div>
              </div>

              {/* Product Page (PDP) & Sales Arguments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-200">Produktseiten-Stärken (PDP):</h4>
                  <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                    {selectedCompetitor.pdpStrengths.map((str, idx) => (
                      <li key={idx}><span className="text-slate-300">{str}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-200">Verkaufsargumente (USPs):</h4>
                  <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                    {selectedCompetitor.salesArguments.map((arg, idx) => (
                      <li key={idx}><span className="text-slate-300">{arg}</span></li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Trust Signals & Pricing Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Vertrauensaufbau:
                  </h4>
                  <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                    {selectedCompetitor.trustSignals.map((ts, idx) => (
                      <li key={idx}><span className="text-slate-300">{ts}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-semibold text-slate-200">Preis- & Angebotsstrategie:</h4>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedCompetitor.pricingStrategy}
                  </p>
                </div>
              </div>

              {/* Direct Takeaways for our shop */}
              <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl space-y-2">
                <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Konkrete Übernahme für unseren Shop:
                </h4>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {selectedCompetitor.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedCompetitor(null)}
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
