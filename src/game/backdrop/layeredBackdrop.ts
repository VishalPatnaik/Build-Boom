// Layered "storybook diorama" backdrops for the 20 worlds.
//
// Each world is a stack of flat, hand-styled silhouette layers (far → near) in front of a sky.
// When the tower climbs, every layer slides down at its own depth speed, so near ground falls
// away fast, distant mountains barely move, and clouds, birds and drifting bits stream past at
// different speeds. High up, the sky darkens towards space. That reads as real depth instead of
// one painted sheet sliding down.
//
// Silhouettes are generated once per world/size into small offscreen canvases (cheap per frame).

type Shape =
  | 'hills' | 'mountains' | 'mesas' | 'dunes' | 'craters' | 'sea' | 'reef' | 'forest'
  | 'castle' | 'city' | 'crystals' | 'gears' | 'factory' | 'islands' | 'pyramids' | 'volcano';
type Deco =
  | 'trees' | 'pines' | 'palms' | 'snowcaps' | 'windows' | 'lollipops' | 'mushrooms'
  | 'pagoda' | 'torii' | 'lava' | 'ship' | 'flowers' | 'kelp' | 'goo' | 'banners' | 'none';
type Celestial = 'sun' | 'moon' | 'earth' | 'ringed' | 'clock' | 'rays' | 'none';
type CloudStyle = 'puffy' | 'streak' | 'smoke' | 'nebula' | 'bubble' | 'mist' | 'none';
type Drift = 'petal' | 'snow' | 'ember' | 'bubble' | 'sparkle' | 'sand' | 'spore' | 'rain' | 'leaf' | 'none';
type Flyer = 'birds' | 'fish' | 'fireflies' | 'drones' | 'balloons' | 'lanterns' | 'comets' | 'none';

interface LayerDef {
  shape: Shape;
  color: string;
  top: number;   // where the silhouette starts, as a fraction of screen height
  rough: number; // 0..1 how bumpy
  speed: number; // how fast it sinks per pixel climbed (0 = fixed, 1 = with the tower)
  deco?: Deco;
  decoColor?: string;
}

interface WorldLook {
  sky: [string, string, string];   // top, middle, horizon
  high: [string, string];          // sky top / bottom once you're very high
  celestial: Celestial;
  celestialColor: string;
  celestialPos: [number, number, number]; // x, y (fractions), radius (fraction of min(w,h))
  stars: number;                   // star visibility at ground level (0..1)
  layers: LayerDef[];
  cloud: CloudStyle;
  cloudColor: string;
  drift: Drift;
  driftColor: string;
  flyer: Flyer;
  flyerColor: string;
}

const L = (shape: Shape, color: string, top: number, rough: number, speed: number, deco?: Deco, decoColor?: string): LayerDef =>
  ({ shape, color, top, rough, speed, deco, decoColor });

