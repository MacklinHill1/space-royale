// systems/EnemyData.js
// All enemy type definitions, tiers, and scaling tables.

export const ENEMY_TIER = { EASY: 'easy', MEDIUM: 'medium', HARD: 'hard' };

// Base stats — scaled at runtime by wave/time
export const ENEMY_TYPES = {

  // ─── EASY (0-5 min) ───────────────────────────────────────────────────────
  fighter: {
    tier:'easy', hp:22, radius:11, speed:1.5, damage:8,
    xpDrop:10, goldDrop:5, fireRate:0,
    behavior:'chase', color:'#ef4444', glowColor:'#ef444466',
    spawnWeight:30,
  },
  scout: {
    tier:'easy', hp:14, radius:9, speed:2.6, damage:6,
    xpDrop:12, goldDrop:6, fireRate:0,
    behavior:'chase_fast', color:'#f87171', glowColor:'#f8717166',
    spawnWeight:25,
  },
  ufo_scout: {
    tier:'easy', hp:20, radius:14, speed:1.3, damage:7,
    xpDrop:15, goldDrop:8, fireRate:120,
    behavior:'orbit', color:'#22d3ee', glowColor:'#22d3ee66',
    spawnWeight:20,
  },
  drone_swarm: {
    tier:'easy', hp:8, radius:7, speed:2.0, damage:4,
    xpDrop:6, goldDrop:3, fireRate:0,
    behavior:'swarm', color:'#facc15', glowColor:'#facc1566',
    spawnWeight:40, spawnCount:4,       // spawns in groups
  },
  interceptor: {
    tier:'easy', hp:16, radius:10, speed:2.8, damage:10,
    xpDrop:16, goldDrop:9, fireRate:0,
    behavior:'dash', color:'#f97316', glowColor:'#f9731666',
    spawnWeight:22,
  },
  mining_drone: {
    tier:'easy', hp:55, radius:17, speed:0.7, damage:12,
    xpDrop:28, goldDrop:18, fireRate:0,
    behavior:'chase', color:'#78716c', glowColor:'#78716c66',
    spawnWeight:18,
  },

  // ─── MEDIUM (5-10 min) ────────────────────────────────────────────────────
  frigate: {
    tier:'medium', hp:95, radius:22, speed:0.9, damage:14,
    xpDrop:55, goldDrop:35, fireRate:80,
    behavior:'chase', color:'#6366f1', glowColor:'#6366f166',
    spawnWeight:28,
  },
  assault_ufo: {
    tier:'medium', hp:65, radius:19, speed:1.2, damage:16,
    xpDrop:50, goldDrop:30, fireRate:60,
    behavior:'orbit', color:'#0891b2', glowColor:'#0891b266',
    spawnWeight:24,
  },
  shield_drone: {
    tier:'medium', hp:50, radius:14, speed:1.4, damage:9,
    xpDrop:45, goldDrop:28, fireRate:0,
    behavior:'support', color:'#34d399', glowColor:'#34d39966',
    spawnWeight:18,
  },
  missile_cruiser: {
    tier:'medium', hp:75, radius:21, speed:1.0, damage:24,
    xpDrop:65, goldDrop:40, fireRate:110,
    behavior:'snipe', color:'#f59e0b', glowColor:'#f59e0b66',
    spawnWeight:20,
  },
  heavy_interceptor: {
    tier:'medium', hp:60, radius:15, speed:2.0, damage:15,
    xpDrop:60, goldDrop:38, fireRate:0,
    behavior:'dash', color:'#c084fc', glowColor:'#c084fc66',
    spawnWeight:22,
  },
  carrier: {
    tier:'medium', hp:130, radius:29, speed:0.55, damage:8,
    xpDrop:90, goldDrop:60, fireRate:200,
    behavior:'carrier', color:'#475569', glowColor:'#47556966',
    spawnWeight:12,
  },

  // ─── HARD (10+ min) ───────────────────────────────────────────────────────
  battlecruiser: {
    tier:'hard', hp:300, radius:33, speed:0.7, damage:22,
    xpDrop:130, goldDrop:90, fireRate:55,
    behavior:'chase', color:'#1e40af', glowColor:'#1e40af88',
    spawnWeight:25,
  },
  void_harvester: {
    tier:'hard', hp:190, radius:25, speed:1.1, damage:18,
    xpDrop:110, goldDrop:75, fireRate:90,
    behavior:'orbit', color:'#7c3aed', glowColor:'#7c3aed88',
    spawnWeight:22,
  },
  dreadnought: {
    tier:'hard', hp:520, radius:42, speed:0.45, damage:32,
    xpDrop:220, goldDrop:150, fireRate:45,
    behavior:'chase', color:'#1e293b', glowColor:'#334155cc',
    spawnWeight:10,
  },
  sentinel: {
    tier:'hard', hp:150, radius:19, speed:0.8, damage:38,
    xpDrop:100, goldDrop:65, fireRate:75,
    behavior:'snipe', color:'#0f766e', glowColor:'#0f766e88',
    spawnWeight:20,
  },
  warp_hunter: {
    tier:'hard', hp:170, radius:21, speed:1.8, damage:26,
    xpDrop:120, goldDrop:80, fireRate:70,
    behavior:'warp', color:'#6d28d9', glowColor:'#6d28d988',
    spawnWeight:18,
  },
  ancient_construct: {
    tier:'hard', hp:400, radius:37, speed:0.4, damage:28,
    xpDrop:180, goldDrop:120, fireRate:65,
    behavior:'chase', color:'#292524', glowColor:'#78716ccc',
    spawnWeight:12,
  },
};

