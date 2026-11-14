import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../game/store';
import { environmentRenderer, resolveActiveWorld } from '../game/EnvironmentRenderer';
import { drawMidground } from '../game/backdrop/midground';
import { worldArtLayer, worldArtGrade, drawArtSky } from '../game/backdrop/worldArt';
import { worldIndexFromBg } from '../game/backdrop/foregroundTerrain';

/** Screens that paint an opaque surface over the whole viewport: the shared world behind them is
 *  invisible, so it is only refreshed twice a second (still picks up world changes) instead of every frame. */
function backdropHidden(mode: string, state: string, replayOpen: boolean) {
  if (replayOpen) return true;
  if (mode === 'shop' || mode === 'academy' || mode === 'daily') return true;
  if ((mode === 'campaign' || mode === 'tournament' || mode === 'workshop') && state === 'idle') return true;
  return false;
}
/** Home lobby: where the hero tower's plate sits, so the horizon bands line up behind it. */
const HOME_GROUND = 0.62;

export function PlayfulBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number = 0;
    let time = 0;
    let lastHiddenDraw = 0;

    const resize = () => {
      const rawW = window.innerWidth || canvas.parentElement?.clientWidth || 300;
      const rawH = window.innerHeight || canvas.parentElement?.clientHeight || 300;
      // Use 1.0x DPR for background atmospheric canvas to maximize mobile framerate (cuts fill-rate by 4x)
      const targetW = Math.max(1, Math.floor(rawW));
      const targetH = Math.max(1, Math.floor(rawH));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    // Interactive pointer movement tracking for organic stereoscopic parallax tilt
    const handlePointerMove = (e: PointerEvent) => {
      const normX = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
      const normY = (e.clientY / (window.innerHeight || 1)) * 2 - 1;
      environmentRenderer.updatePointer(normX, normY);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    resize();

    const render = (now: number) => {
      time = now - startTimeRef.current;

      if (canvas.width <= 0 || canvas.height <= 0) {
        resize();
      }

      if (canvas.width <= 0 || canvas.height <= 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const rawW = window.innerWidth || canvas.parentElement?.clientWidth || canvas.width || 300;
      const rawH = window.innerHeight || canvas.parentElement?.clientHeight || canvas.height || 300;
      const logicalW = Math.max(1, Math.floor(rawW));
      const logicalH = Math.max(1, Math.floor(rawH));

      // 1. Resolve dynamic cinematic world based on active level, tournament, and mode
      const currentState = useGameStore.getState();
      if (backdropHidden(currentState.mode, currentState.state, currentState.replayModalOpen) && now - lastHiddenDraw < 500) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastHiddenDraw = now;
      const worldInfo = resolveActiveWorld({
        mode: currentState.mode,
        state: currentState.state,
        level: currentState.level,
        equippedBackground: currentState.equippedBackground,
        activeTournament: currentState.activeTournament,
        visualTheme: currentState.visualTheme,
      });

      // 2. Render dynamic environment through EnvironmentRenderer with verticality and multi-layered parallax
      try {
        environmentRenderer.render(
          ctx,
          logicalW,
          logicalH,
          time,
          worldInfo,
          currentState.towerHeight || 0,
          currentState.mode,
          currentState.state,
          currentState.towerTilt || 0
        );
        // Painted sky + colour grade, when this world has artwork (falls back to the procedural scene)
        const wIdx = worldIndexFromBg(worldInfo.worldId);
        const sky = worldArtLayer(wIdx, 'sky');
        if (sky) drawArtSky(ctx, sky, logicalW, logicalH, currentState.towerHeight || 0);
        const grade = worldArtGrade(wIdx);
        if (grade) { ctx.save(); ctx.globalAlpha = grade.alpha; ctx.fillStyle = grade.color; ctx.fillRect(0, 0, logicalW, logicalH); ctx.restore(); }
        // Same horizon bands as gameplay (one implementation): on Home they sit behind the hero tower.
        // During gameplay the game canvas draws them itself, anchored to the real plate.
        if (currentState.mode === 'menu') {
          const gy = logicalH * HOME_GROUND;
          drawMidground(ctx, logicalW, logicalH, worldIndexFromBg(worldInfo.worldId), gy, gy, 0, time);
        }
      } catch {
        // Prevent canvas transient sizing errors from interrupting frame loop
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 block"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
