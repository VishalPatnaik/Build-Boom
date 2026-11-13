// Midground scenery between the sky and the ground the tower stands on.
//
// Before this layer most worlds went straight from sky to foreground dirt, which read as a flat stage
// with a big empty sky. Each world now gets two painted bands that sit on the horizon behind the
// tower: a far band washed into the world's haze colour (atmospheric perspective) and a nearer band
// with that world's landmarks, lit from the upper left like the critters and the ground.
//
// Each band is painted once per world and width into an offscreen canvas and only blitted per frame
// (two drawImage calls, plus a few small animated accents). The bands sink more slowly than the
// ground as the tower climbs, so they read as further away.

type Ctx = CanvasRenderingContext2D;

interface Look {
  haze: string;        // horizon haze the far band fades into
  far: string;         // far band base colour (before haze)
  mid: string;         // near band shadow side
  midLit: string;      // near band lit side / rim
  accent?: string;     // emissive accent (lava, windows, chemicals, crystals)
  kind: Kind;
}

type Kind = 'meadow' | 'lunar' | 'mesa' | 'cosmos' | 'reef' | 'coast' | 'volcano' | 'citadel' | 'forest' | 'dunes'
  | 'glacier' | 'harbour' | 'candy' | 'temple' | 'skyline' | 'refinery' | 'islands' | 'foundry' | 'sakura' | 'geode';

const LOOKS: Look[] = [
  { kind: 'meadow', haze: '#CFE8EF', far: '#7FAE9A', mid: '#3D7956', midLit: '#78B85A' },                       // 0 Spring Meadow
  { kind: 'lunar', haze: '#3A4258', far: '#555C74', mid: '#3B4052', midLit: '#A9AEC0' },                       // 1 Lunar
  { kind: 'mesa', haze: '#E7A27A', far: '#C46E4C', mid: '#7E3420', midLit: '#D9784A' },                        // 2 Mars
  { kind: 'cosmos', haze: '#2A2D5E', far: '#4D8CD1', mid: '#211B45', midLit: '#8C7BD8', accent: '#E9D59B' },   // 3 Deep Space
  { kind: 'reef', haze: '#2F7FA6', far: '#2A6C8F', mid: '#1C4E68', midLit: '#4FA7B8', accent: '#F49A8A' },     // 4 Coral Reef
  { kind: 'coast', haze: '#F2C59A', far: '#C97B6A', mid: '#5C4064', midLit: '#E59A6E' },                       // 5 Sunset coast
  { kind: 'volcano', haze: '#6E3A30', far: '#4A3434', mid: '#292B31', midLit: '#77716E', accent: '#FF793C' },  // 6 Volcano
  { kind: 'citadel', haze: '#B9C0CC', far: '#8D95A6', mid: '#565D6E', midLit: '#A8AFBE' },                     // 7 Citadel
  { kind: 'forest', haze: '#3E6E5A', far: '#2E5546', mid: '#1E3A2E', midLit: '#4F8A5E', accent: '#F6D36B' },   // 8 Redwood
  { kind: 'dunes', haze: '#F3D9A0', far: '#E2B66E', mid: '#B9803E', midLit: '#F2C982' },                       // 9 Desert
  { kind: 'glacier', haze: '#CDE7F4', far: '#9CC9E2', mid: '#5E9CC4', midLit: '#E9F6FD' },                     // 10 Arctic
  { kind: 'harbour', haze: '#9FD0D6', far: '#347E9D', mid: '#4B3626', midLit: '#886347', accent: '#C9A15D' },  // 11 Pirate Cove
  { kind: 'candy', haze: '#F6C9E2', far: '#E79ACB', mid: '#C2649E', midLit: '#FFD2E8' },                       // 12 Candyland
  { kind: 'temple', haze: '#E9C27A', far: '#B98E48', mid: '#6E5222', midLit: '#E3B45A' },                      // 13 El Dorado
  { kind: 'skyline', haze: '#1B2E52', far: '#24345A', mid: '#121B33', midLit: '#3B4E7A', accent: '#5EE7F2' },  // 14 Neon City
  { kind: 'refinery', haze: '#4E6B4A', far: '#3C5246', mid: '#243E35', midLit: '#648D79', accent: '#A8D94D' }, // 15 Toxic
  { kind: 'islands', haze: '#BFE6F7', far: '#8CC6DE', mid: '#4E8F68', midLit: '#9CD27A' },                     // 16 Sky Islands
  { kind: 'foundry', haze: '#8E6A3E', far: '#6E5236', mid: '#3E2E20', midLit: '#B98A4A', accent: '#F2B04A' },  // 17 Steampunk
  { kind: 'sakura', haze: '#F5D3E0', far: '#C99AB4', mid: '#6E4A62', midLit: '#F2AFC8' },                      // 18 Sakura
  { kind: 'geode', haze: '#3E3160', far: '#5B4790', mid: '#43375E', midLit: '#8064B2', accent: '#70C5D0' },    // 19 Crystal Geode
];

// ---------- helpers ----------
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
  const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
  const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}
