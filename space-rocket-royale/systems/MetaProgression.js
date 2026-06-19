// systems/MetaProgression.js
// Rubies, Account Level, Achievements, Daily Missions, Tech Tree, Pets, Prestige.

// ─────────────────────────────────────────────────────────────────────────────
// RUBIES
// ─────────────────────────────────────────────────────────────────────────────

export const RUBY_DROPS = {
  regular_boss:   [1,   5],
  elite_boss:     [5,  15],
  raid_boss:      [25, 100],
  world_boss:     [100, 500],
  chest_basic:    [0,   2],
  chest_rare:     [2,   8],
  chest_epic:     [5,  20],
  chest_legendary:[15, 50],
  chest_mythic:   [30, 100],
  achievement:    null,   // defined per-achievement
  mission:        null,   // defined per-mission
};

export function rollRubyDrop(type, mult = 1) {
  const range = RUBY_DROPS[type];
  if (!range) return 0;
  const [min, max] = range;
  return Math.round((min + Math.random() * (max - min)) * mult);
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT LEVEL
// ─────────────────────────────────────────────────────────────────────────────

export const ACCOUNT_LEVEL_XP_BASE = 500;   // XP needed for level 2
export const ACCOUNT_LEVEL_XP_SCALE = 1.18; // multiplier per level

export function xpForLevel(level) {
  // Total XP to reach `level` from scratch
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += Math.floor(ACCOUNT_LEVEL_XP_BASE * Math.pow(ACCOUNT_LEVEL_XP_SCALE, l - 1));
  }
  return total;
}

export function xpNeededForNextLevel(level) {
  return Math.floor(ACCOUNT_LEVEL_XP_BASE * Math.pow(ACCOUNT_LEVEL_XP_SCALE, level - 1));
}

export function computeAccountLevel(totalXP) {
  let level = 1;
  let remaining = totalXP;
  while (remaining >= xpNeededForNextLevel(level)) {
    remaining -= xpNeededForNextLevel(level);
    level++;
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpNeededForNextLevel(level) };
}

// XP awarded per run event
export const ACCOUNT_XP_REWARDS = {
  boss_killed:       150,
  elite_killed:       30,
  run_completed:     200,
  run_per_minute:     20,    // * minutes survived
  achievement_unlocked: 300,
  mission_completed:   100,
};

// Level-up rewards
export const LEVEL_REWARDS = [
  { level: 5,  reward: { rubies: 50,  title: 'Space Cadet' } },
  { level: 10, reward: { rubies: 100, researchPoints: 5, title: 'Pilot' } },
  { level: 15, reward: { rubies: 150, researchPoints: 10 } },
  { level: 20, reward: { rubies: 250, title: 'Commander', researchPoints: 15 } },
  { level: 25, reward: { rubies: 300, researchPoints: 20 } },
  { level: 30, reward: { rubies: 500, title: 'Admiral', researchPoints: 25 } },
  { level: 40, reward: { rubies: 750, researchPoints: 40 } },
  { level: 50, reward: { rubies: 1000, title: 'Galactic Legend', researchPoints: 60, cosmicShards: 5 } },
];

