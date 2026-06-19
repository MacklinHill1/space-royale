'use client';
// ui/screens/ModeSelectScreen.jsx
// Game mode selection grid — shown after clicking PLAY from main menu.

import { useState } from 'react';
import { GAME_MODES } from '../../constants/GameModes.js';

const DIFFICULTY_STARS = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#374151', fontSize: 12 }}>★</span>
    );
  }
  return stars;
};

const RARITY_COLORS = {
  1: '#94a3b8',
  2: '#3b82f6',
  3: '#a855f7',
  4: '#f59e0b',
  5: '#ef4444',
};

export function ModeSelectScreen({ onSelect, onBack, bestScores = {}, save = {} }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const selectedMode = GAME_MODES.find(m => m.id === selected) || null;

  function handleStart() {
    if (!selected) return;
    onSelect(selected);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #0a0a15 60%, #000 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'hidden', fontFamily: "'Courier New', monospace",
    }}>
      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() > 0.8 ? 2 : 1,
            height: Math.random() > 0.8 ? 2 : 1,
            borderRadius: '50%',
            background: '#fff',
            opacity: 0.3 + Math.random() * 0.5,
          }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '28px 20px 16px', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: '#7c3aed', marginBottom: 4 }}>SPACE ROYALE</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: 2, textShadow: '0 0 30px #7c3aed' }}>
          SELECT GAME MODE
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
          Choose your mission and enter the cosmos
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        flex: 1, display: 'flex', gap: 20, padding: '0 24px 24px',
        overflow: 'hidden', width: '100%', maxWidth: 1100, boxSizing: 'border-box',
        position: 'relative', zIndex: 2,
      }}>
        {/* Mode grid */}
        <div style={{
          flex: 1, overflowY: 'auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12, alignContent: 'start',
        }}>
          {GAME_MODES.map(mode => {
            const isHovered  = hovered  === mode.id;
            const isSelected = selected === mode.id;
            const best = bestScores[mode.id] ?? 0;
            return (
              <button
                key={mode.id}
                onClick={() => setSelected(mode.id)}
                onMouseEnter={() => setHovered(mode.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${mode.color}40, ${mode.color}20)`
                    : isHovered
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(10,10,25,0.7)',
                  border: isSelected
                    ? `2px solid ${mode.color}`
                    : isHovered
                    ? '2px solid rgba(255,255,255,0.15)'
                    : '2px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: '16px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  transform: isSelected ? 'scale(1.02)' : isHovered ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: isSelected ? `0 0 20px ${mode.color}40` : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    background: mode.color, color: '#fff',
                    fontSize: 9, fontWeight: 700, letterSpacing: 1,
                    padding: '2px 6px', borderRadius: 4,
                  }}>SELECTED</div>
                )}

                {/* Icon + name */}
                <div style={{ fontSize: 28, marginBottom: 6 }}>{mode.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>{mode.name}</div>

                {/* Difficulty stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 6 }}>
                  {DIFFICULTY_STARS(mode.difficultyRating)}
                  <span style={{ fontSize: 10, color: '#64748b', marginLeft: 4 }}>{mode.difficulty}</span>
                </div>

                {/* Tagline */}
                <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>{mode.tagline}</div>

                {/* Best score */}
                {best > 0 && (
                  <div style={{ marginTop: 8, fontSize: 10, color: '#64748b' }}>
                    Best: <span style={{ color: mode.accentColor }}>{best.toLocaleString()}</span>
                  </div>
                )}

                {/* Color accent bar */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${mode.color}, ${mode.accentColor})`,
                  opacity: isSelected ? 1 : 0.4,
                }} />
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div style={{
          width: 280, flexShrink: 0,
          background: 'rgba(10,10,25,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: 20,
          display: 'flex', flexDirection: 'column', gap: 16,
          overflowY: 'auto',
        }}>
          {selectedMode ? (
            <>
              {/* Mode header */}
              <div>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{selectedMode.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{selectedMode.name}</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {DIFFICULTY_STARS(selectedMode.difficultyRating)}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{selectedMode.description}</div>
              </div>

              {/* Rewards */}
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: '#64748b', marginBottom: 8 }}>REWARDS</div>
                {selectedMode.rewards.map((r, i) => (
                  <div key={i} style={{ fontSize: 11, color: selectedMode.accentColor, marginBottom: 4, display: 'flex', gap: 6 }}>
                    <span style={{ color: '#4ade80' }}>✓</span> {r}
                  </div>
                ))}
              </div>

              {/* Rules summary */}
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, color: '#64748b', marginBottom: 8 }}>MODIFIERS</div>
                <RuleTag label="XP" value={`×${selectedMode.rules.xpMult ?? 1}`} />
                <RuleTag label="Gold" value={`×${selectedMode.rules.goldMult ?? 1}`} />
                <RuleTag label="Enemies" value={`×${selectedMode.rules.spawnBudgetMult ?? 1}`} />
                <RuleTag label="Equip Drops" value={`×${selectedMode.rules.equipDropMult ?? 1}`} />
                <RuleTag label="Ruby Drops" value={`×${selectedMode.rules.rubyDropMult ?? 1}`} />
              </div>

              {/* Recommended */}
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8, padding: '8px 12px',
                fontSize: 11, color: '#64748b',
              }}>
                Recommended for: <span style={{ color: '#e2e8f0' }}>{selectedMode.recommended}</span>
              </div>

              {/* Best score */}
              <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                Best Score: <span style={{ color: selectedMode.accentColor, fontSize: 14, fontWeight: 700 }}>
                  {(bestScores[selectedMode.id] ?? 0).toLocaleString()}
                </span>
              </div>

              {/* Start button */}
              <button
                onClick={handleStart}
                style={{
                  background: `linear-gradient(135deg, ${selectedMode.color}, ${selectedMode.accentColor}44)`,
                  border: `2px solid ${selectedMode.color}`,
                  borderRadius: 10, padding: '14px 0',
                  color: '#fff', fontSize: 15, fontWeight: 900,
                  letterSpacing: 3, cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.15s',
                  boxShadow: `0 0 20px ${selectedMode.color}60`,
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {selectedMode.icon} LAUNCH
              </button>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>🌌</div>
              <div style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}>
                Select a game mode<br />to see details and launch
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back button */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '8px 16px',
            color: '#94a3b8', fontSize: 12, cursor: 'pointer',
            letterSpacing: 2, fontFamily: 'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >
          ← BACK
        </button>
      </div>
    </div>
  );
}

function RuleTag({ label, value }) {
  const isBonus = parseFloat(value) > 1;
  const isNeutral = parseFloat(value) === 1 || value === '×1';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
      <span style={{ fontSize: 10, color: '#64748b' }}>{label}</span>
      <span style={{
        fontSize: 11, fontWeight: 700,
        color: isNeutral ? '#475569' : isBonus ? '#4ade80' : '#f87171',
      }}>{value}</span>
    </div>
  );
}

export default ModeSelectScreen;
