// systems/EquipmentDropSystem.js
// Manages physical loot drops in the game world — drop objects, beam effects, pickup

import { RARITY_COLORS, RARITY_BEAM_HEIGHT, RARITY_ORDER } from '../constants/EquipmentData.js';
import { generateBossDrops, generateChestDrop, generateSecretItem } from './EquipmentGenerator.js';

// Pool factory / reset
export function makeEquipmentDrop() {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    item: null,
    radius: 14,
    active: false,
    pulse: 0,
    beam: 0,
    beamAlpha: 0,
    attracted: false,
    spawnFlash: 0,
  };
}

export function resetEquipmentDrop(d) {
  d.active = false;
  d.attracted = false;
  d.item = null;
  d.pulse = 0;
  d.beam = 0;
  d.beamAlpha = 0;
  d.spawnFlash = 0;
}

// ─── DROP SPAWNING ────────────────────────────────────────────────────────────

export function spawnBossEquipmentDrops(pool, bossPos, bossName, wave, spawnParticlesFn) {
  const items = generateBossDrops(bossName, wave);

  items.forEach((item, i) => {
    const drop = pool.get();
    const angle = (i / Math.max(items.length, 1)) * Math.PI * 2;
    const offset = 50 + i * 30;
    drop.active = true;
    drop.item = item;
    drop.pos = {
      x: bossPos.x + Math.cos(angle) * offset,
      y: bossPos.y + Math.sin(angle) * offset,
    };
    drop.vel = { x: Math.cos(angle) * 2.5, y: Math.sin(angle) * 2.5 };
    drop.pulse = 0;
    drop.beam = 0;
    drop.beamAlpha = 1;
    drop.attracted = false;
    drop.spawnFlash = 30;
    drop.radius = rarityRadius(item.rarity);

    if (spawnParticlesFn) {
      spawnParticlesFn(drop.pos, RARITY_COLORS[item.rarity], rarityParticleCount(item.rarity), rarityParticleSpeed(item.rarity), rarityParticleLife(item.rarity));
    }
  });

  return items;
}

export function spawnChestEquipmentDrop(pool, chestPos, wave, spawnParticlesFn) {
  const item = generateChestDrop(wave);
  if (!item) return null;

  const drop = pool.get();
  drop.active = true;
  drop.item = item;
  drop.pos = { x: chestPos.x + (Math.random() - 0.5) * 40, y: chestPos.y + (Math.random() - 0.5) * 40 };
  drop.vel = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
  drop.pulse = 0;
  drop.beam = 0;
  drop.beamAlpha = 1;
  drop.attracted = false;
  drop.spawnFlash = 20;
  drop.radius = rarityRadius(item.rarity);

  if (spawnParticlesFn) {
    spawnParticlesFn(drop.pos, RARITY_COLORS[item.rarity], rarityParticleCount(item.rarity), 2.5, 25);
  }

  return item;
}