function alpha(hex: string, a: number) {
  const p = parseInt(hex.slice(1), 16);
  return `rgba(${(p >> 16) & 255},${(p >> 8) & 255},${p & 255},${a})`;
}

/** Ridge line: sum of a few sines plus jitter, sampled every `step` px. Returns y offsets (0 = top of band). */
function ridge(W: number, base: number, amp: number, seed: number, rough = 0.25, step = 6): number[] {
  const r = rng(seed); const ph = [r() * 6, r() * 6, r() * 6];
  const f = [1.3 + r(), 3.1 + r() * 2, 7 + r() * 4];
  const out: number[] = [];
  for (let x = 0; x <= W + step; x += step) {
    const u = x / W;
    const v = Math.sin(u * f[0] * Math.PI + ph[0]) * 0.55 + Math.sin(u * f[1] * Math.PI + ph[1]) * 0.3 + Math.sin(u * f[2] * Math.PI + ph[2]) * 0.15;
    out.push(base - (v * 0.5 + 0.5) * amp + (r() - 0.5) * amp * rough * 0.2);
  }
  return out;
}
function fillRidge(c: Ctx, ys: number[], step: number, H: number, fill: string | CanvasGradient) {
  c.beginPath(); c.moveTo(0, H);
  ys.forEach((y, i) => c.lineTo(i * step, y));
  c.lineTo((ys.length - 1) * step, H); c.closePath();
  c.fillStyle = fill; c.fill();
}
/** Lit rim along a ridge: light from the upper left catches slopes that face left. */
function rimRidge(c: Ctx, ys: number[], step: number, color: string, width = 1.6) {
  c.save(); c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round';
  for (let i = 1; i < ys.length; i++) {
    const rising = ys[i] < ys[i - 1]; // going up to the right = slope faces upper-left
    if (!rising) continue;
    c.beginPath(); c.moveTo((i - 1) * step, ys[i - 1]); c.lineTo(i * step, ys[i]); c.stroke();
  }
  c.restore();
}
/** Vertical gradient for a band: lit top, darker toward the ground, faded into haze by `hazeAmt`. */
function bandGrad(c: Ctx, top: number, H: number, lit: string, dark: string, haze: string, hazeAmt: number) {
  const g = c.createLinearGradient(0, top, 0, H);
  g.addColorStop(0, mix(lit, haze, hazeAmt));
  g.addColorStop(0.55, mix(dark, haze, hazeAmt * 0.85));
  g.addColorStop(1, mix(dark, haze, hazeAmt * 0.6));
  return g;
}
/** Clustered canopy: many small overlapping lobes, shaded top-left → bottom-right (no round lollipop trees). */
function canopy(c: Ctx, x: number, y: number, s: number, dark: string, lit: string, r: () => number, lobes = 9) {
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < lobes; i++) {
      const a = r() * Math.PI * 2, d = r() * s * 0.55;
      const lx = x + Math.cos(a) * d * 1.25, ly = y + Math.sin(a) * d * 0.7;
      const lr = s * (0.28 + r() * 0.22);
      if (pass === 0) { c.fillStyle = dark; c.beginPath(); c.ellipse(lx, ly, lr, lr * 0.85, 0, 0, Math.PI * 2); c.fill(); }
      else if (lx < x + s * 0.2 && ly < y + s * 0.1) { c.fillStyle = lit; c.beginPath(); c.ellipse(lx - lr * 0.25, ly - lr * 0.3, lr * 0.55, lr * 0.4, -0.4, 0, Math.PI * 2); c.fill(); }
    }
  }
}
function poly(c: Ctx, pts: number[], fill: string | CanvasGradient) {
  c.beginPath(); c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath(); c.fillStyle = fill; c.fill();
}

