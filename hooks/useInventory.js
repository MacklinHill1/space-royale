import { useState, useCallback } from 'react';
import {
  createInventory,
  addToInventory,
  removeFromInventory,
  getInventoryCategory,
  getInventoryCount,
  openChest,
  applyBoost,
  isBoostActive,
  getBoostTimeRemaining,
  INVENTORY_CATEGORIES,
  CHEST_TYPES,
  BOOST_TYPES,
} from '../systems/InventorySystem';

export function useInventory(initialInventory = null) {
  const [inventory, setInventory] = useState(initialInventory || createInventory());
  const [activeBoosts, setActiveBoosts] = useState([]);

  const addItem = useCallback((category, item) => {
    setInventory(prev => addToInventory(prev, category, item));
  }, []);

  const removeItem = useCallback((category, itemId) => {
    setInventory(prev => removeFromInventory(prev, category, itemId));
  }, []);

  const getCategory = useCallback((category) => {
    return getInventoryCategory(inventory, category);
  }, [inventory]);

  const getTotalCount = useCallback(() => {
    return getInventoryCount(inventory);
  }, [inventory]);

  const handleOpenChest = useCallback((chestItem) => {
    const rewards = openChest(chestItem.type);
    if (!rewards) return null;

    // Remove chest from inventory
    removeItem(INVENTORY_CATEGORIES.CHESTS, chestItem.id);

    return rewards;
  }, [removeItem]);

  const handleUseBoost = useCallback((boostItem, player) => {
    const boost = applyBoost(player, boostItem.type);
    if (!boost) return null;

    // Remove boost from inventory
    removeItem(INVENTORY_CATEGORIES.BOOSTS, boostItem.id);

    // Add to active boosts
    setActiveBoosts(prev => [...prev, boost]);

    return boost;
  }, [removeItem]);

  const updateActiveBoosts = useCallback(() => {
    setActiveBoosts(prev => prev.filter(boost => isBoostActive(boost)));
  }, []);

  const getActiveBoostEffects = useCallback(() => {
    const effects = {
      xpMult: 1.0,
      goldMult: 1.0,
      damageMult: 1.0,
      speedMult: 1.0,
    };

    activeBoosts.forEach(boost => {
      if (isBoostActive(boost)) {
        Object.entries(boost.effect).forEach(([key, value]) => {
          if (effects[key] !== undefined) {
            effects[key] *= value;
          }
        });
      }
    });

    return effects;
  }, [activeBoosts]);

  return {
    inventory,
    setInventory,
    addItem,
    removeItem,
    getCategory,
    getTotalCount,
    openChest: handleOpenChest,
    useBoost: handleUseBoost,
    activeBoosts,
    updateActiveBoosts,
    getActiveBoostEffects,
  };
}
