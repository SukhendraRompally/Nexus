import { useState } from 'react';
import type { GameConfig } from '../types';

const PLAYER_COLORS = [
  'from-cyan-400 to-cyan-600',
  'from-orange-400 to-orange-600',
  'from-green-400 to-green-600',
  'from-fuchsia-400 to-fuchsia-600',
];

interface PlayerSlot {
  name: string;
  isBot: boolean;
}

interface GameSetupProps {
  onStart: (players: { name: string; isBot: boolean }[], config: GameConfig) => void;
  onCreateOnline?: (players: { name: string; isBot: boolean }[], config: GameConfig) => void;
  isFirebaseConfigured?: boolean;
}

export function GameSetup({ onStart, onCreateOnline, isFirebaseConfigured }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [slots, setSlots] = useState<PlayerSlot[]>([
    { name: '', isBot: false },
    { name: '', isBot: false },
    { name: '', isBot: false },
    { name: '', isBot: false },
  ]);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(60);
  const [vpThreshold, setVpThreshold] = useState(15);

  const handleStart = () => {
    const players = slots.slice(0, playerCount).map((s, i) => ({
      name: s.isBot ? `Bot ${i + 1}` : (s.name.trim().slice(0, 15) || `Colonist ${i + 1}`),
      isBot: s.isBot,
    }));
    onStart(players, { vpThreshold, timerSeconds });
  };

  const toggleBot = (i: number) => {
    const next = [...slots];
    next[i] = { ...next[i], isBot: !next[i].isBot };
    setSlots(next);
  };

  const setName = (i: number, val: string) => {
    const next = [...slots];
    next[i] = { ...next[i], name: val };
    setSlots(next);
  };

  const humanCount = slots.slice(0, playerCount).filter(s => !s.isBot).length;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Starfield */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(70)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Title */}
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.4em] text-amber-500 uppercase mb-2">A Space Colony Strategy Game</p>
          <h1 className="text-6xl font-black text-white tracking-tighter">
            NEX<span className="text-amber-400">US</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Build your colony. Recruit Leaders. Claim the stars.</p>
        </div>

        {/* Resource pip decoration */}
        <div className="flex justify-center gap-3 mb-6">
          {['from-cyan-400 to-cyan-600','from-orange-400 to-orange-600','from-green-400 to-green-600','from-red-400 to-red-600','from-fuchsia-500 to-fuchsia-700'].map((g,i) => (
            <div key={i} className={`w-5 h-5 rounded-full bg-gradient-to-br ${g} shadow-lg`} />
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl space-y-6">

          {/* ── Player count ── */}
          <div>
            <label className="text-xs font-black text-white uppercase tracking-widest block mb-3">
              Number of Colonists
            </label>
            <div className="flex gap-2">
              {[2,3,4].map(n => (
                <button key={n} onClick={() => setPlayerCount(n)}
                  className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${
                    playerCount === n
                      ? 'bg-amber-500 text-black shadow-[0_0_16px_rgba(251,191,36,0.4)]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* ── Player slots ── */}
          <div>
            <label className="text-xs font-black text-white uppercase tracking-widest block mb-3">
              Colonist Setup
              <span className="text-slate-500 font-normal normal-case ml-2">(max 15 chars)</span>
            </label>
            <div className="space-y-2">
              {Array.from({length: playerCount}, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full shrink-0 bg-gradient-to-br ${PLAYER_COLORS[i]}`} />
                  {slots[i].isBot ? (
                    <div className="flex-1 flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2">
                      <span className="text-sm">🤖</span>
                      <span className="text-sm font-black text-slate-300">Bot {i + 1}</span>
                      <span className="text-[10px] text-slate-500 italic ml-auto">AI controlled</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Colonist ${i + 1}`}
                      value={slots[i].name}
                      onChange={e => setName(i, e.target.value)}
                      maxLength={15}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  )}
                  <button onClick={() => toggleBot(i)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all border ${
                      slots[i].isBot
                        ? 'bg-violet-900/50 border-violet-600/60 text-violet-300 hover:bg-violet-800/50'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}>
                    {slots[i].isBot ? '👤 Human' : '🤖 Bot'}
                  </button>
                </div>
              ))}
            </div>
            {humanCount === 0 && (
              <p className="text-amber-500 text-xs mt-2 font-semibold">
                ⚠ At least one human player required
              </p>
            )}
          </div>

          {/* ── Timer ── */}
          <div>
            <label className="text-xs font-black text-white uppercase tracking-widest block mb-3">
              Turn Timer
            </label>
            <div className="flex gap-2">
              {([null, 60, 90, 120] as (number|null)[]).map(t => (
                <button key={String(t)} onClick={() => setTimerSeconds(t)}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                    timerSeconds === t
                      ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}>
                  {t === null ? 'Off' : `${t}s`}
                </button>
              ))}
            </div>
            <p className="text-slate-500 text-[10px] mt-1.5">
              {timerSeconds === null
                ? 'No turn time limit'
                : `${timerSeconds} seconds per turn — auto-plays when time runs out`}
            </p>
          </div>

          {/* ── VP Threshold ── */}
          <div>
            <label className="text-xs font-black text-white uppercase tracking-widest block mb-3">
              Victory Threshold
              <span className="text-amber-400 font-black ml-2">{vpThreshold} VP</span>
            </label>
            <input
              type="range"
              min={10} max={20} step={1}
              value={vpThreshold}
              onChange={e => setVpThreshold(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 rounded-lg appearance-none bg-slate-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>10 VP (faster)</span>
              <span>15 VP (standard)</span>
              <span>20 VP (epic)</span>
            </div>
          </div>

          {/* ── Quick rules ── */}
          <div className="bg-slate-800/50 rounded-xl p-3 text-[10px] text-slate-400 space-y-1">
            <p className="text-white font-black text-xs mb-1">Quick Rules</p>
            <p>→ Take up to 3 different tokens, or 2 of the same (pool ≥ 4)</p>
            <p>→ Purchase modules using tokens + permanent bonuses</p>
            <p>→ Recruit Faction Leaders by owning 3× cards of 3 resource types</p>
            <p>→ Reach <span className="text-amber-400 font-bold">{vpThreshold} VP</span> to trigger the final round</p>
          </div>

          {/* ── Start buttons ── */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleStart}
              disabled={humanCount === 0}
              className={`w-full py-3 rounded-xl font-black text-base transition-all ${
                humanCount > 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.35)] active:scale-95'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}>
              PLAY LOCAL →
            </button>

            {isFirebaseConfigured && onCreateOnline && (
              <button
                onClick={() => {
                  const players = slots.slice(0, playerCount).map((s, i) => ({
                    name: s.isBot ? `Bot ${i+1}` : (s.name.trim().slice(0,15) || `Colonist ${i+1}`),
                    isBot: s.isBot,
                  }));
                  onCreateOnline(players, { vpThreshold, timerSeconds });
                }}
                disabled={humanCount === 0}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all border-2 ${
                  humanCount > 0
                    ? 'border-blue-500/60 text-blue-300 hover:bg-blue-900/20 active:scale-95'
                    : 'border-slate-700 text-slate-600 cursor-not-allowed'
                }`}>
                🌐 CREATE ONLINE ROOM →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
