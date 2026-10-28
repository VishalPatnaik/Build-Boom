// MAP RENDERER - FULL CINEMATIC ATMOSPHERIC BIOME CAMPAIGN MAP
// Directly utilizes the 20 master cinematic world environments with atmospheric depth,
// realistic lighting, rich terrain, layered parallax, and dynamic environmental particles.
import { ZONE_CONFIGS } from './WorldDefinitions';
import { THEME_PALETTES } from '../../game/themeRenderer';
import { renderCinematicWorld } from '../../game/cinematicWorlds/renderCinematicWorld';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';
import { VisualThemeMode } from '../../game/store';
import {
  renderHighContrastEnvironment,
  renderMinimalDarkEnvironment,
  renderCyberpunkEnvironment,
  renderDeepCosmosEnvironment,
  renderSolarGoldEnvironment
} from '../../game/environmentThemes';

const SPACING = 60;
const ZONE_HEIGHT = 11 * SPACING;

// Dynamic Biome Particle Definitions for Map Atmosphere
interface BiomeParticleStyle {
  colors: string[];
  shape: 'pollen' | 'snow' | 'rain' | 'petal' | 'bubble' | 'spark' | 'ember' | 'stardust' | 'crystal';
  speedY: number;
  speedX: number;
  wobble: number;
  size: number;
  count: number;
  glowBlur: number;
}

const BIOME_PARTICLE_STYLES: Record<number, BiomeParticleStyle> = {
  0: { colors: ['#fef08a', '#86efac', '#ffffff'], shape: 'pollen', speedY: 0.28, speedX: 0.15, wobble: 18, size: 2.5, count: 28, glowBlur: 6 }, // Spring Meadow
  1: { colors: ['#ffffff', '#bae6fd', '#94a3b8'], shape: 'stardust', speedY: 0.08, speedX: 0.04, wobble: 6, size: 2.0, count: 32, glowBlur: 8 }, // Lunar Surface
  2: { colors: ['#ea580c', '#f97316', '#fed7aa'], shape: 'spark', speedY: 0.35, speedX: 0.45, wobble: 12, size: 2.2, count: 26, glowBlur: 5 }, // Martian Canyon
  3: { colors: ['#c084fc', '#38bdf8', '#f472b6', '#ffffff'], shape: 'stardust', speedY: 0.06, speedX: 0.06, wobble: 8, size: 2.4, count: 36, glowBlur: 10 }, // Deep Space
  4: { colors: ['#06b6d4', '#67e8f9', '#22d3ee', '#ffffff'], shape: 'bubble', speedY: -0.42, speedX: 0.08, wobble: 14, size: 3.2, count: 25, glowBlur: 6 }, // Abyssal Coral
  5: { colors: ['#fbbf24', '#f43f5e', '#fed7aa', '#ffffff'], shape: 'stardust', speedY: 0.22, speedX: 0.18, wobble: 10, size: 2.2, count: 24, glowBlur: 7 }, // Sunset Beach
  6: { colors: ['#ef4444', '#f97316', '#fbbf24', '#7f1d1d'], shape: 'ember', speedY: -0.48, speedX: 0.12, wobble: 16, size: 2.8, count: 30, glowBlur: 9 }, // Volcanic Caldera
  7: { colors: ['#f59e0b', '#fbbf24', '#94a3b8'], shape: 'spark', speedY: -0.25, speedX: 0.08, wobble: 10, size: 2.2, count: 22, glowBlur: 7 }, // Citadel
  8: { colors: ['#34d399', '#10b981', '#a7f3d0', '#fef08a'], shape: 'pollen', speedY: 0.18, speedX: 0.12, wobble: 20, size: 2.6, count: 28, glowBlur: 8 }, // Redwood
  9: { colors: ['#facc15', '#fde047', '#fbbf24'], shape: 'spark', speedY: 0.32, speedX: 0.52, wobble: 15, size: 2.0, count: 25, glowBlur: 5 }, // Golden Dunes
  10: { colors: ['#ffffff', '#bae6fd', '#e0f2fe'], shape: 'snow', speedY: 0.45, speedX: 0.22, wobble: 22, size: 2.6, count: 34, glowBlur: 6 }, // Arctic
  11: { colors: ['#38bdf8', '#f59e0b', '#ffffff'], shape: 'stardust', speedY: 0.25, speedX: 0.30, wobble: 12, size: 2.4, count: 24, glowBlur: 6 }, // Corsair Bay
  12: { colors: ['#f472b6', '#fbcfe8', '#ffffff', '#a7f3d0'], shape: 'spark', speedY: 0.24, speedX: 0.10, wobble: 14, size: 2.5, count: 26, glowBlur: 7 }, // Candyland
  13: { colors: ['#facc15', '#fef08a', '#ffffff', '#eab308'], shape: 'stardust', speedY: 0.20, speedX: 0.08, wobble: 10, size: 2.8, count: 30, glowBlur: 10 }, // El Dorado
  14: { colors: ['#00f0ff', '#ff007f', '#7928ca', '#ffffff'], shape: 'rain', speedY: 1.15, speedX: 0.25, wobble: 4, size: 3.5, count: 38, glowBlur: 12 }, // Cyberpunk Megacity
  15: { colors: ['#84cc16', '#bef264', '#4ade80'], shape: 'bubble', speedY: -0.32, speedX: 0.08, wobble: 16, size: 3.0, count: 24, glowBlur: 8 }, // Toxic Lagoon
  16: { colors: ['#ffffff', '#e0f2fe', '#bae6fd'], shape: 'stardust', speedY: 0.15, speedX: 0.35, wobble: 18, size: 2.8, count: 26, glowBlur: 8 }, // Sky Archipelago
  17: { colors: ['#f59e0b', '#fbbf24', '#d97706', '#ffffff'], shape: 'spark', speedY: -0.35, speedX: 0.14, wobble: 12, size: 2.2, count: 24, glowBlur: 6 }, // Clockwork
  18: { colors: ['#f472b6', '#fbcfe8', '#fda4af', '#ffffff'], shape: 'petal', speedY: 0.32, speedX: 0.40, wobble: 25, size: 3.8, count: 32, glowBlur: 7 }, // Sakura Shrine
  19: { colors: ['#c084fc', '#e879f9', '#2dd4bf', '#ffffff'], shape: 'crystal', speedY: -0.18, speedX: 0.08, wobble: 12, size: 2.8, count: 30, glowBlur: 10 }, // Crystalline Core
};

function renderProceduralBiomeParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  zoneIdx: number,
  alphaMultiplier: number = 1.0
) {
  if (alphaMultiplier <= 0.01) return;
  const style = BIOME_PARTICLE_STYLES[zoneIdx % 20] || BIOME_PARTICLE_STYLES[0];
  const count = style.count;
  const colors = style.colors;

  ctx.save();
  for (let i = 0; i < count; i++) {
    const seed = i * 47.19 + zoneIdx * 113.7;
    const color = colors[i % colors.length];

    // Procedural position wrapping smoothly around viewport
    const periodY = 1.2;
    const speedY = style.speedY * (0.6 + (i % 5) * 0.2);
    const speedX = style.speedX * (0.7 + (i % 3) * 0.25);
    const wobbleSpeed = 0.0015 + (i % 4) * 0.0006;
    const wobbleAmp = style.wobble * (0.6 + (i % 3) * 0.3);

    const normY = (((((seed * 0.73 + time * 0.001 * speedY) % periodY) + periodY) % periodY) - 0.1);
    const normX = (((((seed * 0.41 + time * 0.001 * speedX) % 1.2) + 1.2) % 1.2) - 0.1);

    const py = (style.speedY < 0 ? (1.0 - normY) : normY) * height;
    const px = (normX * width + Math.sin(time * wobbleSpeed + seed) * wobbleAmp + width) % width;

    const baseAlpha = 0.35 + 0.45 * Math.sin(time * 0.002 + seed);
    const pAlpha = Math.max(0.1, Math.min(1.0, baseAlpha * alphaMultiplier));

    ctx.globalAlpha = pAlpha;
    ctx.fillStyle = color;
    if (style.glowBlur > 0) {
      ctx.shadowColor = color;
      ctx.shadowBlur = style.glowBlur;
    }

    if (style.shape === 'rain') {
      // Neon rain streak
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + speedX * 18, py + 14);
      ctx.stroke();
    } else if (style.shape === 'petal') {
      // Swirling organic cherry blossom petal
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate((time * 0.002 + seed) * 0.8);
      ctx.beginPath();
      ctx.ellipse(0, 0, style.size, style.size * 0.55, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (style.shape === 'crystal') {
      // Diamond faceted crystal
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(time * 0.0015 + seed);
      const s = style.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.7, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.7, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (style.shape === 'bubble') {
      // Translucent bubble with rim
      ctx.beginPath();
      ctx.arc(px, py, style.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else {
      // Soft glowing particle / spore / ember / stardust / snow
      ctx.beginPath();
      ctx.arc(px, py, style.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function renderCampaignMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scrollY: number,
  time: number,
  visualTheme: VisualThemeMode = 'default',
  equippedBackground?: string | null
) {
  if (!ctx || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
  ctx.clearRect(0, 0, width, height);

  // High contrast and minimal dark accessibility overrides
  if (visualTheme === 'high-contrast') {
    renderHighContrastEnvironment(ctx, width, height, time);
    return;
  }
  if (visualTheme === 'minimal-dark') {
    renderMinimalDarkEnvironment(ctx, width, height, time);
    return;
  }

  // If a custom World environment is equipped from the Shop, render it as the primary backdrop
  if (equippedBackground) {
    const customIdx = Math.abs(parseInt(equippedBackground.replace('bg-', '').replace('campaign-', '')) || 0) % 20;
    const palette = THEME_PALETTES[customIdx] || THEME_PALETTES[0];

    ctx.save();
    renderCinematicWorld(ctx, width, height, `bg-${customIdx}`, time, false);
    ctx.restore();

    // High-tech subtle contrast veil
    ctx.save();
    const scrimGrad = ctx.createLinearGradient(0, 0, 0, height);
    scrimGrad.addColorStop(0, 'rgba(3, 7, 18, 0.28)');
    scrimGrad.addColorStop(0.5, 'rgba(3, 7, 18, 0.20)');
    scrimGrad.addColorStop(1, 'rgba(3, 7, 18, 0.38)');
    ctx.fillStyle = scrimGrad;
    ctx.fillRect(0, 0, width, height);

    // Dynamic Environmental Weather & Atmospheric Particles for equipped world
    renderProceduralBiomeParticles(ctx, width, height, time, customIdx, 1.0);

    // Directional Biome Horizon Ambient Glow
    const glowGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
    glowGrad.addColorStop(0, 'rgba(0,0,0,0)');
    glowGrad.addColorStop(1, palette.glow || 'rgba(56, 189, 248, 0.18)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, height * 0.7, width, height * 0.3);
    ctx.restore();

    // Cinematic Vignette
    ctx.save();
    const innerR = Math.min(width, height) * 0.5;
    const outerR = Math.max(width, height) * 0.95;
    const vig = safeCreateRadialGradient(ctx, width / 2, height / 2, innerR, width / 2, height / 2, outerR);
    if (vig) {
      vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vig.addColorStop(1, 'rgba(0, 0, 0, 0.52)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
    return;
  }

  // If a special visual theme is selected in Settings (e.g. Cyberpunk Grid, Solar Gold)
  if (visualTheme !== 'default') {
    ctx.save();
    switch (visualTheme) {
      case 'cyberpunk':
        renderCyberpunkEnvironment(ctx, width, height, time);
        renderProceduralBiomeParticles(ctx, width, height, time, 14, 1.0);
        break;
      case 'deep-cosmos':
        renderDeepCosmosEnvironment(ctx, width, height, time);
        renderProceduralBiomeParticles(ctx, width, height, time, 3, 1.0);
        break;
      case 'solar-gold':
        renderSolarGoldEnvironment(ctx, width, height, time);
        renderProceduralBiomeParticles(ctx, width, height, time, 13, 1.0);
        break;
      default:
        renderCinematicWorld(ctx, width, height, 'bg-0', time, false);
    }
    ctx.restore();

    // High-tech subtle contrast veil
    ctx.save();
    ctx.fillStyle = 'rgba(3, 7, 18, 0.28)';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }

  const preciseZone = Math.max(0, (scrollY || 0) / ZONE_HEIGHT) || 0;
  const currentIdx = Math.max(0, Math.min(ZONE_CONFIGS.length - 1, Math.floor(preciseZone))) || 0;
  const nextIdx = Math.min(ZONE_CONFIGS.length - 1, currentIdx + 1);
  const zoneProgress = preciseZone - currentIdx; // 0 to 1 blend ratio between biomes

  // 1. Render Active World Biome (Console-grade AAA environment: sky, terrain, distant landmarks, lighting)
  ctx.save();
  renderCinematicWorld(ctx, width, height, `bg-${currentIdx}`, time, false);

  // If scrolling between two zones, smoothly cross-fade the approaching world biome
  if (zoneProgress > 0.05 && currentIdx !== nextIdx) {
    ctx.globalAlpha = Math.min(1, (zoneProgress - 0.05) * 1.15);
    renderCinematicWorld(ctx, width, height, `bg-${nextIdx}`, time, false);
    ctx.globalAlpha = 1.0;
  }
  ctx.restore();

  // 2. High-Tech Tactical Atmospheric Shroud
  // Balanced contrast veil so map nodes, laser conduit, and level numbers remain crisp & legible
  ctx.save();
  const palette = THEME_PALETTES[currentIdx % THEME_PALETTES.length] || THEME_PALETTES[0];
  const ambientCol = palette.accent || '#22c55e';

  // Lighter, refined contrast veil allowing vibrant biome landscapes to shine through
  const scrimGrad = ctx.createLinearGradient(0, 0, 0, height);
  scrimGrad.addColorStop(0, 'rgba(3, 7, 18, 0.28)');
  scrimGrad.addColorStop(0.5, 'rgba(3, 7, 18, 0.20)');
  scrimGrad.addColorStop(1, 'rgba(3, 7, 18, 0.38)');
  ctx.fillStyle = scrimGrad;
  ctx.fillRect(0, 0, width, height);

  // 3. Dynamic Environmental Weather & Atmospheric Particles for active zone
  const currentParticleAlpha = zoneProgress > 0.05 && currentIdx !== nextIdx ? 1 - zoneProgress : 1.0;
  renderProceduralBiomeParticles(ctx, width, height, time, currentIdx, currentParticleAlpha);

  if (zoneProgress > 0.05 && currentIdx !== nextIdx) {
    renderProceduralBiomeParticles(ctx, width, height, time, nextIdx, zoneProgress);
  }

  // 4. Directional Biome Horizon Ambient Glow
  const glowGrad = ctx.createLinearGradient(0, height * 0.7, 0, height);
  glowGrad.addColorStop(0, 'rgba(0,0,0,0)');
  glowGrad.addColorStop(1, palette.glow || 'rgba(56, 189, 248, 0.18)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  ctx.restore();

  // 5. Cinematic Vignette (Subtle edge darkening for depth focus)
  ctx.save();
  const innerR = Math.min(width, height) * 0.5;
  const outerR = Math.max(width, height) * 0.95;
  const vig = safeCreateRadialGradient(
    ctx,
    width / 2,
    height / 2,
    innerR,
    width / 2,
    height / 2,
    outerR
  );
  if (vig) {
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.52)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

