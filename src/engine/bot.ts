import type { GameState, ResourceType, Card, Player } from '../types';
import { RESOURCE_TYPES } from '../types';
import { canPurchaseCard, canReserveCard, effectiveCost, playerQualifiesForNoble } from './validators';
import type { GameAction } from './reducer';

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreCard(card: Card, state: GameState, player: Player): number {
  let score = card.points * 10 + card.tier;
  // Bonus per noble requiring this card's bonus resource
  for (const leader of state.factionLeaders) {
    const needed = leader.requirement[card.bonus] ?? 0;
    if (player.bonuses[card.bonus] < needed) score += 3;
  }
  return score;
}

// Tokens still needed after applying bonuses and current tokens
function tokenGap(card: Card, player: Player): number {
  const cost = effectiveCost(card, player);
  let gap = 0;
  for (const r of RESOURCE_TYPES) {
    gap += Math.max(0, (cost[r] ?? 0) - player.tokens[r]);
  }
  return Math.max(0, gap - player.tokens.darkMatter);
}

// ── Target selection ──────────────────────────────────────────────────────────

function selectTarget(cards: Card[], state: GameState, player: Player): Card | null {
  const scored = cards
    .map(c => ({
      card: c,
      gap: tokenGap(c, player),
      score: scoreCard(c, state, player),
    }))
    .filter(x => x.gap <= 6) // only consider reasonably reachable cards
    .sort((a, b) => {
      if (a.gap !== b.gap) return a.gap - b.gap; // prefer closer
      return b.score - a.score; // then by value
    });
  return scored[0]?.card ?? null;
}

// ── Token selection toward a target ──────────────────────────────────────────

function selectTokens(
  state: GameState,
  player: Player,
  target: Card | null
): Partial<Record<ResourceType, number>> {
  // Build priority: resources needed most for the target card
  let priority: ResourceType[] = [];
  if (target) {
    const cost = effectiveCost(target, player);
    priority = RESOURCE_TYPES
      .filter(r => (state.bank[r] ?? 0) > 0)
      .sort((a, b) => {
        const needA = Math.max(0, (cost[a] ?? 0) - player.tokens[a]);
        const needB = Math.max(0, (cost[b] ?? 0) - player.tokens[b]);
        return needB - needA;
      });
  } else {
    // No target — take the most abundant tokens (diversify holdings)
    priority = RESOURCE_TYPES
      .filter(r => (state.bank[r] ?? 0) > 0)
      .sort((a, b) => (state.bank[b] ?? 0) - (state.bank[a] ?? 0));
  }

  // Try take 3 different
  const avail3 = priority.filter(r => (state.bank[r] ?? 0) > 0).slice(0, 3);
  if (avail3.length === 3) return Object.fromEntries(avail3.map(r => [r, 1]));

  // Try take 2 same of most needed (bank ≥ 4)
  for (const r of priority) {
    if ((state.bank[r] ?? 0) >= 4) return { [r]: 2 };
  }

  // Take whatever available (1 or 2 different)
  const avail = priority.filter(r => (state.bank[r] ?? 0) > 0).slice(0, 2);
  if (avail.length > 0) return Object.fromEntries(avail.map(r => [r, 1]));

  return {}; // bank empty — will force pass
}

// ── Discard strategy (called when bot needs to discard after token overfill) ─

export function calculateBotDiscard(state: GameState): GameAction {
  const player = state.players[state.activePlayerIndex];
  const boardCards = state.tiers.flatMap(t => t.active.filter(Boolean) as Card[]);
  const target = selectTarget([...boardCards, ...player.reservedCards], state, player);
  const needed = target ? effectiveCost(target, player) : {};

  // Score each token type: higher = more excess (should discard first)
  const candidates = RESOURCE_TYPES
    .filter(r => player.tokens[r] > 0)
    .map(r => {
      const need = needed[r] ?? 0;
      const have = player.tokens[r];
      return { r, excess: have - need };
    })
    .sort((a, b) => b.excess - a.excess);

  if (candidates.length > 0) {
    return { type: 'DISCARD_TOKEN', token: candidates[0].r };
  }
  // Fallback: discard dark matter last (it's wild)
  return { type: 'DISCARD_TOKEN', token: 'darkMatter' };
}

// ── Main bot decision ─────────────────────────────────────────────────────────

export function calculateBotAction(state: GameState): GameAction {
  const player = state.players[state.activePlayerIndex];
  const boardCards = state.tiers.flatMap(t => t.active.filter(Boolean) as Card[]);
  const allCards = [...boardCards, ...player.reservedCards];

  // 0. Claim any available faction leaders first (no turn cost)
  const claimable = state.factionLeaders.find(n => playerQualifiesForNoble(player, n));
  if (claimable) return { type: 'CLAIM_FACTION_LEADER', nobleId: claimable.id };

  // 1. Purchase the best available card
  const purchaseable = allCards.filter(c => canPurchaseCard(c, player));
  if (purchaseable.length > 0) {
    const best = purchaseable.reduce((a, b) =>
      scoreCard(b, state, player) > scoreCard(a, state, player) ? b : a
    );
    return { type: 'PURCHASE_CARD', cardId: best.id };
  }

  // 2. Find best reachable target on the board
  const target = selectTarget(boardCards, state, player);

  // 3. Reserve a high-value board card if close to affording it and have a slot
  if (target && canReserveCard(player) && target.tier >= 2 && target.points >= 2 && tokenGap(target, player) <= 3) {
    return { type: 'RESERVE_CARD', cardId: target.id };
  }

  // 4. Take tokens toward target
  const tokens = selectTokens(state, player, target);
  if (Object.keys(tokens).length > 0) {
    return { type: 'BOT_TAKE_TOKENS', tokens };
  }

  // 5. Absolute fallback: take dark matter if available, else pass via buying cheapest reserved
  if (player.reservedCards.length > 0) {
    const cheapest = player.reservedCards.sort((a, b) => tokenGap(a, player) - tokenGap(b, player))[0];
    if (canPurchaseCard(cheapest, player)) return { type: 'PURCHASE_CARD', cardId: cheapest.id };
  }

  // Nothing useful to do — take any single token
  const anyToken = RESOURCE_TYPES.find(r => (state.bank[r] ?? 0) > 0);
  if (anyToken) return { type: 'BOT_TAKE_TOKENS', tokens: { [anyToken]: 1 } };

  // Complete stalemate — should never happen in normal play
  return { type: 'CANCEL_ACTION' };
}

// ── Auto-resolve noble selection for bots ────────────────────────────────────

export function calculateBotNobleChoice(state: GameState): GameAction {
  // Pick the first eligible noble (arbitrary, all worth the same 3VP)
  const leader = state.eligibleFactionLeaders[0] ?? state.eligibleNobles?.[0];
  return { type: 'SELECT_NOBLE', nobleId: leader?.id ?? '' };
}
