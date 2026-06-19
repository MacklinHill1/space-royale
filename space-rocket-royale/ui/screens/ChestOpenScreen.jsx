'use client';
// ui/screens/ChestOpenScreen.jsx
// Animated chest opening screen with reward reveals.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CHEST_MAP, getChestDef } from '../../systems/ChestSystem.js';
import { generateItem } from '../../systems/EquipmentGenerator.js';
import { generateAbility } from '../../systems/AbilityGenerator.js';
import { ABILITY_RARITIES } from '../../constants/AbilityData.js';
import { ALL_BLUEPRINTS } from '../../constants/EquipmentData.js';

const RARITY_NAMES  = ['Common','Uncommon','Rare','Epic','Legendary','Mythic','Secret'];
const RARITY_COLORS = ['#94a3b8','#4ade80','#3b82f6','#a855f7','#f59e0b','#ef4444','#ff00ff'];
const RARITY_GLOWS  = ['none','#4ade8060','#3b82f660','#a855f760','#f59e0b60','#ef444460','#ff00ff60'];

const ITEM_ICONS = { gear: '⚔️', ability: '⚡', pet: '🐾' };

// ── Particle effect (CSS keyframe via inline style) ────────────────────────

function Particle({ x, y, color, delay, dx, dy }) {
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width: 6, height: 6,
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 8px ${color}`,
      animation: `particle-fly 0.8s ease-out ${delay}s forwards`,
      '--dx': `${dx}px`,
      '--dy': `${dy}px`,
      pointerEvents: 'none',
    }} />
  );
}

// ── Reward card ────────────────────────────────────────────────────────────

function RewardCard({ reward, index, visible }) {
  const rarityColor = RARITY_COLORS[reward.rarityIndex] ?? '#94a3b8';
  const rarityName  = RARITY_NAMES[reward.rarityIndex]  ?? 'Common';
  const glow        = RARITY_GLOWS[reward.rarityIndex]  ?? 'none';

  return (
    <div style={{
      background: `linear-gradient(135deg, ${rarityColor}20, rgba(0,0,0,0.6))`,
      border: `2px solid ${rarityColor}`,
      borderRadius: 12,
      padding: '16px 20px',
      textAlign: 'center',
      minWidth: 120,
      boxShadow: glow !== 'none' ? `0 0 24px ${glow}` : 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(30px)',
      transition: `all 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.12}s`,
      position: 'relative',
    }}>
      {/* Rarity glow ring for legendary+ */}
      {(reward.rarityIndex ?? 0) >= 4 && (
        <div style={{
          position: 'absolute', inset: -3, borderRadius: 14,
          border: `1px solid ${rarityColor}80`,
          animation: 'pulse-ring 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ fontSize: 32, marginBottom: 6 }}>
        {reward.type === 'gold'   ? '💰'
        : reward.type === 'xp'   ? '✨'
        : reward.type === 'ruby' ? '💎'
        : ITEM_ICONS[reward.type] ?? '📦'}
      </div>

      {(reward.type === 'gold' || reward.type === 'xp' || reward.type === 'ruby') ? (
        <>
          <div style={{ fontSize: 20, fontWeight: 900, color: rarityColor }}>{reward.amount.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, letterSpacing: 1 }}>
            {reward.type.toUpperCase()}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: rarityColor, marginBottom: 2 }}>{rarityName}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 2, lineHeight: 1.2 }}>
            {reward.name || (reward.type === 'gear' ? 'Equipment' : reward.type === 'ability' ? 'Ability' : 'Pet')}
          </div>
          <div style={{ fontSize: 9, color: '#64748b', letterSpacing: 1 }}>
            {reward.type === 'gear' ? 'EQUIPMENT' : reward.type === 'ability' ? 'ABILITY' : 'PET'}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

export function ChestOpenScreen({ chest, rewards, onClose }) {
  const [phase, setPhase]   = useState('idle');   // idle | shaking | burst | reveal
  const [visible, setVisible] = useState(false);
  const def = getChestDef(chest?.type ?? 'common_cache');

  // Build reward display items from raw rewards — generated once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const displayRewards = useMemo(() => rewards ? buildDisplayRewards(rewards) : [], []);

  // Auto-advance from idle on mount
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('shaking'),  200);
    const t2 = setTimeout(() => setPhase('burst'),    def.animDuration * 0.4);
    const t3 = setTimeout(() => setPhase('reveal'),   def.animDuration);
    const t4 = setTimeout(() => setVisible(true),     def.animDuration + 50);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [def.animDuration]);

  const particleColors = [def.color, def.accentColor, '#ffffff', '#fbbf24'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'radial-gradient(ellipse at 50% 40%, #1a0a3e 0%, #050510 70%, #000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Courier New', monospace",
    }}>
      <style>{`
        @keyframes chest-shake {
          0%,100% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-5deg) scale(1.05); }
          40% { transform: rotate(5deg) scale(1.08); }
          60% { transform: rotate(-4deg) scale(1.06); }
          80% { transform: rotate(3deg) scale(1.05); }
        }
        @keyframes chest-burst {
          0% { transform: scale(1.1); opacity: 1; }
          50% { transform: scale(2.5); opacity: 0.5; }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes particle-fly {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
        }
        @keyframes pulse-ring {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 20px ${def.color}60; }
          50% { box-shadow: 0 0 60px ${def.color}cc, 0 0 120px ${def.color}44; }
        }
      `}</style>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#64748b', marginBottom: 4 }}>OPENING</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: def.color, textShadow: `0 0 20px ${def.color}` }}>
          {def.icon} {def.name}
        </div>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{def.description}</div>
      </div>

      {/* Chest icon */}
      {phase !== 'reveal' && (
        <div style={{
          fontSize: 100,
          position: 'relative',
          zIndex: 2,
          animation: phase === 'shaking' ? `chest-shake 0.5s ease-in-out infinite`
                   : phase === 'burst'   ? `chest-burst 0.4s ease-out forwards`
                   : 'none',
          filter: `drop-shadow(0 0 30px ${def.color}) drop-shadow(0 0 60px ${def.color}80)`,
          transformOrigin: 'center',
        }}>
          {def.icon}

          {/* Particles on burst */}
          {phase === 'burst' && Array.from({ length: 16 }, (_, i) => {
            const angle = (i / 16) * 360;
            const dist  = 60 + (i % 4) * 20;
            return (
              <Particle
                key={i}
                x="50%" y="50%"
                color={particleColors[i % particleColors.length]}
                delay={i * 0.03}
                dx={Math.cos((angle * Math.PI) / 180) * dist}
                dy={Math.sin((angle * Math.PI) / 180) * dist}
              />
            );
          })}
        </div>
      )}

      {/* Reward reveal */}
      {phase === 'reveal' && (
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 700, padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 13, color: '#94a3b8', letterSpacing: 2 }}>
            ✦ REWARDS ✦
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 12,
            justifyContent: 'center',
          }}>
            {displayRewards.map((r, i) => (
              <RewardCard key={i} reward={r} index={i} visible={visible} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button
              onClick={() => onClose(displayRewards)}
              style={{
                background: `linear-gradient(135deg, ${def.color}, ${def.accentColor}88)`,
                border: `2px solid ${def.color}`,
                borderRadius: 10, padding: '12px 32px',
                color: '#fff', fontSize: 13, fontWeight: 900,
                letterSpacing: 3, cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: `0 0 20px ${def.color}60`,
                opacity: visible ? 1 : 0,
                transition: `opacity 0.4s ${displayRewards.length * 0.12 + 0.2}s`,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              COLLECT
            </button>
          </div>
        </div>
      )}

      {/* Tap to skip text */}
      {phase !== 'reveal' && (
        <div
          onClick={() => { setPhase('reveal'); setVisible(true); }}
          style={{
            position: 'absolute', bottom: 40,
            fontSize: 11, color: '#374151', letterSpacing: 2,
            cursor: 'pointer',
          }}
        >
          TAP TO OPEN
         </div>
      )}
    </div>
  );
}

// ── Helper: convert raw rewards → display items ───────────────────────────

function buildDisplayRewards(rewards) {
  const items = [];
  if ((rewards.gold ?? rewards.coins ?? 0) > 0) {
    items.push({ type: 'gold', amount: rewards.gold ?? rewards.coins, rarityIndex: 3 });
  }
  if ((rewards.rubies ?? 0) > 0) {
    items.push({ type: 'ruby', amount: rewards.rubies, rarityIndex: 5 });
  }
  if ((rewards.xp ?? 0) > 0) {
    items.push({ type: 'xp', amount: rewards.xp, rarityIndex: 2 });
  }

  for (const raw of (rewards.items ?? [])) {
    if (raw.name) { items.push(raw); continue; }

    if (raw.type === 'ability') {
      const rarity = ABILITY_RARITIES[raw.rarityIndex] ?? 'common';
      try {
        const generated = generateAbility({ rarity, wave: 1, source: 'chest' });
        items.push({ ...raw, name: generated?.name ?? 'Ability', icon: generated?.icon, generatedItem: generated, rarity });
      } catch { items.push({ ...raw, name: 'Ability', rarity: ABILITY_RARITIES[raw.rarityIndex] ?? 'common' }); }

    } else if (raw.type === 'gear') {
      const rarityKey = ABILITY_RARITIES[raw.rarityIndex] ?? 'common';
      try {
        const bp = ALL_BLUEPRINTS[Math.floor(Math.random() * ALL_BLUEPRINTS.length)];
        const generated = generateItem({ blueprintId: bp.id, rarity: rarityKey, wave: 1, source: 'chest' });
        items.push({ ...raw, name: generated?.name ?? 'Equipment', generatedItem: generated, rarity: rarityKey });
      } catch { items.push({ ...raw, name: 'Equipment', rarity: rarityKey }); }

    } else {
      items.push(raw);
    }
  }
  return items;
}

export default ChestOpenScreen;
