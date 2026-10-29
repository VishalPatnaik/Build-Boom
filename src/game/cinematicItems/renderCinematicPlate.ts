import { drawThemedPlate } from '../themedObjects';

/** Themed base plates (one per world). Art lives in themedObjects.ts. */
export function renderCinematicPlate(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: string,
  time: number
) {
  drawThemedPlate(ctx, w, h, id, time);
}