// ---------- painters: far band (washed into haze) ----------
function paintFar(c: Ctx, W: number, H: number, L: Look, seed: number) {
  const r = rng(seed * 7 + 3);
  const step = 6;
  const tall = { meadow: 0.55, lunar: 0.35, mesa: 0.5, cosmos: 0.3, reef: 0.6, coast: 0.25, volcano: 0.75, citadel: 0.7, forest: 0.8,
    dunes: 0.35, glacier: 0.7, harbour: 0.22, candy: 0.5, temple: 0.55, skyline: 0.85, refinery: 0.6, islands: 0.3, foundry: 0.65, sakura: 0.7, geode: 0.8 }[L.kind];
  const top = H * (1 - tall);
  if (L.kind === 'mesa') {
    // flat-topped buttes with strata
    let x = -20;
    while (x < W) {
      const bw = 40 + r() * 80, bh = H * (0.12 + r() * 0.2), bx = x + r() * 30;
      const g = bandGrad(c, H - bh, H, L.midLit, L.far, L.haze, 0.55);
      poly(c, [bx, H, bx + bw * 0.12, H - bh, bx + bw * 0.88, H - bh, bx + bw, H], g);
      c.fillStyle = alpha(L.haze, 0.25);
      for (let k = 1; k < 4; k++) c.fillRect(bx + bw * 0.1, H - bh + (bh * k) / 5, bw * 0.8, 1.2);
      x += bw + 10 + r() * 50;
    }
    return;
  }
  if (L.kind === 'skyline' || L.kind === 'refinery' || L.kind === 'foundry') {
    let x = -10;
    while (x < W) {
      const bw = 14 + r() * 34, bh = H * (0.25 + r() * 0.6);
      c.fillStyle = mix(L.far, L.haze, 0.45);
      c.fillRect(x, H - bh, bw, bh);
      if (L.kind === 'skyline' && L.accent) {
        c.fillStyle = alpha(L.accent, 0.35);
        for (let wy = H - bh + 6; wy < H - 4; wy += 7) for (let wx = x + 3; wx < x + bw - 3; wx += 5) if (r() > 0.6) c.fillRect(wx, wy, 2, 3);
      }
      if (L.kind !== 'skyline' && r() > 0.55) { c.fillRect(x + bw * 0.35, H - bh - H * 0.25, bw * 0.18, H * 0.25); }
      x += bw + r() * 6;
    }
    return;
  }
  const ys = ridge(W, top + H * tall * 0.55, H * tall * 0.55, seed, 0.3, step);
  fillRidge(c, ys, step, H, bandGrad(c, top, H, L.far, L.far, L.haze, 0.55));
  if (L.kind === 'volcano') {
    // distant cone with a glowing crater and smoke column
    const cx = W * 0.72, ch = H * 0.95;
    poly(c, [cx - W * 0.32, H, cx - 18, H - ch, cx + 16, H - ch, cx + W * 0.3, H], bandGrad(c, H - ch, H, L.midLit, L.far, L.haze, 0.45));
    const gl = c.createRadialGradient(cx, H - ch, 2, cx, H - ch, 40);
    gl.addColorStop(0, alpha(L.accent!, 0.85)); gl.addColorStop(1, alpha(L.accent!, 0));
    c.fillStyle = gl; c.beginPath(); c.arc(cx, H - ch, 40, 0, Math.PI * 2); c.fill();
    c.strokeStyle = alpha(L.accent!, 0.55); c.lineWidth = 1.4;
    for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(cx - 6 + k * 6, H - ch + 4); c.quadraticCurveTo(cx - 20 + k * 22, H - ch * 0.5, cx - 34 + k * 30, H); c.stroke(); }
  }
  if (L.kind === 'glacier' || L.kind === 'citadel' || L.kind === 'sakura') {
    // snow caps on the far peaks
    c.save(); c.beginPath(); c.moveTo(0, H); ys.forEach((y, i) => c.lineTo(i * step, y)); c.lineTo(W, H); c.closePath(); c.clip();
    c.fillStyle = alpha('#ffffff', L.kind === 'sakura' ? 0.5 : 0.65);
    const minY = Math.min(...ys);
    c.fillRect(0, minY - 2, W, (H - minY) * 0.22);
    c.restore();
  }
  rimRidge(c, ys, step, alpha('#ffffff', 0.18), 1.2);
}

