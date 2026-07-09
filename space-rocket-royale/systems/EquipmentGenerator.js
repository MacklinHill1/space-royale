// systems/EquipmentGenerator.js
// Generates equipment items with rarity, item level, stat rolls, affixes, unique IDs

import {
  ALL_BLUEPRINTS, BLUEPRINT_BY_ID, AFFIXES,
  UNIQUE_ITEMS, UNIQUE_BY_ID, SECRET_ITEMS, SECRET_BY_ID,
  RARITY_STAT_MULT, RARITY_AFFIX_COUNT, RARITY_SALVAGE_VALUE,
  FLAT_STATS, BOSS_DROP_TABLES, WAVE_RARITY_TABLE, MYTHIC_EFFECTS,
  RARITY_ORDER, CATEGORY_SLOT_MAP,
} from '../constants/EquipmentData.js';
import { reweightPoolByDifficulty } from '../constants/DifficultyData.js';

// ─── RNG HELPERS ─────────────────────────────────────────────────────────────
function rand(min, max) { return Math.random() * (max - min) + min; }
function randItem(arr)  { return arr[Math.floor(Math.random() * arr.length)]; }
function uid()          { return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }

function rollWeighted(pool) {
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const entry of pool) {
    r -= entry.weight;
    if (r <= 0) return entry.rarity;
  }
  return pool[pool.length - 1].rarity;
}

// ─── ITEM LEVEL ──────────────────────────────────────────────────────────────
function itemLevelFromWave(wave) {
  return Math.max(1, Math.floor(wave * 1.5 + Math.random() * 3));
}

// ─── AFFIX GENERATION ────────────────────────────────────────────────────────
function rollAffixes(rarity, existingStatKeys) {
  const count = RARITY_AFFIX_COUNT[rarity] || 0;
  if (count === 0) return [];

  // Prefer affixes that don't duplicate primary stats
  const pool = AFFIXES.filter(a => !existingStatKeys.includes(a.stat));
  const chosen = [];
  const usedIds = new Set();

  for (let i = 0; i < count && pool.length > 0; i++) {
    const candidates = pool.filter(a => !usedIds.has(a.id));
    if (candidates.length === 0) break;
    const pick = randItem(candidates);
    chosen.push({ ...pick });
    usedIds.add(pick.id);
  }
  return chosen;
}

// ─── NAME CONSTRUCTION ───────────────────────────────────────────────────────
const RARITY_PREFIXES = {
  common:    [],
  uncommon:  ['Sturdy', 'Polished', 'Refined'],
  rare:      ['Superior', 'Enhanced', 'Advanced'],
  epic:      ['Exalted', 'Void-Forged', 'Stellar'],
  legendary: ['Ancient', 'Mythforged', 'Eternal'],
  mythic:    ['Cosmic', 'Transcendent', 'Omnigenic'],
  secret:    [], // secrets have fixed names
};

function buildItemName(blueprint, rarity, affixes) {
  const prefixes = RARITY_PREFIXES[rarity];
  const prefix = prefixes.length > 0 ? randItem(prefixes) + ' ' : '';
  const affixPrefix = affixes.length > 0 ? affixes[0].name + ' ' : '';
  return `${affixPrefix}${prefix}${blueprint.name}`.trim();
}

// ─── CORE GENERATOR ──────────────────────────────────────────────────────────
export function generateItem({ blueprintId, rarity, wave = 1, source = 'drop' }) {
  const blueprint = BLUEPRINT_BY_ID[blueprintId];
  if (!blueprint) return null;

  const mult = RARITY_STAT_MULT[rarity] ?? 1.0;
  const itemLevel = itemLevelFromWave(wave);
  const stats = {};

  Object.entries(blueprint.statRanges).forEach(([stat, range]) => {
    const rolled = rand(range.min, range.max) * mult;
    if (FLAT_STATS.has(stat) || (blueprint.flatStats && blueprint.flatStats.includes(stat))) {
      stats[stat] = Math.round(rolled);
    } else {
      stats[stat] = parseFloat(rolled.toFixed(4));
    }
  });

  const affixes = rollAffixes(rarity, Object.keys(stats));
  const name = buildItemName(blueprint, rarity, affixes);

  // Mythic: add one gameplay-changing effect
  let mythicEffect = null;
  if (rarity === 'mythic') {
    mythicEffect = randItem(MYTHIC_EFFECTS);
  }

  return {
    instanceId: uid(),
    blueprintId,
    name,
    icon: blueprint.icon,
    category: blueprint.category,
    rarity,
    itemLevel,
    stats,
    affixes,
    mythicEffect,
    flavorText: blueprint.flavorText,
    value: Math.round(RARITY_SALVAGE_VALUE[rarity] * (0.8 + Math.random() * 0.4)),
    source,
    isUnique: false,
    isSecret: false,
    acquired: Date.now(),
  };
}

