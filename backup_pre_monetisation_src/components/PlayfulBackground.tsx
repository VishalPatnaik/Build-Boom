import React, { useEffect, useRef } from 'react';

export function PlayfulBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    
    // Clouds
    const clouds = Array.from({ length: 8 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.7, // Keep clouds mostly in upper/mid part
      size: Math.random() * 50 + 50,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.4 + 0.3
    }));

    // Floating playful shapes in background (stars, circles, pluses)
    const shapes = Array.from({ length: 12 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 15 + 10,
      type: Math.floor(Math.random() * 3), // 0: circle, 1: star, 2: plus
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      color: ['#FF9A8B', '#FFD700', '#A8E6CF', '#FFB7B2'][Math.floor(Math.random() * 4)],
      opacity: Math.random() * 0.3 + 0.2
    }));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const drawCloud = (x: number, y: number, s: number, alpha: number) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.arc(x + s * 1.2, y + s * 0.1, s * 0.8, 0, Math.PI * 2);
      ctx.arc(x - s * 1.1, y + s * 0.2, s * 0.7, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = () => {
      time += 1;
      const w = canvas.width;
      const h = canvas.height;

      // Soft vibrant sky gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#59C1FF'); // Bright top sky
      bgGrad.addColorStop(1, '#B0E0E6'); // Softer near horizon
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw clouds
      clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x < -c.size * 3) {
          c.x = w + c.size * 3;
          c.y = Math.random() * h * 0.7;
        }
        drawCloud(c.x, c.y + Math.sin(time * 0.01 + c.speed) * 10, c.size, c.opacity);
      });

      // Draw subtle rays from center bottom to give it depth
      ctx.save();
      ctx.translate(w / 2, h);
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4 + Math.sin(time * 0.005) * 0.1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-w, -h * 2);
        ctx.lineTo(w, -h * 2);
        ctx.fill();
      }
      ctx.restore();

      // Draw floating playful shapes
      shapes.forEach(s => {
        s.x += s.speedX;
        s.y += s.speedY;
        s.rot += s.rotSpeed;

        if (s.x < -100) s.x = w + 100;
        if (s.x > w + 100) s.x = -100;
        if (s.y < -100) s.y = h + 100;
        if (s.y > h + 100) s.y = -100;

        ctx.save();
        ctx.translate(s.x, s.y + Math.sin(time * 0.02 + s.size) * 15);
        ctx.rotate(s.rot);
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = s.color;
        
        ctx.beginPath();
        if (s.type === 0) { // circle
          ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        } else if (s.type === 1) { // star
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * s.size,
                       -Math.sin((18 + i * 72) * Math.PI / 180) * s.size);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (s.size / 2),
                       -Math.sin((54 + i * 72) * Math.PI / 180) * (s.size / 2));
          }
        } else if (s.type === 2) { // plus
           ctx.rect(-s.size/2, -s.size/6, s.size, s.size/3);
           ctx.rect(-s.size/6, -s.size/2, s.size/3, s.size);
        }
        ctx.fill();
        ctx.restore();
      });

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
