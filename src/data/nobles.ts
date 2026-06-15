import type { Noble } from '../types';

// All 10 Faction Leaders — one per C(5,3) resource triplet.
// Each requires exactly 3 bonus cards of each of 3 different resource types.
// Game uses playerCount + 1 leaders, randomly selected.

export const ALL_NOBLES: Noble[] = [
  { id: 'n-cfm', points: 3, requirement: { crystal: 3, fuel: 3, mineral: 3 }, name: 'Admiral Veyra' },
  { id: 'n-cfa', points: 3, requirement: { crystal: 3, fuel: 3, alloy: 3 },   name: 'Commander Rix' },
  { id: 'n-cfd', points: 3, requirement: { crystal: 3, fuel: 3, data: 3 },    name: 'Director Zhen' },
  { id: 'n-cma', points: 3, requirement: { crystal: 3, mineral: 3, alloy: 3 }, name: 'Warlord Kessa' },
  { id: 'n-cmd', points: 3, requirement: { crystal: 3, mineral: 3, data: 3 }, name: 'Overseer Naum' },
  { id: 'n-cad', points: 3, requirement: { crystal: 3, alloy: 3, data: 3 },   name: 'Architect Sola' },
  { id: 'n-fma', points: 3, requirement: { fuel: 3, mineral: 3, alloy: 3 },   name: 'Chancellor Drav' },
  { id: 'n-fmd', points: 3, requirement: { fuel: 3, mineral: 3, data: 3 },    name: 'Executor Phel' },
  { id: 'n-fad', points: 3, requirement: { fuel: 3, alloy: 3, data: 3 },      name: 'Baron Ostek' },
  { id: 'n-mad', points: 3, requirement: { mineral: 3, alloy: 3, data: 3 },   name: 'Sovereign Mira' },
];
