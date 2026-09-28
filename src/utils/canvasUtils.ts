// Canvas Safety & Robustness Utility
// Protects against non-finite (NaN, Infinity, -Infinity) coordinates and negative radii
// that crash CanvasRenderingContext2D in browser engines.

export function safeCreateRadialGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r0: number,
  x1: number,
  y1: number,
  r1: number
): CanvasGradient | null {
  if (!ctx) return null;
  if (
    !Number.isFinite(x0) ||
    !Number.isFinite(y0) ||
    !Number.isFinite(r0) ||
    !Number.isFinite(x1) ||
    !Number.isFinite(y1) ||
    !Number.isFinite(r1) ||
    r0 < 0 ||
    r1 < 0
  ) {
    return null;
  }
  try {
    return ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
  } catch (err) {
    console.warn('safeCreateRadialGradient failed:', err, { x0, y0, r0, x1, y1, r1 });
    return null;
  }
}

export function safeCreateLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): CanvasGradient | null {
  if (!ctx) return null;
  if (
    !Number.isFinite(x0) ||
    !Number.isFinite(y0) ||
    !Number.isFinite(x1) ||
    !Number.isFinite(y1)
  ) {
    return null;
  }
  try {
    return ctx.createLinearGradient(x0, y0, x1, y1);
  } catch (err) {
    console.warn('safeCreateLinearGradient failed:', err, { x0, y0, x1, y1 });
    return null;
  }
}

export function safeArc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  startAngle: number = 0,
  endAngle: number = Math.PI * 2,
  anticlockwise: boolean = false
): boolean {
  if (!ctx || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(r) || r < 0) {
    return false;
  }
  try {
    ctx.arc(x, y, r, startAngle, endAngle, anticlockwise);
    return true;
  } catch {
    return false;
  }
}

export function safeEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rotation: number = 0,
  startAngle: number = 0,
  endAngle: number = Math.PI * 2,
  anticlockwise: boolean = false
): boolean {
  if (
    !ctx ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(rx) ||
    !Number.isFinite(ry) ||
    rx < 0 ||
    ry < 0
  ) {
    return false;
  }
  try {
    ctx.ellipse(x, y, rx, ry, rotation, startAngle, endAngle, anticlockwise);
    return true;
  } catch {
    return false;
  }
}
