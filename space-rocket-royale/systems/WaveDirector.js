// systems/WaveDirector.js
// Controls enemy spawning, composition, and difficulty progression.

import { ENEMY_TYPES, ELITE_MULT, getWaveScale, getDirectorParams, rollEnemyType, FORMATIONS } from './EnemyData.js';

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));

/**
 * Apply base config + wave scaling + optional elite upgrade to a pooled enemy object.
 */
export function configureEnemy(e, type, wave, playerPos, sessionMinutes) {
  const cfg = ENEMY_TYPES[type];
  if (!cfg) return false;

  const waveScale = getWaveScale(wave);
  const isElite = Math.random() < getEliteChance(sessionMinutes);

  // Spawn off-screen — further than current camera view
  const spawnDist = rand(620, 880);
  const angle = rand(0, TAU);
  const pos = {
    x: playerPos.x + Math.cos(angle) * spawnDist,
    y: playerPos.y + Math.sin(angle) * spawnDist,
  };

  const hpMult   = waveScale * (isElite ? ELITE_MULT.hp   : 1);
  const dmgMult  = waveScale * (isElite ? ELITE_MULT.damage: 1);
  const radMult  = isElite ? ELITE_MULT.radius : 1;
  const spdMult  = 1 + (sessionMinutes - 5) * 0.012 * (isElite ? ELITE_MULT.speed : 1);

  Object.assign(e, {
    pos,
    vel: { x: 0, y: 0 },
    angle: 0,
    type,
    tier:    cfg.tier,
    behavior: cfg.behavior,
    color:   cfg.color,
    glowColor: cfg.glowColor,
    radius:  Math.min(cfg.radius * radMult, cfg.radius * 1.6),
    hp:      cfg.hp * hpMult,
    maxHp:   cfg.hp * hpMult,
    speed:   cfg.speed * Math.max(1, spdMult),
    damage:  cfg.damage * dmgMult,
    xpDrop:  cfg.xpDrop  * (isElite ? ELITE_MULT.xpDrop   : 1),
    goldDrop:cfg.goldDrop * (isElite ? ELITE_MULT.goldDrop : 1),
    fireRate:     cfg.fireRate || 0,
    shootCooldown:cfg.fireRate || 0,
    isElite,
    active:  true,
    flash:   0,
    spawnFlash: 30,
    state:   'chase',
    stateTimer:  0,
    behaviorTimer: 0,
    behaviorState: 'idle',
    dashTarget: null,
    carrierSpawnTimer: 0,
    shieldTarget: null,
    warpCooldown: rand(60, 120),
  });

  return true;
}

function getEliteChance(minutes) {
  return Math.min(0.03 + minutes * 0.007, 0.20);
}

/**
 * Main director — called from GameEngine._updateSpawning().
 * Returns array of { type, pos } to spawn, or null if nothing this frame.
 */
export class WaveDirector {
  constructor() {
    this.spawnTimer   = 0;
    this.formationCooldown = 0;
  }

  update(dt, sessionMinutes, wave, activeEnemyCount, playerPos) {
    const params = getDirectorParams(sessionMinutes);
    this.spawnTimer += dt;
    this.formationCooldown = Math.max(0, this.formationCooldown - dt);

    const toSpawn = [];

    // Don't overfill the world
    if (activeEnemyCount >= params.budget) return toSpawn;

    if (this.spawnTimer >= params.spawnInterval) {
      this.spawnTimer = 0;

      // Late-game formation chance
      const formationChance = sessionMinutes >= 15 ? 0.12 : 0;
      if (Math.random() < formationChance && this.formationCooldown <= 0) {
        const formation = FORMATIONS[randInt(0, FORMATIONS.length - 1)];
        this.formationCooldown = 600; // 10 seconds between formations
        const formationTypes = formation.types;
        formationTypes.forEach((type, i) => {
          const dist = rand(650, 850);
          const baseAngle = rand(0, TAU);
          const spreadAngle = baseAngle + (i / formationTypes.length) * 0.6 - 0.3;
          toSpawn.push({
            type,
            pos: {
              x: playerPos.x + Math.cos(spreadAngle) * dist,
              y: playerPos.y + Math.sin(spreadAngle) * dist,
            },
          });
        });
        return toSpawn;
      }

      // Normal spawn — 1 to 3 enemies depending on phase
      const count = sessionMinutes >= 15 ? randInt(2, 4) : sessionMinutes >= 8 ? randInt(1, 2) : 1;
      for (let i = 0; i < count; i++) {
        if (activeEnemyCount + toSpawn.length >= params.budget) break;
        const type = rollEnemyType(params.easyW, params.mediumW, params.hardW);
        const cfg  = ENEMY_TYPES[type];

        // Group swarms together
        if (cfg && cfg.spawnCount && cfg.spawnCount > 1) {
          const groupSize = Math.min(cfg.spawnCount, params.budget - activeEnemyCount);
          const groupAngle = rand(0, TAU);
          const groupDist  = rand(650, 800);
          const cx = playerPos.x + Math.cos(groupAngle) * groupDist;
          const cy = playerPos.y + Math.sin(groupAngle) * groupDist;
          for (let g = 0; g < groupSize; g++) {
            toSpawn.push({
              type,
              pos: { x: cx + rand(-40, 40), y: cy + rand(-40, 40) },
              groupOffset: true,
            });
          }
        } else {
          toSpawn.push({ type });
        }
      }
    }

    return toSpawn;
  }
}

