// constants/AbilityData.js — Complete ability database

// ─── ABILITY SLOT KEYS ────────────────────────────────────────────────────────
export const ABILITY_SLOTS = {
  ACTIVE_1:  'active1',
  ACTIVE_2:  'active2',
  PASSIVE_1: 'passive1',
  PASSIVE_2: 'passive2',
  PASSIVE_3: 'passive3',
  DRONE:     'drone',
  ULTIMATE:  'ultimate',
};

export const ABILITY_SLOT_LABELS = {
  active1:  'ACTIVE SLOT A',
  active2:  'ACTIVE SLOT B',
  passive1: 'PASSIVE SLOT A',
  passive2: 'PASSIVE SLOT B',
  passive3: 'PASSIVE SLOT C',
  drone:    'DRONE MODULE',
  ultimate: 'ULTIMATE',
};

export const ABILITY_SLOT_ICONS = {
  active1:  '⚡',
  active2:  '🔥',
  passive1: '🛡',
  passive2: '💎',
  passive3: '🌟',
  drone:    '🤖',
  ultimate: '☄️',
};

export const ABILITY_SLOT_HOTKEYS = {
  active1:  'Z',
  active2:  'X',
  passive1: null,
  passive2: null,
  passive3: null,
  drone:    null,
  ultimate: 'R',
};

// Human-readable type for each slot key
export const ABILITY_SLOT_TYPES = {
  active1:  'active',
  active2:  'active',
  passive1: 'passive',
  passive2: 'passive',
  passive3: 'passive',
  drone:    'drone',
  ultimate: 'ultimate',
};

// Which ability types can go in which slots
export const ABILITY_CATEGORY_SLOT_MAP = {
  active:   ['active1', 'active2'],
  passive:  ['passive1', 'passive2', 'passive3'],
  drone:    ['drone'],
  ultimate: ['ultimate', 'active1', 'active2'],
};

export const ABILITY_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'secret'];
export const ABILITY_RARITY_ORDER = { common:0, uncommon:1, rare:2, epic:3, legendary:4, mythic:5, secret:6 };

export const ABILITY_RARITY_COLORS = {
  common:    '#9ca3af',
  uncommon:  '#4ade80',
  rare:      '#60a5fa',
  epic:      '#c084fc',
  legendary: '#fbbf24',
  mythic:    '#ff6b35',
  secret:    '#ff00ff',
};

export const ABILITY_RARITY_GLOW = {
  common:    'rgba(156,163,175,0.25)',
  uncommon:  'rgba(74,222,128,0.3)',
  rare:      'rgba(96,165,250,0.35)',
  epic:      'rgba(192,132,252,0.4)',
  legendary: 'rgba(251,191,36,0.5)',
  mythic:    'rgba(255,107,53,0.6)',
  secret:    'rgba(255,0,255,0.7)',
};

export const ABILITY_RARITY_BEAM_HEIGHT = {
  common:    120,
  uncommon:  180,
  rare:      260,
  epic:      360,
  legendary: 480,
  mythic:    600,
  secret:    800,
};

export const ABILITY_SALVAGE_VALUE = {
  common:    30,
  uncommon:  80,
  rare:      200,
  epic:      500,
  legendary: 1200,
  mythic:    3000,
  secret:    10000,
};

