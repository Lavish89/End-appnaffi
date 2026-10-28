import React, { useState } from 'react';
import { Check, Wrench, Zap, BookOpen, Share2, ArrowRight } from 'lucide-react';

interface LandingProps {
  authForm: React.ReactNode;
  onChoosePlan: (plan: 'free' | 'pro', interval: 'month' | 'year') => void;
}

const METRICS = [
  { value: '150', label: 'Werkzeuge' },
  { value: '10', label: 'Automationen' },
  { value: '10', label: 'Lektionen' },
  { value: '12', label: 'Netzwerke' },
];

const FEATURES = [
  { icon: Wrench, title: '150 Marketing-Werkzeuge', text: 'Kalkulation, Ads, SEO, Content, E-Mail – alles rechnet nur mit deinen Eingaben.' },
  { icon: Zap, title: '10 Automationen', text: 'Kurzlinks, Wochenberichte, Kennzeichnung & mehr – fertige Rezepte.' },
  { icon: BookOpen, title: 'Lernbereich', text: '10 Lektionen vom Einstieg bis Fortgeschritten, mit Quiz und Praxis.' },
  { icon: Share2, title: 'Community & Jobs', text: 'Tausche dich aus und finde Kooperationen in der Influencer-Jobbörse.' },
];

const FAQ = [
  { q: 'Ist die Basis-Version kostenlos?', a: 'Ja. Free umfasst bis zu 10 Links, 5 Automationen, Lernbereich und Toolkit.' },
  { q: 'Wie kündige ich Pro?', a: 'Jederzeit über „Verträge hier kündigen". Du erhältst eine Bestätigung per E-Mail.' },
  { q: 'Welche Zahlungsarten gibt es?', a: 'Karte, PayPal, SEPA, Klarna, Apple/Google Pay – je nach Freischaltung.' },
];

export const Landing: React.FC<LandingProps> = ({ authForm, onChoosePlan }) => {
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const proPrice = interval === 'month' ? '9,90 € / Monat' : '99 € / Jahr';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Hero */}
      <section className="border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto px-5 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wide">Goalsforce Agent</div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 leading-tight">
              Dein autonomer Assistent fürs Affiliate- &amp; E-Commerce-Business.
            </h1>
            <p className="text-slate-400 mt-4 max-w-lg">
              Plane, optimiere und bewirb deinen Shop – mit 150 Werkzeugen, Automationen, Lernbereich und
              Creator-Community. Starte kostenlos.
            </p>
            <div className="grid grid-cols-4 gap-3 mt-8 max-w-md">
              {METRICS.map((m) => (
                <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-amber-400">{m.value}</div>
                  <div className="text-[11px] text-slate-500">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">{authForm}</div>
        </div>
      </section>

      {/* 3 Schritte */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <h2 className="text-xl font-bold text-white text-center">In drei Schritten startklar</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {['Kostenlos registrieren', 'Nische & Links einrichten', 'Automationen & Content starten'].map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center">{i + 1}</div>
              <div className="mt-3 font-semibold text-slate-100">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <h2 className="text-xl font-bold text-white text-center">Alles an einem Ort</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <f.icon className="w-6 h-6 text-amber-400" />
              <div className="mt-3 font-semibold text-slate-100">{f.title}</div>
              <p className="text-xs text-slate-400 mt-1">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preise */}
      <section className="max-w-4xl mx-auto px-5 py-14">
        <h2 className="text-xl font-bold text-white text-center">Preise</h2>
        <div className="flex items-center justify-center gap-2 mt-5">
          <button onClick={() => setInterval('month')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${interval === 'month' ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>Monatlich</button>
          <button onClick={() => setInterval('year')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${interval === 'year' ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}>Jährlich (−17 %)</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 mt-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="text-lg font-bold text-slate-100">Free</div>
            <div className="text-2xl font-black text-white mt-1">0 €</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {['Bis 10 Links', '5 Automationen', 'Lernbereich & Toolkit', 'CSV-Export'].map((x) => (
                <li key={x} className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" />{x}</li>
              ))}
            </ul>
            <button onClick={() => onChoosePlan('free', interval)} className="mt-6 w-full py-2.5 rounded-lg font-semibold border border-slate-700 text-slate-100 hover:bg-slate-800">Kostenlos starten</button>
          </div>
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 relative">
            <span className="absolute -top-3 left-6 text-[11px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">Empfohlen</span>
            <div className="text-lg font-bold text-slate-100">Pro</div>
            <div className="text-2xl font-black text-white mt-1">{proPrice}</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {['Unbegrenzte Links', 'Alle 10 Automationen', 'Eigene Regeln', 'KI-Entwürfe', 'Link-Prüfung'].map((x) => (
                <li key={x} className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" />{x}</li>
              ))}
            </ul>
            <button onClick={() => onChoosePlan('pro', interval)} className="mt-6 w-full py-2.5 rounded-lg font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 inline-flex items-center justify-center gap-2">
              Pro wählen <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-5 py-14">
        <h2 className="text-xl font-bold text-white text-center">Häufige Fragen</h2>
        <div className="mt-6 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="bg-slate-900 border border-slate-800 rounded-xl px-4">
              <summary className="py-3 font-semibold text-slate-100 cursor-pointer">{f.q}</summary>
              <p className="pb-4 text-sm text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-4">
          <a href="#" className="hover:text-slate-300">Impressum</a>
          <a href="#" className="hover:text-slate-300">Datenschutz</a>
          <a href="#" className="hover:text-slate-300">AGB</a>
        </div>
        <div className="mt-3">© {new Date().getFullYear()} Goalsforce Agent</div>
      </footer>
    </div>
  );
};
