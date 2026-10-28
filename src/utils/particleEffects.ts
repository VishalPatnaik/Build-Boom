import confetti from 'canvas-confetti';
import { THEME_PALETTES } from '../game/themeRenderer';

/**
 * High-performance, lightweight particle triggers using canvas-confetti
 * Triggered on GameBoard when:
 * 1. A block is successfully stacked (placement burst / perfect alignment stars / combo streak)
 * 2. A bomb or block is destroyed by a bomb (high-velocity radial blast fragments / fire embers / defusal electro-sparks)
 */

function safeConfetti(options: confetti.Options) {
  try {
    if (typeof window !== 'undefined') {
      confetti(options);
    }
  } catch (err) {
    console.warn('[particleEffects] confetti call suppressed safely:', err);
  }
}

export function triggerBlockStackParticles(
  normalizedX: number,
  normalizedY: number,
  themeIndex: number,
  isPerfect: boolean,
  combo: number = 1
) {
  const palette = THEME_PALETTES[themeIndex % THEME_PALETTES.length];
  const primary = palette?.primary || '#22c55e';
  const accent = palette?.accent || '#fbbf24';
  const secondary = palette?.secondary || '#15803d';

  // Clamp origin coordinates safely within viewport
  const originX = Math.max(0.05, Math.min(0.95, Number.isFinite(normalizedX) ? normalizedX : 0.5));
  const originY = Math.max(0.05, Math.min(0.95, Number.isFinite(normalizedY) ? normalizedY : 0.65));

  if (isPerfect) {
    // 1. Perfect alignment: brilliant shimmering star burst & radiant golden sparks
    safeConfetti({
      particleCount: Math.min(55, 25 + combo * 5),
      spread: 85,
      startVelocity: 30,
      origin: { x: originX, y: originY },
      colors: [primary, accent, '#ffffff', '#38bdf8', '#fef08a'],
      shapes: ['star', 'circle'],
      scalar: 1.05,
      ticks: 140,
      gravity: 0.85,
      disableForReducedMotion: false,
      zIndex: 100,
    });

    // Secondary micro-sparkle flare for high combo
    if (combo >= 2) {
      setTimeout(() => {
        safeConfetti({
          particleCount: Math.min(30, 15 + combo * 3),
          spread: 120,
          startVelocity: 18,
          origin: { x: originX, y: originY },
          colors: ['#ffffff', accent, primary],
          shapes: ['circle'],
          scalar: 0.7,
          ticks: 100,
          gravity: 0.95,
          disableForReducedMotion: false,
          zIndex: 100,
        });
      }, 70);
    }
  } else {
    // 2. Normal successful placement: crisp biome-matching micro-fragment sparks
    safeConfetti({
      particleCount: Math.min(30, 16 + combo * 3),
      spread: 60,
      startVelocity: 22,
      origin: { x: originX, y: originY },
      colors: [primary, accent, secondary, '#ffffff'],
      shapes: ['square', 'circle'],
      scalar: 0.8,
      ticks: 95,
      gravity: 1.0,
      disableForReducedMotion: false,
      zIndex: 100,
    });
  }
}

export function triggerBombDestroyedParticles(
  normalizedX: number,
  normalizedY: number,
  themeIndex: number,
  isDefused: boolean = false
) {
  const palette = THEME_PALETTES[themeIndex % THEME_PALETTES.length];
  const accent = palette?.accent || '#f59e0b';

  const originX = Math.max(0.05, Math.min(0.95, Number.isFinite(normalizedX) ? normalizedX : 0.5));
  const originY = Math.max(0.05, Math.min(0.95, Number.isFinite(normalizedY) ? normalizedY : 0.65));

  if (isDefused) {
    // Shield absorb / EMP defuse: energetic cyan, gold, and pure white electro-plasma sparks
    safeConfetti({
      particleCount: 50,
      spread: 360,
      startVelocity: 34,
      origin: { x: originX, y: originY },
      colors: ['#38bdf8', '#00f0ff', accent, '#ffffff', '#e0f2fe'],
      shapes: ['circle', 'square'],
      scalar: 0.95,
      ticks: 150,
      gravity: 0.75,
      disableForReducedMotion: false,
      zIndex: 100,
    });
  } else {
    // Lethal detonation: high-velocity explosion shards and fiery flame embers
    safeConfetti({
      particleCount: 85,
      spread: 360,
      startVelocity: 48,
      origin: { x: originX, y: originY },
      colors: ['#ef4444', '#dc2626', '#f97316', '#fbbf24', '#ffffff', '#7f1d1d'],
      shapes: ['circle', 'square'],
      scalar: 1.25,
      ticks: 180,
      gravity: 0.92,
      disableForReducedMotion: false,
      zIndex: 100,
    });

    // Secondary delayed shrapnel crackle pop
    setTimeout(() => {
      safeConfetti({
        particleCount: 40,
        spread: 360,
        startVelocity: 26,
        origin: { x: originX, y: originY },
        colors: ['#f97316', '#fbbf24', '#ffffff'],
        shapes: ['circle'],
        scalar: 0.8,
        ticks: 120,
        gravity: 1.1,
        disableForReducedMotion: false,
        zIndex: 100,
      });
    }, 110);
  }
}
