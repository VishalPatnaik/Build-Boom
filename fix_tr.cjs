const fs = require('fs');
let code = fs.readFileSync('src/game/themeRenderer.ts', 'utf8');

code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/game/themeRenderer.ts', code);
