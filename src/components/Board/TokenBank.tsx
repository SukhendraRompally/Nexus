import type { GameState, ResourceType } from '../../types';
import { RESOURCE_TYPES, totalSelectedTokens } from '../../types';
import { Token } from '../UI/Token';
import { canToggleResource } from '../../engine/validators';

interface TokenBankProps {
  state: GameState;
  onTokenClick: (resource: ResourceType) => void;
  onConfirmTokens: () => void;
  onCancel: () => void;
  onStartTaking: () => void;
}

export function TokenBank({ state, onTokenClick, onConfirmTokens, onCancel, onStartTaking }: TokenBankProps) {
  const { bank, actionMode, pendingSelectedTokens: sel } = state;
  const isTaking = actionMode === 'takingTokens';
  const totalSel = totalSelectedTokens(sel);
  const selColors = Object.entries(sel).filter(([, v]) => (v ?? 0) > 0);
  const isValid =
    (selColors.length === 3 && totalSel === 3) ||
    (selColors.length === 1 && totalSel === 2);

  const selMode =
    selColors.length === 1 && totalSel === 2 ? 'take2' :
    totalSel > 0 ? 'take3' : null;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Mode hint */}
      {isTaking && (
        <div className={`text-center text-xs font-bold py-1 rounded-lg ${
          isValid
            ? 'bg-green-900/50 border border-green-700/50 text-green-300'
            : selMode === 'take2'
            ? 'bg-blue-900/40 border border-blue-700/40 text-blue-300'
            : 'bg-slate-800 border border-slate-700 text-slate-300'
        }`}>
          {isValid
            ? '✓ Ready — click Confirm'
            : selMode === 'take2'
            ? `Taking 2× same — confirm or click again to deselect`
            : totalSel > 0
            ? `${totalSel}/3 tokens — pick ${3 - totalSel} more`
            : 'Click a token to start (3 different or 2 same)'}
        </div>
      )}

      {/* Standard 5 resource tokens in 2+3 grid */}
      <div className="grid grid-cols-3 gap-y-3 gap-x-2 place-items-center">
        {RESOURCE_TYPES.map(r => {
          const count = bank[r];
          const selected = sel[r] ?? 0;
          const canAdd = isTaking && canToggleResource(bank, sel, r);
          const disabled = isTaking && !canAdd && selected === 0;
          return (
            <Token
              key={r}
              type={r}
              count={count}
              size="sm"
              showLabel
              selected={selected > 0}
              selectedCount={selected > 0 ? selected : undefined}
              disabled={disabled}
              onClick={isTaking ? () => onTokenClick(r) : undefined}
            />
          );
        })}
      </div>

      {/* Dark Matter — full row, centered */}
      <div className="flex justify-center pt-1 border-t border-slate-700/50">
        <Token type="darkMatter" count={bank.darkMatter} size="sm" showLabel />
        <span className="self-center ml-2 text-[9px] text-slate-400 font-bold">wild tokens</span>
      </div>

      {/* Action buttons */}
      {!isTaking ? (
        <button
          onClick={onStartTaking}
          className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-black tracking-wide transition-colors"
        >
          Take Tokens
        </button>
      ) : (
        <div className="flex gap-1.5">
          <button onClick={onCancel}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors">
            Cancel
          </button>
          <button onClick={onConfirmTokens} disabled={!isValid}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-colors ${
              isValid
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}>
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}
