// hooks/useMobileDetect.js
//
// Single source of truth for device/input capability detection.
//
// Design decisions:
//   - Uses matchMedia + maxTouchPoints, NOT userAgent strings (fragile).
//   - `isMobile` and `isTablet` are detected once on mount and do NOT change
//     during a session. This prevents mid-game re-renders from orientation
//     changes toggling control schemes.
//   - `orientation` DOES update so the HUD can react to landscape/portrait.
//   - `prefersReducedMotion` is exposed so particle systems can self-regulate.
//   - All values are safe to read during SSR (they fall back to false/desktop).
//
// Phase 0 usage: passive reads in page.js and GameEngine.js
// Phase 1 usage: drives VirtualJoystick rendering and touch event binding

import { useState, useEffect } from 'react';

/**
 * @typedef {Object} MobileDetectResult
 * @property {boolean} isMobile        - Phone-sized touch device (< 768px wide or touch primary)
 * @property {boolean} isTablet        - Tablet-sized touch device (768–1024px)
 * @property {boolean} isTouch         - Any touch-capable device (includes laptops with touch screens)
 * @property {boolean} isIOS           - iPhone or iPad (for fullscreen / safe-area handling)
 * @property {boolean} isAndroid       - Android device
 * @property {'landscape'|'portrait'} orientation - Updates on rotation
 * @property {boolean} prefersReducedMotion - User has requested reduced motion in OS settings
 */

/**
 * Detect once on mount whether we're on a touch/mobile device.
 * Returns a stable result object; only `orientation` changes after mount.
 *
 * @returns {MobileDetectResult}
 */
export function useMobileDetect() {
  const [state, setState] = useState(() => getInitialState());

  useEffect(() => {
    // Orientation listener — the only value that should change at runtime
    const orientationQuery = window.matchMedia('(orientation: landscape)');

    const handleOrientationChange = (e) => {
      setState(prev => ({
        ...prev,
        orientation: e.matches ? 'landscape' : 'portrait',
      }));
    };

    // Modern API
    if (orientationQuery.addEventListener) {
      orientationQuery.addEventListener('change', handleOrientationChange);
    } else {
      // Safari < 14 fallback
      orientationQuery.addListener(handleOrientationChange);
    }

    return () => {
      if (orientationQuery.removeEventListener) {
        orientationQuery.removeEventListener('change', handleOrientationChange);
      } else {
        orientationQuery.removeListener(handleOrientationChange);
      }
    };
  }, []); // empty deps — device type never changes, only orientation

  return state;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getInitialState() {
  // SSR guard — all false during server render
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isTouch: false,
      isIOS: false,
      isAndroid: false,
      orientation: 'landscape',
      prefersReducedMotion: false,
    };
  }

  const touchPoints = navigator.maxTouchPoints ?? 0;
  const isTouch = touchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

  // Width-based breakpoints (actual viewport, not screen resolution)
  const viewportWidth = window.innerWidth;
  const isPhoneWidth  = viewportWidth < 768;
  const isTabletWidth = viewportWidth >= 768 && viewportWidth <= 1024;

  // A "mobile" device is touch-primary AND phone-sized.
  // A laptop with a touchscreen is isTouch but NOT isMobile.
  const isMobile = isTouch && isPhoneWidth;
  const isTablet = isTouch && isTabletWidth;

  // Platform detection via userAgent — kept minimal and only for
  // platform-specific APIs (safe-area, fullscreen behavior), not for
  // feature detection.
  const ua = navigator.userAgent ?? '';
  const isIOS     = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && touchPoints > 1);
  const isAndroid = /Android/.test(ua);

  const orientation = window.matchMedia('(orientation: landscape)').matches
    ? 'landscape'
    : 'portrait';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return { isMobile, isTablet, isTouch, isIOS, isAndroid, orientation, prefersReducedMotion };
}

/**
 * Convenience: returns true if ANY form of mobile/tablet is detected.
 * Useful for conditional rendering when you don't need the full breakdown.
 *
 * @param {MobileDetectResult} detect
 * @returns {boolean}
 */
export function isMobileOrTablet(detect) {
  return detect.isMobile || detect.isTablet;
}
