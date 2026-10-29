import { drawThemedBlock, ObjectMood } from '../themedObjects';

/**
 * Themed stackable characters (one per world). The art lives in themedObjects.ts;
 * this wrapper keeps the original entry point used across the app.
 */
export function renderCinematicBlock(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: string,
  isCenter: boolean,
  time: number,
  archetype?: string,
  mood?: ObjectMood
) {
  drawThemedBlock(ctx, w, h, id, isCenter, time, archetype, mood);
}
