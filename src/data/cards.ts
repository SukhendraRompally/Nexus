import type { Card } from '../types';

// ─── TIER 1 — Outpost Modules (40 cards, 8 per bonus color) ───────────────
// Cost total: 4–5 gems, spread across any colors, 0–1 VP
// ─────────────────────────────────────────────────────────────────────────────

const TIER1: Card[] = [
  // CRYSTAL bonus (8)
  { id: 't1-cr-1', tier: 1, bonus: 'crystal', points: 0, cost: { fuel: 1, mineral: 1, alloy: 1, data: 1 }, name: 'Cryo Pod Alpha', subtype: 'Outpost Module' },
  { id: 't1-cr-2', tier: 1, bonus: 'crystal', points: 0, cost: { fuel: 2, alloy: 2 }, name: 'Frost Relay', subtype: 'Outpost Module' },
  { id: 't1-cr-3', tier: 1, bonus: 'crystal', points: 0, cost: { mineral: 3, alloy: 1 }, name: 'Ice Refinery', subtype: 'Outpost Module' },
  { id: 't1-cr-4', tier: 1, bonus: 'crystal', points: 0, cost: { data: 4 }, name: 'Glacial Node', subtype: 'Outpost Module' },
  { id: 't1-cr-5', tier: 1, bonus: 'crystal', points: 0, cost: { fuel: 1, mineral: 2, alloy: 1 }, name: 'Arctic Lab', subtype: 'Outpost Module' },
  { id: 't1-cr-6', tier: 1, bonus: 'crystal', points: 0, cost: { alloy: 2, data: 2 }, name: 'Polar Outpost', subtype: 'Outpost Module' },
  { id: 't1-cr-7', tier: 1, bonus: 'crystal', points: 0, cost: { fuel: 3, mineral: 1, data: 1 }, name: 'Crystal Array', subtype: 'Outpost Module' },
  { id: 't1-cr-8', tier: 1, bonus: 'crystal', points: 1, cost: { alloy: 4, data: 1 }, name: 'Cryo Vault', subtype: 'Outpost Module' },

  // FUEL bonus (8)
  { id: 't1-fu-1', tier: 1, bonus: 'fuel', points: 0, cost: { crystal: 1, mineral: 1, alloy: 1, data: 1 }, name: 'Fuel Depot', subtype: 'Outpost Module' },
  { id: 't1-fu-2', tier: 1, bonus: 'fuel', points: 0, cost: { crystal: 2, alloy: 2 }, name: 'Plasma Duct', subtype: 'Outpost Module' },
  { id: 't1-fu-3', tier: 1, bonus: 'fuel', points: 0, cost: { alloy: 3, data: 1 }, name: 'Ion Engine Bay', subtype: 'Outpost Module' },
  { id: 't1-fu-4', tier: 1, bonus: 'fuel', points: 0, cost: { mineral: 4 }, name: 'Hydrogen Tank', subtype: 'Outpost Module' },
  { id: 't1-fu-5', tier: 1, bonus: 'fuel', points: 0, cost: { crystal: 1, alloy: 2, data: 1 }, name: 'Thruster Pod', subtype: 'Outpost Module' },
  { id: 't1-fu-6', tier: 1, bonus: 'fuel', points: 0, cost: { alloy: 2, data: 2 }, name: 'Combustion Hub', subtype: 'Outpost Module' },
  { id: 't1-fu-7', tier: 1, bonus: 'fuel', points: 0, cost: { crystal: 2, mineral: 1, data: 2 }, name: 'Ignition Bay', subtype: 'Outpost Module' },
  { id: 't1-fu-8', tier: 1, bonus: 'fuel', points: 1, cost: { mineral: 4, crystal: 1 }, name: 'Fuel Cell Bank', subtype: 'Outpost Module' },

  // MINERAL bonus (8)
  { id: 't1-mi-1', tier: 1, bonus: 'mineral', points: 0, cost: { crystal: 1, fuel: 1, alloy: 1, data: 1 }, name: 'Mining Rig', subtype: 'Outpost Module' },
  { id: 't1-mi-2', tier: 1, bonus: 'mineral', points: 0, cost: { crystal: 2, fuel: 2 }, name: 'Rock Crusher', subtype: 'Outpost Module' },
  { id: 't1-mi-3', tier: 1, bonus: 'mineral', points: 0, cost: { crystal: 3, data: 1 }, name: 'Ore Extractor', subtype: 'Outpost Module' },
  { id: 't1-mi-4', tier: 1, bonus: 'mineral', points: 0, cost: { fuel: 4 }, name: 'Drill Station', subtype: 'Outpost Module' },
  { id: 't1-mi-5', tier: 1, bonus: 'mineral', points: 0, cost: { crystal: 1, fuel: 2, alloy: 1 }, name: 'Quarry Unit', subtype: 'Outpost Module' },
  { id: 't1-mi-6', tier: 1, bonus: 'mineral', points: 0, cost: { fuel: 2, alloy: 2 }, name: 'Seismic Scanner', subtype: 'Outpost Module' },
  { id: 't1-mi-7', tier: 1, bonus: 'mineral', points: 0, cost: { crystal: 2, fuel: 1, data: 2 }, name: 'Mineral Silo', subtype: 'Outpost Module' },
  { id: 't1-mi-8', tier: 1, bonus: 'mineral', points: 1, cost: { data: 4, fuel: 1 }, name: 'Refinery Post', subtype: 'Outpost Module' },

  // ALLOY bonus (8)
  { id: 't1-al-1', tier: 1, bonus: 'alloy', points: 0, cost: { crystal: 1, fuel: 1, mineral: 1, data: 1 }, name: 'Alloy Smelter', subtype: 'Outpost Module' },
  { id: 't1-al-2', tier: 1, bonus: 'alloy', points: 0, cost: { crystal: 2, mineral: 2 }, name: 'Metal Processor', subtype: 'Outpost Module' },
  { id: 't1-al-3', tier: 1, bonus: 'alloy', points: 0, cost: { crystal: 3, fuel: 1 }, name: 'Forge Pod', subtype: 'Outpost Module' },
  { id: 't1-al-4', tier: 1, bonus: 'alloy', points: 0, cost: { crystal: 4 }, name: 'Welding Bay', subtype: 'Outpost Module' },
  { id: 't1-al-5', tier: 1, bonus: 'alloy', points: 0, cost: { crystal: 1, fuel: 2, mineral: 1 }, name: 'Casting Unit', subtype: 'Outpost Module' },
  { id: 't1-al-6', tier: 1, bonus: 'alloy', points: 0, cost: { crystal: 2, data: 2 }, name: 'Press Station', subtype: 'Outpost Module' },
  { id: 't1-al-7', tier: 1, bonus: 'alloy', points: 0, cost: { crystal: 3, mineral: 1, fuel: 1 }, name: 'Steel Works', subtype: 'Outpost Module' },
  { id: 't1-al-8', tier: 1, bonus: 'alloy', points: 1, cost: { crystal: 4, fuel: 1 }, name: 'Heat Exchanger', subtype: 'Outpost Module' },

  // DATA bonus (8)
  { id: 't1-da-1', tier: 1, bonus: 'data', points: 0, cost: { crystal: 1, fuel: 1, mineral: 1, alloy: 1 }, name: 'Data Relay', subtype: 'Outpost Module' },
  { id: 't1-da-2', tier: 1, bonus: 'data', points: 0, cost: { crystal: 2, fuel: 2 }, name: 'Signal Array', subtype: 'Outpost Module' },
  { id: 't1-da-3', tier: 1, bonus: 'data', points: 0, cost: { fuel: 3, alloy: 1 }, name: 'Comm Tower', subtype: 'Outpost Module' },
  { id: 't1-da-4', tier: 1, bonus: 'data', points: 0, cost: { crystal: 4 }, name: 'Neural Tap', subtype: 'Outpost Module' },
  { id: 't1-da-5', tier: 1, bonus: 'data', points: 0, cost: { crystal: 2, mineral: 2 }, name: 'Packet Hub', subtype: 'Outpost Module' },
  { id: 't1-da-6', tier: 1, bonus: 'data', points: 0, cost: { fuel: 2, mineral: 2 }, name: 'Info Pod', subtype: 'Outpost Module' },
  { id: 't1-da-7', tier: 1, bonus: 'data', points: 0, cost: { crystal: 1, fuel: 2, mineral: 1, alloy: 1 }, name: 'Logic Gate', subtype: 'Outpost Module' },
  { id: 't1-da-8', tier: 1, bonus: 'data', points: 1, cost: { crystal: 3, alloy: 2 }, name: 'Data Buffer', subtype: 'Outpost Module' },
];

