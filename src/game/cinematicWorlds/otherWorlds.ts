import { drawAtmosphericSky, drawVolumetricSun, drawCinematicStars } from './worldUtils';

/**
 * 4: ABYSSAL CORAL REEF
 * Underwater world: sunbeams piercing sapphire water, living coral shelves, rising bubbles
 */
export function renderAbyssalCoral(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#02182b' },
    { stop: 0.4, color: '#03396c' },
    { stop: 0.75, color: '#005b96' },
    { stop: 1.0, color: '#012a4a' },
  ]);

  // Piercing underwater sun caustic rays
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let r = 0; r < 5; r++) {
    const rx = w * (0.15 + r * 0.18);
    const ray = ctx.createLinearGradient(rx, 0, rx + 40, h);
    ray.addColorStop(0, 'rgba(100, 216, 255, 0.3)');
    ray.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ray;
    ctx.beginPath();
    ctx.moveTo(rx - 20, 0);
    ctx.lineTo(rx + 20, 0);
    ctx.lineTo(rx + 80, h);
    ctx.lineTo(rx + 20, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Distant coral shelf silhouettes
  ctx.fillStyle = '#011627';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 15) {
    const y = h * 0.7 + Math.sin(x * 0.008 + 1.2) * 22;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Bioluminescent coral branches in midground
  const corals = [w * 0.12, w * 0.35, w * 0.65, w * 0.88];
  corals.forEach((cx, idx) => {
    ctx.save();
    ctx.strokeStyle = idx % 2 === 0 ? '#22d3ee' : '#f43f5e';
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx, h * 0.78);
    ctx.lineTo(cx, h * 0.7);
    ctx.lineTo(cx - 14, h * 0.64);
    ctx.moveTo(cx, h * 0.7);
    ctx.lineTo(cx + 14, h * 0.62);
    ctx.stroke();
    ctx.restore();
  });

  // Rising hydrodynamic water bubbles
  ctx.save();
  for (let b = 0; b < 32; b++) {
    const bx = (((b * 39.3) % w) + Math.sin(time * 0.002 + b) * 15 + w) % w;
    const by = (((-time * 0.035 - b * 32) % h) + h) % h;
    const br = 2 + (b % 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 9: GOLDEN DESERT OASIS
 * Shimmering wind-rippled sand dunes, ancient sandstone pyramids, blazing desert sun
 */
export function renderGoldenDesert(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#78350f' },
    { stop: 0.4, color: '#d97706' },
    { stop: 0.75, color: '#f59e0b' },
    { stop: 1.0, color: '#fef08a' },
  ]);

  drawVolumetricSun(ctx, w * 0.5, h * 0.26, 46, '#ffffff', 'rgba(254, 240, 138, 0.6)', 'rgba(234, 179, 8, 0.2)', 200);

  // Distant sandstone pyramid silhouette
  const px = w * 0.68;
  const py = h * 0.62;
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(px - 70, h);
  ctx.lineTo(px, py);
  ctx.lineTo(px + 70, h);
  ctx.closePath();
  ctx.fill();

  // Sweeping layered golden dunes
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 20) {
    const y = h * 0.68 + Math.sin(x * 0.005 + 1.4) * 26;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 15) {
    const y = h * 0.76 + Math.sin(x * 0.007 + 3.2) * 20;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Floating shimmering sand dust
  ctx.save();
  ctx.fillStyle = '#fef08a';
  for (let p = 0; p < 35; p++) {
    const px2 = (((p * 47.3 + time * 0.04) % w) + w) % w;
    const py2 = (((p * 79.1 + Math.sin(time * 0.002 + p) * 12) % h) + h) % h;
    ctx.globalAlpha = 0.3 + 0.6 * Math.sin(time * 0.003 + p);
    ctx.beginPath();
    ctx.arc(px2, py2, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 15: TOXIC WASTELAND
 * Industrial refinery pipes, bubbling phosphorescent green chemical lagoon
 */
export function renderToxicWasteland(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#091404' },
    { stop: 0.4, color: '#193309' },
    { stop: 0.75, color: '#365314' },
    { stop: 1.0, color: '#4d7c0f' },
  ]);

  // Refinery cooling towers & exhaust chimneys
  ctx.fillStyle = '#050c02';
  ctx.fillRect(w * 0.18, h * 0.52, 34, h * 0.28);
  ctx.fillRect(w * 0.7, h * 0.5, 42, h * 0.3);

  // Toxic green glowing chemical lagoon
  ctx.save();
  const lagoonGrad = ctx.createLinearGradient(0, h * 0.78, 0, h);
  lagoonGrad.addColorStop(0, '#bef264');
  lagoonGrad.addColorStop(0.3, '#84cc16');
  lagoonGrad.addColorStop(1, '#1a3a09');
  ctx.fillStyle = lagoonGrad;
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  ctx.restore();

  // Bubbling radioactive vapor motes
  ctx.save();
  ctx.fillStyle = '#bef264';
  for (let p = 0; p < 35; p++) {
    const px = (((p * 43.1 + Math.sin(time * 0.002 + p) * 20) % w) + w) % w;
    const py = (((h - (time * 0.03 + p * 25) % h)) + h) % h;
    ctx.globalAlpha = 0.3 + 0.7 * Math.sin(time * 0.004 + p);
    ctx.beginPath();
    ctx.arc(px, py, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 16: FLOATING SKY ISLANDS
 * Floating mossy aerolites, cascading waterfalls, sea of cumulus clouds
 */
export function renderFloatingIslands(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#0284c7' },
    { stop: 0.4, color: '#38bdf8' },
    { stop: 0.75, color: '#7dd3fc' },
    { stop: 1.0, color: '#e0f2fe' },
  ]);

  // Cloud ocean below
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  for (let c = 0; c < 5; c++) {
    const cx = (w / 4) * c;
    const cy = h * 0.75 + Math.sin(c + time * 0.001) * 12;
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Giant levitating sky island in center
  const isX = w * 0.5;
  const isY = h * 0.62 + Math.sin(time * 0.0012) * 6;
  ctx.save();
  // Bottom rock cone
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(isX - 85, isY);
  ctx.lineTo(isX + 85, isY);
  ctx.lineTo(isX, isY + 80);
  ctx.closePath();
  ctx.fill();
  // Moss top plate
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.ellipse(isX, isY - 4, 88, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Drifting celestial mist
  ctx.save();
  ctx.fillStyle = '#ffffff';
  for (let p = 0; p < 25; p++) {
    const px = (((p * 61.3 + time * 0.02) % w) + w) % w;
    const py = (((p * 83.1 + Math.sin(time * 0.002 + p) * 12) % h) + h) % h;
    ctx.globalAlpha = 0.3 + 0.5 * Math.sin(time * 0.003 + p);
    ctx.beginPath();
    ctx.arc(px, py, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 17: CHRONO CLOCKWORK REALM
 * Massive interlocking brass gears, escaping steam, heavy iron machines
 */
export function renderClockwork(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#1a0d05' },
    { stop: 0.4, color: '#381c0b' },
    { stop: 0.75, color: '#5c2d12' },
    { stop: 1.0, color: '#78350f' },
  ]);

  // Interlocking rotating brass gear trains
  const drawGear = (gx: number, gy: number, gr: number, teeth: number, rot: number) => {
    ctx.save();
    ctx.fillStyle = 'rgba(180, 83, 9, 0.45)';
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const ang = (i / teeth) * Math.PI * 2 + rot;
      const rOut = gr * 1.15;
      const rIn = gr * 0.85;
      ctx.lineTo(gx + Math.cos(ang - 0.08) * rIn, gy + Math.sin(ang - 0.08) * rIn);
      ctx.lineTo(gx + Math.cos(ang - 0.05) * rOut, gy + Math.sin(ang - 0.05) * rOut);
      ctx.lineTo(gx + Math.cos(ang + 0.05) * rOut, gy + Math.sin(ang + 0.05) * rOut);
      ctx.lineTo(gx + Math.cos(ang + 0.08) * rIn, gy + Math.sin(ang + 0.08) * rIn);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  drawGear(w * 0.25, h * 0.42, 65, 14, time * 0.0006);
  drawGear(w * 0.72, h * 0.54, 85, 18, -time * 0.00045);

  // Heavy machine framework in foreground
  ctx.fillStyle = '#291404';
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  // Rising steam vents
  ctx.save();
  ctx.fillStyle = 'rgba(254, 243, 199, 0.5)';
  for (let p = 0; p < 30; p++) {
    const px = (((p * 47.9 + Math.sin(time * 0.003 + p) * 15) % w) + w) % w;
    const py = (((h - (time * 0.025 + p * 25) % h)) + h) % h;
    ctx.globalAlpha = 0.3 + 0.6 * Math.sin(time * 0.004 + p);
    ctx.beginPath();
    ctx.arc(px, py, 2.0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * 18: SAKURA BLOSSOM SHRINE
 * Mount Fuji silhouette in twilight, pagoda, fluttering pink cherry blossom petals
 */
export function renderSakuraShrine(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#3b0724' },
    { stop: 0.4, color: '#831843' },
    { stop: 0.75, color: '#be185d' },
    { stop: 1.0, color: '#fbcfe8' },
  ]);

  // Mount Fuji silhouette
  ctx.save();
  ctx.fillStyle = '#4c0519';
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.72);
  ctx.lineTo(w * 0.5, h * 0.4);
  ctx.lineTo(w * 0.85, h * 0.72);
  ctx.closePath();
  ctx.fill();
  // Snowcap
  ctx.fillStyle = '#ffe4e6';
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.46);
  ctx.lineTo(w * 0.5, h * 0.4);
  ctx.lineTo(w * 0.58, h * 0.46);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Foreground hills
  ctx.fillStyle = '#500724';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 15) {
    const y = h * 0.76 + Math.sin(x * 0.007 + 1.2) * 18;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Fluttering organic cherry blossom petals
  ctx.save();
  for (let p = 0; p < 45; p++) {
    const px = (((p * 41.7 + time * 0.035) % w) + w) % w;
    const py = (((p * 63.9 + time * 0.025 + Math.sin(time * 0.002 + p) * 15) % h) + h) % h;
    const rot = time * 0.003 + p;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * 19: CRYSTALLINE GEODE CORE
 * Subterranean cavern with towering faceted glowing amethyst pillars
 */
export function renderCrystallineCore(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#070214' },
    { stop: 0.35, color: '#150630' },
    { stop: 0.7, color: '#2e0854' },
    { stop: 1.0, color: '#3b0764' },
  ]);

  // Cavern stalactites from ceiling
  ctx.fillStyle = '#130429';
  const stalactites = [w * 0.15, w * 0.45, w * 0.78];
  stalactites.forEach(sx => {
    ctx.beginPath();
    ctx.moveTo(sx - 20, 0);
    ctx.lineTo(sx, 75);
    ctx.lineTo(sx + 20, 0);
    ctx.closePath();
    ctx.fill();
  });

  // Glowing faceted amethyst crystals rising from cavern floor
  const crystals = [
    { x: w * 0.22, y: h * 0.75, h: 75, w: 22 },
    { x: w * 0.5, y: h * 0.72, h: 90, w: 26 },
    { x: w * 0.78, y: h * 0.76, h: 65, w: 20 },
  ];
  crystals.forEach(cr => {
    ctx.save();
    const cGrad = ctx.createLinearGradient(cr.x - cr.w * 0.5, cr.y, cr.x + cr.w * 0.5, cr.y - cr.h);
    cGrad.addColorStop(0, '#581c87');
    cGrad.addColorStop(0.5, '#c084fc');
    cGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = cGrad;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(cr.x - cr.w * 0.5, cr.y);
    ctx.lineTo(cr.x, cr.y - cr.h);
    ctx.lineTo(cr.x + cr.w * 0.5, cr.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Cavern floor
  ctx.fillStyle = '#1e073a';
  ctx.fillRect(0, h * 0.82, w, h * 0.18);

  // Sparkling crystal vapor motes
  ctx.save();
  ctx.fillStyle = '#e9d5ff';
  for (let p = 0; p < 35; p++) {
    const px = (((p * 49.3 + time * 0.015) % w) + w) % w;
    const py = (((h - (time * 0.02 + p * 25) % h)) + h) % h;
    ctx.globalAlpha = 0.3 + 0.6 * Math.sin(time * 0.003 + p);
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
