// constants/EquipmentData.js  — Full equipment data: 7 rarities, all gear categories

// ─── EQUIPMENT SLOT KEYS ─────────────────────────────────────────────────────
export const EQUIP_SLOTS = {
  WEAPON:   'weapon',
  ARMOR:    'armor',
  ENGINE:   'engine',
  REACTOR:  'reactor',
  SHIELD:   'shield',
  DRONE:    'drone',
  MODULE_A: 'module_a',
  MODULE_B: 'module_b',
  MODULE_C: 'module_c',
};

export const SLOT_LABELS = {
  weapon:   'WEAPON SYSTEM',
  armor:    'HULL ARMOR',
  engine:   'ENGINE CORE',
  reactor:  'REACTOR',
  shield:   'SHIELD MATRIX',
  drone:    'DRONE BAY',
  module_a: 'MODULE SLOT Α',
  module_b: 'MODULE SLOT Β',
  module_c: 'MODULE SLOT Γ',
};

export const SLOT_ICONS = {
  weapon:   '🔫',
  armor:    '🛡️',
  engine:   '🚀',
  reactor:  '⚡',
  shield:   '🔵',
  drone:    '🤖',
  module_a: '💾',
  module_b: '💾',
  module_c: '💾',
};

// ─── GEAR CATEGORIES ─────────────────────────────────────────────────────────
export const GEAR_CATEGORIES = {
  WEAPON:  'weapon',
  ARMOR:   'armor',
  ENGINE:  'engine',
  REACTOR: 'reactor',
  SHIELD:  'shield',
  DRONE:   'drone',
  MODULE:  'module',
};

export const CATEGORY_SLOT_MAP = {
  weapon:  ['weapon'],
  armor:   ['armor'],
  engine:  ['engine'],
  reactor: ['reactor'],
  shield:  ['shield'],
  drone:   ['drone'],
  module:  ['module_a', 'module_b', 'module_c'],
};

// ─── RARITIES ────────────────────────────────────────────────────────────────
export const RARITIES = {
  COMMON:    'common',
  UNCOMMON:  'uncommon',
  RARE:      'rare',
  EPIC:      'epic',
  LEGENDARY: 'legendary',
  MYTHIC:    'mythic',
  SECRET:    'secret',
};

export const RARITY_ORDER = {
  common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5, secret: 6,
};

export const RARITY_COLORS = {
  common:    '#9ca3af',
  uncommon:  '#4ade80',
  rare:      '#60a5fa',
  epic:      '#c084fc',
  legendary: '#fbbf24',
  mythic:    '#ff6b35',
  secret:    '#ff00ff',
};

export const RARITY_GLOW = {
  common:    'rgba(156,163,175,0.25)',
  uncommon:  'rgba(74,222,128,0.30)',
  rare:      'rgba(96,165,250,0.35)',
  epic:      'rgba(192,132,252,0.40)',
  legendary: 'rgba(251,191,36,0.50)',
  mythic:    'rgba(255,107,53,0.60)',
  secret:    'rgba(255,0,255,0.70)',
};

export const RARITY_BEAM_HEIGHT = {
  common: 80, uncommon: 130, rare: 200, epic: 300, legendary: 420, mythic: 560, secret: 800,
};

export const RARITY_STAT_MULT = {
  common: 1.00, uncommon: 1.25, rare: 1.60, epic: 2.10, legendary: 2.80, mythic: 3.80, secret: 5.50,
};

export const RARITY_AFFIX_COUNT = {
  common: 0, uncommon: 1, rare: 1, epic: 2, legendary: 3, mythic: 4, secret: 5,
};

export const RARITY_SALVAGE_VALUE = {
  common: 50, uncommon: 120, rare: 300, epic: 700, legendary: 1500, mythic: 4000, secret: 10000,
};

// ─── STAT DEFINITIONS ────────────────────────────────────────────────────────
export const STATS = {
  DAMAGE:           'damage',
  FIRE_RATE:        'fireRate',
  PROJECTILE_SPEED: 'projectileSpeed',
  CRIT_CHANCE:      'critChance',
  CRIT_DAMAGE:      'critDamage',
  BOSS_DAMAGE:      'bossDamage',
  ELITE_DAMAGE:     'eliteDamage',
  ABILITY_POWER:    'abilityPower',
  MAX_HP:           'maxHp',
  ARMOR:            'armor',
  SHIELD_CAPACITY:  'shieldCapacity',
  SHIELD_REGEN:     'shieldRegen',
  MOVE_SPEED:       'moveSpeed',
  DASH_DISTANCE:    'dashDistance',
  XP_GAIN:          'xpGain',
  COIN_GAIN:        'coinGain',
  PICKUP_RADIUS:    'pickupRadius',
  COOLDOWN_REDUCE:  'cooldownReduce',
  DRONE_DAMAGE:     'droneDamage',
  DRONE_COUNT:      'droneCount',
};

