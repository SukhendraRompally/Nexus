import type { GameState, Player, Tier, Tokens, Card, FactionLeader, GameConfig } from '../types';
import { emptyBonuses, emptyTokens } from '../types';
import { TIER1_CARDS, TIER2_CARDS, TIER3_CARDS } from '../data/cards';
import { ALL_NOBLES } from '../data/nobles';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeTier(cards: Card[]): Tier {
  const deck = shuffle(cards);
  const active: (Card | null)[] = deck.splice(0, 4);
  return { active, deck };
}

function bankForCount(count: number): Tokens {
  const perColor = count === 2 ? 4 : count === 3 ? 5 : 7;
  return { crystal: perColor, fuel: perColor, mineral: perColor, alloy: perColor, data: perColor, darkMatter: 5 };
}

function makePlayer(id: string, name: string, isBot: boolean): Player {
  return {
    id, name, isBot,
    tokens: emptyTokens(),
    bonuses: emptyBonuses(),
    points: 0,
    reservedCards: [],
    purchasedCards: [],
    claimedFactionLeaders: [],
  };
}

export function initializeGame(
  players: { name: string; isBot: boolean }[],
  config: GameConfig
): GameState {
  const count = players.length;
  const factionLeaders: FactionLeader[] = shuffle(ALL_NOBLES).slice(0, count + 1);

  return {
    phase: 'playing',
    config,
    bank: bankForCount(count),
    tiers: [makeTier(TIER1_CARDS), makeTier(TIER2_CARDS), makeTier(TIER3_CARDS)],
    factionLeaders,
    players: players.map((p, i) => makePlayer(`p${i}`, p.name, p.isBot)),
    activePlayerIndex: 0,
    finalRoundStartPlayerIndex: null,
    pendingSubAction: null,
    pendingSelectedTokens: {},
    eligibleFactionLeaders: [],
    winnerId: null,
    actionMode: 'idle',
    recentlyTakenTokens: null,
    log: [{ id: 1, playerName: players[0].name, action: 'system' as const, message: 'Colony founded — game begins!' }],
  };
}
