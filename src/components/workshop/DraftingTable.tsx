import React, { useEffect, useRef } from 'react';
import { SandboxOptions } from '../../game/LevelGenerator';

// The Forge's central workspace: a live technical drawing of the run you're configuring.
// Everything on it comes from the current options — drop speed sets the length of the incoming
// trajectory, bomb share sets how many of the ten queued drops are marked as bombs, wind tilts the
// tower and draws gust lines, run length sets the height gauge, and each trick toggle draws its marker.
export function DraftingTable({ options, skin }: { options: SandboxOptions; skin?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  void skin;
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    let raf = 0;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const draw = (now: number) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = c.clientWidth, H = c.clientHeight;
      if (c.width !== Math.round(W * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = reduce ? 0 : now / 1000;
      const wind = options.wind ?? 0;
      const ink = '#2E5F86', copper = '#B87A48', teal = '#2FA899', coral = '#D9634B';

      // paper + blueprint grid
      ctx.fillStyle = '#E9E2D5'; ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 12) { ctx.strokeStyle = x % 60 === 0 ? 'rgba(66,125,169,0.28)' : 'rgba(66,125,169,0.10)'; ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 12) { ctx.strokeStyle = y % 60 === 0 ? 'rgba(66,125,169,0.28)' : 'rgba(66,125,169,0.10)'; ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }

      const baseX = W * 0.36, baseY = H - 26, bs = 18;
      // ground line + plate
      ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(14, baseY + 0.5); ctx.lineTo(W - 14, baseY + 0.5); ctx.stroke();
      for (let x = 18; x < W - 14; x += 8) { ctx.beginPath(); ctx.moveTo(x, baseY); ctx.lineTo(x - 6, baseY + 6); ctx.stroke(); }
      ctx.strokeRect(baseX - 30, baseY - 7, 60, 7);

      // tower: 6 blocks leaning with the wind
      const lean = wind * 3.2;
      for (let i = 0; i < 6; i++) {
        const x = baseX - bs / 2 + lean * i * i * 0.12 + Math.sin(t * 1.6) * wind * i * 0.6, y = baseY - 7 - (i + 1) * bs;
        ctx.fillStyle = i === 5 ? 'rgba(53,214,193,0.22)' : 'rgba(46,95,134,0.10)';
        ctx.fillRect(x, y, bs, bs); ctx.strokeStyle = ink; ctx.lineWidth = 1.4; ctx.strokeRect(x + 0.5, y + 0.5, bs - 1, bs - 1);
        ctx.beginPath(); ctx.moveTo(x + 3, y + 3); ctx.lineTo(x + bs - 3, y + bs - 3); ctx.strokeStyle = 'rgba(46,95,134,0.25)'; ctx.stroke();
      }
      const topY = baseY - 7 - 6 * bs;

      // run-length gauge (left)
      const gaugeTop = 18, gaugeBot = baseY - 8, frac = Math.min(1, options.blockCount / 200);
      ctx.strokeStyle = copper; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(26, gaugeBot); ctx.lineTo(26, gaugeTop); ctx.stroke();
      for (let k = 0; k <= 4; k++) { const y = gaugeBot - ((gaugeBot - gaugeTop) * k) / 4; ctx.beginPath(); ctx.moveTo(22, y); ctx.lineTo(30, y); ctx.stroke(); }
      const gy = gaugeBot - (gaugeBot - gaugeTop) * frac;
      ctx.fillStyle = copper; ctx.beginPath(); ctx.moveTo(31, gy); ctx.lineTo(38, gy - 4); ctx.lineTo(38, gy + 4); ctx.fill();
      label(ctx, `${options.blockCount} blocks`, 42, gy + 3, copper);

      // incoming drop: trajectory length grows with speed
      const sp = options.speedMultiplier;
      const startX = W - 34, startY = 22, endX = baseX + 14, endY = topY - 10;
      const len = Math.min(1, 0.35 + (sp - 0.5) / 2 * 0.65);
      const sx = endX + (startX - endX) * len, sy = endY + (startY - endY) * len;
      ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t * 30 * sp; ctx.strokeStyle = teal; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo((sx + endX) / 2 + 10, sy - 8, endX, endY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = teal; ctx.beginPath(); ctx.arc(endX, endY, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = teal; ctx.strokeRect(sx - 7, sy - 7, 14, 14);
      label(ctx, `${sp.toFixed(2)}× speed`, Math.min(W - 92, sx - 30), sy - 12, teal);

      // drop queue: ten slots, bombs marked
      const bombs = Math.round(options.boomChance * 10), qx = W - 30, qy0 = 52;
      for (let k = 0; k < 10; k++) {
        const y = qy0 + k * 11; const isBomb = k < bombs;
        ctx.strokeStyle = isBomb ? coral : ink; ctx.lineWidth = 1.2;
        if (isBomb) { ctx.beginPath(); ctx.arc(qx, y, 4, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(qx + 3, y - 3); ctx.lineTo(qx + 6, y - 6); ctx.stroke(); }
        else ctx.strokeRect(qx - 4, y - 4, 8, 8);
      }
      label(ctx, `${Math.round(options.boomChance * 100)}% bombs`, qx - 70, qy0 + 10 * 11 + 6, coral);

      // wind: gust lines across the upper field
      if (wind > 0.01) {
        ctx.strokeStyle = 'rgba(46,95,134,0.55)'; ctx.lineWidth = 1.2;
        const n = 2 + Math.round(wind * 5);
        for (let k = 0; k < n; k++) {
          const y = 34 + k * 14, x0 = ((t * 60 * (0.5 + wind) + k * 47) % (W * 0.6)) + 40;
          ctx.beginPath(); ctx.moveTo(x0, y); ctx.bezierCurveTo(x0 + 18, y - 5, x0 + 30, y + 5, x0 + 48, y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x0 + 48, y); ctx.lineTo(x0 + 43, y - 3); ctx.moveTo(x0 + 48, y); ctx.lineTo(x0 + 43, y + 3); ctx.stroke();
        }
        label(ctx, `wind ${Math.round(wind * 100)}%`, 46, 26, ink);
      }

      // trick markers under the ground line
      const tricks: Array<[boolean, string]> = [[options.allowGhosts, 'ghosts'], [options.allowBlinks, 'blinks'], [options.allowFakes, 'fakes'], [options.allowSpecialBlocks, 'specials']];
      let tx = 14;
      ctx.font = '600 10px Manrope, sans-serif';
      for (const [on, name] of tricks) {
        const wdt = ctx.measureText(name).width + 14;
        ctx.globalAlpha = on ? 1 : 0.35;
        ctx.strokeStyle = on ? copper : ink; ctx.setLineDash(on ? [] : [3, 2]); ctx.strokeRect(tx + 0.5, H - 15.5, wdt, 12); ctx.setLineDash([]);
        ctx.fillStyle = on ? copper : ink; ctx.fillText(name, tx + 7, H - 6);
        ctx.globalAlpha = 1; tx += wdt + 6;
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [options]);
  return <canvas ref={ref} className="w-full h-[210px] block rounded-[6px]" aria-label="Drawing of the run you are setting up" role="img" />;
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
  ctx.font = '700 10.5px "IBM Plex Mono", monospace';
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}
