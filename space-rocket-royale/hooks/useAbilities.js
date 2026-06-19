// hooks/useAbilities.js
"use client";

import { useMemo, useCallback } from 'react';
import { getInitialAbilityLoadout, ABILITY_SALVAGE_VALUE, ABILITY_CATEGORY_SLOT_MAP, isAbilityValidForSlot } from '../constants/AbilityData.js';

export const MAX_ABILITY_SLOTS = 80;

export function useAbilities(profile, onProfileUpdate) {
  const abilityInventory = useMemo(() => profile?.abilityInventory || [], [profile?.abilityInventory]);
  const abilityLoadout   = useMemo(() => profile?.abilityLoadout   || getInitialAbilityLoadout(), [profile?.abilityLoadout]);

  const _commit = useCallback((nextInventory, nextLoadout, extraFields = {}) => {
    if (!onProfileUpdate || !profile) return;
    setTimeout(() => {
      onProfileUpdate({
        ...profile,
        abilityInventory: nextInventory,
        abilityLoadout:   nextLoadout,
        ...extraFields,
      });
    }, 0);
  }, [profile, onProfileUpdate]);

  // ── Equip ─────────────────────────────────────────────────────────────────
  const equipAbility = useCallback((ability, slotKey) => {
    if (!ability || !slotKey) return;
    if (!isAbilityValidForSlot(ability, slotKey)) return;

    const displaced    = abilityLoadout[slotKey];
    const nextInventory = [
      ...abilityInventory.filter(a => a.instanceId !== ability.instanceId),
      ...(displaced ? [displaced] : []),
    ];
    const nextLoadout = { ...abilityLoadout, [slotKey]: ability };
    _commit(nextInventory, nextLoadout);
  }, [abilityInventory, abilityLoadout, _commit]);

  // ── Unequip ───────────────────────────────────────────────────────────────
  const unequipAbility = useCallback((slotKey) => {
    const ability = abilityLoadout[slotKey];
    if (!ability) return;
    const nextInventory = [...abilityInventory, ability];
    const nextLoadout   = { ...abilityLoadout, [slotKey]: null };
    _commit(nextInventory, nextLoadout);
  }, [abilityInventory, abilityLoadout, _commit]);

  // ── Salvage ───────────────────────────────────────────────────────────────
  const salvageAbility = useCallback((ability) => {
    if (!ability) return;
    const nextInventory  = abilityInventory.filter(a => a.instanceId !== ability.instanceId);
    const salvageGold    = ABILITY_SALVAGE_VALUE[ability.rarity] || 50;
    if (onProfileUpdate && profile) {
      setTimeout(() => {
        onProfileUpdate({
          ...profile,
          abilityInventory: nextInventory,
          gold: (profile.gold || 0) + salvageGold,
        });
      }, 0);
    }
  }, [abilityInventory, profile, onProfileUpdate]);

  // ── Add run loot ──────────────────────────────────────────────────────────
  const addAbilitiesToProfile = useCallback((abilities) => {
    if (!abilities || abilities.length === 0) return;
    const nextInventory = [...abilityInventory, ...abilities];
    _commit(nextInventory, abilityLoadout);
  }, [abilityInventory, abilityLoadout, _commit]);

  // Sort by rarity desc
  const sortedInventory = useMemo(() => {
    const ORDER = { secret:6, mythic:5, legendary:4, epic:3, rare:2, uncommon:1, common:0 };
    return [...abilityInventory].sort((a, b) => (ORDER[b.rarity] || 0) - (ORDER[a.rarity] || 0));
  }, [abilityInventory]);

  return {
    abilityInventory: sortedInventory,
    abilityLoadout,
    equipAbility,
    unequipAbility,
    salvageAbility,
    addAbilitiesToProfile,
    isInventoryFull: abilityInventory.length >= MAX_ABILITY_SLOTS,
  };
}
