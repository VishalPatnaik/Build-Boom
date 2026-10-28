import { renderCinematicWorld } from './cinematicWorlds/renderCinematicWorld';
import { renderCinematicBlock } from './cinematicItems/renderCinematicBlock';
import { renderCinematicPlate } from './cinematicItems/renderCinematicPlate';
import { renderCinematicBoomParticle, getThematicAccentColor } from './cinematicItems/renderCinematicBoom';

// THEME RENDERER - REALISTIC HIGH-FIDELITY ATMOSPHERIC WORLDS & ITEMS
// 20 Distinct, visually unique biomes with realistic depth, lighting, and textures.

export interface WorldThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  dark: string;
}

export const THEME_PALETTES: WorldThemeColors[] = [
  // 0: Spring Meadow (Lush green hills, wild flora, warm golden sunlight)
  { primary: '#22c55e', secondary: '#15803d', accent: '#fbbf24', glow: 'rgba(34, 197, 94, 0.4)', dark: '#052e16' },
  // 1: Lunar Surface (Stark craters, grey regolith, deep velvet cosmos, earthrise)
  { primary: '#94a3b8', secondary: '#64748b', accent: '#38bdf8', glow: 'rgba(148, 163, 184, 0.35)', dark: '#030712' },
  // 2: Martian Canyon (Rusty red dunes, stratified redstone cliffs, dusty sun)
  { primary: '#ea580c', secondary: '#9a3412', accent: '#f97316', glow: 'rgba(234, 88, 12, 0.4)', dark: '#270a04' },
  // 3: Deep Space Nebula (Swirling stellar clouds of violet, magenta, and cyan)
  { primary: '#a855f7', secondary: '#7c3aed', accent: '#38bdf8', glow: 'rgba(168, 85, 247, 0.45)', dark: '#09021a' },
  // 4: Abyssal Coral Reef (Deep ocean blue, sunlit water caustics, vibrant coral, bubbles)
  { primary: '#06b6d4', secondary: '#0e7490', accent: '#22d3ee', glow: 'rgba(6, 182, 212, 0.4)', dark: '#02182b' },
  // 5: Tropical Sunset Beach (Warm amber/magenta sunset, turquoise ocean waves, palm silhouettes)
  { primary: '#f59e0b', secondary: '#f43f5e', accent: '#2dd4bf', glow: 'rgba(245, 158, 11, 0.4)', dark: '#1c0a1f' },
  // 6: Volcanic Caldera (Dark basalt crags, molten glowing magma fissures, fire embers)
  { primary: '#ef4444', secondary: '#b91c1c', accent: '#fbbf24', glow: 'rgba(239, 68, 68, 0.5)', dark: '#1a0502' },
  // 7: Ancient Stone Citadel (Gothic castle masonry, moonlit fortress towers, warm torchlight)
  { primary: '#64748b', secondary: '#475569', accent: '#f59e0b', glow: 'rgba(100, 116, 139, 0.35)', dark: '#0b1120' },
  // 8: Enchanted Redwood Forest (Deep mystical emerald woods, towering redwood trunks, glowing spores)
  { primary: '#10b981', secondary: '#047857', accent: '#a7f3d0', glow: 'rgba(16, 185, 129, 0.4)', dark: '#032014' },
  // 9: Golden Desert Oasis (Sweeping wind-rippled dunes, brilliant desert sun, oasis palms)
  { primary: '#eab308', secondary: '#ca8a04', accent: '#38bdf8', glow: 'rgba(234, 179, 8, 0.4)', dark: '#1c1303' },
  // 10: Frozen Arctic Tundra (Glacial icebergs, dancing green Aurora Borealis, soft snowfall)
  { primary: '#38bdf8', secondary: '#0284c7', accent: '#86efac', glow: 'rgba(56, 189, 248, 0.4)', dark: '#03192e' },
  // 11: Pirate Corsair Cove (Dramatic sea cliffs, moonlit ocean, galleon silhouette, lantern glow)
  { primary: '#d97706', secondary: '#92400e', accent: '#38bdf8', glow: 'rgba(217, 119, 6, 0.35)', dark: '#0c1524' },
  // 12: Candyland Confection (Artisan glossy sugar crystals, strawberry cream hills, swirl lollipops)
  { primary: '#ec4899', secondary: '#db2777', accent: '#fbcfe8', glow: 'rgba(236, 72, 153, 0.4)', dark: '#2b0922' },
  // 13: Golden El Dorado (Gilded sun-temple architecture, solid gold relics, lush jungle sunbeams)
  { primary: '#f59e0b', secondary: '#b45309', accent: '#fef08a', glow: 'rgba(245, 158, 11, 0.45)', dark: '#1c1002' },
  // 14: Cyberpunk Megacity (Rain-slicked skyscrapers, neon cyan/magenta signs, towering metropolis)
  { primary: '#00f0ff', secondary: '#f43f5e', accent: '#a855f7', glow: 'rgba(0, 240, 255, 0.45)', dark: '#090514' },
  // 15: Toxic Industrial Wasteland (Industrial steel pipes, bubbling phosphorescent green chemical lagoon)
  { primary: '#84cc16', secondary: '#4d7c0f', accent: '#bef264', glow: 'rgba(132, 204, 22, 0.4)', dark: '#091504' },
  // 16: Floating Sky Islands (High altitude azure sky, floating mossy islands with cascading waterfalls)
  { primary: '#38bdf8', secondary: '#0284c7', accent: '#f8fafc', glow: 'rgba(56, 189, 248, 0.35)', dark: '#071f3d' },
  // 17: Chrono Clockwork Realm (Interlocking brass and copper gears, escaping steam, pendulum weights)
  { primary: '#d97706', secondary: '#78350f', accent: '#fbbf24', glow: 'rgba(217, 119, 6, 0.4)', dark: '#1a0d05' },
  // 18: Sakura Blossom Shrine (Crimson torii gate, pagoda against Mount Fuji, fluttering pink petals)
  { primary: '#f472b6', secondary: '#e11d48', accent: '#fbcfe8', glow: 'rgba(244, 114, 182, 0.4)', dark: '#240817' },
  // 19: Crystalline Geode Core (Deep cavern with towering faceted glowing amethyst crystals)
  { primary: '#c084fc', secondary: '#9333ea', accent: '#00f0ff', glow: 'rgba(192, 132, 252, 0.45)', dark: '#0c021a' },
];

