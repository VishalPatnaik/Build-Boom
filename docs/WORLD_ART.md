# World artwork — layer spec and integration

All 20 worlds currently use code-drawn scenery. Painted artwork can be dropped in per world, per layer,
with no code changes; anything missing falls back to the procedural scenery automatically.

## How to add art for a world

1. Put the files in `public/world-art/` (e.g. `public/world-art/w00/mid.webp`).
2. List them in `public/world-art/manifest.json`, keyed by world index (0–19):

```json
{
  "0": { "sky": "w00/sky.webp", "far": "w00/far.webp", "mid": "w00/mid.webp", "fore": "w00/fore.webp",
         "grade": { "color": "#F5D77A", "alpha": 0.06 } }
}
```

Every field is optional. A world with only `mid` gets painted landmarks and keeps the procedural sky.

## Layers

| Layer | Replaces | Transparency | Export size | Decoded memory |
|---|---|---|---|---|
| `sky` | the procedural sky / backdrop | opaque (WebP, no alpha) | 720 × 1600 | ~4.6 MB |
| `far` | far horizon band | alpha (WebP with alpha) | 1600 × 900 | ~5.8 MB |
| `mid` | landmark band behind the tower | alpha | 1600 × 800 | ~5.1 MB |
| `fore` | ground-level details in front of the terrain, behind the tower | alpha | 1600 × 500 | ~3.2 MB |

Why these sizes: a Galaxy S24 Ultra is ~384 CSS px wide at ~3.75 DPR (≈1440 physical px). 1600 px wide
covers that plus the 12 % parallax margin. The sky is soft and full-screen, so half resolution upscales
cleanly and saves ~14 MB per world. A full 1440 × 3200 RGBA layer would be ~18 MB decoded; four of
them per world is too much for mid-range phones.

Memory: only the current world and one neighbour stay decoded (LRU of 2 → ≤ ~38 MB of art).
`preloadWorldArt(n)` warms the next world before you get there.

## Composition rules (so art matches the procedural pipeline and the critters)

- Key light from the **upper left**; cool shadow toward the lower right. Critters are lit the same way.
- `far` and `mid`: the **bottom edge is the ground line**. Keep the bottom 6–8 % solid, because it sits
  behind the terrain. Don't paint sky in these layers.
- Keep the **centre 40 % of the width** low and uncluttered. The tower and incoming blocks live there.
- Atmospheric perspective: `far` should be low-contrast and pulled toward the world's haze colour.
- No text, logos, characters or UI in the art. No photos or unrelated stock imagery.
- Palette: use the world's grading in `src/game/backdrop/midground.ts` (`LOOKS`) and the brief.

## Where it's wired

- `src/game/backdrop/worldArt.ts`: manifest loading, LRU cache, preloading, draw helpers.
- `src/game/backdrop/midground.ts`: far/mid bands (art first, procedural fallback). Shared by
  gameplay, Home, the Shop stage and (re-inked) the Shift Odyssey map.
- `src/components/PlayfulBackground.tsx`: `sky` + colour grade.
- `src/components/GameBoard.tsx`: `fore`.
