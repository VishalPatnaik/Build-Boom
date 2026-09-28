const fs = require('fs');
let code = fs.readFileSync('src/components/campaign/MapRenderer.ts', 'utf-8');

// Replace the blending logic
code = code.replace(
  `const preciseZone = Math.max(0, (scrollY || 0) / ZONE_HEIGHT) || 0;
  const currentIdx = Math.max(0, Math.min(ZONE_CONFIGS.length - 1, Math.floor(preciseZone))) || 0;
  const nextIdx = Math.min(ZONE_CONFIGS.length - 1, currentIdx + 1);
  const blend = Math.max(0, Math.min(1, preciseZone - currentIdx)) || 0;
  
  const bgColor = interpolateColor(ZONE_CONFIGS[currentIdx].bg, ZONE_CONFIGS[nextIdx].bg, blend);`,
  `const preciseZone = Math.max(0, (scrollY || 0) / ZONE_HEIGHT) || 0;
  const currentIdx = Math.max(0, Math.min(ZONE_CONFIGS.length - 1, Math.floor(preciseZone))) || 0;
  
  // No early blending. It only changes strictly when you cross into the new zone's banner.
  const bgColor = ZONE_CONFIGS[currentIdx].bg;`
);

fs.writeFileSync('src/components/campaign/MapRenderer.ts', code);
