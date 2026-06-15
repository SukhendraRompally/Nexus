import type { GameState, ResourceType, TokenType, LogEntry, GameConfig } from '../types';
import { RESOURCE_TYPES, totalSelectedTokens, nextLogId } from '../types';
import { initializeGame } from './setup';
import {
  canReserveCard, canPurchaseCard, effectiveCost, wildcardShortfall,
  canToggleResource, isValidTokenSelection, playerQualifiesForNoble,
} from './validators';
import { resolveEndOfTurn, awardNoble, advanceTurn } from './endOfTurn';

export type GameAction =
  | { type: 'START_GAME'; players: { name: string; isBot: boolean }[]; config: GameConfig }
  | { type: 'RESET_TO_SETUP' }
  | { type: 'BOT_TAKE_TOKENS'; tokens: Partial<Record<ResourceType, number>> }
  | { type: 'SET_ACTION_MODE'; mode: 'idle' | 'takingTokens' }
  | { type: 'TOGGLE_TOKEN'; resource: ResourceType }
  | { type: 'CONFIRM_TAKE_TOKENS' }
  | { type: 'CANCEL_TOKEN_TAKE' }
  | { type: 'RESERVE_CARD'; cardId: string }
  | { type: 'RESERVE_FROM_DECK'; tier: 1 | 2 | 3 }
  | { type: 'PURCHASE_CARD'; cardId: string }
  | { type: 'DISCARD_TOKEN'; token: TokenType }
  | { type: 'CLAIM_FACTION_LEADER'; nobleId: string }
  | { type: 'CLAIM_NOBLE'; nobleId: string }   // alias kept for compat
  | { type: 'SELECT_NOBLE'; nobleId: string }  // kept for bot compat
  | { type: 'CANCEL_ACTION' };

