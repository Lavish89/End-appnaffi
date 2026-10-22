import React from 'react';
import { ExternalLink, Shield, ShoppingBag, Megaphone, Users, Award, Bot, Smartphone, Dumbbell } from 'lucide-react';
import { AccountMenu } from '../auth/AuthGate';
import { NotificationBell } from '../community/Feedback';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenStorefront: () => void;
  stagedChangesCount: number;
  isAiSidebarOpen?: boolean;
  onToggleAiSidebar?: () => void;
  onOpenApkModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenStorefront,
  stagedChangesCount,
  isAiSidebarOpen = false,
  onToggleAiSidebar,
  onOpenApkModal,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950 sticky top-0 z-40">
      {/* Zone 1: Brand wordmark (single element) */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveTab('in_app_commerce')}
          className="text-lg font-bold tracking-tight text-slate-100 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 text-left"
        >
          Aura E-Commerce Agent
        </button>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 border border-slate-800 rounded-md px-2 py-0.5 font-mono">
          <Shield className="w-3 h-3 text-emerald-400" />
          Shopify & App verbunden
        </span>
      </div>

      {/* Zone 2: Concise navigation links (single line) */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('in_app_commerce')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'in_app_commerce' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
          <span>In-App Verkauf</span>
        </button>

        <button
          onClick={() => setActiveTab('affiliates')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'affiliates' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <span>Affiliate & Partner</span>
        </button>

        <button
          onClick={() => setActiveTab('improvements_hub')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'improvements_hub' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>VIP-Club & Optimierung</span>
        </button>

        <button
          onClick={() => setActiveTab('ad_autopilot')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'ad_autopilot' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Werbe-Autopilot</span>
        </button>

        <button
          onClick={() => setActiveTab('shopify_control')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'shopify_control' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Shopify Kontrolle
        </button>

        <button
          onClick={() => setActiveTab('ai_hub')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'ai_hub' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          KI-Agenten (Claude/GPT)
        </button>

        <button
          onClick={() => setActiveTab('goalsforce')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'goalsforce' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
          <span>Goalsforce (Home-Gym)</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'analytics' ? 'text-amber-400 font-semibold' : ''
          }`}
        >
          Controlling
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenApkModal && (
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-sm hover:scale-105"
            title="App auf dem Handy installieren"
          >
            <Smartphone className="w-3.5 h-3.5 fill-slate-950" />
            <span className="hidden sm:inline">App installieren</span>
          </button>
        )}

        {onToggleAiSidebar && (
          <button
            onClick={onToggleAiSidebar}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
              isAiSidebarOpen
                ? 'bg-slate-800 text-amber-300 border-amber-400/50 font-bold'
                : 'bg-slate-900 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800'
            }`}
            title="Permanenter KI-Operations-Assistent"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">KI-Assistent</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}

        <button
          onClick={onOpenStorefront}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Live Storefront</span>
          {stagedChangesCount > 0 && (
            <span className="bg-slate-950 text-amber-300 rounded px-1.5 py-0.2 text-[10px] font-mono">
              {stagedChangesCount} Staged
            </span>
          )}
        </button>

        <NotificationBell onNavigate={t => setActiveTab(t === 'hub' ? 'affiliate_hub' : t)} />
        <AccountMenu />
      </div>
    </header>
  );
};
