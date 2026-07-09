// constants/DifficultyData.js
// Central difficulty->rarity model. Every game mode already carries a
// `difficultyRating` (1-5, see constants/GameModes.js). This module turns that
// single number into rarity-weight tables that every existing drop pipeline
// (equipment, abilities, chests) can plug into, so "harder content = better
// rewards" is enforced consistently everywhere instead of drop rates being
// hand-tuned per system.
//
// Design notes:
// - Existing systems (BOSS_DROP_TABLES, chest CHEST_TYPES.rewards.*.rarityWeights,
//   WAVE_ABILITY_RARITY_TABLE, etc.) already encode *which* rarities a given
//   source is allowed to produce (e.g. a Common Cache can never roll Epic+).
//   We never change that eligibility — we only reweight the *proportions*
//   among the rarities a table already allows, using the difficulty curve
//   below. That keeps every hand-tuned table's identity intact while making
//   it difficulty-aware.
// - 'secret' is intentionally excluded from these tables. Secret-rarity items
//   are granted via their own condition-based trigger systems
//   (checkSecretDrops / checkSecretAbilityDrops), never via weighted rolls.

export const RARITY_KEYS = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

// Target odds requested for standard drops (equipment/ability/chest rarity),
// expressed as percentages that sum to 100 per tier.
//   1-3 star (easy):    Common 55 / Rare 25 / Epic 13 / Legendary 5 / Mythic 2
//   4 star:             Common 40 / Rare 30 / Epic 15 / Legendary 10 / Mythic 5
//   5 star (extreme):   Common 30 / Rare 30 / Epic 20 / Legendary 13 / Mythic 7
// The game has an extra "uncommon" tier between common/rare that the request's
// 5-bucket model doesn't name. We carve it out of the "Rare" bucket (40/60
// split toward rare) so the named tiers keep their requested totals while
// uncommon still exists as a stepping stone.
const BASE_TIERS = {
  easy:    { common: 55, rareBucket: 25, epic: 13, legendary: 5,  mythic: 2 },
  hard:    { common: 40, rareBucket: 30, epic: 15, legendary: 10, mythic: 5 },
  extreme: { common: 30, rareBucket: 30, epic: 20, legendary: 13, mythic: 7 },
};

function expandTier(tier) {
  const uncommon = tier.rareBucket * 0.4;
  const rare = tier.rareBucket * 0.6;
  return {
    common: tier.common,
    uncommon,
    rare,
    epic: tier.epic,
    legendary: tier.legendary,
    mythic: tier.mythic,
  };
}

export const DIFFICULTY_RARITY_WEIGHTS = {
  1: expandTier(BASE_TIERS.easy),
  2: expandTier(BASE_TIERS.easy),
  3: expandTier(BASE_TIERS.easy),
  4: expandTier(BASE_TIERS.hard),
  5: expandTier(BASE_TIERS.extreme),
};

/** Clamp+round a difficulty rating to the nearest defined tier (1-5). */
export function normalizeDifficulty(rating) {
  const n = Math.round(Number(rating) || 3);
  return Math.min(5, Math.max(1, n));
}

/** Returns { common, uncommon, rare, epic, legendary, mythic } summing to 100. */
export function getDifficultyRarityWeights(rating = 3) {
  return DIFFICULTY_RARITY_WEIGHTS[normalizeDifficulty(rating)];
}

/**
 * Reweight a `[{ rarity, weight }]` pool (as used by EquipmentGenerator /
 * AbilityGenerator's rollWeighted-style helpers) by difficulty, preserving
 * which rarities are eligible (weight > 0) but redistributing proportions
 * according to the difficulty curve.
 */
export function reweightPoolByDifficulty(pool, rating = 3) {
  if (!pool || pool.length === 0) return pool;
  const diff = getDifficultyRarityWeights(rating);
  const rescaled = pool.map(entry => ({
    rarity: entry.rarity,
    weight: entry.weight > 0 ? (diff[entry.rarity] ?? 0) : 0,
  }));
  const total = rescaled.reduce((s, e) => s + e.weight, 0);
  if (total <= 0) return pool; // nothing in the difficulty table matched -> keep original
  return rescaled.map(e => ({ rarity: e.rarity, weight: e.weight / total }));
}

/**
 * Reweight a plain `{ rarity: weight }` object (as used by AbilityGenerator's
 * rollRarity) the same way as reweightPoolByDifficulty.
 */
export function reweightWeightsByDifficulty(weights, rating = 3) {
  if (!weights) return weights;
  const diff = getDifficultyRarityWeights(rating);
  const rescaled = {};
  let total = 0;
  for (const key of Object.keys(weights)) {
    const eligible = weights[key] > 0;
    const w = eligible ? (diff[key] ?? 0) : 0;
    rescaled[key] = w;
    total += w;
  }
  if (total <= 0) return weights;
  for (const key of Object.keys(rescaled)) rescaled[key] = (rescaled[key] / total) * 100;
  return rescaled;
}

/**
 * Reweight a fixed-position rarity array (as used by ChestSystem's
 * `rarityWeights: [common, uncommon, rare, epic, legendary, mythic, secret]`)
 * by difficulty. Position 6 (secret) always stays whatever it was — secrets
 * are never part of the difficulty curve.
 */
export function reweightArrayByDifficulty(weights, rating = 3) {
  if (!weights || weights.length === 0) return weights;
  const diff = getDifficultyRarityWeights(rating);
  const rescaled = weights.map((w, i) => {
    if (i >= RARITY_KEYS.length) return 0; // secret slot — handled separately below
    return w > 0 ? (diff[RARITY_KEYS[i]] ?? 0) : 0;
  });
  const total = rescaled.reduce((s, w) => s + w, 0);
  if (total <= 0) return weights;
  const out = rescaled.map(w => (w / total) * 100);
  if (weights.length > RARITY_KEYS.length) out[RARITY_KEYS.length] = weights[RARITY_KEYS.length]; // preserve secret weight untouched
  return out;
}
