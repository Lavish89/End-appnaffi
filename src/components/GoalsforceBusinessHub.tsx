import React, { useState } from 'react';
import {
  Dumbbell,
  Sun,
  Activity,
  Moon,
  Calculator,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Video,
  Calendar,
  Share2,
  Package,
  Layers,
  Sparkles,
  Link2,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  Check,
  Smartphone,
  Download
} from 'lucide-react';
import {
  GOALSFORCE_PRODUCTS,
  CONNECTED_TOOLS_STATUS,
  AFFILIATE_PROGRAMS_AUDIT,
  CONTENT_CALENDAR_4WEEKS,
  THREE_VIDEO_PACKAGES,
  INITIAL_AUDIT_DECISION_CHECKLIST,
  GoalsforceProduct
} from '../data/goalsforceData';

interface GoalsforceBusinessHubProps {
  onOpenApkModal: () => void;
}

export const GoalsforceBusinessHub: React.FC<GoalsforceBusinessHubProps> = ({ onOpenApkModal }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'aufwach_shop' | 'affiliates' | 'content_plan' | 'video_packages' | 'calculator'>('audit');
  const [selectedDayTime, setSelectedDayTime] = useState<string>('Alle');
  const [expandedVideoId, setExpandedVideoId] = useState<string>('vid-01');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Unit Economics Calculator State
  const [calcEk, setCalcEk] = useState<number>(10.0);
  const [calcVersand, setCalcVersand] = useState<number>(3.5);
  const [calcZoll, setCalcZoll] = useState<number>(0.0); // 0€ EU, 3€ Drittland
  const [calcVk, setCalcVk] = useState<number>(39.9);

  // Calculations based on Master Prompt formula
  const calcTotalCost = calcEk + calcVersand + calcZoll;
  const calcMinVk = Number((calcTotalCost * 2.5).toFixed(2));
  const calcNetto = Number((calcVk / 1.19).toFixed(2));
  const calcPayFee = Number((calcVk * 0.025 + 0.30).toFixed(2));
  const calcRetoure = Number((calcVk * 0.03).toFixed(2));
  const calcDb = Number((calcNetto - calcEk - calcVersand - calcZoll - calcPayFee - calcRetoure).toFixed(2));
  const calcDbPercent = Number(((calcDb / calcNetto) * 100).toFixed(1));
  const isQualifiesForShop = calcDbPercent >= 30.0;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = selectedDayTime === 'Alle'
    ? GOALSFORCE_PRODUCTS
    : GOALSFORCE_PRODUCTS.filter(p => p.dayTime.startsWith(selectedDayTime));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Hero Banner */}
      <div className="border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-bold">
                goalsforce.store
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Shopify Basic · EUR (€) · Standort Deutschland
              </span>
              <span className="text-xs font-mono text-slate-400 border border-slate-800 rounded px-2 py-0.5">
                Nische: Home-Gym & Regeneration für kleine Wohnungen
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Autonomer Business-Agent: Goalsforce Studio
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Priorisierung nach <strong>Deckungsbeitrag (DB ≥ 30%)</strong> statt Umsatz.
              Kombination aus Dropshipping (DSers/EU-Lager), Premium Affiliate-Empfehlungen (Amazon, AWIN, Digistore24)
              und dem dreistufigen <strong>„Aufwach-Shop“ (Morgen, Tag, Abend)</strong>.
            </p>
          </div>

          {/* APK & Quick Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenApkModal}
              className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/20 hover:scale-[1.02]"
            >
              <Smartphone className="w-4 h-4 fill-slate-950" />
              <span>Vollversion APK herunterladen</span>
            </button>
            <a
              href="https://goalsforce.store"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Shopify Vorschau</span>
            </a>
          </div>
        </div>

        {/* 4 Core Formula & Policy Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-500 block text-[10px]">PREISFORMEL</span>
            <span className="text-amber-300 font-bold">VK ≥ 2,5 × Gesamtkosten</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-500 block text-[10px]">SHOP-QUALIFIKATION</span>
            <span className="text-emerald-400 font-bold">DB ≥ 30 % Netto</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-500 block text-[10px]">WERBEBUDGET</span>
            <span className="text-sky-300 font-bold">Standard 0 € (100% Organisch)</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-500 block text-[10px]">SICHERHEITS-SCHUTZ</span>
            <span className="text-purple-300 font-bold">Kein Publishing ohne Freigabe</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Erster Auftrag & Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('aufwach_shop')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'aufwach_shop' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Aufwach-Shop Produkte ({GOALSFORCE_PRODUCTS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('video_packages')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'video_packages' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>3 Komplette Video-Pakete (CapCut)</span>
        </button>

        <button
          onClick={() => setActiveTab('content_plan')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'content_plan' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>4-Wochen-Content-Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('affiliates')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'affiliates' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>3 Affiliate-Programme</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'calculator' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Deckungsbeitrags-Rechner</span>
        </button>
      </div>

      {/* TAB 1: ERSTER AUFTRAG & STATUS AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Status of Connected Tools */}
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-sky-400" />
                  Status der verbundenen Tools (Abschnitt 2)
                </h3>
                <p className="text-xs text-slate-400">
                  Verbundene Systeme werden autonom genutzt; keine neuen Tools werden ohne vorherige Freigabe verbunden.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                5 / 5 Aktiv
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {CONNECTED_TOOLS_STATUS.map((tool, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                      {tool.badge}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Verbunden
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-slate-200">{tool.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{tool.domain}</div>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 leading-normal">
                    {tool.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* User Decision Checklist */}
          <div className="border border-amber-500/30 bg-slate-900/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Entscheidungsliste für dich (Abschnitt 11.6)
                </h3>
                <p className="text-xs text-slate-400">
                  Gemäß deinen Leitplanken darf der Agent diese Punkte nicht selbst entscheiden.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {INITIAL_AUDIT_DECISION_CHECKLIST.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{item.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    <div className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2 rounded border border-slate-800 mt-2">
                      💡 <strong>Agenten-Empfehlung:</strong> {item.agentRecommendation}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-start md:items-end gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-800 px-2 py-0.5 rounded">
                      {item.status}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.actionRequired}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUFWACH-SHOP PRODUKTE (MORGEN / TAG / ABEND) */}
      {activeTab === 'aufwach_shop' && (
        <div className="space-y-6">
          {/* DayTime Filter */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
            {['Alle', 'Morgen', 'Tag', 'Abend'].map((dt) => (
              <button
                key={dt}
                onClick={() => setSelectedDayTime(dt)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                  selectedDayTime === dt
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {dt === 'Morgen' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                {dt === 'Tag' && <Activity className="w-3.5 h-3.5 text-rose-500" />}
                {dt === 'Abend' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{dt === 'Alle' ? 'Alle 12 Produkte' : `${dt}-Kollektion`}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="border border-slate-800 bg-slate-900/60 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="h-44 bg-slate-950 relative overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-amber-400/30 backdrop-blur-sm">
                        {p.dayTime}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-700 backdrop-blur-sm">
                        {p.warehouse}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold backdrop-blur-sm ${
                        p.channelDecision === 'Shop-Verkauf (Dropshipping)'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-sky-950 text-sky-300 border border-sky-700'
                      }`}>
                        {p.channelDecision}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-slate-100 leading-snug">{p.title}</h4>
                    <p className="text-xs text-slate-400">{p.usp}</p>

                    {/* Price & Contribution Margin Matrix */}
                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Verkaufspreis:</span>
                        <span className="font-bold text-slate-100">{p.sellingPrice.toFixed(2)} € (Netto: {p.netSellingPrice.toFixed(2)} €)</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Gesamtkosten (EK+Versand+Zoll):</span>
                        <span>{p.totalCost.toFixed(2)} €</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Formel-Mindestpreis (2,5x):</span>
                        <span>{p.minSellingPrice.toFixed(2)} €</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-bold">
                        <span className="text-emerald-400">Deckungsbeitrag (Netto):</span>
                        <span className="text-emerald-400">{p.contributionMarginNet.toFixed(2)} € ({p.contributionMarginPercent}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GPSR Compliance Footer */}
                <div className="p-3 bg-slate-950/90 border-t border-slate-800 text-[10px] text-slate-400 font-mono space-y-0.5">
                  <div className="flex items-center gap-1 text-slate-300 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    GPSR 2024 Konform:
                  </div>
                  <div className="truncate">EU-Rep: {p.gpsr.euResponsible}</div>
                  <div className="truncate">Kennung: {p.gpsr.productIdentifier}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 3 KOMPLETTE VIDEO-PAKETE (CAPCUT) */}
      {activeTab === 'video_packages' && (
        <div className="space-y-6">
          <div className="border border-slate-800 bg-slate-900/60 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-400" />
              Komplette Video-Pakete nach Abschnitt 7 des Master-Prompts
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Jedes Paket enthält: Konzept, 3 Hooks, Szene-für-Szene Skript, 15-Minuten Smartphone-Shotlist, CapCut Schnittplan, Untertitel und Thumbnail-Idee.
            </p>
          </div>

          <div className="space-y-4">
            {THREE_VIDEO_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="border border-slate-800 bg-slate-900/70 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedVideoId(expandedVideoId === pkg.id ? '' : pkg.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                      {pkg.concept.platform} · {pkg.concept.length}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">{pkg.title}</h4>
                    <p className="text-xs text-slate-400">Produkt: {pkg.targetProduct}</p>
                  </div>
                  {expandedVideoId === pkg.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {expandedVideoId === pkg.id && (
                  <div className="p-5 border-t border-slate-800 space-y-6 bg-slate-950/40">
                    {/* 1. Hooks */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        1. Drei Hook-Varianten (die ersten 2 Sekunden):
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                        {pkg.hooks.map((h, i) => (
                          <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Script */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        2. Szene-für-Szene Skript & Einblendungen:
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {pkg.script.map((s, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-2 bg-slate-950/80 rounded border border-slate-900">
                            <span className="font-mono text-amber-400 shrink-0 w-12 font-bold">{s.scene}</span>
                            <span className="text-slate-300">{s.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. Shotlist 15 Min */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        3. Shotlist (In 15 Minuten mit dem Smartphone gefilmt):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                        {pkg.shotlist15Min.map((sl, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                            <div className="font-bold text-sky-400 font-mono text-[11px]">{sl.shot}</div>
                            <div className="text-slate-400 text-[11px] leading-snug">{sl.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. CapCut Cut Plan */}
                    <div className="space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        4. Schnittplan für CapCut:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">CLIP-REIHENFOLGE:</span>
                          <span className="text-slate-300 font-mono text-[11px]">{pkg.capcutPlan.clipOrder}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">TEXT-OVERLAYS:</span>
                          <span className="text-amber-300 font-mono text-[11px]">{pkg.capcutPlan.textOverlays}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">MUSIKSTIL (LIZENZFREI):</span>
                          <span className="text-emerald-400 text-[11px]">{pkg.capcutPlan.musicStyle}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">SCHNITT-TECHNIK:</span>
                          <span className="text-slate-300 text-[11px]">{pkg.capcutPlan.cuts}</span>
                        </div>
                      </div>
                    </div>

                    {/* 5. Subtitles & Caption */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200 uppercase tracking-wider">
                        <span>5. Untertitel & Beschreibung für Social Media:</span>
                        <button
                          onClick={() => handleCopy(pkg.id, `${pkg.subtitles}\n\n${pkg.captionAndHashtags}`)}
                          className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
                        >
                          {copiedId === pkg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedId === pkg.id ? 'Kopiert' : 'Alles Kopieren'}
                        </button>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
                        <p className="font-mono text-[11px] text-slate-400">{pkg.subtitles}</p>
                        <p className="text-amber-300/90 font-medium">{pkg.captionAndHashtags}</p>
                      </div>
                    </div>

                    {/* Thumbnail Idea */}
                    <div className="text-xs text-slate-400 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                      <strong>Thumbnail-Idee für YouTube Shorts / Reels:</strong> {pkg.thumbnailIdea}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 4-WOCHEN-CONTENT-PLAN */}
      {activeTab === 'content_plan' && (
        <div className="space-y-6">
          <div className="border border-slate-800 bg-slate-900/60 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              4-Wochen-Content-Plan: Videos, Pins, SEO-Ratgeber & E-Mails
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Organischer Funnel nach Abschnitt 6 des Master-Prompts. Alle Social-Posts werden in Metricool & Typefully als Entwurf hinterlegt.
            </p>
          </div>

          <div className="space-y-4">
            {CONTENT_CALENDAR_4WEEKS.map((w, idx) => (
              <div key={idx} className="border border-slate-800 bg-slate-900/70 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Woche {idx + 1}</span>
                    <h4 className="text-base font-bold text-slate-100">{w.week}</h4>
                    <p className="text-xs text-slate-400">Themenschwerpunkt: {w.theme}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  {/* Videos */}
                  <div className="space-y-2 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-amber-400" /> 3 Kurzvideos (TikTok / Shorts / Reels):
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {w.videos.map((v, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <div>
                            <strong>{v.title}</strong>
                            <span className="text-[11px] text-slate-500 block font-mono">{v.platform} · Ziel: {v.goal}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pins & Articles */}
                  <div className="space-y-2.5 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="font-bold text-slate-200 block mb-1">📌 Pinterest Pins:</span>
                      <p className="text-slate-400 text-[11px]">{w.pins}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-900">
                      <span className="font-bold text-slate-200 block mb-1">📝 SEO-Ratgeberartikel:</span>
                      <p className="text-sky-300 text-[11px] font-mono">{w.seoArticle}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-900">
                      <span className="font-bold text-slate-200 block mb-1">✉️ E-Mail-Marketing Flow:</span>
                      <p className="text-slate-400 text-[11px]">{w.emailFlow}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: 3 AFFILIATE-PROGRAMME */}
      {activeTab === 'affiliates' && (
        <div className="space-y-6">
          <div className="border border-slate-800 bg-slate-900/60 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              Recherchierte Affiliate-Partnerprogramme (Abschnitt 5 & 11.3)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Ergänzen den Shop für hochpreisige oder sperrige Geräte, die nicht ins Dropshipping passen.
              Strikte Kennzeichnungspflicht als „*Werbung*“ oder „*Anzeige*“.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AFFILIATE_PROGRAMS_AUDIT.map((aff) => (
              <div
                key={aff.id}
                className="border border-slate-800 bg-slate-900/80 rounded-xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">
                      {aff.status}
                    </span>
                    <span className="text-xs font-mono text-amber-400 font-bold">{aff.commission}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100">{aff.name}</h4>
                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-400 block text-[11px]">Fokus:</strong>
                    {aff.nicheFocus}
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div><strong>Cookie-Laufzeit:</strong> {aff.cookieDuration}</div>
                    <div className="text-[11px] leading-relaxed"><strong>Bedingungen:</strong> {aff.conditions}</div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                    <strong>Warum passend:</strong> {aff.fitReason}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                  *Werbekennzeichnung: „*Werbung: Dieser Link ist ein Affiliate-Link.*“
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: INTERACTIVE CONTRIBUTION MARGIN CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="border border-slate-800 bg-slate-900/80 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              Interaktiver Deckungsbeitrags- & Formel-Rechner (Abschnitt 4)
            </h3>
            <p className="text-xs text-slate-400">
              Teste beliebige neue Produktideen. Der Rechner prüft automatisch: <strong>Verkaufspreis ≥ 2,5 × Gesamtkosten</strong> und ob der <strong>Deckungsbeitrag ≥ 30 % vom Netto</strong> erreicht wird.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Input Controls */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Einkaufspreis (EK) in €
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calcEk}
                  onChange={(e) => setCalcEk(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Versandkosten nach Deutschland in €
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calcVersand}
                  onChange={(e) => setCalcVersand(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Zollpauschale (3 € bei Drittland / 0 € bei EU-Lager)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcZoll(0.0)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono border ${
                      calcZoll === 0 ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    0 € (EU-Lager)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcZoll(3.0)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono border ${
                      calcZoll === 3 ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    3 € (Drittland/China)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Geplanter Verkaufspreis (Brutto) in €
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={calcVk}
                  onChange={(e) => setCalcVk(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Live Waterfall Results */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs">
              <div className="space-y-2 pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Gesamtkosten (EK + Vers. + Zoll):</span>
                  <span className="font-bold text-slate-200">{calcTotalCost.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Mindest-VK (2,5 × Gesamtkosten):</span>
                  <span className={`font-bold ${calcVk >= calcMinVk ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {calcMinVk.toFixed(2)} € {calcVk >= calcMinVk ? '✓ Erfüllt' : '✗ Zu niedrig'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Netto-Verkaufspreis (ohne 19% MwSt):</span>
                  <span className="text-slate-200">{calcNetto.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Zahlungsgebühren (~2.5% + 0.30€):</span>
                  <span>- {calcPayFee.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Retourenrückstellung (~3%):</span>
                  <span>- {calcRetoure.toFixed(2)} €</span>
                </div>
              </div>

              {/* Final Margin Result */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-100">Deckungsbeitrag (Netto):</span>
                  <span className={`text-base ${calcDb > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {calcDb.toFixed(2)} € ({calcDbPercent}%)
                  </span>
                </div>

                <div className={`p-4 rounded-xl border text-xs font-sans ${
                  isQualifiesForShop
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {isQualifiesForShop ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {isQualifiesForShop ? 'QUALIFIZIERT FÜR SHOP-VERKAUF' : 'EMPFEHLUNG: ALS AFFILIATE-LINK EINBINDEN'}
                  </div>
                  <p className="leading-relaxed">
                    {isQualifiesForShop
                      ? `Der Deckungsbeitrag von ${calcDbPercent}% liegt über der 30%-Grenze. Dieses Produkt kann profitabel über den eigenen Shopify-Shop via DSers angeboten werden.`
                      : `Der Deckungsbeitrag von ${calcDbPercent}% liegt unter der 30%-Grenze. Es empfiehlt sich stattdessen eine Affiliate-Empfehlung (z.B. über Amazon PartnerNet), um ohne Kapitalbindung und Retourenrisiko Provision zu verdienen.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