// ─── THE ABILITY DATABASE ─────────────────────────────────────────────────────
export const ABILITY_DB = {

  // ════════ ACTIVE ABILITIES ════════════════════════════════════════════════

  ufo_tractor: {
    id: 'ufo_tractor',
    name: 'UFO Tractor Beam',
    type: 'active',
    rarity: 'legendary',
    cooldown: 45,
    duration: 4,
    icon: '🛸',
    desc: 'Summons an allied UFO that finds the largest enemy cluster, pulls them upward with a massive tractor beam, then drops them for huge AOE damage.',
    flavorText: '"They came in peace. They left in pieces."',
    effectKey: 'UFO_TRACTOR',
  },
  nuclear_meltdown: {
    id: 'nuclear_meltdown',
    name: 'Nuclear Meltdown',
    type: 'active',
    rarity: 'epic',
    cooldown: 30,
    duration: 5,
    icon: '☢️',
    desc: 'Releases an expanding radiation field dealing stacking DOT. Enemies that die explode, chaining to nearby foes.',
    flavorText: '"The atom does not negotiate."',
    effectKey: 'NUCLEAR_MELTDOWN',
  },
  solar_lance: {
    id: 'solar_lance',
    name: 'Solar Lance',
    type: 'active',
    rarity: 'legendary',
    cooldown: 35,
    duration: 3,
    icon: '☀️',
    desc: 'Charges a giant solar beam aimed at the highest-HP target. Damage ramps up while the beam is maintained.',
    flavorText: '"Forged from the heart of a dying star."',
    effectKey: 'SOLAR_LANCE',
  },
  orbital_strike: {
    id: 'orbital_strike',
    name: 'Orbital Strike',
    type: 'active',
    rarity: 'legendary',
    cooldown: 50,
    duration: 2.5,
    icon: '🎯',
    desc: 'Paints a targeting crosshair on the strongest enemy. After a 1.5-second warning, a tungsten rod obliterates the target with massive shockwave damage.',
    flavorText: '"From 400km up, no one can hear you scream."',
    effectKey: 'ORBITAL_STRIKE',
  },
  temporal_shockwave: {
    id: 'temporal_shockwave',
    name: 'Temporal Shockwave',
    type: 'active',
    rarity: 'epic',
    cooldown: 35,
    duration: 6,
    icon: '⏱️',
    desc: 'Sends an expanding time-distortion wave outward. All enemies and their bullets are slowed by 80% for the duration.',
    flavorText: '"Time is a river. This bends it."',
    effectKey: 'TEMPORAL_SHOCKWAVE',
  },
  emergency_repair: {
    id: 'emergency_repair',
    name: 'Emergency Repair',
    type: 'active',
    rarity: 'rare',
    cooldown: 45,
    duration: 2.5,
    icon: '🔧',
    desc: 'Instantly restores 30% of max HP and grants a 2.5-second invulnerability bubble that absorbs all incoming fire.',
    flavorText: '"Built-in contingency. Just in case."',
    effectKey: 'EMERGENCY_REPAIR',
  },
  chain_lightning: {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    type: 'active',
    rarity: 'epic',
    cooldown: 20,
    duration: 0.5,
    icon: '⚡',
    desc: 'Fires lightning that arcs between up to 5 nearby enemies. Damage falls off 25% per arc jump.',
    flavorText: '"First target guaranteed. The rest are collateral."',
    effectKey: 'CHAIN_LIGHTNING',
  },
  gravity_well: {
    id: 'gravity_well',
    name: 'Gravity Well',
    type: 'active',
    rarity: 'rare',
    cooldown: 25,
    duration: 3,
    icon: '🌀',
    desc: 'Spawns a gravitational singularity at your position that pulls all nearby enemies inward, dealing crush damage.',
    flavorText: '"Everything eventually falls."',
    effectKey: 'GRAVITY_WELL',
  },

  // ════════ ULTIMATE ABILITIES ══════════════════════════════════════════════

  singularity_core: {
    id: 'singularity_core',
    name: 'Singularity Core',
    type: 'ultimate',
    rarity: 'mythic',
    cooldown: 60,
    duration: 5,
    icon: '⚫',
    desc: 'Deploys a black hole that devours all nearby enemies. Bosses take 15% of their max HP as damage every second. Orbiting debris deals contact damage.',
    flavorText: '"Not even light escapes."',
    effectKey: 'SINGULARITY_CORE',
  },
  temporal_anchor: {
    id: 'temporal_anchor',
    name: 'Temporal Anchor',
    type: 'ultimate',
    rarity: 'mythic',
    cooldown: 70,
    duration: 6,
    icon: '⏮️',
    desc: 'Records your current position and HP. For up to 6 seconds, press R again to rewind — teleporting back and restoring the recorded HP.',
    flavorText: '"A safety net woven from time itself."',
    effectKey: 'TEMPORAL_ANCHOR',
  },
  god_machine: {
    id: 'god_machine',
    name: 'God Machine',
    type: 'ultimate',
    rarity: 'secret',
    cooldown: 90,
    duration: 8,
    icon: '⚙️',
    desc: 'For 8 seconds, your weapon fires in all 8 directions simultaneously at 200% damage. Unstoppable.',
    flavorText: '"What gods fear, you have become."',
    effectKey: 'GOD_MACHINE',
  },

  // ════════ PASSIVE ABILITIES ═══════════════════════════════════════════════

  veteran_hull: {
    id: 'veteran_hull',
    name: 'Veteran Hull',
    type: 'passive',
    rarity: 'uncommon',
    cooldown: 0,
    icon: '🩸',
    desc: 'Gain +1 Max HP for every 50 enemies killed. Stacks permanently during the run.',
    flavorText: '"Experience is a shield no armor can match."',
    effectKey: 'VETERAN_HULL',
  },
  tactical_processor: {
    id: 'tactical_processor',
    name: 'Tactical Processor',
    type: 'passive',
    rarity: 'rare',
    cooldown: 0,
    icon: '⚙️',
    desc: 'All ability cooldowns reduced by 25%. Grants access to Passive Slot C.',
    flavorText: '"Think faster. React faster. Win."',
    effectKey: 'TACTICAL_PROCESSOR',
  },
  quantum_magazine: {
    id: 'quantum_magazine',
    name: 'Quantum Magazine',
    type: 'passive',
    rarity: 'rare',
    cooldown: 0,
    icon: '🔋',
    desc: '+20% fire rate, +15% bullet damage. Bullets phase through one extra enemy.',
    flavorText: '"Bullets that exist in two states: loading and fired."',
    effectKey: 'QUANTUM_MAGAZINE',
  },
  drone_commander: {
    id: 'drone_commander',
    name: 'Drone Commander',
    type: 'passive',
    rarity: 'epic',
    cooldown: 0,
    icon: '🤖',
    desc: 'Summon +1 additional combat drone. All drone damage increased by 30%.',
    flavorText: '"A fleet needs a fleet commander."',
    effectKey: 'DRONE_COMMANDER',
  },
  treasure_scanner: {
    id: 'treasure_scanner',
    name: 'Treasure Scanner',
    type: 'passive',
    rarity: 'uncommon',
    cooldown: 0,
    icon: '📡',
    desc: '+40% pickup radius, +25% gold gain, increased chest loot quality.',
    flavorText: '"Find it before someone else does."',
    effectKey: 'TREASURE_SCANNER',
  },
  boss_hunter: {
    id: 'boss_hunter',
    name: 'Boss Hunter',
    type: 'passive',
    rarity: 'epic',
    cooldown: 0,
    icon: '🏹',
    desc: '+40% damage against bosses. Bosses drop one additional ability on death.',
    flavorText: '"Know your prey. Become their nightmare."',
    effectKey: 'BOSS_HUNTER',
  },
  overclock: {
    id: 'overclock',
    name: 'Overclock',
    type: 'passive',
    rarity: 'legendary',
    cooldown: 0,
    icon: '🌀',
    desc: '25% cooldown reduction. On kill, 8% chance to instantly reset all active ability cooldowns.',
    flavorText: '"Push it past the red line."',
    effectKey: 'OVERCLOCK',
  },
  double_cast: {
    id: 'double_cast',
    name: 'Double Cast',
    type: 'passive',
    rarity: 'mythic',
    cooldown: 0,
    icon: '♾️',
    desc: 'All active abilities trigger twice simultaneously with a 0.3-second stagger.',
    flavorText: '"Why once when twice is twice as good?"',
    effectKey: 'DOUBLE_CAST',
  },
  void_echo: {
    id: 'void_echo',
    name: 'Void Echo',
    type: 'passive',
    rarity: 'mythic',
    cooldown: 0,
    icon: '👁',
    desc: 'Each weapon shot spawns a shadow copy that deals 60% damage in the exact opposite direction.',
    flavorText: '"The void reflects everything back."',
    effectKey: 'VOID_ECHO',
  },

  // ════════ DRONE ABILITIES ═════════════════════════════════════════════════

  guardian_drones: {
    id: 'guardian_drones',
    name: 'Guardian Drones',
    type: 'drone',
    rarity: 'rare',
    cooldown: 0,
    icon: '🛡️',
    desc: 'Drones form a defensive screen, intercepting 35% of incoming enemy bullets.',
    flavorText: '"Defense through superior numbers."',
    effectKey: 'GUARDIAN_DRONES',
  },
  scavenger_drone: {
    id: 'scavenger_drone',
    name: 'Scavenger Drone',
    type: 'drone',
    rarity: 'uncommon',
    cooldown: 0,
    icon: '🧲',
    desc: 'Spawns a dedicated loot drone that automatically collects all XP and gold within a wide radius.',
    flavorText: '"Why chase loot when you can send a robot?"',
    effectKey: 'SCAVENGER_DRONE',
  },

  // ════════ SECRET ABILITIES ════════════════════════════════════════════════

  origin_protocol: {
    id: 'origin_protocol',
    name: 'Origin Protocol',
    type: 'passive',
    rarity: 'secret',
    cooldown: 0,
    icon: '🌌',
    desc: 'Every 100 kills, trigger a cosmic supernova dealing 2000 damage to ALL enemies on screen.',
    flavorText: '"In the beginning there was light. Then there was destruction."',
    effectKey: 'ORIGIN_PROTOCOL',
    source: 'Defeat 3 different bosses in a single run',
  },
  entropy_collapse: {
    id: 'entropy_collapse',
    name: 'Entropy Collapse',
    type: 'passive',
    rarity: 'secret',
    cooldown: 0,
    icon: '💀',
    desc: 'Once per run, when lethal damage would kill you, survive at 1 HP and gain 5 seconds of invulnerability.',
    flavorText: '"Fate is merely a suggestion."',
    effectKey: 'ENTROPY_COLLAPSE',
    source: 'Survive a boss fight with less than 10% HP',
  },
  the_last_signal: {
    id: 'the_last_signal',
    name: 'The Last Signal',
    type: 'passive',
    rarity: 'secret',
    cooldown: 0,
    icon: '📻',
    desc: 'Below 25% HP: deal 300% bonus damage, gain +40% movement speed, and abilities cost no cooldown.',
    flavorText: '"When all hope is lost, the signal becomes a weapon."',
    effectKey: 'THE_LAST_SIGNAL',
    source: 'Collect 10+ gear items in a single run',
  },
  cosmic_ascension: {
    id: 'cosmic_ascension',
    name: 'Cosmic Ascension',
    type: 'passive',
    rarity: 'secret',
    cooldown: 0,
    icon: '🌠',
    desc: 'Each boss killed permanently grants +8% damage, +5% speed, and +5% fire rate for this run.',
    flavorText: '"Rise through the ranks of the cosmos."',
    effectKey: 'COSMIC_ASCENSION',
    source: 'Kill a boss without taking any damage',
  },
};

