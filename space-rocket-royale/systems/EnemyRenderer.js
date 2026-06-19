// systems/EnemyRenderer.js
// Unique canvas silhouettes for every enemy type.

const TAU = Math.PI * 2;

function setStyle(ctx, e, mobile) {
  const flashing = e.flash > 0;
  ctx.fillStyle   = flashing ? '#ffffff' : e.color;
  ctx.strokeStyle = flashing ? '#ffffff' : e.glowColor || e.color;
  if (!mobile) {
    ctx.shadowBlur  = flashing ? 24 : (e.isElite ? 20 : 12);
    ctx.shadowColor = flashing ? '#ffffff' : (e.isElite ? '#fff' : e.glowColor || e.color);
  }
}

// ─── EASY ────────────────────────────────────────────────────────────────────

function drawFighter(ctx, r) {
  // Classic triangle fighter
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(-r * 0.7, r * 0.8);
  ctx.lineTo(0, r * 0.4);
  ctx.lineTo(r * 0.7, r * 0.8);
  ctx.closePath();
  ctx.fill();
}

function drawScout(ctx, r) {
  // Slim arrow — very aerodynamic
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.3);
  ctx.lineTo(-r * 0.45, r * 0.3);
  ctx.lineTo(-r * 0.2, r * 0.1);
  ctx.lineTo(0, r * 0.9);
  ctx.lineTo(r * 0.2, r * 0.1);
  ctx.lineTo(r * 0.45, r * 0.3);
  ctx.closePath();
  ctx.fill();
}

function drawUfoScout(ctx, r, tick) {
  // Classic saucer — flat ellipse + dome
  ctx.save();
  ctx.scale(1, 0.4);
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  // Dome
  ctx.beginPath();
  ctx.arc(0, -r * 0.05, r * 0.55, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  // Pulsing rim light
  ctx.save();
  ctx.globalAlpha = 0.4 + 0.2 * Math.sin(tick * 0.08);
  ctx.strokeStyle = '#67e8f9';
  ctx.lineWidth = 2;
  ctx.scale(1, 0.35);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

function drawDroneSwarm(ctx, r) {
  // Tiny hexagon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU - Math.PI / 6;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else         ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function drawInterceptor(ctx, r) {
  // Delta-wing fighter
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.1);
  ctx.lineTo(-r, r * 0.5);
  ctx.lineTo(-r * 0.3, r * 0.2);
  ctx.lineTo(0, r * 0.7);
  ctx.lineTo(r * 0.3, r * 0.2);
  ctx.lineTo(r, r * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawMiningDrone(ctx, r, color) {
  // Hexagonal body + drill
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else         ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  // Drill tip at bottom
  ctx.beginPath();
  ctx.moveTo(0, r);
  ctx.lineTo(-r * 0.25, r * 1.4);
  ctx.lineTo(r * 0.25, r * 1.4);
  ctx.closePath();
  ctx.fill();
  // Core
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, TAU);
  ctx.fill();
}

// ─── MEDIUM ──────────────────────────────────────────────────────────────────

function drawFrigate(ctx, r, color) {
  // Larger ship with rear swept wings
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.1);
  ctx.lineTo(-r * 0.55, r * 0.0);
  ctx.lineTo(-r * 1.1, r * 0.7);
  ctx.lineTo(-r * 0.4, r * 0.45);
  ctx.lineTo(-r * 0.2, r * 0.85);
  ctx.lineTo(0, r * 0.6);
  ctx.lineTo(r * 0.2, r * 0.85);
  ctx.lineTo(r * 0.4, r * 0.45);
  ctx.lineTo(r * 1.1, r * 0.7);
  ctx.lineTo(r * 0.55, r * 0.0);
  ctx.closePath();
  ctx.fill();
  // Engine glow
  ctx.fillStyle = '#6366f1';
  ctx.shadowColor = '#818cf8';
  ctx.beginPath();
  ctx.rect(-r * 0.15, r * 0.55, r * 0.3, r * 0.15);
  ctx.fill();
}

function drawAssaultUfo(ctx, r, tick) {
  // Big saucer with gun ports
  ctx.save();
  ctx.scale(1, 0.38);
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  // Dome
  ctx.beginPath();
  ctx.arc(0, -r * 0.05, r * 0.6, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  // 4 gun pods
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU;
    ctx.save();
    ctx.translate(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, TAU);
    ctx.fillStyle = '#f87171';
    ctx.fill();
    ctx.restore();
  }
}

function drawShieldDrone(ctx, r, tick) {
  // Diamond core + rotating shield ring
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.7, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-r * 0.7, 0);
  ctx.closePath();
  ctx.fill();
  // Rotating shield arc
  ctx.save();
  ctx.rotate(tick * 0.06);
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.5 + 0.3 * Math.sin(tick * 0.07);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.5, 0, Math.PI * 1.4);
  ctx.stroke();
  ctx.rotate(Math.PI);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.5, 0, Math.PI * 1.4);
  ctx.stroke();
  ctx.restore();
}

