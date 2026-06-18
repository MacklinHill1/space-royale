// hooks/useEquipment.js
"use client";

import { useMemo, useCallback } from 'react';
import { getInitialLoadout, RARITY_SALVAGE_VALUE, CATEGORY_SLOT_MAP } from '../constants/EquipmentData.js';
import { isItemValidForSlot, sortItemsByRarity } from '../systems/EquipmentSystem.js';

export const MAX_GEAR_SLOTS = 120;

export function useEquipment(profile, onProfileUpdate) {
  const gearInventory = useMemo(() => profile?.gearInventory || [], [profile?.gearInventory]);
  const gearLoadout   = useMemo(() => profile?.gearLoadout   || getInitialLoadout(), [profile?.gearLoadout]);

  const _commit = useCallback((nextInventory, nextLoadout, extraFields = {}) => {
    if (!onProfileUpdate || !profile) return;
    setTimeout(() => {
      onProfileUpdate({
        ...profile,
        gearInventory: nextInventory,
        gearLoadout:   nextLoadout,
        ...extraFields,
      });
    }, 0);
  }, [profile, onProfileUpdate]);

  // ── Equip ────────────────────────────────────────────────────────────────
  const equipItem = useCallback((item, slotKey) => {
    if (!item || !slotKey) return;
    if (!isItemValidForSlot(item, slotKey)) return;

    const displaced = gearLoadout[slotKey];
    const nextInventory = [
      ...gearInventory.filter(i => i.instanceId !== item.instanceId),
      ...(displaced ? [displaced] : []),
    ];
    const nextLoadout = { ...gearLoadout, [slotKey]: item };
    _commit(nextInventory, nextLoadout);
  }, [gearInventory, gearLoadout, _commit]);

  // ── Unequip ──────────────────────────────────────────────────────────────
  const unequipItem = useCallback((slotKey) => {
    const item = gearLoadout[slotKey];
    if (!item) return;
    const nextInventory = [...gearInventory, item];
    const nextLoadout   = { ...gearLoadout, [slotKey]: null };
    _commit(nextInventory, nextLoadout);
  }, [gearInventory, gearLoadout, _commit]);

  // ── Salvage ──────────────────────────────────────────────────────────────
  const salvageItem = useCallback((item) => {
    if (!item) return;
    const nextInventory = gearInventory.filter(i => i.instanceId !== item.instanceId);
    const salvageGold   = item.value || RARITY_SALVAGE_VALUE[item.rarity] || 50;
    setTimeout(() => {
      if (onProfileUpdate && profile) {
        onProfileUpdate({
          ...profile,
          gearInventory: nextInventory,
          gold: (profile.gold || 0) + salvageGold,
        });
      }
    }, 0);
  }, [gearInventory, profile, onProfileUpdate]);

  // ── Add run loot ─────────────────────────────────────────────────────────
  const addLootToHangar = useCallback((items) => {
    if (!items || items.length === 0) return;
    const nextInventory = [...gearInventory, ...items];
    _commit(nextInventory, gearLoadout);
  }, [gearInventory, gearLoadout, _commit]);

  const sortedInventory = useMemo(() => sortItemsByRarity(gearInventory), [gearInventory]);

  return {
    gearInventory: sortedInventory,
    gearLoadout,
    equipItem,
    unequipItem,
    salvageItem,
    addLootToHangar,
    isHangarFull: gearInventory.length >= MAX_GEAR_SLOTS,
  };
}
