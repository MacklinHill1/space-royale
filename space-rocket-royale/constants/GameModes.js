// constants/GameModes.js
// All game mode definitions, planet environments, and mode-specific rules.

export const PLANET_ENVIRONMENTS = [
  {
    id: 'ice_world',
    name: 'Ice World',
    accentColor: '#7dd3fc',
    bgTint: 'rgba(12,26,46,0.7)',
    enemyPool: ['scout', 'fighter', 'heavy_interceptor', 'frigate'],
    bossId: 'galactic_destroyer',
    lootBonus: { equipRarity: ['common','uncommon','rare'] },
    description: 'Frozen tundra drifting between stars. Enemies move slow but hit hard.',
  },
  {
    id: 'volcanic',
    name: 'Volcanic Planet',
    accentColor: '#f97316',
    bgTint: 'rgba(26,8,0,0.7)',
    enemyPool: ['interceptor', 'battlecruiser', 'dreadnought', 'missile_cruiser'],
    bossId: 'asteroid_titan',
    lootBonus: { equipRarity: ['uncommon','rare','epic'] },
    description: 'Magma fields and lava storms. Enemies are enraged and fast.',
  },
  {
    id: 'mechanical',
    name: 'Mechanical World',
    accentColor: '#94a3b8',
    bgTint: 'rgba(10,15,26,0.7)',
    enemyPool: ['frigate', 'carrier', 'ancient_construct', 'sentinel'],
    bossId: 'orbital_core',
    lootBonus: { equipRarity: ['rare','epic'] },
    description: 'A dead world of machines. Automated defenses never stop.',
  },
  {
    id: 'void_planet',
    name: 'Void Planet',
    accentColor: '#a855f7',
    bgTint: 'rgba(8,0,15,0.7)',
    enemyPool: ['void_harvester', 'warp_hunter', 'sentinel', 'warp_hunter'],
    bossId: 'star_devourer',
    lootBonus: { equipRarity: ['epic','legendary'] },
    description: 'Space itself is unstable. Enemies teleport and warp.',
  },
  {
    id: 'hive_planet',
    name: 'Alien Hive Planet',
    accentColor: '#4ade80',
    bgTint: 'rgba(0,26,8,0.7)',
    enemyPool: ['drone_swarm', 'shield_drone', 'assault_ufo', 'carrier'],
    bossId: 'hive_queen',
    lootBonus: { equipRarity: ['uncommon','rare','epic'], abilityChanceBonus: 0.2 },
    description: 'A living world. Everything is the hive. Destroy it all.',
  },
];

// ─── DIFFICULTY RATINGS ───────────────────────────────────────────────────────
// 1 = Beginner, 5 = Extreme

