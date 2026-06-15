import type { LogEntry, TokenType, ResourceType } from '../../types';
import { ResourcePip } from './ResourcePip';

function TokenPips({ tokens }: { tokens: Partial<Record<TokenType, number>> }) {
  return (
    <>
      {(Object.entries(tokens) as [TokenType, number][]).flatMap(([r, count]) =>
        Array.from({ length: count }, (_, i) => (
          <ResourcePip key={`${r}-${i}`} resource={r} size="xs" />
        ))
      )}
    </>
  );
}

function dim(txt: string) {
  return <span className="text-slate-400 text-[10px] shrink-0">{txt}</span>;
}

function EntryRow({ entry, fresh }: { entry: LogEntry; fresh: boolean }) {
  // Cap displayed name at 15 chars to match input limit
  const displayName = entry.playerName.slice(0, 15);
  const nameEl = (
    <span className={`font-black text-[11px] ${fresh ? 'text-white' : 'text-slate-200'}`}>
      {displayName}
    </span>
  );

  if (entry.action === 'take') {
    return (
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {nameEl}{dim('took')}
        <TokenPips tokens={entry.tokens ?? {}} />
      </div>
    );
  }

  if (entry.action === 'purchase') {
    return (
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {nameEl}{dim('bought')}
        <ResourcePip resource={entry.cardBonus as ResourceType} size="xs" />
        {(entry.cardPoints ?? 0) > 0 && (
          <span className="text-amber-400 font-black text-[10px]">+{entry.cardPoints}VP</span>
        )}
      </div>
    );
  }

  if (entry.action === 'reserve') {
    return (
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {nameEl}{dim('reserved')}
        <ResourcePip resource={entry.cardBonus as ResourceType} size="xs" />
        {(entry.cardPoints ?? 0) > 0 && (
          <span className="text-amber-300 font-bold text-[10px]">{entry.cardPoints}VP</span>
        )}
        {dim('· took')}
        <ResourcePip resource="darkMatter" size="xs" />
      </div>
    );
  }

  if (entry.action === 'recruit') {
    return (
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {nameEl}
        <span className="text-amber-400 font-black text-[10px]">recruited</span>
        <span className="text-amber-200 font-bold text-[10px]">{entry.factionLeaderName ?? entry.nobleName}</span>
        <span className="text-amber-400 font-black text-[10px]">+3VP</span>
      </div>
    );
  }

  if (entry.action === 'system') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-amber-500/60 shrink-0" />
        <span className="text-slate-400 text-[10px]">
          {entry.message === 'turn' ? `${entry.playerName}'s turn` : entry.message}
        </span>
      </div>
    );
  }

  return null;
}

interface LogPanelProps {
  entries: LogEntry[];
}

export function LogPanel({ entries }: LogPanelProps) {
  const display = entries
    .filter(e => !(e.action === 'system' && e.message === 'turn'))
    .slice(0, 20);

  return (
    <div className="flex flex-col h-full min-h-0">
      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2 shrink-0">
        Game Log
      </p>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 min-h-0">
        {display.map((e, i) => (
          <div
            key={e.id}
            className={`py-1.5 px-2 rounded-lg ${
              i === 0
                ? 'bg-slate-700/70 border border-slate-600/60'
                : i < 4
                ? 'bg-slate-800/50'
                : 'opacity-60'
            }`}
          >
            <EntryRow entry={e} fresh={i < 4} />
          </div>
        ))}
        {display.length === 0 && (
          <p className="text-slate-500 text-[10px] italic px-2">Colony founded…</p>
        )}
      </div>
    </div>
  );
}
