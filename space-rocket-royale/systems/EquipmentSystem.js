// systems/EquipmentSystem.js

import { EQUIP_SLOTS, ITEM_TYPES } from '../constants/EquipmentData';

export function getInitialEquipmentSlots() {
  return {
    [EQUIP_SLOTS.WEAPON]: null,
    [EQUIP_SLOTS.ARMOR]: null,
    [EQUIP_SLOTS.UTILITY]: null,
    [EQUIP_SLOTS.MOD1]: null,
    [EQUIP_SLOTS.MOD2]: null,
  };
}

export function computeEquipmentStats(equippedSlots) {
  const aggregatedStats = {
    damageBonus: 0,
    fireRateBonus: 0,
    critChance: 0,
    maxHpBonus: 0,
    shieldMaxBonus: 0,
    iFrameBonus: 0,
    magnetRadiusBonus: 0,
    goldMultBonus: 0,
    speedMultBonus: 0,
    xpMultBonus: 0,
    dashDistMultBonus: 0
  };

  Object.values(equippedSlots).forEach(itemInstance => {
    if (!itemInstance || !itemInstance.stats) return;
    Object.entries(itemInstance.stats).forEach(([statName, value]) => {
      if (statName in aggregatedStats) {
        aggregatedStats[statName] += value;
      }
    });
  });

  return aggregatedStats;
}

export function applyEquipmentToPlayer(playerObj, equippedSlots) {
  if (!playerObj) return;

  const bonuses = computeEquipmentStats(equippedSlots);

  // 1. Reset native base constants before factoring modifications
  playerObj.maxHp = 100 + bonuses.maxHpBonus;
  playerObj.hp = Math.min(playerObj.hp, playerObj.maxHp);
  
  playerObj.shieldMax = bonuses.shieldMaxBonus;
  playerObj.shield = Math.min(playerObj.shield, playerObj.shieldMax);

  // 2. Append scale modifiers onto engine baseline coefficients
  playerObj.damageMult = 1.0 + bonuses.damageBonus;
  playerObj.fireRateMult = 1.0 + bonuses.fireRateBonus;
  playerObj.speedMult = 1.0 + bonuses.speedMultBonus;
  playerObj.dashDistMult = 1.0 + bonuses.dashDistMultBonus;
  playerObj.xpMult = 1.0 + bonuses.xpMultBonus;
  playerObj.goldMult = 1.0 + bonuses.goldMultBonus;

  // 3. Directly shift cumulative constants
  playerObj.critChance = 0.05 + bonuses.critChance;
  playerObj.magnetRadius = 80 + bonuses.magnetRadiusBonus;
  playerObj.iFrameBonus = bonuses.iFrameBonus;
}

export function isItemValidForSlot(itemInstance, slotName) {
  if (!itemInstance) return false;
  const type = itemInstance.type;

  if (slotName === EQUIP_SLOTS.WEAPON) return type === ITEM_TYPES.WEAPON;
  if (slotName === EQUIP_SLOTS.ARMOR) return type === ITEM_TYPES.ARMOR;
  if (slotName === EQUIP_SLOTS.UTILITY) return type === ITEM_TYPES.UTILITY;
  if (slotName === EQUIP_SLOTS.MOD1 || slotName === EQUIP_SLOTS.MOD2) return type === ITEM_TYPES.MOD;

  return false;
}