export const GAME_MODES = [
  // ── CLASSIC ─────────────────────────────────────────────────────────────────
  {
    id: 'classic',
    name: 'Classic',
    icon: '🌌',
    tagline: 'Survive as long as possible',
    description: 'The core experience. Face endless waves of increasingly powerful enemies and bosses. Difficulty scales infinitely. How long can you last?',
    difficulty: 'Scales infinitely',
    difficultyRating: 3,
    rewards: ['Standard loot', 'All boss types', 'Continuous scaling'],
    recommended: 'All players',
    color: '#7c3aed',
    accentColor: '#c4b5fd',
    unlocked: true,
    bgStyle: 'classic',

    rules: {
      infiniteSurvival: true,
      bossInterval: 60,
      spawnBudgetMult: 1.0,
      eliteFreqMult: 1.0,
      xpMult: 1.0,
      goldMult: 1.0,
      equipDropMult: 1.0,
      abilityDropMult: 1.0,
      rubyDropMult: 1.0,
    },
  },

  // ── RAID BOSSES ──────────────────────────────────────────────────────────────
  {
    id: 'raid_bosses',
    name: 'Raid Bosses',
    icon: '💀',
    tagline: 'Hunt the most powerful bosses in the galaxy',
    description: 'Minimal normal enemies. Pure boss combat. Each boss defeated unlocks a stronger one. Premium loot and exclusive raid rewards.',
    difficulty: 'Hard',
    difficultyRating: 4,
    rewards: ['2× equipment drops', '2× ability drops', 'Exclusive boss loot', 'Higher rarity tiers', 'Ruby bonuses'],
    recommended: 'Experienced players',
    color: '#ef4444',
    accentColor: '#fca5a5',
    unlocked: true,
    bgStyle: 'raid',

    rules: {
      bossInterval: 18,
      spawnBudgetMult: 0.15,
      eliteFreqMult: 0.3,
      xpMult: 1.5,
      goldMult: 2.0,
      equipDropMult: 2.5,
      abilityDropMult: 2.0,
      rubyDropMult: 3.0,
      raidMode: true,
      raidBossLootBonus: true,
    },
  },

  // ── PLANET ASSAULT ───────────────────────────────────────────────────────────
  {
    id: 'planet_assault',
    name: 'Planet Assault',
    icon: '🪐',
    tagline: 'Invade five hostile worlds',
    description: 'Assault five unique planets, each with distinct enemies, environments, and a powerful world boss. Clear all five to win.',
    difficulty: 'Medium → Hard',
    difficultyRating: 3,
    rewards: ['Planet-specific loot', 'Unique boss drops', 'Environment bonuses'],
    recommended: 'Intermediate players',
    color: '#0891b2',
    accentColor: '#7dd3fc',
    unlocked: true,
    bgStyle: 'planet',

    rules: {
      bossInterval: 999,      // bosses spawn on planet clear
      spawnBudgetMult: 1.0,
      eliteFreqMult: 0.8,
      xpMult: 1.2,
      goldMult: 1.2,
      equipDropMult: 1.3,
      abilityDropMult: 1.2,
      rubyDropMult: 1.5,
      planetMode: true,
      planetDuration: 120,    // seconds per planet
    },
  },

  // ── ALIEN INVASION ───────────────────────────────────────────────────────────
  {
    id: 'alien_invasion',
    name: 'Alien Invasion',
    icon: '👽',
    tagline: 'Survive the swarm or be consumed',
    description: 'Absurd enemy counts arrive in organized invasion waves. XP gains are massive. Invasion commanders appear every 3 waves. Survive the flood.',
    difficulty: 'Hard',
    difficultyRating: 4,
    rewards: ['Massive XP', 'High kill streaks', 'Invasion commander loot'],
    recommended: 'Experienced players',
    color: '#16a34a',
    accentColor: '#86efac',
    unlocked: true,
    bgStyle: 'invasion',

    rules: {
      bossInterval: 999,
      spawnBudgetMult: 3.5,
      eliteFreqMult: 0.5,
      xpMult: 3.0,
      goldMult: 2.0,
      equipDropMult: 0.6,
      abilityDropMult: 0.6,
      rubyDropMult: 1.2,
      invasionMode: true,
      invasionWaveDuration: 30,   // seconds per wave
      commanderEveryNWaves: 3,
    },
  },

  // ── GALACTIC DEFENSE ─────────────────────────────────────────────────────────
  {
    id: 'galactic_defense',
    name: 'Galactic Defense',
    icon: '🛡️',
    tagline: 'Protect the space station at all costs',
    description: 'A space station needs your protection. Enemies target the station directly. Lose if it falls. Repair kits drop from enemies. Survive all waves.',
    difficulty: 'Medium',
    difficultyRating: 3,
    rewards: ['Defense bonuses', 'Station repair loot', 'Wave completion rewards'],
    recommended: 'All players',
    color: '#1d4ed8',
    accentColor: '#93c5fd',
    unlocked: true,
    bgStyle: 'defense',

    rules: {
      bossInterval: 90,
      spawnBudgetMult: 1.2,
      eliteFreqMult: 0.9,
      xpMult: 1.3,
      goldMult: 1.5,
      equipDropMult: 1.2,
      abilityDropMult: 1.0,
      rubyDropMult: 1.3,
      defenseMode: true,
      stationMaxHp: 500,
      stationDamagePerEnemy: 8,
      repairKitDrop: 0.08,       // 8% chance per enemy kill
      repairAmount: 40,
    },
  },

  // ── BOUNTY HUNTER ────────────────────────────────────────────────────────────
  {
    id: 'bounty_hunter',
    name: 'Bounty Hunter',
    icon: '🎯',
    tagline: 'Track down and eliminate elite targets',
    description: 'Special bounty targets spawn across the map. Find them, eliminate them, and claim their premium loot and Ruby rewards. Targets grow stronger over time.',
    difficulty: 'Medium',
    difficultyRating: 2,
    rewards: ['Premium bounty loot', 'Ruby rewards', 'Exclusive target drops'],
    recommended: 'All players',
    color: '#b45309',
    accentColor: '#fbbf24',
    unlocked: true,
    bgStyle: 'bounty',

    rules: {
      bossInterval: 999,
      spawnBudgetMult: 0.6,
      eliteFreqMult: 0.4,
      xpMult: 1.0,
      goldMult: 2.5,
      equipDropMult: 1.8,
      abilityDropMult: 1.5,
      rubyDropMult: 2.0,
      bountyMode: true,
      bountyInterval: 40,        // seconds between bounty spawns
      bountyGoldBonus: 500,
      bountyRubyReward: [5, 20],
    },
  },

  // ── COSMIC RIFT ───────────────────────────────────────────────────────────────
  {
    id: 'cosmic_rift',
    name: 'Cosmic Rift',
    icon: '🌀',
    tagline: 'Reality itself is breaking apart',
    description: 'Endgame mode. Reality instability grows over time. Random modifiers apply every 60 seconds — gravity shifts, time distortion, enemy mutations. High risk, massive reward.',
    difficulty: 'Extreme',
    difficultyRating: 5,
    rewards: ['Highest rarity chances', 'Mythic/Secret drops', 'Max Ruby rewards'],
    recommended: 'Expert players',
    color: '#9333ea',
    accentColor: '#d946ef',
    unlocked: true,
    bgStyle: 'rift',

    rules: {
      bossInterval: 45,
      spawnBudgetMult: 1.5,
      eliteFreqMult: 2.0,
      xpMult: 2.0,
      goldMult: 2.5,
      equipDropMult: 2.0,
      abilityDropMult: 2.5,
      rubyDropMult: 4.0,
      riftMode: true,
      riftModifierInterval: 60,
    },
  },

  // ── VOID EXPEDITION ───────────────────────────────────────────────────────────
  {
    id: 'void_expedition',
    name: 'Void Expedition',
    icon: '🕳️',
    tagline: 'Descend deeper into the Void',
    description: 'Roguelike progression. Travel deeper into void stages — each stage stronger enemies, stronger bosses, better loot. Reach the Void Lords for ultimate rewards.',
    difficulty: 'Hard',
    difficultyRating: 4,
    rewards: ['Escalating loot quality', 'Void-exclusive drops', 'Void Lord rewards'],
    recommended: 'Experienced players',
    color: '#4c1d95',
    accentColor: '#a78bfa',
    unlocked: true,
    bgStyle: 'void',

    rules: {
      bossInterval: 999,          // stage-based
      spawnBudgetMult: 1.0,
      eliteFreqMult: 1.0,
      xpMult: 1.5,
      goldMult: 1.5,
      equipDropMult: 1.5,
      abilityDropMult: 1.5,
      rubyDropMult: 2.0,
      voidMode: true,
      stageDuration: 90,          // seconds per stage
      stagesBeforeVoidLord: 5,
    },
  },

  // ── HIVE WAR ─────────────────────────────────────────────────────────────────
  {
    id: 'hive_war',
    name: 'Hive War',
    icon: '🐝',
    tagline: 'Destroy the alien hive from within',
    description: 'Hive nests spawn structures that continuously produce enemies. Destroy nests to weaken the swarm. Hive Queens appear periodically. Eradicate the hive.',
    difficulty: 'Hard',
    difficultyRating: 4,
    rewards: ['Nest destruction rewards', 'Hive-exclusive loot', 'Queen drops'],
    recommended: 'Experienced players',
    color: '#15803d',
    accentColor: '#4ade80',
    unlocked: true,
    bgStyle: 'hive',

    rules: {
      bossInterval: 120,
      spawnBudgetMult: 2.0,
      eliteFreqMult: 0.3,
      xpMult: 1.4,
      goldMult: 1.2,
      equipDropMult: 1.0,
      abilityDropMult: 1.3,
      rubyDropMult: 1.5,
      hiveMode: true,
      nestSpawnInterval: 45,
      nestMaxCount: 4,
      nestHp: 150,
    },
  },

  // ── ARENA CHALLENGE ───────────────────────────────────────────────────────────
  {
    id: 'arena_challenge',
    name: 'Arena Challenge',
    icon: '⚔️',
    tagline: 'Clear the arena. Round by round.',
    description: 'Fixed arena. Clear increasingly difficult rounds. Every 5 rounds = Elite round. Every 10 = Boss round. Every 15 = Free reward round. How far can you go?',
    difficulty: 'Medium → Extreme',
    difficultyRating: 3,
    rewards: ['Round completion rewards', 'Boss round loot', 'Free shop refreshes'],
    recommended: 'All players',
    color: '#c2410c',
    accentColor: '#fb923c',
    unlocked: true,
    bgStyle: 'arena',

    rules: {
      bossInterval: 999,          // round-based
      spawnBudgetMult: 0.8,
      eliteFreqMult: 1.0,
      xpMult: 1.2,
      goldMult: 1.3,
      equipDropMult: 1.2,
      abilityDropMult: 1.2,
      rubyDropMult: 1.5,
      arenaMode: true,
      enemiesPerRound: 12,
      roundEliteMultiplier: 5,   // elite round every N rounds
      roundBossMultiplier: 10,   // boss round every N rounds
      roundRewardMultiplier: 15, // reward round every N rounds
    },
  },

  // ── COSMIC HUNT ───────────────────────────────────────────────────────────────
  {
    id: 'cosmic_hunt',
    name: 'Cosmic Hunt',
    icon: '🔭',
    tagline: 'Hunt the legendary world bosses',
    description: 'Massive map. Legendary world bosses roam the cosmos. Track them down, face them in combat, claim Mythic gear and massive Ruby rewards. Three active at once.',
    difficulty: 'Extreme',
    difficultyRating: 5,
    rewards: ['Mythic gear', 'Secret items', 'Massive Ruby drops', 'Exclusive world boss loot'],
    recommended: 'Expert players',
    color: '#1e3a8a',
    accentColor: '#38bdf8',
    unlocked: true,
    bgStyle: 'hunt',

    rules: {
      bossInterval: 999,          // world boss spawns on timer
      spawnBudgetMult: 0.7,
      eliteFreqMult: 1.5,
      xpMult: 2.5,
      goldMult: 3.0,
      equipDropMult: 3.0,
      abilityDropMult: 2.0,
      rubyDropMult: 6.0,
      huntMode: true,
      worldBossCount: 3,
      worldBossRespawnDelay: 60,
      worldBossRoamRadius: 1200,
    },
  },

  // ── ENDLESS BOSS RUSH ─────────────────────────────────────────────────────────
  {
    id: 'endless_boss_rush',
    name: 'Endless Boss Rush',
    icon: '⚡',
    tagline: 'Boss after boss. No end in sight.',
    description: 'No normal enemy waves. Only bosses. Each kill triggers the next, harder boss. Reward drops between encounters. Survive as many as you can.',
    difficulty: 'Hard → Extreme',
    difficultyRating: 4,
    rewards: ['Boss-only loot', 'Escalating rewards', 'Rush-exclusive drops'],
    recommended: 'Experienced players',
    color: '#d97706',
    accentColor: '#fde68a',
    unlocked: true,
    bgStyle: 'rush',

    rules: {
      bossInterval: 5,            // essentially immediate after kill
      spawnBudgetMult: 0,         // no normal enemies
      eliteFreqMult: 0,
      xpMult: 2.0,
      goldMult: 2.0,
      equipDropMult: 2.0,
      abilityDropMult: 2.0,
      rubyDropMult: 5.0,
      rushMode: true,
      rewardAfterEachBoss: true,
    },
  },
];