export const STAT_LABELS = {
  damage: 'Damage', fireRate: 'Fire Rate', projectileSpeed: 'Projectile Speed',
  critChance: 'Crit Chance', critDamage: 'Crit Damage', bossDamage: 'Boss Damage',
  eliteDamage: 'Elite Damage', abilityPower: 'Ability Power', maxHp: 'Max HP',
  armor: 'Armor', shieldCapacity: 'Shield Capacity', shieldRegen: 'Shield Regen',
  moveSpeed: 'Move Speed', dashDistance: 'Dash Distance', xpGain: 'XP Gain',
  coinGain: 'Coin Gain', pickupRadius: 'Pickup Radius', cooldownReduce: 'Cooldown Reduction',
  droneDamage: 'Drone Damage', droneCount: 'Drone Count',
};

export const FLAT_STATS = new Set(['maxHp', 'shieldCapacity', 'droneCount']);

// ─── AFFIX POOL ──────────────────────────────────────────────────────────────
export const AFFIXES = [
  { id: 'rapid',       name: 'Rapid',        stat: 'fireRate',       value: 0.15 },
  { id: 'heavy',       name: 'Heavy',        stat: 'damage',         value: 0.20 },
  { id: 'reinforced',  name: 'Reinforced',   stat: 'maxHp',          value: 30   },
  { id: 'titan',       name: 'Titan',        stat: 'armor',          value: 0.10 },
  { id: 'vampiric',    name: 'Vampiric',     stat: 'shieldRegen',    value: 0.08 },
  { id: 'overclocked', name: 'Overclocked',  stat: 'cooldownReduce', value: 0.10 },
  { id: 'radiant',     name: 'Radiant',      stat: 'abilityPower',   value: 0.15 },
  { id: 'ancient',     name: 'Ancient',      stat: 'xpGain',         value: 0.20 },
  { id: 'void',        name: 'Void-Touched', stat: 'bossDamage',     value: 0.15 },
  { id: 'cosmic',      name: 'Cosmic',       stat: 'critChance',     value: 0.08 },
  { id: 'celestial',   name: 'Celestial',    stat: 'critDamage',     value: 0.25 },
  { id: 'swift',       name: 'Swift',        stat: 'moveSpeed',      value: 0.12 },
  { id: 'greedy',      name: 'Greedy',       stat: 'coinGain',       value: 0.18 },
  { id: 'magnetic',    name: 'Magnetic',     stat: 'pickupRadius',   value: 0.25 },
  { id: 'swarm',       name: 'Swarm',        stat: 'droneDamage',    value: 0.20 },
  { id: 'bulwark',     name: 'Bulwark',      stat: 'shieldCapacity', value: 40   },
  { id: 'sniper',      name: 'Sniper',       stat: 'projectileSpeed',value: 0.20 },
  { id: 'slayer',      name: 'Elite-Slayer', stat: 'eliteDamage',    value: 0.18 },
];