// ─── TIER 2 — Station Modules (30 cards, 6 per bonus color) ──────────────
// Cost total: 6–8 gems, fewer color types (1–3 colors), 1–3 VP
// ─────────────────────────────────────────────────────────────────────────────

const TIER2: Card[] = [
  // CRYSTAL bonus (6)
  { id: 't2-cr-1', tier: 2, bonus: 'crystal', points: 1, cost: { fuel: 3, alloy: 2, data: 2 }, name: 'Cryo Station', subtype: 'Station Module' },
  { id: 't2-cr-2', tier: 2, bonus: 'crystal', points: 1, cost: { alloy: 4, data: 3 }, name: 'Ice Palace', subtype: 'Station Module' },
  { id: 't2-cr-3', tier: 2, bonus: 'crystal', points: 2, cost: { fuel: 3, mineral: 3, alloy: 1 }, name: 'Crystal Nexus', subtype: 'Station Module' },
  { id: 't2-cr-4', tier: 2, bonus: 'crystal', points: 2, cost: { mineral: 5, alloy: 3 }, name: 'Frost Citadel', subtype: 'Station Module' },
  { id: 't2-cr-5', tier: 2, bonus: 'crystal', points: 2, cost: { fuel: 6 }, name: 'Glacial Hub', subtype: 'Station Module' },
  { id: 't2-cr-6', tier: 2, bonus: 'crystal', points: 3, cost: { fuel: 3, alloy: 2, data: 3 }, name: 'Polar Complex', subtype: 'Station Module' },

  // FUEL bonus (6)
  { id: 't2-fu-1', tier: 2, bonus: 'fuel', points: 1, cost: { crystal: 3, mineral: 2, data: 2 }, name: 'Fuel Station', subtype: 'Station Module' },
  { id: 't2-fu-2', tier: 2, bonus: 'fuel', points: 1, cost: { crystal: 4, data: 3 }, name: 'Ion Nexus', subtype: 'Station Module' },
  { id: 't2-fu-3', tier: 2, bonus: 'fuel', points: 2, cost: { crystal: 3, alloy: 3, data: 1 }, name: 'Plasma Core', subtype: 'Station Module' },
  { id: 't2-fu-4', tier: 2, bonus: 'fuel', points: 2, cost: { alloy: 5, data: 3 }, name: 'Thrust Array', subtype: 'Station Module' },
  { id: 't2-fu-5', tier: 2, bonus: 'fuel', points: 2, cost: { crystal: 6 }, name: 'Combustion Center', subtype: 'Station Module' },
  { id: 't2-fu-6', tier: 2, bonus: 'fuel', points: 3, cost: { crystal: 2, mineral: 3, data: 3 }, name: 'Fuel Matrix', subtype: 'Station Module' },

  // MINERAL bonus (6)
  { id: 't2-mi-1', tier: 2, bonus: 'mineral', points: 1, cost: { crystal: 2, fuel: 3, alloy: 2 }, name: 'Ore Station', subtype: 'Station Module' },
  { id: 't2-mi-2', tier: 2, bonus: 'mineral', points: 1, cost: { fuel: 4, alloy: 3 }, name: 'Mineral Nexus', subtype: 'Station Module' },
  { id: 't2-mi-3', tier: 2, bonus: 'mineral', points: 2, cost: { crystal: 3, fuel: 3, data: 1 }, name: 'Rock Complex', subtype: 'Station Module' },
  { id: 't2-mi-4', tier: 2, bonus: 'mineral', points: 2, cost: { crystal: 5, fuel: 3 }, name: 'Drill Matrix', subtype: 'Station Module' },
  { id: 't2-mi-5', tier: 2, bonus: 'mineral', points: 2, cost: { fuel: 6 }, name: 'Seismic Center', subtype: 'Station Module' },
  { id: 't2-mi-6', tier: 2, bonus: 'mineral', points: 3, cost: { crystal: 3, fuel: 2, alloy: 3 }, name: 'Refinery Hub', subtype: 'Station Module' },

  // ALLOY bonus (6)
  { id: 't2-al-1', tier: 2, bonus: 'alloy', points: 1, cost: { crystal: 2, fuel: 3, data: 2 }, name: 'Forge Station', subtype: 'Station Module' },
  { id: 't2-al-2', tier: 2, bonus: 'alloy', points: 1, cost: { crystal: 3, mineral: 4 }, name: 'Alloy Nexus', subtype: 'Station Module' },
  { id: 't2-al-3', tier: 2, bonus: 'alloy', points: 2, cost: { fuel: 3, mineral: 2, data: 3 }, name: 'Metal Complex', subtype: 'Station Module' },
  { id: 't2-al-4', tier: 2, bonus: 'alloy', points: 2, cost: { mineral: 5, data: 3 }, name: 'Press Matrix', subtype: 'Station Module' },
  { id: 't2-al-5', tier: 2, bonus: 'alloy', points: 2, cost: { mineral: 6 }, name: 'Steel Center', subtype: 'Station Module' },
  { id: 't2-al-6', tier: 2, bonus: 'alloy', points: 3, cost: { crystal: 2, fuel: 3, mineral: 2, data: 1 }, name: 'Heat Core', subtype: 'Station Module' },

  // DATA bonus (6)
  { id: 't2-da-1', tier: 2, bonus: 'data', points: 1, cost: { crystal: 2, mineral: 2, alloy: 3 }, name: 'Neural Station', subtype: 'Station Module' },
  { id: 't2-da-2', tier: 2, bonus: 'data', points: 1, cost: { crystal: 3, alloy: 4 }, name: 'Data Nexus', subtype: 'Station Module' },
  { id: 't2-da-3', tier: 2, bonus: 'data', points: 2, cost: { crystal: 3, mineral: 2, alloy: 2 }, name: 'Signal Complex', subtype: 'Station Module' },
  { id: 't2-da-4', tier: 2, bonus: 'data', points: 2, cost: { crystal: 5, alloy: 3 }, name: 'Comm Matrix', subtype: 'Station Module' },
  { id: 't2-da-5', tier: 2, bonus: 'data', points: 2, cost: { alloy: 6 }, name: 'Logic Center', subtype: 'Station Module' },
  { id: 't2-da-6', tier: 2, bonus: 'data', points: 3, cost: { crystal: 2, fuel: 2, mineral: 2, alloy: 2 }, name: 'Info Core', subtype: 'Station Module' },
];

