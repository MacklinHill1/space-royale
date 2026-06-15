// src/hooks/usePersistence.js

import { useState, useCallback, useRef, useEffect } from 'react';

const SAVE_KEY = 'srr_save';
const CURRENT_SAVE_VERSION = 1;

const DEFAULT_SAVE = {
  version: CURRENT_SAVE_VERSION,
  bestScores: {
    endless:  0,
    boss:     0,
    speed:    0,
    hardcore: 0,
    time:     0,
  },
  inventory: [],
  equippedItems: {
    weapon: null,
    armor: null,
    utility: null,
    mod1: null,
    mod2: null,
  },
  gold: 0
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

function loadSave() {
  const raw = loadRaw();
  if (!raw) return { ...DEFAULT_SAVE };
  return deepMergeDefaults(DEFAULT_SAVE, raw);
}

export function usePersistence() {
  const [save, setSave] = useState(() => loadSave());
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const getBestScore = useCallback((mode) => {
    return saveRef.current.bestScores[mode] ?? 0;
  }, []);

  const forceManualSync = useCallback((updatedSave) => {
    setSave(updatedSave);
  }, []);

  const recordRunResult = useCallback((result) => {
    const { mode, score } = result;
    setSave(prev => {
      const currentBest = prev.bestScores[mode] ?? 0;
      if (score <= currentBest) return prev;

      const next = {
        ...prev,
        bestScores: {
          ...prev.bestScores,
          [mode]: score,
        },
      };

      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('[usePersistence] Storage execution write blocked:', e.message);
      }
      return next;
    });
  }, []);

  const resetSave = useCallback(() => {
    const fresh = { ...DEFAULT_SAVE };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
    } catch(e){}
    setSave(fresh);
  }, []);

  return { save, getBestScore, recordRunResult, resetSave, forceManualSync };
}