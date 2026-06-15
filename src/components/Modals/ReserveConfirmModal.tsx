import type { Card } from '../../types';
import { ResourcePip } from '../UI/ResourcePip';
import { Token } from '../UI/Token';

interface ReserveConfirmModalProps {
  card: Card | { tier: 1|2|3; name: string; isDeckCard: true };
  bankDarkMatter: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const TIER_LABEL: Record<1|2|3, string> = {
  1: 'Outpost Module', 2: 'Station Module', 3: 'Megastructure',
};

export function ReserveConfirmModal({ card, bankDarkMatter, onConfirm, onCancel }: ReserveConfirmModalProps) {
  const isDeck = 'isDeckCard' in card;
  const getsWild = bankDarkMatter > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-600 rounded-2xl p-5 max-w-xs w-full mx-4 shadow-2xl">

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {!isDeck && <ResourcePip resource={(card as import('../../types').Card).bonus} size="md" />}
          {isDeck && <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] text-slate-400">?</div>}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">{card.name}</p>
            <p className="text-[10px] text-slate-500">{TIER_LABEL[card.tier]} · Tier {card.tier}</p>
            {isDeck && <p className="text-[10px] text-slate-600 italic">Card drawn face-down from deck</p>}
          </div>
        </div>

        {/* Wildcard info */}
        <div className="bg-slate-800/60 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2">
            <Token type="darkMatter" size="xs" />
            <div>
              {getsWild ? (
                <p className="text-amber-400 text-xs font-semibold">Receive 1 Dark Matter token</p>
              ) : (
                <p className="text-slate-500 text-xs">No Dark Matter available (bank empty)</p>
              )}
              <p className="text-slate-600 text-[10px]">Card goes to your reserved hand (max 3)</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white text-sm font-bold transition-colors">
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}
