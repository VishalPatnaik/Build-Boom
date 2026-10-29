// ---------------------------------------------------------------------------
// Themed objects: every world has its own stackable character, its own hazard
// to avoid, and its own base plate. Characters react to the tower: they cheer
// on perfect landings, sweat when the tower wobbles and panic when they fall.
// Everything is drawn procedurally inside the physics footprint (w x h).
// ---------------------------------------------------------------------------

export type ObjectMood = 'idle' | 'happy' | 'worried' | 'falling' | 'flying';

// Global tower mood, set by the game loop (cheap: avoids threading through every call)
let towerStress = 0; // 0..100
let cheerUntil = 0;
export function setTowerMood(stress: number, cheer?: boolean) {
  towerStress = stress;
  if (cheer) cheerUntil = performance.now() + 700;
}
export function resolveMood(isTower: boolean, override?: ObjectMood): ObjectMood {
  if (override) return override;
  if (!isTower) return 'flying';
  if (performance.now() < cheerUntil) return 'happy';
  if (towerStress > 60) return 'worried';
  return 'idle';
}

type Ctx = CanvasRenderingContext2D;

// ---------- shared drawing helpers ----------

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

function vgrad(ctx: Ctx, y0: number, y1: number, top: string, bottom: string) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  return g;
}

function circle(ctx: Ctx, x: number, y: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, fill: string, rot = 0) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2);
  ctx.fill();
}

function outline(ctx: Ctx, color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.8, width * 1.3);
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/** Soft glossy highlight in the upper-left of a shape (cel-shaded look). */
function gloss(ctx: Ctx, x: number, y: number, rx: number, ry: number) {
  ellipse(ctx, x, y, rx, ry, 'rgba(255,255,255,0.38)', -0.35);
  circle(ctx, x - rx * 0.35, y - ry * 0.1, Math.min(rx, ry) * 0.28, 'rgba(255,255,255,0.65)');
}

const INK = '#2a1f3d';

/** Cute face. `s` is the eye spacing scale (roughly the face half-width). */
function face(ctx: Ctx, x: number, y: number, s: number, mood: ObjectMood, time: number, seed: number, dark = '#1e1b2e') {
  const eyeDx = s * 0.42;
  const eyeR = Math.max(1.4, s * 0.2);
  const blink = (Math.floor((time + seed * 977) / 2600) % 3 === 0) && ((time + seed * 977) % 2600) < 120;
  ctx.lineCap = 'round';

  if (mood === 'happy') {
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(1.2, s * 0.1);
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + sx * eyeDx, y + eyeR * 0.4, eyeR, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(x, y + s * 0.18, s * 0.3, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    circle(ctx, x - eyeDx * 1.45, y + s * 0.28, s * 0.13, 'rgba(255,120,150,0.55)');
    circle(ctx, x + eyeDx * 1.45, y + s * 0.28, s * 0.13, 'rgba(255,120,150,0.55)');
    return;
  }

  if (mood === 'falling') {
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(1.2, s * 0.1);
    for (const sx of [-1, 1]) {
      const ex = x + sx * eyeDx;
      ctx.beginPath();
      ctx.moveTo(ex - eyeR, y - eyeR);
      ctx.lineTo(ex + eyeR, y + eyeR);
      ctx.moveTo(ex + eyeR, y - eyeR);
      ctx.lineTo(ex - eyeR, y + eyeR);
      ctx.stroke();
    }
    ellipse(ctx, x, y + s * 0.42, s * 0.16, s * 0.2, dark);
    return;
  }

  const worried = mood === 'worried';
  const r = worried ? eyeR * 1.35 : eyeR;
  for (const sx of [-1, 1]) {
    const ex = x + sx * eyeDx;
    if (blink && !worried) {
      ctx.strokeStyle = dark;
      ctx.lineWidth = Math.max(1, s * 0.08);
      ctx.beginPath();
      ctx.moveTo(ex - r, y);
      ctx.lineTo(ex + r, y);
      ctx.stroke();
    } else {
      circle(ctx, ex, y, r * 1.25, '#ffffff');
      const look = mood === 'flying' ? 0 : Math.sin(time / 900 + seed) * r * 0.3;
      circle(ctx, ex + look, y + (worried ? 0 : r * 0.15), r * 0.75, dark);
      circle(ctx, ex + look - r * 0.25, y - r * 0.2, r * 0.25, '#ffffff');
    }
  }
  ctx.strokeStyle = dark;
  ctx.lineWidth = Math.max(1, s * 0.08);
  if (worried) {
    // wobbly mouth + sweat drop + raised brows
    ctx.beginPath();
    ctx.moveTo(x - s * 0.22, y + s * 0.42);
    ctx.quadraticCurveTo(x - s * 0.08, y + s * 0.32, x, y + s * 0.42);
    ctx.quadraticCurveTo(x + s * 0.08, y + s * 0.52, x + s * 0.22, y + s * 0.42);
    ctx.stroke();
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + sx * eyeDx - r, y - r * 1.9);
      ctx.lineTo(x + sx * eyeDx + r * 0.6 * sx, y - r * 2.4);
      ctx.stroke();
    }
    const dropY = y - s * 0.3 + ((time / 12) % (s * 0.5));
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.moveTo(x + s * 0.95, dropY - s * 0.18);
    ctx.quadraticCurveTo(x + s * 1.08, dropY + s * 0.04, x + s * 0.95, dropY + s * 0.08);
    ctx.quadraticCurveTo(x + s * 0.82, dropY + s * 0.04, x + s * 0.95, dropY - s * 0.18);
    ctx.fill();
  } else if (mood === 'flying') {
    ellipse(ctx, x, y + s * 0.38, s * 0.11, s * 0.13, dark);
  } else {
    ctx.beginPath();
    ctx.arc(x, y + s * 0.2, s * 0.2, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
}

/** Angry face for hazards: slanted brows, red eyes, gritted teeth. */
function angryFace(ctx: Ctx, x: number, y: number, s: number, time: number, eye = '#fef08a') {
  const dx = s * 0.4;
  for (const sx of [-1, 1]) {
    circle(ctx, x + sx * dx, y, s * 0.17, eye);
    circle(ctx, x + sx * dx, y + s * 0.03, s * 0.08, '#7f1d1d');
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = Math.max(1.2, s * 0.11);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + sx * dx * 1.6, y - s * 0.3);
    ctx.lineTo(x + sx * dx * 0.35, y - s * 0.12);
    ctx.stroke();
  }
  rr(ctx, x - s * 0.3, y + s * 0.28, s * 0.6, s * 0.18, s * 0.05);
  ctx.fillStyle = '#fafafa';
  ctx.fill();
  outline(ctx, '#1c1917', Math.max(0.8, s * 0.05));
  ctx.beginPath();
  for (let i = 1; i < 4; i++) {
    const tx = x - s * 0.3 + (s * 0.6 * i) / 4;
    ctx.moveTo(tx, y + s * 0.28);
    ctx.lineTo(tx, y + s * 0.46);
  }
  ctx.stroke();
  void time;
}

/** Burning fuse with sparks, from (x, y) curving up. */
function fuse(ctx: Ctx, x: number, y: number, s: number, time: number) {
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = Math.max(1.2, s * 0.09);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.35, y - s * 0.3, x + s * 0.2, y - s * 0.55);
  ctx.stroke();
  const fx = x + s * 0.2;
  const fy = y - s * 0.55;
  const flick = 0.8 + Math.sin(time / 40) * 0.25;
  circle(ctx, fx, fy, s * 0.2 * flick, 'rgba(251,146,60,0.85)');
  circle(ctx, fx, fy, s * 0.1 * flick, '#fef9c3');
  for (let i = 0; i < 4; i++) {
    const a = time / 90 + i * 1.7;
    circle(ctx, fx + Math.cos(a) * s * 0.3, fy + Math.sin(a) * s * 0.3, s * 0.04, '#fde047');
  }
}

// ---------- archetype overlays (physics special blocks) ----------

