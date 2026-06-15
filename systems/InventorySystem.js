// ============================================================================
// INVENTORY SYSTEM
// Separate from Hangar/Equipment - handles chests, boosts, consumables, etc.
// ============================================================================

export const INVENTORY_CATEGORIES = {
  CHESTS: 'chests',
  BOOSTS: 'boosts',
  CONSUMABLES: 'consumables',
  ABILITIES: 'abilities',
  MISC: 'misc',
};

export const CHEST_TYPES = {
  COMMON_CACHE: 'common_cache',
  RARE_CRATE: 'rare_crate',
  ELITE_ARSENAL: 'elite_arsenal',
  MYTHIC_RELIC: 'mythic_relic',
  COSMIC_VAULT: 'cosmic_vault',
};

export const BOOST_TYPES = {
  XP_BOOST: 'xp_boost',
  COIN_BOOST: 'coin_boost',
  DAMAGE_BOOST: 'damage_boost',
  SPEED_BOOST: 'speed_boost',
};

// Chest definitions with loot tables
export const CHEST_DEFINITIONS = {
  [CHEST_TYPES.COMMON_CACHE]: {
    name: 'Common Cache',
    rarity: 'common',
    icon: '📦',
    description: 'A basic supply cache',
    lootTable: {
      coins: { min: 50, max: 150 },
      xp: { min: 100, max: 300 },
      itemChance: 0.3,
      itemRarities: { common: 0.8, rare: 0.2 },
    },
  },
  [CHEST_TYPES.RARE_CRATE]: {
    name: 'Rare Crate',
    rarity: 'rare',
    icon: '🎁',
    description: 'A valuable supply crate',
    lootTable: {
      coins: { min: 200, max: 500 },
      xp: { min: 400, max: 800 },
      itemChance: 0.5,
      itemRarities: { common: 0.4, rare: 0.5, epic: 0.1 },
    },
  },
  [CHEST_TYPES.ELITE_ARSENAL]: {
    name: 'Elite Arsenal',
    rarity: 'epic',
    icon: '⚔️',
    description: 'High-grade military supplies',
    lootTable: {
      coins: { min: 500, max: 1000 },
      xp: { min: 800, max: 1500 },
      itemChance: 0.7,
      itemRarities: { rare: 0.4, epic: 0.5, legendary: 0.1 },
    },
  },
  [CHEST_TYPES.MYTHIC_RELIC]: {
    name: 'Mythic Relic Chest',
    rarity: 'legendary',
    icon: '💎',
    description: 'Ancient treasures of immense power',
    lootTable: {
      coins: { min: 1000, max: 2500 },
      xp: { min: 1500, max: 3000 },
      itemChance: 0.9,
      itemRarities: { epic: 0.3, legendary: 0.7 },
    },
  },
  [CHEST_TYPES.COSMIC_VAULT]: {
    name: 'Cosmic Vault',
    rarity: 'legendary',
    icon: '🌌',
    description: 'The ultimate cosmic treasure',
    lootTable: {
      coins: { min: 2000, max: 5000 },
      xp: { min: 3000, max: 6000 },
      itemChance: 1.0,
      itemRarities: { epic: 0.2, legendary: 0.8 },
    },
  },
};

export const BOOST_DEFINITIONS = {
  [BOOST_TYPES.XP_BOOST]: {
    name: 'XP Boost',
    icon: '⭐',
    description: '+50% XP gain for 5 minutes',
    duration: 300, // seconds
    effect: { xpMult: 1.5 },
  },
  [BOOST_TYPES.COIN_BOOST]: {
    name: 'Coin Boost',
    icon: '🪙',
    description: '+100% coin gain for 5 minutes',
    duration: 300,
    effect: { goldMult: 2.0 },
  },
  [BOOST_TYPES.DAMAGE_BOOST]: {
    name: 'Damage Boost',
    icon: '⚡',
    description: '+25% damage for 3 minutes',
    duration: 180,
    effect: { damageMult: 1.25 },
  },
  [BOOST_TYPES.SPEED_BOOST]: {
    name: 'Speed Boost',
    icon: '💨',
    description: '+30% movement speed for 3 minutes',
    duration: 180,
    effect: { speedMult: 1.3 },
  },
};

// Create initial inventory structure
export function createInventory() {
  return {
    [INVENTORY_CATEGORIES.CHESTS]: [],
    [INVENTORY_CATEGORIES.BOOSTS]: [],
    [INVENTORY_CATEGORIES.CONSUMABLES]: [],
    [INVENTORY_CATEGORIES.ABILITIES]: [],
    [INVENTORY_CATEGORIES.MISC]: [],
  };
}

// Add item to inventory
export function addToInventory(inventory, category, item) {
  if (!inventory[category]) {
    console.warn(`Invalid inventory category: ${category}`);
    return inventory;
  }

  const newInventory = { ...inventory };
  newInventory[category] = [...newInventory[category], { ...item, id: generateItemId() }];
  return newInventory;
}

// Remove item from inventory by ID
export function removeFromInventory(inventory, category, itemId) {
  if (!inventory[category]) {
    console.warn(`Invalid inventory category: ${category}`);
    return inventory;
  }

  const newInventory = { ...inventory };
  newInventory[category] = newInventory[category].filter(item => item.id !== itemId);
  return newInventory;
}

// Query items in a category
export function getInventoryCategory(inventory, category) {
  return inventory[category] || [];
}

// Get total item count
export function getInventoryCount(inventory) {
  return Object.values(inventory).reduce((total, category) => total + category.length, 0);
}

// Generate unique item ID
let itemIdCounter = 0;
function generateItemId() {
  return `item_${Date.now()}_${itemIdCounter++}`;
}

// Open a chest and generate rewards
export function openChest(chestType) {
  const chestDef = CHEST_DEFINITIONS[chestType];
  if (!chestDef) {
    console.warn(`Unknown chest type: ${chestType}`);
    return null;
  }

  const loot = chestDef.lootTable;
  const rewards = {
    coins: Math.floor(Math.random() * (loot.coins.max - loot.coins.min + 1)) + loot.coins.min,
    xp: Math.floor(Math.random() * (loot.xp.max - loot.xp.min + 1)) + loot.xp.min,
    items: [],
  };

  // Roll for item drops
  if (Math.random() < loot.itemChance) {
    const rarityRoll = Math.random();
    let cumulativeChance = 0;
    let selectedRarity = 'common';

    for (const [rarity, chance] of Object.entries(loot.itemRarities)) {
      cumulativeChance += chance;
      if (rarityRoll < cumulativeChance) {
        selectedRarity = rarity;
        break;
      }
    }

    rewards.items.push({
      type: 'equipment',
      rarity: selectedRarity,
      name: `${selectedRarity.charAt(0).toUpperCase() + selectedRarity.slice(1)} Equipment`,
    });
  }

  return rewards;
}

// Apply boost effect to player
export function applyBoost(player, boostType) {
  const boostDef = BOOST_DEFINITIONS[boostType];
  if (!boostDef || !player) return null;

  const effect = { ...boostDef.effect };
  const endTime = Date.now() + boostDef.duration * 1000;

  return {
    type: boostType,
    name: boostDef.name,
    effect,
    endTime,
    duration: boostDef.duration,
  };
}

// Check if boost is still active
export function isBoostActive(boost) {
  return boost && Date.now() < boost.endTime;
}

// Get remaining boost time in seconds
export function getBoostTimeRemaining(boost) {
  if (!boost) return 0;
  const remaining = Math.max(0, boost.endTime - Date.now()) / 1000;
  return Math.ceil(remaining);
}
