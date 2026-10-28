import { THEME_PALETTES, WorldThemeColors } from '../game/themeRenderer';
import { WORLD_NAMES } from '../game/EnvironmentRenderer';

export function getThemePalette(worldIndexOrId: number | string | null | undefined): WorldThemeColors {
  if (typeof worldIndexOrId === 'number') {
    const idx = Math.abs(Math.round(worldIndexOrId)) % 20;
    return THEME_PALETTES[idx] || THEME_PALETTES[0];
  }
  if (typeof worldIndexOrId === 'string') {
    const clean = worldIndexOrId.toLowerCase();
    const idx = Math.abs(parseInt(clean.replace('bg-', '').replace('campaign-', '')) || 0) % 20;
    return THEME_PALETTES[idx] || THEME_PALETTES[0];
  }
  return THEME_PALETTES[0];
}

export function applyThemeCSSVariables(palette: WorldThemeColors, worldIndex: number) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', palette.primary);
  root.style.setProperty('--theme-secondary', palette.secondary);
  root.style.setProperty('--theme-accent', palette.accent);
  root.style.setProperty('--theme-glow', palette.glow);
  root.style.setProperty('--theme-dark', palette.dark);
  root.style.setProperty('--theme-border', palette.accent);
  root.setAttribute('data-world-index', worldIndex.toString());
}

export { useWorldTheme } from '../hooks/useWorldTheme';
export type { WorldThemeResult, WorldShaderConfig, WorldParticlePresets, WorldCSSVariables } from '../hooks/useWorldTheme';
export { useWorldAmbience } from '../hooks/useWorldAmbience';
export type { UseWorldAmbienceOptions, UseWorldAmbienceResult } from '../hooks/useWorldAmbience';
