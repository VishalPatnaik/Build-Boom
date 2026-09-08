import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../game/store';
import { renderWorld } from '../game/themeRenderer';

export function PlayfulBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number = 0;
    let startTime = performance.now();
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const render = (now: number) => {
      time = now - startTime;
      
      
      const state = useGameStore.getState();
      let bgStyle = state.equippedBackground || 'bg-0';
      
      // If playing the campaign, force the background to match the current zone
      if (state.mode === 'campaign' && state.state === 'playing') {
         const zone = Math.floor((state.level - 1) / 2);
         bgStyle = `bg-${zone}`;
      }

      // Let the highly advanced themeRenderer handle all the visual complexity for the world!
      renderWorld(ctx, canvas.width, canvas.height, bgStyle, time, false);

      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0" 
    />
  );
}