// ---------- painters: near band (landmarks) ----------
function paintMid(c: Ctx, W: number, H: number, L: Look, seed: number) {
  const r = rng(seed * 13 + 5);
  const step = 5;
  const lit = L.midLit, dark = L.mid;
  const lowRidge = (tall: number, rough = 0.2) => {
    const ys = ridge(W, H - H * 0.05, H * tall, seed + 11, rough, step);
    fillRidge(c, ys, step, H, bandGrad(c, H - H * tall, H, lit, dark, L.haze, 0.18));
    rimRidge(c, ys, step, alpha('#ffffff', 0.22));
    return ys;
  };
  switch (L.kind) {
    case 'meadow': {
      const ys = lowRidge(0.42);
      // hedgerows and copses along the ridge, a few tall poplars for rhythm
      for (let x = 10; x < W; x += 34 + r() * 60) {
        const i = Math.min(ys.length - 1, Math.round(x / step)); const y = ys[i];
        if (r() > 0.35) canopy(c, x, y - 8, 14 + r() * 12, mix(dark, '#1f4d39', 0.4), mix(lit, '#F5D77A', 0.25), r, 8);
        else { c.fillStyle = mix(dark, '#1f4d39', 0.35); c.beginPath(); c.ellipse(x, y - 18, 5, 20, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = alpha('#F5D77A', 0.35); c.beginPath(); c.ellipse(x - 2, y - 24, 2, 10, 0, 0, Math.PI * 2); c.fill(); }
      }
      // a windmill on the far left rise
      const mx = W * 0.16, my = ys[Math.round(mx / step)] - 2;
      poly(c, [mx - 7, my, mx - 4, my - 30, mx + 4, my - 30, mx + 7, my], '#F6EED5');
      c.fillStyle = alpha('#8a6a4a', 0.9); c.fillRect(mx - 4, my - 33, 8, 4);
      return;
    }
    case 'lunar': {
      const ys = lowRidge(0.3, 0.4);
      for (let k = 0; k < 5; k++) { const x = r() * W, y = ys[Math.round(x / step)] + 6; c.strokeStyle = alpha('#ffffff', 0.18); c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y, 16 + r() * 18, 4, 0, Math.PI, Math.PI * 2); c.stroke(); }
      // lander silhouette
      const lx = W * 0.8, ly = ys[Math.round(lx / step)];
      c.fillStyle = mix(dark, '#000000', 0.2); c.fillRect(lx - 9, ly - 16, 18, 10);
      c.strokeStyle = c.fillStyle; c.lineWidth = 1.5; c.beginPath(); c.moveTo(lx - 9, ly - 6); c.lineTo(lx - 15, ly); c.moveTo(lx + 9, ly - 6); c.lineTo(lx + 15, ly); c.stroke();
      c.fillStyle = alpha('#E9D59B', 0.9); c.fillRect(lx - 2, ly - 22, 1.5, 6);
      return;
    }
    case 'mesa': {
      lowRidge(0.18, 0.4);
      for (let k = 0; k < 3; k++) {
        const bx = r() * W, bw = 30 + r() * 50, bh = H * (0.3 + r() * 0.25);
        poly(c, [bx, H, bx + bw * 0.18, H - bh, bx + bw * 0.5, H - bh, bx + bw * 0.5, H], lit);
        poly(c, [bx + bw * 0.5, H, bx + bw * 0.5, H - bh, bx + bw * 0.82, H - bh, bx + bw, H], dark);
        c.fillStyle = alpha('#3a1208', 0.25); for (let s = 1; s < 5; s++) c.fillRect(bx + bw * 0.1, H - bh + (bh * s) / 6, bw * 0.85, 1.4);
      }
      return;
    }
    case 'cosmos': {
      // curved limb of a nearby planet: grounded, with an atmosphere glow
      const R = W * 1.6, cx = W * 0.5, cy = H + R - H * 0.32;
      const g = c.createRadialGradient(cx - R * 0.2, cy - R * 0.3, R * 0.6, cx, cy, R);
      g.addColorStop(0, '#614B99'); g.addColorStop(0.9, '#2A2357'); g.addColorStop(1, '#4D8CD1');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
      c.strokeStyle = alpha('#9FD3FF', 0.55); c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R + 1, Math.PI * 1.3, Math.PI * 1.7); c.stroke();
      c.strokeStyle = alpha('#C5D5E8', 0.12); c.lineWidth = 6;
      for (let k = 1; k < 4; k++) { c.beginPath(); c.arc(cx, cy, R - k * 22, Math.PI * 1.32, Math.PI * 1.68); c.stroke(); }
      // drifting rock fragments
      for (let k = 0; k < 6; k++) { const x = r() * W, y = H * (0.1 + r() * 0.5), s = 3 + r() * 7; poly(c, [x - s, y, x - s * 0.3, y - s * 0.8, x + s, y - s * 0.4, x + s * 0.6, y + s * 0.6], mix(dark, '#8C7BD8', 0.25)); c.fillStyle = alpha('#E9D59B', 0.5); c.fillRect(x - s * 0.5, y - s * 0.6, s * 0.6, 1); }
      return;
    }
    case 'reef': {
      const ys = lowRidge(0.35, 0.5);
      for (let x = 8; x < W; x += 22 + r() * 30) {
        const y = ys[Math.min(ys.length - 1, Math.round(x / step))] + 2, hgt = 16 + r() * 30;
        c.strokeStyle = r() > 0.5 ? mix(L.accent!, L.haze, 0.35) : mix('#43B98C', L.haze, 0.35); c.lineWidth = 2.2; c.lineCap = 'round';
        // branching coral fan
        const br = (x0: number, y0: number, a: number, len: number, d: number) => { if (d > 3 || len < 3) return; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); br(x1, y1, a - 0.45, len * 0.7, d + 1); br(x1, y1, a + 0.4, len * 0.68, d + 1); };
        br(x, y, -Math.PI / 2, hgt * 0.4, 0);
      }
      return;
    }
    case 'coast': {
      // calm sea band with a sun path, two islands with palms
      const seaTop = H * 0.62;
      const sg = c.createLinearGradient(0, seaTop, 0, H); sg.addColorStop(0, mix('#F2C59A', '#5C6FA0', 0.4)); sg.addColorStop(1, '#3E4E80');
      c.fillStyle = sg; c.fillRect(0, seaTop, W, H - seaTop);
      c.fillStyle = alpha('#FFE3B0', 0.55); for (let k = 0; k < 18; k++) { const y = seaTop + 3 + k * ((H - seaTop) / 18); const ww = 30 - k; c.fillRect(W * 0.62 - ww / 2 + (r() - 0.5) * 8, y, ww, 1); }
      for (const [ix, iw] of [[W * 0.18, 70], [W * 0.86, 46]]) {
        poly(c, [ix - iw / 2, seaTop + 1, ix - iw * 0.2, seaTop - 10, ix + iw * 0.25, seaTop - 7, ix + iw / 2, seaTop + 1], dark);
        c.strokeStyle = dark; c.lineWidth = 1.6; c.beginPath(); c.moveTo(ix, seaTop - 8); c.quadraticCurveTo(ix + 3, seaTop - 24, ix + 7, seaTop - 34); c.stroke();
        for (let f = 0; f < 5; f++) { const a = -Math.PI * (0.15 + f * 0.18); c.beginPath(); c.moveTo(ix + 7, seaTop - 34); c.quadraticCurveTo(ix + 7 + Math.cos(a) * 10, seaTop - 38 + Math.sin(a) * 4, ix + 7 + Math.cos(a) * 15, seaTop - 30 + Math.sin(a) * 2); c.stroke(); }
      }
      return;
    }
    case 'volcano': {
      const ys = lowRidge(0.3, 0.6);
      // basalt columns: hexagonal-topped prisms in clusters
      for (let k = 0; k < 4; k++) {
        const bx = r() * W; const n = 3 + Math.floor(r() * 4);
        for (let j = 0; j < n; j++) {
          const x = bx + j * 7, base = ys[Math.min(ys.length - 1, Math.max(0, Math.round(x / step)))] + 6, hh = 14 + r() * 26;
          c.fillStyle = j % 2 ? '#292B31' : '#34363E'; c.fillRect(x, base - hh, 6.5, hh);
          c.fillStyle = '#5A5658'; c.fillRect(x, base - hh, 6.5, 2);
        }
      }
      // glowing lava channel winding down the ridge
      c.strokeStyle = alpha(L.accent!, 0.85); c.lineWidth = 2.2; c.beginPath();
      let x = W * 0.3; c.moveTo(x, ys[Math.round(x / step)] + 2);
      for (let y = 0; y < H * 0.3; y += 6) { x += (r() - 0.5) * 10; c.lineTo(x, ys[Math.round(Math.min(W, Math.max(0, x)) / step)] + 4 + y); }
      c.stroke();
      return;
    }
    case 'citadel': {
      const ys = lowRidge(0.22);
      // distant curtain wall with towers
      const wy = H * 0.72; c.fillStyle = mix(dark, L.haze, 0.25); c.fillRect(0, wy, W, H - wy);
      for (let x = 0; x < W; x += 9) c.fillRect(x, wy - 4, 5, 4);
      for (const tx of [W * 0.12, W * 0.55, W * 0.9]) { c.fillRect(tx - 9, wy - 30, 18, 30); for (let x = tx - 9; x < tx + 9; x += 6) c.fillRect(x, wy - 34, 4, 4); c.fillStyle = alpha('#F5C46B', 0.8); c.fillRect(tx - 1.5, wy - 22, 3, 5); c.fillStyle = mix(dark, L.haze, 0.25); }
      void ys; return;
    }
    case 'forest': {
      // misty trunks receding
      for (let layer = 0; layer < 2; layer++) {
        const col = mix(dark, L.haze, layer === 0 ? 0.55 : 0.2);
        for (let x = r() * 20; x < W; x += 16 + r() * 26) { const tw = 4 + r() * 6 + layer * 3; c.fillStyle = col; c.fillRect(x, 0, tw, H); c.fillStyle = alpha('#ffffff', 0.05 + layer * 0.04); c.fillRect(x, 0, tw * 0.3, H); }
      }
      lowRidge(0.18, 0.5);
      return;
    }
    case 'dunes': {
      for (let k = 0; k < 2; k++) {
        const ys = ridge(W, H - H * 0.05, H * (0.35 - k * 0.12), seed + k * 9, 0.05, step);
        fillRidge(c, ys, step, H, bandGrad(c, H * 0.5, H, lit, dark, L.haze, 0.35 - k * 0.2));
        // sharp dune crest: light side / shadow side split
        c.strokeStyle = alpha('#FFF4D6', 0.45); c.lineWidth = 1.2; c.beginPath(); ys.forEach((y, i) => (i ? c.lineTo(i * step, y) : c.moveTo(0, y))); c.stroke();
      }
      // obelisk landmark
      const ox = W * 0.78; poly(c, [ox - 5, H * 0.75, ox - 3, H * 0.28, ox, H * 0.24, ox + 3, H * 0.28, ox + 5, H * 0.75], mix(dark, L.haze, 0.2));
      c.fillStyle = alpha('#FFF4D6', 0.5); c.fillRect(ox - 3, H * 0.29, 1.5, H * 0.45);
      return;
    }
    case 'glacier': {
      const ys = lowRidge(0.38, 0.1);
      // ice cliff faces with vertical fractures
      c.strokeStyle = alpha('#ffffff', 0.35); c.lineWidth = 1;
      for (let x = 4; x < W; x += 6 + r() * 10) { const y = ys[Math.min(ys.length - 1, Math.round(x / step))]; c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x + (r() - 0.5) * 3, y + 10 + r() * 30); c.stroke(); }
      c.fillStyle = alpha('#7FB8DA', 0.35); for (let x = 0; x < W; x += 3) { const y = ys[Math.min(ys.length - 1, Math.round(x / step))]; if (r() > 0.85) c.fillRect(x, y + 20 + r() * 20, 2, 10 + r() * 14); }
      return;
    }
    case 'harbour': {
      const seaTop = H * 0.55;
      const sg = c.createLinearGradient(0, seaTop, 0, H); sg.addColorStop(0, '#4DAFA9'); sg.addColorStop(1, '#347E9D');
      c.fillStyle = sg; c.fillRect(0, seaTop, W, H - seaTop);
      c.fillStyle = alpha('#ffffff', 0.18); for (let k = 0; k < 40; k++) c.fillRect(r() * W, seaTop + 3 + r() * (H - seaTop - 6), 6 + r() * 12, 1);
      // distant ships under sail
      for (const [sx, s] of [[W * 0.22, 1], [W * 0.66, 0.7]]) {
        poly(c, [sx - 22 * s, seaTop - 2, sx + 22 * s, seaTop - 2, sx + 16 * s, seaTop + 5 * s, sx - 16 * s, seaTop + 5 * s], '#4B3626');
        c.fillStyle = '#4B3626'; c.fillRect(sx - 1, seaTop - 34 * s, 1.6, 32 * s); c.fillRect(sx + 10 * s, seaTop - 26 * s, 1.4, 24 * s);
        c.fillStyle = mix('#F6EED5', L.haze, 0.2);
        poly(c, [sx + 1, seaTop - 32 * s, sx + 14 * s, seaTop - 18 * s, sx + 1, seaTop - 8 * s], c.fillStyle as string);
        poly(c, [sx - 1, seaTop - 30 * s, sx - 13 * s, seaTop - 12 * s, sx - 1, seaTop - 8 * s], c.fillStyle as string);
      }
      // weathered dock pilings in the foreground of the band
      for (let x = W * 0.05; x < W * 0.4; x += 12) { c.fillStyle = '#5E4430'; c.fillRect(x, H - 26 - r() * 6, 5, 40); c.fillStyle = alpha('#C9A15D', 0.6); c.fillRect(x, H - 28, 5, 1.5); }
      c.fillStyle = '#6E5038'; c.fillRect(W * 0.03, H - 24, W * 0.4, 4);
      return;
    }
    case 'candy': {
      const ys = lowRidge(0.35, 0.1);
      for (let x = 14; x < W; x += 40 + r() * 50) {
        const y = ys[Math.min(ys.length - 1, Math.round(x / step))] + 4;
        if (r() > 0.5) { c.fillStyle = '#ffffff'; c.fillRect(x - 1, y - 30, 2, 30); const g = c.createRadialGradient(x - 3, y - 36, 1, x, y - 33, 9); g.addColorStop(0, '#FFE8F3'); g.addColorStop(1, '#E06AA8'); c.fillStyle = g; c.beginPath(); c.arc(x, y - 33, 8, 0, Math.PI * 2); c.fill(); }
        else { const g = c.createLinearGradient(x - 9, y - 16, x + 9, y); g.addColorStop(0, '#9BE3C9'); g.addColorStop(1, '#3FA987'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y - 6, 10, 10, 0, Math.PI, Math.PI * 2); c.fill(); }
      }
      return;
    }
    case 'temple': {
      lowRidge(0.25, 0.5);
      // stepped pyramid with stair and shrine
      const px = W * 0.7, pb = H - 2, steps = 6, sw = 110, sh = 9;
      for (let s = 0; s < steps; s++) {
        const ww = sw - s * 16, y = pb - (s + 1) * sh;
        c.fillStyle = mix(lit, L.haze, 0.25); c.fillRect(px - ww / 2, y, ww / 2, sh);
        c.fillStyle = mix(dark, L.haze, 0.25); c.fillRect(px, y, ww / 2, sh);
      }
      c.fillStyle = mix(dark, L.haze, 0.35); c.fillRect(px - 6, pb - steps * sh, 12, steps * sh);
      c.fillStyle = '#E3B45A'; c.fillRect(px - 10, pb - steps * sh - 12, 20, 12);
      for (let x = 6; x < W * 0.45; x += 18 + r() * 20) canopy(c, x, H - 14 - r() * 8, 12 + r() * 8, '#2F5A2A', '#7FB24F', r, 7);
      return;
    }
    case 'skyline': {
      let x = -6;
      while (x < W) {
        const bw = 18 + r() * 30, bh = H * (0.3 + r() * 0.55);
        c.fillStyle = dark; c.fillRect(x, H - bh, bw, bh);
        c.fillStyle = alpha(L.accent!, 0.55); c.fillRect(x, H - bh, bw, 1.2);
        for (let wy = H - bh + 6; wy < H - 4; wy += 6) for (let wx = x + 3; wx < x + bw - 3; wx += 5) if (r() > 0.72) { c.fillStyle = r() > 0.5 ? alpha('#5EE7F2', 0.65) : alpha('#F2A6E8', 0.55); c.fillRect(wx, wy, 2, 2.5); }
        if (r() > 0.7) { c.fillStyle = alpha('#F47759', 0.9); c.fillRect(x + bw / 2 - 0.5, H - bh - 10, 1.5, 10); }
        x += bw + 2 + r() * 6;
      }
      return;
    }
    case 'refinery': {
      lowRidge(0.15, 0.4);
      // tanks, pipe racks, stacks
      for (let k = 0; k < 3; k++) { const tx = W * (0.12 + k * 0.32) + r() * 20, tr = 16 + r() * 10; c.fillStyle = mix('#648D79', '#243E35', 0.35); c.fillRect(tx - tr, H - tr * 1.4, tr * 2, tr * 1.4); c.beginPath(); c.ellipse(tx, H - tr * 1.4, tr, 4, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = alpha('#D8A34E', 0.7); c.fillRect(tx - tr, H - tr * 0.9, tr * 2, 2); c.fillStyle = alpha('#ffffff', 0.12); c.fillRect(tx - tr + 3, H - tr * 1.35, 4, tr * 1.3); }
      c.fillStyle = '#343B39'; for (const sx of [W * 0.3, W * 0.83]) { c.fillRect(sx, H * 0.15, 8, H * 0.85); c.fillStyle = alpha('#A8D94D', 0.8); c.fillRect(sx, H * 0.15 + 6, 8, 2); c.fillStyle = '#343B39'; }
      c.strokeStyle = '#4A5A52'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, H * 0.7); c.lineTo(W, H * 0.66); c.stroke();
      return;
    }
    case 'islands': {
      // floating islands below the horizon line with waterfalls
      for (const [ix, iy, iw] of [[W * 0.15, H * 0.45, 70], [W * 0.82, H * 0.62, 54], [W * 0.5, H * 0.25, 34]]) {
        poly(c, [ix - iw / 2, iy, ix + iw / 2, iy, ix + iw * 0.2, iy + iw * 0.55, ix - iw * 0.1, iy + iw * 0.7], mix('#7A6048', L.haze, 0.3));
        c.fillStyle = mix(lit, L.haze, 0.2); c.beginPath(); c.ellipse(ix, iy, iw / 2 + 2, 5, 0, 0, Math.PI * 2); c.fill();
        canopy(c, ix - iw * 0.15, iy - 7, iw * 0.18, mix(dark, L.haze, 0.2), mix('#F5D77A', lit, 0.4), r, 6);
        c.fillStyle = alpha('#ffffff', 0.55); c.fillRect(ix + iw * 0.12, iy + 3, 2, iw * 0.9);
      }
      return;
    }
    case 'foundry': {
      lowRidge(0.12, 0.3);
      for (let k = 0; k < 4; k++) { const sx = W * (0.08 + k * 0.26) + r() * 14, sh = H * (0.4 + r() * 0.45); c.fillStyle = '#3E2E20'; c.fillRect(sx, H - sh, 9, sh); c.fillStyle = '#B98A4A'; c.fillRect(sx - 1, H - sh, 11, 3); c.fillRect(sx - 1, H - sh * 0.5, 11, 2); }
      // big gear silhouette half-buried
      const gx = W * 0.58, gy = H * 0.95, gr = H * 0.35; c.fillStyle = mix('#3E2E20', L.haze, 0.25);
      c.beginPath(); for (let t = 0; t < 24; t++) { const a = (t / 24) * Math.PI * 2, rr = t % 2 ? gr : gr * 1.12; c.lineTo(gx + Math.cos(a) * rr, gy + Math.sin(a) * rr); } c.closePath(); c.fill();
      c.fillStyle = mix('#B98A4A', L.haze, 0.3); c.beginPath(); c.arc(gx, gy, gr * 0.3, 0, Math.PI * 2); c.fill();
      return;
    }
    case 'sakura': {
      const ys = lowRidge(0.3, 0.2);
      // pagoda on the ridge
      const px = W * 0.22, py = ys[Math.round(px / step)];
      for (let t = 0; t < 4; t++) { const ww = 34 - t * 7, y = py - 8 - t * 10; c.fillStyle = '#6E4A62'; c.fillRect(px - ww / 2 + 4, y, ww - 8, 8); poly(c, [px - ww / 2 - 4, y + 1, px + ww / 2 + 4, y + 1, px + ww / 2 - 2, y - 3, px - ww / 2 + 2, y - 3], '#4A2E40'); }
      c.fillStyle = '#4A2E40'; c.fillRect(px - 0.75, py - 56, 1.5, 12);
      for (let x = W * 0.4; x < W; x += 30 + r() * 30) { const y = ys[Math.min(ys.length - 1, Math.round(x / step))]; c.fillStyle = '#5A3A48'; c.fillRect(x - 1, y - 14, 2, 14); canopy(c, x, y - 18, 12 + r() * 6, '#E98FB4', '#FFD9E8', r, 8); }
      return;
    }
    case 'geode': {
      lowRidge(0.12, 0.6);
      // crystal spires: faceted two-tone prisms with a lit edge and a soft inner glow
      for (let k = 0; k < 8; k++) {
        const x = (k + 0.5) * (W / 8) + (r() - 0.5) * 30, hh = H * (0.3 + r() * 0.55), ww = 16 + r() * 22, lean = (r() - 0.5) * 16;
        const gl = c.createRadialGradient(x, H - hh * 0.4, 2, x, H - hh * 0.4, ww * 1.6);
        gl.addColorStop(0, alpha(L.accent!, 0.28)); gl.addColorStop(1, alpha(L.accent!, 0));
        c.fillStyle = gl; c.fillRect(x - ww * 1.6, H - hh, ww * 3.2, hh);
        poly(c, [x - ww / 2, H, x - ww * 0.3 + lean, H - hh * 0.82, x + lean, H - hh, x, H], mix('#A88BE0', L.haze, 0.1));
        poly(c, [x, H, x + lean, H - hh, x + ww * 0.3 + lean, H - hh * 0.82, x + ww / 2, H], mix('#43375E', L.haze, 0.1));
        c.strokeStyle = alpha('#C5CAD8', 0.75); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, H); c.lineTo(x + lean, H - hh); c.stroke();
        c.fillStyle = alpha(L.accent!, 0.55); c.fillRect(x - ww * 0.18 + lean * 0.5, H - hh * 0.55, 2, hh * 0.35);
      }
      return;
    }
  }
}