// REALISTIC WORLD BACKGROUND RENDERING
export function renderWorld(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: string,
  time: number,
  isPreview: boolean = false
) {
  renderCinematicWorld(ctx, w, h, id, time, isPreview);
}

// REALISTIC HIGH-FIDELITY BLOCK RENDERING
// Each theme block has authentic material physics, 3D lighting, textures, bevels, and highlights.
export function renderBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  id: string,
  isCenter: boolean,
  time: number,
  archetype?: string
) {
  if (!ctx || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);

  // Subtle natural idle breath
  const bounce = Math.sin((time || 0) / 220) * 2.5;
  const squash = 1 + Math.sin((time || 0) / 160) * 0.03;
  ctx.translate(0, bounce);
  ctx.scale(1 / squash, squash);

  // Delegate to console-grade block renderer
  renderCinematicBlock(ctx, w, h, id, isCenter, time, archetype);

  ctx.restore();
}

// REALISTIC THEMED LANDING PLATFORMS
export function renderPlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  id: string,
  time: number
) {
  if (!ctx || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);

  // Delegate to console-grade plate renderer
  renderCinematicPlate(ctx, w, h, id, time);

  ctx.restore();
}

// REALISTIC BOOM BURST PARTICLES
export function getBoomColor(id: string): string {
  const t = Math.abs(parseInt((id || '').replace('boom-', '')) || 0) % THEME_PALETTES.length;
  return getThematicAccentColor(t);
}

export function renderBoomParticle(
  ctx: CanvasRenderingContext2D,
  p: any,
  time: number,
  id: string
) {
  if (!ctx || !p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
  renderCinematicBoomParticle(ctx, p, time, id);
}
