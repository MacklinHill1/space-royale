// systems/ChestSystem.js
// Chest types, reward tables, and opening logic for Space Royale.

// ── Chest definitions ──────────────────────────────────────────────────────

export const CHEST_TYPES = [
  {
    id: 'common_cache',
    name: 'Common Cache',
    icon: '📦',
    color: '#94a3b8',
    accentColor: '#cbd5e1',
    rarity: 'common',
    description: 'A basic supply cache. Contains common salvage.',
    animDuration: 800,
    rewards: {
      gold:      { min: 50,   max: 150  },
      xp:        { min: 100,  max: 300  },
      rubies:    { min: 0,    max: 2,   chance: 0.3 },
      gear:      { chance: 0.4, rarityWeights: [60, 30, 10, 0, 0, 0, 0] },
      ability:   { chance: 0.2, rarityWeights: [70, 20, 10, 0, 0, 0, 0] },
    },
  },
  {
    id: 'rare_crate',
    name: 'Rare Crate',
    icon: '🗃️',
    color: '#3b82f6',
    accentColor: '#60a5fa',
    rarity: 'rare',
    description: 'A military-grade crate with upgraded components inside.',
    animDuration: 1000,
    rewards: {
      gold:      { min: 150,  max: 400  },
      xp:        { min: 300,  max: 700  },
      rubies:    { min: 1,    max: 5,   chance: 0.5 },
      gear:      { chance: 0.65, rarityWeights: [20, 50, 25, 5, 0, 0, 0] },
      ability:   { chance: 0.4,  rarityWeights: [20, 55, 20, 5, 0, 0, 0] },
    },
  },
  {
    id: 'elite_arsenal',
    name: 'Elite Arsenal',
    icon: '🧰',
    color: '#a855f7',
    accentColor: '#c084fc',
    rarity: 'epic',
    description: 'Elite-tier military hardware. Guaranteed advanced gear.',
    animDuration: 1200,
    rewards: {
      gold:      { min: 400,  max: 1000 },
      xp:        { min: 700,  max: 1500 },
      rubies:    { min: 3,    max: 10,  chance: 0.7 },
      gear:      { chance: 0.9,  rarityWeights: [0, 15, 50, 30, 5, 0, 0] },
      ability:   { chance: 0.6,  rarityWeights: [0, 10, 55, 30, 5, 0, 0] },
      bonusGear: { chance: 0.3,  rarityWeights: [0, 20, 55, 20, 5, 0, 0] },
    },
  },
  {
    id: 'mythic_relic',
    name: 'Mythic Relic',
    icon: '⚗️',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    rarity: 'mythic',
    description: 'Ancient alien technology of extraordinary power.',
    animDuration: 1500,
    rewards: {
      gold:      { min: 1000, max: 3000 },
      xp:        { min: 1500, max: 4000 },
      rubies:    { min: 8,    max: 20,  chance: 0.9 },
      gear:      { chance: 1.0, rarityWeights: [0, 0, 20, 50, 25, 5, 0] },
      ability:   { chance: 0.8, rarityWeights: [0, 0, 15, 55, 25, 5, 0] },
      bonusGear: { chance: 0.6, rarityWeights: [0, 0, 25, 50, 20, 5, 0] },
    },
  },
  {
    id: 'cosmic_vault',
    name: 'Cosmic Vault',
    icon: '🌌',
    color: '#ef4444',
    accentColor: '#f87171',
    rarity: 'cosmic',
    description: 'A vault from another dimension. Contains the rarest items in the galaxy.',
    animDuration: 2000,
    rewards: {
      gold:      { min: 3000, max: 8000 },
      xp:        { min: 4000, max: 10000 },
      rubies:    { min: 20,   max: 60,  chance: 1.0 },
      gear:      { chance: 1.0, rarityWeights: [0, 0, 5,  25, 40, 25, 5] },
      ability:   { chance: 1.0, rarityWeights: [0, 0, 5,  20, 45, 25, 5] },
      bonusGear: { chance: 0.9, rarityWeights: [0, 0, 5,  25, 45, 20, 5] },
      pet:       { chance: 0.4, rarityWeights: [0, 0, 10, 35, 35, 15, 5] },
    },
  },
  {
    id: 'raid_chest',
    name: 'Raid Cache',
    icon: '💎',
    color: '#06b6d4',
    accentColor: '#22d3ee',
    rarity: 'raid',
    description: 'Spoils from a successful raid. Exceptional loot guaranteed.',
    animDuration: 1800,
    rewards: {
      gold:      { min: 2000, max: 5000 },
      xp:        { min: 3000, max: 8000 },
      rubies:    { min: 25,   max: 100, chance: 1.0 },
      gear:      { chance: 1.0, rarityWeights: [0, 0, 10, 30, 40, 15, 5] },
      ability:   { chance: 0.9, rarityWeights: [0, 0, 10, 30, 40, 15, 5] },
      bonusGear: { chance: 0.7, rarityWeights: [0, 0, 10, 35, 40, 12, 3] },
      pet:       { chance: 0.25, rarityWeights: [0, 10, 25, 35, 20, 8, 2] },
    },
  },
];