function drawMissileCruiser(ctx, r) {
  // Elongated body + two launch pods
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.3);
  ctx.lineTo(-r * 0.4, r * 0.3);
  ctx.lineTo(-r * 0.4, r);
  ctx.lineTo(r * 0.4, r);
  ctx.lineTo(r * 0.4, r * 0.3);
  ctx.closePath();
  ctx.fill();
  // Launch tubes (left + right)
  for (const sx of [-1, 1]) {
    ctx.save();
    ctx.translate(sx * r * 0.65, r * 0.1);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-r * 0.12, -r * 0.4, r * 0.24, r * 0.6);
    ctx.restore();
  }
}

function drawHeavyInterceptor(ctx, r) {
  // Chunkier delta — armored leading edges
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.15);
  ctx.lineTo(-r * 0.5, -r * 0.1);
  ctx.lineTo(-r * 0.9, r * 0.6);
  ctx.lineTo(-r * 0.35, r * 0.35);
  ctx.lineTo(0, r * 0.85);
  ctx.lineTo(r * 0.35, r * 0.35);
  ctx.lineTo(r * 0.9, r * 0.6);
  ctx.lineTo(r * 0.5, -r * 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawCarrier(ctx, r) {
  // Wide rectangular carrier — hangar bay cutout
  ctx.beginPath();
  ctx.moveTo(-r * 1.2, -r * 0.5);
  ctx.lineTo(-r * 0.5, -r);
  ctx.lineTo(r * 0.5, -r);
  ctx.lineTo(r * 1.2, -r * 0.5);
  ctx.lineTo(r * 1.2, r * 0.7);
  ctx.lineTo(-r * 1.2, r * 0.7);
  ctx.closePath();
  ctx.fill();
  // Hangar bay (darker cutout)
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(-r * 0.4, -r * 0.3, r * 0.8, r * 0.6);
  // Engine row
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = '#94a3b8';
    ctx.shadowColor = '#60a5fa';
    ctx.beginPath();
    ctx.arc(i * r * 0.4, r * 0.7, r * 0.12, 0, TAU);
    ctx.fill();
  }
}

// ─── HARD ────────────────────────────────────────────────────────────────────

function drawBattlecruiser(ctx, r) {
  // Imposing warship silhouette
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.2);
  ctx.lineTo(-r * 0.6, -r * 0.3);
  ctx.lineTo(-r * 1.1, r * 0.2);
  ctx.lineTo(-r * 1.3, r * 0.6);
  ctx.lineTo(-r * 0.7, r * 0.85);
  ctx.lineTo(-r * 0.2, r * 0.6);
  ctx.lineTo(r * 0.2, r * 0.6);
  ctx.lineTo(r * 0.7, r * 0.85);
  ctx.lineTo(r * 1.3, r * 0.6);
  ctx.lineTo(r * 1.1, r * 0.2);
  ctx.lineTo(r * 0.6, -r * 0.3);
  ctx.closePath();
  ctx.fill();
  // Cannon
  ctx.fillStyle = '#374151';
  ctx.fillRect(-r * 0.1, -r * 1.5, r * 0.2, r * 0.5);
  // Engine glow
  ctx.fillStyle = '#60a5fa';
  ctx.shadowColor = '#3b82f6';
  for (const sx of [-0.55, 0, 0.55]) {
    ctx.beginPath();
    ctx.arc(sx * r, r * 0.82, r * 0.12, 0, TAU);
    ctx.fill();
  }
}

function drawVoidHarvester(ctx, r, tick) {
  // Claw-like creature — 4 curved arms
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((i / 4) * TAU + tick * 0.03);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(r * 0.4, -r * 0.5, r, -r * 0.2);
    ctx.quadraticCurveTo(r * 1.1, r * 0.2, r * 0.5, r * 0.6);
    ctx.quadraticCurveTo(r * 0.1, r * 0.8, 0, r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // Core
  ctx.fillStyle = '#a855f7';
  ctx.shadowColor = '#7c3aed';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.38, 0, TAU);
  ctx.fill();
}

function drawDreadnought(ctx, r) {
  // Mini-boss tier fortress ship
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(-r * 0.7, -r * 0.6);
  ctx.lineTo(-r * 1.3, -r * 0.1);
  ctx.lineTo(-r * 1.5, r * 0.3);
  ctx.lineTo(-r * 1.2, r * 0.7);
  ctx.lineTo(-r * 0.5, r);
  ctx.lineTo(r * 0.5, r);
  ctx.lineTo(r * 1.2, r * 0.7);
  ctx.lineTo(r * 1.5, r * 0.3);
  ctx.lineTo(r * 1.3, -r * 0.1);
  ctx.lineTo(r * 0.7, -r * 0.6);
  ctx.closePath();
  ctx.fill();
  // Armour plating lines
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-r * 1.0, -r * 0.2); ctx.lineTo(r * 1.0, -r * 0.2);
  ctx.moveTo(-r * 0.8, r * 0.4);  ctx.lineTo(r * 0.8, r * 0.4);
  ctx.stroke();
  // Triple cannon
  for (const sx of [-0.25, 0, 0.25]) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(sx * r - r * 0.06, -r * 1.35, r * 0.12, r * 0.4);
  }
}

