// systems/DifficultyScaler.js
//
// Pure functions — no side effects, no imports, no state.
// All difficulty formulas live here so they can be tuned in one place.
//
// Inputs always come from the engine's live state:
//   wave         — current wave number (integer, starts at 1)
//   sessionTime  — seconds elapsed this run (float)
//   playerLevel  — in-run player level (integer)
//   mode         — game mode string ('endless'|'boss'|'speed'|'hardcore'|'time')
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Wave Progression ────────────────────────────────────────────────────────

/**
 * How many engine ticks constitute one wave.
 * Returns a smaller number as the run goes on so waves shorten over time.
 *
 * Wave 1  → 1800 ticks (~30 s at 60 fps)
 * Wave 10 → 1350 ticks (~22.5 s)
 * Wave 20 → 1050 ticks (~17.5 s)
 * Floor:    900 ticks  (~15 s)
 */
export function waveDuration(wave) {
  return Math.max(900, 1800 - (wave - 1) * 30);
}

// ─── Spawn Rate ───────────────────────────────────────────────────────────────

/**
 * How many engine ticks between enemy spawns.
 * Decreases with wave AND sessionTime so late-game pressure keeps mounting
 * even if the player stays at a low wave by playing defensively.
 *
 * Base:       120 ticks
 * Wave term:  −8 per wave
 * Time term:  −1 per 30 seconds survived
 * Floor:      20 ticks (hard cap — prevents spawn queue overflow)
 *
 * Mode overrides applied after base calculation:
 *   speed     → multiply by 0.5  (double speed)
 *   boss      → multiply by 1.4  (fewer trash enemies; boss is the pressure)
 *   hardcore  → no change        (standard pressure, low HP is the twist)
 *   time      → multiply by 0.8  (slightly faster for score pressure)
 */
export function spawnInterval(wave, sessionTime, mode) {
  const timePenalty = Math.floor(sessionTime / 30);
  const base = Math.max(20, 120 - (wave - 1) * 8 - timePenalty);

  const modeMultiplier = {
    speed:    0.5,
    boss:     1.4,
    hardcore: 1.0,
    time:     0.8,
    endless:  1.0,
  }[mode] ?? 1.0;

  return Math.max(20, Math.round(base * modeMultiplier));
}

/**
 * How many enemies spawn per spawn event.
 * Grows with wave and time, but slowly — individual enemy danger scales too.
 *
 * Wave 1  → 1
 * Wave 4  → 2
 * Wave 7  → 3
 * Wave 10 → 4 (soft cap of 6)
 */
export function spawnCount(wave, sessionTime) {
  const timeBonus = Math.floor(sessionTime / 120); // +1 per 2 minutes
  return Math.min(6, 1 + Math.floor((wave - 1) / 3) + timeBonus);
}

// ─── Enemy Type Pool ──────────────────────────────────────────────────────────

/**
 * Returns a weighted pool of enemy type strings for the given context.
 * The engine picks randomly from this array; duplicates increase probability.
 *
 * Progression:
 *   Wave 1      → only drones
 *   Wave 2–3    → kamikazes added
 *   Wave 3–5    → tanks added
 *   Wave 4+     → snipers added
 *   Wave 5+     → swarms added (appear in larger groups)
 *   Wave 8+     → elite variants begin appearing (prefix 'elite_')
 *   Wave 12+    → mini-bosses become possible
 *
 * sessionTime provides a secondary gate so players can't stall at wave 1
 * forever to avoid harder enemies.
 */
export function enemyTypePool(wave, sessionTime) {
  const types = ['drone'];

  if (wave >= 2 || sessionTime >= 30) {
    types.push('drone', 'kamikaze');
  }
  if (wave >= 3 || sessionTime >= 60) {
    types.push('drone', 'tank');
  }
  if (wave >= 4 || sessionTime >= 90) {
    types.push('sniper');
  }
  if (wave >= 5 || sessionTime >= 120) {
    // Swarms appear in weighted clusters
    types.push('swarm', 'swarm', 'swarm');
  }
  if (wave >= 8 || sessionTime >= 240) {
    types.push('elite_drone', 'elite_kamikaze');
  }
  if (wave >= 12 || sessionTime >= 480) {
    types.push('elite_tank', 'elite_sniper');
  }

  return types;
}

// ─── Enemy Stat Scaling ───────────────────────────────────────────────────────

