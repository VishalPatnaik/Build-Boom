const fs = require('fs');

const file = 'src/game/collections.ts';
let code = fs.readFileSync(file, 'utf-8');

// Function to replace req: X with req: Y
function replaceReq(code, themeIdx, newReq) {
  // Regex to match themeIdx and update its req
  const regex = new RegExp(`req: \\d+, desc: '.*?', isAd: (true|false), themeIdx: ${themeIdx}`, 'g');
  // Wait, req is before desc. Let's use a simpler replace
  // Just parse the file or use a simpler regex
  return code;
}

// Since JS regex might be tricky, let's just do a series of replaces for each themeIdx
let newCode = code;
for (let i = 0; i <= 14; i++) {
  let reqLevel = i * 10 + 1; // 1, 11, 21, 31...
  if (i === 14 && newCode.includes(`themeIdx: 14`)) {
    // Leave cyberpunk as 0 or 141? The user said "every realm will unlock that own set realm"
    reqLevel = 141; 
  }
  
  // We need to match lines like:
  // world: { id: 'bg-1', name: 'Autumn Meadow', type: 'background', price: 120, req: 2, desc: 'Crisp orange world.', isAd: false, themeIdx: 1 },
  // And replace `req: \d+` with `req: ${reqLevel}`
  
  // A regex to find req: \d+ on lines that have themeIdx: i
  const regex = new RegExp(`req: \\d+(.*?)themeIdx: ${i} }`, 'g');
  newCode = newCode.replace(regex, `req: ${reqLevel}$1themeIdx: ${i} }`);
}

fs.writeFileSync(file, newCode);
console.log('Fixed reqs');
