import React, { useRef, useEffect } from 'react';
import { renderCinematicPlate } from '../../game/cinematicItems/renderCinematicPlate';
import { renderCinematicBlock } from '../../game/cinematicItems/renderCinematicBlock';
import { THEME_PALETTES } from '../../game/themeRenderer';
import { COLLECTIONS } from '../../game/collections';
import { safeCreateRadialGradient } from '../../utils/canvasUtils';

interface CampaignNodePlateProps {
  zoneIdx: number;
  state: 'locked' | 'unlocked' | 'current';
  level: number;
}

export function CampaignNodePlate({ zoneIdx, state, level }: CampaignNodePlateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';
  const themeIndex = Math.abs(zoneIdx) % 20;
  const palette = THEME_PALETTES[themeIndex] || THEME_PALETTES[0];
  const collection = COLLECTIONS[themeIndex] || COLLECTIONS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number = 0;
    const startTime = performance.now();

    const render = (now: number) => {
      const time = now - startTime;
      const w = canvas.width;
      const h = canvas.height;
      if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return;

      ctx.clearRect(0, 0, w, h);
      ctx.save();

      const cx = w / 2;
      const cy = h * 0.62;

      // 1. Ambient Biome Ground Halo
      if (!isLocked && w > 15) {
        ctx.save();
        const haloGrad = safeCreateRadialGradient(ctx, cx, cy, 5, cx, cy, Math.max(6, w * 0.44));
        if (haloGrad) {
          haloGrad.addColorStop(0, palette.glow || 'rgba(56, 189, 248, 0.35)');
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 4, w * 0.45, 16, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Render Base Landing Plate (from our authentic 20 console-grade plate library)
      ctx.save();
      ctx.translate(cx, cy);
      if (isCurrent) {
        const floatPlateY = Math.sin(time / 240) * 1.8;
        ctx.translate(0, floatPlateY);
      }
      if (isLocked) {
        ctx.filter = 'grayscale(80%) brightness(35%)';
      }
      renderCinematicPlate(ctx, w * 0.72, 22, `plate-${themeIndex}`, time);
      ctx.restore();

      // 3. Render Biome Themed Floating Material Block (from our authentic 20 console-grade block library)
      ctx.save();
      const bobY = isCurrent ? Math.sin(time / 200) * 3.5 : 0;
      const blockCy = cy - 23 + bobY;
      ctx.translate(cx, blockCy);
      const blockSize = isCurrent ? 36 : isLocked ? 28 : 32;

      if (isLocked) {
        // Locked pedestal block: dark obsidian slate with theme edge rim
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-blockSize / 2, -blockSize / 2, blockSize, blockSize, 6);
        ctx.fill();
        ctx.stroke();

        // Subtle theme accent core dot
        ctx.fillStyle = palette.primary || '#475569';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Unlocked / Current: authentic console-grade material skin (Honeycomb, Basalt, Coral Pearl, Cyber Grid, etc.)
        renderCinematicBlock(ctx, blockSize, blockSize, `skin-${themeIndex}`, true, time);
      }
      ctx.restore();

      // 4. Current Active Level Node: Radiant Orbital Energy Ring & Floating Biome Particles
      if (isCurrent) {
        // Pulsating glowing orbital ring
        ctx.save();
        const pulseR = (w * 0.38) + Math.sin(time / 160) * 3;
        ctx.strokeStyle = palette.accent || '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = palette.glow || 'rgba(56, 189, 248, 0.7)';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 8, pulseR, pulseR * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Floating biome sparkle motes around the active platform
        ctx.save();
        for (let i = 0; i < 4; i++) {
          const ang = (time * 0.002) + (i * Math.PI * 0.5);
          const orbX = cx + Math.cos(ang) * (w * 0.34);
          const orbY = (cy - 12) + Math.sin(ang) * 14;
          ctx.fillStyle = i % 2 === 0 ? (palette.accent || '#fbbf24') : (palette.primary || '#38bdf8');
          ctx.shadowColor = palette.accent || '#fbbf24';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(orbX, orbY, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.restore();

      // Run continuous RAF loop for all nodes to ensure dynamic time-based shaders & materials render smoothly
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [zoneIdx, state, isCurrent, isLocked, themeIndex, palette]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center pointer-events-none"
      title={`${collection.name} // Level ${level}`}
    >
      <canvas
        ref={canvasRef}
        width={130}
        height={130}
        className="w-full h-full block"
      />
    </div>
  );
}