// ─── BLUEPRINTS ───────────────────────────────────────────────────────────────
export const ALL_BLUEPRINTS = [
  // WEAPONS
  { id: 'pulse_cannon',    name: 'Pulse Cannon',        icon: '🔫', category: 'weapon',  flavorText: 'Standard-issue plasma discharge.',           statRanges: { damage: { min: 0.10, max: 0.25 }, fireRate: { min: 0.05, max: 0.15 } },                          minRarity: 'common'    },
  { id: 'void_beam',       name: 'Void Beam',           icon: '☄️',  category: 'weapon',  flavorText: 'Channels void energy into a focused beam.',   statRanges: { damage: { min: 0.15, max: 0.35 }, critChance: { min: 0.03, max: 0.08 } },                       minRarity: 'uncommon'  },
  { id: 'plasma_repeater', name: 'Plasma Repeater',     icon: '⚡',  category: 'weapon',  flavorText: 'Fires bursts of accelerated plasma rounds.',  statRanges: { fireRate: { min: 0.20, max: 0.45 }, projectileSpeed: { min: 0.10, max: 0.25 } },                  minRarity: 'uncommon'  },
  { id: 'nova_lance',      name: 'Nova Lance',          icon: '🌟',  category: 'weapon',  flavorText: 'Forged from the core of a dying star.',       statRanges: { damage: { min: 0.25, max: 0.50 }, bossDamage: { min: 0.10, max: 0.25 } },                       minRarity: 'rare'      },
  { id: 'entropy_cannon',  name: 'Entropy Cannon',      icon: '🌀',  category: 'weapon',  flavorText: 'Fires entropy rounds that destabilize matter.',statRanges: { damage: { min: 0.30, max: 0.60 }, critDamage: { min: 0.20, max: 0.50 } },                       minRarity: 'epic'      },
  // ARMOR
  { id: 'hull_plating',    name: 'Hull Plating',        icon: '🛡️',  category: 'armor',   flavorText: 'Reinforced titanium alloy exterior.',         statRanges: { maxHp: { min: 20, max: 50 }, armor: { min: 0.03, max: 0.08 } },                               minRarity: 'common'    },
  { id: 'phase_hull',      name: 'Phase Hull',          icon: '👻',  category: 'armor',   flavorText: 'Semi-permeable hull phasing incoming fire.',   statRanges: { maxHp: { min: 30, max: 70 }, armor: { min: 0.05, max: 0.12 } },                               minRarity: 'uncommon'  },
  { id: 'void_carapace',   name: 'Void Carapace',       icon: '🖤',  category: 'armor',   flavorText: 'Harvested from a dead void leviathan.',        statRanges: { maxHp: { min: 50, max: 120 }, armor: { min: 0.08, max: 0.18 } },                              minRarity: 'rare'      },
  { id: 'titan_shell',     name: 'Titan Shell',         icon: '⚙️',  category: 'armor',   flavorText: 'Compressed neutronium plating. Near indestructible.', statRanges: { maxHp: { min: 80, max: 180 }, armor: { min: 0.12, max: 0.25 } },                   minRarity: 'epic'      },
  // ENGINES
  { id: 'ion_drive',       name: 'Ion Drive',           icon: '🚀',  category: 'engine',  flavorText: 'Classic ion propulsion unit.',                statRanges: { moveSpeed: { min: 0.08, max: 0.18 }, dashDistance: { min: 0.10, max: 0.25 } },                  minRarity: 'common'    },
  { id: 'quantum_drive',   name: 'Quantum Drive',       icon: '💨',  category: 'engine',  flavorText: 'Exploits quantum tunneling.',                  statRanges: { moveSpeed: { min: 0.15, max: 0.30 }, dashDistance: { min: 0.20, max: 0.45 } },                  minRarity: 'rare'      },
  { id: 'warp_core',       name: 'Warp Core',           icon: '🌠',  category: 'engine',  flavorText: 'Bends local spacetime for ludicrous velocity.',statRanges: { moveSpeed: { min: 0.25, max: 0.50 }, dashDistance: { min: 0.35, max: 0.60 } },                  minRarity: 'epic'      },
  // REACTORS
  { id: 'fusion_cell',     name: 'Fusion Cell',         icon: '🔋',  category: 'reactor', flavorText: 'Standard hydrogen fusion power source.',      statRanges: { damage: { min: 0.05, max: 0.12 }, abilityPower: { min: 0.05, max: 0.12 } },                     minRarity: 'common'    },
  { id: 'antimatter_core', name: 'Antimatter Core',     icon: '⚛️',  category: 'reactor', flavorText: 'Annihilates antimatter for near-infinite power.',statRanges: { damage: { min: 0.12, max: 0.28 }, abilityPower: { min: 0.15, max: 0.35 }, cooldownReduce: { min: 0.05, max: 0.12 } }, minRarity: 'rare' },
  { id: 'singularity_heart',name:'Singularity Heart',   icon: '⚫',  category: 'reactor', flavorText: 'A contained micro-singularity.',               statRanges: { damage: { min: 0.20, max: 0.45 }, abilityPower: { min: 0.25, max: 0.55 }, cooldownReduce: { min: 0.10, max: 0.22 } }, minRarity: 'legendary' },
  // SHIELDS
  { id: 'energy_barrier',  name: 'Energy Barrier',      icon: '🔵',  category: 'shield',  flavorText: 'Projected electromagnetic barrier.',           statRanges: { shieldCapacity: { min: 20, max: 50 }, shieldRegen: { min: 0.03, max: 0.08 } },                  minRarity: 'common'    },
  { id: 'void_shell',      name: 'Void Shell',          icon: '🌑',  category: 'shield',  flavorText: 'Absorbs kinetic and energy damage.',           statRanges: { shieldCapacity: { min: 50, max: 120 }, shieldRegen: { min: 0.06, max: 0.15 } },                 minRarity: 'rare'      },
  { id: 'celestial_matrix',name: 'Celestial Matrix',    icon: '🌌',  category: 'shield',  flavorText: 'Woven from the fabric of collapsed stars.',    statRanges: { shieldCapacity: { min: 100, max: 250 }, shieldRegen: { min: 0.12, max: 0.30 } },                minRarity: 'epic'      },
  // DRONES
  { id: 'scout_drone',     name: 'Scout Drone',         icon: '🤖',  category: 'drone',   flavorText: 'Light recon and combat drone.',               statRanges: { droneCount: { min: 1, max: 1 }, droneDamage: { min: 0.10, max: 0.20 } },  flatStats: ['droneCount'], minRarity: 'uncommon'  },
  { id: 'guardian_drone',  name: 'Guardian Drone',      icon: '🛡️',  category: 'drone',   flavorText: 'Heavy combat drone with interceptor protocols.', statRanges: { droneCount: { min: 1, max: 2 }, droneDamage: { min: 0.20, max: 0.40 } }, flatStats: ['droneCount'], minRarity: 'rare' },
  { id: 'orbital_swarm',   name: 'Orbital Swarm Bay',   icon: '👾',  category: 'drone',   flavorText: 'Deploys an orbital swarm of micro-drones.',   statRanges: { droneCount: { min: 2, max: 3 }, droneDamage: { min: 0.30, max: 0.60 } },  flatStats: ['droneCount'], minRarity: 'epic'      },
  // MODULES
  { id: 'targeting_chip',  name: 'Targeting Chip',      icon: '🎯',  category: 'module',  flavorText: 'AI-assisted targeting for enhanced accuracy.', statRanges: { critChance: { min: 0.04, max: 0.10 }, damage: { min: 0.05, max: 0.12 } },                       minRarity: 'common'    },
  { id: 'scavenger_mod',   name: 'Scavenger Module',    icon: '🧲',  category: 'module',  flavorText: 'Automated loot collection system.',            statRanges: { pickupRadius: { min: 0.20, max: 0.50 }, coinGain: { min: 0.10, max: 0.25 } },                     minRarity: 'common'    },
  { id: 'overclock_mod',   name: 'Overclock Module',    icon: '🔧',  category: 'module',  flavorText: 'Pushes all systems beyond rated parameters.',  statRanges: { fireRate: { min: 0.10, max: 0.22 }, cooldownReduce: { min: 0.08, max: 0.18 } },                   minRarity: 'uncommon'  },
  { id: 'xp_matrix',       name: 'XP Amplifier Matrix', icon: '⭐',  category: 'module',  flavorText: 'Enhances neural absorption of experience.',    statRanges: { xpGain: { min: 0.15, max: 0.40 }, coinGain: { min: 0.10, max: 0.25 } },                          minRarity: 'uncommon'  },
  { id: 'boss_slayer',     name: 'Boss Slayer Chip',    icon: '💀',  category: 'module',  flavorText: 'Hardcoded kill protocols for large targets.',  statRanges: { bossDamage: { min: 0.15, max: 0.35 }, eliteDamage: { min: 0.10, max: 0.25 } },                    minRarity: 'rare'      },
];

