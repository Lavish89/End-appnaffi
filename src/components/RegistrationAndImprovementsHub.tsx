import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Award,
  Users,
  Building,
  CheckCircle2,
  TrendingUp,
  Percent,
  Gift,
  ShieldCheck,
  Globe,
  Sliders,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Coins,
  QrCode,
  DollarSign,
  Briefcase,
  AlertCircle,
  Clock,
  Layers,
  HeartHandshake
} from 'lucide-react';

interface Member {
  id: string;
  type: 'customer_vip' | 'creator' | 'b2b';
  name: string;
  email: string;
  registeredAt: string;
  status: string;
  details: any;
}

interface Improvement {
  id: string;
  category: string;
  title: string;
  description: string;
  enabled: boolean;
  expectedLift: string;
  impactScore: number;
  difficulty: string;
  metrics: Record<string, any>;
}

export const RegistrationAndImprovementsHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'improvements' | 'vip_club' | 'creator' | 'b2b' | 'members'>('improvements');
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [healthScore, setHealthScore] = useState<number>(100);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  // VIP Registration State
  const [vipName, setVipName] = useState('');
  const [vipEmail, setVipEmail] = useState('');
  const [vipInterests, setVipInterests] = useState<string[]>(['Ergonomie', 'Minimal Desk']);
  const [registeredVipCard, setRegisteredVipCard] = useState<any>(null);

  // Creator Registration State
  const [creatorName, setCreatorName] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [creatorPlatform, setCreatorPlatform] = useState('TikTok & Instagram Reels');
  const [creatorHandle, setCreatorHandle] = useState('');
  const [creatorPreferredCode, setCreatorPreferredCode] = useState('');
  const [registeredCreatorCard, setRegisteredCreatorCard] = useState<any>(null);

  // B2B Registration State
  const [b2bCompany, setB2bCompany] = useState('');
  const [b2bContact, setB2bContact] = useState('');
  const [b2bEmail, setB2bEmail] = useState('');
  const [b2bVatId, setB2bVatId] = useState('');
  const [b2bWorkstations, setB2bWorkstations] = useState(25);
  const [registeredB2BCard, setRegisteredB2BCard] = useState<any>(null);

  // Exit-Intent Modal Simulation Preview State
  const [showExitIntentPreview, setShowExitIntentPreview] = useState(false);

  // Load improvements and members
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [impRes, memRes] = await Promise.all([
        fetch('/api/improvements').then(r => r.json()),
        fetch('/api/members').then(r => r.json())
      ]);

      if (impRes.success) {
        setImprovements(impRes.improvements);
        setHealthScore(impRes.healthScore);
      }
      if (memRes.success) {
        setMembers(memRes.members);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleImprovement = async (id: string) => {
    try {
      const res = await fetch('/api/improvements/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ improvementId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setImprovements(data.improvements);
        setHealthScore(data.healthScore);
        showToast(data.message);
      }
    } catch {
      showToast('Fehler beim Aktualisieren der Optimierung');
    }
  };

  const handleApplyAllImprovements = async () => {
    try {
      const res = await fetch('/api/improvements/apply-all', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setImprovements(data.improvements);
        setHealthScore(100);
        showToast(data.message);
      }
    } catch {
      showToast('Fehler bei der Massenaktivierung');
    }
  };

  const handleRegisterVip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipName || !vipEmail) return;

    try {
      const res = await fetch('/api/members/register-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vipName,
          email: vipEmail,
          interests: vipInterests,
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegisteredVipCard(data.member);
        showToast(data.message);
        fetchData();
      }
    } catch {
      showToast('Registrierungsfehler');
    }
  };

  const handleRegisterCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName || !creatorEmail || !creatorHandle) return;

    try {
      const res = await fetch('/api/members/register-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: creatorName,
          email: creatorEmail,
          platform: creatorPlatform,
          handle: creatorHandle,
          preferredRefCode: creatorPreferredCode,
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegisteredCreatorCard(data.member);
        showToast(data.message);
        fetchData();
      }
    } catch {
      showToast('Creator-Registrierungsfehler');
    }
  };

  const handleRegisterB2B = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!b2bCompany || !b2bContact || !b2bEmail) return;

    try {
      const res = await fetch('/api/members/register-b2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: b2bCompany,
          contactPerson: b2bContact,
          email: b2bEmail,
          vatId: b2bVatId,
          workstations: b2bWorkstations,
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegisteredB2BCard(data.member);
        showToast(data.message);
        fetchData();
      }
    } catch {
      showToast('B2B-Registrierungsfehler');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-400 text-slate-950 px-5 py-3 rounded-xl font-medium shadow-2xl flex items-center gap-3 border border-amber-300">
          <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                Wachstums- & Anmelde-Zentrum
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                100% Live & Einsatzbereit
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Anmelde-Programme & Shop-Optimierungs-Zentrum
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Maximiere deine Shop-Performance mit allen 10 kaufentscheidenden Conversion-Boostern und schaffe 3 automatisierte Anmeldekanäle:
              Kunden-VIP-Club (Punkte & Gutscheine), Creator-Affiliate-Portal und B2B-Firmenkunden-Erstausstattung.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleApplyAllImprovements}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/10"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Alle Optimierungen scharfschalten</span>
            </button>
            <button
              onClick={() => setShowExitIntentPreview(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Exit-Intent Pop-up testen</span>
            </button>
          </div>
        </div>

        {/* 4 Core KPI Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Store-Gesundheits-Index
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {healthScore}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {improvements.filter(i => i.enabled).length} von {improvements.length} Optimierungen aktiv
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Conversion-Rate Zuwachs
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              +34,8%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Durch 1-Click Pay & Exit-Intent
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-sky-400" />
              Registrierte VIP-Mitglieder
            </div>
            <div className="text-2xl font-bold font-mono text-sky-400">
              1.244
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Aura Club (Wiederkaufrate 34%)
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Briefcase className="w-4 h-4 text-purple-400" />
              B2B & Creator Partner
            </div>
            <div className="text-2xl font-bold font-mono text-purple-400">
              64 Partner
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Automatisch provisioniert & geprüft
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('improvements')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'improvements'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Shop-Optimierungen ({improvements.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vip_club')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'vip_club'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Kunden-Anmeldung (Aura VIP Club)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('creator')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'creator'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Creator & Affiliate Anmeldung</span>
        </button>

        <button
          onClick={() => setActiveSubTab('b2b')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'b2b'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>B2B Firmenkunden Portal</span>
        </button>

        <button
          onClick={() => setActiveSubTab('members')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'members'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Registrierte Mitglieder & CRM ({members.length})</span>
        </button>
      </div>

      {/* TAB 1: STORE IMPROVEMENTS */}
      {activeSubTab === 'improvements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Übersicht aller 10 Conversion- & Performance-Verbesserungen
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Jede Verbesserung kann einzeln per Schalter live geschaltet oder pausiert werden.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Status:</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md font-mono">
                {improvements.filter(i => i.enabled).length} / {improvements.length} Scharfgeschaltet
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {improvements.map((imp) => (
              <div
                key={imp.id}
                className={`border rounded-xl p-5 transition-all flex flex-col justify-between ${
                  imp.enabled
                    ? 'bg-slate-900/70 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {imp.category}
                    </span>
                    <button
                      onClick={() => handleToggleImprovement(imp.id)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        imp.enabled ? 'bg-amber-400' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                          imp.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    {imp.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {imp.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 font-medium font-mono text-[11px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {imp.expectedLift}
                  </div>
                  <div className="text-slate-500 font-mono text-[10px]">
                    Impact: {imp.impactScore}/100
                  </div>
                </div>

                {/* Metric pill preview */}
                {imp.metrics && (
                  <div className="mt-2.5 bg-slate-950/80 rounded-lg p-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-slate-400 border border-slate-800/60">
                    {Object.entries(imp.metrics).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-1">
                        <span className="text-slate-500">{key}:</span>
                        <span className="text-slate-200 font-bold">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Feature Demo Showcase */}
          <div className="border border-slate-800 bg-slate-900/40 rounded-xl p-6 mt-8">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              Live Demo: Smart Setup-Bundle (AOV-Booster von 45 € auf 149 €)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center bg-slate-950 border border-slate-800 rounded-xl p-5">
              <div className="space-y-1 lg:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Meistgekauftes Komplett-Set
                </span>
                <h4 className="text-base font-bold text-slate-100">
                  Aura Nordic Workspace Triple (Schreibtischunterlage + Lendenkissen + MagCharge)
                </h4>
                <p className="text-xs text-slate-400">
                  Perfekt aufeinander abgestimmt: Veganes Leder, orthopädischer Memory-Foam und echtes Walnussholz.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xl font-bold font-mono text-slate-100">149,00 €</span>
                  <span className="text-sm font-mono text-slate-500 line-through">174,00 €</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                    Du sparst 25,00 € (-14%)
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => showToast('Bundle wurde in den Warenkorb gelegt!')}
                  className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  Als 1-Click Bundle kaufen
                </button>
                <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Kostenloser DHL Expressversand inklusive
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIP CLUB REGISTRATION */}
      {activeSubTab === 'vip_club' && (
        <div className="space-y-8">
          {/* VIP Loyalty Tiers Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-4 relative">
              <span className="text-[10px] font-mono text-amber-500/80 uppercase font-bold">Stufe 1</span>
              <h4 className="text-base font-bold text-slate-100 mt-1">Bronze</h4>
              <p className="text-xs font-mono text-slate-400 mt-0.5">0 – 499 Aura Punkte</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> 10% Willkommens-Gutschein
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Gratis Versand ab 35 €
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Punkte sammeln (1 € = 10 Pkt)
                </li>
              </ul>
            </div>

            <div className="border border-slate-700 bg-slate-900/80 rounded-xl p-4 relative shadow-sm">
              <span className="text-[10px] font-mono text-slate-300 uppercase font-bold">Stufe 2</span>
              <h4 className="text-base font-bold text-slate-100 mt-1">Silber</h4>
              <p className="text-xs font-mono text-slate-400 mt-0.5">500 – 1.499 Aura Punkte</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> 5% Dauer-Rabatt auf alles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Geburtstags-Geschenk gratis
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Priority DHL Express Packing
                </li>
              </ul>
            </div>

            <div className="border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-slate-900/80 rounded-xl p-4 relative">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Stufe 3 (Beliebt)</span>
              <h4 className="text-base font-bold text-amber-300 mt-1">Gold</h4>
              <p className="text-xs font-mono text-slate-400 mt-0.5">1.500 – 2.999 Punkte</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> 10% Dauer-Rabatt auf alles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Kostenlose Namens-Lasergravur
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> VIP WhatsApp Ergonomie-Support
                </li>
              </ul>
            </div>

            <div className="border border-purple-500/40 bg-gradient-to-b from-purple-500/10 to-slate-900/80 rounded-xl p-4 relative">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Stufe 4 (Elite)</span>
              <h4 className="text-base font-bold text-purple-300 mt-1">Platin</h4>
              <p className="text-xs font-mono text-slate-400 mt-0.5">Ab 3.000 Punkte</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400" /> 15% Dauer-Rabatt auf alles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400" /> Kostenlose Neu-Produkt-Muster
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400" /> Lebenslange Garantie & Vorabtausch
                </li>
              </ul>
            </div>
          </div>

          {/* Registration Form & Member Card Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Neu-Kunden Anmeldung (Sofort +100 Punkte & 10% Gutschein)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Melde dich kostenlos an und sichere dir sofort deinen persönlichen Rabattcode und Club-Status.
              </p>

              <form onSubmit={handleRegisterVip} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Vollständiger Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={vipName}
                    onChange={(e) => setVipName(e.target.value)}
                    placeholder="z.B. Lena Becker"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-Mail Adresse *
                  </label>
                  <input
                    type="email"
                    required
                    value={vipEmail}
                    onChange={(e) => setVipEmail(e.target.value)}
                    placeholder="lena.becker@beispiel.de"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Deine Workspace-Interessen (Mehrfachauswahl)
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['Ergonomie', 'Minimal Desk', 'Walnussholz', 'Tech Gadgets'].map((interest) => (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => {
                          if (vipInterests.includes(interest)) {
                            setVipInterests(vipInterests.filter(i => i !== interest));
                          } else {
                            setVipInterests([...vipInterests, interest]);
                          }
                        }}
                        className={`px-3 py-2 rounded-lg border text-left transition-colors flex items-center justify-between ${
                          vipInterests.includes(interest)
                            ? 'bg-amber-400/10 border-amber-400 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span>{interest}</span>
                        {vipInterests.includes(interest) && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Award className="w-4 h-4 fill-slate-950" />
                    Kostenlos im Aura VIP Club registrieren
                  </button>
                </div>
              </form>
            </div>

            {/* Generated / Demo VIP Pass Card */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Virtuelle Aura Club Mitgliedskarte (Live-Generierung)
              </div>
              <div className="border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 rounded-2xl p-6 text-slate-100 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                      AURA CLUB MEMBER PASS
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-white mt-1">
                      {registeredVipCard ? registeredVipCard.name : (vipName || 'Sophie Wagner')}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {registeredVipCard ? registeredVipCard.email : (vipEmail || 'sophie.wagner@icloud.com')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl border border-white/20 p-1.5 flex items-center justify-center">
                    <QrCode className="w-full h-full text-amber-300" />
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Aktuelle Stufe</div>
                    <div className="text-sm font-bold text-amber-300">
                      {registeredVipCard ? registeredVipCard.details.tier : 'Silber'} Member
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Aura Punkte</div>
                    <div className="text-sm font-bold font-mono text-emerald-400">
                      {registeredVipCard ? registeredVipCard.details.points : '840'} PTS
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Willkommens-Code</div>
                    <div className="text-xs font-bold font-mono bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-amber-400">
                      {registeredVipCard ? registeredVipCard.details.voucherCode : 'AURA-VIP-842'}
                    </div>
                  </div>
                </div>
              </div>

              {registeredVipCard && (
                <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 text-xs text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold">Erfolgreich registriert!</div>
                    <div>100 Willkommenspunkte wurden gutgeschrieben. Gutscheincode <strong>{registeredVipCard.details.voucherCode}</strong> (-10%) ist ab sofort im Checkout einlösbar.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREATOR REGISTRATION */}
      {activeSubTab === 'creator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">
                Creator & Influencer Partnerschaft Bewerben
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Erhalte 15% bis 20% Provision auf alle Verkäufe über deinen individuellen Tracking-Link & Gutscheincode.
            </p>

            <form onSubmit={handleRegisterCreator} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Name / Alias *
                </label>
                <input
                  type="text"
                  required
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="z.B. Tim | Desk Vibe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-Mail Adresse *
                </label>
                <input
                  type="email"
                  required
                  value={creatorEmail}
                  onChange={(e) => setCreatorEmail(e.target.value)}
                  placeholder="tim@deskvibe.de"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Haupt-Kanal & Plattform *
                </label>
                <select
                  value={creatorPlatform}
                  onChange={(e) => setCreatorPlatform(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="TikTok & Short Video">TikTok & Short Video</option>
                  <option value="Instagram Reels & Feed">Instagram Reels & Feed</option>
                  <option value="YouTube Tech & Desk Setup">YouTube Tech & Desk Setup</option>
                  <option value="Blog / Fachmagazin">Blog / Fachmagazin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Social Media Handle & Reichweite *
                </label>
                <input
                  type="text"
                  required
                  value={creatorHandle}
                  onChange={(e) => setCreatorHandle(e.target.value)}
                  placeholder="@deskvibe.official (45k Follower)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wunsch-Gutscheincode (z.B. TIM15)
                </label>
                <input
                  type="text"
                  value={creatorPreferredCode}
                  onChange={(e) => setCreatorPreferredCode(e.target.value)}
                  placeholder="TIM15"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono uppercase"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Users className="w-4 h-4" />
                  Creator-Partnerschaft freischalten
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6">
              <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Vorteile für verifizierte Creator
              </h4>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>15% bis 20% Provision:</strong> Direkte Auszahlung per PayPal oder SEPA Überweisung ohne Mindestauszahlungsbetrag.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Kostenloses Sample-Kit:</strong> Auf Wunsch senden wir dir unsere Schreibtischunterlage und das Lendenkissen für Unboxings kostenlos zu.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>30 Tage Cookie-Tracking:</strong> Jeder Klick wird 30 Tage lang deinem Account gutgeschrieben.</span>
                </li>
              </ul>
            </div>

            {registeredCreatorCard && (
              <div className="border border-emerald-500/40 bg-emerald-950/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Creator-Konto ist aktiv!
                </div>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <div>Ref-Code: <strong className="text-amber-400">{registeredCreatorCard.details.refCode}</strong></div>
                  <div>Tracking-Link: <span className="text-sky-300">https://aura-workspace.de?ref={registeredCreatorCard.details.refCode.toLowerCase()}</span></div>
                  <div>Provision: <strong>15% Cost-Per-Sale</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: B2B CORPORATE REGISTRATION */}
      {activeSubTab === 'b2b' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100">
                B2B Firmenkunden & Büroausstattung
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Rüste dein Büro, Coworking Space oder Remote-Team mit ergonomischen Premium-Produkten aus.
            </p>

            <form onSubmit={handleRegisterB2B} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Firmenname (GmbH, AG, UG) *
                </label>
                <input
                  type="text"
                  required
                  value={b2bCompany}
                  onChange={(e) => setB2bCompany(e.target.value)}
                  placeholder="z.B. TechScale Ventures GmbH"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ansprechpartner / Beschaffung *
                </label>
                <input
                  type="text"
                  required
                  value={b2bContact}
                  onChange={(e) => setB2bContact(e.target.value)}
                  placeholder="Dr. Alexander Weber"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Firmen-E-Mail Adresse *
                </label>
                <input
                  type="email"
                  required
                  value={b2bEmail}
                  onChange={(e) => setB2bEmail(e.target.value)}
                  placeholder="beschaffung@techscale.de"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    USt-IdNr. (VAT ID)
                  </label>
                  <input
                    type="text"
                    value={b2bVatId}
                    onChange={(e) => setB2bVatId(e.target.value)}
                    placeholder="DE319824012"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ausstattung (Plätze)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={1000}
                    value={b2bWorkstations}
                    onChange={(e) => setB2bWorkstations(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Building className="w-4 h-4 fill-slate-950" />
                  B2B Firmen-Konditionen sofort beantragen
                </button>
              </div>
            </form>
          </div>

          {/* B2B Tier Calculator & Perks */}
          <div className="space-y-4">
            <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-6">
              <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-400" />
                Staffel-Rabatte für Firmenkunden
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">5 – 10 Arbeitsplätze</span>
                  <span className="font-bold text-amber-400 font-mono">15% Rabatt</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">11 – 25 Arbeitsplätze</span>
                  <span className="font-bold text-amber-400 font-mono">20% Rabatt</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-amber-500/30 bg-amber-500/5">
                  <span className="text-amber-200 font-semibold">26 – 50 Arbeitsplätze</span>
                  <span className="font-bold text-amber-400 font-mono">25% Rabatt (Deine Auswahl)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">50+ Arbeitsplätze</span>
                  <span className="font-bold text-emerald-400 font-mono">35% Großkundenrabatt</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Kauf auf Rechnung (30 Tage Zahlungsziel)
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Vorsteuerabzugsberechtigte B2B Rechnung mit USt.-Ausweis
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Kostenloser Mustersatz zur ergonomischen Vorab-Prüfung
                </div>
              </div>
            </div>

            {registeredB2BCard && (
              <div className="border border-purple-500/40 bg-purple-950/30 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                  B2B-Konto freigeschaltet!
                </div>
                <p className="text-xs text-slate-300">
                  Firma: <strong>{registeredB2BCard.details.company}</strong> · Status: {registeredB2BCard.details.tierDiscount}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: MEMBERS & CRM LIST */}
      {activeSubTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Verzeichnis aller registrierten Kunden, Creator & Firmen
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Echtzeit-Synchronisierung mit Shopify Kunden-Segmenten
            </span>
          </div>

          <div className="border border-slate-800 bg-slate-900/60 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Typ</th>
                    <th className="py-3 px-4">Name & Kontakt</th>
                    <th className="py-3 px-4">Konditionen / Status</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono">
                        {m.type === 'customer_vip' && (
                          <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px]">
                            Aura VIP
                          </span>
                        )}
                        {m.type === 'creator' && (
                          <span className="px-2 py-0.5 rounded bg-sky-400/10 text-sky-300 border border-sky-400/20 text-[10px]">
                            Creator
                          </span>
                        )}
                        {m.type === 'b2b' && (
                          <span className="px-2 py-0.5 rounded bg-purple-400/10 text-purple-300 border border-purple-400/20 text-[10px]">
                            B2B Firmenkunde
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{m.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{m.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        {m.type === 'customer_vip' && (
                          <div className="space-y-0.5">
                            <span className="font-bold text-amber-300">{m.details?.tier} Tier</span>
                            <span className="text-slate-400 block font-mono">{m.details?.points || 100} Punkte</span>
                          </div>
                        )}
                        {m.type === 'creator' && (
                          <div className="space-y-0.5">
                            <span className="font-bold text-sky-300">{m.details?.refCode}</span>
                            <span className="text-slate-400 block">{m.details?.commissionRate}% Provision</span>
                          </div>
                        )}
                        {m.type === 'b2b' && (
                          <div className="space-y-0.5">
                            <span className="font-bold text-purple-300">{m.details?.tierDiscount}</span>
                            <span className="text-slate-400 block">{m.details?.workstationsToEquip} Plätze</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {m.type === 'customer_vip' && `Gutschein: ${m.details?.voucherCode}`}
                        {m.type === 'creator' && `${m.details?.platform} · ${m.details?.handle}`}
                        {m.type === 'b2b' && `USt-Id: ${m.details?.vatId || 'Geprüft'}`}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => showToast(`Profil von ${m.name} aufgerufen`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors"
                        >
                          Verwalten
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EXIT INTENT SIMULATION MODAL */}
      {showExitIntentPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowExitIntentPreview(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ×
            </button>
            <div className="w-12 h-12 bg-amber-400/10 rounded-xl border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Gift className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-mono">
                Warenkorb-Retter Aktiv
              </span>
              <h3 className="text-lg font-bold text-slate-100">
                Warte kurz! Spare heute 10% auf dein Setup.
              </h3>
              <p className="text-xs text-slate-400">
                Verpasse nicht das limitierte Angebot. Nutze den exklusiven Rabattcode vor Verlassen der Seite:
              </p>
            </div>

            <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Gutscheincode:</div>
                <div className="text-base font-bold font-mono text-amber-300">STAY10</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText('STAY10');
                  showToast('Code "STAY10" kopiert!');
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Kopieren
              </button>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Gültig für die nächsten 15 Minuten. 30 Tage Rückgaberecht.
            </div>

            <button
              onClick={() => setShowExitIntentPreview(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Zurück zum Shop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
