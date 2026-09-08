const fs = require('fs');

const code = `
// THEME RENDERER - HIGH QUALITY CINEMATIC VISUAL LAYER
const EMOJI_SKINS = ['🐝','🐿️','🐧','🦊','🧑‍🚀','🛻','🦀','🔥','🤺','🛸','🍄','🦜','🧸','🗿','🤖','🐀','🐡','🦅','⚙️','👾','🖱️'];
const EMOJI_BOOMS = ['🌻','🌰','❄️','🌲','☄️','⚡','💎','🌋','🪨','🔮','✨','💣','🍬','🪙','💥','🛢️','🫧','⚡','⚙️','❌','🐛'];

export function renderWorld(ctx: CanvasRenderingContext2D, w: number, h: number, id: string, time: number, isPreview: boolean = false) {
  const t = parseInt((id || "").replace('bg-', '')) || 0;
  ctx.save();
  
  // Helpers
  const drawGradient = (c1: string, c2: string) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  };
  
  const drawMountains = (color: string, offset: number, heightMult: number, parallax: number, jagged: boolean = false) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for(let i=0; i<=20; i++) {
      const px = i * (w / 20);
      let py = h - (Math.sin(i*0.8 + offset + time*parallax)*h*heightMult) - h*0.2;
      if (jagged) py += Math.sin(i*45.2)*h*0.05;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(w, h);
    ctx.fill();
  };

  const drawStars = (count: number, speed: number = 0, twinkle: boolean = false) => {
    ctx.fillStyle = '#FFF';
    for(let i=0; i<count; i++) {
      const sx = (Math.sin(i*123.45)*w*2 + time*speed) % w;
      const sy = Math.cos(i*321.12)*h;
      if (sx >= 0 && sx <= w && sy >= 0 && sy <= h) {
         if (twinkle) ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time*0.005 + i);
         ctx.fillRect(Math.abs(sx), Math.abs(sy), i%2===0?2:1, i%2===0?2:1);
      }
    }
    ctx.globalAlpha = 1;
  };

  // Render Logic
  switch(t) {
    case 0: // Meadow
      drawGradient('#4facfe', '#00f2fe');
      // Clouds
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for(let i=0; i<3; i++) {
         const cx = (w*0.2*i + time*0.02) % (w*1.5) - w*0.2;
         ctx.beginPath(); ctx.arc(cx, h*0.2 + i*20, 30 + i*10, 0, Math.PI*2); 
         ctx.arc(cx+30, h*0.2 + i*20 - 10, 40, 0, Math.PI*2);
         ctx.arc(cx+60, h*0.2 + i*20, 30, 0, Math.PI*2); ctx.fill();
      }
      drawMountains('#98FB98', 0, 0.15, 0.0005);
      drawMountains('#3CB371', 5, 0.2, 0.001);
      ctx.fillStyle='#228B22'; ctx.beginPath(); ctx.arc(w*0.8, h*1.1, w*0.7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#32CD32'; ctx.beginPath(); ctx.arc(w*0.2, h*1.2, w*0.8, 0, Math.PI*2); ctx.fill();
      // Floating seeds
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for(let i=0; i<30; i++) {
        ctx.beginPath(); ctx.arc((time*0.05 + i*37)%w, h - (time*0.02 + i*41)%(h), 2, 0, Math.PI*2); ctx.fill();
      }
      break;
    case 1: // Autumn
      drawGradient('#FF8C00', '#FFD700');
      drawMountains('#CD853F', 5, 0.15, 0.001);
      ctx.fillStyle='#8B4513'; ctx.beginPath(); ctx.arc(w*0.5, h*1.2, w, 0, Math.PI*2); ctx.fill();
      // Trees
      ctx.fillStyle='#8B4513'; ctx.fillRect(w*0.2, h*0.6, 20, h*0.4);
      ctx.fillStyle='#D2691E'; ctx.beginPath(); ctx.arc(w*0.2+10, h*0.5, 60, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#B22222'; ctx.beginPath(); ctx.arc(w*0.2-10, h*0.55, 50, 0, Math.PI*2); ctx.fill();
      // Falling leaves
      ctx.fillStyle='#FF4500';
      for(let i=0; i<40; i++) {
        ctx.save();
        ctx.translate((time*0.08 + i*50)%w, (time*0.1 + i*30)%h);
        ctx.rotate(time*0.005 + i);
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();
      }
      break;
    case 2: // Frost Peaks
      drawGradient('#B0E0E6', '#F0F8FF');
      drawMountains('#B0C4DE', 0, 0.4, 0.0005, true); // jagged back
      drawMountains('#ADD8E6', 4, 0.3, 0.001, true);  // jagged mid
      ctx.fillStyle='#FFF'; ctx.beginPath(); ctx.arc(w*0.5, h*1.2, w, 0, Math.PI*2); ctx.fill();
      // Snow
      ctx.fillStyle='rgba(255,255,255,0.8)';
      for(let i=0; i<60; i++) {
        ctx.beginPath(); ctx.arc((time*0.02 + i*30 + Math.sin(time*0.001+i)*20)%w, (time*0.1 + i*40)%h, Math.random()*2+1, 0, Math.PI*2); ctx.fill();
      }
      break;
    case 3: // Sunset
      drawGradient('#4B0082', '#FF4500');
      // Sun
      ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(w*0.5, h*0.6, w*0.2, 0, Math.PI*2); ctx.fill();
      // Silhouettes
      drawMountains('#1F001F', 2, 0.2, 0.001, true);
      ctx.fillStyle='#0A000A'; ctx.fillRect(0, h*0.8, w, h*0.2);
      break;
    case 4: // Lunar
      ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
      drawStars(150, 0, true);
      // Earth
      const eg = ctx.createRadialGradient(w*0.8, h*0.3, 0, w*0.8, h*0.3, w*0.15);
      eg.addColorStop(0, '#4169E1'); eg.addColorStop(0.8, '#00008B'); eg.addColorStop(1, 'transparent');
      ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(w*0.8, h*0.3, w*0.15, 0, Math.PI*2); ctx.fill();
      // Terrain
      ctx.fillStyle='#444'; ctx.beginPath(); ctx.arc(w*0.5, h*1.2, w, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#333'; ctx.beginPath(); ctx.arc(w*0.2, h*1.3, w*0.8, 0, Math.PI*2); ctx.fill();
      // Craters
      ctx.fillStyle='#222';
      [[0.3, 0.8, 0.1], [0.7, 0.9, 0.15], [0.1, 0.95, 0.08], [0.85, 0.75, 0.05]].forEach(([cx,cy,r]) => {
         ctx.beginPath(); ctx.ellipse(w*cx, h*cy, w*r, h*r*0.3, 0, 0, Math.PI*2); ctx.fill();
         ctx.fillStyle='#555'; ctx.beginPath(); ctx.ellipse(w*cx, h*cy+h*r*0.05, w*r*0.9, h*r*0.25, 0, 0, Math.PI*2); ctx.fill();
         ctx.fillStyle='#222';
      });
      break;
    case 5: // Mars
      drawGradient('#8B0000', '#CD5C5C');
      drawMountains('#5C1414', 0, 0.3, 0.0005, true);
      drawMountains('#801A1A', 4, 0.2, 0.001, true);
      ctx.fillStyle='#A52A2A'; ctx.beginPath(); ctx.arc(w*0.5, h*1.2, w, 0, Math.PI*2); ctx.fill();
      // Dust storm
      ctx.fillStyle='rgba(255, 69, 0, 0.4)';
      for(let i=0; i<80; i++) ctx.fillRect((time*0.2 + i*40)%w, (time*0.05 + i*20)%h, Math.random()*20+10, 2);
      break;
    case 6: // Crystal Cavern
      drawGradient('#190033', '#330066');
      ctx.globalCompositeOperation = 'screen';
      // Crystals
      for(let i=0; i<10; i++) {
        ctx.fillStyle = \`hsl(\${(i*40 + time*0.05)%360}, 100%, 50%)\`;
        ctx.beginPath();
        const bx = w*0.1*i;
        ctx.moveTo(bx, h); ctx.lineTo(bx+20, h*0.5 + Math.sin(i*22)*h*0.3); ctx.lineTo(bx+40, h); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      // Foreground
      ctx.fillStyle='#111'; ctx.fillRect(0, h*0.9, w, h*0.1);
      // Spores
      ctx.fillStyle='rgba(255,255,255,0.5)';
      for(let i=0; i<40; i++) ctx.beginPath(), ctx.arc((time*0.02 + i*50)%w, (Math.sin(time*0.001+i)*50 + i*30)%h, 2, 0, Math.PI*2), ctx.fill();
      break;
    case 7: // Lava
      drawGradient('#3B0918', '#8B0000');
      // Volcano
      ctx.fillStyle='#1A0000';
      ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w*0.4, h*0.4); ctx.lineTo(w*0.6, h*0.4); ctx.lineTo(w, h); ctx.fill();
      // Eruption
      const lavaGrad = ctx.createLinearGradient(0, h*0.4, 0, h);
      lavaGrad.addColorStop(0, '#FFF'); lavaGrad.addColorStop(0.2, '#FF4500'); lavaGrad.addColorStop(1, '#8B0000');
      ctx.fillStyle = lavaGrad;
      ctx.beginPath(); ctx.moveTo(w*0.45, h*0.4); ctx.lineTo(w*0.5, h*0.2); ctx.lineTo(w*0.55, h*0.4); ctx.fill();
      // Sparks
      ctx.fillStyle='#FFD700';
      for(let i=0; i<50; i++) ctx.fillRect(w*0.4 + Math.sin(time*0.005+i)*w*0.4, h*0.4 - (time*0.2 + i*20)%h, 3, 3);
      break;
    case 8: // Kingdom
      drawGradient('#87CEEB', '#E0F6FF');
      drawMountains('#3CB371', 0, 0.15, 0.0005);
      // Castle Silhouette
      ctx.fillStyle='#708090';
      ctx.fillRect(w*0.3, h*0.5, w*0.4, h*0.5);
      ctx.fillRect(w*0.25, h*0.4, w*0.1, h*0.6);
      ctx.fillRect(w*0.65, h*0.4, w*0.1, h*0.6);
      ctx.fillStyle='#B22222'; // Roofs
      ctx.beginPath(); ctx.moveTo(w*0.25, h*0.4); ctx.lineTo(w*0.3, h*0.3); ctx.lineTo(w*0.35, h*0.4); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w*0.65, h*0.4); ctx.lineTo(w*0.7, h*0.3); ctx.lineTo(w*0.75, h*0.4); ctx.fill();
      // Birds
      ctx.strokeStyle='#333'; ctx.lineWidth=2;
      for(let i=0; i<5; i++) {
         const bx = (time*0.05 + i*40)%w;
         const by = h*0.2 + Math.sin(time*0.005+i)*20;
         ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx+10, by-10, bx+20, by); ctx.quadraticCurveTo(bx+30, by-10, bx+40, by); ctx.stroke();
      }
      break;
    case 9: // Nebula
      ctx.fillStyle='#050510'; ctx.fillRect(0,0,w,h);
      drawStars(200, 0.01, true);
      ctx.globalCompositeOperation = 'screen';
      const neb1 = ctx.createRadialGradient(w*0.3, h*0.4, 0, w*0.3, h*0.4, w*0.6);
      neb1.addColorStop(0, 'rgba(138, 43, 226, 0.5)'); neb1.addColorStop(1, 'transparent');
      ctx.fillStyle = neb1; ctx.fillRect(0,0,w,h);
      const neb2 = ctx.createRadialGradient(w*0.7, h*0.6, 0, w*0.7, h*0.6, w*0.5);
      neb2.addColorStop(0, 'rgba(255, 20, 147, 0.4)'); neb2.addColorStop(1, 'transparent');
      ctx.fillStyle = neb2; ctx.fillRect(0,0,w,h);
      ctx.globalCompositeOperation = 'source-over';
      if (time % 4000 < 100) {
        ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(w*0.8, h*0.2); ctx.lineTo(w*0.6, h*0.4); ctx.stroke();
      }
      break;
    case 10: // Fairy Forest
      drawGradient('#0B1D12', '#1A2F22');
      // Giant mushrooms
      for(let i=0; i<5; i++) {
        ctx.fillStyle='#FFF'; ctx.fillRect(w*0.2*i+20, h*0.6, 20, h*0.4);
        ctx.fillStyle= i%2===0 ? '#9400D3' : '#00CED1';
        ctx.beginPath(); ctx.arc(w*0.2*i+30, h*0.6, 50, Math.PI, 0); ctx.fill();
      }
      // Fireflies
      ctx.fillStyle='rgba(152,251,152,0.8)';
      ctx.shadowColor='#98FB98'; ctx.shadowBlur=10;
      for(let i=0; i<40; i++) {
        ctx.beginPath(); ctx.arc((w*0.1*i + Math.sin(time*0.001+i)*50)%w, h*0.5 + Math.cos(time*0.0015+i)*h*0.3, 3, 0, Math.PI*2); ctx.fill();
      }
      ctx.shadowBlur=0;
      break;
    case 11: // High Seas
      drawGradient('#4682B4', '#708090');
      // Clouds
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(w*0.5, h*0.2, w*0.3, 0, Math.PI*2); ctx.fill();
      // Waves
      drawMountains('#000080', time*0.002, 0.1, 0, false);
      drawMountains('#0000CD', time*0.003 + 2, 0.15, 0, false);
      drawMountains('#00BFFF', time*0.004 + 4, 0.2, 0, false);
      // Lightning
      if (time % 3000 < 50) {
        ctx.strokeStyle='#FFF'; ctx.lineWidth=3;
        ctx.beginPath(); ctx.moveTo(w*0.2, 0); ctx.lineTo(w*0.3, h*0.3); ctx.lineTo(w*0.25, h*0.4); ctx.lineTo(w*0.4, h*0.8); ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.fillRect(0,0,w,h);
      }
      break;
    case 12: // Sugar Hills
      drawGradient('#FFB6C1', '#FF69B4');
      drawMountains('#FFC0CB', 0, 0.15, 0.0005);
      drawMountains('#FFF0F5', 5, 0.2, 0.001);
      // Lollipops
      for(let i=0; i<6; i++) {
        ctx.fillStyle='#FFF'; ctx.fillRect(w*0.15*i+30, h*0.5, 10, h*0.5);
        ctx.fillStyle= i%2===0 ? '#FF0000' : '#00FF00';
        ctx.beginPath(); ctx.arc(w*0.15*i+35, h*0.5, 40, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle='#FFF'; ctx.beginPath(); ctx.arc(w*0.15*i+35, h*0.5, 30, 0, Math.PI*2); ctx.fill();
      }
      // Falling sprinkles
      for(let i=0; i<30; i++) {
        ctx.fillStyle= \`hsl(\${i*30}, 100%, 50%)\`;
        ctx.fillRect((time*0.05 + i*40)%w, (time*0.1 + i*30)%h, 4, 10);
      }
      break;
    case 13: // Golden
      drawGradient('#B8860B', '#FFD700');
      // Sunburst
      ctx.save(); ctx.translate(w/2, h*0.8); ctx.rotate(time*0.0005);
      ctx.fillStyle='rgba(255,255,255,0.2)';
      for(let i=0; i<12; i++) {
         ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-w*0.1, -w); ctx.lineTo(w*0.1, -w); ctx.fill();
         ctx.rotate(Math.PI*2/12);
      }
      ctx.restore();
      // Pillars
      ctx.fillStyle='#DAA520';
      ctx.fillRect(w*0.1, h*0.3, 40, h*0.7);
      ctx.fillRect(w*0.8, h*0.3, 40, h*0.7);
      // Sparkles
      ctx.fillStyle='#FFF';
      for(let i=0; i<30; i++) ctx.fillRect((time*0.02 + i*50)%w, (time*0.05 + i*30)%h, Math.random()*4, Math.random()*4);
      break;
    case 14: // Neon City
      drawGradient('#110022', '#330033');
      // Synthwave Sun
      const synthSun = ctx.createLinearGradient(0, h*0.3, 0, h*0.7);
      synthSun.addColorStop(0, '#FF1493'); synthSun.addColorStop(1, '#FFD700');
      ctx.fillStyle = synthSun; ctx.beginPath(); ctx.arc(w*0.5, h*0.6, w*0.25, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='#330033';
      for(let i=0; i<6; i++) ctx.fillRect(w*0.2, h*0.6 + i*15, w*0.6, i*2+2);
      // Buildings
      ctx.fillStyle='#000';
      for(let i=0; i<15; i++) {
        const bw = w/12; const bx = i*bw*0.9; const bh = h*0.3 + Math.sin(i*99)*h*0.3;
        ctx.fillRect(bx, h-bh, bw, bh);
        ctx.fillStyle= (i%2===0)?'#0FF':'#F0F';
        for(let wy=h-bh+10; wy<h; wy+=20) if(Math.random()>0.3) ctx.fillRect(bx+5, wy, bw-10, 10);
        ctx.fillStyle='#000';
      }
      // Grid
      ctx.strokeStyle='rgba(255,0,255,0.5)'; ctx.lineWidth=2;
      for(let i=0; i<10; i++) {
        ctx.beginPath(); ctx.moveTo(0, h*0.8 + i*20 + (time*0.05)%20); ctx.lineTo(w, h*0.8 + i*20 + (time*0.05)%20); ctx.stroke();
      }
      break;
    case 15: // Slime
      drawGradient('#0A1A0A', '#1A331A');
      // Pipes
      ctx.fillStyle='#333'; ctx.fillRect(w*0.2, 0, 40, h); ctx.fillRect(w*0.7, 0, 40, h);
      ctx.fillStyle='#0F0';
      // Toxic pool
      ctx.fillRect(0, h*0.7, w, h*0.3);
      // Bubbles
      ctx.fillStyle='rgba(50,205,50,0.8)';
      for(let i=0; i<30; i++) {
        ctx.beginPath(); ctx.arc(w*0.1*i, h*0.7 + Math.sin(time*0.001+i)*h*0.3 - (time*0.05)%h*0.3, Math.random()*10+5, 0, Math.PI*2); ctx.fill();
      }
      break;
    case 16: // Trench
      drawGradient('#000011', '#000033');
      // Kelp
      ctx.strokeStyle='#2E8B57'; ctx.lineWidth=15; ctx.lineCap='round';
      for(let i=0; i<8; i++) {
         ctx.beginPath(); ctx.moveTo(w*0.1*i + 20, h);
         ctx.quadraticCurveTo(w*0.1*i + 20 + Math.sin(time*0.001+i)*40, h*0.6, w*0.1*i + 20 + Math.sin(time*0.0015+i)*60, h*0.4); ctx.stroke();
      }
      // Bubbles & Plankton
      ctx.fillStyle='#E0FFFF';
      for(let i=0; i<50; i++) {
        ctx.beginPath(); ctx.arc((w*0.1*i + Math.sin(time*0.001+i)*20)%w, h - (time*0.05 + i*40)%h, Math.random()*3, 0, Math.PI*2); ctx.fill();
      }
      break;
    case 17: // Stratosphere
      drawGradient('#87CEFA', '#4682B4');
      ctx.fillStyle='rgba(255,255,255,0.8)';
      ctx.beginPath(); ctx.arc(w*0.2 + (time*0.01)%w, h*0.3, w*0.15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.7 + (time*0.015)%w, h*0.5, w*0.2, 0, Math.PI*2); ctx.fill();
      // Floating Island
      ctx.fillStyle='#228B22'; ctx.beginPath(); ctx.arc(w*0.5, h*0.6 + Math.sin(time*0.001)*20, w*0.3, Math.PI, 0); ctx.fill();
      ctx.fillStyle='#8B4513'; ctx.beginPath(); ctx.moveTo(w*0.2, h*0.6 + Math.sin(time*0.001)*20); ctx.lineTo(w*0.8, h*0.6 + Math.sin(time*0.001)*20); ctx.lineTo(w*0.5, h*0.8 + Math.sin(time*0.001)*20); ctx.fill();
      break;
    case 18: // Gearworks
      drawGradient('#3E2723', '#4E342E');
      ctx.strokeStyle='rgba(218,165,32,0.5)'; ctx.lineWidth=20;
      for(let i=0; i<4; i++) {
        ctx.beginPath(); ctx.arc(w*(i*0.3), h*(0.3 + i*0.2), w*0.25, time*0.001 * (i%2===0?1:-1), time*0.001 * (i%2===0?1:-1) + Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w*(i*0.3) - Math.cos(time*0.001)*w*0.25, h*(0.3+i*0.2) - Math.sin(time*0.001)*w*0.25); ctx.lineTo(w*(i*0.3) + Math.cos(time*0.001)*w*0.25, h*(0.3+i*0.2) + Math.sin(time*0.001)*w*0.25); ctx.stroke();
      }
      ctx.fillStyle='#222'; ctx.fillRect(0, h*0.8, w, h*0.2);
      break;
    case 19: // Mainframe
      drawGradient('#000000', '#001100');
      // Grid
      ctx.strokeStyle='#0F0'; ctx.lineWidth=1;
      for(let i=0; i<w; i+=40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); }
      for(let i=0; i<h; i+=40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
      // Nodes
      ctx.fillStyle='#0F0';
      for(let i=0; i<20; i++) {
         const nx = Math.floor(Math.random()*w/40)*40;
         const ny = Math.floor(Math.random()*h/40)*40;
         ctx.fillRect(nx-5, ny-5, 10, 10);
      }
      // Binary rain
      ctx.font = '20px monospace';
      for(let i=0; i<10; i++) ctx.fillText('101010', w*0.1*i, (time*0.1 + i*100)%h);
      break;
    case 20: // Terminal
      ctx.fillStyle='#000'; ctx.fillRect(0,0,w,h);
      ctx.fillStyle='#0F0'; ctx.font='24px monospace';
      ctx.fillText('> SYSTEM BOOT...', 20, 40);
      ctx.fillText('> INITIALIZING PROTOCOLS...', 20, 80);
      if (Math.floor(time/500)%2 === 0) ctx.fillText('_', 20, 120);
      break;
    default:
      drawGradient('#222', '#000');
      drawStars(50, 0.05);
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

  const grad = ctx.createRadialGradient(0,0,0, 0,0,w*0.6);
  grad.addColorStop(0, 'rgba(255,255,255,0.3)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(0,0,w*0.6,0,Math.PI*2); ctx.fill();

  ctx.font = \`\${w*0.6}px Arial\`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.filter = 'drop-shadow(0px 6px 4px rgba(0,0,0,0.5))';
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
