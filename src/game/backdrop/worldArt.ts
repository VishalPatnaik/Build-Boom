// Painted world artwork: optional, per world, loaded on demand, with procedural fallback.
//
// Drop files into public/world-art/ and list them in public/world-art/manifest.json — no code changes.
// Any world or layer that isn't listed (or fails to load) keeps using the procedural scenery, so the
// game always has something to draw. See docs/WORLD_ART.md for the layer spec and export sizes.
//
// Layers (back to front):
//   sky  — opaque, replaces the procedural sky/backdrop (drawn on the shared background canvas)
//   far  — transparent, distant landscape on the horizon (replaces the procedural far band)
//   mid  — transparent, landmarks just behind the tower (replaces the procedural near band)
//   fore — transparent, ground-level details in front of the terrain, behind the tower
//
// Memory: only the current world and one preloaded neighbour are kept decoded (LRU of 2).

export type ArtLayer = 'sky' | 'far' | 'mid' | 'fore';
export interface WorldArtEntry {
  sky?: string; far?: string; mid?: string; fore?: string;
  /** optional colour grade laid over the whole scene, e.g. { color: '#FFB070', alpha: 0.08 } */
  grade?: { color: string; alpha: number };
}
type Manifest = Record<string, WorldArtEntry>;

const BASE = 'world-art/';
let manifest: Manifest | null = null;
let manifestState: 'idle' | 'loading' | 'ready' | 'missing' = 'idle';

interface Loaded { entry: WorldArtEntry; imgs: Partial<Record<ArtLayer, HTMLImageElement>>; ready: Partial<Record<ArtLayer, boolean>> }
const resident = new Map<number, Loaded>(); // insertion order = LRU order
const MAX_RESIDENT = 2;

function loadManifest() {
  if (manifestState !== 'idle' || typeof fetch === 'undefined') return;
  manifestState = 'loading';
  fetch(`${BASE}manifest.json`, { cache: 'force-cache' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((m: Manifest) => { manifest = m && typeof m === 'object' ? m : {}; manifestState = 'ready'; })
    .catch(() => { manifest = {}; manifestState = 'missing'; });
}

function touch(world: number): Loaded | null {
  loadManifest();
  if (manifestState !== 'ready' || !manifest) return null;
  const entry = manifest[String(world)];
  if (!entry) return null;
  let l = resident.get(world);
  if (l) { resident.delete(world); resident.set(world, l); return l; }
  l = { entry, imgs: {}, ready: {} };
  for (const layer of ['sky', 'far', 'mid', 'fore'] as ArtLayer[]) {
    const src = entry[layer];
    if (!src || typeof Image === 'undefined') continue;
    const img = new Image();
    img.decoding = 'async';
    const rec = l;
    img.onload = () => { rec.ready[layer] = true; };
    img.onerror = () => { rec.ready[layer] = false; };
    img.src = `${BASE}${src}`;
    l.imgs[layer] = img;
  }
  resident.set(world, l);
  while (resident.size > MAX_RESIDENT) {
    const oldest = resident.keys().next().value as number;
    const old = resident.get(oldest);
    if (old) for (const img of Object.values(old.imgs)) if (img) img.src = ''; // let the decoder free it
    resident.delete(oldest);
  }
  return l;
}

/** Start loading a world's art ahead of time (e.g. the next world on the map). */
export function preloadWorldArt(world: number) { touch(world); }

/** The decoded image for a layer, or null if this world/layer has no art (yet) — caller falls back. */
export function worldArtLayer(world: number, layer: ArtLayer): HTMLImageElement | null {
  const l = touch(world);
  if (!l || !l.ready[layer]) return null;
  return l.imgs[layer] || null;
}
export function worldArtGrade(world: number) { return touch(world)?.entry.grade || null; }

/**
 * Draw one transparent layer, scaled to cover the viewport width with a little parallax margin,
 * bottom edge on `bottomY`. `drift` shifts it horizontally (parallax with the camera).
 */
export function drawArtBand(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, bottomY: number, drift: number) {
  const scale = (w * 1.12) / img.naturalWidth;
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  ctx.drawImage(img, (w - dw) / 2 + drift, bottomY - dh, dw, dh);
}

/** Opaque sky: cover the whole viewport, anchored to the bottom so the horizon stays put; sinks slightly as the tower climbs. */
export function drawArtSky(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, sink: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * 1.05;
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  ctx.drawImage(img, (w - dw) / 2, Math.min(0, h - dh + sink * 0.1), dw, dh);
}
