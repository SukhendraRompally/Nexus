import type { Player, Card } from '../../types';
import { RESOURCE_TYPES, TOKEN_TYPES, totalTokens } from '../../types';
import { Token } from '../UI/Token';
import { ResourcePip } from '../UI/ResourcePip';
import { DevelopmentCard } from '../Board/DevelopmentCard';
import { canPurchaseCard } from '../../engine/validators';

// ── Effective Tokens = module bonus + current tokens ─────────────────────────
// Shows how much purchasing power the player has per resource at a glance.

function EffectiveTokensGrid({ player, compact }: { player: Player; compact?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1.5">
        Effective Tokens
      </p>
      <div className="grid grid-cols-5 gap-1">
        {RESOURCE_TYPES.map(r => {
          const bonus = player.bonuses[r];
          const tokens = player.tokens[r];
          const effective = bonus + tokens;
          const hasBoth = bonus > 0 && tokens > 0;
          return (
            <div key={r} className={`flex flex-col items-center gap-0.5 bg-slate-800/70 rounded-lg ${compact ? 'p-1' : 'py-1.5 px-1'}`}>
              <ResourcePip resource={r} size="xs" />
              <span className={`font-black text-white leading-none ${compact ? 'text-xs' : 'text-sm'}`}>
                {effective}
              </span>
              {!compact && hasBoth && (
                <span className="text-slate-500 text-[8px] leading-none">{bonus}+{tokens}</span>
              )}
              {!compact && !hasBoth && effective > 0 && (
                <span className="text-slate-600 text-[8px] leading-none">
                  {bonus > 0 ? `b${bonus}` : `t${tokens}`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CurrentTokensRow({ player, compact }: { player: Player; compact?: boolean }) {
  const total = totalTokens(player.tokens);
  return (
    <div>
      <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">
        Tokens <span className="text-slate-400 font-bold normal-case">{total}/10</span>
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {TOKEN_TYPES.map(t => {
          const n = player.tokens[t];
          return n > 0 ? (
            <Token key={t} type={t} count={n} size={compact ? 'xs' : 'xs'} showLabel />
          ) : null;
        })}
        {total === 0 && <span className="text-slate-500 text-xs">no tokens</span>}
      </div>
    </div>
  );
}

function PurchasedRow({ player, compact }: { player: Player; compact?: boolean }) {
  const total = player.purchasedCards.length;
  if (total === 0) return (
    <p className="text-[9px] text-slate-500">
      <span className="font-black text-white uppercase tracking-widest">Purchased</span> — none yet
    </p>
  );
  return (
    <div>
      <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">
        Purchased <span className="text-slate-400 font-bold normal-case">({total})</span>
      </p>
      <div className="flex gap-1 flex-wrap">
        {RESOURCE_TYPES.map(r => {
          const n = player.purchasedCards.filter(c => c.bonus === r).length;
          return n > 0 ? (
            <div key={r} className={`flex items-center gap-0.5 bg-slate-800 rounded-full ${compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'}`}>
              <ResourcePip resource={r} size="xs" />
              <span className="text-white font-black text-xs">×{n}</span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

// ── Active Player Card (full detail) ─────────────────────────────────────────

interface ActivePlayerCardProps {
  player: Player;
  isIdle: boolean;
  isFinalRound: boolean;
  onPurchaseReservedClick: (card: Card) => void;
}

export function ActivePlayerCard({
  player, isIdle, isFinalRound, onPurchaseReservedClick,
}: ActivePlayerCardProps) {
  const tokenTotal = totalTokens(player.tokens);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] shrink-0" />
          <span className="font-black text-white text-sm truncate">{player.name}</span>
          {isFinalRound && (
            <span className="text-[8px] bg-red-900/70 border border-red-600/60 text-red-300 px-1.5 py-0.5 rounded-full font-black shrink-0">
              FINAL
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-amber-300 font-black text-2xl leading-none">{player.points}</span>
          <span className="text-amber-500 font-black text-sm">VP</span>
          <span className="text-slate-500 text-xs ml-1">{tokenTotal}/10</span>
        </div>
      </div>

      {/* ── Effective Tokens ── */}
      <EffectiveTokensGrid player={player} />

      {/* ── Current Tokens ── */}
      <CurrentTokensRow player={player} />

      {/* ── Purchased Modules ── */}
      <PurchasedRow player={player} />

      {/* ── Claimed Faction Leaders ── */}
      {player.claimedFactionLeaders.length > 0 && (
        <div>
          <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1.5">
            Faction Leaders ({player.claimedFactionLeaders.length})
          </p>
          <div className="flex gap-2 flex-wrap">
            {player.claimedFactionLeaders.map(n => (
              <div key={n.id} className="bg-amber-950/50 border border-amber-700/50 rounded-lg px-2.5 py-1.5">
                <p className="text-amber-200 font-black text-[10px]">{n.name}</p>
                <p className="text-amber-500 font-bold text-[9px]">+3 VP</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Reserved Cards (active player only) ── */}
      <div>
        <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1.5">
          Reserved <span className="text-slate-400 font-bold normal-case">({player.reservedCards.length}/3)</span>
        </p>
        <div className="flex gap-2">
          {player.reservedCards.map(card => (
            <DevelopmentCard
              key={card.id}
              card={card}
              compact
              playerBonuses={player.bonuses}
              canBuy={canPurchaseCard(card, player) && isIdle}
              onPurchaseClick={isIdle ? () => onPurchaseReservedClick(card) : undefined}
            />
          ))}
          {Array.from({ length: 3 - player.reservedCards.length }, (_, i) => (
            <div key={i} className="w-20 h-28 rounded-xl border border-dashed border-slate-700/50 flex items-center justify-center shrink-0">
              <span className="text-slate-700 text-2xl font-light">+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Opponent Card (same data, compact layout) ─────────────────────────────────

interface OpponentCardProps {
  player: Player;
  isCurrentTurn: boolean;
}

export function OpponentCard({ player, isCurrentTurn }: OpponentCardProps) {
  const tokenTotal = totalTokens(player.tokens);

  return (
    <div className={`rounded-xl border p-2.5 flex flex-col gap-2 transition-colors ${
      isCurrentTurn
        ? 'border-amber-500/60 bg-amber-950/20'
        : 'border-slate-700/50 bg-slate-900/30'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          {isCurrentTurn && (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          )}
          <span className="font-black text-white text-xs truncate">{player.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-amber-300 font-black text-base leading-none">{player.points}</span>
          <span className="text-amber-500 font-black text-[10px]">VP</span>
          <span className="text-slate-500 text-[9px] ml-1">{tokenTotal}/10</span>
        </div>
      </div>

      {/* Effective tokens — compact grid */}
      <EffectiveTokensGrid player={player} compact />

      {/* Current tokens */}
      <div className="flex gap-1 flex-wrap">
        {TOKEN_TYPES.map(t => {
          const n = player.tokens[t];
          return n > 0 ? (
            <div key={t} className="flex items-center gap-0.5">
              <ResourcePip resource={t} size="xs" count={n} />
            </div>
          ) : null;
        })}
        {tokenTotal === 0 && <span className="text-slate-600 text-[9px]">no tokens</span>}
      </div>

      {/* Purchased */}
      <PurchasedRow player={player} compact />

      {/* Claimed Faction Leaders */}
      {player.claimedFactionLeaders.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {player.claimedFactionLeaders.map(n => (
            <div key={n.id} className="bg-amber-950/50 border border-amber-700/40 rounded-lg px-2 py-0.5">
              <p className="text-amber-300 font-black text-[9px]">{n.name} +3VP</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
