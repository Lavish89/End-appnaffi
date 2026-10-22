import React, { useState } from 'react';
import { 
  Bot, 
  Cpu, 
  Cloud, 
  Sparkles, 
  Plus, 
  Send, 
  CheckCircle2, 
  Settings2, 
  Zap, 
  Key, 
  Database, 
  Radio, 
  Globe, 
  ArrowRight,
  Terminal,
  ShieldCheck
} from 'lucide-react';

interface AIAgentConfig {
  id: string;
  name: string;
  provider: 'anthropic_claude' | 'google_gemini' | 'openai' | 'deepseek' | 'custom_agent';
  model: string;
  role: string;
  systemPrompt: string;
  temperature: number;
  apiKeySet: boolean;
  active: boolean;
}

export const AIAgentsCloudHub: React.FC = () => {
  const [agents, setAgents] = useState<AIAgentConfig[]>([
    {
      id: 'agent-claude',
      name: 'Claude 3.7 Sonnet',
      provider: 'anthropic_claude',
      model: 'claude-3-7-sonnet-20250219',
      role: 'Chief E-Commerce Strategist & Brand Director',
      systemPrompt: 'Du bist der leitende Stratege für profitable Shopify-Marken. Dein Fokus: Hohe Margen (DB II > 60%), AOV-Steigerung durch Bündel und emotionale Kundenansprache.',
      temperature: 0.7,
      apiKeySet: true,
      active: true,
    },
    {
      id: 'agent-gemini',
      name: 'Gemini 3.8 Flash',
      provider: 'google_gemini',
      model: 'gemini-3.8-flash',
      role: 'Marktforscher, Produktsucher & 12-Faktoren-Analyst',
      systemPrompt: 'Scanne Markttrends, prüfe Lieferzeiten nach Deutschland und berechne exakte Deckungsbeiträge unter Berücksichtigung von Zahlungsgebühren und Retouren.',
      temperature: 0.5,
      apiKeySet: true,
      active: true,
    },
    {
      id: 'agent-openai',
      name: 'GPT-4o Performance Copy',
      provider: 'openai',
      model: 'gpt-4o',
      role: 'TikTok 3-Sekunden-Hooks & E-Mail Retention',
      systemPrompt: 'Erstelle packende Vorher/Nachher-Skripte für Kurzvideos, Instagram-Karussells und automatisierte Warenkorb-Abbrecher-Mails auf Deutsch.',
      temperature: 0.8,
      apiKeySet: true,
      active: true,
    },
    {
      id: 'agent-deepseek',
      name: 'DeepSeek R1 Reasoning',
      provider: 'deepseek',
      model: 'deepseek-reasoner-r1',
      role: 'Finanz-Mathematik & ROAS-Breakeven Auditor',
      systemPrompt: 'Mathematisch rigorose Deckungsbeitrags-Rechnung. Trenne Brutto-Umsatz strikt von Nettogewinn.',
      temperature: 0.2,
      apiKeySet: true,
      active: true,
    }
  ]);

  const [selectedAgent, setSelectedAgent] = useState<AIAgentConfig>(agents[0]);
  const [promptInput, setPromptInput] = useState('Analysiere die Conversion-Chancen für unser Desk-Setup Starter-Set (Unterlage + MagSafe Ständer) bei 79,90€.');
  const [isRunning, setIsRunning] = useState(false);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);

  // New Agent Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentProvider, setNewAgentProvider] = useState<'anthropic_claude' | 'google_gemini' | 'openai' | 'deepseek' | 'custom_agent'>('anthropic_claude');
  const [newAgentModel, setNewAgentModel] = useState('claude-3-5-sonnet-20241022');
  const [newAgentRole, setNewAgentRole] = useState('SEO & GPSR Compliance Specialist');
  const [newAgentPrompt, setNewAgentPrompt] = useState('Du prüfst alle Texte auf SEO-Keywords, Title-Tags und EU-Rechtskonformität.');

  const handleRunAgent = async () => {
    if (!promptInput.trim()) return;
    setIsRunning(true);
    setAgentOutput(null);

    try {
      const res = await fetch('/api/ai-agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          prompt: promptInput,
        })
      });
      const data = await res.json();
      if (data.success) {
        setAgentOutput(data.output);
      } else {
        setAgentOutput(`Fehler: ${data.error}`);
      }
    } catch (err: any) {
      setAgentOutput(`Netzwerkfehler: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName) return;

    const newAgent: AIAgentConfig = {
      id: `agent-custom-${Date.now()}`,
      name: newAgentName,
      provider: newAgentProvider,
      model: newAgentModel,
      role: newAgentRole,
      systemPrompt: newAgentPrompt,
      temperature: 0.7,
      apiKeySet: true,
      active: true,
    };

    setAgents(prev => [...prev, newAgent]);
    setSelectedAgent(newAgent);
    setIsAddModalOpen(false);
    setNewAgentName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400">MULTI-KI-AGENTEN & CLOUD INTEGRATION</div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Beliebige KI-Agenten einbinden & Cloud-Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Verbinde Claude 3.7 / 3.5 Sonnet, Google Gemini, OpenAI GPT-4o, DeepSeek R1 oder eigene Custom KI-Agenten zur automatisierten Steuerung deines Shopify-Shops.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Neuen KI-Agenten hinzufügen</span>
        </button>
      </div>

      {/* Cloud Infrastructure Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Cloud Sync & Storage</div>
            <div className="text-sm font-semibold text-slate-100">Frankfurt Cloud Zone (EU)</div>
            <div className="text-[10px] text-emerald-400">DSGVO-konform verschlüsselt</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Live Webhook Listener</div>
            <div className="text-sm font-semibold text-slate-100">Shopify Events Aktiv</div>
            <div className="text-[10px] text-slate-400">Bestellungen, Inventar, Cart Abbrüche</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Agenten-Routing Engine</div>
            <div className="text-sm font-semibold text-slate-100">{agents.length} KI-Modelle Bereit</div>
            <div className="text-[10px] text-amber-400">Automatisches Multi-Agent Handover</div>
          </div>
        </div>
      </div>

      {/* Main Split: Agent Selector Left, Interactive Agent Playground Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agent Cards */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-300">Eingebundene KI-Agenten</div>
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                selectedAgent.id === agent.id
                  ? 'bg-slate-900 border-amber-500 shadow-md ring-1 ring-amber-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">{agent.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500">{agent.model}</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                  Aktiv
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2">
                {agent.role}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Provider: {agent.provider.replace('_', ' ')}</span>
                <span className="text-amber-400">Temp: {agent.temperature}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Live Interactive Agent Execution Terminal */}
        <div className="lg:col-span-2 space-y-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedAgent.name}</h3>
                  <p className="text-xs text-slate-400">{selectedAgent.role}</p>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Modell: {selectedAgent.model}
              </div>
            </div>

            {/* System Prompt View */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-slate-500 text-[11px] font-mono">System-Prompt & Mission:</div>
              <p className="text-slate-300 italic">{selectedAgent.systemPrompt}</p>
            </div>

            {/* Input Prompt Box */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">Befehl / Frage an den Agenten:</label>
              <textarea
                rows={3}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="z.B. Erstelle eine Werbestrategie für die Desk Mat..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
              />
            </div>

            <button
              onClick={handleRunAgent}
              disabled={isRunning || !promptInput.trim()}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Agent führt Analyse aus...' : `Ausführen mit ${selectedAgent.name}`}</span>
            </button>

            {/* Output Screen */}
            {agentOutput && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                  <span className="font-mono text-amber-400 font-semibold">Antwort von {selectedAgent.name}:</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Erfolgreich generiert
                  </span>
                </div>
                <pre className="text-xs text-slate-200 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                  {agentOutput}
                </pre>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Multi-Agenten Handover aktiv · Gesicherte API-Kommunikation</span>
            <span className="text-amber-400">Bereit für Shopify Automationen</span>
          </div>
        </div>
      </div>

      {/* Modal: Neuen KI-Agenten einbinden */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-400" />
                Neuen KI-Agenten konfigurieren
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Name des KI-Agenten:</label>
                <input
                  type="text"
                  required
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="z.B. Claude 3.7 Sonnet - E-Com Lead"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Modell Provider:</label>
                  <select
                    value={newAgentProvider}
                    onChange={(e) => setNewAgentProvider(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="anthropic_claude">Anthropic Claude (3.7 / 3.5)</option>
                    <option value="google_gemini">Google Gemini (3.8 / 3.1)</option>
                    <option value="openai">OpenAI (GPT-4o, o3-mini)</option>
                    <option value="deepseek">DeepSeek (R1, V3)</option>
                    <option value="custom_agent">Eigener Webhook / REST Agent</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Modell-Kennung:</label>
                  <input
                    type="text"
                    value={newAgentModel}
                    onChange={(e) => setNewAgentModel(e.target.value)}
                    placeholder="claude-3-7-sonnet-20250219"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Spezialisierte Rolle:</label>
                <input
                  type="text"
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value)}
                  placeholder="z.B. SEO Meta-Data & Schema.org Rich Snippets"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">System-Prompt & Arbeitsanweisung:</label>
                <textarea
                  rows={3}
                  value={newAgentPrompt}
                  onChange={(e) => setNewAgentPrompt(e.target.value)}
                  placeholder="Definiere die Verhaltensregeln für den Agenten..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-colors shadow-lg"
                >
                  Agenten einbinden & aktivieren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
