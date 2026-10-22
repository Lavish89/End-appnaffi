import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle2, 
  Sliders, 
  DollarSign, 
  TrendingUp, 
  Share2, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Eye, 
  MousePointer, 
  Zap, 
  Target,
  RefreshCcw,
  Check
} from 'lucide-react';
import { CATALOG_PRODUCTS } from '../data/ecommerceData';

interface AdPlatform {
  id: string;
  platform: string;
  icon: string;
  status: string;
  dailyBudget: string;
  targetROAS: string;
  activeAdFormat: string;
  audience: string;
  impressionsToday: number;
  clicksToday: number;
  ctr: string;
  spendToday: number;
  conversions: number;
  syncedCreative: string;
}

export const MultiPlatformAdAutopilot: React.FC = () => {
  const [platforms, setPlatforms] = useState<AdPlatform[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(CATALOG_PRODUCTS[0].title);
  const [customHook, setCustomHook] = useState('„Warum 92% aller Schreibtisch-Arbeiter mit Rückenschmerzen kämpfen – und wie dieses 1 Teil sofort hilft.“');
  const [targetROAS, setTargetROAS] = useState('3.8');
  const [isLaunching, setIsLaunching] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = () => {
    fetch('/api/autopilot/status')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.platforms) {
          setPlatforms(data.platforms);
        }
      })
      .catch(console.error);
  };

  const handleLaunchAll = async () => {
    setIsLaunching(true);
    setStatusNotification('Verbinde mit TikTok Ads API, Meta Marketing API, Google Ads API & Pinterest API...');
    try {
      const res = await fetch('/api/autopilot/launch-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: selectedProduct,
          customHook,
          targetROAS: parseFloat(targetROAS) || 3.8,
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlatforms(data.platforms);
        setStatusNotification(data.message);
        setTimeout(() => setStatusNotification(null), 6000);
      }
    } catch (err: any) {
      alert(`Fehler beim automatischen Werbe-Start: ${err.message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleTogglePlatform = async (platformId: string) => {
    try {
      const res = await fetch('/api/autopilot/toggle-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId }),
      });
      const data = await res.json();
      if (data.success) {
        setPlatforms(data.platforms);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const totalSpend = platforms.reduce((acc, p) => acc + p.spendToday, 0);
  const totalConversions = platforms.reduce((acc, p) => acc + p.conversions, 0);
  const totalClicks = platforms.reduce((acc, p) => acc + p.clicksToday, 0);
  const totalImpressions = platforms.reduce((acc, p) => acc + p.impressionsToday, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400">OMNICHANNEL AD AUTOPILOT</div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Automatischer Multi-Plattform Werbe-Pilot
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Wirb vollautomatisch und synchronisiert auf allen führenden Kanälen: TikTok Ads, Meta (Instagram & Facebook), Google Ads (PMax), Pinterest Shopping, YouTube Shorts und E-Mail Automation.
          </p>
        </div>

        {/* Master Autopilot Switch */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl self-start md:self-auto">
          <span className="text-xs text-slate-300 font-medium">Werbe-Autopilot:</span>
          <button
            onClick={() => setAutopilotEnabled(!autopilotEnabled)}
            className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
              autopilotEnabled
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {autopilotEnabled ? 'AUTO-PILOT AKTIV' : 'PAUSIERT'}
          </button>
        </div>
      </div>

      {statusNotification && (
        <div className="p-3.5 bg-slate-900 border border-amber-500/50 rounded-xl text-xs text-amber-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{statusNotification}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Overview across ALL Advertising Platforms */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            Gesamtreichweite heute
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalImpressions.toLocaleString('de-DE')}
          </div>
          <div className="text-[11px] text-slate-500">Impressionen auf allen 6 Kanälen</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <MousePointer className="w-3.5 h-3.5 text-sky-400" />
            Qualifizierte Shop-Klicks
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalClicks.toLocaleString('de-DE')}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">Ø CTR: {((totalClicks / (totalImpressions || 1)) * 100).toFixed(2)}%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Käufe durch Ads heute
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {totalConversions} Bestellungen
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Tagesbudget: {totalSpend.toFixed(2)} €</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            Blended ROAS (Ertrag)
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            4,82x
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">Target &gt; 3,5x übertroffen</div>
        </div>
      </div>

      {/* 1-Click Launch on ALL Platforms Dispatcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              1-Klick Kampagnen-Rollout auf ALLEN Plattformen
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Wähle das Zielprodukt und den Hook – der Agent passt Format, Bildverhältnis und Zielgruppe für jede Plattform automatisch an.
            </p>
          </div>

          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Synchroner Multichannel-Push
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Bewerbendes Produkt:</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium focus:outline-none focus:border-amber-500"
            >
              {CATALOG_PRODUCTS.map(p => (
                <option key={p.id} value={p.title}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-slate-400 block mb-1 font-medium">Zentraler Viral-Hook & Botschaft:</label>
            <input
              type="text"
              value={customHook}
              onChange={(e) => setCustomHook(e.target.value)}
              placeholder="Zentraler Hook für alle Werbeanzeigen..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Budget-Schutz aktiv: Kampagnen stoppen automatisch, falls der ROAS unter 2.0x fällt.</span>
          </div>

          <button
            onClick={handleLaunchAll}
            disabled={isLaunching}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Play className={`w-4 h-4 ${isLaunching ? 'animate-spin' : ''}`} />
            <span>{isLaunching ? 'Kampagnen werden ausgerollt...' : 'Jetzt auf ALLEN 6 Plattformen werben'}</span>
          </button>
        </div>
      </div>

      {/* Individual Advertising Platform Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-amber-400" />
          Aktive Werbekanäle & Live-Kennzahlen
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {platforms.map((plat) => (
            <div
              key={plat.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{plat.platform}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">{plat.activeAdFormat}</span>
                  </div>
                  <button
                    onClick={() => handleTogglePlatform(plat.id)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                      plat.status.includes('Aktiv')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {plat.status}
                  </button>
                </div>

                {/* Creative Preview */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 italic">
                  "{plat.syncedCreative}"
                </div>

                {/* Target Audience */}
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500">Zielgruppe:</span> {plat.audience}
                </div>

                {/* Metrics Table */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-center">
                  <div>
                    <div className="text-[10px] text-slate-500">Klicks</div>
                    <div className="text-white font-bold">{plat.clicksToday}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">CTR</div>
                    <div className="text-emerald-400 font-bold">{plat.ctr}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Target ROAS</div>
                    <div className="text-amber-400 font-bold">{plat.targetROAS}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Tages-Spend: <strong className="text-white">{plat.spendToday.toFixed(2)} €</strong></span>
                <span className="text-emerald-400 font-bold">{plat.conversions} Sales</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
