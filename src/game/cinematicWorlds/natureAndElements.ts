import { 
  drawAtmosphericSky, 
  drawVolumetricSun, 
  drawLayeredMist, 
  drawCinematicStars, 
  withParallaxTier, 
  drawOrganicPine, 
  drawOrganicPalm, 
  drawNaturalRock,
  drawVolumetricGodRays
} from './worldUtils';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * WORLD 3 — WINTER / FROZEN ARCTIC TUNDRA
 * Console-grade alpine winter environment:
 * - Sub-zero twilight sky with radiant dancing Aurora Borealis curtains
 * - Distant jagged snow-covered glacial peaks with cold aerial haze
 * - Midground alpine ridge with organic snow-laden fir trees and frozen rock crags
 * - Foreground permafrost snowbanks with soft blue subsurface light, ice crystal formations, and dense drifting snowfall
 */
export function renderWinter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Deep arctic twilight sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#02182b' },
    { stop: 0.35, color: '#073359' },
    { stop: 0.7, color: '#0c4a7a' },
    { stop: 1.0, color: '#1e6896' },
  ]);

  // Crisp stars in clear freezing air
  drawCinematicStars(ctx, w, h, 85, time, 33);

  // Dynamic Aurora Borealis curtains dancing across the northern sky
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let a = 0; a < 3; a++) {
    const aurGrad = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.48);
    aurGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    aurGrad.addColorStop(0.45, a === 1 ? 'rgba(52, 211, 153, 0.48)' : 'rgba(56, 189, 248, 0.38)');
    aurGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aurGrad;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.12);
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.24 + Math.sin(x * 0.007 + time * 0.001 + a * 2.2) * 38;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(0, h * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 2. BACKGROUND: Distant jagged glacial peaks with fresh powder snow
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#082f49';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 25) {
      const y = h * 0.54 + Math.sin(x * 0.004 + 1.5) * 48 + Math.cos(x * 0.011) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Glacial snow cover on mountain flanks
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    for (let x = 0; x <= w; x += 25) {
      const y = h * 0.54 + Math.sin(x * 0.004 + 1.5) * 48 + Math.cos(x * 0.011) * 22;
      if (y < h * 0.56) {
        ctx.lineTo(x, y);
        ctx.lineTo(x + 12, y + 14);
        ctx.lineTo(x - 12, y + 14);
      }
    }
    ctx.fill();

    drawLayeredMist(ctx, w, h * 0.6, 50, 'rgba(186, 230, 253, 0.4)', time, 0.005, 5);
  });

  // 3. MIDGROUND: Pine-forested alpine ridge with organic snow-laden conifers
  withParallaxTier(ctx, 'midground', () => {
    const gradMid = ctx.createLinearGradient(0, h * 0.68, 0, h * 0.86);
    gradMid.addColorStop(0, '#0c4a6e');
    gradMid.addColorStop(0.5, '#075985');
    gradMid.addColorStop(1, '#082f49');

    ctx.fillStyle = gradMid;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = h * 0.71 + Math.sin(x * 0.006 + 3.0) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Natural icy rocks
    drawNaturalRock(ctx, w * 0.28, h * 0.72, 32, 18, {
      baseColor: '#38bdf8',
      highColor: '#f0f9ff',
      shadowColor: '#0c4a6e',
    });

    // Organic snow-laden pine trees (NEVER simple triangles!)
    const pineSway = Math.sin(time * 0.0015) * 2;
    drawOrganicPine(ctx, w * 0.08, h * 0.72, 62, {
      barkColor: '#1e293b',
      needleBase: '#082f49',
      needleHigh: '#0284c7',
      snow: true,
      sway: pineSway,
    });

    drawOrganicPine(ctx, w * 0.2, h * 0.71, 54, {
      barkColor: '#1e293b',
      needleBase: '#0c4a6e',
      needleHigh: '#38bdf8',
      snow: true,
      sway: pineSway * 0.85,
    });

    drawOrganicPine(ctx, w * 0.72, h * 0.71, 68, {
      barkColor: '#0f172a',
      needleBase: '#082f49',
      needleHigh: '#0ea5e9',
      snow: true,
      sway: pineSway * 1.1,
    });

    drawOrganicPine(ctx, w * 0.88, h * 0.72, 58, {
      barkColor: '#1e293b',
      needleBase: '#082f49',
      needleHigh: '#38bdf8',
      snow: true,
      sway: pineSway * 0.95,
    });
  });

  // 4. FOREGROUND: Permafrost snowdrift terrain with blue subsurface ice scattering
  withParallaxTier(ctx, 'foreground', () => {
    const gradFore = ctx.createLinearGradient(0, h * 0.8, 0, h);
    gradFore.addColorStop(0, '#e0f2fe');
    gradFore.addColorStop(0.35, '#bae6fd');
    gradFore.addColorStop(1, '#0284c7');

    ctx.fillStyle = gradFore;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.82 + Math.sin(x * 0.008 + 0.5) * 16 + Math.cos(x * 0.02) * 5;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Frozen ice crystals & boulder
    drawNaturalRock(ctx, w * 0.45, h * 0.84, 38, 20, {
      baseColor: '#7dd3fc',
      highColor: '#ffffff',
      shadowColor: '#0369a1',
    });
  });

  // 5. Volumetric realistic falling snow particles with wind drift
  ctx.save();
  ctx.fillStyle = '#ffffff';
  for (let s = 0; s < 55; s++) {
    const driftX = (((s * 41.7 + time * 0.045 + Math.sin(time * 0.002 + s) * 15) % (w + 40)) + (w + 40)) % (w + 40) - 20;
    const driftY = (((s * 73.3 + time * 0.065) % h) + h) % h;
    const sz = 1.2 + (s % 4) * 0.9;
    ctx.globalAlpha = 0.35 + 0.55 * Math.sin(time * 0.003 + s);
    ctx.beginPath();
    ctx.arc(driftX, driftY, sz, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 6 — TROPICAL SUNSET BEACH
 * Console-grade coastal shoreline:
 * - Rich sunset sky with warm horizon glow and god rays
 * - Multi-stop ocean depth gradient with undulating whitewash surf waves and specular sun reflections
 * - Organic curved palm trees with segmented fibrous bark and detailed drooping fronds
 * - Wet reflective shoreline sand, tidal boulders, and drifting sea spray
 */
export function renderBeach(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Radiant tropical sunset sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#1e1b4b' },
    { stop: 0.28, color: '#581c87' },
    { stop: 0.55, color: '#c026d3' },
    { stop: 0.78, color: '#ea580c' },
    { stop: 1.0, color: '#fef08a' },
  ]);

  // Sinking golden sunset sun
  const sunX = w * 0.5;
  const sunY = h * 0.54;
  drawVolumetricSun(ctx, sunX, sunY, 38, '#ffffff', 'rgba(254, 240, 138, 0.65)', 'rgba(249, 115, 22, 0.3)', 240);
  drawVolumetricGodRays(ctx, sunX, sunY, h * 0.85, w, 'rgba(254, 240, 138, 0.25)', time);

  // 2. CELESTIAL & DISTANT: Distant tropical atoll islands on horizon
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#4a044e';
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.64);
    ctx.quadraticCurveTo(w * 0.18, h * 0.6, w * 0.32, h * 0.64);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w * 0.68, h * 0.64);
    ctx.quadraticCurveTo(w * 0.82, h * 0.59, w * 0.95, h * 0.64);
    ctx.fill();
  });

  // 3. MIDGROUND: Reflective tropical ocean with depth gradient, wave whitewash & specular reflection
  const horizonY = h * 0.64;
  const oceanGrad = ctx.createLinearGradient(0, horizonY, 0, h * 0.86);
  oceanGrad.addColorStop(0, '#0e7490');
  oceanGrad.addColorStop(0.35, '#155e75');
  oceanGrad.addColorStop(0.7, '#164e63');
  oceanGrad.addColorStop(1, '#083344');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, horizonY, w, h * 0.22);

  // Specular golden sunset reflection path across undulating water
  ctx.save();
  for (let r = 0; r < 16; r++) {
    const ry = horizonY + r * 12;
    const rw = 20 + r * 18;
    const waveWobble = Math.sin(time * 0.003 + r * 0.8) * 8;
    const alpha = 0.65 - r * 0.035;
    ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0.1, alpha)})`;
    ctx.fillRect(sunX - rw * 0.5 + waveWobble, ry, rw, 3.5);
  }
  ctx.restore();

  // Breaking surf waves with foam crests
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2.2;
  for (let wv = 0; wv < 4; wv++) {
    const wy = horizonY + 24 + wv * 26 + Math.sin(time * 0.002 + wv) * 4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 15) {
      const cy = wy + Math.sin(x * 0.02 + time * 0.002 + wv * 1.5) * 4;
      if (x === 0) ctx.moveTo(x, cy);
      else ctx.lineTo(x, cy);
    }
    ctx.stroke();
  }

  // 4. FOREGROUND: Shoreline with wet reflective sand, tidal rocks, driftwood, and curved palm trees
  withParallaxTier(ctx, 'foreground', () => {
    // Wet sand slope
    const sandGrad = ctx.createLinearGradient(0, h * 0.82, 0, h);
    sandGrad.addColorStop(0, '#d97706');
    sandGrad.addColorStop(0.35, '#b45309');
    sandGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = h * 0.82 + Math.sin(x * 0.006 + 1.2) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Wet sand mirror reflection sheen
    ctx.fillStyle = 'rgba(254, 215, 170, 0.35)';
    ctx.fillRect(0, h * 0.82, w, 16);

    // Tidal rocks & driftwood
    drawNaturalRock(ctx, w * 0.35, h * 0.84, 30, 16, {
      baseColor: '#78716c',
      highColor: '#fed7aa',
      shadowColor: '#292524',
    });

    // Organic curved palm trees (NEVER simple straight lines!)
    const palmSway = Math.sin(time * 0.0022) * 6;
    drawOrganicPalm(ctx, w * 0.08, h * 0.86, 125, {
      curve: 35,
      windSway: palmSway,
      barkColor: '#78350f',
      frondBase: '#14532d',
      frondHigh: '#86efac',
    });

    drawOrganicPalm(ctx, w * 0.92, h * 0.87, 135, {
      curve: -40,
      windSway: palmSway * 0.9,
      barkColor: '#78350f',
      frondBase: '#166534',
      frondHigh: '#4ade80',
    });
  });

  // 5. Marine sea spray motes & twilight sparkle particles
  ctx.save();
  ctx.fillStyle = '#fef08a';
  for (let p = 0; p < 32; p++) {
    const px = (((p * 57.3 + time * 0.02) % w) + w) % w;
    const py = (((p * 81.9 - time * 0.012 + Math.sin(time * 0.002 + p) * 14) % h) + h) % h;
    ctx.globalAlpha = 0.3 + 0.5 * Math.sin(time * 0.003 + p);
    ctx.beginPath();
    ctx.arc(px, py, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 8 — VOLCANIC CALDERA
 * Console-grade apocalyptic volcanic environment:
 * - Smoldering ash-choked blood-red and sulfur sky with billowing dark smoke plumes
 * - Jagged obsidian caldera ridges with red-hot thermal fissures
 * - Meandering glowing molten lava river with white-hot core, bubbling surface, and cooled crust plates
 * - Drifting fiery ember sparks and atmospheric heat distortion glow
 */
export function renderVolcano(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Fiery volcanic sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#180303' },
    { stop: 0.35, color: '#450a0a' },
    { stop: 0.68, color: '#7f1d1d' },
    { stop: 1.0, color: '#b91c1c' },
  ]);

  // Billowing volumetric dark smoke plumes rising into the sky
  ctx.save();
  for (let s = 0; s < 5; s++) {
    const sx = w * (0.16 + s * 0.18);
    const sy = h * (0.28 + s * 0.08) - (time * 0.018 + s * 35) % (h * 0.48);
    const rad = 55 + s * 16;
    const smokeGrad = safeCreateRadialGradient(ctx, sx, sy, 12, sx, sy, rad);
    if (smokeGrad) {
      smokeGrad.addColorStop(0, 'rgba(24, 3, 3, 0.7)');
      smokeGrad.addColorStop(0.55, 'rgba(69, 10, 10, 0.4)');
      smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 2. BACKGROUND: Jagged obsidian caldera ridges with red-hot fissure glows
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#1c0505';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 18) {
      const y = h * 0.56 + Math.sin(x * 0.007 + 1.1) * 46 + Math.cos(x * 0.016) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Glowing magma rim along distant volcano crest
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 18) {
      const y = h * 0.56 + Math.sin(x * 0.007 + 1.1) * 46 + Math.cos(x * 0.016) * 22;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    drawLayeredMist(ctx, w, h * 0.6, 50, 'rgba(239, 68, 68, 0.35)', time, 0.006, 4);
  });

  // 3. MIDGROUND: Basalt terraces & glowing molten lava flows with thermal gradient
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#260606';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 14) {
      const y = h * 0.7 + Math.sin(x * 0.008 + 2.8) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Meandering Molten Lava River (White-hot core -> Orange -> Crimson thermal gradient)
    ctx.save();
    const lavaGrad = ctx.createLinearGradient(0, h * 0.7, 0, h * 0.76);
    lavaGrad.addColorStop(0, '#fef08a');
    lavaGrad.addColorStop(0.35, '#f97316');
    lavaGrad.addColorStop(0.8, '#dc2626');
    lavaGrad.addColorStop(1.0, '#7f1d1d');
    ctx.fillStyle = lavaGrad;

    ctx.beginPath();
    ctx.moveTo(0, h * 0.73);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.72 + Math.sin(x * 0.012 + time * 0.002) * 8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h * 0.76);
    ctx.lineTo(0, h * 0.76);
    ctx.closePath();
    ctx.fill();

    // Floating cooled black crust plates on lava
    ctx.fillStyle = '#0f0202';
    for (let c = 0; c < 8; c++) {
      const cx = (((c * 73 + time * 0.012) % w) + w) % w;
      const cy = h * 0.73 + Math.sin(cx * 0.012) * 6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 18, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Basalt crags
    drawNaturalRock(ctx, w * 0.24, h * 0.71, 38, 22, {
      baseColor: '#260606',
      highColor: '#ef4444',
      shadowColor: '#0a0101',
    });
  });

  // 4. FOREGROUND: Cracked volcanic ground with glowing thermal fissures & dark obsidian boulders
  withParallaxTier(ctx, 'foreground', () => {
    const gradFore = ctx.createLinearGradient(0, h * 0.81, 0, h);
    gradFore.addColorStop(0, '#1c0404');
    gradFore.addColorStop(0.5, '#0a0101');
    gradFore.addColorStop(1, '#000000');

    ctx.fillStyle = gradFore;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.82 + Math.sin(x * 0.01 + 0.4) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Glowing thermal ground fissures
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(w * 0.18, h * 0.86);
    ctx.lineTo(w * 0.26, h * 0.89);
    ctx.lineTo(w * 0.32, h * 0.87);
    ctx.lineTo(w * 0.42, h * 0.91);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w * 0.62, h * 0.87);
    ctx.lineTo(w * 0.72, h * 0.9);
    ctx.lineTo(w * 0.84, h * 0.88);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Obsidian boulders
    drawNaturalRock(ctx, w * 0.12, h * 0.84, 40, 24, {
      baseColor: '#1c0505',
      highColor: '#dc2626',
      shadowColor: '#000000',
    });
    drawNaturalRock(ctx, w * 0.82, h * 0.85, 46, 28, {
      baseColor: '#1c0505',
      highColor: '#f97316',
      shadowColor: '#000000',
    });
  });

  // 5. Rising fiery embers & glowing volcanic ash particles
  ctx.save();
  for (let e = 0; e < 45; e++) {
    const ex = (((e * 53.7 + Math.sin(time * 0.002 + e) * 20) % w) + w) % w;
    const ey = (((e * 81.3 - time * 0.045) % h) + h) % h;
    const pulse = 0.4 + 0.6 * Math.sin(time * 0.004 + e * 1.5);
    ctx.fillStyle = e % 3 === 0 ? '#fef08a' : e % 3 === 1 ? '#f97316' : '#ef4444';
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 8;
    ctx.globalAlpha = Math.max(0.2, pulse);
    ctx.beginPath();
    ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
