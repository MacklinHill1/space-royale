// ui/hud/AbilityHUD.jsx
// Always-visible desktop HUD showing the Z/X equipped active abilities,
// their cooldown state, and rarity styling. Pure display — the actual
// key handling lives in GameEngine._activateAbilitySlot().
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ABILITY_RARITY_COLORS, ABILITY_RARITY_GLOW } from '../../constants/AbilityData.js';

// Slots this HUD renders, in order, each mapped to its hotkey.
const HUD_SLOTS = [
  { slotKey: 'active1', hotkey: 'Z' },
  { slotKey: 'active2', hotkey: 'X' },
];

/** Tracks whether a cooldown just crossed from >0 to <=0, for a brief "ready" flash. */
function useJustReady(remaining) {
  const prevRef = useRef(remaining);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const prev = prevRef.current;
    if (prev > 0 && remaining <= 0) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 550);
      prevRef.current = remaining;
      return () => clearTimeout(t);
    }
    prevRef.current = remaining;
  }, [remaining]);
  return flash;
}

function AbilitySlot({ ability, cooldown, hotkey }) {
  const remaining = Math.max(0, cooldown || 0);
  const total = (ability && ability.cooldown) || 0;
  const ready = !ability || remaining <= 0;
  const pctRemaining = total > 0 ? Math.min(1, remaining / total) : 0;
  const justReady = useJustReady(ability ? remaining : 0);

  const rarity = ability?.rarity || 'common';
  const rarityColor = ABILITY_RARITY_COLORS[rarity] || '#9ca3af';
  const rarityGlow = ABILITY_RARITY_GLOW[rarity] || 'rgba(156,163,175,0.25)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Icon + radial cooldown sweep */}
      <div
        style={{
          position: 'relative',
          width: '44px',
          height: '44px',
          flexShrink: 0,
          borderRadius: '10px',
          background: 'rgba(8,10,20,0.9)',
          border: `2px solid ${ability ? rarityColor : 'rgba(100,116,139,0.35)'}`,
          boxShadow: ability
            ? (justReady ? `0 0 18px 4px ${rarityColor}` : `0 0 10px ${rarityGlow}`)
            : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.3rem',
          overflow: 'hidden',
          transition: 'box-shadow 0.25s ease',
        }}
      >
        <span
          style={{
            filter: ability && !ready ? 'grayscale(1) brightness(0.55)' : 'none',
            opacity: ability ? 1 : 0.3,
            transition: 'filter 0.2s ease, opacity 0.2s ease',
            transform: justReady ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          {ability ? ability.icon : '—'}
        </span>

        {/* Radial cooldown wipe overlay */}
        {ability && !ready && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '8px',
              background: `conic-gradient(rgba(0,0,0,0.78) ${pctRemaining * 360}deg, transparent ${pctRemaining * 360}deg)`,
              transform: 'rotate(-90deg)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Ready pulse ring */}
        {justReady && (
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '12px',
              border: `2px solid ${rarityColor}`,
              animation: 'abilityReadyPulse 0.55s ease-out',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Hotkey badge */}
        <div
          style={{
            position: 'absolute',
            top: '-6px',
            left: '-6px',
            width: '17px',
            height: '17px',
            borderRadius: '4px',
            background: 'rgba(15,23,42,0.95)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6rem',
            fontWeight: '700',
            color: '#e2e8f0',
          }}
        >
          {hotkey}
        </div>
      </div>

      {/* Name + cooldown bar / READY label */}
      <div style={{ minWidth: '108px' }}>
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: ability ? '#e2e8f0' : '#4b5563',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '140px',
          }}
        >
          {ability ? ability.name : 'Empty Slot'}
        </div>

        {ability ? (
          ready ? (
            <div
              style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                color: '#4ade80',
                letterSpacing: '0.1em',
                marginTop: '2px',
              }}
            >
              READY
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
              <div
                style={{
                  width: '68px',
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(1 - pctRemaining) * 100}%`,
                    background: `linear-gradient(90deg, ${rarityColor}, ${rarityColor}cc)`,
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{remaining.toFixed(1)}s</span>
            </div>
          )
        ) : (
          <div style={{ fontSize: '0.65rem', color: '#4b5563', marginTop: '2px' }}>{hotkey}</div>
        )}
      </div>
    </div>
  );
}

export default function AbilityHUD({ state }) {
  const abilityLoadout = state?.abilityLoadout || {};
  const abilityCooldowns = state?.abilityCooldowns || {};

  return (
    <div
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        fontFamily: '"Courier New", monospace',
        background: 'rgba(10,12,22,0.72)',
        border: '1px solid rgba(139,92,246,0.35)',
        borderRadius: '12px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backdropFilter: 'blur(2px)',
      }}
    >
      <style>{`
        @keyframes abilityReadyPulse {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.35); }
        }
      `}</style>
      {HUD_SLOTS.map(({ slotKey, hotkey }) => {
        const ability = abilityLoadout[slotKey] || null;
        const cooldown = ability ? (abilityCooldowns[ability.id] || 0) : 0;
        return (
          <AbilitySlot key={slotKey} ability={ability} cooldown={cooldown} hotkey={hotkey} />
        );
      })}
    </div>
  );
}
