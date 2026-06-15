import type { FactionLeader, Player, ResourceType } from '../../types';
import { RESOURCE_TYPES } from '../../types';
import { ResourcePip } from '../UI/ResourcePip';
import { playerQualifiesForNoble } from '../../engine/validators';

const RING_COLORS: Record<ResourceType, string> = {
  crystal: '#22d3ee', fuel: '#fb923c', mineral: '#4ade80',
  alloy: '#f87171', data: '#e879f9',
};

interface NobleClaimModalProps {
  noble: FactionLeader;
  player: Player;
  isActivePlayer: boolean;
  onClaim: (nobleId: string) => void;
  onClose: () => void;
}

export function NobleClaimModal({ noble, player, isActivePlayer, onClaim, onClose }: NobleClaimModalProps) {
  const qualifies = playerQualifiesForNoble(player, noble);
  const resources = RESOURCE_TYPES.filter(r => (noble.requirement[r] ?? 0) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-slate-900 border border-amber-600/50 rounded-2xl p-5 max-w-sm w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {/* Mini noble art */}
          <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-amber-950 to-slate-900 border-2 border-amber-600/60 flex items-center justify-center shrink-0">
            {resources.map((r, i) => (
              <svg key={r} viewBox="0 0 40 40" className="absolute inset-0 w-full h-full"
                style={{ padding: `${i*3}px` }}>
                <circle cx="20" cy="20" r={17 - i*4} fill="none"
                  stroke={RING_COLORS[r]} strokeWidth={2.5 - i*0.3}
                  opacity={0.9} strokeDasharray={i===0 ? undefined : `${4+i} ${2+i}`} />
              </svg>
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
            </div>
          </div>
          <div>
            <p className="text-white font-black text-base leading-tight">{noble.name}</p>
            <p className="text-amber-400 font-black text-sm mt-0.5">+3 Victory Points</p>
            <p className="text-slate-400 text-[10px] mt-0.5">Faction Leader</p>
          </div>
        </div>

        {/* Requirements table */}
        <div className="bg-slate-800/60 rounded-xl p-3 mb-4">
          <p className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Requirements</p>
          <div className="space-y-2">
            {resources.map(r => {
              const needed = noble.requirement[r] ?? 0;
              const have = player.bonuses[r];
              const met = have >= needed;
              const missing = Math.max(0, needed - have);
              return (
                <div key={r} className="flex items-center gap-2">
                  <ResourcePip resource={r} size="sm" />
                  <span className="text-white font-bold text-xs capitalize flex-1">{r}</span>
                  {/* Progress pips */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: needed }, (_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        i < have
                          ? 'bg-green-500 border-green-400'
                          : 'bg-slate-700 border-slate-600'
                      }`}>
                        {i < have && <span className="text-white text-[8px] font-black">✓</span>}
                      </div>
                    ))}
                  </div>
                  {met ? (
                    <span className="text-green-400 font-black text-xs w-16 text-right">✓ met</span>
                  ) : (
                    <span className="text-red-400 font-bold text-xs w-16 text-right">
                      need {missing} more
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Result / action */}
        {qualifies && isActivePlayer ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/40 rounded-xl px-3 py-2">
              <span className="text-green-400 text-lg">★</span>
              <p className="text-green-300 font-bold text-sm">You qualify! Claim this leader.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors">
                Later
              </button>
              <button onClick={() => { onClaim(noble.id); onClose(); }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-black transition-colors shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                Claim +3VP
              </button>
            </div>
          </div>
        ) : qualifies && !isActivePlayer ? (
          <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl px-3 py-2.5">
            <p className="text-amber-300 font-bold text-sm">
              {player.name} qualifies — but it's not their turn yet.
            </p>
            <button onClick={onClose}
              className="mt-2 w-full py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold transition-colors">
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2">
              <p className="text-red-300 font-bold text-xs">
                Not enough modules yet — see what's missing above.
              </p>
            </div>
            <button onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
