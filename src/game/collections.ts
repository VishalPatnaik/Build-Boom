export interface CosmeticDef {
  id: string;
  name: string;
  type: 'skin' | 'boom' | 'background' | 'plate';
  price: number;
  req: number;
  desc: string;
  isAd: boolean;
  themeIdx: number;
}

export interface CollectionDef {
  id: string;
  name: string;
  isPremium: boolean;
  world: CosmeticDef;
  block: CosmeticDef;
  boom: CosmeticDef;
  plate: CosmeticDef;
}

export const COLLECTIONS: CollectionDef[] = [
  {
    id: 'col-0', name: 'Spring Meadow', isPremium: false,
    world: { id: 'bg-0', name: 'Spring Meadow', type: 'background', price: 0, req: 0, desc: 'Lush green world.', isAd: false, themeIdx: 0 },
    block: { id: 'skin-0', name: 'Grass', type: 'skin', price: 0, req: 0, desc: 'Grass skin.', isAd: false, themeIdx: 0 },
    boom: { id: 'boom-0', name: 'Apple', type: 'boom', price: 0, req: 0, desc: 'Apple hazard.', isAd: false, themeIdx: 0 },
    plate: { id: 'plate-0', name: 'Grass Block', type: 'plate', price: 0, req: 0, desc: 'Grass Block plate.', isAd: false, themeIdx: 0 },
  },
  {
    id: 'col-1', name: 'Autumn Meadow', isPremium: false,
    world: { id: 'bg-1', name: 'Autumn Meadow', type: 'background', price: 120, req: 2, desc: 'Crisp orange world.', isAd: false, themeIdx: 1 },
    block: { id: 'skin-1', name: 'Amber Bee', type: 'skin', price: 60, req: 2, desc: 'Amber Bee skin.', isAd: false, themeIdx: 1 },
    boom: { id: 'boom-1', name: 'Pinecone', type: 'boom', price: 80, req: 2, desc: 'Pinecone hazard.', isAd: false, themeIdx: 1 },
    plate: { id: 'plate-1', name: 'Autumn Grass', type: 'plate', price: 50, req: 2, desc: 'Autumn Grass plate.', isAd: false, themeIdx: 1 },
  },
  {
    id: 'col-2', name: 'Winter Meadow', isPremium: false,
    world: { id: 'bg-2', name: 'Winter Meadow', type: 'background', price: 180, req: 3, desc: 'Snowy world.', isAd: false, themeIdx: 2 },
    block: { id: 'skin-2', name: 'Frost Bee', type: 'skin', price: 90, req: 3, desc: 'Frost Bee skin.', isAd: false, themeIdx: 2 },
    boom: { id: 'boom-2', name: 'Snowball', type: 'boom', price: 120, req: 3, desc: 'Snowball hazard.', isAd: false, themeIdx: 2 },
    plate: { id: 'plate-2', name: 'Snow Block', type: 'plate', price: 75, req: 3, desc: 'Snow Block plate.', isAd: false, themeIdx: 2 },
  },
  {
    id: 'col-3', name: 'Sunset Meadow', isPremium: false,
    world: { id: 'bg-3', name: 'Sunset Meadow', type: 'background', price: 250, req: 5, desc: 'Golden hour world.', isAd: false, themeIdx: 3 },
    block: { id: 'skin-3', name: 'Dusk Bee', type: 'skin', price: 120, req: 5, desc: 'Dusk Bee skin.', isAd: false, themeIdx: 3 },
    boom: { id: 'boom-3', name: 'Lantern', type: 'boom', price: 160, req: 5, desc: 'Lantern hazard.', isAd: false, themeIdx: 3 },
    plate: { id: 'plate-3', name: 'Dusk Block', type: 'plate', price: 100, req: 5, desc: 'Dusk Block plate.', isAd: false, themeIdx: 3 },
  },
  {
    id: 'col-4', name: 'Moon', isPremium: false,
    world: { id: 'bg-4', name: 'Moon', type: 'background', price: 400, req: 7, desc: 'Crater-filled world.', isAd: false, themeIdx: 4 },
    block: { id: 'skin-4', name: 'Astronaut', type: 'skin', price: 180, req: 7, desc: 'Astronaut skin.', isAd: false, themeIdx: 4 },
    boom: { id: 'boom-4', name: 'Meteor', type: 'boom', price: 250, req: 7, desc: 'Meteor hazard.', isAd: false, themeIdx: 4 },
    plate: { id: 'plate-4', name: 'Landing Pad', type: 'plate', price: 150, req: 7, desc: 'Landing Pad plate.', isAd: false, themeIdx: 4 },
  },
  {
    id: 'col-5', name: 'Mars', isPremium: false,
    world: { id: 'bg-5', name: 'Mars', type: 'background', price: 600, req: 10, desc: 'Red dusty world.', isAd: false, themeIdx: 5 },
    block: { id: 'skin-5', name: 'Rover', type: 'skin', price: 250, req: 10, desc: 'Rover skin.', isAd: false, themeIdx: 5 },
    boom: { id: 'boom-5', name: 'Laser', type: 'boom', price: 400, req: 10, desc: 'Laser hazard.', isAd: false, themeIdx: 5 },
    plate: { id: 'plate-5', name: 'Rusty Metal', type: 'plate', price: 200, req: 10, desc: 'Rusty Metal plate.', isAd: false, themeIdx: 5 },
  },
  {
    id: 'col-6', name: 'Beach', isPremium: false,
    world: { id: 'bg-6', name: 'Beach', type: 'background', price: 850, req: 14, desc: 'Sandy shores world.', isAd: false, themeIdx: 6 },
    block: { id: 'skin-6', name: 'Crab', type: 'skin', price: 350, req: 14, desc: 'Crab skin.', isAd: false, themeIdx: 6 },
    boom: { id: 'boom-6', name: 'Coconut', type: 'boom', price: 550, req: 14, desc: 'Coconut hazard.', isAd: false, themeIdx: 6 },
    plate: { id: 'plate-6', name: 'Sandcastle', type: 'plate', price: 300, req: 14, desc: 'Sandcastle plate.', isAd: false, themeIdx: 6 },
  },
  {
    id: 'col-7', name: 'Volcano', isPremium: false,
    world: { id: 'bg-7', name: 'Volcano', type: 'background', price: 1200, req: 18, desc: 'Erupting magma world.', isAd: false, themeIdx: 7 },
    block: { id: 'skin-7', name: 'Slime', type: 'skin', price: 500, req: 18, desc: 'Slime skin.', isAd: false, themeIdx: 7 },
    boom: { id: 'boom-7', name: 'Fireball', type: 'boom', price: 800, req: 18, desc: 'Fireball hazard.', isAd: false, themeIdx: 7 },
    plate: { id: 'plate-7', name: 'Obsidian', type: 'plate', price: 400, req: 18, desc: 'Obsidian plate.', isAd: false, themeIdx: 7 },
  },
  {
    id: 'col-8', name: 'Castle', isPremium: false,
    world: { id: 'bg-8', name: 'Castle', type: 'background', price: 1600, req: 22, desc: 'Medieval world.', isAd: false, themeIdx: 8 },
    block: { id: 'skin-8', name: 'Knight', type: 'skin', price: 700, req: 22, desc: 'Knight skin.', isAd: false, themeIdx: 8 },
    boom: { id: 'boom-8', name: 'Catapult Rock', type: 'boom', price: 1050, req: 22, desc: 'Catapult Rock hazard.', isAd: false, themeIdx: 8 },
    plate: { id: 'plate-8', name: 'Battlement', type: 'plate', price: 550, req: 22, desc: 'Battlement plate.', isAd: false, themeIdx: 8 },
  },
  {
    id: 'col-9', name: 'Deep Space', isPremium: true,
    world: { id: 'bg-9', name: 'Deep Space', type: 'background', price: 2200, req: 25, desc: 'Colorful gas clouds world.', isAd: false, themeIdx: 9 },
    block: { id: 'skin-9', name: 'UFO', type: 'skin', price: 900, req: 25, desc: 'UFO skin.', isAd: false, themeIdx: 9 },
    boom: { id: 'boom-9', name: 'Plasma', type: 'boom', price: 1400, req: 25, desc: 'Plasma hazard.', isAd: false, themeIdx: 9 },
    plate: { id: 'plate-9', name: 'Docking Ring', type: 'plate', price: 700, req: 25, desc: 'Docking Ring plate.', isAd: false, themeIdx: 9 },
  },
  {
    id: 'col-10', name: 'Enchanted Forest', isPremium: true,
    world: { id: 'bg-10', name: 'Enchanted Forest', type: 'background', price: 3000, req: 27, desc: 'Magical glowing world.', isAd: false, themeIdx: 10 },
    block: { id: 'skin-10', name: 'Toadstool', type: 'skin', price: 1200, req: 27, desc: 'Toadstool skin.', isAd: false, themeIdx: 10 },
    boom: { id: 'boom-10', name: 'Fairy Dust', type: 'boom', price: 1900, req: 27, desc: 'Fairy Dust hazard.', isAd: false, themeIdx: 10 },
    plate: { id: 'plate-10', name: 'Giant Leaf', type: 'plate', price: 900, req: 27, desc: 'Giant Leaf plate.', isAd: false, themeIdx: 10 },
  },
  {
    id: 'col-11', name: 'Pirate', isPremium: true,
    world: { id: 'bg-11', name: 'Pirate', type: 'background', price: 3800, req: 28, desc: 'Treacherous waters world.', isAd: false, themeIdx: 11 },
    block: { id: 'skin-11', name: 'Parrot', type: 'skin', price: 1500, req: 28, desc: 'Parrot skin.', isAd: false, themeIdx: 11 },
    boom: { id: 'boom-11', name: 'Cannonball', type: 'boom', price: 2400, req: 28, desc: 'Cannonball hazard.', isAd: false, themeIdx: 11 },
    plate: { id: 'plate-11', name: 'Wooden Plank', type: 'plate', price: 1100, req: 28, desc: 'Wooden Plank plate.', isAd: false, themeIdx: 11 },
  },
  {
    id: 'col-12', name: 'Candyland', isPremium: true,
    world: { id: 'bg-12', name: 'Candyland', type: 'background', price: 5000, req: 29, desc: 'Sweet candy world.', isAd: false, themeIdx: 12 },
    block: { id: 'skin-12', name: 'Gummy Bear', type: 'skin', price: 2000, req: 29, desc: 'Gummy Bear skin.', isAd: false, themeIdx: 12 },
    boom: { id: 'boom-12', name: 'Jawbreaker', type: 'boom', price: 3200, req: 29, desc: 'Jawbreaker hazard.', isAd: false, themeIdx: 12 },
    plate: { id: 'plate-12', name: 'Wafer', type: 'plate', price: 1500, req: 29, desc: 'Wafer plate.', isAd: false, themeIdx: 12 },
  },
  {
    id: 'col-13', name: 'Golden Legend', isPremium: true,
    world: { id: 'bg-13', name: 'Golden Legend', type: 'background', price: 7500, req: 30, desc: 'A realm of pure gold world.', isAd: false, themeIdx: 13 },
    block: { id: 'skin-13', name: 'Golden Idol', type: 'skin', price: 3000, req: 30, desc: 'Golden Idol skin.', isAd: false, themeIdx: 13 },
    boom: { id: 'boom-13', name: 'Gold Coin', type: 'boom', price: 5000, req: 30, desc: 'Gold Coin hazard.', isAd: false, themeIdx: 13 },
    plate: { id: 'plate-13', name: 'Gold Pedestal', type: 'plate', price: 2500, req: 30, desc: 'Gold Pedestal plate.', isAd: false, themeIdx: 13 },
  },
  {
    id: 'col-14', name: 'Cyberpunk', isPremium: true,
    world: { id: 'bg-14', name: 'Cyberpunk', type: 'background', price: 0, req: 0, desc: 'Neon skyline world.', isAd: true, themeIdx: 14 },
    block: { id: 'skin-14', name: 'Glitch Bot', type: 'skin', price: 0, req: 0, desc: 'Glitch Bot skin.', isAd: true, themeIdx: 14 },
    boom: { id: 'boom-14', name: 'EMP', type: 'boom', price: 0, req: 0, desc: 'EMP hazard.', isAd: true, themeIdx: 14 },
    plate: { id: 'plate-14', name: 'Holo-Pad', type: 'plate', price: 0, req: 0, desc: 'Holo-Pad plate.', isAd: true, themeIdx: 14 },
  },
];

export const ALL_COSMETICS: CosmeticDef[] = COLLECTIONS.flatMap(c => [c.world, c.block, c.boom, c.plate]);