export const WORLD_LOOKS: WorldLook[] = [
  // 0 Spring Meadow
  { sky: ['#7cc6ee', '#b4e0f2', '#f4f0d4'], high: ['#22447e', '#6aa6dc'], celestial: 'sun', celestialColor: '#fff1a8', celestialPos: [0.78, 0.16, 0.09], stars: 0,
    layers: [L('mountains', '#a9c4cf', 0.5, 0.7, 0.1, 'snowcaps', '#f4f8fa'), L('hills', '#86c27c', 0.64, 0.5, 0.3, 'trees', '#4f9a55'), L('hills', '#5fa95a', 0.76, 0.35, 0.6, 'flowers', '#ffd1e3')],
    cloud: 'puffy', cloudColor: '#ffffff', drift: 'petal', driftColor: '#ffc7da', flyer: 'birds', flyerColor: '#2d3a4a' },
  // 1 Lunar Surface
  { sky: ['#03040c', '#0a0f22', '#161c38'], high: ['#010208', '#070a18'], celestial: 'earth', celestialColor: '#4f8fe0', celestialPos: [0.24, 0.2, 0.1], stars: 1,
    layers: [L('craters', '#2f3447', 0.66, 0.4, 0.1), L('craters', '#4b5168', 0.73, 0.5, 0.3), L('craters', '#7c8298', 0.82, 0.4, 0.6)],
    cloud: 'none', cloudColor: '#ffffff', drift: 'sparkle', driftColor: '#cfd8ff', flyer: 'comets', flyerColor: '#e8eeff' },
  // 2 Martian Canyon
  { sky: ['#d98a5f', '#eeb48a', '#f7d9bb'], high: ['#2c1420', '#8e4535'], celestial: 'sun', celestialColor: '#fff3e0', celestialPos: [0.7, 0.2, 0.05], stars: 0.05,
    layers: [L('mesas', '#c47a58', 0.58, 0.5, 0.1), L('mesas', '#a2533a', 0.68, 0.6, 0.3), L('dunes', '#7a3826', 0.8, 0.4, 0.6)],
    cloud: 'streak', cloudColor: '#f6cfae', drift: 'sand', driftColor: '#efbf95', flyer: 'none', flyerColor: '#000' },
  // 3 Deep Space Nebula
  { sky: ['#090319', '#1d0c3e', '#341656'], high: ['#04010c', '#120626'], celestial: 'ringed', celestialColor: '#e3a3ff', celestialPos: [0.74, 0.22, 0.11], stars: 1,
    layers: [L('islands', '#1e1538', 0.5, 0.6, 0.12), L('islands', '#2c1f50', 0.66, 0.6, 0.32), L('craters', '#3a2a66', 0.84, 0.5, 0.6)],
    cloud: 'nebula', cloudColor: '#d05cf0', drift: 'sparkle', driftColor: '#9ff3ff', flyer: 'comets', flyerColor: '#fde8ff' },
  // 4 Abyssal Coral Reef (climbing = swimming up toward the light)
  { sky: ['#0a3a58', '#0e5c78', '#147f8c'], high: ['#3cb6c8', '#8fe3df'], celestial: 'rays', celestialColor: '#bff6ff', celestialPos: [0.6, 0, 0.6], stars: 0,
    layers: [L('reef', '#155667', 0.62, 0.6, 0.1), L('reef', '#1d7470', 0.7, 0.7, 0.3, 'kelp', '#2e9a6a'), L('reef', '#c9586a', 0.8, 0.6, 0.6, 'kelp', '#e98a5a')],
    cloud: 'bubble', cloudColor: '#bff6ff', drift: 'bubble', driftColor: '#d6fbff', flyer: 'fish', flyerColor: '#ffb14a' },
  // 5 Tropical Sunset Beach
  { sky: ['#ff8f78', '#ffbf8a', '#ffe3a2'], high: ['#33255f', '#c35f86'], celestial: 'sun', celestialColor: '#ffe08a', celestialPos: [0.5, 0.6, 0.13], stars: 0,
    layers: [L('sea', '#5b6fbb', 0.64, 0.2, 0.1), L('hills', '#3a3f74', 0.76, 0.25, 0.3, 'palms', '#2a2c56'), L('dunes', '#f0bd78', 0.86, 0.3, 0.6, 'palms', '#3c5a3a')],
    cloud: 'streak', cloudColor: '#ffd2c2', drift: 'none', driftColor: '#fff', flyer: 'birds', flyerColor: '#5a2a3a' },
  // 6 Volcanic Caldera
  { sky: ['#260c10', '#561913', '#b4411c'], high: ['#0b0405', '#2e0c0c'], celestial: 'none', celestialColor: '#ff6a2a', celestialPos: [0.5, 0.5, 0.1], stars: 0.15,
    layers: [L('volcano', '#3b1a1a', 0.42, 0.5, 0.1, 'lava', '#ff6a2a'), L('mountains', '#2a1214', 0.64, 0.8, 0.3), L('hills', '#170a0b', 0.78, 0.5, 0.6, 'lava', '#ff7a2a')],
    cloud: 'smoke', cloudColor: '#4c2a2a', drift: 'ember', driftColor: '#ff8a3d', flyer: 'none', flyerColor: '#000' },
  // 7 Ancient Stone Citadel
  { sky: ['#90aed0', '#c4d3e2', '#ece4d0'], high: ['#28375a', '#7f98bd'], celestial: 'sun', celestialColor: '#fff6d8', celestialPos: [0.2, 0.17, 0.07], stars: 0,
    layers: [L('mountains', '#9ba8ba', 0.5, 0.6, 0.1, 'snowcaps', '#eef2f7'), L('castle', '#6c7586', 0.56, 0.5, 0.3, 'banners', '#c0392b'), L('hills', '#4d5868', 0.8, 0.35, 0.6, 'pines', '#3a4656')],
    cloud: 'puffy', cloudColor: '#ffffff', drift: 'leaf', driftColor: '#c9a26b', flyer: 'birds', flyerColor: '#2d3340' },
  // 8 Enchanted Redwood Forest
  { sky: ['#1b3533', '#2d544a', '#5e8c66'], high: ['#0d1a22', '#26464e'], celestial: 'moon', celestialColor: '#eef6d8', celestialPos: [0.74, 0.16, 0.07], stars: 0.35,
    layers: [L('forest', '#2c4e47', 0.5, 0.6, 0.1), L('forest', '#1f3b33', 0.6, 0.7, 0.3), L('hills', '#132822', 0.8, 0.4, 0.6, 'mushrooms', '#f6c56b')],
    cloud: 'mist', cloudColor: '#bfe0cf', drift: 'sparkle', driftColor: '#dcff8a', flyer: 'fireflies', flyerColor: '#e8ff9a' },
  // 9 Golden Desert Oasis
  { sky: ['#f2bd60', '#f8d891', '#fcefc8'], high: ['#28467f', '#d89b52'], celestial: 'sun', celestialColor: '#fff6c8', celestialPos: [0.26, 0.15, 0.1], stars: 0,
    layers: [L('dunes', '#e2ae66', 0.62, 0.5, 0.1), L('dunes', '#d1924c', 0.7, 0.6, 0.3, 'palms', '#4f6a36'), L('dunes', '#bd7a38', 0.82, 0.5, 0.6)],
    cloud: 'streak', cloudColor: '#fff4dc', drift: 'sand', driftColor: '#f3d29a', flyer: 'birds', flyerColor: '#5a3a1a' },
  // 10 Frozen Arctic Tundra
  { sky: ['#9fd2ee', '#cde9f6', '#f1f8fb'], high: ['#1b3354', '#679fd6'], celestial: 'sun', celestialColor: '#ffffff', celestialPos: [0.72, 0.2, 0.06], stars: 0,
    layers: [L('mountains', '#c6dcea', 0.48, 0.7, 0.1, 'snowcaps', '#ffffff'), L('mountains', '#9cc4dc', 0.62, 0.9, 0.3, 'snowcaps', '#f4fbff'), L('hills', '#e6f2f9', 0.8, 0.3, 0.6, 'pines', '#5d7f95')],
    cloud: 'puffy', cloudColor: '#ffffff', drift: 'snow', driftColor: '#ffffff', flyer: 'birds', flyerColor: '#3a4a5a' },
  // 11 Pirate Corsair Cove
  { sky: ['#78acd6', '#b4d4e8', '#f1e5c6'], high: ['#1c3253', '#6895bf'], celestial: 'sun', celestialColor: '#fff4c8', celestialPos: [0.8, 0.18, 0.07], stars: 0,
    layers: [L('mesas', '#6a7d8e', 0.56, 0.6, 0.1), L('sea', '#2c5a7a', 0.7, 0.3, 0.3, 'ship', '#2a1f1a'), L('hills', '#4a3a2c', 0.82, 0.5, 0.6, 'palms', '#2f4a2a')],
    cloud: 'puffy', cloudColor: '#ffffff', drift: 'none', driftColor: '#fff', flyer: 'birds', flyerColor: '#2a2a2a' },
  // 12 Candyland Confection
  { sky: ['#ffbfdf', '#ffdeed', '#fff4e2'], high: ['#7550ae', '#f0a2d2'], celestial: 'sun', celestialColor: '#fff4b0', celestialPos: [0.24, 0.17, 0.08], stars: 0,
    layers: [L('hills', '#f6a3c4', 0.58, 0.6, 0.1), L('hills', '#b48af0', 0.68, 0.6, 0.3, 'lollipops', '#ff5c8a'), L('hills', '#7ad3be', 0.8, 0.5, 0.6, 'flowers', '#ffffff')],
    cloud: 'puffy', cloudColor: '#fff2f8', drift: 'sparkle', driftColor: '#ffffff', flyer: 'balloons', flyerColor: '#ff6fa8' },
  // 13 Golden El Dorado
  { sky: ['#e3a640', '#f0cb74', '#f8e6ae'], high: ['#45270c', '#c58526'], celestial: 'sun', celestialColor: '#fff2b8', celestialPos: [0.7, 0.16, 0.09], stars: 0,
    layers: [L('pyramids', '#b47f2c', 0.52, 0.5, 0.1), L('forest', '#5a6628', 0.66, 0.6, 0.3), L('hills', '#7d5310', 0.8, 0.4, 0.6, 'flowers', '#ffd84a')],
    cloud: 'streak', cloudColor: '#fff0c8', drift: 'sparkle', driftColor: '#ffe27a', flyer: 'birds', flyerColor: '#3a2a10' },
  // 14 Cyberpunk Megacity
  { sky: ['#08081c', '#170d36', '#38145c'], high: ['#020207', '#120927'], celestial: 'moon', celestialColor: '#ff7ad9', celestialPos: [0.74, 0.18, 0.09], stars: 0.4,
    layers: [L('city', '#1b1440', 0.42, 0.7, 0.1, 'windows', '#4fd8ff'), L('city', '#120d2c', 0.55, 0.8, 0.3, 'windows', '#ff4fd8'), L('city', '#08061a', 0.72, 0.6, 0.6, 'windows', '#ffe14f')],
    cloud: 'smoke', cloudColor: '#3a285a', drift: 'rain', driftColor: '#7fe9ff', flyer: 'drones', flyerColor: '#ff4fd8' },
  // 15 Toxic Industrial Wasteland
  { sky: ['#56662a', '#87983a', '#c6d278'], high: ['#181d09', '#46561a'], celestial: 'sun', celestialColor: '#eaff8a', celestialPos: [0.3, 0.2, 0.08], stars: 0,
    layers: [L('factory', '#4a5230', 0.5, 0.6, 0.1), L('factory', '#363b22', 0.62, 0.7, 0.3), L('hills', '#262a17', 0.8, 0.5, 0.6, 'goo', '#a6ff3a')],
    cloud: 'smoke', cloudColor: '#6b7040', drift: 'spore', driftColor: '#c6ff5a', flyer: 'none', flyerColor: '#000' },
  // 16 Floating Sky Islands
  { sky: ['#78c4f0', '#b2e0f6', '#e6f5fb'], high: ['#3368ad', '#98d0ef'], celestial: 'sun', celestialColor: '#fff6c8', celestialPos: [0.2, 0.15, 0.08], stars: 0,
    layers: [L('islands', '#a1bdd1', 0.42, 0.5, 0.12), L('islands', '#5f9a6a', 0.52, 0.6, 0.32, 'trees', '#3f7a4c'), L('islands', '#3f7a4c', 0.7, 0.6, 0.6, 'trees', '#2c5a36')],
    cloud: 'puffy', cloudColor: '#ffffff', drift: 'leaf', driftColor: '#9ed27a', flyer: 'balloons', flyerColor: '#ffb347' },
  // 17 Chrono Clockwork Realm
  { sky: ['#26170c', '#462b13', '#86572a'], high: ['#100803', '#36220e'], celestial: 'clock', celestialColor: '#f2c36b', celestialPos: [0.5, 0.22, 0.17], stars: 0.1,
    layers: [L('gears', '#5a3a1a', 0.5, 0.6, 0.1), L('gears', '#3e2810', 0.62, 0.7, 0.3), L('factory', '#2a1a0a', 0.78, 0.5, 0.6)],
    cloud: 'smoke', cloudColor: '#8a7a6a', drift: 'sparkle', driftColor: '#f2c36b', flyer: 'none', flyerColor: '#000' },
  // 18 Sakura Blossom Shrine
  { sky: ['#ffd2de', '#ffe6ec', '#fff6ef'], high: ['#463a78', '#e2a2bf'], celestial: 'sun', celestialColor: '#ff6b6b', celestialPos: [0.7, 0.2, 0.09], stars: 0,
    layers: [L('mountains', '#b8b4d6', 0.44, 0.3, 0.1, 'snowcaps', '#ffffff'), L('hills', '#d98aa8', 0.66, 0.5, 0.3, 'pagoda', '#7a3248'), L('hills', '#8a4a5a', 0.8, 0.4, 0.6, 'torii', '#d93a3a')],
    cloud: 'streak', cloudColor: '#ffffff', drift: 'petal', driftColor: '#ff9ec0', flyer: 'lanterns', flyerColor: '#ff7a4a' },
  // 19 Crystalline Geode Core
  { sky: ['#12091f', '#221139', '#381957'], high: ['#05020c', '#170929'], celestial: 'none', celestialColor: '#c084fc', celestialPos: [0.5, 0.4, 0.1], stars: 0.5,
    layers: [L('crystals', '#3a2a6a', 0.46, 0.7, 0.1), L('crystals', '#5a3aa0', 0.6, 0.8, 0.3), L('crystals', '#8a5ad8', 0.76, 0.7, 0.6)],
    cloud: 'none', cloudColor: '#ffffff', drift: 'sparkle', driftColor: '#7ff3ff', flyer: 'fireflies', flyerColor: '#c9a4ff' },
];

