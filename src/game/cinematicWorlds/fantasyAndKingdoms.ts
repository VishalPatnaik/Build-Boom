import { 
  drawAtmosphericSky, 
  drawVolumetricSun, 
  drawLayeredMist, 
  drawCinematicStars, 
  withParallaxTier, 
  drawOrganicTree, 
  drawNaturalRock,
  drawVolumetricGodRays 
} from './worldUtils';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * WORLD 7 — ANCIENT STONE CITADEL / MOUNTAIN FORTRESS
 * Console-grade medieval gothic fortress:
 * - Moonlit gothic twilight sky with dense starfield and luminous volumetric full moon
 * - Distant rugged mountain silhouettes with snow-capped crests and low-lying fortress fog
 * - Multi-tiered stone fortress built into the rock face: stone block courses, machicolated corbels,
 *   conical slate-roofed flanker bastions, fluttering heraldic banners, lit arrow-slits with warm torch spill
 * - Foreground stone parapet with carved balustrades, burning iron wall braziers, and floating embers
 */
export function renderCastle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Gothic night sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#020617' },
    { stop: 0.35, color: '#0f172a' },
    { stop: 0.7, color: '#1e293b' },
    { stop: 1.0, color: '#334155' },
  ]);

  drawCinematicStars(ctx, w, h, 85, time, 88);

  // Volumetric full moon casting cold silver light
  const moonX = w * 0.82;
  const moonY = h * 0.2;
  drawVolumetricSun(ctx, moonX, moonY, 32, '#f8fafc', 'rgba(255, 255, 255, 0.45)', 'rgba(203, 213, 225, 0.15)', 160);

  // Lunar god rays slanting down across the mountain fortress
  drawVolumetricGodRays(ctx, moonX, moonY, h * 0.9, w, 'rgba(226, 232, 240, 0.18)', time);

  // 2. BACKGROUND: Rugged mountain peaks & nocturnal fortress valley fog
  withParallaxTier(ctx, 'background', () => {
    // Distant dark mountain massifs
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.52 + Math.sin(x * 0.005 + 1.8) * 42 + Math.cos(x * 0.012) * 18;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Snow caps on distant peaks catching moonlight
    ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.beginPath();
    for (let x = 0; x <= w; x += 40) {
      const y = h * 0.52 + Math.sin(x * 0.005 + 1.8) * 42 + Math.cos(x * 0.012) * 18;
      if (y < h * 0.51) {
        ctx.moveTo(x - 14, y + 10);
        ctx.lineTo(x, y);
        ctx.lineTo(x + 14, y + 10);
      }
    }
    ctx.fill();

    // Swirling nocturnal fortress valley fog
    drawLayeredMist(ctx, w, h * 0.58, 55, 'rgba(148, 163, 184, 0.25)', time, 0.005, 9);
  });

  // 3. MIDGROUND: Massive stone citadel keeps, bastions, battlements & banners
  withParallaxTier(ctx, 'midground', () => {
    // Rocky mountain promontory the castle sits upon
    drawNaturalRock(ctx, w * 0.22, h * 0.72, 90, 50, {
      baseColor: '#1e293b',
      highColor: '#334155',
      shadowColor: '#0b1120',
    });
    drawNaturalRock(ctx, w * 0.78, h * 0.74, 110, 60, {
      baseColor: '#1e293b',
      highColor: '#334155',
      shadowColor: '#0b1120',
    });

    // Castle Base & Curtain Wall
    const wallY = h * 0.65;
    const wallGrad = ctx.createLinearGradient(0, wallY - 140, 0, wallY + 40);
    wallGrad.addColorStop(0, '#334155');
    wallGrad.addColorStop(0.5, '#1e293b');
    wallGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = wallGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.08, h * 0.75);
    ctx.lineTo(w * 0.08, wallY);
    ctx.lineTo(w * 0.92, wallY);
    ctx.lineTo(w * 0.92, h * 0.75);
    ctx.closePath();
    ctx.fill();

    // Horizontal stone block courses on curtain wall
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.lineWidth = 1.5;
    for (let cy = wallY + 12; cy < h * 0.75; cy += 14) {
      ctx.beginPath();
      ctx.moveTo(w * 0.08, cy);
      ctx.lineTo(w * 0.92, cy);
      ctx.stroke();
    }

    // Left and Right Flanker Bastions (rounded stone towers with conical slate roofs)
    const drawBastion = (bx: number, by: number, bw: number, bh: number) => {
      ctx.save();
      // Tower stone cylinder with curved light shading
      const towerGrad = ctx.createLinearGradient(bx - bw * 0.5, 0, bx + bw * 0.5, 0);
      towerGrad.addColorStop(0, '#1e293b');
      towerGrad.addColorStop(0.3, '#334155');
      towerGrad.addColorStop(0.7, '#475569');
      towerGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = towerGrad;
      ctx.fillRect(bx - bw * 0.5, by - bh, bw, bh + 30);

      // Machicolation corbels supporting overhanging parapet
      const parapetW = bw * 1.15;
      const parapetH = 14;
      ctx.fillStyle = '#475569';
      ctx.fillRect(bx - parapetW * 0.5, by - bh - parapetH, parapetW, parapetH);

      // Crenelated battlements
      const numCrenels = 4;
      const cw = parapetW / (numCrenels * 2 - 1);
      ctx.fillStyle = '#334155';
      for (let c = 0; c < numCrenels; c++) {
        ctx.fillRect(bx - parapetW * 0.5 + c * cw * 2, by - bh - parapetH - 10, cw, 10);
      }

      // Conical slate roof atop bastion
      const roofH = bh * 0.45;
      const roofGrad = ctx.createLinearGradient(bx - parapetW * 0.5, 0, bx + parapetW * 0.5, 0);
      roofGrad.addColorStop(0, '#0f172a');
      roofGrad.addColorStop(0.4, '#1e293b');
      roofGrad.addColorStop(0.8, '#334155');
      roofGrad.addColorStop(1, '#020617');
      ctx.fillStyle = roofGrad;
      ctx.beginPath();
      ctx.moveTo(bx - parapetW * 0.55, by - bh - parapetH - 8);
      ctx.lineTo(bx, by - bh - parapetH - 8 - roofH);
      ctx.lineTo(bx + parapetW * 0.55, by - bh - parapetH - 8);
      ctx.closePath();
      ctx.fill();

      // Finial spire & fluttering pennant
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(bx - 1.5, by - bh - parapetH - 8 - roofH - 18, 3, 18);
      const wave = Math.sin(time * 0.004 + bx) * 6;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(bx + 1.5, by - bh - parapetH - 8 - roofH - 18);
      ctx.lineTo(bx + 22 + wave, by - bh - parapetH - 8 - roofH - 12);
      ctx.lineTo(bx + 1.5, by - bh - parapetH - 8 - roofH - 6);
      ctx.closePath();
      ctx.fill();

      // Glowing warm arrow-slit window
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(bx - 3, by - bh * 0.5, 6, 20, [3, 3, 1, 1]);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    };

    // Draw Left and Right flanking bastions
    drawBastion(w * 0.16, wallY + 20, w * 0.16, h * 0.28);
    drawBastion(w * 0.84, wallY + 20, w * 0.16, h * 0.28);

    // Central Great Keep (Massive square fortress keep with machicolations and central banner)
    const keepX = w * 0.5;
    const keepW = w * 0.32;
    const keepH = h * 0.35;
    const keepTop = wallY - keepH;

    const keepGrad = ctx.createLinearGradient(keepX - keepW * 0.5, 0, keepX + keepW * 0.5, 0);
    keepGrad.addColorStop(0, '#1e293b');
    keepGrad.addColorStop(0.3, '#334155');
    keepGrad.addColorStop(0.7, '#475569');
    keepGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = keepGrad;
    ctx.fillRect(keepX - keepW * 0.5, keepTop, keepW, keepH + 40);

    // Keep battlements
    const keepCrenels = 6;
    const kcw = keepW / (keepCrenels * 2 - 1);
    ctx.fillStyle = '#334155';
    for (let c = 0; c < keepCrenels; c++) {
      ctx.fillRect(keepX - keepW * 0.5 + c * kcw * 2, keepTop - 12, kcw, 12);
    }

    // Grand arched Keep Portcullis & torchlit windows
    ctx.save();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(keepX, wallY - 10, 18, Math.PI, 0);
    ctx.lineTo(keepX + 18, wallY + 25);
    ctx.lineTo(keepX - 18, wallY + 25);
    ctx.closePath();
    ctx.fill();

    // Warm firelight spill from the portcullis gate
    const gateGlow = safeCreateRadialGradient(ctx, keepX, wallY + 5, 5, keepX, wallY + 5, 45);
    if (gateGlow) {
      gateGlow.addColorStop(0, 'rgba(245, 158, 11, 0.7)');
      gateGlow.addColorStop(0.6, 'rgba(217, 119, 6, 0.25)');
      gateGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gateGlow;
      ctx.beginPath();
      ctx.arc(keepX, wallY + 5, 45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Windows in keep
    const keepWindows = [
      { x: keepX - keepW * 0.25, y: keepTop + 45 },
      { x: keepX + keepW * 0.25, y: keepTop + 45 },
      { x: keepX, y: keepTop + 75 },
    ];
    keepWindows.forEach(win => {
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(win.x - 4, win.y - 12, 8, 24, [4, 4, 1, 1]);
      ctx.fill();
    });
    ctx.restore();

    // Central Citadel Royal Standard Flag
    const flagWave = Math.sin(time * 0.0035) * 8;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(keepX - 2, keepTop - 38, 4, 38);
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(keepX + 2, keepTop - 38);
    ctx.lineTo(keepX + 32 + flagWave, keepTop - 28);
    ctx.lineTo(keepX + 2, keepTop - 18);
    ctx.closePath();
    ctx.fill();
    // Gold crest on banner
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(keepX + 14 + flagWave * 0.5, keepTop - 28, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. FOREGROUND: Stone parapet with carved balustrades & burning iron braziers
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.8;
    const parapetGrad = ctx.createLinearGradient(0, fgY, 0, h);
    parapetGrad.addColorStop(0, '#334155');
    parapetGrad.addColorStop(0.15, '#1e293b');
    parapetGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = parapetGrad;
    ctx.fillRect(0, fgY, w, h - fgY);

    // Weathered stone mortar courses
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, fgY + 12);
    ctx.lineTo(w, fgY + 12);
    ctx.stroke();

    // Carved stone baluster posts
    for (let bx = 15; bx < w; bx += 32) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx - 3, fgY + 12, 6, 26);
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(bx, fgY + 25, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Burning Iron Wall Braziers with flickering flame & glowing ember particles
    const braziers = [w * 0.18, w * 0.82];
    braziers.forEach(bzX => {
      const bzY = fgY - 6;

      // Iron tripod stand
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bzX - 12, bzY + 16);
      ctx.lineTo(bzX, bzY);
      ctx.lineTo(bzX + 12, bzY + 16);
      ctx.stroke();

      // Iron bowl
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(bzX, bzY, 14, 0, Math.PI);
      ctx.fill();

      // Flickering fire flame
      const flameFlicker = Math.sin(time * 0.01 + bzX) * 3;
      const flameGrad = ctx.createLinearGradient(bzX, bzY, bzX, bzY - 24);
      flameGrad.addColorStop(0, '#ef4444');
      flameGrad.addColorStop(0.5, '#f59e0b');
      flameGrad.addColorStop(1, '#fef08a');

      ctx.save();
      ctx.fillStyle = flameGrad;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(bzX - 10, bzY);
      ctx.quadraticCurveTo(bzX - 8 + flameFlicker, bzY - 16, bzX + flameFlicker, bzY - 26);
      ctx.quadraticCurveTo(bzX + 8 + flameFlicker, bzY - 16, bzX + 10, bzY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Floating embers rising into the night air
    ctx.save();
    ctx.fillStyle = '#fde047';
    for (let p = 0; p < 28; p++) {
      const px = (((p * 67.3 + Math.sin(time * 0.002 + p) * 20) % w) + w) % w;
      const py = (((h - (time * 0.025 + p * 28) % (h * 0.45))) + h) % h;
      ctx.globalAlpha = 0.3 + 0.7 * Math.sin(time * 0.004 + p);
      ctx.beginPath();
      ctx.arc(px, py, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * WORLD 8 — ENCHANTED REDWOOD FOREST / PRIMORDIAL MYSTICAL GROVE
 * Console-grade ancient primeval forest:
 * - Deep mystical twilight sky with emerald auroral canopy glow
 * - Distant foggy woodland silhouettes and interlocking ancient mossy branches
 * - Monumental redwood trunks with gnarled textured bark, buttress roots, climbing ivy,
 *   bioluminescent bracket mushrooms with colored light halos, and volumetric emerald god-rays
 * - Foreground undulating mossy forest floor with glowing toadstools, fern fronds, and drifting fireflies
 */
export function renderEnchantedForest(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Mystical canopy twilight
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#011c14' },
    { stop: 0.4, color: '#022c22' },
    { stop: 0.75, color: '#064e3b' },
    { stop: 1.0, color: '#047857' },
  ]);

  // Volumetric emerald god rays / mystical sunlight piercing the canopy
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let r = 0; r < 5; r++) {
    const rx = w * (0.12 + r * 0.2);
    const beamGrad = ctx.createLinearGradient(rx, 0, rx + 70, h);
    beamGrad.addColorStop(0, 'rgba(167, 243, 208, 0.26)');
    beamGrad.addColorStop(0.5, 'rgba(52, 211, 153, 0.16)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(rx - 25, 0);
    ctx.lineTo(rx + 25, 0);
    ctx.lineTo(rx + 110, h);
    ctx.lineTo(rx + 45, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 2. BACKGROUND: Deep misty woodland layers & distant canopy
  withParallaxTier(ctx, 'background', () => {
    // Distant tree silhouette ridges
    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.48 + Math.sin(x * 0.008 + 1.2) * 25 + Math.cos(x * 0.015) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Distant organic trees
    drawOrganicTree(ctx, w * 0.15, h * 0.58, 85, {
      barkColor: '#1b100c',
      barkShadow: '#090503',
      leafBase: '#022c22',
      leafMid: '#064e3b',
      leafHigh: '#047857',
      sway: Math.sin(time * 0.001) * 3,
      seed: 4,
    });
    drawOrganicTree(ctx, w * 0.85, h * 0.56, 95, {
      barkColor: '#1b100c',
      barkShadow: '#090503',
      leafBase: '#022c22',
      leafMid: '#064e3b',
      leafHigh: '#047857',
      sway: Math.sin(time * 0.0012 + 1) * 3,
      seed: 7,
    });

    // Mystical emerald ground fog
    drawLayeredMist(ctx, w, h * 0.62, 50, 'rgba(52, 211, 153, 0.28)', time, 0.008, 11);
  });

  // 3. MIDGROUND: Massive ancient redwood trunks with gnarled bark, climbing vines, & glowing bracket fungi
  withParallaxTier(ctx, 'midground', () => {
    // Giant ancient redwood trunks (vertical columns with authentic fluted bark texture and root flare)
    const redwoodColumns = [
      { x: w * 0.08, w: 46, hScale: 1.0 },
      { x: w * 0.28, w: 68, hScale: 1.0 },
      { x: w * 0.68, w: 76, hScale: 1.0 },
      { x: w * 0.92, w: 52, hScale: 1.0 },
    ];

    redwoodColumns.forEach((t, idx) => {
      // Fluted ancient bark texture with vertical striations
      const trunkGrad = ctx.createLinearGradient(t.x - t.w * 0.5, 0, t.x + t.w * 0.5, 0);
      trunkGrad.addColorStop(0, '#1c0a05');
      trunkGrad.addColorStop(0.25, '#451a03');
      trunkGrad.addColorStop(0.5, '#78350f');
      trunkGrad.addColorStop(0.75, '#451a03');
      trunkGrad.addColorStop(1.0, '#140602');

      ctx.fillStyle = trunkGrad;
      ctx.beginPath();
      // Flare at base into roots
      ctx.moveTo(t.x - t.w * 0.8, h);
      ctx.quadraticCurveTo(t.x - t.w * 0.5, h * 0.85, t.x - t.w * 0.5, 0);
      ctx.lineTo(t.x + t.w * 0.5, 0);
      ctx.quadraticCurveTo(t.x + t.w * 0.5, h * 0.85, t.x + t.w * 0.8, h);
      ctx.closePath();
      ctx.fill();

      // Bark vertical fissure lines
      ctx.strokeStyle = '#1b100c';
      ctx.lineWidth = 1.5;
      for (let fx = t.x - t.w * 0.35; fx <= t.x + t.w * 0.35; fx += 10) {
        ctx.beginPath();
        ctx.moveTo(fx, 0);
        ctx.lineTo(fx + Math.sin(fx + idx) * 4, h);
        ctx.stroke();
      }

      // Hanging moss / creeping ivy tendrils on trunk
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 2.0;
      for (let v = 0; v < 3; v++) {
        const vy = h * (0.2 + v * 0.22);
        ctx.beginPath();
        ctx.moveTo(t.x - t.w * 0.3, vy);
        ctx.quadraticCurveTo(t.x, vy + 20, t.x + t.w * 0.3, vy + 40);
        ctx.stroke();
      }

      // Bioluminescent glowing bracket mushrooms growing spiraling up trunk
      const shroomCount = 3;
      for (let s = 0; s < shroomCount; s++) {
        const sy = h * (0.35 + s * 0.16 + (idx % 2) * 0.08);
        const isLeft = (s + idx) % 2 === 0;
        const sx = isLeft ? t.x - t.w * 0.45 : t.x + t.w * 0.45;
        const shroomColor = (s + idx) % 3 === 0 ? '#67e8f9' : ((s + idx) % 3 === 1 ? '#6ee7b7' : '#c084fc');

        ctx.save();
        ctx.fillStyle = shroomColor;
        ctx.shadowColor = shroomColor;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 12, 5, isLeft ? -0.2 : 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // Midground rolling moss-covered forest knolls
    const knollGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
    knollGrad.addColorStop(0, '#064e3b');
    knollGrad.addColorStop(0.4, '#047857');
    knollGrad.addColorStop(1, '#022c22');

    ctx.fillStyle = knollGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.74 + Math.sin(x * 0.006 + 1.2) * 18 + Math.cos(x * 0.012) * 8;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  });

  // 4. FOREGROUND: Primordial mossy earth, glowing mushrooms, ferns & floating fireflies
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.82;
    const fgGrad = ctx.createLinearGradient(0, fgY, 0, h);
    fgGrad.addColorStop(0, '#022c22');
    fgGrad.addColorStop(0.3, '#064e3b');
    fgGrad.addColorStop(1, '#011c14');

    ctx.fillStyle = fgGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = fgY + Math.sin(x * 0.008 + 2.4) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Sprawling gnarled mossy root buttresses
    ctx.strokeStyle = '#27170e';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.05, fgY - 10);
    ctx.quadraticCurveTo(w * 0.22, fgY + 25, w * 0.42, fgY + 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w * 0.95, fgY - 15);
    ctx.quadraticCurveTo(w * 0.78, fgY + 28, w * 0.58, fgY + 12);
    ctx.stroke();

    // Clusters of glowing forest mushrooms with stalks and spotted caps
    const fgMushrooms = [
      { x: w * 0.16, y: fgY + 12, col: '#a7f3d0' },
      { x: w * 0.22, y: fgY + 16, col: '#67e8f9' },
      { x: w * 0.62, y: fgY + 8, col: '#c084fc' },
      { x: w * 0.78, y: fgY + 14, col: '#a7f3d0' },
      { x: w * 0.84, y: fgY + 18, col: '#67e8f9' },
    ];
    fgMushrooms.forEach(sh => {
      // Stalk
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(sh.x - 2, sh.y);
      ctx.lineTo(sh.x - 1, sh.y - 12);
      ctx.lineTo(sh.x + 1, sh.y - 12);
      ctx.lineTo(sh.x + 2, sh.y);
      ctx.closePath();
      ctx.fill();

      // Glowing Cap with soft halo
      ctx.save();
      ctx.fillStyle = sh.col;
      ctx.shadowColor = sh.col;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(sh.x, sh.y - 12, 8, Math.PI, Math.PI * 2);
      ctx.fill();
      // Cap spots
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sh.x - 3, sh.y - 15, 1.2, 0, Math.PI * 2);
      ctx.arc(sh.x + 2, sh.y - 16, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Natural fern fronds along forest floor
    const drawFern = (fx: number, fy: number, size: number, angle: number) => {
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(angle);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size * 0.4, -size * 0.5, size, -size * 0.8);
      ctx.stroke();
      // Leaflets
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.2;
      for (let t = 0.2; t <= 0.9; t += 0.15) {
        const lx = t * size;
        const ly = -t * size * 0.8;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - 5, ly - 6);
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + 5, ly - 4);
        ctx.stroke();
      }
      ctx.restore();
    };

    drawFern(w * 0.08, fgY + 15, 32, -0.2);
    drawFern(w * 0.38, fgY + 18, 28, 0.15);
    drawFern(w * 0.72, fgY + 20, 30, -0.15);
    drawFern(w * 0.92, fgY + 12, 34, 0.25);

    // Drifting magical fireflies pulsing with organic emerald/cyan light
    ctx.save();
    for (let f = 0; f < 36; f++) {
      const fx = (((f * 53.7 + Math.sin(time * 0.0018 + f) * 35) % w) + w) % w;
      const fy = (((f * 79.1 + Math.cos(time * 0.0015 + f) * 30) % h) + h) % h;
      const fr = 1.6 + (f % 3) * 0.6;
      const pulse = 0.35 + 0.65 * Math.sin(time * 0.0035 + f);
      ctx.fillStyle = f % 2 === 0 ? '#6ee7b7' : '#a7f3d0';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.globalAlpha = Math.max(0.15, pulse);
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * WORLD 11 — PIRATE CORSAIR COVE / SMUGGLER'S HAVEN
 * Console-grade pirate haven:
 * - Stormy nocturnal coastal sky with scudding dark clouds and bright volumetric moon
 * - Jagged monolithic sea stacks and towering granite headlands with breaking surf
 * - Detailed 3-masted pirate galleon anchored in the cove: curving wooden hull, raised quarterdeck,
 *   transom stern gallery with warm candlelit windows, furled canvas sails, rigging lines, and waving jolly roger
 * - Foreground weathered wooden dock pier with rope-bound bollards, brass storm lanterns, and ocean mist
 */
export function renderPirate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Stormy nocturnal coastal sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#020b18' },
    { stop: 0.35, color: '#082347' },
    { stop: 0.7, color: '#0f3b6c' },
    { stop: 1.0, color: '#164e63' },
  ]);

  drawCinematicStars(ctx, w, h, 65, time, 55);

  // Stormy full moon
  const moonX = w * 0.28;
  const moonY = h * 0.22;
  drawVolumetricSun(ctx, moonX, moonY, 30, '#f8fafc', 'rgba(203, 213, 225, 0.45)', 'rgba(148, 163, 184, 0.15)', 150);

  // Scudding dark sea storm clouds
  ctx.save();
  ctx.fillStyle = 'rgba(8, 35, 71, 0.6)';
  const cloudOffset = (time * 0.008) % (w + 400) - 200;
  for (let c = 0; c < 3; c++) {
    const cx = (cloudOffset + c * 380) % (w + 300);
    const cy = h * (0.16 + c * 0.08);
    ctx.beginPath();
    ctx.ellipse(cx, cy, 60, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 32, cy - 8, 48, 26, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. BACKGROUND: Dramatic coastal sea cliffs, jagged granite stacks, & moonlight on water
  withParallaxTier(ctx, 'background', () => {
    // Distant granite sea stacks & headlands
    ctx.fillStyle = '#051329';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const y = h * 0.54 + Math.sin(x * 0.005 + 1.2) * 44 + Math.cos(x * 0.012) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Natural sea arch on left cliff
    ctx.fillStyle = '#082347';
    ctx.beginPath();
    ctx.arc(w * 0.16, h * 0.62, 28, Math.PI, 0);
    ctx.fill();

    // Ocean swell surface in cove
    const seaY = h * 0.65;
    const coveWater = ctx.createLinearGradient(0, seaY, 0, h);
    coveWater.addColorStop(0, '#0c2e59');
    coveWater.addColorStop(0.35, '#071f3d');
    coveWater.addColorStop(1, '#020b18');
    ctx.fillStyle = coveWater;
    ctx.fillRect(0, seaY, w, h - seaY);

    // Moonlight specular water reflection shimmer
    const moonReflectGrad = ctx.createLinearGradient(moonX - 45, 0, moonX + 45, 0);
    moonReflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    moonReflectGrad.addColorStop(0.5, 'rgba(226, 232, 240, 0.35)');
    moonReflectGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = moonReflectGrad;
    for (let wy = seaY + 6; wy < h * 0.78; wy += 8) {
      const waveW = (wy - seaY) * 1.5;
      const waveShift = Math.sin(time * 0.003 + wy) * 8;
      ctx.fillRect(moonX - waveW * 0.5 + waveShift, wy, waveW, 2.5);
    }
  });

  // 3. MIDGROUND: Majestic 3-masted Pirate Galleon anchored in cove with rigging and stern lanterns
  withParallaxTier(ctx, 'midground', () => {
    const seaY = h * 0.65;
    const gx = w * 0.7;
    const gy = seaY + 22 + Math.sin(time * 0.0018) * 4;

    ctx.save();

    // Galleon Hull (realistic curved wooden hull with tumblehome and sheer)
    const hullGrad = ctx.createLinearGradient(gx - 60, gy, gx + 60, gy + 24);
    hullGrad.addColorStop(0, '#1c100c');
    hullGrad.addColorStop(0.4, '#3e2723');
    hullGrad.addColorStop(0.8, '#4e342e');
    hullGrad.addColorStop(1.0, '#1c100c');
    ctx.fillStyle = hullGrad;

    ctx.beginPath();
    ctx.moveTo(gx - 62, gy);
    // Sweeping sheer line to raised aft quarterdeck
    ctx.quadraticCurveTo(gx - 10, gy + 3, gx + 35, gy - 10);
    ctx.lineTo(gx + 64, gy - 16);
    // Transom stern
    ctx.lineTo(gx + 58, gy + 18);
    // Bottom keel
    ctx.quadraticCurveTo(gx, gy + 26, gx - 48, gy + 18);
    // Clipper bow
    ctx.lineTo(gx - 62, gy);
    ctx.closePath();
    ctx.fill();

    // Hull planking lines & gunports
    ctx.strokeStyle = '#1b100c';
    ctx.lineWidth = 1.2;
    for (let py = gy + 4; py <= gy + 16; py += 5) {
      ctx.beginPath();
      ctx.moveTo(gx - 54, py);
      ctx.lineTo(gx + 52, py);
      ctx.stroke();
    }
    // Square gunport hatches
    ctx.fillStyle = '#090503';
    for (let gp = gx - 32; gp <= gx + 24; gp += 18) {
      ctx.fillRect(gp, gy + 6, 6, 5);
    }

    // Carved stern gallery transom windows glowing with warm amber candlelight
    ctx.save();
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;
    for (let wnd = 0; wnd < 3; wnd++) {
      ctx.fillRect(gx + 42 + wnd * 5, gy - 12, 3.5, 6);
    }
    ctx.restore();

    // Bowsprit spar reaching forward from the prow
    ctx.strokeStyle = '#27170e';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(gx - 56, gy + 2);
    ctx.lineTo(gx - 86, gy - 12);
    ctx.stroke();

    // 3 Tall masts: Foremast, Mainmast, Mizzenmast
    const masts = [
      { x: gx - 30, h: 52, yards: [0.35, 0.65, 0.9] },
      { x: gx + 4, h: 66, yards: [0.35, 0.65, 0.9] },
      { x: gx + 36, h: 48, yards: [0.4, 0.75] },
    ];

    masts.forEach((m, idx) => {
      // Wooden Mast Pole
      ctx.strokeStyle = '#27170e';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(m.x, gy);
      ctx.lineTo(m.x, gy - m.h);
      ctx.stroke();

      // Crow's nest on mainmast
      if (idx === 1) {
        ctx.fillStyle = '#1c100c';
        ctx.fillRect(m.x - 5, gy - m.h * 0.7, 10, 4);
      }

      // Horizontal Yard crossbeams & furled sails
      m.yards.forEach(yRatio => {
        const yy = gy - m.h * yRatio;
        const yw = 26 * (1 - yRatio * 0.35);

        // Wooden Yard
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(m.x - yw * 0.5, yy);
        ctx.lineTo(m.x + yw * 0.5, yy);
        ctx.stroke();

        // Furled canvas sails bundled to yards
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(m.x, yy + 3, yw * 0.45, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Standing rigging shrouds / ratlines
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(m.x, gy - m.h * 0.7);
      ctx.lineTo(m.x - 12, gy + 2);
      ctx.moveTo(m.x, gy - m.h * 0.7);
      ctx.lineTo(m.x + 12, gy + 2);
      ctx.stroke();
    });

    // Jolly Roger / Black flag on mainmast
    const flagWave = Math.sin(time * 0.004) * 5;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(gx + 4, gy - 66);
    ctx.lineTo(gx + 22 + flagWave, gy - 60);
    ctx.lineTo(gx + 4, gy - 54);
    ctx.closePath();
    ctx.fill();

    // Water wake ripples around galleon hull
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(gx - 54, gy + 18, 14, 0, Math.PI * 0.8);
    ctx.arc(gx + 48, gy + 18, 10, Math.PI * 0.2, Math.PI);
    ctx.stroke();

    ctx.restore();
  });

  // 4. FOREGROUND: Weathered wooden harbor dock with rope-bound bollards, brass lanterns & sea spray
  withParallaxTier(ctx, 'foreground', () => {
    const dockY = h * 0.82;
    const dockGrad = ctx.createLinearGradient(0, dockY, 0, h);
    dockGrad.addColorStop(0, '#292524');
    dockGrad.addColorStop(0.3, '#1c1917');
    dockGrad.addColorStop(1, '#0c0a09');

    ctx.fillStyle = dockGrad;
    ctx.fillRect(0, dockY, w, h - dockY);

    // Weathered timber dock planks with wood grain
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 2.0;
    for (let x = 0; x <= w; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, dockY);
      ctx.lineTo(x, h);
      ctx.stroke();

      // Planking nail rivets
      ctx.fillStyle = '#78716c';
      ctx.fillRect(x + 4, dockY + 8, 2, 2);
      ctx.fillRect(x + 4, dockY + 45, 2, 2);
    }

    // Wooden dock pilings / mooring bollards with hemp rope wraps
    const bollards = [w * 0.15, w * 0.45, w * 0.85];
    bollards.forEach(bx => {
      // Heavy timber post
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.roundRect(bx - 10, dockY - 14, 20, h - dockY + 14, [4, 4, 0, 0]);
      ctx.fill();

      // Coiled hemp rope bindings
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3.0;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.moveTo(bx - 10, dockY - 6 + r * 5);
        ctx.lineTo(bx + 10, dockY - 6 + r * 5);
        ctx.stroke();
      }

      // Hanging brass storm lantern casting flickering golden glow
      ctx.save();
      const lx = bx + 15;
      const ly = dockY - 2;

      // Iron bracket
      ctx.strokeStyle = '#0c0a09';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 8, dockY - 10);
      ctx.lineTo(lx, dockY - 10);
      ctx.lineTo(lx, ly - 6);
      ctx.stroke();

      // Brass lantern housing
      ctx.fillStyle = '#78350f';
      ctx.fillRect(lx - 5, ly - 6, 10, 3);
      ctx.fillRect(lx - 5, ly + 6, 10, 3);

      // Glowing flame core
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Drifting coastal mist and ocean spray motes
    ctx.save();
    ctx.fillStyle = '#cbd5e1';
    for (let p = 0; p < 28; p++) {
      const px = (((p * 59.3 + time * 0.02) % w) + w) % w;
      const py = (((p * 83.7 - time * 0.015 + Math.sin(time * 0.002 + p) * 14) % h) + h) % h;
      ctx.globalAlpha = 0.3 + 0.5 * Math.sin(time * 0.003 + p);
      ctx.beginPath();
      ctx.arc(px, py, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}
