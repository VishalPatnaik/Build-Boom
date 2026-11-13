// Foreground ground that the tower's plate actually stands on, drawn per world in the game canvas.
// Without it the plate floated in empty sky in most worlds. The ground sinks with the plate as the
// tower grows (it's anchored to the plate), so climbing still leaves the ground behind.
//
// The static part is rendered once per world/width into an offscreen canvas; only small animated
// accents (lava glow, neon edge, drifting embers) are drawn per frame.

type Top = 'grass' | 'regolith' | 'rock' | 'sand' | 'basalt' | 'stone' | 'moss' | 'snow' | 'planks' | 'frosting' | 'gold' | 'roof' | 'grate' | 'brass' | 'path' | 'crystal';
type Accent = 'none' | 'lava' | 'neon' | 'goo' | 'glow';

interface GroundLook {
  top: Top;
  topColor: string;
  topLight: string;   // lit edge colour (light comes from upper left in every world)
  body: [string, string];
  strata?: string;
  floating?: boolean; // space / sky worlds: a chunk of land, tapering underneath
  accent: Accent;
  accentColor: string;
  deco: Array<'stones' | 'flowers' | 'craters' | 'cracks' | 'bricks' | 'roots' | 'mushrooms' | 'coral' | 'shells' | 'ripples' | 'icicles' | 'drips' | 'sprinkles' | 'glyphs' | 'vents' | 'rivets' | 'petals' | 'gems' | 'grassBlades'>;
}

const G = (top: Top, topColor: string, topLight: string, body: [string, string], deco: GroundLook['deco'], extra: Partial<GroundLook> = {}): GroundLook =>
  ({ top, topColor, topLight, body, deco, accent: 'none', accentColor: '#fff', ...extra });

const LOOKS: GroundLook[] = [
  G('grass', '#5fae3f', '#9fdc63', ['#7a5434', '#4a3020'], ['grassBlades', 'flowers', 'stones'], { strata: '#5d3f27' }),                 // 0 Spring Meadow
  G('regolith', '#9a9db0', '#d6d9e6', ['#6d7086', '#3d3f52'], ['craters', 'stones']),                                                  // 1 Lunar
  G('rock', '#c0623b', '#ef9a6a', ['#8e3f25', '#5a2416'], ['stones', 'cracks'], { strata: '#a24c2d' }),                                 // 2 Mars
  G('rock', '#4a3a78', '#8f7ad6', ['#2f2453', '#160f2c'], ['gems', 'craters'], { floating: true, accent: 'glow', accentColor: '#9ff3ff' }), // 3 Deep Space
  G('sand', '#d9c08a', '#f4e2b4', ['#b89a62', '#7c6640'], ['coral', 'shells', 'ripples']),                                               // 4 Coral Reef
  G('sand', '#efcf8f', '#fff0c7', ['#d4ae6a', '#9c7a42'], ['shells', 'ripples'], { strata: '#c79f5c' }),                                  // 5 Beach
  G('basalt', '#3a2a28', '#7a4a3a', ['#2a1c1b', '#120a0a'], ['cracks', 'stones'], { accent: 'lava', accentColor: '#ff6a1f' }),           // 6 Volcano
  G('stone', '#8d93a3', '#c9ced9', ['#6b7182', '#454a58'], ['bricks']),                                                                  // 7 Citadel
  G('moss', '#3f7a3c', '#7fbf5a', ['#4a3424', '#2a1c12'], ['roots', 'mushrooms'], { accent: 'glow', accentColor: '#f6d36b' }),             // 8 Redwood Forest
  G('sand', '#e7b866', '#fbdc96', ['#c9944a', '#8f6230'], ['ripples', 'stones'], { strata: '#b98440' }),                                   // 9 Desert
  G('snow', '#f2f8fc', '#ffffff', ['#a9d2ea', '#5f9dc4'], ['icicles'], { strata: '#8cc0de' }),                                             // 10 Arctic
  G('planks', '#8a5a34', '#c08a56', ['#5f3c22', '#3a2414'], ['rivets']),                                                                 // 11 Pirate Cove
  G('frosting', '#fff3f8', '#ffffff', ['#f19ac0', '#c8649a'], ['drips', 'sprinkles'], { strata: '#ffd0e4' }),                               // 12 Candyland
  G('gold', '#d9a531', '#ffe08a', ['#a8761c', '#6e4a0e'], ['glyphs', 'bricks']),                                                         // 13 El Dorado
  G('roof', '#2b2f45', '#5a6288', ['#1c1f30', '#0c0d17'], ['vents'], { accent: 'neon', accentColor: '#3ff0ff' }),                         // 14 Cyberpunk
  G('grate', '#5b5a42', '#8d8b62', ['#3e3d2c', '#24231a'], ['rivets'], { accent: 'goo', accentColor: '#a6ff3a' }),                          // 15 Toxic
  G('grass', '#69b64a', '#a8e27a', ['#7c5a3c', '#4a3322'], ['grassBlades', 'flowers', 'roots'], { floating: true }),                        // 16 Sky Islands
  G('brass', '#b88a3e', '#f0c776', ['#7c5a26', '#4a3412'], ['rivets'], { accent: 'glow', accentColor: '#ffd27a' }),                        // 17 Clockwork
  G('path', '#a9a3a0', '#dcd6d2', ['#6f6a6a', '#4a4646'], ['petals', 'stones']),                                                          // 18 Sakura
  G('crystal', '#6a4ab8', '#c3a8ff', ['#3b2470', '#1c0f3a'], ['gems'], { accent: 'glow', accentColor: '#7ff3ff' }),                         // 19 Geode
];

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<string, HTMLCanvasElement>();

