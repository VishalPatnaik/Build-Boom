const fs = require('fs');

const code = `
// THEME RENDERER - BEAUTIFUL VISUAL LAYER

const EMOJI_SKINS = ['🐝','🐿️','🐧','🦊','🧑‍🚀','🛻','🦀','🔥','🤺','🛸','🍄','🦜','🧸','🗿','🤖','🐀','🐡','🦅','⚙️','👾','🖱️'];
const EMOJI_BOOMS = ['🌻','🌰','❄️','🌲','☄️','⚡','💎','🌋','🪨','🔮','✨','💣','🍬','🪙','💥','🛢️','🫧','⚡','⚙️','❌','🐛'];
const THEME_COLORS = [
  ['#87CEEB', '#E0F6FF'], // 0 Spring Meadow
  ['#FF8C00', '#FFD700'], // 1 Autumn Falls
  ['#B0E0E6', '#F0F8FF'], // 2 Frost Peaks
  ['#FF7F50', '#FF4500'], // 3 Sunset Valley
  ['#000000', '#191970'], // 4 Lunar Surface
  ['#8B0000', '#CD5C5C'], // 5 Martian Dust
  ['#4B0082', '#8A2BE2'], // 6 Crystal Cavern
  ['#3B0918', '#8B0000'], // 7 Lava Caldera
  ['#4682B4', '#B0C4DE'], // 8 Kingdom
  ['#050510', '#1F2833'], // 9 Nebula
  ['#1A2F22', '#2E8B57'], // 10 Fairy Forest
  ['#001F3F', '#006994'], // 11 High Seas
  ['#FF1493', '#FFB6C1'], // 12 Sugar Hills
  ['#B8860B', '#FFD700'], // 13 Golden Realm
  ['#000000', '#111111'], // 14 Neon City
  ['#1A1A1A', '#333333'], // 15 Slime Factory
  ['#000011', '#000033'], // 16 Trench
  ['#87CEFA', '#4682B4'], // 17 Stratosphere
  ['#3E2723', '#4E342E'], // 18 Gearworks
  ['#000000', '#001100'], // 19 Mainframe
  ['#000000', '#000000'], // 20 Terminal
];

export function renderWorld(ctx: CanvasRenderingContext2D, w: number, h: number, id: string, time: number, isPreview: boolean = false) {
  const t = parseInt((id || "").replace('bg-', '')) || 0;
  ctx.save();
  
  // Background Gradient
  const c = THEME_COLORS[t] || THEME_COLORS[0];
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, c[0]);
  grad.addColorStop(1, c[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Helper for mountains
  const drawMountains = (color: string, offset: number, heightMult: number, parallax: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for(let i=0; i<=10; i++) {
      const px = i * (w / 10);
      const py = h - (Math.sin(i*1.5 + offset + time*parallax)*h*heightMult) - h*0.2;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(w, h);
    ctx.fill();
  };

  // Helper for stars
  const drawStars = (count: number, moveSpeed: number = 0) => {
    ctx.fillStyle = '#FFF';
    for(let i=0; i<count; i++) {
      const sx = (Math.sin(i*123)*w*2 + time*moveSpeed) % w;
      const sy = Math.cos(i*321)*h;
      if (sx >= 0 && sx <= w && sy >= 0 && sy <= h) {
         ctx.fillRect(Math.abs(sx), Math.abs(sy), 1, 1);
      }
    }
  };

  // Environment specifics
  switch(t) {
    case 0: // Meadow
      drawMountains('#98FB98', 0, 0.1, 0.001);
      ctx.fillStyle='#3CB371'; ctx.beginPath(); ctx.arc(w*0.3, h, w*0.8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#228B22'; ctx.beginPath(); ctx.arc(w*0.8, h*1.1, w*0.7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.arc(w*0.2 + Math.sin(time/2000)*w*0.1, h*0.2, w*0.1, 0, Math.PI*2); ctx.fill();
      break;
    case 4: // Lunar Surface
      drawStars(100);
      // Glowing Earth in distance
      const earthGrad = ctx.createRadialGradient(w*0.8, h*0.3, 0, w*0.8, h*0.3, w*0.15);
      earthGrad.addColorStop(0, '#4169E1'); earthGrad.addColorStop(0.8, '#00008B'); earthGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = earthGrad; ctx.beginPath(); ctx.arc(w*0.8, h*0.3, w*0.15, 0, Math.PI*2); ctx.fill();
      // Green continents
      ctx.fillStyle = '#228B22';
      ctx.beginPath(); ctx.ellipse(w*0.82, h*0.28, w*0.03, h*0.02, 0.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w*0.77, h*0.32, w*0.04, h*0.015, -0.2, 0, Math.PI*2); ctx.fill();
      // Lunar surface
      ctx.fillStyle='#666'; ctx.beginPath(); ctx.arc(w*0.5, h*1.2, w, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#555'; ctx.beginPath(); ctx.arc(w*0.2, h*1.3, w*0.8, 0, Math.PI*2); ctx.fill();
      // Craters
      ctx.fillStyle='#333';
      ctx.beginPath(); ctx.ellipse(w*0.2, h*0.8, w*0.1, h*0.03, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w*0.7, h*0.9, w*0.15, h*0.04, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#777';
      ctx.beginPath(); ctx.ellipse(w*0.2, h*0.82, w*0.09, h*0.02, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w*0.7, h*0.92, w*0.13, h*0.03, 0, 0, Math.PI*2); ctx.fill();
      break;
    case 5: // Martian Dust
      ctx.fillStyle='#CD5C5C'; ctx.beginPath(); ctx.arc(w*0.5, h*1.2, w, 0, Math.PI*2); ctx.fill();
      drawMountains('#8B0000', 0, 0.2, 0);
      drawMountains('#B22222', 3, 0.1, 0);
      // Dust storm
      ctx.fillStyle='rgba(255, 69, 0, 0.3)';
      for(let i=0; i<50; i++) {
         const dx = (time*0.1 + i*40)%w;
         const dy = (time*0.05 + i*20)%h;
         ctx.fillRect(dx, dy, Math.random()*10+5, 2);
      }
      break;
    case 9: // Nebula (Cinematic Space)
      drawStars(200, 0.01);
      // Giant colorful gas clouds
      ctx.globalCompositeOperation = 'screen';
      const neb1 = ctx.createRadialGradient(w*0.3, h*0.4, 0, w*0.3, h*0.4, w*0.6);
      neb1.addColorStop(0, 'rgba(138, 43, 226, 0.4)'); neb1.addColorStop(1, 'transparent');
      ctx.fillStyle = neb1; ctx.fillRect(0,0,w,h);
      
      const neb2 = ctx.createRadialGradient(w*0.7, h*0.6, 0, w*0.7, h*0.6, w*0.5);
      neb2.addColorStop(0, 'rgba(255, 20, 147, 0.3)'); neb2.addColorStop(1, 'transparent');
      ctx.fillStyle = neb2; ctx.fillRect(0,0,w,h);
      
      const neb3 = ctx.createRadialGradient(w*0.5, h*0.2, 0, w*0.5, h*0.2, w*0.4);
      neb3.addColorStop(0, 'rgba(0, 191, 255, 0.3)'); neb3.addColorStop(1, 'transparent');
      ctx.fillStyle = neb3; ctx.fillRect(0,0,w,h);
      ctx.globalCompositeOperation = 'source-over';
      
      // Shooting star
      if (time % 5000 < 100) {
        ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(w*0.8, h*0.2); ctx.lineTo(w*0.6, h*0.4); ctx.stroke();
      }
      break;
    case 11: // High Seas
      drawMountains('#000080', 0, 0.1, 0.001); // back waves
      drawMountains('#0000CD', 2, 0.12, 0.002); // mid waves
      drawMountains('#00BFFF', 4, 0.15, 0.003); // front waves
      // Sun
      ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(w*0.8, h*0.2, w*0.1, 0, Math.PI*2); ctx.fill();
      break;
    case 14: // Neon City
      ctx.fillStyle = '#111';
      // Skyscrapers
      for(let i=0; i<10; i++) {
        const bw = w/8;
        const bx = i*bw*0.8;
        const bh = h*0.4 + Math.sin(i*99)*h*0.3;
        ctx.fillRect(bx, h-bh, bw, bh);
        // Windows
        ctx.fillStyle = (i%2===0) ? '#0FF' : '#F0F';
        for(let wy=h-bh+10; wy<h; wy+=20) {
          if (Math.random()>0.2) ctx.fillRect(bx+5, wy, bw-10, 10);
        }
        ctx.fillStyle = '#111';
      }
      // Synthwave sun
      const synthSun = ctx.createLinearGradient(0, h*0.3, 0, h*0.6);
      synthSun.addColorStop(0, '#FF1493'); synthSun.addColorStop(1, '#FFD700');
      ctx.fillStyle = synthSun; ctx.beginPath(); ctx.arc(w*0.5, h*0.5, w*0.2, 0, Math.PI*2); ctx.fill();
      // Grid lines on sun
      ctx.fillStyle = '#000';
      for(let i=0; i<5; i++) ctx.fillRect(w*0.3, h*0.5 + i*15, w*0.4, 4);
      break;
    default:
      // Generic beautiful background for others
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      for(let i=0; i<30; i++) {
        ctx.beginPath(); ctx.arc((Math.sin(i)*w + time*0.02)%w, (Math.cos(i)*h + time*0.02)%h, 2, 0, Math.PI*2); ctx.fill();
      }
      break;
  }
  ctx.restore();
}

export function renderBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, id: string, isCenter: boolean, time: number) {
  const t = parseInt((id || "").replace('skin-', '')) || 0;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  
  const bounce = Math.sin(time / 200) * 4;
  const squash = 1 + Math.sin(time / 150) * 0.1;
  ctx.translate(0, bounce);
  ctx.scale(1/squash, squash);

  // Subtle glow
  const grad = ctx.createRadialGradient(0,0,0, 0,0,w*0.6);
  grad.addColorStop(0, 'rgba(255,255,255,0.3)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(0,0,w*0.6,0,Math.PI*2); ctx.fill();

  ctx.font = \`\${w*0.6}px Arial\`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.filter = 'drop-shadow(0px 6px 4px rgba(0,0,0,0.4))';
  ctx.fillText(EMOJI_SKINS[t] || '📦', 0, 0);
  ctx.filter = 'none';
  
  ctx.restore();
}

export function renderPlate(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, id: string, time: number) {
  const t = parseInt((id || "").replace('plate-', '')) || 0;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);

  const colors = ['#228B22', '#D2691E', '#E0FFFF', '#FF4500', '#A9A9A9', '#CD5C5C', '#8A2BE2', '#8B0000', '#708090', '#1F2833', '#2E8B57', '#8B4513', '#FFB6C1', '#FFD700', '#0FF', '#32CD32', '#00008B', '#FFF', '#B87333', '#0F0', '#000'];
  const baseColor = colors[t] || '#FFF';

  ctx.fillStyle = baseColor;
  ctx.beginPath(); ctx.roundRect(-w/2, -h/2, w, h, h/2); ctx.fill();
  
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.roundRect(-w/2 + 2, -h/2 + 2, w - 4, h/2 - 2, h/4); ctx.fill();
  
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.roundRect(-w/2 + 2, h/4, w - 4, h/4, h/4); ctx.fill();

  ctx.restore();
}

export function getBoomColor(id: string) {
  const t = parseInt((id || "").replace("boom-", "")) || 0;
  const c = ["#F00", "#8B4513", "#FFF", "#FFA500", "#888", "#F00", "#0FF", "#FF4500", "#777", "#F0F", "#0FF", "#222", "#FFF", "#FFD700", "#0FF", "#32CD32", "#444", "#FFD700", "#A0522D", "#F00", "#0F0"];
  return c[t] || "#FFF";
}

export function renderBoomParticle(ctx: CanvasRenderingContext2D, p: any, time: number, id: string) {
  const t = parseInt((id || "").replace('boom-', '')) || 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = Math.max(0, p.life);
  
  const scale = 1 + (1 - p.life);
  ctx.scale(scale, scale);

  if (p.type === 'ring') {
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.stroke();
  } else {
    ctx.font = \`\${p.size * 1.5}px Arial\`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(EMOJI_BOOMS[t] || '✨', 0, 0);
  }
  
  ctx.restore();
}
`
fs.writeFileSync('src/game/themeRenderer.ts', code);