function archetypeOverlay(ctx: Ctx, hw: number, hh: number, archetype: string | undefined, time: number) {
  if (!archetype || archetype === 'standard') return;
  ctx.save();
  if (archetype === 'gold_ingot') {
    const sx = -hw + ((time / 6) % (hw * 2 + 20)) - 10;
    ctx.save();
    rr(ctx, -hw, -hh, hw * 2, hh * 2, hh * 0.5);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, -hh);
    ctx.lineTo(sx - 8, hh);
    ctx.stroke();
    ctx.restore();
    // coin badge
    circle(ctx, hw - 6, -hh + 2, 6, '#facc15');
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(hw - 6, -hh + 2, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#a16207';
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', hw - 6, -hh + 2.5);
  } else if (archetype === 'prism') {
    // sparkle
    const tw = Math.abs(Math.sin(time / 200));
    ctx.fillStyle = `rgba(255,255,255,${0.5 + tw * 0.5})`;
    ctx.beginPath();
    const cx = hw - 5;
    const cy = -hh + 3;
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx + 1.5, cy - 1.5);
    ctx.lineTo(cx + 5, cy);
    ctx.lineTo(cx + 1.5, cy + 1.5);
    ctx.lineTo(cx, cy + 5);
    ctx.lineTo(cx - 1.5, cy + 1.5);
    ctx.lineTo(cx - 5, cy);
    ctx.lineTo(cx - 1.5, cy - 1.5);
    ctx.fill();
  } else if (archetype === 'titan') {
    // heavy iron frame + anchor badge
    rr(ctx, -hw + 1, -hh + 1, hw * 2 - 2, hh * 2 - 2, 5);
    outline(ctx, 'rgba(51,65,85,0.95)', 3);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) circle(ctx, sx * (hw - 4), sy * (hh - 4), 1.6, '#cbd5e1');
    circle(ctx, -hw + 7, -hh + 3, 6, '#334155');
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-hw + 7, -hh);
    ctx.lineTo(-hw + 7, -hh + 6);
    ctx.moveTo(-hw + 4, -hh + 2);
    ctx.lineTo(-hw + 10, -hh + 2);
    ctx.arc(-hw + 7, -hh + 4, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- the 20 stackable characters ----------

type BlockArt = (ctx: Ctx, hw: number, hh: number, time: number, mood: ObjectMood) => void;

const BLOCKS: BlockArt[] = [
  // 0 Spring Meadow — Bumble Bee
  (ctx, hw, hh, time, mood) => {
    const flap = Math.sin(time / (mood === 'flying' ? 30 : 60)) * 0.35;
    for (const sx of [-1, 1]) {
      ellipse(ctx, sx * hw * 0.28, -hh * 0.95, hw * 0.28, hh * 0.45, 'rgba(224,242,254,0.85)', sx * (0.5 + flap));
    }
    rr(ctx, -hw, -hh, hw * 2, hh * 2, hh);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#fde047', '#eab308');
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#292524';
    for (const fx of [-0.45, 0.05, 0.55]) ctx.fillRect(hw * fx - hw * 0.1, -hh, hw * 0.2, hh * 2);
    ctx.restore();
    rr(ctx, -hw, -hh, hw * 2, hh * 2, hh);
    outline(ctx, '#78350f', 1.4);
    // stinger
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.moveTo(hw, -2);
    ctx.lineTo(hw + 5, 0);
    ctx.lineTo(hw, 2);
    ctx.fill();
    // antennae
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1.2;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-hw * 0.6 + sx * 3, -hh * 0.8);
      ctx.quadraticCurveTo(-hw * 0.6 + sx * 7, -hh * 1.4, -hw * 0.6 + sx * 6, -hh * 1.5);
      ctx.stroke();
      circle(ctx, -hw * 0.6 + sx * 6, -hh * 1.5, 1.6, '#292524');
    }
    rr(ctx, -hw * 0.95, -hh * 0.62, hw * 0.75, hh * 1.25, hh * 0.6);
    ctx.fillStyle = '#fde047';
    ctx.fill();
    face(ctx, -hw * 0.58, -hh * 0.05, Math.min(hh * 0.85, hw * 0.4), mood, time, 0);
  },
  // 1 Lunar Surface — Astronaut
  (ctx, hw, hh, time, mood) => {
    rr(ctx, -hw, -hh, hw * 2, hh * 2, hh * 0.7);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#f8fafc', '#cbd5e1');
    ctx.fill();
    outline(ctx, '#64748b', 1.4);
    // backpack stripes + flag patch
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(hw * 0.55, -hh * 0.7, hw * 0.25, hh * 1.4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-hw * 0.9, hh * 0.25, 6, 4);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-hw * 0.9, hh * 0.25, 2.5, 2);
    // visor
    const vw = Math.min(hw * 0.95, hh * 2.1);
    rr(ctx, -vw / 2 - hw * 0.08, -hh * 0.7, vw, hh * 1.3, hh * 0.6);
    const g = ctx.createLinearGradient(0, -hh, 0, hh);
    g.addColorStop(0, '#1e3a8a');
    g.addColorStop(1, '#0f172a');
    ctx.fillStyle = g;
    ctx.fill();
    outline(ctx, '#f59e0b', 1.3);
    ellipse(ctx, -vw * 0.25 - hw * 0.08, -hh * 0.38, vw * 0.13, hh * 0.12, 'rgba(255,255,255,0.45)', -0.4);
    face(ctx, -hw * 0.08, -hh * 0.02, Math.min(hh * 0.8, vw * 0.38), mood, time, 1, '#f8fafc');
  },
  // 2 Martian Canyon — Mars Rover
  (ctx, hw, hh, time, mood) => {
    const wheelR = hh * 0.42;
    for (const fx of [-0.65, 0, 0.65]) {
      const wx = hw * fx;
      circle(ctx, wx, hh * 0.58, wheelR, '#292524');
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const a = time / 150;
      ctx.moveTo(wx + Math.cos(a) * wheelR * 0.7, hh * 0.58 + Math.sin(a) * wheelR * 0.7);
      ctx.lineTo(wx - Math.cos(a) * wheelR * 0.7, hh * 0.58 - Math.sin(a) * wheelR * 0.7);
      ctx.stroke();
    }
    rr(ctx, -hw, -hh * 0.75, hw * 2, hh * 1.25, 4);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#fdba74', '#c2410c');
    ctx.fill();
    outline(ctx, '#7c2d12', 1.3);
    // solar panel
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(hw * 0.15, -hh * 0.98, hw * 0.75, hh * 0.28);
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 0.6;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(hw * 0.15 + (hw * 0.75 * i) / 4, -hh * 0.98);
      ctx.lineTo(hw * 0.15 + (hw * 0.75 * i) / 4, -hh * 0.7);
      ctx.stroke();
    }
    // camera head eyes
    rr(ctx, -hw * 0.92, -hh * 0.62, hw * 0.85, hh * 0.85, 4);
    ctx.fillStyle = '#e7e5e4';
    ctx.fill();
    face(ctx, -hw * 0.5, -hh * 0.2, Math.min(hh * 0.72, hw * 0.38), mood, time, 2);
  },
  // 3 Deep Space Nebula — UFO
  (ctx, hw, hh, time, mood) => {
    ellipse(ctx, 0, -hh * 0.3, hw * 0.5, hh * 0.75, 'rgba(165,243,252,0.55)');
    ellipse(ctx, 0, -hh * 0.2, hw * 0.32, hh * 0.5, '#86efac');
    face(ctx, 0, -hh * 0.25, Math.min(hh * 0.5, hw * 0.28), mood, time, 3);
    ellipse(ctx, 0, hh * 0.35, hw, hh * 0.55, '#a855f7');
    ellipse(ctx, 0, hh * 0.25, hw * 0.92, hh * 0.32, '#c084fc');
    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(0, hh * 0.35, hw, hh * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const on = Math.floor(time / 180 + i) % 5 === 0;
      circle(ctx, -hw * 0.7 + (hw * 1.4 * i) / 4, hh * 0.48, 2, on ? '#fde047' : '#fef3c7');
    }
  },
  // 4 Abyssal Coral Reef — Sea Turtle
  (ctx, hw, hh, time, mood) => {
    const paddle = Math.sin(time / 220) * 0.4;
    for (const sx of [-1, 1]) ellipse(ctx, sx * hw * 0.55, hh * 0.65, hw * 0.25, hh * 0.25, '#4ade80', sx * paddle);
    ellipse(ctx, -hw * 0.95, -hh * 0.05, hh * 0.55, hh * 0.5, '#4ade80');
    ctx.beginPath();
    ctx.ellipse(hw * 0.1, 0, hw * 0.88, hh * 0.92, 0, 0, Math.PI * 2);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#22c55e', '#15803d');
    ctx.fill();
    outline(ctx, '#14532d', 1.3);
    ctx.strokeStyle = 'rgba(187,247,208,0.75)';
    ctx.lineWidth = 1.1;
    for (const fx of [-0.4, 0.1, 0.6]) {
      ctx.beginPath();
      ctx.moveTo(hw * fx, -hh * 0.75);
      ctx.lineTo(hw * fx + hw * 0.15, 0);
      ctx.lineTo(hw * fx, hh * 0.75);
      ctx.stroke();
    }
    face(ctx, -hw * 0.95, -hh * 0.1, Math.min(hh * 0.5, hw * 0.25), mood, time, 4);
    for (let i = 0; i < 3; i++) {
      const by = -hh - ((time / 20 + i * 12) % 20);
      circle(ctx, -hw * 0.7 + i * 4, by, 1.4, 'rgba(186,230,253,0.6)');
    }
  },
  // 5 Tropical Sunset Beach — Crab
  (ctx, hw, hh, time, mood) => {
    const snap = Math.abs(Math.sin(time / 300)) * 0.4;
    for (const sx of [-1, 1]) {
      ellipse(ctx, sx * hw * 0.98, -hh * 0.25, hh * 0.42, hh * 0.32, '#ef4444');
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.moveTo(sx * hw * 0.98, -hh * 0.25);
      ctx.arc(sx * hw * 0.98, -hh * 0.25, hh * 0.32, sx > 0 ? -snap : Math.PI - snap, sx > 0 ? snap : Math.PI + snap);
      ctx.fill();
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(sx * hw * (0.3 + k * 0.18), hh * 0.5);
        ctx.lineTo(sx * hw * (0.4 + k * 0.18), hh * 0.98);
        ctx.stroke();
      }
    }
    ctx.beginPath();
    ctx.ellipse(0, hh * 0.05, hw * 0.75, hh * 0.72, 0, 0, Math.PI * 2);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#f87171', '#dc2626');
    ctx.fill();
    outline(ctx, '#7f1d1d', 1.3);
    for (const sx of [-1, 1]) {
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(sx * hw * 0.22, -hh * 0.5);
      ctx.lineTo(sx * hw * 0.25, -hh * 0.98);
      ctx.stroke();
    }
    face(ctx, 0, -hh * 0.05, Math.min(hh * 0.75, hw * 0.4), mood, time, 5);
  },
  // 6 Volcanic Caldera — Lava Slime
  (ctx, hw, hh, time, mood) => {
    const wob = Math.sin(time / 180) * 1.5;
    ctx.beginPath();
    ctx.moveTo(-hw, hh);
    ctx.lineTo(-hw, -hh * 0.2);
    ctx.quadraticCurveTo(-hw * 0.9, -hh - wob, 0, -hh + wob);
    ctx.quadraticCurveTo(hw * 0.9, -hh - wob, hw, -hh * 0.2);
    ctx.lineTo(hw, hh);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -hh, 0, hh);
    g.addColorStop(0, '#fb923c');
    g.addColorStop(0.6, '#ea580c');
    g.addColorStop(1, '#7c2d12');
    ctx.fillStyle = g;
    ctx.fill();
    outline(ctx, '#431407', 1.3);
    for (let i = 0; i < 3; i++) {
      const dx = -hw * 0.6 + i * hw * 0.6;
      const dy = hh - ((time / 30 + i * 9) % (hh * 1.6));
      circle(ctx, dx, dy, 1.6, 'rgba(254,240,138,0.8)');
    }
    ellipse(ctx, -hw * 0.5, -hh * 0.45, hw * 0.18, hh * 0.12, 'rgba(255,237,213,0.6)', -0.3);
    face(ctx, 0, hh * 0.05, Math.min(hh * 0.8, hw * 0.42), mood, time, 6);
  },
  // 7 Ancient Stone Citadel — Knight
  (ctx, hw, hh, time, mood) => {
    // plume
    ellipse(ctx, 0, -hh * 1.05, hw * 0.25, hh * 0.25, '#dc2626', Math.sin(time / 300) * 0.2);
    rr(ctx, -hw, -hh, hw * 2, hh * 2, hh * 0.5);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#e2e8f0', '#64748b');
    ctx.fill();
    outline(ctx, '#334155', 1.4);
    // visor slot band
    rr(ctx, -hw * 0.82, -hh * 0.45, hw * 1.64, hh * 0.85, 3);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    face(ctx, 0, -hh * 0.06, Math.min(hh * 0.7, hw * 0.38), mood, time, 7, '#f8fafc');
    for (const fx of [-0.85, 0.85]) circle(ctx, hw * fx, hh * 0.65, 1.6, '#cbd5e1');
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -hh);
    ctx.lineTo(0, -hh * 0.45);
    ctx.stroke();
  },
  // 8 Enchanted Redwood — Toadstool
  (ctx, hw, hh, time, mood) => {
    rr(ctx, -hw * 0.45, -hh * 0.05, hw * 0.9, hh * 1.05, 4);
    ctx.fillStyle = vgrad(ctx, 0, hh, '#fef3c7', '#fcd34d');
    ctx.fill();
    outline(ctx, '#92400e', 1.1);
    ctx.beginPath();
    ctx.moveTo(-hw, hh * 0.05);
    ctx.quadraticCurveTo(-hw, -hh * 1.15, 0, -hh * 1.1);
    ctx.quadraticCurveTo(hw, -hh * 1.15, hw, hh * 0.05);
    ctx.closePath();
    ctx.fillStyle = vgrad(ctx, -hh, 0, '#f87171', '#b91c1c');
    ctx.fill();
    outline(ctx, '#7f1d1d', 1.2);
    for (const [fx, fy, fr] of [[-0.55, -0.45, 0.22], [0.05, -0.75, 0.18], [0.55, -0.35, 0.2], [-0.15, -0.2, 0.12]]) {
      circle(ctx, hw * fx, hh * fy, Math.min(hw, hh) * fr * 1.6, '#fef2f2');
    }
    face(ctx, 0, hh * 0.45, Math.min(hh * 0.45, hw * 0.3), mood, time, 8);
  },
  // 9 Golden Desert Oasis — Cactus
  (ctx, hw, hh, time, mood) => {
    rr(ctx, -hw * 0.95, hh * 0.35, hw * 1.9, hh * 0.65, 3);
    ctx.fillStyle = vgrad(ctx, hh * 0.35, hh, '#fb923c', '#c2410c');
    ctx.fill();
    for (const sx of [-1, 1]) {
      rr(ctx, sx * hw * 0.55 - hw * 0.12, -hh * 0.7 + (sx > 0 ? hh * 0.2 : 0), hw * 0.24, hh * 0.85, hw * 0.12);
      ctx.fillStyle = '#16a34a';
      ctx.fill();
    }
    rr(ctx, -hw * 0.4, -hh * 1.05, hw * 0.8, hh * 1.5, hw * 0.35);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#4ade80', '#15803d');
    ctx.fill();
    outline(ctx, '#14532d', 1.1);
    ctx.fillStyle = '#fef9c3';
    for (let i = 0; i < 6; i++) ctx.fillRect(-hw * 0.32 + (i % 3) * hw * 0.3, -hh * 0.9 + Math.floor(i / 3) * hh * 0.9, 1.2, 2.5);
    circle(ctx, hw * 0.12, -hh * 1.05, 2.6, '#f472b6');
    face(ctx, 0, -hh * 0.25, Math.min(hh * 0.55, hw * 0.3), mood, time, 9);
  },
  // 10 Frozen Arctic Tundra — Penguin
  (ctx, hw, hh, time, mood) => {
    ctx.beginPath();
    ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, hh * 0.15, hw * 0.7, hh * 0.82, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    for (const sx of [-1, 1]) ellipse(ctx, sx * hw * 0.98, hh * 0.1, hw * 0.12, hh * 0.45, '#0f172a', sx * (0.3 + Math.sin(time / 250) * 0.15));
    face(ctx, 0, -hh * 0.25, Math.min(hh * 0.6, hw * 0.35), mood, time, 10);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-3, hh * 0.02);
    ctx.lineTo(3, hh * 0.02);
    ctx.lineTo(0, hh * 0.25);
    ctx.fill();
    // scarf
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-hw * 0.55, hh * 0.4, hw * 1.1, hh * 0.18);
  },
  // 11 Pirate Corsair Cove — Parrot
  (ctx, hw, hh, time, mood) => {
    ctx.beginPath();
    ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#22c55e', '#15803d');
    ctx.fill();
    outline(ctx, '#14532d', 1.2);
    const flap = Math.sin(time / 120) * 0.3;
    ellipse(ctx, hw * 0.45, hh * 0.15, hw * 0.4, hh * 0.45, '#3b82f6', 0.3 + flap);
    ellipse(ctx, hw * 0.5, hh * 0.3, hw * 0.3, hh * 0.25, '#ef4444', 0.3 + flap);
    ellipse(ctx, -hw * 0.45, -hh * 0.05, hw * 0.4, hh * 0.65, '#ef4444');
    face(ctx, -hw * 0.45, -hh * 0.2, Math.min(hh * 0.5, hw * 0.3), mood, time, 11);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(-hw * 0.85, -hh * 0.05);
    ctx.quadraticCurveTo(-hw * 1.15, hh * 0.1, -hw * 0.85, hh * 0.35);
    ctx.lineTo(-hw * 0.7, hh * 0.1);
    ctx.fill();
    // tiny pirate hat
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(-hw * 0.85, -hh * 0.75);
    ctx.quadraticCurveTo(-hw * 0.45, -hh * 1.35, -hw * 0.05, -hh * 0.75);
    ctx.fill();
    circle(ctx, -hw * 0.45, -hh * 0.95, 1.6, '#f8fafc');
  },
  // 12 Candyland — Gummy Bear
  (ctx, hw, hh, time, mood) => {
    const jiggle = Math.sin(time / 140) * 0.8;
    ctx.save();
    ctx.globalAlpha *= 0.92;
    for (const sx of [-1, 1]) circle(ctx, sx * hw * 0.5, -hh * 0.85 + jiggle * 0.3, hh * 0.32, '#f43f5e');
    rr(ctx, -hw, -hh * 0.75 + jiggle * 0.2, hw * 2, hh * 1.75, hh * 0.8);
    const g = ctx.createLinearGradient(-hw, -hh, hw, hh);
    g.addColorStop(0, '#fda4af');
    g.addColorStop(0.5, '#f43f5e');
    g.addColorStop(1, '#be123c');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    ellipse(ctx, -hw * 0.55, -hh * 0.35, hw * 0.2, hh * 0.14, 'rgba(255,255,255,0.55)', -0.4);
    ellipse(ctx, 0, hh * 0.45, hw * 0.45, hh * 0.32, 'rgba(255,228,230,0.45)');
    face(ctx, 0, -hh * 0.05, Math.min(hh * 0.75, hw * 0.4), mood, time, 12, '#4c0519');
    for (const [fx, c] of [[-0.75, '#fde047'], [0.7, '#60a5fa'], [0.2, '#a3e635']] as [number, string][]) {
      ctx.fillStyle = c;
      ctx.fillRect(hw * fx, hh * 0.65, 4, 1.6);
    }
  },
  // 13 Golden El Dorado — Golden Idol
  (ctx, hw, hh, time, mood) => {
    rr(ctx, -hw, -hh, hw * 2, hh * 2, 4);
    const g = ctx.createLinearGradient(-hw, -hh, hw, hh);
    g.addColorStop(0, '#fef08a');
    g.addColorStop(0.45, '#eab308');
    g.addColorStop(1, '#854d0e');
    ctx.fillStyle = g;
    ctx.fill();
    outline(ctx, '#713f12', 1.4);
    ctx.fillStyle = '#ca8a04';
    for (const sx of [-1, 1]) ctx.fillRect(sx > 0 ? hw * 0.62 : -hw * 0.92, -hh * 0.8, hw * 0.3, hh * 1.6);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(0, -hh * 0.95);
    ctx.lineTo(4, -hh * 0.72);
    ctx.lineTo(0, -hh * 0.5);
    ctx.lineTo(-4, -hh * 0.72);
    ctx.fill();
    face(ctx, 0, hh * 0.05, Math.min(hh * 0.7, hw * 0.38), mood, time, 13, '#422006');
    const shine = -hw + ((time / 5) % (hw * 3));
    ctx.save();
    rr(ctx, -hw, -hh, hw * 2, hh * 2, 4);
    ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(shine, -hh);
    ctx.lineTo(shine + 6, -hh);
    ctx.lineTo(shine - 4, hh);
    ctx.lineTo(shine - 10, hh);
    ctx.fill();
    ctx.restore();
  },
  // 14 Cyberpunk Megacity — Glitch Bot
  (ctx, hw, hh, time, mood) => {
    const glitch = Math.floor(time / 90) % 23 === 0 ? 2 : 0;
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -hh);
    ctx.lineTo(0, -hh * 1.45);
    ctx.stroke();
    circle(ctx, 0, -hh * 1.5, 2.2, Math.floor(time / 300) % 2 ? '#22d3ee' : '#e879f9');
    rr(ctx, -hw + glitch, -hh, hw * 2, hh * 2, 5);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#334155', '#0f172a');
    ctx.fill();
    outline(ctx, '#22d3ee', 1.4);
    rr(ctx, -hw * 0.8, -hh * 0.6, hw * 1.6, hh * 1.0, 3);
    ctx.fillStyle = '#020617';
    ctx.fill();
    face(ctx, 0, -hh * 0.12, Math.min(hh * 0.62, hw * 0.36), mood, time, 14, '#22d3ee');
    ctx.fillStyle = '#e879f9';
    for (let i = 0; i < 4; i++) ctx.fillRect(-hw * 0.6 + i * hw * 0.4, hh * 0.62, hw * 0.2, 2);
  },
  // 15 Toxic Wasteland — Hazmat Duck
  (ctx, hw, hh, time, mood) => {
    ctx.beginPath();
    ctx.ellipse(hw * 0.15, hh * 0.2, hw * 0.85, hh * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#fde047', '#ca8a04');
    ctx.fill();
    outline(ctx, '#713f12', 1.2);
    circle(ctx, -hw * 0.5, -hh * 0.35, hh * 0.6, '#fde047');
    // gas mask
    ellipse(ctx, -hw * 0.5, -hh * 0.3, hh * 0.58, hh * 0.45, 'rgba(15,23,42,0.85)');
    face(ctx, -hw * 0.5, -hh * 0.38, Math.min(hh * 0.45, hw * 0.28), mood, time, 15, '#a3e635');
    circle(ctx, -hw * 0.5, hh * 0.15, hh * 0.22, '#475569');
    circle(ctx, -hw * 0.5, hh * 0.15, hh * 0.1, '#a3e635');
    ctx.strokeStyle = '#a3e635';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(hw * 0.35, hh * 0.15, hh * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#a3e635';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(hw * 0.35, hh * 0.15);
      ctx.arc(hw * 0.35, hh * 0.15, hh * 0.3, i * 2.094 + time / 800, i * 2.094 + 0.7 + time / 800);
      ctx.fill();
    }
  },
  // 16 Floating Sky Islands — Cloud Sheep
  (ctx, hw, hh, time, mood) => {
    for (const fx of [-0.6, 0.6]) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(hw * fx - 1.5, hh * 0.55, 3, hh * 0.45);
    }
    const puff = (x: number, y: number, r: number) => circle(ctx, x, y, r, '#f8fafc');
    for (const [fx, fy, fr] of [[-0.6, 0.1, 0.55], [-0.15, -0.35, 0.6], [0.35, -0.3, 0.6], [0.7, 0.1, 0.5], [0, 0.25, 0.65]]) {
      puff(hw * fx, hh * fy, hh * fr);
    }
    ctx.strokeStyle = 'rgba(148,163,184,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, hw * 0.95, hh * 0.9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, -hw * 0.75, hh * 0.05, hh * 0.42, hh * 0.38, '#475569');
    for (const sx of [-1, 1]) ellipse(ctx, -hw * 0.75 + sx * hh * 0.42, -hh * 0.2, hh * 0.18, hh * 0.08, '#475569', sx * 0.5);
    face(ctx, -hw * 0.75, hh * 0.0, Math.min(hh * 0.4, hw * 0.25), mood, time, 16, '#f8fafc');
    void time;
  },
  // 17 Chrono Clockwork — Alarm Clock
  (ctx, hw, hh, time, mood) => {
    const ring = mood === 'worried' ? Math.sin(time / 25) * 1.5 : 0;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * hw * 0.55 + ring, -hh * 0.85, hh * 0.3, Math.PI, 0);
      ctx.fillStyle = '#d97706';
      ctx.fill();
    }
    rr(ctx, -hw, -hh * 0.85, hw * 2, hh * 1.8, hh * 0.8);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#fbbf24', '#b45309');
    ctx.fill();
    outline(ctx, '#78350f', 1.3);
    const fr = Math.min(hw * 0.7, hh * 0.78);
    circle(ctx, 0, 0, fr, '#fffbeb');
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, fr, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      circle(ctx, Math.cos(a) * fr * 0.85, Math.sin(a) * fr * 0.85, 0.7, '#92400e');
    }
    face(ctx, 0, -fr * 0.1, fr * 0.75, mood, time, 17);
    ctx.strokeStyle = 'rgba(146,64,14,0.6)';
    ctx.lineWidth = 1;
    const ha = time / 1000;
    ctx.beginPath();
    ctx.moveTo(0, fr * 0.55);
    ctx.lineTo(Math.cos(ha) * fr * 0.3, fr * 0.55 + Math.sin(ha) * fr * 0.3);
    ctx.stroke();
  },
  // 18 Sakura Blossom Shrine — Lucky Cat
  (ctx, hw, hh, time, mood) => {
    const wave = Math.sin(time / 260) * 0.5;
    ctx.save();
    ctx.translate(hw * 0.75, -hh * 0.3);
    ctx.rotate(-0.4 + wave);
    rr(ctx, -hh * 0.16, -hh * 0.7, hh * 0.32, hh * 0.75, hh * 0.15);
    ctx.fillStyle = '#fafafa';
    ctx.fill();
    outline(ctx, '#a8a29e', 1);
    ctx.restore();
    for (const sx of [-1, 1]) {
      ctx.fillStyle = '#fafafa';
      ctx.beginPath();
      ctx.moveTo(sx * hw * 0.65, -hh * 0.6);
      ctx.lineTo(sx * hw * 0.45, -hh * 1.15);
      ctx.lineTo(sx * hw * 0.2, -hh * 0.7);
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(sx * hw * 0.58, -hh * 0.65);
      ctx.lineTo(sx * hw * 0.45, -hh * 0.98);
      ctx.lineTo(sx * hw * 0.3, -hh * 0.72);
      ctx.fill();
    }
    rr(ctx, -hw, -hh * 0.8, hw * 2, hh * 1.8, hh * 0.8);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#ffffff', '#e7e5e4');
    ctx.fill();
    outline(ctx, '#a8a29e', 1.2);
    ellipse(ctx, hw * 0.55, -hh * 0.35, hw * 0.25, hh * 0.25, '#fb923c');
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-hw * 0.7, hh * 0.25, hw * 1.4, hh * 0.16);
    circle(ctx, 0, hh * 0.52, hh * 0.18, '#facc15');
    face(ctx, -hw * 0.1, -hh * 0.15, Math.min(hh * 0.65, hw * 0.36), mood, time, 18);
  },
  // 19 The Crystalline Core — Crystal Sprite
  (ctx, hw, hh, time, mood) => {
    const hue = 260 + Math.sin(time / 700) * 25;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.7, -hh);
    ctx.lineTo(hw * 0.7, -hh);
    ctx.lineTo(hw, 0);
    ctx.lineTo(hw * 0.7, hh);
    ctx.lineTo(-hw * 0.7, hh);
    ctx.lineTo(-hw, 0);
    ctx.closePath();
    const g = ctx.createLinearGradient(-hw, -hh, hw, hh);
    g.addColorStop(0, `hsl(${hue}, 90%, 85%)`);
    g.addColorStop(0.5, `hsl(${hue}, 80%, 62%)`);
    g.addColorStop(1, `hsl(${hue + 30}, 70%, 35%)`);
    ctx.fillStyle = g;
    ctx.fill();
    outline(ctx, `hsl(${hue}, 60%, 25%)`, 1.3);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.7, -hh);
    ctx.lineTo(-hw * 0.35, 0);
    ctx.lineTo(-hw * 0.7, hh);
    ctx.moveTo(hw * 0.7, -hh);
    ctx.lineTo(hw * 0.35, 0);
    ctx.lineTo(hw * 0.7, hh);
    ctx.stroke();
    face(ctx, 0, -hh * 0.05, Math.min(hh * 0.72, hw * 0.38), mood, time, 19, '#2e1065');
    const tw = Math.abs(Math.sin(time / 230));
    circle(ctx, hw * 0.55, -hh * 0.55, 1.3 + tw * 1.2, '#ffffff');
  },
];