export const BLUEPRINT_BY_ID = Object.fromEntries(ALL_BLUEPRINTS.map(b => [b.id, b]));

// ─── UNIQUE NAMED ITEMS ───────────────────────────────────────────────────────
export const UNIQUE_ITEMS = [
  {
    id: 'unique_starbreaker', name: 'Starbreaker Cannon', icon: '💥', category: 'weapon', rarity: 'legendary',
    description: 'A cannon that fires compressed star matter.',
    flavorText: '"It doesn\'t just shoot — it unmakes."',
    stats: { damage: 0.80, bossDamage: 0.50, critChance: 0.15 },
    specialEffect: 'STAR_SHATTER',
    bossSources: ['Galactic Destroyer'],
  },
  {
    id: 'unique_voidheart', name: 'Voidheart Reactor', icon: '🖤', category: 'reactor', rarity: 'legendary',
    description: 'Pulses with the dark energy of collapsed dimensions.',
    flavorText: '"Power beyond measurement. Cost beyond comprehension."',
    stats: { damage: 0.60, abilityPower: 0.70, cooldownReduce: 0.25 },
    specialEffect: 'VOID_PULSE',
    bossSources: ['Void Serpent'],
  },
  {
    id: 'unique_titanium_core', name: 'Titanium Core Armor', icon: '🔩', category: 'armor', rarity: 'legendary',
    description: 'The densest alloy in known space.',
    flavorText: '"Scratched by a supernova. Still standing."',
    stats: { maxHp: 200, armor: 0.30 },
    specialEffect: 'IRON_WILL',
    bossSources: ['Asteroid Titan'],
  },
  {
    id: 'unique_singularity_engine', name: 'Singularity Engine', icon: '🌀', category: 'engine', rarity: 'mythic',
    description: 'Powered by a micro black hole.',
    flavorText: '"Where did it go? It\'s already there."',
    stats: { moveSpeed: 0.80, dashDistance: 1.00, cooldownReduce: 0.20 },
    specialEffect: 'MICRO_WARP',
    bossSources: ['Galactic Destroyer'],
  },
  {
    id: 'unique_orbitbreaker', name: 'Orbitbreaker Drone Bay', icon: '🛸', category: 'drone', rarity: 'mythic',
    description: 'Deploys drones that orbit the entire battlefield.',
    flavorText: '"They don\'t guard the ship. They own the arena."',
    stats: { droneCount: 3, droneDamage: 0.80 },
    specialEffect: 'ORBITAL_NETWORK',
    bossSources: ['Void Serpent', 'Galactic Destroyer'],
  },
];

