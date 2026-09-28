import { drawGameplayReadabilityBackdrop, setActiveParallax, ParallaxState } from './worldUtils';
import { renderSpringMeadow, renderAutumnMeadow, renderSunsetMeadow } from './meadows';
import { renderMoon, renderMars, renderDeepSpace } from './spaceAndPlanets';
import { renderWinter, renderBeach, renderVolcano } from './natureAndElements';
import { renderCastle, renderEnchantedForest, renderPirate } from './fantasyAndKingdoms';
import { renderCandyland, renderGoldenLegend, renderCyberpunk } from './exoticRealms';
import {
  renderAbyssalCoral,
  renderGoldenDesert,
  renderToxicWasteland,
  renderFloatingIslands,
  renderClockwork,
  renderSakuraShrine,
  renderCrystallineCore,
} from './otherWorlds';

export function renderCinematicWorld(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: string,
  time: number,
  isPreview: boolean = false,
  parallax?: ParallaxState
) {
  if (!ctx || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return;
  }
  const cleanId = (id || '').toLowerCase();
  const t = Math.abs(parseInt(cleanId.replace('bg-', '').replace('campaign-', '')) || 0) % 20;

  ctx.save();
  if (parallax) {
    setActiveParallax(parallax);
  }

  // Keyword check for special biome variations
  if (cleanId.includes('autumn')) {
    renderAutumnMeadow(ctx, w, h, time);
  } else if (cleanId.includes('sunset-meadow')) {
    renderSunsetMeadow(ctx, w, h, time);
  } else {
    switch (t) {
      case 0:
        renderSpringMeadow(ctx, w, h, time);
        break;
      case 1:
        renderMoon(ctx, w, h, time);
        break;
      case 2:
        renderMars(ctx, w, h, time);
        break;
      case 3:
        renderDeepSpace(ctx, w, h, time);
        break;
      case 4:
        renderAbyssalCoral(ctx, w, h, time);
        break;
      case 5:
        renderBeach(ctx, w, h, time);
        break;
      case 6:
        renderVolcano(ctx, w, h, time);
        break;
      case 7:
        renderCastle(ctx, w, h, time);
        break;
      case 8:
        renderEnchantedForest(ctx, w, h, time);
        break;
      case 9:
        renderGoldenDesert(ctx, w, h, time);
        break;
      case 10:
        renderWinter(ctx, w, h, time);
        break;
      case 11:
        renderPirate(ctx, w, h, time);
        break;
      case 12:
        renderCandyland(ctx, w, h, time);
        break;
      case 13:
        renderGoldenLegend(ctx, w, h, time);
        break;
      case 14:
        renderCyberpunk(ctx, w, h, time);
        break;
      case 15:
        renderToxicWasteland(ctx, w, h, time);
        break;
      case 16:
        renderFloatingIslands(ctx, w, h, time);
        break;
      case 17:
        renderClockwork(ctx, w, h, time);
        break;
      case 18:
        renderSakuraShrine(ctx, w, h, time);
        break;
      case 19:
      default:
        renderCrystallineCore(ctx, w, h, time);
        break;
    }
  }

  // Ensure gameplay readability and clean contrast
  drawGameplayReadabilityBackdrop(ctx, w, h);

  if (parallax) {
    setActiveParallax(null);
  }

  ctx.restore();
}
