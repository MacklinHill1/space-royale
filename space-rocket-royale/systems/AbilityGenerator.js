// systems/AbilityGenerator.js — Generate ability instances for drops

import {
  ABILITY_DB,
  BOSS_ABILITY_DROP_TABLES,
  WAVE_ABILITY_RARITY_TABLE,
  ABILITY_RARITIES,
  SECRET_ABILITY_IDS,
} from '../constants/AbilityData.js';

let _instanceCounter = Date.now();
function newInstanceId() { return `ab_${++_instanceCounter}`; }

// ─── WEIGHTED RANDOM RARITY ───────────────────────────────────────────────────
function rollRarity(weights) {
  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return 'common';
}

// ─── WAVE → RARITY TABLE ──────────────────────────────────────────────────────
function getWaveWeights(wave) {
  let entry = WAVE_ABILITY_RARITY_TABLE[0];
  for (const row of WAVE_ABILITY_RARITY_TABLE) {
    if (wave >= row.minWave) entry = row;
  }
  return entry.weights;
}

// ─── POOL OF ABILITY IDS BY RARITY ───────────────────────────────────────────
function abilitiesByRarity(rarity) {
  return Object.values(ABILITY_DB).filter(a => a.rarity === rarity && a.rarity !== 'secret');
}

// ─── GENERATE SINGLE ABILITY INSTANCE ────────────────────────────────────────
export function generateAbility({ rarity, wave = 1, source = 'unknown', forceId = null }) {
  let pool;
  if (forceId) {
    const def = ABILITY_DB[forceId];
    if (!def) return null;
    pool = [def];
  } else {
    pool = abilitiesByRarity(rarity);
    if (pool.length === 0) pool = abilitiesByRarity('common');
  }
  const def = pool[Math.floor(Math.random() * pool.length)];
  if (!def) return null;

  return {
    instanceId: newInstanceId(),
    id:         def.id,
    name:       def.name,
    type:       def.type,
    rarity:     def.rarity,
    icon:       def.icon,
    cooldown:   def.cooldown,
    duration:   def.duration || 0,
    effectKey:  def.effectKey,
    desc:       def.desc,
    flavorText: def.flavorText || '',
    source,
    wave,
    value:      0, // salvage value computed from rarity by useAbilities
  };
}

// ─── BOSS ABILITY DROPS ───────────────────────────────────────────────────────
export function generateBossAbilityDrops(bossName, wave, hasBossHunter = false) {
  const table = BOSS_ABILITY_DROP_TABLES[bossName];
  if (!table) return [];

  let count = table.count;
  if (hasBossHunter) count += table.bonusOnBossHunter || 0;

  const results = [];
  for (let i = 0; i < count; i++) {
    const rarity = rollRarity(table.weights);
    const item = generateAbility({ rarity, wave, source: `Boss: ${bossName}` });
    if (item) results.push(item);
  }
  return results;
}

// ─── CHEST ABILITY DROP ───────────────────────────────────────────────────────
export function generateChestAbilityDrop(wave) {
  const weights = getWaveWeights(wave);
  const rarity  = rollRarity(weights);
  return generateAbility({ rarity, wave, source: 'Chest' });
}

// ─── SECRET ABILITY CHECKS ────────────────────────────────────────────────────
// runStats: { uniqueBossesKilled: Set, bossKilledAtLowHP, lootCollected, bossKilledNoDamage }
export function checkSecretAbilityDrops(runStats) {
  const drops = [];

  if (runStats.uniqueBossesKilled && runStats.uniqueBossesKilled.size >= 3) {
    if (Math.random() < 0.25) {
      drops.push(generateAbility({ rarity:'secret', source:'Secret: Triple Boss', forceId:'origin_protocol' }));
    }
  }
  if (runStats.bossKilledAtLowHP && Math.random() < 0.30) {
    drops.push(generateAbility({ rarity:'secret', source:'Secret: Near-Death Boss Kill', forceId:'entropy_collapse' }));
  }
  if (runStats.lootCollected >= 10 && Math.random() < 0.20) {
    drops.push(generateAbility({ rarity:'secret', source:'Secret: Loot Collector', forceId:'the_last_signal' }));
  }
  if (runStats.bossKilledNoDamage && Math.random() < 0.40) {
    drops.push(generateAbility({ rarity:'secret', source:'Secret: Flawless Boss Kill', forceId:'cosmic_ascension' }));
  }

  return drops;
}
