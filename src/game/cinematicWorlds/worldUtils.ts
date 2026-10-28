// Shared procedural utilities for cinematic game worlds
// High performance, non-allocating helpers for atmosphere, volumetric fog, lighting, terrain, and weather
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

export interface SkyStop {
  stop: number;
  color: string;
}

export interface ParallaxLayerOffset {
  depth: number;      // 0.05 to 1.45
  speedRatio: number; // Multiplier relative to vertical/horizontal camera motion
  offsetX: number;    // Computed pixels X
  offsetY: number;    // Computed pixels Y
}

export type ParallaxTier = 'celestial' | 'background' | 'midground' | 'foreground';

export interface ParallaxState {
  enabled: boolean;
  altitudeMeters: number;
  rawAltitudePixels: number;
  verticalVelocity: number;
  pointerDisplacementX: number;
  pointerDisplacementY: number;
  towerTilt: number;
  intensity: number;
  layers: ParallaxLayerOffset[];
  backgroundOffset: { x: number; y: number };
  midgroundOffset: { x: number; y: number };
  foregroundOffset: { x: number; y: number };
}

let activeParallaxState: ParallaxState | null = null;

export function setActiveParallax(state: ParallaxState | null) {
  activeParallaxState = state;
}

export function getActiveParallax(): ParallaxState | null {
  return activeParallaxState;
}

export function getParallaxLayerOffset(layerIndex: number): { x: number; y: number } {
  if (!activeParallaxState || !activeParallaxState.enabled) {
    return { x: 0, y: 0 };
  }
  const layer = activeParallaxState.layers[layerIndex];
  if (!layer) return { x: 0, y: 0 };
  return { x: layer.offsetX, y: layer.offsetY };
}

export function getParallaxTierOffset(tier: ParallaxTier): { x: number; y: number } {
  if (!activeParallaxState || !activeParallaxState.enabled) {
    return { x: 0, y: 0 };
  }
  switch (tier) {
    case 'celestial':
      return activeParallaxState.layers[0] 
        ? { x: activeParallaxState.layers[0].offsetX, y: activeParallaxState.layers[0].offsetY } 
        : { x: 0, y: 0 };
    case 'background':
      return activeParallaxState.backgroundOffset || (activeParallaxState.layers[1] 
        ? { x: activeParallaxState.layers[1].offsetX, y: activeParallaxState.layers[1].offsetY } 
        : { x: 0, y: 0 });
    case 'midground':
      return activeParallaxState.midgroundOffset || (activeParallaxState.layers[2] 
        ? { x: activeParallaxState.layers[2].offsetX, y: activeParallaxState.layers[2].offsetY } 
        : { x: 0, y: 0 });
    case 'foreground':
      return activeParallaxState.foregroundOffset || (activeParallaxState.layers[3] 
        ? { x: activeParallaxState.layers[3].offsetX, y: activeParallaxState.layers[3].offsetY } 
        : { x: 0, y: 0 });
  }
}

export function withParallaxTier(
  ctx: CanvasRenderingContext2D,
  tier: ParallaxTier,
  renderFn: () => void
) {
  const offset = getParallaxTierOffset(tier);
  if (offset.x === 0 && offset.y === 0) {
    renderFn();
    return;
  }
  ctx.save();
  ctx.translate(offset.x, offset.y);
  renderFn();
  ctx.restore();
}

export function withParallaxLayer(
  ctx: CanvasRenderingContext2D,
  layerIndex: number,
  renderFn: () => void
) {
  const offset = getParallaxLayerOffset(layerIndex);
  if (offset.x === 0 && offset.y === 0) {
    renderFn();
    return;
  }
  ctx.save();
  ctx.translate(offset.x, offset.y);
  renderFn();
  ctx.restore();
}