/**
 * A scalar applied to an enemy's base HP and damage.
 * Combines wave number, sessionTime, and playerLevel so the game reacts
 * to all three axes of progression independently.
 *
 * Formula:
 *   waveScale  = 1 + (wave - 1) × 0.12
 *   timeScale  = 1 + (sessionTime / 600) × 0.25   (max +25% at 10 minutes)
 *   levelScale = 1 + (playerLevel - 1) × 0.04
 *   total      = waveScale × timeScale × levelScale
 *
 * Examples (wave, time, level → scalar):
 *   1,  0s,  1 → 1.00
 *   5, 60s,  5 → ~1.63
 *   10,300s,10 → ~2.55
 *   20,600s,20 → ~4.00
 */
export function enemyStatScale(wave, sessionTime, playerLevel) {
  const waveScale  = 1 + (wave - 1) * 0.12;
  const timeScale  = 1 + Math.min(sessionTime / 600, 1) * 0.25;
  const levelScale = 1 + (playerLevel - 1) * 0.04;
  return waveScale * timeScale * levelScale;
}

/**
 * Damage scalar is slightly lower than HP scalar so survivability
 * remains meaningful into late game. Players should feel dangerous even
 * when enemies are tanky, and one-shots should be rare.
 */
export function enemyDamageScale(wave, sessionTime, playerLevel) {
  const base = enemyStatScale(wave, sessionTime, playerLevel);
  // Damage grows at 75% of the rate that HP grows
  return 1 + (base - 1) * 0.75;
}

// ─── Elite Enemy Stats ────────────────────────────────────────────────────────

/**
 * Multipliers applied on top of normal enemy configs for elite variants.
 * Elite enemies are visually distinct (handled in renderer) and have
 * guaranteed drops above the normal drop table.
 */
export const ELITE_MULTIPLIERS = {
  hp:       2.5,
  damage:   1.6,
  speed:    1.25,
  xpDrop:   3.0,
  goldDrop: 3.0,
};

/**
 * Returns true if the enemy spawned at this wave/time/index should be elite.
 * Uses index to prevent multiple elites spawning at once during batch spawns.
 *
 * Probability:
 *   Starts at wave 8 with 10% chance, +3% per wave, cap 40%
 *   index guard: only first enemy in a batch can be elite
 */
export function shouldSpawnElite(wave, sessionTime, spawnIndex) {
  if (wave < 8 && sessionTime < 240) return false;
  if (spawnIndex > 0) return false;
  const chance = Math.min(0.40, 0.10 + (wave - 8) * 0.03);
  return Math.random() < chance;
}

// ─── Boss Timing ──────────────────────────────────────────────────────────────

/**
 * Returns the session time (seconds) at which the next boss should spawn.
 * Called once after each boss is defeated to schedule the next one.
 *
 * Mode overrides:
 *   boss  → every 60 s (Boss Rush)
 *   other → starts at 300 s, decreases by 15 s per wave, floor 120 s
 */
export function nextBossTime(currentSessionTime, wave, mode) {
  if (mode === 'boss') {
    return currentSessionTime + 60;
  }
  const interval = Math.max(120, 300 - (wave - 1) * 15);
  return currentSessionTime + interval;
}

// ─── Time Attack ──────────────────────────────────────────────────────────────

/** Total seconds for a Time Attack run. */
export const TIME_ATTACK_DURATION = 600; // 10 minutes

/**
 * Returns true when a Time Attack run should end.
 */
export function isTimeAttackOver(sessionTime) {
  return sessionTime >= TIME_ATTACK_DURATION;
}

// ─── Balancing Reference ──────────────────────────────────────────────────────
//
// These are not used in code; they are documentation for designers.
//
// Target feel per wave band:
//   Wave 1–3   : Learning phase. Player can stand still and win.
//   Wave 4–7   : Pressure introduced. Must move, must dodge.
//   Wave 8–12  : Elites appear. Single target burst matters.
//   Wave 13–20 : Elite + boss overlap possible. Build required.
//   Wave 20+   : Infinite scaling. Survival measured in seconds, not waves.
//
// If the game feels too easy: lower ELITE_MULTIPLIERS.hp or reduce the
//   floor in spawnInterval().
// If the game feels too hard: increase waveDuration() return value or
//   reduce the wave-step in enemyStatScale().
