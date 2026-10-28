import { 
  drawAtmosphericSky, 
  drawVolumetricSun, 
  drawLayeredMist, 
  drawCinematicStars, 
  withParallaxTier, 
  drawNaturalRock,
  drawVolumetricGodRays 
} from './worldUtils';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * WORLD 12 — CANDYLAND CONFECTION / ARTISAN SUGAR JEWEL REALM
 * Console-grade fantasy confectionery realm:
 * - Dreamy pastel magenta-to-rose-gold dusk with soft iridescent spun-sugar clouds
 * - Distant chocolate mountain peaks with glistening white royal-icing snowcaps and wafer strata
 * - Glazed strawberry cream rolling knolls, giant faceted sugar crystal spires with crystalline bevels,
 *   and twisted peppermint candy cane arches
 * - Foreground mirror-like glossy strawberry syrup river with specular reflection, candy pebble banks, and floating sugar dust
 */
export function renderCandyland(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Pastel confectionery sunset sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#4a044e' },
    { stop: 0.32, color: '#86198f' },
    { stop: 0.65, color: '#db2777' },
    { stop: 0.85, color: '#f472b6' },
    { stop: 1.0, color: '#fce7f3' },
  ]);

  // Soft spun-sugar marshmallow cloud decks
  ctx.save();
  ctx.fillStyle = 'rgba(255, 241, 242, 0.7)';
  const cloudOffset = (time * 0.005) % (w + 400) - 200;
  for (let c = 0; c < 3; c++) {
    const cx = (cloudOffset + c * 360) % (w + 300);
    const cy = h * (0.18 + c * 0.06);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 54, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 28, cy - 10, 44, 26, 0.1, 0, Math.PI * 2);
    ctx.ellipse(cx - 26, cy + 2, 38, 20, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. BACKGROUND: Sculpted dark chocolate cliffs with royal icing snowcaps
  withParallaxTier(ctx, 'background', () => {
    // Chocolate cliff ridge
    const chocGrad = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.75);
    chocGrad.addColorStop(0, '#2e1065');
    chocGrad.addColorStop(0.4, '#451a03');
    chocGrad.addColorStop(1, '#27170e');
    ctx.fillStyle = chocGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 18) {
      const y = h * 0.56 + Math.sin(x * 0.005 + 1.4) * 36 + Math.cos(x * 0.011) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Dripping white royal icing caps along the cliff crests
    ctx.fillStyle = '#fff1f2';
    for (let x = 10; x <= w; x += 28) {
      const y = h * 0.56 + Math.sin(x * 0.005 + 1.4) * 36 + Math.cos(x * 0.011) * 16;
      ctx.beginPath();
      ctx.arc(x, y + 2, 7, Math.PI, 0);
      ctx.lineTo(x + 7, y + 10);
      ctx.arc(x, y + 10, 7, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
    }

    // Sugar mist bank in the valley
    drawLayeredMist(ctx, w, h * 0.62, 45, 'rgba(251, 207, 232, 0.35)', time, 0.006, 3);
  });

  // 3. MIDGROUND: Glazed strawberry cream knolls, faceted sugar spires, & candy cane arches
  withParallaxTier(ctx, 'midground', () => {
    // Glazed strawberry cream rolling knolls
    const knollGrad = ctx.createLinearGradient(0, h * 0.68, 0, h * 0.88);
    knollGrad.addColorStop(0, '#9d174d');
    knollGrad.addColorStop(0.5, '#be185d');
    knollGrad.addColorStop(1, '#701a75');
    ctx.fillStyle = knollGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.72 + Math.sin(x * 0.006 + 2.8) * 24 + Math.cos(x * 0.014) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Twisted peppermint candy cane arches in midground
    const drawCandyCane = (cx: number, cy: number, height: number, flip: boolean) => {
      ctx.save();
      ctx.translate(cx, cy);
      if (flip) ctx.scale(-1, 1);

      // Candy cane hook
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -height);
      ctx.arc(16, -height, 16, Math.PI, 0, false);
      ctx.lineTo(32, -height + 14);
      ctx.stroke();

      // Red spiral stripes along candy cane
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#e11d48';
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -height);
      ctx.arc(16, -height, 16, Math.PI, 0, false);
      ctx.lineTo(32, -height + 14);
      ctx.stroke();

      ctx.restore();
    };

    drawCandyCane(w * 0.12, h * 0.76, 55, false);
    drawCandyCane(w * 0.88, h * 0.75, 60, true);

    // Giant Faceted Artisan Sugar Crystal Geode Spires (multi-faceted with sharp bevels and glowing refraction)
    const drawSugarCrystal = (sx: number, sy: number, sw: number, sh: number, hueColor: string, glowCol: string) => {
      ctx.save();
      // Outer crystal shadow & facet structure
      const crystalGrad = ctx.createLinearGradient(sx - sw * 0.5, sy, sx + sw * 0.5, sy - sh);
      crystalGrad.addColorStop(0, hueColor);
      crystalGrad.addColorStop(0.45, '#ffffff');
      crystalGrad.addColorStop(0.75, hueColor);
      crystalGrad.addColorStop(1, '#ffffff');

      ctx.fillStyle = crystalGrad;
      ctx.shadowColor = glowCol;
      ctx.shadowBlur = 18;

      // Faceted polygon outline (6-sided pointed gemstone spire)
      ctx.beginPath();
      ctx.moveTo(sx - sw * 0.5, sy);
      ctx.lineTo(sx - sw * 0.35, sy - sh * 0.75);
      ctx.lineTo(sx, sy - sh);
      ctx.lineTo(sx + sw * 0.35, sy - sh * 0.75);
      ctx.lineTo(sx + sw * 0.5, sy);
      ctx.closePath();
      ctx.fill();

      // Internal facet bevel lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy - sh);
      ctx.lineTo(sx, sy);
      ctx.moveTo(sx - sw * 0.35, sy - sh * 0.75);
      ctx.lineTo(sx, sy - sh * 0.4);
      ctx.lineTo(sx + sw * 0.35, sy - sh * 0.75);
      ctx.stroke();

      // Specular gleam glint at apex
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy - sh, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    drawSugarCrystal(w * 0.24, h * 0.74, 26, 75, '#f43f5e', 'rgba(244, 63, 94, 0.5)');
    drawSugarCrystal(w * 0.5, h * 0.71, 32, 90, '#ec4899', 'rgba(236, 72, 153, 0.55)');
    drawSugarCrystal(w * 0.76, h * 0.73, 24, 70, '#38bdf8', 'rgba(56, 189, 248, 0.45)');
  });

  // 4. FOREGROUND: Glossy mirror strawberry syrup river, candy pebble shores, & sparkling diamond dust
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.82;

    // Candy pebble shoreline
    const shoreGrad = ctx.createLinearGradient(0, fgY, 0, h);
    shoreGrad.addColorStop(0, '#db2777');
    shoreGrad.addColorStop(0.35, '#be185d');
    shoreGrad.addColorStop(1, '#831843');
    ctx.fillStyle = shoreGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = fgY + Math.sin(x * 0.008 + 1.2) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Glossy mirror-like strawberry syrup river surface
    const riverY = fgY + 14;
    const riverGrad = ctx.createLinearGradient(0, riverY, 0, h);
    riverGrad.addColorStop(0, '#f43f5e');
    riverGrad.addColorStop(0.5, '#e11d48');
    riverGrad.addColorStop(1, '#9f1239');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(0, riverY, w, h - riverY);

    // Specular candy glaze light reflections along the river
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let rx = 15; rx < w; rx += 45) {
      const rw = 25 + Math.sin(rx + time * 0.002) * 10;
      ctx.fillRect(rx, riverY + 3, rw, 2.5);
    }
    ctx.restore();

    // Glossy gummy gemstone pebbles along the riverbank
    const pebbles = [
      { x: w * 0.15, y: riverY - 4, r: 6, col: '#fef08a' },
      { x: w * 0.32, y: riverY - 2, r: 8, col: '#a7f3d0' },
      { x: w * 0.68, y: riverY - 5, r: 7, col: '#67e8f9' },
      { x: w * 0.85, y: riverY - 3, r: 9, col: '#f472b6' },
    ];
    pebbles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.col;
      ctx.shadowColor = p.col;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * 1.2, p.r * 0.8, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Highlight dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Drifting sparkling diamond sugar dust motes
    ctx.save();
    for (let p = 0; p < 42; p++) {
      const px = (((p * 51.3 + time * 0.02) % w) + w) % w;
      const py = (((p * 77.9 - time * 0.015 + Math.sin(time * 0.002 + p) * 16) % h) + h) % h;
      ctx.fillStyle = p % 2 === 0 ? '#fbcfe8' : '#ffffff';
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 6;
      ctx.globalAlpha = 0.4 + 0.6 * Math.sin(time * 0.004 + p);
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * WORLD 13 — GOLDEN LEGEND / EL DORADO
 * Console-grade celestial golden endgame realm:
 * - Radiant celestial golden dusk sky with divine sunburst corona and dense celestial starfield
 * - Distant stepped Mesoamerican ziggurat temple acropolis rising into golden clouds
 * - Monumental floating gilded megaliths with inlaid lapis lazuli runes and ceremonial brazier bowls
 * - Foreground sacred golden dais with polished reflective gold surface, relief borders, and drifting sun embers
 */
export function renderGoldenLegend(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Celestial golden dusk sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#1c1002' },
    { stop: 0.35, color: '#451a03' },
    { stop: 0.65, color: '#78350f' },
    { stop: 0.85, color: '#b45309' },
    { stop: 1.0, color: '#f59e0b' },
  ]);

  drawCinematicStars(ctx, w, h, 85, time, 99);

  // Divine radiant celestial sunbeams / god rays
  drawVolumetricGodRays(ctx, w * 0.5, h * 0.15, h * 0.9, w, 'rgba(254, 240, 138, 0.35)', time);

  // 2. BACKGROUND: Majestic stepped ziggurat acropolis & golden clouds
  withParallaxTier(ctx, 'background', () => {
    // Distant mountain ridge
    ctx.fillStyle = '#291404';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.52 + Math.sin(x * 0.005 + 1.2) * 34;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Grand Mesoamerican Stepped Ziggurat Temple in center
    const zx = w * 0.5;
    const zy = h * 0.62;
    const zSteps = 5;

    ctx.fillStyle = '#451a03';
    for (let s = 0; s < zSteps; s++) {
      const stepRatio = s / zSteps;
      const stepW = 180 * (1 - stepRatio * 0.7);
      const stepH = 14;
      const stepY = zy + s * stepH;
      ctx.fillRect(zx - stepW * 0.5, stepY, stepW, stepH);

      // Inlaid gold leaf trim along each terrace
      ctx.fillStyle = '#d97706';
      ctx.fillRect(zx - stepW * 0.5, stepY, stepW, 2.5);
      ctx.fillStyle = '#451a03';
    }

    // Sacred High Sun Temple atop Ziggurat with golden dome
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 18;
    ctx.fillRect(zx - 24, zy - 16, 48, 16);
    // Temple arched portal
    ctx.fillStyle = '#1c1002';
    ctx.beginPath();
    ctx.arc(zx, zy - 4, 8, Math.PI, 0);
    ctx.fill();
    ctx.restore();

    // Golden dust mist bank
    drawLayeredMist(ctx, w, h * 0.6, 50, 'rgba(245, 158, 11, 0.28)', time, 0.005, 5);
  });

  // 3. MIDGROUND: Monumental floating gilded megaliths with inlaid lapis lazuli runes
  withParallaxTier(ctx, 'midground', () => {
    const floatingMegaliths = [
      { x: w * 0.18, y: h * 0.66 + Math.sin(time * 0.0015) * 8, w: 90, h: 28 },
      { x: w * 0.82, y: h * 0.64 + Math.cos(time * 0.0018) * 8, w: 105, h: 32 },
    ];

    floatingMegaliths.forEach(plat => {
      ctx.save();
      // Inlaid solid gold stone block with beveled gradient
      const platGrad = ctx.createLinearGradient(plat.x - plat.w * 0.5, plat.y, plat.x + plat.w * 0.5, plat.y + plat.h);
      platGrad.addColorStop(0, '#fde047');
      platGrad.addColorStop(0.35, '#f59e0b');
      platGrad.addColorStop(0.7, '#b45309');
      platGrad.addColorStop(1.0, '#78350f');

      ctx.fillStyle = platGrad;
      ctx.beginPath();
      ctx.roundRect(plat.x - plat.w * 0.5, plat.y, plat.w, plat.h, [6, 6, 3, 3]);
      ctx.fill();

      // Top specular highlight rim
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(plat.x - plat.w * 0.48, plat.y);
      ctx.lineTo(plat.x + plat.w * 0.48, plat.y);
      ctx.stroke();

      // Inlaid glowing lapis lazuli & turquoise sacred hieroglyphs
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      for (let g = 0; g < 4; g++) {
        const gx = plat.x - plat.w * 0.35 + g * (plat.w * 0.22);
        ctx.fillRect(gx, plat.y + 8, 9, 9);
      }

      // Ceremonial brazier flame atop platform
      const bzX = plat.x;
      const bzY = plat.y - 4;
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(bzX, bzY, 8, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(bzX, bzY - 6, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  });

  // 4. FOREGROUND: Sacred golden dais platform with polished gold reflection & drifting embers
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.8;
    const daisGrad = ctx.createLinearGradient(0, fgY, 0, h);
    daisGrad.addColorStop(0, '#78350f');
    daisGrad.addColorStop(0.3, '#451a03');
    daisGrad.addColorStop(1, '#1c1002');
    ctx.fillStyle = daisGrad;
    ctx.fillRect(0, fgY, w, h - fgY);

    // Polished gold surface top plate with mirror specular gleam
    ctx.save();
    const goldPlateGrad = ctx.createLinearGradient(0, fgY, w, fgY);
    goldPlateGrad.addColorStop(0, '#b45309');
    goldPlateGrad.addColorStop(0.25, '#f59e0b');
    goldPlateGrad.addColorStop(0.5, '#fef08a');
    goldPlateGrad.addColorStop(0.75, '#f59e0b');
    goldPlateGrad.addColorStop(1.0, '#b45309');
    ctx.fillStyle = goldPlateGrad;
    ctx.fillRect(0, fgY, w, 10);
    ctx.restore();

    // Carved hieroglyphic stone relief blocks along front
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.8;
    for (let x = 0; x <= w; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, fgY + 10);
      ctx.lineTo(x, h);
      ctx.stroke();

      // Glyphs in each block
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(x + 18, fgY + 30, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating divine golden sun embers rising into the air
    ctx.save();
    ctx.fillStyle = '#fef08a';
    for (let p = 0; p < 45; p++) {
      const px = (((p * 47.9 + time * 0.02) % w) + w) % w;
      const py = (((h - (time * 0.035 + p * 25) % h)) + h) % h;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.3 + 0.7 * Math.sin(time * 0.003 + p);
      ctx.beginPath();
      ctx.arc(px, py, 1.6 + (p % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * WORLD 14 — CYBERPUNK MEGACITY / NEO-METROPOLIS
 * Console-grade high-tech metropolis:
 * - High-tech nocturnal urban sky with perpetual neon-lit smog and purple/cyan atmospheric gradient
 * - Distant endless skyline of towering super-structures fading into the neon horizon, flashing aviation beacons,
 *   and soaring aerodyne transport streams
 * - Massive brutalist mega-skyscrapers with articulated mechanical architecture: exterior conduit pipes, elevator shafts,
 *   cooling vents, maintenance gantries, glowing holographic commercial billboards (cyan, magenta, yellow neon), animated digital displays
 * - Multi-tiered elevated transit skybridges with pulsing vehicle headlights and taillights
 * - Foreground rain-slicked rooftop gantry with metal diamond-plate textures, safety railings, and diagonal neon rain
 */
export function renderCyberpunk(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Deep neon smog twilight
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#090514' },
    { stop: 0.35, color: '#18072b' },
    { stop: 0.7, color: '#27083d' },
    { stop: 1.0, color: '#3b0764' },
  ]);

  // Distant glowing neon city haze dome
  ctx.save();
  const cityHaze = safeCreateRadialGradient(ctx, w * 0.5, h * 0.65, 30, w * 0.5, h * 0.65, Math.max(35, w * 0.75));
  if (cityHaze) {
    cityHaze.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
    cityHaze.addColorStop(0.5, 'rgba(244, 63, 94, 0.22)');
    cityHaze.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cityHaze;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // 2. BACKGROUND: Endless skyline of distant super-structures & aviation beacons
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#0b0217';
    const distantBuildings = [
      { x: w * 0.04, w: w * 0.16, h: h * 0.48 },
      { x: w * 0.22, w: w * 0.18, h: h * 0.58 },
      { x: w * 0.44, w: w * 0.15, h: h * 0.45 },
      { x: w * 0.62, w: w * 0.22, h: h * 0.55 },
      { x: w * 0.86, w: w * 0.14, h: h * 0.5 },
    ];
    distantBuildings.forEach(b => {
      ctx.fillRect(b.x, h - b.h, b.w, b.h);
      // Rooftop aviation warning beacons blinking
      const blink = Math.sin(time * 0.005 + b.x) > 0 ? 1 : 0.2;
      ctx.fillStyle = '#ef4444';
      ctx.globalAlpha = blink;
      ctx.beginPath();
      ctx.arc(b.x + b.w * 0.5, h - b.h - 12, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#0b0217';
    });

    // Flying aerodyne transport stream (high altitude traffic trails)
    const streamY = h * 0.34;
    for (let v = 0; v < 3; v++) {
      const vx = ((time * 0.08 + v * 140) % (w + 100)) - 50;
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(vx, streamY + v * 18, 12, 2);
    }
  });

  // 3. MIDGROUND: Massive mega-towers with articulated architecture, holographic neon ads, & skybridges
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#05020a';
    const midTowers = [
      { x: w * 0.06, w: w * 0.28, h: h * 0.62 },
      { x: w * 0.4, w: w * 0.26, h: h * 0.66 },
      { x: w * 0.72, w: w * 0.28, h: h * 0.58 },
    ];

    midTowers.forEach((t, tIdx) => {
      // Main tower monolith with metallic edge highlights
      ctx.fillStyle = '#080312';
      ctx.fillRect(t.x, h - t.h, t.w, t.h);

      // Tower structural columns / vertical exterior pipes
      ctx.fillStyle = '#130824';
      ctx.fillRect(t.x, h - t.h, 6, t.h);
      ctx.fillRect(t.x + t.w - 6, h - t.h, 6, t.h);

      // Lit office window matrices (cyan and magenta micro-lights)
      ctx.save();
      for (let wy = h - t.h + 24; wy < h - 40; wy += 15) {
        for (let wx = t.x + 12; wx < t.x + t.w - 12; wx += 13) {
          const randLight = Math.sin(wx * 2.3 + wy * 1.7 + tIdx);
          if (randLight > 0.15) {
            ctx.fillStyle = randLight > 0.55 ? '#00f0ff' : '#f43f5e';
            ctx.globalAlpha = 0.7;
            ctx.fillRect(wx, wy, 5, 7);
          }
        }
      }
      ctx.restore();

      // Giant Glowing Holographic Billboard on tower facade
      ctx.save();
      const signCol = tIdx % 2 === 0 ? '#00f0ff' : '#f43f5e';
      const signY = h - t.h + 38;
      const signW = t.w - 24;
      const signH = 46;

      // Holographic glowing border
      ctx.strokeStyle = signCol;
      ctx.shadowColor = signCol;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 2.0;
      ctx.strokeRect(t.x + 12, signY, signW, signH);

      // Stylized cyberpunk glyphs / brand logo inside sign
      ctx.fillStyle = signCol;
      ctx.fillRect(t.x + 20, signY + 12, signW - 16, 4);
      ctx.fillRect(t.x + 20, signY + 22, signW * 0.6, 4);
      ctx.fillRect(t.x + 20, signY + 32, signW * 0.8, 3);
      ctx.restore();
    });

    // Elevated transit skybridge connecting the mega-towers with moving vehicles
    const bridgeY = h * 0.74;
    ctx.fillStyle = '#0d041a';
    ctx.fillRect(0, bridgeY, w, 16);

    // Bridge truss structure
    ctx.strokeStyle = '#27083d';
    ctx.lineWidth = 2;
    for (let bx = 0; bx < w; bx += 30) {
      ctx.beginPath();
      ctx.moveTo(bx, bridgeY);
      ctx.lineTo(bx + 15, bridgeY + 16);
      ctx.lineTo(bx + 30, bridgeY);
      ctx.stroke();
    }

    // Moving flying traffic across the skybridge
    const carX = (time * 0.1) % (w + 120) - 60;
    ctx.save();
    // Cyan headlights
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.fillRect(carX, bridgeY + 4, 18, 5);
    // Red taillights
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.fillRect(carX - 10, bridgeY + 5, 8, 4);
    ctx.restore();
  });

  // 4. FOREGROUND: Rain-slicked rooftop gantry, safety railings, & atmospheric neon rain
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.86;
    ctx.fillStyle = '#020105';
    ctx.fillRect(0, fgY, w, h - fgY);

    // Diamond-plate metal deck pattern
    ctx.strokeStyle = '#1e0836';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= w; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, fgY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Rooftop Safety Railing along the edge
    ctx.strokeStyle = '#3b0764';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, fgY - 14);
    ctx.lineTo(w, fgY - 14);
    ctx.moveTo(0, fgY - 6);
    ctx.lineTo(w, fgY - 6);
    ctx.stroke();

    for (let rx = 10; rx < w; rx += 45) {
      ctx.beginPath();
      ctx.moveTo(rx, fgY);
      ctx.lineTo(rx, fgY - 16);
      ctx.stroke();
    }

    // Neon edge trim on the gantry
    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, fgY);
    ctx.lineTo(w, fgY);
    ctx.stroke();
    ctx.restore();

    // Diagonal neon rain streaks slicing across the city
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1.4;
    for (let r = 0; r < 50; r++) {
      const rx = (((r * 43.7 + time * 0.05) % w) + w) % w;
      const ry = (((time * 0.14 + r * 28) % h) + h) % h;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 15);
      ctx.stroke();
    }
    ctx.restore();
  });
}