export function getLevelReward(level) {
  return LEVEL_REWARDS.find(r => r.level === level)?.reward || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const ACHIEVEMENTS = [
  // ── Combat ───────────────────────────────────────────────────────────────
  { id: 'first_blood',         cat: 'Combat',      name: 'First Blood',             desc: 'Kill your first enemy',                          goal: 1,      stat: 'total_kills',       reward: { rubies: 10 } },
  { id: 'centurion',           cat: 'Combat',      name: 'Centurion',               desc: 'Kill 100 enemies in a single run',               goal: 100,    stat: 'run_kills',         reward: { rubies: 25 } },
  { id: 'unstoppable',         cat: 'Combat',      name: 'Unstoppable',             desc: 'Kill 500 total enemies',                         goal: 500,    stat: 'total_kills',       reward: { rubies: 30 } },
  { id: 'killing_machine',     cat: 'Combat',      name: 'Killing Machine',         desc: 'Kill 5,000 total enemies',                       goal: 5000,   stat: 'total_kills',       reward: { rubies: 100, title: 'Killing Machine' } },
  { id: 'elite_hunter',        cat: 'Combat',      name: 'Elite Hunter',            desc: 'Kill 50 elite enemies',                          goal: 50,     stat: 'total_elites',      reward: { rubies: 40 } },
  { id: 'crit_master',         cat: 'Combat',      name: 'Critical Strike',         desc: 'Land 500 critical hits',                         goal: 500,    stat: 'total_crits',       reward: { rubies: 35, researchPoints: 5 } },
  { id: 'survivor_5',          cat: 'Combat',      name: 'Survivor I',              desc: 'Survive for 5 minutes in Classic',               goal: 5,      stat: 'run_minutes',       reward: { rubies: 20 } },
  { id: 'survivor_15',         cat: 'Combat',      name: 'Survivor II',             desc: 'Survive for 15 minutes in Classic',              goal: 15,     stat: 'run_minutes',       reward: { rubies: 50, title: 'Survivor' } },
  { id: 'survivor_30',         cat: 'Combat',      name: 'Survivor III',            desc: 'Survive for 30 minutes in Classic',              goal: 30,     stat: 'run_minutes',       reward: { rubies: 150, title: 'Legend', researchPoints: 10 } },

  // ── Bosses ───────────────────────────────────────────────────────────────
  { id: 'boss_slayer',         cat: 'Bosses',      name: 'Boss Slayer',             desc: 'Kill your first boss',                           goal: 1,      stat: 'total_bosses',      reward: { rubies: 20 } },
  { id: 'boss_veteran',        cat: 'Bosses',      name: 'Boss Veteran',            desc: 'Kill 25 bosses total',                           goal: 25,     stat: 'total_bosses',      reward: { rubies: 75 } },
  { id: 'boss_destroyer',      cat: 'Bosses',      name: 'Boss Destroyer',          desc: 'Kill 100 bosses total',                          goal: 100,    stat: 'total_bosses',      reward: { rubies: 250, title: 'Boss Destroyer' } },
  { id: 'all_bosses',          cat: 'Bosses',      name: 'Encyclopedia of Ruin',    desc: 'Kill every unique boss at least once',           goal: 7,      stat: 'unique_bosses',     reward: { rubies: 100, researchPoints: 20 } },
  { id: 'raid_clear',          cat: 'Bosses',      name: 'Raid Master',             desc: 'Complete a Raid Bosses run',                     goal: 1,      stat: 'raids_completed',   reward: { rubies: 75 } },
  { id: 'world_boss_hunter',   cat: 'Bosses',      name: 'World Boss Hunter',       desc: 'Kill 10 world bosses',                           goal: 10,     stat: 'world_bosses',      reward: { rubies: 200, title: 'World Breaker' } },

  // ── Equipment ────────────────────────────────────────────────────────────
  { id: 'first_legendary',     cat: 'Equipment',   name: 'Legendary Find',          desc: 'Collect your first Legendary item',              goal: 1,      stat: 'legendary_items',   reward: { rubies: 50 } },
  { id: 'first_mythic',        cat: 'Equipment',   name: 'Mythic Relic',            desc: 'Collect your first Mythic item',                 goal: 1,      stat: 'mythic_items',      reward: { rubies: 150, title: 'Relic Hunter' } },
  { id: 'gear_hoarder',        cat: 'Equipment',   name: 'Gear Hoarder',            desc: 'Collect 50 equipment pieces',                    goal: 50,     stat: 'total_gear',        reward: { rubies: 60 } },
  { id: 'loadout_complete',    cat: 'Equipment',   name: 'Battle Ready',            desc: 'Fill all 9 gear slots',                          goal: 1,      stat: 'full_loadout',      reward: { rubies: 40, researchPoints: 5 } },
  { id: 'set_bonuses',         cat: 'Equipment',   name: 'Set Collector',           desc: 'Equip a complete 3-piece gear set',              goal: 1,      stat: 'set_bonus_active',  reward: { rubies: 80 } },

  // ── Abilities ────────────────────────────────────────────────────────────
  { id: 'first_ability',       cat: 'Abilities',   name: 'Power Awakened',          desc: 'Collect your first ability',                     goal: 1,      stat: 'total_abilities',   reward: { rubies: 15 } },
  { id: 'ability_vault_10',    cat: 'Abilities',   name: 'Ability Collector',       desc: 'Collect 10 different abilities',                 goal: 10,     stat: 'unique_abilities',  reward: { rubies: 50 } },
  { id: 'legendary_ability',   cat: 'Abilities',   name: 'Legendary Power',         desc: 'Collect a Legendary ability',                    goal: 1,      stat: 'legendary_abilities',reward: { rubies: 100 } },
  { id: 'full_ability_loadout',cat: 'Abilities',   name: 'Power Overwhelming',      desc: 'Fill all 7 ability slots',                       goal: 1,      stat: 'full_ability_loadout',reward: { rubies: 60, researchPoints: 10 } },

  // ── Pets ─────────────────────────────────────────────────────────────────
  { id: 'first_pet',           cat: 'Pets',        name: 'Companionship',           desc: 'Collect your first pet',                         goal: 1,      stat: 'total_pets',        reward: { rubies: 30 } },
  { id: 'pet_collector',       cat: 'Pets',        name: 'Pet Collector',           desc: 'Collect 5 different pets',                       goal: 5,      stat: 'unique_pets',       reward: { rubies: 100, title: 'Beast Tamer' } },
  { id: 'legendary_pet',       cat: 'Pets',        name: 'Legendary Companion',     desc: 'Collect a Legendary pet',                        goal: 1,      stat: 'legendary_pets',    reward: { rubies: 150 } },

  // ── Progression ──────────────────────────────────────────────────────────
  { id: 'account_10',          cat: 'Progression', name: 'Rising Star',             desc: 'Reach Account Level 10',                         goal: 10,     stat: 'account_level',     reward: { rubies: 50 } },
  { id: 'account_25',          cat: 'Progression', name: 'Veteran',                 desc: 'Reach Account Level 25',                         goal: 25,     stat: 'account_level',     reward: { rubies: 150, title: 'Veteran' } },
  { id: 'account_50',          cat: 'Progression', name: 'Legendary Status',        desc: 'Reach Account Level 50',                         goal: 50,     stat: 'account_level',     reward: { rubies: 500, cosmicShards: 3 } },
  { id: 'tech_branch_done',    cat: 'Progression', name: 'Research Complete',       desc: 'Fully unlock a tech tree branch',                goal: 1,      stat: 'tech_branch_maxed', reward: { rubies: 200, researchPoints: 25 } },
  { id: 'prestige_1',          cat: 'Progression', name: 'Reborn',                  desc: 'Complete your first Prestige',                   goal: 1,      stat: 'prestige_count',    reward: { rubies: 500, cosmicShards: 10, title: 'Prestige I' } },
  { id: 'modes_explorer',      cat: 'Progression', name: 'Mode Explorer',           desc: 'Play every game mode at least once',             goal: 11,     stat: 'modes_played',      reward: { rubies: 250, title: 'Explorer' } },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));

