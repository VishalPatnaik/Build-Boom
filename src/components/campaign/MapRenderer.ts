// MAP RENDERER - REALISTIC ATMOSPHERIC BIOME CAMPAIGN MAP
import { ZONE_CONFIGS, ZONE_NAMES } from './WorldDefinitions';
import { drawScenery } from './SceneryRenderer';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const SPACING = 60;
const ZONE_HEIGHT = 11 * SPACING;

export function renderCampaignMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scrollY: number,
  time: number
) {
  if (!ctx || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
  ctx.clearRect(0, 0, width, height);

  const startZoneIdx = Math.max(0, Math.min(ZONE_CONFIGS.length - 1, Math.floor((scrollY || 0) / ZONE_HEIGHT))) || 0;
  const endZoneIdx = Math.max(0, Math.min(ZONE_CONFIGS.length - 1, Math.floor(((scrollY || 0) + (height || 0)) / ZONE_HEIGHT))) || 0;
  const preciseZone = Math.max(0, (scrollY || 0) / ZONE_HEIGHT) || 0;
  const currentIdx = Math.max(0, Math.min(ZONE_CONFIGS.length - 1, Math.floor(preciseZone))) || 0;

  const currentConfig = ZONE_CONFIGS[currentIdx] || ZONE_CONFIGS[0];
  const nextConfig = ZONE_CONFIGS[Math.min(ZONE_CONFIGS.length - 1, currentIdx + 1)] || currentConfig;

  // Atmospheric gradient blending current and next zone biomes
  const bgGrad = ctx.createLinearGradient(0, height, 0, 0);
  bgGrad.addColorStop(0, currentConfig.bg || '#052e16');
  bgGrad.addColorStop(1, nextConfig.bg || currentConfig.bg || '#052e16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient stars / sky particles in upper atmosphere
  if (currentIdx >= 1) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 127.3) % width);
      const sy = ((i * 241.1 - scrollY * 0.2) % height + height) % height;
      const alpha = 0.2 + 0.5 * Math.sin(time * 0.002 + i);
      ctx.globalAlpha = alpha;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
    ctx.restore();
  }

  // Draw World-Anchored Realistic Scenery along the campaign path
  ctx.save();
  ctx.translate(0, -scrollY);

  for (let z = startZoneIdx; z <= endZoneIdx; z++) {
    const config = ZONE_CONFIGS[z];
    const zoneRng = seededRandom(888 + z * 123);
    const numObjects = Math.floor(20 * config.sceneryDensity);

    for (let i = 0; i < numObjects; i++) {
      const type = config.scenery[Math.floor(zoneRng() * config.scenery.length)];
      let x = zoneRng() * width;
      let y = z * ZONE_HEIGHT + zoneRng() * ZONE_HEIGHT;
      const scale = 0.7 + zoneRng() * 0.6;

      if (y < scrollY - 200 || y > scrollY + height + 200) continue;

      // Keep scenery gently flanking the center trajectory path
      const pathXOffset = Math.sin((y / SPACING) * 0.4) * (width * 0.35);
      const pathCenter = width / 2 + pathXOffset;
      if (Math.abs(x - pathCenter) < 65) {
        x = x > pathCenter ? x + 85 : x - 85;
      }

      drawScenery(ctx, type, x, y, scale, time + i * 80);
    }
  }
  ctx.restore();

  // Floating Atmospheric Biome Particles
  ctx.save();
  ctx.fillStyle = currentConfig.ambient || '#22c55e';
  for (let i = 0; i < 30; i++) {
    const px = (((i * 43.1 + time * 0.02) % 1.2 - 0.1) * width + width) % width;
    const py = (((i * 67.7 - time * 0.03) % 1.2 - 0.1) * height + height) % height;
    ctx.globalAlpha = 0.25 + 0.45 * Math.sin(time * 0.003 + i);
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Cinematic Edge Vignette
  ctx.save();
  const innerR = Math.min(width, height) * 0.4;
  const outerR = Math.max(width, height) * 0.85;
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
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}
