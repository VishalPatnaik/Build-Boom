const fs = require('fs');
let code = fs.readFileSync('src/game/themeRenderer.ts', 'utf-8');

code = code.replace(
  `const t = parseInt((id || "").replace('bg-', '')) || 0;`,
  `const isPremium = id.startsWith('bg-');\n  const t = parseInt((id || "").replace('bg-', '').replace('campaign-', '')) || 0;`
);

const endOfSwitch = `    default:
      drawGradient('#000000', '#111111');
      break;
  }
`;

const premiumEffects = `    default:
      drawGradient('#000000', '#111111');
      break;
  }
  
  if (isPremium) {
    // Add distinct "Premium / Shop" overlay
    ctx.globalCompositeOperation = 'screen';
    
    // Golden God Rays
    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.rotate(time * 0.0005);
    for(let i=0; i<12; i++) {
      ctx.rotate(Math.PI * 2 / 12);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(255, 215, 0, 0.15)');
      grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 100);
      ctx.lineTo(w, -100);
      ctx.fill();
    }
    ctx.restore();
    
    // Floating Prism dust
    for(let i=0; i<30; i++) {
      const px = ((i * 123.4 + time * 0.05) % w + w) % w;
      const py = ((i * 321.4 - time * 0.08) % h + h) % h;
      ctx.fillStyle = \`hsla(\${(time*0.1 + i*30)%360}, 100%, 70%, \${0.3 + 0.3*Math.sin(time*0.002+i)})\`;
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + Math.sin(time*0.003+i)*1.5, 0, Math.PI*2);
      ctx.fill();
    }
    
    // Holographic Vignette / Border Glow
    const vGrad = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.8);
    vGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vGrad.addColorStop(1, \`hsla(\${time * 0.05 % 360}, 100%, 50%, 0.15)\`);
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, w, h);
    
    ctx.globalCompositeOperation = 'source-over';
  }
`;

code = code.replace(endOfSwitch, premiumEffects);
fs.writeFileSync('src/game/themeRenderer.ts', code);
