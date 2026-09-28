const fs = require('fs');

const file = 'src/game/collections.ts';
let code = fs.readFileSync(file, 'utf-8');

const missingCollections = `
  {
    id: 'col-15', name: 'Toxic Waste', isPremium: true,
    world: { id: 'bg-15', name: 'Toxic Waste', type: 'background', price: 8500, req: 151, desc: 'A hazardous wasteland.', isAd: false, themeIdx: 15 },
    block: { id: 'skin-15', name: 'Barrel', type: 'skin', price: 3500, req: 151, desc: 'Toxic Barrel skin.', isAd: false, themeIdx: 15 },
    boom: { id: 'boom-15', name: 'Acid Drop', type: 'boom', price: 6000, req: 151, desc: 'Acid Drop hazard.', isAd: false, themeIdx: 15 },
    plate: { id: 'plate-15', name: 'Grate', type: 'plate', price: 3000, req: 151, desc: 'Metal Grate plate.', isAd: false, themeIdx: 15 },
  },
  {
    id: 'col-16', name: 'Abyssal Depths', isPremium: true,
    world: { id: 'bg-16', name: 'Abyssal Depths', type: 'background', price: 10000, req: 161, desc: 'Deep ocean trenches.', isAd: false, themeIdx: 16 },
    block: { id: 'skin-16', name: 'Anglerfish', type: 'skin', price: 4000, req: 161, desc: 'Anglerfish skin.', isAd: false, themeIdx: 16 },
    boom: { id: 'boom-16', name: 'Mine', type: 'boom', price: 7000, req: 161, desc: 'Sea Mine hazard.', isAd: false, themeIdx: 16 },
    plate: { id: 'plate-16', name: 'Coral', type: 'plate', price: 3500, req: 161, desc: 'Coral plate.', isAd: false, themeIdx: 16 },
  },
  {
    id: 'col-17', name: 'Sky Islands', isPremium: true,
    world: { id: 'bg-17', name: 'Sky Islands', type: 'background', price: 12000, req: 171, desc: 'Floating lands in the clouds.', isAd: false, themeIdx: 17 },
    block: { id: 'skin-17', name: 'Zeppelin', type: 'skin', price: 5000, req: 171, desc: 'Zeppelin skin.', isAd: false, themeIdx: 17 },
    boom: { id: 'boom-17', name: 'Tornado', type: 'boom', price: 8500, req: 171, desc: 'Tornado hazard.', isAd: false, themeIdx: 17 },
    plate: { id: 'plate-17', name: 'Cloud', type: 'plate', price: 4500, req: 171, desc: 'Cloud plate.', isAd: false, themeIdx: 17 },
  },
  {
    id: 'col-18', name: 'Clockwork', isPremium: true,
    world: { id: 'bg-18', name: 'Clockwork', type: 'background', price: 15000, req: 181, desc: 'A mechanical universe.', isAd: false, themeIdx: 18 },
    block: { id: 'skin-18', name: 'Gear', type: 'skin', price: 6000, req: 181, desc: 'Bronze Gear skin.', isAd: false, themeIdx: 18 },
    boom: { id: 'boom-18', name: 'Sawblade', type: 'boom', price: 10000, req: 181, desc: 'Sawblade hazard.', isAd: false, themeIdx: 18 },
    plate: { id: 'plate-18', name: 'Cog', type: 'plate', price: 5500, req: 181, desc: 'Cog plate.', isAd: false, themeIdx: 18 },
  },
  {
    id: 'col-19', name: 'The Core', isPremium: true,
    world: { id: 'bg-19', name: 'The Core', type: 'background', price: 20000, req: 191, desc: 'The center of everything.', isAd: false, themeIdx: 19 },
    block: { id: 'skin-19', name: 'Plasma Core', type: 'skin', price: 8000, req: 191, desc: 'Plasma Core skin.', isAd: false, themeIdx: 19 },
    boom: { id: 'boom-19', name: 'Supernova', type: 'boom', price: 15000, req: 191, desc: 'Supernova hazard.', isAd: false, themeIdx: 19 },
    plate: { id: 'plate-19', name: 'Singularity', type: 'plate', price: 7500, req: 191, desc: 'Singularity plate.', isAd: false, themeIdx: 19 },
  },
];`;

if (!code.includes('Toxic Waste')) {
  code = code.replace('];\n\nexport const ALL_COSMETICS', missingCollections + '\n\nexport const ALL_COSMETICS');
  fs.writeFileSync(file, code);
  console.log('Added missing collections');
} else {
  console.log('Already added');
}
