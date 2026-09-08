const fs = require('fs');

let shopContent = fs.readFileSync('src/components/Shop.tsx', 'utf-8');

const newPreviewCanvas = `
function LivePreviewCanvas({ previewState }: { previewState: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 1;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Render World
      renderWorld(ctx, w, h, previewState.background, time, true);

      // Render Plate
      renderPlate(ctx, w/2 - 60, h - 80, 120, 30, previewState.plate, time);

      // Render Block (bouncing)
      const bounceY = Math.abs(Math.sin(time / 20)) * 40;
      renderBlock(ctx, w/2 - 40, h - 140 - bounceY, 80, 80, previewState.skin, false, time);
      
      // Render Boom Attacking Animation
      // A simple 120-frame loop
      const loopTime = time % 120;
      let boomX = w - 50;
      let boomY = 50;
      let boomLife = 1.0;
      let boomSize = 20;

      if (loopTime < 30) {
        // Charging
        boomSize = 20 + (loopTime / 30) * 15;
      } else if (loopTime < 90) {
        // Shooting towards plate
        const progress = (loopTime - 30) / 60;
        boomX = w - 50 - progress * (w/2);
        boomY = 50 + progress * (h - 130);
      } else {
        // Impact!
        boomX = w/2 + 10;
        boomY = h - 80;
        boomLife = 1.0 - (loopTime - 90) / 30;
        boomSize = 35 + (loopTime - 90) * 2;
      }

      if (loopTime > 10 && boomLife > 0) {
        const p = {
          x: boomX,
          y: boomY,
          rotation: Math.atan2((h - 80) - 50, (w/2 + 10) - (w - 50)),
          life: boomLife,
          size: boomSize,
          color: getBoomColor(previewState.boom)
        };
        renderBoomParticle(ctx, p, time, previewState.boom);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [previewState]);

  return (
    <canvas 
      ref={canvasRef}
      width={400}
      height={400}
      className="w-full h-full object-cover rounded-3xl"
    />
  );
}
`;

// Replace the old LivePreviewCanvas
shopContent = shopContent.replace(/function LivePreviewCanvas[\s\S]*?return \([\s\S]*?<\/canvas>[\s\S]*?\);[\s\S]*?}/m, newPreviewCanvas);

fs.writeFileSync('src/components/Shop.tsx', shopContent);
