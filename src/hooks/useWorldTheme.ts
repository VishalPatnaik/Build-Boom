import React, { useMemo, useEffect, useCallback, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, VisualThemeMode } from '../game/store';
import { 
  resolveActiveWorld, 
  ActiveWorldInfo, 
  WORLD_NAMES, 
  WORLD_ATMOSPHERES, 
  WorldAtmosphereProfile,
  WORLD_WEATHER_CONFIGS, 
  WorldWeatherConfig,
  WORLD_LIGHT_IDENTITIES,
  EnvironmentalLightIdentity 
} from '../game/EnvironmentRenderer';
import { getThemePalette, applyThemeCSSVariables } from '../utils/themeAccents';
import { WorldThemeColors } from '../game/themeRenderer';
import { triggerBlockStackParticles, triggerBombDestroyedParticles } from '../utils/particleEffects';

export interface WorldShaderConfig {
  atmosphere: WorldAtmosphereProfile;
  lightingIdentity: EnvironmentalLightIdentity;
  bloom: {
    enabled: boolean;
    color: string;
    intensity: number;
    blurRadius: number;
  };
  haze: {
    enabled: boolean;
    color: string;
    density: number;
    horizonRatio: number;
  };
  lightingPass: {
    enabled: boolean;
    pulseType: string;
    baseIntensity: number;
    primaryColor: string;
    sourceName: string;
  };
  specialMode: VisualThemeMode | null;
}

export interface WorldParticlePresets {
  weather: WorldWeatherConfig;
  stackColors: string[];
  bombColors: {
    normal: string[];
    defused: string[];
  };
  triggerStackParticles: (normX: number, normY: number, isPerfect: boolean, combo?: number) => void;
  triggerBombParticles: (normX: number, normY: number, isDefused?: boolean) => void;
}

export interface WorldCSSVariables extends React.CSSProperties {
  '--theme-primary': string;
  '--theme-secondary': string;
  '--theme-accent': string;
  '--theme-glow': string;
  '--theme-dark': string;
  '--theme-border': string;
  '--theme-haze': string;
  '--theme-bloom': string;
  '--theme-gradient': string;
}

export const WORLD_ENVIRONMENT_KEYS: Record<number, string> = {
  0: 'Meadow',
  1: 'Lunar',
  2: 'Canyon',
  3: 'Space',
  4: 'Ocean',
  5: 'Beach',
  6: 'Volcano',
  7: 'Citadel',
  8: 'Forest',
  9: 'Desert',
  10: 'Winter',
  11: 'Pirate',
  12: 'Candy',
  13: 'ElDorado',
  14: 'Cyberpunk',
  15: 'Industrial',
  16: 'Sky',
  17: 'Clockwork',
  18: 'Sakura',
  19: 'Crystal',
};

export interface WorldThemeResult {
  worldIndex: number;
  worldId: string;
  worldName: string;
  worldKey: string;
  visualTheme: VisualThemeMode;
  isHighContrast: boolean;
  isSpecialTheme: boolean;
  palette: WorldThemeColors;
  cssVariables: WorldCSSVariables;
  shaders: WorldShaderConfig;
  particles: WorldParticlePresets;
  activeWorldInfo: ActiveWorldInfo;
  applyCSSVariablesToElement: (el?: HTMLElement | null) => void;
  /**
   * Atomic batch update on store state:
   * Prevents multiple re-renders when switching world themes during high-intensity gameplay
   */
  switchWorldTheme: (
    targetWorld: string | number,
    options?: {
      visualTheme?: VisualThemeMode;
      equipMatchingSet?: boolean;
      transitionMessage?: string;
      skipTransition?: boolean;
    }
  ) => void;
}

/**
 * Unified Theme Hook: Maps the active or overridden World environment
 * to real-time CSS variables, shader configurations, and particle presets.
 * 
 * Performs batched store updates and shallow subscriptions to prevent
 * multiple re-renders during high-intensity gameplay.
 */
