import { ZONE_CONFIGS } from './WorldDefinitions';

export function drawPlatform(ctx: CanvasRenderingContext2D, zoneIdx: number, w: number, h: number, time: number, state: 'locked' | 'unlocked' | 'current') {
  ctx.save();
  ctx.translate(w/2, h/2);

  if (state === 'current') {
    const pulse = 1 + Math.sin(time/200)*0.1;
    ctx.scale(pulse, pulse);
    ctx.shadowColor = '#FFF';
    ctx.shadowBlur = 20;
  } else if (state === 'locked') {
    ctx.filter = 'brightness(0.5) grayscale(0.8)';
  }

  // Draw base platform shape depending on theme
  const config = ZONE_CONFIGS[zoneIdx];
  
  if (zoneIdx === 4 || zoneIdx === 5) { // Moon/Mars
    ctx.fillStyle = config.path;
    ctx.beginPath(); ctx.ellipse(0, 0, w*0.4, h*0.25, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = config.ambient;
    ctx.beginPath(); ctx.ellipse(0, -h*0.05, w*0.35, h*0.2, 0, 0, Math.PI*2); ctx.fill();
  } 
  else if (zoneIdx === 12) { // Candy
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath(); ctx.ellipse(0, 0, w*0.4, h*0.25, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#FFF'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(0, 0, w*0.3, h*0.15, 0, 0, Math.PI*2); ctx.stroke();
  }
  else if (zoneIdx === 11 || zoneIdx === 16) { // Water/Pirate
    ctx.fillStyle = '#8B4513'; // Wooden dock
    ctx.fillRect(-w*0.3, -h*0.2, w*0.6, h*0.4);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(-w*0.3, -h*0.2, w*0.6, h*0.3); // Top face
  }
  else if (zoneIdx === 7 || zoneIdx === 19) { // Volcano/Core
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.moveTo(-w*0.4, 0); ctx.lineTo(0, h*0.3); ctx.lineTo(w*0.4, 0); ctx.lineTo(0, -h*0.3); ctx.fill();
    ctx.fillStyle = '#FF4500'; // Lava glow center
    ctx.beginPath(); ctx.ellipse(0, 0, w*0.2, h*0.1, 0, 0, Math.PI*2); ctx.fill();
  }
  else {
    // Default organic stone pad
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(0, h*0.1, w*0.4, h*0.2, 0, 0, Math.PI*2); ctx.fill(); // shadow
    ctx.fillStyle = config.path;
    ctx.beginPath(); ctx.ellipse(0, 0, w*0.4, h*0.25, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = config.ambient; // highlight top
    ctx.beginPath(); ctx.ellipse(0, -h*0.05, w*0.35, h*0.2, 0, 0, Math.PI*2); ctx.fill();
  }

  ctx.restore();
}
