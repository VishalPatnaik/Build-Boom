// PLATFORM RENDERER - THEMATIC BIOME LEVEL NODES
import { ZONE_CONFIGS } from './WorldDefinitions';

export function drawPlatform(
  ctx: CanvasRenderingContext2D,
  zoneIdx: number,
  w: number,
  h: number,
  time: number,
  state: 'locked' | 'unlocked' | 'current'
) {
  ctx.save();
  ctx.translate(w / 2, h / 2);

  const config = ZONE_CONFIGS[zoneIdx] || ZONE_CONFIGS[0];
  const accentColor = config.ambient || '#22c55e';
  const pathColor = config.path || '#16a34a';

  if (state === 'current') {
    const pulse = 1 + Math.sin(time / 180) * 0.06;
    ctx.scale(pulse, pulse);
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 14;
  } else if (state === 'locked') {
    ctx.filter = 'brightness(0.4) grayscale(0.7)';
  }

  // Soft depth shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, h * 0.12, w * 0.42, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Biome-themed 3D base platform
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.4, h * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thematic border rim
  ctx.strokeStyle = state === 'locked' ? '#475569' : pathColor;
  ctx.lineWidth = state === 'current' ? 2.5 : 1.5;
  ctx.stroke();

  // Inner pedestal surface
  ctx.fillStyle = state === 'locked' ? '#1e293b' : '#1e293b';
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.04, w * 0.34, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Biome specific surface accent
  if (state !== 'locked') {
    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, -h * 0.04, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Subtle orbital ring
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.04, 12, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Locked lock indicator
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(0, -h * 0.04, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
