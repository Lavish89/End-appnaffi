import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  ExternalLink,
  X,
  Share2,
  FileCode,
  HelpCircle,
  Sparkles,
  Zap
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeOsTab, setActiveOsTab] = useState<'android' | 'pwa' | 'ios'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
      }
    } else {
      // Fallback instruction
      alert('Tippe im Chrome-Menü (oben rechts die drei Punkte) auf „App installieren“ oder „Zum Startbildschirm hinzufügen“.');
    }
  };

  // Die fruehere "APK" war nur ein 3-KB-Platzhalter ohne Code und liess sich nicht installieren.
  // Bis eine echte, signierte APK (z. B. per Bubblewrap/TWA) gebaut ist, installieren wir die PWA.
  const handleDownloadApk = () => {
    setDownloadStarted(true);
    handleInstallPWA().finally(() => setTimeout(() => setDownloadStarted(false), 1500));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Smartphone className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Vollversion v2.4 (Release)
              </span>
              <span className="text-[10px] font-mono text-slate-400">Android & PWA</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Vollversion APK & App herunterladen
            </h2>
            <p className="text-xs text-slate-400">
              Installiere Goalsforce als eigenständige Vollbild-App direkt auf deinem Android-Smartphone oder Tablet.
            </p>
          </div>
        </div>

        {/* OS & Method Switcher */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveOsTab('android')}
            className={`py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeOsTab === 'android'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Direkt-APK</span>
          </button>

          <button
            onClick={() => setActiveOsTab('pwa')}
            className={`py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeOsTab === 'pwa'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click PWA</span>
          </button>

          <button
            onClick={() => setActiveOsTab('ios')}
            className={`py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              activeOsTab === 'ios'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>iOS Safari</span>
          </button>
        </div>

        {/* TAB 1: ANDROID APK DIRECT DOWNLOAD */}
        {activeOsTab === 'android' && (
          <div className="space-y-4">
            <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-sm font-bold text-slate-100 flex items-center gap-2 justify-center sm:justify-start">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  Goalsforce-Business-Agent-v2.4.apk
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Native APK in Vorbereitung · bis dahin als Web-App installieren
                </div>
              </div>

              <button
                onClick={handleDownloadApk}
                className="w-full sm:w-auto px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{downloadStarted ? 'Wird geöffnet...' : 'Als App installieren'}</span>
              </button>
            </div>

            {/* Step by step installation */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                So installierst du die APK auf deinem Android-Gerät:
              </div>
              <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Öffne diese Seite in <strong className="text-slate-200">Chrome</strong> auf deinem Android-Gerät.</li>
                <li>Tippe auf <strong className="text-slate-200">„Als App installieren“</strong> oder im Chrome-Menü auf <strong className="text-slate-200">„App installieren“</strong>.</li>
                <li>Das Goalsforce-Icon erscheint auf deinem Startbildschirm – ohne Sideloading und ohne unbekannte Quellen.</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: 1-CLICK PWA (WEBAPK) */}
        {activeOsTab === 'pwa' && (
          <div className="space-y-4">
            <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">
                Direkte WebAPK-Installation im Browser
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Erfordert keine APK-Dateiberechtigungen. Chrome generiert automatisch eine native Android-WebAPK.
              </p>

              <button
                onClick={handleInstallPWA}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>1-Click App auf Smartphone installieren</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-300">Vorteile der WebAPK:</div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Echte Vollbild-Darstellung ohne Browser-Adressleiste
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Offline-Verfügbarkeit mit Service Worker Caching
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automatische Updates im Hintergrund
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IOS SAFARI */}
        {activeOsTab === 'ios' && (
          <div className="space-y-4">
            <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-400" />
                Installation auf iPhone & iPad (iOS Safari)
              </h4>
              <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside leading-relaxed">
                <li>
                  Öffne diese Web-App in <strong>Safari</strong> auf deinem iPhone/iPad.
                </li>
                <li>
                  Tippe unten in der Menüleiste auf das <strong>Teilen-Symbol</strong> (Rechteck mit Pfeil nach oben).
                </li>
                <li>
                  Scrolle nach unten und wähle <strong>„Zum Home-Bildschirm“</strong> (Add to Home Screen).
                </li>
                <li>
                  Tippe oben rechts auf <strong>„Hinzufügen“</strong>.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Security & Offline Trust Banner */}
        <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Virenfrei & Verschlüsselt (SSL / TLS)</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
