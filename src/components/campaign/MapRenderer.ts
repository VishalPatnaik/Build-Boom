import { ZONE_CONFIGS } from './WorldDefinitions';
import { drawScenery } from './SceneryRenderer';

// A seeded random generator for stable map layout
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = s * 16807 % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const SPACING = 60;
const ZONE_HEIGHT = 11 * SPACING;

function interpolateColor(c1: string, c2: string, factor: number) {
  // Convert hex to rgb and interpolate
  const hex2rgb = (hex: string) => {
    if (!hex || hex.length < 7) return [0, 0, 0];
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return [r, g, b];
  };
  const rgb1 = hex2rgb(c1);
  const rgb2 = hex2rgb(c2);
  const r = Math.round(rgb1[0] + factor * (rgb2[0] - rgb1[0]));
  const g = Math.round(rgb1[1] + factor * (rgb2[1] - rgb1[1]));
  const b = Math.round(rgb1[2] + factor * (rgb2[2] - rgb1[2]));
  return `rgb(${r},${g},${b})`;
}

export function renderCampaignMap(ctx: CanvasRenderingContext2D, width: number, height: number, scrollY: number, time: number) {
  ctx.clearRect(0, 0, width, height);

  const startZoneIdx = Math.max(0, Math.min(ZONE_CONFIGS.length - 1, Math.floor((scrollY || 0) / ZONE_HEIGHT))) || 0;
  const endZoneIdx = Math.max(0, Math.min(ZONE_CONFIGS.length - 1, Math.floor(((scrollY || 0) + (height || 0)) / ZONE_HEIGHT))) || 0;

  // Determine current ambient background color based on precise scroll
  const preciseZone = Math.max(0, (scrollY || 0) / ZONE_HEIGHT) || 0;
  const currentIdx = Math.max(0, Math.min(ZONE_CONFIGS.length - 1, Math.floor(preciseZone))) || 0;
  const nextIdx = Math.min(ZONE_CONFIGS.length - 1, currentIdx + 1);
  const blend = Math.max(0, Math.min(1, preciseZone - currentIdx)) || 0;
  
  const bgColor = interpolateColor(ZONE_CONFIGS[currentIdx].bg, ZONE_CONFIGS[nextIdx].bg, blend);

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Generate path points (every 120px in Y)
  const rng = seededRandom(12345);
  const points = [];
  const TOTAL_HEIGHT = ZONE_CONFIGS.length * ZONE_HEIGHT + 500;
  let currentY = 150;
  
  // To keep it stable, we must generate all points from 0 to TOTAL_HEIGHT
  // We can optimize later if needed, but 200 points is very fast.
  while (currentY < TOTAL_HEIGHT) {
    const amplitude = width * 0.35;
    const frequency = 0.4;
    const offset = Math.sin((currentY / SPACING) * frequency) * amplitude;
    const x = width / 2 + offset;
    points.push({ x, y: currentY });
    currentY += SPACING;
  }

  // Draw Path connecting points
  ctx.save();
  ctx.translate(0, -scrollY);
  
  // We draw the path in SVG now.

  // Generate and draw scenery
  // For each zone, generate its scenery
  for (let z = startZoneIdx; z <= endZoneIdx; z++) {
    const config = ZONE_CONFIGS[z];
    const zoneRng = seededRandom(999 + z * 100);
    const numObjects = Math.floor(30 * config.sceneryDensity); // 30 objects per zone
    
    for (let i = 0; i < numObjects; i++) {
      const type = config.scenery[Math.floor(zoneRng() * config.scenery.length)];
      // Scatter across width and height of this zone
      let x = zoneRng() * width;
      let y = z * ZONE_HEIGHT + zoneRng() * ZONE_HEIGHT;
      const scale = 0.5 + zoneRng() * 1.5;

      // Culling
      if (y < scrollY - 200 || y > scrollY + height + 200) continue;

      // Ensure objects don't cover the path completely (push them away from center sine wave)
      const pathXOffset = Math.sin((y / SPACING) * 0.4) * (width * 0.35);
      const pathCenter = width / 2 + pathXOffset;
      if (Math.abs(x - pathCenter) < 80) {
        // Push left or right
        x = x > pathCenter ? x + 100 : x - 100;
      }

      drawScenery(ctx, type, x, y, scale, time + i * 100);
    }
  }

  // Draw Particles
  // Simple particle system overlaying the screen based on the current zone
  const particleConfig = ZONE_CONFIGS[currentIdx].particle;
  if (particleConfig !== 'none') {
    ctx.save();
    // We render particles relative to screen, not world, for cheap ambient effects
    for (let i = 0; i < 40; i++) {
      const px = ((i * 32.1 + time * 0.05) % 1.2 - 0.1) * width;
      const py = ((i * 47.3 + time * 0.08) % 1.2 - 0.1) * height;
      
      ctx.fillStyle = ZONE_CONFIGS[currentIdx].ambient;
      ctx.globalAlpha = 0.2 + 0.3 * Math.sin(time / 500 + i);
      
      if (particleConfig === 'leaf' || particleConfig === 'leaf_orange') {
        ctx.fillRect(px, py, 6, 6);
      } else if (particleConfig === 'snow' || particleConfig === 'stardust' || particleConfig === 'star') {
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI*2); ctx.fill();
      } else if (particleConfig === 'bubble' || particleConfig === 'deep_bubble') {
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2); ctx.stroke();
      } else {
        ctx.fillRect(px, py, 4, 4);
      }
    }
    ctx.restore();
  }

  ctx.restore();
}
