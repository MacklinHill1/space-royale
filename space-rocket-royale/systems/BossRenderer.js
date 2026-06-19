// systems/BossRenderer.js
// Unique canvas silhouettes for each boss, with phase-based visual changes.

const TAU = Math.PI * 2;

function pct(b) { return b.hp / b.maxHp; }

// ─── ASTEROID TITAN ──────────────────────────────────────────────────────────
function renderAsteroidTitan(ctx, b, bossData, tick, mobile) {
  const r = b.radius;
  const hp = pct(b);

  // Rocky outer shape — irregular polygon
  ctx.save();
  ctx.rotate(b.angle * 0.4);
  ctx.fillStyle = hp < 0.25 ? '#ef4444' : hp < 0.6 ? '#b45309' : bossData.color;
  ctx.shadowColor = bossData.accent;
  ctx.shadowBlur = mobile ? 0 : 30;
  ctx.beginPath();
  const verts = 12;
  for (let i = 0; i < verts; i++) {
    const a = (i / verts) * TAU;
    const jitter = 0.75 + 0.25 * Math.sin(i * 2.3 + tick * 0.01);
    const rr = r * jitter;
    if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else         ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();

  // Crater details
  if (!mobile) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    const craters = [[0.3, -0.25, 0.18], [-0.4, 0.2, 0.13], [0.1, 0.4, 0.1]];
    craters.forEach(([cx, cy, cr]) => {
      ctx.beginPath();
      ctx.arc(cx * r, cy * r, cr * r, 0, TAU);
      ctx.fill();
    });
  }

  // Phase 3: cracks glowing red
  if (hp < 0.25) {
    ctx.strokeStyle = '#ef444488';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r * 0.2); ctx.lineTo(r * 0.3, r * 0.4);
    ctx.moveTo(r * 0.1, -r * 0.5);  ctx.lineTo(-r * 0.2, r * 0.3);
    ctx.stroke();
  }
  ctx.restore();

  // Orbiting rocks
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + tick * 0.03;
    const orbitR = r + 28 + Math.sin(i * 1.5) * 8;
    ctx.save();
    ctx.translate(Math.cos(a) * orbitR, Math.sin(a) * orbitR);
    ctx.fillStyle = '#a16207';
    ctx.shadowBlur = mobile ? 0 : 8;
    ctx.shadowColor = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, 5 + (i % 3) * 3, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

