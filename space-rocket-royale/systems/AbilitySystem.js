// systems/AbilitySystem.js
// Real ability mechanics — all active/passive effects implemented

const TAU = Math.PI * 2;
function rand(min, max) { return Math.random() * (max - min) + min; }
function dist(a, b) { const dx=a.x-b.x,dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy); }
function norm(v) { const l=Math.sqrt(v.x*v.x+v.y*v.y)||1; return {x:v.x/l,y:v.y/l}; }

// ─── COOLDOWN MULTIPLIER ──────────────────────────────────────────────────────
// Reads equipped passives to reduce cooldowns
export function getCooldownMult(player) {
  let mult = 1.0;
  const slots = player.abilityLoadout || {};
  const hasTactical = Object.values(slots).some(a => a && a.effectKey === 'TACTICAL_PROCESSOR');
  const hasOverclock = Object.values(slots).some(a => a && a.effectKey === 'OVERCLOCK');
  if (hasTactical) mult *= 0.75;
  if (hasOverclock) mult *= 0.75;
  return mult;
}

// ─── APPLY PASSIVES ON GAME START ─────────────────────────────────────────────
// Called once at the start of each run after ability loadout is set
export function applyPassiveAbilities(player) {
  const slots = player.abilityLoadout || {};
  const abilities = Object.values(slots).filter(Boolean);

  for (const ability of abilities) {
    if (!ability) continue;
    switch (ability.effectKey) {
      case 'QUANTUM_MAGAZINE':
        player.fireRateMult  = (player.fireRateMult  || 1) + 0.20;
        player.damageMult    = (player.damageMult    || 1) + 0.15;
        player.pierce        = (player.pierce        || 0) + 1;
        break;
      case 'DRONE_COMMANDER':
        player.drones             = (player.drones || 0) + 1;
        player.droneDamageMult    = (player.droneDamageMult || 1) + 0.30;
        break;
      case 'TREASURE_SCANNER':
        player.magnetRadius = (player.magnetRadius || 80) + 100;
        player.goldMult     = (player.goldMult || 1) + 0.25;
        break;
      case 'BOSS_HUNTER':
        player.bossDamageMult = (player.bossDamageMult || 1) + 0.40;
        break;
      case 'SCAVENGER_DRONE':
        player.autoScavenge = true;
        break;
      default: break;
    }
  }
}

// ─── PER-FRAME PASSIVE PROCESSING ────────────────────────────────────────────
// g = game engine context (passed-in bag of callbacks + state)
export function updatePassiveAbilities(player, dt, g) {
  const slots = player.abilityLoadout || {};

  // VETERAN HULL — +1 maxHp per 50 kills
  if (Object.values(slots).some(a => a && a.effectKey === 'VETERAN_HULL')) {
    const milestone = Math.floor((player.killCount || 0) / 50);
    const target    = 100 + milestone;
    if (player.maxHp < target) {
      player.maxHp = target;
      player.hp    = Math.min(player.hp + 1, player.maxHp);
      g.spawnParticles(player.pos, '#ef4444', 8, 2, 20);
    }
  }

  // OVERCLOCK — 8% chance on kill to reset cooldowns (checked via killFlag)
  if (player._lastKillCountForOverclock !== player.killCount &&
      Object.values(slots).some(a => a && a.effectKey === 'OVERCLOCK')) {
    player._lastKillCountForOverclock = player.killCount;
    if (Math.random() < 0.08) {
      // Reset all ability cooldowns
      Object.keys(player.abilityCooldowns || {}).forEach(k => {
        player.abilityCooldowns[k] = 0;
      });
      g.spawnParticles(player.pos, '#a855f7', 20, 4, 30);
    }
  }

  // VOID ECHO — inject echo shots (handled in playerShoot patch)
  player._hasVoidEcho = Object.values(slots).some(a => a && a.effectKey === 'VOID_ECHO');
  player._hasDoubleCast = Object.values(slots).some(a => a && a.effectKey === 'DOUBLE_CAST');

  // COSMIC ASCENSION — bonus per boss killed
  if (player._cosmicBossKills > 0 && player._cosmicBossKills !== player._cosmicApplied) {
    player._cosmicApplied = player._cosmicBossKills;
    player.damageMult    += 0.08;
    player.speedMult     += 0.05;
    player.fireRateMult  += 0.05;
  }

  // THE LAST SIGNAL — below 25% HP buffs
  const pctHp = player.hp / player.maxHp;
  const hasLastSignal = Object.values(slots).some(a => a && a.effectKey === 'THE_LAST_SIGNAL');
  if (hasLastSignal) {
    if (pctHp < 0.25) {
      player._lastSignalActive  = true;
      player._lastSignalDmgMult = 3.0;   // x300% — managed in bullet damage
      player._lastSignalSpeedMult = 1.4; // applied in moveSpeed
    } else {
      player._lastSignalActive    = false;
      player._lastSignalDmgMult   = 1.0;
      player._lastSignalSpeedMult = 1.0;
    }
  }

  // ORIGIN PROTOCOL — supernova every 100 kills
  if (Object.values(slots).some(a => a && a.effectKey === 'ORIGIN_PROTOCOL')) {
    const supernova = Math.floor((player.killCount || 0) / 100);
    if (supernova > (player._supernovaCount || 0)) {
      player._supernovaCount = supernova;
      g.triggerSupernova(player.pos, 2000);
    }
  }

  // GUARDIAN DRONES — bullet interception flag (read by boss bullet update)
  player._hasGuardianDrones = Object.values(slots).some(a => a && a.effectKey === 'GUARDIAN_DRONES');
}

