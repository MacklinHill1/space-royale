// systems/ShopSystem.js
// Persistent upgrade shop with 25s auto-refresh, 5-rank system, rarity tiers.

// ── UPGRADE CATALOG ───────────────────────────────────────────────────────────

export const UPGRADE_TYPES = [
  // ── Combat ───
  { id: 'damage',             name: 'Damage Amplifier',    desc: 'Increase all projectile damage',        icon: '⚡', category: 'Combat',      stat: 'damageMult',         perRank: 0.15 },
  { id: 'fire_rate',          name: 'Fire Rate Module',    desc: 'Increase attack speed',                 icon: '🔥', category: 'Combat',      stat: 'fireRateMult',       perRank: 0.12 },
  { id: 'projectile_speed',   name: 'Velocity Core',       desc: 'Faster projectiles',                    icon: '💨', category: 'Combat',      stat: 'projectileSpeedMult',perRank: 0.20 },
  { id: 'crit_chance',        name: 'Critical Targeting',  desc: 'Chance to deal critical hits',          icon: '🎯', category: 'Combat',      stat: 'critChance',         perRank: 0.08 },
  { id: 'crit_damage',        name: 'Critical Amplifier',  desc: 'Multiply critical hit damage',          icon: '💥', category: 'Combat',      stat: 'critDamageMult',     perRank: 0.50 },
  { id: 'boss_damage',        name: 'Boss Breaker',        desc: 'Bonus damage to boss enemies',          icon: '👑', category: 'Combat',      stat: 'bossDamageMult',     perRank: 0.20 },
  { id: 'elite_damage',       name: 'Elite Hunter',        desc: 'Bonus damage to elite enemies',         icon: '⭐', category: 'Combat',      stat: 'eliteDamageMult',    perRank: 0.20 },
  { id: 'spread_shot',        name: 'Spread Cannon',       desc: 'Fire additional angled projectiles',    icon: '🌊', category: 'Combat',      stat: 'spreadShots',        perRank: 1 },
  // ── Abilities ───
  { id: 'ability_power',      name: 'Ability Power Core',  desc: 'Amplify all ability effects',           icon: '✨', category: 'Abilities',   stat: 'abilityPowerMult',   perRank: 0.20 },
  { id: 'cooldown_reduction', name: 'Cooldown Optimizer',  desc: 'Reduce ability cooldowns',              icon: '⏱', category: 'Abilities',   stat: 'cooldownReduction',  perRank: 0.10 },
  // ── Defense ───
  { id: 'max_hp',             name: 'Hull Reinforcement',  desc: 'Increase maximum HP',                   icon: '❤️', category: 'Defense',     stat: 'maxHpBonus',         perRank: 25 },
  { id: 'shield_capacity',    name: 'Shield Capacitor',    desc: 'Increase maximum shield',               icon: '🛡', category: 'Defense',     stat: 'shieldCapBonus',     perRank: 30 },
  { id: 'shield_regen',       name: 'Shield Regenerator',  desc: 'Regenerate shield HP/sec',              icon: '💙', category: 'Defense',     stat: 'shieldRegenBonus',   perRank: 2 },
  { id: 'move_speed',         name: 'Thruster Overdrive',  desc: 'Increase movement speed',               icon: '🚀', category: 'Defense',     stat: 'moveSpeedMult',      perRank: 0.08 },
  // ── Drones ───
  { id: 'drone_damage',       name: 'Drone Armament',      desc: 'Increase drone damage',                 icon: '🤖', category: 'Drones',      stat: 'droneDamageMult',    perRank: 0.25 },
  { id: 'drone_count',        name: 'Drone Bay Expansion', desc: 'Deploy one additional drone',           icon: '🛸', category: 'Drones',      stat: 'droneCountBonus',    perRank: 1 },
  // ── Economy ───
  { id: 'xp_boost',           name: 'Neural Amplifier',    desc: 'Gain bonus experience',                 icon: '🧠', category: 'Economy',     stat: 'xpMult',             perRank: 0.20 },
  { id: 'gold_boost',         name: 'Resource Extractor',  desc: 'Gain bonus gold from enemies',          icon: '💰', category: 'Economy',     stat: 'goldMult',           perRank: 0.20 },
  { id: 'pickup_radius',      name: 'Magnetic Field',      desc: 'Auto-collect pickups from distance',    icon: '🧲', category: 'Economy',     stat: 'pickupRadiusBonus',  perRank: 40 },
  { id: 'loot_quality',       name: 'Loot Scanner',        desc: 'Higher rarity equipment drops',         icon: '📦', category: 'Economy',     stat: 'lootQuality',        perRank: 0.10 },
  // ── Offense ───
  { id: 'explosion_radius',   name: 'Warhead Expander',    desc: 'Increase explosion AOE',                icon: '💣', category: 'Combat',      stat: 'explosionRadiusMult',perRank: 0.25 },
  { id: 'pierce',             name: 'Penetration Round',   desc: 'Projectiles pierce through enemies',    icon: '🔮', category: 'Combat',      stat: 'pierceBonus',        perRank: 1 },
  { id: 'homing',             name: 'Tracking System',     desc: 'Projectiles home toward enemies',       icon: '🎱', category: 'Combat',      stat: 'homingStrength',     perRank: 0.20 },
  { id: 'ricochet',           name: 'Ricochet Array',      desc: 'Projectiles bounce off enemies',        icon: '↩', category: 'Combat',      stat: 'ricochetBonus',      perRank: 1 },
  // ── Special ───
  { id: 'ruby_magnetism',     name: 'Ruby Magnetizer',     desc: 'Increase Ruby drop rate',               icon: '💎', category: 'Special',     stat: 'rubyDropMult',       perRank: 0.25 },
  { id: 'chest_quality',      name: 'Chest Enhancer',      desc: 'Improve chest rarity odds',             icon: '📫', category: 'Special',     stat: 'chestQuality',       perRank: 0.15 },
];

