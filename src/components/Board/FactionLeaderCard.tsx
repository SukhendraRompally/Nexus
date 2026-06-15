import type { Noble, ResourceType, Player } from '../../types';
import { RESOURCE_TYPES } from '../../types';
import { playerQualifiesForNoble } from '../../engine/validators';

const RING_COLORS: Record<ResourceType, string> = {
  crystal: '#22d3ee', fuel: '#fb923c', mineral: '#4ade80',
  alloy: '#f87171', data: '#e879f9',
};

const PIP_BG: Record<ResourceType, string> = {
  crystal: 'bg-cyan-400', fuel: 'bg-orange-400', mineral: 'bg-green-500',
  alloy: 'bg-red-500', data: 'bg-fuchsia-500',
};

interface FactionLeaderCardProps {
  noble: Noble;
  activePlayer?: Player;   // pass active player to show claim status
  onClick?: () => void;
  highlight?: boolean;
}

export function FactionLeaderCard({ noble, activePlayer, onClick, highlight }: FactionLeaderCardProps) {
  const resources = RESOURCE_TYPES.filter(r => (noble.requirement[r] ?? 0) > 0);
  const qualifies = activePlayer ? playerQualifiesForNoble(activePlayer, noble) : false;

  const borderClass = highlight
    ? 'ring-4 ring-amber-300 scale-105'
    : qualifies
    ? 'ring-2 ring-green-400 shadow-[0_0_12px_rgba(74,222,128,0.5)]'
    : 'ring-2 ring-amber-600/60';

  return (
    <div
      onClick={onClick}
      className={`
        relative w-28 h-32 rounded-xl overflow-hidden flex flex-col shrink-0
        bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950
        leader-glow
        ${borderClass}
        ${onClick ? 'cursor-pointer hover:scale-105 transition-all duration-150' : ''}
      `}
    >
      {/* VP badge + claim indicator */}
      <div className="flex items-center justify-between px-2 pt-1.5">
        <span className="text-[9px] font-black text-amber-400 leading-none">3★</span>
        {qualifies && (
          <span className="text-[8px] font-black text-green-400 bg-green-900/50 border border-green-700/50 px-1 rounded leading-none py-0.5">
            CLAIM
          </span>
        )}
      </div>

      {/* Name */}
      <div className="px-2 pt-0.5">
        <p className="text-[9px] font-black text-white leading-tight" style={{wordBreak:'break-word'}}>
          {noble.name}
        </p>
      </div>

      {/* Concentric ring art */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-14 h-14">
          {resources.map((r, i) => (
            <svg key={r} viewBox="0 0 40 40" className="absolute inset-0 w-full h-full"
              style={{ padding: `${i*3}px` }}>
              <circle cx="20" cy="20" r={17-i*4} fill="none"
                stroke={RING_COLORS[r]} strokeWidth={2.5 - i*0.3}
                opacity={0.9}
                strokeDasharray={i===0 ? undefined : `${4+i} ${2+i}`} />
            </svg>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
          </div>
        </div>
      </div>

      {/* Requirement pips */}
      <div className="px-2 pb-2 flex gap-2 justify-center">
        {resources.map(r => {
          const needed = noble.requirement[r] ?? 0;
          const have = activePlayer?.bonuses[r] ?? 0;
          return (
            <div key={r} className="flex gap-0.5">
              {Array.from({length: needed}, (_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${
                  i < have ? 'bg-green-400' : PIP_BG[r]
                } ${i < have ? 'opacity-100' : 'opacity-60'}`} />
              ))}
            </div>
          );
        })}
      </div>

      {/* Hover overlay hint */}
      {onClick && (
        <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-colors rounded-xl flex items-center justify-center">
          <span className="opacity-0 hover:opacity-100 text-[9px] text-white font-black bg-black/60 px-2 py-1 rounded-lg transition-opacity">
            {qualifies ? 'Click to claim!' : 'Click to inspect'}
          </span>
        </div>
      )}
    </div>
  );
}