// ─── ACTIVE ABILITY ACTIVATION ────────────────────────────────────────────────
// Returns false if on cooldown, true if activated
export function activateAbility(abilityInstance, player, g) {
  if (!abilityInstance) return false;
  const id  = abilityInstance.id;
  const key = abilityInstance.effectKey;
  const cdMult = getCooldownMult(player);
  const baseCd = abilityInstance.cooldown || 0;
  const cd     = baseCd * cdMult;

  // Check cooldown
  if (!player.abilityCooldowns) player.abilityCooldowns = {};
  if ((player.abilityCooldowns[id] || 0) > 0) return false;

  // Check Last Signal — no cooldowns below 25% HP
  if (player._lastSignalActive) {
    player.abilityCooldowns[id] = 0;
  } else {
    player.abilityCooldowns[id] = cd;
  }

  // Execute
  _executeAbility(key, abilityInstance, player, g);

  // DOUBLE CAST — fire again after 0.3s
  if (player._hasDoubleCast) {
    setTimeout(() => _executeAbility(key, abilityInstance, player, g), 300);
  }

  return true;
}

function _executeAbility(key, inst, player, g) {
  switch (key) {
    case 'UFO_TRACTOR':       _ufoTractor(player, g);          break;
    case 'NUCLEAR_MELTDOWN':  _nuclearMeltdown(player, g);     break;
    case 'SOLAR_LANCE':       _solarLance(player, g);          break;
    case 'ORBITAL_STRIKE':    _orbitalStrike(player, g);       break;
    case 'TEMPORAL_SHOCKWAVE':_temporalShockwave(player, g);   break;
    case 'EMERGENCY_REPAIR':  _emergencyRepair(player, g);     break;
    case 'CHAIN_LIGHTNING':   _chainLightning(player, g);      break;
    case 'GRAVITY_WELL':      _gravityWell(inst, player, g);   break;
    case 'SINGULARITY_CORE':  _singularityCore(inst, player, g); break;
    case 'TEMPORAL_ANCHOR':   _temporalAnchor(inst, player, g); break;
    case 'GOD_MACHINE':       _godMachine(player, g);          break;
    default: break;
  }
}

// ─── ABILITY IMPLEMENTATIONS ──────────────────────────────────────────────────

// UFO TRACTOR BEAM
function _ufoTractor(player, g) {
  const enemies = g.getEnemies();
  if (enemies.length === 0) return;

  // Find cluster center
  let cx = 0, cy = 0;
  enemies.forEach(e => { cx += e.pos.x; cy += e.pos.y; });
  cx /= enemies.length; cy /= enemies.length;

  // Find enemies near cluster
  const targets = enemies.filter(e => dist(e.pos, {x:cx,y:cy}) < 200);

  g.spawnParticles({x:cx,y:cy-300}, '#00ff88', 25, 6, 50);
  g.spawnParticles({x:cx,y:cy},     '#00ff88', 15, 4, 35);
  g.screenShake(8);
  g.addActiveEffect({
    key: 'UFO_TRACTOR',
    life: 240,
    maxLife: 240,
    pos: { x: cx, y: cy },
    targets: targets,
    phase: 'pulling',
    timer: 0,
  });
}

// NUCLEAR MELTDOWN
function _nuclearMeltdown(player, g) {
  g.spawnParticles(player.pos, '#22c55e', 30, 5, 40);
  g.spawnParticles(player.pos, '#fbbf24', 20, 4, 30);
  g.screenShake(10);
  g.addActiveEffect({
    key: 'NUCLEAR_MELTDOWN',
    life: 300,
    maxLife: 300,
    pos: { x: player.pos.x, y: player.pos.y },
    radius: 0,
    maxRadius: 320,
    tickDamage: 8,
    lastTickTime: 0,
  });
}

