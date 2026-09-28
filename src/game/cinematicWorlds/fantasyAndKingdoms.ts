import { drawAtmosphericSky, drawVolumetricSun, drawLayeredMist, drawCinematicStars } from './worldUtils';

/**
 * WORLD 9 — ANCIENT STONE CITADEL / CASTLE
 * Real fantasy castle: massive fortress architecture, stone towers, battlements,
 * fluttering banners, atmospheric mountain fog, warm torchlight beneath a full moon.
 */
export function renderCastle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Moonlit gothic twilight sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#020617' },
    { stop: 0.35, color: '#0f172a' },
    { stop: 0.7, color: '#1e293b' },
    { stop: 1.0, color: '#334155' },
  ]);

  drawCinematicStars(ctx, w, h, 75, time, 88);

  // Luminous full moon casting silver light
  const moonX = w * 0.82;
  const moonY = h * 0.22;
  drawVolumetricSun(ctx, moonX, moonY, 32, '#f8fafc', 'rgba(255, 255, 255, 0.45)', 'rgba(203, 213, 225, 0.15)', 150);

  // 2. Distant rugged mountain silhouettes behind the castle
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 30) {
    const y = h * 0.54 + Math.sin(x * 0.005 + 1.8) * 38 + Math.cos(x * 0.012) * 16;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Swirling nocturnal fortress fog
  drawLayeredMist(ctx, w, h * 0.6, 45, 'rgba(148, 163, 184, 0.25)', time, 0.005, 9);

  // 3. Massive castle keeps & fortress ramparts in midground
  ctx.fillStyle = '#0f172a';
  // Central Great Keep Tower
  const keepX = w * 0.35;
  const keepW = w * 0.3;
  const keepH = h * 0.38;
  ctx.fillRect(keepX, h * 0.65 - keepH, keepW, keepH + 50);

  // Tower turrets on flanks
  const turretW = w * 0.14;
  const turretH = h * 0.46;
  ctx.fillRect(w * 0.12, h * 0.65 - turretH, turretW, turretH + 50);
  ctx.fillRect(w * 0.74, h * 0.65 - turretH * 0.9, turretW, turretH * 0.9 + 50);

  // Crenelated battlements on tower tops
  const drawCrenels = (bx: number, by: number, bw: number) => {
    const numCrenels = 5;
    const cw = bw / (numCrenels * 2 - 1);
    for (let c = 0; c < numCrenels; c++) {
      ctx.fillRect(bx + c * cw * 2, by - 12, cw, 12);
    }
  };
  drawCrenels(w * 0.12, h * 0.65 - turretH, turretW);
  drawCrenels(keepX, h * 0.65 - keepH, keepW);
  drawCrenels(w * 0.74, h * 0.65 - turretH * 0.9, turretW);

  // Fluttering heraldic castle pennants/banners in wind
  const bannerWave = Math.sin(time * 0.004) * 8;
  const bannerPositions = [w * 0.19, keepX + keepW * 0.5, w * 0.81];
  bannerPositions.forEach(bx => {
    // Flagpole
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(bx - 1.5, h * 0.65 - turretH - 25, 3, 25);
    // Crimson banner
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(bx + 1.5, h * 0.65 - turretH - 25);
    ctx.lineTo(bx + 26 + bannerWave, h * 0.65 - turretH - 18);
    ctx.lineTo(bx + 1.5, h * 0.65 - turretH - 10);
    ctx.closePath();
    ctx.fill();
  });

  // Glowing arrow-slit windows and warm torchlight
  const windows = [
    { x: w * 0.19, y: h * 0.48 },
    { x: keepX + keepW * 0.3, y: h * 0.42 },
    { x: keepX + keepW * 0.7, y: h * 0.42 },
    { x: keepX + keepW * 0.5, y: h * 0.52 },
    { x: w * 0.81, y: h * 0.5 },
  ];
  windows.forEach(win => {
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(win.x - 4, win.y - 12, 8, 24, [4, 4, 1, 1]);
    ctx.fill();
    ctx.restore();
  });

  // 4. Foreground stone bridge / courtyard parapet
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  // Masonry stone blocks along bottom
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  for (let row = 0; row < 3; row++) {
    const ry = h * (0.8 + row * 0.07);
    ctx.beginPath();
    ctx.moveTo(0, ry);
    ctx.lineTo(w, ry);
    ctx.stroke();
    // Vertical joints
    const offset = row % 2 === 0 ? 0 : 35;
    for (let jx = offset; jx < w; jx += 70) {
      ctx.beginPath();
      ctx.moveTo(jx, ry);
      ctx.lineTo(jx, ry + h * 0.07);
      ctx.stroke();
    }
  }

  // Floating embers from wall braziers
  ctx.save();
  ctx.fillStyle = '#fbbf24';
  for (let p = 0; p < 24; p++) {
    const px = (((p * 67.3 + time * 0.015) % w) + w) % w;
    const py = (((h - (time * 0.02 + p * 30) % h)) + h) % h;
    ctx.globalAlpha = 0.3 + 0.6 * Math.sin(time * 0.003 + p);
    ctx.beginPath();
    ctx.arc(px, py, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 11 — ENCHANTED REDWOOD FOREST
 * Giant ancient redwood trunks, bioluminescent flora & glowing mushrooms,
 * floating fireflies, volumetric light shafts breaking through the canopy, mystical emerald mist.
 */
export function renderEnchantedForest(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Deep mystical canopy twilight sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#011c14' },
    { stop: 0.4, color: '#022c22' },
    { stop: 0.75, color: '#064e3b' },
    { stop: 1.0, color: '#047857' },
  ]);

  // Volumetric emerald god rays / sunbeams piercing the canopy
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let r = 0; r < 5; r++) {
    const rx = w * (0.15 + r * 0.18);
    const beamGrad = ctx.createLinearGradient(rx, 0, rx + 60, h);
    beamGrad.addColorStop(0, 'rgba(167, 243, 208, 0.28)');
    beamGrad.addColorStop(0.6, 'rgba(52, 211, 153, 0.15)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(rx - 20, 0);
    ctx.lineTo(rx + 20, 0);
    ctx.lineTo(rx + 90, h);
    ctx.lineTo(rx + 30, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 2. Towering massive ancient redwood trunks
  const redwoodTrunks = [
    { x: w * 0.04, w: 42 },
    { x: w * 0.24, w: 60 },
    { x: w * 0.52, w: 38 },
    { x: w * 0.72, w: 72 },
    { x: w * 0.94, w: 48 },
  ];
  redwoodTrunks.forEach(t => {
    // Bark trunk
    const trunkGrad = ctx.createLinearGradient(t.x, 0, t.x + t.w, 0);
    trunkGrad.addColorStop(0, '#1c0a05');
    trunkGrad.addColorStop(0.3, '#451a03');
    trunkGrad.addColorStop(0.7, '#78350f');
    trunkGrad.addColorStop(1.0, '#1c0a05');
    ctx.fillStyle = trunkGrad;
    ctx.fillRect(t.x, 0, t.w, h);

    // Glowing bio-luminescent moss runes on tree trunks
    ctx.fillStyle = '#6ee7b7';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 8;
    for (let m = 0; m < 4; m++) {
      const my = h * (0.3 + m * 0.14);
      ctx.fillRect(t.x + 8, my, t.w - 16, 4);
    }
    ctx.shadowBlur = 0;
  });

  // Mystical ground fog
  drawLayeredMist(ctx, w, h * 0.72, 50, 'rgba(52, 211, 153, 0.28)', time, 0.008, 11);

  // 3. Ancient moss-covered ground & twisting roots
  ctx.fillStyle = '#064e3b';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 12) {
    const y = h * 0.81 + Math.sin(x * 0.006 + 1.2) * 16;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Bioluminescent glowing mushrooms on roots
  const mushrooms = [
    { x: w * 0.16, y: h * 0.84, color: '#a7f3d0' },
    { x: w * 0.36, y: h * 0.86, color: '#67e8f9' },
    { x: w * 0.64, y: h * 0.83, color: '#c084fc' },
    { x: w * 0.85, y: h * 0.85, color: '#a7f3d0' },
  ];
  mushrooms.forEach(shroom => {
    // Mushroom stalk
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(shroom.x - 2, shroom.y - 10, 4, 10);
    // Glowing cap
    ctx.save();
    ctx.fillStyle = shroom.color;
    ctx.shadowColor = shroom.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(shroom.x, shroom.y - 10, 10, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 4. Floating glowing fireflies drifting and pulsing with soft organic light
  ctx.save();
  for (let f = 0; f < 38; f++) {
    const fx = (((f * 53.7 + Math.sin(time * 0.0018 + f) * 30) % w) + w) % w;
    const fy = (((f * 79.1 + Math.cos(time * 0.0015 + f) * 25) % h) + h) % h;
    const fr = 1.6 + (f % 3) * 0.6;
    const pulse = 0.3 + 0.7 * Math.sin(time * 0.0035 + f);
    ctx.fillStyle = f % 2 === 0 ? '#6ee7b7' : '#a7f3d0';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    ctx.globalAlpha = Math.max(0.15, pulse);
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * WORLD 12 — PIRATE CORSAIR COVE
 * Cinematic pirate environment: ocean swell, rugged sea cliffs, weathered wooden docks with lanterns,
 * distant pirate galleon with rigged sails and ropes, lantern glow under a moonlit sky.
 */
export function renderPirate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  // 1. Stormy coastal night sky
  drawAtmosphericSky(ctx, w, h, [
    { stop: 0.0, color: '#020b18' },
    { stop: 0.35, color: '#082347' },
    { stop: 0.7, color: '#0f3b6c' },
    { stop: 1.0, color: '#164e63' },
  ]);

  drawCinematicStars(ctx, w, h, 60, time, 55);

  // Stormy full moon
  const moonX = w * 0.28;
  const moonY = h * 0.24;
  drawVolumetricSun(ctx, moonX, moonY, 28, '#f8fafc', 'rgba(203, 213, 225, 0.4)', 'rgba(148, 163, 184, 0.15)', 140);

  // 2. Dramatic coastal sea cliffs
  ctx.fillStyle = '#051329';
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 25) {
    const y = h * 0.58 + Math.sin(x * 0.005 + 1.2) * 40;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Ocean swell in cove
  const seaY = h * 0.68;
  const coveWater = ctx.createLinearGradient(0, seaY, 0, h);
  coveWater.addColorStop(0, '#0c2e59');
  coveWater.addColorStop(0.5, '#071f3d');
  coveWater.addColorStop(1, '#020b18');
  ctx.fillStyle = coveWater;
  ctx.fillRect(0, seaY, w, h - seaY);

  // 3. Detailed Pirate Galleon anchored in midground
  const gx = w * 0.72;
  const gy = seaY + 18 + Math.sin(time * 0.0018) * 4;
  ctx.save();
  ctx.fillStyle = '#0a0d14';

  // Wooden Hull
  ctx.beginPath();
  ctx.moveTo(gx - 45, gy);
  ctx.lineTo(gx + 50, gy);
  ctx.lineTo(gx + 40, gy + 16);
  ctx.lineTo(gx - 35, gy + 16);
  ctx.closePath();
  ctx.fill();

  // Raised aft quarterdeck
  ctx.fillRect(gx + 18, gy - 12, 32, 14);

  // Glowing yellow lantern in captain's stern cabin
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 10;
  ctx.fillRect(gx + 34, gy - 6, 8, 6);
  ctx.shadowBlur = 0;

  // 3 Masts, crossbeam yards, and sails
  ctx.fillStyle = '#0a0d14';
  const masts = [gx - 20, gx + 6, gx + 30];
  masts.forEach((mx, idx) => {
    const mHeight = 44 + (idx === 1 ? 12 : 0);
    // Vertical mast
    ctx.fillRect(mx - 1.5, gy - mHeight, 3, mHeight);
    // Yard crossbeams
    ctx.fillRect(mx - 14, gy - mHeight * 0.75, 28, 2);
    ctx.fillRect(mx - 10, gy - mHeight * 0.35, 20, 2);
    // Furled sails billowing softly
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(mx, gy - mHeight * 0.7, 10, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#0a0d14';
  });
  ctx.restore();

  // 4. Foreground weathered wooden dock pier with rope bindings and brass lantern
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, h * 0.82, w, h * 0.18);

  // Dock timber planks
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2.0;
  for (let x = 0; x <= w; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, h * 0.82);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Wooden dock pilings
  const pilings = [w * 0.15, w * 0.45, w * 0.85];
  pilings.forEach(px => {
    ctx.fillStyle = '#292524';
    ctx.fillRect(px - 8, h * 0.78, 16, h * 0.22);
    // Hanging pirate storm lantern
    ctx.save();
    const lx = px + 12;
    const ly = h * 0.81;
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(lx, ly, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Ocean spray and sea mist
  ctx.save();
  ctx.fillStyle = '#94a3b8';
  for (let p = 0; p < 25; p++) {
    const px = (((p * 59.3 + time * 0.02) % w) + w) % w;
    const py = (((p * 83.7 - time * 0.015 + Math.sin(time * 0.002 + p) * 12) % h) + h) % h;
    ctx.globalAlpha = 0.3 + 0.5 * Math.sin(time * 0.003 + p);
    ctx.beginPath();
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
