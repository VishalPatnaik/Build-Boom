import { renderCinematicWorld } from './cinematicWorlds/renderCinematicWorld';
import { safeCreateRadialGradient } from '../utils/canvasUtils';

// THEME RENDERER - REALISTIC HIGH-FIDELITY ATMOSPHERIC WORLDS & ITEMS
// 20 Distinct, visually unique biomes with realistic depth, lighting, and textures.

export interface WorldThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  dark: string;
}

export const THEME_PALETTES: WorldThemeColors[] = [
  // 0: Spring Meadow (Lush green hills, wild flora, warm golden sunlight)
  { primary: '#22c55e', secondary: '#15803d', accent: '#fbbf24', glow: 'rgba(34, 197, 94, 0.4)', dark: '#052e16' },
  // 1: Lunar Surface (Stark craters, grey regolith, deep velvet cosmos, earthrise)
  { primary: '#94a3b8', secondary: '#64748b', accent: '#38bdf8', glow: 'rgba(148, 163, 184, 0.35)', dark: '#030712' },
  // 2: Martian Canyon (Rusty red dunes, stratified redstone cliffs, dusty sun)
  { primary: '#ea580c', secondary: '#9a3412', accent: '#f97316', glow: 'rgba(234, 88, 12, 0.4)', dark: '#270a04' },
  // 3: Deep Space Nebula (Swirling stellar clouds of violet, magenta, and cyan)
  { primary: '#a855f7', secondary: '#7c3aed', accent: '#38bdf8', glow: 'rgba(168, 85, 247, 0.45)', dark: '#09021a' },
  // 4: Abyssal Coral Reef (Deep ocean blue, sunlit water caustics, vibrant coral, bubbles)
  { primary: '#06b6d4', secondary: '#0e7490', accent: '#22d3ee', glow: 'rgba(6, 182, 212, 0.4)', dark: '#02182b' },
  // 5: Tropical Sunset Beach (Warm amber/magenta sunset, turquoise ocean waves, palm silhouettes)
  { primary: '#f59e0b', secondary: '#f43f5e', accent: '#2dd4bf', glow: 'rgba(245, 158, 11, 0.4)', dark: '#1c0a1f' },
  // 6: Volcanic Caldera (Dark basalt crags, molten glowing magma fissures, fire embers)
  { primary: '#ef4444', secondary: '#b91c1c', accent: '#fbbf24', glow: 'rgba(239, 68, 68, 0.5)', dark: '#1a0502' },
  // 7: Ancient Stone Citadel (Gothic castle masonry, moonlit fortress towers, warm torchlight)
  { primary: '#64748b', secondary: '#475569', accent: '#f59e0b', glow: 'rgba(100, 116, 139, 0.35)', dark: '#0b1120' },
  // 8: Enchanted Redwood Forest (Deep mystical emerald woods, towering redwood trunks, glowing spores)
  { primary: '#10b981', secondary: '#047857', accent: '#a7f3d0', glow: 'rgba(16, 185, 129, 0.4)', dark: '#032014' },
  // 9: Golden Desert Oasis (Sweeping wind-rippled dunes, brilliant desert sun, oasis palms)
  { primary: '#eab308', secondary: '#ca8a04', accent: '#38bdf8', glow: 'rgba(234, 179, 8, 0.4)', dark: '#1c1303' },
  // 10: Frozen Arctic Tundra (Glacial icebergs, dancing green Aurora Borealis, soft snowfall)
  { primary: '#38bdf8', secondary: '#0284c7', accent: '#86efac', glow: 'rgba(56, 189, 248, 0.4)', dark: '#03192e' },
  // 11: Pirate Corsair Cove (Dramatic sea cliffs, moonlit ocean, galleon silhouette, lantern glow)
  { primary: '#d97706', secondary: '#92400e', accent: '#38bdf8', glow: 'rgba(217, 119, 6, 0.35)', dark: '#0c1524' },
  // 12: Candyland Confection (Artisan glossy sugar crystals, strawberry cream hills, swirl lollipops)
  { primary: '#ec4899', secondary: '#db2777', accent: '#fbcfe8', glow: 'rgba(236, 72, 153, 0.4)', dark: '#2b0922' },
  // 13: Golden El Dorado (Gilded sun-temple architecture, solid gold relics, lush jungle sunbeams)
  { primary: '#f59e0b', secondary: '#b45309', accent: '#fef08a', glow: 'rgba(245, 158, 11, 0.45)', dark: '#1c1002' },
  // 14: Cyberpunk Megacity (Rain-slicked skyscrapers, neon cyan/magenta signs, towering metropolis)
  { primary: '#00f0ff', secondary: '#f43f5e', accent: '#a855f7', glow: 'rgba(0, 240, 255, 0.45)', dark: '#090514' },
  // 15: Toxic Industrial Wasteland (Industrial steel pipes, bubbling phosphorescent green chemical lagoon)
  { primary: '#84cc16', secondary: '#4d7c0f', accent: '#bef264', glow: 'rgba(132, 204, 22, 0.4)', dark: '#091504' },
  // 16: Floating Sky Islands (High altitude azure sky, floating mossy islands with cascading waterfalls)
  { primary: '#38bdf8', secondary: '#0284c7', accent: '#f8fafc', glow: 'rgba(56, 189, 248, 0.35)', dark: '#071f3d' },
  // 17: Chrono Clockwork Realm (Interlocking brass and copper gears, escaping steam, pendulum weights)
  { primary: '#d97706', secondary: '#78350f', accent: '#fbbf24', glow: 'rgba(217, 119, 6, 0.4)', dark: '#1a0d05' },
  // 18: Sakura Blossom Shrine (Crimson torii gate, pagoda against Mount Fuji, fluttering pink petals)
  { primary: '#f472b6', secondary: '#e11d48', accent: '#fbcfe8', glow: 'rgba(244, 114, 182, 0.4)', dark: '#240817' },
  // 19: Crystalline Geode Core (Deep cavern with towering faceted glowing amethyst crystals)
  { primary: '#c084fc', secondary: '#9333ea', accent: '#00f0ff', glow: 'rgba(192, 132, 252, 0.45)', dark: '#0c021a' },
];

