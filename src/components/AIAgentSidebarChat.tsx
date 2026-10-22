import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  RotateCcw,
  Shield,
  TrendingUp,
  Package,
  Layers,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Radio,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
}

interface AIAgentSidebarChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AIAgentSidebarChat: React.FC<AIAgentSidebarChatProps> = ({
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      role: 'assistant',
      text: `Hallo! Ich bin dein **permanenter KI-Operations-Assistent** für alle laufenden Agenten-Prozesse.

Ich überwache in Echtzeit:
• **Werbe-Autopilot:** 6 Kanäle aktiv (ROAS **4.82x**)
• **Shopify-Sync:** \`aura-workspace.myshopify.com\` (Staged Theme v2.4 gesichert)
• **In-App Verkäufe:** Direkte Bestellungen & DHL Frankfurt Fulfillment
• **Deckungsbeiträge:** DB I & DB II für alle 30 Produktkandidaten
• **Sicherheits-Leitplanken:** Keine unautorisierten Werbekosten & Publish-Schutz

*Welchen laufenden Prozess möchtest du prüfen oder anpassen?*`,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini_3.8_flash',
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsSending(true);

    try {
      // Map history for context
      const history = messages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/gemini/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'gemini_3.8_flash',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Antwort konnte nicht geladen werden');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Verbindungshinweis:** ${err.message || 'Die Anfrage konnte nicht abgeschlossen werden.'}\n\nAlle lokalen Agenten-Prozesse laufen im sicheren Modus weiter.`,
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        text: `Der Chat wurde zurückgesetzt. Der **Telemetrie-Monitor** ist aktiv. Wie kann ich dir bei den laufenden Agenten-Prozessen helfen?`,
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  const quickPrompts = [
    { label: '📊 Werbe-ROAS prüfen', query: 'Wie steht es aktuell um den Werbe-Autopilot und unseren ROAS?' },
    { label: '💰 Top-Deckungsbeiträge', query: 'Welche Produkte haben den höchsten Deckungsbeitrag (DB II)?' },
    { label: '🛡️ Sicherheitsregeln', query: 'Welche Sicherheitsregeln und Leitplanken gelten für den Agenten?' },
    { label: '📦 Bestellungen & DHL', query: 'Wie viele Bestellungen sind eingegangen und wie ist der Fulfillment-Status?' },
    { label: '🚀 Conversion-Booster', query: 'Welche Conversion-Optimierungen sind aktuell scharfgeschaltet?' },
    { label: '⚡ Shopify & Theme', query: 'Wie ist der Status der Shopify-Verbindung und des Staged Themes?' },
  ];

  // Helper to format text with simple markdown-like elements
  const formatText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Bold handling
      let formattedLine: React.ReactNode = line;
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const itemText = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc pl-1 text-slate-300">
            {renderBoldText(itemText)}
          </li>
        );
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
        return (
          <div key={idx} className="font-semibold text-slate-200 mt-1">
            {renderBoldText(line)}
          </div>
        );
      }
      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'mb-1'}>
          {renderBoldText(line)}
        </p>
      );
    });
  };

  const renderBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-amber-300 font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-slate-950 text-amber-200 px-1 py-0.5 rounded font-mono text-[11px] border border-slate-800">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Activator Pill when collapsed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 hover:bg-slate-800 border border-amber-400/40 text-slate-100 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 group backdrop-blur-md"
          title="KI-Agenten Assistent öffnen"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-bold tracking-tight text-slate-200 group-hover:text-amber-300">
            KI-Operations-Assistent
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            Live
          </span>
        </button>
      )}

      {/* Slide-in Permanent Sidebar */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[400px] lg:w-[440px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out backdrop-blur-xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-100">KI-Operations-Assistent</h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Echtzeit-Telemetrie aller Agenten
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
              title="Chat leeren"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
              title="Sidebar schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Status Ticker Banner */}
        <div className="px-3.5 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Store: <strong className="text-slate-200">Aura Studio</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-semibold">ROAS: 4.82x</span>
            <span className="text-slate-600">|</span>
            <span className="text-sky-400">6 Plattformen</span>
          </div>
        </div>

        {/* Chat History Viewport */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-500 font-mono">
                <span>{msg.role === 'user' ? 'Du' : 'Operations-Assistent'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`relative group max-w-[90%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-amber-400 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="space-y-1">{formatText(msg.text)}</div>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity rounded bg-slate-800/80"
                    title="Antwort kopieren"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-amber-300 font-mono bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-xl w-fit">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Analysiere Agenten-Telemetrie & generiere Antwort...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800/80">
          <div className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Schnellabfragen zu laufenden Prozessen:
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                disabled={isSending}
                onClick={() => handleSendMessage(item.query)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-amber-300 transition-colors text-left"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Rückfrage zu Prozessen, ROAS, Margen..."
              disabled={isSending}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="p-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-sm"
              title="Senden"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              Sicherheits-Leitplanken aktiv (0€ unautorisiert)
            </span>
            <span>Enter = Senden</span>
          </div>
        </div>
      </aside>
    </>
  );
};