// ─── ABILITY ID LISTS BY TYPE ─────────────────────────────────────────────────
export const ACTIVE_ABILITY_IDS = Object.values(ABILITY_DB)
  .filter(a => a.type === 'active').map(a => a.id);
export const ULTIMATE_ABILITY_IDS = Object.values(ABILITY_DB)
  .filter(a => a.type === 'ultimate').map(a => a.id);
export const PASSIVE_ABILITY_IDS = Object.values(ABILITY_DB)
  .filter(a => a.type === 'passive').map(a => a.id);
export const DRONE_ABILITY_IDS = Object.values(ABILITY_DB)
  .filter(a => a.type === 'drone').map(a => a.id);
export const SECRET_ABILITY_IDS = Object.values(ABILITY_DB)
  .filter(a => a.rarity === 'secret').map(a => a.id);

// ─── BOSS ABILITY DROP TABLES ─────────────────────────────────────────────────
export const BOSS_ABILITY_DROP_TABLES = {
  'Asteroid Titan': {
    count: 1,
    weights: { common:40, uncommon:35, rare:20, epic:5, legendary:0, mythic:0, secret:0 },
    bonusOnBossHunter: 1,
  },
  'Void Serpent': {
    count: 1,
    weights: { common:10, uncommon:25, rare:35, epic:25, legendary:5, mythic:0, secret:0 },
    bonusOnBossHunter: 1,
  },
  'Galactic Destroyer': {
    count: 2,
    weights: { common:5, uncommon:10, rare:25, epic:30, legendary:25, mythic:5, secret:0 },
    bonusOnBossHunter: 1,
  },
};

