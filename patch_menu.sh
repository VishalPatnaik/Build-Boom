#!/bin/bash
sed -i "s/const coins = useGameStore((s) => s.coins);/const coins = useGameStore((s) => s.coins);\n  const highScores = useGameStore((s) => s.highScores);/g" src/components/Menu.tsx

sed -i "s/<\/span>\n          <\/div>\n        <\/motion.button>\n\n        {\/\* DAILY/<\/span>\n            <div className=\"text-[10px] font-bold text-white\/80 -mt-1\">BEST: {highScores['endless'] || 0}<\/div>\n          <\/div>\n        <\/motion.button>\n\n        {\/\* DAILY/g" src/components/Menu.tsx