// ---------- cache + draw ----------
interface Cached { far: HTMLCanvasElement; mid: HTMLCanvasElement; W: number; FH: number; MH: number }
const cache = new Map<string, Cached>();

function build(world: number, w: number, h: number): Cached | null {
  if (typeof document === 'undefined') return null;
  const L = LOOKS[world] || LOOKS[0];
  const W = Math.ceil(w * 1.4);          // parallax margin both sides
  const FH = Math.ceil(h * 0.34), MH = Math.ceil(h * 0.24);
  const far = document.createElement('canvas'); far.width = W; far.height = FH;
  const mid = document.createElement('canvas'); mid.width = W; mid.height = MH;
  const fc = far.getContext('2d'), mc = mid.getContext('2d');
  if (!fc || !mc) return null;
  paintFar(fc, W, FH, L, world + 1);
  // haze veil over the bottom of the far band so it melts into the mid band
  const hv = fc.createLinearGradient(0, FH * 0.4, 0, FH);
  hv.addColorStop(0, alpha(L.haze, 0)); hv.addColorStop(1, alpha(L.haze, 0.55));
  fc.fillStyle = hv; fc.fillRect(0, 0, W, FH);
  paintMid(mc, W, MH, L, world + 1);
  // contact shade at the bottom of the near band, where it meets the ground
  const sv = mc.createLinearGradient(0, MH * 0.7, 0, MH);
  sv.addColorStop(0, 'rgba(0,0,0,0)'); sv.addColorStop(1, 'rgba(10,14,24,0.22)');
  mc.fillStyle = sv; mc.fillRect(0, 0, W, MH);
  return { far, mid, W, FH, MH };
}

