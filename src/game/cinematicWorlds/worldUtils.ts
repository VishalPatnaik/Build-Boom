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