// ---------- redesigned characters (clearer silhouettes) ----------

// 1 Astronaut: big round helmet, puffy suit floating sideways, backpack
BLOCKS[1] = (ctx, hw, hh, time, mood) => {
  const bob = Math.sin(time / 500) * 0.6;
  // backpack
  rr(ctx, hw * 0.05, -hh * 0.95 + bob, hw * 0.8, hh * 0.55, 4);
  ctx.fillStyle = '#94a3b8';
  ctx.fill();
  outline(ctx, INK, 1.4);
  // suit body
  rr(ctx, -hw * 0.25, -hh * 0.55 + bob, hw * 1.2, hh * 1.4, hh * 0.65);
  ctx.fillStyle = vgrad(ctx, -hh, hh, '#ffffff', '#cbd5e1');
  ctx.fill();
  outline(ctx, INK, 1.4);
  // arm + glove
  rr(ctx, hw * 0.1, hh * 0.1 + bob, hw * 0.45, hh * 0.4, hh * 0.2);
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();
  outline(ctx, INK, 1.2);
  circle(ctx, hw * 0.6, hh * 0.3 + bob, hh * 0.22, '#f97316');
  // chest panel lights
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(hw * 0.25, -hh * 0.2 + bob, 3, 3);
  ctx.fillStyle = Math.floor(time / 400) % 2 ? '#22c55e' : '#166534';
  ctx.fillRect(hw * 0.38, -hh * 0.2 + bob, 3, 3);
  // helmet
  const R = Math.min(hh * 1.05, hw * 0.55);
  const hx = -hw * 0.45;
  circle(ctx, hx, bob, R, '#f8fafc');
  ctx.beginPath();
  ctx.arc(hx, bob, R, 0, Math.PI * 2);
  outline(ctx, INK, 1.4);
  ctx.beginPath();
  ctx.ellipse(hx - R * 0.05, bob + R * 0.02, R * 0.78, R * 0.68, 0, 0, Math.PI * 2);
  const vg = ctx.createLinearGradient(0, -R, 0, R);
  vg.addColorStop(0, '#312e81');
  vg.addColorStop(1, '#0b1026');
  ctx.fillStyle = vg;
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  face(ctx, hx - R * 0.05, bob + R * 0.05, R * 0.62, mood, time, 1, '#f8fafc');
  ellipse(ctx, hx - R * 0.42, bob - R * 0.38, R * 0.18, R * 0.1, 'rgba(255,255,255,0.7)', -0.6);
  // antenna
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(hx + R * 0.5, bob - R * 0.75);
  ctx.lineTo(hx + R * 0.75, bob - R * 1.15);
  ctx.stroke();
  circle(ctx, hx + R * 0.75, bob - R * 1.15, 1.8, Math.floor(time / 300) % 2 ? '#ef4444' : '#fca5a5');
};