// ─── UNIQUE ITEM ──────────────────────────────────────────────────────────────
export function generateUniqueItem(uniqueId, wave = 1, source = 'boss') {
  const def = UNIQUE_BY_ID[uniqueId];
  if (!def) return null;

  return {
    instanceId: uid(),
    blueprintId: uniqueId,
    name: def.name,
    icon: def.icon,
    category: def.category,
    rarity: def.rarity,
    itemLevel: itemLevelFromWave(wave),
    stats: { ...def.stats },
    affixes: [],
    mythicEffect: null,
    specialEffect: def.specialEffect,
    flavorText: def.flavorText,
    description: def.description,
    value: RARITY_SALVAGE_VALUE[def.rarity],
    source,
    isUnique: true,
    isSecret: false,
    acquired: Date.now(),
  };
}

// ─── SECRET ITEM ──────────────────────────────────────────────────────────────
export function generateSecretItem(secretId, source = 'secret') {
  const def = SECRET_BY_ID[secretId];
  if (!def) return null;

  return {
    instanceId: uid(),
    blueprintId: secretId,
    name: def.name,
    icon: def.icon,
    category: def.category,
    rarity: def.rarity,
    itemLevel: 99,
    stats: { ...def.stats },
    affixes: [],
    mythicEffect: null,
    specialEffect: def.specialEffect,
    flavorText: def.flavorText,
    description: def.description,
    dropCondition: def.dropCondition,
    value: RARITY_SALVAGE_VALUE['secret'],
    source,
    isUnique: true,
    isSecret: true,
    acquired: Date.now(),
  };
}

// ─── BOSS DROP GENERATION ────────────────────────────────────────────────────
// difficultyRating (1-5, from the active game mode) reweights *within* each
// boss's curated rarity pool — it never lets a boss drop a rarity outside its
// own table (e.g. Asteroid Titan still can't drop Legendary+), it just makes
// the eligible higher tiers noticeably more likely the harder the mode is.
export function generateBossDrops(bossName, wave = 1, difficultyRating = 3) {
  const table = BOSS_DROP_TABLES[bossName];
  if (!table) return [];

  const drops = [];
  const dropCount = Math.floor(rand(table.dropCount.min, table.dropCount.max + 1));

  // Check unique drop
  if (table.uniqueItemIds && Math.random() < table.uniqueChance) {
    const uniqueId = randItem(table.uniqueItemIds);
    const item = generateUniqueItem(uniqueId, wave, bossName);
    if (item) { drops.push(item); }
  }

  // Fill remaining with blueprint rolls
  const remaining = Math.max(0, dropCount - drops.length);
  const pool = table.blueprintPool;
  const scaledRarityPool = reweightPoolByDifficulty(table.rarityPool, difficultyRating);

  for (let i = 0; i < remaining; i++) {
    const rarity = rollWeighted(scaledRarityPool);
    const blueprintId = randItem(pool);
    const item = generateItem({ blueprintId, rarity, wave, source: bossName });
    if (item) drops.push(item);
  }

  return drops;
}

// ─── CHEST DROP GENERATION ───────────────────────────────────────────────────
// The wave table still gates *which* rarities are reachable this early in a
// run (no Mythic drops at wave 1 no matter how hard the mode is); difficulty
// reweights the odds among whatever the wave has unlocked so far.
export function generateChestDrop(wave = 1, difficultyRating = 3) {
  const entry = WAVE_RARITY_TABLE.find(t => wave <= t.maxWave) || WAVE_RARITY_TABLE[WAVE_RARITY_TABLE.length - 1];
  const scaledPool = reweightPoolByDifficulty(entry.pool, difficultyRating);
  const rarity = rollWeighted(scaledPool);
  const eligibleBlueprints = ALL_BLUEPRINTS.filter(b => RARITY_ORDER[b.minRarity] <= RARITY_ORDER[rarity]);
  if (eligibleBlueprints.length === 0) return null;
  const blueprint = randItem(eligibleBlueprints);
  return generateItem({ blueprintId: blueprint.id, rarity, wave, source: 'chest' });
}

// ─── SECRET DROP CONDITION CHECKS ────────────────────────────────────────────
// Called by game engine after tracking run stats
export function checkSecretDrops(runStats) {
  const drops = [];

  // Kill all 3 bosses in one run
  if (runStats.uniqueBossesKilled >= 3 && !runStats.secretDropped_singularity) {
    drops.push({ secretId: 'secret_singularity', triggered: 'all_bosses' });
  }

  // Kill a boss below 10% health
  if (runStats.bossKilledAtLowHP && !runStats.secretDropped_last_star) {
    drops.push({ secretId: 'secret_last_star', triggered: 'boss_low_hp' });
  }

  return drops;
}

// ─── STAT FORMATTING ─────────────────────────────────────────────────────────
export function formatStat(statKey, value) {
  if (FLAT_STATS.has(statKey)) {
    return `+${value}`;
  }
  return `+${(value * 100).toFixed(1)}%`;
}
