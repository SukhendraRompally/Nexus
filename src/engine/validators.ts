import type { Card, FactionLeader, Player, ResourceType, Tokens } from '../types';
import { RESOURCE_TYPES, totalSelectedTokens } from '../types';

export function canReserveCard(player: Player): boolean {
  return player.reservedCards.length < 3;
}

export function effectiveCost(card: Card, player: Player): Partial<Record<ResourceType, number>> {
  const result: Partial<Record<ResourceType, number>> = {};
  for (const r of RESOURCE_TYPES) {
    const raw = card.cost[r] ?? 0;
    const reduced = Math.max(0, raw - player.bonuses[r]);
    if (reduced > 0) result[r] = reduced;
  }
  return result;
}

export function wildcardShortfall(cost: Partial<Record<ResourceType, number>>, playerTokens: Tokens): number {
  let shortfall = 0;
  for (const r of RESOURCE_TYPES) {
    const needed = cost[r] ?? 0;
    const have = playerTokens[r as keyof Tokens] ?? 0;
    shortfall += Math.max(0, needed - have);
  }
  return shortfall;
}

// Returns per-resource shortfall covered by wildcards
export function wildcardBreakdown(
  cost: Partial<Record<ResourceType, number>>,
  playerTokens: Tokens
): Partial<Record<ResourceType, number>> {
  const result: Partial<Record<ResourceType, number>> = {};
  for (const r of RESOURCE_TYPES) {
    const needed = cost[r] ?? 0;
    const have = playerTokens[r] ?? 0;
    const deficit = Math.max(0, needed - have);
    if (deficit > 0) result[r] = deficit;
  }
  return result;
}

export function canPurchaseCard(card: Card, player: Player): boolean {
  const cost = effectiveCost(card, player);
  const shortfall = wildcardShortfall(cost, player.tokens);
  return shortfall <= player.tokens.darkMatter;
}

// Validate a proposed token selection (used progressively during selection)
export function isValidTokenSelection(
  bank: Tokens,
  selection: Partial<Record<ResourceType, number>>
): { valid: boolean; reason?: string } {
  const total = totalSelectedTokens(selection);
  const colors = Object.entries(selection).filter(([, v]) => (v ?? 0) > 0);

  if (colors.length === 0) return { valid: false };

  if (colors.length === 1) {
    const [color, count] = colors[0];
    if (count === 2) {
      if ((bank[color as ResourceType] ?? 0) < 4) {
        return { valid: false, reason: 'Need 4+ tokens in pool to take 2 of same color.' };
      }
      return { valid: true };
    }
    if (count === 1) return { valid: false }; // single token not yet a valid complete selection
    return { valid: false };
  }

  if (colors.length === 2) {
    if (total === 2 && colors.every(([, v]) => v === 1)) return { valid: false }; // only 2 different — not complete
    // 3 different but only 2 colors picked yet — not complete
    return { valid: false };
  }

  if (colors.length === 3 && total === 3) {
    for (const [color] of colors) {
      if ((bank[color as ResourceType] ?? 0) < 1) {
        return { valid: false, reason: `No ${color} tokens remaining.` };
      }
    }
    return { valid: true };
  }

  return { valid: false };
}

// Check if a resource can be added to the current selection
export function canToggleResource(
  bank: Tokens,
  selection: Partial<Record<ResourceType, number>>,
  resource: ResourceType
): boolean {
  const current = selection[resource] ?? 0;
  const total = totalSelectedTokens(selection);
  const distinctColors = Object.values(selection).filter(v => (v ?? 0) > 0).length;

  if (current > 0) return true; // can always deselect

  if ((bank[resource] ?? 0) === 0) return false; // no tokens in bank

  // Taking a new color
  if (total === 0) return true;
  if (total === 1) {
    // Can take same again (if pool ≥ 4) or a new different color
    if (distinctColors === 1) {
      // Could be starting a "take 2 same" or "take 3 different"
      return true;
    }
  }
  if (total === 2) {
    if (distinctColors === 1) {
      // Already have 2 of same — cannot add more
      return false;
    }
    if (distinctColors === 2) {
      // Need a third different color
      return true;
    }
  }
  return false;
}

export function playerQualifiesForFactionLeader(player: Player, leader: FactionLeader): boolean {
  for (const r of Object.keys(leader.requirement) as ResourceType[]) {
    if ((player.bonuses[r] ?? 0) < (leader.requirement[r] ?? 0)) return false;
  }
  return true;
}

// Alias kept for backward compat with any remaining callers
export const playerQualifiesForNoble = playerQualifiesForFactionLeader;