/** Surface height offset (0 at centre, rising gently towards the edges like a small hill top). */
function surface(x: number, W: number, look: GroundLook): number {
  const u = (x - W / 2) / (W / 2);
  if (look.floating) return u * u * 10;
  return u * u * 26 + Math.sin(x * 0.035) * 2;
}

function build(world: number, W: number, H: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const look = LOOKS[world] || LOOKS[0];
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  if (!x) return null;
  const r = rng(world * 7919 + 13);
  const TOP = 18; // the plate's feet sit at y = TOP in this canvas

  // Outline of the landmass
  const path = new Path2D();
  const left = look.floating ? W * 0.12 : -4, right = look.floating ? W * 0.88 : W + 4;
  path.moveTo(left, TOP + surface(left, W, look));
  for (let px = left; px <= right; px += 6) path.lineTo(px, TOP + surface(px, W, look));
  if (look.floating) {
    // tapering rocky underside
    const pts = 9;
    for (let i = 0; i <= pts; i++) {
      const u = i / pts;
      const px = right - (right - left) * u;
      const depth = Math.sin(u * Math.PI) * H * 0.55 + (r() - 0.5) * 18;
      path.lineTo(px, TOP + 30 + depth);
    }
  } else {
    path.lineTo(W + 4, H + 4);
    path.lineTo(-4, H + 4);
  }
  path.closePath();

  // Body: darker with depth, lit slightly from the upper left
  const body = x.createLinearGradient(0, TOP, 0, H);
  body.addColorStop(0, look.body[0]);
  body.addColorStop(1, look.body[1]);
  x.fillStyle = body;
  x.fill(path);
  const side = x.createLinearGradient(0, 0, W, 0);
  side.addColorStop(0, 'rgba(255,255,255,0.06)');
  side.addColorStop(0.6, 'rgba(0,0,0,0)');
  side.addColorStop(1, 'rgba(0,0,0,0.22)');
  x.fillStyle = side;
  x.fill(path);

  x.save();
  x.clip(path);

  // Strata lines in the body
  if (look.strata) {
    x.strokeStyle = look.strata; x.globalAlpha = 0.55; x.lineWidth = 3;
    for (let k = 1; k <= 4; k++) {
      const y0 = TOP + 34 + k * 26;
      x.beginPath();
      for (let px = 0; px <= W; px += 10) x.lineTo(px, y0 + surface(px, W, look) * 0.6 + Math.sin(px * 0.02 + k) * 5);
      x.stroke();
    }
    x.globalAlpha = 1;
  }

  // Body decorations
  for (const d of look.deco) {
    switch (d) {
      case 'bricks': {
        x.strokeStyle = 'rgba(0,0,0,0.28)'; x.lineWidth = 2;
        for (let row = 0; row < 8; row++) {
          const y0 = TOP + 22 + row * 18;
          x.beginPath(); x.moveTo(0, y0); x.lineTo(W, y0); x.stroke();
          for (let col = (row % 2) * 22; col < W; col += 44) { x.beginPath(); x.moveTo(col, y0); x.lineTo(col, y0 + 18); x.stroke(); }
        }
        break;
      }
      case 'stones': {
        for (let i = 0; i < 14; i++) {
          const sx = r() * W, sy = TOP + 30 + r() * (H - 60), s = 4 + r() * 9;
          x.fillStyle = 'rgba(0,0,0,0.22)'; x.beginPath(); x.ellipse(sx + 1.5, sy + 2, s, s * 0.7, 0, 0, Math.PI * 2); x.fill();
          x.fillStyle = 'rgba(255,255,255,0.12)'; x.beginPath(); x.ellipse(sx, sy, s, s * 0.7, 0, 0, Math.PI * 2); x.fill();
        }
        break;
      }
      case 'roots': {
        x.strokeStyle = 'rgba(40,24,12,0.7)'; x.lineCap = 'round';
        for (let i = 0; i < 7; i++) {
          let rx = r() * W, ry = TOP + 12; x.lineWidth = 3 + r() * 3;
          x.beginPath(); x.moveTo(rx, ry);
          for (let s = 0; s < 6; s++) { rx += (r() - 0.5) * 26; ry += 12 + r() * 14; x.lineTo(rx, ry); }
          x.stroke();
        }
        break;
      }
      case 'cracks': {
        x.strokeStyle = look.accent === 'lava' ? look.accentColor : 'rgba(0,0,0,0.35)'; x.lineWidth = 2;
        if (look.accent === 'lava') { x.shadowColor = look.accentColor; x.shadowBlur = 8; }
        for (let i = 0; i < 9; i++) {
          let cx = r() * W, cy = TOP + 14 + r() * 30;
          x.beginPath(); x.moveTo(cx, cy);
          for (let s = 0; s < 6; s++) { cx += (r() - 0.5) * 22; cy += 8 + r() * 12; x.lineTo(cx, cy); }
          x.stroke();
        }
        x.shadowBlur = 0;
        break;
      }
      case 'craters': {
        for (let i = 0; i < 7; i++) {
          const cx = r() * W, cy = TOP + 30 + r() * (H * 0.5), rr = 8 + r() * 18;
          const g = x.createRadialGradient(cx - rr * 0.3, cy - rr * 0.3, 1, cx, cy, rr);
          g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0.08)');
          x.fillStyle = g; x.beginPath(); x.ellipse(cx, cy, rr, rr * 0.55, 0, 0, Math.PI * 2); x.fill();
        }
        break;
      }
      case 'gems': {
        for (let i = 0; i < 9; i++) {
          const gx = r() * W, gy = TOP + 24 + r() * (H * 0.4), s = 5 + r() * 9;
          x.fillStyle = look.accentColor; x.globalAlpha = 0.75;
          x.beginPath(); x.moveTo(gx, gy - s); x.lineTo(gx + s * 0.5, gy); x.lineTo(gx, gy + s * 0.6); x.lineTo(gx - s * 0.5, gy); x.closePath(); x.fill();
          x.fillStyle = '#ffffff'; x.globalAlpha = 0.5;
          x.beginPath(); x.moveTo(gx, gy - s); x.lineTo(gx + s * 0.18, gy - s * 0.2); x.lineTo(gx - s * 0.1, gy - s * 0.1); x.closePath(); x.fill();
          x.globalAlpha = 1;
        }
        break;
      }
      case 'glyphs': {
        x.strokeStyle = 'rgba(90,50,0,0.45)'; x.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const gx = 20 + (i * (W - 40)) / 7, gy = TOP + 50 + (i % 2) * 22;
          x.strokeRect(gx - 7, gy - 7, 14, 14); x.beginPath(); x.arc(gx, gy, 3.5, 0, Math.PI * 2); x.stroke();
        }
        break;
      }
      case 'rivets': {
        x.fillStyle = 'rgba(255,255,255,0.35)';
        for (let row = 0; row < 4; row++) for (let px = 12; px < W; px += 34) { x.beginPath(); x.arc(px + (row % 2) * 17, TOP + 26 + row * 28, 2.2, 0, Math.PI * 2); x.fill(); }
        break;
      }
      case 'vents': {
        for (let i = 0; i < 4; i++) {
          const vx = 20 + r() * (W - 80), vy = TOP + 34 + r() * 60;
          x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(vx, vy, 46, 20);
          x.strokeStyle = 'rgba(255,255,255,0.12)'; x.lineWidth = 2;
          for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(vx + 4, vy + 4 + k * 4); x.lineTo(vx + 42, vy + 4 + k * 4); x.stroke(); }
        }
        break;
      }
      case 'coral': {
        for (let i = 0; i < 6; i++) {
          const cx = r() * W, cy = TOP + 10 + surface(cx, W, look);
          x.strokeStyle = ['#ff7a8a', '#ffb347', '#c77dff'][i % 3]; x.lineWidth = 4; x.lineCap = 'round';
          for (let b = -1; b <= 1; b++) { x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(cx + b * 8, cy - 14, cx + b * 12, cy - 24 - r() * 10); x.stroke(); }
        }
        break;
      }
      default: break;
    }
  }
  x.restore();

  // Top surface band (the material the plate stands on)
  const band = 14;
  const topPath = new Path2D();
  topPath.moveTo(left, TOP + surface(left, W, look));
  for (let px = left; px <= right; px += 6) topPath.lineTo(px, TOP + surface(px, W, look));
  for (let px = right; px >= left; px -= 6) topPath.lineTo(px, TOP + surface(px, W, look) + band + Math.sin(px * 0.15) * (look.top === 'frosting' || look.top === 'snow' ? 4 : 1.5));
  topPath.closePath();
  const tg = x.createLinearGradient(0, TOP - 4, 0, TOP + band + 30);
  tg.addColorStop(0, look.topLight);
  tg.addColorStop(0.45, look.topColor);
  tg.addColorStop(1, look.topColor);
  x.fillStyle = tg;
  x.fill(topPath);

  // Material detail on the top band
  x.save();
  x.clip(topPath);
  switch (look.top) {
    case 'planks':
      x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 2;
      for (let px = 0; px < W; px += 38) { x.beginPath(); x.moveTo(px, TOP - 10); x.lineTo(px, TOP + 60); x.stroke(); }
      break;
    case 'grate': case 'roof':
      x.strokeStyle = 'rgba(0,0,0,0.3)'; x.lineWidth = 1.5;
      for (let px = 0; px < W; px += 10) { x.beginPath(); x.moveTo(px, TOP - 10); x.lineTo(px, TOP + 60); x.stroke(); }
      break;
    case 'stone': case 'path': case 'gold':
      x.strokeStyle = 'rgba(0,0,0,0.22)'; x.lineWidth = 1.5;
      for (let px = 0; px < W; px += 30 + r() * 20) { x.beginPath(); x.moveTo(px, TOP - 10); x.lineTo(px + 4, TOP + 60); x.stroke(); }
      break;
    case 'crystal':
      x.fillStyle = 'rgba(255,255,255,0.18)';
      for (let px = 0; px < W; px += 26) { x.beginPath(); x.moveTo(px, TOP - 6); x.lineTo(px + 13, TOP + 18); x.lineTo(px + 26, TOP - 6); x.closePath(); x.fill(); }
      break;
    default: break;
  }
  x.restore();

  // Edge decorations that sit on or hang from the top
  for (const d of look.deco) {
    switch (d) {
      case 'grassBlades': {
        x.strokeStyle = look.topColor; x.lineWidth = 2; x.lineCap = 'round';
        for (let px = left; px < right; px += 3) {
          const y0 = TOP + surface(px, W, look) + 2, hgt = 4 + r() * 8;
          x.strokeStyle = r() < 0.5 ? look.topColor : look.topLight;
          x.beginPath(); x.moveTo(px, y0); x.lineTo(px + (r() - 0.5) * 4, y0 - hgt); x.stroke();
        }
        break;
      }
      case 'flowers': {
        for (let i = 0; i < 18; i++) {
          const fx = left + r() * (right - left), fy = TOP + surface(fx, W, look) - 4 - r() * 4;
          if (Math.abs(fx - W / 2) < 70) continue; // keep the plate area clean
          x.fillStyle = ['#fff4b0', '#ffc7da', '#ffffff', '#ffd23f'][i % 4];
          x.beginPath(); x.arc(fx, fy, 2.6, 0, Math.PI * 2); x.fill();
        }
        break;
      }
      case 'mushrooms': {
        for (let i = 0; i < 5; i++) {
          const mx = left + r() * (right - left); if (Math.abs(mx - W / 2) < 80) continue;
          const my = TOP + surface(mx, W, look) + 2, s = 6 + r() * 5;
          x.fillStyle = '#efe2c4'; x.fillRect(mx - s * 0.2, my - s, s * 0.4, s);
          x.fillStyle = look.accentColor; x.shadowColor = look.accentColor; x.shadowBlur = 10;
          x.beginPath(); x.ellipse(mx, my - s, s * 0.8, s * 0.5, 0, Math.PI, 0); x.fill(); x.shadowBlur = 0;
        }
        break;
      }
      case 'shells': {
        for (let i = 0; i < 8; i++) {
          const sx = left + r() * (right - left); if (Math.abs(sx - W / 2) < 70) continue;
          const sy = TOP + surface(sx, W, look) + 5;
          x.fillStyle = ['#ffe0d0', '#ffffff', '#ffb6a0'][i % 3];
          x.beginPath(); x.arc(sx, sy, 3.5, Math.PI, 0); x.fill();
        }
        break;
      }
      case 'ripples': {
        x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 1.5;
        for (let i = 0; i < 10; i++) {
          const rx = r() * W, ry = TOP + 20 + r() * 50;
          x.beginPath(); x.arc(rx, ry, 18 + r() * 14, Math.PI * 1.15, Math.PI * 1.85); x.stroke();
        }
        break;
      }
      case 'icicles': {
        x.fillStyle = 'rgba(230,246,255,0.9)';
        for (let px = left + 8; px < right; px += 14 + r() * 16) {
          const y0 = TOP + surface(px, W, look) + band, len = 6 + r() * 14;
          x.beginPath(); x.moveTo(px - 3, y0); x.lineTo(px, y0 + len); x.lineTo(px + 3, y0); x.closePath(); x.fill();
        }
        break;
      }
      case 'drips': {
        x.fillStyle = look.topColor;
        for (let px = left + 6; px < right; px += 18 + r() * 22) {
          const y0 = TOP + surface(px, W, look) + band - 2, len = 8 + r() * 18;
          x.beginPath(); x.moveTo(px - 5, y0); x.lineTo(px - 5, y0 + len); x.arc(px, y0 + len, 5, Math.PI, 0, true); x.lineTo(px + 5, y0); x.closePath(); x.fill();
        }
        break;
      }
      case 'sprinkles': {
        const cols = ['#ff5c8a', '#5ad1ff', '#ffd23f', '#7bd86a', '#b48af0'];
        for (let i = 0; i < 40; i++) {
          const sx = left + r() * (right - left), sy = TOP + surface(sx, W, look) + 3 + r() * 8;
          x.save(); x.translate(sx, sy); x.rotate(r() * Math.PI);
          x.fillStyle = cols[i % cols.length]; x.fillRect(-3, -1, 6, 2); x.restore();
        }
        break;
      }
      case 'petals': {
        for (let i = 0; i < 22; i++) {
          const px = left + r() * (right - left), py = TOP + surface(px, W, look) + 3 + r() * 8;
          x.fillStyle = r() < 0.5 ? '#ffb3cc' : '#ffd6e2';
          x.beginPath(); x.ellipse(px, py, 3, 1.6, r() * 3, 0, Math.PI * 2); x.fill();
        }
        break;
      }
      default: break;
    }
  }

  // Soft shading where the ground meets the scene, so it doesn't look pasted on
  const fade = x.createLinearGradient(0, TOP, 0, H);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, 'rgba(0,0,0,0.35)');
  x.save(); x.clip(path); x.fillStyle = fade; x.fillRect(0, 0, W, H); x.restore();

  return c;
}