export function checkAchievements(stats, unlockedSet) {
  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (unlockedSet.has(ach.id)) continue;
    const current = stats[ach.stat] ?? 0;
    if (current >= ach.goal) {
      newlyUnlocked.push(ach);
    }
  }
  return newlyUnlocked;
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY MISSIONS
// ─────────────────────────────────────────────────────────────────────────────

const MISSION_TEMPLATES = [
  { id: 'kill_n',          name: 'Exterminator',      desc: 'Kill {n} enemies in a single run',    stat: 'run_kills',     goalGen: () => rng([50,100,150,200]),     reward: { rubies: [10,20,30,40], chest: 1 } },
  { id: 'survive_n',       name: 'Endurance',         desc: 'Survive for {n} minutes',             stat: 'run_minutes',   goalGen: () => rng([5,8,10,15]),          reward: { rubies: [15,25,35,50] } },
  { id: 'kill_bosses',     name: 'Boss Hunt',         desc: 'Kill {n} bosses',                     stat: 'run_bosses',    goalGen: () => rng([1,2,3]),              reward: { rubies: [25,50,75],    chest: 1 } },
  { id: 'kill_elites',     name: 'Elite Slayer',      desc: 'Kill {n} elite enemies',              stat: 'run_elites',    goalGen: () => rng([5,10,15,20]),         reward: { rubies: [20,30,40,60] } },
  { id: 'earn_gold',       name: 'Gold Rush',         desc: 'Collect {n} gold in a run',           stat: 'run_gold',      goalGen: () => rng([1000,2000,5000]),     reward: { rubies: [15,25,40] } },
  { id: 'play_mode',       name: 'Mode Trial',        desc: 'Complete any run in {mode}',          stat: 'mode_complete', goalGen: () => 1,                         reward: { rubies: [30],          chest: 1 } },
  { id: 'crit_hits',       name: 'Precision Strike',  desc: 'Land {n} critical hits',              stat: 'run_crits',     goalGen: () => rng([25,50,100]),          reward: { rubies: [15,25,40] } },
  { id: 'collect_gear',    name: 'Gear Scavenger',    desc: 'Collect {n} equipment pieces',        stat: 'run_gear',      goalGen: () => rng([3,5,8]),              reward: { rubies: [20,30,50] } },
  { id: 'collect_ability', name: 'Power Seeker',      desc: 'Collect {n} abilities',               stat: 'run_abilities', goalGen: () => rng([2,3,5]),              reward: { rubies: [20,35,55] } },
  { id: 'buy_upgrades',    name: 'Shop Addict',       desc: 'Buy {n} upgrades from the shop',      stat: 'run_shop_buys', goalGen: () => rng([5,8,12]),             reward: { rubies: [20,30,45] } },
];

