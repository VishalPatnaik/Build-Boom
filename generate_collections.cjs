const fs = require('fs');

const THEMES = [
  { name: 'Meadow', world: 'Grassy Meadow', block: 'Flying Bee', boom: 'Acorn Burst', plate: 'Grass Platform' },
  { name: 'Moon', world: 'Lunar Surface', block: 'Moon Emoji', boom: 'Black Hole', plate: 'Moon Rock' },
  { name: 'Mars', world: 'Martian Landscape', block: 'Flying Insect', boom: 'Meteor', plate: 'Martian Rock' },
  { name: 'Deep Space', world: 'Nebula', block: 'UFO', boom: 'Cosmic Burst', plate: 'Space Platform' },
  { name: 'Ocean', world: 'Underwater', block: 'Jellyfish', boom: 'Water Splash', plate: 'Coral' },
  { name: 'Beach', world: 'Sunny Beach', block: 'Rubber Duck', boom: 'Beach Ball Burst', plate: 'Surfboard' },
  { name: 'Volcano', world: 'Lava Landscape', block: 'Lava Slime', boom: 'Magma Burst', plate: 'Obsidian' },
  { name: 'Lunar Temple', world: 'Lunar Temple', block: 'Floating Lantern', boom: 'Moonbeam', plate: 'Temple Tile' },
  { name: 'Enchanted Forest', world: 'Magical Forest', block: 'Mushroom Creature', boom: 'Magic Burst', plate: 'Tree Stump' },
  { name: 'Desert', world: 'Dunes', block: 'Tumbleweed', boom: 'Sandstorm', plate: 'Sandstone' },
  { name: 'Castle', world: 'Fantasy Castle', block: 'Knight Shield', boom: 'Dragon Fire', plate: 'Castle Stone' },
  { name: 'Sky Islands', world: 'Floating Islands', block: 'Cloud Creature', boom: 'Lightning', plate: 'Cloud Platform' },
  { name: 'Robot City', world: 'Futuristic City', block: 'Battery', boom: 'Glitch', plate: 'Metal Platform' },
  { name: 'Modern City', world: 'Urban Streets', block: 'Coffee Cup', boom: 'Traffic Hazard', plate: 'Road Platform' },
  { name: 'Candy World', world: 'Candy Landscape', block: 'Gummy Bear', boom: 'Candy Burst', plate: 'Chocolate Wafer' },
  { name: 'Cyber World', world: 'Gridscape', block: 'Floppy Disk', boom: 'Data Breach', plate: 'Circuit Board' },
  { name: 'Toy World', world: 'Toy Room', block: 'Wind-up Mouse', boom: 'Exploding Toy', plate: 'Toy Construction' },
  { name: 'Prehistoric', world: 'Dinosaur Era', block: 'Dino Egg', boom: 'Amber Burst', plate: 'Fossil Rock' },
  { name: 'Sakura World', world: 'Cherry Blossoms', block: 'Origami Crane', boom: 'Firecracker', plate: 'Shrine Platform' },
  { name: 'Pirate World', world: 'Pirate Island', block: 'Treasure Chest', boom: 'Cannonball', plate: 'Ship Deck' },
  { name: 'Laboratory', world: 'Science Lab', block: 'Test Tube Creature', boom: 'Chemical Reaction', plate: 'Lab Table' },
  { name: 'Haunted World', world: 'Spooky Night', block: 'Spooky Eyeball', boom: 'Ectoplasm Burst', plate: 'Graveyard Stone' },
  { name: 'Carnival Dream', world: 'Surreal Carnival', block: 'Balloon Animal', boom: 'Confetti Explosion', plate: 'Carousel Floor' },
  { name: 'Golden Legend', world: 'Golden Kingdom', block: 'Golden Crown', boom: 'Crystal Blast', plate: 'Golden Platform' },
];