// 2 Mars Rover: chunky body on rocker wheels, camera head on a mast
BLOCKS[2] = (ctx, hw, hh, time, mood) => {
  const wheelR = hh * 0.36;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-hw * 0.7, hh * 0.62);
  ctx.lineTo(0, hh * 0.25);
  ctx.lineTo(hw * 0.7, hh * 0.62);
  ctx.stroke();
  for (const fx of [-0.7, 0, 0.7]) {
    const wx = hw * fx;
    circle(ctx, wx, hh * 0.64, wheelR, '#3f3f46');
    ctx.beginPath();
    ctx.arc(wx, hh * 0.64, wheelR, 0, Math.PI * 2);
    outline(ctx, INK, 1.2);
    circle(ctx, wx, hh * 0.64, wheelR * 0.4, '#a1a1aa');
    const a = time / 160;
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(wx + Math.cos(a) * wheelR * 0.85, hh * 0.64 + Math.sin(a) * wheelR * 0.85);
    ctx.lineTo(wx - Math.cos(a) * wheelR * 0.85, hh * 0.64 - Math.sin(a) * wheelR * 0.85);
    ctx.stroke();
  }
  // body
  rr(ctx, -hw * 0.85, -hh * 0.2, hw * 1.7, hh * 0.65, 5);
  ctx.fillStyle = vgrad(ctx, -hh * 0.2, hh * 0.45, '#fdba74', '#c2410c');
  ctx.fill();
  outline(ctx, INK, 1.4);
  gloss(ctx, -hw * 0.5, -hh * 0.05, hw * 0.25, hh * 0.08);
  // solar panel deck
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(hw * 0.05, -hh * 0.42, hw * 0.75, hh * 0.22);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(hw * 0.05, -hh * 0.42, hw * 0.75, hh * 0.22);
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 0.7;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(hw * 0.05 + (hw * 0.75 * i) / 4, -hh * 0.42);
    ctx.lineTo(hw * 0.05 + (hw * 0.75 * i) / 4, -hh * 0.2);
    ctx.stroke();
  }
  // mast + camera head
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-hw * 0.45, -hh * 0.2);
  ctx.lineTo(-hw * 0.45, -hh * 0.55);
  ctx.stroke();
  const tilt = mood === 'worried' ? Math.sin(time / 60) * 0.12 : Math.sin(time / 900) * 0.06;
  ctx.save();
  ctx.translate(-hw * 0.45, -hh * 0.8);
  ctx.rotate(tilt);
  rr(ctx, -hw * 0.42, -hh * 0.42, hw * 0.84, hh * 0.72, 5);
  ctx.fillStyle = vgrad(ctx, -hh * 0.4, hh * 0.3, '#f4f4f5', '#a1a1aa');
  ctx.fill();
  outline(ctx, INK, 1.3);
  face(ctx, 0, -hh * 0.08, Math.min(hh * 0.55, hw * 0.34), mood, time, 2);
  ctx.restore();
};

// 7 Tiny Knight: rounded helm with T-visor, plume, little shield
BLOCKS[7] = (ctx, hw, hh, time, mood) => {
  const sway = Math.sin(time / 300) * 0.25;
  // plume
  ctx.save();
  ctx.translate(0, -hh * 0.95);
  ctx.rotate(sway);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(hw * 0.5, -hh * 0.6, hw * 0.75, -hh * 0.05);
  ctx.quadraticCurveTo(hw * 0.35, -hh * 0.2, 0, 0);
  ctx.fillStyle = '#dc2626';
  ctx.fill();
  outline(ctx, INK, 1.1);
  ctx.restore();
  // helm
  ctx.beginPath();
  ctx.moveTo(-hw * 0.9, hh);
  ctx.lineTo(-hw * 0.9, -hh * 0.2);
  ctx.quadraticCurveTo(-hw * 0.9, -hh * 1.05, 0, -hh * 1.05);
  ctx.quadraticCurveTo(hw * 0.9, -hh * 1.05, hw * 0.9, -hh * 0.2);
  ctx.lineTo(hw * 0.9, hh);
  ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -hh, hh, '#f1f5f9', '#64748b');
  ctx.fill();
  outline(ctx, INK, 1.4);
  gloss(ctx, -hw * 0.5, -hh * 0.6, hw * 0.2, hh * 0.15);
  // T visor
  ctx.fillStyle = '#0f172a';
  rr(ctx, -hw * 0.7, -hh * 0.42, hw * 1.4, hh * 0.62, 3);
  ctx.fill();
  ctx.fillRect(-hw * 0.09, -hh * 0.1, hw * 0.18, hh * 0.8);
  face(ctx, 0, -hh * 0.12, Math.min(hh * 0.62, hw * 0.34), mood, time, 7, '#fde68a');
  // rivets + shield
  for (const fx of [-0.75, 0.75]) circle(ctx, hw * fx, hh * 0.6, 1.8, '#cbd5e1');
  ctx.beginPath();
  ctx.moveTo(hw * 0.75, -hh * 0.1);
  ctx.lineTo(hw * 1.08, -hh * 0.1);
  ctx.lineTo(hw * 1.08, hh * 0.45);
  ctx.quadraticCurveTo(hw * 0.92, hh * 0.9, hw * 0.75, hh * 0.45);
  ctx.closePath();
  ctx.fillStyle = '#2563eb';
  ctx.fill();
  outline(ctx, INK, 1.1);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(hw * 0.89, -hh * 0.05, 2, hh * 0.6);
};

