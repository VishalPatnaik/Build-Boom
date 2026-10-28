import { 
  drawAtmosphericSky, 
  drawVolumetricSun, 
  drawLayeredMist, 
  drawCinematicStars, 
  withParallaxTier, 
  drawOrganicTree, 
  drawOrganicPalm, 
  drawNaturalRock,
  drawVolumetricGodRays 
} from './worldUtils';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * WORLD 4 — ABYSSAL CORAL REEF / SUBMARINE OCEANIA
 * Console-grade deep ocean reef:
 * - Sapphire to midnight abyss water column with shimmering surface caustic wave projections
 * - Distant deep-sea trench cliffs with volumetric sunlight rays slicing down through the ocean
 * - Sprawling living coral reef architecture: branching staghorn coral with glowing tips,
 *   layered shelf plate coral, undulating kelp forests swaying with currents
 * - Foreground sandy ocean floor with sediment ripples, textured brain coral boulders,
 *   and hydrodynamic rising translucent bubbles with specular highlights
 */
export function renderAbyssalCoral(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Deep sapphire oceanic water column
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#02182b' },
    { stop: 0.35, color: '#03396c' },
    { stop: 0.7, color: '#005b96' },
    { stop: 1.0, color: '#012a4a' },
  ]);

  // Piercing underwater sunlight caustic god-rays
  drawVolumetricGodRays(ctx, w * 0.45, 0, h, w, 'rgba(100, 216, 255, 0.32)', time);

  // 2. BACKGROUND: Distant deep-sea trench cliffs & ocean depth haze
  withParallaxTier(ctx, 'background', () => {
    // Trench rock silhouettes
    ctx.fillStyle = '#011627';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 18) {
      const y = h * 0.58 + Math.sin(x * 0.006 + 1.2) * 36;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Distant oceanic blue depth haze
    drawLayeredMist(ctx, w, h * 0.62, 55, 'rgba(3, 57, 108, 0.45)', time, 0.005, 4);
  });

  // 3. MIDGROUND: Living coral reef architecture, shelf coral, & swaying kelp forest
  withParallaxTier(ctx, 'midground', () => {
    // Swaying Kelp Forest
    const kelpPositions = [w * 0.08, w * 0.22, w * 0.78, w * 0.92];
    kelpPositions.forEach((kx, idx) => {
      ctx.save();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(kx, h);
      for (let y = h; y >= h * 0.45; y -= 20) {
        const sway = Math.sin(time * 0.002 + y * 0.02 + idx) * 14;
        ctx.lineTo(kx + sway, y);
      }
      ctx.stroke();

      // Kelp fronds along the stem
      for (let y = h - 20; y >= h * 0.48; y -= 35) {
        const sway = Math.sin(time * 0.002 + y * 0.02 + idx) * 14;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(kx + sway + 14, y, 16, 6, 0.3, 0, Math.PI * 2);
        ctx.ellipse(kx + sway - 14, y - 10, 16, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Layered Coral Reef Formations (Staghorn and Shelf corals)
    const coralBases = [
      { x: w * 0.18, y: h * 0.74, col: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)' },
      { x: w * 0.42, y: h * 0.72, col: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)' },
      { x: w * 0.68, y: h * 0.73, col: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
      { x: w * 0.84, y: h * 0.75, col: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
    ];

    coralBases.forEach(cb => {
      ctx.save();
      // Shelf plate coral tiers
      ctx.fillStyle = cb.col;
      ctx.shadowColor = cb.glow;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.ellipse(cb.x, cb.y, 42, 12, 0.1, 0, Math.PI * 2);
      ctx.ellipse(cb.x - 18, cb.y - 14, 30, 9, -0.15, 0, Math.PI * 2);
      ctx.ellipse(cb.x + 22, cb.y - 24, 26, 8, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Glowing bioluminescent polyps on rim
      ctx.fillStyle = '#ffffff';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.arc(cb.x + Math.cos(a) * 38, cb.y + Math.sin(a) * 10, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  });

  // 4. FOREGROUND: Sandy seafloor with brain coral, sediment ripples, & rising bubbles
  withParallaxTier(ctx, 'foreground', () => {
    const seaBedY = h * 0.84;
    const bedGrad = ctx.createLinearGradient(0, seaBedY, 0, h);
    bedGrad.addColorStop(0, '#0c4a6e');
    bedGrad.addColorStop(0.4, '#075985');
    bedGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = bedGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = seaBedY + Math.sin(x * 0.008 + 1.4) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Natural textured brain coral boulder on seafloor
    drawNaturalRock(ctx, w * 0.28, seaBedY + 12, 45, 26, {
      baseColor: '#0369a1',
      highColor: '#38bdf8',
      shadowColor: '#082f49',
    });
    drawNaturalRock(ctx, w * 0.75, seaBedY + 14, 52, 30, {
      baseColor: '#0369a1',
      highColor: '#38bdf8',
      shadowColor: '#082f49',
    });

    // Rising hydrodynamic translucent water bubbles with specular reflection
    ctx.save();
    for (let b = 0; b < 36; b++) {
      const bx = (((b * 39.3) % w) + Math.sin(time * 0.002 + b) * 18 + w) % w;
      const by = (((-time * 0.038 - b * 32) % h) + h) % h;
      const br = 2.2 + (b % 4) * 0.8;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.0;
      ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tiny white specular highlight dot inside bubble
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx - br * 0.35, by - br * 0.35, br * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * WORLD 9 — GOLDEN DESERT OASIS / GREAT DUNES & SUNKEN TOMB
 * Console-grade desert environment:
 * - Scorching desert sun with blinding white-gold core, wide heat shimmer corona, rich ochre to cobalt twilight horizon
 * - Distant wind-carved sandstone buttes and mesa escarpments fading into desert dust haze
 * - Sweeping wind-rippled barchan sand dunes with razor-sharp shadow crests, half-buried ancient sandstone temple ruins,
 *   and date palm oasis with tranquil pool
 * - Foreground golden sand ripples, cracked sun-baked sandstone slabs, and swirling streams of golden sand dust motes
 */
export function renderGoldenDesert(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Scorching desert sun & ochre sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#78350f' },
    { stop: 0.38, color: '#d97706' },
    { stop: 0.72, color: '#f59e0b' },
    { stop: 1.0, color: '#fef08a' },
  ]);

  // Scorching Desert Sun with intense heat corona
  const sunX = w * 0.5;
  const sunY = h * 0.24;
  drawVolumetricSun(ctx, sunX, sunY, 44, '#ffffff', 'rgba(254, 240, 138, 0.65)', 'rgba(234, 179, 8, 0.22)', 220);

  // Volumetric solar god rays
  drawVolumetricGodRays(ctx, sunX, sunY, h * 0.85, w, 'rgba(254, 240, 138, 0.28)', time);

  // 2. BACKGROUND: Sandstone buttes, mesa escarpments, & heat haze
  withParallaxTier(ctx, 'background', () => {
    // Distant flat-topped sandstone mesas
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 25) {
      const y = h * 0.54 + Math.sin(x * 0.004 + 1.2) * 24;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Distant ancient Egyptian-inspired sandstone pyramid in the haze
    const px = w * 0.72;
    const py = h * 0.56;
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(px - 65, h * 0.7);
    ctx.lineTo(px, py);
    ctx.lineTo(px + 65, h * 0.7);
    ctx.closePath();
    ctx.fill();

    // Pyramid sunlit face vs shadow face
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 65, h * 0.7);
    ctx.lineTo(px + 10, h * 0.7);
    ctx.closePath();
    ctx.fill();

    // Shimmering desert heat mist
    drawLayeredMist(ctx, w, h * 0.6, 50, 'rgba(254, 240, 138, 0.35)', time, 0.008, 6);
  });

  // 3. MIDGROUND: Sweeping barchan dunes, ancient temple columns, & date palm oasis
  withParallaxTier(ctx, 'midground', () => {
    // Midground dune ridge 1
    const duneGrad1 = ctx.createLinearGradient(0, h * 0.64, 0, h * 0.8);
    duneGrad1.addColorStop(0, '#d97706');
    duneGrad1.addColorStop(0.5, '#b45309');
    duneGrad1.addColorStop(1, '#78350f');
    ctx.fillStyle = duneGrad1;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.68 + Math.sin(x * 0.005 + 1.4) * 28;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Ancient fluted sandstone columns rising from sand
    const drawColumn = (colX: number, colY: number, colH: number) => {
      ctx.save();
      // Column shaft with vertical flutes
      const colGrad = ctx.createLinearGradient(colX - 8, 0, colX + 8, 0);
      colGrad.addColorStop(0, '#78350f');
      colGrad.addColorStop(0.3, '#d97706');
      colGrad.addColorStop(0.7, '#f59e0b');
      colGrad.addColorStop(1.0, '#451a03');
      ctx.fillStyle = colGrad;
      ctx.fillRect(colX - 8, colY - colH, 16, colH);

      // Capital atop column
      ctx.fillStyle = '#d97706';
      ctx.fillRect(colX - 12, colY - colH - 6, 24, 6);
      ctx.restore();
    };

    drawColumn(w * 0.22, h * 0.74, 52);
    drawColumn(w * 0.28, h * 0.75, 46);

    // Date Palm Oasis Trees in midground
    drawOrganicPalm(ctx, w * 0.82, h * 0.76, 75, {
      curve: 20,
      windSway: Math.sin(time * 0.002) * 5,
      barkColor: '#78350f',
      frondBase: '#15803d',
      frondHigh: '#4ade80',
    });
  });

  // 4. FOREGROUND: Golden sand ripple fields, cracked sandstone slabs, & swirling sand dust
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.8;
    const fgGrad = ctx.createLinearGradient(0, fgY, 0, h);
    fgGrad.addColorStop(0, '#f59e0b');
    fgGrad.addColorStop(0.3, '#d97706');
    fgGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = fgGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = fgY + Math.sin(x * 0.008 + 2.8) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Wind-blown sand ripples on foreground dune
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.4;
    for (let ry = fgY + 12; ry < h; ry += 12) {
      ctx.beginPath();
      for (let rx = 0; rx <= w; rx += 20) {
        const offset = Math.sin(rx * 0.03 + ry) * 3;
        if (rx === 0) ctx.moveTo(rx, ry + offset);
        else ctx.lineTo(rx, ry + offset);
      }
      ctx.stroke();
    }

    // Natural sandstone rocks embedded in sand
    drawNaturalRock(ctx, w * 0.15, fgY + 20, 36, 18, {
      baseColor: '#b45309',
      highColor: '#f59e0b',
      shadowColor: '#451a03',
    });

    // Swirling windblown golden sand dust motes
    ctx.save();
    ctx.fillStyle = '#fef08a';
    for (let p = 0; p < 45; p++) {
      const px = (((p * 47.3 + time * 0.045) % w) + w) % w;
      const py = (((p * 79.1 + Math.sin(time * 0.003 + p) * 14) % h) + h) % h;
      ctx.globalAlpha = 0.35 + 0.65 * Math.sin(time * 0.003 + p);
      ctx.beginPath();
      ctx.arc(px, py, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * WORLD 15 — TOXIC INDUSTRIAL WASTELAND / BIO-CHEMICAL CALDERA
 * Console-grade industrial dystopia:
 * - Heavy sickly sulfurous smog sky with toxic green and dark olive gradients, ominous amber clouds
 * - Silhouettes of decommissioned industrial refineries, catalytic cracking towers, and flare stacks
 * - Intricate industrial superstructure: rusted steel truss bridges, giant chemical transport pipes with flange joints,
 *   bubbling fluorescent green toxic chemical lagoon with caustic sludge shores
 * - Foreground heavy corroded steel deck with hazard stripes, dripping green condensate, and bubbling radioactive vapor
 */
export function renderToxicWasteland(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Sulfurous green smog sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#091404' },
    { stop: 0.38, color: '#193309' },
    { stop: 0.72, color: '#365314' },
    { stop: 1.0, color: '#4d7c0f' },
  ]);

  // Toxic green atmospheric glow
  ctx.save();
  const toxicGlow = safeCreateRadialGradient(ctx, w * 0.5, h * 0.65, 30, w * 0.5, h * 0.65, Math.max(35, w * 0.75));
  if (toxicGlow) {
    toxicGlow.addColorStop(0, 'rgba(190, 242, 100, 0.28)');
    toxicGlow.addColorStop(0.6, 'rgba(132, 204, 22, 0.15)');
    toxicGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = toxicGlow;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // 2. BACKGROUND: Decommissioned refinery towers, flare stacks, & smog plumes
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#050c02';
    // Industrial silos and chimneys
    const chimneys = [
      { x: w * 0.14, w: 26, h: h * 0.35 },
      { x: w * 0.28, w: 34, h: h * 0.42 },
      { x: w * 0.65, w: 38, h: h * 0.45 },
      { x: w * 0.82, w: 24, h: h * 0.38 },
    ];
    chimneys.forEach(c => {
      ctx.fillRect(c.x, h - c.h, c.w, c.h);
      // Smokestack crown rim
      ctx.fillRect(c.x - 3, h - c.h, c.w + 6, 6);
    });

    // Toxic green smog plumes rising from chimneys
    drawLayeredMist(ctx, w, h * 0.62, 50, 'rgba(101, 163, 13, 0.32)', time, 0.007, 7);
  });

  // 3. MIDGROUND: Rusted steel truss bridges, giant chemical transport pipes, & bubbling lagoon
  withParallaxTier(ctx, 'midground', () => {
    // Chemical Transport Pipe Network
    const pipeY = h * 0.68;
    const pipeGrad = ctx.createLinearGradient(0, pipeY - 14, 0, pipeY + 14);
    pipeGrad.addColorStop(0, '#27272a');
    pipeGrad.addColorStop(0.4, '#52525b');
    pipeGrad.addColorStop(0.8, '#71717a');
    pipeGrad.addColorStop(1.0, '#18181b');
    ctx.fillStyle = pipeGrad;

    // Horizontal main pipe conduit across midground
    ctx.fillRect(0, pipeY - 10, w, 20);

    // Flange joints on pipe
    ctx.fillStyle = '#3f3f46';
    for (let px = 20; px < w; px += 70) {
      ctx.fillRect(px, pipeY - 14, 10, 28);
      // Flange bolts
      ctx.fillStyle = '#71717a';
      ctx.fillRect(px + 3, pipeY - 12, 4, 3);
      ctx.fillRect(px + 3, pipeY + 9, 4, 3);
      ctx.fillStyle = '#3f3f46';
    }

    // Bubbling fluorescent green chemical lagoon
    const lagoonY = h * 0.75;
    const lagoonGrad = ctx.createLinearGradient(0, lagoonY, 0, h);
    lagoonGrad.addColorStop(0, '#bef264');
    lagoonGrad.addColorStop(0.3, '#84cc16');
    lagoonGrad.addColorStop(0.7, '#4d7c0f');
    lagoonGrad.addColorStop(1.0, '#1a3a09');
    ctx.fillStyle = lagoonGrad;
    ctx.fillRect(0, lagoonY, w, h - lagoonY);

    // Acid sludge shorelines
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = lagoonY + 12 + Math.sin(x * 0.008 + 1.2) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  });

  // 4. FOREGROUND: Corroded steel deck with hazard stripes & radioactive vapor motes
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.84;
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, fgY, w, h - fgY);

    // Industrial yellow and black hazard warning stripes
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, fgY, w, 14);
    ctx.clip();
    for (let hx = -20; hx < w + 40; hx += 24) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(hx, fgY + 14);
      ctx.lineTo(hx + 14, fgY);
      ctx.lineTo(hx + 24, fgY);
      ctx.lineTo(hx + 10, fgY + 14);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Riveted steel deck joints
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, fgY + 14);
    ctx.lineTo(w, fgY + 14);
    ctx.stroke();

    // Bubbling radioactive vapor motes rising into the air
    ctx.save();
    ctx.fillStyle = '#bef264';
    ctx.shadowColor = '#84cc16';
    ctx.shadowBlur = 10;
    for (let p = 0; p < 38; p++) {
      const px = (((p * 43.1 + Math.sin(time * 0.002 + p) * 22) % w) + w) % w;
      const py = (((h - (time * 0.032 + p * 25) % (h * 0.45))) + h) % h;
      ctx.globalAlpha = 0.35 + 0.65 * Math.sin(time * 0.004 + p);
      ctx.beginPath();
      ctx.arc(px, py, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * WORLD 16 — FLOATING SKY ISLANDS / AEROLITH SPIRE
 * Console-grade high-altitude celestial archipelago:
 * - High-altitude crystal azure sky with wispy cirrus ribbons and brilliant golden sun
 * - Endless rolling sea of cloud under-deck far below, distant floating island aerolites drifting
 * - Massive organic levitating rock islands with fractured granite undersides, hanging roots,
 *   cascading waterfalls spilling over edges into mist, verdant alpine turf, and ancient stone watchtower
 * - Foreground floating island promontory with alpine vegetation, weathered rock crags, and rushing wind currents
 */
export function renderFloatingIslands(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: High-altitude azure sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#0284c7' },
    { stop: 0.38, color: '#38bdf8' },
    { stop: 0.72, color: '#7dd3fc' },
    { stop: 1.0, color: '#e0f2fe' },
  ]);

  // High altitude brilliant sun
  const sunX = w * 0.8;
  const sunY = h * 0.18;
  drawVolumetricSun(ctx, sunX, sunY, 36, '#ffffff', 'rgba(254, 240, 138, 0.55)', 'rgba(56, 189, 248, 0.2)', 180);

  // 2. BACKGROUND: Endless cloud ocean under-deck & distant floating aerolites
  withParallaxTier(ctx, 'background', () => {
    // Cloud sea below
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let c = 0; c < 5; c++) {
      const cx = (w / 4) * c;
      const cy = h * 0.72 + Math.sin(c + time * 0.001) * 14;
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Distant floating aerolites in the haze
    const distantIslands = [
      { x: w * 0.2, y: h * 0.54, w: 45, h: 28 },
      { x: w * 0.75, y: h * 0.5, w: 55, h: 32 },
    ];
    distantIslands.forEach(di => {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(di.x - di.w * 0.5, di.y);
      ctx.lineTo(di.x + di.w * 0.5, di.y);
      ctx.lineTo(di.x, di.y + di.h);
      ctx.closePath();
      ctx.fill();
    });
  });

  // 3. MIDGROUND: Massive levitating organic rock island with waterfall, hanging roots, & alpine turf
  withParallaxTier(ctx, 'midground', () => {
    const isX = w * 0.5;
    const isY = h * 0.62 + Math.sin(time * 0.0014) * 8;
    const isW = w * 0.65;
    const isH = 95;

    ctx.save();
    // Inverted fractured rock cone (granite underside)
    const rockGrad = ctx.createLinearGradient(isX, isY, isX, isY + isH);
    rockGrad.addColorStop(0, '#475569');
    rockGrad.addColorStop(0.5, '#334155');
    rockGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = rockGrad;

    ctx.beginPath();
    ctx.moveTo(isX - isW * 0.5, isY);
    ctx.lineTo(isX + isW * 0.5, isY);
    // Jagged crags on the bottom tip
    ctx.lineTo(isX + isW * 0.2, isY + isH * 0.7);
    ctx.lineTo(isX, isY + isH);
    ctx.lineTo(isX - isW * 0.25, isY + isH * 0.65);
    ctx.closePath();
    ctx.fill();

    // Hanging ancient roots dangling beneath the floating island
    ctx.strokeStyle = '#27170e';
    ctx.lineWidth = 2.0;
    for (let r = -3; r <= 3; r++) {
      const rx = isX + r * (isW * 0.12);
      ctx.beginPath();
      ctx.moveTo(rx, isY + 20);
      ctx.quadraticCurveTo(rx + Math.sin(time * 0.002 + r) * 6, isY + isH * 0.8, rx - 4, isY + isH + 18);
      ctx.stroke();
    }

    // Cascading waterfall spilling over edge into mist
    const wfX = isX - isW * 0.25;
    const wfGrad = ctx.createLinearGradient(wfX, isY, wfX, isY + isH + 30);
    wfGrad.addColorStop(0, '#ffffff');
    wfGrad.addColorStop(0.4, '#38bdf8');
    wfGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = wfGrad;
    ctx.fillRect(wfX - 6, isY, 12, isH + 30);

    // Verdant alpine turf plateau on top
    const turfGrad = ctx.createLinearGradient(0, isY - 12, 0, isY + 6);
    turfGrad.addColorStop(0, '#22c55e');
    turfGrad.addColorStop(0.5, '#16a34a');
    turfGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = turfGrad;
    ctx.beginPath();
    ctx.ellipse(isX, isY - 2, isW * 0.52, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ancient stone watchtower atop the island
    ctx.fillStyle = '#475569';
    ctx.fillRect(isX + isW * 0.2, isY - 38, 22, 38);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(isX + isW * 0.2 - 2, isY - 42, 26, 6);
    ctx.restore();
  });

  // 4. FOREGROUND: Floating island promontory with alpine grass, rocks & rushing clouds
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.82;
    const fgGrad = ctx.createLinearGradient(0, fgY, 0, h);
    fgGrad.addColorStop(0, '#15803d');
    fgGrad.addColorStop(0.3, '#166534');
    fgGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = fgGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = fgY + Math.sin(x * 0.008 + 1.2) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Natural rock crags on promontory
    drawNaturalRock(ctx, w * 0.2, fgY + 12, 42, 22, {
      baseColor: '#64748b',
      highColor: '#cbd5e1',
      shadowColor: '#1e293b',
    });

    // Drifting clouds & high altitude wind currents
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let p = 0; p < 28; p++) {
      const px = (((p * 61.3 + time * 0.04) % w) + w) % w;
      const py = (((p * 83.1 + Math.sin(time * 0.002 + p) * 12) % h) + h) % h;
      ctx.beginPath();
      ctx.ellipse(px, py, 14, 4, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * WORLD 17 — CHRONO CLOCKWORK REALM / STEAMPUNK FOUNDRY
 * Console-grade horological mechanism:
 * - Industrial soot and warm copper/brass furnace glow sky with deep umber tones
 * - Deep mechanism chasm with enormous silhouettes of rotating flywheel assemblies and drive chains
 * - Complex interlocking bronze and brass gear trains with teeth, spokes, rivets, and counter-rotating movements
 * - Foreground heavy riveted boiler plate floor with high-pressure steam pipes venting billows of steam and sparks
 */
export function renderClockwork(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Furnace glow & industrial umber sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#1a0d05' },
    { stop: 0.4, color: '#381c0b' },
    { stop: 0.75, color: '#5c2d12' },
    { stop: 1.0, color: '#78350f' },
  ]);

  // Deep furnace heat haze
  ctx.save();
  const furnaceGlow = safeCreateRadialGradient(ctx, w * 0.5, h * 0.6, 20, w * 0.5, h * 0.6, Math.max(30, w * 0.75));
  if (furnaceGlow) {
    furnaceGlow.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    furnaceGlow.addColorStop(0.6, 'rgba(180, 83, 9, 0.18)');
    furnaceGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = furnaceGlow;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // 2. BACKGROUND: Deep mechanism chasm silhouettes & rotating flywheels
  withParallaxTier(ctx, 'background', () => {
    // Massive background flywheel silhouette
    const bRot = time * 0.0003;
    ctx.save();
    ctx.translate(w * 0.5, h * 0.45);
    ctx.rotate(bRot);
    ctx.strokeStyle = '#291404';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.stroke();
    // 6 Spokes
    ctx.lineWidth = 6;
    for (let s = 0; s < 6; s++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos((s * Math.PI) / 3) * 110, Math.sin((s * Math.PI) / 3) * 110);
      ctx.stroke();
    }
    ctx.restore();
  });

  // 3. MIDGROUND: Interlocking brass & bronze gear trains with teeth, spokes, & rivets
  withParallaxTier(ctx, 'midground', () => {
    const drawDetailedGear = (gx: number, gy: number, gr: number, teeth: number, rot: number, colBase: string, colHigh: string) => {
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(rot);

      // Gear teeth perimeter
      ctx.fillStyle = colBase;
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const ang = (i / teeth) * Math.PI * 2;
        const rOut = gr * 1.14;
        const rIn = gr * 0.88;
        ctx.lineTo(Math.cos(ang - 0.07) * rIn, Math.sin(ang - 0.07) * rIn);
        ctx.lineTo(Math.cos(ang - 0.04) * rOut, Math.sin(ang - 0.04) * rOut);
        ctx.lineTo(Math.cos(ang + 0.04) * rOut, Math.sin(ang + 0.04) * rOut);
        ctx.lineTo(Math.cos(ang + 0.07) * rIn, Math.sin(ang + 0.07) * rIn);
      }
      ctx.closePath();
      ctx.fill();

      // Outer rim ring
      ctx.strokeStyle = colHigh;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, gr * 0.88, 0, Math.PI * 2);
      ctx.stroke();

      // Spokes
      const spokes = 5;
      ctx.lineWidth = 5;
      for (let s = 0; s < spokes; s++) {
        const sa = (s / spokes) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sa) * gr * 0.85, Math.sin(sa) * gr * 0.85);
        ctx.stroke();
      }

      // Central axle hub
      ctx.fillStyle = colHigh;
      ctx.beginPath();
      ctx.arc(0, 0, gr * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1002';
      ctx.beginPath();
      ctx.arc(0, 0, gr * 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // 2 Interlocking counter-rotating gears
    drawDetailedGear(w * 0.28, h * 0.6, 68, 16, time * 0.0006, '#b45309', '#f59e0b');
    drawDetailedGear(w * 0.72, h * 0.64, 82, 20, -time * 0.00048 + 0.15, '#78350f', '#d97706');
  });

  // 4. FOREGROUND: Heavy riveted boiler plate floor, steam vents, & sparks
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.82;
    const plateGrad = ctx.createLinearGradient(0, fgY, 0, h);
    plateGrad.addColorStop(0, '#451a03');
    plateGrad.addColorStop(0.3, '#291404');
    plateGrad.addColorStop(1, '#1a0d05');
    ctx.fillStyle = plateGrad;
    ctx.fillRect(0, fgY, w, h - fgY);

    // Brass trim along edge
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, fgY, w, 8);

    // Heavy rivets along boiler plates
    ctx.fillStyle = '#f59e0b';
    for (let rx = 10; rx < w; rx += 25) {
      ctx.beginPath();
      ctx.arc(rx, fgY + 4, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // High pressure steam billows
    ctx.save();
    ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
    for (let p = 0; p < 32; p++) {
      const px = (((p * 47.9 + Math.sin(time * 0.003 + p) * 16) % w) + w) % w;
      const py = (((h - (time * 0.028 + p * 25) % (h * 0.4))) + h) % h;
      ctx.beginPath();
      ctx.arc(px, py, 2.5 + (p % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * WORLD 18 — SAKURA BLOSSOM SHRINE / SACRED MOUNT
 * Console-grade Japanese sacred sanctuary:
 * - Serene Japanese dusk sky transitioning from deep violet-plum through rich magenta to soft peach
 * - Majestic, snow-capped Mount Fuji standing in silent grandeur against the sunset, framed by soft mist bands
 * - Traditional multi-tiered Japanese pagoda temple with curved eaves, ridge tiles, hanging bells,
 *   gnarled ancient flowering cherry blossom trees, and red lacquered torii gate
 * - Foreground stone lantern (toro) glowing with warm amber candlelight, bamboo water basin,
 *   and a dense shower of organic cherry blossom petals drifting across the screen
 */
export function renderSakuraShrine(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Serene Japanese dusk sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#3b0724' },
    { stop: 0.38, color: '#831843' },
    { stop: 0.72, color: '#be185d' },
    { stop: 1.0, color: '#fbcfe8' },
  ]);

  // Warm twilight horizon glow
  drawVolumetricSun(ctx, w * 0.5, h * 0.38, 48, '#fff1f2', 'rgba(251, 207, 232, 0.55)', 'rgba(244, 114, 182, 0.2)', 200);

  // 2. BACKGROUND: Majestic Mount Fuji silhouette & snowcap
  withParallaxTier(ctx, 'background', () => {
    // Mount Fuji volcanic cone
    ctx.save();
    const fujiGrad = ctx.createLinearGradient(0, h * 0.35, 0, h * 0.7);
    fujiGrad.addColorStop(0, '#500724');
    fujiGrad.addColorStop(1, '#831843');
    ctx.fillStyle = fujiGrad;

    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.7);
    ctx.lineTo(w * 0.5, h * 0.35);
    ctx.lineTo(w * 0.88, h * 0.7);
    ctx.closePath();
    ctx.fill();

    // Snowcap on Mount Fuji summit
    ctx.fillStyle = '#ffe4e6';
    ctx.beginPath();
    ctx.moveTo(w * 0.41, h * 0.42);
    ctx.lineTo(w * 0.5, h * 0.35);
    ctx.lineTo(w * 0.59, h * 0.42);
    // Serrated bottom edge of snowpack
    ctx.lineTo(w * 0.55, h * 0.46);
    ctx.lineTo(w * 0.5, h * 0.44);
    ctx.lineTo(w * 0.45, h * 0.46);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Soft dusk mist band across the base of Mount Fuji
    drawLayeredMist(ctx, w, h * 0.62, 45, 'rgba(251, 207, 232, 0.4)', time, 0.005, 8);
  });

  // 3. MIDGROUND: Multi-tiered Japanese pagoda, red torii gate, & flowering sakura trees
  withParallaxTier(ctx, 'midground', () => {
    // Traditional Multi-Tiered Pagoda Temple
    const pagX = w * 0.22;
    const pagY = h * 0.74;
    const tiers = 3;

    for (let t = 0; t < tiers; t++) {
      const tierRatio = t / tiers;
      const ty = pagY - (t + 1) * 26;
      const tw = 46 * (1 - tierRatio * 0.3);

      // Pagoda wooden body
      ctx.fillStyle = '#4c0519';
      ctx.fillRect(pagX - tw * 0.35, ty + 8, tw * 0.7, 18);

      // Curved sweeping pagoda roof eaves
      ctx.fillStyle = '#1c040e';
      ctx.beginPath();
      ctx.moveTo(pagX - tw * 0.6, ty + 12);
      ctx.quadraticCurveTo(pagX, ty + 4, pagX + tw * 0.6, ty + 12);
      ctx.lineTo(pagX + tw * 0.45, ty + 4);
      ctx.quadraticCurveTo(pagX, ty - 2, pagX - tw * 0.45, ty + 4);
      ctx.closePath();
      ctx.fill();
    }

    // Red lacquered Torii Gate on right
    const toriiX = w * 0.78;
    const toriiY = h * 0.74;
    ctx.fillStyle = '#e11d48';
    // 2 Main pillars
    ctx.fillRect(toriiX - 22, toriiY - 45, 6, 45);
    ctx.fillRect(toriiX + 16, toriiY - 45, 6, 45);
    // Upper curved lintel beam (Kasagi)
    ctx.beginPath();
    ctx.roundRect(toriiX - 32, toriiY - 50, 64, 7, [3, 3, 1, 1]);
    ctx.fill();
    // Lower straight tie-beam (Nuki)
    ctx.fillRect(toriiX - 26, toriiY - 38, 52, 5);

    // Ancient flowering Sakura Cherry Blossom tree with gnarled limbs
    drawOrganicTree(ctx, w * 0.85, h * 0.76, 85, {
      barkColor: '#3e1624',
      barkShadow: '#1c050e',
      leafBase: '#db2777',
      leafMid: '#f472b6',
      leafHigh: '#fbcfe8',
      sway: Math.sin(time * 0.0015) * 3,
      seed: 9,
    });
  });

  // 4. FOREGROUND: Mossy stone pathway, glowing toro stone lantern, & dense fluttering sakura petals
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.82;
    const fgGrad = ctx.createLinearGradient(0, fgY, 0, h);
    fgGrad.addColorStop(0, '#500724');
    fgGrad.addColorStop(0.4, '#3b0718');
    fgGrad.addColorStop(1, '#1c040e');
    ctx.fillStyle = fgGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = fgY + Math.sin(x * 0.007 + 1.2) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Stone Toro Lantern on left side
    const lx = w * 0.18;
    const ly = fgY + 12;
    // Stone base & pillar
    ctx.fillStyle = '#64748b';
    ctx.fillRect(lx - 4, ly - 28, 8, 28);
    ctx.fillRect(lx - 10, ly, 20, 6);
    // Light chamber glowing with candle
    ctx.save();
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 14;
    ctx.fillRect(lx - 6, ly - 38, 12, 10);
    ctx.restore();
    // Stone roof cap
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(lx - 12, ly - 38);
    ctx.lineTo(lx, ly - 46);
    ctx.lineTo(lx + 12, ly - 38);
    ctx.closePath();
    ctx.fill();

    // Shower of fluttering organic cherry blossom petals drifting across the screen
    ctx.save();
    for (let p = 0; p < 45; p++) {
      const px = (((p * 41.7 + time * 0.035) % w) + w) % w;
      const py = (((p * 63.9 + time * 0.025 + Math.sin(time * 0.002 + p) * 16) % h) + h) % h;
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
  });
}

/**
 * WORLD 19 — THE CRYSTALLINE CORE / SUBTERRANEAN GEODE ABYSS
 * Console-grade geode cavern:
 * - Subterranean cavern vault with hanging stalactites and glittering embedded mineral veins
 * - Vast subterranean cavern illuminated by an immense central pulsing geode cluster with violet/cyan atmospheric cavern haze
 * - Towering multi-faceted amethyst, quartz, and fluorite crystal pillars rising like monumental skyscrapers:
 *   sharp crystalline faces, interior light refraction, specular highlights, and glowing crystal bases
 * - Foreground dark basalt cavern floor with luminous crystal clusters erupting from stone fractures,
 *   reflecting shimmering violet mineral water, and sparkling prismatic crystal dust
 */
export function renderCrystallineCore(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Deep subterranean geode twilight vault
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#070214' },
    { stop: 0.35, color: '#150630' },
    { stop: 0.7, color: '#2e0854' },
    { stop: 1.0, color: '#3b0764' },
  ]);

  // Cavern vault stalactites descending from top ceiling
  ctx.fillStyle = '#130429';
  const stalactites = [
    { x: w * 0.12, h: 65, w: 22 },
    { x: w * 0.34, h: 90, w: 28 },
    { x: w * 0.58, h: 75, w: 24 },
    { x: w * 0.85, h: 85, w: 26 },
  ];
  stalactites.forEach(st => {
    ctx.beginPath();
    ctx.moveTo(st.x - st.w * 0.5, 0);
    ctx.lineTo(st.x, st.h);
    ctx.lineTo(st.x + st.w * 0.5, 0);
    ctx.closePath();
    ctx.fill();

    // Luminous crystal tip on stalactite
    ctx.save();
    ctx.fillStyle = '#c084fc';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(st.x, st.h, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Central pulsing geode illumination core
  const coreX = w * 0.5;
  const coreY = h * 0.55;
  const corePulse = 0.8 + 0.2 * Math.sin(time * 0.002);
  ctx.save();
  const geodeGlow = safeCreateRadialGradient(ctx, coreX, coreY, 20, coreX, coreY, Math.max(30, w * 0.65 * corePulse));
  if (geodeGlow) {
    geodeGlow.addColorStop(0, 'rgba(192, 132, 252, 0.45)');
    geodeGlow.addColorStop(0.5, 'rgba(147, 51, 234, 0.22)');
    geodeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = geodeGlow;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // 2. MIDGROUND: Towering multi-faceted amethyst & quartz crystal monolith pillars
  withParallaxTier(ctx, 'midground', () => {
    const drawFacetedPillar = (cx: number, cy: number, cw: number, ch: number, colBase: string, colHigh: string) => {
      ctx.save();
      // Outer crystal body with internal refraction gradient
      const cGrad = ctx.createLinearGradient(cx - cw * 0.5, cy, cx + cw * 0.5, cy - ch);
      cGrad.addColorStop(0, colBase);
      cGrad.addColorStop(0.4, colHigh);
      cGrad.addColorStop(0.8, '#ffffff');
      cGrad.addColorStop(1.0, colHigh);

      ctx.fillStyle = cGrad;
      ctx.shadowColor = colHigh;
      ctx.shadowBlur = 18;

      // 6-sided pointed crystal monolith
      ctx.beginPath();
      ctx.moveTo(cx - cw * 0.5, cy);
      ctx.lineTo(cx - cw * 0.35, cy - ch * 0.8);
      ctx.lineTo(cx, cy - ch);
      ctx.lineTo(cx + cw * 0.35, cy - ch * 0.8);
      ctx.lineTo(cx + cw * 0.5, cy);
      ctx.closePath();
      ctx.fill();

      // Sharp crystal facets & internal refraction lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - ch);
      ctx.lineTo(cx, cy);
      ctx.moveTo(cx - cw * 0.35, cy - ch * 0.8);
      ctx.lineTo(cx, cy - ch * 0.4);
      ctx.lineTo(cx + cw * 0.35, cy - ch * 0.8);
      ctx.stroke();

      // Apex glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy - ch, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    drawFacetedPillar(w * 0.2, h * 0.76, 28, 85, '#581c87', '#c084fc');
    drawFacetedPillar(w * 0.48, h * 0.73, 36, 110, '#3b0764', '#e9d5ff');
    drawFacetedPillar(w * 0.8, h * 0.75, 26, 75, '#0e7490', '#22d3ee');
  });

  // 3. FOREGROUND: Dark basalt cavern floor with luminous crystal clusters & prismatic dust
  withParallaxTier(ctx, 'foreground', () => {
    const fgY = h * 0.82;
    const fgGrad = ctx.createLinearGradient(0, fgY, 0, h);
    fgGrad.addColorStop(0, '#1e073a');
    fgGrad.addColorStop(0.4, '#130429');
    fgGrad.addColorStop(1, '#070214');
    ctx.fillStyle = fgGrad;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = fgY + Math.sin(x * 0.008 + 1.2) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Basalt rock formations on cavern floor
    drawNaturalRock(ctx, w * 0.15, fgY + 14, 38, 20, {
      baseColor: '#2e0854',
      highColor: '#581c87',
      shadowColor: '#070214',
    });
    drawNaturalRock(ctx, w * 0.82, fgY + 12, 44, 24, {
      baseColor: '#2e0854',
      highColor: '#581c87',
      shadowColor: '#070214',
    });

    // Sparkling prismatic crystal dust motes
    ctx.save();
    ctx.fillStyle = '#e9d5ff';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 8;
    for (let p = 0; p < 42; p++) {
      const px = (((p * 49.3 + time * 0.018) % w) + w) % w;
      const py = (((h - (time * 0.022 + p * 25) % (h * 0.45))) + h) % h;
      ctx.globalAlpha = 0.35 + 0.65 * Math.sin(time * 0.003 + p);
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}
