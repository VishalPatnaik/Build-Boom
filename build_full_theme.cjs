const fs = require('fs');

const code = `
export function getBoomColor(id) {
  const themeIdx = parseInt(id.replace("boom-", "")) || 0;
  const colors = [
    '#FFA500', '#8A2BE2', '#FF0000', '#00FFFF', '#00BFFF', 
    '#FF4500', '#FF4500', '#9370DB', '#32CD32', '#F4A460', 
    '#708090', '#FFFFFF', '#00FF00', '#FFFF00', '#FF69B4', 
    '#00FFFF', '#FF0000', '#8B4513', '#FFB6C1', '#000000', 
    '#00FF00', '#4B0082', '#FF1493', '#FFD700'
  ];
  return colors[themeIdx] || '#FFFFFF';
}

export function renderBoomParticle(ctx, p, time, id) {
  const themeIdx = parseInt(id.replace("boom-", "")) || 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.life;
  const scale = 1 + (1 - p.life) * 2;
  ctx.scale(scale, scale);

  switch(themeIdx) {
    case 1: // Moon (Black Hole)
      ctx.fillStyle = "#000";
      ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#8A2BE2"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, p.size * 1.5, 0, Math.PI*2); ctx.stroke();
      break;
    case 2: // Mars (Laser)
      ctx.fillStyle = "#FF0000";
      ctx.fillRect(-p.size*2, -p.size/2, p.size*4, p.size);
      ctx.fillStyle = "#FFF";
      ctx.fillRect(-p.size, -p.size/4, p.size*2, p.size/2);
      break;
    case 3: // Space (Cosmic Energy)
      const grad = ctx.createRadialGradient(0,0,0,0,0,p.size);
      grad.addColorStop(0, "#FFF");
      grad.addColorStop(1, "#00FFFF");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(0,0,p.size,0,Math.PI*2); ctx.fill();
      break;
    case 4: // Ocean (Water Splash)
    case 5: // Beach (Water)
      ctx.fillStyle = "#00BFFF";
      ctx.beginPath(); ctx.moveTo(p.size, 0); ctx.quadraticCurveTo(0, p.size, -p.size, 0); ctx.quadraticCurveTo(0, -p.size, p.size, 0); ctx.fill();
      break;
    case 6: // Volcano (Meteor)
      ctx.fillStyle = "#FF4500";
      ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#FFA500";
      ctx.beginPath(); ctx.moveTo(-p.size*2, 0); ctx.lineTo(0, -p.size); ctx.lineTo(0, p.size); ctx.fill();
      break;
    case 20: // Lab (Acid)
      ctx.fillStyle = "#00FF00";
      ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#FFF";
      ctx.beginPath(); ctx.arc(p.size*0.3, -p.size*0.3, p.size*0.2, 0, Math.PI*2); ctx.fill();
      break;
    default:
      // Generic magical explosion
      ctx.fillStyle = p.color || "#FFF";
      ctx.beginPath();
      for(let i=0; i<5; i++) {
        ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*p.size, -Math.sin((18+i*72)*Math.PI/180)*p.size);
        ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*p.size*0.5, -Math.sin((54+i*72)*Math.PI/180)*p.size*0.5);
      }
      ctx.closePath(); ctx.fill();
      break;
  }
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
      ctx.fillStyle = 'rgba(0,255,255,0.3)';
      ctx.fillRect(-w/2, 0, w, h/2);
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
      ctx.strokeStyle = '#FF4500'; ctx.lineWidth = 2;
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
    case 11: // Sky Islands - Cloud Platform
      ctx.fillStyle = '#FFF';
      ctx.beginPath(); ctx.arc(-w*0.3, 0, h, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -h*0.2, h*1.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w*0.3, 0, h, 0, Math.PI*2); ctx.fill();
      break;
    case 14: // Candy - Wafer
      drawPlatform('#FF69B4', '#C71585');
      ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2;
      for(let i=0; i<3; i++) {
         ctx.beginPath(); ctx.moveTo(-w/2, -h/2 + i*10); ctx.lineTo(w/2, -h/2 + i*10); ctx.stroke();
      }
      break;
    case 15: // Cyber - Hologram
      ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.fillRect(-w/2, -h/2, w, h);
      ctx.strokeStyle = '#00FFFF';
      ctx.strokeRect(-w/2, -h/2, w, h);
      ctx.beginPath(); ctx.moveTo(-w/2, h/2); ctx.lineTo(-w*0.4, h*1.5); ctx.lineTo(w*0.4, h*1.5); ctx.lineTo(w/2, h/2); ctx.stroke();
      break;
    case 16: // Toy - Lego
      drawPlatform('#FF0000', '#8B0000');
      ctx.fillStyle = '#FF0000';
      for(let i=0; i<3; i++) {
        ctx.beginPath(); ctx.ellipse(-w*0.3 + i*(w*0.3), -h*0.6, w*0.1, h*0.2, 0, 0, Math.PI*2); ctx.fill();
      }
      break;
    case 19: // Pirate - Plank
      drawPlatform('#8B4513', '#5C4033');
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-w*0.4, -h*0.3); ctx.lineTo(w*0.4, -h*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w*0.4, h*0.1); ctx.lineTo(w*0.4, h*0.1); ctx.stroke();
      break;
    case 21: // Haunted - Gravestone
      drawPlatform('#696969', '#2F4F4F');
      ctx.fillStyle = '#696969';
      ctx.beginPath(); ctx.arc(0, -h/2, w/2, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.font = \`\${h*0.8}px Arial\`; ctx.textAlign='center'; ctx.fillText('RIP', 0, 0);
      break;
    case 23: // Golden Legend
      drawPlatform('#FFD700', '#B8860B');
      ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, w*0.3, 0, Math.PI*2); ctx.stroke();
      break;
    default:
      drawPlatform('#E0E0E0', '#9E9E9E');
      break;
  }
  ctx.restore();
}

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

export function renderWorld(ctx, w, h, id, time, isPreview = false) {
  const themeIdx = parseInt(id.replace("bg-", "")) || 0;
  
  // Base layers
  ctx.save();
  
  // Helpers
  const fillGradient = (y1, y2, c1, c2) => {
    const grad = ctx.createLinearGradient(0, y1, 0, y2);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, y1, w, y2 - y1);
  };
  const drawSky = (c1, c2) => fillGradient(0, h, c1, c2);
  
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

  const drawBuildings = (yBase, color1, color2) => {
    ctx.fillStyle = color1;
    for(let i=0; i<10; i++) {
      ctx.fillRect(i*w*0.1, yBase - (i%4)*40, w*0.08, h);
    }
    ctx.fillStyle = color2;
    for(let i=0; i<15; i++) {
      ctx.fillRect(i*w*0.07 + 10, yBase + 20 - (i%5)*50, w*0.05, h);
    }
  };

  if (themeIdx === 0) { // Meadow
    drawSky("#87CEEB", "#E0F6FF");
    drawMountains(h*0.5, 40, "#A9DFBF", 0.01);
    drawMountains(h*0.65, 60, "#7DCEA0", 0.015);
    drawMountains(h*0.8, 50, "#3CB371", 0.02);
    // Trees
    ctx.fillStyle = "#229954";
    for(let i=0; i<4; i++) {
       ctx.fillRect(w*0.2 + i*w*0.2, h*0.7, 20, h*0.3);
       ctx.beginPath(); ctx.arc(w*0.2 + i*w*0.2 + 10, h*0.7, 40, 0, Math.PI*2); ctx.fill();
    }
    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath(); ctx.arc((time*0.2)%w, h*0.2, 30, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc((time*0.2)%w + 30, h*0.2, 20, 0, Math.PI*2); ctx.fill();
  }
  else if (themeIdx === 1) { // Moon
    drawSky("#000000", "#0a0a0a");
    drawStars(50);
    drawPlanet(w*0.8, h*0.3, w*0.15, "#4169E1", "#00008B"); // Earth
    // Distant lunar mountains
    drawMountains(h*0.6, 80, "#222", 0.01);
    // Lunar surface
    ctx.fillStyle = "#333333";
    ctx.beginPath(); ctx.ellipse(w/2, h*0.9, w*1.5, h*0.3, 0, Math.PI, 0); ctx.fill();
    // Craters
    ctx.fillStyle = "#222222";
    ctx.beginPath(); ctx.ellipse(w*0.2, h*0.8, w*0.15, h*0.04, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(w*0.8, h*0.85, w*0.2, h*0.06, 0, 0, Math.PI*2); ctx.fill();
    drawParticles(30, "rgba(255,255,255,0.1)", 0.01, 0.05, ()=>2);
  }
  else if (themeIdx === 2) { // Mars
    drawSky("#8B0000", "#FF4500");
    drawStars(20);
    drawMountains(h*0.5, 120, "#660000", 0.005);
    drawMountains(h*0.65, 80, "#8B0000", 0.01);
    drawParticles(40, "rgba(255,165,0,0.3)", 0.02, 0.3, (i)=>(i%3)+2);
    ctx.fillStyle = "#CD5C5C";
    ctx.beginPath(); ctx.ellipse(w/2, h*0.9, w*1.2, h*0.3, 0, Math.PI, 0); ctx.fill();
    // Rocks
    ctx.fillStyle = "#8B0000";
    ctx.beginPath(); ctx.moveTo(w*0.1, h*0.8); ctx.lineTo(w*0.2, h*0.7); ctx.lineTo(w*0.3, h*0.8); ctx.fill();
  }
  else if (themeIdx === 3) { // Space
    drawSky("#050510", "#191970");
    const neb = ctx.createRadialGradient(w*0.3, h*0.3, 0, w*0.3, h*0.3, w*0.8);
    neb.addColorStop(0, "rgba(138,43,226,0.3)");
    neb.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = neb; ctx.fillRect(0,0,w,h);
    drawStars(100, true);
    drawPlanet(w*0.2, h*0.3, w*0.2, "#FF4500", "#8B0000"); 
    drawPlanet(w*0.8, h*0.7, w*0.1, "#00FA9A", "#006400");
    // Asteroid belt
    ctx.fillStyle = "#555";
    for(let i=0; i<15; i++) {
       ctx.beginPath(); ctx.arc( (i*50 - time*0.2)%w, (i*30)%h, (i%5)+3, 0, Math.PI*2); ctx.fill();
    }
  }
  else if (themeIdx === 4) { // Ocean
    drawSky("#001F3F", "#006994");
    // Light rays
    const rays = ctx.createLinearGradient(0,0,0,h);
    rays.addColorStop(0, "rgba(255,255,255,0.2)");
    rays.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rays;
    ctx.beginPath(); ctx.moveTo(w*0.2, 0); ctx.lineTo(w*0.5, 0); ctx.lineTo(w*0.8, h); ctx.lineTo(w*0.1, h); ctx.fill();
    // Coral
    ctx.fillStyle = "#FF7F50";
    ctx.beginPath(); ctx.ellipse(w*0.1, h*0.9, w*0.2, h*0.2, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#2E8B57";
    ctx.beginPath(); ctx.ellipse(w*0.9, h*0.9, w*0.2, h*0.3, 0, Math.PI, 0); ctx.fill();
    // Bubbles
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    for(let i=0; i<10; i++) {
       ctx.beginPath(); ctx.arc((i*40)%w, h - (time*0.5 + i*30)%h, (i%3)+2, 0, Math.PI*2); ctx.stroke();
    }
  }
  else if (themeIdx === 5) { // Beach
    drawSky("#87CEFA", "#F0E68C");
    drawPlanet(w*0.8, h*0.2, w*0.1, "#FFD700", "#FFA500"); // Sun
    // Ocean
    fillGradient(h*0.5, h, "#00BFFF", "#1E90FF");
    // Waves
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for(let i=0; i<4; i++) {
       ctx.fillRect(0, h*0.5 + i*20 + Math.sin(time/100+i)*5, w, 3);
    }
    // Sand
    ctx.fillStyle = "#F4A460";
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h*0.7); ctx.quadraticCurveTo(w/2, h*0.6, w, h*0.8); ctx.lineTo(w, h); ctx.fill();
    // Palm tree
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(w*0.1, h*0.4, 20, h*0.4);
    ctx.fillStyle = "#228B22";
    ctx.beginPath(); ctx.arc(w*0.1+10, h*0.4, 50, 0, Math.PI); ctx.fill();
  }
  else if (themeIdx === 6) { // Volcano
    drawSky("#3B0918", "#FF0000");
    // Volcano
    ctx.fillStyle = "#1A0000";
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w*0.3, h*0.3); ctx.lineTo(w*0.7, h*0.3); ctx.lineTo(w, h); ctx.fill();
    // Lava
    ctx.fillStyle = "#FF4500";
    ctx.beginPath(); ctx.moveTo(w*0.4, h*0.3); ctx.lineTo(w*0.5, h); ctx.lineTo(w*0.6, h*0.3); ctx.fill();
    drawParticles(30, "#FFA500", -0.5, 0.1, (i)=>(i%3)+2); // Sparks
  }
  else if (themeIdx === 7) { // Lunar Temple
    drawSky("#190E2D", "#483D8B");
    drawStars(40);
    // Temple silhouette
    ctx.fillStyle = "#111";
    ctx.fillRect(w*0.3, h*0.5, w*0.4, h*0.5);
    ctx.beginPath(); ctx.moveTo(w*0.2, h*0.5); ctx.lineTo(w/2, h*0.3); ctx.lineTo(w*0.8, h*0.5); ctx.fill();
    // Glowing aura
    drawParticles(20, "rgba(138,43,226,0.6)", -0.1, 0, ()=>4);
  }
  else if (themeIdx === 8) { // Enchanted Forest
    drawSky("#001A00", "#003311");
    // Trees layers
    ctx.fillStyle = "#001100";
    for(let i=0; i<4; i++) ctx.fillRect(i*w*0.3, 0, w*0.1, h);
    ctx.fillStyle = "#002200";
    for(let i=0; i<3; i++) ctx.fillRect(i*w*0.4+20, h*0.2, w*0.15, h);
    // Mushrooms
    ctx.fillStyle = "#FF6347";
    ctx.beginPath(); ctx.arc(w*0.2, h*0.8, 30, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(w*0.8, h*0.9, 40, Math.PI, 0); ctx.fill();
    drawParticles(30, "#ADFF2F", -0.05, 0.05, (i)=>(i%2)+2);
  }
  else if (themeIdx === 9) { // Desert
    drawSky("#FF8C00", "#FFD700");
    drawPlanet(w*0.5, h*0.4, w*0.15, "#FFF", "#FFD700"); // Sun
    // Dunes
    ctx.fillStyle = "#D2B48C";
    ctx.beginPath(); ctx.moveTo(0,h); ctx.lineTo(0, h*0.6); ctx.quadraticCurveTo(w/2, h*0.4, w, h*0.7); ctx.lineTo(w,h); ctx.fill();
    ctx.fillStyle = "#DEB887";
    ctx.beginPath(); ctx.moveTo(0,h); ctx.lineTo(0, h*0.8); ctx.quadraticCurveTo(w/2, h*0.6, w, h*0.9); ctx.lineTo(w,h); ctx.fill();
    // Cactus
    ctx.fillStyle = "#2E8B57";
    ctx.fillRect(w*0.2, h*0.6, 15, h*0.2);
    ctx.fillRect(w*0.15, h*0.65, 25, 10);
  }
  else if (themeIdx === 10) { // Castle
    drawSky("#708090", "#B0C4DE");
    // Castle walls
    ctx.fillStyle = "#555";
    ctx.fillRect(0, h*0.6, w, h*0.4);
    for(let i=0; i<6; i++) {
       ctx.fillRect(i*(w/6), h*0.55, w/12, h*0.05);
    }
    // Towers
    ctx.fillRect(w*0.1, h*0.3, w*0.2, h*0.3);
    ctx.fillRect(w*0.7, h*0.3, w*0.2, h*0.3);
    // Flags
    ctx.fillStyle = "#8B0000";
    ctx.beginPath(); ctx.moveTo(w*0.2, h*0.3); ctx.lineTo(w*0.3, h*0.35 + Math.sin(time/10)*5); ctx.lineTo(w*0.2, h*0.4); ctx.fill();
  }
  else if (themeIdx === 11) { // Sky Islands
    drawSky("#87CEEB", "#FFFFFF");
    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath(); ctx.arc(w*0.3, h*0.8, 100, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w*0.7, h*0.9, 120, 0, Math.PI*2); ctx.fill();
    // Floating island
    ctx.fillStyle = "#228B22";
    ctx.beginPath(); ctx.ellipse(w/2, h*0.4, w*0.4, h*0.1, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#8B4513";
    ctx.beginPath(); ctx.moveTo(w*0.1, h*0.4); ctx.lineTo(w/2, h*0.6); ctx.lineTo(w*0.9, h*0.4); ctx.fill();
    // Waterfall
    fillGradient(h*0.4, h, "rgba(0,191,255,0.8)", "rgba(0,191,255,0)");
    ctx.fillRect(w*0.4, h*0.4, w*0.2, h*0.6);
  }
  else if (themeIdx === 12) { // Robot City
    drawSky("#000000", "#111111");
    drawBuildings(h*0.5, "#222", "#333");
    // Glowing windows
    ctx.fillStyle = "#00FF00";
    for(let i=0; i<20; i++) {
       ctx.fillRect((i*37)%w, h*0.4 + (i*13)%(h*0.4), 5, 5);
    }
    // Flying cars
    ctx.fillStyle = "#00FFFF";
    ctx.fillRect((time)%w, h*0.3, 10, 5);
    ctx.fillRect(w - (time*1.5)%w, h*0.2, 10, 5);
  }
  else if (themeIdx === 13) { // Modern City
    drawSky("#191970", "#FF4500");
    drawBuildings(h*0.6, "#111", "#000");
    ctx.fillStyle = "#FFFF00";
    for(let i=0; i<30; i++) {
       if (i%3===0) ctx.fillRect((i*29)%w, h*0.5 + (i*17)%(h*0.3), 4, 8);
    }
  }
  else if (themeIdx === 14) { // Candy World
    drawSky("#FF69B4", "#FFB6C1");
    // Chocolate river
    ctx.fillStyle = "#8B4513";
    ctx.beginPath(); ctx.moveTo(0, h*0.8); ctx.quadraticCurveTo(w/2, h*0.7 + Math.sin(time/50)*10, w, h*0.8); ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.fill();
    // Lollipops
    ctx.fillStyle = "#FFF";
    ctx.fillRect(w*0.2, h*0.5, 5, h*0.3);
    ctx.fillRect(w*0.8, h*0.4, 5, h*0.4);
    ctx.fillStyle = "#FF1493";
    ctx.beginPath(); ctx.arc(w*0.2, h*0.5, 30, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#00FF00";
    ctx.beginPath(); ctx.arc(w*0.8, h*0.4, 40, 0, Math.PI*2); ctx.fill();
  }
  else if (themeIdx === 15) { // Cyber World
    drawSky("#000000", "#001100");
    // Grid
    ctx.strokeStyle = "#00FF00"; ctx.lineWidth = 1;
    for(let i=0; i<w; i+=40) { ctx.beginPath(); ctx.moveTo(i, h*0.5); ctx.lineTo(i, h); ctx.stroke(); }
    for(let i=h*0.5; i<h; i+=40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
    // Cyber sun
    ctx.fillStyle = "#FF00FF";
    ctx.beginPath(); ctx.arc(w/2, h*0.4, 80, 0, Math.PI, 1); ctx.fill();
    ctx.fillRect(w/2-80, h*0.4, 160, 5);
    ctx.fillRect(w/2-80, h*0.4+10, 160, 5);
  }
  else if (themeIdx === 16) { // Toy World
    drawSky("#87CEEB", "#FFF");
    // Blocks
    ctx.fillStyle = "#FF0000"; ctx.fillRect(w*0.1, h*0.7, 80, 80);
    ctx.fillStyle = "#0000FF"; ctx.fillRect(w*0.3, h*0.6, 60, 120);
    ctx.fillStyle = "#FFFF00"; ctx.fillRect(w*0.7, h*0.8, 100, 60);
    // Floor
    ctx.fillStyle = "#228B22";
    ctx.fillRect(0, h*0.9, w, h*0.1);
  }
  else if (themeIdx === 17) { // Prehistoric
    drawSky("#FF7F50", "#FF4500");
    // Volcano silhouette
    ctx.fillStyle = "#222";
    ctx.beginPath(); ctx.moveTo(w*0.1, h); ctx.lineTo(w*0.4, h*0.5); ctx.lineTo(w*0.7, h); ctx.fill();
    // Dino silhouette
    ctx.beginPath(); ctx.ellipse(w*0.8, h*0.8, 40, 20, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(w*0.8+30, h*0.7, 10, 30);
    // Jungle leaves
    ctx.fillStyle = "#006400";
    ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w, 0, 150, 0, Math.PI*2); ctx.fill();
  }
  else if (themeIdx === 18) { // Sakura
    drawSky("#FFB6C1", "#FFF0F5");
    // Fuji
    ctx.fillStyle = "#4682B4";
    ctx.beginPath(); ctx.moveTo(w*0.2, h); ctx.lineTo(w/2, h*0.4); ctx.lineTo(w*0.8, h); ctx.fill();
    ctx.fillStyle = "#FFF";
    ctx.beginPath(); ctx.moveTo(w*0.35, h*0.7); ctx.lineTo(w/2, h*0.4); ctx.lineTo(w*0.65, h*0.7); ctx.fill();
    // Petals
    drawParticles(30, "#FF69B4", 0.05, 0.1, ()=>4);
  }
  else if (themeIdx === 19) { // Pirate
    drawSky("#4682B4", "#87CEEB");
    // Ocean
    fillGradient(h*0.6, h, "#000080", "#00BFFF");
    // Ship
    ctx.fillStyle = "#8B4513";
    ctx.beginPath(); ctx.moveTo(w*0.2, h*0.6); ctx.lineTo(w*0.1, h*0.5); ctx.lineTo(w*0.4, h*0.5); ctx.lineTo(w*0.3, h*0.6); ctx.fill();
    ctx.fillStyle = "#FFF";
    ctx.fillRect(w*0.2, h*0.3, 30, h*0.2);
    // Island
    ctx.fillStyle = "#D2B48C";
    ctx.beginPath(); ctx.arc(w, h*0.6, 100, Math.PI, 0); ctx.fill();
  }
  else if (themeIdx === 20) { // Lab
    drawSky("#000000", "#111");
    // Tubes
    ctx.fillStyle = "rgba(0,255,0,0.3)";
    ctx.fillRect(w*0.2, 0, 40, h);
    ctx.fillRect(w*0.7, 0, 60, h);
    // Bubbles in tubes
    ctx.fillStyle = "#00FF00";
    ctx.beginPath(); ctx.arc(w*0.2 + 20, h - (time)%h, 10, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w*0.7 + 30, h - (time*1.5)%h, 15, 0, Math.PI*2); ctx.fill();
  }
  else if (themeIdx === 21) { // Haunted
    drawSky("#000000", "#191970");
    drawPlanet(w*0.8, h*0.2, w*0.1, "#FFF", "#EEE");
    // Graveyard
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.ellipse(w/2, h, w, h*0.3, 0, Math.PI, 0); ctx.fill();
    // Tombstones
    ctx.fillStyle = "#333";
    ctx.beginPath(); ctx.arc(w*0.3, h*0.8, 20, Math.PI, 0); ctx.fill(); ctx.fillRect(w*0.3-20, h*0.8, 40, 40);
    ctx.beginPath(); ctx.arc(w*0.7, h*0.85, 25, Math.PI, 0); ctx.fill(); ctx.fillRect(w*0.7-25, h*0.85, 50, 50);
    // Fog
    drawParticles(30, "rgba(255,255,255,0.1)", 0, 0.1, ()=>20);
  }
  else if (themeIdx === 22) { // Carnival
    drawSky("#191970", "#4B0082");
    // Ferris wheel
    ctx.strokeStyle = "#FFD700"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(w/2, h*0.6, 120, 0, Math.PI*2); ctx.stroke();
    for(let i=0; i<8; i++) {
       ctx.beginPath(); ctx.moveTo(w/2, h*0.6); 
       ctx.lineTo(w/2 + Math.cos(time/100 + i*Math.PI/4)*120, h*0.6 + Math.sin(time/100 + i*Math.PI/4)*120); 
       ctx.stroke();
    }
    // Lights
    drawParticles(40, "#FF69B4", 0, 0, (i)=>(i%3)+2);
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
  
  ctx.restore();
}
`
fs.writeFileSync('src/game/themeRenderer.ts', code);
