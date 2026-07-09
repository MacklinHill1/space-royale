// systems/AbilityDropSystem.js
// Physical ability drop objects — beams, pickup detection, animations

import { ABILITY_RARITY_COLORS, ABILITY_RARITY_BEAM_HEIGHT, ABILITY_RARITY_GLOW } from '../constants/AbilityData.js';
import { generateBossAbilityDrops, generateChestAbilityDrop } from './AbilityGenerator.js';

const TAU = Math.PI * 2;
function rand(min, max) { return Math.random() * (max - min) + min; }
function dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ─── POOL FACTORY ─────────────────────────────────────────────────────────────
export function makeAbilityDrop() {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    ability: null,
    radius: 16,
    active: false,
    pulse: 0,
    beam: 0,
    beamAlpha: 0,
    attracted: false,
    spawnFlash: 0,
  };
}

export function resetAbilityDrop(d) {
  d.active    = false;
  d.attracted = false;
  d.ability   = null;
  d.pulse     = 0;
  d.beam      = 0;
  d.beamAlpha = 0;
  d.spawnFlash = 0;
  d.vel.x = 0;
  d.vel.y = 0;
}

// ─── SPAWN HELPERS ────────────────────────────────────────────────────────────
function _placeDrop(pool, pos, ability, vel, spawnParticlesFn) {
  const d      = pool.get();
  d.active     = true;
  d.ability    = ability;
  d.pos        = { x: pos.x, y: pos.y };
  d.vel        = vel || { x: rand(-1.5, 1.5), y: rand(-1.5, 1.5) };
  d.radius     = 16;
  d.pulse      = rand(0, TAU);
  d.beam       = ABILITY_RARITY_BEAM_HEIGHT[ability.rarity] || 200;
  d.beamAlpha  = 1;
  d.spawnFlash = 40;
  d.attracted  = false;

  const color = ABILITY_RARITY_COLORS[ability.rarity] || '#fff';
  const cnt   = ability.rarity === 'secret' ? 30 : ability.rarity === 'mythic' ? 20 : 12;
  spawnParticlesFn(pos, color, cnt, 4, 40);

  return d;
}

// Boss drop — multiple abilities in arc
export function spawnBossAbilityDrops(pool, bossPos, bossName, wave, hasBossHunter, spawnParticlesFn, difficultyRating = 3) {
  const abilities = generateBossAbilityDrops(bossName, wave, hasBossHunter, difficultyRating);
  if (!abilities.length) return [];
  abilities.forEach((ability, i) => {
    const angle = (i / abilities.length) * TAU + rand(-0.3, 0.3);
    const r     = rand(60, 100);
    const pos   = { x: bossPos.x + Math.cos(angle) * r, y: bossPos.y + Math.sin(angle) * r };
    const vel   = { x: Math.cos(angle) * rand(1, 2.5), y: Math.sin(angle) * rand(1, 2.5) };
    _placeDrop(pool, pos, ability, vel, spawnParticlesFn);
  });
  return abilities;
}