// SOLAR LANCE
function _solarLance(player, g) {
  // Find highest-HP enemy
  let target = null;
  let maxHp  = -1;
  g.getEnemies().forEach(e => { if (e.hp > maxHp) { maxHp = e.hp; target = e; } });
  const boss = g.getBoss();
  if (boss && boss.hp > maxHp) target = boss;
  if (!target) return;

  g.spawnParticles(player.pos, '#fbbf24', 25, 5, 40);
  g.spawnParticles(player.pos, '#ff8c00', 15, 3, 30);
  g.screenShake(6);

  g.addActiveEffect({
    key: 'SOLAR_LANCE',
    life: 180,
    maxLife: 180,
    origin: { x: player.pos.x, y: player.pos.y },
    target,
    dmg: 0,
    maxDmg: 600,
    tickDmg: 40,
    lastTick: 0,
  });
}

// ORBITAL STRIKE
function _orbitalStrike(player, g) {
  // Find strongest enemy
  let target = null;
  let maxHp  = -1;
  g.getEnemies().forEach(e => { if (e.hp > maxHp) { maxHp = e.hp; target = e; } });
  const boss = g.getBoss();
  if (boss && boss.active) target = boss;
  if (!target) return;

  g.screenShake(6);
  g.addActiveEffect({
    key: 'ORBITAL_STRIKE',
    life: 240,
    maxLife: 240,
    target,
    targetPos: { x: target.pos.x, y: target.pos.y },
    phase: 'aiming',  // aiming → incoming → impact
    timer: 0,
  });
}

// TEMPORAL SHOCKWAVE
function _temporalShockwave(player, g) {
  g.spawnParticles(player.pos, '#818cf8', 20, 5, 35);
  g.screenShake(5);
  g.addActiveEffect({
    key: 'TEMPORAL_SHOCKWAVE',
    life: 360,
    maxLife: 360,
    pos: { x: player.pos.x, y: player.pos.y },
    radius: 0,
    maxRadius: 500,
    slowFactor: 0.20, // enemies move at 20% normal speed
    applied: new Set(),
  });
}

// EMERGENCY REPAIR
function _emergencyRepair(player, g) {
  const heal = Math.floor(player.maxHp * 0.30);
  player.hp  = Math.min(player.maxHp, player.hp + heal);
  player.iFrameTimer = 2.5;
  player.invuln      = true;
  g.spawnParticles(player.pos, '#4ade80', 30, 4, 40);
  g.spawnParticles(player.pos, '#86efac', 20, 3, 30);
  g.screenShake(4);
}

// CHAIN LIGHTNING
function _chainLightning(player, g) {
  const enemies = g.getEnemies().filter(e => e.active);
  if (enemies.length === 0) return;

  // Find closest enemy to player
  enemies.sort((a, b) => dist(a.pos, player.pos) - dist(b.pos, player.pos));
  const maxJumps = 5;
  const baseDmg  = 120;
  let   dmg      = baseDmg;
  const chain    = [];
  let   prev     = player.pos;
  const hit      = new Set();

  for (let i = 0; i < maxJumps; i++) {
    let next = null, nd = 999;
    enemies.forEach(e => {
      if (hit.has(e)) return;
      const d2 = dist(e.pos, prev);
      if (d2 < nd && d2 < 250) { nd = d2; next = e; }
    });
    if (!next) break;

    hit.add(next);
    chain.push({ from: { ...prev }, to: { ...next.pos }, dmg });
    next.hp    -= dmg;
    next.flash  = 10;
    prev        = next.pos;
    dmg        *= 0.75;

    if (next.hp <= 0) g.killEnemy(next);
  }

  // Also arc to boss
  const boss = g.getBoss();
  if (boss && boss.active && dist(prev, boss.pos) < 300 && chain.length > 0) {
    boss.hp   -= dmg;
    boss.flash = 8;
    chain.push({ from: { ...prev }, to: { ...boss.pos }, dmg, isBoss: true });
  }

  if (chain.length > 0) {
    g.addActiveEffect({
      key: 'CHAIN_LIGHTNING',
      life: 20,
      maxLife: 20,
      chain,
    });
    g.spawnParticles(chain[0].from, '#fbbf24', 15, 4, 20);
    g.screenShake(5);
  }
}

// GRAVITY WELL
function _gravityWell(inst, player, g) {
  g.spawnParticles(player.pos, '#818cf8', 25, 4, 40);
  g.addActiveEffect({
    key: 'GRAVITY_WELL',
    life: 180,
    maxLife: 180,
    pos: { x: player.pos.x, y: player.pos.y },
    radius: 250,
    pullForce: 6,
    dmgPerTick: 15,
    lastTick: 0,
  });
}

// SINGULARITY CORE
function _singularityCore(inst, player, g) {
  g.spawnParticles(player.pos, '#000', 30, 5, 50);
  g.spawnParticles(player.pos, '#c084fc', 20, 4, 40);
  g.screenShake(12);
  g.addActiveEffect({
    key: 'SINGULARITY_CORE',
    life: 300,
    maxLife: 300,
    pos: { x: player.pos.x, y: player.pos.y },
    radius: 350,
    debris: Array.from({length:8}, (_,i) => ({
      angle: (i/8)*TAU,
      orbitR: 60 + i*10,
      size:   5 + Math.random()*5,
    })),
    lastBossTick: 0,
    lastEnemyTick: 0,
  });
}

