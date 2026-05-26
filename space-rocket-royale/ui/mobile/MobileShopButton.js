// ui/mobile/MobileShopButton.jsx
"use client";

import React from 'react';

export default function MobileShopButton({ engine }) {
  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); engine._toggleShop(); }}
      onClick={() => engine._toggleShop()}
      style={{
        position: 'absolute',
        top: 'max(16px, env(safe-area-inset-top))',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(15, 23, 42, 0.9)',
        border: '2px solid rgba(139, 92, 246, 0.5)',
        borderRadius: '12px',
        padding: '0 16px',
        height: '46px',
        minWidth: '44px',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        color: '#c4b5fd',
        cursor: 'pointer',
        pointerEvents: 'auto',
        zIndex: 95,
        touchAction: 'manipulation',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        fontFamily: '"Courier New", monospace',
        fontWeight: 'bold',
        letterSpacing: '0.05em'
      }}
    >
      🛒 <span style={{ fontSize: '0.8rem', marginLeft: '6px', color: '#e2e8f0' }}>SHOP</span>
    </button>
  );
}