export const UPGRADE_MAP = Object.fromEntries(UPGRADE_TYPES.map(u => [u.id, u]));

// ── RARITY DEFINITIONS ────────────────────────────────────────────────────────

export const SHOP_RARITIES = {
  common:    { name: 'Common',    color: '#94a3b8', weight: 50 },
  rare:      { name: 'Rare',      color: '#3b82f6', weight: 30 },
  epic:      { name: 'Epic',      color: '#a855f7', weight: 15 },
  legendary: { name: 'Legendary', color: '#f59e0b', weight: 4  },
  mythic:    { name: 'Mythic',    color: '#ef4444', weight: 1  },
};

// ── COST TABLE ────────────────────────────────────────────────────────────────
// Cost per rank (1-indexed: costs[0] = rank 1 cost)

export const RANK_COSTS = [100, 250, 500, 1000, 2000];
export const MAX_RANK   = 5;

export function getRankCost(rank) {
  return RANK_COSTS[Math.min(rank - 1, MAX_RANK - 1)] ?? 2000;
}

export function getRankLabel(rank) {
  const labels = ['I', 'II', 'III', 'IV', 'V'];
  return labels[rank - 1] || 'V';
}

// ── RARITY ROLL ───────────────────────────────────────────────────────────────

function rollRarity(sessionMinutes = 0) {
  const lateGameBonus = Math.min(sessionMinutes / 30, 1); // 0→1 over 30min
  const weights = {
    common:    Math.max(50 - lateGameBonus * 20, 10),
    rare:      30,
    epic:      Math.min(15 + lateGameBonus * 10, 30),
    legendary: Math.min(4  + lateGameBonus * 8,  20),
    mythic:    Math.min(1  + lateGameBonus * 4,  10),
  };
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [rarity, w] of Object.entries(weights)) {
    roll -= w;
    if (roll <= 0) return rarity;
  }
  return 'common';
}

// ── SHOP GENERATION ───────────────────────────────────────────────────────────

export const SHOP_SIZE = 6;
export const SHOP_REFRESH_SECONDS = 25;

