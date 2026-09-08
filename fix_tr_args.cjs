const fs = require('fs');

let tr = fs.readFileSync('src/game/themeRenderer.ts', 'utf8');

tr = tr.replace(/export function getBoomColor.*?\n}/s, "");

// Add getBoomColor back just in case
tr += `\nexport function getBoomColor(id: string) { return '#FFFFFF'; }\n`;

fs.writeFileSync('src/game/themeRenderer.ts', tr);

let gb = fs.readFileSync('src/components/GameBoard.tsx', 'utf8');
gb = gb.replace(/import { renderBlock, renderPlate, renderBoomParticle } from '\.\.\/game\/themeRenderer';/g, "import { renderBlock, renderPlate, renderBoomParticle, getBoomColor } from '../game/themeRenderer';");
fs.writeFileSync('src/components/GameBoard.tsx', gb);
