// ui/mobile/MobileAbilityBar.jsx
"use client";

import React from 'react';

export default function MobileAbilityBar({ state, engine }) {
  const { dashReady, bombReady, bombDmg } = state;

  const buttonStyle = (ready) => ({
    background: ready ? 'rgba(15, 23, 42, 0.95)' : 'rgba(0, 0, 0, 0.6)',
    border: `2px solid ${ready ? 'rgba(139, 92, 246, 0.6)' : 'rgba(55, 65, 81, 0.4)'}`,
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    minWidth: '44px', // Safe accessibility targets
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: '#fff',
    cursor: ready ? 'pointer' : 'not-allowed',
    pointerEvents: 'auto',
    touchAction: 'manipulation',
    boxShadow: ready ? '0 0 15px rgba(139, 92, 246, 0.3)' : 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none'
  });

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: 'max(24px, env(safe-area-inset-bottom))',
        right: 'max(24px, env(safe-area-inset-right))',
        display: 'flex',
        flexDirection: 'row-reverse',
        gap: '16px',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 90
      }}
    >
      <button 
        style={buttonStyle(dashReady)} 
        onTouchStart={(e) => { e.preventDefault(); if (dashReady) engine._dash(); }}
        onClick={() => { if (dashReady) engine._dash(); }}
      >
        💨
      </button>

      {bombDmg > 0 && (
        <button 
          style={buttonStyle(bombReady)} 
          onTouchStart={(e) => { e.preventDefault(); if (bombReady) engine._useBomb(); }}
          onClick={() => { if (bombReady) engine._useBomb(); }}
        >
          💣
        </button>
      )}

      <button 
        style={buttonStyle(true)} 
        onTouchStart={(e) => { e.preventDefault(); engine._useMagnet(); }}
        onClick={() => engine._useMagnet()}
      >
        🧲
      </button>
    </div>
  );
}