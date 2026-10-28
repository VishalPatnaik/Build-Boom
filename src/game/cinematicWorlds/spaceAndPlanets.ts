import { drawAtmosphericSky, drawCinematicStars, withParallaxTier, drawNaturalRock } from './worldUtils';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * WORLD 5 — LUNAR SURFACE
 * Console-quality lunar landscape:
 * - Pure velvet vacuum of space with high-contrast stars and glowing Earth with swirling clouds and blue atmosphere halo
 * - Distant jagged Apennine lunar mountain massifs catching harsh directional sunlight
 * - Midground crater formations with stratified terrace walls and deep cast shadows
 * - Exploration outpost / lunar lander silhouette, multi-faceted regolith boulders with specular facets, and floating cosmic ejecta dust
 */
export function renderMoon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Deep cosmic space
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#010206' },
    { stop: 0.65, color: '#030712' },
    { stop: 1.0, color: '#0a101f' },
  ]);

  // High-density stellar field
  drawCinematicStars(ctx, w, h, 150, time, 12);

  // 2. CELESTIAL: Detailed Earthrise with swirling weather systems & atmospheric blue halo
  withParallaxTier(ctx, 'celestial', () => {
    const earthX = w * 0.78;
    const earthY = h * 0.26;
    const earthR = Math.min(52, w * 0.12);

    ctx.save();
    // Atmospheric blue halo (scattering)
    const earthHalo = safeCreateRadialGradient(ctx, earthX, earthY, earthR * 0.85, earthX, earthY, earthR * 1.7);
    if (earthHalo) {
      earthHalo.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      earthHalo.addColorStop(0.55, 'rgba(37, 99, 235, 0.18)');
      earthHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = earthHalo;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR * 1.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Earth globe with day/night terminator
    const earthSphere = safeCreateRadialGradient(ctx, earthX - earthR * 0.35, earthY - earthR * 0.35, earthR * 0.1, earthX, earthY, earthR);
    if (earthSphere) {
      earthSphere.addColorStop(0, '#38bdf8');
      earthSphere.addColorStop(0.35, '#2563eb');
      earthSphere.addColorStop(0.7, '#1e3a8a');
      earthSphere.addColorStop(0.9, '#090d16');
      earthSphere.addColorStop(1.0, '#000000');
      ctx.fillStyle = earthSphere;
    } else {
      ctx.fillStyle = '#1d4ed8';
    }
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
    ctx.fill();

    // Swirling white clouds and green/ochre continental landmasses
    ctx.save();
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
    ctx.clip();

    // Continents
    ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
    ctx.beginPath();
    ctx.ellipse(earthX - earthR * 0.25, earthY - earthR * 0.15, earthR * 0.4, earthR * 0.25, 0.3, 0, Math.PI * 2);
    ctx.ellipse(earthX + earthR * 0.2, earthY + earthR * 0.1, earthR * 0.35, earthR * 0.2, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Swirling cloud belts
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(earthX - earthR * 0.15, earthY - earthR * 0.3, earthR * 0.5, earthR * 0.15, 0.2, 0, Math.PI * 2);
    ctx.ellipse(earthX + earthR * 0.1, earthY - earthR * 0.05, earthR * 0.45, earthR * 0.18, -0.2, 0, Math.PI * 2);
    ctx.ellipse(earthX - earthR * 0.2, earthY + earthR * 0.25, earthR * 0.4, earthR * 0.14, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  });

  // 3. BACKGROUND: Distant Apennine mountain massifs
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = h * 0.6 + Math.sin(x * 0.007 + 1.2) * 36 + Math.cos(x * 0.016) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Razor-sharp sunlit mountain ridge highlights (vacuum lighting)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 12) {
      const y = h * 0.6 + Math.sin(x * 0.007 + 1.2) * 36 + Math.cos(x * 0.016) * 16;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  // 4. MIDGROUND: Crater amphitheaters with stratified terrace walls & exploration relay mast
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = h * 0.72 + Math.sin(x * 0.009 + 3.4) * 24;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Multi-tier crater amphitheaters
    const craters = [
      { x: w * 0.22, y: h * 0.74, rx: 42, ry: 14 },
      { x: w * 0.68, y: h * 0.76, rx: 55, ry: 18 },
      { x: w * 0.88, y: h * 0.73, rx: 32, ry: 10 },
    ];
    craters.forEach((cr) => {
      // Deep black crater floor shadow
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(cr.x, cr.y, cr.rx, cr.ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stratified terrace step
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cr.x, cr.y - 2, cr.rx * 0.85, cr.ry * 0.85, 0, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      // Sunlit sharp crater rim
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(cr.x, cr.y, cr.rx, cr.ry, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    });

    // Lunar Exploration Relay Mast & Habitation Module silhouette
    const baseStationX = w * 0.44;
    const baseStationY = h * 0.72;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(baseStationX - 16, baseStationY - 10, 32, 12); // Module
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(baseStationX, baseStationY - 10);
    ctx.lineTo(baseStationX, baseStationY - 32); // Antenna mast
    ctx.stroke();
    // Blinking red beacon light
    ctx.fillStyle = (Math.floor(time * 0.003) % 2 === 0) ? '#ef4444' : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(baseStationX, baseStationY - 32, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. FOREGROUND: Regolith terrain with harsh directional shadows & multi-faceted boulders
  withParallaxTier(ctx, 'foreground', () => {
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.83 + Math.sin(x * 0.012 + 0.8) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Natural multi-faceted lunar boulders with sharp specular facets
    drawNaturalRock(ctx, w * 0.12, h * 0.85, 36, 22, {
      baseColor: '#64748b',
      highColor: '#e2e8f0',
      shadowColor: '#090d16',
    });
    drawNaturalRock(ctx, w * 0.38, h * 0.87, 28, 16, {
      baseColor: '#64748b',
      highColor: '#cbd5e1',
      shadowColor: '#090d16',
    });
    drawNaturalRock(ctx, w * 0.82, h * 0.86, 42, 26, {
      baseColor: '#475569',
      highColor: '#f1f5f9',
      shadowColor: '#020617',
    });
  });

  // 6. Suspended electrostatically levitated lunar dust particles
  ctx.save();
  ctx.fillStyle = '#e2e8f0';
  for (let i = 0; i < 28; i++) {
    const px = (((i * 73.1 + time * 0.006) % w) + w) % w;
    const py = (((i * 111.7 - time * 0.004 + Math.sin(time * 0.0015 + i) * 14) % h) + h) % h;
    ctx.globalAlpha = 0.25 + 0.55 * Math.sin(time * 0.002 + i);
    ctx.beginPath();
    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 6 — MARS
 * Console-grade Martian landscape:
 * - Butterscotch ochre sky with pale blue sunset aura around distant small sun
 * - Stratified ironstone canyon walls and eroded mesas with geological rock strata
 * - Dusty ground with wind-ripple dunes, exploration rover outpost, and blowing dust storms
 */
export function renderMars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Atmosphere: Authentic Martian dusty sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#270a04' },
    { stop: 0.35, color: '#541c09' },
    { stop: 0.68, color: '#9a3412' },
    { stop: 0.88, color: '#c2410c' },
    { stop: 1.0, color: '#fed7aa' },
  ]);

  // Distant small pale sun with distinctive Martian pale-blue glow
  const sunX = w * 0.28;
  const sunY = h * 0.25;
  ctx.save();
  const martianSunHalo = safeCreateRadialGradient(ctx, sunX, sunY, 10, sunX, sunY, 140);
  if (martianSunHalo) {
    martianSunHalo.addColorStop(0, 'rgba(186, 230, 253, 0.55)');
    martianSunHalo.addColorStop(0.45, 'rgba(254, 215, 170, 0.22)');
    martianSunHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = martianSunHalo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. BACKGROUND: Stratified canyon rim & flat-topped mesas
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(0, h);
    const mesas = [
      { x1: 0, x2: w * 0.28, topY: h * 0.56 },
      { x1: w * 0.24, x2: w * 0.6, topY: h * 0.52 },
      { x1: w * 0.56, x2: w * 0.86, topY: h * 0.57 },
      { x1: w * 0.82, x2: w, topY: h * 0.54 },
    ];
    mesas.forEach((m) => {
      ctx.lineTo(m.x1, m.topY + 18);
      ctx.lineTo(m.x1 + 30, m.topY);
      ctx.lineTo(m.x2 - 30, m.topY);
      ctx.lineTo(m.x2, m.topY + 18);
    });
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Red dust haze band
    ctx.save();
    const dustHaze = ctx.createLinearGradient(0, h * 0.54, 0, h * 0.72);
    dustHaze.addColorStop(0, 'rgba(234, 88, 12, 0.38)');
    dustHaze.addColorStop(1, 'rgba(194, 65, 12, 0.15)');
    ctx.fillStyle = dustHaze;
    ctx.fillRect(0, h * 0.54, w, h * 0.18);
    ctx.restore();
  });

  // 3. MIDGROUND: Eroded redstone cliffs with sediment layers & scientific outpost
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 14) {
      const y = h * 0.7 + Math.sin(x * 0.006 + 2.1) * 26;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Sedimentary rock strata lines
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1.8;
    for (let s = 0; s < 5; s++) {
      const sy = h * (0.72 + s * 0.026);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 18) {
        const y = sy + Math.sin(x * 0.018 + s) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Natural Martian mesas & crags
    drawNaturalRock(ctx, w * 0.16, h * 0.71, 38, 24, {
      baseColor: '#9a3412',
      highColor: '#ea580c',
      shadowColor: '#451a03',
    });

    // Futuristic Martian Surface Station & Solar Panels
    const outpostX = w * 0.74;
    const outpostY = h * 0.71;
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(outpostX, outpostY - 8, 16, Math.PI, 0); // Geodesic dome
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(outpostX - 28, outpostY - 14, 18, 8); // Solar array
    ctx.strokeRect(outpostX + 10, outpostY - 14, 18, 8);
  });

  // 4. FOREGROUND: Iron oxide boulder field & wind-carved dune ripple ground
  withParallaxTier(ctx, 'foreground', () => {
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.82 + Math.sin(x * 0.01 + 0.4) * 16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Iron-rich angular boulders with harsh sunlight facets
    drawNaturalRock(ctx, w * 0.12, h * 0.84, 38, 22, {
      baseColor: '#7c2d12',
      highColor: '#ea580c',
      shadowColor: '#381308',
    });
    drawNaturalRock(ctx, w * 0.45, h * 0.86, 30, 18, {
      baseColor: '#9a3412',
      highColor: '#fb923c',
      shadowColor: '#431407',
    });
    drawNaturalRock(ctx, w * 0.84, h * 0.85, 44, 26, {
      baseColor: '#7c2d12',
      highColor: '#ea580c',
      shadowColor: '#270a04',
    });
  });

  // 5. Blowing red sand particles and dust devil streaks
  ctx.save();
  ctx.fillStyle = '#fed7aa';
  for (let p = 0; p < 50; p++) {
    const px = (((p * 47.3 + time * 0.08) % (w + 120)) - 60 + w) % w;
    const py = (((p * 83.7 + Math.sin(time * 0.003 + p) * 20) % h) + h) % h;
    const len = 4 + (p % 4) * 3;
    ctx.globalAlpha = 0.35 + 0.45 * Math.sin(time * 0.0025 + p);
    ctx.fillRect(px, py, len, 1.4);
  }
  ctx.restore();
}

/**
 * WORLD 10 — DEEP SPACE
 * Console-grade deep cosmos:
 * - Multi-octave swirling interstellar nebulae (violet, magenta, cyan filaments)
 * - Giant ringed gas planet with planetary cast shadows across rings
 * - Orbital deep-space station silhouette with solar panel wings
 * - 3D tumbling textured asteroids with crater pocks and specular rim lighting
 */
export function renderDeepSpace(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Deep cosmic void
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#020005' },
    { stop: 0.38, color: '#09021a' },
    { stop: 0.75, color: '#13042e' },
    { stop: 1.0, color: '#04010d' },
  ]);

  // Dense multi-magnitude starfield
  drawCinematicStars(ctx, w, h, 180, time, 49);

  // 2. Volumetric interstellar nebula gas clouds
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const neb1 = safeCreateRadialGradient(ctx, w * 0.32, h * 0.36, 40, w * 0.32, h * 0.36, Math.max(45, w * 0.68));
  if (neb1) {
    neb1.addColorStop(0, 'rgba(168, 85, 247, 0.48)');
    neb1.addColorStop(0.4, 'rgba(126, 34, 206, 0.28)');
    neb1.addColorStop(0.75, 'rgba(30, 27, 75, 0.12)');
    neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb1;
    ctx.fillRect(0, 0, w, h);
  }

  const neb2 = safeCreateRadialGradient(ctx, w * 0.74, h * 0.58, 30, w * 0.74, h * 0.58, Math.max(35, w * 0.52));
  if (neb2) {
    neb2.addColorStop(0, 'rgba(56, 189, 248, 0.42)');
    neb2.addColorStop(0.5, 'rgba(236, 72, 153, 0.22)');
    neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb2;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // 3. CELESTIAL: Giant majestic ringed gas planet (Saturn/Neptune-class exoplanet)
  withParallaxTier(ctx, 'celestial', () => {
    const planetX = w * 0.24;
    const planetY = h * 0.32;
    const planetR = Math.min(68, w * 0.16);

    ctx.save();
    // Back half of planetary rings
    ctx.save();
    ctx.translate(planetX, planetY);
    ctx.rotate(-0.35);
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.55)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(0, 0, planetR * 2.3, planetR * 0.58, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, planetR * 2.6, planetR * 0.68, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Planet body with atmospheric cloud bands
    const planetSphere = safeCreateRadialGradient(
      ctx,
      planetX - planetR * 0.35,
      planetY - planetR * 0.35,
      planetR * 0.1,
      planetX,
      planetY,
      planetR
    );
    if (planetSphere) {
      planetSphere.addColorStop(0, '#fef08a');
      planetSphere.addColorStop(0.35, '#f59e0b');
      planetSphere.addColorStop(0.7, '#7c2d12');
      planetSphere.addColorStop(1.0, '#09021a');
      ctx.fillStyle = planetSphere;
    } else {
      ctx.fillStyle = '#f59e0b';
    }
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
    ctx.fill();

    // Front half of planetary rings + cast shadow of planet on rings
    ctx.save();
    ctx.translate(planetX, planetY);
    ctx.rotate(-0.35);
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.75)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(0, 0, planetR * 2.3, planetR * 0.58, 0, 0, Math.PI);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, planetR * 2.6, planetR * 0.68, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // Distant spiral galaxy
    const galX = w * 0.82;
    const galY = h * 0.22;
    ctx.save();
    ctx.translate(galX, galY);
    ctx.rotate(0.5);
    ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Orbital Deep Space Station Silhouette with solar wings
    const stationX = w * 0.65;
    const stationY = h * 0.26;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(stationX - 3, stationY - 12, 6, 24); // Central truss
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(stationX - 22, stationY - 8, 16, 5); // Solar array left
    ctx.fillRect(stationX + 6, stationY - 8, 16, 5);  // Solar array right
    ctx.fillStyle = '#facc15';
    ctx.fillRect(stationX - 2, stationY - 2, 4, 4);   // Habitation core
  });

  // 4. MIDGROUND & FOREGROUND: Tumbling multi-faceted 3D asteroids
  const asteroids = [
    { x: w * 0.18, y: h * 0.72, sz: 28, rot: time * 0.0006 },
    { x: w * 0.78, y: h * 0.76, sz: 36, rot: -time * 0.0008 },
    { x: w * 0.48, y: h * 0.84, sz: 44, rot: time * 0.0005 },
  ];

  asteroids.forEach((ast) => {
    ctx.save();
    ctx.translate(ast.x, ast.y);
    ctx.rotate(ast.rot);

    // Multi-faceted rocky asteroid
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-ast.sz * 0.5, 0);
    ctx.lineTo(-ast.sz * 0.2, -ast.sz * 0.5);
    ctx.lineTo(ast.sz * 0.3, -ast.sz * 0.4);
    ctx.lineTo(ast.sz * 0.5, 0);
    ctx.lineTo(ast.sz * 0.3, ast.sz * 0.5);
    ctx.lineTo(-ast.sz * 0.3, ast.sz * 0.4);
    ctx.closePath();
    ctx.fill();

    // Sunlit bright specular facet
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(-ast.sz * 0.5, 0);
    ctx.lineTo(-ast.sz * 0.2, -ast.sz * 0.5);
    ctx.lineTo(0, -ast.sz * 0.2);
    ctx.lineTo(-ast.sz * 0.2, 0);
    ctx.closePath();
    ctx.fill();

    // Crater pockmark
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(ast.sz * 0.1, ast.sz * 0.1, ast.sz * 0.15, ast.sz * 0.09, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // 5. Cosmic stardust & micro-meteorite particles
  ctx.save();
  ctx.fillStyle = '#c084fc';
  for (let s = 0; s < 35; s++) {
    const sx = (((s * 71.3 + time * 0.02) % w) + w) % w;
    const sy = (((s * 109.7 - time * 0.015) % h) + h) % h;
    ctx.globalAlpha = 0.2 + 0.6 * Math.sin(time * 0.003 + s);
    ctx.beginPath();
    ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
