import { drawAtmosphericSky, drawVolumetricSun, drawLayeredMist, drawCinematicStars, withParallaxTier } from './worldUtils';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * WORLD 3 — WINTER / FROZEN ARCTIC TUNDRA
 * Cold alpine environment: snow-capped jagged peaks, snow-laden conifer trees,
 * dancing Aurora Borealis, visible frost, cold mist banks, realistic snowfall.
 */
export function renderWinter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Deep sub-zero twilight sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#03172e' },
    { stop: 0.35, color: '#073359' },
    { stop: 0.68, color: '#0c4a7a' },
    { stop: 1.0, color: '#1e6896' },
  ]);

  drawCinematicStars(ctx, w, h, 80, time, 33);

  // Aurora Borealis curtains dancing across the northern sky
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let a = 0; a < 3; a++) {
    const aurGrad = ctx.createLinearGradient(0, h * 0.12, 0, h * 0.48);
    aurGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    aurGrad.addColorStop(0.45, a === 1 ? 'rgba(52, 211, 153, 0.45)' : 'rgba(56, 189, 248, 0.35)');
    aurGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aurGrad;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.15);
    for (let x = 0; x <= w; x += 25) {
      const y = h * 0.26 + Math.sin(x * 0.008 + time * 0.0012 + a * 2.2) * 35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h * 0.48);
    ctx.lineTo(0, h * 0.48);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 2. Distant jagged snow-covered alpine mountain peaks — Background Parallax Layer
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 30) {
      const y = h * 0.56 + Math.sin(x * 0.004 + 1.5) * 45 + Math.cos(x * 0.012) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Snow-caps on distant peaks
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    for (let x = 0; x <= w; x += 30) {
      const y = h * 0.56 + Math.sin(x * 0.004 + 1.5) * 45 + Math.cos(x * 0.012) * 20;
      if (y < h * 0.56) {
        ctx.fillRect(x - 12, y, 24, 8);
      }
    }

    // Cold mountain mist
    drawLayeredMist(ctx, w, h * 0.62, 50, 'rgba(186, 230, 253, 0.35)', time, 0.006, 5);
  });

  // 3. Midground snow-covered conifer pine forest — Midground Parallax Layer
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#0c4a6e';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.72 + Math.sin(x * 0.006 + 3.0) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Pine tree silhouettes with snow mantles
    for (let p = 0; p < 11; p++) {
      const px = w * (0.04 + p * 0.095);
      const py = h * 0.71 + Math.sin(px * 0.006 + 3.0) * 20;
      const ph = 42 + (p % 3) * 12;
      // Dark conifer body
      ctx.fillStyle = '#082f49';
      ctx.beginPath();
      ctx.moveTo(px, py - ph);
      ctx.lineTo(px - 14, py);
      ctx.lineTo(px + 14, py);
      ctx.closePath();
      ctx.fill();
      // White snow mantle on branches
      ctx.fillStyle = '#f0f9ff';
      ctx.beginPath();
      ctx.moveTo(px, py - ph);
      ctx.lineTo(px - 7, py - ph * 0.5);
      ctx.lineTo(px + 7, py - ph * 0.5);
      ctx.closePath();
      ctx.fill();
    }
  });

  // 4. Foreground frozen icy permafrost terrain & snowdrifts — Foreground Parallax Layer
  withParallaxTier(ctx, 'foreground', () => {
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = h * 0.83 + Math.sin(x * 0.008 + 0.5) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Foreground snowdrifts with crystalline blue light
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.85 + Math.sin(x * 0.01 + 1.2) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  });

  // 5. Realistic atmospheric snowfall particles (varied depth, speed, drift)
  ctx.save();
  ctx.fillStyle = '#ffffff';
  for (let s = 0; s < 60; s++) {
    const sx = (((s * 41.3 + Math.sin(time * 0.0015 + s) * 20) % (w + 40)) - 20 + w) % w;
    const sy = (((time * (0.025 + (s % 3) * 0.015) + s * 27) % h) + h) % h;
    const sr = 1.0 + (s % 3) * 0.8;
    ctx.globalAlpha = 0.4 + 0.6 * Math.sin(time * 0.003 + s);
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 7 — TROPICAL SUNSET BEACH
 * Coastal landscape: ocean extending to horizon, rolling wave crests with foam,
 * wet reflective tide sand, swaying palm silhouettes, sunlit golden water glare.
 */
export function renderBeach(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Tropical sunset sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#3b0764' },
    { stop: 0.32, color: '#831843' },
    { stop: 0.56, color: '#db2777' },
    { stop: 0.72, color: '#ea580c' },
    { stop: 0.88, color: '#f59e0b' },
    { stop: 1.0, color: '#fef08a' },
  ]);

  // Warm golden sun hovering just above ocean horizon
  const sunX = w * 0.48;
  const sunY = h * 0.58;
  drawVolumetricSun(ctx, sunX, sunY, 44, '#ffffff', 'rgba(251, 146, 60, 0.7)', 'rgba(234, 88, 12, 0.25)', 220);

  // 2. Distant ocean horizon line
  const horizonY = h * 0.66;
  const oceanGrad = ctx.createLinearGradient(0, horizonY, 0, h);
  oceanGrad.addColorStop(0, '#0e7490');
  oceanGrad.addColorStop(0.35, '#155e75');
  oceanGrad.addColorStop(0.7, '#164e63');
  oceanGrad.addColorStop(1, '#083344');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, horizonY, w, h - horizonY);

  // Specular golden sunset reflection shimmer path across water
  ctx.save();
  const waterReflection = ctx.createLinearGradient(0, horizonY, 0, h * 0.86);
  waterReflection.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
  waterReflection.addColorStop(0.5, 'rgba(249, 115, 22, 0.4)');
  waterReflection.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = waterReflection;
  for (let r = 0; r < 14; r++) {
    const ry = horizonY + r * 14;
    const rw = 25 + r * 16;
    const waveWobble = Math.sin(time * 0.003 + r) * 6;
    ctx.fillRect(sunX - rw * 0.5 + waveWobble, ry, rw, 3.5);
  }
  ctx.restore();

  // Rolling ocean waves & foam crests
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2.0;
  for (let wv = 0; wv < 4; wv++) {
    const wy = horizonY + 30 + wv * 28 + Math.sin(time * 0.002 + wv) * 4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      const cy = wy + Math.sin(x * 0.015 + time * 0.002 + wv * 1.5) * 4;
      if (x === 0) ctx.moveTo(x, cy);
      else ctx.lineTo(x, cy);
    }
    ctx.stroke();
  }

  // 3. Shoreline: wet reflective sand & gentle surf wash
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 15) {
    const y = h * 0.83 + Math.sin(x * 0.006 + 1.2) * 12;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Wet sand specular sheen
  ctx.fillStyle = 'rgba(254, 215, 170, 0.35)';
  ctx.fillRect(0, h * 0.83, w, 15);

  // 4. Silhouetted tropical palm trees framing the scene
  const palmTrees = [
    { x: w * 0.1, y: h * 0.85, height: 110, bend: -25 },
    { x: w * 0.92, y: h * 0.87, height: 130, bend: -35 },
  ];
  palmTrees.forEach(palm => {
    ctx.save();
    // Curved trunk
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(palm.x, palm.y);
    const topX = palm.x + palm.bend;
    const topY = palm.y - palm.height;
    ctx.quadraticCurveTo(palm.x + palm.bend * 0.3, palm.y - palm.height * 0.5, topX, topY);
    ctx.stroke();

    // Palm fronds arching outward
    ctx.strokeStyle = '#0c0a09';
    ctx.lineWidth = 3.5;
    const sway = Math.sin(time * 0.0025) * 5;
    for (let f = 0; f < 7; f++) {
      const ang = (f / 7) * Math.PI * 1.5 - Math.PI * 0.75;
      const frondLen = 50 + (f % 2) * 12;
      const fx = topX + Math.cos(ang) * frondLen + sway;
      const fy = topY + Math.sin(ang) * frondLen * 0.6 + 10;
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.quadraticCurveTo(topX + (fx - topX) * 0.5, topY - 15, fx, fy);
      ctx.stroke();
    }
    ctx.restore();
  });

  // Marine sea spray and golden sunset motes
  ctx.save();
  ctx.fillStyle = '#fef08a';
  for (let p = 0; p < 28; p++) {
    const px = (((p * 57.3 + time * 0.02) % w) + w) % w;
    const py = (((p * 81.9 - time * 0.012 + Math.sin(time * 0.002 + p) * 14) % h) + h) % h;
    ctx.globalAlpha = 0.3 + 0.5 * Math.sin(time * 0.003 + p);
    ctx.beginPath();
    ctx.arc(px, py, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 8 — VOLCANIC CALDERA
 * Threatening volcanic environment: basalt mountains, glowing molten lava rivers with heat fissures,
 * rising smoke plumes, glowing magma embers, heat distortion aura.
 */
export function renderVolcano(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Fiery volcanic smog & smoke sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#180303' },
    { stop: 0.35, color: '#450a0a' },
    { stop: 0.7, color: '#7f1d1d' },
    { stop: 1.0, color: '#991b1b' },
  ]);

  // Rising billowing volumetric dark smoke plumes
  ctx.save();
  for (let s = 0; s < 5; s++) {
    const sx = w * (0.18 + s * 0.18);
    const sy = h * (0.3 + s * 0.08) - (time * 0.015 + s * 30) % (h * 0.45);
    const rad = 50 + s * 14;
    const smokeGrad = safeCreateRadialGradient(ctx, sx, sy, 10, sx, sy, rad);
    if (smokeGrad) {
      smokeGrad.addColorStop(0, 'rgba(24, 3, 3, 0.65)');
      smokeGrad.addColorStop(0.6, 'rgba(69, 10, 10, 0.35)');
      smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 2. Jagged basalt volcanic crags & caldera walls — Background Parallax Layer
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#1c0505';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.58 + Math.sin(x * 0.007 + 1.1) * 45 + Math.cos(x * 0.018) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Volcanic heat glow on mountain contours
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.58 + Math.sin(x * 0.007 + 1.1) * 45 + Math.cos(x * 0.018) * 22;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  // Midground dark basalt terrace — Midground Parallax Layer
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#2a0808';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.72 + Math.sin(x * 0.008 + 2.8) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  });

  // 3. Glowing molten lava lake / river in caldera floor — Foreground Parallax Layer
  withParallaxTier(ctx, 'foreground', () => {
    ctx.save();
    const lavaY = h * 0.79;
    const lavaGrad = ctx.createLinearGradient(0, lavaY, 0, h);
    lavaGrad.addColorStop(0, '#fef08a');
    lavaGrad.addColorStop(0.2, '#f97316');
    lavaGrad.addColorStop(0.6, '#dc2626');
    lavaGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, lavaY, w, h - lavaY);

    // Black cooling basalt crust plates floating on molten magma
    ctx.fillStyle = '#1a0505';
    for (let c = 0; c < 8; c++) {
      const cx = w * (0.05 + c * 0.13) + Math.sin(time * 0.001 + c) * 10;
      const cy = lavaY + 12 + (c % 3) * 18;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 32, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing yellow/white lava fissures across the crust
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 40) {
      const y = lavaY + 8 + Math.sin(x * 0.02 + time * 0.002) * 5;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  });

  // 4. Rising glowing fiery sparks, magma embers & ash flakes
  ctx.save();
  for (let e = 0; e < 50; e++) {
    const ex = (((e * 37.1 + Math.sin(time * 0.003 + e) * 35) % w) + w) % w;
    const ey = (((h - (time * 0.06 + e * 24) % h)) + h) % h;
    const er = 1.4 + (e % 3);
    const alpha = 0.4 + 0.6 * Math.sin(time * 0.005 + e);
    ctx.fillStyle = e % 3 === 0 ? '#fef08a' : (e % 3 === 1 ? '#f97316' : '#ef4444');
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.globalAlpha = Math.max(0.2, alpha);
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
