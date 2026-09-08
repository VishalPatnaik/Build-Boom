export function drawScenery(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, scale: number, time: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  switch (type) {
    case 'tree':
      drawTree(ctx, '#228B22', '#006400'); break;
    case 'autumn_tree':
      drawTree(ctx, '#FF4500', '#8B0000'); break;
    case 'pine_snow':
      drawPine(ctx, '#2F4F4F', '#FFFFFF'); break;
    case 'crater':
      drawCrater(ctx); break;
    case 'moon_rock':
      drawRock(ctx, '#A9A9A9'); break;
    case 'mars_rock':
      drawRock(ctx, '#B22222'); break;
    case 'crystal_blue':
      drawCrystal(ctx, '#00FFFF', time); break;
    case 'crystal_magenta':
      drawCrystal(ctx, '#FF00FF', time); break;
    case 'volcano':
      drawVolcano(ctx, time); break;
    case 'tower':
      drawTower(ctx); break;
    case 'star_cluster':
      drawStarCluster(ctx, time); break;
    case 'giant_mushroom':
      drawMushroom(ctx, time); break;
    case 'palm_tree':
      drawPalmTree(ctx, time); break;
    case 'lollipop':
      drawLollipop(ctx); break;
    case 'candy_cane':
      drawCandyCane(ctx); break;
    case 'gold_pillar':
      drawGoldPillar(ctx, time); break;
    case 'neon_building':
      drawNeonBuilding(ctx, time); break;
    case 'acid_pool':
      drawAcidPool(ctx, time); break;
    case 'coral':
      drawCoral(ctx, time); break;
    case 'floating_island':
      drawFloatingIsland(ctx, time); break;
    case 'gear':
      drawGear(ctx, time); break;
    case 'core_crystal':
      drawCoreCrystal(ctx, time); break;
    default:
      // Fallback rock
      drawRock(ctx, '#555555');
  }

  ctx.restore();
}

