// systems/BossData.js
// All boss definitions with phases, attacks, and rewards.

export const BOSSES = [

  // ─── TIER 1 — EARLY GAME ─────────────────────────────────────────────────

  {
    id: 'asteroid_titan',
    name: 'Asteroid Titan',
    color: '#92400e', accent: '#fbbf24',
    radius: 55, hpBase: 900,
    xpDrop: 500, goldDrop: 300,
    chestTier: 'RARE_CRATE',
    tier: 1,
    phases: [
      { hpThresh: 1.00, attacks: ['boulder_throw', 'orbit_rocks'],  speed: 1.2, fireRate: 90  },
      { hpThresh: 0.60, attacks: ['boulder_throw', 'laser_sweep'],  speed: 1.8, fireRate: 60, announceText: '⚠ TITAN ENRAGED!' },
      { hpThresh: 0.25, attacks: ['rapid_fire',   'laser_sweep'],   speed: 2.4, fireRate: 35, announceText: '⚠ TITAN BERSERKER!' },
    ],
    minorRadius: 10, // orbiting rocks
  },

  {
    id: 'void_serpent',
    name: 'Void Serpent',
    color: '#4c1d95', accent: '#a855f7',
    radius: 45, hpBase: 750,
    xpDrop: 600, goldDrop: 380,
    chestTier: 'ELITE_ARSENAL',
    tier: 1,
    phases: [
      { hpThresh: 1.00, attacks: ['plasma_breath', 'teleport'],      speed: 2.0, fireRate: 75  },
      { hpThresh: 0.45, attacks: ['plasma_breath', 'homing_burst'],   speed: 2.8, fireRate: 45, announceText: '⚠ VOID AWAKENS!' },
    ],
  },

  // ─── TIER 2 — MID GAME ───────────────────────────────────────────────────

  {
    id: 'galactic_destroyer',
    name: 'Galactic Destroyer',
    color: '#1e3a5f', accent: '#38bdf8',
    radius: 65, hpBase: 1300,
    xpDrop: 700, goldDrop: 520,
    chestTier: 'MYTHIC_RELIC',
    tier: 2,
    phases: [
      { hpThresh: 1.00, attacks: ['satellite_swarm', 'laser_sweep'],   speed: 1.0, fireRate: 100 },
      { hpThresh: 0.60, attacks: ['rapid_fire',       'laser_sweep'],   speed: 1.5, fireRate: 55,  announceText: '⚠ DESTROYER ONLINE!' },
      { hpThresh: 0.25, attacks: ['rapid_fire',       'ram_charge'],    speed: 2.5, fireRate: 30,  announceText: '⚠ DESTROYER CRITICAL!' },
    ],
  },

  {
    id: 'hive_queen',
    name: 'Hive Queen',
    color: '#14532d', accent: '#86efac',
    radius: 60, hpBase: 1100,
    xpDrop: 750, goldDrop: 480,
    chestTier: 'MYTHIC_RELIC',
    tier: 2,
    phases: [
      { hpThresh: 1.00, attacks: ['spawn_swarm', 'acid_spray'],         speed: 1.1, fireRate: 85  },
      { hpThresh: 0.55, attacks: ['spawn_swarm', 'acid_spray', 'homing_burst'], speed: 1.6, fireRate: 55, announceText: '⚠ QUEEN ENRAGED!' },
      { hpThresh: 0.20, attacks: ['rage_swarm',  'acid_spray'],         speed: 2.0, fireRate: 35, announceText: '⚠ QUEEN RAGE MODE!' },
    ],
  },

  // ─── TIER 3 — LATE GAME ──────────────────────────────────────────────────

  {
    id: 'orbital_core',
    name: 'Orbital Core',
    color: '#0c4a6e', accent: '#7dd3fc',
    radius: 58, hpBase: 1600,
    xpDrop: 900, goldDrop: 650,
    chestTier: 'MYTHIC_RELIC',
    tier: 3,
    phases: [
      { hpThresh: 1.00, attacks: ['rotating_laser', 'satellite_swarm'],   speed: 0.8, fireRate: 110 },
      { hpThresh: 0.60, attacks: ['rotating_laser', 'rapid_fire'],         speed: 1.2, fireRate: 65, announceText: '⚠ CORE OVERLOADING!' },
      { hpThresh: 0.25, attacks: ['dual_laser',     'rapid_fire'],         speed: 1.5, fireRate: 40, announceText: '⚠ CORE CRITICAL!' },
    ],
    laserAngle: 0,
  },

  {
    id: 'ancient_titan',
    name: 'Ancient Titan',
    color: '#1c1917', accent: '#fbbf24',
    radius: 70, hpBase: 2000,
    xpDrop: 1100, goldDrop: 800,
    chestTier: 'COSMIC_VAULT',
    tier: 3,
    phases: [
      { hpThresh: 1.00, attacks: ['shockwave', 'boulder_throw'],            speed: 0.7, fireRate: 100 },
      { hpThresh: 0.65, attacks: ['shockwave', 'rapid_fire'],               speed: 1.1, fireRate: 65, announceText: '⚠ ARMOR CRACKING!' },
      { hpThresh: 0.30, attacks: ['shockwave', 'rapid_fire', 'laser_sweep'],speed: 1.6, fireRate: 40, announceText: '⚠ TITAN DESPERATE!' },
    ],
  },

  // ─── TIER 4 — END GAME ───────────────────────────────────────────────────

  {
    id: 'star_devourer',
    name: 'Star Devourer',
    color: '#0f0f0f', accent: '#f43f5e',
    radius: 75, hpBase: 2800,
    xpDrop: 1600, goldDrop: 1200,
    chestTier: 'COSMIC_VAULT',
    tier: 4,
    phases: [
      { hpThresh: 1.00, attacks: ['black_hole_pull', 'projectile_storm'],               speed: 0.9, fireRate: 95  },
      { hpThresh: 0.60, attacks: ['black_hole_pull', 'projectile_storm', 'laser_sweep'],speed: 1.3, fireRate: 60, announceText: '⚠ DEVOURER FEEDS!' },
      { hpThresh: 0.25, attacks: ['black_hole_pull', 'rapid_fire', 'homing_burst'],     speed: 1.8, fireRate: 35, announceText: '⚠ DEVOURER ASCENDS!' },
    ],
    pullStrength: 0,
  },
];

// Which boss to pick based on session time and bosses killed
export function selectBoss(sessionMinutes, bossesKilled, usedBossIds = new Set()) {
  // Tier availability
  let maxTier;
  if (sessionMinutes < 8)   maxTier = 1;
  else if (sessionMinutes < 15) maxTier = 2;
  else if (sessionMinutes < 22) maxTier = 3;
  else                       maxTier = 4;

  // Filter by tier and not-recently-used
  let pool = BOSSES.filter(b => b.tier <= maxTier && !usedBossIds.has(b.id));
  if (pool.length === 0) pool = BOSSES.filter(b => b.tier <= maxTier);
  if (pool.length === 0) pool = BOSSES;

  // Prefer higher tier if unlocked
  const preferHighTier = pool.filter(b => b.tier === maxTier);
  const candidates = preferHighTier.length > 0 ? preferHighTier : pool;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Scale boss HP for wave / session time
export function scaleBossHp(bossData, wave, sessionMinutes) {
  const waveScale    = 1 + (wave - 1) * 0.15;
  const timeScale    = 1 + sessionMinutes * 0.04;
  return bossData.hpBase * waveScale * timeScale;
}
