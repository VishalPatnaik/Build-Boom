import { VisualThemeMode } from './store';
import { renderCyberpunk, renderGoldenLegend } from './cinematicWorlds/exoticRealms';
import { renderDeepSpace } from './cinematicWorlds/spaceAndPlanets';
import { drawGameplayReadabilityBackdrop } from './cinematicWorlds/worldUtils';

export interface EnvironmentThemeDef {
  id: VisualThemeMode;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  accentColor: string;
  contrastColor: string;
  gradientBg: string;
  borderColor: string;
  previewColors: string[];
  isHighContrast?: boolean;
}

export const ENVIRONMENT_THEMES: EnvironmentThemeDef[] = [
  {
    id: 'default',
    name: 'Dynamic Biomes',
    tagline: 'Adaptive Environmental Terrains',
    badge: 'DEFAULT',
    description: 'Dynamic biomes that adapt to your campaign world and equipped cosmetic themes (spring meadows, volcanic calderas, coral reefs).',
    accentColor: '#06b6d4',
    contrastColor: '#38bdf8',
    gradientBg: 'from-cyan-950 via-slate-900 to-slate-950',
    borderColor: 'border-cyan-400',
    previewColors: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b'],
  },
  {
    id: 'high-contrast',
    name: 'High-Contrast Void',
    tagline: 'Peak Accessibility & Stark Contrast',
    badge: 'ACCESSIBLE',
    description: 'Pitch-black obsidian void with fluorescent yellow and cyan coordinate grids. Maximizes block shape separation and visual clarity.',
    accentColor: '#ffff00',
    contrastColor: '#00ffff',
    gradientBg: 'from-black via-slate-950 to-black',
    borderColor: 'border-yellow-300',
    previewColors: ['#000000', '#ffff00', '#00ffff', '#ffffff'],
    isHighContrast: true,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Grid',
    tagline: 'Neon Retro-Wave Synthscape',
    badge: 'SYNTHWAVE',
    description: 'Electrifying neon magenta and cyan perspective laser grid scrolling beneath a glowing digital horizon line and cyber skyline.',
    accentColor: '#ff007f',
    contrastColor: '#00f0ff',
    gradientBg: 'from-purple-950 via-slate-950 to-pink-950',
    borderColor: 'border-pink-500',
    previewColors: ['#ff007f', '#00f0ff', '#7928ca', '#120429'],
  },
  {
    id: 'minimal-dark',
    name: 'Obsidian Minimal',
    tagline: 'Distraction-Free Deep Slate',
    badge: 'MINIMAL',
    description: 'Ultra-clean matte charcoal graphite backdrop with subtle drafting dots. Minimizes visual distraction for laser-focused precision.',
    accentColor: '#94a3b8',
    contrastColor: '#cbd5e1',
    gradientBg: 'from-slate-950 via-slate-900 to-black',
    borderColor: 'border-slate-600',
    previewColors: ['#0f172a', '#1e293b', '#334155', '#94a3b8'],
  },
  {
    id: 'deep-cosmos',
    name: 'Deep Cosmos',
    tagline: 'Atmospheric Stellar Nebulae',
    badge: 'STELLAR',
    description: 'Velvet cosmic expanse adorned with rich swirling violet and cyan interstellar nebulae and realistic twinkling star constellations.',
    accentColor: '#c084fc',
    contrastColor: '#38bdf8',
    gradientBg: 'from-indigo-950 via-slate-950 to-purple-950',
    borderColor: 'border-indigo-400',
    previewColors: ['#030712', '#4c1d95', '#2563eb', '#c084fc'],
  },
  {
    id: 'solar-gold',
    name: 'Solar Golden Core',
    tagline: 'Warm Gilded Architect Aura',
    badge: 'PREMIUM',
    description: 'Warm amber solar gradients, rotating sacred geometric architect schematics, and radiant gilded sunbeams.',
    accentColor: '#f59e0b',
    contrastColor: '#fbbf24',
    gradientBg: 'from-amber-950 via-slate-950 to-yellow-950',
    borderColor: 'border-amber-400',
    previewColors: ['#451a03', '#78350f', '#f59e0b', '#fef08a'],
  },
];

// 1. HIGH-CONTRAST ACCESSIBILITY MODE RENDERER
export function renderHighContrastEnvironment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  ctx.save();

  // Solid pitch-black void
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // High-contrast primary grid lines
  const gridSize = 64;
  const offsetX = (time * 0.005) % gridSize;
  const offsetY = (time * 0.005) % gridSize;

  ctx.strokeStyle = 'rgba(255, 255, 0, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();

  // Vertical lines
  for (let x = offsetX; x < w; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  // Horizontal lines
  for (let y = offsetY; y < h; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Crosshair markers at intersections
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 1.5;
  const markerStep = gridSize * 2;
  const chSize = 5;

  ctx.beginPath();
  for (let x = offsetX; x < w; x += markerStep) {
    for (let y = offsetY; y < h; y += markerStep) {
      ctx.moveTo(x - chSize, y);
      ctx.lineTo(x + chSize, y);
      ctx.moveTo(x, y - chSize);
      ctx.lineTo(x, y + chSize);
    }
  }
  ctx.stroke();

  // Center vertical alignment axis guideline (High-visibility neon yellow)
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();
  ctx.setLineDash([]);

  // Top and bottom stark demarcation borders
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(0, 0, w, 2);
  ctx.fillRect(0, h - 2, w, 2);

  ctx.restore();
}

// 2. CYBERPUNK SYNTHWAVE GRID RENDERER
export function renderCyberpunkEnvironment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  renderCyberpunk(ctx, w, h, time);
  drawGameplayReadabilityBackdrop(ctx, w, h);
}

// 3. MINIMAL OBSIDIAN DARK RENDERER
export function renderMinimalDarkEnvironment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  ctx.save();

  // Deep matte charcoal slate gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0a0d14');
  bgGrad.addColorStop(0.5, '#06080d');
  bgGrad.addColorStop(1, '#020306');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural drafting dots
  const dotSpacing = 36;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
  for (let x = dotSpacing / 2; x < w; x += dotSpacing) {
    for (let y = dotSpacing / 2; y < h; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Minimalist corner brackets
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 1.5;
  const bracketSize = 24;
  const pad = 16;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad, pad + bracketSize);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + bracketSize, pad);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - pad - bracketSize, pad);
  ctx.lineTo(w - pad, pad);
  ctx.lineTo(w - pad, pad + bracketSize);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad, h - pad - bracketSize);
  ctx.lineTo(pad, h - pad);
  ctx.lineTo(pad + bracketSize, h - pad);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - pad - bracketSize, h - pad);
  ctx.lineTo(w - pad, h - pad);
  ctx.lineTo(w - pad, h - pad - bracketSize);
  ctx.stroke();

  // Subtle breathing center circle
  const centerRadius = Math.min(180, w * 0.22);
  const breath = Math.sin(time * 0.001) * 6;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, centerRadius + breath, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// 4. DEEP COSMOS STELLAR NEBULA RENDERER
export function renderDeepCosmosEnvironment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  renderDeepSpace(ctx, w, h, time);
  drawGameplayReadabilityBackdrop(ctx, w, h);
}

// 5. SOLAR GOLDEN CORE RENDERER
export function renderSolarGoldEnvironment(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  renderGoldenLegend(ctx, w, h, time);
  drawGameplayReadabilityBackdrop(ctx, w, h);
}