// 10 Penguin: belly-sliding penguin with flippers, beak and feet
BLOCKS[10] = (ctx, hw, hh, time, mood) => {
  const flap = Math.sin(time / (mood === 'flying' ? 80 : 300)) * 0.35;
  // feet
  for (const dy of [-0.15, 0.2]) ellipse(ctx, hw * 0.92, hh * dy + hh * 0.35, hw * 0.12, hh * 0.14, '#f97316');
  // body
  ctx.beginPath();
  ctx.ellipse(hw * 0.05, hh * 0.05, hw * 0.92, hh * 0.92, 0, 0, Math.PI * 2);
  ctx.fillStyle = vgrad(ctx, -hh, hh, '#334155', '#0f172a');
  ctx.fill();
  outline(ctx, INK, 1.4);
  // white belly
  ctx.beginPath();
  ctx.ellipse(hw * 0.1, hh * 0.35, hw * 0.75, hh * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  // flipper
  ellipse(ctx, hw * 0.2, -hh * 0.15, hw * 0.35, hh * 0.18, '#1e293b', -0.3 + flap);
  // head face patch
  circle(ctx, -hw * 0.6, -hh * 0.15, hh * 0.62, '#f8fafc');
  face(ctx, -hw * 0.6, -hh * 0.2, Math.min(hh * 0.52, hw * 0.3), mood, time, 10);
  ctx.beginPath();
  ctx.moveTo(-hw * 0.92, hh * 0.05);
  ctx.lineTo(-hw * 1.15, hh * 0.15);
  ctx.lineTo(-hw * 0.92, hh * 0.28);
  ctx.closePath();
  ctx.fillStyle = '#f97316';
  ctx.fill();
  outline(ctx, INK, 0.8);
  // scarf
  rr(ctx, -hw * 0.3, -hh * 0.65, hw * 0.16, hh * 1.3, 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
  gloss(ctx, -hw * 0.1, -hh * 0.6, hw * 0.25, hh * 0.1);
};

// 11 Pirate Parrot: red head, yellow hooked beak, blue wing, long tail
BLOCKS[11] = (ctx, hw, hh, time, mood) => {
  const flap = Math.sin(time / (mood === 'flying' ? 60 : 200)) * 0.35;
  // tail feathers
  for (const [c, dy] of [['#2563eb', -0.15], ['#facc15', 0.05], ['#16a34a', 0.25]] as [string, number][]) {
    ctx.beginPath();
    ctx.moveTo(hw * 0.4, hh * dy);
    ctx.lineTo(hw * 1.1, hh * (dy + 0.35));
    ctx.lineTo(hw * 0.95, hh * (dy + 0.55));
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
    outline(ctx, INK, 0.9);
  }
  // body
  ctx.beginPath();
  ctx.ellipse(hw * 0.05, hh * 0.15, hw * 0.65, hh * 0.78, 0, 0, Math.PI * 2);
  ctx.fillStyle = vgrad(ctx, -hh, hh, '#ef4444', '#b91c1c');
  ctx.fill();
  outline(ctx, INK, 1.3);
  // wing
  ctx.save();
  ctx.translate(hw * 0.1, 0);
  ctx.rotate(flap);
  ctx.beginPath();
  ctx.ellipse(hw * 0.15, hh * 0.1, hw * 0.45, hh * 0.42, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#2563eb';
  ctx.fill();
  outline(ctx, INK, 1.1);
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.ellipse(hw * 0.3, hh * 0.35, hw * 0.25, hh * 0.15, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // head
  circle(ctx, -hw * 0.5, -hh * 0.3, hh * 0.68, '#ef4444');
  ctx.beginPath();
  ctx.arc(-hw * 0.5, -hh * 0.3, hh * 0.68, 0, Math.PI * 2);
  outline(ctx, INK, 1.3);
  ellipse(ctx, -hw * 0.5, -hh * 0.22, hh * 0.45, hh * 0.35, '#fef2f2');
  face(ctx, -hw * 0.48, -hh * 0.3, Math.min(hh * 0.5, hw * 0.3), mood, time, 11);
  // hooked beak
  ctx.beginPath();
  ctx.moveTo(-hw * 0.85, -hh * 0.35);
  ctx.quadraticCurveTo(-hw * 1.2, -hh * 0.3, -hw * 1.0, hh * 0.15);
  ctx.quadraticCurveTo(-hw * 0.95, -hh * 0.05, -hw * 0.8, -hh * 0.05);
  ctx.closePath();
  ctx.fillStyle = '#fbbf24';
  ctx.fill();
  outline(ctx, INK, 0.9);
  // pirate hat
  ctx.beginPath();
  ctx.moveTo(-hw * 0.95, -hh * 0.82);
  ctx.quadraticCurveTo(-hw * 0.5, -hh * 1.55, -hw * 0.05, -hh * 0.82);
  ctx.closePath();
  ctx.fillStyle = '#1c1917';
  ctx.fill();
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  circle(ctx, -hw * 0.5, -hh * 1.05, 2, '#f8fafc');
};

// 15 Hazmat Duck: classic rubber duck wearing a gas mask
BLOCKS[15] = (ctx, hw, hh, time, mood) => {
  const bob = Math.sin(time / 400) * 0.8;
  // body
  ctx.beginPath();
  ctx.moveTo(-hw * 0.4, hh * 0.9);
  ctx.quadraticCurveTo(-hw * 0.95, hh * 0.9, -hw * 0.75, hh * 0.05);
  ctx.quadraticCurveTo(hw * 0.2, -hh * 0.2, hw * 0.75, -hh * 0.45 + bob);
  ctx.quadraticCurveTo(hw * 1.0, hh * 0.9, hw * 0.3, hh * 0.9);
  ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -hh, hh, '#fde047', '#eab308');
  ctx.fill();
  outline(ctx, INK, 1.4);
  ellipse(ctx, hw * 0.15, hh * 0.25, hw * 0.35, hh * 0.25, 'rgba(202,138,4,0.45)', -0.2);
  // head
  const hx = -hw * 0.45;
  const hy = -hh * 0.35 + bob * 0.5;
  circle(ctx, hx, hy, hh * 0.72, '#fde047');
  ctx.beginPath();
  ctx.arc(hx, hy, hh * 0.72, 0, Math.PI * 2);
  outline(ctx, INK, 1.4);
  gloss(ctx, hx - hh * 0.25, hy - hh * 0.35, hh * 0.2, hh * 0.12);
  // gas mask: goggles + snout + filter
  ctx.fillStyle = '#334155';
  ctx.fillRect(hx - hh * 0.72, hy - hh * 0.2, hh * 1.44, hh * 0.16);
  face(ctx, hx, hy - hh * 0.15, Math.min(hh * 0.55, hw * 0.3), mood, time, 15, '#a3e635');
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(hx + sx * hh * 0.24, hy - hh * 0.15, hh * 0.24, 0, Math.PI * 2);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  rr(ctx, hx - hh * 0.95, hy + hh * 0.1, hh * 0.6, hh * 0.45, hh * 0.15);
  ctx.fillStyle = '#475569';
  ctx.fill();
  outline(ctx, INK, 1);
  circle(ctx, hx - hh * 0.98, hy + hh * 0.32, hh * 0.18, '#a3e635');
  // radiation badge on body
  const bx = hw * 0.4;
  const by = hh * 0.35;
  circle(ctx, bx, by, hh * 0.28, '#1f2937');
  ctx.fillStyle = '#facc15';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.arc(bx, by, hh * 0.24, i * 2.094 - 0.35, i * 2.094 + 0.35);
    ctx.fill();
  }
  circle(ctx, bx, by, hh * 0.06, '#facc15');
};

// 16 Cloud Sheep: big fluffy wool body, dark face with ears, stubby legs
BLOCKS[16] = (ctx, hw, hh, time, mood) => {
  for (const fx of [-0.45, -0.1, 0.3, 0.65]) {
    rr(ctx, hw * fx - 2, hh * 0.45, 4, hh * 0.55, 2);
    ctx.fillStyle = '#1f2937';
    ctx.fill();
  }
  const puffs: [number, number, number][] = [[-0.35, 0.1, 0.62], [0.05, -0.35, 0.68], [0.5, -0.25, 0.62], [0.75, 0.15, 0.55], [0.2, 0.25, 0.7], [-0.2, -0.3, 0.55]];
  // outline pass then fill pass so the wool reads as one fluffy silhouette
  for (const [fx, fy, fr] of puffs) {
    circle(ctx, hw * fx, hh * fy, hh * fr + 1.8, INK);
  }
  for (const [fx, fy, fr] of puffs) {
    circle(ctx, hw * fx, hh * fy, hh * fr, '#ffffff');
  }
  for (const [fx, fy, fr] of puffs) circle(ctx, hw * fx - hh * fr * 0.25, hh * fy - hh * fr * 0.3, hh * fr * 0.3, 'rgba(226,232,240,0.9)');
  // head
  const hx = -hw * 0.72;
  ctx.beginPath();
  ctx.ellipse(hx, hh * 0.05, hh * 0.5, hh * 0.58, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#374151';
  ctx.fill();
  outline(ctx, INK, 1.2);
  for (const sx of [-1, 1]) ellipse(ctx, hx + sx * hh * 0.5, -hh * 0.2, hh * 0.22, hh * 0.1, '#374151', sx * 0.6);
  circle(ctx, hx, -hh * 0.45, hh * 0.25, '#ffffff');
  face(ctx, hx, hh * 0.02, Math.min(hh * 0.42, hw * 0.25), mood, time, 16, '#f8fafc');
  void time;
};

// ---------- the 20 hazards (never tap these) ----------

type HazardArt = (ctx: Ctx, r: number, time: number) => void;

const HAZARDS: HazardArt[] = [
  // 0 Angry Wasp
  (ctx, r, time) => {
    const flap = Math.sin(time / 25) * 0.4;
    for (const sx of [-1, 1]) ellipse(ctx, sx * r * 0.35, -r * 0.7, r * 0.35, r * 0.5, 'rgba(226,232,240,0.85)', sx * (0.5 + flap));
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#18181b';
    for (const fx of [-0.4, 0.2]) ctx.fillRect(r * fx, -r, r * 0.25, r * 2);
    ctx.restore();
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(r * 0.9, -r * 0.15);
    ctx.lineTo(r * 1.45, 0);
    ctx.lineTo(r * 0.9, r * 0.15);
    ctx.fill();
    angryFace(ctx, -r * 0.35, -r * 0.05, r * 0.65, time, '#ef4444');
  },
  // 1 Flaming Meteor
  (ctx, r, time) => {
    for (let i = 0; i < 5; i++) {
      const fl = Math.sin(time / 50 + i) * r * 0.15;
      ellipse(ctx, -r * (0.7 + i * 0.25), fl, r * (0.55 - i * 0.08), r * (0.4 - i * 0.05), i % 2 ? 'rgba(251,146,60,0.7)' : 'rgba(239,68,68,0.6)');
    }
    circle(ctx, 0, 0, r * 0.85, '#57534e');
    circle(ctx, r * 0.25, -r * 0.3, r * 0.18, '#44403c');
    circle(ctx, -r * 0.3, r * 0.35, r * 0.13, '#44403c');
    angryFace(ctx, 0, 0, r * 0.7, time, '#fb923c');
  },
  // 2 Alien Spore Pod
  (ctx, r, time) => {
    const pulse = 1 + Math.sin(time / 120) * 0.08;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + time / 1500;
      ctx.strokeStyle = '#4d7c0f';
      ctx.lineWidth = r * 0.12;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
      ctx.lineTo(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15);
      ctx.stroke();
    }
    circle(ctx, 0, 0, r * 0.85 * pulse, '#65a30d');
    circle(ctx, 0, 0, r * 0.6 * pulse, 'rgba(190,242,100,0.55)');
    angryFace(ctx, 0, 0, r * 0.65, time, '#fde047');
  },
  // 3 Plasma Space Mine
  (ctx, r, time) => {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.2) * r * 0.75, Math.sin(a - 0.2) * r * 0.75);
      ctx.lineTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25);
      ctx.lineTo(Math.cos(a + 0.2) * r * 0.75, Math.sin(a + 0.2) * r * 0.75);
      ctx.fill();
    }
    circle(ctx, 0, 0, r * 0.85, '#4c1d95');
    circle(ctx, 0, 0, r * 0.5, `rgba(232,121,249,${0.5 + Math.sin(time / 80) * 0.3})`);
    angryFace(ctx, 0, 0, r * 0.62, time, '#f0abfc');
  },
  // 4 Sea Mine
  (ctx, r, time) => {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = r * 0.15;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15);
      ctx.stroke();
      circle(ctx, Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15, r * 0.12, '#9ca3af');
    }
    circle(ctx, 0, 0, r * 0.85, '#1f2937');
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    angryFace(ctx, 0, 0, r * 0.62, time, '#fca5a5');
    for (let i = 0; i < 2; i++) circle(ctx, r * 0.6, -r - ((time / 15 + i * 10) % 14), r * 0.08, 'rgba(186,230,253,0.7)');
  },
  // 5 Coconut Bomb
  (ctx, r, time) => {
    circle(ctx, 0, 0, r * 0.9, '#78350f');
    ctx.strokeStyle = 'rgba(41,24,10,0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.9, i * 1.2, i * 1.2 + 0.6);
      ctx.stroke();
    }
    fuse(ctx, 0, -r * 0.85, r, time);
    angryFace(ctx, 0, r * 0.05, r * 0.65, time, '#fde68a');
  },
  // 6 Fireball
  (ctx, r, time) => {
    for (let i = 0; i < 7; i++) {
      const a = (i * Math.PI * 2) / 7 + time / 300;
      const fl = 1 + Math.sin(time / 60 + i) * 0.2;
      ellipse(ctx, Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.5 * fl, r * 0.35 * fl, 'rgba(249,115,22,0.75)', a);
    }
    circle(ctx, 0, 0, r * 0.75, '#ef4444');
    circle(ctx, 0, 0, r * 0.5, '#fbbf24');
    angryFace(ctx, 0, 0, r * 0.6, time, '#fef9c3');
  },
  // 7 Catapult Boulder
  (ctx, r, time) => {
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const a = (i * Math.PI * 2) / 9;
      const rr2 = r * (0.85 + ((i * 37) % 7) / 40);
      if (i === 0) ctx.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
      else ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
    }
    ctx.closePath();
    ctx.fillStyle = vgrad(ctx, -r, r, '#a8a29e', '#57534e');
    ctx.fill();
    outline(ctx, '#292524', 1.3);
    fuse(ctx, r * 0.1, -r * 0.8, r, time);
    angryFace(ctx, 0, r * 0.05, r * 0.62, time, '#fca5a5');
  },
  // 8 Thorny Bramble Ball
  (ctx, r, time) => {
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6 + time / 900;
      ctx.fillStyle = '#365314';
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.15) * r * 0.75, Math.sin(a - 0.15) * r * 0.75);
      ctx.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2);
      ctx.lineTo(Math.cos(a + 0.15) * r * 0.75, Math.sin(a + 0.15) * r * 0.75);
      ctx.fill();
    }
    circle(ctx, 0, 0, r * 0.82, '#4d7c0f');
    circle(ctx, -r * 0.35, -r * 0.4, r * 0.15, '#7c3aed');
    circle(ctx, r * 0.45, r * 0.35, r * 0.13, '#7c3aed');
    angryFace(ctx, 0, 0, r * 0.6, time, '#f0abfc');
  },
  // 9 Scorpion
  (ctx, r, time) => {
    const sting = Math.sin(time / 160) * 0.2;
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.5, 0);
    ctx.quadraticCurveTo(r * 1.3, -r * 0.3, r * 0.9, -r * (1.0 + sting));
    ctx.stroke();
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(r * 0.9, -r * (1.0 + sting));
    ctx.lineTo(r * 0.55, -r * (1.25 + sting));
    ctx.lineTo(r * 0.75, -r * (0.85 + sting));
    ctx.fill();
    for (const sy of [-1, 1]) {
      ellipse(ctx, -r * 0.95, sy * r * 0.55, r * 0.3, r * 0.2, '#c2410c', sy * 0.4);
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 1.2;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.2 + k * r * 0.25, sy * r * 0.4);
        ctx.lineTo(-r * 0.1 + k * r * 0.25, sy * r * 0.85);
        ctx.stroke();
      }
    }
    ellipse(ctx, 0, 0, r * 0.75, r * 0.55, '#ea580c');
    angryFace(ctx, -r * 0.1, 0, r * 0.55, time, '#fde047');
  },
  // 10 Icicle Bomb
  (ctx, r, time) => {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + 0.3;
      ctx.fillStyle = 'rgba(186,230,253,0.95)';
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.25) * r * 0.7, Math.sin(a - 0.25) * r * 0.7);
      ctx.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3);
      ctx.lineTo(Math.cos(a + 0.25) * r * 0.7, Math.sin(a + 0.25) * r * 0.7);
      ctx.fill();
    }
    circle(ctx, 0, 0, r * 0.8, '#0ea5e9');
    circle(ctx, -r * 0.25, -r * 0.3, r * 0.2, 'rgba(255,255,255,0.6)');
    angryFace(ctx, 0, 0, r * 0.6, time, '#e0f2fe');
    void time;
  },
  // 11 Cannonball
  (ctx, r, time) => {
    circle(ctx, 0, 0, r * 0.9, '#1c1917');
    circle(ctx, -r * 0.3, -r * 0.35, r * 0.22, 'rgba(255,255,255,0.25)');
    fuse(ctx, r * 0.2, -r * 0.85, r, time);
    angryFace(ctx, 0, r * 0.05, r * 0.65, time, '#fca5a5');
  },
  // 12 Sour Jawbreaker
  (ctx, r, time) => {
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    g.addColorStop(0, '#fef08a');
    g.addColorStop(0.4, '#a3e635');
    g.addColorStop(0.7, '#22c55e');
    g.addColorStop(1, '#166534');
    circle(ctx, 0, 0, r * 0.9, '#166534');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + time / 1000;
      ctx.fillStyle = i % 2 ? '#f472b6' : '#facc15';
      ctx.fillRect(Math.cos(a) * r * 0.65, Math.sin(a) * r * 0.65, 2.5, 1.2);
    }
    fuse(ctx, 0, -r * 0.85, r, time);
    angryFace(ctx, 0, r * 0.05, r * 0.6, time, '#fdf4ff');
  },
  // 13 Cursed Skull
  (ctx, r, time) => {
    circle(ctx, 0, 0, r * 1.05, `rgba(16,185,129,${0.25 + Math.sin(time / 150) * 0.15})`);
    circle(ctx, 0, -r * 0.1, r * 0.8, '#fef3c7');
    rr(ctx, -r * 0.45, r * 0.35, r * 0.9, r * 0.45, r * 0.15);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();
    for (const sx of [-1, 1]) ellipse(ctx, sx * r * 0.32, -r * 0.1, r * 0.2, r * 0.24, '#14532d');
    for (const sx of [-1, 1]) circle(ctx, sx * r * 0.32, -r * 0.08, r * 0.08, '#4ade80');
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(0, r * 0.12);
    ctx.lineTo(r * 0.08, r * 0.28);
    ctx.lineTo(-r * 0.08, r * 0.28);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.15, r * 0.4);
      ctx.lineTo(i * r * 0.15, r * 0.75);
      ctx.stroke();
    }
  },
  // 14 Virus Drone
  (ctx, r, time) => {
    const spin = time / 120;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = r * 0.12;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * r * 0.6, 0);
      ctx.lineTo(sx * r * 1.1, -r * 0.4);
      ctx.stroke();
      ellipse(ctx, sx * r * 1.1, -r * 0.45, r * 0.4 * Math.abs(Math.cos(spin)), r * 0.08, '#94a3b8');
    }
    rr(ctx, -r * 0.75, -r * 0.6, r * 1.5, r * 1.2, r * 0.3);
    ctx.fillStyle = '#18181b';
    ctx.fill();
    outline(ctx, '#f43f5e', 1.4);
    angryFace(ctx, 0, -r * 0.05, r * 0.6, time, '#f43f5e');
    if (Math.floor(time / 70) % 9 === 0) {
      ctx.fillStyle = 'rgba(34,211,238,0.6)';
      ctx.fillRect(-r, -r * 0.2, r * 2, r * 0.15);
    }
  },
  // 15 Leaking Toxic Barrel
  (ctx, r, time) => {
    rr(ctx, -r * 0.7, -r * 0.9, r * 1.4, r * 1.8, r * 0.25);
    ctx.fillStyle = vgrad(ctx, -r, r, '#facc15', '#a16207');
    ctx.fill();
    outline(ctx, '#422006', 1.3);
    ctx.fillStyle = '#422006';
    ctx.fillRect(-r * 0.7, -r * 0.45, r * 1.4, r * 0.1);
    ctx.fillRect(-r * 0.7, r * 0.4, r * 1.4, r * 0.1);
    const drip = (time / 18) % (r * 0.8);
    ellipse(ctx, r * 0.3, r * 0.9 + drip, r * 0.1, r * 0.15, '#84cc16');
    ellipse(ctx, 0, -r * 0.9, r * 0.5, r * 0.15, '#84cc16');
    angryFace(ctx, 0, 0, r * 0.55, time, '#bef264');
  },
  // 16 Thunder Cloud
  (ctx, r, time) => {
    for (const [fx, fy, fr] of [[-0.45, 0.05, 0.5], [0, -0.3, 0.6], [0.45, 0.05, 0.5], [0, 0.2, 0.55]]) circle(ctx, r * fx, r * fy, r * fr, '#475569');
    const flash = Math.floor(time / 110) % 6 === 0;
    ctx.fillStyle = flash ? '#fef08a' : '#facc15';
    ctx.beginPath();
    ctx.moveTo(r * 0.05, r * 0.5);
    ctx.lineTo(-r * 0.25, r * 1.1);
    ctx.lineTo(r * 0.02, r * 0.95);
    ctx.lineTo(-r * 0.1, r * 1.45);
    ctx.lineTo(r * 0.3, r * 0.8);
    ctx.lineTo(r * 0.05, r * 0.9);
    ctx.lineTo(r * 0.25, r * 0.5);
    ctx.fill();
    angryFace(ctx, 0, -r * 0.05, r * 0.6, time, '#fef08a');
  },
  // 17 Spiked Cog Bomb
  (ctx, r, time) => {
    const a0 = time / 600;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const a = a0 + (i * Math.PI) / 10;
      const rad = i % 2 ? r * 0.75 : r * 1.0;
      if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
      else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = '#b45309';
    ctx.fill();
    outline(ctx, '#451a03', 1.2);
    circle(ctx, 0, 0, r * 0.6, '#78350f');
    fuse(ctx, 0, -r * 0.9, r, time);
    angryFace(ctx, 0, 0, r * 0.52, time, '#fde68a');
  },
  // 18 Firecracker Bundle
  (ctx, r, time) => {
    for (let i = -1; i <= 1; i++) {
      rr(ctx, i * r * 0.42 - r * 0.2, -r * 0.75, r * 0.4, r * 1.5, r * 0.08);
      ctx.fillStyle = i === 0 ? '#dc2626' : '#b91c1c';
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(i * r * 0.42 - r * 0.2, -r * 0.2, r * 0.4, r * 0.12);
    }
    fuse(ctx, 0, -r * 0.75, r, time);
    angryFace(ctx, 0, r * 0.2, r * 0.55, time, '#fef3c7');
  },
  // 19 Shard Spike
  (ctx, r, time) => {
    const hue = 330 + Math.sin(time / 300) * 20;
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.55;
      ctx.fillStyle = `hsl(${hue}, 80%, ${55 + i * 4}%)`;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.3) * r * 0.5, Math.sin(a - 0.3) * r * 0.5);
      ctx.lineTo(Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.35);
      ctx.lineTo(Math.cos(a + 0.3) * r * 0.5, Math.sin(a + 0.3) * r * 0.5);
      ctx.fill();
    }
    circle(ctx, 0, r * 0.1, r * 0.75, `hsl(${hue}, 70%, 35%)`);
    angryFace(ctx, 0, r * 0.1, r * 0.58, time, '#fbcfe8');
  },
];