// ─── ENEMY AI BEHAVIORS ──────────────────────────────────────────────────────

/**
 * Update a single enemy's AI. Returns true if enemy dealt contact damage.
 * enemyShootFn(e, dir, damage, speed, color, radius, lifetime) → fires a bullet
 * spawnFighterFn(type, pos) → spawns a child enemy (for carrier)
 */
export function updateEnemyAI(e, player, dt, tick, enemyShootFn, spawnFighterFn) {
  const p = player;
  const dx = p.pos.x - e.pos.x;
  const dy = p.pos.y - e.pos.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / dist, ny = dy / dist;

  e.angle = Math.atan2(dy, dx);
  if (e.flash > 0) e.flash -= dt;
  e.behaviorTimer -= dt;
  e.shootCooldown -= dt;

  switch (e.behavior) {

    // ── chase_fast: high-speed pursuit ───────────────────────────────────────
    case 'chase_fast': {
      e.vel.x = (e.vel.x + nx * e.speed * 0.4 * dt) * 0.93;
      e.vel.y = (e.vel.y + ny * e.speed * 0.4 * dt) * 0.93;
      break;
    }

    // ── chase: basic pursuit ──────────────────────────────────────────────────
    case 'chase': {
      e.vel.x = (e.vel.x + nx * e.speed * 0.25 * dt) * 0.91;
      e.vel.y = (e.vel.y + ny * e.speed * 0.25 * dt) * 0.91;
      if (e.fireRate > 0 && e.shootCooldown <= 0 && dist < 380) {
        enemyShootFn(e, { x: nx, y: ny });
        e.shootCooldown = e.fireRate;
      }
      break;
    }

    // ── orbit: circle player at range ────────────────────────────────────────
    case 'orbit': {
      const targetDist = 220;
      const tangent = { x: -ny, y: nx };
      const factor = dist > targetDist + 30 ? 0.3 : dist < targetDist - 30 ? -0.25 : 0;
      e.vel.x = (e.vel.x + (nx * factor + tangent.x * 0.35) * e.speed * dt) * 0.90;
      e.vel.y = (e.vel.y + (ny * factor + tangent.y * 0.35) * e.speed * dt) * 0.90;
      if (e.fireRate > 0 && e.shootCooldown <= 0 && dist < 400) {
        enemyShootFn(e, { x: nx, y: ny });
        e.shootCooldown = e.fireRate;
      }
      break;
    }

    // ── swarm: flocking + chase ───────────────────────────────────────────────
    case 'swarm': {
      e.vel.x = (e.vel.x + nx * e.speed * 0.4 * dt) * 0.92;
      e.vel.y = (e.vel.y + ny * e.speed * 0.4 * dt) * 0.92;
      // Separation handled externally in GameEngine for performance
      break;
    }

    // ── dash: periodic dashes ────────────────────────────────────────────────
    case 'dash': {
      if (e.behaviorState === 'charging') {
        if (e.dashTarget) {
          const tx = e.dashTarget.x - e.pos.x;
          const ty = e.dashTarget.y - e.pos.y;
          const td = Math.sqrt(tx * tx + ty * ty) || 1;
          e.vel.x = (tx / td) * e.speed * 6;
          e.vel.y = (ty / td) * e.speed * 6;
        }
        if (e.behaviorTimer <= 0) {
          e.behaviorState = 'idle';
          e.behaviorTimer = rand(40, 80);
        }
      } else {
        e.vel.x = (e.vel.x + nx * e.speed * 0.2 * dt) * 0.88;
        e.vel.y = (e.vel.y + ny * e.speed * 0.2 * dt) * 0.88;
        if (e.behaviorTimer <= 0 && dist < 350) {
          e.behaviorState = 'charging';
          e.behaviorTimer = 15;
          e.dashTarget = { x: p.pos.x, y: p.pos.y };
        }
      }
      break;
    }

    // ── snipe: maintain range, fire heavy shots ───────────────────────────────
    case 'snipe': {
      const snipeDist = 330;
      const factor = dist > snipeDist + 50 ? 0.18 : dist < snipeDist - 50 ? -0.12 : 0;
      e.vel.x = (e.vel.x + nx * e.speed * factor * dt) * 0.92;
      e.vel.y = (e.vel.y + ny * e.speed * factor * dt) * 0.92;
      if (e.fireRate > 0 && e.shootCooldown <= 0 && dist < 520) {
        // Missile cruiser: burst of 3 spread shots
        if (e.type === 'missile_cruiser') {
          for (let i = -1; i <= 1; i++) {
            const a = Math.atan2(ny, nx) + i * 0.12;
            enemyShootFn(e, { x: Math.cos(a), y: Math.sin(a) }, e.damage * 1.1, 7, '#fbbf24', 6, 90);
          }
        } else {
          enemyShootFn(e, { x: nx, y: ny }, e.damage, 8, '#f87171', 5, 100);
        }
        e.shootCooldown = e.fireRate;
      }
      break;
    }

    // ── support: orbit other enemies, provide shield aura ────────────────────
    case 'support': {
      // Move toward nearest ally
      e.vel.x = (e.vel.x + nx * e.speed * 0.1 * dt) * 0.88;
      e.vel.y = (e.vel.y + ny * e.speed * 0.1 * dt) * 0.88;
      break;
    }

    // ── carrier: slow, periodically spawns drones ────────────────────────────
    case 'carrier': {
      e.vel.x = (e.vel.x + nx * e.speed * 0.1 * dt) * 0.87;
      e.vel.y = (e.vel.y + ny * e.speed * 0.1 * dt) * 0.87;
      e.carrierSpawnTimer = (e.carrierSpawnTimer || 0) - dt;
      if (e.carrierSpawnTimer <= 0 && dist < 600) {
        e.carrierSpawnTimer = e.fireRate;
        // Spawn 2 drones
        for (let i = 0; i < 2; i++) {
          const a = rand(0, TAU);
          spawnFighterFn('drone_swarm', {
            x: e.pos.x + Math.cos(a) * 30,
            y: e.pos.y + Math.sin(a) * 30,
          });
        }
      }
      if (e.fireRate > 0 && e.shootCooldown <= 0 && dist < 300) {
        enemyShootFn(e, { x: nx, y: ny });
        e.shootCooldown = e.fireRate;
      }
      break;
    }

    // ── warp: periodic teleport near player ───────────────────────────────────
    case 'warp': {
      e.warpCooldown -= dt;
      if (e.warpCooldown <= 0 && dist > 150) {
        // Teleport to nearby player position
        const warpAngle = rand(0, TAU);
        const warpDist  = rand(130, 230);
        e.pos.x = p.pos.x + Math.cos(warpAngle) * warpDist;
        e.pos.y = p.pos.y + Math.sin(warpAngle) * warpDist;
        e.vel   = { x: 0, y: 0 };
        e.spawnFlash = 12;
        e.warpCooldown = rand(80, 140);
      } else {
        e.vel.x = (e.vel.x + nx * e.speed * 0.15 * dt) * 0.88;
        e.vel.y = (e.vel.y + ny * e.speed * 0.15 * dt) * 0.88;
      }
      if (e.fireRate > 0 && e.shootCooldown <= 0 && dist < 280) {
        enemyShootFn(e, { x: nx, y: ny });
        e.shootCooldown = e.fireRate;
      }
      break;
    }

    default: {
      e.vel.x = (e.vel.x + nx * e.speed * 0.25 * dt) * 0.90;
      e.vel.y = (e.vel.y + ny * e.speed * 0.25 * dt) * 0.90;
    }
  }

  e.pos.x += e.vel.x * dt;
  e.pos.y += e.vel.y * dt;
}