// Chest drop — single ability
export function spawnChestAbilityDrop(pool, chestPos, wave, spawnParticlesFn, difficultyRating = 3) {
  const ability = generateChestAbilityDrop(wave, difficultyRating);
  if (!ability) return null;
  _placeDrop(pool, chestPos, ability, null, spawnParticlesFn);
  return ability;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export function updateAbilityDrops(pool, player, dt, onPickup, spawnParticlesFn) {
  const BASE_MAGNET = player.magnetRadius || 80;
  pool.forEach(d => {
    if (!d.active) return;

    // Attraction
    const dToPlayer = dist(d.pos, player.pos);
    if (dToPlayer < BASE_MAGNET * 1.2 || d.attracted) {
      d.attracted = true;
      const dx = player.pos.x - d.pos.x;
      const dy = player.pos.y - d.pos.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      d.vel.x += (dx / len) * 5 * dt;
      d.vel.y += (dy / len) * 5 * dt;
    }
    d.vel.x *= 0.90;
    d.vel.y *= 0.90;
    d.pos.x += d.vel.x * dt;
    d.pos.y += d.vel.y * dt;
    d.pulse  += 0.07 * dt;
    if (d.spawnFlash > 0) d.spawnFlash -= dt;

    // Beam fade out slowly
    if (d.beamAlpha > 0) d.beamAlpha = Math.max(0, d.beamAlpha - 0.002 * dt);

    // Pickup
    if (dToPlayer < d.radius + player.radius + 6) {
      const color = ABILITY_RARITY_COLORS[d.ability.rarity] || '#fff';
      spawnParticlesFn(d.pos, color, 18, 3, 25);
      onPickup(d.ability);
      pool.release(d);
    }
  });
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
export function renderAbilityDrops(ctx, pool, tick, mobileMode) {
  pool.forEach(d => {
    if (!d.active || !d.ability) return;

    const rarity  = d.ability.rarity;
    const color   = ABILITY_RARITY_COLORS[rarity] || '#fff';
    const pulse   = 0.85 + 0.15 * Math.sin(d.pulse);
    const isRainbow = rarity === 'secret';

    // ── Rarity beam ──────────────────────────────────────────────────────
    if (d.beamAlpha > 0.01 && !mobileMode) {
      const beamH  = (ABILITY_RARITY_BEAM_HEIGHT[rarity] || 200) * d.beamAlpha;
      const beamW  = rarity === 'secret' ? 22 : rarity === 'mythic' ? 16 : 10;

      if (isRainbow) {
        const hue = (tick * 3) % 360;
        const grd = ctx.createLinearGradient(d.pos.x, d.pos.y - beamH, d.pos.x, d.pos.y);
        grd.addColorStop(0, 'transparent');
        grd.addColorStop(0.4, `hsla(${hue}, 100%, 70%, 0.6)`);
        grd.addColorStop(0.7, `hsla(${(hue + 120) % 360}, 100%, 70%, 0.8)`);
        grd.addColorStop(1,   `hsla(${(hue + 240) % 360}, 100%, 70%, 0.4)`);
        ctx.fillStyle = grd;
      } else {
        const grd = ctx.createLinearGradient(d.pos.x, d.pos.y - beamH, d.pos.x, d.pos.y);
        grd.addColorStop(0, 'transparent');
        grd.addColorStop(0.6, color + '88');
        grd.addColorStop(1, color + 'cc');
        ctx.fillStyle = grd;
      }
      ctx.globalAlpha = d.beamAlpha;
      ctx.fillRect(d.pos.x - beamW / 2, d.pos.y - beamH, beamW, beamH);
      ctx.globalAlpha = 1;
    }

    // ── Glow ring ─────────────────────────────────────────────────────────
    if (!mobileMode) {
      ctx.save();
      ctx.globalAlpha = 0.35 * pulse;
      const ringColor = isRainbow ? `hsl(${(tick * 3) % 360}, 100%, 70%)` : color;
      const grd = ctx.createRadialGradient(d.pos.x, d.pos.y, 0, d.pos.x, d.pos.y, d.radius * 2.5 * pulse);
      grd.addColorStop(0, ringColor + '88');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(d.pos.x, d.pos.y, d.radius * 2.5 * pulse, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // ── Body — hexagon for ability (different from equipment diamond) ─────
    ctx.save();
    ctx.translate(d.pos.x, d.pos.y);
    if (d.spawnFlash > 0) ctx.globalAlpha = 1 - (d.spawnFlash / 40) * 0.5;

    if (!mobileMode) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = isRainbow ? `hsl(${(tick * 3) % 360}, 100%, 70%)` : color;
    }

    // Hexagon shape
    const hexColor = isRainbow ? `hsl(${(tick * 3) % 360}, 100%, 70%)` : color;
    ctx.fillStyle = hexColor + 'cc';
    ctx.strokeStyle = hexColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const r = d.radius * pulse;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU - Math.PI / 6;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else         ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner icon
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.font = `${Math.round(d.radius * 0.9)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.ability.icon || '⚡', 0, 1);

    ctx.restore();
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;
  });
}