export const UNIQUE_BY_ID = Object.fromEntries(UNIQUE_ITEMS.map(u => [u.id, u]));

// ─── SECRET ITEMS ─────────────────────────────────────────────────────────────
export const SECRET_ITEMS = [
  {
    id: 'secret_singularity', name: 'The Singularity', icon: '⭕', category: 'reactor', rarity: 'secret',
    description: 'The first and last power source. Contains the origin of all energy.',
    flavorText: '"You found it. Now you understand why it was hidden."',
    stats: { damage: 1.00, abilityPower: 1.00, cooldownReduce: 0.40, maxHp: 150 },
    specialEffect: 'ORIGIN_PULSE',
    dropCondition: 'Kill all 3 bosses in one run',
  },
  {
    id: 'secret_monarch', name: 'Cosmic Monarch', icon: '👑', category: 'armor', rarity: 'secret',
    description: 'The crown of the last emperor of the Void Realm.',
    flavorText: '"Power without limit. Responsibility without end."',
    stats: { maxHp: 300, armor: 0.50, shieldCapacity: 200 },
    specialEffect: 'SOVEREIGN_AURA',
    dropCondition: 'Reach Wave 20 without dying',
  },
  {
    id: 'secret_last_star', name: 'The Last Star', icon: '🌠', category: 'weapon', rarity: 'secret',
    description: 'Fires the compressed light of a dying star. It will never miss.',
    flavorText: '"The last light before the dark. Make it count."',
    stats: { damage: 1.20, critChance: 0.40, critDamage: 1.00, bossDamage: 0.80 },
    specialEffect: 'STELLAR_BARRAGE',
    dropCondition: 'Kill a boss below 10% health',
  },
  {
    id: 'secret_entropy', name: 'Entropy Core', icon: '🔮', category: 'module', rarity: 'secret',
    description: 'Harvested from the entropy field of a heat-dead universe.',
    flavorText: '"Everything decays. This only grows stronger."',
    stats: { bossDamage: 0.70, eliteDamage: 0.60, cooldownReduce: 0.35, abilityPower: 0.80 },
    specialEffect: 'ENTROPY_FIELD',
    dropCondition: 'Kill 3 elites in under 10 seconds',
  },
  {
    id: 'secret_origin', name: 'Origin Protocol', icon: '🧬', category: 'engine', rarity: 'secret',
    description: "An engine that predates the universe. It knows where you need to be.",
    flavorText: '"It doesn\'t move the ship. It moves reality."',
    stats: { moveSpeed: 1.00, dashDistance: 1.50, coinGain: 0.50, xpGain: 0.50 },
    specialEffect: 'REALITY_SHIFT',
    dropCondition: 'Collect 500 loot in a single run',
  },
];

