import React, { useState } from 'react';
import { 
  Sparkles, 
  Video, 
  Instagram, 
  Mail, 
  Search, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  FileText,
  Pin
} from 'lucide-react';
import { MARKETING_CAMPAIGNS, CATALOG_PRODUCTS } from '../data/ecommerceData';
import { MarketingCampaign } from '../types';

export const MarketingAutomationView: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live AI Generator Form
  const [targetProduct, setTargetProduct] = useState(CATALOG_PRODUCTS[0].title);
  const [targetChannel, setTargetChannel] = useState<'tiktok' | 'instagram' | 'pinterest' | 'google_ads' | 'email_flow'>('tiktok');
  const [targetAudience, setTargetAudience] = useState('Homeoffice-Nutzer, Designer, Entwickler in Deutschland');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

  const filteredCampaigns = MARKETING_CAMPAIGNS.filter(c => selectedChannel === 'all' || c.channel === selectedChannel);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateLive = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: targetProduct,
          channel: targetChannel,
          targetAudience,
          price: '39.95€'
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400">PHASE 6 · MARKETING AUTOMATISIERUNG</div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Omnichannel Performance- & Content-Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Fertige 3-Sekunden Video-Hooks für TikTok/Shorts, Instagram Karussells, Pinterest-Pins mit Suchintent, Google Ads RSA-Anzeigengruppen und automatisierte E-Mail-Kundenrückgewinnung.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Aktive Vorlagen: <strong className="text-amber-400">{MARKETING_CAMPAIGNS.length} Kampagnen</strong>
        </div>
      </div>

      {/* AI On-Demand Marketing Creator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Autonomer Gemini AI Werbetexter & Skript-Generator</span>
        </div>
        <p className="text-xs text-slate-400">
          Generiere in Sekunden neue, zielgruppengenaue Video-Skripte oder Anzeigentexte für jedes gewünschte Produkt und jeden Kanal.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Produkt:</label>
            <select
              value={targetProduct}
              onChange={(e) => setTargetProduct(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-amber-500"
            >
              {CATALOG_PRODUCTS.map(p => (
                <option key={p.id} value={p.title}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Kanal:</label>
            <select
              value={targetChannel}
              onChange={(e) => setTargetChannel(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-amber-500"
            >
              <option value="tiktok">TikTok / Reels / Shorts (3s Hook)</option>
              <option value="instagram">Instagram Karussell & Post</option>
              <option value="pinterest">Pinterest High-Intent Pin</option>
              <option value="google_ads">Google Ads RSA & Keywords</option>
              <option value="email_flow">E-Mail Abandoned Cart Flow</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Zielgruppe (DE):</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateLive}
          disabled={isGenerating}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isGenerating ? 'Generiere mit Gemini AI...' : 'Neues Werbemittel generieren'}</span>
        </button>

        {/* Live Result Card */}
        {generatedResult && (
          <div className="mt-4 p-4 bg-slate-950 border border-amber-500/40 rounded-xl space-y-3 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300 font-mono uppercase">
                Generiertes Creative ({generatedResult.channel})
              </span>
              <button
                onClick={() => handleCopyText(JSON.stringify(generatedResult, null, 2), 'live-result')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedId === 'live-result' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Kopieren
              </button>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-semibold text-slate-200 italic">
              Hook: {generatedResult.hook}
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed font-sans text-xs">
              {generatedResult.scriptOrBody}
            </pre>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span>CTA: <strong className="text-slate-200">{generatedResult.callToAction}</strong></span>
              <span>Hashtags: <strong className="text-amber-400">{Array.isArray(generatedResult.hashtags) ? generatedResult.hashtags.join(' ') : generatedResult.hashtags}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Channel Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Alle Kanäle' },
          { id: 'tiktok', label: 'TikTok / Shorts' },
          { id: 'instagram', label: 'Instagram' },
          { id: 'pinterest', label: 'Pinterest' },
          { id: 'google_ads', label: 'Google Ads' },
          { id: 'email_flow', label: 'E-Mail Flows' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setSelectedChannel(item.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedChannel === item.id 
                ? 'bg-amber-400 text-slate-950 font-semibold' 
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Campaign Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCampaigns.map((camp) => (
          <div key={camp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    {camp.channel.replace('_', ' ')}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1">{camp.title}</h3>
                </div>
                <button
                  onClick={() => handleCopyText(`${camp.hookOrSubject}\n\n${camp.creativeDetails}\n\n${camp.callToAction}`, camp.id)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Skript kopieren"
                >
                  {copiedId === camp.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Hook Box */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-amber-300 font-semibold italic">
                {camp.hookOrSubject}
              </div>

              {/* Detailed Script / Steps */}
              <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 max-h-48 overflow-y-auto">
                {camp.creativeDetails}
              </div>

              {/* Hashtags or Keywords */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {camp.hashtagsOrKeywords.map((kw, i) => (
                  <span key={i} className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Zielgruppe: <span className="text-slate-300">{camp.targetAudience}</span></span>
              <span className="text-emerald-400 font-mono">{camp.estimatedMetrics}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