function rng(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function generateDailyMissions(seed = Date.now()) {
  // Seeded shuffle using seed so same day always same missions
  const seededRng = mulberry32(seed);
  const shuffled = [...MISSION_TEMPLATES].sort(() => seededRng() - 0.5);
  const chosen = shuffled.slice(0, 3);

  return chosen.map((t, i) => {
    const goal = t.goalGen();
    const rewardTier = Math.min(i, (t.reward.rubies.length ?? 1) - 1);
    const rubies = Array.isArray(t.reward.rubies) ? t.reward.rubies[rewardTier] : t.reward.rubies;
    return {
      id:       `${t.id}_${seed}_${i}`,
      templateId: t.id,
      name:     t.name,
      desc:     t.desc.replace('{n}', goal).replace('{mode}', 'any mode'),
      stat:     t.stat,
      goal,
      progress: 0,
      completed: false,
      reward:   { rubies, chest: t.reward.chest ?? 0 },
    };
  });
}

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function getDailySeed() {
  const d = new Date();
  return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate());
}

// ─────────────────────────────────────────────────────────────────────────────
// TECH TREE
// ─────────────────────────────────────────────────────────────────────────────

export const TECH_BRANCHES = {
  combat: {
    name: 'Combat',
    icon: '⚔️',
    color: '#ef4444',
    nodes: [
      { id: 'c1', name: 'Damage I',        desc: '+10% damage',                  cost: 5,  stat: 'damageMult',          value: 0.10 },
      { id: 'c2', name: 'Damage II',       desc: '+15% damage',                  cost: 10, stat: 'damageMult',          value: 0.15, requires: ['c1'] },
      { id: 'c3', name: 'Crit Chance',     desc: '+5% critical hit chance',      cost: 8,  stat: 'critChance',          value: 0.05, requires: ['c1'] },
      { id: 'c4', name: 'Crit Damage',     desc: '+25% critical hit damage',     cost: 12, stat: 'critDamageMult',      value: 0.25, requires: ['c3'] },
      { id: 'c5', name: 'Boss Damage',     desc: '+20% damage to bosses',        cost: 15, stat: 'bossDamageMult',      value: 0.20, requires: ['c2'] },
      { id: 'c6', name: 'Ability Damage',  desc: '+20% ability power',           cost: 15, stat: 'abilityPowerMult',    value: 0.20, requires: ['c2', 'c3'] },
      { id: 'c7', name: 'Projectile Speed',desc: '+25% projectile speed',        cost: 10, stat: 'projectileSpeedMult', value: 0.25, requires: ['c1'] },
      { id: 'c8', name: 'Damage III',      desc: '+20% damage (max)',            cost: 20, stat: 'damageMult',          value: 0.20, requires: ['c5', 'c6'] },
    ],
  },
  engineering: {
    name: 'Engineering',
    icon: '🔧',
    color: '#3b82f6',
    nodes: [
      { id: 'e1', name: 'Max HP I',        desc: '+50 max HP',                   cost: 5,  stat: 'maxHpBonus',          value: 50 },
      { id: 'e2', name: 'Max HP II',       desc: '+75 max HP',                   cost: 10, stat: 'maxHpBonus',          value: 75,  requires: ['e1'] },
      { id: 'e3', name: 'Shield Capacity', desc: '+60 shield capacity',          cost: 8,  stat: 'shieldCapBonus',      value: 60,  requires: ['e1'] },
      { id: 'e4', name: 'Shield Regen',    desc: '+3 shield HP/sec',             cost: 12, stat: 'shieldRegenBonus',    value: 3,   requires: ['e3'] },
      { id: 'e5', name: 'Move Speed',      desc: '+10% movement speed',          cost: 10, stat: 'moveSpeedMult',       value: 0.10, requires: ['e1'] },
      { id: 'e6', name: 'Drone Efficiency',desc: '+25% drone damage',            cost: 15, stat: 'droneDamageMult',     value: 0.25, requires: ['e2'] },
      { id: 'e7', name: 'Cooldown Red.',   desc: '-10% ability cooldowns',       cost: 15, stat: 'cooldownReduction',   value: 0.10, requires: ['e2', 'e3'] },
      { id: 'e8', name: 'Max HP III',      desc: '+100 max HP (max)',            cost: 20, stat: 'maxHpBonus',          value: 100, requires: ['e6', 'e7'] },
    ],
  },
  research: {
    name: 'Alien Research',
    icon: '🔬',
    color: '#a855f7',
    nodes: [
      { id: 'r1', name: 'Loot Quality',    desc: '+10% equipment rarity chance', cost: 5,  stat: 'lootQuality',         value: 0.10 },
      { id: 'r2', name: 'Chest Quality',   desc: '+10% chest rarity',            cost: 8,  stat: 'chestQuality',        value: 0.10, requires: ['r1'] },
      { id: 'r3', name: 'Rare Drop Chance',desc: '+8% rare drop chance',         cost: 10, stat: 'rareDropChance',      value: 0.08, requires: ['r1'] },
      { id: 'r4', name: 'Pet Drop Chance', desc: '+5% pet drop chance',          cost: 12, stat: 'petDropChance',       value: 0.05, requires: ['r2', 'r3'] },
      { id: 'r5', name: 'Secret Drop',     desc: '+3% Secret item chance',       cost: 20, stat: 'secretDropChance',    value: 0.03, requires: ['r4'] },
      { id: 'r6', name: 'Ruby Gain',       desc: '+25% Ruby drops',              cost: 15, stat: 'rubyDropMult',        value: 0.25, requires: ['r2'] },
      { id: 'r7', name: 'Ruby Gain II',    desc: '+25% Ruby drops',              cost: 20, stat: 'rubyDropMult',        value: 0.25, requires: ['r6'] },
      { id: 'r8', name: 'Ascension',       desc: '+15% all loot quality (max)',  cost: 30, stat: 'lootQuality',         value: 0.15, requires: ['r5', 'r7'] },
    ],
  },
};