function drawSentinel(ctx, r, tick) {
  // Floating obelisk / spire
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.4);
  ctx.lineTo(-r * 0.35, -r * 0.5);
  ctx.lineTo(-r * 0.35, r * 0.8);
  ctx.lineTo(-r * 0.7, r);
  ctx.lineTo(r * 0.7, r);
  ctx.lineTo(r * 0.35, r * 0.8);
  ctx.lineTo(r * 0.35, -r * 0.5);
  ctx.closePath();
  ctx.fill();
  // Eye / targeting crystal
  const eyeAlpha = 0.5 + 0.5 * Math.sin(tick * 0.12);
  ctx.fillStyle = `rgba(239,68,68,${eyeAlpha})`;
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(0, -r * 0.8, r * 0.22, 0, TAU);
  ctx.fill();
}

function drawWarpHunter(ctx, r, tick) {
  // Shifting geometric form — two overlapping triangles rotating
  for (let t = 0; t < 2; t++) {
    ctx.save();
    ctx.rotate(t * Math.PI / 3 + tick * (t ? 0.04 : -0.04));
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else         ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // Core
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#c4b5fd';
  ctx.shadowColor = '#7c3aed';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0, TAU);
  ctx.fill();
}

function drawAncientConstruct(ctx, r) {
  // Alien machine — layered geometric plates
  // Outer ring
  ctx.strokeStyle = '#78716c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const rr = i % 2 === 0 ? r : r * 0.8;
    if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else         ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Inner core square
  ctx.save();
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = '#57534e';
  ctx.fillRect(-r * 0.42, -r * 0.42, r * 0.84, r * 0.84);
  ctx.restore();
  // Central eye
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.25, 0, TAU);
  ctx.fill();
}

// ─── ELITE INDICATOR ─────────────────────────────────────────────────────────

function drawEliteIndicator(ctx, r, tick) {
  // Golden pulsing outline
  const pulse = 0.6 + 0.4 * Math.sin(tick * 0.1);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#fbbf24';
  ctx.beginPath();
  ctx.arc(0, 0, r + 6, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

// ─── MAIN DISPATCH ───────────────────────────────────────────────────────────

export function renderEnemy(ctx, e, tick, mobile) {
  if (!e.active) return;
  ctx.save();
  ctx.translate(e.pos.x, e.pos.y);
  ctx.rotate(e.angle + Math.PI / 2);

  if (e.spawnFlash > 0) ctx.globalAlpha = 1 - (e.spawnFlash / 30);

  setStyle(ctx, e, mobile);
  const r = e.radius;

  switch (e.type) {
    case 'fighter':          drawFighter(ctx, r); break;
    case 'scout':            drawScout(ctx, r); break;
    case 'ufo_scout':        drawUfoScout(ctx, r, tick); break;
    case 'drone_swarm':      drawDroneSwarm(ctx, r); break;
    case 'interceptor':      drawInterceptor(ctx, r); break;
    case 'mining_drone':     drawMiningDrone(ctx, r, e.color); break;
    case 'frigate':          drawFrigate(ctx, r, e.color); break;
    case 'assault_ufo':      drawAssaultUfo(ctx, r, tick); break;
    case 'shield_drone':     drawShieldDrone(ctx, r, tick); break;
    case 'missile_cruiser':  drawMissileCruiser(ctx, r); break;
    case 'heavy_interceptor':drawHeavyInterceptor(ctx, r); break;
    case 'carrier':          drawCarrier(ctx, r); break;
    case 'battlecruiser':    drawBattlecruiser(ctx, r); break;
    case 'void_harvester':   drawVoidHarvester(ctx, r, tick); break;
    case 'dreadnought':      drawDreadnought(ctx, r); break;
    case 'sentinel':         drawSentinel(ctx, r, tick); break;
    case 'warp_hunter':      drawWarpHunter(ctx, r, tick); break;
    case 'ancient_construct':drawAncientConstruct(ctx, r); break;
    // Legacy fallback
    default:
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(-r * 0.7, r * 0.8);
      ctx.lineTo(0, r * 0.4);
      ctx.lineTo(r * 0.7, r * 0.8);
      ctx.closePath();
      ctx.fill();
  }

  if (e.isElite) drawEliteIndicator(ctx, r, tick);

  ctx.restore();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Health bar (only when damaged)
  if (e.hp < e.maxHp) {
    const bw = e.radius * 2.5;
    const bx = e.pos.x - bw / 2;
    const by = e.pos.y - e.radius - 10;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(bx, by, bw, 4);
    const pct = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#fbbf24' : '#f87171';
    ctx.fillRect(bx, by, bw * pct, 4);
    if (e.isElite) {
      // Gold bar outline
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, 4);
    }
  }
}