export const SECRET_BY_ID = Object.fromEntries(SECRET_ITEMS.map(s => [s.id, s]));

// ─── BOSS DROP TABLES ─────────────────────────────────────────────────────────
export const BOSS_DROP_TABLES = {
  'Asteroid Titan': {
    rarityPool: [
      { rarity: 'common', weight: 0.40 }, { rarity: 'uncommon', weight: 0.35 },
      { rarity: 'rare',   weight: 0.20 }, { rarity: 'epic',     weight: 0.05 },
    ],
    blueprintPool: ['hull_plating', 'phase_hull', 'void_carapace', 'ion_drive', 'targeting_chip', 'scavenger_mod'],
    uniqueItemIds: ['unique_titanium_core'],
    uniqueChance: 0.04,
    dropCount: { min: 1, max: 2 },
  },
  'Void Serpent': {
    rarityPool: [
      { rarity: 'uncommon', weight: 0.35 }, { rarity: 'rare',      weight: 0.40 },
      { rarity: 'epic',     weight: 0.20 }, { rarity: 'legendary', weight: 0.05 },
    ],
    blueprintPool: ['void_beam', 'void_carapace', 'void_shell', 'antimatter_core', 'boss_slayer'],
    uniqueItemIds: ['unique_voidheart', 'unique_orbitbreaker'],
    uniqueChance: 0.06,
    dropCount: { min: 1, max: 2 },
  },
  'Galactic Destroyer': {
    rarityPool: [
      { rarity: 'rare',      weight: 0.30 }, { rarity: 'epic',      weight: 0.40 },
      { rarity: 'legendary', weight: 0.25 }, { rarity: 'mythic',    weight: 0.05 },
    ],
    blueprintPool: ['nova_lance', 'entropy_cannon', 'titan_shell', 'quantum_drive', 'warp_core', 'singularity_heart'],
    uniqueItemIds: ['unique_starbreaker', 'unique_singularity_engine'],
    uniqueChance: 0.08,
    dropCount: { min: 2, max: 3 },
  },
};

export const WAVE_RARITY_TABLE = [
  { maxWave: 3,   pool: [{ rarity: 'common', weight: 0.70 }, { rarity: 'uncommon', weight: 0.25 }, { rarity: 'rare', weight: 0.05 }] },
  { maxWave: 7,   pool: [{ rarity: 'common', weight: 0.40 }, { rarity: 'uncommon', weight: 0.35 }, { rarity: 'rare', weight: 0.20 }, { rarity: 'epic', weight: 0.05 }] },
  { maxWave: 12,  pool: [{ rarity: 'uncommon', weight: 0.25 }, { rarity: 'rare', weight: 0.40 }, { rarity: 'epic', weight: 0.28 }, { rarity: 'legendary', weight: 0.07 }] },
  { maxWave: 999, pool: [{ rarity: 'rare', weight: 0.20 }, { rarity: 'epic', weight: 0.35 }, { rarity: 'legendary', weight: 0.30 }, { rarity: 'mythic', weight: 0.15 }] },
];

export const MYTHIC_EFFECTS = [
  { id: 'SPLIT_SHOT',     name: 'Split Shot',      desc: 'Projectiles split into 3 on impact' },
  { id: 'DOUBLE_CRIT',    name: 'Double Critical', desc: 'Critical hits deal double crit damage' },
  { id: 'EXTRA_DRONE',    name: 'Drone Surge',     desc: 'Summon 2 extra combat drones' },
  { id: 'CHAIN_ARC',      name: 'Chain Lightning', desc: 'Hits arc to 2 nearby enemies' },
  { id: 'CD_RESET',       name: 'Cooldown Nova',   desc: '5% chance on kill to reset all cooldowns' },
  { id: 'VOID_EXPLOSION', name: 'Void Explosion',  desc: 'On kill: 25% chance of AoE void burst' },
];

export function getInitialLoadout() {
  return Object.fromEntries(Object.values(EQUIP_SLOTS).map(s => [s, null]));
}
