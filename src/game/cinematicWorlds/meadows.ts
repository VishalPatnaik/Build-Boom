import { 
  drawAtmosphericSky, 
  drawVolumetricSun, 
  drawLayeredMist, 
  withParallaxTier, 
  drawOrganicTree, 
  drawNaturalRock, 
  drawVolumetricGodRays 
} from './worldUtils';

/**
 * WORLD 1 — SPRING MEADOW
 * Console-grade, layered fantasy spring valley:
 * - Clear morning azure-to-emerald sky with volumetric sun and morning god-rays
 * - Distant misty mountain ridges with aerial atmospheric haze
 * - Midground rolling alpine knolls, gnarled ancient oak trees with branching limbs, dense foliage volume, and natural rock crags
 * - Foreground lush grassy hillside with hand-crafted grass blade tufts, wildflowers, weathered wooden fence posts, and floating pollen motes
 */
export function renderSpringMeadow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Sky: Clear morning sky with cerulean to soft spring dawn glow
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#0284c7' },
    { stop: 0.38, color: '#38bdf8' },
    { stop: 0.72, color: '#bae6fd' },
    { stop: 1.0, color: '#ecfdf5' },
  ]);

  // Volumetric morning sun
  const sunX = w * 0.22;
  const sunY = h * 0.2;
  drawVolumetricSun(ctx, sunX, sunY, 34, '#fef08a', 'rgba(254, 240, 138, 0.45)', 'rgba(254, 240, 138, 0.15)', 200);

  // Volumetric god rays streaming from the sun down into the valley
  drawVolumetricGodRays(ctx, sunX, sunY, h * 0.85, w, 'rgba(254, 240, 138, 0.22)', time);

  // Soft drifting cumulus clouds
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  const cloudOffset = (time * 0.006) % (w + 400) - 200;
  for (let c = 0; c < 3; c++) {
    const cx = (cloudOffset + c * 360) % (w + 300);
    const cy = h * (0.14 + c * 0.07);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 55, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 28, cy - 10, 42, 28, 0.1, 0, Math.PI * 2);
    ctx.ellipse(cx - 30, cy + 2, 38, 20, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. BACKGROUND: Distant blue-green mountain range & atmospheric mist
  withParallaxTier(ctx, 'background', () => {
    // Far misty mountain peaks
    const gradFar = ctx.createLinearGradient(0, h * 0.45, 0, h * 0.75);
    gradFar.addColorStop(0, '#7dd3fc');
    gradFar.addColorStop(0.45, '#6ee7b7');
    gradFar.addColorStop(1, '#a7f3d0');

    ctx.fillStyle = gradFar;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.58 + Math.sin(x * 0.0035 + 1.2) * 36 + Math.cos(x * 0.007) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Distant valley mist bank
    drawLayeredMist(ctx, w, h * 0.62, 50, 'rgba(236, 253, 245, 0.5)', time, 0.006, 1);
  });

  // 3. MIDGROUND: Rolling emerald hills, ancient oak trees with organic branches, rock outcroppings
  withParallaxTier(ctx, 'midground', () => {
    const gradMid = ctx.createLinearGradient(0, h * 0.65, 0, h * 0.88);
    gradMid.addColorStop(0, '#15803d');
    gradMid.addColorStop(0.5, '#16a34a');
    gradMid.addColorStop(1, '#14532d');

    ctx.fillStyle = gradMid;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = h * 0.7 + Math.sin(x * 0.005 + 3.1) * 26 + Math.cos(x * 0.012) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Natural rock crags in midground
    drawNaturalRock(ctx, w * 0.18, h * 0.72, 28, 18, {
      baseColor: '#64748b',
      highColor: '#cbd5e1',
      shadowColor: '#1e293b',
    });
    drawNaturalRock(ctx, w * 0.76, h * 0.71, 32, 20, {
      baseColor: '#475569',
      highColor: '#94a3b8',
      shadowColor: '#0f172a',
    });

    // Organic leafy oak trees in midground (NEVER circles or rectangles!)
    const swayMid = Math.sin(time * 0.0018) * 3;
    drawOrganicTree(ctx, w * 0.12, h * 0.71, 56, {
      barkColor: '#3e2723',
      barkShadow: '#1b100c',
      leafBase: '#14532d',
      leafMid: '#16a34a',
      leafHigh: '#4ade80',
      sway: swayMid,
      seed: 12,
    });

    drawOrganicTree(ctx, w * 0.32, h * 0.72, 48, {
      barkColor: '#451a03',
      barkShadow: '#1e1008',
      leafBase: '#15803d',
      leafMid: '#22c55e',
      leafHigh: '#86efac',
      sway: swayMid * 0.9,
      seed: 44,
    });

    drawOrganicTree(ctx, w * 0.88, h * 0.69, 52, {
      barkColor: '#3e2723',
      barkShadow: '#1b100c',
      leafBase: '#166534',
      leafMid: '#15803d',
      leafHigh: '#4ade80',
      sway: swayMid * 1.1,
      seed: 88,
    });
  });

  // 4. FOREGROUND: Rich clover-dusted slope, weathered wooden fence, swaying grass blades, wildflowers
  withParallaxTier(ctx, 'foreground', () => {
    const gradFore = ctx.createLinearGradient(0, h * 0.8, 0, h);
    gradFore.addColorStop(0, '#166534');
    gradFore.addColorStop(0.3, '#14532d');
    gradFore.addColorStop(1, '#052e16');

    ctx.fillStyle = gradFore;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.81 + Math.sin(x * 0.008 + 0.5) * 18 + Math.cos(x * 0.02) * 6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Weathered rustic wooden fence posts with wire
    const fencePosts = [w * 0.06, w * 0.22, w * 0.78, w * 0.94];
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    fencePosts.forEach((px, i) => {
      const py = h * 0.81 + Math.sin(px * 0.008 + 0.5) * 18;
      if (i === 0) ctx.moveTo(px, py - 18);
      else ctx.lineTo(px, py - 18);
    });
    ctx.stroke();

    fencePosts.forEach((px) => {
      const py = h * 0.81 + Math.sin(px * 0.008 + 0.5) * 18;
      // Post shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(px + 4, py + 2, 7, 3, 0.15, 0, Math.PI * 2);
      ctx.fill();
      // Wooden post
      ctx.fillStyle = '#451a03';
      ctx.fillRect(px - 2.5, py - 24, 5, 26);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px - 2.5, py - 24, 2, 26); // Sunlit post edge
    });

    // Foreground organic rock
    drawNaturalRock(ctx, w * 0.42, h * 0.83, 34, 18, {
      baseColor: '#64748b',
      highColor: '#cbd5e1',
      shadowColor: '#1e293b',
    });

    // Swaying grass blade clusters
    const windSway = Math.sin(time * 0.0028) * 7;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = 0; x <= w; x += 10) {
      const baseY = h * 0.81 + Math.sin(x * 0.008 + 0.5) * 18;
      const bladeH = 16 + (Math.sin(x * 0.3) + 1) * 8;
      ctx.moveTo(x, baseY + 4);
      ctx.quadraticCurveTo(x + windSway * 0.5, baseY - bladeH * 0.5, x + windSway, baseY - bladeH);
    }
    ctx.stroke();

    // Vibrant meadow wildflowers (buttercups, poppies, bluebells)
    for (let f = 0; f < 24; f++) {
      const fx = (((f * 59.3) % w) + w) % w;
      const fy = h * 0.82 + Math.sin(fx * 0.008 + 0.5) * 18 + (f % 5) * 5;
      const fColor = f % 4 === 0 ? '#ef4444' : f % 4 === 1 ? '#facc15' : f % 4 === 2 ? '#38bdf8' : '#ffffff';
      ctx.fillStyle = fColor;
      ctx.beginPath();
      ctx.arc(fx + windSway * 0.6, fy - 10, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 5. Airborne floating golden pollen & spore motes
  ctx.save();
  ctx.fillStyle = '#fef08a';
  for (let p = 0; p < 38; p++) {
    const px = (((p * 53.7 + time * 0.022) % w) + w) % w;
    const py = (((p * 81.3 - time * 0.01 + Math.sin(time * 0.0018 + p) * 16) % h) + h) % h;
    const sz = 1.2 + (p % 3) * 0.9;
    const alpha = 0.3 + 0.6 * Math.sin(time * 0.0025 + p);
    ctx.globalAlpha = Math.max(0.18, Math.min(0.9, alpha));
    ctx.beginPath();
    ctx.arc(px, py, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 2 — AUTUMN MEADOW
 * Cinematic autumn wonderland:
 * - Burnt ochre, amber, and golden-hour sky with warm horizon glow
 * - Layered mountain ridges cloaked in fiery orange & copper foliage
 * - Detailed autumn trees with multi-tier crimson/gold leaf masses and fallen leaf carpets
 * - Weathered stone walls, drifting falling leaves, and rich long environmental cast shadows
 */
export function renderAutumnMeadow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Rich autumn golden hour sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#7c2d12' },
    { stop: 0.35, color: '#c2410c' },
    { stop: 0.68, color: '#f59e0b' },
    { stop: 1.0, color: '#fef3c7' },
  ]);

  // Warm setting autumn sun
  const sunX = w * 0.78;
  const sunY = h * 0.22;
  drawVolumetricSun(ctx, sunX, sunY, 36, '#ffedd5', 'rgba(251, 146, 60, 0.45)', 'rgba(245, 158, 11, 0.2)', 220);
  drawVolumetricGodRays(ctx, sunX, sunY, h * 0.85, w, 'rgba(251, 146, 60, 0.24)', time);

  // 2. BACKGROUND: Distant ridges with autumn canopy haze
  withParallaxTier(ctx, 'background', () => {
    const gradBg = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.75);
    gradBg.addColorStop(0, '#9a3412');
    gradBg.addColorStop(0.5, '#ea580c');
    gradBg.addColorStop(1, '#fed7aa');

    ctx.fillStyle = gradBg;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 16) {
      const y = h * 0.6 + Math.sin(x * 0.004 + 0.8) * 34 + Math.cos(x * 0.009) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    drawLayeredMist(ctx, w, h * 0.63, 45, 'rgba(254, 215, 170, 0.45)', time, 0.005, 3);
  });

  // 3. MIDGROUND: Copper knolls, majestic autumn oaks with red/gold foliage, boulder outcrops
  withParallaxTier(ctx, 'midground', () => {
    const gradMid = ctx.createLinearGradient(0, h * 0.66, 0, h * 0.88);
    gradMid.addColorStop(0, '#78350f');
    gradMid.addColorStop(0.5, '#92400e');
    gradMid.addColorStop(1, '#451a03');

    ctx.fillStyle = gradMid;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = h * 0.71 + Math.sin(x * 0.0055 + 2.4) * 24;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Natural rocks
    drawNaturalRock(ctx, w * 0.25, h * 0.73, 30, 18, {
      baseColor: '#78716c',
      highColor: '#fed7aa',
      shadowColor: '#292524',
    });

    // Autumn trees (fiery amber, vermilion, gold)
    const sway = Math.sin(time * 0.002) * 3.5;
    drawOrganicTree(ctx, w * 0.16, h * 0.72, 58, {
      barkColor: '#3e2723',
      barkShadow: '#1a0e08',
      leafBase: '#7f1d1d',
      leafMid: '#b91c1c',
      leafHigh: '#f97316',
      sway,
    });

    drawOrganicTree(ctx, w * 0.68, h * 0.71, 54, {
      barkColor: '#451a03',
      barkShadow: '#1c0a02',
      leafBase: '#9a3412',
      leafMid: '#ea580c',
      leafHigh: '#fbbf24',
      sway: sway * 0.85,
    });

    drawOrganicTree(ctx, w * 0.84, h * 0.73, 50, {
      barkColor: '#3e2723',
      barkShadow: '#1a0e08',
      leafBase: '#78350f',
      leafMid: '#d97706',
      leafHigh: '#fde047',
      sway: sway * 1.1,
    });
  });

  // 4. FOREGROUND: Rich russet ground with fallen leaf carpet & rustic stone fence
  withParallaxTier(ctx, 'foreground', () => {
    const gradFore = ctx.createLinearGradient(0, h * 0.8, 0, h);
    gradFore.addColorStop(0, '#591c06');
    gradFore.addColorStop(0.4, '#431407');
    gradFore.addColorStop(1, '#1c0702');

    ctx.fillStyle = gradFore;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.82 + Math.sin(x * 0.007 + 1.1) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Fallen golden & crimson leaf carpets
    for (let l = 0; l < 40; l++) {
      const lx = (((l * 47.1) % w) + w) % w;
      const ly = h * 0.83 + Math.sin(lx * 0.007 + 1.1) * 16 + (l % 6) * 4;
      ctx.fillStyle = l % 3 === 0 ? '#dc2626' : l % 3 === 1 ? '#ea580c' : '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(lx, ly, 4, 2, l * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 5. Falling autumn leaves drifting in the wind
  ctx.save();
  for (let lf = 0; lf < 28; lf++) {
    const driftX = (((lf * 61.3 + time * 0.035 + Math.sin(time * 0.002 + lf) * 25) % (w + 40)) + (w + 40)) % (w + 40) - 20;
    const driftY = (((lf * 89.7 + time * 0.028) % h) + h) % h;
    const angle = time * 0.003 + lf;
    ctx.fillStyle = lf % 3 === 0 ? '#dc2626' : lf % 3 === 1 ? '#ea580c' : '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(driftX, driftY, 5, 2.5, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 3 — SUNSET MEADOW
 * Dramatic cinematic dusk landscape:
 * - Rich violet to vermilion and apricot sunset sky
 * - Mountain ridges casting long dramatic shadows with glowing golden rim lights
 * - Silhouetted organic trees and rocky promontories catching sunset highlights
 * - Evening fireflies, glowing trail markers, and dusk ambiance
 */
export function renderSunsetMeadow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Rich multi-stop sunset gradient
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#2e1065' },
    { stop: 0.32, color: '#6b21a8' },
    { stop: 0.58, color: '#be185d' },
    { stop: 0.82, color: '#ea580c' },
    { stop: 1.0, color: '#fed7aa' },
  ]);

  // Crimson-gold setting sun disc dipping into horizon
  const sunX = w * 0.5;
  const sunY = h * 0.58;
  drawVolumetricSun(ctx, sunX, sunY, 40, '#fef08a', 'rgba(244, 63, 94, 0.55)', 'rgba(234, 88, 12, 0.25)', 250);
  drawVolumetricGodRays(ctx, sunX, sunY, h * 0.9, w, 'rgba(251, 146, 60, 0.28)', time);

  // 2. BACKGROUND: Deep purple mountain ridges
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.62 + Math.sin(x * 0.004 + 0.4) * 36;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Sunset rim light along ridge crest
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.62 + Math.sin(x * 0.004 + 0.4) * 36;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    drawLayeredMist(ctx, w, h * 0.65, 45, 'rgba(217, 70, 239, 0.3)', time, 0.005, 2);
  });

  // 3. MIDGROUND: Rich dark violet ridge with silhouetted trees catching golden sunset rim light
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = h * 0.72 + Math.sin(x * 0.006 + 2.8) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Organic trees catching sunset rim lighting
    const sway = Math.sin(time * 0.0016) * 3;
    drawOrganicTree(ctx, w * 0.22, h * 0.72, 54, {
      barkColor: '#170529',
      barkShadow: '#0a0212',
      leafBase: '#1e053a',
      leafMid: '#4a044e',
      leafHigh: '#f97316', // Sunset rim light!
      sway,
    });

    drawOrganicTree(ctx, w * 0.78, h * 0.71, 52, {
      barkColor: '#170529',
      barkShadow: '#0a0212',
      leafBase: '#1e053a',
      leafMid: '#581c87',
      leafHigh: '#fbbf24',
      sway: sway * 0.9,
    });
  });

  // 4. FOREGROUND: Rich twilight knoll with glowing fireflies
  withParallaxTier(ctx, 'foreground', () => {
    const gradFore = ctx.createLinearGradient(0, h * 0.82, 0, h);
    gradFore.addColorStop(0, '#1c053a');
    gradFore.addColorStop(1, '#090117');

    ctx.fillStyle = gradFore;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.83 + Math.sin(x * 0.008 + 1.6) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Foreground rock
    drawNaturalRock(ctx, w * 0.35, h * 0.84, 32, 16, {
      baseColor: '#2e1065',
      highColor: '#f97316',
      shadowColor: '#0a0212',
    });
  });

  // 5. Evening fireflies emerging at dusk
  ctx.save();
  for (let ff = 0; ff < 30; ff++) {
    const fx = (((ff * 67.3 + Math.sin(time * 0.002 + ff) * 20) % w) + w) % w;
    const fy = h * 0.65 + (((ff * 89.1 + Math.cos(time * 0.0025 + ff) * 25) % (h * 0.3)) + (h * 0.3)) % (h * 0.3);
    const pulse = 0.3 + 0.7 * Math.sin(time * 0.004 + ff * 2);
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 8;
    ctx.globalAlpha = Math.max(0.15, pulse);
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
