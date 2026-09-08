const fs = require('fs');
let code = fs.readFileSync('src/components/GameBoard.tsx', 'utf8');

code = code.replace(
  "import { renderBlock, renderPlate, getBoomColor } from '../game/themeRenderer';",
  "import { renderBlock, renderPlate, renderBoomParticle } from '../game/themeRenderer';"
);

code = code.replace(
  /ctx\.globalAlpha = Math\.max\(0, p\.life\);[\s\S]*?}\n    }/g,
  `// Delegate particle rendering to themeRenderer
      renderBoomParticle(ctx, { x: p.x, y: p.y, rotation: Math.atan2(p.vy, p.vx), life: p.life, size: p.size, color: p.color, type: p.type }, time, equippedBoomEffect || 'boom-0');
    }`
);

fs.writeFileSync('src/components/GameBoard.tsx', code);
