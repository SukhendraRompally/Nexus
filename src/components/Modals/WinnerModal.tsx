import type { Player } from '../../types';
import { RESOURCE_TYPES } from '../../types';
import { ResourcePip } from '../UI/ResourcePip';

interface WinnerModalProps {
  players: Player[];
  winnerId: string;
  onRestart: () => void;
}

export function WinnerModal({ players, winnerId, onRestart }: WinnerModalProps) {
  const winner = players.find(p => p.id === winnerId)!;
  const sorted = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.purchasedCards.length - b.purchasedCards.length;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-500/60 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl">
        {/* Winner banner */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">★</div>
          <div className="text-amber-400 font-black text-2xl mb-1">Colony Established!</div>
          <div className="text-white text-xl font-black">{winner.name}</div>
          <div className="text-amber-300 text-sm mt-1">
            {winner.points} Victory Points · {winner.purchasedCards.length} Modules Built
          </div>
        </div>

        {/* Scoreboard */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-black text-white uppercase tracking-widest text-center mb-3">Final Standings</div>
          {sorted.map((p, rank) => (
            <div key={p.id} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
              p.id === winnerId ? 'bg-amber-950/40 border border-amber-700/40' : 'bg-slate-800/40'
            }`}>
              <span className={`font-black text-sm w-6 ${rank === 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {rank + 1}.
              </span>
              <span className="flex-1 text-sm font-black text-white">{p.name}</span>
              <div className="flex gap-1 items-center">
                {RESOURCE_TYPES.map(r => p.bonuses[r] > 0 && (
                  <ResourcePip key={r} resource={r} count={p.bonuses[r]} size="xs" />
                ))}
              </div>
              <span className="text-amber-300 font-black text-sm w-14 text-right">
                {p.points} VP
              </span>
              <span className="text-slate-300 text-xs w-16 text-right font-semibold">
                {p.purchasedCards.length} cards
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl transition-colors text-sm"
        >
          New Colony →
        </button>
      </div>
    </div>
  );
}