export function drawAtmosphericSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stops: SkyStop[]
) {
  const p0 = getParallaxLayerOffset(0);
  const altitude = activeParallaxState?.rawAltitudePixels || 0;
  // High altitude darkening effect (transitioning into upper stratosphere / space)
  const altitudeRatio = Math.min(1.0, Math.max(0, altitude / 900));

  ctx.save();
  // Extend gradient slightly above and below to prevent edge clipping during vertical pan
  const topY = Math.min(0, p0.y - 40);
  const bottomY = Math.max(h, h + p0.y + 40);

  const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
  for (let i = 0; i < stops.length; i++) {
    grad.addColorStop(stops[i].stop, stops[i].color);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(-20, topY, w + 40, bottomY - topY + 40);

  // If climbing high into the atmosphere, overlay a subtle stratospheric darkening gradient
  if (altitudeRatio > 0.08) {
    const spaceGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    spaceGrad.addColorStop(0, `rgba(2, 6, 23, ${0.72 * altitudeRatio})`);
    spaceGrad.addColorStop(0.5, `rgba(15, 23, 42, ${0.45 * altitudeRatio})`);
    spaceGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}

export function drawVolumetricSun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  coreColor: string,
  glowColor: string,
  coronaColor: string,
  coronaRadius: number
) {
  const p0 = getParallaxLayerOffset(0);
  const sx = x + (Number.isFinite(p0.x) ? p0.x : 0);
  const sy = y + (Number.isFinite(p0.y) ? p0.y : 0);
  const safeR = Math.max(1, r);
  const safeCorona = Math.max(safeR + 5, coronaRadius);

  if (!Number.isFinite(sx) || !Number.isFinite(sy) || !Number.isFinite(safeR) || !Number.isFinite(safeCorona)) {
    return;
  }

  ctx.save();
  // Soft ambient corona glow
  const corona = safeCreateRadialGradient(ctx, sx, sy, safeR * 0.4, sx, sy, safeCorona);
  if (corona) {
    corona.addColorStop(0, coronaColor);
    corona.addColorStop(0.5, glowColor);
    corona.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(sx, sy, safeCorona, 0, Math.PI * 2);
    ctx.fill();
  }

  // Core disc with soft edge
  const disc = safeCreateRadialGradient(ctx, sx, sy, 0, sx, sy, safeR);
  if (disc) {
    disc.addColorStop(0, '#ffffff');
    disc.addColorStop(0.35, coreColor);
    disc.addColorStop(1, glowColor);
    ctx.fillStyle = disc;
  } else {
    ctx.fillStyle = coreColor;
  }
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawLayeredMist(
  ctx: CanvasRenderingContext2D,
  w: number,
  y: number,
  height: number,
  color: string,
  time: number,
  speed: number = 0.015,
  seed: number = 0
) {
  // Layer 4 (passing atmospheric mist/clouds)
  const p4 = getParallaxLayerOffset(4);
  const py = y + p4.y;

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-20, py + height);
  for (let x = -20; x <= w + 20; x += 30) {
    const nx = (x + p4.x) * 0.005 + time * speed + seed;
    const wave = Math.sin(nx) * 12 + Math.cos(nx * 2.3) * 6;
    ctx.lineTo(x, py + wave);
  }
  ctx.lineTo(w + 20, py + height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawCinematicStars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number,
  time: number,
  seed: number = 77
) {
  const p0 = getParallaxLayerOffset(0);
  const altitude = activeParallaxState?.rawAltitudePixels || 0;
  const altitudeBonus = Math.min(1.0, altitude / 600) * 0.35;

  ctx.save();
  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random distribution with Layer 0 celestial parallax
    const baseX = (((i * 197.3 + seed) % 1000) / 1000) * (w + 80) - 40;
    const baseY = (((i * 431.7 + seed * 3) % 1000) / 1000) * (h * 0.85);
    const x = baseX + p0.x * 0.7;
    const y = baseY + p0.y * 0.7;

    const sz = (i % 9 === 0) ? 2.2 : (i % 4 === 0 ? 1.6 : 1.0);
    const twinkle = 0.35 + 0.65 * Math.sin(time * 0.0025 + i * 1.9) + altitudeBonus;
    ctx.globalAlpha = Math.max(0.15, Math.min(1, twinkle));
    ctx.fillStyle = i % 6 === 0 ? '#93c5fd' : (i % 11 === 0 ? '#fde047' : '#ffffff');
    ctx.beginPath();
    ctx.arc(x, y, sz * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Occasional subtle 4-point diffraction spike on prominent stars
    if (i % 17 === 0 && twinkle > 0.75) {
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x + 5, y);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawGameplayReadabilityBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  if (!ctx || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return;
  // Vignette and central column soft contrast layer so tower and falling blocks are razor sharp
  const innerR = Math.max(10, Math.min(w, h) * 0.35);
  const outerR = Math.max(innerR + 20, Math.max(w, h) * 0.85);

  ctx.save();
  const vignette = safeCreateRadialGradient(
    ctx,
    w * 0.5,
    h * 0.5,
    innerR,
    w * 0.5,
    h * 0.5,
    outerR
  );
  if (vignette) {
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.28)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.62)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

/**
 * Natural organic tree with woody bark striations, gnarled tapering branches,
 * and multi-layered foliage volume clusters with sunlight rims and deep shadows.
 * (NO primitive circles or rectangles!)
 */
export function drawOrganicTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  options: {
    barkColor?: string;
    barkShadow?: string;
    leafBase?: string;
    leafMid?: string;
    leafHigh?: string;
    sway?: number;
    autumnLeaves?: boolean;
    seed?: number;
  } = {}
) {
  const {
    barkColor = '#3e2723',
    barkShadow = '#1b100c',
    leafBase = '#1b5e20',
    leafMid = '#2e7d32',
    leafHigh = '#4caf50',
    sway = 0,
    seed = 1,
  } = options;

  ctx.save();
  const trunkW = height * 0.16;

  // 1. Root flare & ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x + trunkW * 0.4, y + 2, trunkW * 1.8, trunkW * 0.6, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // 2. Gnarled organic trunk with branch splits
  ctx.fillStyle = barkColor;
  ctx.beginPath();
  ctx.moveTo(x - trunkW * 0.8, y);
  ctx.quadraticCurveTo(x - trunkW * 0.3, y - height * 0.35, x - trunkW * 0.2 + sway, y - height * 0.65);
  // Left branch fork
  ctx.quadraticCurveTo(x - trunkW * 0.9 + sway, y - height * 0.8, x - trunkW * 0.7 + sway * 1.2, y - height * 0.95);
  ctx.lineTo(x - trunkW * 0.4 + sway * 1.2, y - height * 0.9);
  ctx.quadraticCurveTo(x - trunkW * 0.1 + sway, y - height * 0.72, x + sway, y - height * 0.7);
  // Right branch fork
  ctx.quadraticCurveTo(x + trunkW * 0.5 + sway, y - height * 0.85, x + trunkW * 0.8 + sway * 1.2, y - height * 1.05);
  ctx.lineTo(x + trunkW * 0.55 + sway * 1.2, y - height * 1.0);
  ctx.quadraticCurveTo(x + trunkW * 0.25 + sway, y - height * 0.75, x + trunkW * 0.2 + sway, y - height * 0.6);
  ctx.quadraticCurveTo(x + trunkW * 0.35, y - height * 0.3, x + trunkW * 0.9, y);
  ctx.closePath();
  ctx.fill();

  // Bark shadow & striations
  ctx.fillStyle = barkShadow;
  ctx.beginPath();
  ctx.moveTo(x + trunkW * 0.15, y);
  ctx.quadraticCurveTo(x + trunkW * 0.15, y - height * 0.35, x + trunkW * 0.1 + sway, y - height * 0.6);
  ctx.lineTo(x + trunkW * 0.3 + sway, y - height * 0.6);
  ctx.quadraticCurveTo(x + trunkW * 0.35, y - height * 0.3, x + trunkW * 0.9, y);
  ctx.closePath();
  ctx.fill();

  // 3. Volumetric Foliage Canopy Clumps (Organic overlapping leaf masses)
  const clumps = [
    { ox: -trunkW * 0.8 + sway * 1.1, oy: -height * 0.92, rx: height * 0.38, ry: height * 0.28 },
    { ox: trunkW * 0.85 + sway * 1.2, oy: -height * 0.98, rx: height * 0.42, ry: height * 0.3 },
    { ox: sway * 1.1, oy: -height * 1.12, rx: height * 0.45, ry: height * 0.32 },
    { ox: -trunkW * 0.3 + sway * 1.15, oy: -height * 1.22, rx: height * 0.36, ry: height * 0.26 },
    { ox: trunkW * 0.4 + sway * 1.15, oy: -height * 1.18, rx: height * 0.34, ry: height * 0.25 },
  ];

  // Base shadow pass for foliage
  clumps.forEach((c) => {
    ctx.fillStyle = leafBase;
    ctx.beginPath();
    ctx.ellipse(x + c.ox, y + c.oy + c.ry * 0.15, c.rx, c.ry, 0.1, 0, Math.PI * 2);
    ctx.fill();
  });

  // Midtone leaf texture pass
  clumps.forEach((c, idx) => {
    ctx.fillStyle = leafMid;
    ctx.beginPath();
    ctx.ellipse(x + c.ox - c.rx * 0.1, y + c.oy, c.rx * 0.85, c.ry * 0.85, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Natural leaf edge micro-lobes
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const lx = x + c.ox + Math.cos(angle) * c.rx * 0.75;
      const ly = y + c.oy + Math.sin(angle) * c.ry * 0.75;
      ctx.arc(lx, ly, c.rx * 0.25, 0, Math.PI * 2);
    }
    ctx.fill();
  });

  // Highlight sunlit crown pass
  clumps.forEach((c) => {
    ctx.fillStyle = leafHigh;
    ctx.beginPath();
    ctx.ellipse(x + c.ox - c.rx * 0.25, y + c.oy - c.ry * 0.3, c.rx * 0.55, c.ry * 0.45, -0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Natural organic pine/fir tree with tapering trunk, tiered drooping boughs,
 * realistic needle masses, and optional snowpack layer.
 */
export function drawOrganicPine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  options: {
    barkColor?: string;
    needleBase?: string;
    needleHigh?: string;
    snow?: boolean;
    sway?: number;
  } = {}
) {
  const {
    barkColor = '#27170e',
    needleBase = '#064e3b',
    needleHigh = '#059669',
    snow = false,
    sway = 0,
  } = options;

  ctx.save();
  const trunkW = height * 0.1;

  // Trunk
  ctx.fillStyle = barkColor;
  ctx.beginPath();
  ctx.moveTo(x - trunkW * 0.6, y);
  ctx.lineTo(x + trunkW * 0.6, y);
  ctx.lineTo(x + trunkW * 0.15 + sway * 0.5, y - height * 0.5);
  ctx.lineTo(x - trunkW * 0.15 + sway * 0.5, y - height * 0.5);
  ctx.closePath();
  ctx.fill();

  // Tiered pine foliage boughs (from bottom to top)
  const tiers = 5;
  for (let t = 0; t < tiers; t++) {
    const tierRatio = t / tiers;
    const tierY = y - height * (0.25 + tierRatio * 0.72);
    const tierW = height * 0.45 * (1 - tierRatio * 0.65);
    const tierH = height * 0.26;
    const tierSway = sway * (0.2 + tierRatio * 0.8);

    // Deep under-shadow
    ctx.fillStyle = '#022c22';
    ctx.beginPath();
    ctx.moveTo(x + tierSway, tierY - tierH);
    ctx.lineTo(x + tierW + tierSway, tierY);
    ctx.lineTo(x - tierW + tierSway, tierY);
    ctx.closePath();
    ctx.fill();

    // Needle mass
    ctx.fillStyle = needleBase;
    ctx.beginPath();
    ctx.moveTo(x + tierSway, tierY - tierH);
    ctx.lineTo(x + tierW * 0.95 + tierSway, tierY - 2);
    // Serrated bottom boughs
    const steps = 6;
    for (let s = steps; s >= 0; s--) {
      const bx = x - tierW + (tierW * 2 * s) / steps + tierSway;
      const by = tierY + (s % 2 === 0 ? 5 : -2);
      ctx.lineTo(bx, by);
    }
    ctx.lineTo(x - tierW * 0.95 + tierSway, tierY - 2);
    ctx.closePath();
    ctx.fill();

    // Sunlit needle highlights on top edge
    ctx.fillStyle = needleHigh;
    ctx.beginPath();
    ctx.moveTo(x + tierSway, tierY - tierH);
    ctx.lineTo(x + tierW * 0.45 + tierSway, tierY - tierH * 0.3);
    ctx.lineTo(x - tierW * 0.45 + tierSway, tierY - tierH * 0.3);
    ctx.closePath();
    ctx.fill();

    // Snow cover if winter
    if (snow) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(x + tierSway, tierY - tierH);
      ctx.lineTo(x + tierW * 0.75 + tierSway, tierY - tierH * 0.25);
      ctx.quadraticCurveTo(x + tierSway, tierY - tierH * 0.05, x - tierW * 0.75 + tierSway, tierY - tierH * 0.25);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Natural organic palm tree with curved, segmented fibrous trunk,
 * hanging coconut bunch, and sweeping drooping fronds with leaflets.
 */
export function drawOrganicPalm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  options: {
    curve?: number;
    windSway?: number;
    barkColor?: string;
    frondBase?: string;
    frondHigh?: string;
  } = {}
) {
  const {
    curve = 25,
    windSway = 0,
    barkColor = '#78350f',
    frondBase = '#15803d',
    frondHigh = '#4ade80',
  } = options;

  ctx.save();
  const crownX = x + curve + windSway;
  const crownY = y - height;

  // Segmented textured curved trunk
  ctx.strokeStyle = barkColor;
  ctx.lineWidth = height * 0.09;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + curve * 0.4, y - height * 0.5, crownX, crownY);
  ctx.stroke();

  // Bark segment rings
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2.5;
  for (let r = 0.1; r <= 0.9; r += 0.08) {
    const rx = x + curve * 0.4 * r * 2 * (1 - r) + (curve + windSway) * r * r;
    const ry = y - height * r;
    ctx.beginPath();
    ctx.moveTo(rx - 4, ry);
    ctx.lineTo(rx + 4, ry - 1);
    ctx.stroke();
  }

  // Coconuts at crown
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.arc(crownX - 4, crownY + 3, 5, 0, Math.PI * 2);
  ctx.arc(crownX + 3, crownY + 4, 4.5, 0, Math.PI * 2);
  ctx.arc(crownX - 1, crownY + 6, 4, 0, Math.PI * 2);
  ctx.fill();

  // Sweeping detailed fronds
  const frondAngles = [
    -0.85, -0.5, -0.15, 0.25, 0.65, 1.05, 1.45, 1.85, 2.25, 2.65, 3.05, 3.45,
  ];

  frondAngles.forEach((baseAngle) => {
    const angle = baseAngle + Math.sin(windSway * 0.05 + baseAngle) * 0.12;
    const frondLen = height * (0.42 + Math.cos(baseAngle) * 0.08);

    const endX = crownX + Math.cos(angle) * frondLen;
    const endY = crownY + Math.sin(angle) * frondLen + frondLen * 0.38; // natural droop
    const ctrlX = crownX + Math.cos(angle) * frondLen * 0.6;
    const ctrlY = crownY + Math.sin(angle) * frondLen * 0.4 - 8;

    // Main frond stem
    ctx.strokeStyle = frondBase;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(crownX, crownY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
    ctx.stroke();

    // Leaflets along the frond
    ctx.strokeStyle = frondHigh;
    ctx.lineWidth = 1.5;
    for (let t = 0.2; t <= 0.95; t += 0.1) {
      const lx = (1 - t) * (1 - t) * crownX + 2 * (1 - t) * t * ctrlX + t * t * endX;
      const ly = (1 - t) * (1 - t) * crownY + 2 * (1 - t) * t * ctrlY + t * t * endY;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - 4, ly + 8);
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 4, ly + 8);
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * Multi-faceted natural boulder/rock with fractured planes,
 * directional sun highlights, and cast ambient shadow.
 */
export function drawNaturalRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    baseColor?: string;
    highColor?: string;
    shadowColor?: string;
  } = {}
) {
  const {
    baseColor = '#64748b',
    highColor = '#cbd5e1',
    shadowColor = '#1e293b',
  } = options;

  ctx.save();
  // Ground drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.35, y + h * 0.3, w * 0.75, h * 0.35, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Dark shadow facet
  ctx.fillStyle = shadowColor;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y);
  ctx.lineTo(x - w * 0.1, y - h);
  ctx.lineTo(x + w * 0.2, y - h * 0.85);
  ctx.lineTo(x + w * 0.6, y - h * 0.2);
  ctx.lineTo(x + w * 0.45, y + h * 0.2);
  ctx.lineTo(x - w * 0.35, y + h * 0.15);
  ctx.closePath();
  ctx.fill();

  // Main rock body facet
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y);
  ctx.lineTo(x - w * 0.1, y - h);
  ctx.lineTo(x + w * 0.1, y - h * 0.4);
  ctx.lineTo(x - w * 0.2, y + h * 0.1);
  ctx.closePath();
  ctx.fill();

  // Top sunlit facet
  ctx.fillStyle = highColor;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.35, y - h * 0.65);
  ctx.lineTo(x - w * 0.1, y - h);
  ctx.lineTo(x + w * 0.2, y - h * 0.85);
  ctx.lineTo(x + w * 0.05, y - h * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Volumetric God Rays streaming from sky/sun down through atmosphere.
 */
export function drawVolumetricGodRays(
  ctx: CanvasRenderingContext2D,
  sourceX: number,
  sourceY: number,
  targetY: number,
  w: number,
  color: string,
  time: number
) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const rays = 6;
  for (let i = 0; i < rays; i++) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.001 + i * 1.3);
    const startOffset = ((i - rays / 2) * (w / rays)) * 0.65;
    const endX = sourceX + startOffset * 2.5 + Math.sin(time * 0.0008 + i) * 60;
    const rayWidth = w * (0.08 + pulse * 0.04);

    const grad = ctx.createLinearGradient(sourceX, sourceY, endX, targetY);
    grad.addColorStop(0, color);
    grad.addColorStop(0.3, color.replace(/[\d\.]+\)$/, '0.12)'));
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(sourceX + startOffset * 0.3, sourceY);
    ctx.lineTo(endX - rayWidth, targetY);
    ctx.lineTo(endX + rayWidth, targetY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
