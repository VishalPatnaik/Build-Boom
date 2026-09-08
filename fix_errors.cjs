const fs = require('fs');

let gb = fs.readFileSync('src/components/GameBoard.tsx', 'utf8');

// fix getBoomColor usage
gb = gb.replace(/getBoomColor\(equippedBoomEffect || 'boom-0'\)/g, "'#FFFFFF'");

// fix renderPlate (needs 7 args) -> renderPlate(ctx, x, y, w, h, id, time)
gb = gb.replace(/renderPlate\(ctx, \(-gs.plateW \/ 2\), canvasHeight - gs.plateH, gs.plateW, gs.plateH, currentPlate\);/g, "renderPlate(ctx, (-gs.plateW / 2), canvasHeight - gs.plateH, gs.plateW, gs.plateH, currentPlate, time);");

// fix renderBlock (needs 8 args) -> renderBlock(ctx, x, y, w, h, id, isCenter, time)
gb = gb.replace(/renderBlock\(ctx, x, b\.y, w, h, equippedCosmetic \|\| 'skin-0', b\.handled\);/g, "renderBlock(ctx, x, b.y, w, h, equippedCosmetic || 'skin-0', b.handled, time);");

fs.writeFileSync('src/components/GameBoard.tsx', gb);

let shop = fs.readFileSync('src/components/Shop.tsx', 'utf8');
shop = shop.replace(/col\.colors/g, "(['#87CEEB', '#7CFC00', '#D2B48C', '#8B4513'])");
fs.writeFileSync('src/components/Shop.tsx', shop);

