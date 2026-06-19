// hooks/usePersistence.js

import { useState, useCallback, useRef, useEffect } from 'react';
import { getInitialLoadout } from '../constants/EquipmentData.js';
import { getInitialAbilityLoadout } from '../constants/AbilityData.js';

const SAVE_KEY = 'srr_save';
const CURRENT_SAVE_VERSION = 3;

const DEFAULT_SAVE = {
  version: CURRENT_SAVE_VERSION,
  bestScores: {
    endless:  0,
    boss:     0,
    speed:    0,
    hardcore: 0,
    time:     0,
  },
  gold: 0,
  // ── GEAR HANGAR (equipment only) ──────────────────────────
  gearInventory: [],      // Item[] — all collected gear pieces
  gearLoadout:   null,    // populated with getInitialLoadout() on first access
  // ── ABILITY VAULT ─────────────────────────────────────────
  abilityInventory: [],   // AbilityInstance[] — all collected abilities
  abilityLoadout:   null, // populated with getInitialAbilityLoadout() on first access
  // ── INVENTORY (chests, boosts, consumables, etc.) ─────────
  inventory: [],
};

function loadRaw() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function migrate(raw) {
  if (!raw) return null;
  let data = { ...raw };

  // v1 → v2: rename equippedItems → gearLoadout, add gearInventory
  if (!data.version || data.version < 2) {
    data.version = 2;
    if (data.equippedItems && !data.gearLoadout) {
      const old = data.equippedItems;
      data.gearLoadout = {
        ...getInitialLoadout(),
        weapon:   old.weapon   || null,
        armor:    old.armor    || null,
        module_a: old.mod1     || null,
        module_b: old.mod2     || null,
      };
      delete data.equippedItems;
    }
    if (data.inventory && !data.gearInventory) {
      data.gearInventory = data.inventory || [];
    }
  }

  // v2 → v3: add abilityInventory + abilityLoadout, drop old ability fields
  if (data.version < 3) {
    data.version = 3;
    if (!data.abilityInventory) data.abilityInventory = [];
    if (!data.abilityLoadout)   data.abilityLoadout   = getInitialAbilityLoadout();
    // Migrate old unlockedAbilities/equippedAbilities if they existed
    if (data.unlockedAbilities) delete data.unlockedAbilities;
    if (data.equippedAbilities) delete data.equippedAbilities;
  }

  return data;
}

function deepMergeDefaults(defaults, target) {
  const result = { ...target };
  for (const key of Object.keys(defaults)) {
    if (result[key] === undefined || result[key] === null) {
      result[key] = defaults[key];
    } else if (
      defaults[key] !== null &&
      typeof defaults[key] === 'object' &&
      !Array.isArray(defaults[key]) &&
      result[key] !== null &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMergeDefaults(defaults[key], result[key]);
    }
  }
  return result;
}

function loadSave() {
  const raw = loadRaw();
  if (!raw) return {
    ...DEFAULT_SAVE,
    gearLoadout:    getInitialLoadout(),
    abilityLoadout: getInitialAbilityLoadout(),
  };
  const migrated = migrate(raw) || raw;
  const merged = deepMergeDefaults(DEFAULT_SAVE, migrated);
  if (!merged.gearLoadout)    merged.gearLoadout    = getInitialLoadout();
  if (!merged.abilityLoadout) merged.abilityLoadout = getInitialAbilityLoadout();
  return merged;
}

function persistSave(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[usePersistence] write failed:', e.message);
  }
}

export function usePersistence() {
  const [save, setSave] = useState(() => loadSave());
  const saveRef = useRef(save);

  useEffect(() => { saveRef.current = save; }, [save]);

  const getBestScore = useCallback((mode) => saveRef.current.bestScores[mode] ?? 0, []);

  const forceManualSync = useCallback((updatedSave) => {
    setSave(updatedSave);
  }, []);

  const recordRunResult = useCallback((result) => {
    const { mode, score } = result;
    setSave(prev => {
      const currentBest = prev.bestScores[mode] ?? 0;
      if (score <= currentBest) return prev;
      const next = { ...prev, bestScores: { ...prev.bestScores, [mode]: score } };
      persistSave(next);
      return next;
    });
  }, []);

  // Called when player picks up gear mid-run — adds to gearInventory
  const addRunLootToProfile = useCallback((lootItems) => {
    if (!lootItems || lootItems.length === 0) return;
    setSave(prev => {
      const next = {
        ...prev,
        gearInventory: [...(prev.gearInventory || []), ...lootItems],
      };
      persistSave(next);
      return next;
    });
  }, []);

  // Called when player picks up an ability mid-run
  const addRunAbilitiesToProfile = useCallback((abilityItems) => {
    if (!abilityItems || abilityItems.length === 0) return;
    setSave(prev => {
      const next = {
        ...prev,
        abilityInventory: [...(prev.abilityInventory || []), ...abilityItems],
      };
      persistSave(next);
      return next;
    });
  }, []);

  const resetSave = useCallback(() => {
    const fresh = {
      ...DEFAULT_SAVE,
      gearLoadout:    getInitialLoadout(),
      abilityLoadout: getInitialAbilityLoadout(),
    };
    persistSave(fresh);
    setSave(fresh);
  }, []);

  return {
    save,
    getBestScore,
    recordRunResult,
    addRunLootToProfile,
    addRunAbilitiesToProfile,
    forceManualSync,
    resetSave,
  };
}