export const CHEST_MAP = Object.fromEntries(CHEST_TYPES.map(c => [c.id, c]));

// Which chest does each boss type drop?
export const BOSS_CHEST_TABLE = {
  regular:    'common_cache',
  elite:      'rare_crate',
  boss:       'elite_arsenal',
  raid_boss:  'raid_chest',
  world_boss: 'cosmic_vault',
};

// ── Reward generation ──────────────────────────────────────────────────────

function rng(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedIndex(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

/**
 * Generate chest rewards (coins, rubies, XP, rarity indices for gear/abilities/pet).
 * Gear and ability rarity indices map to constants/EquipmentData RARITIES and AbilityData RARITIES.
 * @param {string} chestId
 * @param {object} opts - { lootQuality: 0-1 bonus, rubyMult: 1.0 }
 * @returns {object} rewards
 */
export function generateChestRewards(chestId, opts = {}) {
  const def = CHEST_MAP[chestId];
  if (!def) return { gold: 50, xp: 100, rubies: 0, items: [] };

  const { lootQuality = 0, rubyMult = 1 } = opts;
  const r = def.rewards;
  const items = [];

  const gold  = rng(r.gold.min, r.gold.max);
  const xp    = rng(r.xp.min, r.xp.max);

  let rubies = 0;
  if (Math.random() < (r.rubies?.chance ?? 0)) {
    rubies = Math.round(rng(r.rubies.min, r.rubies.max) * rubyMult);
    rubies = Math.max(rubies, r.rubies.min > 0 ? r.rubies.min : 0);
  }

  // Gear drop
  if (r.gear && Math.random() < r.gear.chance) {
    const adjusted = boostWeights(r.gear.rarityWeights, lootQuality);
    items.push({ type: 'gear', rarityIndex: weightedIndex(adjusted) });
  }
  // Bonus gear
  if (r.bonusGear && Math.random() < r.bonusGear.chance) {
    const adjusted = boostWeights(r.bonusGear.rarityWeights, lootQuality);
    items.push({ type: 'gear', rarityIndex: weightedIndex(adjusted) });
  }
  // Ability drop
  if (r.ability && Math.random() < r.ability.chance) {
    const adjusted = boostWeights(r.ability.rarityWeights, lootQuality);
    items.push({ type: 'ability', rarityIndex: weightedIndex(adjusted) });
  }
  // Pet drop
  if (r.pet && Math.random() < r.pet.chance) {
    const adjusted = boostWeights(r.pet.rarityWeights, lootQuality);
    items.push({ type: 'pet', rarityIndex: weightedIndex(adjusted) });
  }

  return { gold, xp, rubies, items };
}

// Shift weight distribution toward higher rarities by lootQuality (0-1)
function boostWeights(weights, quality) {
  if (!quality || quality <= 0) return weights;
  const shift = Math.min(quality * 2, 2); // max shift of 2 tiers
  const w = [...weights];
  for (let i = 0; i < shift && i < w.length - 1; i++) {
    const moveAmt = w[0] * 0.5;
    if (w[0] >= moveAmt) {
      w[0] -= moveAmt;
      w[Math.min(w.length - 1, 1 + Math.floor(i))] += moveAmt;
    }
  }
  return w;
}

export function getChestDef(chestId) {
  return CHEST_MAP[chestId] ?? CHEST_MAP['common_cache'];
}