export function worldIndexFromBg(id: string | null | undefined): number {
  const n = Math.abs(parseInt(String(id || '').toLowerCase().replace('bg-', '').replace('campaign-', ''), 10) || 0);
  return n % LOOKS.length;
}

/**
 * Draws the ground under the plate.
 * @param plateBottom screen y where the plate's underside sits
 * @param centerX screen x of the plate centre
 */
export function drawForegroundTerrain(ctx: CanvasRenderingContext2D, w: number, h: number, world: number, plateBottom: number, centerX: number, time: number, plateW: number) {
  const TOP = 18;
  const top = plateBottom - TOP - 4;
  if (top > h) return;
  const W = Math.ceil(w + 120);
  const H = Math.ceil(Math.max(260, h * 0.6));
  const key = `${world}|${W}|${H}`;
  let canvas = cache.get(key);
  if (!canvas) {
    if (cache.size > 24) cache.clear();
    const built = build(world, W, H);
    if (!built) return;
    canvas = built;
    cache.set(key, canvas);
  }
  const look = LOOKS[world] || LOOKS[0];
  const ox = centerX - W / 2;

  // Contact shadow under the plate first, then the ground in front of the scenery
  ctx.drawImage(canvas, ox, top);
  ctx.save();
  const sh = ctx.createRadialGradient(centerX, plateBottom + 2, 4, centerX, plateBottom + 2, plateW * 0.75);
  sh.addColorStop(0, 'rgba(10,6,20,0.45)');
  sh.addColorStop(1, 'rgba(10,6,20,0)');
  ctx.fillStyle = sh;
  ctx.beginPath(); ctx.ellipse(centerX, plateBottom + 3, plateW * 0.75, 12, 0, 0, Math.PI * 2); ctx.fill();

  // Small live accents
  if (look.accent === 'lava' || look.accent === 'goo') {
    ctx.globalCompositeOperation = 'lighter';
    const pulse = 0.25 + 0.15 * Math.sin(time / 500);
    const g = ctx.createLinearGradient(0, top + TOP, 0, top + TOP + 60);
    g.addColorStop(0, `${look.accentColor}${Math.round(pulse * 255).toString(16).padStart(2, '0')}`);
    g.addColorStop(1, `${look.accentColor}00`);
    ctx.fillStyle = g;
    ctx.fillRect(ox, top + TOP, W, 60);
  } else if (look.accent === 'neon') {
    ctx.strokeStyle = look.accentColor; ctx.lineWidth = 2; ctx.shadowColor = look.accentColor; ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(time / 400);
    ctx.beginPath(); ctx.moveTo(ox, top + TOP + 14); ctx.lineTo(ox + W, top + TOP + 14); ctx.stroke();
  }
  ctx.restore();
}
