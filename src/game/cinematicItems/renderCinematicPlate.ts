import { safeCreateRadialGradient } from '../../utils/canvasUtils';

/**
 * CONSOLE-GRADE THEMED BASE LANDING PLATE RENDERING (20 DISTINCT PLATES)
 * Every plate is crafted with authentic biome materials, 3D depth, surface bevels,
 * functional landing mechanics, and environmental integration matching COLLECTIONS definitions.
 */
export function renderCinematicPlate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: string,
  time: number
) {
  const hw = w / 2;
  const hh = h / 2;
  const t = Math.abs(parseInt((id || '').replace('plate-', '')) || 0) % 20;

  // Natural ground contact shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, hh + 2, hw * 0.95, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (t) {
    // 0: Meadow — Mossy Stone Ledger
    case 0: {
      // Carved natural granite slab
      const stoneGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      stoneGrad.addColorStop(0, '#64748b');
      stoneGrad.addColorStop(0.5, '#475569');
      stoneGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = stoneGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Stone chisel joint lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.2, -hh);
      ctx.lineTo(-hw * 0.15, hh);
      ctx.moveTo(hw * 0.35, -hh);
      ctx.lineTo(hw * 0.4, hh);
      ctx.stroke();

      // Lush velvet moss layer draped over top
      const mossGrad = ctx.createLinearGradient(0, -hh, 0, 0);
      mossGrad.addColorStop(0, '#4ade80');
      mossGrad.addColorStop(0.5, '#22c55e');
      mossGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = mossGrad;
      ctx.beginPath();
      ctx.moveTo(-hw + 3, -hh);
      for (let x = -hw + 3; x <= hw - 3; x += 10) {
        const my = -hh + 6 + Math.sin(x * 0.2 + 1) * 3;
        ctx.lineTo(x, my);
      }
      ctx.lineTo(hw - 3, -hh);
      ctx.closePath();
      ctx.fill();

      // Wild floral buds in crevices
      ctx.fillStyle = '#fef08a';
      [[-hw * 0.6, -hh + 3], [hw * 0.5, -hh + 4], [0, -hh + 5]].forEach(([fx, fy]) => {
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    // 1: Lunar Surface — Thermal Landing Pad
    case 1: {
      // Hexagonal titanium base platform
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Crinkled gold Mylar thermal foil top sheet
      const foilGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      foilGrad.addColorStop(0, '#fef08a');
      foilGrad.addColorStop(0.35, '#eab308');
      foilGrad.addColorStop(0.7, '#ca8a04');
      foilGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = foilGrad;
      ctx.fillRect(-hw + 4, -hh + 3, w - 8, h - 6);

      // Black solar alignment target grid
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(-hw + 4, -hh + 3, w - 8, h - 6);
      // Target crosshairs
      ctx.beginPath();
      ctx.moveTo(-hw * 0.35, 0);
      ctx.lineTo(hw * 0.35, 0);
      ctx.moveTo(0, -hh * 0.6);
      ctx.lineTo(0, hh * 0.6);
      ctx.stroke();

      // Pulsing red lunar beacon LED
      const beaconBlink = Math.sin(time * 0.006) > 0 ? 1 : 0.25;
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.globalAlpha = beaconBlink;
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }

    // 2: Martian Canyon — Redstone Ridge Deck
    case 2: {
      // Layered ironstone rock slab
      const ridgeGrad = ctx.createLinearGradient(0, -hh, 0, hh);
      ridgeGrad.addColorStop(0, '#ea580c');
      ridgeGrad.addColorStop(0.4, '#c2410c');
      ridgeGrad.addColorStop(0.8, '#9a3412');
      ridgeGrad.addColorStop(1, '#431407');
      ctx.fillStyle = ridgeGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Horizontal sediment bands
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 1.4;
      [-hh * 0.3, 0, hh * 0.3].forEach(sy => {
        ctx.beginPath();
        ctx.moveTo(-hw + 3, sy);
        ctx.lineTo(hw - 3, sy);
        ctx.stroke();
      });

      // Drifting martian red dust accumulation
      ctx.fillStyle = 'rgba(234, 88, 12, 0.45)';
      ctx.beginPath();
      ctx.ellipse(-hw * 0.5, -hh + 3, 14, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(hw * 0.5, -hh + 4, 18, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cyan seismic telemetry sensor
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 6;
      ctx.fillRect(-hw + 8, -hh + 4, 4, 4);
      break;
    }

    // 3: Deep Space Nebula — Orbital Truss Dock
    case 3: {
      // Space station titanium structural body
      ctx.fillStyle = '#0f051d';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Metallic truss cross-bracing
      ctx.strokeStyle = '#581c87';
      ctx.lineWidth = 2.0;
      ctx.strokeRect(-hw + 2, -hh + 2, w - 4, h - 4);
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 1.2;
      for (let tx = -hw + 14; tx < hw - 10; tx += 20) {
        ctx.beginPath();
        ctx.moveTo(tx, -hh + 2);
        ctx.lineTo(tx + 10, hh - 2);
        ctx.lineTo(tx + 20, -hh + 2);
        ctx.stroke();
      }

      // Pulsing cyan anti-gravity field emitter strip
      const gravPulse = 0.5 + 0.5 * Math.sin(time * 0.004);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.globalAlpha = Math.max(0.3, gravPulse);
      ctx.fillRect(-hw * 0.6, -hh + 3, hw * 1.2, 3);
      ctx.globalAlpha = 1;
      break;
    }

    // 4: Abyssal Coral Reef — Living Coral Shelf
    case 4: {
      // Calcified coral limestone ledge
      const reefGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      reefGrad.addColorStop(0, '#0284c7');
      reefGrad.addColorStop(0.5, '#0369a1');
      reefGrad.addColorStop(1, '#075985');
      ctx.fillStyle = reefGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 7);
      ctx.fill();

      // Branching coral polyps & barnacles
      const coralNodes = [
        { x: -hw * 0.65, y: -hh + 2, col: '#f43f5e' },
        { x: -hw * 0.25, y: -hh + 1, col: '#06b6d4' },
        { x: hw * 0.3, y: -hh + 2, col: '#a855f7' },
        { x: hw * 0.7, y: -hh + 1, col: '#f59e0b' },
      ];
      coralNodes.forEach(cn => {
        ctx.fillStyle = cn.col;
        ctx.shadowColor = cn.col;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(cn.x, cn.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Water caustics reflection shimmer
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.4, 0);
      ctx.quadraticCurveTo(0, -3, hw * 0.4, 0);
      ctx.stroke();
      break;
    }

    // 5: Tropical Sunset Beach — Teak Boardwalk Plank
    case 5: {
      // Weathered salt-cured teak wood
      const teakGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      teakGrad.addColorStop(0, '#78350f');
      teakGrad.addColorStop(0.5, '#451a03');
      teakGrad.addColorStop(1, '#291404');
      ctx.fillStyle = teakGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Vertical board planks
      ctx.strokeStyle = '#1c0a02';
      ctx.lineWidth = 1.6;
      for (let bx = -hw + 18; bx < hw; bx += 18) {
        ctx.beginPath();
        ctx.moveTo(bx, -hh);
        ctx.lineTo(bx, hh);
        ctx.stroke();
      }

      // Heavy bronze corner brackets & wooden pegs
      ctx.fillStyle = '#f59e0b';
      [[-hw + 5, -hh + 4], [hw - 5, -hh + 4], [-hw + 5, hh - 4], [hw - 5, hh - 4]].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Nautical hemp rope binding on edge
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-hw + 2, hh - 2);
      ctx.lineTo(hw - 2, hh - 2);
      ctx.stroke();
      break;
    }

    // 6: Volcanic Caldera — Basalt Magma Slab
    case 6: {
      ctx.fillStyle = '#1c0a07';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Chiseled thermal basalt texture
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.0;
      ctx.strokeRect(-hw + 2, -hh + 2, w - 4, h - 4);

      // Glowing incandescent magma heat channel
      const magmaGlow = ctx.createLinearGradient(-hw, 0, hw, 0);
      magmaGlow.addColorStop(0, '#ef4444');
      magmaGlow.addColorStop(0.5, '#fef08a');
      magmaGlow.addColorStop(1, '#ef4444');

      ctx.save();
      ctx.fillStyle = magmaGlow;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.fillRect(-hw * 0.75, -2, hw * 1.5, 4);
      ctx.restore();
      break;
    }

    // 7: Ancient Stone Citadel — Castle Stone Threshold
    case 7: {
      const stoneGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      stoneGrad.addColorStop(0, '#475569');
      stoneGrad.addColorStop(0.5, '#334155');
      stoneGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = stoneGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Heavy hand-forged wrought iron strap band
      ctx.fillStyle = '#020617';
      ctx.fillRect(-hw + 2, -hh * 0.3, w - 4, hh * 0.6);

      // Square iron pyramid rivets
      ctx.fillStyle = '#cbd5e1';
      for (let rx = -hw + 14; rx < hw; rx += 22) {
        ctx.fillRect(rx - 2, -2, 4, 4);
      }

      // Warm torchlight glow from above
      const torchGrad = safeCreateRadialGradient(ctx, 0, -hh, 2, 0, -hh, 24);
      if (torchGrad) {
        torchGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
        torchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = torchGrad;
        ctx.fillRect(-hw, -hh, w, h);
      }
      break;
    }

    // 8: Enchanted Redwood — Redwood Burl Deck
    case 8: {
      // Giant redwood heartwood cross-section
      const burlGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      burlGrad.addColorStop(0, '#451a03');
      burlGrad.addColorStop(0.5, '#291404');
      burlGrad.addColorStop(1, '#140602');
      ctx.fillStyle = burlGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Overgrown shelf bracket mushrooms on edge
      const drawShelfShroom = (sx: number, sy: number) => {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      };
      drawShelfShroom(-hw * 0.55, -hh);
      drawShelfShroom(hw * 0.45, -hh);

      // Velvety green moss rim
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-hw + 4, -hh + 3);
      ctx.lineTo(hw - 4, -hh + 3);
      ctx.stroke();
      break;
    }

    // 9: Golden Desert Oasis — Sandstone Altar Dais
    case 9: {
      const altarGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      altarGrad.addColorStop(0, '#fef08a');
      altarGrad.addColorStop(0.4, '#eab308');
      altarGrad.addColorStop(0.8, '#b45309');
      altarGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = altarGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Carved geometric sun-relief stepped border
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);

      // Center gold altar plate
      ctx.fillStyle = '#fde047';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 10: Frozen Arctic Tundra — Permafrost Ice Shelf
    case 10: {
      const iceGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      iceGrad.addColorStop(0, '#f0f9ff');
      iceGrad.addColorStop(0.4, '#7dd3fc');
      iceGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = iceGrad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Hanging crystalline icicles along bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let ix = -hw + 10; ix < hw - 8; ix += 14) {
        ctx.beginPath();
        ctx.moveTo(ix - 3, hh);
        ctx.lineTo(ix, hh + 6 + (Math.abs(ix) % 4));
        ctx.lineTo(ix + 3, hh);
        ctx.closePath();
        ctx.fill();
      }

      // Glacial frost cracks
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.4, -hh + 4);
      ctx.lineTo(0, 0);
      ctx.lineTo(hw * 0.35, hh - 3);
      ctx.stroke();
      break;
    }

    // 11: Pirate Corsair Cove — Quarterdeck Plank
    case 11: {
      // Dense pitch-pine quarterdeck timbers
      const pineGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      pineGrad.addColorStop(0, '#451a03');
      pineGrad.addColorStop(0.5, '#291404');
      pineGrad.addColorStop(1, '#1c0a03');
      ctx.fillStyle = pineGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Pitch caulking deck seams
      ctx.strokeStyle = '#0c0502';
      ctx.lineWidth = 2.0;
      [-hh * 0.3, hh * 0.3].forEach(cy => {
        ctx.beginPath();
        ctx.moveTo(-hw + 3, cy);
        ctx.lineTo(hw - 3, cy);
        ctx.stroke();
      });

      // Heavy forged brass coaming edge
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);

      // Stamped pirate anchor emblem
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 12: Candyland Confection — Wafer Biscuit Plate
    case 12: {
      // Crisp chocolate wafer biscuit deck
      const waferGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      waferGrad.addColorStop(0, '#831843');
      waferGrad.addColorStop(0.5, '#701a75');
      waferGrad.addColorStop(1, '#4a044e');
      ctx.fillStyle = waferGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Wafer crosshatch grid
      ctx.strokeStyle = 'rgba(251, 207, 232, 0.4)';
      ctx.lineWidth = 1.0;
      for (let x = -hw + 8; x < hw; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, -hh + 3);
        ctx.lineTo(x + 6, hh - 3);
        ctx.stroke();
      }

      // White royal-icing decorative piped edge with mint pearls
      ctx.fillStyle = '#fff1f2';
      for (let px = -hw + 6; px <= hw - 6; px += 12) {
        ctx.beginPath();
        ctx.arc(px, -hh + 2, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    // 13: Golden El Dorado — Gilded Sun Dais
    case 13: {
      // Solid mirror-gold ceremonial pedestal
      const goldGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      goldGrad.addColorStop(0, '#fef9c3');
      goldGrad.addColorStop(0.35, '#fde047');
      goldGrad.addColorStop(0.7, '#f59e0b');
      goldGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = goldGrad;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Stepped pyramid Incan border
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);

      // Inlaid radiant blue lapis lazuli jewel tiles
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8;
      [-hw * 0.45, 0, hw * 0.45].forEach(jx => {
        ctx.fillRect(jx - 4, -2, 8, 4);
      });
      break;
    }

    // 14: Cyberpunk Megacity — Neon Rooftop Gantry
    case 14: {
      // Industrial dark steel gantry deck
      ctx.fillStyle = '#090514';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Diamond-plate steel tread lines
      ctx.strokeStyle = '#1e0836';
      ctx.lineWidth = 1.2;
      for (let dx = -hw + 8; dx < hw; dx += 12) {
        ctx.beginPath();
        ctx.moveTo(dx, -hh + 2);
        ctx.lineTo(dx + 4, hh - 2);
        ctx.stroke();
      }

      // Neon cyan underglow tube beneath gantry
      ctx.save();
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-hw + 4, hh - 1);
      ctx.lineTo(hw - 4, hh - 1);
      ctx.stroke();
      ctx.restore();

      // Magenta hazard warning indicators
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-hw + 4, -hh + 3, 6, 3);
      ctx.fillRect(hw - 10, -hh + 3, 6, 3);
      break;
    }

    // 15: Toxic Wasteland — Hazard Slag Grate
    case 15: {
      // Corrosion-resistant heavy steel grating
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Glowing toxic green neutralization sump beneath grate
      const toxGrad = ctx.createLinearGradient(-hw, 0, hw, 0);
      toxGrad.addColorStop(0, '#4d7c0f');
      toxGrad.addColorStop(0.5, '#bef264');
      toxGrad.addColorStop(1, '#4d7c0f');
      ctx.save();
      ctx.fillStyle = toxGrad;
      ctx.shadowColor = '#84cc16';
      ctx.shadowBlur = 10;
      ctx.fillRect(-hw * 0.7, -hh * 0.3, hw * 1.4, hh * 0.6);
      ctx.restore();

      // Steel grating bars across the sump
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2.0;
      for (let gx = -hw + 10; gx < hw; gx += 8) {
        ctx.beginPath();
        ctx.moveTo(gx, -hh + 2);
        ctx.lineTo(gx, hh - 2);
        ctx.stroke();
      }

      // Yellow hazard caution stripes
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-hw + 3, -hh + 2, 8, 3);
      ctx.fillRect(hw - 11, -hh + 2, 8, 3);
      break;
    }

    // 16: Floating Sky Islands — Floating Skyrock
    case 16: {
      // Inverted fractured granite aerolite base tapering downward
      const rockGrad = ctx.createLinearGradient(0, -hh, 0, hh + 6);
      rockGrad.addColorStop(0, '#64748b');
      rockGrad.addColorStop(0.5, '#334155');
      rockGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.moveTo(-hw, -hh + 4);
      ctx.lineTo(hw, -hh + 4);
      ctx.lineTo(hw * 0.4, hh + 4);
      ctx.lineTo(0, hh + 6);
      ctx.lineTo(-hw * 0.4, hh + 4);
      ctx.closePath();
      ctx.fill();

      // Lush emerald alpine turf plateau on top
      const turfGrad = ctx.createLinearGradient(0, -hh, 0, 0);
      turfGrad.addColorStop(0, '#22c55e');
      turfGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = turfGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, 8, [5, 5, 2, 2]);
      ctx.fill();

      // Trailing sky vines dangling beneath rock
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 1.5;
      [-hw * 0.25, 0, hw * 0.25].forEach((vx, i) => {
        const sway = Math.sin(time * 0.003 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(vx, hh + 2);
        ctx.lineTo(vx + sway, hh + 8);
        ctx.stroke();
      });
      break;
    }

    // 17: Chrono Clockwork — Brass Machine Bed
    case 17: {
      // Heavy cast-iron machine plate
      const ironGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      ironGrad.addColorStop(0, '#451a03');
      ironGrad.addColorStop(0.5, '#291404');
      ironGrad.addColorStop(1, '#1a0d05');
      ctx.fillStyle = ironGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Brass drive chain running along the front face
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-hw + 6, 0);
      ctx.lineTo(hw - 6, 0);
      ctx.stroke();

      // Rotating brass toothed sprockets on ends
      const drawSprocket = (sx: number) => {
        ctx.save();
        ctx.translate(sx, 0);
        ctx.rotate(time * 0.001);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1c0a02';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawSprocket(-hw + 10);
      drawSprocket(hw - 10);
      break;
    }

    // 18: Sakura Blossom Shrine — Vermilion Bridge Deck
    case 18: {
      // Sacred Japanese vermilion arched bridge deck
      const vermilionGrad = ctx.createLinearGradient(0, -hh, 0, hh);
      vermilionGrad.addColorStop(0, '#e11d48');
      vermilionGrad.addColorStop(0.5, '#be185d');
      vermilionGrad.addColorStop(1, '#831843');
      ctx.fillStyle = vermilionGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Black lacquered beam edges
      ctx.fillStyle = '#1c040e';
      ctx.fillRect(-hw, -hh, w, 3.5);
      ctx.fillRect(-hw, hh - 3.5, w, 3.5);

      // Hand-engraved brass corner caps (kigi)
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-hw, -hh, 6, 5);
      ctx.fillRect(hw - 6, -hh, 6, 5);
      ctx.fillRect(-hw, hh - 5, 6, 5);
      ctx.fillRect(hw - 6, hh - 5, 6, 5);

      // Inlaid gold leaf sakura flower motif
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 19: The Crystalline Core — Raw Geode Bedrock
    case 19:
    default: {
      // Subterranean dark granite bedrock
      const bedrockGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      bedrockGrad.addColorStop(0, '#2e1065');
      bedrockGrad.addColorStop(0.5, '#1e073a');
      bedrockGrad.addColorStop(1, '#0c021a');
      ctx.fillStyle = bedrockGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Studded with faceted glowing amethyst crystal points
      const crystals = [
        { x: -hw * 0.6, h: 8, col: '#c084fc' },
        { x: -hw * 0.25, h: 10, col: '#e9d5ff' },
        { x: 0, h: 6, col: '#a855f7' },
        { x: hw * 0.3, h: 11, col: '#c084fc' },
        { x: hw * 0.65, h: 7, col: '#e9d5ff' },
      ];

      crystals.forEach(c => {
        ctx.save();
        ctx.fillStyle = c.col;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(c.x - 3, -hh + 3);
        ctx.lineTo(c.x, -hh - c.h);
        ctx.lineTo(c.x + 3, -hh + 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Luminous violet fissure lines across the stone
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-hw + 8, hh - 3);
      ctx.lineTo(0, 0);
      ctx.lineTo(hw - 8, hh - 3);
      ctx.stroke();
      break;
    }
  }
}
