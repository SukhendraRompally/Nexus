import type { Card, ResourceType } from '../../types';
import { RESOURCE_TYPES } from '../../types';
import { CostPill, ResourcePip } from '../UI/ResourcePip';

// ── Per-resource header gradients (fuel=orange, data=fuchsia) ──────────────
const HEADER_GRADIENT: Record<ResourceType, string> = {
  crystal: 'from-cyan-500 to-cyan-800',
  fuel:    'from-orange-400 to-orange-700',
  mineral: 'from-green-500 to-green-800',
  alloy:   'from-red-500 to-red-800',
  data:    'from-fuchsia-500 to-fuchsia-800',
};

const TIER_BG: Record<1|2|3, string> = {
  1: 'from-slate-800 to-slate-950',
  2: 'from-slate-800 to-blue-950',
  3: 'from-indigo-900 to-purple-950',
};

const TIER_BORDER: Record<1|2|3, string> = {
  1: 'border border-slate-600/40',
  2: 'border border-blue-600/30 ring-1 ring-blue-500/15',
  3: 'border-2 border-amber-500/50',
};

// ── Art scenes (consistent: every resource has its own animation) ────────────

function CrystalArt() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 to-transparent" />
      {[0,1,2].map(i => (
        <svg key={i} viewBox="0 0 40 46" className={`absolute ${['w-14 h-14','w-10 h-10','w-6 h-6'][i]} animate-crystal-pulse`}
          style={{ animationDelay: `${i*0.6}s`, transform: `rotate(${i*20}deg)` }}>
          <polygon points="20,2 38,12 38,34 20,44 2,34 2,12"
            fill="none" stroke="rgba(34,211,238,0.7)" strokeWidth="1.5" />
        </svg>
      ))}
      <div className="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,1)] animate-crystal-pulse" />
    </div>
  );
}

function FuelArt() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 to-transparent" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="absolute w-full h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-25"
          style={{ top: `${25+i*15}%` }} />
      ))}
      <div className="relative">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 shadow-[0_0_14px_rgba(251,146,60,1)] animate-fuel-pulse" />
      </div>
    </div>
  );
}

function MineralArt() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent" />
      <svg viewBox="0 0 60 50" className="w-full h-full absolute opacity-75 animate-mineral-glow">
        <polygon points="30,5 56,45 4,45" fill="rgba(34,197,94,0.12)" stroke="rgba(74,222,128,0.9)" strokeWidth="1.5" />
        <polygon points="30,18 46,45 14,45" fill="rgba(34,197,94,0.1)" stroke="rgba(74,222,128,0.6)" strokeWidth="1" />
        <line x1="30" y1="5" x2="30" y2="45" stroke="rgba(74,222,128,0.4)" strokeWidth="0.8" />
      </svg>
      <div className="absolute bottom-4 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]" />
    </div>
  );
}

function AlloyArt() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 to-transparent" />
      <div className="animate-alloy-spin">
        <svg viewBox="0 0 50 50" className="w-10 h-10">
          <circle cx="25" cy="25" r="22" fill="none" stroke="rgba(248,113,113,0.3)" strokeWidth="1" />
          <circle cx="25" cy="25" r="10" fill="rgba(239,68,68,0.25)" stroke="rgba(248,113,113,0.8)" strokeWidth="1.5" />
          <circle cx="25" cy="25" r="4" fill="rgba(252,165,165,0.9)" />
          {[0,45,90,135,180,225,270,315].map(angle => {
            const a = (angle*Math.PI)/180;
            return <line key={angle}
              x1={25+11*Math.cos(a)} y1={25+11*Math.sin(a)}
              x2={25+21*Math.cos(a)} y2={25+21*Math.sin(a)}
              stroke="rgba(248,113,113,0.8)" strokeWidth="2.5" strokeLinecap="round" />;
          })}
        </svg>
      </div>
    </div>
  );
}

