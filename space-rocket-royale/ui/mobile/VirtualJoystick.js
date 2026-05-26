// ui/mobile/VirtualJoystick.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function VirtualJoystick({ onMove }) {
  const [touchId, setTouchId] = useState(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [basePos, setBasePos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  const containerRef = useRef(null);
  const joystickSize = 120; // px diameter
  const thumbSize = 50;     // px diameter
  const maxRadius = joystickSize / 2;
  const deadzone = 0.15;    // normalized deadzone threshold

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (touchId !== null) return; // Only process one touch boundary tracking cluster

      // Guard zone: restrict joystick instantiation to the left half of the screen
      const touch = e.changedTouches[0];
      if (touch.clientX > window.innerWidth / 2) return;

      setTouchId(touch.identifier);
      setBasePos({ x: touch.clientX, y: touch.clientY });
      setStickPos({ x: touch.clientX, y: touch.clientY });
      setVisible(true);
    };

    const handleTouchMove = (e) => {
      if (touchId === null) return;

      let targetTouch = null;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchId) {
          targetTouch = e.touches[i];
          break;
        }
      }

      if (!targetTouch) return;

      const dx = targetTouch.clientX - basePos.x;
      const dy = targetTouch.clientY - basePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let clampedX = dx;
      let clampedY = dy;

      if (distance > maxRadius) {
        clampedX = (dx / distance) * maxRadius;
        clampedY = (dy / distance) * maxRadius;
      }

      const nextX = basePos.x + clampedX;
      const nextY = basePos.y + clampedY;

      setStickPos({ x: nextX, y: nextY });

      // Normalize outputs between -1 and 1
      let nx = clampedX / maxRadius;
      let ny = clampedY / maxRadius;

      // Apply deadzone configuration parameters
      if (Math.abs(nx) < deadzone) nx = 0;
      if (Math.abs(ny) < deadzone) ny = 0;

      onMove({ x: nx, y: ny });
    };

    const handleTouchEnd = (e) => {
      if (touchId === null) return;

      let ended = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          ended = true;
          break;
        }
      }

      if (ended) {
        setTouchId(null);
        setVisible(false);
        setStickPos({ x: 0, y: 0 });
        setBasePos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 }); // Auto reset coordinates on structural release
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [touchId, basePos, onMove]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: basePos.x - joystickSize / 2,
        top: basePos.y - joystickSize / 2,
        width: `${joystickSize}px`,
        height: `${joystickSize}px`,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '2px solid rgba(139, 92, 246, 0.4)',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: stickPos.x - basePos.x + joystickSize / 2 - thumbSize / 2,
          top: stickPos.y - basePos.y + joystickSize / 2 - thumbSize / 2,
          width: `${thumbSize}px`,
          height: `${thumbSize}px`,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
          boxShadow: '0 0 15px rgba(124, 58, 237, 0.6)',
          transition: 'transform 0.05s linear',
        }}
      />
    </div>
  );
}