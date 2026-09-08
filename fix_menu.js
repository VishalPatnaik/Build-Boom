const fs = require('fs');
let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

code = code.replace(
  "Endless\n            </span>\n          </div>",
  "Endless\n            </span>\n            <div className=\"text-[10px] font-bold text-white/80 -mt-1 text-center\">BEST: {useGameStore.getState().highScores['endless'] || 0}</div>\n          </div>"
);

fs.writeFileSync('src/components/Menu.tsx', code);