function addLog(log: LogEntry[], entry: LogEntry): LogEntry[] {
  return [entry, ...log.slice(0, 24)];
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const player = state.players[state.activePlayerIndex];

  switch (action.type) {
    case 'START_GAME':
      return initializeGame(action.players, action.config);

    case 'BOT_TAKE_TOKENS': {
      // Same as CONFIRM_TAKE_TOKENS but bypasses UI selection state (used by bot + timeout)
      const sel = action.tokens;
      const takenTokens: Partial<Record<TokenType, number>> = { ...sel } as Partial<Record<TokenType, number>>;
      const newBank = { ...state.bank };
      const newTokens = { ...player.tokens };
      for (const r of RESOURCE_TYPES) {
        const take = sel[r] ?? 0;
        if (take > 0) { newBank[r] -= take; newTokens[r] += take; }
      }
      const bPlayers = state.players.map((p,i) =>
        i === state.activePlayerIndex ? { ...p, tokens: newTokens } : p
      );
      const bState: GameState = {
        ...state, bank: newBank, players: bPlayers,
        pendingSelectedTokens: {}, actionMode: 'idle',
        recentlyTakenTokens: takenTokens,
        log: addLog(state.log, { id: nextLogId(), playerName: player.name, action: 'take', tokens: takenTokens }),
      };
      return resolveEndOfTurn(bState);
    }

    case 'RESET_TO_SETUP':
      return { ...state, phase: 'setup' };

    case 'SET_ACTION_MODE': {
      if (state.pendingSubAction) return state;
      return { ...state, actionMode: action.mode, pendingSelectedTokens: {} };
    }

    case 'CANCEL_ACTION':
      return { ...state, actionMode: 'idle', pendingSelectedTokens: {} };

    case 'TOGGLE_TOKEN': {
      if (state.actionMode !== 'takingTokens') return state;
      const { resource } = action;
      const current = state.pendingSelectedTokens[resource] ?? 0;
      const total = totalSelectedTokens(state.pendingSelectedTokens);

      if (current === 2) {
        const next = { ...state.pendingSelectedTokens };
        delete next[resource];
        return { ...state, pendingSelectedTokens: next };
      }
      if (current === 1) {
        if (total === 1 && (state.bank[resource] ?? 0) >= 4) {
          return { ...state, pendingSelectedTokens: { [resource]: 2 } };
        }
        const next = { ...state.pendingSelectedTokens };
        delete next[resource];
        return { ...state, pendingSelectedTokens: next };
      }
      if (!canToggleResource(state.bank, state.pendingSelectedTokens, resource)) return state;
      return { ...state, pendingSelectedTokens: { ...state.pendingSelectedTokens, [resource]: 1 } };
    }

    case 'CONFIRM_TAKE_TOKENS': {
      const sel = state.pendingSelectedTokens;
      const { valid } = isValidTokenSelection(state.bank, sel);
      if (!valid) return state;

      const takenTokens: Partial<Record<TokenType, number>> = { ...sel } as Partial<Record<TokenType, number>>;
      const newBank = { ...state.bank };
      const newTokens = { ...player.tokens };
      for (const r of RESOURCE_TYPES) {
        const take = sel[r] ?? 0;
        newBank[r] = (newBank[r] ?? 0) - take;
        newTokens[r] = (newTokens[r] ?? 0) + take;
      }

      const players = state.players.map((p,i) =>
        i === state.activePlayerIndex ? { ...p, tokens: newTokens } : p
      );
      const newState: GameState = {
        ...state, bank: newBank, players,
        pendingSelectedTokens: {}, actionMode: 'idle',
        recentlyTakenTokens: takenTokens,
        log: addLog(state.log, {
          id: nextLogId(), playerName: player.name, action: 'take',
          tokens: takenTokens,
        }),
      };
      return resolveEndOfTurn(newState);
    }

    case 'CANCEL_TOKEN_TAKE': {
      // Only valid when in overfill-discard mode after a token take
      if (state.pendingSubAction !== 'discardTokens' || !state.recentlyTakenTokens) return state;
      const taken = state.recentlyTakenTokens;

      // Return the recently taken tokens back to the bank and remove from player
      const newBank = { ...state.bank };
      const newTokens = { ...player.tokens };
      for (const [tok, n] of Object.entries(taken) as [TokenType, number][]) {
        newBank[tok] = (newBank[tok] ?? 0) + n;
        newTokens[tok] = Math.max(0, (newTokens[tok] ?? 0) - n);
      }

      // Remove the take-tokens log entry we added
      const trimmedLog = state.log.slice(1);
      const players = state.players.map((p,i) =>
        i === state.activePlayerIndex ? { ...p, tokens: newTokens } : p
      );
      return {
        ...state,
        bank: newBank,
        players,
        pendingSubAction: null,
        recentlyTakenTokens: null,
        actionMode: 'idle',
        log: trimmedLog,
      };
    }

    case 'RESERVE_CARD': {
      if (!canReserveCard(player)) return state;
      let card = null;
      const newTiers = state.tiers.map(t => ({ ...t, active: [...t.active], deck: [...t.deck] })) as GameState['tiers'];

      for (let t = 0; t < 3; t++) {
        const idx = newTiers[t].active.findIndex(c => c?.id === action.cardId);
        if (idx !== -1) {
          card = newTiers[t].active[idx];
          newTiers[t].active[idx] = newTiers[t].deck.length > 0 ? newTiers[t].deck.shift()! : null;
          break;
        }
      }
      if (!card) return state;
      return doReserve(state, card, newTiers);
    }

    case 'RESERVE_FROM_DECK': {
      if (!canReserveCard(player)) return state;
      const ti = action.tier - 1;
      if (state.tiers[ti].deck.length === 0) return state;
      const newTiers = state.tiers.map((t,i) =>
        i === ti ? { ...t, deck: t.deck.slice(1) } : t
      ) as GameState['tiers'];
      const card = state.tiers[ti].deck[0];
      return doReserve(state, card, newTiers);
    }

    case 'PURCHASE_CARD': {
      let card = player.reservedCards.find(c => c.id === action.cardId) ?? null;
      const fromReserved = card !== null;

      const newTiers = state.tiers.map(t => ({
        ...t, active: [...t.active], deck: [...t.deck],
      })) as GameState['tiers'];

      if (!card) {
        for (let t = 0; t < 3; t++) {
          const idx = newTiers[t].active.findIndex(c => c?.id === action.cardId);
          if (idx !== -1) {
            card = newTiers[t].active[idx];
            newTiers[t].active[idx] = newTiers[t].deck.length > 0 ? newTiers[t].deck.shift()! : null;
            break;
          }
        }
      }
      if (!card || !canPurchaseCard(card, player)) return state;

      const cost = effectiveCost(card, player);
      const shortfall = wildcardShortfall(cost, player.tokens);
      const newPlayerTokens = { ...player.tokens };
      const newBank = { ...state.bank };

      for (const r of RESOURCE_TYPES) {
        const pay = Math.min(cost[r] ?? 0, newPlayerTokens[r]);
        newPlayerTokens[r] -= pay;
        newBank[r] += pay;
      }
      newPlayerTokens.darkMatter -= shortfall;
      newBank.darkMatter += shortfall;

      const updatedPlayer = {
        ...player,
        tokens: newPlayerTokens,
        bonuses: { ...player.bonuses, [card.bonus]: player.bonuses[card.bonus] + 1 },
        points: player.points + card.points,
        reservedCards: fromReserved ? player.reservedCards.filter(c => c.id !== card!.id) : player.reservedCards,
        purchasedCards: [...player.purchasedCards, card],
      };
      const players = state.players.map((p,i) => i===state.activePlayerIndex ? updatedPlayer : p);
      const purchased = card;
      const newState: GameState = {
        ...state, bank: newBank, tiers: newTiers, players, actionMode: 'idle',
        log: addLog(state.log, {
          id: nextLogId(), playerName: player.name, action: 'purchase',
          cardBonus: purchased.bonus, cardTier: purchased.tier, cardPoints: purchased.points,
        }),
      };
      return resolveEndOfTurn(newState);
    }

    case 'DISCARD_TOKEN': {
      const tok = action.token;
      if ((player.tokens[tok] ?? 0) === 0) return state;
      const newPlayerTokens = { ...player.tokens, [tok]: player.tokens[tok] - 1 };
      const newBank = { ...state.bank, [tok]: state.bank[tok] + 1 };
      const players = state.players.map((p,i) => i===state.activePlayerIndex ? { ...p, tokens: newPlayerTokens } : p);
      const updatedState = { ...state, bank: newBank, players };
      const total = Object.values(newPlayerTokens).reduce((a,b) => a+b, 0);
      if (total <= 10) return advanceTurn({ ...updatedState, pendingSubAction: null });
      return updatedState;
    }

    case 'CLAIM_NOBLE':
    case 'CLAIM_FACTION_LEADER': {
      const leader = state.factionLeaders.find(n => n.id === action.nobleId);
      if (!leader || !playerQualifiesForNoble(player, leader)) return state;

      const updPlayer = {
        ...player,
        points: player.points + leader.points,
        claimedFactionLeaders: [...(player.claimedFactionLeaders ?? []), leader],
      };
      const claimPlayers = state.players.map((p,i) => i===state.activePlayerIndex ? updPlayer : p);
      let s: GameState = {
        ...state,
        players: claimPlayers,
        factionLeaders: state.factionLeaders.filter(n => n.id !== leader.id),
        log: addLog(state.log, { id: nextLogId(), playerName: player.name, action: 'recruit', factionLeaderName: leader.name }),
      };
      if (updPlayer.points >= s.config.vpThreshold && s.phase === 'playing') {
        s = { ...s, phase: 'finalRound', finalRoundStartPlayerIndex: s.activePlayerIndex };
      }
      return s; // turn does NOT advance
    }

    case 'SELECT_NOBLE': {
      // Used by bots — auto-award then advance turn
      const afterAward = awardNoble(state, action.nobleId);
      let s = afterAward;
      const p = s.players[s.activePlayerIndex];
      if (p.points >= s.config.vpThreshold && s.phase === 'playing') {
        s = { ...s, phase: 'finalRound', finalRoundStartPlayerIndex: s.activePlayerIndex };
      }
      return advanceTurn({ ...s, pendingSubAction: null });
    }

    default:
      return state;
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

function doReserve(
  state: GameState,
  card: NonNullable<GameState['tiers'][0]['active'][0]>,
  newTiers: GameState['tiers']
): GameState {
  const player = state.players[state.activePlayerIndex];
  const getsDM = state.bank.darkMatter > 0;
  const newPlayerTokens = { ...player.tokens, darkMatter: player.tokens.darkMatter + (getsDM ? 1 : 0) };
  const newBank = { ...state.bank, darkMatter: state.bank.darkMatter - (getsDM ? 1 : 0) };
  const updatedPlayer = { ...player, tokens: newPlayerTokens, reservedCards: [...player.reservedCards, card] };
  const players = state.players.map((p,i) => i===state.activePlayerIndex ? updatedPlayer : p);
  const reserved = card;
  const newState: GameState = {
    ...state, bank: newBank, tiers: newTiers, players, actionMode: 'idle',
    log: addLog(state.log, {
      id: nextLogId(), playerName: player.name, action: 'reserve',
      cardBonus: reserved.bonus, cardTier: reserved.tier, cardPoints: reserved.points,
    }),
  };
  return resolveEndOfTurn(newState);
}
