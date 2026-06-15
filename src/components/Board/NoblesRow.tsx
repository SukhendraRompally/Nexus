import type { FactionLeader, Player } from '../../types';
import { FactionLeaderCard } from './FactionLeaderCard';

interface NoblesRowProps {
  nobles: FactionLeader[];
  activePlayer: Player;
  onNobleClick: (leader: FactionLeader) => void;
}

export function NoblesRow({ nobles, activePlayer, onNobleClick }: NoblesRowProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-800/60 bg-slate-950/40 shrink-0">
      <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest shrink-0 w-12">
        Leaders
      </span>
      <div className="flex gap-2.5 flex-wrap">
        {nobles.map(n => (
          <FactionLeaderCard
            key={n.id}
            noble={n}
            activePlayer={activePlayer}
            onClick={() => onNobleClick(n)}
          />
        ))}
        {nobles.length === 0 && (
          <span className="text-slate-600 text-xs italic">All faction leaders recruited</span>
        )}
      </div>
    </div>
  );
}
