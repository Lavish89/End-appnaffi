import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, FileText, Scale, Truck, HelpCircle } from 'lucide-react';

// Betreiberangaben laut Shopify-Impressum von goalsforce.store (Stand 22.10.2026).
// vatId nur eintragen, wenn eine USt-IdNr. tatsaechlich vergeben wurde.
const SHOP_URL = 'https://goalsforce.store';
const OPERATOR = {
  brand: 'goalsforce.store',
  name: 'Dragos Serbu',
  street: 'Ernst-Moritz-Arndt-Straße 38',
  city: '46537 Dinslaken',
  email: 'dragosserbu6@gmail.com',
  phone: '+49 176 41676028',
  vatId: '' as string,
};

interface LegalPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'impressum' | 'datenschutz' | 'agb' | 'versand' | 'faq';
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'impressum'
}) => {
  const [activeTab, setActiveTab] = useState<'impressum' | 'datenschutz' | 'agb' | 'versand' | 'faq'>(initialTab);
  useEffect(() => { if (isOpen) setActiveTab(initialTab); }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-semibold text-slate-100">Rechtliche Angaben & Verbraucherschutz (DE / EU)</h2>
              <p className="text-xs text-slate-400">Impressum, Datenschutz, AGB, Widerruf</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-950/30 border-b border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('impressum')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'impressum' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Impressum
          </button>
          <button
            onClick={() => setActiveTab('datenschutz')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'datenschutz' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Datenschutzerklärung (DSGVO)
          </button>
          <button
            onClick={() => setActiveTab('agb')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'agb' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            AGB & Widerrufsbelehrung
          </button>
          <button
            onClick={() => setActiveTab('versand')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'versand' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Versand & Zahlungsarten
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'faq' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Häufige Fragen (FAQ)
          </button>
        </div>

        {/* Content Area */}
        {/*
          WICHTIG: Rechtstexte hier nur als Kurzfassung. Massgeblich sind die Texte im Shop
          (goalsforce.store/policies/...). Keine Registernummern o. Ae. erfinden – fehlende
          Angaben (z. B. USt-IdNr.) nur eintragen, wenn sie tatsaechlich vorliegen.
          Vor Veroeffentlichung rechtlich pruefen lassen (z. B. Haendlerbund, IT-Recht Kanzlei).
        */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-300 space-y-4 leading-relaxed">
          <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200">
            Kurzfassung. Verbindlich sind die vollständigen Rechtstexte im Shop:{' '}
            <a href={`${SHOP_URL}/policies/legal-notice`} target="_blank" rel="noreferrer" className="underline">goalsforce.store</a>.
          </div>

          {activeTab === 'impressum' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Impressum</h3>
              <p className="text-xs text-slate-400">Angaben gemäß § 5 DDG</p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <p className="font-semibold text-slate-100">{OPERATOR.name} – {OPERATOR.brand}</p>
                <p>{OPERATOR.street}<br />{OPERATOR.city}<br />Deutschland</p>
                <p><span className="text-slate-400">Kontakt:</span> {OPERATOR.email} · Tel: {OPERATOR.phone}</p>
                {OPERATOR.vatId && (
                  <p><span className="text-slate-400">USt-IdNr. gemäß § 27a UStG:</span> {OPERATOR.vatId}</p>
                )}
              </div>

              <h4 className="font-semibold text-slate-100 pt-2">Verbraucherstreitbeilegung</h4>
              <p className="text-xs text-slate-400">
                Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>
          )}

          {activeTab === 'datenschutz' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Datenschutz (Kurzfassung)</h3>
              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-semibold text-slate-200">1. Verantwortlicher</h4>
                  <p className="text-xs mt-1 text-slate-400">
                    {OPERATOR.name}, {OPERATOR.street}, {OPERATOR.city}, {OPERATOR.email}
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-semibold text-slate-200">2. Bestelldaten</h4>
                  <p className="text-xs mt-1 text-slate-400">
                    Bei einer Bestellung verarbeiten wir Name, Anschrift, E-Mail-Adresse und Bestelldaten gem. Art. 6 Abs. 1 lit. b DSGVO zur Vertragserfüllung. Der Shop wird mit Shopify betrieben; Zahlungsdaten werden direkt von den Zahlungsanbietern verarbeitet.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="font-semibold text-slate-200">3. Ihre Rechte</h4>
                  <p className="text-xs mt-1 text-slate-400">
                    Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21 DSGVO) sowie Beschwerde bei einer Aufsichtsbehörde.
                  </p>
                </div>
              </div>
              <a href={`${SHOP_URL}/policies/privacy-policy`} target="_blank" rel="noreferrer" className="text-xs text-amber-400 underline">Vollständige Datenschutzerklärung</a>
            </div>
          )}

          {activeTab === 'agb' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">AGB & Widerrufsrecht</h3>
              <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl">
                <h4 className="font-semibold text-amber-300 text-sm">Gesetzliches Widerrufsrecht (14 Tage)</h4>
                <p className="text-xs mt-1 text-slate-300">
                  Verbraucher können den Vertrag binnen 14 Tagen ohne Angabe von Gründen widerrufen. Die Frist beginnt mit Erhalt der Ware.
                </p>
                <div className="mt-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
                  Widerruf an: {OPERATOR.name}, {OPERATOR.street}, {OPERATOR.city} ({OPERATOR.email})
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <p><strong className="text-slate-200">Vertragspartner:</strong> {OPERATOR.name} ({OPERATOR.brand}).</p>
                <p><strong className="text-slate-200">Gewährleistung:</strong> Es gilt das gesetzliche Mängelhaftungsrecht.</p>
                <p><strong className="text-slate-200">Mitgliedschaft Goalsforce Pro:</strong> Pro wird monatlich oder jährlich im Voraus bezahlt und verlängert sich automatisch um die gewählte Laufzeit, wenn nicht vorher gekündigt wird. Kündigung jederzeit zum Ende der Laufzeit unter „Konto & Mitgliedschaft“ → „Verträge hier kündigen“; die Bestätigung kommt per E-Mail.</p>
                <p><strong className="text-slate-200">Widerruf bei Pro:</strong> Du kannst den Vertrag innerhalb von 14 Tagen widerrufen. Hast du verlangt, dass Pro sofort startet, zahlst du bei einem Widerruf nur den Anteil bis zum Widerruf.</p>
              </div>
              <div className="flex gap-4 text-xs">
                <a href={`${SHOP_URL}/policies/terms-of-service`} target="_blank" rel="noreferrer" className="text-amber-400 underline">AGB</a>
                <a href={`${SHOP_URL}/policies/refund-policy`} target="_blank" rel="noreferrer" className="text-amber-400 underline">Widerrufsbelehrung</a>
              </div>
            </div>
          )}

          {activeTab === 'versand' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Versand & Zahlung</h3>
              <p className="text-xs text-slate-400">
                Versandkosten, Lieferzeiten und Zahlungsarten werden im Checkout und in den Versandbedingungen des Shops angezeigt.
              </p>
              <a href={`${SHOP_URL}/policies/shipping-policy`} target="_blank" rel="noreferrer" className="text-xs text-amber-400 underline">Versandbedingungen</a>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Häufige Fragen</h3>
              <div className="space-y-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-200">Wie kann ich zurückgeben?</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Schreib uns innerhalb von 14 Tagen nach Erhalt an {OPERATOR.email}. Die Details stehen in der Widerrufsbelehrung.
                  </p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-200">Wie erreiche ich den Support?</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Per E-Mail an {OPERATOR.email} oder telefonisch unter {OPERATOR.phone}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/80">
          <span className="text-xs text-slate-500">{OPERATOR.brand} · Kurzfassung, verbindlich sind die Shop-Rechtstexte</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-900 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
