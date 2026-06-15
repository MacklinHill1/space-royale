// systems/InventorySystem.js

import { ITEM_BLUEPRINTS, RARITIES, RARITY_WEIGHTS } from '../constants/EquipmentData';

export const MAX_INVENTORY_SLOTS = 40;

export function createItemInstance(blueprintId, rarity) {
  const blueprint = ITEM_BLUEPRINTS[blueprintId];
  if (!blueprint) return null;

  const instanceStats = {};
  let rarityMultiplier = 1.0;

  if (rarity === RARITIES.RARE) rarityMultiplier = 1.25;
  if (rarity === RARITIES.EPIC) rarityMultiplier = 1.60;
  if (rarity === RARITIES.LEGENDARY) rarityMultiplier = 2.10;

  Object.entries(blueprint.statRanges).forEach(([statName, range]) => {
    const rolledValue = Math.random() * (range.max - range.min) + range.min;
    const finalValue = rolledValue * rarityMultiplier;
    instanceStats[statName] = statName.toLowerCase().includes('bonus') || statName === 'critChance'
      ? parseFloat(finalValue.toFixed(4)) 
      : Math.round(finalValue);
  });

  return {
    instanceId: `${blueprintId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    blueprintId,
    name: `${rarity.toUpperCase()} ${blueprint.name}`,
    type: blueprint.type,
    rarity,
    icon: blueprint.icon,
    stats: instanceStats,
  };
}

export function generateBossDrop(bossName) {
  const validBlueprints = Object.values(ITEM_BLUEPRINTS).filter(bp => 
    bp.bossSources.includes(bossName)
  );
  if (validBlueprints.length === 0) return null;

  const randomRoll = Math.random();
  let selectedRarity = RARITIES.COMMON;
  let runningSum = 0;

  for (const { rarity, weight } of RARITY_WEIGHTS) {
    runningSum += weight;
    if (randomRoll <= runningSum) {
      selectedRarity = rarity;
      break;
    }
  }

  const selectedBlueprint = validBlueprints[Math.floor(Math.random() * validBlueprints.length)];
  return createItemInstance(selectedBlueprint.id, selectedRarity);
}

export function sortItemsByRarity(itemsList) {
  const rarityOrder = {
    [RARITIES.LEGENDARY]: 4,
    [RARITIES.EPIC]: 3,
    [RARITIES.RARE]: 2,
    [RARITIES.COMMON]: 1
  };
  return [...itemsList].sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
}