// ─── TIER 3 — Megastructures (20 cards, 4 per bonus color) ───────────────
// Cost total: 7–14 gems, dominated by 1–2 colors, 3–5 VP
// ─────────────────────────────────────────────────────────────────────────────

const TIER3: Card[] = [
  // CRYSTAL bonus (4)
  { id: 't3-cr-1', tier: 3, bonus: 'crystal', points: 3, cost: { fuel: 3, alloy: 3, data: 3 }, name: 'Cryo Citadel', subtype: 'Megastructure' },
  { id: 't3-cr-2', tier: 3, bonus: 'crystal', points: 4, cost: { fuel: 7, alloy: 3 }, name: 'Ice Dyson Sphere', subtype: 'Megastructure' },
  { id: 't3-cr-3', tier: 3, bonus: 'crystal', points: 4, cost: { alloy: 6, data: 3, mineral: 3 }, name: 'Glacial Fortress', subtype: 'Megastructure' },
  { id: 't3-cr-4', tier: 3, bonus: 'crystal', points: 5, cost: { fuel: 5, mineral: 3, alloy: 3, data: 3 }, name: 'Crystal Megacitadel', subtype: 'Megastructure' },

  // FUEL bonus (4)
  { id: 't3-fu-1', tier: 3, bonus: 'fuel', points: 3, cost: { crystal: 3, mineral: 3, data: 3 }, name: 'Fuel Dyson Array', subtype: 'Megastructure' },
  { id: 't3-fu-2', tier: 3, bonus: 'fuel', points: 4, cost: { crystal: 7, mineral: 3 }, name: 'Ion Megacore', subtype: 'Megastructure' },
  { id: 't3-fu-3', tier: 3, bonus: 'fuel', points: 4, cost: { crystal: 6, alloy: 3, data: 3 }, name: 'Plasma Fortress', subtype: 'Megastructure' },
  { id: 't3-fu-4', tier: 3, bonus: 'fuel', points: 5, cost: { crystal: 5, mineral: 3, alloy: 3, data: 3 }, name: 'Thrust Citadel', subtype: 'Megastructure' },

  // MINERAL bonus (4)
  { id: 't3-mi-1', tier: 3, bonus: 'mineral', points: 3, cost: { crystal: 3, fuel: 3, alloy: 3 }, name: 'Asteroid Forge', subtype: 'Megastructure' },
  { id: 't3-mi-2', tier: 3, bonus: 'mineral', points: 4, cost: { fuel: 7, crystal: 3 }, name: 'Mineral Titan', subtype: 'Megastructure' },
  { id: 't3-mi-3', tier: 3, bonus: 'mineral', points: 4, cost: { crystal: 3, fuel: 6, data: 3 }, name: 'Rock Citadel', subtype: 'Megastructure' },
  { id: 't3-mi-4', tier: 3, bonus: 'mineral', points: 5, cost: { crystal: 3, fuel: 5, alloy: 3, data: 3 }, name: 'Ore Megaplex', subtype: 'Megastructure' },

  // ALLOY bonus (4)
  { id: 't3-al-1', tier: 3, bonus: 'alloy', points: 3, cost: { crystal: 3, fuel: 3, mineral: 3 }, name: 'Quantum Foundry', subtype: 'Megastructure' },
  { id: 't3-al-2', tier: 3, bonus: 'alloy', points: 4, cost: { mineral: 7, fuel: 3 }, name: 'Alloy Titan', subtype: 'Megastructure' },
  { id: 't3-al-3', tier: 3, bonus: 'alloy', points: 4, cost: { mineral: 6, crystal: 3, data: 3 }, name: 'Metal Fortress', subtype: 'Megastructure' },
  { id: 't3-al-4', tier: 3, bonus: 'alloy', points: 5, cost: { crystal: 3, fuel: 3, mineral: 5, data: 3 }, name: 'Steel Citadel', subtype: 'Megastructure' },

  // DATA bonus (4)
  { id: 't3-da-1', tier: 3, bonus: 'data', points: 3, cost: { crystal: 3, alloy: 3, mineral: 3 }, name: 'AI Collective', subtype: 'Megastructure' },
  { id: 't3-da-2', tier: 3, bonus: 'data', points: 4, cost: { alloy: 7, crystal: 3 }, name: 'Neural Titan', subtype: 'Megastructure' },
  { id: 't3-da-3', tier: 3, bonus: 'data', points: 4, cost: { crystal: 3, alloy: 6, fuel: 3 }, name: 'Data Fortress', subtype: 'Megastructure' },
  { id: 't3-da-4', tier: 3, bonus: 'data', points: 5, cost: { crystal: 3, fuel: 3, mineral: 3, alloy: 5 }, name: 'Quantum Mind', subtype: 'Megastructure' },
];

export const ALL_CARDS: Card[] = [...TIER1, ...TIER2, ...TIER3];

export const TIER1_CARDS = TIER1;
export const TIER2_CARDS = TIER2;
export const TIER3_CARDS = TIER3;
