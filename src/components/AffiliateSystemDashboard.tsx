import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Percent, 
  ExternalLink, 
  Link2, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  Copy, 
  Check, 
  TrendingUp, 
  Share2, 
  Award, 
  CreditCard,
  Sliders,
  Sparkles,
  ArrowRight,
  Globe,
  Radio
} from 'lucide-react';

interface AffiliateNetwork {
  id: string;
  name: string;
  region: string;
  connected: boolean;
  merchantId: string;
  trackingType: string;
  defaultCommission: string;
  cookieWindowDays: number;
  activePartners: number;
  revenueGenerated: number;
  paidCommission: number;
  status: string;
}

interface AffiliatePartner {
  id: string;
  name: string;
  channel: string;
  refCode: string;
  refUrl: string;
  commissionRate: number;
  totalClicks: number;
  ordersDriven: number;
  revenueDriven: number;
  earnedCommission: number;
  payoutStatus: string;
  network: string;
}

export const AffiliateSystemDashboard: React.FC = () => {
  const [networks, setNetworks] = useState<AffiliateNetwork[]>([]);
  const [partners, setPartners] = useState<AffiliatePartner[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalRevenue: 31340.50,
    totalCommission: 4646.90,
    netProfitAfterCommission: 26693.60,
    totalActivePartners: 165,
    avgConversionRate: '4,62%',
    pendingPayoutsAmount: 775.00,
    activeCookieDurationDays: 30,
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'networks' | 'partners' | 'generator'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Partner State
  const [isNewPartnerModalOpen, setIsNewPartnerModalOpen] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerChannel, setPartnerChannel] = useState('');
  const [partnerRefCode, setPartnerRefCode] = useState('');
  const [partnerCommission, setPartnerCommission] = useState('15');
  const [partnerNetwork, setPartnerNetwork] = useState('Shopify Collabs');

  // Generator State
  const [genProduct, setGenProduct] = useState('Aura Dual-Felt Desk Mat');
  const [genPartner, setGenPartner] = useState('Fabian | Minimal Desk Setup');
  const [genCoupon, setGenCoupon] = useState('FABIAN15');
  const [generatedLink, setGeneratedLink] = useState('https://aura-workspace.de/products/desk-mat?ref=fabian_desk&utm_source=affiliate&utm_medium=youtube&utm_campaign=desksetup2026');

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = () => {
    fetch('/api/affiliates/overview')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNetworks(data.networks);
          setPartners(data.partners);
          if (data.metrics) setMetrics(data.metrics);
        }
      })
      .catch(console.error);
  };

  const handleToggleNetwork = async (networkId: string) => {
    try {
      const res = await fetch('/api/affiliates/connect-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkId }),
      });
      const data = await res.json();
      if (data.success) {
        setNetworks(data.networks);
        setFeedback(data.message);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handlePayoutPartner = async (partnerId: string) => {
    try {
      const res = await fetch('/api/affiliates/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId }),
      });
      const data = await res.json();
      if (data.success) {
        setPartners(prev => prev.map(p => p.id === partnerId ? data.partner : p));
        setFeedback(data.message);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/affiliates/create-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: partnerName,
          channel: partnerChannel,
          refCode: partnerRefCode,
          commissionRate: partnerCommission,
          network: partnerNetwork,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPartners(prev => [data.partner, ...prev]);
        setIsNewPartnerModalOpen(false);
        setPartnerName('');
        setPartnerRefCode('');
        setFeedback(data.message);
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGenerateLink = () => {
    const slug = genProduct.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const partnerSlug = genPartner.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 15);
    const link = `https://aura-workspace.de/products/${slug}?ref=${partnerSlug}&coupon=${genCoupon}&utm_source=affiliate&utm_medium=creator&utm_campaign=aura_partner`;
    setGeneratedLink(link);
    setFeedback('Neuer Affiliate-Link mit UTM-Attribution erfolgreich erzeugt!');
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400">AFFILIATE NETWORKS & PARTNER COCKPIT</div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Affiliate-Programme & Partner-Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Verbinde deinen Shopify-Shop mit allen führenden Affiliate-Netzwerken (AWIN, Shopify Collabs, Impact, ShareASale, CJ, Amazon PartnerNet) und behalte die volle Kontrolle über Provisionen, Klicks und Auszahlungen.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsNewPartnerModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Neuen Partner anlegen</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-slate-900 border border-amber-500/50 rounded-xl text-xs text-amber-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Dashboard & Performance
        </button>
        <button
          onClick={() => setActiveTab('networks')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'networks' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Verbundene Netzwerke ({networks.filter(n => n.connected).length})
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'partners' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Partner & Rangliste ({partners.length})
        </button>
        <button
          onClick={() => setActiveTab('generator')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'generator' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          Link- & Gutschein-Generator
        </button>
      </div>

      {/* TAB 1: Overview Dashboard with ALL KPIs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Affiliate-Umsatz Gesamt
              </div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                {metrics.totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </div>
              <div className="text-[11px] text-emerald-400 font-mono">
                Reingewinn: {metrics.netProfitAfterCommission.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                Ausgezahlte Provisionen
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                {metrics.totalCommission.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Ø Provisionssatz: 14,8% CPS
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Aktive Creator & Partner
              </div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                {metrics.totalActivePartners} Partner
              </div>
              <div className="text-[11px] text-slate-400">
                Über 6 Netzwerke synchronisiert
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Affiliate Conversion Rate
              </div>
              <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                {metrics.avgConversionRate}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Cookie-Laufzeit: {metrics.activeCookieDurationDays} Tage
              </div>
            </div>
          </div>

          {/* Revenue by Network & Fraud Protection Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Network Revenue Distribution */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-amber-400" />
                Umsatz nach Affiliate-Netzwerken
              </h3>

              <div className="space-y-3">
                {networks.map((net) => (
                  <div key={net.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{net.name}</span>
                      <span className="font-mono text-white">
                        {net.revenueGenerated.toFixed(2)} € ({Math.round((net.revenueGenerated / (metrics.totalRevenue || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (net.revenueGenerated / (metrics.totalRevenue || 1)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>{net.activePartners} aktive Partner</span>
                      <span>Provision: {net.paidCommission.toFixed(2)} €</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 30-Day Return Window & Fraud Protection Shield */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-white">30-Tage Retouren-Schutz</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Provisionen werden erst 30 Tage nach Eingang der Bestellung freigegeben. Sollte ein Kunde Ware retournieren, wird die Provision automatisch storniert. 100% Schutz vor Stornos und Klick-Betrug.
                </p>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Zur Freigabe vorgemerkt:</span>
                    <span className="text-amber-400 font-bold">{metrics.pendingPayoutsAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Attributions-Modell:</span>
                    <span className="text-white">Last Click (30 Tage)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SEPA / PayPal Payout:</span>
                    <span className="text-emerald-400 font-semibold">Automatisiert</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                Entspricht den AWIN & Shopify Collabs Sicherheitsrichtlinien.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Affiliate Networks Integration Switchboard */}
      {activeTab === 'networks' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              Schnittstellen zu führenden Affiliate-Netzwerken
            </h3>
            <p className="text-xs text-slate-400">
              Verbinde deinen Shop mit den größten Publisher- und Influencer-Netzwerken der Welt. Klicke auf verbinden, um die Server-to-Server Postback API zu aktivieren.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {networks.map((net) => (
                <div
                  key={net.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{net.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{net.region}</span>
                      </div>
                      <button
                        onClick={() => handleToggleNetwork(net.id)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                          net.connected
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {net.connected ? 'Verbunden' : 'Aktivieren'}
                      </button>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Merchant-ID:</span>
                        <span className="text-slate-200">{net.merchantId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tracking:</span>
                        <span className="text-slate-300">{net.trackingType.slice(0, 18)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Provision:</span>
                        <span className="text-amber-400">{net.defaultCommission}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Generierter Umsatz:</span>
                      <span className="text-emerald-400 font-bold">{net.revenueGenerated.toFixed(2)} €</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{net.activePartners} Partner aktiv</span>
                    <span className="text-amber-400 font-mono">{net.cookieWindowDays} Tage Cookie</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Affiliate Partners Roster & Rankings */}
      {activeTab === 'partners' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Affiliate-Partner & Influencer Rangliste
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Echtzeit-Tracking von Klicks, Verkäufen, Provisionen und Auszahlungsfreigaben.
              </p>
            </div>
            <button
              onClick={() => setIsNewPartnerModalOpen(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors self-start sm:self-auto"
            >
              + Partner hinzufügen
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono">
                  <th className="py-3 px-4">Partner & Kanal</th>
                  <th className="py-3 px-4">Code & Ref-Link</th>
                  <th className="py-3 px-4">Netzwerk</th>
                  <th className="py-3 px-4 text-right">Klicks</th>
                  <th className="py-3 px-4 text-right">Sales</th>
                  <th className="py-3 px-4 text-right">Umsatz</th>
                  <th className="py-3 px-4 text-right">Provision</th>
                  <th className="py-3 px-4 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.channel}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded text-[11px]">
                          {p.refCode}
                        </span>
                        <button
                          onClick={() => handleCopy(p.refUrl, p.id)}
                          className="text-slate-500 hover:text-white"
                          title="Link kopieren"
                        >
                          {copiedCode === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {p.network}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {p.totalClicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-white">
                      {p.ordersDriven}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-400">
                      {p.revenueDriven.toFixed(2)} €
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <div className="text-white font-semibold">{p.earnedCommission.toFixed(2)} €</div>
                      <div className="text-[10px] text-slate-500">{p.commissionRate}% CPS</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.payoutStatus.includes('Ausgezahlt') ? (
                        <span className="text-emerald-400 font-mono text-[11px]">Ausgezahlt</span>
                      ) : (
                        <button
                          onClick={() => handlePayoutPartner(p.id)}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-md transition-colors whitespace-nowrap"
                        >
                          Auszahlen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Link- & Gutschein-Generator */}
      {activeTab === 'generator' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-amber-400" />
              UTM Affiliate-Link & Gutschein-Generator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generiere individuelle Tracking-Links mit hinterlegten UTM-Parametern und automatischen Rabattcodes für Creator, Influencer oder Fachmagazine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-medium">Bewerbendes Produkt:</label>
              <select
                value={genProduct}
                onChange={(e) => setGenProduct(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Aura Dual-Felt Desk Mat">Aura Dual-Felt Desk Mat</option>
                <option value="3-in-1 Solid Walnut MagCharge Dock">3-in-1 Solid Walnut MagCharge Dock</option>
                <option value="Ergonomisches Memory-Foam Lendenkissen">Ergonomisches Memory-Foam Lendenkissen</option>
                <option value="Aura HydroTherm Titanstahl Flasche">Aura HydroTherm Titanstahl Flasche</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Partner / Creator:</label>
              <input
                type="text"
                value={genPartner}
                onChange={(e) => setGenPartner(e.target.value)}
                placeholder="Name des Partners..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-medium">Zugehöriger Rabattcode:</label>
              <input
                type="text"
                value={genCoupon}
                onChange={(e) => setGenCoupon(e.target.value.toUpperCase())}
                placeholder="z.B. PARTNER15"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono uppercase focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateLink}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            Affiliate Tracking-Link generieren
          </button>

          {/* Generated Link Preview */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Generierter Tracking-Link:</span>
              <button
                onClick={() => handleCopy(generatedLink, 'gen-link')}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
              >
                {copiedCode === 'gen-link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Link kopieren
              </button>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-amber-300 break-all select-all">
              {generatedLink}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gutscheincode {genCoupon} wird beim Klick automatisch im Shopify-Warenkorb aktiviert (-15%).</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Neuen Partner anlegen */}
      {isNewPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Neuen Affiliate-Partner anlegen
              </h3>
              <button onClick={() => setIsNewPartnerModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Name des Partners / Creators:</label>
                <input
                  type="text"
                  required
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="z.B. Jonas Tech Setup"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Kanal / Social Media Profil:</label>
                <input
                  type="text"
                  required
                  value={partnerChannel}
                  onChange={(e) => setPartnerChannel(e.target.value)}
                  placeholder="z.B. TikTok (@jonas.tech 45k) / YouTube"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Ref-Code / Gutschein:</label>
                  <input
                    type="text"
                    required
                    value={partnerRefCode}
                    onChange={(e) => setPartnerRefCode(e.target.value.toUpperCase())}
                    placeholder="JONAS15"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Provision (% CPS):</label>
                  <input
                    type="number"
                    required
                    value={partnerCommission}
                    onChange={(e) => setPartnerCommission(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Netzwerk:</label>
                <select
                  value={partnerNetwork}
                  onChange={(e) => setPartnerNetwork(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="Shopify Collabs">Shopify Collabs</option>
                  <option value="AWIN">AWIN (Affiliate Window)</option>
                  <option value="Impact.com">Impact.com</option>
                  <option value="ShareASale">ShareASale</option>
                  <option value="Amazon Associates">Amazon PartnerNet</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPartnerModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  Partner aktivieren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
