import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * CONSOLE-GRADE THEMED BLOCK RENDERING (20 DISTINCT SKINS)
 * Every skin is rendered with authentic material physics, 3D lighting, internal refraction,
 * and biome-specific craftsmanship matching COLLECTIONS definitions.
 */
export function renderCinematicBlock(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: string,
  isCenter: boolean,
  time: number,
  archetype?: string
) {
  const hw = w / 2;
  const hh = h / 2;
  const t = Math.abs(parseInt((id || '').replace('skin-', '')) || 0) % 20;

  switch (t) {
    // 0: Meadow — Amber Honeycomb Gemstone
    case 0: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.35, '#f59e0b');
      grad.addColorStop(0.75, '#d97706');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Honeycomb cell facets pattern
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.lineWidth = 1.4;
      const hexR = Math.min(hw * 0.45, hh * 0.55);
      const drawHex = (cx: number, cy: number, r: number) => {
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3;
          const px = cx + Math.cos(ang) * r;
          const py = cy + Math.sin(ang) * r;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      };
      drawHex(0, 0, hexR);
      drawHex(-hw * 0.5, 0, hexR * 0.75);
      drawHex(hw * 0.5, 0, hexR * 0.75);

      // Trapped golden resin inclusion with refraction glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-hw * 0.28, -hh * 0.32, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 1: Lunar Surface — Sculpted Cratered Lunar Basalt
    case 1: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#cbd5e1');
      grad.addColorStop(0.4, '#64748b');
      grad.addColorStop(0.85, '#334155');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Textured craters with raised rim & shadowed floor
      const craters = [
        { x: -hw * 0.35, y: -hh * 0.25, r: 7 },
        { x: hw * 0.3, y: hh * 0.2, r: 9 },
        { x: -hw * 0.05, y: hh * 0.35, r: 5 },
      ];
      craters.forEach(c => {
        // Deep crater shadow
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        // Central peak
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(c.x - 0.5, c.y - 0.5, c.r * 0.25, 0, Math.PI * 2);
        ctx.fill();
        // Stark white sunlit crater rim
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, Math.PI * 0.7, Math.PI * 1.8);
        ctx.stroke();
      });

      // Micrometeorite nickel inclusions
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(hw * 0.1, -hh * 0.4, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 2: Martian Canyon — Striated Martian Hematite
    case 2: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#fb923c');
      grad.addColorStop(0.4, '#ea580c');
      grad.addColorStop(0.8, '#9a3412');
      grad.addColorStop(1, '#431407');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Geological sediment strata lines
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 1.5;
      [-hh * 0.45, -hh * 0.1, hh * 0.25].forEach((ly, i) => {
        ctx.beginPath();
        ctx.moveTo(-hw + 3, ly);
        ctx.quadraticCurveTo(0, ly + (i % 2 === 0 ? 3 : -3), hw - 3, ly + 1);
        ctx.stroke();
      });

      // Dark hematite mineral nodules
      ctx.fillStyle = '#1c0702';
      [[-hw * 0.35, hh * 0.1], [hw * 0.35, -hh * 0.25]].forEach(([nx, ny]) => {
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    // 3: Deep Space Nebula — Cosmic Meteorite with Galaxy Swirl
    case 3: {
      const grad = safeCreateRadialGradient(ctx, 0, 0, 2, 0, 0, Math.max(3, hw));
      if (grad) {
        grad.addColorStop(0, '#c084fc');
        grad.addColorStop(0.45, '#6b21a8');
        grad.addColorStop(0.85, '#2e1065');
        grad.addColorStop(1, '#05010a');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#581c87';
      }
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Swirling galactic spiral arm
      ctx.save();
      ctx.rotate(time * 0.0008);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 3; a += 0.2) {
        const rad = (a / (Math.PI * 3)) * (hw * 0.7);
        const sx = Math.cos(a) * rad;
        const sy = Math.sin(a) * rad;
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.restore();

      // Pulsing stardust points
      ctx.fillStyle = '#ffffff';
      [[-hw * 0.35, -hh * 0.25], [hw * 0.25, hh * 0.3], [0, -hh * 0.35]].forEach(([px, py], i) => {
        const sparkle = 1.0 + 0.5 * Math.sin(time * 0.004 + i);
        ctx.beginPath();
        ctx.arc(px, py, sparkle, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    // 4: Abyssal Coral Reef — Luminous Sea Pearl & Abalone
    case 4: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#cffafe');
      grad.addColorStop(0.35, '#38bdf8');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, '#082f49');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Concentric nacre ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      [hw * 0.3, hw * 0.55].forEach(r => {
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.6, 0.2, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Lustrous centered sea pearl with 3D sphere highlight
      const pearlGrad = safeCreateRadialGradient(ctx, -2, -2, 1, 0, 0, 9);
      if (pearlGrad) {
        pearlGrad.addColorStop(0, '#ffffff');
        pearlGrad.addColorStop(0.4, '#e0f2fe');
        pearlGrad.addColorStop(0.85, '#0284c7');
        pearlGrad.addColorStop(1, '#075985');
        ctx.fillStyle = pearlGrad;
      } else {
        ctx.fillStyle = '#e0f2fe';
      }
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Specular pearl glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-2.5, -2.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 5: Tropical Sunset Beach — Ocean Jade Pebble
    case 5: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#5eead4');
      grad.addColorStop(0.35, '#14b8a6');
      grad.addColorStop(0.75, '#0f766e');
      grad.addColorStop(1, '#134e4a');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#2dd4bf';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 8);
      ctx.fill();

      // Translucent marble veining
      ctx.strokeStyle = 'rgba(204, 251, 241, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-hw + 6, hh - 4);
      ctx.quadraticCurveTo(-hw * 0.2, 0, hw * 0.3, -hh * 0.3);
      ctx.lineTo(hw - 6, -hh + 5);
      ctx.stroke();

      // Inlaid golden filigree border
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);
      break;
    }

    // 6: Volcanic Caldera — Obsidian Magma Core
    case 6: {
      ctx.fillStyle = '#0a0302';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Glowing molten core beneath semi-translucent glass
      const lavaPulse = 0.8 + 0.2 * Math.sin(time * 0.005);
      const coreGrad = safeCreateRadialGradient(ctx, 0, 0, 2, 0, 0, hw * 0.8 * lavaPulse);
      if (coreGrad) {
        coreGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
        coreGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.55)');
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGrad;
        ctx.fill();
      }

      // Branching incandescent magma fissures
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(-hw + 5, -hh + 5);
      ctx.lineTo(-hw * 0.2, -hh * 0.1);
      ctx.lineTo(hw * 0.1, hh * 0.15);
      ctx.lineTo(hw - 5, hh - 5);
      ctx.moveTo(-hw * 0.2, -hh * 0.1);
      ctx.lineTo(hw * 0.35, -hh * 0.45);
      ctx.stroke();

      // Superheated white-yellow fissure core
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      break;
    }

    // 7: Ancient Stone Citadel — Fortress Ashlar Granite
    case 7: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#94a3b8');
      grad.addColorStop(0.4, '#475569');
      grad.addColorStop(0.85, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 4);
      ctx.fill();

      // Heavy forged iron reinforcing strap bands
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);

      // Square forged iron rivets with highlights
      const rivets = [
        [-hw + 6, -hh + 6], [hw - 6, -hh + 6],
        [-hw + 6, hh - 6], [hw - 6, hh - 6]
      ];
      rivets.forEach(([rx, ry]) => {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rx - 2, ry - 2, 4, 4);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(rx - 2, ry - 2, 2, 2);
      });

      // Carved heraldic crest in center
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -hh * 0.4);
      ctx.lineTo(hw * 0.25, -hh * 0.1);
      ctx.lineTo(0, hh * 0.4);
      ctx.lineTo(-hw * 0.25, -hh * 0.1);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    // 8: Enchanted Redwood — Petrified Heartwood
    case 8: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#166534');
      grad.addColorStop(0.45, '#14532d');
      grad.addColorStop(0.85, '#052e16');
      grad.addColorStop(1, '#021a0c');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Annual tree growth rings
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.35)';
      ctx.lineWidth = 1.2;
      [hw * 0.3, hw * 0.55, hw * 0.8].forEach(r => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Glowing emerald druidic heart rune
      ctx.save();
      ctx.strokeStyle = '#86efac';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    // 9: Golden Desert Oasis — Sandstone Hieroglyph
    case 9: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.4, '#eab308');
      grad.addColorStop(0.8, '#b45309');
      grad.addColorStop(1, '#78350f');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Deeply incised Winged Sun Disk / Eye of Horus relief
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.stroke();
      // Sun rays
      for (let a = 0; a < 8; a++) {
        const ang = (a * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 8, Math.sin(ang) * 8);
        ctx.lineTo(Math.cos(ang) * 12, Math.sin(ang) * 12);
        ctx.stroke();
      }

      // Gold leaf inlay in the eye center
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 10: Frozen Arctic Tundra — Glacial Crystal Ice
    case 10: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#f0f9ff');
      grad.addColorStop(0.35, '#bae6fd');
      grad.addColorStop(0.7, '#38bdf8');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Internal frost fracture needles
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.7, -hh * 0.6);
      ctx.lineTo(-hw * 0.1, -hh * 0.1);
      ctx.lineTo(hw * 0.6, hh * 0.5);
      ctx.moveTo(-hw * 0.1, -hh * 0.1);
      ctx.lineTo(hw * 0.45, -hh * 0.5);
      ctx.stroke();

      // Trapped air bubbles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      [[-hw * 0.35, hh * 0.2], [hw * 0.2, hh * 0.15], [-hw * 0.1, -hh * 0.4]].forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    // 11: Pirate Corsair Cove — Nautical Oak Plank
    case 11: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#b45309');
      grad.addColorStop(0.45, '#78350f');
      grad.addColorStop(0.85, '#451a03');
      grad.addColorStop(1, '#1c0a03');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Weathered wood grain lines
      ctx.strokeStyle = '#27170e';
      ctx.lineWidth = 1.4;
      [-hh * 0.3, hh * 0.2].forEach(gy => {
        ctx.beginPath();
        ctx.moveTo(-hw + 4, gy);
        ctx.lineTo(hw - 4, gy);
        ctx.stroke();
      });

      // Brass ship rivets
      ctx.fillStyle = '#fde047';
      [[-hw + 6, 0], [hw - 6, 0]].forEach(([rx, ry]) => {
        ctx.beginPath();
        ctx.arc(rx, ry, 2.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Solid brass anchor crest in center
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(0, -3, 4, 0, Math.PI * 2);
      ctx.moveTo(0, 1);
      ctx.lineTo(0, 9);
      ctx.moveTo(-6, 6);
      ctx.quadraticCurveTo(0, 10, 6, 6);
      ctx.stroke();
      break;
    }

    // 12: Candyland Confection — Ruby Sugar Jewel
    case 12: {
      const grad = safeCreateRadialGradient(ctx, -hw * 0.25, -hh * 0.25, 2, 0, 0, Math.max(3, hw));
      if (grad) {
        grad.addColorStop(0, '#fbcfe8');
        grad.addColorStop(0.3, '#f43f5e');
        grad.addColorStop(0.7, '#be185d');
        grad.addColorStop(1, '#701a75');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#f43f5e';
      }
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Gemstone facet cut bevels
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-hw + 6, -hh + 6);
      ctx.lineTo(0, -hh * 0.3);
      ctx.lineTo(hw - 6, -hh + 6);
      ctx.lineTo(hw * 0.4, 0);
      ctx.lineTo(hw - 6, hh - 6);
      ctx.lineTo(0, hh * 0.3);
      ctx.lineTo(-hw + 6, hh - 6);
      ctx.lineTo(-hw * 0.4, 0);
      ctx.closePath();
      ctx.stroke();

      // Glossy glass specular gleam glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-hw * 0.35, -hh * 0.35, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 13: Golden El Dorado — 24K Minted Gold Bullion
    case 13: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.35, '#facc15');
      grad.addColorStop(0.7, '#ca8a04');
      grad.addColorStop(1, '#713f12');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Stepped bullion bevel frame
      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);

      // 999.9 Fineness stamp
      ctx.fillStyle = '#713f12';
      ctx.font = `bold ${Math.round(w * 0.24)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('999.9', 0, 0);

      // Specular gold gleam glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hw * 0.35, -hh * 0.35, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 14: Cyberpunk Megacity — Holo-Glass Processor
    case 14: {
      ctx.fillStyle = '#05020a';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Neon glowing border
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.strokeRect(-hw + 2, -hh + 2, w - 4, h - 4);

      // Cyan / Magenta microcircuit traces
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-hw + 5, -hh * 0.3);
      ctx.lineTo(-hw * 0.2, -hh * 0.3);
      ctx.lineTo(0, 0);
      ctx.lineTo(hw * 0.35, hh * 0.2);
      ctx.lineTo(hw - 5, hh * 0.2);
      ctx.stroke();

      // Central gold micro-chip die with LED
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-5, -5, 10, 10);
      const blink = Math.sin(time * 0.008) > 0 ? 1 : 0.3;
      ctx.fillStyle = '#00f0ff';
      ctx.globalAlpha = blink;
      ctx.fillRect(-2, -2, 4, 4);
      ctx.globalAlpha = 1;
      break;
    }

    // 15: Toxic Wasteland — Heavy Isotope Cask
    case 15: {
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Industrial hazard warning stripes along top and bottom
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-hw + 2, -hh + 2, w - 4, 4);
      ctx.fillRect(-hw + 2, hh - 6, w - 4, 4);

      // Glowing radioactive isotope chamber
      ctx.save();
      ctx.fillStyle = '#84cc16';
      ctx.shadowColor = '#bef264';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();

      // Trefoil radiation warning blades
      ctx.fillStyle = '#091504';
      for (let b = 0; b < 3; b++) {
        const ang = (b * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(0, 0, 6, ang - 0.4, ang + 0.4);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    // 16: Floating Sky Islands — Aether Aerolite
    case 16: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#f0fdf4');
      grad.addColorStop(0.35, '#86efac');
      grad.addColorStop(0.7, '#38bdf8');
      grad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 7);
      ctx.fill();

      // Cloud aura swirls & levitation runes
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI);
      ctx.stroke();

      // Azure aether core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 17: Chrono Clockwork — Brass Escapement Gear
    case 17: {
      const grad = safeCreateRadialGradient(ctx, 0, 0, 2, 0, 0, Math.max(3, hw));
      if (grad) {
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.45, '#d97706');
        grad.addColorStop(0.85, '#92400e');
        grad.addColorStop(1, '#451a03');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#b45309';
      }
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Rotating gear teeth perimeter
      ctx.save();
      ctx.rotate(time * 0.001);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.2;
      const teeth = 8;
      for (let i = 0; i < teeth; i++) {
        const ang = (i * Math.PI * 2) / teeth;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * (hw * 0.5), Math.sin(ang) * (hh * 0.5));
        ctx.lineTo(Math.cos(ang) * (hw * 0.75), Math.sin(ang) * (hh * 0.75));
        ctx.stroke();
      }
      ctx.restore();

      // Synthetic ruby pivot bearing at center
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 18: Sakura Blossom Shrine — Imperial Rosewood
    case 18: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#9f1239');
      grad.addColorStop(0.45, '#4c0519');
      grad.addColorStop(0.85, '#1f020a');
      grad.addColorStop(1, '#0c0004');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Inlaid mother-of-pearl cherry petal crest
      ctx.fillStyle = '#fbcfe8';
      for (let p = 0; p < 5; p++) {
        const ang = (p * Math.PI * 2) / 5;
        const px = Math.cos(ang) * 6;
        const py = Math.sin(ang) * 6;
        ctx.beginPath();
        ctx.ellipse(px, py, 3.2, 1.8, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      // Gold stamen center
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 24K gold maki-e border rim
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-hw + 2.5, -hh + 2.5, w - 5, h - 5);
      break;
    }

    // 19: The Crystalline Core — Amethyst Geode Cluster
    case 19:
    default: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#f3e8ff');
      grad.addColorStop(0.35, '#c084fc');
      grad.addColorStop(0.7, '#7e22ce');
      grad.addColorStop(1, '#2e1065');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Diamond crystal facets & refraction lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -hh + 3);
      ctx.lineTo(hw - 3, 0);
      ctx.lineTo(0, hh - 3);
      ctx.lineTo(-hw + 3, 0);
      ctx.closePath();
      ctx.moveTo(-hw * 0.4, 0);
      ctx.lineTo(0, -hh * 0.4);
      ctx.lineTo(hw * 0.4, 0);
      ctx.lineTo(0, hh * 0.4);
      ctx.closePath();
      ctx.stroke();

      // Prismatic diamond apex glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -hh * 0.4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  // Polished edge highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.0;
  ctx.strokeRect(-hw + 1, -hh + 1, w - 2, h - 2);
}
