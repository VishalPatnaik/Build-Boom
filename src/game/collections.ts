export type CosmeticCategory = 'skin' | 'boom' | 'background' | 'plate';

export interface CosmeticDef {
  id: string;
  name: string;
  type: CosmeticCategory;
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
    world: { id: 'bg-0', name: 'Emerald Meadow', type: 'background', price: 0, req: 1, desc: 'Rolling emerald green hills with warm golden sunlight.', isAd: false, themeIdx: 0 },
    block: { id: 'skin-0', name: 'Bumble Bee', type: 'skin', price: 0, req: 1, desc: 'A chubby striped bee that buzzes with joy on every perfect landing.', isAd: false, themeIdx: 0 },
    boom: { id: 'boom-0', name: 'Angry Wasp', type: 'boom', price: 0, req: 1, desc: 'A furious wasp. Never tap it, let it buzz past.', isAd: false, themeIdx: 0 },
    plate: { id: 'plate-0', name: 'Mossy Flower Log', type: 'plate', price: 0, req: 1, desc: 'A hollow log carpeted in moss and wildflowers.', isAd: false, themeIdx: 0 },
  },
  {
    id: 'col-1', name: 'Lunar Surface', isPremium: false,
    world: { id: 'bg-1', name: 'Lunar Crater Field', type: 'background', price: 350, req: 2, desc: 'Stark grey lunar regolith overlooking an Earthrise.', isAd: false, themeIdx: 1 },
    block: { id: 'skin-1', name: 'Astronaut', type: 'skin', price: 200, req: 2, desc: 'A tiny moonwalker in a gold-rimmed visor.', isAd: false, themeIdx: 1 },
    boom: { id: 'boom-1', name: 'Flaming Meteor', type: 'boom', price: 250, req: 2, desc: 'A blazing space rock with a bad attitude.', isAd: false, themeIdx: 1 },
    plate: { id: 'plate-1', name: 'Lunar Landing Pad', type: 'plate', price: 150, req: 2, desc: 'Striped landing pad with blinking guide lights.', isAd: false, themeIdx: 1 },
  },
  {
    id: 'col-2', name: 'Martian Canyon', isPremium: false,
    world: { id: 'bg-2', name: 'Redstone Canyon', type: 'background', price: 500, req: 3, desc: 'Rusty crimson dunes and striated redstone cliff horizons.', isAd: false, themeIdx: 2 },
    block: { id: 'skin-2', name: 'Mars Rover', type: 'skin', price: 280, req: 3, desc: 'A plucky six-wheeled rover with a solar panel hat.', isAd: false, themeIdx: 2 },
    boom: { id: 'boom-2', name: 'Alien Spore Pod', type: 'boom', price: 350, req: 3, desc: 'A pulsing alien pod covered in tendrils.', isAd: false, themeIdx: 2 },
    plate: { id: 'plate-2', name: 'Rusty Launch Deck', type: 'plate', price: 220, req: 3, desc: 'Riveted iron deck stained red by Martian dust.', isAd: false, themeIdx: 2 },
  },
  {
    id: 'col-3', name: 'Deep Space Nebula', isPremium: false,
    world: { id: 'bg-3', name: 'Stellar Nebula', type: 'background', price: 700, req: 4, desc: 'Vibrant swirling cosmic clouds of violet, magenta, and cyan.', isAd: false, themeIdx: 3 },
    block: { id: 'skin-3', name: 'Little UFO', type: 'skin', price: 400, req: 4, desc: 'A friendly green alien in a saucer with blinking lights.', isAd: false, themeIdx: 3 },
    boom: { id: 'boom-3', name: 'Plasma Space Mine', type: 'boom', price: 500, req: 4, desc: 'A spiked mine crackling with plasma.', isAd: false, themeIdx: 3 },
    plate: { id: 'plate-3', name: 'Space Station Ring', type: 'plate', price: 300, req: 4, desc: 'Docking ring with running lights.', isAd: false, themeIdx: 3 },
  },
  {
    id: 'col-4', name: 'Abyssal Coral Reef', isPremium: false,
    world: { id: 'bg-4', name: 'Coral Abyss', type: 'background', price: 900, req: 5, desc: 'Deep sapphire water caustics with living coral reef shelves.', isAd: false, themeIdx: 4 },
    block: { id: 'skin-4', name: 'Sea Turtle', type: 'skin', price: 500, req: 5, desc: 'A gentle turtle paddling through the reef.', isAd: false, themeIdx: 4 },
    boom: { id: 'boom-4', name: 'Sea Mine', type: 'boom', price: 650, req: 5, desc: 'A rusty naval mine bristling with spikes.', isAd: false, themeIdx: 4 },
    plate: { id: 'plate-4', name: 'Giant Clam Shell', type: 'plate', price: 400, req: 5, desc: 'A pink clam shell guarding a pearl.', isAd: false, themeIdx: 4 },
  },
  {
    id: 'col-5', name: 'Tropical Sunset Beach', isPremium: false,
    world: { id: 'bg-5', name: 'Sunset Tide', type: 'background', price: 1100, req: 6, desc: 'Amber and violet sunset sky over rolling ocean waves.', isAd: false, themeIdx: 5 },
    block: { id: 'skin-5', name: 'Beach Crab', type: 'skin', price: 600, req: 6, desc: 'A snappy red crab clicking its claws.', isAd: false, themeIdx: 5 },
    boom: { id: 'boom-5', name: 'Coconut Bomb', type: 'boom', price: 800, req: 6, desc: 'A coconut with a lit fuse.', isAd: false, themeIdx: 5 },
    plate: { id: 'plate-5', name: 'Sandcastle', type: 'plate', price: 500, req: 6, desc: 'A sandcastle wall flying a little flag.', isAd: false, themeIdx: 5 },
  },
  {
    id: 'col-6', name: 'Volcanic Caldera', isPremium: false,
    world: { id: 'bg-6', name: 'Molten Caldera', type: 'background', price: 1350, req: 8, desc: 'Dark basalt crags over glowing magma lakes and rising embers.', isAd: false, themeIdx: 6 },
    block: { id: 'skin-6', name: 'Lava Slime', type: 'skin', price: 750, req: 8, desc: 'A wobbly blob of molten lava with a big grin.', isAd: false, themeIdx: 6 },
    boom: { id: 'boom-6', name: 'Fireball', type: 'boom', price: 950, req: 8, desc: 'A roaring ball of fire.', isAd: false, themeIdx: 6 },
    plate: { id: 'plate-6', name: 'Obsidian Slab', type: 'plate', price: 600, req: 8, desc: 'Black volcanic glass glowing with lava cracks.', isAd: false, themeIdx: 6 },
  },
  {
    id: 'col-7', name: 'Ancient Stone Citadel', isPremium: false,
    world: { id: 'bg-7', name: 'Citadel Ramparts', type: 'background', price: 1600, req: 10, desc: 'Gothic stone battlements under a full moon with torchlight.', isAd: false, themeIdx: 7 },
    block: { id: 'skin-7', name: 'Tiny Knight', type: 'skin', price: 900, req: 10, desc: 'A brave knight with a red plume.', isAd: false, themeIdx: 7 },
    boom: { id: 'boom-7', name: 'Catapult Boulder', type: 'boom', price: 1150, req: 10, desc: 'A siege boulder with a burning fuse.', isAd: false, themeIdx: 7 },
    plate: { id: 'plate-7', name: 'Castle Battlement', type: 'plate', price: 720, req: 10, desc: 'Crenellated stone castle wall.', isAd: false, themeIdx: 7 },
  },
  {
    id: 'col-8', name: 'Enchanted Redwood', isPremium: false,
    world: { id: 'bg-8', name: 'Mystic Redwood Grove', type: 'background', price: 1900, req: 12, desc: 'Towering ancient redwood trunks bathed in magical emerald mist.', isAd: false, themeIdx: 8 },
    block: { id: 'skin-8', name: 'Toadstool', type: 'skin', price: 1050, req: 12, desc: 'A spotted red mushroom from the enchanted forest.', isAd: false, themeIdx: 8 },
    boom: { id: 'boom-8', name: 'Thorny Bramble', type: 'boom', price: 1350, req: 12, desc: 'A ball of thorns and poison berries.', isAd: false, themeIdx: 8 },
    plate: { id: 'plate-8', name: 'Giant Leaf', type: 'plate', price: 850, req: 12, desc: 'A broad green forest leaf.', isAd: false, themeIdx: 8 },
  },
  {
    id: 'col-9', name: 'Golden Desert Oasis', isPremium: false,
    world: { id: 'bg-9', name: 'Golden Dunes', type: 'background', price: 2200, req: 14, desc: 'Sweeping wind-rippled dunes with distant sandstone pyramids.', isAd: false, themeIdx: 9 },
    block: { id: 'skin-9', name: 'Potted Cactus', type: 'skin', price: 1200, req: 14, desc: 'A smiley cactus in a terracotta pot, flower on top.', isAd: false, themeIdx: 9 },
    boom: { id: 'boom-9', name: 'Scorpion', type: 'boom', price: 1550, req: 14, desc: 'A desert scorpion with its stinger raised.', isAd: false, themeIdx: 9 },
    plate: { id: 'plate-9', name: 'Sandstone Oasis Block', type: 'plate', price: 1000, req: 14, desc: 'Sun-baked sandstone with a swaying palm.', isAd: false, themeIdx: 9 },
  },
  {
    id: 'col-10', name: 'Frozen Arctic Tundra', isPremium: false,
    world: { id: 'bg-10', name: 'Arctic Glacier', type: 'background', price: 2500, req: 16, desc: 'Glacial icebergs beneath dancing emerald and cyan Aurora curtains.', isAd: false, themeIdx: 10 },
    block: { id: 'skin-10', name: 'Penguin', type: 'skin', price: 1400, req: 16, desc: 'A waddling penguin in a red scarf.', isAd: false, themeIdx: 10 },
    boom: { id: 'boom-10', name: 'Icicle Bomb', type: 'boom', price: 1800, req: 16, desc: 'A frozen bomb sprouting sharp icicles.', isAd: false, themeIdx: 10 },
    plate: { id: 'plate-10', name: 'Ice Floe', type: 'plate', price: 1150, req: 16, desc: 'A drifting slab of sea ice.', isAd: false, themeIdx: 10 },
  },
  {
    id: 'col-11', name: 'Pirate Corsair Cove', isPremium: true,
    world: { id: 'bg-11', name: 'Corsair Bay', type: 'background', price: 2900, req: 18, desc: 'Dramatic moonlit coastal sea cliffs with a pirate galleon silhouette.', isAd: false, themeIdx: 11 },
    block: { id: 'skin-11', name: 'Pirate Parrot', type: 'skin', price: 1600, req: 18, desc: 'A loud parrot in a tiny pirate hat.', isAd: false, themeIdx: 11 },
    boom: { id: 'boom-11', name: 'Cannonball', type: 'boom', price: 2100, req: 18, desc: 'A black cannonball with a lit fuse.', isAd: false, themeIdx: 11 },
    plate: { id: 'plate-11', name: 'Ship Deck', type: 'plate', price: 1300, req: 18, desc: 'Weathered ship planks with brass portholes.', isAd: false, themeIdx: 11 },
  },
  {
    id: 'col-12', name: 'Candyland Confection', isPremium: true,
    world: { id: 'bg-12', name: 'Sugar Crystal Glaze', type: 'background', price: 3300, req: 20, desc: 'Glistening confection realm with glazed cream hills and sugar dust.', isAd: false, themeIdx: 12 },
    block: { id: 'skin-12', name: 'Gummy Bear', type: 'skin', price: 1850, req: 20, desc: 'A squishy, wobbly gummy bear.', isAd: false, themeIdx: 12 },
    boom: { id: 'boom-12', name: 'Sour Jawbreaker', type: 'boom', price: 2400, req: 20, desc: 'A sour candy bomb with a sprinkle fuse.', isAd: false, themeIdx: 12 },
    plate: { id: 'plate-12', name: 'Frosted Wafer', type: 'plate', price: 1500, req: 20, desc: 'A crispy wafer with pink frosting and sprinkles.', isAd: false, themeIdx: 12 },
  },
  {
    id: 'col-13', name: 'Golden El Dorado', isPremium: true,
    world: { id: 'bg-13', name: 'El Dorado Sanctuary', type: 'background', price: 3800, req: 24, desc: 'Gilded Incan sun-temple architecture bathed in radiant sunbeams.', isAd: false, themeIdx: 13 },
    block: { id: 'skin-13', name: 'Golden Idol', type: 'skin', price: 2100, req: 24, desc: 'A gleaming golden idol with an emerald crown.', isAd: false, themeIdx: 13 },
    boom: { id: 'boom-13', name: 'Cursed Skull', type: 'boom', price: 2750, req: 24, desc: 'A glowing cursed skull from the temple.', isAd: false, themeIdx: 13 },
    plate: { id: 'plate-13', name: 'Golden Pedestal', type: 'plate', price: 1700, req: 24, desc: 'A gem-studded golden altar.', isAd: false, themeIdx: 13 },
  },
  {
    id: 'col-14', name: 'Cyberpunk Megacity', isPremium: true,
    world: { id: 'bg-14', name: 'Neo-City Skyline', type: 'background', price: 0, req: 1, desc: 'Towering skyscrapers with neon signage and rain reflections.', isAd: true, themeIdx: 14 },
    block: { id: 'skin-14', name: 'Glitch Bot', type: 'skin', price: 0, req: 1, desc: 'A neon robot with a screen face that glitches.', isAd: true, themeIdx: 14 },
    boom: { id: 'boom-14', name: 'Virus Drone', type: 'boom', price: 0, req: 1, desc: 'A rogue drone carrying a virus.', isAd: true, themeIdx: 14 },
    plate: { id: 'plate-14', name: 'Holo-Pad', type: 'plate', price: 0, req: 1, desc: 'A scanning hologram pad.', isAd: true, themeIdx: 14 },
  },
  {
    id: 'col-15', name: 'Toxic Wasteland', isPremium: true,
    world: { id: 'bg-15', name: 'Chemical Lagoon', type: 'background', price: 4300, req: 28, desc: 'Industrial refinery pipes over bubbling phosphorescent green liquid.', isAd: false, themeIdx: 15 },
    block: { id: 'skin-15', name: 'Hazmat Duck', type: 'skin', price: 2400, req: 28, desc: 'A rubber duck in a gas mask.', isAd: false, themeIdx: 15 },
    boom: { id: 'boom-15', name: 'Toxic Barrel', type: 'boom', price: 3100, req: 28, desc: 'A leaking barrel of toxic sludge.', isAd: false, themeIdx: 15 },
    plate: { id: 'plate-15', name: 'Rusted Grate', type: 'plate', price: 1950, req: 28, desc: 'A rusted grate over glowing sludge.', isAd: false, themeIdx: 15 },
  },
  {
    id: 'col-16', name: 'Floating Sky Islands', isPremium: true,
    world: { id: 'bg-16', name: 'Sky Archipelago', type: 'background', price: 4800, req: 32, desc: 'Floating emerald islands with waterfalls cascading into cloud decks.', isAd: false, themeIdx: 16 },
    block: { id: 'skin-16', name: 'Cloud Sheep', type: 'skin', price: 2700, req: 32, desc: 'A fluffy sheep made of clouds.', isAd: false, themeIdx: 16 },
    boom: { id: 'boom-16', name: 'Thunder Cloud', type: 'boom', price: 3500, req: 32, desc: 'A grumpy storm cloud throwing lightning.', isAd: false, themeIdx: 16 },
    plate: { id: 'plate-16', name: 'Floating Island', type: 'plate', price: 2200, req: 32, desc: 'A grassy island floating in the sky.', isAd: false, themeIdx: 16 },
  },
  {
    id: 'col-17', name: 'Chrono Clockwork', isPremium: true,
    world: { id: 'bg-17', name: 'Clockwork Realm', type: 'background', price: 5400, req: 36, desc: 'Intricate interlocking brass and copper gear trains with steam vents.', isAd: false, themeIdx: 17 },
    block: { id: 'skin-17', name: 'Alarm Clock', type: 'skin', price: 3000, req: 36, desc: 'A brass alarm clock that rings when it panics.', isAd: false, themeIdx: 17 },
    boom: { id: 'boom-17', name: 'Spiked Cog Bomb', type: 'boom', price: 3900, req: 36, desc: 'A spinning spiked cog with a fuse.', isAd: false, themeIdx: 17 },
    plate: { id: 'plate-17', name: 'Brass Gear Platform', type: 'plate', price: 2500, req: 36, desc: 'A brass deck turning on clockwork gears.', isAd: false, themeIdx: 17 },
  },
  {
    id: 'col-18', name: 'Sakura Blossom Shrine', isPremium: true,
    world: { id: 'bg-18', name: 'Cherry Blossom Shrine', type: 'background', price: 6000, req: 40, desc: 'Serene twilight pagoda and torii gate against Mount Fuji silhouette.', isAd: false, themeIdx: 18 },
    block: { id: 'skin-18', name: 'Lucky Cat', type: 'skin', price: 3400, req: 40, desc: 'A waving lucky cat with a golden bell.', isAd: false, themeIdx: 18 },
    boom: { id: 'boom-18', name: 'Firecracker Bundle', type: 'boom', price: 4400, req: 40, desc: 'A bundle of firecrackers about to pop.', isAd: false, themeIdx: 18 },
    plate: { id: 'plate-18', name: 'Shrine Step', type: 'plate', price: 2800, req: 40, desc: 'A red shrine step under falling petals.', isAd: false, themeIdx: 18 },
  },
  {
    id: 'col-19', name: 'The Crystalline Core', isPremium: true,
    world: { id: 'bg-19', name: 'Amethyst Cavern', type: 'background', price: 6800, req: 45, desc: 'Deep subterranean cavern with towering faceted glowing amethyst pillars.', isAd: false, themeIdx: 19 },
    block: { id: 'skin-19', name: 'Crystal Sprite', type: 'skin', price: 3800, req: 45, desc: 'A shimmering crystal creature.', isAd: false, themeIdx: 19 },
    boom: { id: 'boom-19', name: 'Shard Spike', type: 'boom', price: 5000, req: 45, desc: 'A cluster of razor-sharp crystal shards.', isAd: false, themeIdx: 19 },
    plate: { id: 'plate-19', name: 'Amethyst Geode', type: 'plate', price: 3200, req: 45, desc: 'A split geode full of amethyst.', isAd: false, themeIdx: 19 },
  },
];

export const ALL_COSMETICS: CosmeticDef[] = COLLECTIONS.flatMap(c => [c.world, c.block, c.boom, c.plate]);
