import { drawAtmosphericSky, drawVolumetricSun, drawLayeredMist, withParallaxTier } from './worldUtils';

/**
 * WORLD 1 — SPRING MEADOW
 * Believable lush rolling meadow, atmospheric haze, trees at depth, swaying grass & drifting pollen
 */
export function renderSpringMeadow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Soft clear spring sky with azure to warm horizon
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#38bdf8' },
    { stop: 0.45, color: '#7dd3fc' },
    { stop: 0.72, color: '#bae6fd' },
    { stop: 1.0, color: '#dcfce7' },
  ]);

  // Gentle morning sun & volumetric warmth
  const sunX = w * 0.22;
  const sunY = h * 0.22;
  drawVolumetricSun(ctx, sunX, sunY, 32, '#fef08a', 'rgba(254, 240, 138, 0.45)', 'rgba(254, 240, 138, 0.15)', 180);

  // Soft cumulus clouds drifting across the blue sky
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  const cloudOffset = (time * 0.008) % (w + 400) - 200;
  for (let c = 0; c < 3; c++) {
    const cx = (cloudOffset + c * 380) % (w + 300);
    const cy = h * (0.16 + c * 0.08);
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, Math.PI * 2);
    ctx.arc(cx + 25, cy - 12, 42, 0, Math.PI * 2);
    ctx.arc(cx + 60, cy, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Distant misty rolling hills (aerial perspective) — Background Parallax Layer
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.62 + Math.sin(x * 0.003 + 1.2) * 28 + Math.cos(x * 0.006) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Distant mist bank
    drawLayeredMist(ctx, w, h * 0.64, 45, 'rgba(220, 252, 231, 0.4)', time, 0.005, 1);
  });

  // Midground emerald hills with copses of oak trees — Midground Parallax Layer
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.72 + Math.sin(x * 0.0045 + 3.1) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Trees in midground
    const treePositions = [0.12, 0.28, 0.68, 0.86];
    treePositions.forEach((pos, idx) => {
      const tx = w * pos;
      const ty = h * 0.71 + Math.sin(tx * 0.0045 + 3.1) * 22;
      const th = 40 + (idx % 2) * 14;
      // Trunk
      ctx.fillStyle = '#451a03';
      ctx.fillRect(tx - 2.5, ty - th * 0.35, 5, th * 0.4);
      // Layered foliage canopy with light edge
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(tx, ty - th * 0.6, th * 0.45, 0, Math.PI * 2);
      ctx.arc(tx - 10, ty - th * 0.5, th * 0.35, 0, Math.PI * 2);
      ctx.arc(tx + 10, ty - th * 0.5, th * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // Sunlit crown
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(tx - 4, ty - th * 0.7, th * 0.25, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // 3. Foreground lush green hill slope & foliage — Foreground Parallax Layer
  withParallaxTier(ctx, 'foreground', () => {
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = h * 0.82 + Math.sin(x * 0.007 + 0.5) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Foreground swaying grass blades along bottom
    const windSway = Math.sin(time * 0.003) * 6;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const baseY = h * 0.82 + Math.sin(x * 0.007 + 0.5) * 16;
      const bladeH = 14 + (Math.sin(x * 0.2) + 1) * 6;
      ctx.moveTo(x, baseY + 6);
      ctx.quadraticCurveTo(x + windSway * 0.5, baseY - bladeH * 0.5, x + windSway, baseY - bladeH);
    }
    ctx.stroke();

    // Wild meadow flowers (buttercups & red poppies)
    for (let f = 0; f < 18; f++) {
      const fx = (((f * 67.3) % w) + w) % w;
      const fy = h * 0.83 + Math.sin(fx * 0.007 + 0.5) * 14 + (f % 5) * 6;
      ctx.fillStyle = f % 3 === 0 ? '#ef4444' : (f % 3 === 1 ? '#facc15' : '#ffffff');
      ctx.beginPath();
      ctx.arc(fx + windSway * 0.6, fy - 8, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 4. Drifting airborne pollen motes floating on spring breeze
  ctx.save();
  ctx.fillStyle = '#fef08a';
  for (let p = 0; p < 36; p++) {
    const px = (((p * 51.3 + time * 0.025) % w) + w) % w;
    const py = (((p * 79.1 - time * 0.012 + Math.sin(time * 0.002 + p) * 18) % h) + h) % h;
    const sz = 1.2 + (p % 3) * 0.8;
    const alpha = 0.3 + 0.6 * Math.sin(time * 0.003 + p);
    ctx.globalAlpha = Math.max(0.15, alpha);
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 2 — AUTUMN MEADOW
 * Dense autumn trees, layered forest depth, fallen leaves carpet, floating drifting leaf particles, warm woodland light
 */
export function renderAutumnMeadow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  const autumnColors = ['#dc2626', '#ea580c', '#f59e0b', '#b45309', '#7c2d12'];

  // 1. Warm amber autumn atmosphere
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#7c2d12' },
    { stop: 0.35, color: '#c2410c' },
    { stop: 0.68, color: '#ea580c' },
    { stop: 0.88, color: '#f97316' },
    { stop: 1.0, color: '#fed7aa' },
  ]);

  // Golden afternoon sun filtered through trees
  const sunX = w * 0.76;
  const sunY = h * 0.28;
  drawVolumetricSun(ctx, sunX, sunY, 36, '#fef08a', 'rgba(251, 146, 60, 0.55)', 'rgba(234, 88, 12, 0.2)', 200);

  // Distant warm russet forest ridge — Background Parallax Layer
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 25) {
      const y = h * 0.58 + Math.sin(x * 0.003 + 2.0) * 30 + Math.cos(x * 0.008) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Distant golden haze
    drawLayeredMist(ctx, w, h * 0.62, 50, 'rgba(254, 215, 170, 0.35)', time, 0.008, 2);
  });

  // Midground dense autumn forest with layered red, orange, and golden crowns — Midground Parallax Layer
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.70 + Math.sin(x * 0.005 + 0.8) * 20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Cluster of autumn trees
    for (let t = 0; t < 9; t++) {
      const tx = w * (0.05 + t * 0.11);
      const ty = h * 0.69 + Math.sin(tx * 0.005 + 0.8) * 20;
      const th = 48 + (t % 3) * 15;
      // Dark trunk
      ctx.fillStyle = '#270a04';
      ctx.fillRect(tx - 3, ty - th * 0.35, 6, th * 0.4);
      // Canopy
      ctx.fillStyle = autumnColors[t % autumnColors.length];
      ctx.beginPath();
      ctx.arc(tx, ty - th * 0.65, th * 0.45, 0, Math.PI * 2);
      ctx.arc(tx - 12, ty - th * 0.55, th * 0.35, 0, Math.PI * 2);
      ctx.arc(tx + 12, ty - th * 0.55, th * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Foreground rich soil and fallen leaves — Foreground Parallax Layer
  withParallaxTier(ctx, 'foreground', () => {
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = h * 0.82 + Math.sin(x * 0.006 + 1.8) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Fallen leaf carpet
    for (let l = 0; l < 24; l++) {
      const lx = (((l * 47.9) % w) + w) % w;
      const ly = h * 0.83 + Math.sin(lx * 0.006 + 1.8) * 14 + (l % 4) * 8;
      ctx.fillStyle = autumnColors[l % autumnColors.length];
      ctx.beginPath();
      ctx.ellipse(lx, ly, 5, 2.5, (l * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 4. Realistic swirling autumn leaf particles tumbling through the air
  ctx.save();
  for (let i = 0; i < 35; i++) {
    const lx = (((i * 59.3 + time * 0.055) % (w + 60)) - 30 + w) % w;
    const ly = (((i * 83.1 + time * 0.038 + Math.sin(time * 0.003 + i) * 25) % h) + h) % h;
    const rot = time * 0.004 + i * 1.5;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(rot);
    ctx.fillStyle = autumnColors[i % autumnColors.length];
    ctx.globalAlpha = 0.55 + 0.45 * Math.sin(time * 0.002 + i);
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * WORLD 4 — SUNSET MEADOW
 * Cinematic sunset: huge sun at horizon, illuminated dusk clouds, deep atmospheric shadows, silhouetted grasses
 */
export function renderSunsetMeadow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Rich dusk gradient
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#1e1b4b' },
    { stop: 0.28, color: '#4c1d95' },
    { stop: 0.52, color: '#9d174d' },
    { stop: 0.72, color: '#ea580c' },
    { stop: 0.90, color: '#f59e0b' },
    { stop: 1.0, color: '#fde047' },
  ]);

  // Large sunset on horizon
  const sunX = w * 0.5;
  const sunY = h * 0.65;
  drawVolumetricSun(ctx, sunX, sunY, 52, '#fef08a', 'rgba(249, 115, 22, 0.75)', 'rgba(234, 88, 12, 0.3)', 260);

  // Layered glowing sunset clouds catching orange/pink rim light
  ctx.save();
  for (let c = 0; c < 4; c++) {
    const cy = h * (0.35 + c * 0.08);
    const grad = ctx.createLinearGradient(0, cy - 25, 0, cy + 25);
    grad.addColorStop(0, 'rgba(157, 23, 77, 0.45)');
    grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.55)');
    grad.addColorStop(1, 'rgba(254, 240, 138, 0.25)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    const cx1 = w * (0.2 + c * 0.22);
    ctx.ellipse(cx1, cy, 140, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Distant mountain ridges in atmospheric silhouette — Background Parallax Layer
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 25) {
      const y = h * 0.62 + Math.sin(x * 0.0035 + 1.0) * 35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Warm sunset horizon mist
    drawLayeredMist(ctx, w, h * 0.66, 40, 'rgba(245, 158, 11, 0.4)', time, 0.006, 3);
  });

  // Midground silhouette ridge — Midground Parallax Layer
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#1c0a27';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.74 + Math.sin(x * 0.005 + 2.5) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  });

  // Foreground rolling field & grass silhouettes — Foreground Parallax Layer
  withParallaxTier(ctx, 'foreground', () => {
    ctx.fillStyle = '#0f0514';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = h * 0.83 + Math.sin(x * 0.0065 + 0.3) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Foreground grass silhouettes catching sunset golden rim
    const windSway = Math.sin(time * 0.0025) * 5;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 10) {
      const baseY = h * 0.83 + Math.sin(x * 0.0065 + 0.3) * 16;
      const bladeH = 16 + (Math.sin(x * 0.3) + 1) * 7;
      ctx.moveTo(x, baseY + 4);
      ctx.quadraticCurveTo(x + windSway * 0.5, baseY - bladeH * 0.5, x + windSway, baseY - bladeH);
    }
    ctx.stroke();
  });

  // Airborne golden dust particles catching twilight sunbeams
  ctx.save();
  ctx.fillStyle = '#fed7aa';
  for (let p = 0; p < 30; p++) {
    const px = (((p * 61.7 + time * 0.03) % w) + w) % w;
    const py = (((p * 89.3 - time * 0.015 + Math.sin(time * 0.002 + p) * 15) % h) + h) % h;
    const a = 0.25 + 0.65 * Math.sin(time * 0.003 + p);
    ctx.globalAlpha = Math.max(0.1, a);
    ctx.beginPath();
    ctx.arc(px, py, 1.5 + (p % 2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
