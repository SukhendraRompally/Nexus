import { useReducer } from 'react';
import type { GameState, ResourceType, TokenType, GameConfig } from '../types';
import { gameReducer } from '../engine/reducer';

const DEFAULT_CONFIG: GameConfig = { vpThreshold: 15, timerSeconds: 60 };

const INITIAL_STATE: GameState = {
  phase: 'setup',
  config: DEFAULT_CONFIG,
  bank: { crystal: 0, fuel: 0, mineral: 0, alloy: 0, data: 0, darkMatter: 0 },
  tiers: [
    { active: [null, null, null, null], deck: [] },
    { active: [null, null, null, null], deck: [] },
    { active: [null, null, null, null], deck: [] },
  ],
  factionLeaders: [],
  players: [],
  activePlayerIndex: 0,
  finalRoundStartPlayerIndex: null,
  pendingSubAction: null,
  pendingSelectedTokens: {},
  eligibleFactionLeaders: [],
  winnerId: null,
  actionMode: 'idle',
  recentlyTakenTokens: null,
  log: [],
};

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  return {
    state,
    startGame: (players: { name: string; isBot: boolean }[], config: GameConfig) =>
      dispatch({ type: 'START_GAME', players, config }),
    setActionMode: (mode: 'idle' | 'takingTokens') =>
      dispatch({ type: 'SET_ACTION_MODE', mode }),
    cancelAction: () => dispatch({ type: 'CANCEL_ACTION' }),
    toggleToken: (resource: ResourceType) => dispatch({ type: 'TOGGLE_TOKEN', resource }),
    confirmTakeTokens: () => dispatch({ type: 'CONFIRM_TAKE_TOKENS' }),
    cancelTokenTake: () => dispatch({ type: 'CANCEL_TOKEN_TAKE' }),
    reserveCard: (cardId: string) => dispatch({ type: 'RESERVE_CARD', cardId }),
    purchaseCard: (cardId: string) => dispatch({ type: 'PURCHASE_CARD', cardId }),
    discardToken: (token: TokenType) => dispatch({ type: 'DISCARD_TOKEN', token }),
    claimNoble: (nobleId: string) => dispatch({ type: 'CLAIM_NOBLE', nobleId }),
    selectNoble: (nobleId: string) => dispatch({ type: 'SELECT_NOBLE', nobleId }),
    resetToSetup: () => dispatch({ type: 'RESET_TO_SETUP' }),
    dispatch, // exposed for bot actions
  };
}