// TEMPORAL ANCHOR
function _temporalAnchor(inst, player, g) {
  if (player._temporalAnchorState === 'recording') {
    // Second activation — rewind
    if (player._temporalAnchorData) {
      const data = player._temporalAnchorData;
      player.pos.x = data.pos.x;
      player.pos.y = data.pos.y;
      player.hp    = Math.min(player.maxHp, data.hp);
      player._temporalAnchorState = 'idle';
      player._temporalAnchorData  = null;
      g.spawnParticles(player.pos, '#818cf8', 30, 5, 40);
      g.screenShake(8);
    }
  } else {
    // First activation — start recording
    player._temporalAnchorState = 'recording';
    player._temporalAnchorData  = { pos: { ...player.pos }, hp: player.hp };
    player._temporalAnchorTimer = (inst.duration || 6) * 60;
    g.spawnParticles(player.pos, '#60a5fa', 20, 3, 30);
    g.addActiveEffect({
      key: 'TEMPORAL_ANCHOR',
      life: (inst.duration || 6) * 60,
      maxLife: (inst.duration || 6) * 60,
      anchorPos: { ...player.pos },
      player,
    });
  }
}

// GOD MACHINE
function _godMachine(player, g) {
  g.spawnParticles(player.pos, '#fbbf24', 40, 6, 60);
  g.spawnParticles(player.pos, '#ff6b35', 25, 4, 40);
  g.screenShake(15);
  player._godMachineActive   = true;
  player._godMachineTimer    = 480; // 8 seconds at 60fps
  player._godMachineDmgMult  = 3.0;
}

// ─── PER-FRAME ACTIVE EFFECT PROCESSING ──────────────────────────────────────
// Called every game frame — updates ongoing ability effects
export function updateActiveEffects(effects, player, dt, g) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const fx = effects[i];
    fx.life -= dt;
    if (fx.life <= 0) {
      _onEffectExpire(fx, player, g);
      effects.splice(i, 1);
      continue;
    }
    _updateEffect(fx, player, dt, g);
  }

  // God Machine weapon
  if (player._godMachineTimer > 0) {
    player._godMachineTimer -= dt;
    if (player._godMachineTimer <= 0) {
      player._godMachineActive  = false;
      player._godMachineDmgMult = 1.0;
    }
  }

  // Temporal anchor auto-expire
  if (player._temporalAnchorState === 'recording') {
    player._temporalAnchorTimer -= dt;
    if (player._temporalAnchorTimer <= 0) {
      player._temporalAnchorState = 'idle';
      player._temporalAnchorData  = null;
    }
  }
}

