/**
 * useScreenShake.ts
 * React hook using Framer Motion to animate screen-shake on heavy block impacts.
 * Scales dynamically based on block mass and impact speed.
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { useAnimationControls } from 'framer-motion';
import { useGameStore } from '../game/store';
import { 
  calculateShakeIntensity, 
  generateShakeAnimation, 
  SCREEN_SHAKE_EVENT, 
  ScreenShakeEventDetail, 
  ShakeIntensity 
} from '../utils/screenShake';

export type ScreenShakeControls = ReturnType<typeof useAnimationControls>;

export interface UseScreenShakeOptions {
  enabled?: boolean;
  globalScale?: number;
  onShake?: (intensity: ShakeIntensity) => void;
}

export interface UseScreenShakeResult {
  shakeControls: ScreenShakeControls;
  triggerShake: (mass: number, speed?: number, angle?: number, multiplier?: number) => void;
  isShaking: boolean;
  lastIntensity: ShakeIntensity | null;
}

export function useScreenShake(options: UseScreenShakeOptions = {}): UseScreenShakeResult {
  const {
    enabled = true,
    globalScale = 1.0,
    onShake,
  } = options;

  const shakeControls = useAnimationControls();
  const screenShakeEnabled = useGameStore((s) => s.screenShakeEnabled);
  
  const [isShaking, setIsShaking] = useState(false);
  const [lastIntensity, setLastIntensity] = useState<ShakeIntensity | null>(null);
  
  const timeoutRef = useRef<any>(null);

  const triggerShake = useCallback((
    mass: number,
    speed: number = 30,
    angle: number = 0,
    multiplier: number = 1.0
  ) => {
    // Check if enabled locally and in player settings
    if (!enabled || !screenShakeEnabled) return;

    // Calculate physical shockwave parameters
    const intensity = calculateShakeIntensity(mass, speed, {
      angle,
      multiplier: multiplier * globalScale,
    });

    setLastIntensity(intensity);
    setIsShaking(true);

    if (onShake) {
      onShake(intensity);
    }

    // Trigger the Framer Motion animation sequence
    const anim = generateShakeAnimation(intensity);
    shakeControls.start(anim);

    // Clear previous timeout if any
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule settling status
    timeoutRef.current = setTimeout(() => {
      setIsShaking(false);
    }, Math.round(intensity.duration * 1000));
  }, [enabled, screenShakeEnabled, globalScale, onShake, shakeControls]);

  // Global event listener for non-React or cross-module triggers
  useEffect(() => {
    const handleGlobalShake = (e: Event) => {
      const customEvent = e as CustomEvent<ScreenShakeEventDetail>;
      if (!customEvent.detail) return;
      const { mass, speed, angle, multiplier } = customEvent.detail;
      triggerShake(mass, speed, angle, multiplier);
    };

    window.addEventListener(SCREEN_SHAKE_EVENT, handleGlobalShake);
    return () => {
      window.removeEventListener(SCREEN_SHAKE_EVENT, handleGlobalShake);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [triggerShake]);

  return {
    shakeControls,
    triggerShake,
    isShaking,
    lastIntensity,
  };
}
