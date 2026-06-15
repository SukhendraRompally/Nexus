import type { Card, Player, ResourceType } from '../../types';
import { RESOURCE_TYPES } from '../../types';
import { effectiveCost, wildcardBreakdown } from '../../engine/validators';
import { ResourcePip } from '../UI/ResourcePip';
import { Token } from '../UI/Token';

interface PurchaseConfirmModalProps {
  card: Card;
  player: Player;
  onConfirm: () => void;
  onCancel: () => void;
}

const TIER_LABEL: Record<1|2|3, string> = {
  1: 'Outpost Module', 2: 'Station Module', 3: 'Megastructure',
};

export function PurchaseConfirmModal({ card, player, onConfirm, onCancel }: PurchaseConfirmModalProps) {
  const cost = effectiveCost(card, player);
  const breakdown = wildcardBreakdown(cost, player.tokens);
  const totalWild = Object.values(breakdown).reduce((a,b) => a+b, 0);

  // Resources paid from regular tokens
  const regularPay: Partial<Record<ResourceType, number>> = {};
  for (const r of RESOURCE_TYPES) {
    const needed = cost[r] ?? 0;
    if (!needed) continue;
    const fromTokens = Math.min(needed, player.tokens[r]);
    if (fromTokens > 0) regularPay[r] = fromTokens;
  }

  const isFree = Object.keys(cost).length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl p-5 max-w-xs w-full mx-4 shadow-2xl">

        {/* Card header */}
        <div className="flex items-start gap-3 mb-4">
          <ResourcePip resource={card.bonus} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">{card.name}</p>
            <p className="text-[10px] text-slate-500">{TIER_LABEL[card.tier]}</p>
            {card.points > 0 && (
              <p className="text-amber-400 font-black text-sm mt-0.5">{card.points} ★ Victory Points</p>
            )}
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="bg-slate-800/60 rounded-xl p-3 mb-4 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment</p>

          {isFree ? (
            <p className="text-green-400 text-xs font-semibold">Free! (bonuses cover full cost)</p>
          ) : (
            <>
              {/* Regular token payments */}
              {Object.keys(regularPay).length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 shrink-0">Tokens:</span>
                  {(Object.entries(regularPay) as [ResourceType, number][]).map(([r, n]) => (
                    <div key={r} className="flex items-center gap-1">
                      <Token type={r} count={n} size="xs" />
                    </div>
                  ))}
                </div>
              )}

              {/* Wildcard / Dark Matter substitution */}
              {totalWild > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg p-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Token type="darkMatter" size="xs" />
                    <span className="text-[10px] font-bold text-amber-400">Dark Matter substitution</span>
                  </div>
                  <div className="space-y-1">
                    {(Object.entries(breakdown) as [ResourceType, number][]).map(([r, n]) => (
                      <div key={r} className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-amber-500">×{n}</span>
                        <span className="text-slate-500">covers missing</span>
                        <ResourcePip resource={r} size="xs" />
                        <span className="text-slate-400">{n > 1 ? `(${n} ${r})` : r}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-amber-700 mt-1.5">
                    Uses {totalWild} Dark Matter from your {player.tokens.darkMatter} available
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-black transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
