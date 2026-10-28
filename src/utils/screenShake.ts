/**
 * screenShake.ts
 * Framer Motion screen-shake utility that triggers dynamic, physics-based viewport
 * tremors whenever a heavy block impacts the tower, with displacement, torque,
 * and duration scaled relative to the block's mass and impact speed.
 */

import { TargetAndTransition } from 'framer-motion';

export interface ShakeIntensity {
  intensityScore: number; // 0.0 (micro) to 1.0 (extreme titan seismic)
  displacementX: number;  // Peak horizontal displacement in pixels
  displacementY: number;  // Peak vertical displacement in pixels
  rotation: number;       // Rotational torque in degrees
  duration: number;       // Animation duration in seconds
  isHeavy: boolean;       // Whether impact exceeds heavy threshold (mass >= 1.4)
}

export interface ShakeCalculationOptions {
  angle?: number;         // Arrival angle in degrees (-180 to 180)
  multiplier?: number;    // Scaling multiplier (e.g. for explosions or combos)
  minMassThreshold?: number; // Minimum mass to trigger shake (default: 0.4)
}

/**
 * Calculates physical shake intensity based on block mass and impact velocity.
 * Formula models kinetic energy dissipation: E_k ~ mass * (speed / baseline)^1.15
 */
export function calculateShakeIntensity(
  mass: number = 1.0,
  speed: number = 30,
  options: ShakeCalculationOptions = {}
): ShakeIntensity {
  const {
    angle = 0,
    multiplier = 1.0,
  } = options;

  const safeMass = Math.max(0.3, mass);
  const safeSpeed = Math.max(12, speed);

  // Normalized velocity ratio compared to standard baseline speed (30 units)
  const velocityFactor = Math.pow(safeSpeed / 30, 1.15);

  // Kinetic impact coefficient
  const rawEnergy = safeMass * velocityFactor * multiplier;

  // Normalized intensity score between 0.05 and 1.0
  const intensityScore = Math.min(1.0, Math.max(0.05, rawEnergy / 3.2));

  // Determine if directional sway should follow arrival angle
  const rad = (angle * Math.PI) / 180;
  const dirX = Math.abs(Math.sin(rad)) > 0.2 ? Math.sin(rad) : (Math.random() > 0.5 ? 1 : -1);

  // Displacements in pixels:
  // - Light blocks (mass < 1.0): 2px - 5px
  // - Standard blocks (mass ~ 1.0): 4px - 8px
  // - Heavy blocks (mass ~ 2.0+ e.g. Gold Ingot, Titan): 10px - 26px
  const baseDisplacement = 4.0 + (rawEnergy * 5.2);
  const displacementX = Math.min(24, Math.max(2, baseDisplacement * 0.9 * Math.abs(dirX)));
  const displacementY = Math.min(28, Math.max(3, baseDisplacement * 1.15)); // Vertical compression into tower base

  // Subtle rotational torque in degrees (max 2.2 deg)
  const rotation = Math.min(2.2, Math.max(0.2, (rawEnergy * 0.42)));

  // Duration in seconds: heavier mass creates a longer low-frequency resonance
  const duration = Math.min(0.48, Math.max(0.12, 0.12 + (safeMass * 0.08) + (safeSpeed * 0.0015)));

  const isHeavy = safeMass >= 1.4 || intensityScore >= 0.45;

  return {
    intensityScore,
    displacementX,
    displacementY,
    rotation,
    duration,
    isHeavy,
  };
}

/**
 * Generates an oscillatory decaying spring keyframe set for Framer Motion.
 */
export function generateShakeAnimation(intensity: ShakeIntensity): TargetAndTransition {
  const { displacementX: dx, displacementY: dy, rotation: rot, duration } = intensity;

  // Non-linear decaying shockwave oscillation:
  // Impact peak -> rebound -> secondary echo -> subtle tertiary settling -> neutral
  return {
    x: [0, -dx, dx * 0.72, -dx * 0.45, dx * 0.22, -dx * 0.08, 0],
    y: [0, dy, -dy * 0.68, dy * 0.42, -dy * 0.18, 0],
    rotate: [0, -rot, rot * 0.65, -rot * 0.35, rot * 0.12, 0],
    transition: {
      duration,
      ease: [0.22, 1, 0.36, 1], // Smooth custom cubic-bezier deceleration
    },
  };
}

/**
 * Global Screen Shake Event Dispatcher for non-React contexts
 */
export const SCREEN_SHAKE_EVENT = 'build_or_boom_screen_shake';

export interface ScreenShakeEventDetail {
  mass: number;
  speed: number;
  angle?: number;
  multiplier?: number;
}

export function triggerGlobalScreenShake(
  mass: number,
  speed: number = 30,
  angle: number = 0,
  multiplier: number = 1.0
) {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent<ScreenShakeEventDetail>(SCREEN_SHAKE_EVENT, {
    detail: { mass, speed, angle, multiplier },
  });
  window.dispatchEvent(event);
}
