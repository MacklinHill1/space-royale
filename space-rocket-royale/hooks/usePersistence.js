// hooks/usePersistence.js
// Save v4 — adds Rubies, Account Level, Achievements, Daily Missions,
//            Tech Tree, Pets, Shop Ranks, Prestige, and all new mode best scores.

import { useState, useCallback, useRef, useEffect } from 'react';
import { getInitialLoadout } from '../constants/EquipmentData.js';
import { getInitialAbilityLoadout } from '../constants/AbilityData.js';
import { getDailySeed, generateDailyMissions } from '../systems/MetaProgression.js';
import { GAME_MODES } from '../constants/GameModes.js';

const SAVE_KEY = 'srr_save';
const CURRENT_SAVE_VERSION = 4;

function defaultBestScores() {
  const scores = {};
  for (const m of GAME_MODES) scores[m.id] = 0;
  scores.endless  = 0;
  scores.boss     = 0;
  scores.speed    = 0;
  scores.hardcore = 0;
  scores.time     = 0;
  return scores;
}

const DEFAULT_SAVE = {
  version: CURRENT_SAVE_VERSION,

  bestScores: defaultBestScores(),

  gold:   0,
  rubies: 0,

  gearInventory: [],
  gearLoadout:   null,

  abilityInventory: [],
  abilityLoadout:   null,

  inventory: [],

  accountXP:      0,
  researchPoints: 0,

  unlockedAchievements: [],
  achievementStats: {
    total_kills:          0,
    total_elites:         0,
    total_bosses:         0,
    total_crits:          0,
    unique_bosses:        [],
    raids_completed:      0,
    world_bosses:         0,
    legendary_items:      0,
    mythic_items:         0,
    total_gear:           0,
    full_loadout:         0,
    set_bonus_active:     0,
    total_abilities:      0,
    unique_abilities:     [],
    legendary_abilities:  0,
    full_ability_loadout: 0,
    total_pets:           0,
    unique_pets:          [],
    legendary_pets:       0,
    account_level:        1,
    tech_branch_maxed:    0,
    prestige_count:       0,
    modes_played:         [],
    run_minutes:          0,
    run_kills:            0,
    run_bosses:           0,
    run_elites:           0,
    run_gold:             0,
    run_crits:            0,
    run_gear:             0,
    run_abilities:        0,
    run_shop_buys:        0,
    chests_opened:        0,
    total_runs:           0,
  },

  dailyMissions:    [],
  dailyMissionSeed: 0,

  techUnlocked: [],

  petInventory: [],
  activePetId:  null,

  shopPurchasedRanks: {},

  prestigeLevel:     0,
  cosmicShards:      0,
  prestigePurchased: [],

  unlockedTitles: [],
  activeTitleId:  null,

  hourlyShopPurchased: {},

  pendingBoosts: [],

  pendingChests: [],
};

// ── Migration chain ──────────────────────────────────────────────────────────

function migrate(raw) {
  let s = raw;

  // v1 → v2
  if ((s.version ?? 1) < 2) {
    s = {
      ...s,
      version: 2,
      gearInventory: s.gearInventory ?? [],
      gearLoadout:   s.gearLoadout   ?? null,
    };
  }

  // v2 → v3
  if (s.version < 3) {
    s = {
      ...s,
      version: 3,
      abilityInventory: s.abilityInventory ?? [],
      abilityLoadout:   s.abilityLoadout   ?? null,
      bestScores: {
        ...defaultBestScores(),
        ...(s.bestScores ?? {}),
        // migrate old scalar
        endless: s.highScore ?? s.bestScores?.endless ?? 0,
      },
    };
  }

  // v3 → v4
  if (s.version < 4) {
    const def = DEFAULT_SAVE;
    s = {
      ...s,
      version: 4,
      rubies:              s.rubies              ?? def.rubies,
      accountXP:           s.accountXP           ?? def.accountXP,
      researchPoints:      s.researchPoints      ?? def.researchPoints,
      unlockedAchievements:s.unlockedAchievements?? def.unlockedAchievements,
      achievementStats: {
        ...def.achievementStats,
        ...(s.achievementStats ?? {}),
      },
      dailyMissions:       s.dailyMissions       ?? def.dailyMissions,
      dailyMissionSeed:    s.dailyMissionSeed    ?? def.dailyMissionSeed,
      techUnlocked:        s.techUnlocked        ?? def.techUnlocked,
      petInventory:        s.petInventory        ?? def.petInventory,
      activePetId:         s.activePetId         ?? def.activePetId,
      shopPurchasedRanks:  s.shopPurchasedRanks  ?? def.shopPurchasedRanks,
      prestigeLevel:       s.prestigeLevel       ?? def.prestigeLevel,
      cosmicShards:        s.cosmicShards        ?? def.cosmicShards,
      prestigePurchased:   s.prestigePurchased   ?? def.prestigePurchased,
      unlockedTitles:      s.unlockedTitles      ?? def.unlockedTitles,
      activeTitleId:       s.activeTitleId       ?? def.activeTitleId,
      hourlyShopPurchased: s.hourlyShopPurchased ?? def.hourlyShopPurchased,
      pendingBoosts:       s.pendingBoosts       ?? def.pendingBoosts,
      pendingChests:       s.pendingChests       ?? def.pendingChests,
      bestScores: {
        ...defaultBestScores(),
        ...(s.bestScores ?? {}),
      },
    };
  }

  return s;
}

