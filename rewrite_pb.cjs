const fs = require('fs');

let code = `import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../game/store';
import { renderWorld } from '../game/themeRenderer';

export function PlayfulBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      time += 1;
      const bgStyle = useGameStore.getState().equippedBackground || 'bg-0';
      
      // Let the highly advanced themeRenderer handle all the visual complexity for the world!
      renderWorld(ctx, canvas.width, canvas.height, bgStyle, time, false);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0" 
    />
  );
}
`;

fs.writeFileSync('src/components/PlayfulBackground.tsx', code);
