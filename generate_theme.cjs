const fs = require('fs');

const code = `
export function renderBlock(ctx, x, y, w, h, id, isCenter, time) {
  const themeIdx = parseInt(id.replace('skin-', '')) || 0;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  const bounce = Math.sin(time / 200) * 4;
  const squash = 1 + Math.sin(time / 150) * 0.1;
  ctx.translate(0, bounce);
  ctx.scale(1/squash, squash);

  const emojis = ['📦','🐝','🌛','🛸','🐙','🦀','🌋','🏮','🍄','🌵','🛡️','☁️','🔋','☕','🧸','💾','🐁','🦖','🕊️','🪙','🧪','👁️','🎈','👑'];
  const emoji = emojis[themeIdx] || '📦';
  
  const grad = ctx.createRadialGradient(0,0,0, 0,0,w*0.6);
  grad.addColorStop(0, 'rgba(255,255,255,0.4)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(0,0,w*0.6,0,Math.PI*2); ctx.fill();
  
  ctx.font = \`\${w*0.6}px Arial\`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.filter = 'drop-shadow(0px 4px 4px rgba(0,0,0,0.5))';
  ctx.fillText(emoji, 0, 0);
  ctx.filter = 'none';
  ctx.restore();
}

export function renderPlate(ctx, x, y, w, h, id, time) {
  const themeIdx = parseInt(id.replace('plate-', '')) || 0;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  
  const drawPlatform = (colorTop, colorSide) => {
    ctx.fillStyle = colorSide;
    ctx.beginPath(); ctx.roundRect(-w/2, -h/2 + 10, w, h, h/2); ctx.fill();
    ctx.fillStyle = colorTop;
    ctx.beginPath(); ctx.roundRect(-w/2, -h/2, w, h, h/2); ctx.fill();
  };

  switch(themeIdx) {
    case 1: // Moon - Lunar Pad
      drawPlatform('#A9A9A9', '#696969');
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath(); ctx.arc(0, 0, w*0.1, 0, Math.PI*2); ctx.fill(); // glowing center
      break;
    case 2: // Mars - Rover Landing
      drawPlatform('#B22222', '#8B0000');
      ctx.strokeStyle = '#FFA500'; ctx.lineWidth = 2;
      ctx.strokeRect(-w*0.3, -h*0.2, w*0.6, h*0.4);
      break;
    case 3: // Space - Docking
      drawPlatform('#1C1C1C', '#000000');
      ctx.strokeStyle = '#00FFFF'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-w/2, 0); ctx.lineTo(w/2, 0); ctx.stroke();
      break;
    case 5: // Beach - Surfboard
      ctx.rotate(Math.sin(time/400)*0.05);
      ctx.fillStyle = '#FF4500';
      ctx.beginPath(); ctx.ellipse(0, 0, w*0.6, h*0.5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.fillRect(-w*0.5, -h*0.1, w, h*0.2);
      break;
    case 6: // Volcano - Magma Rock
      drawPlatform('#3E2723', '#212121');
      ctx.fillStyle = '#FF4500'; // lava cracks
      ctx.beginPath(); ctx.moveTo(-w*0.2, -h*0.1); ctx.lineTo(0, h*0.2); ctx.lineTo(w*0.2, -h*0.2); ctx.stroke();
      break;
    case 8: // Enchanted - Mushroom
      ctx.fillStyle = '#FF6347';
      ctx.beginPath(); ctx.arc(0, h*0.2, w*0.5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.beginPath(); ctx.arc(-w*0.2, -h*0.2, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.2, -h*0.1, 8, 0, Math.PI*2); ctx.fill();
      break;
    case 10: // Castle - Battlement
      drawPlatform('#708090', '#2F4F4F');
      ctx.fillStyle = '#708090';
      for(let i=0; i<4; i++) {
        ctx.fillRect(-w/2 + i*(w/4) + 5, -h, w/4 - 10, h/2);
      }
      break;
    case 14: // Candy - Wafer
      drawPlatform('#FF69B4', '#C71585');
      ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2;
      for(let i=0; i<3; i++) {
         ctx.beginPath(); ctx.moveTo(-w/2, -h/2 + i*10); ctx.lineTo(w/2, -h/2 + i*10); ctx.stroke();
      }
      break;
    case 19: // Pirate - Plank
      drawPlatform('#8B4513', '#5C4033');
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-w*0.4, -h*0.3); ctx.lineTo(w*0.4, -h*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w*0.4, h*0.1); ctx.lineTo(w*0.4, h*0.1); ctx.stroke();
      break;
    default:
      drawPlatform('#E0E0E0', '#9E9E9E');
      break;
  }
  ctx.restore();
}

export function renderBoomParticle(ctx, p, time, id) {
  const themeIdx = parseInt(id.replace("boom-", "")) || 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.life;
  const scale = 1 + (1 - p.life) * 2;
  ctx.scale(scale, scale);

  if (themeIdx === 2) { // Mars Laser
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(-p.size*2, -p.size/2, p.size*4, p.size);
    ctx.fillStyle = "#FFF";
    ctx.fillRect(-p.size, -p.size/4, p.size*2, p.size/2);
  } else if (themeIdx === 3) { // Space Black Hole
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#8A2BE2"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, p.size * 1.5, 0, Math.PI*2); ctx.stroke();
  } else if (themeIdx === 4) { // Water Splash
    ctx.fillStyle = "#00BFFF";
    ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill();
  } else if (themeIdx === 6) { // Meteor
    ctx.fillStyle = "#FF4500";
    ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#FFA500";
    ctx.beginPath(); ctx.moveTo(-p.size*2, 0); ctx.lineTo(0, -p.size); ctx.lineTo(0, p.size); ctx.fill();
  } else {
    // Default magic explosion
    ctx.fillStyle = p.color || "#FFF";
    ctx.beginPath(); ctx.arc(0,0,p.size,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

export function getBoomColor(id) {
  return '#FF4500';
}

export function renderWorld(ctx, w, h, id, time, isPreview = false) {
  const themeIdx = parseInt(id.replace("bg-", "")) || 0;
  
  // Helpers
  const drawSky = (top, bottom) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  };

  const drawStars = (count, twinkleFast = false) => {
    ctx.fillStyle = "#FFF";
    for(let i=0; i<count; i++) {
      const px = (i * 1234.5) % w;
      const py = (i * 5432.1) % (h*0.8);
      const twinkle = twinkleFast ? Math.abs(Math.sin(time/50 + i)) : Math.abs(Math.sin(time/200 + i));
      ctx.globalAlpha = 0.3 + twinkle * 0.7;
      ctx.beginPath(); ctx.arc(px, py, (i%2)+1, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  };

  const drawPlanet = (x, y, r, color1, color2) => {
    const pGrad = ctx.createRadialGradient(x-r*0.3, y-r*0.3, r*0.1, x, y, r);
    pGrad.addColorStop(0, color1);
    pGrad.addColorStop(1, color2);
    ctx.fillStyle = pGrad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  };

  const drawMountains = (yBase, amp, color, freq) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for(let x=0; x<=w; x+=20) {
      ctx.lineTo(x, yBase - Math.abs(Math.sin(x*freq)) * amp);
    }
    ctx.lineTo(w, h);
    ctx.fill();
  };

  const drawParticles = (count, color, speedY, speedX, sizeFunc) => {
    ctx.fillStyle = color;
    for(let i=0; i<count; i++) {
      const py = (time * speedY * (1 + i%3) + i * 100) % (h + 50) - 25;
      const px = (time * speedX + i * (w/count) + Math.sin(time/1000 + i)*20) % w;
      ctx.beginPath(); ctx.arc(px, py, sizeFunc(i), 0, Math.PI*2); ctx.fill();
    }
  };

  ctx.save();
  
  if (themeIdx === 1) { // Moon
    drawSky("#000000", "#111111");
    drawStars(30);
    drawPlanet(w*0.8, h*0.2, w*0.15, "#4169E1", "#00008B"); // Earth in sky
    // Lunar surface
    ctx.fillStyle = "#333333";
    ctx.beginPath(); ctx.ellipse(w/2, h, w*1.5, h*0.4, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#555555";
    ctx.beginPath(); ctx.ellipse(w*0.2, h*0.8, w*0.2, h*0.05, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w*0.8, h*0.9, w*0.3, h*0.08, 0, 0, Math.PI*2); ctx.fill();
  } 
  else if (themeIdx === 2) { // Mars
    drawSky("#8B0000", "#FF4500");
    drawStars(10);
    // Distant mountains
    drawMountains(h*0.7, 100, "#660000", 0.01);
    // Dust haze
    drawParticles(20, "rgba(255,165,0,0.3)", 0.01, 0.2, (i) => (i%3)+2);
    // Foreground terrain
    ctx.fillStyle = "#CD5C5C";
    ctx.beginPath(); ctx.ellipse(w/2, h*0.9, w*1.2, h*0.3, 0, Math.PI, 0); ctx.fill();
  }
  else if (themeIdx === 3) { // Space
    drawSky("#050510", "#191970");
    // Nebula
    const neb = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
    neb.addColorStop(0, "rgba(138,43,226,0.3)");
    neb.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = neb; ctx.fillRect(0,0,w,h);
    
    drawStars(80, true);
    drawPlanet(w*0.2, h*0.3, w*0.2, "#FF4500", "#8B0000"); // Distant planet
    drawPlanet(w*0.9, h*0.8, w*0.1, "#00FA9A", "#006400"); // Another planet
    // Asteroids
    drawParticles(10, "#888", 0.05, -0.05, (i)=>(i%4)+2);
  }
  else if (themeIdx === 5) { // Beach
    drawSky("#87CEEB", "#E0F6FF");
    // Sun
    drawPlanet(w*0.2, h*0.2, w*0.1, "#FFD700", "#FFA500");
    // Clouds
    ctx.fillStyle = "#FFF";
    ctx.beginPath(); ctx.arc(w*0.7 - (time*0.02)%w, h*0.2, 40, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w*0.7+30 - (time*0.02)%w, h*0.2, 30, 0, Math.PI*2); ctx.fill();
    // Ocean
    ctx.fillStyle = "#00BFFF";
    ctx.fillRect(0, h*0.5, w, h*0.5);
    // Waves
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for(let i=0; i<3; i++) {
       ctx.fillRect(0, h*0.5 + i*40 + Math.sin(time/200+i)*10, w, 5);
    }
    // Sand
    ctx.fillStyle = "#F4A460";
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h*0.8); ctx.quadraticCurveTo(w/2, h*0.7, w, h*0.9); ctx.lineTo(w, h); ctx.fill();
  }
  else if (themeIdx === 6) { // Volcano
    drawSky("#3B0918", "#FF0000");
    // Volcano shape
    ctx.fillStyle = "#1A0000";
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w*0.3, h*0.4); ctx.lineTo(w*0.7, h*0.4); ctx.lineTo(w, h); ctx.fill();
    // Lava
    ctx.fillStyle = "#FF4500";
    ctx.beginPath(); ctx.moveTo(w*0.4, h*0.4); ctx.lineTo(w*0.5, h); ctx.lineTo(w*0.6, h*0.4); ctx.fill();
    // Eruption particles
    drawParticles(30, "#FFA500", -0.2, 0, (i)=>(i%3)+2);
  }
  else if (themeIdx === 8) { // Enchanted Forest
    drawSky("#001A00", "#003311");
    // Trees
    ctx.fillStyle = "#001100";
    for(let i=0; i<5; i++) {
       ctx.fillRect(w*0.1 + i*w*0.2, 0, w*0.05, h);
    }
    // Light shafts
    const light = ctx.createLinearGradient(0, 0, w, h);
    light.addColorStop(0, "rgba(255,255,150,0.1)");
    light.addColorStop(1, "rgba(255,255,150,0)");
    ctx.fillStyle = light;
    ctx.beginPath(); ctx.moveTo(w*0.2, 0); ctx.lineTo(w*0.6, 0); ctx.lineTo(w, h); ctx.lineTo(w*0.4, h); ctx.fill();
    // Fireflies
    drawParticles(30, "#ADFF2F", -0.05, 0.05, (i)=>(i%2)+2);
  }
  else if (themeIdx === 10) { // Castle
    drawSky("#4682B4", "#B0C4DE");
    // Castle
    ctx.fillStyle = "#555";
    ctx.fillRect(w*0.2, h*0.4, w*0.6, h*0.6);
    ctx.fillRect(w*0.1, h*0.3, w*0.2, h*0.7);
    ctx.fillRect(w*0.7, h*0.3, w*0.2, h*0.7);
    // Flags
    ctx.fillStyle = "#B22222";
    ctx.beginPath(); ctx.moveTo(w*0.2, h*0.3); ctx.lineTo(w*0.3, h*0.35 + Math.sin(time/100)*10); ctx.lineTo(w*0.2, h*0.4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w*0.8, h*0.3); ctx.lineTo(w*0.9, h*0.35 + Math.sin(time/100 + 1)*10); ctx.lineTo(w*0.8, h*0.4); ctx.fill();
  }
  else if (themeIdx === 23) { // Golden Legend
    drawSky("#B8860B", "#FFD700");
    // Golden structures
    ctx.fillStyle = "#DAA520";
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w*0.5, h*0.2); ctx.lineTo(w, h); ctx.fill();
    // Glowing aura
    drawPlanet(w/2, h*0.2, w*0.15, "rgba(255,255,255,0.8)", "rgba(255,255,255,0)");
    // Sparkles
    drawParticles(40, "#FFF", -0.1, 0, (i)=>(i%3)+1);
  }
  else { // Fallback / Meadow
    drawSky("#87CEEB", "#E0F6FF");
    drawMountains(h*0.8, 50, "#3CB371", 0.02);
    ctx.fillStyle = "#2E8B57";
    ctx.beginPath(); ctx.ellipse(w/2, h, w, h*0.3, 0, Math.PI, 0); ctx.fill();
  }
  
  ctx.restore();
}
`
fs.writeFileSync('src/game/themeRenderer.ts', code);