// ─── WAVE ABILITY RARITY TABLE (chest drops) ─────────────────────────────────
export const WAVE_ABILITY_RARITY_TABLE = [
  { minWave:1,  weights:{ common:60, uncommon:35, rare:5,  epic:0,  legendary:0, mythic:0, secret:0 } },
  { minWave:3,  weights:{ common:35, uncommon:35, rare:25, epic:5,  legendary:0, mythic:0, secret:0 } },
  { minWave:5,  weights:{ common:15, uncommon:30, rare:30, epic:20, legendary:5, mythic:0, secret:0 } },
  { minWave:8,  weights:{ common:5,  uncommon:15, rare:25, epic:30, legendary:22,mythic:3, secret:0 } },
  { minWave:12, weights:{ common:0,  uncommon:5,  rare:15, epic:35, legendary:35,mythic:10,secret:0 } },
];

// ─── INITIAL LOADOUT ──────────────────────────────────────────────────────────
export function getInitialAbilityLoadout() {
  return {
    active1:  null,
    active2:  null,
    passive1: null,
    passive2: null,
    passive3: null,
    drone:    null,
    ultimate: null,
  };
}

// ─── HELPER: check if ability can go in slot ──────────────────────────────────
export function isAbilityValidForSlot(ability, slotKey) {
  if (!ability || !slotKey) return false;
  const validSlots = ABILITY_CATEGORY_SLOT_MAP[ability.type] || [];
  return validSlots.includes(slotKey);
}
