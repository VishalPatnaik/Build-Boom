import { drawAtmosphericSky, drawVolumetricSun, drawLayeredMist, drawCinematicStars } from './worldUtils';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * WORLD 13 — CANDYLAND CONFECTION
 * Sophisticated fantasy confectionery: glossy sugar jewel spires, rich chocolate cliffs,
 * glazed cream hills, glossy syrup streams, marshmallow clouds, glittering sugar dust.
 */
export function renderCandyland(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Dreamy pastel candy sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#4a044e' },
    { stop: 0.35, color: '#86198f' },
    { stop: 0.68, color: '#db2777' },
    { stop: 0.88, color: '#f472b6' },
    { stop: 1.0, color: '#fbcfe8' },
  ]);

  // Soft spun-sugar marshmallow cloud decks
  ctx.save();
  ctx.fillStyle = 'rgba(255, 241, 242, 0.65)';
  for (let c = 0; c < 4; c++) {
    const cx = w * (0.15 + c * 0.26);
    const cy = h * (0.24 + (c % 2) * 0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, Math.PI * 2);
    ctx.arc(cx + 25, cy - 14, 46, 0, Math.PI * 2);
    ctx.arc(cx + 60, cy, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Distant chocolate rock cliffs with white icing strata
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 25) {
    const y = h * 0.58 + Math.sin(x * 0.005 + 1.4) * 35;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // White vanilla icing drips on cliff crests
  ctx.fillStyle = '#fff1f2';
  for (let x = 0; x <= w; x += 35) {
    const y = h * 0.58 + Math.sin(x * 0.005 + 1.4) * 35;
    ctx.fillRect(x - 10, y, 20, 8);
    ctx.beginPath();
    ctx.arc(x, y + 8, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Midground glazed strawberry cream hills
  ctx.fillStyle = '#9d174d';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 15) {
    const y = h * 0.72 + Math.sin(x * 0.007 + 2.8) * 22;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Translucent ruby sugar jewel crystals rising from hills
  const crystalSpires = [
    { x: w * 0.2, y: h * 0.71, h: 55, w: 18, color: '#f43f5e' },
    { x: w * 0.52, y: h * 0.69, h: 70, w: 22, color: '#ec4899' },
    { x: w * 0.82, y: h * 0.72, h: 48, w: 16, color: '#38bdf8' },
  ];
  crystalSpires.forEach(sp => {
    ctx.save();
    const spGrad = ctx.createLinearGradient(sp.x - sp.w * 0.5, sp.y, sp.x + sp.w * 0.5, sp.y - sp.h);
    spGrad.addColorStop(0, sp.color);
    spGrad.addColorStop(0.5, '#ffffff');
    spGrad.addColorStop(1, sp.color);
    ctx.fillStyle = spGrad;
    ctx.shadowColor = sp.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(sp.x - sp.w * 0.5, sp.y);
    ctx.lineTo(sp.x, sp.y - sp.h);
    ctx.lineTo(sp.x + sp.w * 0.5, sp.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // 4. Foreground glossy strawberry glaze terrain & sugar river
  ctx.fillStyle = '#db2777';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 10) {
    const y = h * 0.83 + Math.sin(x * 0.009 + 0.8) * 14;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Specular sugar syrup reflection along bottom
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(0, h * 0.84, w, 8);

  // Floating sparkling sugar crystals
  ctx.save();
  for (let p = 0; p < 40; p++) {
    const px = (((p * 51.3 + time * 0.02) % w) + w) % w;
    const py = (((p * 77.9 - time * 0.015 + Math.sin(time * 0.002 + p) * 15) % h) + h) % h;
    ctx.fillStyle = p % 2 === 0 ? '#fbcfe8' : '#ffffff';
    ctx.globalAlpha = 0.4 + 0.6 * Math.sin(time * 0.004 + p);
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 14 — GOLDEN LEGEND / EL DORADO
 * Celestial legendary endgame realm: monumental floating gilded monoliths, sacred auroras,
 * glowing hieroglyphic inscriptions, celestial sky, divine volumetric light beams.
 */
export function renderGoldenLegend(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Celestial golden dusk sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#1c1002' },
    { stop: 0.35, color: '#451a03' },
    { stop: 0.65, color: '#78350f' },
    { stop: 0.85, color: '#b45309' },
    { stop: 1.0, color: '#f59e0b' },
  ]);

  drawCinematicStars(ctx, w, h, 85, time, 99);

  // Divine radiant celestial sunbeams / god rays
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let r = 0; r < 5; r++) {
    const rx = w * (0.12 + r * 0.2);
    const rayGrad = ctx.createLinearGradient(rx, 0, rx + 50, h);
    rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    rayGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
    rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(rx - 25, 0);
    ctx.lineTo(rx + 25, 0);
    ctx.lineTo(rx + 80, h);
    ctx.lineTo(rx + 20, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 2. Distant monumental golden ziggurat temple architecture
  const px = w * 0.5;
  const py = h * 0.64;
  ctx.fillStyle = '#291404';
  ctx.beginPath();
  ctx.moveTo(px - 110, h);
  ctx.lineTo(px - 45, py);
  ctx.lineTo(px + 45, py);
  ctx.lineTo(px + 110, h);
  ctx.closePath();
  ctx.fill();

  // Golden temple shrine on top
  ctx.save();
  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = '#fde047';
  ctx.shadowBlur = 18;
  ctx.fillRect(px - 22, py - 18, 44, 18);
  ctx.restore();

  // 3. Floating monumental gilded megalith platforms in midground
  const floatingPlats = [
    { x: w * 0.18, y: h * 0.68 + Math.sin(time * 0.0015) * 8, w: 85, h: 22 },
    { x: w * 0.82, y: h * 0.66 + Math.cos(time * 0.0018) * 8, w: 95, h: 24 },
  ];
  floatingPlats.forEach(plat => {
    ctx.save();
    // Inlaid gold block
    const platGrad = ctx.createLinearGradient(plat.x - plat.w * 0.5, 0, plat.x + plat.w * 0.5, 0);
    platGrad.addColorStop(0, '#78350f');
    platGrad.addColorStop(0.5, '#f59e0b');
    platGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = platGrad;
    ctx.beginPath();
    ctx.roundRect(plat.x - plat.w * 0.5, plat.y, plat.w, plat.h, [4, 4, 2, 2]);
    ctx.fill();

    // Sacred glowing hieroglyphs
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 8;
    for (let g = 0; g < 4; g++) {
      ctx.fillRect(plat.x - plat.w * 0.35 + g * 18, plat.y + 6, 8, 8);
    }
    ctx.restore();
  });

  // 4. Foreground massive sacred golden dais platform
  ctx.fillStyle = '#451a03';
  ctx.fillRect(0, h * 0.8, w, h * 0.2);

  // Inlaid solid gold border rim
  ctx.save();
  const rimGrad = ctx.createLinearGradient(0, h * 0.8, w, h * 0.8);
  rimGrad.addColorStop(0, '#f59e0b');
  rimGrad.addColorStop(0.5, '#fef08a');
  rimGrad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = rimGrad;
  ctx.fillRect(0, h * 0.8, w, 8);
  ctx.restore();

  // Floating golden sun motes and divine embers
  ctx.save();
  ctx.fillStyle = '#fef08a';
  for (let p = 0; p < 45; p++) {
    const px = (((p * 47.9 + time * 0.02) % w) + w) % w;
    const py = (((h - (time * 0.035 + p * 25) % h)) + h) % h;
    ctx.globalAlpha = 0.3 + 0.7 * Math.sin(time * 0.003 + p);
    ctx.beginPath();
    ctx.arc(px, py, 1.6 + (p % 2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * CYBERPUNK MEGACITY
 * Authentic cyberpunk metropolis: skyscrapers with layered depth, neon billboards,
 * elevated skybridges, flying traffic trails, misty rain streaks, wet reflections.
 */
export function renderCyberpunk(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Deep neon smog twilight
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#090514' },
    { stop: 0.35, color: '#18072b' },
    { stop: 0.7, color: '#27083d' },
    { stop: 1.0, color: '#3b0764' },
  ]);

  // Distant glowing neon city haze
  ctx.save();
  const cityHaze = safeCreateRadialGradient(ctx, w * 0.5, h * 0.65, 30, w * 0.5, h * 0.65, Math.max(35, w * 0.7));
  if (cityHaze) {
    cityHaze.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
    cityHaze.addColorStop(0.5, 'rgba(244, 63, 94, 0.2)');
    cityHaze.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cityHaze;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // 2. Distant skyscraper silhouettes with illuminated antenna towers
  ctx.fillStyle = '#0b0217';
  const distantBuildings = [
    { x: w * 0.04, w: w * 0.16, h: h * 0.45 },
    { x: w * 0.24, w: w * 0.18, h: h * 0.55 },
    { x: w * 0.46, w: w * 0.14, h: h * 0.42 },
    { x: w * 0.64, w: w * 0.22, h: h * 0.52 },
    { x: w * 0.88, w: w * 0.14, h: h * 0.48 },
  ];
  distantBuildings.forEach(b => {
    ctx.fillRect(b.x, h - b.h, b.w, b.h);
    // Rooftop warning beacon
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(b.x + b.w * 0.5 - 1, h - b.h - 16, 2, 16);
    ctx.beginPath();
    ctx.arc(b.x + b.w * 0.5, h - b.h - 16, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0217';
  });

  // 3. Midground Mega-Towers with glowing neon signs and window grids
  ctx.fillStyle = '#05020a';
  const midTowers = [
    { x: w * 0.08, w: w * 0.26, h: h * 0.58 },
    { x: w * 0.42, w: w * 0.24, h: h * 0.62 },
    { x: w * 0.72, w: w * 0.28, h: h * 0.54 },
  ];
  midTowers.forEach(t => {
    ctx.fillRect(t.x, h - t.h, t.w, t.h);

    // Glowing window matrix
    ctx.save();
    for (let wy = h - t.h + 25; wy < h - 40; wy += 16) {
      for (let wx = t.x + 12; wx < t.x + t.w - 12; wx += 14) {
        if (Math.sin(wx * 2.3 + wy * 1.7) > 0.15) {
          ctx.fillStyle = Math.sin(wx + wy) > 0 ? '#00f0ff' : '#f43f5e';
          ctx.globalAlpha = 0.65;
          ctx.fillRect(wx, wy, 5, 7);
        }
      }
    }
    ctx.restore();

    // Giant glowing neon Kanji/cyber holographic billboard on tower side
    ctx.save();
    const signColor = t.x > w * 0.5 ? '#f43f5e' : '#00f0ff';
    ctx.strokeStyle = signColor;
    ctx.shadowColor = signColor;
    ctx.shadowBlur = 16;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(t.x + 18, h - t.h + 35, t.w - 36, 45);
    ctx.fillStyle = signColor;
    ctx.fillRect(t.x + 28, h - t.h + 52, t.w - 56, 10);
    ctx.restore();
  });

  // Elevated Skybridge with moving traffic light streak
  const bridgeY = h * 0.74;
  ctx.fillStyle = '#090514';
  ctx.fillRect(0, bridgeY, w, 14);

  // Moving flying car headlights across skybridge
  const carX = (time * 0.1) % (w + 100) - 50;
  ctx.save();
  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 12;
  ctx.fillRect(carX, bridgeY + 3, 18, 4);
  // Red taillight
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.fillRect(carX - 8, bridgeY + 4, 6, 3);
  ctx.restore();

  // 4. Foreground rain-slicked rooftop gantry & atmospheric neon rain
  ctx.fillStyle = '#020105';
  ctx.fillRect(0, h * 0.86, w, h * 0.14);

  // Neon rain streaks
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
  ctx.lineWidth = 1.2;
  for (let r = 0; r < 45; r++) {
    const rx = (((r * 43.7 + time * 0.04) % w) + w) % w;
    const ry = (((time * 0.12 + r * 28) % h) + h) % h;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - 2, ry + 12);
    ctx.stroke();
  }
  ctx.restore();
}
