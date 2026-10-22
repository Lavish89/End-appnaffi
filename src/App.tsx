import React, { useState } from 'react';
import { 
  Building2, 
  BarChart3, 
  ShoppingBag, 
  Truck, 
  Megaphone, 
  FileCheck2, 
  Bot, 
  Cpu, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  ArrowRight,
  ExternalLink,
  Store,
  Sparkles,
  Link2,
  Smartphone,
  Radio,
  Users,
  Award,
  Dumbbell,
  Download,
  Wrench
} from 'lucide-react';
import { Header } from './components/Header';
import { GoalsforceBusinessHub } from './components/GoalsforceBusinessHub';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { RegistrationAndImprovementsHub } from './components/RegistrationAndImprovementsHub';
import { InAppCommerceSystem } from './components/InAppCommerceSystem';
import { AffiliateSystemDashboard } from './components/AffiliateSystemDashboard';
import { MultiPlatformAdAutopilot } from './components/MultiPlatformAdAutopilot';
import { InitialShopAuditView } from './components/InitialShopAuditView';
import { CompetitorAnalysisView } from './components/CompetitorAnalysisView';
import { ProductRankingView } from './components/ProductRankingView';
import { SupplierAuditView } from './components/SupplierAuditView';
import { StorefrontView } from './components/StorefrontView';
import { ProductCatalogManager } from './components/ProductCatalogManager';
import { MarketingAutomationView } from './components/MarketingAutomationView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ShopifyConnectionControl } from './components/ShopifyConnectionControl';
import { AIAgentsCloudHub } from './components/AIAgentsCloudHub';
import { AutonomousAgentLoop } from './components/AutonomousAgentLoop';
import { AIAgentSidebarChat } from './components/AIAgentSidebarChat';
import { MarketingToolkit } from './components/MarketingToolkit';
import { AffiliateHub } from './affiliate/AffiliateHub';
import { MemberApp } from './MemberApp';
import { AdminUsers } from './components/AdminUsers';
import { HomePage } from './community/HomePage';
import { CommunityPage } from './community/CommunityPage';
import { JobsPage } from './community/JobsPage';
import { AdminCommunity } from './community/AdminCommunity';
import { useAuth } from './auth/AuthGate';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [hubSubTab, setHubSubTab] = useState<string | undefined>(undefined);
  const [stagedChangesCount, setStagedChangesCount] = useState<number>(4);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [isDemoNoticeOpen, setIsDemoNoticeOpen] = useState<boolean>(true);
  const auth = useAuth();

  // Oeffentliche Konten sehen nur ihren Affiliate-Hub und das Toolkit, nicht das Shop-Cockpit
  if (auth && auth.user.role !== 'owner') return <MemberApp />;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200 transition-all duration-300 ${isAiSidebarOpen ? 'lg:mr-[440px]' : ''}`}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenStorefront={() => setActiveTab('storefront')}
        stagedChangesCount={stagedChangesCount}
        isAiSidebarOpen={isAiSidebarOpen}
        onToggleAiSidebar={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Demo-Hinweis: Shop-, Bestell-, Affiliate- und Werbedaten sind simuliert */}
      {isDemoNoticeOpen && (
        <div role="status" className="bg-amber-500/10 border-b border-amber-500/30 text-amber-200 text-xs px-4 sm:px-6 py-2 flex items-start justify-between gap-3">
          <span>
            <strong className="font-semibold">Demo-Modus:</strong> Shopify-Verbindung, Bestellungen, Umsätze, Affiliates und Werbe-Autopilot sind Beispieldaten. Es werden keine echten Zahlungen, Auszahlungen oder Shop-Änderungen ausgeführt.
          </span>
          <button onClick={() => setIsDemoNoticeOpen(false)} className="shrink-0 text-amber-300 hover:text-amber-100 underline" aria-label="Hinweis ausblenden">
            OK
          </button>
        </div>
      )}

      {/* Sub-navigation bar for deep access */}
      <div className="border-b border-slate-800 bg-slate-900/60 sticky top-[57px] z-30 px-6 py-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 max-w-7xl mx-auto">
          {/* Priority Highlights */}
          <button
            onClick={() => setActiveTab('goalsforce')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'goalsforce' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
            Goalsforce (Home-Gym & Regeneration)
          </button>

          <button
            onClick={() => setIsApkModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 bg-slate-900 border border-amber-400/40 text-amber-300 hover:bg-slate-800"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Vollversion APK
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'home' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Start
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'community' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Community
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'jobs' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Jobbörse
          </button>

          <button
            onClick={() => setActiveTab('admin_users')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'admin_users' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin: Nutzer
          </button>

          <button
            onClick={() => setActiveTab('admin_community')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'admin_community' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Admin: Feedback & Community
          </button>

          <button
            onClick={() => setActiveTab('affiliate_hub')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'affiliate_hub' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Affiliate-Hub
          </button>

          <button
            onClick={() => setActiveTab('marketing_toolkit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'marketing_toolkit' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Marketing-Toolkit (150)
          </button>

          <button
            onClick={() => setActiveTab('in_app_commerce')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'in_app_commerce' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            In-App Verkauf (Direkt)
          </button>

          <button
            onClick={() => setActiveTab('improvements_hub')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'improvements_hub' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            VIP-Club & Optimierungs-Zentrum
          </button>

          <button
            onClick={() => setActiveTab('affiliates')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'affiliates' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-500" />
            Affiliate-Netzwerke & Dashboard
          </button>

          <button
            onClick={() => setActiveTab('ad_autopilot')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'ad_autopilot' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            Werbe-Autopilot (6 Plattformen)
          </button>

          <button
            onClick={() => setActiveTab('shopify_control')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'shopify_control' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-sky-400" />
            Shopify-Verbindung & Volle Kontrolle
          </button>

          <button
            onClick={() => setActiveTab('ai_hub')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai_hub' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            KI-Agenten Hub (Claude/Gemini/GPT)
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Erster Auftrag (Audit)
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Phase 2: Top 30 Produkte
          </button>

          <button
            onClick={() => setActiveTab('competitors')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'competitors' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Phase 1: Wettbewerber (20+)
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'suppliers' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Phase 3: Lieferanten
          </button>

          <button
            onClick={() => setActiveTab('storefront')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'storefront' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            Phase 4: Live Storefront
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'catalog' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Phase 5: Katalog & Staging
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'marketing' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            Phase 6: Marketing Skripte
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Phase 7: Controlling
          </button>

          <button
            onClick={() => setActiveTab('agent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'agent' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Phase 8: Agenten-Loop
          </button>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'goalsforce' && (
          <GoalsforceBusinessHub onOpenApkModal={() => setIsApkModalOpen(true)} />
        )}

        {activeTab === 'home' && <HomePage onNavigate={(t, sub) => { setHubSubTab(sub); setActiveTab(t === 'hub' ? 'affiliate_hub' : t === 'toolkit' ? 'marketing_toolkit' : t); }} />}
        {activeTab === 'community' && <CommunityPage />}
        {activeTab === 'jobs' && <JobsPage />}
        {activeTab === 'admin_community' && <AdminCommunity />}
        {activeTab === 'admin_users' && <AdminUsers />}
        {activeTab === 'affiliate_hub' && <AffiliateHub key={hubSubTab || 'hub'} initialTab={hubSubTab} />}
        {activeTab === 'marketing_toolkit' && <MarketingToolkit />}

        {activeTab === 'in_app_commerce' && (
          <InAppCommerceSystem />
        )}

        {activeTab === 'improvements_hub' && (
          <RegistrationAndImprovementsHub />
        )}

        {activeTab === 'affiliates' && (
          <AffiliateSystemDashboard />
        )}

        {activeTab === 'ad_autopilot' && (
          <MultiPlatformAdAutopilot />
        )}

        {activeTab === 'shopify_control' && (
          <ShopifyConnectionControl
            onSyncComplete={() => setStagedChangesCount(4)}
            onThemePublished={() => setStagedChangesCount(0)}
          />
        )}

        {activeTab === 'ai_hub' && (
          <AIAgentsCloudHub />
        )}

        {activeTab === 'audit' && (
          <InitialShopAuditView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'competitors' && (
          <CompetitorAnalysisView />
        )}

        {activeTab === 'products' && (
          <ProductRankingView />
        )}

        {activeTab === 'suppliers' && (
          <SupplierAuditView />
        )}

        {activeTab === 'storefront' && (
          <StorefrontView />
        )}

        {activeTab === 'catalog' && (
          <ProductCatalogManager />
        )}

        {activeTab === 'marketing' && (
          <MarketingAutomationView />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {activeTab === 'agent' && (
          <AutonomousAgentLoop />
        )}
      </main>

      {/* Permanent AI Agent Chat Assistant Sidebar */}
      <AIAgentSidebarChat
        isOpen={isAiSidebarOpen}
        onToggle={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
      />

      {/* Full Version APK Download Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