// ---------- the 20 base plates ----------

type PlateArt = (ctx: Ctx, hw: number, hh: number, time: number) => void;

function slab(ctx: Ctx, hw: number, hh: number, top: string, bottom: string, edge: string, radius = 6) {
  rr(ctx, -hw, -hh, hw * 2, hh * 2, radius);
  ctx.fillStyle = vgrad(ctx, -hh, hh, top, bottom);
  ctx.fill();
  outline(ctx, edge, 1.4);
}

const PLATES: PlateArt[] = [
  // 0 Mossy Log with flowers
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#a16207', '#713f12', '#422006', hh);
    for (const sx of [-1, 1]) {
      ellipse(ctx, sx * hw * 0.97, 0, hh * 0.35, hh * 0.85, '#d6a35c');
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(sx * hw * 0.97, 0, hh * 0.18, hh * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    rr(ctx, -hw * 0.9, -hh * 1.05, hw * 1.8, hh * 0.45, hh * 0.2);
    ctx.fillStyle = '#4ade80';
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const fx = -hw * 0.75 + (i * hw * 1.5) / 5;
      const sway = Math.sin(time / 500 + i) * 1.2;
      circle(ctx, fx + sway, -hh * 1.15, 2.2, i % 2 ? '#f472b6' : '#fde047');
      circle(ctx, fx + sway, -hh * 1.15, 0.9, '#fff7ed');
    }
  },
  // 1 Lunar Landing Pad
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#e5e7eb', '#9ca3af', '#4b5563', 4);
    ctx.fillStyle = '#facc15';
    for (let i = 0; i < 7; i++) {
      if (i % 2) continue;
      ctx.fillRect(-hw + (i * hw * 2) / 7, -hh, (hw * 2) / 7, hh * 0.3);
    }
    for (const sx of [-1, 1]) {
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx * hw * 0.7, hh);
      ctx.lineTo(sx * hw * 0.95, hh * 1.6);
      ctx.stroke();
    }
    const on = Math.floor(time / 500) % 2 === 0;
    circle(ctx, -hw * 0.85, hh * 0.2, 2, on ? '#22c55e' : '#14532d');
    circle(ctx, hw * 0.85, hh * 0.2, 2, on ? '#14532d' : '#22c55e');
  },
  // 2 Rusty Launch Deck
  (ctx, hw, hh) => {
    slab(ctx, hw, hh, '#c2410c', '#7c2d12', '#431407', 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo((i * hw) / 3.5, -hh);
      ctx.lineTo((i * hw) / 3.5, hh);
      ctx.stroke();
    }
    for (let i = 0; i < 6; i++) circle(ctx, -hw * 0.85 + (i * hw * 1.7) / 5, hh * 0.55, 1.4, '#fdba74');
  },
  // 3 Space Station Ring
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#64748b', '#1e293b', '#0f172a', hh);
    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 8; i++) {
      const on = Math.floor(time / 150 + i) % 8 === 0;
      ctx.globalAlpha = on ? 1 : 0.35;
      ctx.fillRect(-hw * 0.85 + (i * hw * 1.7) / 7, -hh * 0.2, 4, hh * 0.4);
    }
    ctx.globalAlpha = 1;
    ellipse(ctx, 0, hh * 1.1, hw * 0.6, hh * 0.25, 'rgba(56,189,248,0.25)');
  },
  // 4 Giant Clam Shell
  (ctx, hw, hh, time) => {
    ctx.beginPath();
    ctx.moveTo(-hw, -hh * 0.4);
    ctx.quadraticCurveTo(0, hh * 2.2, hw, -hh * 0.4);
    ctx.closePath();
    ctx.fillStyle = vgrad(ctx, -hh, hh * 1.5, '#f9a8d4', '#be185d');
    ctx.fill();
    outline(ctx, '#831843', 1.3);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, hh * 0.9);
      ctx.lineTo((i * hw) / 3.2, -hh * 0.35);
      ctx.stroke();
    }
    rr(ctx, -hw, -hh, hw * 2, hh * 0.65, hh * 0.3);
    ctx.fillStyle = '#fbcfe8';
    ctx.fill();
    circle(ctx, hw * 0.55, -hh * 0.7, hh * 0.25 + Math.sin(time / 400) * 0.5, '#fff7ed');
  },
  // 5 Sandcastle
  (ctx, hw, hh) => {
    slab(ctx, hw, hh, '#fde68a', '#d97706', '#92400e', 3);
    ctx.fillStyle = '#fcd34d';
    for (let i = 0; i < 7; i++) {
      if (i % 2) continue;
      ctx.fillRect(-hw + (i * hw * 2) / 7, -hh * 1.45, (hw * 2) / 7, hh * 0.5);
    }
    ctx.fillStyle = '#78350f';
    rr(ctx, -hw * 0.12, -hh * 0.1, hw * 0.24, hh * 1.1, hw * 0.12);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(hw * 0.8, -hh * 1.45);
    ctx.lineTo(hw * 0.8, -hh * 2.4);
    ctx.lineTo(hw * 0.98, -hh * 2.15);
    ctx.lineTo(hw * 0.8, -hh * 1.95);
    ctx.fill();
  },
  // 6 Obsidian Slab with lava cracks
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#292524', '#0c0a09', '#000000', 4);
    ctx.strokeStyle = `rgba(249,115,22,${0.6 + Math.sin(time / 300) * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.8, -hh * 0.4);
    ctx.lineTo(-hw * 0.4, hh * 0.1);
    ctx.lineTo(-hw * 0.1, -hh * 0.3);
    ctx.lineTo(hw * 0.3, hh * 0.4);
    ctx.lineTo(hw * 0.75, -hh * 0.2);
    ctx.stroke();
  },
  // 7 Castle Battlement
  (ctx, hw, hh) => {
    slab(ctx, hw, hh, '#a8a29e', '#57534e', '#292524', 2);
    ctx.fillStyle = '#a8a29e';
    for (let i = 0; i < 9; i++) {
      if (i % 2) continue;
      ctx.fillRect(-hw + (i * hw * 2) / 9, -hh * 1.5, (hw * 2) / 9, hh * 0.55);
    }
    ctx.strokeStyle = 'rgba(41,37,36,0.5)';
    ctx.lineWidth = 0.8;
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < 6; i++) {
        const x = -hw + (i * hw * 2) / 6 + (row ? hw / 6 : 0);
        ctx.strokeRect(x, -hh + row * hh, (hw * 2) / 6, hh);
      }
    }
  },
  // 8 Giant Leaf
  (ctx, hw, hh) => {
    ctx.beginPath();
    ctx.moveTo(-hw, 0);
    ctx.quadraticCurveTo(0, -hh * 2, hw, 0);
    ctx.quadraticCurveTo(0, hh * 2, -hw, 0);
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#86efac', '#15803d');
    ctx.fill();
    outline(ctx, '#14532d', 1.2);
    ctx.strokeStyle = 'rgba(220,252,231,0.8)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-hw, 0);
    ctx.lineTo(hw, 0);
    for (let i = -2; i <= 2; i++) {
      ctx.moveTo((i * hw) / 3, 0);
      ctx.lineTo((i * hw) / 3 + hw * 0.15, -hh * 0.6);
      ctx.moveTo((i * hw) / 3, 0);
      ctx.lineTo((i * hw) / 3 + hw * 0.15, hh * 0.6);
    }
    ctx.stroke();
  },
  // 9 Sandstone Dune Block with palm
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#fcd34d', '#b45309', '#78350f', 5);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hw * 0.75, -hh);
    ctx.quadraticCurveTo(hw * 0.85, -hh * 2, hw * 0.7, -hh * 2.6);
    ctx.stroke();
    const sway = Math.sin(time / 600) * 0.15;
    for (let i = 0; i < 5; i++) ellipse(ctx, hw * 0.7, -hh * 2.6, hw * 0.18, hh * 0.15, '#16a34a', i * 1.25 + sway);
  },
  // 10 Ice Floe
  (ctx, hw, hh) => {
    ctx.beginPath();
    ctx.moveTo(-hw, -hh * 0.6);
    ctx.lineTo(-hw * 0.6, -hh);
    ctx.lineTo(hw * 0.7, -hh);
    ctx.lineTo(hw, -hh * 0.4);
    ctx.lineTo(hw * 0.85, hh);
    ctx.lineTo(-hw * 0.9, hh);
    ctx.closePath();
    ctx.fillStyle = vgrad(ctx, -hh, hh, '#f0f9ff', '#7dd3fc');
    ctx.fill();
    outline(ctx, '#0369a1', 1.2);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.5, -hh * 0.5);
    ctx.lineTo(-hw * 0.2, hh * 0.3);
    ctx.stroke();
  },
  // 11 Ship Deck Planks
  (ctx, hw, hh) => {
    slab(ctx, hw, hh, '#b45309', '#78350f', '#451a03', 3);
    ctx.strokeStyle = 'rgba(69,26,3,0.6)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-hw, -hh + (i * hh * 2) / 3);
      ctx.lineTo(hw, -hh + (i * hh * 2) / 3);
      ctx.stroke();
    }
    for (const sx of [-1, 1]) {
      circle(ctx, sx * hw * 0.8, 0, hh * 0.35, '#78350f');
      circle(ctx, sx * hw * 0.8, 0, hh * 0.15, '#fbbf24');
    }
  },
  // 12 Wafer & Frosting
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#fcd34d', '#d97706', '#92400e', 4);
    ctx.strokeStyle = 'rgba(146,64,14,0.45)';
    ctx.lineWidth = 0.8;
    for (let i = -6; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo((i * hw) / 6, -hh);
      ctx.lineTo((i * hw) / 6 + hh, hh);
      ctx.stroke();
    }
    ctx.fillStyle = '#f9a8d4';
    ctx.beginPath();
    ctx.moveTo(-hw, -hh);
    for (let i = 0; i <= 8; i++) ctx.quadraticCurveTo(-hw + ((i - 0.5) * hw * 2) / 8, -hh * 0.3, -hw + (i * hw * 2) / 8, -hh * 0.85);
    ctx.lineTo(hw, -hh * 1.2);
    ctx.lineTo(-hw, -hh * 1.2);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = ['#60a5fa', '#facc15', '#4ade80', '#f472b6'][i % 4];
      ctx.fillRect(-hw * 0.85 + (i * hw * 1.7) / 7, -hh * 1.05 + Math.sin(time / 400 + i) * 0.5, 3, 1.2);
    }
  },
  // 13 Golden Pedestal
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#fef08a', '#a16207', '#713f12', 2);
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-hw * 1.05, -hh * 1.2, hw * 2.1, hh * 0.35);
    ctx.fillRect(-hw * 1.05, hh * 0.85, hw * 2.1, hh * 0.35);
    for (let i = 0; i < 3; i++) {
      const tw = Math.abs(Math.sin(time / 300 + i * 2));
      circle(ctx, -hw * 0.6 + i * hw * 0.6, 0, 2.2, i === 1 ? `rgba(239,68,68,${0.6 + tw * 0.4})` : `rgba(16,185,129,${0.6 + tw * 0.4})`);
    }
  },
  // 14 Holo-Pad
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#1e293b', '#020617', '#22d3ee', 4);
    const scan = ((time / 8) % (hw * 2)) - hw;
    ctx.fillStyle = 'rgba(34,211,238,0.4)';
    ctx.fillRect(scan, -hh, 4, hh * 2);
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.9, hh * 0.5);
    ctx.lineTo(hw * 0.9, hh * 0.5);
    ctx.stroke();
    ellipse(ctx, 0, -hh * 1.2, hw * 0.8, hh * 0.2, 'rgba(34,211,238,0.18)');
  },
  // 15 Rusted Grate over sludge
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#57534e', '#292524', '#0c0a09', 3);
    ctx.fillStyle = `rgba(132,204,22,${0.55 + Math.sin(time / 250) * 0.2})`;
    ctx.fillRect(-hw * 0.85, -hh * 0.5, hw * 1.7, hh);
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 2;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo((i * hw) / 4.5, -hh * 0.5);
      ctx.lineTo((i * hw) / 4.5, hh * 0.5);
      ctx.stroke();
    }
  },
  // 16 Floating Island Rock
  (ctx, hw, hh, time) => {
    ctx.beginPath();
    ctx.moveTo(-hw, -hh * 0.3);
    ctx.lineTo(hw, -hh * 0.3);
    ctx.lineTo(hw * 0.5, hh * 1.2);
    ctx.lineTo(0, hh * 2);
    ctx.lineTo(-hw * 0.5, hh * 1.2);
    ctx.closePath();
    ctx.fillStyle = vgrad(ctx, -hh, hh * 2, '#a8a29e', '#44403c');
    ctx.fill();
    outline(ctx, '#292524', 1.2);
    rr(ctx, -hw, -hh, hw * 2, hh * 0.8, hh * 0.35);
    ctx.fillStyle = '#4ade80';
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const y = hh * 1.2 + ((time / 25 + i * 8) % 18);
      circle(ctx, -hw * 0.2 + i * hw * 0.2, y, 1.2, 'rgba(186,230,253,0.7)');
    }
  },
  // 17 Brass Gear Platform
  (ctx, hw, hh, time) => {
    for (const sx of [-1, 1]) {
      const a0 = (sx * time) / 900;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = a0 + (i * Math.PI) / 8;
        const rad = i % 2 ? hh * 0.9 : hh * 1.2;
        if (i === 0) ctx.moveTo(sx * hw * 0.75 + Math.cos(a) * rad, hh * 0.6 + Math.sin(a) * rad);
        else ctx.lineTo(sx * hw * 0.75 + Math.cos(a) * rad, hh * 0.6 + Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fillStyle = '#92400e';
      ctx.fill();
    }
    slab(ctx, hw, hh * 0.7, '#fbbf24', '#b45309', '#78350f', 3);
    for (let i = 0; i < 5; i++) circle(ctx, -hw * 0.8 + (i * hw * 1.6) / 4, 0, 1.6, '#78350f');
  },
  // 18 Shrine Step with petals
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#dc2626', '#7f1d1d', '#450a0a', 2);
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-hw * 1.05, -hh * 1.15, hw * 2.1, hh * 0.35);
    for (let i = 0; i < 5; i++) {
      const px = -hw + ((time / 30 + i * 37) % (hw * 2));
      const py = -hh * 1.6 + Math.sin(time / 300 + i) * 3;
      ellipse(ctx, px, py, 2.2, 1.3, '#fbcfe8', time / 400 + i);
    }
  },
  // 19 Amethyst Geode
  (ctx, hw, hh, time) => {
    slab(ctx, hw, hh, '#57534e', '#292524', '#1c1917', hh);
    rr(ctx, -hw * 0.85, -hh * 0.65, hw * 1.7, hh * 1.3, hh * 0.6);
    ctx.fillStyle = '#4c1d95';
    ctx.fill();
    for (let i = 0; i < 9; i++) {
      const x = -hw * 0.75 + (i * hw * 1.5) / 8;
      const hgt = hh * (0.4 + ((i * 7) % 5) / 8);
      ctx.fillStyle = `hsl(${270 + i * 6}, 80%, ${60 + Math.sin(time / 400 + i) * 8}%)`;
      ctx.beginPath();
      ctx.moveTo(x - 3, hh * 0.5);
      ctx.lineTo(x, hh * 0.5 - hgt * 1.4);
      ctx.lineTo(x + 3, hh * 0.5);
      ctx.fill();
    }
  },
];

// ---------- public entry points ----------

function themeIndex(id: string, prefix: string): number {
  return Math.abs(parseInt((id || '').replace(prefix, '')) || 0) % 20;
}

/** Draws a stackable themed character centred at (0,0) inside a w x h footprint. */
export function drawThemedBlock(
  ctx: Ctx,
  w: number,
  h: number,
  id: string,
  isTower: boolean,
  time: number,
  archetype?: string,
  moodOverride?: ObjectMood
) {
  const t = themeIndex(id, 'skin-');
  const hw = w / 2;
  const hh = h / 2;
  const mood = resolveMood(isTower, moodOverride);
  ctx.save();
  // soft contact shadow so stacked characters read as separate objects
  ellipse(ctx, 0, hh + 1.5, hw * 0.85, 2, 'rgba(0,0,0,0.18)');
  // Special blocks keep their character but change material: gold or shifting crystal
  if (archetype === 'gold_ingot') ctx.filter = 'sepia(1) saturate(3.2) brightness(1.08)';
  else if (archetype === 'prism') ctx.filter = `hue-rotate(${Math.round(time / 8) % 360}deg) saturate(1.6) brightness(1.12)`;
  BLOCKS[t](ctx, hw, hh, time, mood);
  ctx.filter = 'none';
  archetypeOverlay(ctx, hw, hh, archetype, time);
  ctx.restore();
}

/** Draws the world's hazard centred at (0,0) with radius r, plus a danger halo. */
export function drawThemedHazard(ctx: Ctx, r: number, id: string, time: number) {
  const t = themeIndex(id, 'boom-');
  ctx.save();
  const pulse = 0.5 + Math.sin(time / 110) * 0.5;
  ctx.strokeStyle = `rgba(239,68,68,${0.35 + pulse * 0.45})`;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.45, time / 300, time / 300 + Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  HAZARDS[t](ctx, r, time);
  ctx.restore();
}

/** Draws the world's base plate centred at (0,0) inside a w x h box. */
export function drawThemedPlate(ctx: Ctx, w: number, h: number, id: string, time: number) {
  const t = themeIndex(id, 'plate-');
  ctx.save();
  ellipse(ctx, 0, h * 0.75, w * 0.48, h * 0.25, 'rgba(0,0,0,0.25)');
  PLATES[t](ctx, w / 2, h / 2, time);
  ctx.restore();
}

/** Names for the 20 themed sets (block, hazard, plate), matching the art above. */
export const THEMED_SET_NAMES: { block: string; hazard: string; plate: string; blockDesc: string; hazardDesc: string; plateDesc: string }[] = [
  { block: 'Bumble Bee', hazard: 'Angry Wasp', plate: 'Mossy Flower Log', blockDesc: 'A chubby striped bee that buzzes with joy on every perfect landing.', hazardDesc: 'A furious wasp. Never tap it, let it buzz past.', plateDesc: 'A hollow log carpeted in moss and wildflowers.' },
  { block: 'Astronaut', hazard: 'Flaming Meteor', plate: 'Lunar Landing Pad', blockDesc: 'A tiny moonwalker in a gold-rimmed visor.', hazardDesc: 'A blazing space rock with a bad attitude.', plateDesc: 'Striped landing pad with blinking guide lights.' },
  { block: 'Mars Rover', hazard: 'Alien Spore Pod', plate: 'Rusty Launch Deck', blockDesc: 'A plucky six-wheeled rover with a solar panel hat.', hazardDesc: 'A pulsing alien pod covered in tendrils.', plateDesc: 'Riveted iron deck stained red by Martian dust.' },
  { block: 'Little UFO', hazard: 'Plasma Space Mine', plate: 'Space Station Ring', blockDesc: 'A friendly green alien in a saucer with blinking lights.', hazardDesc: 'A spiked mine crackling with plasma.', plateDesc: 'Docking ring with running lights.' },
  { block: 'Sea Turtle', hazard: 'Sea Mine', plate: 'Giant Clam Shell', blockDesc: 'A gentle turtle paddling through the reef.', hazardDesc: 'A rusty naval mine bristling with spikes.', plateDesc: 'A pink clam shell guarding a pearl.' },
  { block: 'Beach Crab', hazard: 'Coconut Bomb', plate: 'Sandcastle', blockDesc: 'A snappy red crab clicking its claws.', hazardDesc: 'A coconut with a lit fuse.', plateDesc: 'A sandcastle wall flying a little flag.' },
  { block: 'Lava Slime', hazard: 'Fireball', plate: 'Obsidian Slab', blockDesc: 'A wobbly blob of molten lava with a big grin.', hazardDesc: 'A roaring ball of fire.', plateDesc: 'Black volcanic glass glowing with lava cracks.' },
  { block: 'Tiny Knight', hazard: 'Catapult Boulder', plate: 'Castle Battlement', blockDesc: 'A brave knight with a red plume.', hazardDesc: 'A siege boulder with a burning fuse.', plateDesc: 'Crenellated stone castle wall.' },
  { block: 'Toadstool', hazard: 'Thorny Bramble', plate: 'Giant Leaf', blockDesc: 'A spotted red mushroom from the enchanted forest.', hazardDesc: 'A ball of thorns and poison berries.', plateDesc: 'A broad green forest leaf.' },
  { block: 'Potted Cactus', hazard: 'Scorpion', plate: 'Sandstone Oasis Block', blockDesc: 'A smiley cactus in a terracotta pot, flower on top.', hazardDesc: 'A desert scorpion with its stinger raised.', plateDesc: 'Sun-baked sandstone with a swaying palm.' },
  { block: 'Penguin', hazard: 'Icicle Bomb', plate: 'Ice Floe', blockDesc: 'A waddling penguin in a red scarf.', hazardDesc: 'A frozen bomb sprouting sharp icicles.', plateDesc: 'A drifting slab of sea ice.' },
  { block: 'Pirate Parrot', hazard: 'Cannonball', plate: 'Ship Deck', blockDesc: 'A loud parrot in a tiny pirate hat.', hazardDesc: 'A black cannonball with a lit fuse.', plateDesc: 'Weathered ship planks with brass portholes.' },
  { block: 'Gummy Bear', hazard: 'Sour Jawbreaker', plate: 'Frosted Wafer', blockDesc: 'A squishy, wobbly gummy bear.', hazardDesc: 'A sour candy bomb with a sprinkle fuse.', plateDesc: 'A crispy wafer with pink frosting and sprinkles.' },
  { block: 'Golden Idol', hazard: 'Cursed Skull', plate: 'Golden Pedestal', blockDesc: 'A gleaming golden idol with an emerald crown.', hazardDesc: 'A glowing cursed skull from the temple.', plateDesc: 'A gem-studded golden altar.' },
  { block: 'Glitch Bot', hazard: 'Virus Drone', plate: 'Holo-Pad', blockDesc: 'A neon robot with a screen face that glitches.', hazardDesc: 'A rogue drone carrying a virus.', plateDesc: 'A scanning hologram pad.' },
  { block: 'Hazmat Duck', hazard: 'Toxic Barrel', plate: 'Rusted Grate', blockDesc: 'A rubber duck in a gas mask.', hazardDesc: 'A leaking barrel of toxic sludge.', plateDesc: 'A rusted grate over glowing sludge.' },
  { block: 'Cloud Sheep', hazard: 'Thunder Cloud', plate: 'Floating Island', blockDesc: 'A fluffy sheep made of clouds.', hazardDesc: 'A grumpy storm cloud throwing lightning.', plateDesc: 'A grassy island floating in the sky.' },
  { block: 'Alarm Clock', hazard: 'Spiked Cog Bomb', plate: 'Brass Gear Platform', blockDesc: 'A brass alarm clock that rings when it panics.', hazardDesc: 'A spinning spiked cog with a fuse.', plateDesc: 'A brass deck turning on clockwork gears.' },
  { block: 'Lucky Cat', hazard: 'Firecracker Bundle', plate: 'Shrine Step', blockDesc: 'A waving lucky cat with a golden bell.', hazardDesc: 'A bundle of firecrackers about to pop.', plateDesc: 'A red shrine step under falling petals.' },
  { block: 'Crystal Sprite', hazard: 'Shard Spike', plate: 'Amethyst Geode', blockDesc: 'A shimmering crystal creature.', hazardDesc: 'A cluster of razor-sharp crystal shards.', plateDesc: 'A split geode full of amethyst.' },
];