// ─── VOID SERPENT ────────────────────────────────────────────────────────────
function renderVoidSerpent(ctx, b, bossData, tick, mobile) {
  const r = b.radius;
  const hp = pct(b);

  // Serpent head — elongated with fang-like protrusions
  ctx.save();
  ctx.rotate(b.angle);
  ctx.fillStyle = hp < 0.45 ? '#7e22ce' : bossData.color;
  ctx.shadowColor = bossData.accent;
  ctx.shadowBlur = mobile ? 0 : 35;

  // Main body
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.65, r, 0, 0, TAU);
  ctx.fill();

  // Fangs
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.moveTo(-r * 0.25, -r * 0.85);
  ctx.lineTo(-r * 0.45, -r * 1.4);
  ctx.lineTo(-r * 0.1, -r * 0.95);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(r * 0.25, -r * 0.85);
  ctx.lineTo(r * 0.45, -r * 1.4);
  ctx.lineTo(r * 0.1, -r * 0.95);
  ctx.closePath();
  ctx.fill();

  // Eyes
  const eyeGlow = 0.5 + 0.5 * Math.sin(tick * 0.15);
  ctx.fillStyle = `rgba(168,85,247,${eyeGlow})`;
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = 15;
  ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.35, r * 0.14, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.35, r * 0.14, 0, TAU);  ctx.fill();

  // Phase 2: energy tendrils
  if (hp < 0.45 && !mobile) {
    ctx.strokeStyle = `rgba(168,85,247,${0.4 + 0.3 * Math.sin(tick * 0.2)})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + tick * 0.08;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r * 1.8, Math.sin(a) * r * 1.8);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ─── GALACTIC DESTROYER ──────────────────────────────────────────────────────
function renderGalacticDestroyer(ctx, b, bossData, tick, mobile) {
  const r = b.radius;
  const hp = pct(b);

  ctx.save();
  ctx.rotate(b.angle * 0.2);
  ctx.fillStyle = hp < 0.25 ? '#1e40af' : bossData.color;
  ctx.shadowColor = bossData.accent;
  ctx.shadowBlur = mobile ? 0 : 35;

  // Hull
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.1);
  ctx.lineTo(-r * 0.5, -r * 0.5);
  ctx.lineTo(-r * 1.2, r * 0.2);
  ctx.lineTo(-r * 0.9, r * 0.8);
  ctx.lineTo(r * 0.9, r * 0.8);
  ctx.lineTo(r * 1.2, r * 0.2);
  ctx.lineTo(r * 0.5, -r * 0.5);
  ctx.closePath();
  ctx.fill();

  // Main cannon
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(-r * 0.12, -r * 1.55, r * 0.24, r * 0.55);

  // Side turrets
  for (const sx of [-1.0, 1.0]) {
    ctx.save();
    ctx.translate(sx * r * 0.9, r * 0.05);
    ctx.fillStyle = '#374151';
    ctx.fillRect(-r * 0.08, -r * 0.25, r * 0.16, r * 0.35);
    ctx.restore();
  }

  // Engine glow row
  const engColor = hp < 0.25 ? '#f87171' : '#38bdf8';
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = engColor;
    ctx.shadowColor = engColor;
    ctx.beginPath();
    ctx.arc(i * r * 0.35, r * 0.8, r * 0.1, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

// ─── HIVE QUEEN ──────────────────────────────────────────────────────────────
function renderHiveQueen(ctx, b, bossData, tick, mobile) {
  const r = b.radius;
  const hp = pct(b);
  const enraged = hp < 0.55;

  ctx.save();
  ctx.rotate(b.angle * 0.3);
  ctx.fillStyle = enraged ? '#166534' : bossData.color;
  ctx.shadowColor = bossData.accent;
  ctx.shadowBlur = mobile ? 0 : (enraged ? 40 : 25);

  // Organic bulbous body
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.85, r, 0, 0, TAU);
  ctx.fill();

  // 6 chitinous legs / arms
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + Math.sin(tick * 0.06 + i) * 0.2;
    const stretch = enraged ? 1.4 : 1.1;
    ctx.save();
    ctx.rotate(a);
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(r * 0.6, 0);
    ctx.quadraticCurveTo(r * stretch, r * 0.3 * Math.sin(i), r * stretch * 1.2, r * 0.1);
    ctx.stroke();
    ctx.restore();
  }

  // Abdomen / egg sac
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.35, r * 0.45, r * 0.45, 0, 0, TAU);
  ctx.fill();

  // Eyes (compound)
  const eyeAlpha = enraged ? 1 : 0.6 + 0.4 * Math.sin(tick * 0.1);
  ctx.fillStyle = `rgba(134,239,172,${eyeAlpha})`;
  ctx.shadowColor = '#86efac';
  ctx.shadowBlur = 12;
  for (const [ex, ey] of [[-0.3, -0.2], [0, -0.35], [0.3, -0.2]]) {
    ctx.beginPath();
    ctx.arc(ex * r, ey * r, r * 0.1, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

// ─── ORBITAL CORE ────────────────────────────────────────────────────────────
function renderOrbitalCore(ctx, b, bossData, tick, mobile) {
  const r = b.radius;
  const hp = pct(b);

  ctx.save();

  // Outer rotating ring
  ctx.save();
  ctx.rotate(tick * 0.04);
  ctx.strokeStyle = bossData.accent;
  ctx.lineWidth = 5;
  ctx.shadowColor = bossData.accent;
  ctx.shadowBlur = mobile ? 0 : 25;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(0, 0, r + 20, 0, TAU);
  ctx.stroke();
  // Ring segments
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ctx.globalAlpha = i % 2 === 0 ? 0.9 : 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 20, a, a + Math.PI / 8);
    ctx.stroke();
  }
  ctx.restore();

  // Second ring opposite direction
  ctx.save();
  ctx.rotate(-tick * 0.025);
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(0, 0, r + 8, 0, TAU);
  ctx.stroke();
  ctx.restore();

  // Core sphere
  ctx.globalAlpha = 1;
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  coreGrad.addColorStop(0, hp < 0.25 ? '#f87171' : '#7dd3fc');
  coreGrad.addColorStop(0.5, bossData.color);
  coreGrad.addColorStop(1, '#000000cc');
  ctx.fillStyle = coreGrad;
  ctx.shadowColor = bossData.accent;
  ctx.shadowBlur = mobile ? 0 : 35;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();

  // Rotating laser emitters
  ctx.save();
  ctx.rotate(b.laserAngle || tick * 0.05);
  for (let i = 0; i < (hp < 0.25 ? 4 : 2); i++) {
    const a = (i / (hp < 0.25 ? 4 : 2)) * TAU;
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7, r * 0.12, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}

// ─── ANCIENT TITAN ───────────────────────────────────────────────────────────
function renderAncientTitan(ctx, b, bossData, tick, mobile) {
  const r = b.radius;
  const hp = pct(b);
  const cracked = hp < 0.65;

  ctx.save();
  ctx.rotate(b.angle * 0.1);

  // Body — stepped pyramid / ziggurat shape
  ctx.shadowColor = hp < 0.30 ? '#ef4444' : bossData.accent;
  ctx.shadowBlur = mobile ? 0 : 30;

  // Each layer
  const layers = [
    { w: 1.0, y: 0.4, h: 0.3 },
    { w: 0.8, y: 0.1, h: 0.3 },
    { w: 0.6, y: -0.2, h: 0.3 },
    { w: 0.35, y: -0.5, h: 0.35 },
  ];
  layers.forEach((l, i) => {
    ctx.fillStyle = i === 0 ? '#292524' : i === 1 ? '#1c1917' : i === 2 ? '#0c0a09' : '#fbbf24';
    ctx.fillRect(-r * l.w, (l.y - l.h * 0.5) * r, r * l.w * 2, r * l.h);
  });

  // Glowing runes in phase 2/3
  if (cracked && !mobile) {
    ctx.fillStyle = `rgba(251,191,36,${0.4 + 0.4 * Math.sin(tick * 0.15)})`;
    const runePositions = [[-0.5, 0.3], [0.5, 0.3], [0, 0.0], [-0.3, -0.3], [0.3, -0.3]];
    runePositions.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx * r, ry * r, r * 0.07, 0, TAU);
      ctx.fill();
    });
  }

  ctx.restore();
}

// ─── STAR DEVOURER ───────────────────────────────────────────────────────────
function renderStarDevourer(ctx, b, bossData, tick, mobile) {
  const r = b.radius;
  const hp = pct(b);
  const hungry = hp < 0.60;

  ctx.save();

  // Void aura (dark expanding pulse)
  const auraAlpha = (0.2 + 0.1 * Math.sin(tick * 0.08)) * (hungry ? 1.5 : 1);
  const auraR = r + 30 + Math.sin(tick * 0.06) * 10;
  const auraGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, auraR);
  auraGrad.addColorStop(0, `rgba(244,63,94,${auraAlpha})`);
  auraGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(0, 0, auraR, 0, TAU);
  ctx.fill();

  // Main body — irregular living creature shape
  ctx.save();
  ctx.rotate(tick * 0.015);
  ctx.fillStyle = bossData.color;
  ctx.shadowColor = bossData.accent;
  ctx.shadowBlur = mobile ? 0 : (hungry ? 50 : 30);
  ctx.beginPath();
  const spikes = 9;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * TAU;
    const isOuter = i % 2 === 0;
    const rr = isOuter ? r : r * (0.55 + 0.1 * Math.sin(i * 3.7 + tick * 0.05));
    if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else         ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Black hole core
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.5);
  coreGrad.addColorStop(0, '#000000');
  coreGrad.addColorStop(0.6, '#1a0010');
  coreGrad.addColorStop(1, `rgba(244,63,94,0.5)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.5, 0, TAU);
  ctx.fill();

  // Phase 2+: red energy rings
  if (hungry && !mobile) {
    for (let ring = 0; ring < 3; ring++) {
      const ringR = r * (0.6 + ring * 0.15) + Math.sin(tick * 0.1 + ring) * 5;
      ctx.strokeStyle = `rgba(244,63,94,${0.3 - ring * 0.08})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, TAU);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ─── MAIN DISPATCH ───────────────────────────────────────────────────────────

export function renderBoss(ctx, b, bossData, tick, mobile) {
  if (!b || !b.active || !bossData) return;

  ctx.save();
  ctx.translate(b.pos.x, b.pos.y);
  if (b.spawnFlash > 0) ctx.globalAlpha = 1 - (b.spawnFlash / 60);

  switch (bossData.id) {
    case 'asteroid_titan':    renderAsteroidTitan(ctx, b, bossData, tick, mobile); break;
    case 'void_serpent':      renderVoidSerpent(ctx, b, bossData, tick, mobile); break;
    case 'galactic_destroyer':renderGalacticDestroyer(ctx, b, bossData, tick, mobile); break;
    case 'hive_queen':        renderHiveQueen(ctx, b, bossData, tick, mobile); break;
    case 'orbital_core':      renderOrbitalCore(ctx, b, bossData, tick, mobile); break;
    case 'ancient_titan':     renderAncientTitan(ctx, b, bossData, tick, mobile); break;
    case 'star_devourer':     renderStarDevourer(ctx, b, bossData, tick, mobile); break;
    default: {
      // Generic fallback
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, b.radius);
      grad.addColorStop(0, bossData.accent + 'cc');
      grad.addColorStop(0.5, bossData.color + 'ee');
      grad.addColorStop(1, '#00000000');
      ctx.fillStyle = grad;
      ctx.shadowColor = bossData.accent;
      ctx.shadowBlur = mobile ? 0 : 30;
      ctx.rotate(b.angle * 0.5);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        const bulge = i % 2 === 0 ? b.radius : b.radius * 0.75;
        if (i === 0) ctx.moveTo(Math.cos(a) * bulge, Math.sin(a) * bulge);
        else         ctx.lineTo(Math.cos(a) * bulge, Math.sin(a) * bulge);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // Flash overlay when hit
  if (b.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(b.flash / 8, 0.5)})`;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}