function _updateEffect(fx, player, dt, g) {
  const progress = 1 - fx.life / fx.maxLife;

  switch (fx.key) {

    case 'UFO_TRACTOR': {
      fx.timer += dt;
      if (fx.phase === 'pulling' && fx.timer < 120) {
        // Pull enemies upward
        (fx.targets || []).forEach(e => {
          if (!e.active) return;
          const d = dist(e.pos, fx.pos);
          if (d < 200) {
            e.vel = e.vel || {x:0,y:0};
            e.vel.y -= 0.3 * dt; // pull up
            e.hp -= 2 * dt * 0.016667; // light damage while abducting
          }
        });
        if (fx.timer % 15 < 1) g.spawnParticles(fx.pos, '#00ff88', 5, 3, 20);
      } else if (fx.phase === 'pulling' && fx.timer >= 120) {
        fx.phase = 'dropping';
        fx.timer = 0;
      } else if (fx.phase === 'dropping') {
        // Drop them back → huge explosion
        const boom = 800;
        const boomR = 200;
        g.getEnemies().forEach(e => {
          if (e.active && dist(e.pos, fx.pos) < boomR + e.radius) {
            e.hp   -= boom;
            e.flash = 15;
            if (e.hp <= 0) g.killEnemy(e);
          }
        });
        const boss = g.getBoss();
        if (boss && boss.active && dist(boss.pos, fx.pos) < boomR + boss.radius) {
          boss.hp   -= boom * 0.3;
          boss.flash = 15;
        }
        g.spawnParticles(fx.pos, '#00ff88', 50, 8, 60);
        g.spawnParticles(fx.pos, '#fbbf24', 30, 6, 50);
        g.screenShake(18);
        fx.life = 0; // expire
      }
      break;
    }

    case 'NUCLEAR_MELTDOWN': {
      fx.radius = Math.min(fx.maxRadius, fx.radius + 2.5 * dt);
      fx.lastTickTime += dt;
      if (fx.lastTickTime >= 20) {
        fx.lastTickTime = 0;
        const dmg = fx.tickDamage * (1 + progress * 2); // stacks
        g.getEnemies().forEach(e => {
          if (e.active && dist(e.pos, fx.pos) < fx.radius + e.radius) {
            e.hp   -= dmg;
            e.flash = 5;
            if (e.hp <= 0) {
              // Chain explosion
              g.spawnParticles(e.pos, '#22c55e', 15, 4, 25);
              g.spawnParticles(e.pos, '#fbbf24', 8, 3, 18);
              g.getEnemies().forEach(e2 => {
                if (e2.active && e2 !== e && dist(e2.pos, e.pos) < 80) {
                  e2.hp   -= dmg * 0.6;
                  e2.flash = 5;
                  if (e2.hp <= 0) g.killEnemy(e2);
                }
              });
              g.killEnemy(e);
            }
          }
        });
        const boss = g.getBoss();
        if (boss && boss.active && dist(boss.pos, fx.pos) < fx.radius + boss.radius) {
          boss.hp   -= dmg * 0.3;
          boss.flash = 5;
        }
      }
      if (fx.life % 8 < 1) g.spawnParticles(
        {x: fx.pos.x + rand(-fx.radius, fx.radius), y: fx.pos.y + rand(-fx.radius, fx.radius)},
        '#22c55e', 4, 2, 18
      );
      break;
    }

    case 'SOLAR_LANCE': {
      if (!fx.target || !fx.target.active) {
        // Retarget to boss or closest enemy
        fx.target = g.getBoss() || g.getEnemies()[0];
        if (!fx.target) break;
      }
      fx.lastTick += dt;
      if (fx.lastTick >= 8) {
        fx.lastTick = 0;
        const dmgBonus  = 1 + progress * 2; // ramps
        const totalDmg  = fx.tickDmg * dmgBonus;
        fx.target.hp   -= totalDmg;
        fx.target.flash = 8;
        if (fx.target.hp <= 0 && fx.target !== g.getBoss()) {
          g.killEnemy(fx.target);
          fx.target = null;
        }
        g.spawnParticles(fx.target ? fx.target.pos : fx.origin, '#fbbf24', 8, 3, 18);
      }
      break;
    }

    case 'ORBITAL_STRIKE': {
      fx.timer += dt;
      if (fx.phase === 'aiming' && fx.timer >= 90) {
        // Lock position — fire
        if (fx.target && fx.target.pos) {
          fx.targetPos = { ...fx.target.pos };
        }
        fx.phase = 'impact';
        fx.timer = 0;

        // IMPACT
        const impactDmg = 1800;
        const impactR   = 150;
        g.getEnemies().forEach(e => {
          if (e.active && dist(e.pos, fx.targetPos) < impactR + e.radius) {
            e.hp   -= impactDmg * (1 - dist(e.pos, fx.targetPos) / impactR * 0.5);
            e.flash = 20;
            if (e.hp <= 0) g.killEnemy(e);
          }
        });
        const boss = g.getBoss();
        if (boss && boss.active && dist(boss.pos, fx.targetPos) < impactR + boss.radius) {
          boss.hp   -= impactDmg * 0.4;
          boss.flash = 20;
        }
        g.spawnParticles(fx.targetPos, '#fbbf24', 60, 10, 70);
        g.spawnParticles(fx.targetPos, '#fff',    30, 6, 50);
        g.spawnParticles(fx.targetPos, '#ef4444', 25, 5, 40);
        g.screenShake(20);
      }
      if (fx.phase === 'impact' && fx.timer >= 30) fx.life = 0;
      break;
    }

    case 'TEMPORAL_SHOCKWAVE': {
      fx.radius = Math.min(fx.maxRadius, fx.radius + 4 * dt);
      // Apply slow to enemies within radius
      g.getEnemies().forEach(e => {
        if (e.active && dist(e.pos, fx.pos) < fx.radius + e.radius) {
          e._temporalSlowed = true;
          e._temporalSlowTimer = 10; // frames
        }
      });
      if (fx.life % 12 < 1) {
        g.spawnParticles(
          {x: fx.pos.x + Math.cos(rand(0,TAU))*fx.radius,
           y: fx.pos.y + Math.sin(rand(0,TAU))*fx.radius},
          '#818cf8', 5, 2, 20
        );
      }
      break;
    }

    case 'GRAVITY_WELL': {
      fx.lastTick += dt;
      g.getEnemies().forEach(e => {
        if (!e.active) return;
        const d = dist(e.pos, fx.pos);
        if (d < fx.radius) {
          // Pull inward
          const nx = (fx.pos.x - e.pos.x) / (d || 1);
          const ny = (fx.pos.y - e.pos.y) / (d || 1);
          const pullStr = (1 - d / fx.radius) * fx.pullForce;
          e.vel = e.vel || {x:0,y:0};
          e.vel.x += nx * pullStr * dt * 0.5;
          e.vel.y += ny * pullStr * dt * 0.5;
        }
      });
      if (fx.lastTick >= 20) {
        fx.lastTick = 0;
        g.getEnemies().forEach(e => {
          if (e.active && dist(e.pos, fx.pos) < 80) {
            e.hp   -= fx.dmgPerTick;
            e.flash = 5;
            if (e.hp <= 0) g.killEnemy(e);
          }
        });
      }
      if (fx.life % 8 < 1) g.spawnParticles(fx.pos, '#818cf8', 4, 2, 15);
      break;
    }

    case 'SINGULARITY_CORE': {
      // Pull ALL enemies inward
      g.getEnemies().forEach(e => {
        if (!e.active) return;
        const d = dist(e.pos, fx.pos);
        if (d < fx.radius) {
          const nx = (fx.pos.x - e.pos.x) / (d || 1);
          const ny = (fx.pos.y - e.pos.y) / (d || 1);
          const strength = Math.pow(1 - d / fx.radius, 2) * 8;
          e.vel = e.vel || {x:0,y:0};
          e.vel.x += nx * strength * dt * 0.5;
          e.vel.y += ny * strength * dt * 0.5;
          // Contact damage
          if (d < 50) {
            e.hp   -= 20 * dt * 0.1;
            e.flash = 3;
            if (e.hp <= 0) g.killEnemy(e);
          }
        }
      });
      // Boss DoT
      fx.lastBossTick += dt;
      if (fx.lastBossTick >= 60) {
        fx.lastBossTick = 0;
        const boss = g.getBoss();
        if (boss && boss.active && dist(boss.pos, fx.pos) < fx.radius) {
          boss.hp   -= boss.maxHp * 0.15;
          boss.flash = 12;
        }
      }
      // Orbit debris particles
      if (fx.life % 4 < 1) g.spawnParticles(fx.pos, '#c084fc', 3, 3, 20);
      break;
    }

    case 'TEMPORAL_ANCHOR': {
      // Just visual — keep anchor marker in place
      // Auto expire handled above
      break;
    }

    case 'CHAIN_LIGHTNING': {
      // Just rendering, no update needed
      break;
    }

    default: break;
  }
}