const PRICING = [
  { block: 0, plate: 0, boom: 0, world: 0, isAd: false, req: 0 }, // 1
  { block: 0, plate: 0, boom: 0, world: 0, isAd: false, req: 0 }, // 2
  { block: 0, plate: 0, boom: 0, world: 0, isAd: false, req: 0 }, // 3
  { block: 0, plate: 0, boom: 0, world: 0, isAd: true, req: 0 }, // 4
  { block: 0, plate: 0, boom: 0, world: 0, isAd: true, req: 0 }, // 5
  { block: 0, plate: 0, boom: 0, world: 0, isAd: true, req: 0 }, // 6
  { block: 50, plate: 100, boom: 150, world: 250, isAd: false, req: 0 }, // 7
  { block: 150, plate: 300, boom: 500, world: 750, isAd: false, req: 15 }, // 8 (Lvl 15)
  { block: 0, plate: 0, boom: 0, world: 0, isAd: true, req: 0 }, // 9
  { block: 100, plate: 200, boom: 300, world: 500, isAd: false, req: 0 }, // 10
  { block: 0, plate: 0, boom: 0, world: 0, isAd: true, req: 0 }, // 11
  { block: 150, plate: 300, boom: 450, world: 750, isAd: false, req: 0 }, // 12
  { block: 0, plate: 0, boom: 0, world: 0, isAd: true, req: 0 }, // 13
  { block: 200, plate: 400, boom: 600, world: 1000, isAd: false, req: 0 }, // 14
  { block: 250, plate: 500, boom: 750, world: 1250, isAd: false, req: 0 }, // 15
  { block: 400, plate: 800, boom: 1200, world: 2000, isAd: false, req: 24 }, // 16 (Lvl 24)
  { block: 0, plate: 0, boom: 0, world: 0, isAd: true, req: 0 }, // 17
  { block: 300, plate: 600, boom: 900, world: 1500, isAd: false, req: 0 }, // 18
  { block: 0, plate: 0, boom: 0, world: 0, isAd: true, req: 0 }, // 19
  { block: 400, plate: 800, boom: 1200, world: 2000, isAd: false, req: 0 }, // 20
  { block: 0, plate: 0, boom: 0, world: 0, isAd: true, req: 0 }, // 21
  { block: 500, plate: 1000, boom: 1500, world: 2500, isAd: false, req: 0 }, // 22
  { block: 600, plate: 1200, boom: 1800, world: 3000, isAd: false, req: 0 }, // 23
  { block: 1500, plate: 2000, boom: 3500, world: 5000, isAd: false, req: 50 }, // 24 (Lvl 50)
];

let collectionsContent = `export type CosmeticCategory = 'skin' | 'background' | 'boom' | 'plate';

export interface CosmeticDef {
  id: string;
  name: string;
  type: CosmeticCategory;
  price: number;
  req: number;
  desc: string;
  isAd?: boolean;
  themeIdx: number; // to link to the rendering logic
}

export interface CollectionDef {
  id: string;
  name: string;
  world: CosmeticDef;
  block: CosmeticDef;
  boom: CosmeticDef;
  plate: CosmeticDef;
  isPremium?: boolean;
}

export const COLLECTIONS: CollectionDef[] = [
`;

THEMES.forEach((t, i) => {
  const p = PRICING[i];
  const colId = `col-${i}`;
  const isPremium = i === 7 || i === 15 || i === 23;
  
  collectionsContent += `  {
    id: '${colId}', name: '${t.name}', isPremium: ${isPremium},
    world: { id: 'bg-${i}', name: '${t.world}', type: 'background', price: ${p.world}, req: ${p.req}, desc: '${t.world} environment.', isAd: ${p.isAd}, themeIdx: ${i} },
    block: { id: 'skin-${i}', name: '${t.block}', type: 'skin', price: ${p.block}, req: ${p.req}, desc: '${t.block} character.', isAd: ${p.isAd}, themeIdx: ${i} },
    boom: { id: 'boom-${i}', name: '${t.boom}', type: 'boom', price: ${p.boom}, req: ${p.req}, desc: '${t.boom} hazard.', isAd: ${p.isAd}, themeIdx: ${i} },
    plate: { id: 'plate-${i}', name: '${t.plate}', type: 'plate', price: ${p.plate}, req: ${p.req}, desc: '${t.plate} platform.', isAd: ${p.isAd}, themeIdx: ${i} },
  },
`;
});

collectionsContent += `];

export const ALL_COSMETICS: CosmeticDef[] = COLLECTIONS.flatMap(c => [c.world, c.block, c.boom, c.plate]);
`;

fs.writeFileSync('src/game/collections.ts', collectionsContent);