/**
 * Draws the far + near scenery bands on the horizon behind the tower.
 * `groundY` is the y of the ground surface the plate stands on (same anchor as the foreground terrain).
 * `restGroundY` is where that ground sits before the tower grows, so the bands can sink more slowly.
 */
export function drawMidground(ctx: Ctx, w: number, h: number, world: number, groundY: number, restGroundY: number, camX: number, time: number) {
  const key = `${world}|${Math.round(w)}|${Math.round(h)}`;
  let c = cache.get(key);
  if (!c) {
    const built = build(world, w, h);
    if (!built) return;
    c = built;
    if (cache.size > 6) cache.delete(cache.keys().next().value as string);
    cache.set(key, c);
  }
  const sink = Math.max(0, groundY - restGroundY);
  const ox = (c.W - w) / 2;
  // far band: slow sink and slight parallax
  // far band reaches down behind the near band so there is never a gap of bare sky between them
  const midBottom = restGroundY + 8 + sink * 0.6;
  const farBottom = restGroundY + 8 + sink * 0.35;
  if (farBottom - c.FH < h) ctx.drawImage(c.far, ox + camX * 0.06, 0, w, c.FH, 0, farBottom - c.FH, w, c.FH);
  // near band
  if (midBottom - c.MH < h) ctx.drawImage(c.mid, ox + camX * 0.14, 0, w, c.MH, 0, midBottom - c.MH, w, c.MH);
  // live accents
  const L = LOOKS[world];
  if (L && L.accent && (L.kind === 'volcano' || L.kind === 'refinery')) {
    const t = time * 0.001;
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const px = ((i * 97 + t * 14) % (w + 40)) - 20;
      const py = midBottom - c.MH * (0.3 + ((t * 0.12 + i * 0.21) % 1) * 1.1);
      ctx.globalAlpha = 0.18 + 0.12 * Math.sin(t * 2 + i);
      ctx.fillStyle = L.kind === 'volcano' ? '#77716E' : '#A8D94D';
      ctx.beginPath(); ctx.ellipse(px, py, 18 + i * 3, 7 + i, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