// Elite multipliers — applied on top of base stats
export const ELITE_MULT = {
  hp:      2.2,
  damage:  1.6,
  speed:   1.15,
  xpDrop:  2.5,
  goldDrop:3.0,
  radius:  1.3,
};

// HP and damage scaling per wave (applied multiplicatively)
export function getWaveScale(wave) {
  return 1 + (wave - 1) * 0.13;
}

// Returns { easyW, mediumW, hardW, eliteChance, spawnBudget, spawnInterval }
// minutes = sessionTime in seconds / 60
export function getDirectorParams(minutes) {
  const m = Math.min(minutes, 30);

  // Budget: enemies allowed in the world at once
  const budget = Math.min(3 + m * 1.8, 60);
  // Spawn interval: frames between spawn checks
  const spawnInterval = Math.max(8, 55 - m * 1.5);

  // Phase weights
  let easyW, mediumW, hardW;
  if (m < 2)       { easyW=1.00; mediumW=0.00; hardW=0.00; }
  else if (m < 5)  { easyW=0.85; mediumW=0.15; hardW=0.00; }
  else if (m < 8)  { easyW=0.60; mediumW=0.40; hardW=0.00; }
  else if (m < 12) { easyW=0.28; mediumW=0.55; hardW=0.17; }
  else if (m < 17) { easyW=0.10; mediumW=0.45; hardW=0.45; }
  else             { easyW=0.00; mediumW=0.25; hardW=0.75; }

  const eliteChance = Math.min(0.03 + m * 0.007, 0.20);

  return { budget: Math.floor(budget), spawnInterval: Math.floor(spawnInterval), easyW, mediumW, hardW, eliteChance };
}

// Pick a random enemy type given tier weights
export function rollEnemyType(easyW, mediumW, hardW) {
  const r = Math.random();
  let tier;
  if (r < easyW) tier = 'easy';
  else if (r < easyW + mediumW) tier = 'medium';
  else tier = 'hard';

  const pool = Object.entries(ENEMY_TYPES).filter(([,v]) => v.tier === tier);
  if (pool.length === 0) return 'fighter';
  // Weighted selection
  const totalWeight = pool.reduce((s, [,v]) => s + (v.spawnWeight || 10), 0);
  let pick = Math.random() * totalWeight;
  for (const [key, v] of pool) {
    pick -= (v.spawnWeight || 10);
    if (pick <= 0) return key;
  }
  return pool[pool.length-1][0];
}

// Formation definitions for late-game (15+ min)
export const FORMATIONS = [
  { name:'escort',   types:['dreadnought','battlecruiser','battlecruiser'], positions:[{x:0,y:0},{x:-80,y:60},{x:80,y:60}] },
  { name:'swarm',    types:['drone_swarm','drone_swarm','drone_swarm','drone_swarm','drone_swarm','drone_swarm','interceptor','interceptor'], positions:null }, // random arc
  { name:'wedge',    types:['frigate','frigate','battlecruiser','heavy_interceptor','heavy_interceptor'], positions:null },
  { name:'pincer',   types:['warp_hunter','sentinel','sentinel','warp_hunter'], positions:null },
];
