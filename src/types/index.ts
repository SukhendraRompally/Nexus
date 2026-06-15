export type ResourceType = 'crystal' | 'fuel' | 'mineral' | 'alloy' | 'data';
export type TokenType = ResourceType | 'darkMatter';

export type Tokens = Record<TokenType, number>;
export type BonusCounts = Record<ResourceType, number>;

export const RESOURCE_TYPES: ResourceType[] = ['crystal', 'fuel', 'mineral', 'alloy', 'data'];
export const TOKEN_TYPES: TokenType[] = ['crystal', 'fuel', 'mineral', 'alloy', 'data', 'darkMatter'];

export const RESOURCE_LABELS: Record<TokenType, string> = {
  crystal:    'Crystal',
  fuel:       'Fuel',
  mineral:    'Mineral',
  alloy:      'Alloy',
  data:       'Data',
  darkMatter: 'Dark Matter',
};

export const RESOURCE_COLORS: Record<TokenType, string> = {
  crystal:    'cyan',
  fuel:       'orange',
  mineral:    'green',
  alloy:      'red',
  data:       'fuchsia',
  darkMatter: 'amber',
};

// ── Card & Faction Leader data ───────────────────────────────────────────────

export interface Card {
  id: string;
  tier: 1 | 2 | 3;
  bonus: ResourceType;
  points: number;
  cost: Partial<Record<ResourceType, number>>;
  name: string;
  subtype: string;
}

export interface FactionLeader {
  id: string;
  points: 3;
  requirement: Partial<Record<ResourceType, number>>;
  name: string;
}

// Keep Noble as an alias so data files don't need touching
export type Noble = FactionLeader;

// ── Player & Game state ──────────────────────────────────────────────────────

export interface GameConfig {
  vpThreshold: number;
  timerSeconds: number | null;
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  tokens: Tokens;
  bonuses: BonusCounts;
  points: number;
  reservedCards: Card[];
  purchasedCards: Card[];
  claimedFactionLeaders: FactionLeader[];
  /** @deprecated use claimedFactionLeaders */
  claimedNobles?: FactionLeader[];
}

export interface Tier {
  active: (Card | null)[];
  deck: Card[];
}

export type GamePhase = 'setup' | 'playing' | 'finalRound' | 'ended';
export type PendingSubAction = null | 'discardTokens';
export type ActionMode = 'idle' | 'takingTokens';

// ── Structured log entries ───────────────────────────────────────────────────

export type LogAction = 'take' | 'purchase' | 'reserve' | 'recruit' | 'discard' | 'system';

export interface LogEntry {
  id: number;
  playerName: string;
  action: LogAction;
  tokens?: Partial<Record<TokenType, number>>;
  cardBonus?: ResourceType;
  cardTier?: 1 | 2 | 3;
  cardPoints?: number;
  factionLeaderName?: string;
  /** @deprecated use factionLeaderName */
  nobleName?: string;
  message?: string;
}

export interface GameState {
  phase: GamePhase;
  config: GameConfig;
  bank: Tokens;
  tiers: [Tier, Tier, Tier];
  factionLeaders: FactionLeader[];
  /** @deprecated use factionLeaders */
  nobles?: FactionLeader[];
  players: Player[];
  activePlayerIndex: number;
  finalRoundStartPlayerIndex: number | null;
  pendingSubAction: PendingSubAction;
  pendingSelectedTokens: Partial<Record<ResourceType, number>>;
  eligibleFactionLeaders: FactionLeader[];
  /** @deprecated use eligibleFactionLeaders */
  eligibleNobles?: FactionLeader[];
  winnerId: string | null;
  actionMode: ActionMode;
  log: LogEntry[];
  recentlyTakenTokens: Partial<Record<TokenType, number>> | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function emptyTokens(): Tokens {
  return { crystal: 0, fuel: 0, mineral: 0, alloy: 0, data: 0, darkMatter: 0 };
}

export function emptyBonuses(): BonusCounts {
  return { crystal: 0, fuel: 0, mineral: 0, alloy: 0, data: 0 };
}

export function totalTokens(tokens: Tokens): number {
  return Object.values(tokens).reduce((a, b) => a + b, 0);
}

export function totalSelectedTokens(sel: Partial<Record<ResourceType, number>>): number {
  return Object.values(sel).reduce((a, b) => a + (b ?? 0), 0);
}

let _logId = 0;
export function nextLogId() { return ++_logId; }