export const MODE_MAP = Object.fromEntries(GAME_MODES.map(m => [m.id, m]));

export function getModeRules(modeId) {
  return MODE_MAP[modeId]?.rules || GAME_MODES[0].rules;
}

export function getModeInitialState(modeId) {
  const base = {
    modeId,
    objectiveText: '',
    objectiveProgress: 0,
    objectiveMax: 0,
  };

  switch (modeId) {
    case 'planet_assault':
      return { ...base, currentPlanet: 0, planetTimer: getModeRules(modeId).planetDuration, planetCleared: false };
    case 'galactic_defense':
      return { ...base, stationHp: getModeRules(modeId).stationMaxHp, stationMaxHp: getModeRules(modeId).stationMaxHp, waveNumber: 0 };
    case 'bounty_hunter':
      return { ...base, bountyTimer: getModeRules(modeId).bountyInterval, bountiesCollected: 0, activeBounties: [] };
    case 'void_expedition':
      return { ...base, stage: 1, stageTimer: getModeRules(modeId).stageDuration, stageEnemiesKilled: 0 };
    case 'hive_war':
      return { ...base, nestsDestroyed: 0, hiveNestTimer: getModeRules(modeId).nestSpawnInterval };
    case 'arena_challenge':
      return { ...base, round: 1, roundEnemiesRemaining: getModeRules(modeId).enemiesPerRound, roundPhase: 'fighting', roundReady: false };
    case 'cosmic_rift':
      return { ...base, riftModTimer: 60, currentModifier: null, instability: 0 };
    case 'alien_invasion':
      return { ...base, invasionWave: 1, waveTimer: getModeRules(modeId).invasionWaveDuration, commandersDefeated: 0 };
    case 'raid_bosses':
      return { ...base, raidBossesDefeated: 0 };
    case 'cosmic_hunt':
      return { ...base, worldBossesHunted: 0, worldBossRespawnTimer: 0 };
    case 'endless_boss_rush':
      return { ...base, rushBossesDefeated: 0, betweenBosses: false, rewardTimer: 0 };
    default:
      return base;
  }
}

