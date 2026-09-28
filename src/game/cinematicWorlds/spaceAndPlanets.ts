import { drawAtmosphericSky, drawCinematicStars, withParallaxTier } from './worldUtils';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * WORLD 5 — LUNAR SURFACE
 * Authentic moon environment: stark directional sunlight, dark pitch-black space,
 * realistic Earthrise, cratered regolith terrain, sharp shadows & lunar boulders.
 */
export function renderMoon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Deep velvet cosmic space
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#010205' },
    { stop: 0.6, color: '#030712' },
    { stop: 1.0, color: '#0b1324' },
  ]);

  // Dense, high-contrast stars with natural magnitude variation
  drawCinematicStars(ctx, w, h, 140, time, 12);

  // 2. Realistic Earthrise in the lunar sky — Celestial Parallax Tier
  withParallaxTier(ctx, 'celestial', () => {
    const earthX = w * 0.78;
    const earthY = h * 0.28;
    const earthR = Math.min(50, w * 0.11);

    ctx.save();
    // Blue atmospheric haze halo
    const earthHalo = safeCreateRadialGradient(ctx, earthX, earthY, earthR * 0.85, earthX, earthY, earthR * 1.6);
    if (earthHalo) {
      earthHalo.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      earthHalo.addColorStop(0.6, 'rgba(37, 99, 235, 0.15)');
      earthHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = earthHalo;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Earth body (deep blue oceans)
    const earthSphere = safeCreateRadialGradient(ctx, earthX - earthR * 0.35, earthY - earthR * 0.35, earthR * 0.1, earthX, earthY, earthR);
    if (earthSphere) {
      earthSphere.addColorStop(0, '#38bdf8');
      earthSphere.addColorStop(0.4, '#1d4ed8');
      earthSphere.addColorStop(0.85, '#0f172a');
      earthSphere.addColorStop(1.0, '#020617');
      ctx.fillStyle = earthSphere;
    } else {
      ctx.fillStyle = '#1d4ed8';
    }
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
    ctx.fill();

    // Swirling continents and white atmospheric cloud patterns
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(earthX - earthR * 0.2, earthY - earthR * 0.2, earthR * 0.45, earthR * 0.22, 0.4, 0, Math.PI * 2);
    ctx.ellipse(earthX + earthR * 0.15, earthY + earthR * 0.1, earthR * 0.35, earthR * 0.18, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 3. Distant lunar mountain massifs (Apennine-style ridges) — Background Parallax Layer
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.62 + Math.sin(x * 0.007 + 1.2) * 32 + Math.cos(x * 0.015) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Sharp directional sunlit highlight on ridge crests
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.62 + Math.sin(x * 0.007 + 1.2) * 32 + Math.cos(x * 0.015) * 14;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  // Midground crater rim with deep black shadow cast — Midground Parallax Layer
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const y = h * 0.73 + Math.sin(x * 0.009 + 3.4) * 22;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Midground crater bowls
    const craters = [
      { x: w * 0.24, y: h * 0.75, rx: 34, ry: 10 },
      { x: w * 0.68, y: h * 0.78, rx: 45, ry: 14 },
      { x: w * 0.88, y: h * 0.74, rx: 25, ry: 8 },
    ];
    craters.forEach(cr => {
      // Crater shadow interior
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(cr.x, cr.y, cr.rx, cr.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      // Sunlit bright lip
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(cr.x, cr.y, cr.rx, cr.ry, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    });
  });

  // 4. Foreground regolith ground with rocks and craters — Foreground Parallax Layer
  withParallaxTier(ctx, 'foreground', () => {
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.84 + Math.sin(x * 0.012 + 0.8) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Lunar boulders in foreground with harsh directional lighting
    const boulders = [
      { x: w * 0.12, y: h * 0.86, w: 18, h: 12 },
      { x: w * 0.38, y: h * 0.88, w: 14, h: 9 },
      { x: w * 0.82, y: h * 0.87, w: 22, h: 15 },
    ];
    boulders.forEach(b => {
      // Cast shadow on regolith
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(b.x + b.w * 0.6, b.y + b.h * 0.4, b.w * 0.9, b.h * 0.35, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Boulder rock body
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + b.w * 0.4, b.y - b.h);
      ctx.lineTo(b.x + b.w, b.y - b.h * 0.3);
      ctx.lineTo(b.x + b.w * 0.8, b.y + b.h * 0.4);
      ctx.lineTo(b.x - b.w * 0.1, b.y + b.h * 0.2);
      ctx.closePath();
      ctx.fill();
      // Sunlit bright facet
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + b.w * 0.4, b.y - b.h);
      ctx.lineTo(b.x + b.w * 0.6, b.y - b.h * 0.4);
      ctx.closePath();
      ctx.fill();
    });
  });

  // Floating micro-dust motes in vacuum (ejecta particles)
  ctx.save();
  ctx.fillStyle = '#e2e8f0';
  for (let i = 0; i < 22; i++) {
    const px = (((i * 73.1 + time * 0.008) % w) + w) % w;
    const py = (((i * 111.7 - time * 0.005 + Math.sin(time * 0.001 + i) * 12) % h) + h) % h;
    ctx.globalAlpha = 0.3 + 0.5 * Math.sin(time * 0.002 + i);
    ctx.beginPath();
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 6 — MARS
 * Actual Martian landscape: layered redstone mesas, stratified cliffs, dusty atmosphere,
 * pale blue sunset glow around distant sun, blowing reddish dust storm particles.
 */
export function renderMars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Martian dusty butterscotch / ochre sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#381308' },
    { stop: 0.32, color: '#7c2d12' },
    { stop: 0.65, color: '#c2410c' },
    { stop: 0.88, color: '#ea580c' },
    { stop: 1.0, color: '#fed7aa' },
  ]);

  // Distant small pale sun with distinctive Martian bluish halo
  const sunX = w * 0.28;
  const sunY = h * 0.26;
  ctx.save();
  const martianSunHalo = safeCreateRadialGradient(ctx, sunX, sunY, 12, sunX, sunY, 130);
  if (martianSunHalo) {
    martianSunHalo.addColorStop(0, 'rgba(186, 230, 253, 0.45)');
    martianSunHalo.addColorStop(0.5, 'rgba(254, 215, 170, 0.25)');
    martianSunHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = martianSunHalo;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 130, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sharp pale solar disk
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Distant massive flat-topped mesas & layered buttes — Background Parallax Layer
  withParallaxTier(ctx, 'background', () => {
    ctx.fillStyle = '#541c09';
    ctx.beginPath();
    ctx.moveTo(0, h);
    const mesas = [
      { x1: 0, x2: w * 0.25, topY: h * 0.58 },
      { x1: w * 0.22, x2: w * 0.55, topY: h * 0.54 },
      { x1: w * 0.52, x2: w * 0.85, topY: h * 0.59 },
      { x1: w * 0.82, x2: w, topY: h * 0.55 },
    ];
    mesas.forEach(m => {
      ctx.lineTo(m.x1, m.topY + 15);
      ctx.lineTo(m.x1 + 25, m.topY);
      ctx.lineTo(m.x2 - 25, m.topY);
      ctx.lineTo(m.x2, m.topY + 15);
    });
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Dense Martian dust haze layer
    ctx.save();
    const dustHaze = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.72);
    dustHaze.addColorStop(0, 'rgba(234, 88, 12, 0.35)');
    dustHaze.addColorStop(1, 'rgba(194, 65, 12, 0.15)');
    ctx.fillStyle = dustHaze;
    ctx.fillRect(0, h * 0.55, w, h * 0.17);
    ctx.restore();
  });

  // 3. Midground stratified canyon cliffs with rock layers — Midground Parallax Layer
  withParallaxTier(ctx, 'midground', () => {
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 15) {
      const y = h * 0.71 + Math.sin(x * 0.006 + 2.1) * 24;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Sedimentary horizontal rock striations
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 1.5;
    for (let s = 0; s < 4; s++) {
      const sy = h * (0.73 + s * 0.03);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        const y = sy + Math.sin(x * 0.015) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });

  // 4. Foreground iron-rich redstone boulders and scree — Foreground Parallax Layer
  withParallaxTier(ctx, 'foreground', () => {
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 10) {
      const y = h * 0.83 + Math.sin(x * 0.01 + 0.4) * 14;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Foreground martian basalt blocks
    for (let b = 0; b < 6; b++) {
      const bx = w * (0.08 + b * 0.16);
      const by = h * 0.85 + Math.sin(bx * 0.01 + 0.4) * 12;
      ctx.fillStyle = '#451a03';
      ctx.fillRect(bx - 10, by, 20, 10);
      // Sunlit top edge
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(bx - 10, by - 2, 20, 3);
    }
  });

  // 5. Blowing red dust streaks and swirling mineral particles
  ctx.save();
  ctx.fillStyle = '#fed7aa';
  for (let p = 0; p < 45; p++) {
    const px = (((p * 49.3 + time * 0.075) % (w + 100)) - 50 + w) % w;
    const py = (((p * 79.7 + Math.sin(time * 0.003 + p) * 18) % h) + h) % h;
    const len = 3 + (p % 4) * 2;
    ctx.globalAlpha = 0.35 + 0.45 * Math.sin(time * 0.002 + p);
    ctx.fillRect(px, py, len, 1.2);
  }
  ctx.restore();
}

/**
 * WORLD 10 — DEEP SPACE
 * Believable deep cosmos: volumetric colorful nebulae with swirling filaments,
 * giant ringed gas planet with cast shadows, distant spiral galaxy, floating 3D-shaded asteroids.
 */
export function renderDeepSpace(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Deep cosmic darkness
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#030108' },
    { stop: 0.4, color: '#09021a' },
    { stop: 0.8, color: '#0f0529' },
    { stop: 1.0, color: '#050110' },
  ]);

  // Multi-magnitude twinkling starfield
  drawCinematicStars(ctx, w, h, 160, time, 49);

  // 2. Volumetric interstellar nebula clouds (violet, magenta & cyan filaments)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const neb1 = safeCreateRadialGradient(ctx, w * 0.3, h * 0.35, 30, w * 0.3, h * 0.35, Math.max(35, w * 0.65));
  if (neb1) {
    neb1.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
    neb1.addColorStop(0.45, 'rgba(126, 34, 206, 0.25)');
    neb1.addColorStop(0.75, 'rgba(30, 27, 75, 0.12)');
    neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb1;
    ctx.fillRect(0, 0, w, h);
  }

  const neb2 = safeCreateRadialGradient(ctx, w * 0.72, h * 0.6, 20, w * 0.72, h * 0.6, Math.max(25, w * 0.5));
  if (neb2) {
    neb2.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
    neb2.addColorStop(0.5, 'rgba(236, 72, 153, 0.2)');
    neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb2;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();

  // 3. Giant majestic ringed gas planet (Saturn-class exoplanet)
  const planetX = w * 0.24;
  const planetY = h * 0.32;
  const planetR = Math.min(65, w * 0.15);

  ctx.save();
  // Back half of planetary rings
  ctx.save();
  ctx.translate(planetX, planetY);
  ctx.rotate(-0.35);
  ctx.strokeStyle = 'rgba(216, 180, 254, 0.55)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.ellipse(0, 0, planetR * 2.2, planetR * 0.55, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(0, 0, planetR * 2.5, planetR * 0.65, 0, Math.PI, Math.PI * 2);
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

  // Cloud bands
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
  for (let b = -4; b <= 4; b++) {
    ctx.fillRect(planetX - planetR, planetY + b * 12, planetR * 2, 5);
  }
  ctx.restore();

  // Front half of planetary rings + cast shadow of planet on rings
  ctx.save();
  ctx.translate(planetX, planetY);
  ctx.rotate(-0.35);
  ctx.strokeStyle = 'rgba(216, 180, 254, 0.7)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.ellipse(0, 0, planetR * 2.2, planetR * 0.55, 0, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(0, 0, planetR * 2.5, planetR * 0.65, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();

  ctx.restore();

  // 4. Distant glowing spiral galaxy
  const galX = w * 0.82;
  const galY = h * 0.22;
  ctx.save();
  ctx.translate(galX, galY);
  ctx.rotate(0.5);
  const galGrad = safeCreateRadialGradient(ctx, 0, 0, 2, 0, 0, 40);
  if (galGrad) {
    galGrad.addColorStop(0, '#ffffff');
    galGrad.addColorStop(0.3, '#38bdf8');
    galGrad.addColorStop(0.7, '#a855f7');
    galGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = galGrad;
  } else {
    ctx.fillStyle = '#a855f7';
  }
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. 3D shaded asteroids drifting in the cosmic field
  const asteroids = [
    { x: w * 0.15, y: h * 0.72, r: 16, rot: (time || 0) * 0.0004 },
    { x: w * 0.45, y: h * 0.82, r: 24, rot: -(time || 0) * 0.0003 },
    { x: w * 0.75, y: h * 0.74, r: 18, rot: (time || 0) * 0.0005 },
    { x: w * 0.9, y: h * 0.86, r: 14, rot: -(time || 0) * 0.0006 },
  ];
  asteroids.forEach(ast => {
    ctx.save();
    ctx.translate(ast.x, ast.y);
    ctx.rotate(ast.rot);
    const astGrad = safeCreateRadialGradient(ctx, -ast.r * 0.3, -ast.r * 0.3, ast.r * 0.1, 0, 0, ast.r);
    if (astGrad) {
      astGrad.addColorStop(0, '#94a3b8');
      astGrad.addColorStop(0.5, '#475569');
      astGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = astGrad;
    } else {
      ctx.fillStyle = '#475569';
    }
    ctx.beginPath();
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      const rad = ast.r * (0.8 + Math.sin(a * 2.3) * 0.25);
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Cosmic dust sparkles
  ctx.save();
  ctx.fillStyle = '#f5d0fe';
  for (let p = 0; p < 40; p++) {
    const px = (((p * 63.7 + time * 0.012) % w) + w) % w;
    const py = (((p * 97.3 - time * 0.008 + Math.sin(time * 0.001 + p) * 15) % h) + h) % h;
    ctx.globalAlpha = 0.3 + 0.6 * Math.sin(time * 0.002 + p);
    ctx.beginPath();
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
