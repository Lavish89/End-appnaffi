import React, { useState } from 'react';
import {
  Store,
  RefreshCw,
  CheckCircle2,
  Lock,
  Link2,
  UploadCloud,
  AlertTriangle,
} from 'lucide-react';

interface ShopifyConnectionControlProps {
  onSyncComplete?: () => void;
  onThemePublished?: () => void;
}

type ConnState = 'disconnected' | 'connecting' | 'connected';

export const ShopifyConnectionControl: React.FC<ShopifyConnectionControlProps> = ({
  onSyncComplete,
  onThemePublished,
}) => {
  const [conn, setConn] = useState<ConnState>('disconnected');
  const [shopDomain, setShopDomain] = useState('goalsforce.store');
  const [syncing, setSyncing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const flash = (msg: string) => {
    setNote(msg);
    setTimeout(() => setNote(null), 4000);
  };

  const handleConnect = () => {
    setConn('connecting');
    // DEMO: echte Verbindung braucht Shopify Admin API + Access Token (.env: SHOPIFY_*)
    setTimeout(() => {
      setConn('connected');
      flash('Demo: Verbindung simuliert. Für echten Betrieb Shopify Admin API Token in .env hinterlegen.');
    }, 900);
  };

  const handleSync = () => {
    if (conn !== 'connected') return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      flash('Demo: Produktkatalog-Sync simuliert (4 Änderungen im Staging).');
      onSyncComplete?.();
    }, 1200);
  };

  const handlePublishTheme = () => {
    if (conn !== 'connected') return;
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      flash('Demo: Theme-Veröffentlichung simuliert. Live-Gang erfordert deine ausdrückliche Freigabe.');
      onThemePublished?.();
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-amber-400">PHASE 4 · SHOPIFY-ANBINDUNG</div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Shopify-Verbindung &amp; Synchronisation
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Verbinde deinen Shopify-Store, synchronisiere den Produktkatalog und veröffentliche
          Theme-Änderungen – alles unter deiner Freigabe-Kontrolle.
        </p>
      </div>

      {/* Ehrlicher Demo-Hinweis */}
      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          <strong>Demo-Modus.</strong> Die echte Anbindung erfordert die Shopify Admin API mit Access
          Token (in <code className="font-mono">.env</code>: <code className="font-mono">SHOPIFY_STORE_DOMAIN</code>,{' '}
          <code className="font-mono">SHOPIFY_ADMIN_TOKEN</code>). Bis dahin werden Aktionen simuliert.
        </span>
      </div>

      {note && (
        <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{note}</span>
        </div>
      )}

      {/* Verbindungskarte */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Store className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-100">Store-Verbindung</div>
            <div className="text-xs text-slate-400">
              Status:{' '}
              {conn === 'connected' ? (
                <span className="text-emerald-400 font-medium">Verbunden (Demo)</span>
              ) : conn === 'connecting' ? (
                <span className="text-amber-400 font-medium">Verbinde …</span>
              ) : (
                <span className="text-slate-500 font-medium">Nicht verbunden</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3">
            <Link2 className="w-4 h-4 text-slate-500" />
            <input
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
              placeholder="dein-store.myshopify.com"
              className="w-full bg-transparent py-2.5 text-sm text-slate-100 focus:outline-none font-mono"
            />
          </div>
          <button
            onClick={handleConnect}
            disabled={conn === 'connecting'}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-semibold text-sm rounded-lg whitespace-nowrap"
          >
            {conn === 'connected' ? 'Erneut verbinden' : 'Store verbinden'}
          </button>
        </div>
      </div>

      {/* Aktionen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-200">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">Produktkatalog synchronisieren</h3>
          </div>
          <p className="text-xs text-slate-400">
            Gleicht Produkte, Preise und Bestände mit dem Staging ab. Nichts geht ohne deine Freigabe live.
          </p>
          <button
            onClick={handleSync}
            disabled={conn !== 'connected' || syncing}
            className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 flex items-center justify-center gap-2"
          >
            {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {syncing ? 'Synchronisiere …' : 'Jetzt synchronisieren'}
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-200">
            <UploadCloud className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm">Theme veröffentlichen</h3>
          </div>
          <p className="text-xs text-slate-400">
            Schiebt die geprüfte Staging-Kopie live. Erfordert deine ausdrückliche Bestätigung.
          </p>
          <button
            onClick={handlePublishTheme}
            disabled={conn !== 'connected' || publishing}
            className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {publishing ? 'Veröffentliche …' : 'Theme live schalten'}
          </button>
        </div>
      </div>
    </div>
  );
};
