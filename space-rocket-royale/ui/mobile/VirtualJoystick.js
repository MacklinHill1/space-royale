// ui/mobile/VirtualJoystick.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';

const JOYSTICK_SIZE = 130; // outer ring diameter px
const THUMB_SIZE    = 52;  // thumb diameter px
const MAX_RADIUS    = JOYSTICK_SIZE / 2;
const DEADZONE      = 0.12;

// Static position for the "ghost" base (bottom-left)
const STATIC_X = 80;  // px from left edge
const STATIC_Y = 80;  // px from bottom edge

export default function VirtualJoystick({ onMove }) {
  const [touchId,  setTouchId]  = useState(null);
  const [basePos,  setBasePos]  = useState(null);   // null = use static position
  const [thumbOff, setThumbOff] = useState({ x: 0, y: 0 }); // offset from base center

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (touchId !== null) return;

      const touch = e.changedTouches[0];
      // Only capture touches in the left 45% of the screen
      if (touch.clientX > window.innerWidth * 0.45) return;

      e.preventDefault();
      setTouchId(touch.identifier);
      setBasePos({ x: touch.clientX, y: touch.clientY });
      setThumbOff({ x: 0, y: 0 });
    };

    const handleTouchMove = (e) => {
      if (touchId === null) return;

      let target = null;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchId) { target = e.touches[i]; break; }
      }
      if (!target || !basePos) return;

      e.preventDefault();

      const dx = target.clientX - basePos.x;
      const dy = target.clientY - basePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let cx = dx, cy = dy;
      if (dist > MAX_RADIUS) {
        cx = (dx / dist) * MAX_RADIUS;
        cy = (dy / dist) * MAX_RADIUS;
      }

      setThumbOff({ x: cx, y: cy });

      let nx = cx / MAX_RADIUS;
      let ny = cy / MAX_RADIUS;
      if (Math.abs(nx) < DEADZONE) nx = 0;
      if (Math.abs(ny) < DEADZONE) ny = 0;

      onMove({ x: nx, y: ny });
    };

    const handleTouchEnd = (e) => {
      if (touchId === null) return;

      let ended = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) { ended = true; break; }
      }

      if (ended) {
        setTouchId(null);
        setBasePos(null);
        setThumbOff({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
      }
    };

    window.addEventListener('touchstart',  handleTouchStart,  { passive: false });
    window.addEventListener('touchmove',   handleTouchMove,   { passive: false });
    window.addEventListener('touchend',    handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart',  handleTouchStart);
      window.removeEventListener('touchmove',   handleTouchMove);
      window.removeEventListener('touchend',    handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [touchId, basePos, onMove]);

  const isActive = touchId !== null && basePos !== null;

  // When active: position base where the finger landed
  // When idle:   show ghost base in bottom-left corner
  const baseLeft = isActive
    ? basePos.x - JOYSTICK_SIZE / 2
    : STATIC_X  - JOYSTICK_SIZE / 2;

  const baseTop = isActive
    ? basePos.y - JOYSTICK_SIZE / 2
    : (typeof window !== 'undefined' ? window.innerHeight - STATIC_Y : 0) - JOYSTICK_SIZE / 2;

  const thumbLeft = JOYSTICK_SIZE / 2 - THUMB_SIZE / 2 + (isActive ? thumbOff.x : 0);
  const thumbTop  = JOYSTICK_SIZE / 2 - THUMB_SIZE / 2 + (isActive ? thumbOff.y : 0);

  return (
    <div
      style={{
        position:     'fixed',
        left:          baseLeft,
        top:           baseTop,
        width:        `${JOYSTICK_SIZE}px`,
        height:       `${JOYSTICK_SIZE}px`,
        borderRadius: '50%',
        background:    isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
        border:       `2px solid ${isActive ? 'rgba(139,92,246,0.7)' : 'rgba(139,92,246,0.25)'}`,
        backdropFilter: 'blur(4px)',
        pointerEvents: 'none',
        zIndex: 1000,
        transition:   isActive ? 'none' : 'opacity 0.2s',
        opacity:       isActive ? 1 : 0.6,
      }}
    >
      {/* Crosshair lines in ghost mode */}
      {!isActive && (
        <>
          <div style={{
            position: 'absolute', left: '50%', top: '20%', bottom: '20%',
            width: 1, background: 'rgba(139,92,246,0.3)', transform: 'translateX(-50%)',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '20%', right: '20%',
            height: 1, background: 'rgba(139,92,246,0.3)', transform: 'translateY(-50%)',
          }} />
        </>
      )}

      {/* Thumb */}
      <div
        style={{
          position:     'absolute',
          left:          thumbLeft,
          top:           thumbTop,
          width:        `${THUMB_SIZE}px`,
          height:       `${THUMB_SIZE}px`,
          borderRadius: '50%',
          background:    isActive
            ? 'linear-gradient(135deg, #a78bfa, #7c3aed)'
            : 'rgba(124,58,237,0.35)',
          boxShadow:     isActive ? '0 0 15px rgba(124,58,237,0.7)' : 'none',
          border:       `2px solid ${isActive ? 'transparent' : 'rgba(124,58,237,0.4)'}`,
          transition:   isActive ? 'none' : 'all 0.15s',
        }}
      />
    </div>
  );
}