// ---------- small helpers ----------
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
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const k = Math.max(0, Math.min(1, t));
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * k)},${Math.round(A[1] + (B[1] - A[1]) * k)},${Math.round(A[2] + (B[2] - A[2]) * k)})`;
}
function shade(hex: string, amt: number) {
  return amt >= 0 ? mix(hex, '#ffffff', amt) : mix(hex, '#000000', -amt);
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const mod = (a: number, n: number) => ((a % n) + n) % n;

// ---------- silhouette generation ----------
const PAD = 60; // extra width either side so tilt/sway never shows an edge

function makeCanvas(w: number, h: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

/** Outline points of a skyline across width W, top region of height H (y=0 top). */
function skyline(shape: Shape, W: number, H: number, rough: number, r: () => number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  const base = H * 0.35;
  switch (shape) {
    case 'hills': case 'dunes': case 'sea': case 'craters': {
      const p1 = r() * 6, p2 = r() * 6, f1 = 1.2 + r() * 1.5, f2 = 3 + r() * 3;
      const amp = shape === 'sea' ? H * 0.04 : H * (0.12 + rough * 0.22);
      for (let x = 0; x <= W; x += 6) {
        const u = x / W;
        let y = base + Math.sin(u * Math.PI * f1 + p1) * amp + Math.sin(u * Math.PI * f2 + p2) * amp * 0.35;
        if (shape === 'dunes') y = base + (Math.abs(Math.sin(u * Math.PI * f1 + p1)) * -amp * 1.2) + Math.sin(u * Math.PI * f2 + p2) * amp * 0.25 + amp * 0.6;
        if (shape === 'craters') {
          const c = Math.sin(u * Math.PI * 7 + p2);
          y = base + Math.sin(u * Math.PI * f1 + p1) * amp * 0.5 + (c > 0.75 ? (c - 0.75) * amp * 2.2 : 0);
        }
        pts.push([x, y]);
      }
      break;
    }
    case 'mountains': case 'volcano': {
      if (shape === 'volcano') {
        const cx = W * (0.35 + r() * 0.3), topW = W * 0.07, baseW = W * 0.55;
        pts.push([0, H * 0.75], [cx - baseW / 2, H * 0.6], [cx - topW, H * 0.08], [cx - topW * 0.4, H * 0.12], [cx + topW * 0.4, H * 0.1], [cx + topW, H * 0.06], [cx + baseW / 2, H * 0.62], [W, H * 0.72]);
        break;
      }
      let x = 0; let y = base + H * 0.2;
      pts.push([0, y]);
      while (x < W) {
        const step = 30 + r() * 70;
        x = Math.min(W, x + step);
        y = Math.max(H * 0.04, Math.min(H * 0.8, base + (r() - 0.55) * H * (0.4 + rough * 0.6)));
        pts.push([x, y]);
      }
      break;
    }
    case 'mesas': case 'pyramids': {
      let x = 0;
      pts.push([0, H * 0.7]);
      while (x < W) {
        const wdt = 50 + r() * 120, top = H * (0.12 + r() * 0.4);
        if (shape === 'pyramids') {
          const steps = 4;
          pts.push([x, H * 0.75]);
          for (let s = 0; s < steps; s++) {
            const sx = x + (wdt / 2) * (s / steps), sy = H * 0.75 - ((H * 0.75 - top) * (s + 1)) / steps;
            pts.push([sx, H * 0.75 - ((H * 0.75 - top) * s) / steps], [sx, sy]);
          }
          for (let s = steps - 1; s >= 0; s--) {
            const sx = x + wdt - (wdt / 2) * (s / steps), sy = H * 0.75 - ((H * 0.75 - top) * (s + 1)) / steps;
            pts.push([sx, sy], [sx, H * 0.75 - ((H * 0.75 - top) * s) / steps]);
          }
          x += wdt + r() * 60;
          pts.push([x, H * 0.75]);
        } else {
          pts.push([x + 8, top + 10], [x + 16, top], [x + wdt - 16, top], [x + wdt - 8, top + 10], [x + wdt, H * 0.62]);
          x += wdt + 10 + r() * 40;
          pts.push([x, H * 0.66]);
        }
      }
      break;
    }
    case 'forest': {
      let x = -10;
      pts.push([0, H * 0.55]);
      while (x < W + 10) {
        const tw = 18 + r() * 26, th = H * (0.25 + r() * 0.35 * (0.5 + rough));
        pts.push([x, H * 0.55], [x + tw / 2, H * 0.55 - th], [x + tw, H * 0.55]);
        x += tw * (0.55 + r() * 0.3);
      }
      break;
    }
    case 'castle': {
      let x = 0;
      pts.push([0, H * 0.7]);
      while (x < W) {
        const tower = r() < 0.4;
        const wdt = tower ? 26 + r() * 16 : 60 + r() * 70;
        const top = tower ? H * (0.1 + r() * 0.2) : H * (0.38 + r() * 0.12);
        pts.push([x, top]);
        if (tower && r() < 0.6) {
          pts.push([x - 4, top], [x + wdt / 2, top - 34], [x + wdt + 4, top]);
        } else {
          for (let cx = x; cx < x + wdt - 8; cx += 12) pts.push([cx, top], [cx, top - 8], [cx + 6, top - 8], [cx + 6, top]);
        }
        pts.push([x + wdt, top]);
        x += wdt;
      }
      pts.push([W, H * 0.7]);
      break;
    }
    case 'city': case 'factory': {
      let x = 0;
      pts.push([0, H * 0.8]);
      while (x < W) {
        const wdt = 22 + r() * 46, top = H * (0.08 + r() * 0.6 * (0.6 + rough * 0.6));
        pts.push([x, top]);
        if (shape === 'factory' && r() < 0.5) {
          const cx = x + wdt * 0.3;
          pts.push([cx, top], [cx, top - 40 - r() * 40], [cx + 10, top - 40 - r() * 40], [cx + 10, top]);
        } else if (shape === 'city' && r() < 0.3) {
          pts.push([x + wdt / 2 - 1, top], [x + wdt / 2 - 1, top - 22], [x + wdt / 2 + 1, top - 22], [x + wdt / 2 + 1, top]);
        }
        pts.push([x + wdt, top]);
        x += wdt + (shape === 'factory' ? r() * 20 : 2);
      }
      pts.push([W, H * 0.8]);
      break;
    }
    case 'crystals': {
      let x = -10;
      pts.push([0, H * 0.7]);
      while (x < W + 10) {
        const cw = 20 + r() * 40, ch = H * (0.2 + r() * 0.6 * (0.5 + rough * 0.5)), lean = (r() - 0.5) * cw;
        pts.push([x, H * 0.7], [x + cw * 0.2 + lean * 0.5, H * 0.7 - ch * 0.85], [x + cw / 2 + lean, H * 0.7 - ch], [x + cw * 0.8 + lean * 0.5, H * 0.7 - ch * 0.8], [x + cw, H * 0.7]);
        x += cw * (0.5 + r() * 0.4);
      }
      break;
    }
    case 'gears': {
      pts.push([0, H * 0.7], [W, H * 0.7]);
      break;
    }
    case 'reef': {
      let x = -10;
      pts.push([0, H * 0.6]);
      while (x < W + 10) {
        const bw = 26 + r() * 50, bh = H * (0.12 + r() * 0.3 * (0.5 + rough));
        for (let a = Math.PI; a <= Math.PI * 2 + 0.01; a += 0.35) pts.push([x + bw / 2 + Math.cos(a) * bw / 2, H * 0.6 + Math.sin(a) * bh]);
        x += bw * (0.6 + r() * 0.3);
      }
      break;
    }
    case 'islands': {
      pts.push([0, H], [W, H]); // islands are drawn separately as floating blobs
      break;
    }
  }
  return pts;
}

function fillShape(c: CanvasRenderingContext2D, pts: Array<[number, number]>, W: number, H: number, color: string) {
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts) c.lineTo(x, y);
  c.lineTo(W, H);
  c.lineTo(0, H);
  c.closePath();
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(color, 0.1));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.18));
  c.fillStyle = g;
  c.fill();
}

function drawIslands(c: CanvasRenderingContext2D, W: number, H: number, color: string, r: () => number, deco?: Deco, decoColor?: string) {
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const iw = 50 + r() * 110, ix = (W / n) * i + r() * (W / n - iw), iy = H * (0.1 + r() * 0.45);
    c.beginPath();
    c.moveTo(ix, iy);
    c.quadraticCurveTo(ix + iw / 2, iy - 10, ix + iw, iy);
    c.lineTo(ix + iw * 0.7, iy + iw * 0.25);
    c.lineTo(ix + iw * 0.5, iy + iw * 0.55);
    c.lineTo(ix + iw * 0.3, iy + iw * 0.22);
    c.closePath();
    const g = c.createLinearGradient(0, iy - 10, 0, iy + iw * 0.55);
    g.addColorStop(0, shade(color, 0.15));
    g.addColorStop(1, shade(color, -0.35));
    c.fillStyle = g;
    c.fill();
    if (deco === 'trees' || deco === 'palms') {
      for (let t = 0; t < 3; t++) drawTree(c, ix + iw * (0.25 + t * 0.25), iy - 2, 9 + r() * 6, decoColor || shade(color, -0.2), deco === 'palms' ? 'palm' : 'round');
    }
  }
}

function drawTree(c: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, kind: 'round' | 'pine' | 'palm') {
  c.fillStyle = shade(color, -0.3);
  c.fillRect(x - s * 0.09, y - s * 1.1, s * 0.18, s * 1.1);
  c.fillStyle = color;
  if (kind === 'round') {
    c.beginPath(); c.arc(x, y - s * 1.3, s * 0.65, 0, Math.PI * 2); c.fill();
  } else if (kind === 'pine') {
    c.beginPath(); c.moveTo(x - s * 0.55, y - s * 0.6); c.lineTo(x, y - s * 2.1); c.lineTo(x + s * 0.55, y - s * 0.6); c.closePath(); c.fill();
  } else {
    c.strokeStyle = color; c.lineWidth = Math.max(1.5, s * 0.16); c.lineCap = 'round';
    for (let k = -2; k <= 2; k++) {
      c.beginPath(); c.moveTo(x, y - s * 1.1); c.quadraticCurveTo(x + k * s * 0.35, y - s * 1.6, x + k * s * 0.55, y - s * 1.0); c.stroke();
    }
  }
}

function surfaceY(pts: Array<[number, number]>, x: number): number {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    if (x >= Math.min(x0, x1) && x <= Math.max(x0, x1) && x1 !== x0) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return pts[pts.length - 1]?.[1] ?? 0;
}

function decorate(c: CanvasRenderingContext2D, layer: LayerDef, pts: Array<[number, number]>, W: number, H: number, r: () => number) {
  const dc = layer.decoColor || shade(layer.color, -0.2);
  switch (layer.deco) {
    case 'trees': case 'pines': case 'palms': {
      const kind = layer.deco === 'trees' ? 'round' : layer.deco === 'pines' ? 'pine' : 'palm';
      for (let x = 20 + r() * 40; x < W; x += 30 + r() * 90) drawTree(c, x, surfaceY(pts, x) + 3, 10 + r() * 9, dc, kind);
      break;
    }
    case 'flowers': {
      for (let i = 0; i < W / 9; i++) {
        const x = r() * W, y = surfaceY(pts, x) + 6 + r() * H * 0.25;
        c.fillStyle = r() < 0.5 ? dc : '#fff6b0';
        c.globalAlpha = 0.85;
        c.beginPath(); c.arc(x, y, 1.6 + r() * 1.4, 0, Math.PI * 2); c.fill();
      }
      c.globalAlpha = 1;
      break;
    }
    case 'snowcaps': {
      const ys = pts.map((p) => p[1]).sort((m, n) => m - n);
      const cut = ys[Math.floor(ys.length * 0.35)] ?? 0;
      c.fillStyle = dc;
      for (let i = 1; i < pts.length - 1; i++) {
        const [x, y] = pts[i];
        if (y > cut || y > pts[i - 1][1] || y > pts[i + 1][1]) continue; // only local peaks that are high
        const depth = Math.min(28, (cut - y) * 0.6 + 8);
        const lx = x + (pts[i - 1][0] - x) * (depth / Math.max(1, pts[i - 1][1] - y));
        const rx = x + (pts[i + 1][0] - x) * (depth / Math.max(1, pts[i + 1][1] - y));
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(lx, y + depth);
        c.lineTo(x - (x - lx) * 0.35, y + depth * 0.7);
        c.lineTo(x, y + depth * 0.95);
        c.lineTo(x + (rx - x) * 0.4, y + depth * 0.7);
        c.lineTo(rx, y + depth);
        c.closePath();
        c.fill();
      }
      break;
    }
    case 'windows': {
      c.fillStyle = dc;
      for (let i = 0; i < W * H / 260; i++) {
        const x = r() * W, y = r() * H;
        if (y < surfaceY(pts, x) + 6) continue;
        c.globalAlpha = 0.35 + r() * 0.6;
        c.fillRect(Math.round(x), Math.round(y), 2, 3);
      }
      c.globalAlpha = 1;
      break;
    }
    case 'lollipops': {
      for (let x = 30 + r() * 40; x < W; x += 50 + r() * 90) {
        const y = surfaceY(pts, x) + 2, s = 8 + r() * 6;
        c.fillStyle = '#fff'; c.fillRect(x - 1, y - s * 2.2, 2, s * 2.2);
        c.fillStyle = r() < 0.5 ? dc : '#ffd84a';
        c.beginPath(); c.arc(x, y - s * 2.4, s * 0.8, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.5;
        c.beginPath(); c.arc(x, y - s * 2.4, s * 0.45, 0, Math.PI * 1.4); c.stroke();
      }
      break;
    }
    case 'mushrooms': {
      for (let x = 25 + r() * 30; x < W; x += 60 + r() * 80) {
        const y = surfaceY(pts, x) + 6, s = 6 + r() * 6;
        c.fillStyle = '#e8dcc0'; c.fillRect(x - s * 0.2, y - s, s * 0.4, s);
        c.fillStyle = dc; c.shadowColor = dc; c.shadowBlur = 10;
        c.beginPath(); c.ellipse(x, y - s, s * 0.8, s * 0.5, 0, Math.PI, 0); c.fill();
        c.shadowBlur = 0;
      }
      break;
    }
    case 'pagoda': {
      const x = W * (0.25 + r() * 0.5), y = surfaceY(pts, x) + 4;
      c.fillStyle = dc;
      for (let t = 0; t < 4; t++) {
        const tw = 46 - t * 9, ty = y - 14 - t * 16;
        c.fillRect(x - tw * 0.32, ty, tw * 0.64, 14);
        c.beginPath(); c.moveTo(x - tw / 2 - 6, ty + 2); c.quadraticCurveTo(x, ty - 10, x + tw / 2 + 6, ty + 2); c.lineTo(x + tw / 2, ty + 5); c.lineTo(x - tw / 2, ty + 5); c.closePath(); c.fill();
      }
      c.fillRect(x - 1, y - 92, 2, 14);
      for (let x2 = 20; x2 < W; x2 += 40 + r() * 60) {
        if (Math.abs(x2 - x) < 50) continue;
        c.fillStyle = '#ffb3cc';
        c.beginPath(); c.arc(x2, surfaceY(pts, x2) - 8, 10 + r() * 6, 0, Math.PI * 2); c.fill();
      }
      break;
    }
    case 'torii': {
      const x = W * (0.2 + r() * 0.6), y = surfaceY(pts, x) + 6;
      c.fillStyle = dc;
      c.fillRect(x - 22, y - 46, 5, 46); c.fillRect(x + 17, y - 46, 5, 46);
      c.fillRect(x - 28, y - 50, 56, 5); c.fillRect(x - 24, y - 40, 48, 4);
      c.beginPath(); c.moveTo(x - 32, y - 52); c.quadraticCurveTo(x, y - 58, x + 32, y - 52); c.lineTo(x + 30, y - 49); c.lineTo(x - 30, y - 49); c.closePath(); c.fill();
      break;
    }
    case 'lava': {
      c.strokeStyle = dc; c.lineWidth = 2; c.shadowColor = dc; c.shadowBlur = 8;
      for (let i = 0; i < 8; i++) {
        let x = r() * W, y = surfaceY(pts, x) + 4;
        c.beginPath(); c.moveTo(x, y);
        for (let s = 0; s < 6; s++) { x += (r() - 0.5) * 14; y += 6 + r() * 10; c.lineTo(x, y); }
        c.stroke();
      }
      c.shadowBlur = 0;
      break;
    }
    case 'ship': {
      const x = W * (0.3 + r() * 0.4), y = surfaceY(pts, x) + 2;
      c.fillStyle = dc;
      c.beginPath(); c.moveTo(x - 30, y - 8); c.lineTo(x + 30, y - 8); c.lineTo(x + 22, y + 2); c.lineTo(x - 24, y + 2); c.closePath(); c.fill();
      c.fillRect(x - 1, y - 48, 2, 40);
      c.fillStyle = '#efe6d2';
      c.beginPath(); c.moveTo(x + 2, y - 46); c.lineTo(x + 20, y - 30); c.lineTo(x + 2, y - 14); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(x - 2, y - 42); c.lineTo(x - 18, y - 28); c.lineTo(x - 2, y - 16); c.closePath(); c.fill();
      break;
    }
    case 'kelp': {
      c.strokeStyle = dc; c.lineWidth = 3; c.lineCap = 'round';
      for (let x = 10 + r() * 20; x < W; x += 24 + r() * 40) {
        const y = surfaceY(pts, x) + 6, hgt = 20 + r() * 50;
        c.beginPath(); c.moveTo(x, y);
        c.bezierCurveTo(x - 8, y - hgt * 0.3, x + 8, y - hgt * 0.6, x - 2, y - hgt); c.stroke();
      }
      break;
    }
    case 'goo': {
      c.fillStyle = dc; c.shadowColor = dc; c.shadowBlur = 10;
      for (let i = 0; i < 6; i++) {
        const x = r() * W, y = surfaceY(pts, x) + 10 + r() * 30;
        c.beginPath(); c.ellipse(x, y, 14 + r() * 20, 4 + r() * 3, 0, 0, Math.PI * 2); c.fill();
      }
      c.shadowBlur = 0;
      break;
    }
    case 'banners': {
      for (let x = 30; x < W; x += 70 + r() * 80) {
        const y = surfaceY(pts, x);
        c.fillStyle = '#3a3a3a'; c.fillRect(x, y - 30, 1.5, 30);
        c.fillStyle = dc;
        c.beginPath(); c.moveTo(x + 1.5, y - 30); c.lineTo(x + 16, y - 26); c.lineTo(x + 1.5, y - 21); c.closePath(); c.fill();
      }
      break;
    }
    default: break;
  }
}

function drawGears(c: CanvasRenderingContext2D, W: number, H: number, color: string, r: () => number) {
  let x = 0;
  while (x < W + 60) {
    const rad = 26 + r() * 60, cx = x + rad, cy = H * 0.7 - rad * 0.4;
    c.fillStyle = color;
    c.beginPath();
    const teeth = Math.max(8, Math.round(rad / 6));
    for (let i = 0; i < teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? rad : rad * 0.84;
      c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    c.closePath(); c.fill();
    c.fillStyle = shade(color, -0.25);
    c.beginPath(); c.arc(cx, cy, rad * 0.25, 0, Math.PI * 2); c.fill();
    x += rad * (1.4 + r() * 0.6);
  }
  c.fillStyle = color;
  c.fillRect(0, H * 0.7, W, H * 0.3);
}

const layerCache = new Map<string, { canvas: HTMLCanvasElement; y: number }>();

function getLayer(world: number, idx: number, layer: LayerDef, w: number, h: number) {
  const key = `${world}|${idx}|${w}|${h}`;
  const hit = layerCache.get(key);
  if (hit) return hit;
  if (layerCache.size > 48) layerCache.clear();
  const W = w + PAD * 2;
  const top = Math.round(h * layer.top);
  const H = h - top + 4;
  const canvas = makeCanvas(W, H);
  if (!canvas) return null;
  const c = canvas.getContext('2d');
  if (!c) return null;
  const r = rng(world * 977 + idx * 131 + 7);
  if (layer.shape === 'islands') {
    drawIslands(c, W, H, layer.color, r, layer.deco, layer.decoColor);
  } else if (layer.shape === 'gears') {
    drawGears(c, W, H, layer.color, r);
  } else {
    const pts = skyline(layer.shape, W, H, layer.rough, r);
    fillShape(c, pts, W, H, layer.color);
    if (layer.deco && layer.deco !== 'none') decorate(c, layer, pts, W, H, r);
  }
  const entry = { canvas, y: top };
  layerCache.set(key, entry);
  return entry;
}

// ---------- animated bits ----------
function drawCelestial(ctx: CanvasRenderingContext2D, look: WorldLook, w: number, h: number, alt: number, time: number) {
  const m = Math.min(w, h);
  const cx = look.celestialPos[0] * w, cy = look.celestialPos[1] * h + alt * 0.03, rad = look.celestialPos[2] * m;
  const col = look.celestialColor;
  ctx.save();
  switch (look.celestial) {
    case 'sun': case 'moon': {
      const g = ctx.createRadialGradient(cx, cy, rad * 0.5, cx, cy, rad * 3.2);
      g.addColorStop(0, `rgba(${hexToRgb(col).join(',')},0.45)`);
      g.addColorStop(1, `rgba(${hexToRgb(col).join(',')},0)`);
      ctx.fillStyle = g; ctx.fillRect(cx - rad * 3.2, cy - rad * 3.2, rad * 6.4, rad * 6.4);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
      if (look.celestial === 'moon') {
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath(); ctx.arc(cx - rad * 0.3, cy - rad * 0.2, rad * 0.2, 0, Math.PI * 2); ctx.arc(cx + rad * 0.35, cy + rad * 0.3, rad * 0.14, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'earth': {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = '#5bb36a';
      ctx.beginPath(); ctx.ellipse(cx - rad * 0.3, cy - rad * 0.1, rad * 0.4, rad * 0.25, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + rad * 0.4, cy + rad * 0.35, rad * 0.3, rad * 0.18, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(cx + rad * 0.45, cy, rad, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      break;
    }
    case 'ringed': {
      ctx.strokeStyle = `rgba(${hexToRgb(col).join(',')},0.55)`; ctx.lineWidth = rad * 0.12;
      ctx.beginPath(); ctx.ellipse(cx, cy, rad * 1.8, rad * 0.45, -0.3, Math.PI, Math.PI * 2); ctx.stroke();
      const g = ctx.createLinearGradient(cx - rad, cy - rad, cx + rad, cy + rad);
      g.addColorStop(0, shade(col, 0.2)); g.addColorStop(1, shade(col, -0.5));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy, rad * 1.8, rad * 0.45, -0.3, 0, Math.PI); ctx.stroke();
      break;
    }
    case 'clock': {
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * rad * 0.82, cy + Math.sin(a) * rad * 0.82); ctx.lineTo(cx + Math.cos(a) * rad * 0.94, cy + Math.sin(a) * rad * 0.94); ctx.stroke();
      }
      const am = time / 2000, ah = time / 24000;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(am) * rad * 0.75, cy + Math.sin(am) * rad * 0.75); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ah) * rad * 0.5, cy + Math.sin(ah) * rad * 0.5); ctx.stroke();
      break;
    }
    case 'rays': {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const x = w * (0.1 + i * 0.17) + Math.sin(time / 3000 + i) * 20;
        const g = ctx.createLinearGradient(0, 0, 0, h * 0.8);
        g.addColorStop(0, `rgba(${hexToRgb(col).join(',')},${0.12 + 0.05 * Math.sin(time / 1500 + i)})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(x - 10, 0); ctx.lineTo(x + 30, 0); ctx.lineTo(x + 90, h * 0.8); ctx.lineTo(x + 20, h * 0.8); ctx.closePath(); ctx.fill();
      }
      break;
    }
    default: break;
  }
  ctx.restore();
}