export function generateShopSlots(purchasedRanks = {}, sessionMinutes = 0) {
  const pool = [...UPGRADE_TYPES];
  const chosen = [];
  const used = new Set();

  for (let i = 0; i < SHOP_SIZE; i++) {
    const available = pool.filter(u => !used.has(u.id));
    if (available.length === 0) break;

    // Weighted random pick from available
    const pick = available[Math.floor(Math.random() * available.length)];
    used.add(pick.id);

    const currentRank = purchasedRanks[pick.id] ?? 0;
    const nextRank    = currentRank + 1;
    const maxed       = currentRank >= MAX_RANK;
    const rarity      = rollRarity(sessionMinutes);
    const cost        = getRankCost(nextRank);

    chosen.push({
      id:          pick.id,
      rarity,
      currentRank,
      nextRank:    maxed ? MAX_RANK : nextRank,
      maxed,
      cost:        maxed ? 0 : cost,
    });
  }

  return chosen;
}

// ── STAT COMPUTATION ──────────────────────────────────────────────────────────
// Given purchasedRanks map, return the flat bonus values for each stat.

export function computeShopStats(purchasedRanks = {}) {
  const stats = {};

  for (const [upgradeId, rank] of Object.entries(purchasedRanks)) {
    if (rank <= 0) continue;
    const def = UPGRADE_MAP[upgradeId];
    if (!def) continue;

    const value = def.perRank * rank;
    stats[def.stat] = (stats[def.stat] ?? 0) + value;
  }

  return stats;
}

// ── SHOP STATE MANAGER ────────────────────────────────────────────────────────
// Manages timer, slots, refresh, and purchase logic.
// Used by page.js and GameEngine.

export class ShopManager {
  constructor(purchasedRanks = {}) {
    this.purchasedRanks  = { ...purchasedRanks };
    this.slots           = [];
    this.refreshTimer    = SHOP_REFRESH_SECONDS;
    this.sessionMinutes  = 0;
    this.dirty           = false;   // true when purchasedRanks changed
    this._refresh();
  }

  _refresh() {
    this.slots        = generateShopSlots(this.purchasedRanks, this.sessionMinutes);
    this.refreshTimer = SHOP_REFRESH_SECONDS;
  }

  /** Call every frame. dt = delta seconds. Returns true if auto-refreshed. */
  tick(dt, sessionMinutes = 0) {
    this.sessionMinutes = sessionMinutes;
    this.refreshTimer -= dt;
    if (this.refreshTimer <= 0) {
      this._refresh();
      return true;
    }
    return false;
  }

  /** Player manually refreshes (costs gold? free for now). */
  forceRefresh() {
    this._refresh();
  }

  /**
   * Attempt to purchase a slot.
   * Returns { success, newGold, newRank, stat, gainedAmount } or { success: false, reason }
   */
  purchase(slotIndex, currentGold) {
    const slot = this.slots[slotIndex];
    if (!slot)             return { success: false, reason: 'invalid_slot' };
    if (slot.maxed)        return { success: false, reason: 'maxed' };
    if (currentGold < slot.cost) return { success: false, reason: 'insufficient_gold' };

    const def           = UPGRADE_MAP[slot.id];
    const newRank       = slot.nextRank;
    const newGold       = currentGold - slot.cost;
    const gainedAmount  = def.perRank;

    this.purchasedRanks[slot.id] = newRank;
    this.dirty = true;

    // Update the slot inline so UI reflects new rank immediately
    const maxed = newRank >= MAX_RANK;
    this.slots[slotIndex] = {
      ...slot,
      currentRank: newRank,
      nextRank:    maxed ? MAX_RANK : newRank + 1,
      maxed,
      cost:        maxed ? 0 : getRankCost(newRank + 1),
    };

    return {
      success: true,
      upgradeId: slot.id,
      stat: def.stat,
      newRank,
      newGold,
      gainedAmount,
    };
  }

  /** Serialize for save */
  serialize() {
    return { purchasedRanks: { ...this.purchasedRanks } };
  }

  /** Restore from save */
  hydrate(data) {
    if (data?.purchasedRanks) {
      this.purchasedRanks = { ...data.purchasedRanks };
      this._refresh();
    }
  }

  getStats() {
    return computeShopStats(this.purchasedRanks);
  }

  getTimerDisplay() {
    return Math.max(0, Math.ceil(this.refreshTimer));
  }

  getSlots() {
    return this.slots;
  }
}
