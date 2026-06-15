import type { Card, Player } from '../../types';
import { DevelopmentCard } from './DevelopmentCard';
import { canPurchaseCard, canReserveCard } from '../../engine/validators';

const TIER_LABEL: Record<1|2|3, string> = {
  1: 'Outpost Modules',
  2: 'Station Modules',
  3: 'Megastructures',
};

const TIER_DECK_STYLE: Record<1|2|3, string> = {
  1: 'border-slate-600 bg-slate-800/80 text-white',
  2: 'border-blue-700/60 bg-blue-950/70 text-white',
  3: 'border-amber-600/60 bg-indigo-950/80 text-white',
};

const TIER_LABEL_STYLE: Record<1|2|3, string> = {
  1: 'text-slate-300',
  2: 'text-blue-300',
  3: 'text-amber-300',
};

interface CardTierProps {
  tier: 1|2|3;
  active: (Card|null)[];
  deckCount: number;
  activePlayer: Player;
  actionMode: string;
  onPurchaseClick: (card: Card) => void;
  onReserveClick: (card: Card) => void;
}

export function CardTier({
  tier, active, deckCount, activePlayer,
  actionMode, onPurchaseClick, onReserveClick,
}: CardTierProps) {
  const canReserve = canReserveCard(activePlayer);
  const isIdle = actionMode === 'idle';

  return (
    <div className="flex items-center gap-2 px-2 flex-1 min-h-0 border-b border-slate-800/50 last:border-b-0">

      {/* Tier label — vertical writing mode, never overlays cards */}
      <div className="shrink-0 w-5 flex items-center justify-center self-stretch">
        <span
          className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${TIER_LABEL_STYLE[tier]}`}
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {TIER_LABEL[tier]}
        </span>
      </div>

      {/* Deck pile — display only (not clickable; only face-up cards can be reserved) */}
      <div className={`
        w-16 h-28 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 shrink-0
        ${TIER_DECK_STYLE[tier]}
      `}>
        <span className="text-xl font-black leading-none">{deckCount}</span>
        <span className="text-[8px] font-bold uppercase tracking-wider opacity-70">left</span>
      </div>

      {/* 4 face-up card slots */}
      <div className="flex gap-2 items-center">
        {active.map((card, i) =>
          card ? (
            <DevelopmentCard
              key={card.id}
              card={card}
              playerBonuses={activePlayer.bonuses}
              canBuy={canPurchaseCard(card, activePlayer) && isIdle}
              canReserve={canReserve && isIdle}
              onPurchaseClick={isIdle ? () => onPurchaseClick(card) : undefined}
              onReserveClick={canReserve && isIdle ? () => onReserveClick(card) : undefined}
            />
          ) : (
            <div key={i}
              className={`w-24 h-36 rounded-xl border-2 border-dashed opacity-15 shrink-0 ${TIER_DECK_STYLE[tier]}`}
            />
          )
        )}
      </div>
    </div>
  );
}
