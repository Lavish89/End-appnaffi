import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  ArrowRight, 
  TrendingUp, 
  Package, 
  Palette, 
  Truck, 
  Layers, 
  Zap,
  Lock,
  FileCheck
} from 'lucide-react';
import { INITIAL_SHOP_AUDIT } from '../data/ecommerceData';

interface InitialShopAuditViewProps {
  onNavigateTab: (tab: string) => void;
}

export const InitialShopAuditView: React.FC<InitialShopAuditViewProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Executive Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <FileCheck className="w-4 h-4" />
              <span>ERSTER AUFTRAG · AUSFÜHRUNG ABGESCHLOSSEN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Autonomes Shop-Audit & Umsetzungsplan für den DACH-Markt
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Gemäß deiner Vorgabe habe ich deinen Shopify-Shop, das bestehende Theme, installierte Apps, Logistikpfade und rechtliche Anforderungen vollständig analysiert. Alle sicheren Vorbereitungen für maximale Profitabilität und Kundenvertrauen sind vorbereitet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('products')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs rounded-xl transition-colors"
            >
              <span>Top 30 Produkte ansehen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('storefront')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              <span>Live Staging-Store öffnen</span>
            </button>
          </div>
        </div>

        {/* Audit Pillars Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div>
            <div className="text-xs text-slate-400">Shop-Status</div>
            <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Aktiv & Staged
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Staging Theme isoliert</div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Produktkatalog</div>
            <div className="text-sm font-semibold text-slate-200 mt-1 font-mono">
              4 Flaggschiffe bereit
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">30 in Vorbereitung</div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Durchschnittl. DB II Marge</div>
            <div className="text-sm font-semibold text-amber-400 mt-1 font-mono tabular-nums">
              {INITIAL_SHOP_AUDIT.productsAudit.avgProfitMarginDB2}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Nach allen Gebühren</div>
          </div>

          <div>
            <div className="text-xs text-slate-400">Sicherheitsgrenzen</div>
            <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              100% Eingehalten
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">0€ unautorisierte Kosten</div>
          </div>
        </div>
      </div>

      {/* Grid of 6 Deep-Dive Audit Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Shop-Status & Theme-Design */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-slate-200">
            <Palette className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">1. Design & Theme-Architektur</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Theme:</span>
              <span className="text-slate-200 font-medium">{INITIAL_SHOP_AUDIT.existingDesign.themeName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Typografie:</span>
              <span className="text-slate-200">{INITIAL_SHOP_AUDIT.existingDesign.typography}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Farbwelt:</span>
              <span className="text-slate-200">Warm Amber (#D97706) & Slate</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Mobile Pagespeed:</span>
              <span className="text-emerald-400 font-mono font-semibold">{INITIAL_SHOP_AUDIT.existingDesign.pagespeedMobile} / 100</span>
            </div>
            <p className="pt-2 text-slate-400">
              Das Theme folgt den Leitlinien von High-End Marken (Grovemade, Bellroy): Große studio-fotografische Hero-Präsenz, Einzeilen-Navigation, kein Banner-Chaos.
            </p>
          </div>
        </div>

        {/* 2. Apps & Kostenkontrolle */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-slate-200">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">2. Installierte Apps & Software</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            {INITIAL_SHOP_AUDIT.installedApps.map((app, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <div>
                  <div className="text-slate-200 font-medium">{app.name}</div>
                  <div className="text-[11px] text-slate-500">{app.purpose}</div>
                </div>
                <span className="text-emerald-400 font-mono text-[11px] whitespace-nowrap">{app.cost}</span>
              </div>
            ))}
            <div className="pt-1 text-[11px] text-emerald-400/90 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Keine kostenpflichtigen Abos ohne deine Freigabe abgeschlossen.
            </div>
          </div>
        </div>

        {/* 3. Produkte & Deckungsbeitrag */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-slate-200">
            <Package className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">3. Vorhandene Produkte & Margen</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <p>
              4 Flaggschiff-Produkte wurden vollständig vorbereitet (Leder-Desk-Mat, Memory-Foam Kissen, Walnut MagCharge Dock, Titan-Thermoflasche).
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Top-DB-II Produkt:</span>
                <span className="text-amber-400 font-semibold">Dual-Felt Desk Mat</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verkaufspreis:</span>
                <span className="text-slate-200 font-mono">39,95 €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reiner Gewinn (DB II):</span>
                <span className="text-emerald-400 font-mono font-semibold">25,51 € (63,8%)</span>
              </div>
            </div>
            <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Status: Im unveröffentlichten Theme gestaged.</span>
            </div>
          </div>
        </div>

        {/* 4. Versand & Logistik DE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-slate-200">
            <Truck className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-sm">4. Versand- & Retoureninfrastruktur</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Haupt-Hub:</span>
              <span className="text-slate-200 font-medium">Frankfurt am Main (DHL)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Lieferzeit DE:</span>
              <span className="text-emerald-400 font-medium">2–4 Werktage</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Versandkosten-Schwelle:</span>
              <span className="text-amber-400 font-medium">Kostenlos ab 50,00 €</span>
            </div>
            <p className="pt-1 text-slate-400">
              Retourenadresse in Frankfurt eingerichtet. Deutsche Kunden schätzen schnelle Lieferzeiten – keine 14-Tage-Standard-Übersee-Lieferungen!
            </p>
          </div>
        </div>

        {/* 5. Rechtliche Konformität (DE/EU) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-slate-200">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm">5. Rechtliche Sicherheit (DE/EU)</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Impressum nach § 5 TMG / § 18 MStV</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>DSGVO Datenschutzerklärung & Cookie Opt-In</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>AGB mit 14-Tage Widerrufsrecht & Muster</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>LUCID Verpackungsregister (VerpackG)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>GPSR 2024 Herstellerangaben hinterlegt</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Verhindert teure wettbewerbsrechtliche Abmahnungen von vornherein.
            </p>
          </div>
        </div>

        {/* 6. Nächste autonome Schritte */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2.5 text-slate-200">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">6. Priorisierter Maßnahmenplan</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-amber-400 font-semibold text-[11px]">Schritt 1 (Erledigt)</div>
              <div className="text-slate-200">Wettbewerber-Benchmark & 30 Top-Produkte gerankt</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-amber-400 font-semibold text-[11px]">Schritt 2 (Erledigt)</div>
              <div className="text-slate-200">Staging-Theme mit Cart-Drawer & Free-Shipping Bar</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-sky-400 font-semibold text-[11px]">Schritt 3 (Bereit zur Freigabe)</div>
              <div className="text-slate-200">Prüfe den Staging-Katalog und gib die ersten 4 Produkte frei</div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Guardrails Compliance Banner */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-emerald-300">
              Strikte Einhaltung deiner Autonomie-Grenzen
            </h4>
            <p className="text-xs text-slate-400">
              Es wurden keine kostenpflichtigen Abos aktiviert, keine Werbebudgets verausgabt und kein Theme ohne deine ausdrückliche Zustimmung live geschaltet. Alle Arbeiten liegen sicher im isolierten Staging.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('agent')}
          className="px-3.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/30 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          Agenten-Log ansehen
        </button>
      </div>
    </div>
  );
};
