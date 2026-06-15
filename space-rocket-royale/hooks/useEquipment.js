// src/hooks/useEquipment.js
"use client";

import { useMemo, useCallback } from 'react';
import { MAX_INVENTORY_SLOTS, sortItemsByRarity } from '../systems/InventorySystem';
import { getInitialEquipmentSlots, isItemValidForSlot } from '../systems/EquipmentSystem';
import { EQUIP_SLOTS } from '../constants/EquipmentData';

export function useEquipment(profile, onProfileUpdate) {
  // 1. Strictly read incoming properties. Zero auto-correct side-effects.
  const inventory = useMemo(() => profile?.inventory || [], [profile?.inventory]);
  const equipped = useMemo(() => profile?.equippedItems || getInitialEquipmentSlots(), [profile?.equippedItems]);

  // 2. Wrap parent dispatches safely so they execute completely outside the render timeline
  const updateProfileData = useCallback((nextInventory, nextEquipped) => {
    if (!onProfileUpdate || !profile) return;
    
    // Pushing the execution state change to the next event loop frame
    setTimeout(() => {
      onProfileUpdate({
        ...profile,
        inventory: nextInventory,
        equippedItems: nextEquipped
      });
    }, 0);
  }, [profile, onProfileUpdate]);

  const equipItem = useCallback((itemInstance, targetSlot) => {
    if (!itemInstance || !targetSlot) return;
    if (!isItemValidForSlot(itemInstance, targetSlot)) return;

    const currentEquippedAtSlot = equipped[targetSlot];
    let nextInventory = inventory.filter(item => item.instanceId !== itemInstance.instanceId);
    
    if (currentEquippedAtSlot) {
      nextInventory.push(currentEquippedAtSlot);
    }

    const nextEquipped = {
      ...equipped,
      [targetSlot]: itemInstance
    };

    updateProfileData(nextInventory, nextEquipped);
  }, [inventory, equipped, updateProfileData]);

  const unequipItem = useCallback((slotName) => {
    const itemInstance = equipped[slotName];
    if (!itemInstance) return;
    if (inventory.length >= MAX_INVENTORY_SLOTS) return;

    const nextInventory = [...inventory, itemInstance];
    const nextEquipped = {
      ...equipped,
      [slotName]: null
    };

    updateProfileData(nextInventory, nextEquipped);
  }, [inventory, equipped, updateProfileData]);

  const salvageItem = useCallback((itemInstance) => {
    if (!itemInstance) return;
    const nextInventory = inventory.filter(item => item.instanceId !== itemInstance.instanceId);
    
    setTimeout(() => {
      if (onProfileUpdate && profile) {
        onProfileUpdate({
          ...profile,
          inventory: nextInventory,
          gold: (profile.gold || 0) + 100
        });
      }
    }, 0);
  }, [inventory, profile, onProfileUpdate]);

  const sortedInventory = useMemo(() => sortItemsByRarity(inventory), [inventory]);

  return {
    inventory: sortedInventory,
    equipped,
    equipItem,
    unequipItem,
    salvageItem,
    isInventoryFull: inventory.length >= MAX_INVENTORY_SLOTS
  };
}