// constants/EquipmentData.js

export const EQUIP_SLOTS = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  UTILITY: 'utility',
  MOD1: 'mod1',
  MOD2: 'mod2',
};

export const ITEM_TYPES = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  UTILITY: 'utility',
  MOD: 'mod',
};

export const RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

export const RARITY_WEIGHTS = [
  { rarity: RARITIES.COMMON, weight: 0.70 },
  { rarity: RARITIES.RARE, weight: 0.20 },
  { rarity: RARITIES.EPIC, weight: 0.08 },
  { rarity: RARITIES.LEGENDARY, weight: 0.02 },
];

export const RARITY_COLORS = {
  [RARITIES.COMMON]: '#9ca3af',
  [RARITIES.RARE]: '#3b82f6',
  [RARITIES.EPIC]: '#a855f7',
  [RARITIES.LEGENDARY]: '#eab308',
};

// Static blueprints outlining property bounds and base classifications
export const ITEM_BLUEPRINTS = {
  PLASMA_CANNON: {
    id: 'PLASMA_CANNON',
    name: 'Hyperion Plasma Cannon',
    type: ITEM_TYPES.WEAPON,
    icon: '🔫',
    bossSources: ['Galactic Destroyer'],
    statRanges: { damageBonus: { min: 0.10, max: 0.25 }, critChance: { min: 0.02, max: 0.06 } }
  },
  VOID_BEAM: {
    id: 'VOID_BEAM',
    name: 'Void Singularity Beam',
    type: ITEM_TYPES.WEAPON,
    icon: '☄️',
    bossSources: ['Void Serpent'],
    statRanges: { damageBonus: { min: 0.15, max: 0.35 }, fireRateBonus: { min: 0.05, max: 0.12 } }
  },
  TITAN_SHELL: {
    id: 'TITAN_SHELL',
    name: 'Titanium Plated Core Shell',
    type: ITEM_TYPES.ARMOR,
    icon: '🛡️',
    bossSources: ['Asteroid Titan'],
    statRanges: { maxHpBonus: { min: 20, max: 60 }, shieldMaxBonus: { min: 15, max: 40 } }
  },
  GHOST_MATRIX: {
    id: 'GHOST_MATRIX',
    name: 'Phase Ghost Hull Matrix',
    type: ITEM_TYPES.ARMOR,
    icon: '👻',
    bossSources: ['Void Serpent'],
    statRanges: { maxHpBonus: { min: 30, max: 50 }, iFrameBonus: { min: 0.1, max: 0.3 } }
  },
  GRAVITY_WELL: {
    id: 'GRAVITY_WELL',
    name: 'Sub-Space Gravity Well',
    type: ITEM_TYPES.UTILITY,
    icon: '🧲',
    bossSources: ['Asteroid Titan'],
    statRanges: { magnetRadiusBonus: { min: 40, max: 120 }, goldMultBonus: { min: 0.10, max: 0.25 } }
  },
  CHRONO_CORE: {
    id: 'CHRONO_CORE',
    name: 'Overclocked Chrono Engine',
    type: ITEM_TYPES.UTILITY,
    icon: '⚡',
    bossSources: ['Galactic Destroyer'],
    statRanges: { speedMultBonus: { min: 0.08, max: 0.20 }, xpMultBonus: { min: 0.10, max: 0.30 } }
  },
  THRUSTER_MOD: {
    id: 'THRUSTER_MOD',
    name: 'Ion Vector Thruster Chip',
    type: ITEM_TYPES.MOD,
    icon: '💾',
    bossSources: ['Asteroid Titan', 'Void Serpent', 'Galactic Destroyer'],
    statRanges: { speedMultBonus: { min: 0.05, max: 0.12 }, dashDistMultBonus: { min: 0.15, max: 0.40 } }
  },
  TARGETING_CHIP: {
    id: 'TARGETING_CHIP',
    name: 'Omni-Targeting Chip Override',
    type: ITEM_TYPES.MOD,
    icon: '🎯',
    bossSources: ['Asteroid Titan', 'Void Serpent', 'Galactic Destroyer'],
    statRanges: { critChance: { min: 0.03, max: 0.08 }, damageBonus: { min: 0.05, max: 0.15 } }
  }
};