export const ALL_TECH_NODES = Object.values(TECH_BRANCHES).flatMap(b => b.nodes.map(n => ({ ...n, branch: b.name })));
export const TECH_NODE_MAP  = Object.fromEntries(ALL_TECH_NODES.map(n => [n.id, n]));

export function computeTechStats(unlockedNodes = []) {
  const stats = {};
  for (const nodeId of unlockedNodes) {
    const node = TECH_NODE_MAP[nodeId];
    if (!node) continue;
    stats[node.stat] = (stats[node.stat] ?? 0) + node.value;
  }
  return stats;
}

export function canUnlockNode(nodeId, unlockedSet) {
  const node = TECH_NODE_MAP[nodeId];
  if (!node) return false;
  if (!node.requires || node.requires.length === 0) return true;
  return node.requires.every(r => unlockedSet.has(r));
}

export function isBranchComplete(branchId, unlockedSet) {
  const branch = TECH_BRANCHES[branchId];
  if (!branch) return false;
  return branch.nodes.every(n => unlockedSet.has(n.id));
}

// ─────────────────────────────────────────────────────────────────────────────
// PETS
// ─────────────────────────────────────────────────────────────────────────────

export const PET_TYPES = [
  {
    id: 'mini_ufo',       name: 'Mini UFO',        icon: '🛸', color: '#7dd3fc',
    rarity: 'common',
    desc: 'A tiny UFO that follows you, boosting XP gain.',
    bonuses: [
      { stat: 'xpMult',          value: 0.10,  label: '+10% XP' },
    ],
    dropSource: 'boss_chest',
  },
  {
    id: 'alien_blob',     name: 'Alien Blob',      icon: '👾', color: '#86efac',
    rarity: 'common',
    desc: 'A friendly blob that oozes coins from enemies.',
    bonuses: [
      { stat: 'goldMult',        value: 0.15,  label: '+15% Gold' },
    ],
    dropSource: 'boss_chest',
  },
  {
    id: 'nano_drone',     name: 'Nano Drone',      icon: '🤖', color: '#94a3b8',
    rarity: 'uncommon',
    desc: 'A compact combat drone. Increases drone damage.',
    bonuses: [
      { stat: 'droneDamageMult', value: 0.20,  label: '+20% Drone Damage' },
      { stat: 'droneCountBonus', value: 1,     label: '+1 Drone' },
    ],
    dropSource: 'boss_chest',
  },
  {
    id: 'void_wisp',      name: 'Void Wisp',       icon: '✨', color: '#c4b5fd',
    rarity: 'rare',
    desc: 'A wisp from another dimension. Amplifies abilities.',
    bonuses: [
      { stat: 'abilityPowerMult',value: 0.20,  label: '+20% Ability Power' },
      { stat: 'cooldownReduction',value: 0.10, label: '-10% Cooldowns' },
    ],
    dropSource: 'epic_chest',
  },
  {
    id: 'crystal_dragon', name: 'Crystal Dragon',  icon: '🐉', color: '#f0abfc',
    rarity: 'epic',
    desc: 'A crystalline dragon. Shatters enemy shields and boosts loot.',
    bonuses: [
      { stat: 'lootQuality',     value: 0.20,  label: '+20% Loot Quality' },
      { stat: 'chestQuality',    value: 0.20,  label: '+20% Chest Quality' },
      { stat: 'rubyDropMult',    value: 0.25,  label: '+25% Ruby Drops' },
    ],
    dropSource: 'legendary_chest',
  },
  {
    id: 'star_phoenix',   name: 'Star Phoenix',    icon: '🦅', color: '#fbbf24',
    rarity: 'legendary',
    desc: 'Born from a dying star. Massive damage bonuses.',
    bonuses: [
      { stat: 'damageMult',      value: 0.25,  label: '+25% Damage' },
      { stat: 'bossDamageMult',  value: 0.30,  label: '+30% Boss Damage' },
      { stat: 'critChance',      value: 0.10,  label: '+10% Crit Chance' },
    ],
    dropSource: 'mythic_chest',
  },
  {
    id: 'cosmic_entity',  name: 'Cosmic Entity',   icon: '🌌', color: '#e879f9',
    rarity: 'secret',
    desc: 'An unfathomable being. Transcends normal limits.',
    bonuses: [
      { stat: 'damageMult',       value: 0.30,  label: '+30% Damage' },
      { stat: 'xpMult',           value: 0.50,  label: '+50% XP' },
      { stat: 'rubyDropMult',     value: 0.50,  label: '+50% Ruby Drops' },
      { stat: 'lootQuality',      value: 0.30,  label: '+30% Loot Quality' },
      { stat: 'abilityPowerMult', value: 0.25,  label: '+25% Ability Power' },
    ],
    dropSource: 'world_boss',
  },
];

