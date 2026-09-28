export const ZONE_NAMES = [
  "Spring Meadow",
  "Lunar Surface",
  "Martian Canyon",
  "Deep Space Nebula",
  "Abyssal Coral Reef",
  "Tropical Sunset Beach",
  "Volcanic Caldera",
  "Ancient Citadel",
  "Enchanted Redwood Forest",
  "Golden Desert Oasis",
  "Frozen Arctic Tundra",
  "Pirate Corsair Cove",
  "Candyland Confection",
  "Golden El Dorado",
  "Cyberpunk Megacity",
  "Toxic Industrial Wasteland",
  "Floating Sky Islands",
  "Chrono Clockwork Realm",
  "Sakura Blossom Shrine",
  "The Crystalline Core"
];

export interface ZoneConfig {
  bg: string;
  path: string;
  scenery: string[];
  sceneryDensity: number;
  particle: string;
  ambient: string;
}

export const ZONE_CONFIGS: ZoneConfig[] = [
  // 0: Spring Meadow
  { bg: '#052e16', path: '#22c55e', scenery: ['oak_tree', 'wild_flower', 'stone_boulder'], sceneryDensity: 1.0, particle: 'pollen', ambient: '#86efac' },
  // 1: Lunar Surface
  { bg: '#030712', path: '#94a3b8', scenery: ['lunar_crater', 'lunar_beacon', 'space_rock'], sceneryDensity: 0.8, particle: 'stardust', ambient: '#38bdf8' },
  // 2: Martian Canyon
  { bg: '#270a04', path: '#ea580c', scenery: ['redstone_cliff', 'canyon_arch', 'martian_rock'], sceneryDensity: 0.9, particle: 'red_dust', ambient: '#f97316' },
  // 3: Deep Space Nebula
  { bg: '#09021a', path: '#a855f7', scenery: ['cosmic_spire', 'stellar_cluster', 'space_rock'], sceneryDensity: 0.8, particle: 'warp_spark', ambient: '#c084fc' },
  // 4: Abyssal Coral Reef
  { bg: '#02182b', path: '#06b6d4', scenery: ['coral_reef', 'sea_anemone', 'kelp_pillar'], sceneryDensity: 1.0, particle: 'water_bubble', ambient: '#22d3ee' },
  // 5: Tropical Sunset Beach
  { bg: '#1c0a1f', path: '#f59e0b', scenery: ['palm_tree', 'driftwood', 'beach_shell'], sceneryDensity: 0.8, particle: 'sea_spray', ambient: '#fed7aa' },
  // 6: Volcanic Caldera
  { bg: '#1a0502', path: '#ef4444', scenery: ['volcano_vent', 'lava_crag', 'obsidian_spire'], sceneryDensity: 0.9, particle: 'ember', ambient: '#f59e0b' },
  // 7: Ancient Citadel
  { bg: '#0b1120', path: '#64748b', scenery: ['castle_tower', 'stone_obelisk', 'torch_post'], sceneryDensity: 0.85, particle: 'torch_spark', ambient: '#fbbf24' },
  // 8: Enchanted Redwood Forest
  { bg: '#032014', path: '#10b981', scenery: ['redwood_tree', 'glowing_mushroom', 'ancient_roots'], sceneryDensity: 1.1, particle: 'magic_spore', ambient: '#a7f3d0' },
  // 9: Golden Desert Oasis
  { bg: '#1c1303', path: '#eab308', scenery: ['sandstone_pyramid', 'desert_palm', 'sandstone_pillar'], sceneryDensity: 0.8, particle: 'gold_sand', ambient: '#fef08a' },
  // 10: Frozen Arctic Tundra
  { bg: '#03192e', path: '#38bdf8', scenery: ['ice_spire', 'snowy_pine', 'glacier_boulder'], sceneryDensity: 0.9, particle: 'snow_flake', ambient: '#e0f2fe' },
  // 11: Pirate Corsair Cove
  { bg: '#0c1524', path: '#d97706', scenery: ['sea_cliff', 'treasure_marker', 'lantern_post'], sceneryDensity: 0.8, particle: 'ocean_mist', ambient: '#fbbf24' },
  // 12: Candyland Confection
  { bg: '#2b0922', path: '#ec4899', scenery: ['sugar_crystal', 'glazed_lollipop', 'wafer_pillar'], sceneryDensity: 1.0, particle: 'sugar_dust', ambient: '#fbcfe8' },
  // 13: Golden El Dorado
  { bg: '#1c1002', path: '#f59e0b', scenery: ['golden_monolith', 'sun_temple_block', 'jungle_vine'], sceneryDensity: 0.85, particle: 'gold_mote', ambient: '#fef08a' },
  // 14: Cyberpunk Megacity
  { bg: '#090514', path: '#00f0ff', scenery: ['cyber_billboard', 'neon_spire', 'data_terminal'], sceneryDensity: 0.9, particle: 'neon_rain', ambient: '#f43f5e' },
  // 15: Toxic Industrial Wasteland
  { bg: '#091504', path: '#84cc16', scenery: ['cooling_pipe', 'hazard_cask', 'industrial_chimney'], sceneryDensity: 0.75, particle: 'toxic_vapor', ambient: '#bef264' },
  // 16: Floating Sky Islands
  { bg: '#071f3d', path: '#38bdf8', scenery: ['sky_island', 'cloud_wisp', 'floating_crystal'], sceneryDensity: 0.85, particle: 'cloud_mist', ambient: '#ffffff' },
  // 17: Chrono Clockwork Realm
  { bg: '#1a0d05', path: '#d97706', scenery: ['brass_gear', 'steam_pipe', 'pendulum_spire'], sceneryDensity: 0.95, particle: 'steam_puff', ambient: '#fbbf24' },
  // 18: Sakura Blossom Shrine
  { bg: '#240817', path: '#f472b6', scenery: ['sakura_tree', 'torii_gate', 'stone_lantern'], sceneryDensity: 1.0, particle: 'sakura_petal', ambient: '#fbcfe8' },
  // 19: The Crystalline Core
  { bg: '#0c021a', path: '#c084fc', scenery: ['amethyst_cluster', 'quartz_pillar', 'prismatic_shard'], sceneryDensity: 1.0, particle: 'crystal_flare', ambient: '#00f0ff' }
];
