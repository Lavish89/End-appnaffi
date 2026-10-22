import React, { useState } from 'react';
import { Dumbbell, Handshake, Wrench, Home, Hash, Briefcase } from 'lucide-react';
import { AccountMenu } from './auth/AuthGate';
import { AffiliateHub } from './affiliate/AffiliateHub';
import { MarketingToolkit } from './components/MarketingToolkit';
import { LegalPagesModal } from './components/LegalPagesModal';
import { HomePage, MainTab } from './community/HomePage';
import { CommunityPage } from './community/CommunityPage';
import { JobsPage } from './community/JobsPage';
import { NotificationBell } from './community/Feedback';
import { ALL_TOOLS } from './data/allTools';

// Oeffentliche Ansicht fuer alle registrierten Nutzer.
export const MemberApp: React.FC = () => {
  const [tab, setTab] = useState<MainTab>('home');
  const [hubTab, setHubTab] = useState<string | undefined>(undefined);
  const [legalOpen, setLegalOpen] = useState(false);
  const go = (t: MainTab | string, sub?: string) => { setHubTab(sub); setTab((['home', 'hub', 'community', 'jobs', 'toolkit'].includes(t) ? t : 'home') as MainTab); window.scrollTo({ top: 0 }); };
  const tabs = [
    { key: 'home' as const, label: 'Start', icon: Home },
    { key: 'hub' as const, label: 'Affiliate-Hub', icon: Handshake },
    { key: 'community' as const, label: 'Community', icon: Hash },
    { key: 'jobs' as const, label: 'Jobbörse', icon: Briefcase },
    { key: 'toolkit' as const, label: `Toolkit (${ALL_TOOLS.length})`, icon: Wrench },
  ];
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950 sticky top-0 z-40">
        <button onClick={() => go('home')} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center"><Dumbbell className="w-4 h-4 text-slate-950" /></div>
          <span className="text-lg font-bold tracking-tight hidden sm:inline">Goalsforce</span>
        </button>
        <nav className="flex items-center gap-1 overflow-x-auto" aria-label="Bereiche">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => go(t.key)} aria-current={tab === t.key ? 'page' : undefined} aria-label={t.label}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${tab === t.key ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
                <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden md:inline">{t.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <NotificationBell onNavigate={t => go(t)} />
          <AccountMenu />
        </div>
      </header>
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        {tab === 'home' && <HomePage onNavigate={go} />}
        {tab === 'hub' && <AffiliateHub key={hubTab || 'hub'} initialTab={hubTab} />}
        {tab === 'community' && <CommunityPage />}
        {tab === 'jobs' && <JobsPage />}
        {tab === 'toolkit' && <MarketingToolkit />}
      </main>
      <footer className="text-center text-[11px] text-slate-600 py-6">
        <button onClick={() => setLegalOpen(true)} className="hover:text-slate-400">Impressum & Datenschutz</button>
      </footer>
      <LegalPagesModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} />
    </div>
  );
};