export function useWorldTheme(overrideWorldId?: string | number | null): WorldThemeResult {
  // Use shallow comparison to batch store observations and avoid re-renders on unrelated store changes
  const {
    mode,
    state,
    level,
    equippedBackground,
    activeTournament,
    visualTheme,
    highContrastMode,
  } = useGameStore(
    useShallow((s) => ({
      mode: s.mode,
      state: s.state,
      level: s.level,
      equippedBackground: s.equippedBackground,
      activeTournament: s.activeTournament,
      visualTheme: s.visualTheme,
      highContrastMode: s.highContrastMode,
    }))
  );

  // 1. Resolve Target World Index and Info
  const activeWorldInfo: ActiveWorldInfo = useMemo(() => {
    if (overrideWorldId !== undefined && overrideWorldId !== null) {
      let idx = 0;
      let idStr = 'bg-0';
      if (typeof overrideWorldId === 'number') {
        idx = Math.abs(Math.round(overrideWorldId)) % 20;
        idStr = `bg-${idx}`;
      } else {
        const clean = (overrideWorldId || '').toLowerCase();
        idx = Math.abs(parseInt(clean.replace('bg-', '').replace('campaign-', '')) || 0) % 20;
        idStr = clean || `bg-${idx}`;
      }

      let targetVisualTheme: VisualThemeMode = 'default';
      if (idx === 14) targetVisualTheme = 'cyberpunk';
      else if (idx === 13) targetVisualTheme = 'solar-gold';
      else if (idx === 3) targetVisualTheme = 'deep-cosmos';

      return {
        worldId: idStr,
        worldIndex: idx,
        worldName: WORLD_NAMES[idx] || 'World Environment',
        visualTheme: targetVisualTheme,
        isSpecialTheme: false,
        matchingSkinId: `skin-${idx}`,
        matchingPlateId: `plate-${idx}`,
        matchingBoomId: `boom-${idx}`,
      };
    }

    return resolveActiveWorld({
      mode,
      state,
      level,
      equippedBackground,
      activeTournament,
      visualTheme,
    });
  }, [overrideWorldId, mode, state, level, equippedBackground, activeTournament, visualTheme]);

  const worldIndex = activeWorldInfo.worldIndex;
  const worldId = activeWorldInfo.worldId;
  const worldName = activeWorldInfo.worldName;
  const isHighContrast = visualTheme === 'high-contrast' || highContrastMode;
  const isSpecialTheme = activeWorldInfo.isSpecialTheme;

  // 2. Palette & CSS Variables
  const palette = useMemo(() => getThemePalette(worldIndex), [worldIndex]);

  const atmosphere: WorldAtmosphereProfile = useMemo(() => {
    return WORLD_ATMOSPHERES[worldIndex] || WORLD_ATMOSPHERES[0];
  }, [worldIndex]);

  const lightingIdentity: EnvironmentalLightIdentity = useMemo(() => {
    return WORLD_LIGHT_IDENTITIES[worldIndex] || WORLD_LIGHT_IDENTITIES[0];
  }, [worldIndex]);

  const weatherConfig: WorldWeatherConfig = useMemo(() => {
    return WORLD_WEATHER_CONFIGS[worldIndex] || WORLD_WEATHER_CONFIGS[0];
  }, [worldIndex]);

  const cssVariables: WorldCSSVariables = useMemo(() => ({
    '--theme-primary': palette.primary,
    '--theme-secondary': palette.secondary,
    '--theme-accent': palette.accent,
    '--theme-glow': palette.glow,
    '--theme-dark': palette.dark,
    '--theme-border': palette.accent,
    '--theme-haze': atmosphere.hazeColor,
    '--theme-bloom': atmosphere.emissiveBloomColor,
    '--theme-gradient': `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`,
  }), [palette, atmosphere]);

  // 3. Shader Configuration
  const shaders: WorldShaderConfig = useMemo(() => ({
    atmosphere,
    lightingIdentity,
    bloom: {
      enabled: !isHighContrast,
      color: atmosphere.emissiveBloomColor,
      intensity: atmosphere.emissiveIntensity,
      blurRadius: Math.round(14 * atmosphere.emissiveIntensity),
    },
    haze: {
      enabled: !isHighContrast,
      color: atmosphere.hazeColor,
      density: atmosphere.density,
      horizonRatio: atmosphere.horizonRatio,
    },
    lightingPass: {
      enabled: !isHighContrast,
      pulseType: lightingIdentity.pulseType,
      baseIntensity: lightingIdentity.baseIntensity,
      primaryColor: lightingIdentity.primaryColor,
      sourceName: lightingIdentity.sourceName,
    },
    specialMode: isHighContrast ? 'high-contrast' : (visualTheme !== 'default' ? visualTheme : null),
  }), [atmosphere, lightingIdentity, isHighContrast, visualTheme]);

  // 4. Particle Presets & Triggers
  const particles: WorldParticlePresets = useMemo(() => ({
    weather: weatherConfig,
    stackColors: [palette.primary, palette.accent, '#ffffff', palette.secondary],
    bombColors: {
      normal: ['#fef08a', '#f97316', '#ef4444', palette.accent],
      defused: ['#38bdf8', '#00f0ff', palette.accent, '#ffffff', '#e0f2fe'],
    },
    triggerStackParticles: (normX: number, normY: number, isPerfect: boolean, combo: number = 1) => {
      triggerBlockStackParticles(normX, normY, worldIndex, isPerfect, combo);
    },
    triggerBombParticles: (normX: number, normY: number, isDefused: boolean = false) => {
      triggerBombDestroyedParticles(normX, normY, worldIndex, isDefused);
    },
  }), [weatherConfig, palette, worldIndex]);

  // Helper to apply variables to an element or container ref
  const applyCSSVariablesToElement = useCallback((el?: HTMLElement | null) => {
    if (!el) return;
    el.style.setProperty('--theme-primary', palette.primary);
    el.style.setProperty('--theme-secondary', palette.secondary);
    el.style.setProperty('--theme-accent', palette.accent);
    el.style.setProperty('--theme-glow', palette.glow);
    el.style.setProperty('--theme-dark', palette.dark);
    el.style.setProperty('--theme-border', palette.accent);
    el.style.setProperty('--theme-haze', atmosphere.hazeColor);
    el.style.setProperty('--theme-bloom', atmosphere.emissiveBloomColor);
    el.setAttribute('data-world-index', worldIndex.toString());
  }, [palette, atmosphere, worldIndex]);

  // Batched theme switch action that updates store atomically
  const switchWorldTheme = useCallback((
    targetWorld: string | number,
    options?: {
      visualTheme?: VisualThemeMode;
      equipMatchingSet?: boolean;
      transitionMessage?: string;
      skipTransition?: boolean;
    }
  ) => {
    useGameStore.getState().batchUpdateWorldTheme(targetWorld, options);
  }, []);

  // If globally active (no override), apply to document root only when signature actually changes
  const prevAppliedSignatureRef = useRef<string>('');
  useEffect(() => {
    if (overrideWorldId === undefined || overrideWorldId === null) {
      const signature = `${worldIndex}:${visualTheme}:${palette.primary}:${atmosphere.hazeColor}:${atmosphere.emissiveBloomColor}`;
      if (prevAppliedSignatureRef.current !== signature) {
        prevAppliedSignatureRef.current = signature;
        applyThemeCSSVariables(palette, worldIndex);
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--theme-haze', atmosphere.hazeColor);
          document.documentElement.style.setProperty('--theme-bloom', atmosphere.emissiveBloomColor);
          document.documentElement.style.setProperty('--theme-gradient', `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`);
          document.documentElement.setAttribute('data-theme', visualTheme || 'default');
        }
      }
    }
  }, [overrideWorldId, palette, atmosphere, worldIndex, visualTheme]);

  const worldKey = visualTheme === 'cyberpunk'
    ? 'Cyberpunk'
    : (WORLD_ENVIRONMENT_KEYS[worldIndex] || 'Meadow');

  // Memoize the entire result to prevent cascading re-renders during high-intensity gameplay
  return useMemo(() => ({
    worldIndex,
    worldId,
    worldName,
    worldKey,
    visualTheme,
    isHighContrast,
    isSpecialTheme,
    palette,
    cssVariables,
    shaders,
    particles,
    activeWorldInfo,
    applyCSSVariablesToElement,
    switchWorldTheme,
  }), [
    worldIndex,
    worldId,
    worldName,
    worldKey,
    visualTheme,
    isHighContrast,
    isSpecialTheme,
    palette,
    cssVariables,
    shaders,
    particles,
    activeWorldInfo,
    applyCSSVariablesToElement,
    switchWorldTheme,
  ]);
}
