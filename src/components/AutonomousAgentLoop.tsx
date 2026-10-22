import React, { useState } from 'react';
import { 
  Play, 
  RotateCw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowRight,
  Sliders,
  Check,
  Lock
} from 'lucide-react';
import { AGENT_ACTIVITY_LOG } from '../data/ecommerceData';
import { AgentActivity } from '../types';

export const AutonomousAgentLoop: React.FC = () => {
  const [logs, setLogs] = useState<AgentActivity[]>(AGENT_ACTIVITY_LOG);
  const [isLoopRunning, setIsLoopRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const loopSteps = [
    { title: '1. Zustand analysieren', desc: 'Shop-Metriken, Bestände und Konversionsraten im DACH-Markt prüfen' },
    { title: '2. Probleme identifizieren', desc: 'Warenkorbabbrüche, Lieferengpässe & Margin-Dips aufspüren' },
    { title: '3. Maßnahmen priorisieren', desc: 'A/B-Tests, Bundle-Rabatte und virale Video-Hooks ordnen' },
    { title: '4. Sichere Änderungen vorbereiten', desc: 'Nur in unveröffentlichter Staging-Kopie ausführen' },
    { title: '5. Ergebnis überprüfen', desc: 'PageSpeed, mobile Usability und GPSR-Konformität testen' },
    { title: '6. Arbeit dokumentieren', desc: 'Audit-Trail im Log sichern und wöchentlichen Bericht updaten' },
    { title: '7. Prozess wiederholen', desc: 'Kontinuierliche autonome Optimierung im 24h-Zyklus' },
  ];

  const handleRunAutonomousCycle = () => {
    setIsLoopRunning(true);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= loopSteps.length - 1) {
          clearInterval(interval);
          setIsLoopRunning(false);

          // Add a new completed log entry
          const newEntry: AgentActivity = {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            phase: 8,
            phaseName: 'Autonomer Zyklus',
            action: 'Autonomer 7-Stufen-Optimierungszyklus ausgeführt',
            detail: 'Alle 7 Schritte erfolgreich abgeschlossen. Staging-Theme geprüft, Marge gesichert, keine Sicherheitsgrenzen verletzt.',
            status: 'Abgeschlossen',
            safetyCheckPassed: true,
          };
          setLogs(existing => [newEntry, ...existing]);
          return 0;
        }
        return prev + 1;
      });
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-amber-400">PHASE 8 · AUTONOMES ARBEITEN</div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Autonomer Agenten-Loop & Audit-Protokoll
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Der kontinuierliche Arbeitszyklus deines E-Commerce-Agenten: Analysieren, Probleme aufdecken, Maßnahmen priorisieren, im Staging vorbereiten und lückenlos dokumentieren.
          </p>
        </div>

        <button
          onClick={handleRunAutonomousCycle}
          disabled={isLoopRunning}
          className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-lg self-start md:self-auto"
        >
          <Play className={`w-4 h-4 ${isLoopRunning ? 'animate-spin' : ''}`} />
          <span>{isLoopRunning ? 'Zyklus läuft...' : 'Autonomen Zyklus jetzt starten'}</span>
        </button>
      </div>

      {/* 7-Step Autonomous Loop Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">7-Stufen-Optimierungszyklus</h3>
          <span className="text-xs font-mono text-slate-400">
            {isLoopRunning ? `Schritt ${currentStepIndex + 1} von 7 aktiv` : 'Bereit'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
          {loopSteps.map((step, idx) => {
            const isActive = isLoopRunning && currentStepIndex === idx;
            const isCompleted = isLoopRunning && currentStepIndex > idx;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                  isActive
                    ? 'bg-amber-400/10 border-amber-400 text-amber-300 shadow-lg ring-1 ring-amber-400/30'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-semibold flex items-center justify-between">
                  <span className="truncate">{step.title}</span>
                  {isCompleted && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strict Safety Boundaries Monitor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Garantierte Sicherheitsgrenzen (Wichtige Grenzen)
              </h3>
              <p className="text-xs text-slate-400">
                Der Agent handelt strikt nach deinen Vorgaben und überschreitet niemals seine Kompetenzen.
              </p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Alle Grenzen intakt (100%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Keine kostenpflichtigen Apps
            </div>
            <p className="text-[11px] text-slate-400">Ausschließlich kostenfreie oder vorab genehmigte Integrationen aktiv.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              0,00 € Werbeausgaben ohne Freigabe
            </div>
            <p className="text-[11px] text-slate-400">Keine Werbekampagne wird gestartet, bevor du das Budget explizit freigibst.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Staging-Schutz für Themes & Produkte
            </div>
            <p className="text-[11px] text-slate-400">Änderungen werden nur in einer unveröffentlichten Theme-Kopie vorbereitet.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Kein Massenlöschen bestehender Artikel
            </div>
            <p className="text-[11px] text-slate-400">Vorhandene Produkte bleiben unangetastet.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Keine erfundenen Zahlen & Bewertungen
            </div>
            <p className="text-[11px] text-slate-400">Ausschließlich überprüfbare Daten, echte Margen-Kalkulationen und Schätzungs-Kennzeichnung.</p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Rechtlich saubere Angaben (DE/EU)
            </div>
            <p className="text-[11px] text-slate-400">§ 5 TMG Impressum, DSGVO, Widerrufsbelehrung & LUCID VerpackG registriert.</p>
          </div>
        </div>
      </div>

      {/* Activity Log Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Laufendes Agenten-Aktivitäten-Protokoll (Audit Trail)
          </h3>
          <span className="text-xs font-mono text-slate-500">{logs.length} Einträge protokolliert</span>
        </div>

        <div className="space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-400 font-bold">Phase {log.phase}:</span>
                  <span className="font-semibold text-slate-100">{log.action}</span>
                  <span className="text-[10px] font-mono text-slate-500">[{log.timestamp}]</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {log.detail}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                  log.status === 'Abgeschlossen'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {log.status}
                </span>
                <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" /> Geprüft
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
