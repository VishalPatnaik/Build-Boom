const fs = require('fs');

let defs = fs.readFileSync('src/components/campaign/WorldDefinitions.ts', 'utf-8');
defs = defs.replace(
  `"Candyland", "Golden Legend", "Cyberpunk"`,
  `"Candyland", "Golden Legend", "Cyberpunk", "Toxic Waste", "Abyssal Depths", "Sky Islands", "Clockwork", "The Core"`
);
fs.writeFileSync('src/components/campaign/WorldDefinitions.ts', defs);

let sel = fs.readFileSync('src/components/LevelSelect.tsx', 'utf-8');
sel = sel.replace('const TOTAL_LEVELS = 30;', 'const TOTAL_LEVELS = 200;');
sel = sel.replace('const LEVELS_PER_ZONE = 2;', 'const LEVELS_PER_ZONE = 10;');
fs.writeFileSync('src/components/LevelSelect.tsx', sel);
