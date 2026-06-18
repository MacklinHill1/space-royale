// systems/EquipmentSystem.js
// EquipmentManager: 9-slot loadout, stat aggregation, player application

import { EQUIP_SLOTS, CATEGORY_SLOT_MAP, FLAT_STATS, getInitialLoadout } from '../constants/EquipmentData.js';

export { getInitialEquipmentSlots };

function getInitialEquipmentSlots() {
  return getInitialLoadout();
}

// Stat keys the engine reads off the player object — maps gear stat → player property
const GEAR_STAT_TO_PLAYER = {
  damage:           'damageMult',
  fireRate:         'fireRateMult',
  projectileSpeed:  'projectileSpeedMult',
  critChance:       'critChance',
  critDamage:       'critDamageMult',
  bossDamage:       'bossDamageMult',
  eliteDamage:      'eliteDamageMult',
  abilityPower:     'abilityPowerMult',
  maxHp:            'maxHp',          // flat add
  armor:            'armorMult',
  shieldCapacity:   'shieldMax',      // flat add
  shieldRegen:      'shieldRegenMult',
  moveSpeed:        'speedMult',
  dashDistance:     'dashDistMult',
  xpGain:           'xpMult',
  coinGain:         'goldMult',
  pickupRadius:     'magnetRadius',   // flat add (scaled)
  cooldownReduce:   'cooldownReduce',
  droneDamage:      'droneDamageMult',
  droneCount:       'drones',         // flat add
};

// How each stat combines with player base: 'add_mult' | 'add_flat' | 'base_add'
const STAT_COMBINE_MODE = {
  damage:          'add_mult',
  fireRate:        'add_mult',
  projectileSpeed: 'add_mult',
  critChance:      'base_add',   // direct addition to base
  critDamage:      'add_mult',
  bossDamage:      'add_mult',
  eliteDamage:     'add_mult',
  abilityPower:    'add_mult',
  maxHp:           'add_flat',
  armor:           'add_mult',
  shieldCapacity:  'add_flat',
  shieldRegen:     'add_mult',
  moveSpeed:       'add_mult',
  dashDistance:    'add_mult',
  xpGain:          'add_mult',
  coinGain:        'add_mult',
  pickupRadius:    'add_flat',
  cooldownReduce:  'add_mult',
  droneDamage:     'add_mult',
  droneCount:      'add_flat',
};

// Aggregate all stats from all equipped slots + affixes
export function computeEquipmentStats(loadout) {
  const totals = {};

  Object.values(loadout).forEach(item => {
    if (!item) return;

    // Primary stats
    Object.entries(item.stats || {}).forEach(([stat, val]) => {
      totals[stat] = (totals[stat] || 0) + val;
    });

    // Affix bonuses
    (item.affixes || []).forEach(affix => {
      totals[affix.stat] = (totals[affix.stat] || 0) + affix.value;
    });
  });

  return totals;
}

// Apply aggregated gear stats to the player object
export function applyEquipmentToPlayer(player, loadout) {
  if (!player || !loadout) return;

  const stats = computeEquipmentStats(loadout);

  // Reset gear-driven fields to base before applying
  player.damageMult          = 1.0;
  player.fireRateMult        = 1.0;
  player.projectileSpeedMult = 1.0;
  player.critDamageMult      = 2.2; // base crit multiplier
  player.bossDamageMult      = 1.0;
  player.eliteDamageMult     = 1.0;
  player.abilityPowerMult    = 1.0;
  player.armorMult           = 0.0;
  player.shieldRegenMult     = 1.0;
  player.speedMult           = player.speedMult || 1.0;  // preserve run upgrades
  player.dashDistMult        = player.dashDistMult || 1.0;
  player.xpMult              = player.xpMult || 1.0;
  player.goldMult            = player.goldMult || 1.0;
  player.cooldownReduce      = 0.0;
  player.droneDamageMult     = 1.0;

  // Base values
  const BASE_HP             = 100;
  const BASE_SHIELD_MAX     = 0;
  const BASE_MAGNET         = 80;
  const BASE_CRIT_CHANCE    = 0.05;
  const BASE_DRONES         = 0;

  let gearMaxHp         = 0;
  let gearShieldCapacity= 0;
  let gearMagnetBonus   = 0;
  let gearCritChance    = 0;
  let gearDroneCount    = 0;

  Object.entries(stats).forEach(([stat, val]) => {
    switch (stat) {
      case 'damage':          player.damageMult          += val; break;
      case 'fireRate':        player.fireRateMult        += val; break;
      case 'projectileSpeed': player.projectileSpeedMult += val; break;
      case 'critChance':      gearCritChance             += val; break;
      case 'critDamage':      player.critDamageMult      += val; break;
      case 'bossDamage':      player.bossDamageMult      += val; break;
      case 'eliteDamage':     player.eliteDamageMult     += val; break;
      case 'abilityPower':    player.abilityPowerMult    += val; break;
      case 'maxHp':           gearMaxHp                  += val; break;
      case 'armor':           player.armorMult           += val; break;
      case 'shieldCapacity':  gearShieldCapacity         += val; break;
      case 'shieldRegen':     player.shieldRegenMult     += val; break;
      case 'moveSpeed':       player.speedMult           += val; break;
      case 'dashDistance':    player.dashDistMult        += val; break;
      case 'xpGain':          player.xpMult              += val; break;
      case 'coinGain':        player.goldMult            += val; break;
      case 'pickupRadius':    gearMagnetBonus            += val; break;
      case 'cooldownReduce':  player.cooldownReduce      += val; break;
      case 'droneDamage':     player.droneDamageMult     += val; break;
      case 'droneCount':      gearDroneCount             += val; break;
    }
  });

  // Apply flat adds to player HP / shield / magnet
  const newMaxHp = BASE_HP + Math.round(gearMaxHp);
  if (player.maxHp !== newMaxHp) {
    const diff = newMaxHp - (player.maxHp || BASE_HP);
    player.maxHp = newMaxHp;
    player.hp = Math.min(Math.max(1, (player.hp || 100) + diff), newMaxHp);
  }

  player.shieldMax  = BASE_SHIELD_MAX + Math.round(gearShieldCapacity);
  player.shield     = Math.min(player.shield || 0, player.shieldMax);
  player.critChance = BASE_CRIT_CHANCE + gearCritChance;
  player.magnetRadius = BASE_MAGNET + Math.round(gearMagnetBonus * BASE_MAGNET);

  // Drones from gear (stacks on top of upgrade drones)
  player.gearDrones = Math.round(gearDroneCount);
}

// Check if item can go in a slot
export function isItemValidForSlot(item, slotKey) {
  if (!item) return false;
  const validSlots = CATEGORY_SLOT_MAP[item.category] || [];
  return validSlots.includes(slotKey);
}

// Sort items by rarity descending
export function sortItemsByRarity(items) {
  const ORDER = { secret: 6, mythic: 5, legendary: 4, epic: 3, rare: 2, uncommon: 1, common: 0 };
  return [...items].sort((a, b) => (ORDER[b.rarity] || 0) - (ORDER[a.rarity] || 0));
}