// Cosmic Rift modifiers
export const RIFT_MODIFIERS = [
  { id: 'gravity_well',    name: 'Gravity Well',     desc: 'Enemies pulled toward center', icon: '🌀', effect: 'gravity' },
  { id: 'time_slow',       name: 'Time Dilation',    desc: 'Everything slows by 30%',       icon: '⏱',  effect: 'slow' },
  { id: 'enemy_rage',      name: 'Enemy Rage',        desc: 'All enemies deal 2x damage',   icon: '😡', effect: 'rage' },
  { id: 'loot_rain',       name: 'Loot Rain',         desc: 'Double loot drops this phase', icon: '💰', effect: 'loot' },
  { id: 'void_storm',      name: 'Void Storm',        desc: 'Random damage pulses every 3s',icon: '⚡', effect: 'storm' },
  { id: 'mass_elite',      name: 'Elite Surge',       desc: 'All enemies become elites',    icon: '👑', effect: 'elite' },
  { id: 'healing_zone',    name: 'Healing Zone',      desc: 'Regen 5 HP/sec',               icon: '💚', effect: 'regen' },
  { id: 'speed_boost',     name: 'Hyper Drive',       desc: 'Player +80% movement speed',   icon: '🚀', effect: 'speed' },
];

// World boss definitions for Cosmic Hunt
export const WORLD_BOSSES = [
  { id: 'planet_eater',      name: 'Planet Eater',      color: '#292524', accent: '#fbbf24', radius: 90, hpBase: 5000, xpDrop: 2000, goldDrop: 2000, rubyDrop: [100, 250], chestTier: 'COSMIC_VAULT' },
  { id: 'void_leviathan',    name: 'Void Leviathan',    color: '#0f0f0f', accent: '#a855f7', radius: 80, hpBase: 4500, xpDrop: 1800, goldDrop: 1800, rubyDrop: [80, 200],  chestTier: 'COSMIC_VAULT' },
  { id: 'cosmic_serpent',    name: 'Cosmic Serpent',    color: '#4c1d95', accent: '#c4b5fd', radius: 70, hpBase: 4000, xpDrop: 1600, goldDrop: 1600, rubyDrop: [60, 180],  chestTier: 'MYTHIC_RELIC' },
  { id: 'stellar_colossus',  name: 'Stellar Colossus',  color: '#1e3a5f', accent: '#38bdf8', radius: 95, hpBase: 6000, xpDrop: 2500, goldDrop: 2500, rubyDrop: [150, 500], chestTier: 'COSMIC_VAULT' },
];

export default GAME_MODES;