function _onEffectExpire(fx, player, g) {
  if (fx.key === 'TEMPORAL_ANCHOR' && player._temporalAnchorState === 'recording') {
    // Auto-expired without second activation
    player._temporalAnchorState = 'idle';
    player._temporalAnchorData  = null;
  }
}

// ─── RENDER ACTIVE EFFECTS ────────────────────────────────────────────────────
export function renderActiveEffects(ctx, effects, player, tick, mobileMode) {
  effects.forEach(fx => {
    const progress = 1 - fx.life / fx.maxLife;
    switch (fx.key) {

      case 'UFO_TRACTOR': {
        if (!mobileMode) {
          ctx.save();
          ctx.globalAlpha = 0.7;
          // UFO body
          ctx.shadowBlur  = 30;
          ctx.shadowColor = '#00ff88';
          ctx.fillStyle   = '#1a1a2e';
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth   = 3;
          ctx.beginPath();
          ctx.ellipse(fx.pos.x, fx.pos.y - 300, 60, 20, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();
          // Tractor beam
          const beamGrd = ctx.createLinearGradient(fx.pos.x, fx.pos.y - 280, fx.pos.x, fx.pos.y);
          beamGrd.addColorStop(0, 'rgba(0,255,136,0)');
          beamGrd.addColorStop(0.5, 'rgba(0,255,136,0.25)');
          beamGrd.addColorStop(1, 'rgba(0,255,136,0.5)');
          ctx.fillStyle = beamGrd;
          ctx.beginPath();
          ctx.moveTo(fx.pos.x - 60, fx.pos.y - 280);
          ctx.lineTo(fx.pos.x + 60, fx.pos.y - 280);
          ctx.lineTo(fx.pos.x + 120, fx.pos.y);
          ctx.lineTo(fx.pos.x - 120, fx.pos.y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          ctx.shadowBlur = 0;
        }
        break;
      }

      case 'NUCLEAR_MELTDOWN': {
        ctx.save();
        ctx.globalAlpha = 0.25 * (fx.life / fx.maxLife);
        const grd = ctx.createRadialGradient(fx.pos.x, fx.pos.y, 0, fx.pos.x, fx.pos.y, fx.radius);
        grd.addColorStop(0, '#fbbf24');
        grd.addColorStop(0.4, '#22c55e88');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(fx.pos.x, fx.pos.y, fx.radius, 0, TAU);
        ctx.fill();
        if (!mobileMode) {
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.arc(fx.pos.x, fx.pos.y, fx.radius, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
        break;
      }

      case 'SOLAR_LANCE': {
        if (!fx.target || !mobileMode) {
          const tgt = fx.target ? fx.target.pos : fx.origin;
          if (!tgt) break;
          ctx.save();
          const lerpT = Math.min(1, (1 - fx.life / fx.maxLife) * 3);
          ctx.globalAlpha = lerpT * 0.85;
          ctx.shadowBlur  = mobileMode ? 0 : 30;
          ctx.shadowColor = '#fbbf24';
          // Beam line
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth   = 8 + (1 - fx.life / fx.maxLife) * 12;
          ctx.lineCap     = 'round';
          ctx.beginPath();
          ctx.moveTo(fx.origin.x, fx.origin.y);
          ctx.lineTo(tgt.x, tgt.y);
          ctx.stroke();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth   = 2;
          ctx.globalAlpha = lerpT * 0.4;
          ctx.stroke();
          ctx.restore();
          ctx.shadowBlur = 0;
        }
        break;
      }

      case 'ORBITAL_STRIKE': {
        const tgtPos = fx.targetPos || (fx.target && fx.target.pos);
        if (!tgtPos) break;
        ctx.save();
        if (fx.phase === 'aiming') {
          // Targeting reticle
          const pulseR = 40 + Math.sin(tick * 0.3) * 10;
          ctx.globalAlpha = 0.8;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth   = 2;
          if (!mobileMode) { ctx.shadowBlur = 15; ctx.shadowColor = '#ef4444'; }
          // Crosshair
          ctx.beginPath();
          ctx.arc(tgtPos.x, tgtPos.y, pulseR, 0, TAU);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tgtPos.x - pulseR - 15, tgtPos.y);
          ctx.lineTo(tgtPos.x + pulseR + 15, tgtPos.y);
          ctx.moveTo(tgtPos.x, tgtPos.y - pulseR - 15);
          ctx.lineTo(tgtPos.x, tgtPos.y + pulseR + 15);
          ctx.stroke();
        } else if (fx.phase === 'impact' && fx.timer < 30) {
          // Shockwave
          const sw = fx.timer / 30;
          ctx.globalAlpha = (1 - sw) * 0.7;
          if (!mobileMode) { ctx.shadowBlur = 40; ctx.shadowColor = '#fbbf24'; }
          const grd = ctx.createRadialGradient(tgtPos.x, tgtPos.y, 0, tgtPos.x, tgtPos.y, 150 * sw);
          grd.addColorStop(0, '#fff');
          grd.addColorStop(0.3, '#fbbf24');
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(tgtPos.x, tgtPos.y, 150 * sw, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
        ctx.shadowBlur = 0;
        break;
      }

      case 'TEMPORAL_SHOCKWAVE': {
        ctx.save();
        ctx.globalAlpha = (fx.life / fx.maxLife) * 0.5;
        if (!mobileMode) { ctx.shadowBlur = 20; ctx.shadowColor = '#818cf8'; }
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.arc(fx.pos.x, fx.pos.y, fx.radius, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = (fx.life / fx.maxLife) * 0.12;
        const grd = ctx.createRadialGradient(fx.pos.x, fx.pos.y, 0, fx.pos.x, fx.pos.y, fx.radius);
        grd.addColorStop(0, 'transparent');
        grd.addColorStop(0.8, '#818cf8');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(fx.pos.x, fx.pos.y, fx.radius, 0, TAU);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
        break;
      }

      case 'GRAVITY_WELL': {
        ctx.save();
        ctx.globalAlpha = 0.35;
        const spin = tick * 0.04;
        for (let i = 0; i < 3; i++) {
          const a = spin + (i / 3) * TAU;
          if (!mobileMode) { ctx.shadowBlur = 15; ctx.shadowColor = '#818cf8'; }
          ctx.strokeStyle = `rgba(129,140,248,${0.4 + i * 0.15})`;
          ctx.lineWidth   = 2;
          ctx.beginPath();
          ctx.arc(fx.pos.x, fx.pos.y, fx.radius * (0.4 + i * 0.3), a, a + TAU * 0.6);
          ctx.stroke();
        }
        ctx.restore();
        ctx.shadowBlur = 0;
        break;
      }

      case 'SINGULARITY_CORE': {
        ctx.save();
        // Black hole core
        if (!mobileMode) { ctx.shadowBlur = 40; ctx.shadowColor = '#c084fc'; }
        const grd2 = ctx.createRadialGradient(fx.pos.x, fx.pos.y, 0, fx.pos.x, fx.pos.y, 50);
        grd2.addColorStop(0, '#000');
        grd2.addColorStop(0.5, '#1a0033');
        grd2.addColorStop(1, 'transparent');
        ctx.fillStyle = grd2;
        ctx.beginPath();
        ctx.arc(fx.pos.x, fx.pos.y, 50, 0, TAU);
        ctx.fill();
        // Gravitational lensing ring
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.arc(fx.pos.x, fx.pos.y, 55 + Math.sin(tick * 0.1) * 5, 0, TAU);
        ctx.stroke();
        // Orbiting debris
        ctx.globalAlpha = 0.8;
        (fx.debris || []).forEach((deb, i) => {
          const a   = (tick * 0.05) + (i / fx.debris.length) * TAU;
          const dx2 = fx.pos.x + Math.cos(a) * deb.orbitR;
          const dy2 = fx.pos.y + Math.sin(a) * deb.orbitR * 0.5;
          ctx.fillStyle = i % 2 === 0 ? '#c084fc' : '#818cf8';
          ctx.beginPath();
          ctx.arc(dx2, dy2, deb.size, 0, TAU);
          ctx.fill();
        });
        ctx.restore();
        ctx.shadowBlur = 0;
        break;
      }

      case 'TEMPORAL_ANCHOR': {
        // Draw anchor marker at stored pos
        if (fx.anchorPos) {
          ctx.save();
          const alpha = Math.sin(tick * 0.1) * 0.3 + 0.5;
          ctx.globalAlpha = alpha;
          if (!mobileMode) { ctx.shadowBlur = 20; ctx.shadowColor = '#60a5fa'; }
          ctx.strokeStyle = '#60a5fa';
          ctx.lineWidth   = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(fx.anchorPos.x, fx.anchorPos.y, 25, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = alpha * 0.7;
          ctx.font        = '18px serif';
          ctx.textAlign   = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle   = '#60a5fa';
          ctx.fillText('⏮️', fx.anchorPos.x, fx.anchorPos.y);
          ctx.restore();
          ctx.shadowBlur = 0;
        }
        break;
      }

      case 'CHAIN_LIGHTNING': {
        if (!fx.chain) break;
        ctx.save();
        const alphaL = fx.life / fx.maxLife;
        fx.chain.forEach(seg => {
          if (!mobileMode) { ctx.shadowBlur = 20; ctx.shadowColor = '#fbbf24'; }
          ctx.strokeStyle = alphaL > 0.5 ? '#fff' : '#fbbf24';
          ctx.lineWidth   = 3 + alphaL * 4;
          ctx.globalAlpha = alphaL;
          ctx.lineCap     = 'round';
          ctx.beginPath();
          // Jagged lightning
          const steps  = 6;
          const dx2    = seg.to.x - seg.from.x;
          const dy2    = seg.to.y - seg.from.y;
          const perpX  = -dy2 / (Math.sqrt(dx2*dx2+dy2*dy2)||1);
          const perpY  =  dx2 / (Math.sqrt(dx2*dx2+dy2*dy2)||1);
          ctx.moveTo(seg.from.x, seg.from.y);
          for (let s = 1; s < steps; s++) {
            const t   = s / steps;
            const jit = rand(-15, 15);
            ctx.lineTo(
              seg.from.x + dx2 * t + perpX * jit,
              seg.from.y + dy2 * t + perpY * jit
            );
          }
          ctx.lineTo(seg.to.x, seg.to.y);
          ctx.stroke();
        });
        ctx.restore();
        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;
        break;
      }

      default: break;
    }
  });
}

// ─── GOD MACHINE OMNIDIRECTIONAL FIRE ────────────────────────────────────────
export function godMachineShoot(player, spawnBullet) {
  if (!player._godMachineActive) return;
  const dmg = 10 * (player.damageMult || 1) * player._godMachineDmgMult;
  for (let i = 0; i < 8; i++) {
    const a   = (i / 8) * TAU;
    const spd = 700;
    spawnBullet({
      pos:   { x: player.pos.x, y: player.pos.y },
      vel:   { x: Math.cos(a) * spd / 60, y: Math.sin(a) * spd / 60 },
      damage: dmg,
      radius: 5,
      color: '#fbbf24',
      pierce: 1,
      maxLifetime: 70,
    });
  }
}

// ─── ENTROPY COLLAPSE (death prevention) ─────────────────────────────────────
// Returns true if collapse was triggered (player lives)
export function checkEntropyCollapse(player, g) {
  const slots = player.abilityLoadout || {};
  const hasEntropy = Object.values(slots).some(a => a && a.effectKey === 'ENTROPY_COLLAPSE');
  if (!hasEntropy || player._entropyUsed) return false;
  player._entropyUsed = true;
  player.hp           = 1;
  player.iFrameTimer  = 5;
  player.invuln       = true;
  g.spawnParticles(player.pos, '#ef4444', 50, 8, 60);
  g.spawnParticles(player.pos, '#fff',    30, 6, 50);
  g.screenShake(20);
  return true;
}

// ─── VOID ECHO SHOT ───────────────────────────────────────────────────────────
export function voidEchoShot(player, originalBullet, spawnBullet) {
  if (!player._hasVoidEcho) return;
  spawnBullet({
    pos:    { x: originalBullet.pos.x, y: originalBullet.pos.y },
    vel:    { x: -originalBullet.vel.x * 0.85, y: -originalBullet.vel.y * 0.85 },
    damage: originalBullet.damage * 0.60,
    radius: originalBullet.radius,
    color:  '#818cf8',
    pierce: 0,
    maxLifetime: 60,
  });
}