function DataArt({ cardId }: { cardId: string }) {
  const seed = cardId.split('').reduce((acc,c) => acc+c.charCodeAt(0),0);
  const dots = Array.from({length:24},(_,i) => ((seed*(i+7)*13)%17) < 6);
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/20 to-transparent" />
      <div className="grid grid-cols-6 gap-0.5 p-1">
        {dots.map((lit,i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${lit ? 'bg-fuchsia-400 animate-data-blink' : 'bg-fuchsia-950'}`}
            style={lit ? { animationDelay: `${(i*0.07)%1.8}s` } : {}} />
        ))}
      </div>
      <div className="absolute bottom-1.5 left-2 right-2 h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-60" />
    </div>
  );
}

const ART: Record<ResourceType, (id:string)=>React.ReactNode> = {
  crystal: ()  => <CrystalArt />,
  fuel:    ()  => <FuelArt />,
  mineral: ()  => <MineralArt />,
  alloy:   ()  => <AlloyArt />,
  data:    (id)=> <DataArt cardId={id} />,
};

// ── Main card component ───────────────────────────────────────────────────────

interface DevelopmentCardProps {
  card: Card;
  playerBonuses?: Partial<Record<ResourceType, number>>;
  canBuy?: boolean;
  canReserve?: boolean;
  onPurchaseClick?: () => void;
  onReserveClick?: () => void;
  highlight?: boolean;
  compact?: boolean;
}

export function DevelopmentCard({
  card, playerBonuses={}, canBuy=false, canReserve=false,
  onPurchaseClick, onReserveClick, highlight=false, compact=false,
}: DevelopmentCardProps) {
  const w = compact ? 'w-20' : 'w-24';
  const h = compact ? 'h-28' : 'h-36';

  return (
    <div className={`
      relative ${w} ${h} rounded-xl overflow-hidden flex flex-col shrink-0
      bg-gradient-to-b ${TIER_BG[card.tier]}
      ${TIER_BORDER[card.tier]}
      ${card.tier===3 ? 'tier3-glow' : `card-glow-${card.bonus}`}
      ${highlight ? 'ring-2 ring-white scale-105' : ''}
      transition-all duration-150 group cursor-default
    `}>
      {/* ── Header strip ── */}
      <div className={`bg-gradient-to-r ${HEADER_GRADIENT[card.bonus]} px-1.5 py-1 flex items-center justify-between shrink-0`}>
        <ResourcePip resource={card.bonus} size="xs" />
        {/* VP — prominent gold badge */}
        {card.points > 0 ? (
          <span className="flex items-center gap-0.5 bg-amber-400/20 border border-amber-400/60 rounded px-1 py-0 leading-none">
            <span className="text-amber-300 font-black text-sm leading-none">{card.points}</span>
            <span className="text-amber-500 text-[8px] leading-none">★</span>
          </span>
        ) : (
          <span className="text-white/30 text-[9px]">0</span>
        )}
      </div>

      {/* ── Art area ── */}
      <div className="flex-1 relative min-h-0">
        {ART[card.bonus](card.id)}
      </div>

      {/* ── Card name ── */}
      <div className="px-1 pb-0.5 shrink-0">
        <p className="text-[8px] font-bold text-white leading-tight" style={{wordBreak:'break-word', hyphens:'auto'}}>
          {card.name}
        </p>
      </div>

      {/* ── Cost row ── */}
      <div className="px-1 pb-1 flex flex-wrap gap-0.5 shrink-0">
        {RESOURCE_TYPES.map(r => {
          const raw = card.cost[r] ?? 0;
          if (!raw) return null;
          const bonus = playerBonuses[r] ?? 0;
          return <CostPill key={r} resource={r} count={raw} covered={bonus>=raw} />;
        })}
      </div>

      {/* ── Hover overlay with action buttons ── */}
      {(onPurchaseClick || onReserveClick) && (
        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 rounded-xl">
          {onPurchaseClick && (
            <button onClick={onPurchaseClick} disabled={!canBuy}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-colors ${canBuy ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
              Purchase
            </button>
          )}
          {onReserveClick && (
            <button onClick={onReserveClick} disabled={!canReserve}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${canReserve ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
              Reserve
            </button>
          )}
        </div>
      )}
    </div>
  );
}