function deepMergeDefaults(saved, defaults) {
  const result = { ...defaults };
  for (const key of Object.keys(saved)) {
    if (key in defaults && typeof defaults[key] === 'object' && !Array.isArray(defaults[key]) && defaults[key] !== null) {
      result[key] = deepMergeDefaults(saved[key] ?? {}, defaults[key]);
    } else {
      result[key] = saved[key];
    }
  }
  return result;
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    let parsed = JSON.parse(raw);
    parsed = migrate(parsed);
    const merged = deepMergeDefaults(parsed, DEFAULT_SAVE);

    // Refresh daily missions if seed changed
    const todaySeed = getDailySeed();
    if (merged.dailyMissionSeed !== todaySeed || merged.dailyMissions.length === 0) {
      merged.dailyMissions    = generateDailyMissions(todaySeed);
      merged.dailyMissionSeed = todaySeed;
    }

    return merged;
  } catch (e) {
    console.warn('[usePersistence] load failed, resetting:', e);
    return { ...DEFAULT_SAVE };
  }
}

function persistSave(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[usePersistence] persist failed:', e);
  }
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function usePersistence() {
  const [save, setSave] = useState(() => {
    if (typeof window === 'undefined') return { ...DEFAULT_SAVE };
    return loadSave();
  });
  const saveRef = useRef(save);

  // Keep ref in sync so callbacks never stale-close over old state
  useEffect(() => { saveRef.current = save; }, [save]);

  const update = useCallback((updater) => {
    setSave(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      persistSave(next);
      return next;
    });
  }, []);

  // ── Score tracking ──────────────────────────────────────────────────────

  const recordRunResult = useCallback(({ mode = 'classic', score = 0, goldEarned = 0 } = {}) => {
    update(prev => {
      const newBest = { ...prev.bestScores };
      if (score > (newBest[mode] ?? 0)) newBest[mode] = score;
      return {
        ...prev,
        gold: (prev.gold ?? 0) + goldEarned,
        bestScores: newBest,
      };
    });
  }, [update]);

  // ── Economy ─────────────────────────────────────────────────────────────

  const addGold = useCallback((amount) => {
    update(prev => ({ ...prev, gold: Math.max(0, (prev.gold ?? 0) + amount) }));
  }, [update]);

  const spendGold = useCallback((amount) => {
    update(prev => ({ ...prev, gold: Math.max(0, (prev.gold ?? 0) - amount) }));
  }, [update]);

  const addRubies = useCallback((amount) => {
    update(prev => ({ ...prev, rubies: (prev.rubies ?? 0) + amount }));
  }, [update]);

  const spendRubies = useCallback((amount) => {
    update(prev => ({ ...prev, rubies: Math.max(0, (prev.rubies ?? 0) - amount) }));
  }, [update]);

  // ── Account XP ──────────────────────────────────────────────────────────

  const addAccountXP = useCallback((amount) => {
    update(prev => ({ ...prev, accountXP: (prev.accountXP ?? 0) + amount }));
  }, [update]);

  // ── Research Points ─────────────────────────────────────────────────────

  const addResearchPoints = useCallback((amount) => {
    update(prev => ({ ...prev, researchPoints: (prev.researchPoints ?? 0) + amount }));
  }, [update]);

  const spendResearchPoints = useCallback((amount) => {
    update(prev => ({ ...prev, researchPoints: Math.max(0, (prev.researchPoints ?? 0) - amount) }));
  }, [update]);

  // ── Tech Tree ───────────────────────────────────────────────────────────

  const unlockTechNode = useCallback((nodeId) => {
    update(prev => {
      if (prev.techUnlocked.includes(nodeId)) return prev;
      return { ...prev, techUnlocked: [...prev.techUnlocked, nodeId] };
    });
  }, [update]);

  // ── Achievements ─────────────────────────────────────────────────────────

  const unlockAchievement = useCallback((id) => {
    update(prev => {
      if (prev.unlockedAchievements.includes(id)) return prev;
      return { ...prev, unlockedAchievements: [...prev.unlockedAchievements, id] };
    });
  }, [update]);

  const updateAchievementStat = useCallback((key, value) => {
    update(prev => ({
      ...prev,
      achievementStats: {
        ...prev.achievementStats,
        [key]: (prev.achievementStats[key] ?? 0) + value,
      },
    }));
  }, [update]);

  const setAchievementStats = useCallback((updates) => {
    update(prev => ({
      ...prev,
      achievementStats: {
        ...prev.achievementStats,
        ...updates,
      },
    }));
  }, [update]);

  // ── Daily Missions ──────────────────────────────────────────────────────

  const updateMissionProgress = useCallback((missionIndex, progress) => {
    update(prev => {
      const missions = prev.dailyMissions.map((m, i) =>
        i === missionIndex ? { ...m, progress: Math.min(m.target, (m.progress ?? 0) + progress) } : m
      );
      return { ...prev, dailyMissions: missions };
    });
  }, [update]);

  const completeMission = useCallback((missionIndex) => {
    update(prev => {
      const missions = prev.dailyMissions.map((m, i) =>
        i === missionIndex ? { ...m, claimed: true } : m
      );
      return { ...prev, dailyMissions: missions };
    });
  }, [update]);

  // ── Pets ────────────────────────────────────────────────────────────────

  const addPet = useCallback((pet) => {
    update(prev => ({
      ...prev,
      petInventory: [...prev.petInventory, pet],
    }));
  }, [update]);

  const setActivePet = useCallback((petId) => {
    update(prev => ({ ...prev, activePetId: petId }));
  }, [update]);

  // ── Shop Ranks ──────────────────────────────────────────────────────────

  const updateShopRanks = useCallback((updatedRanks) => {
    update(prev => ({
      ...prev,
      shopPurchasedRanks: { ...prev.shopPurchasedRanks, ...updatedRanks },
    }));
  }, [update]);

  const resetShopRanks = useCallback(() => {
    update(prev => ({ ...prev, shopPurchasedRanks: {} }));
  }, [update]);

  // ── Prestige ─────────────────────────────────────────────────────────────

  const performPrestige = useCallback(({ shardsGained = 0 } = {}) => {
    update(prev => ({
      ...DEFAULT_SAVE,
      version: CURRENT_SAVE_VERSION,
      // Keep permanent stuff
      rubies:              prev.rubies,
      accountXP:           prev.accountXP,
      researchPoints:      prev.researchPoints,
      unlockedAchievements:prev.unlockedAchievements,
      achievementStats:    prev.achievementStats,
      techUnlocked:        prev.techUnlocked,
      petInventory:        prev.petInventory,
      activePetId:         prev.activePetId,
      unlockedTitles:      prev.unlockedTitles,
      activeTitleId:       prev.activeTitleId,
      bestScores:          prev.bestScores,
      dailyMissions:       prev.dailyMissions,
      dailyMissionSeed:    prev.dailyMissionSeed,
      // Prestige specific
      prestigeLevel:       (prev.prestigeLevel ?? 0) + 1,
      cosmicShards:        (prev.cosmicShards  ?? 0) + shardsGained,
      prestigePurchased:   prev.prestigePurchased,
    }));
  }, [update]);

  const buyPrestigeUpgrade = useCallback((upgradeId) => {
    update(prev => {
      if (prev.prestigePurchased.includes(upgradeId)) return prev;
      return { ...prev, prestigePurchased: [...prev.prestigePurchased, upgradeId] };
    });
  }, [update]);

  // ── Hourly Shop ─────────────────────────────────────────────────────────

  const recordHourlyShopPurchase = useCallback((itemId, hourKey) => {
    update(prev => ({
      ...prev,
      hourlyShopPurchased: {
        ...prev.hourlyShopPurchased,
        [`${hourKey}_${itemId}`]: true,
      },
    }));
  }, [update]);

  // ── Titles ───────────────────────────────────────────────────────────────

  const setActiveTitle = useCallback((titleId) => {
    update(prev => ({ ...prev, activeTitleId: titleId }));
  }, [update]);

  // ── Pending Boosts ───────────────────────────────────────────────────────

  const addPendingBoost = useCallback((boost) => {
    update(prev => ({ ...prev, pendingBoosts: [...prev.pendingBoosts, boost] }));
  }, [update]);

  const consumePendingBoosts = useCallback(() => {
    const boosts = saveRef.current.pendingBoosts ?? [];
    update(prev => ({ ...prev, pendingBoosts: [] }));
    return boosts;
  }, [update]);

  // ── Chests ───────────────────────────────────────────────────────────────

  const addPendingChest = useCallback((chest) => {
    update(prev => ({ ...prev, pendingChests: [...(prev.pendingChests ?? []), chest] }));
  }, [update]);

  const removePendingChest = useCallback((chestId) => {
    update(prev => ({
      ...prev,
      pendingChests: (prev.pendingChests ?? []).filter(c => c.id !== chestId),
    }));
  }, [update]);

  // ── Gear Hangar ──────────────────────────────────────────────────────────

  const setGearInventory = useCallback((inv) => {
    update(prev => ({ ...prev, gearInventory: inv }));
  }, [update]);

  const setGearLoadout = useCallback((loadout) => {
    update(prev => ({ ...prev, gearLoadout: loadout }));
  }, [update]);

  // ── Ability Vault ─────────────────────────────────────────────────────────

  const setAbilityInventory = useCallback((inv) => {
    update(prev => ({ ...prev, abilityInventory: inv }));
  }, [update]);

  const setAbilityLoadout = useCallback((loadout) => {
    update(prev => ({ ...prev, abilityLoadout: loadout }));
  }, [update]);

  // ── Best score lookup ─────────────────────────────────────────────────────

  const getBestScore = useCallback((mode) => {
    return saveRef.current.bestScores?.[mode] ?? 0;
  }, []);

  // ── Force sync — used by useAbilities to commit profile-wide updates ─────
  // Called with the entire updated profile object.

  const forceManualSync = useCallback((nextProfile) => {
    if (!nextProfile || typeof nextProfile !== 'object') return;
    setSave(prev => {
      const next = { ...prev, ...nextProfile };
      persistSave(next);
      return next;
    });
  }, []);

  // ── Run loot helpers ──────────────────────────────────────────────────────

  const addRunLootToProfile = useCallback((items) => {
    if (!items?.length) return;
    update(prev => ({
      ...prev,
      gearInventory: [...(prev.gearInventory ?? []), ...items],
      achievementStats: {
        ...prev.achievementStats,
        total_gear: (prev.achievementStats?.total_gear ?? 0) + items.length,
      },
    }));
  }, [update]);

  const addRunAbilitiesToProfile = useCallback((items) => {
    if (!items?.length) return;
    update(prev => ({
      ...prev,
      abilityInventory: [...(prev.abilityInventory ?? []), ...items],
      achievementStats: {
        ...prev.achievementStats,
        total_abilities: (prev.achievementStats?.total_abilities ?? 0) + items.length,
      },
    }));
  }, [update]);

  // ── Full save overwrite (e.g. from import) ────────────────────────────────

  const importSave = useCallback((data) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const migrated = migrate(parsed);
      const merged = deepMergeDefaults(migrated, DEFAULT_SAVE);
      persistSave(merged);
      setSave(merged);
    } catch (e) {
      console.warn('[usePersistence] importSave failed:', e);
    }
  }, []);

  const resetSave = useCallback(() => {
    const fresh = { ...DEFAULT_SAVE };
    persistSave(fresh);
    setSave(fresh);
  }, []);

  return {
    save,

    // Core
    recordRunResult,
    addGold,
    spendGold,

    // Rubies
    addRubies,
    spendRubies,

    // Account XP
    addAccountXP,

    // Research
    addResearchPoints,
    spendResearchPoints,

    // Tech Tree
    unlockTechNode,

    // Achievements
    unlockAchievement,
    updateAchievementStat,
    setAchievementStats,

    // Missions
    updateMissionProgress,
    completeMission,

    // Pets
    addPet,
    setActivePet,

    // Shop
    updateShopRanks,
    resetShopRanks,

    // Prestige
    performPrestige,
    buyPrestigeUpgrade,

    // Hourly Shop
    recordHourlyShopPurchase,

    // Titles
    setActiveTitle,

    // Boosts
    addPendingBoost,
    consumePendingBoosts,

    // Chests
    addPendingChest,
    removePendingChest,

    // Gear/Abilities
    setGearInventory,
    setGearLoadout,
    setAbilityInventory,
    setAbilityLoadout,

    // Loot helpers
    addRunLootToProfile,
    addRunAbilitiesToProfile,

    // Best score
    getBestScore,

    // Force sync (used by useAbilities)
    forceManualSync,

    // Save management
    importSave,
    resetSave,
  };
}

export default usePersistence;
