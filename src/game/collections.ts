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
    block: { id: 'skin-0', name: 'Amber Honeycomb', type: 'skin', price: 0, req: 1, desc: 'Polished amber gemstone with internal hexagonal honeycomb facets.', isAd: false, themeIdx: 0 },
    boom: { id: 'boom-0', name: 'Pollen Burst', type: 'boom', price: 0, req: 1, desc: 'Swirling golden pollen and verdant leaf motes.', isAd: false, themeIdx: 0 },
    plate: { id: 'plate-0', name: 'Mossy Stone Ledger', type: 'plate', price: 0, req: 1, desc: 'Carved natural granite stone slab blanketed in moss.', isAd: false, themeIdx: 0 },
  },
  {
    id: 'col-1', name: 'Lunar Surface', isPremium: false,
    world: { id: 'bg-1', name: 'Lunar Crater Field', type: 'background', price: 120, req: 11, desc: 'Stark grey lunar regolith overlooking an Earthrise.', isAd: false, themeIdx: 1 },
    block: { id: 'skin-1', name: 'Lunar Basalt Rock', type: 'skin', price: 60, req: 11, desc: 'Authentic cratered lunar basalt with metallic meteorite inclusions.', isAd: false, themeIdx: 1 },
    boom: { id: 'boom-1', name: 'Meteor Impact', type: 'boom', price: 80, req: 11, desc: 'Stark micrometeorite blast with lunar ejecta shards.', isAd: false, themeIdx: 1 },
    plate: { id: 'plate-1', name: 'Thermal Landing Pad', type: 'plate', price: 50, req: 11, desc: 'Gold-foil insulated lunar excursion module pad.', isAd: false, themeIdx: 1 },
  },
  {
    id: 'col-2', name: 'Martian Canyon', isPremium: false,
    world: { id: 'bg-2', name: 'Redstone Canyon', type: 'background', price: 180, req: 21, desc: 'Rusty crimson dunes and striated redstone cliff horizons.', isAd: false, themeIdx: 2 },
    block: { id: 'skin-2', name: 'Martian Hematite', type: 'skin', price: 90, req: 21, desc: 'Weathered iron-rich redstone block with sedimentary striations.', isAd: false, themeIdx: 2 },
    boom: { id: 'boom-2', name: 'Crimson Sandblast', type: 'boom', price: 120, req: 21, desc: 'High-velocity swirling red desert wind and mineral sparks.', isAd: false, themeIdx: 2 },
    plate: { id: 'plate-2', name: 'Redstone Ridge Deck', type: 'plate', price: 75, req: 21, desc: 'Layered martian ironstone slab with sediment layers.', isAd: false, themeIdx: 2 },
  },
  {
    id: 'col-3', name: 'Deep Space Nebula', isPremium: false,
    world: { id: 'bg-3', name: 'Stellar Nebula', type: 'background', price: 250, req: 31, desc: 'Vibrant swirling cosmic clouds of violet, magenta, and cyan.', isAd: false, themeIdx: 3 },
    block: { id: 'skin-3', name: 'Cosmic Meteorite', type: 'skin', price: 120, req: 31, desc: 'Midnight meteorite infused with galaxy starlight facets.', isAd: false, themeIdx: 3 },
    boom: { id: 'boom-3', name: 'Supernova Shockwave', type: 'boom', price: 160, req: 31, desc: 'Expanding stellar ring with radiant cosmic energy rays.', isAd: false, themeIdx: 3 },
    plate: { id: 'plate-3', name: 'Orbital Truss Dock', type: 'plate', price: 100, req: 31, desc: 'Titanium space station truss with anti-grav field.', isAd: false, themeIdx: 3 },
  },
  {
    id: 'col-4', name: 'Abyssal Coral Reef', isPremium: false,
    world: { id: 'bg-4', name: 'Coral Abyss', type: 'background', price: 400, req: 41, desc: 'Deep sapphire water caustics with living coral reef shelves.', isAd: false, themeIdx: 4 },
    block: { id: 'skin-4', name: 'Luminous Sea Pearl', type: 'skin', price: 180, req: 41, desc: 'Iridescent ocean pearl with abalone shell mother-of-pearl sheen.', isAd: false, themeIdx: 4 },
    boom: { id: 'boom-4', name: 'Cavitation Splash', type: 'boom', price: 250, req: 41, desc: 'High-speed underwater hydrodynamic burst with bubbles.', isAd: false, themeIdx: 4 },
    plate: { id: 'plate-4', name: 'Living Coral Shelf', type: 'plate', price: 150, req: 41, desc: 'Natural calcified coral ledge with bioluminescent polyps.', isAd: false, themeIdx: 4 },
  },
  {
    id: 'col-5', name: 'Tropical Sunset Beach', isPremium: false,
    world: { id: 'bg-5', name: 'Sunset Tide', type: 'background', price: 500, req: 51, desc: 'Amber and violet sunset sky over rolling ocean waves.', isAd: false, themeIdx: 5 },
    block: { id: 'skin-5', name: 'Ocean Jade Pebble', type: 'skin', price: 220, req: 51, desc: 'Smooth ocean-tumbled jade stone with translucent aqua luster.', isAd: false, themeIdx: 5 },
    boom: { id: 'boom-5', name: 'Sunlit Spray', type: 'boom', price: 300, req: 51, desc: 'Golden ocean mist illuminated by the setting sun.', isAd: false, themeIdx: 5 },
    plate: { id: 'plate-5', name: 'Teak Boardwalk Plank', type: 'plate', price: 200, req: 51, desc: 'Weathered salt-cured teak wood boardwalk with brass fittings.', isAd: false, themeIdx: 5 },
  },
  {
    id: 'col-6', name: 'Volcanic Caldera', isPremium: false,
    world: { id: 'bg-6', name: 'Molten Caldera', type: 'background', price: 650, req: 61, desc: 'Dark basalt crags over glowing magma lakes and rising embers.', isAd: false, themeIdx: 6 },
    block: { id: 'skin-6', name: 'Obsidian Magma Core', type: 'skin', price: 300, req: 61, desc: 'Chiseled black volcanic glass with glowing molten magma fissures.', isAd: false, themeIdx: 6 },
    boom: { id: 'boom-6', name: 'Magma Eruption', type: 'boom', price: 400, req: 61, desc: 'Violent eruption of glowing molten lava embers and smoke.', isAd: false, themeIdx: 6 },
    plate: { id: 'plate-6', name: 'Basalt Magma Slab', type: 'plate', price: 260, req: 61, desc: 'Thermal-shock basalt stone with glowing heat channels.', isAd: false, themeIdx: 6 },
  },
  {
    id: 'col-7', name: 'Ancient Stone Citadel', isPremium: false,
    world: { id: 'bg-7', name: 'Citadel Ramparts', type: 'background', price: 800, req: 71, desc: 'Gothic stone battlements under a full moon with torchlight.', isAd: false, themeIdx: 7 },
    block: { id: 'skin-7', name: 'Fortress Ashlar Granite', type: 'skin', price: 380, req: 71, desc: 'Carved fortress granite stone with forged iron bracket rivets.', isAd: false, themeIdx: 7 },
    boom: { id: 'boom-7', name: 'Masonry Shrapnel', type: 'boom', price: 500, req: 71, desc: 'Explosive stone fracture with flying mortar and sparks.', isAd: false, themeIdx: 7 },
    plate: { id: 'plate-7', name: 'Castle Stone Threshold', type: 'plate', price: 320, req: 71, desc: 'Heavy hewn stone masonry with wrought-iron banding.', isAd: false, themeIdx: 7 },
  },
  {
    id: 'col-8', name: 'Enchanted Redwood', isPremium: false,
    world: { id: 'bg-8', name: 'Mystic Redwood Grove', type: 'background', price: 1000, req: 81, desc: 'Towering ancient redwood trunks bathed in magical emerald mist.', isAd: false, themeIdx: 8 },
    block: { id: 'skin-8', name: 'Petrified Heartwood', type: 'skin', price: 450, req: 81, desc: 'Ancient petrified timber with luminous green lichen runes.', isAd: false, themeIdx: 8 },
    boom: { id: 'boom-8', name: 'Emerald Spores', type: 'boom', price: 650, req: 81, desc: 'Cloud of glowing bio-luminescent forest spores and fireflies.', isAd: false, themeIdx: 8 },
    plate: { id: 'plate-8', name: 'Redwood Burl Deck', type: 'plate', price: 400, req: 81, desc: 'Polished giant redwood tree burl overgrown with shelf fungi.', isAd: false, themeIdx: 8 },
  },
  {
    id: 'col-9', name: 'Golden Desert Oasis', isPremium: false,
    world: { id: 'bg-9', name: 'Golden Dunes', type: 'background', price: 1300, req: 91, desc: 'Sweeping wind-rippled dunes with distant sandstone pyramids.', isAd: false, themeIdx: 9 },
    block: { id: 'skin-9', name: 'Sandstone Hieroglyph', type: 'skin', price: 600, req: 91, desc: 'Sun-baked sandstone block carved with gold-inlaid scarab seals.', isAd: false, themeIdx: 9 },
    boom: { id: 'boom-9', name: 'Sandstorm Gust', type: 'boom', price: 850, req: 91, desc: 'Fierce desert whirlwind carrying shimmering golden grit.', isAd: false, themeIdx: 9 },
    plate: { id: 'plate-9', name: 'Sandstone Altar Dais', type: 'plate', price: 500, req: 91, desc: 'Carved sandstone temple dais with geometric sun borders.', isAd: false, themeIdx: 9 },
  },
  {
    id: 'col-10', name: 'Frozen Arctic Tundra', isPremium: false,
    world: { id: 'bg-10', name: 'Arctic Glacier', type: 'background', price: 1600, req: 101, desc: 'Glacial icebergs beneath dancing emerald and cyan Aurora curtains.', isAd: false, themeIdx: 10 },
    block: { id: 'skin-10', name: 'Glacial Crystal Ice', type: 'skin', price: 750, req: 101, desc: 'Translucent blue glacial ice block with internal frost fractures.', isAd: false, themeIdx: 10 },
    boom: { id: 'boom-10', name: 'Blizzard Shatter', type: 'boom', price: 1100, req: 101, desc: 'Shattering burst of crystalline ice needles and frosty vapor.', isAd: false, themeIdx: 10 },
    plate: { id: 'plate-10', name: 'Permafrost Ice Shelf', type: 'plate', price: 650, req: 101, desc: 'Solid permafrost shelf with hanging crystalline icicles.', isAd: false, themeIdx: 10 },
  },
  {
    id: 'col-11', name: 'Pirate Corsair Cove', isPremium: true,
    world: { id: 'bg-11', name: 'Corsair Bay', type: 'background', price: 2000, req: 111, desc: 'Dramatic moonlit coastal sea cliffs with a pirate galleon silhouette.', isAd: false, themeIdx: 11 },
    block: { id: 'skin-11', name: 'Nautical Oak Plank', type: 'skin', price: 900, req: 111, desc: 'Weathered salt-cured oak timber with brass ship rivets.', isAd: false, themeIdx: 11 },
    boom: { id: 'boom-11', name: 'Blackpowder Blast', type: 'boom', price: 1400, req: 111, desc: 'Heavy naval cannon detonation with sparks and smoke plumes.', isAd: false, themeIdx: 11 },
    plate: { id: 'plate-11', name: 'Quarterdeck Plank', type: 'plate', price: 800, req: 111, desc: 'Sturdy galleon quarterdeck timbers bound with nautical ropes.', isAd: false, themeIdx: 11 },
  },
  {
    id: 'col-12', name: 'Candyland Confection', isPremium: true,
    world: { id: 'bg-12', name: 'Sugar Crystal Glaze', type: 'background', price: 5000, req: 121, desc: 'Glistening confection realm with glazed cream hills and sugar dust.', isAd: false, themeIdx: 12 },
    block: { id: 'skin-12', name: 'Ruby Sugar Jewel', type: 'skin', price: 2000, req: 121, desc: 'Artisan translucent ruby candy crystal with glossy specular shine.', isAd: false, themeIdx: 12 },
    boom: { id: 'boom-12', name: 'Sugar Glass Burst', type: 'boom', price: 3200, req: 121, desc: 'Dazzling shattered sugar glass fragments and confectionery sparkles.', isAd: false, themeIdx: 12 },
    plate: { id: 'plate-12', name: 'Wafer Biscuit Plate', type: 'plate', price: 1500, req: 121, desc: 'Crisp chocolate wafer biscuit platform with glazed mint supports.', isAd: false, themeIdx: 12 },
  },
  {
    id: 'col-13', name: 'Golden El Dorado', isPremium: true,
    world: { id: 'bg-13', name: 'El Dorado Sanctuary', type: 'background', price: 7500, req: 131, desc: 'Gilded Incan sun-temple architecture bathed in radiant sunbeams.', isAd: false, themeIdx: 13 },
    block: { id: 'skin-13', name: '24K Minted Gold Bullion', type: 'skin', price: 3000, req: 131, desc: 'Solid mirror-sheen pure gold bar engraved with 999.9 fineness.', isAd: false, themeIdx: 13 },
    boom: { id: 'boom-13', name: 'Golden Sunbeam Burst', type: 'boom', price: 5000, req: 131, desc: 'Radiant cascade of shimmering golden coins and sun motes.', isAd: false, themeIdx: 13 },
    plate: { id: 'plate-13', name: 'Gilded Sun Dais', type: 'plate', price: 2500, req: 131, desc: 'Inlaid gold-leaf pedestal forged for solar ceremonies.', isAd: false, themeIdx: 13 },
  },
  {
    id: 'col-14', name: 'Cyberpunk Megacity', isPremium: true,
    world: { id: 'bg-14', name: 'Neo-City Skyline', type: 'background', price: 0, req: 141, desc: 'Towering skyscrapers with neon signage and rain reflections.', isAd: true, themeIdx: 14 },
    block: { id: 'skin-14', name: 'Holo-Glass Processor', type: 'skin', price: 0, req: 141, desc: 'Tempered smoked glass module with glowing cyan/magenta circuits.', isAd: true, themeIdx: 14 },
    boom: { id: 'boom-14', name: 'Electric Arc EMP', type: 'boom', price: 0, req: 141, desc: 'High-voltage electric discharge with neon cyan lightning sparks.', isAd: true, themeIdx: 14 },
    plate: { id: 'plate-14', name: 'Neon Rooftop Gantry', type: 'plate', price: 0, req: 141, desc: 'Reinforced industrial steel gantry with hazard warning strips.', isAd: true, themeIdx: 14 },
  },
  {
    id: 'col-15', name: 'Toxic Wasteland', isPremium: true,
    world: { id: 'bg-15', name: 'Chemical Lagoon', type: 'background', price: 8500, req: 151, desc: 'Industrial refinery pipes over bubbling phosphorescent green liquid.', isAd: false, themeIdx: 15 },
    block: { id: 'skin-15', name: 'Heavy Isotope Cask', type: 'skin', price: 3500, req: 151, desc: 'Lead-reinforced titanium container displaying glowing green isotope fluid.', isAd: false, themeIdx: 15 },
    boom: { id: 'boom-15', name: 'Acidic Slag Splash', type: 'boom', price: 6000, req: 151, desc: 'Corrosive chemical foam burst with boiling vapor trails.', isAd: false, themeIdx: 15 },
    plate: { id: 'plate-15', name: 'Hazard Slag Grate', type: 'plate', price: 3000, req: 151, desc: 'Acid-resistant steel grating over a glowing neutralization sump.', isAd: false, themeIdx: 15 },
  },
  {
    id: 'col-16', name: 'Floating Sky Islands', isPremium: true,
    world: { id: 'bg-16', name: 'Sky Archipelago', type: 'background', price: 10000, req: 161, desc: 'Floating emerald islands with waterfalls cascading into cloud decks.', isAd: false, themeIdx: 16 },
    block: { id: 'skin-16', name: 'Aether Aerolite', type: 'skin', price: 4000, req: 161, desc: 'Weightless celestial stone surrounded by a soft glowing vapor aura.', isAd: false, themeIdx: 16 },
    boom: { id: 'boom-16', name: 'Thunderhead Spark', type: 'boom', price: 7000, req: 161, desc: 'Vaporous cloud ionization detonation with soft lightning arcs.', isAd: false, themeIdx: 16 },
    plate: { id: 'plate-16', name: 'Floating Skyrock', type: 'plate', price: 3500, req: 161, desc: 'Levitating moss-capped aerolite rock with trailing vines.', isAd: false, themeIdx: 16 },
  },
  {
    id: 'col-17', name: 'Chrono Clockwork', isPremium: true,
    world: { id: 'bg-17', name: 'Clockwork Realm', type: 'background', price: 12000, req: 171, desc: 'Intricate interlocking brass and copper gear trains with steam vents.', isAd: false, themeIdx: 17 },
    block: { id: 'skin-17', name: 'Brass Escapement Gear', type: 'skin', price: 5000, req: 171, desc: 'Solid brushed brass and copper mechanism with ruby pivot bearing.', isAd: false, themeIdx: 17 },
    boom: { id: 'boom-17', name: 'Clock Spring Burst', type: 'boom', price: 8500, req: 171, desc: 'Burst of flying polished brass clockwork springs, gears, and steam.', isAd: false, themeIdx: 17 },
    plate: { id: 'plate-17', name: 'Brass Machine Bed', type: 'plate', price: 4500, req: 171, desc: 'Heavy cast-iron machine plate with running brass drive chains.', isAd: false, themeIdx: 17 },
  },
  {
    id: 'col-18', name: 'Sakura Blossom Shrine', isPremium: true,
    world: { id: 'bg-18', name: 'Cherry Blossom Shrine', type: 'background', price: 15000, req: 181, desc: 'Serene twilight pagoda and torii gate against Mount Fuji silhouette.', isAd: false, themeIdx: 18 },
    block: { id: 'skin-18', name: 'Imperial Rosewood', type: 'skin', price: 6000, req: 181, desc: 'Deep polished rosewood with inlaid mother-of-pearl blossom crest.', isAd: false, themeIdx: 18 },
    boom: { id: 'boom-18', name: 'Cherry Petal Vortex', type: 'boom', price: 10000, req: 181, desc: 'Whirlwind spiral of vibrant cherry blossom petals and paper sparks.', isAd: false, themeIdx: 18 },
    plate: { id: 'plate-18', name: 'Vermilion Bridge Deck', type: 'plate', price: 5500, req: 181, desc: 'Traditional Japanese lacquered red bridge plank with brass caps.', isAd: false, themeIdx: 18 },
  },
  {
    id: 'col-19', name: 'The Crystalline Core', isPremium: true,
    world: { id: 'bg-19', name: 'Amethyst Cavern', type: 'background', price: 20000, req: 191, desc: 'Deep subterranean cavern with towering faceted glowing amethyst pillars.', isAd: false, themeIdx: 19 },
    block: { id: 'skin-19', name: 'Amethyst Geode Cluster', type: 'skin', price: 8000, req: 191, desc: 'Sparkling multi-faceted amethyst geode cluster with light refraction.', isAd: false, themeIdx: 19 },
    boom: { id: 'boom-19', name: 'Prismatic Detonation', type: 'boom', price: 15000, req: 191, desc: 'Refractive crystal fragmentation detonation with violet light flares.', isAd: false, themeIdx: 19 },
    plate: { id: 'plate-19', name: 'Raw Geode Bedrock', type: 'plate', price: 7500, req: 191, desc: 'Subterranean dark granite bedrock studded with glowing amethyst crystals.', isAd: false, themeIdx: 19 },
  },
];

export const ALL_COSMETICS: CosmeticDef[] = COLLECTIONS.flatMap(c => [c.world, c.block, c.boom, c.plate]);
