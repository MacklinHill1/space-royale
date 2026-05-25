// hooks/usePersistence.js
//
// All localStorage interaction lives here. Nothing else in the codebase
// touches localStorage directly.
//
// Save schema versioning:
//   Every time the shape of savedData changes in a breaking way, bump
//   CURRENT_SAVE_VERSION and add a migration in MIGRATIONS.
//   Migrations run sequentially on load so a player on v1 who skips
//   updates will still arrive at v3 correctly.
//
// Phase 0: tracks bestScore per mode only.
// Phase 2: will add currencies, accountLevel, unlockedAbilities, etc.
//          Add those fields to DEFAULT_SAVE and write a v2 migration.

import { useState, useCallback, useRef } from 'react';

// ─── Schema ───────────────────────────────────────────────────────────────────

const SAVE_KEY = 'srr_save';
const CURRENT_SAVE_VERSION = 1;

/**
 * The canonical shape of a save file at CURRENT_SAVE_VERSION.
 * Future phases add keys here and write a migration to populate them
 * for players upgrading from an older version.
 */
const DEFAULT_SAVE = {
  version: CURRENT_SAVE_VERSION,

  // Per-mode best scores
  bestScores: {
    endless:  0,
    boss:     0,
    speed:    0,
    hardcore: 0,
    time:     0,
  },

  // ── Phase 2 will add: ────────────────────────────────────────
  // coins: 0,
  // gems: 0,
  // dungeonTokens: 0,
  // accountXP: 0,
  // accountLevel: 1,
  // ── Phase 3 will add: ────────────────────────────────────────
  // inventory: { equipment: [], abilities: [], cosmetics: [], consumables: [] },
  // equippedItems: { weaponCore: null, reactor: null, shield: null, engine: null, auxiliary: null },
  // ── Phase 5 will add: ────────────────────────────────────────
  // pityCounters: { equipment: 0, ability: 0, cosmetic: 0, premium: 0 },
};

// ─── Migrations ───────────────────────────────────────────────────────────────

/**
 * Each key is the version the save is currently AT.
 * The function transforms it to the next version.
 *
 * Example: a save at version 1 runs MIGRATIONS[1] to become version 2.
 */
const MIGRATIONS = {
  // When Phase 2 lands, add:
  // 1: (save) => ({
  //   ...save,
  //   version: 2,
  //   coins: 0,
  //   gems: 0,
  //   dungeonTokens: 0,
  //   accountXP: 0,
  //   accountLevel: 1,
  // }),
};

// ─── Load / Save Helpers ──────────────────────────────────────────────────────

function loadRaw() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    // Corrupted JSON — treat as no save
    return null;
  }
}

function applyMigrations(raw) {
  let data = raw;

  // Handle the legacy single-key format that existed before this schema
  // (the old code stored only `srr_best` as a plain integer)
  if (typeof data === 'number' || data === null) {
    const legacyBest = typeof data === 'number' ? data : 0;
    data = {
      ...DEFAULT_SAVE,
      bestScores: {
        ...DEFAULT_SAVE.bestScores,
        endless: legacyBest,
      },
    };
    return data;
  }

  // Run sequential migrations
  while (data.version < CURRENT_SAVE_VERSION) {
    const migration = MIGRATIONS[data.version];
    if (!migration) {
      // No migration defined — reset to default to avoid corrupt state
      console.warn(`[usePersistence] No migration for save version ${data.version}. Resetting.`);
      return { ...DEFAULT_SAVE };
    }
    data = migration(data);
  }

  // Fill in any keys missing from an older schema (additive fields)
  return deepMergeDefaults(DEFAULT_SAVE, data);
}

/**
 * Merge: for every key in `defaults`, if `target` doesn't have it, add it.
 * Does not overwrite existing values — this is for additive schema additions.
 */
function deepMergeDefaults(defaults, target) {
  const result = { ...target };
  for (const key of Object.keys(defaults)) {
    if (result[key] === undefined || result[key] === null) {
      result[key] = defaults[key];
    } else if (
      typeof defaults[key] === 'object' &&
      !Array.isArray(defaults[key]) &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMergeDefaults(defaults[key], result[key]);
    }
  }
  return result;
}

function persist(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    // Storage quota exceeded or private mode — degrade gracefully
    console.warn('[usePersistence] Could not write to localStorage:', e.message);
  }
}

function loadSave() {
  const raw = loadRaw();

  // Also check for the legacy integer key from before this system existed
  let legacyBestInt = 0;
  try {
    const legacyRaw = localStorage.getItem('srr_best');
    if (legacyRaw) {
      legacyBestInt = parseInt(legacyRaw, 10) || 0;
      // Remove the legacy key now that we've migrated it
      localStorage.removeItem('srr_best');
    }
  } catch { /* ignore */ }

  if (!raw) {
    const fresh = { ...DEFAULT_SAVE };
    if (legacyBestInt > 0) {
      fresh.bestScores.endless = legacyBestInt;
    }
    return fresh;
  }

  const migrated = applyMigrations(raw);

  // Merge in legacy best if it's higher (e.g. played on old version, then updated)
  if (legacyBestInt > migrated.bestScores.endless) {
    migrated.bestScores.endless = legacyBestInt;
  }

  return migrated;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} PersistenceResult
 * @property {Object}   save                  - The full current save object (read-only reference)
 * @property {Function} getBestScore          - (mode: string) => number
 * @property {Function} recordRunResult       - (result: RunResult) => void  — call at end of every run
 * @property {Function} resetSave             - () => void  — wipes all data (settings screen)
 */

/**
 * @typedef {Object} RunResult
 * @property {string} mode
 * @property {number} score
 * @property {number} kills
 * @property {number} level
 * @property {number} wave
 * @property {number} sessionTime
 */

/**
 * Manages all persistent player data.
 * Returns stable callbacks (useCallback with ref) — safe to pass to GameEngine.
 *
 * @returns {PersistenceResult}
 */
export function usePersistence() {
const [save, setSave] = useState(() => loadSave());

const saveRef = useRef(save);

useEffect(() => {
  saveRef.current = save;
}, [save]);

  /**
   * Returns the best score for a given game mode.
   */
  const getBestScore = useCallback((mode) => {
    return saveRef.current.bestScores[mode] ?? 0;
  }, []);

  /**
   * Called at the end of every run with the run's final statistics.
   * Updates best scores and (in future phases) grants currency/XP.
   *
   * @param {RunResult} result
   */
  const recordRunResult = useCallback((result) => {
    const { mode, score } = result;

    setSave(prev => {
      const currentBest = prev.bestScores[mode] ?? 0;
      if (score <= currentBest) return prev; // nothing changed

      const next = {
        ...prev,
        bestScores: {
          ...prev.bestScores,
          [mode]: score,
        },
      };

      persist(next);
      return next;
    });

    // Phase 2 hook point:
    // grantCurrencyForRun(result);
    // grantAccountXP(result);
  }, []);

  /**
   * Wipes all save data and resets to defaults.
   * Intended for a "Reset Progress" button in settings.
   */
  const resetSave = useCallback(() => {
    const fresh = { ...DEFAULT_SAVE };
    persist(fresh);
    setSave(fresh);
  }, []);

  return { save, getBestScore, recordRunResult, resetSave };
}