export const PET_MAP = Object.fromEntries(PET_TYPES.map(p => [p.id, p]));

export function computePetStats(activePetId) {
  if (!activePetId) return {};
  const pet = PET_MAP[activePetId];
  if (!pet) return {};
  const stats = {};
  for (const b of pet.bonuses) {
    stats[b.stat] = (stats[b.stat] ?? 0) + b.value;
  }
  return stats;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOURLY SHOP (Premium – Ruby currency)
// ─────────────────────────────────────────────────────────────────────────────

export const HOURLY_SHOP_SIZE     = 8;
export const HOURLY_SHOP_INTERVAL = 3600; // 1 hour in seconds

const HOURLY_ITEM_POOL = [
  { type: 'ruby_chest',    name: 'Ruby Chest',         icon: '💎', baseCost: 50,  rarity: 'common',    desc: 'Contains Common-Rare loot.' },
  { type: 'epic_chest',    name: 'Epic Chest',          icon: '💜', baseCost: 150, rarity: 'epic',      desc: 'Contains Epic+ loot.' },
  { type: 'legendary_chest',name: 'Legendary Chest',   icon: '🟡', baseCost: 400, rarity: 'legendary', desc: 'Contains Legendary+ loot.' },
  { type: 'ability_orb',   name: 'Ability Orb',         icon: '✨', baseCost: 200, rarity: 'rare',      desc: 'Grants a random Rare ability.' },
  { type: 'pet_capsule',   name: 'Pet Capsule',         icon: '🐾', baseCost: 300, rarity: 'epic',      desc: 'Contains a random Uncommon-Epic pet.' },
  { type: 'research_pack', name: 'Research Pack',       icon: '🔬', baseCost: 100, rarity: 'uncommon',  desc: 'Grants 10 Research Points.' },
  { type: 'ruby_boost',    name: 'Ruby Boost',          icon: '🔴', baseCost: 80,  rarity: 'common',    desc: '+50% Ruby drops for next run.' },
  { type: 'xp_boost',      name: 'XP Surge',            icon: '🧠', baseCost: 80,  rarity: 'common',    desc: '+100% Account XP for next run.' },
  { type: 'gold_boost',    name: 'Gold Surge',          icon: '💰', baseCost: 80,  rarity: 'common',    desc: '+100% Gold for next run.' },
  { type: 'mythic_chest',  name: 'Mythic Chest',        icon: '🌟', baseCost: 1000,rarity: 'mythic',    desc: 'Contains guaranteed Mythic loot.' },
  { type: 'secret_chest',  name: 'Secret Cache',        icon: '🌌', baseCost: 2500,rarity: 'secret',    desc: 'Rare Secret-rarity items inside.' },
];

export function generateHourlyShop(seed = Date.now()) {
  const seededRng = mulberry32(seed);
  const shuffled = [...HOURLY_ITEM_POOL].sort(() => seededRng() - 0.5);
  return shuffled.slice(0, HOURLY_SHOP_SIZE).map((item, i) => ({
    ...item,
    slotId: i,
    purchased: false,
    cost: item.baseCost,
  }));
}

export function getHourlyShopSeed() {
  const d = new Date();
  return d.getFullYear() * 1000000 + (d.getMonth() + 1) * 10000 + d.getDate() * 100 + d.getHours();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESTIGE
// ─────────────────────────────────────────────────────────────────────────────

export const PRESTIGE_UPGRADES = [
  { id: 'p_loot_quality',   name: 'Cosmic Loot',        desc: '+10% loot quality permanently',  stat: 'lootQuality',       value: 0.10, cost: 10 },
  { id: 'p_ruby_gain',      name: 'Ruby Fortune',        desc: '+20% Ruby drops permanently',    stat: 'rubyDropMult',      value: 0.20, cost: 15 },
  { id: 'p_xp_gain',        name: 'Accelerated Growth',  desc: '+20% Account XP gain',           stat: 'accountXpMult',     value: 0.20, cost: 10 },
  { id: 'p_secret_chance',  name: 'Rift Walker',         desc: '+2% Secret drop chance',         stat: 'secretDropChance',  value: 0.02, cost: 25 },
  { id: 'p_start_gold',     name: 'Head Start',          desc: 'Start each run with 500 gold',   stat: 'startGoldBonus',    value: 500,  cost: 20 },
  { id: 'p_boss_drops',     name: 'Trophy Hunter',       desc: '+50% boss loot drops',           stat: 'bossDropMult',      value: 0.50, cost: 30 },
];

export function computePrestigeStats(purchasedPrestige = []) {
  const stats = {};
  for (const id of purchasedPrestige) {
    const p = PRESTIGE_UPGRADES.find(u => u.id === id);
    if (!p) continue;
    stats[p.stat] = (stats[p.stat] ?? 0) + p.value;
  }
  return stats;
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGED STATS
// Combine all meta sources into a single stats object used by GameEngine.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merge all meta stat sources.
 * shopStats should be pre-computed via ShopSystem.computeShopStats()
 * and passed in to avoid circular imports.
 */
export function computeAllMetaStats({
  techUnlocked      = [],
  activePetId       = null,
  prestigePurchased = [],
  shopStats         = {},   // pre-computed by caller via ShopSystem
} = {}) {
  const tech     = computeTechStats(techUnlocked);
  const pet      = computePetStats(activePetId);
  const prestige = computePrestigeStats(prestigePurchased);

  const all = {};
  for (const src of [tech, pet, prestige, shopStats]) {
    for (const [k, v] of Object.entries(src)) {
      all[k] = (all[k] ?? 0) + v;
    }
  }
  return all;
}