function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number, alt: number, time: number) {
  if (alpha <= 0.01) return;
  const r = rng(4242);
  ctx.save();
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 90; i++) {
    const x = r() * w, y = mod(r() * h * 1.4 + alt * 0.02, h * 1.4) - h * 0.2, s = r() < 0.15 ? 2 : 1;
    ctx.globalAlpha = alpha * (0.45 + 0.55 * Math.abs(Math.sin(time / (900 + i * 37) + i)));
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

const cloudSprites = new Map<string, HTMLCanvasElement>();
function cloudSprite(style: CloudStyle, color: string, variant: number): HTMLCanvasElement | null {
  const key = `${style}|${color}|${variant}`;
  const hit = cloudSprites.get(key);
  if (hit) return hit;
  const W = 220, H = 110;
  const c = makeCanvas(W, H);
  const x = c?.getContext('2d');
  if (!c || !x) return null;
  const r = rng(variant * 31 + style.length);
  const rgb = hexToRgb(color).join(',');
  if (style === 'puffy' || style === 'mist' || style === 'smoke') {
    const n = 4 + Math.floor(r() * 3);
    x.fillStyle = `rgba(${rgb},1)`;
    for (let i = 0; i < n; i++) {
      const cx = 40 + (i / (n - 1)) * 140, rad = 20 + r() * 22 + (i > 0 && i < n - 1 ? 10 : 0);
      x.beginPath(); x.arc(cx, 78 - rad * 0.55, rad, 0, Math.PI * 2); x.fill();
    }
    x.fillRect(30, 70, 160, 14);
    // soft shading on the underside
    x.globalCompositeOperation = 'source-atop';
    const g = x.createLinearGradient(0, 20, 0, 90);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, style === 'puffy' ? 'rgba(120,150,190,0.25)' : 'rgba(0,0,0,0.2)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  } else if (style === 'streak' || style === 'nebula') {
    const g = x.createRadialGradient(W / 2, H / 2, 4, W / 2, H / 2, W / 2);
    g.addColorStop(0, `rgba(${rgb},${style === 'nebula' ? 0.55 : 0.9})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    x.fillStyle = g;
    x.save(); x.translate(W / 2, H / 2); x.scale(1, style === 'nebula' ? 0.7 : 0.18); x.translate(-W / 2, -H / 2);
    x.beginPath(); x.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2); x.fill(); x.restore();
  } else if (style === 'bubble') {
    for (let i = 0; i < 7; i++) {
      const bx = 40 + r() * 140, by = 20 + r() * 70, br = 3 + r() * 8;
      x.strokeStyle = `rgba(${rgb},0.7)`; x.lineWidth = 1.5;
      x.beginPath(); x.arc(bx, by, br, 0, Math.PI * 2); x.stroke();
      x.fillStyle = `rgba(${rgb},0.25)`; x.beginPath(); x.arc(bx - br * 0.3, by - br * 0.3, br * 0.3, 0, Math.PI * 2); x.fill();
    }
  }
  cloudSprites.set(key, c);
  return c;
}

function drawClouds(ctx: CanvasRenderingContext2D, look: WorldLook, w: number, h: number, alt: number, time: number, band: 0 | 1) {
  if (look.cloud === 'none') return;
  const r = rng(99 + band * 17);
  const speeds = band === 0 ? [0.12, 0.2] : [0.45, 0.8];
  const count = band === 0 ? 5 : 4;
  const period = h * 1.8;
  ctx.save();
  for (let i = 0; i < count; i++) {
    const depth = speeds[i % 2];
    const scale = ((band === 0 ? 0.45 : 0.75) + r() * 0.45) * Math.min(1.2, Math.max(0.45, w / 420));
    const sprite = cloudSprite(look.cloud, i % 3 === 2 && look.cloud === 'nebula' ? '#3cc8e8' : look.cloudColor, i % 4);
    if (!sprite) continue;
    const sw = sprite.width * scale, sh = sprite.height * scale;
    const drift = (look.cloud === 'bubble' ? 0 : time * (0.004 + depth * 0.01));
    const x = mod(r() * (w + sw * 2) + drift, w + sw * 2) - sw;
    let y = mod(r() * period - h * 0.15 + alt * depth, period) - h * 0.3;
    if (look.cloud === 'bubble') y = mod(r() * period - time * 0.03 * (1 + depth) + alt * depth, period) - h * 0.3;
    // near the ground, keep low clouds above the horizon so they don't sit on the hills
    if (alt < 60 && band === 1 && y > h * 0.45) continue;
    ctx.globalAlpha = (band === 0 ? 0.6 : 0.85) * (look.cloud === 'mist' ? 0.35 : look.cloud === 'smoke' ? 0.5 : 1);
    ctx.drawImage(sprite, x, y, sw, sh);
  }
  ctx.restore();
}

function drawDrift(ctx: CanvasRenderingContext2D, look: WorldLook, w: number, h: number, alt: number, time: number) {
  if (look.drift === 'none') return;
  const r = rng(555);
  ctx.save();
  ctx.fillStyle = look.driftColor;
  ctx.strokeStyle = look.driftColor;
  const n = look.drift === 'rain' ? 40 : 26;
  for (let i = 0; i < n; i++) {
    const sx = r() * w, sy = r() * h, sp = 0.5 + r();
    let x = sx, y = sy;
    switch (look.drift) {
      case 'petal': case 'leaf': case 'snow': case 'sand':
        y = mod(sy + time * 0.02 * sp + alt * 0.9, h + 20) - 10;
        x = mod(sx + Math.sin(time / 900 + i) * 20 + (look.drift === 'sand' ? time * 0.06 : 0), w);
        break;
      case 'ember': case 'bubble': case 'spore': case 'sparkle':
        y = mod(sy - time * 0.02 * sp + alt * 0.9, h + 20) - 10;
        x = sx + Math.sin(time / 1200 + i) * 14;
        break;
      case 'rain':
        y = mod(sy + time * 0.5 * sp + alt * 0.9, h + 40) - 20;
        x = mod(sx - y * 0.15, w);
        break;
    }
    ctx.globalAlpha = 0.55 + 0.35 * Math.sin(time / 700 + i);
    switch (look.drift) {
      case 'petal': case 'leaf':
        ctx.save(); ctx.translate(x, y); ctx.rotate(time / 800 + i);
        ctx.beginPath(); ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        break;
      case 'rain':
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 10); ctx.stroke();
        break;
      case 'bubble':
        ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2); ctx.stroke();
        break;
      case 'sparkle': case 'ember': case 'spore':
        ctx.beginPath(); ctx.arc(x, y, look.drift === 'sparkle' ? 1.3 : 1.8, 0, Math.PI * 2); ctx.fill();
        break;
      default:
        ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawFlyers(ctx: CanvasRenderingContext2D, look: WorldLook, w: number, h: number, alt: number, time: number) {
  if (look.flyer === 'none') return;
  const r = rng(808);
  const period = h * 1.6;
  ctx.save();
  for (let i = 0; i < 4; i++) {
    const dir = r() < 0.5 ? 1 : -1, sp = 0.02 + r() * 0.03, s = 0.7 + r() * 0.6;
    const x = mod(r() * w + dir * time * sp, w + 80) - 40;
    const y = mod(r() * period * 0.6 + alt * 0.5, period) - h * 0.25 + Math.sin(time / 600 + i) * 6;
    if (alt < 40 && y > h * 0.5) continue;
    ctx.fillStyle = look.flyerColor; ctx.strokeStyle = look.flyerColor;
    switch (look.flyer) {
      case 'birds': {
        const flap = Math.sin(time / 140 + i * 2) * 4 * s;
        ctx.lineWidth = 1.8; ctx.lineCap = 'round';
        for (let b = 0; b < 3; b++) {
          const bx = x + b * 14 * dir * -1, by = y + b * 6;
          ctx.beginPath(); ctx.moveTo(bx - 7 * s, by - flap); ctx.quadraticCurveTo(bx - 3 * s, by - 2, bx, by); ctx.quadraticCurveTo(bx + 3 * s, by - 2, bx + 7 * s, by - flap); ctx.stroke();
        }
        break;
      }
      case 'fish': {
        ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
        ctx.beginPath(); ctx.ellipse(0, 0, 9, 4.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-15, -5 + Math.sin(time / 120 + i) * 2); ctx.lineTo(-15, 5 + Math.sin(time / 120 + i) * 2); ctx.closePath(); ctx.fill();
        ctx.restore();
        break;
      }
      case 'fireflies': {
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time / 300 + i * 3);
        ctx.shadowColor = look.flyerColor; ctx.shadowBlur = 8;
        for (let f = 0; f < 3; f++) { ctx.beginPath(); ctx.arc(x + f * 30 * dir, y + Math.sin(time / 500 + f) * 10, 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        break;
      }
      case 'drones': {
        ctx.fillStyle = '#1a1a2e'; ctx.fillRect(x - 8, y - 2, 16, 4);
        ctx.fillStyle = look.flyerColor; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time / 200 + i);
        ctx.beginPath(); ctx.arc(x, y + 3, 1.8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        break;
      }
      case 'balloons': case 'lanterns': {
        const bob = Math.sin(time / 900 + i) * 4;
        ctx.fillStyle = i % 2 && look.flyer === 'balloons' ? '#7ad3ff' : look.flyerColor;
        if (look.flyer === 'lanterns') { ctx.shadowColor = look.flyerColor; ctx.shadowBlur = 10; }
        ctx.beginPath(); ctx.ellipse(x, y + bob, 7 * s, 9 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(60,40,40,0.6)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y + bob + 9 * s); ctx.lineTo(x, y + bob + 20 * s); ctx.stroke();
        break;
      }
      case 'comets': {
        const g = ctx.createLinearGradient(x, y, x - dir * 50, y - 12);
        g.addColorStop(0, look.flyerColor); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dir * 50, y - 12); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
        break;
      }
      default: break;
    }
  }
  ctx.restore();
}

export interface BackdropMotion {
  altitude: number;   // pixels climbed (0 = on the ground)
  tiltDeg?: number;   // tower lean, scenery leans slightly the other way
  pointerX?: number;  // -1..1 look-around on the menu
}

export function worldIndexFromId(id: string): number {
  const clean = (id || '').toLowerCase();
  const n = Math.abs(parseInt(clean.replace('bg-', '').replace('campaign-', ''), 10) || 0);
  return n % WORLD_LOOKS.length;
}

/** Draws the whole backdrop for world `worldIdx`. */
export function renderLayeredBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  worldIdx: number,
  time: number,
  motion: BackdropMotion = { altitude: 0 },
  variant?: 'autumn' | 'sunset'
) {
  if (!ctx || !(w > 0) || !(h > 0)) return;
  let look = WORLD_LOOKS[worldIdx] || WORLD_LOOKS[0];
  if (variant === 'autumn') look = { ...look, layers: look.layers.map((l, i) => ({ ...l, color: ['#c9a07a', '#d0843f', '#a8552a'][i] || l.color, decoColor: i === 1 ? '#b8452a' : l.decoColor })), drift: 'leaf', driftColor: '#e0823a' };
  if (variant === 'sunset') look = { ...look, sky: ['#5a4a9a', '#e88a8a', '#ffd08a'], celestialPos: [0.5, 0.58, 0.11], celestialColor: '#ffd08a' };

  const alt = Math.max(0, motion.altitude || 0);
  const hi = clamp01(alt / 2600);
  const tilt = Number.isFinite(motion.tiltDeg) ? (motion.tiltDeg as number) : 0;
  const px = Number.isFinite(motion.pointerX) ? (motion.pointerX as number) : 0;

  ctx.save();
  // 1. Sky, darkening towards space as you climb
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, mix(look.sky[0], look.high[0], hi));
  g.addColorStop(0.55, mix(look.sky[1], look.high[1], hi));
  g.addColorStop(1, mix(look.sky[2], look.high[1], hi * 0.85));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  drawStars(ctx, w, h, Math.max(look.stars, clamp01((alt - 1200) / 1600) * 0.9), alt, time);
  drawCelestial(ctx, look, w, h, alt, time);
  drawClouds(ctx, look, w, h, alt, time, 0);

  // 2. Silhouette layers, far to near, each sinking at its own speed
  look.layers.forEach((layer, i) => {
    const entry = getLayer(worldIdx * 10 + (variant ? 3 : 0), i, layer, Math.round(w), Math.round(h));
    if (!entry) return;
    const y = entry.y + alt * layer.speed + Math.sin(time / 4000 + i) * 1.5;
    if (y > h) return;
    const lean = -Math.sin((tilt * Math.PI) / 180) * 60 * layer.speed - px * 14 * (0.3 + layer.speed);
    ctx.drawImage(entry.canvas, -PAD + Math.max(-PAD, Math.min(PAD, lean)), y);
  });

  // 3. Things that pass in front: low clouds, flyers, drifting bits
  drawClouds(ctx, look, w, h, alt, time, 1);
  drawFlyers(ctx, look, w, h, alt, time);
  drawDrift(ctx, look, w, h, alt, time);

  // 4. Gentle edge vignette so the tower stays the brightest thing on screen
  const v = ctx.createRadialGradient(w / 2, h * 0.5, Math.min(w, h) * 0.35, w / 2, h * 0.5, Math.max(w, h) * 0.8);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
