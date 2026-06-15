import type { Player, TokenType } from '../../types';
import { TOKEN_TYPES, totalTokens } from '../../types';
import { Token } from '../UI/Token';

interface DiscardTokenModalProps {
  player: Player;
  recentlyTakenTokens: Partial<Record<TokenType, number>> | null;
  onDiscard: (token: TokenType) => void;
  onCancelTurn: () => void;
}

export function DiscardTokenModal({ player, recentlyTakenTokens, onDiscard, onCancelTurn }: DiscardTokenModalProps) {
  const current = totalTokens(player.tokens);
  const excess = current - 10;
  const canCancel = !!recentlyTakenTokens;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-red-700/50 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-red-400 font-black text-xl mb-1">Token Limit Exceeded</div>
          <p className="text-slate-200 text-sm">
            You hold <span className="text-white font-black">{current}</span> tokens — max is{' '}
            <span className="text-white font-black">10</span>.{' '}
            Discard <span className="text-red-400 font-black">{excess}</span> token{excess !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* Token grid to discard from */}
        <div className="flex flex-wrap gap-3 justify-center mb-5">
          {TOKEN_TYPES.map(t => {
            const count = player.tokens[t];
            if (!count) return null;
            return (
              <div key={t} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => onDiscard(t)}
                  className="relative group"
                  title={`Discard 1 ${t}`}
                >
                  <Token type={t} count={count} size="md" showLabel />
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-red-500/0 group-hover:bg-red-500/30 transition-colors text-white font-black text-lg opacity-0 group-hover:opacity-100">
                    −
                  </span>
                </button>
                <span className="text-[9px] text-red-400 font-semibold">click to discard</span>
              </div>
            );
          })}
        </div>

        {/* Status */}
        <p className="text-center text-slate-400 text-sm mb-4">
          {excess > 0
            ? <span><span className="text-red-400 font-bold">{excess}</span> more to discard</span>
            : <span className="text-green-400">✓ Ready to continue</span>
          }
        </p>

        {/* Cancel option */}
        {canCancel && (
          <div className="border-t border-slate-700 pt-4">
            <p className="text-slate-500 text-xs text-center mb-3">
              Changed your mind? You can undo the token take and choose a different action instead.
            </p>
            <button
              onClick={onCancelTurn}
              className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-bold transition-colors"
            >
              ← Cancel Token Take & Choose Different Action
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