export function spawnSecretDrop(pool, pos, secretId, spawnParticlesFn) {
  const item = generateSecretItem(secretId, 'secret_condition');
  if (!item) return null;

  const drop = pool.get();
  drop.active = true;
  drop.item = item;
  drop.pos = { ...pos };
  drop.vel = { x: 0, y: -1.5 };
  drop.pulse = 0;
  drop.beam = 0;
  drop.beamAlpha = 1;
  drop.attracted = false;
  drop.spawnFlash = 60;
  drop.radius = 20;

  if (spawnParticlesFn) {
    spawnParticlesFn(drop.pos, '#ff00ff', 50, 6, 80);
    spawnParticlesFn(drop.pos, '#00ffff', 30, 4, 60);
  }

  return item;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export function updateEquipmentDrops(pool, player, dt, onPickup, spawnParticlesFn) {
  pool.forEach(drop => {
    if (!drop.active || !drop.item) return;

    drop.pulse += 0.08 * dt;
    drop.beam  += 0.06 * dt;
    if (drop.spawnFlash > 0) drop.spawnFlash -= dt;
    if (drop.beamAlpha > 0.3) drop.beamAlpha -= 0.001 * dt;

    const dx = player.pos.x - drop.pos.x;
    const dy = player.pos.y - drop.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    if (drop.attracted) {
      const nx = dx / dist;
      const ny = dy / dist;
      drop.vel.x = (drop.vel.x + nx * 5 * dt) * 0.88;
      drop.vel.y = (drop.vel.y + ny * 5 * dt) * 0.88;
    } else {
      drop.vel.x *= 0.96;
      drop.vel.y *= 0.96;
      // Auto-attract within player magnet radius
      if (dist < player.magnetRadius + 40) drop.attracted = true;
    }

    drop.pos.x += drop.vel.x * dt;
    drop.pos.y += drop.vel.y * dt;

    // Pickup
    if (dist < drop.radius + player.radius + 6) {
      if (spawnParticlesFn) {
        spawnParticlesFn(drop.pos, RARITY_COLORS[drop.item.rarity], rarityParticleCount(drop.item.rarity), 3, 20);
      }
      if (onPickup) onPickup(drop.item);
      pool.release(drop);
    }
  });
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
export function renderEquipmentDrops(ctx, pool, tick, mobilePerformanceMode) {
  pool.forEach(drop => {
    if (!drop.active || !drop.item) return;

    const item = drop.item;
    const color = RARITY_COLORS[item.rarity];
    const pulse = 0.85 + 0.15 * Math.sin(drop.pulse);
    const beamH = RARITY_BEAM_HEIGHT[item.rarity] || 150;
    const rarityOrd = RARITY_ORDER[item.rarity] || 0;

    ctx.save();
    ctx.translate(drop.pos.x, drop.pos.y);

    // Beam
    if (!mobilePerformanceMode && drop.beamAlpha > 0.05) {
      const beamAlpha = Math.min(0.6, drop.beamAlpha);
      const beamWidth = rarityOrd >= 4 ? 18 + rarityOrd * 4 : 8 + rarityOrd * 2;

      if (item.rarity === 'secret') {
        // Rainbow beam for secret
        const grad = ctx.createLinearGradient(0, 0, 0, -beamH);
        const t = (tick * 0.02) % 1;
        grad.addColorStop(0,   `hsla(${t * 360}, 100%, 70%, ${beamAlpha})`);
        grad.addColorStop(0.33,`hsla(${(t * 360 + 120) % 360}, 100%, 70%, ${beamAlpha * 0.8})`);
        grad.addColorStop(0.66,`hsla(${(t * 360 + 240) % 360}, 100%, 70%, ${beamAlpha * 0.6})`);
        grad.addColorStop(1,   `transparent`);
        ctx.fillStyle = grad;
        ctx.fillRect(-beamWidth / 2, -beamH, beamWidth, beamH);

        // Extra glow rings for secret
        ctx.globalAlpha = 0.15 + 0.1 * Math.sin(tick * 0.05);
        ctx.strokeStyle = `hsl(${(tick * 3) % 360}, 100%, 70%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, drop.radius * 2.5 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (item.rarity === 'mythic') {
        const grad = ctx.createLinearGradient(0, 0, 0, -beamH);
        grad.addColorStop(0,   `rgba(255,107,53,${beamAlpha})`);
        grad.addColorStop(0.5, `rgba(255,200,50,${beamAlpha * 0.7})`);
        grad.addColorStop(1,   'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(-beamWidth / 2, -beamH, beamWidth, beamH);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, -beamH);
        grad.addColorStop(0,   `${color}${Math.floor(beamAlpha * 255).toString(16).padStart(2,'0')}`);
        grad.addColorStop(1,   'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(-beamWidth / 2, -beamH, beamWidth, beamH);
      }
    }

    // Drop shadow glow
    if (!mobilePerformanceMode) {
      ctx.shadowBlur = 12 + rarityOrd * 4;
      ctx.shadowColor = color;
    }

    // Spawn flash
    if (drop.spawnFlash > 0) {
      ctx.globalAlpha = drop.spawnFlash / 30;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, drop.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Core gem shape
    const r = drop.radius * pulse;
    const grad2 = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    grad2.addColorStop(0, '#ffffff');
    grad2.addColorStop(0.35, color);
    grad2.addColorStop(1, color + '22');
    ctx.fillStyle = grad2;

    // Diamond for rare+, circle for common/uncommon
    if (rarityOrd >= 2) {
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.7, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.7, 0);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    }
    ctx.fill();

    // Rarity border ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6 + 0.4 * pulse;
    ctx.beginPath();
    ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
    ctx.stroke();

    // Item icon (text only, no image loading)
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.font = `${Math.round(r * 1.1)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, 0, 0);

    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function rarityRadius(rarity) {
  const R = { common: 12, uncommon: 13, rare: 15, epic: 17, legendary: 20, mythic: 22, secret: 26 };
  return R[rarity] || 14;
}
function rarityParticleCount(rarity) {
  const R = { common: 8, uncommon: 12, rare: 18, epic: 25, legendary: 35, mythic: 50, secret: 70 };
  return R[rarity] || 10;
}
function rarityParticleSpeed(rarity) {
  const R = { common: 2, uncommon: 2.5, rare: 3, epic: 4, legendary: 5, mythic: 6, secret: 8 };
  return R[rarity] || 3;
}
function rarityParticleLife(rarity) {
  const R = { common: 20, uncommon: 25, rare: 35, epic: 45, legendary: 60, mythic: 80, secret: 100 };
  return R[rarity] || 25;
}
