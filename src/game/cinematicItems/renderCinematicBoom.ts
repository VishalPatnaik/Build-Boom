import { safeCreateRadialGradient } from '../../utils/canvasUtils';

export interface BoomParticleData {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  rotation?: number;
  life: number;
  size?: number;
  color?: string;
  type?: string;
}

/**
 * CONSOLE-GRADE THEMED BOOM EXPLOSION PARTICLES (20 DISTINCT THEMATIC EFFECTS)
 * Every boom effect is tailored with unique geometric motion, color gradations,
 * particle shapes, and atmospheric trails matching COLLECTIONS definitions.
 */
export function renderCinematicBoomParticle(
  ctx: CanvasRenderingContext2D,
  p: BoomParticleData,
  time: number,
  id: string
) {
  const t = Math.abs(parseInt((id || '').replace('boom-', '')) || 0) % 20;

  ctx.save();
  ctx.translate(p.x, p.y);
  const rot = p.rotation || 0;
  ctx.rotate(rot);

  const life = Math.max(0, Math.min(1, p.life));
  ctx.globalAlpha *= life;

  const baseScale = 1 + (1 - life) * 0.45;
  ctx.scale(baseScale, baseScale);

  const r = Math.max(4, p.size || 12);

  // Common Shockwave expansion ring when particle type is 'ring'
  if (p.type === 'ring') {
    ctx.lineWidth = 2.5 * life;
    ctx.strokeStyle = p.color || getThematicAccentColor(t);
    ctx.shadowColor = p.color || getThematicAccentColor(t);
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, (p.size || 16) * (1.5 - life * 0.5), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // 20 Unique Thematic Boom Particles
  switch (t) {
    // 0: Meadow — Pollen Burst: Swirling golden pollen & spinning green leaf motes
    case 0: {
      if (p.type === 'projectile' || p.type === 'main') {
        // Golden dandelion pollen puff
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Organic spinning green leaf mote
        ctx.fillStyle = '#22c55e';
        ctx.shadowColor = '#15803d';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.8, r * 0.35, rot + time * 0.005, 0, Math.PI * 2);
        ctx.fill();
        // Leaf vein
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-r * 0.6, 0);
        ctx.lineTo(r * 0.6, 0);
        ctx.stroke();
      }
      break;
    }

    // 1: Lunar Surface — Meteor Impact: Jagged lunar ejecta shards & glowing impact flash
    case 1: {
      // Angular fractured basalt shard with stark sunlit rim
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, -r * 0.5);
      ctx.lineTo(r * 0.7, -r * 0.2);
      ctx.lineTo(r * 0.4, r * 0.6);
      ctx.lineTo(-r * 0.5, r * 0.4);
      ctx.closePath();
      ctx.fill();

      // Sharp white specular rim highlight
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Micrometeorite spark
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 2: Martian Canyon — Crimson Sandblast: Swirling red dust & mineral sparks
    case 2: {
      ctx.fillStyle = '#ea580c';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.75, r * 0.4, rot, 0, Math.PI * 2);
      ctx.fill();

      // Incandescent mineral spark
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-1, -1, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 3: Deep Space Nebula — Supernova Shockwave: Cosmic energy rays & violet starlight
    case 3: {
      // Radiant 4-pointed cosmic star flare
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.25, -r * 0.25);
      ctx.lineTo(r, 0);
      ctx.lineTo(r * 0.25, r * 0.25);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.25, r * 0.25);
      ctx.lineTo(-r, 0);
      ctx.lineTo(-r * 0.25, -r * 0.25);
      ctx.closePath();
      ctx.fill();

      // Blinding white core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 4: Abyssal Coral Reef — Cavitation Splash: Hydrodynamic water droplets & bubbles
    case 4: {
      // Shimmering translucent water bubble with white specular highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.2;
      ctx.fillStyle = 'rgba(34, 211, 238, 0.35)';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // White specular glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.25, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 5: Tropical Sunset Beach — Sunlit Spray: Golden ocean mist & amber sparkles
    case 5: {
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Golden sunset flare sparkle
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-1, -1, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 6: Volcanic Caldera — Magma Eruption: Molten lava bombs with dark cooling crusts
    case 6: {
      // Fiery molten lava core
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Cooling dark basalt crust rim
      ctx.strokeStyle = '#1c0a07';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 1.4);
      ctx.stroke();

      // Superheated white-yellow center
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 7: Ancient Stone Citadel — Masonry Shrapnel: Fractured stone chunks & mortar sparks
    case 7: {
      // Tumbling stone masonry block fragment
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-r * 0.5, -r * 0.4, r, r * 0.8, 2);
      ctx.fill();
      ctx.stroke();

      // Chisel spark
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(r * 0.3, -r * 0.2, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 8: Enchanted Redwood — Emerald Spores: Bioluminescent forest spores & fireflies
    case 8: {
      // Glowing green spore sphere with soft light halo
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Luminous spore center
      ctx.fillStyle = '#a7f3d0';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 9: Golden Desert Oasis — Sandstorm Gust: Spiraling golden sand & scarab motes
    case 9: {
      ctx.fillStyle = '#eab308';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.7, r * 0.35, rot + time * 0.006, 0, Math.PI * 2);
      ctx.fill();

      // Golden glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 10: Frozen Arctic Tundra — Blizzard Shatter: Crystalline 6-point ice snowflakes
    case 10: {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(-Math.cos(ang) * r * 0.7, -Math.sin(ang) * r * 0.7);
        ctx.lineTo(Math.cos(ang) * r * 0.7, Math.sin(ang) * r * 0.7);
        ctx.stroke();
      }
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 11: Pirate Corsair Cove — Blackpowder Blast: Naval cannon smoke & fireball sparks
    case 11: {
      // Billowing charcoal gunpowder smoke puff
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Burning naval pitch flame spark
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-1, -1, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 12: Candyland Confection — Sugar Glass Burst: Shattered sugar glass shards
    case 12: {
      // Sharp translucent ruby sugar shard
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#fbcfe8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.5);
      ctx.lineTo(r * 0.6, -r * 0.3);
      ctx.lineTo(r * 0.2, r * 0.6);
      ctx.closePath();
      ctx.fill();

      // Glass facet reflection
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      break;
    }

    // 13: Golden El Dorado — Golden Sunbeam Burst: Spinning 24K gold coins & sun motes
    case 13: {
      // Spinning solid gold coin
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.65, r * 0.35, rot + time * 0.004, 0, Math.PI * 2);
      ctx.fill();

      // Coin rim
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      break;
    }

    // 14: Cyberpunk Megacity — Electric Arc EMP: High-voltage cyan lightning bolt
    case 14: {
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 0.6);
      ctx.lineTo(-r * 0.1, -r * 0.1);
      ctx.lineTo(r * 0.1, -r * 0.3);
      ctx.lineTo(r * 0.7, r * 0.6);
      ctx.stroke();

      // Magenta plasma node
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 15: Toxic Wasteland — Acidic Slag Splash: Fluorescent lime-green chemical foam
    case 15: {
      ctx.fillStyle = '#84cc16';
      ctx.shadowColor = '#bef264';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Acid vapor core
      ctx.fillStyle = '#bef264';
      ctx.beginPath();
      ctx.arc(-1, -1, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 16: Floating Sky Islands — Thunderhead Spark: Ionized cloud puff & electric sparks
    case 16: {
      // Volumetric cloud vapor puff
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Internal electric blue ionization spark
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 17: Chrono Clockwork — Clock Spring Burst: Coiled brass springs & gears
    case 17: {
      // Coiled spiral watch spring
      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 3; a += 0.3) {
        const rad = (a / (Math.PI * 3)) * (r * 0.7);
        const sx = Math.cos(a + rot) * rad;
        const sy = Math.sin(a + rot) * rad;
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      break;
    }

    // 18: Sakura Blossom Shrine — Cherry Petal Vortex: Organic pink cherry petals
    case 18: {
      // Five-lobed pink sakura petal
      ctx.fillStyle = '#f472b6';
      ctx.shadowColor = '#fbcfe8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.7, r * 0.38, rot + time * 0.003, 0, Math.PI * 2);
      ctx.fill();

      // Deep magenta petal base
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(-r * 0.3, 0, 1.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 19: The Crystalline Core — Prismatic Detonation: Amethyst crystal fragmentation
    case 19:
    default: {
      // Multi-faceted violet crystal shard
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#e9d5ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.7);
      ctx.lineTo(r * 0.5, 0);
      ctx.lineTo(0, r * 0.7);
      ctx.lineTo(-r * 0.5, 0);
      ctx.closePath();
      ctx.fill();

      // Sharp white facet glint
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Returns the exact vibrant thematic accent color for a given boom effect ID
 */
export function getThematicAccentColor(themeIdx: number): string {
  const colors = [
    '#fbbf24', // 0: Meadow Amber
    '#38bdf8', // 1: Lunar Ice Blue
    '#f97316', // 2: Martian Flame
    '#c084fc', // 3: Nebula Violet
    '#22d3ee', // 4: Abyssal Cyan
    '#f59e0b', // 5: Sunset Gold
    '#ef4444', // 6: Volcano Magma
    '#f59e0b', // 7: Citadel Torch
    '#10b981', // 8: Redwood Emerald
    '#eab308', // 9: Desert Gold
    '#38bdf8', // 10: Glacier Frost
    '#f59e0b', // 11: Blackpowder Amber
    '#f43f5e', // 12: Sugar Ruby
    '#fde047', // 13: El Dorado Gold
    '#00f0ff', // 14: Cyber Neon Cyan
    '#84cc16', // 15: Toxic Lime
    '#38bdf8', // 16: Sky Aether
    '#fbbf24', // 17: Clockwork Brass
    '#f472b6', // 18: Sakura Blossom
    '#c084fc', // 19: Amethyst Prism
  ];
  return colors[themeIdx % colors.length] || '#ef4444';
}