// REALISTIC WORLD BACKGROUND RENDERING
export function renderWorld(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: string,
  time: number,
  isPreview: boolean = false
) {
  renderCinematicWorld(ctx, w, h, id, time, isPreview);
}

// REALISTIC HIGH-FIDELITY BLOCK RENDERING
// Each theme block has authentic material rendering, textures, bevels, and light highlights.
export function renderBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  id: string,
  isCenter: boolean,
  time: number,
  archetype?: string
) {
  if (!ctx || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return;
  const t = Math.abs(parseInt((id || '').replace('skin-', '')) || 0) % THEME_PALETTES.length;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);

  // Subtle natural idle breath
  const bounce = Math.sin((time || 0) / 220) * 2.5;
  const squash = 1 + Math.sin((time || 0) / 160) * 0.03;
  ctx.translate(0, bounce);
  ctx.scale(1 / squash, squash);

  const hw = w / 2;
  const hh = h / 2;

  // Render specific realistic material block by theme index:
  switch (t) {
    // 0: Meadow: Amber Honeycomb Gemstone
    case 0: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.4, '#eab308');
      grad.addColorStop(1, '#854d0e');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Honeycomb cell facets
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
      ctx.lineWidth = 1.2;
      const r = w * 0.22;
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI) / 3;
        const px = Math.cos(ang) * r;
        const py = Math.sin(ang) * r;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      // Internal amber glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-hw * 0.3, -hh * 0.3, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 1: Lunar Surface: Sculpted Cratered Regolith Basalt
    case 1: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#e2e8f0');
      grad.addColorStop(0.5, '#94a3b8');
      grad.addColorStop(1, '#334155');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Textured craters with cast shadows
      const craters = [
        { x: -hw * 0.35, y: -hh * 0.3, r: 6 },
        { x: hw * 0.25, y: hh * 0.2, r: 8 },
        { x: -hw * 0.1, y: hh * 0.35, r: 4.5 },
      ];
      craters.forEach(c => {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(c.x - 1, c.y - 1, c.r, Math.PI * 0.7, Math.PI * 1.8);
        ctx.stroke();
      });
      break;
    }

    // 2: Martian Canyon: Weathered Red Hematite Stone
    case 2: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#c2410c');
      grad.addColorStop(1, '#451a03');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Geological sediment strata lines
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 1.5;
      [-hh * 0.4, 0, hh * 0.4].forEach(ly => {
        ctx.beginPath();
        ctx.moveTo(-hw + 3, ly);
        ctx.lineTo(hw - 3, ly + 2);
        ctx.stroke();
      });
      break;
    }

    // 3: Deep Space: Celestial Meteorite with Galaxy Swirl
    case 3: {
      const grad = safeCreateRadialGradient(ctx, 0, 0, 2, 0, 0, Math.max(3, hw));
      if (grad) {
        grad.addColorStop(0, '#c084fc');
        grad.addColorStop(0.5, '#581c87');
        grad.addColorStop(1, '#0f051d');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#581c87';
      }
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Embedded stardust dots
      ctx.fillStyle = '#ffffff';
      [[-hw * 0.4, -hh * 0.2], [hw * 0.3, hh * 0.3], [0, -hh * 0.4], [hw * 0.2, -hh * 0.2]].forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    // 4: Ocean: Iridescent Abalone Shell / Pearl
    case 4: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#cffafe');
      grad.addColorStop(0.3, '#38bdf8');
      grad.addColorStop(0.7, '#0891b2');
      grad.addColorStop(1, '#0e7490');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Lustrous sea-pearl center orb
      const pearlGrad = safeCreateRadialGradient(ctx, -3, -3, 1, 0, 0, 10);
      if (pearlGrad) {
        pearlGrad.addColorStop(0, '#ffffff');
        pearlGrad.addColorStop(0.5, '#e0f2fe');
        pearlGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = pearlGrad;
      } else {
        ctx.fillStyle = '#e0f2fe';
      }
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 5: Beach: Tumbled Ocean Jade & Gold Sandstone
    case 5: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#5eead4');
      grad.addColorStop(0.5, '#0d9488');
      grad.addColorStop(1, '#115e59');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 7);
      ctx.fill();

      // Golden sand trim
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);
      break;
    }

    // 6: Volcano: Obsidian Rock with Molten Magma Fissures
    case 6: {
      ctx.fillStyle = '#0f0505';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Glowing magma fissure branching
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-hw + 4, -hh + 4);
      ctx.lineTo(-4, -2);
      ctx.lineTo(6, 6);
      ctx.lineTo(hw - 4, hh - 4);
      ctx.moveTo(-4, -2);
      ctx.lineTo(hw * 0.4, -hh * 0.5);
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      break;
    }

    // 7: Castle: Chiseled Ashlar Granite with Iron Rivets
    case 7: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#94a3b8');
      grad.addColorStop(0.6, '#475569');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 4);
      ctx.fill();

      // Iron bracket border & rivets
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);
      ctx.fillStyle = '#f59e0b';
      [[-hw + 5, -hh + 5], [hw - 5, -hh + 5], [-hw + 5, hh - 5], [hw - 5, hh - 5]].forEach(([rx, ry]) => {
        ctx.fillRect(rx - 1.5, ry - 1.5, 3, 3);
      });
      break;
    }

    // 8: Enchanted Forest: Petrified Redwood Heartwood
    case 8: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#15803d');
      grad.addColorStop(0.5, '#166534');
      grad.addColorStop(1, '#14532d');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Glowing emerald heart-rune
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 9: Desert: Carved Sandstone Hieroglyphic Brick
    case 9: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#eab308');
      grad.addColorStop(1, '#92400e');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Carved sun icon relief
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.stroke();
      for (let a = 0; a < 8; a++) {
        const ang = (a * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 8, Math.sin(ang) * 8);
        ctx.lineTo(Math.cos(ang) * 11, Math.sin(ang) * 11);
        ctx.stroke();
      }
      break;
    }

    // 10: Frozen Tundra: Glacial Crystalline Ice
    case 10: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#f0f9ff');
      grad.addColorStop(0.4, '#7dd3fc');
      grad.addColorStop(1, '#0284c7');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Crystalline frost fracture facets
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.6, -hh * 0.5);
      ctx.lineTo(0, 0);
      ctx.lineTo(hw * 0.7, hh * 0.6);
      ctx.moveTo(0, 0);
      ctx.lineTo(hw * 0.5, -hh * 0.4);
      ctx.stroke();
      break;
    }

    // 11: Pirate Cove: Nautical Oak Plank with Brass Corner Brackets
    case 11: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#a16207');
      grad.addColorStop(0.6, '#713f12');
      grad.addColorStop(1, '#3c1d06');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Forged brass skull/anchor emblem
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-2, 2, 4, 7);
      break;
    }

    // 12: Candyland: Translucent Ruby Sugar Crystal Gem
    case 12: {
      const grad = safeCreateRadialGradient(ctx, -hw * 0.2, -hh * 0.2, 2, 0, 0, Math.max(3, hw));
      if (grad) {
        grad.addColorStop(0, '#fbcfe8');
        grad.addColorStop(0.3, '#f43f5e');
        grad.addColorStop(0.8, '#be185d');
        grad.addColorStop(1, '#831843');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#f43f5e';
      }
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Glossy glass specular shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.ellipse(-hw * 0.35, -hh * 0.35, 7, 3, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 13: Golden Legend: 24K Minted Gold Bullion
    case 13: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#fef9c3');
      grad.addColorStop(0.4, '#eab308');
      grad.addColorStop(1, '#854d0e');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);

      ctx.fillStyle = '#713f12';
      ctx.font = `bold ${Math.round(w * 0.26)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('999.9', 0, 0);
      break;
    }

    // 14: Cyberpunk: Holographic Tempered Glass Module
    case 14: {
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Cyan / Magenta microcircuit traces
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-hw + 5, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(hw * 0.4, hh * 0.5);
      ctx.stroke();
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 15: Toxic Hazard: Heavy Titanium Isotope Cask
    case 15: {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Hazard chevrons
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-hw + 2, -hh + 2, w - 4, 4);
      ctx.fillRect(-hw + 2, hh - 6, w - 4, 4);

      // Glowing green isotope chamber
      ctx.fillStyle = '#84cc16';
      ctx.shadowColor = '#84cc16';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 16: Sky Islands: Aether Floating Aerolite
    case 16: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#f0fdf4');
      grad.addColorStop(0.5, '#86efac');
      grad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 7);
      ctx.fill();

      // Cloud aura swirls
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI);
      ctx.stroke();
      break;
    }

    // 17: Clockwork: Solid Brass & Copper Escapement Gear
    case 17: {
      const grad = safeCreateRadialGradient(ctx, 0, 0, 2, 0, 0, Math.max(3, hw));
      if (grad) {
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.6, '#b45309');
        grad.addColorStop(1, '#78350f');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#b45309';
      }
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();

      // Brass gear teeth ring
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.stroke();
      // Center steel pivot
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 18: Sakura: Lacquered Imperial Rosewood
    case 18: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#9f1239');
      grad.addColorStop(0.6, '#4c0519');
      grad.addColorStop(1, '#1f020a');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
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
        ctx.ellipse(px, py, 3, 1.8, ang, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 19: The Core: Prismatic Amethyst Geode Cluster
    case 19:
    default: {
      const grad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      grad.addColorStop(0, '#f3e8ff');
      grad.addColorStop(0.4, '#a855f7');
      grad.addColorStop(1, '#3b0764');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Crystal facet facets
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -hh + 3);
      ctx.lineTo(hw - 3, 0);
      ctx.lineTo(0, hh - 3);
      ctx.lineTo(-hw + 3, 0);
      ctx.closePath();
      ctx.stroke();
      break;
    }
  }

  // Polished edge highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-hw + 1, -hh + 1, w - 2, h - 2);

  ctx.restore();
}

// REALISTIC THEMED LANDING PLATFORMS
export function renderPlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  id: string,
  time: number
) {
  const t = Math.abs(parseInt((id || '').replace('plate-', '')) || 0) % THEME_PALETTES.length;
  const pal = THEME_PALETTES[t] || THEME_PALETTES[0];
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);

  const hw = w / 2;
  const hh = h / 2;

  // Soft bottom shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(0, hh + 2, hw * 0.95, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw biome-authentic platform materials:
  switch (t) {
    // 0: Meadow: Verdant Carved Moss Stone Ledger
    case 0: {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();
      // Lush moss layer on top
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh, w - 4, hh + 2, [5, 5, 2, 2]);
      ctx.fill();
      // Wild floral dot
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-hw + 8, -hh + 2, 3, 3);
      ctx.fillRect(hw - 11, -hh + 2, 3, 3);
      break;
    }

    // 1: Lunar: Gold Foil Thermal Landing Pad
    case 1: {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 5);
      ctx.fill();
      // Gold thermal foil
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-hw + 3, -hh + 3, w - 6, h - 6);
      ctx.strokeStyle = '#fef08a';
      ctx.strokeRect(-hw + 3, -hh + 3, w - 6, h - 6);
      break;
    }

    // 6: Volcano: Basalt Magma Slab
    case 6: {
      ctx.fillStyle = '#1c0a07';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();
      // Glowing heat channel
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillRect(-hw + 6, 0, w - 12, 3);
      break;
    }

    // 10: Tundra: Glacial Permafrost Ice Shelf
    case 10: {
      const iceGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      iceGrad.addColorStop(0, '#f0f9ff');
      iceGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = iceGrad;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();
      break;
    }

    // 13: El Dorado: Solid Gilded Dais
    case 13: {
      const goldGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
      goldGrad.addColorStop(0, '#fef08a');
      goldGrad.addColorStop(0.5, '#eab308');
      goldGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();
      break;
    }

    // Default & other biomes: High-grade beveled alloy / thematic dock
    default: {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, w, h, 6);
      ctx.fill();

      // Themed metallic perimeter rim
      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top surface inset
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-hw + 3, -hh + 3, w - 6, h - 6, 4);
      ctx.fill();

      // Accent docking status LED
      ctx.fillStyle = pal.accent;
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

// REALISTIC BOOM BURST PARTICLES
export function getBoomColor(id: string) {
  const t = Math.abs(parseInt((id || '').replace('boom-', '')) || 0) % THEME_PALETTES.length;
  return THEME_PALETTES[t]?.accent || '#ef4444';
}

export function renderBoomParticle(ctx: CanvasRenderingContext2D, p: any, time: number, id: string) {
  const t = Math.abs(parseInt((id || '').replace('boom-', '')) || 0) % THEME_PALETTES.length;
  const pal = THEME_PALETTES[t] || THEME_PALETTES[0];
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha *= Math.max(0, p.life);
  const scale = 1 + (1 - p.life) * 0.4;
  ctx.scale(scale, scale);

  const r = Math.max(5, p.size || 12);

  if (p.type === 'ring') {
    // Shockwave expansion wave
    ctx.strokeStyle = p.color || pal.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = pal.primary;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.stroke();
  } else if (p.type === 'impact') {
    // Intense energy core detonation
    const coreGrad = safeCreateRadialGradient(ctx, 0, 0, 1, 0, 0, r * 1.4);
    if (coreGrad) {
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, pal.accent);
      coreGrad.addColorStop(0.8, pal.primary);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
    } else {
      ctx.fillStyle = pal.accent;
    }
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Thematic flying fragment / projectile
    ctx.fillStyle = pal.primary;
    ctx.shadowColor = pal.accent;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-1, -1, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
