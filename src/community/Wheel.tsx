import React, { useEffect, useState } from 'react';
import { Gift, Loader2, Trophy } from 'lucide-react';
import { getJson, postJson, ui } from './api';
import { BADGES, level, Rewards } from './shared';
import { useAuth } from '../auth/AuthGate';

interface Seg { id: string; label: string; type: string; value: number | string; color: string }

// Gluecksrad: einmal am Tag kostenlos drehen. Das Ergebnis bestimmt der Server, die Animation zeigt es nur an.
export const Wheel: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const auth = useAuth();
  const [segs, setSegs] = useState<Seg[]>([]);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [canSpin, setCanSpin] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; tip?: string; type: string } | null>(null);
  const [err, setErr] = useState('');

  const load = () => getJson('/api/me/rewards').then(d => { setSegs(d.segments); setRewards(d.rewards); setCanSpin(d.canSpin); }).catch(e => setErr(e.message));
  useEffect(() => { load(); }, []);

  const spin = async () => {
    setErr('');
    setResult(null);
    setSpinning(true);
    try {
      const d = await postJson('/api/me/wheel/spin');
      const seg = 360 / segs.length;
      // Zeiger steht oben: Feld i liegt zwischen i*seg und (i+1)*seg im Uhrzeigersinn
      const target = 360 * 6 + (360 - (d.index * seg + seg / 2));
      setRotation(r => r - (r % 360) + target);
      setTimeout(async () => {
        setSpinning(false);
        setCanSpin(false);
        setRewards(d.rewards);
        setResult({ label: d.segment.label, tip: d.tip, type: d.segment.type });
        if (d.segment.type === 'pro_days') await auth?.refresh();
      }, 4200);
    } catch (e: any) {
      setSpinning(false);
      setErr(e.message);
    }
  };

  const size = compact ? 200 : 260, r = size / 2;
  const lv = level(rewards?.points || 0);
  const seg = segs.length ? 360 / segs.length : 0;
  const path = (i: number) => {
    const a0 = ((i * seg - 90) * Math.PI) / 180, a1 = (((i + 1) * seg - 90) * Math.PI) / 180;
    return `M${r},${r} L${r + r * Math.cos(a0)},${r + r * Math.sin(a0)} A${r},${r} 0 0 1 ${r + r * Math.cos(a1)},${r + r * Math.sin(a1)} Z`;
  };

  return (
    <div className={`${ui.card} space-y-4`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2"><Gift className="w-4 h-4 text-amber-400" /> Glücksrad</h3>
        {rewards && <span className="text-[11px] text-slate-400 flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-400" /> Level {lv.level} · {rewards.points} Punkte{rewards.streak ? ` · 🔥 ${rewards.streak} Tage` : ''}</span>}
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          <div className="absolute left-1/2 -top-1 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-amber-400" aria-hidden="true" />
          <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Glücksrad mit Preisen"
            style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.21, 1)' : 'none' }}>
            {segs.map((s, i) => {
              const mid = ((i + 0.5) * seg - 90) * (Math.PI / 180);
              const tx = r + r * 0.62 * Math.cos(mid), ty = r + r * 0.62 * Math.sin(mid);
              return (
                <g key={s.id}>
                  <path d={path(i)} fill={s.color} stroke="#020617" strokeWidth={2} />
                  <text x={tx} y={ty} fill="#f8fafc" fontSize={compact ? 9 : 11} fontWeight={700} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${(i + 0.5) * seg}, ${tx}, ${ty})`}>{s.label}</text>
                </g>
              );
            })}
            <circle cx={r} cy={r} r={r * 0.14} fill="#020617" stroke="#fbbf24" strokeWidth={3} />
          </svg>
        </div>
        <button onClick={spin} disabled={!canSpin || spinning || !segs.length} className={`${ui.primary} !text-sm !px-5`}>
          {spinning ? <><Loader2 className="w-4 h-4 animate-spin" /> Dreht …</> : canSpin ? 'Jetzt drehen' : 'Morgen wieder drehen'}
        </button>
        {err && <p role="alert" className="text-xs text-rose-300">{err}</p>}
        {result && (
          <div role="status" className="w-full text-center bg-amber-400/10 border border-amber-400/30 rounded-xl p-3 space-y-1">
            <div className="text-sm font-bold text-amber-200">Gewonnen: {result.label}{result.type === 'pro_days' ? ' – Pro ist jetzt aktiv!' : ''}</div>
            {result.tip && <p className="text-xs text-slate-300">💡 {result.tip}</p>}
          </div>
        )}
        <p className="text-[11px] text-slate-500 text-center">Einmal am Tag kostenlos, ohne Einsatz. Gewinne: Punkte, Abzeichen, Tipps oder Pro-Tage.</p>
      </div>
      {rewards && rewards.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {rewards.badges.map(b => <span key={b} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200">{BADGES[b] || '🏅'} {b}</span>)}
        </div>
      )}
    </div>
  );
};
