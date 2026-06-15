import type { GameState } from '../types';
import { totalTokens, nextLogId } from '../types';
import type { LogEntry } from '../types';

function addLog(log: LogEntry[], entry: LogEntry): LogEntry[] {
  return [entry, ...log.slice(0, 24)];
}

export function resolveEndOfTurn(state: GameState): GameState {
  let s = { ...state };
  const player = s.players[s.activePlayerIndex];

  // 1. Token overfill check
  if (totalTokens(player.tokens) > 10) {
    return { ...s, pendingSubAction: 'discardTokens', actionMode: 'idle' };
  }

  // 2. Win condition check
  if (player.points >= s.config.vpThreshold && s.phase === 'playing') {
    s = { ...s, phase: 'finalRound', finalRoundStartPlayerIndex: s.activePlayerIndex };
  }

  // 3. Advance turn (faction leader claiming is manual — humans click, bots handle in calculateBotAction)
  return advanceTurn(s);
}

export function awardFactionLeader(state: GameState, leaderId: string): GameState {
  const leader = state.factionLeaders.find(n => n.id === leaderId);
  if (!leader) return state;

  const players = state.players.map((p, i) =>
    i !== state.activePlayerIndex ? p : {
      ...p,
      points: p.points + leader.points,
      claimedFactionLeaders: [...(p.claimedFactionLeaders ?? []), leader],
    }
  );
  const playerName = state.players[state.activePlayerIndex].name;

  return {
    ...state,
    players,
    factionLeaders: state.factionLeaders.filter(n => n.id !== leaderId),
    eligibleFactionLeaders: [],
    pendingSubAction: null,
    log: addLog(state.log, { id: nextLogId(), playerName, action: 'recruit', factionLeaderName: leader.name }),
  };
}

// Alias kept so reducer still compiles during transition
export const awardNoble = awardFactionLeader;

export function advanceTurn(state: GameState): GameState {
  const nextIndex = (state.activePlayerIndex + 1) % state.players.length;

  if (state.phase === 'finalRound' && nextIndex === state.finalRoundStartPlayerIndex) {
    return endGame(state);
  }

  return {
    ...state,
    activePlayerIndex: nextIndex,
    actionMode: 'idle',
    pendingSubAction: null,
    pendingSelectedTokens: {},
    eligibleFactionLeaders: [],
    recentlyTakenTokens: null,
    log: addLog(state.log, {
      id: nextLogId(), playerName: state.players[nextIndex].name,
      action: 'system', message: 'turn',
    }),
  };
}

function endGame(state: GameState): GameState {
  const winner = [...state.players].sort((a, b) =>
    b.points !== a.points ? b.points - a.points : a.purchasedCards.length - b.purchasedCards.length
  )[0];
  return {
    ...state, phase: 'ended', winnerId: winner.id,
    log: addLog(state.log, { id: nextLogId(), playerName: winner.name, action: 'system', message: `won with ${winner.points} VP` }),
  };
}
