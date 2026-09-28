const fs = require('fs');
let code = fs.readFileSync('src/components/PlayfulBackground.tsx', 'utf-8');
code = code.replace(
  `const zone = Math.floor((state.level - 1) / 2);\n         bgStyle = \`bg-\${zone}\`;`,
  `const zone = Math.floor((state.level - 1) / 10);\n         bgStyle = \`campaign-\${zone}\`;`
);
fs.writeFileSync('src/components/PlayfulBackground.tsx', code);