function drawTree(ctx: CanvasRenderingContext2D, c1: string, c2: string) {
  // Trunk
  ctx.fillStyle = '#8B4513';
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-5, -40); ctx.lineTo(5, -40); ctx.lineTo(10, 0); ctx.fill();
  // Leaves
  ctx.fillStyle = c2;
  ctx.beginPath(); ctx.arc(0, -50, 45, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = c1;
  ctx.beginPath(); ctx.arc(-10, -60, 35, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(20, -45, 30, 0, Math.PI * 2); ctx.fill();
}

function drawPine(ctx: CanvasRenderingContext2D, c1: string, snow: string) {
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(-5, -20, 10, 20);
  for(let i=0; i<3; i++) {
    const w = 40 - i*10;
    const y = -20 - i*20;
    ctx.fillStyle = c1;
    ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(w, y); ctx.lineTo(0, y-40); ctx.fill();
    ctx.fillStyle = snow;
    ctx.beginPath(); ctx.moveTo(-w+5, y); ctx.lineTo(0, y-35); ctx.lineTo(w-5, y); ctx.lineTo(0, y-10); ctx.fill();
  }
}

function drawCrater(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(0, 0, 50, 25, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.ellipse(0, -2, 45, 20, 0, 0, Math.PI*2); ctx.fill();
}

function drawRock(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-30, 0); ctx.lineTo(-20, -20); ctx.lineTo(0, -30); ctx.lineTo(25, -15); ctx.lineTo(30, 0);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(0, -30); ctx.lineTo(10, -10); ctx.lineTo(0, 0); ctx.fill();
}

function drawCrystal(ctx: CanvasRenderingContext2D, color: string, time: number) {
  const pulse = 0.8 + Math.sin(time/200)*0.2;
  ctx.shadowColor = color; ctx.shadowBlur = 20 * pulse;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(15, -20); ctx.lineTo(0, 0); ctx.lineTo(-15, -20); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(-15, -20); ctx.lineTo(0, 0); ctx.fill();
  ctx.shadowBlur = 0;
}

function drawVolcano(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#2A0800';
  ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(-30, -100); ctx.lineTo(30, -100); ctx.lineTo(80, 0); ctx.fill();
  const glow = 0.5 + Math.sin(time/150)*0.5;
  ctx.fillStyle = `rgba(255, 69, 0, ${glow})`;
  ctx.beginPath(); ctx.ellipse(0, -100, 30, 10, 0, 0, Math.PI*2); ctx.fill();
  // Lava flows
  ctx.strokeStyle = '#FF4500'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(10, -50); ctx.lineTo(5, -20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-15, -100); ctx.lineTo(-25, -60); ctx.lineTo(-10, -30); ctx.stroke();
}

function drawTower(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#808080';
  ctx.fillRect(-20, -100, 40, 100);
  ctx.fillStyle = '#696969';
  ctx.fillRect(-25, -100, 50, 20); // Battlements
  ctx.fillStyle = '#8B0000';
  ctx.beginPath(); ctx.moveTo(-25, -100); ctx.lineTo(25, -100); ctx.lineTo(0, -160); ctx.fill(); // Roof
}

function drawStarCluster(ctx: CanvasRenderingContext2D, time: number) {
  for(let i=0; i<5; i++) {
    const x = Math.sin(i*723)*40;
    const y = Math.cos(i*312)*40 - 20;
    const r = 2 + Math.sin(time/200 + i)*1;
    ctx.fillStyle = i%2===0 ? '#00FFFF' : '#FF00FF';
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function drawMushroom(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#F5DEB3';
  ctx.fillRect(-10, -40, 20, 40); // Stem
  ctx.fillStyle = '#FF1493'; // Cap
  const bob = Math.sin(time/400)*2;
  ctx.beginPath(); ctx.ellipse(0, -40 + bob, 45, 30, 0, Math.PI, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.arc(-20, -50+bob, 6, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(15, -60+bob, 8, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(25, -45+bob, 5, 0, Math.PI*2); ctx.fill();
}

function drawPalmTree(ctx: CanvasRenderingContext2D, time: number) {
  ctx.strokeStyle = '#D2B48C'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  const sway = Math.sin(time/500)*10;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(sway, -40, sway*2, -80); ctx.stroke();
  ctx.fillStyle = '#228B22';
  for(let i=0; i<5; i++) {
    ctx.save();
    ctx.translate(sway*2, -80);
    ctx.rotate((i*Math.PI*2)/5 + sway*0.02);
    ctx.beginPath(); ctx.ellipse(30, 0, 30, 10, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

function drawLollipop(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#FFF';
  ctx.fillRect(-3, -60, 6, 60);
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath(); ctx.arc(0, -60, 25, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#FFF'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, -60, 15, 0, Math.PI); ctx.stroke();
}

function drawCandyCane(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#FFF'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -60); ctx.arc(15, -60, 15, Math.PI, 0); ctx.stroke();
  ctx.strokeStyle = '#FF0000'; ctx.lineWidth = 12; ctx.setLineDash([10, 10]);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -60); ctx.arc(15, -60, 15, Math.PI, 0); ctx.stroke();
  ctx.setLineDash([]);
}

function drawGoldPillar(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#DAA520';
  ctx.fillRect(-15, -80, 30, 80);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(-20, -90, 40, 10);
  ctx.fillRect(-20, 0, 40, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(-10, -80, 5, 80); // Highlight
}

function drawNeonBuilding(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#111';
  ctx.fillRect(-30, -120, 60, 120);
  ctx.shadowColor = '#00FFFF'; ctx.shadowBlur = 15;
  ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 2;
  const h = 100 + Math.sin(time/200)*20; // Glitch line
  ctx.beginPath(); ctx.moveTo(-30, -h); ctx.lineTo(30, -h); ctx.stroke();
  ctx.shadowBlur = 0;
  for(let y=-20; y>-110; y-=20) {
    for(let x=-20; x<30; x+=15) {
      if(Math.random()>0.2) {
        ctx.fillStyle = Math.random()>0.5 ? '#00FFFF' : '#FF00FF';
        ctx.fillRect(x, y, 10, 10);
      }
    }
  }
}

function drawAcidPool(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#32CD32';
  ctx.shadowColor = '#32CD32'; ctx.shadowBlur = 10;
  const b = Math.sin(time/300)*5;
  ctx.beginPath(); ctx.ellipse(0, 0, 50+b, 25-b/2, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ADFF2F';
  ctx.beginPath(); ctx.ellipse(-20, -5, 10, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(25, 5, 15, 8, 0, 0, Math.PI*2); ctx.fill();
}

function drawCoral(ctx: CanvasRenderingContext2D, time: number) {
  ctx.strokeStyle = '#FF7F50'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  const s = Math.sin(time/600)*5;
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(s, -30); ctx.lineTo(-15+s, -50); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s, -30); ctx.lineTo(20+s, -40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(20+s, -40); ctx.lineTo(15+s, -60); ctx.stroke();
}

function drawFloatingIsland(ctx: CanvasRenderingContext2D, time: number) {
  const yOffset = Math.sin(time/1000)*10;
  ctx.translate(0, yOffset);
  ctx.fillStyle = '#8B4513';
  ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-30, 40); ctx.lineTo(20, 50); ctx.lineTo(60, 0); ctx.fill();
  ctx.fillStyle = '#3CB371';
  ctx.beginPath(); ctx.ellipse(0, 0, 65, 15, 0, 0, Math.PI*2); ctx.fill();
  drawTree(ctx, '#228B22', '#006400');
}

function drawGear(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = '#B8860B';
  const rot = time/1000;
  ctx.rotate(rot);
  for(let i=0; i<8; i++) {
    ctx.rotate(Math.PI*2/8);
    ctx.fillRect(-5, -35, 10, 15);
  }
  ctx.beginPath(); ctx.arc(0,0,30,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#8B4513';
  ctx.beginPath(); ctx.arc(0,0,15,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2); ctx.fill();
}

function drawCoreCrystal(ctx: CanvasRenderingContext2D, time: number) {
  ctx.shadowColor = '#FF4500'; ctx.shadowBlur = 30 + Math.sin(time/150)*10;
  ctx.fillStyle = '#FF0000';
  ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(25, -20); ctx.lineTo(0, 0); ctx.lineTo(-25, -20); ctx.fill();
  ctx.fillStyle = '#FFA500';
  ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(0, 0); ctx.lineTo(-25, -20); ctx.fill();
  ctx.shadowBlur = 0;
}
