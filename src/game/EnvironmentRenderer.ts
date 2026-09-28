import { renderCinematicWorld } from './cinematicWorlds/renderCinematicWorld';
import { ParallaxState, ParallaxLayerOffset, setActiveParallax, getParallaxTierOffset } from './cinematicWorlds/worldUtils';
import { 
  renderHighContrastEnvironment, 
  renderMinimalDarkEnvironment, 
  renderCyberpunkEnvironment, 
  renderDeepCosmosEnvironment, 
  renderSolarGoldEnvironment 
} from './environmentThemes';
import { VisualThemeMode } from './store';
import { safeCreateRadialGradient } from '../utils/canvasUtils';

export interface ActiveWorldInfo {
  worldId: string;
  worldIndex: number;
  worldName: string;
  visualTheme: VisualThemeMode;
  isSpecialTheme: boolean;
}

export interface LightSource {
  id: string;
  name: string;
  type: 'firefly' | 'lava-stream' | 'neon-sign' | 'bioluminescent' | 'torch' | 'aurora' | 'crystal' | 'celestial';
  color: string;           // Base hex / rgb color
  radius: number;          // Base radius in pixels (scales with viewport)
  intensity: number;       // 0.0 to 1.0 brightness
  xRatio: number;          // Screen X ratio (0.0 to 1.0)
  yRatio: number;          // Screen Y ratio (0.0 to 1.0)
  pulseSpeed?: number;     // Pulsation speed
  pulseAmount?: number;    // Amplitude (0.0 to 1.0)
  flicker?: boolean;       // High frequency micro-flicker
  motionType?: 'firefly-drift' | 'lava-stream' | 'neon-sign' | 'torch-wobble' | 'crystal-pulse' | 'celestial-drift' | 'static';
  layer?: 'background' | 'midground' | 'foreground'; // Parallax depth plane
}

export type EnvironmentalLightSourceType =
  | 'solar-radiance'
  | 'lunar-directional'
  | 'dusty-solar'
  | 'stellar-nebula'
  | 'hydro-caustic'
  | 'sunset-rim'
  | 'lava-thermal'
  | 'torch-hearth'
  | 'bioluminescent-canopy'
  | 'desert-blaze'
  | 'aurora-ionization'
  | 'moonlit-nautical'
  | 'sugar-prismatic'
  | 'celestial-gilded'
  | 'neon-emissive'
  | 'toxic-radiant'
  | 'sky-aether'
  | 'furnace-copper'
  | 'sakura-twilight'
  | 'geode-fluorescent';

export interface EnvironmentalLightIdentity {
  type: EnvironmentalLightSourceType;
  sourceName: string;
  description: string;
  sourceXRatio: number;   // 0.0 - 1.0 (relative source position)
  sourceYRatio: number;   // 0.0 - 1.0
  baseIntensity: number;  // 0.0 - 1.0
  pulseType: 'steady' | 'magma-bubble' | 'neon-flicker' | 'caustic-ripple' | 'torch-flame' | 'aurora-wave' | 'god-ray-sweep';
  frequencyLabel: string;
  primaryColor: string;
  specularColor: string;
  ambientWashColor: string;
  shadowHardness: number; // 0.0 - 1.0 (1.0 = sharp vacuum shadows, 0.2 = soft atmospheric)
  directionalAngleDeg: number;
}

export interface CalculatedLightingState {
  identity: EnvironmentalLightIdentity;
  currentIntensity: number; // 0.0 - 1.0 real-time dynamic intensity
  pulseNormalized: number;  // -1.0 to 1.0
  sourceX: number;          // screen pixels
  sourceY: number;          // screen pixels
  effectiveColor: string;
  ambientLightLevel: number;
  shadowHardness: number;
  lightProfileDesc: string;
}

// Dynamic Weather Types & Configurations
export type WeatherType =
  | 'pollen-drift'
  | 'lunar-ejecta'
  | 'martian-sandstorm'
  | 'cosmic-stardust'
  | 'abyssal-bubbles'
  | 'ocean-spray'
  | 'volcanic-ash'
  | 'brazier-embers'
  | 'bioluminescent-spores'
  | 'desert-sand'
  | 'blizzard-snow'
  | 'coastal-mist'
  | 'sugar-crystals'
  | 'gilded-embers'
  | 'neon-rain'
  | 'toxic-droplets'
  | 'cloud-wisps'
  | 'steam-sparks'
  | 'sakura-petals'
  | 'amethyst-shards';

export type WeatherCategory = 'snow' | 'rain' | 'storm' | 'embers' | 'sand' | 'cosmic' | 'spores' | 'bubbles';

export type ParticleShape =
  | 'streak'
  | 'soft-circle'
  | 'crystal-flake'
  | 'petal-oval'
  | 'bubble-ring'
  | 'ember-spark'
  | 'rain-drop'
  | 'snow-crystal';

export interface WorldWeatherConfig {
  type: WeatherType;
  name: string;
  description: string;
  category: WeatherCategory;
  baseCount: number;
  baseSpeedX: number;
  baseSpeedY: number;
  turbulence: number;
  colors: string[];
  particleShape: ParticleShape;
  baseSize: number;
  glowColor?: string;
  glowBlur?: number;
  windGustFrequency: number;
  altitudeTransitionThreshold?: number; // Tower block height threshold where weather evolves
  altitudeWeatherName?: string;
  altitudeCategory?: WeatherCategory;
  altitudeParticleShape?: ParticleShape;
  altitudeColors?: string[];
  splashColor?: string;
  lightningEnabled?: boolean;
  lightningColor?: string;
}

export interface ParallaxLayerConfig {
  id: string;
  name: string;
  depth: number;           // 0.05 (infinite distance) to 1.45 (immediate foreground)
  speedRatio: number;      // Movement multiplier relative to camera altitude and drift
  ambientDriftX: number;   // Horizontal px/sec
  ambientDriftY: number;   // Vertical thermal breathing
}

export const DEFAULT_PARALLAX_LAYERS: ParallaxLayerConfig[] = [
  { id: 'celestial', name: 'Celestial & Deep Horizon Dome', depth: 0.05, speedRatio: 0.05, ambientDriftX: 0.35, ambientDriftY: 0.0 },
  { id: 'horizon', name: 'Distant Mountain Ranges & Skyline', depth: 0.20, speedRatio: 0.20, ambientDriftX: 1.1, ambientDriftY: 0.08 },
  { id: 'midground', name: 'Midground Terrain & Biome Spires', depth: 0.48, speedRatio: 0.48, ambientDriftX: 2.6, ambientDriftY: 0.16 },
  { id: 'nearground', name: 'Near Ground Deck & Low Ridges', depth: 0.82, speedRatio: 0.82, ambientDriftX: 4.8, ambientDriftY: 0.32 },
  { id: 'cloud-strata', name: 'Atmospheric Cloud Strata Decks', depth: 1.15, speedRatio: 1.15, ambientDriftX: 7.5, ambientDriftY: 0.65 },
  { id: 'milestones-thermals', name: 'Ascending Thermals & Altitude Markers', depth: 1.45, speedRatio: 1.45, ambientDriftX: 2.2, ambientDriftY: 1.2 },
];

export interface AltitudeMilestone {
  altitudeMeters: number;
  title: string;
  code: string;
  symbol: string;
  color: string;
  atmosphereTier: 'Surface Deck' | 'Troposphere' | 'Stratosphere' | 'Mesosphere' | 'Low Orbit';
}

export const ALTITUDE_MILESTONES: AltitudeMilestone[] = [
  { altitudeMeters: 0, title: 'Surface Deck', code: 'BASE-0', symbol: '⚓', color: '#38bdf8', atmosphereTier: 'Surface Deck' },
  { altitudeMeters: 15, title: 'Canopy Horizon', code: 'CANOPY-15', symbol: '🌲', color: '#4ade80', atmosphereTier: 'Surface Deck' },
  { altitudeMeters: 35, title: 'Lower Cloud Strata', code: 'STRATA-35', symbol: '☁️', color: '#67e8f9', atmosphereTier: 'Troposphere' },
  { altitudeMeters: 60, title: 'Cumulus Ceiling', code: 'CUMULUS-60', symbol: '⛅', color: '#bae6fd', atmosphereTier: 'Troposphere' },
  { altitudeMeters: 100, title: 'Tropopause Strata', code: 'TROPO-100', symbol: '⚡', color: '#facc15', atmosphereTier: 'Troposphere' },
  { altitudeMeters: 160, title: 'Stratosphere Gateway', code: 'STRATO-160', symbol: '✨', color: '#fb923c', atmosphereTier: 'Stratosphere' },
  { altitudeMeters: 250, title: 'Ozone Ionization', code: 'OZONE-250', symbol: '🌌', color: '#e879f9', atmosphereTier: 'Stratosphere' },
  { altitudeMeters: 400, title: 'Mesosphere Peak', code: 'MESO-400', symbol: '🛸', color: '#c084fc', atmosphereTier: 'Mesosphere' },
  { altitudeMeters: 650, title: 'Thermosphere Ascent', code: 'THERMO-650', symbol: '🚀', color: '#f43f5e', atmosphereTier: 'Mesosphere' },
  { altitudeMeters: 1000, title: 'Low Orbital Exosphere', code: 'ORBIT-1K', symbol: '🛰️', color: '#a855f7', atmosphereTier: 'Low Orbit' },
];

export interface EnvironmentPerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  droppedFrames: number;
  renderCount: number;
  canvasWidth: number;
  canvasHeight: number;
  bloomActive: boolean;
  depthHazeActive: boolean;
  lightingPassActive: boolean;
  weatherActive: boolean;
  parallaxActive: boolean;
  parallaxAltitudeMeters: number;
  parallaxAltitudePixels: number;
  parallaxVerticalVelocity: number;
  parallaxIntensity: number;
  parallaxLayersCount: number;
  activeAltitudeTier: 'Surface Deck' | 'Troposphere' | 'Stratosphere' | 'Mesosphere' | 'Low Orbit';
  activeMilestoneTitle: string;
  activeHazeColor: string;
  bloomIntensity: number;
  weatherIntensity: number;
  weatherHeightMultiplier: number;
  effectiveWeatherIntensity: number;
  weatherName: string;
  weatherType: WeatherType;
  weatherCategory: WeatherCategory;
  activeParticleCount: number;
  lightingState: CalculatedLightingState;
}

export const WORLD_NAMES: Record<number, string> = {
  0: 'Spring Meadow',
  1: 'Lunar Surface',
  2: 'Martian Canyon',
  3: 'Deep Space Nebula',
  4: 'Abyssal Coral Reef',
  5: 'Tropical Sunset Beach',
  6: 'Volcanic Caldera',
  7: 'Ancient Stone Citadel',
  8: 'Enchanted Redwood Forest',
  9: 'Golden Desert Oasis',
  10: 'Frozen Arctic Tundra',
  11: 'Pirate Corsair Cove',
  12: 'Candyland Confection',
  13: 'Golden El Dorado',
  14: 'Cyberpunk Megacity',
  15: 'Toxic Industrial Wasteland',
  16: 'Floating Sky Islands',
  17: 'Chrono Clockwork Realm',
  18: 'Sakura Blossom Shrine',
  19: 'Crystalline Geode Core',
};

// Atmospheric depth haze color profiles for authentic aerial perspective
interface WorldAtmosphereProfile {
  hazeColor: string;
  horizonRatio: number;
  density: number;
  emissiveBloomColor: string;
  emissiveIntensity: number;
}

const WORLD_ATMOSPHERES: Record<number, WorldAtmosphereProfile> = {
  0: { hazeColor: 'rgba(186, 230, 253, 0.22)', horizonRatio: 0.64, density: 0.24, emissiveBloomColor: '#fef08a', emissiveIntensity: 0.35 },
  1: { hazeColor: 'rgba(148, 163, 184, 0.08)', horizonRatio: 0.65, density: 0.12, emissiveBloomColor: '#38bdf8', emissiveIntensity: 0.4 },
  2: { hazeColor: 'rgba(234, 88, 12, 0.26)', horizonRatio: 0.62, density: 0.28, emissiveBloomColor: '#fed7aa', emissiveIntensity: 0.4 },
  3: { hazeColor: 'rgba(126, 34, 206, 0.18)', horizonRatio: 0.55, density: 0.22, emissiveBloomColor: '#c084fc', emissiveIntensity: 0.6 },
  4: { hazeColor: 'rgba(6, 182, 212, 0.28)', horizonRatio: 0.68, density: 0.32, emissiveBloomColor: '#22d3ee', emissiveIntensity: 0.45 },
  5: { hazeColor: 'rgba(249, 115, 22, 0.28)', horizonRatio: 0.65, density: 0.3, emissiveBloomColor: '#fef08a', emissiveIntensity: 0.55 },
  6: { hazeColor: 'rgba(220, 38, 38, 0.35)', horizonRatio: 0.68, density: 0.38, emissiveBloomColor: '#f59e0b', emissiveIntensity: 0.75 },
  7: { hazeColor: 'rgba(100, 116, 139, 0.22)', horizonRatio: 0.65, density: 0.24, emissiveBloomColor: '#f59e0b', emissiveIntensity: 0.45 },
  8: { hazeColor: 'rgba(16, 185, 129, 0.25)', horizonRatio: 0.66, density: 0.28, emissiveBloomColor: '#a7f3d0', emissiveIntensity: 0.55 },
  9: { hazeColor: 'rgba(234, 179, 8, 0.25)', horizonRatio: 0.65, density: 0.26, emissiveBloomColor: '#fef08a', emissiveIntensity: 0.45 },
  10: { hazeColor: 'rgba(186, 230, 253, 0.3)', horizonRatio: 0.62, density: 0.32, emissiveBloomColor: '#52e6ff', emissiveIntensity: 0.6 },
  11: { hazeColor: 'rgba(14, 116, 144, 0.25)', horizonRatio: 0.66, density: 0.26, emissiveBloomColor: '#fbbf24', emissiveIntensity: 0.45 },
  12: { hazeColor: 'rgba(244, 114, 182, 0.25)', horizonRatio: 0.68, density: 0.28, emissiveBloomColor: '#f43f5e', emissiveIntensity: 0.5 },
  13: { hazeColor: 'rgba(245, 158, 11, 0.35)', horizonRatio: 0.65, density: 0.36, emissiveBloomColor: '#fef08a', emissiveIntensity: 0.7 },
  14: { hazeColor: 'rgba(0, 240, 255, 0.28)', horizonRatio: 0.68, density: 0.34, emissiveBloomColor: '#00f0ff', emissiveIntensity: 0.8 },
  15: { hazeColor: 'rgba(132, 204, 22, 0.32)', horizonRatio: 0.68, density: 0.35, emissiveBloomColor: '#bef264', emissiveIntensity: 0.6 },
  16: { hazeColor: 'rgba(224, 242, 254, 0.32)', horizonRatio: 0.65, density: 0.3, emissiveBloomColor: '#38bdf8', emissiveIntensity: 0.45 },
  17: { hazeColor: 'rgba(217, 119, 6, 0.25)', horizonRatio: 0.68, density: 0.28, emissiveBloomColor: '#fbbf24', emissiveIntensity: 0.5 },
  18: { hazeColor: 'rgba(244, 114, 182, 0.28)', horizonRatio: 0.66, density: 0.28, emissiveBloomColor: '#fbcfe8', emissiveIntensity: 0.45 },
  19: { hazeColor: 'rgba(192, 132, 252, 0.32)', horizonRatio: 0.68, density: 0.34, emissiveBloomColor: '#c084fc', emissiveIntensity: 0.7 },
};

// Dynamic Weather Particle Configurations for All 20 Worlds
export const WORLD_WEATHER_CONFIGS: Record<number, WorldWeatherConfig> = {
  0: {
    type: 'pollen-drift',
    name: 'Spring Meadow Rain & Blossom Drift',
    description: 'Fresh spring rain shower mixed with floating dandelion seed tufts and verdant pollen flurries',
    category: 'rain',
    baseCount: 55,
    baseSpeedX: 0.035,
    baseSpeedY: 0.12,
    turbulence: 14,
    colors: ['#ffffff', '#bae6fd', '#7dd3fc', '#fef08a'],
    particleShape: 'rain-drop',
    baseSize: 3.2,
    windGustFrequency: 0.35,
    altitudeTransitionThreshold: 7,
    altitudeWeatherName: 'Spring Mountain Rain Shower',
    splashColor: '#7dd3fc',
  },
  1: {
    type: 'lunar-ejecta',
    name: 'Micrometeorite Regolith Powder',
    description: 'Subtle vacuum-floating ejecta particles glinting in harsh unattenuated solar rays',
    category: 'cosmic',
    baseCount: 35,
    baseSpeedX: 0.012,
    baseSpeedY: -0.008,
    turbulence: 8,
    colors: ['#f1f5f9', '#cbd5e1', '#94a3b8', '#38bdf8'],
    particleShape: 'crystal-flake',
    baseSize: 1.8,
    glowColor: '#38bdf8',
    glowBlur: 6,
    windGustFrequency: 0.05,
    altitudeTransitionThreshold: 12,
    altitudeWeatherName: 'Solar Ion Flux & Regolith Storm',
  },
  2: {
    type: 'martian-sandstorm',
    name: 'Martian Ochre Sandstorm Gusts',
    description: 'High-velocity swirling iron oxide mineral dust streamers and scree grit',
    category: 'sand',
    baseCount: 75,
    baseSpeedX: 0.09,
    baseSpeedY: 0.02,
    turbulence: 24,
    colors: ['#fed7aa', '#f97316', '#ea580c', '#c2410c'],
    particleShape: 'streak',
    baseSize: 3.8,
    glowColor: '#ea580c',
    glowBlur: 6,
    windGustFrequency: 0.8,
    altitudeTransitionThreshold: 10,
    altitudeWeatherName: 'Violent Iron Oxide Sand Gale',
  },
  3: {
    type: 'cosmic-stardust',
    name: 'Interstellar Cosmic Stardust',
    description: 'Prismatic twinkling stellar dust motes drifting across glowing nebula gas filaments',
    category: 'cosmic',
    baseCount: 60,
    baseSpeedX: 0.015,
    baseSpeedY: -0.012,
    turbulence: 14,
    colors: ['#e9d5ff', '#bfdbfe', '#ffffff', '#f472b6'],
    particleShape: 'crystal-flake',
    baseSize: 2.0,
    glowColor: '#c084fc',
    glowBlur: 8,
    windGustFrequency: 0.25,
    altitudeTransitionThreshold: 15,
    altitudeWeatherName: 'Hyper-Cosmic Stardust Shower',
  },
  4: {
    type: 'abyssal-bubbles',
    name: 'Hydrodynamic Bubbles & Marine Snow',
    description: 'Rising translucent ocean bubbles with refractive rims and deep-sea marine snow',
    category: 'bubbles',
    baseCount: 50,
    baseSpeedX: 0.012,
    baseSpeedY: -0.048,
    turbulence: 18,
    colors: ['rgba(34, 211, 238, 0.45)', 'rgba(255, 255, 255, 0.75)', 'rgba(103, 232, 249, 0.55)'],
    particleShape: 'bubble-ring',
    baseSize: 3.4,
    glowColor: '#22d3ee',
    glowBlur: 8,
    windGustFrequency: 0.4,
    altitudeTransitionThreshold: 10,
    altitudeWeatherName: 'Abyssal Thermal Vent Bubble Surge',
  },
  5: {
    type: 'ocean-spray',
    name: 'Golden Twilight Sun Shower',
    description: 'Misty coastal wave spray droplets and warm sunlit golden rain illuminated by low-angle sun',
    category: 'rain',
    baseCount: 60,
    baseSpeedX: 0.042,
    baseSpeedY: 0.14,
    turbulence: 16,
    colors: ['#fef08a', '#fed7aa', '#a5f3fc', '#ffffff'],
    particleShape: 'rain-drop',
    baseSize: 3.0,
    windGustFrequency: 0.5,
    altitudeTransitionThreshold: 8,
    altitudeWeatherName: 'Tropical Sunset Rain Gale',
    splashColor: '#fed7aa',
  },
  6: {
    type: 'volcanic-ash',
    name: 'Volcanic Ash & Magma Embers',
    description: 'Ascending incandescent volcanic cinders and turbulent dark basalt ash flakes',
    category: 'embers',
    baseCount: 85,
    baseSpeedX: 0.03,
    baseSpeedY: -0.08,
    turbulence: 26,
    colors: ['#fef08a', '#f97316', '#ef4444', '#fee2e2'],
    particleShape: 'ember-spark',
    baseSize: 3.2,
    glowColor: '#f97316',
    glowBlur: 12,
    windGustFrequency: 0.9,
    altitudeTransitionThreshold: 9,
    altitudeWeatherName: 'Volcanic Caldera Firestorm',
  },
  7: {
    type: 'brazier-embers',
    name: 'Citadel Mountain Rain & Hearth Embers',
    description: 'Cold grey mountain fortress rainfall carrying glowing orange embers from rampart braziers',
    category: 'rain',
    baseCount: 70,
    baseSpeedX: 0.05,
    baseSpeedY: 0.17,
    turbulence: 18,
    colors: ['#cbd5e1', '#94a3b8', '#f59e0b', '#ffffff'],
    particleShape: 'rain-drop',
    baseSize: 3.2,
    glowColor: '#f59e0b',
    glowBlur: 8,
    windGustFrequency: 0.65,
    altitudeTransitionThreshold: 8,
    altitudeWeatherName: 'Mountain Fortress Storm Downpour',
    splashColor: '#cbd5e1',
    lightningEnabled: true,
    lightningColor: 'rgba(241, 245, 249, 0.15)',
  },
  8: {
    type: 'bioluminescent-spores',
    name: 'Rainforest Canopy Drizzle & Spores',
    description: 'Temperate canopy rain drops filtered through ancient cedar boughs with glowing emerald spores',
    category: 'rain',
    baseCount: 65,
    baseSpeedX: 0.025,
    baseSpeedY: 0.12,
    turbulence: 18,
    colors: ['#6ee7b7', '#a7f3d0', '#34d399', '#ffffff'],
    particleShape: 'rain-drop',
    baseSize: 2.8,
    glowColor: '#10b981',
    glowBlur: 8,
    windGustFrequency: 0.35,
    altitudeTransitionThreshold: 8,
    altitudeWeatherName: 'Redwood Cloud Canopy Downpour',
    splashColor: '#6ee7b7',
  },
  9: {
    type: 'desert-sand',
    name: 'Golden Desert Simoom Sandstorm',
    description: 'High-velocity sand grains and shimmering quartz crystals lifted by desert thermal gusts',
    category: 'sand',
    baseCount: 70,
    baseSpeedX: 0.08,
    baseSpeedY: 0.015,
    turbulence: 20,
    colors: ['#fef08a', '#fde047', '#f59e0b', '#d97706'],
    particleShape: 'streak',
    baseSize: 3.0,
    glowColor: '#f59e0b',
    glowBlur: 6,
    windGustFrequency: 0.75,
    altitudeTransitionThreshold: 10,
    altitudeWeatherName: 'Searing Desert Gale Sandstorm',
  },
  10: {
    type: 'blizzard-snow',
    name: 'Arctic Blizzard & Ice Needles',
    description: 'Multi-depth crystalline snowflakes, intricate 6-point ice stars, and swirling subzero winddrifts',
    category: 'snow',
    baseCount: 95,
    baseSpeedX: 0.045,
    baseSpeedY: 0.065,
    turbulence: 22,
    colors: ['#ffffff', '#f0f9ff', '#e0f2fe', '#bae6fd'],
    particleShape: 'snow-crystal',
    baseSize: 3.4,
    glowColor: '#38bdf8',
    glowBlur: 6,
    windGustFrequency: 0.85,
    altitudeTransitionThreshold: 10,
    altitudeWeatherName: 'Subzero Alpine Whiteout Blizzard',
  },
  11: {
    type: 'coastal-mist',
    name: 'Nautical Tempest & Driving Ocean Rain',
    description: 'Torrential ocean rain streaks angled by gale-force sea winds and crashing saline surf foam',
    category: 'rain',
    baseCount: 85,
    baseSpeedX: 0.065,
    baseSpeedY: 0.20,
    turbulence: 22,
    colors: ['#38bdf8', '#7dd3fc', '#cbd5e1', '#ffffff'],
    particleShape: 'rain-drop',
    baseSize: 3.4,
    windGustFrequency: 0.7,
    altitudeTransitionThreshold: 8,
    altitudeWeatherName: 'High-Seas Hurricane Ocean Squall',
    splashColor: '#38bdf8',
    lightningEnabled: true,
    lightningColor: 'rgba(186, 230, 253, 0.18)',
  },
  12: {
    type: 'sugar-crystals',
    name: 'Glittering Sugar Crystal Snow',
    description: 'Sparkling confectionery sugar glass facets, pastel candy sprinkles, and spun-sugar snow crystals',
    category: 'snow',
    baseCount: 65,
    baseSpeedX: 0.025,
    baseSpeedY: 0.045,
    turbulence: 18,
    colors: ['#ffffff', '#fbcfe8', '#f43f5e', '#38bdf8', '#fef08a'],
    particleShape: 'crystal-flake',
    baseSize: 2.8,
    glowColor: '#fbcfe8',
    glowBlur: 6,
    windGustFrequency: 0.4,
    altitudeTransitionThreshold: 9,
    altitudeWeatherName: 'Confectionery Spun-Sugar Snowstorm',
  },
  13: {
    type: 'gilded-embers',
    name: 'Sacred 24K Gold Foil Flakes',
    description: 'Ascending solar gold foil motes and divine celestial golden raindrops caught in sunbeams',
    category: 'embers',
    baseCount: 70,
    baseSpeedX: 0.025,
    baseSpeedY: -0.045,
    turbulence: 20,
    colors: ['#fef08a', '#fbbf24', '#f59e0b', '#ffffff'],
    particleShape: 'ember-spark',
    baseSize: 3.0,
    glowColor: '#fde047',
    glowBlur: 10,
    windGustFrequency: 0.5,
    altitudeTransitionThreshold: 10,
    altitudeWeatherName: 'Celestial El Dorado Gold Rain',
  },
  14: {
    type: 'neon-rain',
    name: 'Cyberpunk Neon Acid Rainstorm',
    description: 'High-speed diagonal luminescent rain streaks in electric cyan and magenta with surface splashes',
    category: 'rain',
    baseCount: 95,
    baseSpeedX: -0.055,
    baseSpeedY: 0.23,
    turbulence: 12,
    colors: ['#00f0ff', '#f472b6', '#a855f7', '#ffffff'],
    particleShape: 'rain-drop',
    baseSize: 4.5,
    glowColor: '#00f0ff',
    glowBlur: 10,
    windGustFrequency: 0.6,
    altitudeTransitionThreshold: 8,
    altitudeWeatherName: 'Torrential Megacity Cyber Downpour',
    splashColor: '#00f0ff',
    lightningEnabled: true,
    lightningColor: 'rgba(0, 240, 255, 0.18)',
  },
  15: {
    type: 'toxic-droplets',
    name: 'Phosphorescent Toxic Acid Rain',
    description: 'Corrosive isotope vapor droplets and glowing acidic downpour with bubbling puddles',
    category: 'rain',
    baseCount: 70,
    baseSpeedX: 0.035,
    baseSpeedY: 0.16,
    turbulence: 20,
    colors: ['#bef264', '#a3e635', '#4d7c0f', '#ffffff'],
    particleShape: 'rain-drop',
    baseSize: 3.2,
    glowColor: '#bef264',
    glowBlur: 8,
    windGustFrequency: 0.45,
    altitudeTransitionThreshold: 8,
    altitudeWeatherName: 'Corrosive Acid Rain Deluge',
    splashColor: '#bef264',
    lightningEnabled: true,
    lightningColor: 'rgba(190, 242, 100, 0.16)',
  },
  16: {
    type: 'cloud-wisps',
    name: 'High-Altitude Cloudburst & Alpine Snow',
    description: 'Weightless tropospheric cumulus condensation motes transitioning into alpine snow flurries',
    category: 'snow',
    baseCount: 70,
    baseSpeedX: 0.04,
    baseSpeedY: 0.055,
    turbulence: 18,
    colors: ['#ffffff', '#e0f2fe', '#bae6fd'],
    particleShape: 'crystal-flake',
    baseSize: 3.2,
    glowColor: '#38bdf8',
    glowBlur: 6,
    windGustFrequency: 0.4,
    altitudeTransitionThreshold: 8,
    altitudeWeatherName: 'Stratospheric Alpine Snow Flurries',
  },
  17: {
    type: 'steam-sparks',
    name: 'Escaping Steam Vents & Brass Rain',
    description: 'Pressurized white steam vapor puffs and glowing golden friction sparks from clockwork gears',
    category: 'embers',
    baseCount: 65,
    baseSpeedX: 0.025,
    baseSpeedY: -0.045,
    turbulence: 20,
    colors: ['#fef3c7', '#fbbf24', '#f59e0b', '#ffffff'],
    particleShape: 'ember-spark',
    baseSize: 2.8,
    glowColor: '#f59e0b',
    glowBlur: 6,
    windGustFrequency: 0.6,
    altitudeTransitionThreshold: 10,
    altitudeWeatherName: 'Overclocked Clockwork Spark Deluge',
  },
  18: {
    type: 'sakura-petals',
    name: 'Sakura Petals & Twilight Drizzle',
    description: 'Delicate pink cherry blossom petals tumbling through a gentle, serene twilight spring rain shower',
    category: 'rain',
    baseCount: 70,
    baseSpeedX: 0.045,
    baseSpeedY: 0.08,
    turbulence: 22,
    colors: ['#fbcfe8', '#f472b6', '#fda4af', '#ffffff', '#bae6fd'],
    particleShape: 'petal-oval',
    baseSize: 4.5,
    windGustFrequency: 0.4,
    altitudeTransitionThreshold: 8,
    altitudeWeatherName: 'Twilight Blossom Spring Gale',
    splashColor: '#fbcfe8',
  },
  19: {
    type: 'amethyst-shards',
    name: 'Faceted Amethyst Crystal Snow',
    description: 'Shimmering violet geode crystal dust and faceted gem flakes falling like prismatic snow',
    category: 'snow',
    baseCount: 65,
    baseSpeedX: 0.022,
    baseSpeedY: 0.048,
    turbulence: 18,
    colors: ['#e9d5ff', '#c084fc', '#9333ea', '#ffffff', '#38bdf8'],
    particleShape: 'crystal-flake',
    baseSize: 2.6,
    glowColor: '#c084fc',
    glowBlur: 8,
    windGustFrequency: 0.35,
    altitudeTransitionThreshold: 10,
    altitudeWeatherName: 'Prismatic Crystal Shard Flurry',
  },
};

// Static seed pool for deterministic, zero-allocation multi-layer particle math
interface SeedParticle {
  offsetX: number;
  offsetY: number;
  sizeFactor: number;
  speedFactor: number;
  colorIdx: number;
  phase: number;
  rotSpeed: number;
  depthLayer: 0 | 1 | 2; // 0 = background (far/fine, 30%), 1 = midground (55%), 2 = foreground (near/cinematic, 15%)
  flutterFreq: number;
  secondaryOffset: number;
}

const MAX_WEATHER_PARTICLES = 260;
const PARTICLE_SEED_POOL: SeedParticle[] = Array.from({ length: MAX_WEATHER_PARTICLES }, (_, i) => {
  const depthLayer: 0 | 1 | 2 = i % 7 === 0 ? 2 : (i % 3 === 0 ? 0 : 1);
  return {
    offsetX: ((i * 137.508 + 47.1) % 1000) / 1000,
    offsetY: ((i * 269.311 + 83.7) % 1000) / 1000,
    sizeFactor: depthLayer === 2 
      ? 1.45 + (((i * 37.1) % 100) / 100) * 0.95 
      : (depthLayer === 0 ? 0.45 + (((i * 29.3) % 100) / 100) * 0.35 : 0.75 + (((i * 49.3) % 100) / 100) * 0.55),
    speedFactor: depthLayer === 2 
      ? 1.25 + (((i * 51.7) % 100) / 100) * 0.35 
      : (depthLayer === 0 ? 0.7 + (((i * 61.2) % 100) / 100) * 0.3 : 0.9 + (((i * 81.7) % 100) / 100) * 0.4),
    colorIdx: i % 5,
    phase: (i * 1.341) % (Math.PI * 2),
    rotSpeed: (((i % 9) - 4) * 0.003) + 0.0015,
    depthLayer,
    flutterFreq: 0.8 + ((i % 5) * 0.3),
    secondaryOffset: ((i * 73.1) % 100) / 100,
  };
});

// World-Specific Environmental Light Source Identities
export const WORLD_LIGHT_IDENTITIES: Record<number, EnvironmentalLightIdentity> = {
  0: {
    type: 'solar-radiance',
    sourceName: 'Morning Solar Radiance',
    description: 'Warm morning sunbeam diffusion with gentle meadow ray scattering',
    sourceXRatio: 0.22,
    sourceYRatio: 0.22,
    baseIntensity: 0.75,
    pulseType: 'god-ray-sweep',
    frequencyLabel: '0.2 Hz Solar Sweep',
    primaryColor: '#fef08a',
    specularColor: '#ffffff',
    ambientWashColor: 'rgba(254, 240, 138, 0.12)',
    shadowHardness: 0.45,
    directionalAngleDeg: 125,
  },
  1: {
    type: 'lunar-directional',
    sourceName: 'Stark Lunar Solar Glare',
    description: 'Harsh vacuum directional sunlight casting razor-sharp crater shadows and cold Earthshine',
    sourceXRatio: 0.78,
    sourceYRatio: 0.28,
    baseIntensity: 0.95,
    pulseType: 'steady',
    frequencyLabel: '0.0 Hz Vacuum Constant',
    primaryColor: '#f8fafc',
    specularColor: '#38bdf8',
    ambientWashColor: 'rgba(56, 189, 248, 0.08)',
    shadowHardness: 0.96, // Crisp vacuum shadow contrast
    directionalAngleDeg: 215,
  },
  2: {
    type: 'dusty-solar',
    sourceName: 'Martian Ochre Solar Scatter',
    description: 'Diffused small sun filtered through suspended iron oxide mineral dust',
    sourceXRatio: 0.28,
    sourceYRatio: 0.26,
    baseIntensity: 0.72,
    pulseType: 'steady',
    frequencyLabel: '0.1 Hz Dust Modulation',
    primaryColor: '#fed7aa',
    specularColor: '#f97316',
    ambientWashColor: 'rgba(234, 88, 12, 0.16)',
    shadowHardness: 0.65,
    directionalAngleDeg: 135,
  },
  3: {
    type: 'stellar-nebula',
    sourceName: 'Cosmic Stellar Nebula Glow',
    description: 'Omni-directional interstellar radiation from violet and cyan ion gas clouds',
    sourceXRatio: 0.35,
    sourceYRatio: 0.35,
    baseIntensity: 0.68,
    pulseType: 'aurora-wave',
    frequencyLabel: '0.3 Hz Stellar Fluctuation',
    primaryColor: '#c084fc',
    specularColor: '#38bdf8',
    ambientWashColor: 'rgba(168, 85, 247, 0.15)',
    shadowHardness: 0.25,
    directionalAngleDeg: 90,
  },
  4: {
    type: 'hydro-caustic',
    sourceName: 'Abyssal Hydro-Caustic Beams',
    description: 'Refracted surface wave sunlight caustics and bioluminescent coral polyps',
    sourceXRatio: 0.5,
    sourceYRatio: 0.05,
    baseIntensity: 0.74,
    pulseType: 'caustic-ripple',
    frequencyLabel: '1.2 Hz Caustic Wave',
    primaryColor: '#22d3ee',
    specularColor: '#67e8f9',
    ambientWashColor: 'rgba(6, 182, 212, 0.18)',
    shadowHardness: 0.35,
    directionalAngleDeg: 80,
  },
  5: {
    type: 'sunset-rim',
    sourceName: 'Low Horizon Solar Glare',
    description: 'Intense low-angle golden hour solar disk casting elongated shadows across ocean water',
    sourceXRatio: 0.48,
    sourceYRatio: 0.58,
    baseIntensity: 0.88,
    pulseType: 'steady',
    frequencyLabel: '0.1 Hz Golden Hour',
    primaryColor: '#f59e0b',
    specularColor: '#fef08a',
    ambientWashColor: 'rgba(249, 115, 22, 0.22)',
    shadowHardness: 0.70,
    directionalAngleDeg: 75,
  },
  6: {
    type: 'lava-thermal',
    sourceName: 'Molten Magma Thermal Convection',
    description: 'Intense upward thermal radiation from boiling lava lake with bubbling heat fissures',
    sourceXRatio: 0.5,
    sourceYRatio: 0.85, // Lower caldera radiating upward
    baseIntensity: 0.84,
    pulseType: 'magma-bubble',
    frequencyLabel: '1.8 Hz Thermal Pulsation',
    primaryColor: '#ff5500',
    specularColor: '#fef08a',
    ambientWashColor: 'rgba(239, 68, 68, 0.24)',
    shadowHardness: 0.52,
    directionalAngleDeg: 270, // Upward illumination
  },
  7: {
    type: 'torch-hearth',
    sourceName: 'Citadel Torchlight & Silver Moon',
    description: 'Dynamic flickering stone braziers contrasting with serene high-altitude silver moonbeams',
    sourceXRatio: 0.82,
    sourceYRatio: 0.22,
    baseIntensity: 0.76,
    pulseType: 'torch-flame',
    frequencyLabel: '3.2 Hz Brazier Flicker',
    primaryColor: '#f59e0b',
    specularColor: '#f8fafc',
    ambientWashColor: 'rgba(245, 158, 11, 0.14)',
    shadowHardness: 0.68,
    directionalAngleDeg: 195,
  },
  8: {
    type: 'bioluminescent-canopy',
    sourceName: 'Mystic Spore & Canopy Dappling',
    description: 'Emerald sunbeams filtering through ancient redwood foliage and pulsing firefly clusters',
    sourceXRatio: 0.5,
    sourceYRatio: 0.1,
    baseIntensity: 0.70,
    pulseType: 'aurora-wave',
    frequencyLabel: '0.8 Hz Spore Pulse',
    primaryColor: '#6ee7b7',
    specularColor: '#a7f3d0',
    ambientWashColor: 'rgba(16, 185, 129, 0.15)',
    shadowHardness: 0.38,
    directionalAngleDeg: 85,
  },
  9: {
    type: 'desert-blaze',
    sourceName: 'High Zenith Desert Blaze',
    description: 'Blistering high-noon solar glare and golden dune heat mirage refraction',
    sourceXRatio: 0.5,
    sourceYRatio: 0.26,
    baseIntensity: 0.92,
    pulseType: 'steady',
    frequencyLabel: '0.1 Hz Mirage Flux',
    primaryColor: '#ffffff',
    specularColor: '#fef08a',
    ambientWashColor: 'rgba(234, 179, 8, 0.2)',
    shadowHardness: 0.85,
    directionalAngleDeg: 90,
  },
  10: {
    type: 'aurora-ionization',
    sourceName: 'Polar Aurora Ionization',
    description: 'Geomagnetic solar wind curtain excitation bouncing off snowfields and glacial ice',
    sourceXRatio: 0.5,
    sourceYRatio: 0.25,
    baseIntensity: 0.74,
    pulseType: 'aurora-wave',
    frequencyLabel: '0.5 Hz Ion Wave',
    primaryColor: '#34d399',
    specularColor: '#38bdf8',
    ambientWashColor: 'rgba(56, 189, 248, 0.16)',
    shadowHardness: 0.32,
    directionalAngleDeg: 95,
  },
  11: {
    type: 'moonlit-nautical',
    sourceName: 'Storm Lantern & Ocean Gleam',
    description: 'Warm brass hurricane lanterns illuminating weathered timber against cold coastal sea swell',
    sourceXRatio: 0.28,
    sourceYRatio: 0.24,
    baseIntensity: 0.72,
    pulseType: 'torch-flame',
    frequencyLabel: '2.4 Hz Lantern Wave',
    primaryColor: '#fbbf24',
    specularColor: '#94a3b8',
    ambientWashColor: 'rgba(217, 119, 6, 0.14)',
    shadowHardness: 0.62,
    directionalAngleDeg: 145,
  },
  12: {
    type: 'sugar-prismatic',
    sourceName: 'Crystalline Sugar Prismatic Luster',
    description: 'Specular internal diamond refractions from ruby sugar jewels and glossy cream glaze',
    sourceXRatio: 0.52,
    sourceYRatio: 0.69,
    baseIntensity: 0.78,
    pulseType: 'caustic-ripple',
    frequencyLabel: '1.0 Hz Sugar Sheen',
    primaryColor: '#f43f5e',
    specularColor: '#ffffff',
    ambientWashColor: 'rgba(244, 114, 182, 0.16)',
    shadowHardness: 0.40,
    directionalAngleDeg: 110,
  },
  13: {
    type: 'celestial-gilded',
    sourceName: 'Sacred Gilded Sunbeam Dais',
    description: 'Monumental divine god rays bouncing off mirror-sheen 24K solid gold temple architecture',
    sourceXRatio: 0.5,
    sourceYRatio: 0.15,
    baseIntensity: 0.94,
    pulseType: 'god-ray-sweep',
    frequencyLabel: '0.4 Hz Celestial Harmonic',
    primaryColor: '#fef08a',
    specularColor: '#f59e0b',
    ambientWashColor: 'rgba(245, 158, 11, 0.25)',
    shadowHardness: 0.58,
    directionalAngleDeg: 90,
  },
  14: {
    type: 'neon-emissive',
    sourceName: 'High-Voltage Neon Billboard Matrix',
    description: 'High-intensity multi-spectral cyan & magenta signage with AC electrical hum flicker on wet asphalt',
    sourceXRatio: 0.45,
    sourceYRatio: 0.52,
    baseIntensity: 0.90,
    pulseType: 'neon-flicker',
    frequencyLabel: '60 Hz AC Transformer',
    primaryColor: '#00f0ff',
    specularColor: '#f43f5e',
    ambientWashColor: 'rgba(0, 240, 255, 0.22)',
    shadowHardness: 0.75,
    directionalAngleDeg: 160,
  },
  15: {
    type: 'toxic-radiant',
    sourceName: 'Isotope Chemiluminescence',
    description: 'Subterranean chemical lagoon emitting eerie radioactive phosphor-green photons',
    sourceXRatio: 0.5,
    sourceYRatio: 0.8,
    baseIntensity: 0.78,
    pulseType: 'magma-bubble',
    frequencyLabel: '1.4 Hz Decay Pulse',
    primaryColor: '#bef264',
    specularColor: '#84cc16',
    ambientWashColor: 'rgba(132, 204, 22, 0.22)',
    shadowHardness: 0.48,
    directionalAngleDeg: 270,
  },
  16: {
    type: 'sky-aether',
    sourceName: 'High-Altitude Aether Rays',
    description: 'Pristine tropospheric solar brilliance illuminating cloud canyons and levitating islands',
    sourceXRatio: 0.5,
    sourceYRatio: 0.2,
    baseIntensity: 0.82,
    pulseType: 'steady',
    frequencyLabel: '0.2 Hz Cloud Drift',
    primaryColor: '#38bdf8',
    specularColor: '#ffffff',
    ambientWashColor: 'rgba(56, 189, 248, 0.16)',
    shadowHardness: 0.55,
    directionalAngleDeg: 100,
  },
  17: {
    type: 'furnace-copper',
    sourceName: 'Steam Furnace & Polished Brass',
    description: 'Deep boiler hearth combustion glow glinting off rotating gear trains and copper pipes',
    sourceXRatio: 0.25,
    sourceYRatio: 0.45,
    baseIntensity: 0.76,
    pulseType: 'torch-flame',
    frequencyLabel: '2.0 Hz Boiler Draft',
    primaryColor: '#f59e0b',
    specularColor: '#fbbf24',
    ambientWashColor: 'rgba(217, 119, 6, 0.18)',
    shadowHardness: 0.65,
    directionalAngleDeg: 140,
  },
  18: {
    type: 'sakura-twilight',
    sourceName: 'Mount Fuji Twilight Alpenglow',
    description: 'Soft crimson sunset scatter illuminating sacred torii archways and pagoda tiers',
    sourceXRatio: 0.5,
    sourceYRatio: 0.4,
    baseIntensity: 0.74,
    pulseType: 'steady',
    frequencyLabel: '0.1 Hz Twilight Dusk',
    primaryColor: '#fbcfe8',
    specularColor: '#f472b6',
    ambientWashColor: 'rgba(244, 114, 182, 0.18)',
    shadowHardness: 0.42,
    directionalAngleDeg: 115,
  },
  19: {
    type: 'geode-fluorescent',
    sourceName: 'Amethyst Crystal Fluorescence',
    description: 'Deep subterranean geode resonance emitting violet and ultraviolet crystal facet flares',
    sourceXRatio: 0.5,
    sourceYRatio: 0.72,
    baseIntensity: 0.82,
    pulseType: 'aurora-wave',
    frequencyLabel: '0.9 Hz Crystal Resonance',
    primaryColor: '#c084fc',
    specularColor: '#ffffff',
    ambientWashColor: 'rgba(192, 132, 252, 0.22)',
    shadowHardness: 0.52,
    directionalAngleDeg: 260,
  },
};

// Dynamic LightSource objects per biome mapping color, radius, intensity, and motion
export const BIOME_LIGHT_SOURCES: Record<number, LightSource[]> = {
  // Biome 0: Spring Meadow (drifting golden fireflies & morning sunbeam)
  0: [
    { id: 'sun-0', name: 'Spring Sunbeam', type: 'celestial', color: '#fef08a', radius: 340, intensity: 0.78, xRatio: 0.22, yRatio: 0.22, pulseSpeed: 0.2, pulseAmount: 0.15, motionType: 'celestial-drift', layer: 'background' },
    { id: 'firefly-1', name: 'Meadow Firefly Alpha', type: 'firefly', color: '#fde047', radius: 65, intensity: 0.92, xRatio: 0.35, yRatio: 0.74, pulseSpeed: 1.8, pulseAmount: 0.45, flicker: true, motionType: 'firefly-drift', layer: 'foreground' },
    { id: 'firefly-2', name: 'Meadow Firefly Beta', type: 'firefly', color: '#a3e635', radius: 55, intensity: 0.88, xRatio: 0.68, yRatio: 0.78, pulseSpeed: 2.2, pulseAmount: 0.5, flicker: true, motionType: 'firefly-drift', layer: 'foreground' },
    { id: 'firefly-3', name: 'Meadow Firefly Gamma', type: 'firefly', color: '#fef08a', radius: 75, intensity: 0.85, xRatio: 0.18, yRatio: 0.70, pulseSpeed: 1.4, pulseAmount: 0.4, flicker: true, motionType: 'firefly-drift', layer: 'midground' },
  ],
  // Biome 1: Lunar Surface
  1: [
    { id: 'earthshine-1', name: 'Earthshine Reflection', type: 'celestial', color: '#bae6fd', radius: 360, intensity: 0.65, xRatio: 0.25, yRatio: 0.20, pulseSpeed: 0.1, pulseAmount: 0.05, motionType: 'static', layer: 'background' },
    { id: 'beacon-1', name: 'Lunar Lander High-Gain Beacon', type: 'crystal', color: '#f8fafc', radius: 95, intensity: 0.95, xRatio: 0.72, yRatio: 0.75, pulseSpeed: 3.5, pulseAmount: 0.6, flicker: true, motionType: 'crystal-pulse', layer: 'midground' },
  ],
  // Biome 2: Martian Canyon
  2: [
    { id: 'sun-2', name: 'Martian Ochre Sun Flare', type: 'celestial', color: '#fed7aa', radius: 280, intensity: 0.72, xRatio: 0.28, yRatio: 0.26, pulseSpeed: 0.3, pulseAmount: 0.15, motionType: 'celestial-drift', layer: 'background' },
    { id: 'rover-2', name: 'Rover Floodlight', type: 'torch', color: '#fde047', radius: 110, intensity: 0.88, xRatio: 0.65, yRatio: 0.76, pulseSpeed: 1.2, pulseAmount: 0.25, motionType: 'torch-wobble', layer: 'foreground' },
  ],
  // Biome 3: Deep Space
  3: [
    { id: 'pulsar-3', name: 'Cosmic Pulsar Core', type: 'crystal', color: '#c084fc', radius: 310, intensity: 0.85, xRatio: 0.35, yRatio: 0.35, pulseSpeed: 2.8, pulseAmount: 0.4, motionType: 'crystal-pulse', layer: 'background' },
    { id: 'nebula-3', name: 'Ionization Gas Node', type: 'aurora', color: '#38bdf8', radius: 220, intensity: 0.65, xRatio: 0.75, yRatio: 0.45, pulseSpeed: 0.8, pulseAmount: 0.3, motionType: 'static', layer: 'background' },
  ],
  // Biome 4: Abyssal Coral
  4: [
    { id: 'caustic-4', name: 'Surface Ocean Caustics', type: 'celestial', color: '#22d3ee', radius: 320, intensity: 0.68, xRatio: 0.50, yRatio: 0.08, pulseSpeed: 1.4, pulseAmount: 0.3, motionType: 'celestial-drift', layer: 'background' },
    { id: 'polyp-4a', name: 'Bioluminescent Coral Polyp', type: 'bioluminescent', color: '#06b6d4', radius: 110, intensity: 0.90, xRatio: 0.28, yRatio: 0.78, pulseSpeed: 1.6, pulseAmount: 0.35, motionType: 'crystal-pulse', layer: 'midground' },
    { id: 'polyp-4b', name: 'Abyssal Jellyfish Cluster', type: 'bioluminescent', color: '#ec4899', radius: 95, intensity: 0.86, xRatio: 0.74, yRatio: 0.68, pulseSpeed: 1.9, pulseAmount: 0.4, motionType: 'firefly-drift', layer: 'foreground' },
  ],
  // Biome 5: Tropical Beach
  5: [
    { id: 'sunset-5', name: 'Low Horizon Solar Disc', type: 'celestial', color: '#f59e0b', radius: 320, intensity: 0.86, xRatio: 0.48, yRatio: 0.58, pulseSpeed: 0.2, pulseAmount: 0.12, motionType: 'celestial-drift', layer: 'background' },
    { id: 'torch-5', name: 'Beachfront Tiki Torch', type: 'torch', color: '#ff6600', radius: 105, intensity: 0.92, xRatio: 0.82, yRatio: 0.80, pulseSpeed: 2.5, pulseAmount: 0.35, flicker: true, motionType: 'torch-wobble', layer: 'foreground' },
  ],
  // Biome 6: Volcano (cascading lava streams & magma sparks)
  6: [
    { id: 'lava-6a', name: 'Upper Caldera Lava Stream', type: 'lava-stream', color: '#ff3700', radius: 195, intensity: 0.96, xRatio: 0.38, yRatio: 0.62, pulseSpeed: 1.6, pulseAmount: 0.35, motionType: 'lava-stream', layer: 'midground' },
    { id: 'lava-6b', name: 'Boiling Magma Convection Pool', type: 'lava-stream', color: '#ff7700', radius: 280, intensity: 0.92, xRatio: 0.55, yRatio: 0.88, pulseSpeed: 1.9, pulseAmount: 0.4, motionType: 'lava-stream', layer: 'foreground' },
    { id: 'spark-6c', name: 'Volcanic Magma Ember', type: 'firefly', color: '#fde047', radius: 50, intensity: 0.95, xRatio: 0.45, yRatio: 0.70, pulseSpeed: 3.2, pulseAmount: 0.55, flicker: true, motionType: 'firefly-drift', layer: 'foreground' },
  ],
  // Biome 7: Castle
  7: [
    { id: 'torch-7a', name: 'Rampart Stone Brazier Left', type: 'torch', color: '#f59e0b', radius: 125, intensity: 0.88, xRatio: 0.22, yRatio: 0.68, pulseSpeed: 2.2, pulseAmount: 0.3, flicker: true, motionType: 'torch-wobble', layer: 'midground' },
    { id: 'torch-7b', name: 'Rampart Stone Brazier Right', type: 'torch', color: '#f59e0b', radius: 125, intensity: 0.88, xRatio: 0.78, yRatio: 0.68, pulseSpeed: 2.4, pulseAmount: 0.3, flicker: true, motionType: 'torch-wobble', layer: 'midground' },
    { id: 'window-7', name: 'Stained Glass Rose Window', type: 'crystal', color: '#a855f7', radius: 150, intensity: 0.72, xRatio: 0.50, yRatio: 0.42, pulseSpeed: 0.5, pulseAmount: 0.15, motionType: 'crystal-pulse', layer: 'background' },
  ],
  // Biome 8: Enchanted Forest
  8: [
    { id: 'fairy-8a', name: 'Spectral Spirit Wisp Alpha', type: 'firefly', color: '#34d399', radius: 75, intensity: 0.90, xRatio: 0.30, yRatio: 0.65, pulseSpeed: 1.8, pulseAmount: 0.45, flicker: true, motionType: 'firefly-drift', layer: 'foreground' },
    { id: 'fairy-8b', name: 'Spectral Spirit Wisp Beta', type: 'firefly', color: '#38bdf8', radius: 65, intensity: 0.85, xRatio: 0.70, yRatio: 0.72, pulseSpeed: 2.1, pulseAmount: 0.5, flicker: true, motionType: 'firefly-drift', layer: 'foreground' },
    { id: 'mushroom-8', name: 'Bioluminescent Mushroom Ring', type: 'bioluminescent', color: '#2dd4bf', radius: 120, intensity: 0.82, xRatio: 0.50, yRatio: 0.85, pulseSpeed: 1.2, pulseAmount: 0.3, motionType: 'crystal-pulse', layer: 'foreground' },
  ],
  // Biome 9: Golden Desert
  9: [
    { id: 'sun-9', name: 'Desert Solar Blaze Mirage', type: 'celestial', color: '#fbbf24', radius: 340, intensity: 0.90, xRatio: 0.45, yRatio: 0.25, pulseSpeed: 0.4, pulseAmount: 0.18, motionType: 'celestial-drift', layer: 'background' },
    { id: 'rune-9', name: 'Ancient Obelisk Core', type: 'crystal', color: '#60a5fa', radius: 115, intensity: 0.84, xRatio: 0.75, yRatio: 0.70, pulseSpeed: 1.6, pulseAmount: 0.35, motionType: 'crystal-pulse', layer: 'midground' },
  ],
  // Biome 10: Winter Blizzard
  10: [
    { id: 'aurora-10', name: 'Aurora Borealis Ionization', type: 'aurora', color: '#4ade80', radius: 290, intensity: 0.76, xRatio: 0.50, yRatio: 0.28, pulseSpeed: 1.1, pulseAmount: 0.35, motionType: 'static', layer: 'background' },
    { id: 'lantern-10', name: 'Frost Cavern Lantern', type: 'crystal', color: '#93c5fd', radius: 110, intensity: 0.82, xRatio: 0.25, yRatio: 0.75, pulseSpeed: 1.4, pulseAmount: 0.25, motionType: 'crystal-pulse', layer: 'foreground' },
  ],
  // Biome 11: Pirate Cove
  11: [
    { id: 'lantern-11', name: 'Galleon Stern Lantern', type: 'torch', color: '#f59e0b', radius: 120, intensity: 0.90, xRatio: 0.32, yRatio: 0.62, pulseSpeed: 1.8, pulseAmount: 0.35, flicker: true, motionType: 'torch-wobble', layer: 'midground' },
    { id: 'chest-11', name: 'Cursed Gold Chest Glow', type: 'crystal', color: '#10b981', radius: 125, intensity: 0.80, xRatio: 0.75, yRatio: 0.82, pulseSpeed: 1.3, pulseAmount: 0.3, motionType: 'crystal-pulse', layer: 'foreground' },
  ],
  // Biome 12: Candyland
  12: [
    { id: 'neon-12', name: 'Peppermint Neon Cane Sign', type: 'neon-sign', color: '#fb7185', radius: 145, intensity: 0.88, xRatio: 0.28, yRatio: 0.65, pulseSpeed: 2.2, pulseAmount: 0.25, flicker: true, motionType: 'neon-sign', layer: 'midground' },
    { id: 'crystal-12', name: 'Prismatic Marshmallow Glow', type: 'bioluminescent', color: '#67e8f9', radius: 130, intensity: 0.80, xRatio: 0.72, yRatio: 0.75, pulseSpeed: 1.5, pulseAmount: 0.3, motionType: 'crystal-pulse', layer: 'foreground' },
  ],
  // Biome 13: Golden Legend
  13: [
    { id: 'altar-13', name: 'Divine Sun Altar Radiance', type: 'celestial', color: '#fef08a', radius: 330, intensity: 0.95, xRatio: 0.50, yRatio: 0.35, pulseSpeed: 0.5, pulseAmount: 0.2, motionType: 'celestial-drift', layer: 'background' },
    { id: 'brazier-13', name: 'Golden Altar Brazier', type: 'torch', color: '#f59e0b', radius: 135, intensity: 0.85, xRatio: 0.78, yRatio: 0.78, pulseSpeed: 2.0, pulseAmount: 0.3, flicker: true, motionType: 'torch-wobble', layer: 'foreground' },
  ],
  // Biome 14: Cyberpunk (flickering neon signs & sodium vapor streetlamp)
  14: [
    { id: 'neon-14a', name: 'Holographic Cyber Billboard', type: 'neon-sign', color: '#06b6d4', radius: 210, intensity: 0.96, xRatio: 0.26, yRatio: 0.45, pulseSpeed: 3.2, pulseAmount: 0.35, flicker: true, motionType: 'neon-sign', layer: 'midground' },
    { id: 'neon-14b', name: 'Vertical Kanji Neon Sign', type: 'neon-sign', color: '#f43f5e', radius: 175, intensity: 0.92, xRatio: 0.76, yRatio: 0.52, pulseSpeed: 2.8, pulseAmount: 0.4, flicker: true, motionType: 'neon-sign', layer: 'midground' },
    { id: 'street-14', name: 'Sodium Vapor Streetlamp', type: 'torch', color: '#f59e0b', radius: 140, intensity: 0.78, xRatio: 0.50, yRatio: 0.82, pulseSpeed: 1.0, pulseAmount: 0.15, motionType: 'static', layer: 'foreground' },
  ],
  // Biome 15: Toxic Wasteland
  15: [
    { id: 'sludge-15', name: 'Radioactive Sludge Stream', type: 'lava-stream', color: '#84cc16', radius: 220, intensity: 0.94, xRatio: 0.52, yRatio: 0.82, pulseSpeed: 1.7, pulseAmount: 0.35, motionType: 'lava-stream', layer: 'foreground' },
    { id: 'beacon-15', name: 'Biohazard Warning Beacon', type: 'neon-sign', color: '#ef4444', radius: 135, intensity: 0.90, xRatio: 0.75, yRatio: 0.55, pulseSpeed: 4.0, pulseAmount: 0.55, flicker: true, motionType: 'neon-sign', layer: 'midground' },
  ],
  // Biome 16: Floating Islands
  16: [
    { id: 'aether-16', name: 'Aether Sky Crystal Core', type: 'crystal', color: '#0ea5e9', radius: 230, intensity: 0.90, xRatio: 0.42, yRatio: 0.55, pulseSpeed: 1.4, pulseAmount: 0.3, motionType: 'crystal-pulse', layer: 'midground' },
    { id: 'sun-16', name: 'Cloud Rim Solar Glare', type: 'celestial', color: '#fde047', radius: 270, intensity: 0.75, xRatio: 0.75, yRatio: 0.22, pulseSpeed: 0.3, pulseAmount: 0.15, motionType: 'celestial-drift', layer: 'background' },
  ],
  // Biome 17: Clockwork Citadel
  17: [
    { id: 'furnace-17', name: 'Brass Smelting Crucible Spill', type: 'lava-stream', color: '#ea580c', radius: 205, intensity: 0.94, xRatio: 0.35, yRatio: 0.76, pulseSpeed: 1.8, pulseAmount: 0.35, motionType: 'lava-stream', layer: 'midground' },
    { id: 'arc-17', name: 'Steam Pressure Relief Flare', type: 'torch', color: '#fef08a', radius: 125, intensity: 0.88, xRatio: 0.68, yRatio: 0.62, pulseSpeed: 2.8, pulseAmount: 0.45, flicker: true, motionType: 'torch-wobble', layer: 'foreground' },
  ],
  // Biome 18: Sakura Shrine
  18: [
    { id: 'spirit-18a', name: 'Cherry Spirit Firefly Alpha', type: 'firefly', color: '#f472b6', radius: 75, intensity: 0.86, xRatio: 0.32, yRatio: 0.72, pulseSpeed: 1.9, pulseAmount: 0.4, flicker: true, motionType: 'firefly-drift', layer: 'foreground' },
    { id: 'spirit-18b', name: 'Cherry Spirit Firefly Beta', type: 'firefly', color: '#fbcfe8', radius: 60, intensity: 0.82, xRatio: 0.65, yRatio: 0.68, pulseSpeed: 2.3, pulseAmount: 0.45, flicker: true, motionType: 'firefly-drift', layer: 'foreground' },
    { id: 'lantern-18', name: 'Stone Torii Lantern Flame', type: 'torch', color: '#fb923c', radius: 115, intensity: 0.88, xRatio: 0.48, yRatio: 0.80, pulseSpeed: 1.6, pulseAmount: 0.25, flicker: true, motionType: 'torch-wobble', layer: 'midground' },
  ],
  // Biome 19: Crystalline Core
  19: [
    { id: 'geode-19a', name: 'Giant Amethyst Geode Spire', type: 'crystal', color: '#a855f7', radius: 250, intensity: 0.92, xRatio: 0.38, yRatio: 0.58, pulseSpeed: 1.5, pulseAmount: 0.35, motionType: 'crystal-pulse', layer: 'midground' },
    { id: 'fluorite-19b', name: 'Fluorite Crystal Cluster', type: 'crystal', color: '#2dd4bf', radius: 175, intensity: 0.86, xRatio: 0.72, yRatio: 0.74, pulseSpeed: 1.9, pulseAmount: 0.4, motionType: 'crystal-pulse', layer: 'foreground' },
  ],
};

/**
 * Resolves the appropriate worldId, index, and name based on active mode, level, and tournament state
 */
export function resolveActiveWorld(storeState: {
  mode: string;
  state: string;
  level: number;
  equippedBackground?: string | null;
  activeTournament?: { bgZoneId?: string; worldNumber?: number } | null;
  visualTheme?: VisualThemeMode;
}): ActiveWorldInfo {
  const visualTheme = storeState.visualTheme || 'default';
  const isSpecialTheme = visualTheme !== 'default';

  // 1. Campaign Mode: Dynamically advances biomes every 10 levels (Level 1-10: Meadow, 11-20: Moon, etc.)
  if (storeState.mode === 'campaign') {
    const zoneIdx = Math.floor(Math.max(0, (storeState.level || 1) - 1) / 10) % 20;
    return {
      worldId: `campaign-${zoneIdx}`,
      worldIndex: zoneIdx,
      worldName: WORLD_NAMES[zoneIdx] || `Zone ${zoneIdx + 1}`,
      visualTheme,
      isSpecialTheme,
    };
  }

  // 2. Tournament Mode: Matches the tournament's official target zone
  if (storeState.mode === 'tournament' && storeState.activeTournament) {
    const t = storeState.activeTournament;
    let zoneIdx = 0;
    if (t.bgZoneId) {
      zoneIdx = Math.abs(parseInt(t.bgZoneId.replace('bg-', '').replace('campaign-', '')) || 0) % 20;
    } else if (typeof t.worldNumber === 'number') {
      zoneIdx = Math.max(0, (t.worldNumber - 1)) % 20;
    }
    return {
      worldId: t.bgZoneId || `bg-${zoneIdx}`,
      worldIndex: zoneIdx,
      worldName: WORLD_NAMES[zoneIdx] || `Tournament Realm`,
      visualTheme,
      isSpecialTheme,
    };
  }

  // 3. Endless / Daily / Academy / Shop / Menu Modes
  let worldId = storeState.equippedBackground || 'bg-0';
  let worldIndex = Math.abs(parseInt(worldId.replace('bg-', '').replace('campaign-', '')) || 0) % 20;

  // In endless mode, cycle every 15 levels if player hasn't locked an equipped background
  if (storeState.mode === 'endless' && storeState.state === 'playing') {
    if (!storeState.equippedBackground || storeState.equippedBackground === 'bg-0') {
      const endlessZone = Math.floor(Math.max(0, storeState.level - 1) / 15) % 20;
      worldId = `campaign-${endlessZone}`;
      worldIndex = endlessZone;
    }
  }

  return {
    worldId,
    worldIndex,
    worldName: WORLD_NAMES[worldIndex] || 'Cosmic Expanse',
    visualTheme,
    isSpecialTheme,
  };
}

/**
 * EnvironmentRenderer: High-performance singleton & class that renders dynamic,
 * cinematic game worlds with smooth cross-fading, post-processing bloom, depth-dependent haze,
 * world-specific environmental lighting sources, and dynamic weather particle effects.
 */
export class EnvironmentRenderer {
  private currentWorldId: string = 'bg-0';
  private previousWorldId: string | null = null;
  private transitionAlpha: number = 1.0;
  private transitionDuration: number = 800; // ms smooth crossfade
  private transitionStartTime: number = 0;
  private isTransitioning: boolean = false;

  // Post-processing, lighting & weather toggles
  public bloomEnabled: boolean = true;
  public depthHazeEnabled: boolean = true;
  public lightingPassEnabled: boolean = true;
  public weatherEnabled: boolean = true;

  // Configurable intensities
  public bloomIntensity: number = 0.55;
  public weatherIntensity: number = 0.85; // 0.0 to 1.5

  // Real-time calculated lighting state
  private currentLightingState: CalculatedLightingState = {
    identity: WORLD_LIGHT_IDENTITIES[0],
    currentIntensity: 0.75,
    pulseNormalized: 0,
    sourceX: 0,
    sourceY: 0,
    effectiveColor: '#fef08a',
    ambientLightLevel: 0.5,
    shadowHardness: 0.45,
    lightProfileDesc: 'Morning Solar Radiance (0.2 Hz)',
  };

  // Real-time weather telemetry & tower height dynamics
  private activeWeatherCount: number = 0;
  private activeWorldIndex: number = 0;
  public currentTowerHeight: number = 0;
  private activeWeatherCategory: WeatherCategory = 'rain';
  private activeWeatherEffectiveIntensity: number = 0.85;
  private activeWeatherHeightMultiplier: number = 1.0;
  private activeWeatherName: string = 'Spring Meadow Rain & Blossom Drift';
  private activeWeatherType: WeatherType = 'pollen-drift';

  // Performance tracking metrics
  private lastFrameTimestamp: number = performance.now();
  private frameCount: number = 0;
  private lastFpsUpdate: number = performance.now();
  private currentFps: number = 60;
  private frameTimeMs: number = 16.6;
  private droppedFrames: number = 0;
  private activeHazeColor: string = 'rgba(186, 230, 253, 0.25)';

  // Downscaled offscreen canvas for zero-allocation crossfading and high-performance post-processing bloom
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;

  // 1/4 resolution downscaled bloom buffer (maintains smooth 60 FPS without GPU bandwidth lag)
  private bloomCanvas: HTMLCanvasElement | null = null;
  private bloomCtx: CanvasRenderingContext2D | null = null;

  // Multi-layered Parallax Engine properties
  public parallaxEnabled: boolean = true;
  public parallaxIntensity: number = 1.0; // 0.2x to 2.0x
  private currentAltitudePixels: number = 0;
  private targetAltitudePixels: number = 0;
  private currentAltitudeMeters: number = 0;
  private verticalVelocity: number = 0;
  private currentTowerTilt: number = 0;
  private targetPointerX: number = 0; // -1 to 1
  private targetPointerY: number = 0;
  private smoothPointerX: number = 0;
  private smoothPointerY: number = 0;
  private lastAltitudeTimestamp: number = performance.now();
  private currentParallaxState: ParallaxState | null = null;
  private thermalParticles: Array<{ x: number; y: number; sz: number; spd: number; alpha: number; color: string }> = [];

  constructor() {
    if (typeof document !== 'undefined') {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', { alpha: false });

      this.bloomCanvas = document.createElement('canvas');
      this.bloomCtx = this.bloomCanvas.getContext('2d');
    }

    // Seed non-allocating thermal updraft particle pool
    for (let i = 0; i < 32; i++) {
      this.thermalParticles.push({
        x: Math.random(),
        y: Math.random(),
        sz: 1.2 + Math.random() * 2.8,
        spd: 0.8 + Math.random() * 2.2,
        alpha: 0.25 + Math.random() * 0.55,
        color: i % 4 === 0 ? '#38bdf8' : (i % 4 === 1 ? '#facc15' : (i % 4 === 2 ? '#4ade80' : '#ffffff')),
      });
    }
  }

  setBloomEnabled(enabled: boolean) {
    this.bloomEnabled = enabled;
  }

  setDepthHazeEnabled(enabled: boolean) {
    this.depthHazeEnabled = enabled;
  }

  setLightingPassEnabled(enabled: boolean) {
    this.lightingPassEnabled = enabled;
  }

  setWeatherEnabled(enabled: boolean) {
    this.weatherEnabled = enabled;
  }

  setParallaxEnabled(enabled: boolean) {
    this.parallaxEnabled = enabled;
  }

  setBloomIntensity(intensity: number) {
    this.bloomIntensity = Math.max(0, Math.min(1.0, intensity));
  }

  setWeatherIntensity(intensity: number) {
    this.weatherIntensity = Math.max(0, Math.min(1.5, intensity));
  }

  setParallaxIntensity(intensity: number) {
    this.parallaxIntensity = Math.max(0.2, Math.min(2.0, intensity));
  }

  updatePointer(normX: number, normY: number) {
    this.targetPointerX = Math.max(-1, Math.min(1, normX));
    this.targetPointerY = Math.max(-1, Math.min(1, normY));
  }

  setTargetTowerHeight(towerHeight: number, mode?: string, gameState?: string) {
    if (gameState === 'playing' || mode === 'endless' || mode === 'campaign' || mode === 'tournament' || mode === 'daily') {
      this.targetAltitudePixels = Math.max(0, towerHeight * 22);
    } else {
      this.targetAltitudePixels = 0;
    }
  }

  getCurrentAltitudeTier(): 'Surface Deck' | 'Troposphere' | 'Stratosphere' | 'Mesosphere' | 'Low Orbit' {
    const m = this.currentAltitudeMeters;
    if (m >= 800) return 'Low Orbit';
    if (m >= 350) return 'Mesosphere';
    if (m >= 150) return 'Stratosphere';
    if (m >= 30) return 'Troposphere';
    return 'Surface Deck';
  }

  getCurrentMilestoneTitle(): string {
    const m = this.currentAltitudeMeters;
    for (let i = ALTITUDE_MILESTONES.length - 1; i >= 0; i--) {
      if (m >= ALTITUDE_MILESTONES[i].altitudeMeters) {
        return `${ALTITUDE_MILESTONES[i].code} • ${ALTITUDE_MILESTONES[i].title}`;
      }
    }
    return ALTITUDE_MILESTONES[0].title;
  }

  /**
   * Calculates the world-specific environmental light intensity and properties
   */
  public calculateEnvironmentalLight(
    worldIndex: number,
    time: number,
    w: number,
    h: number
  ): CalculatedLightingState {
    const identity = WORLD_LIGHT_IDENTITIES[worldIndex] || WORLD_LIGHT_IDENTITIES[0];
    let pulseNormalized = 0;

    switch (identity.pulseType) {
      case 'magma-bubble': {
        const b1 = Math.sin(time * 0.0028) * 0.65;
        const b2 = Math.sin(time * 0.0063 + 1.2) * 0.35;
        pulseNormalized = b1 + b2;
        break;
      }
      case 'neon-flicker': {
        const jitter = Math.sin(time * 0.024) * 0.4;
        const drop = Math.sin(time * 0.0068) > 0.88 ? -0.5 : 0.15;
        pulseNormalized = Math.max(-1, Math.min(1, jitter + drop));
        break;
      }
      case 'torch-flame': {
        pulseNormalized = Math.sin(time * 0.016) * 0.5 + Math.cos(time * 0.038) * 0.35;
        break;
      }
      case 'caustic-ripple': {
        pulseNormalized = Math.sin(time * 0.0035) * 0.8;
        break;
      }
      case 'aurora-wave': {
        pulseNormalized = Math.sin(time * 0.0014) * 0.9;
        break;
      }
      case 'god-ray-sweep': {
        pulseNormalized = Math.sin(time * 0.0011) * 0.6;
        break;
      }
      case 'steady':
      default: {
        pulseNormalized = Math.sin(time * 0.0003) * 0.1;
        break;
      }
    }

    const intensityRange = 0.18;
    const currentIntensity = Math.max(0.1, Math.min(1.0, identity.baseIntensity + pulseNormalized * intensityRange));
    const sourceX = w * identity.sourceXRatio;
    const sourceY = h * identity.sourceYRatio;

    return {
      identity,
      currentIntensity: Number(currentIntensity.toFixed(3)),
      pulseNormalized: Number(pulseNormalized.toFixed(3)),
      sourceX: Math.round(sourceX),
      sourceY: Math.round(sourceY),
      effectiveColor: identity.primaryColor,
      ambientLightLevel: Number((currentIntensity * 0.65).toFixed(2)),
      shadowHardness: identity.shadowHardness,
      lightProfileDesc: `${identity.sourceName} (${identity.frequencyLabel})`,
    };
  }

  /**
   * Updates world tracking and triggers smooth environmental crossfade when target changes
   */
  setTargetWorld(newWorldId: string, time: number) {
    if (newWorldId !== this.currentWorldId) {
      this.previousWorldId = this.currentWorldId;
      this.currentWorldId = newWorldId;
      this.transitionStartTime = time;
      this.isTransitioning = true;
      this.transitionAlpha = 0;
    }
  }

  /**
   * Main render pass: delegates to cinematic worlds or visual themes with smooth transitions,
   * depth-dependent haze, post-processing bloom, environmental lighting, multi-layered parallax,
   * and dynamic weather particles.
   */
  render(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    worldInfo: ActiveWorldInfo,
    towerHeight: number = 0,
    mode: string = 'campaign',
    gameState: string = 'idle',
    towerTilt: number = 0
  ) {
    if (!ctx || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      return;
    }
    const safeTime = Number.isFinite(time) ? time : 0;
    const safeTowerHeight = Number.isFinite(towerHeight) ? Math.max(0, towerHeight) : 0;
    const safeTowerTilt = Number.isFinite(towerTilt) ? towerTilt : 0;

    this.measurePerformance(safeTime);
    this.activeWorldIndex = worldInfo.worldIndex;
    this.currentTowerHeight = safeTowerHeight;

    // 0. Update Multi-layered Parallax Physics & Altitude Displacements
    this.updateParallaxPhysics(safeTime, w, h, safeTowerHeight, mode, gameState, safeTowerTilt);

    // 1. Calculate Real-Time Environmental Light Intensity based on active world source
    this.currentLightingState = this.calculateEnvironmentalLight(worldInfo.worldIndex, safeTime, w, h);

    // If special visual accessibility/style themes are selected in settings
    if (worldInfo.isSpecialTheme) {
      switch (worldInfo.visualTheme) {
        case 'high-contrast':
          renderHighContrastEnvironment(ctx, w, h, safeTime);
          return;
        case 'minimal-dark':
          renderMinimalDarkEnvironment(ctx, w, h, safeTime);
          return;
        case 'cyberpunk':
          renderCyberpunkEnvironment(ctx, w, h, safeTime);
          this.applyPostProcessingPasses(ctx, w, h, safeTime, worldInfo);
          return;
        case 'deep-cosmos':
          renderDeepCosmosEnvironment(ctx, w, h, safeTime);
          this.applyPostProcessingPasses(ctx, w, h, safeTime, worldInfo);
          return;
        case 'solar-gold':
          renderSolarGoldEnvironment(ctx, w, h, safeTime);
          this.applyPostProcessingPasses(ctx, w, h, safeTime, worldInfo);
          return;
      }
    }

    // Dynamic world rendering with smooth crossfade support
    this.setTargetWorld(worldInfo.worldId, safeTime);

    if (this.isTransitioning && this.previousWorldId && this.offscreenCanvas && this.offscreenCtx) {
      const elapsed = safeTime - this.transitionStartTime;
      const progress = Math.min(1.0, elapsed / this.transitionDuration);
      this.transitionAlpha = progress;

      // Ensure offscreen canvas matches size
      if (this.offscreenCanvas.width !== w || this.offscreenCanvas.height !== h) {
        this.offscreenCanvas.width = w;
        this.offscreenCanvas.height = h;
      }

      // 1. Render previous world onto main canvas
      renderCinematicWorld(ctx, w, h, this.previousWorldId, safeTime, false, this.currentParallaxState || undefined);

      // 2. Render new world onto offscreen canvas and blend with alpha
      this.offscreenCtx.clearRect(0, 0, w, h);
      renderCinematicWorld(this.offscreenCtx, w, h, this.currentWorldId, safeTime, false, this.currentParallaxState || undefined);

      ctx.save();
      ctx.globalAlpha = this.transitionAlpha;
      ctx.drawImage(this.offscreenCanvas, 0, 0);
      ctx.restore();

      if (progress >= 1.0) {
        this.isTransitioning = false;
        this.previousWorldId = null;
      }
    } else {
      // Direct single-pass cinematic rendering with active parallax state
      renderCinematicWorld(ctx, w, h, this.currentWorldId, safeTime, false, this.currentParallaxState || undefined);
    }

    // Apply Post-Processing Passes: Environmental Lighting, Depth Haze, Emissive Bloom, Parallax Decks, Milestones & Weather Particles
    this.applyPostProcessingPasses(ctx, w, h, safeTime, worldInfo);
  }

  /**
   * Fluid multi-layered physics loop: evaluates tower climb altitude, pointer tilt, and layer offsets
   * Enables independent parallax rates for background, midground, and foreground tied to tower motion
   */
  private updateParallaxPhysics(
    time: number,
    w: number,
    h: number,
    towerHeight: number,
    mode: string,
    gameState: string,
    towerTilt: number = 0
  ) {
    const now = performance.now();
    const dt = Math.max(0.001, Math.min(0.1, (now - this.lastAltitudeTimestamp) / 1000));
    this.lastAltitudeTimestamp = now;

    // Target vertical altitude in pixels: scales directly with stacked tower block count
    const isPlayingOrEndless = gameState === 'playing' || mode === 'endless' || mode === 'campaign' || mode === 'tournament' || mode === 'daily';
    if (isPlayingOrEndless) {
      this.targetAltitudePixels = Math.max(0, towerHeight * 22);
    } else {
      // Gentle cinematic breathing floating in menu or level select
      this.targetAltitudePixels = Math.sin(time * 0.0006) * 14 + 10;
    }

    // Fluid spring damping for camera altitude
    const prevAlt = this.currentAltitudePixels;
    const altDiff = this.targetAltitudePixels - this.currentAltitudePixels;
    this.currentAltitudePixels += altDiff * Math.min(1.0, dt * 5.0);
    this.verticalVelocity = Number(((this.currentAltitudePixels - prevAlt) / dt).toFixed(1));
    this.currentAltitudeMeters = Number((this.currentAltitudePixels * 0.25).toFixed(1));

    // Pointer smooth spring interpolation
    this.smoothPointerX += (this.targetPointerX - this.smoothPointerX) * Math.min(1.0, dt * 6.0);
    this.smoothPointerY += (this.targetPointerY - this.smoothPointerY) * Math.min(1.0, dt * 6.0);

    // Tower physical tilt sway interpolation
    this.currentTowerTilt += (towerTilt - this.currentTowerTilt) * Math.min(1.0, dt * 8.0);

    const intensity = this.parallaxEnabled ? this.parallaxIntensity : 0;
    const tiltShiftX = Math.sin((this.currentTowerTilt * Math.PI) / 180) * 110 * intensity;

    // Independent multi-layered parallax rates for background, midground, and foreground:
    const backgroundOffset = {
      x: Number((this.smoothPointerX * 22 * intensity + tiltShiftX * 0.15).toFixed(2)),
      y: Number((-this.currentAltitudePixels * 0.14 * intensity + this.smoothPointerY * 18 * intensity).toFixed(2)),
    };

    const midgroundOffset = {
      x: Number((this.smoothPointerX * 45 * intensity + tiltShiftX * 0.52).toFixed(2)),
      y: Number((-this.currentAltitudePixels * 0.52 * intensity + this.smoothPointerY * 35 * intensity).toFixed(2)),
    };

    const foregroundOffset = {
      x: Number((this.smoothPointerX * 80 * intensity + tiltShiftX * 1.08).toFixed(2)),
      y: Number((-this.currentAltitudePixels * 1.05 * intensity + this.smoothPointerY * 55 * intensity).toFixed(2)),
    };

    // Compute layer offsets for the 6 discrete depth planes
    const layers: ParallaxLayerOffset[] = DEFAULT_PARALLAX_LAYERS.map((cfg) => {
      // Vertical translation: higher speed ratios move down faster as camera climbs
      const verticalShift = -(this.currentAltitudePixels * cfg.speedRatio * intensity);
      const pointerYShift = this.smoothPointerY * 35 * cfg.speedRatio * intensity;
      const thermalBreathing = Math.sin(time * 0.0012 + cfg.depth * 2.5) * (cfg.ambientDriftY * 12);
      const offsetY = verticalShift + pointerYShift + thermalBreathing;

      // Horizontal translation: pointer tilt + continuous organic wind drift + tower tilt reaction
      const pointerXShift = this.smoothPointerX * 45 * cfg.speedRatio * intensity;
      const towerTiltLayerShift = tiltShiftX * (cfg.speedRatio / 1.15);
      const windDrift = (time * 0.001 * cfg.ambientDriftX * 18) % (w * 2);
      const offsetX = pointerXShift + towerTiltLayerShift + (windDrift > w ? windDrift - w * 2 : windDrift);

      return {
        depth: cfg.depth,
        speedRatio: cfg.speedRatio,
        offsetX: Number(offsetX.toFixed(2)),
        offsetY: Number(offsetY.toFixed(2)),
      };
    });

    this.currentParallaxState = {
      enabled: this.parallaxEnabled,
      altitudeMeters: this.currentAltitudeMeters,
      rawAltitudePixels: this.currentAltitudePixels,
      verticalVelocity: this.verticalVelocity,
      pointerDisplacementX: Number(this.smoothPointerX.toFixed(3)),
      pointerDisplacementY: Number(this.smoothPointerY.toFixed(3)),
      towerTilt: Number(this.currentTowerTilt.toFixed(2)),
      intensity: this.parallaxIntensity,
      layers,
      backgroundOffset,
      midgroundOffset,
      foregroundOffset,
    };

    setActiveParallax(this.currentParallaxState);
  }

  /**
   * Applies Environmental Lighting, Depth-Dependent Haze, Emissive Bloom, Parallax Clouds, Milestones, and Weather Particles
   */
  private applyPostProcessingPasses(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    worldInfo: ActiveWorldInfo
  ) {
    const profile = WORLD_ATMOSPHERES[worldInfo.worldIndex] || WORLD_ATMOSPHERES[0];
    this.activeHazeColor = profile.hazeColor;

    // 1. Environmental Light Source Pass (calculates dynamic source radiance & directional illumination)
    if (this.lightingPassEnabled) {
      this.applyEnvironmentalLightingPass(ctx, w, h, time, this.currentLightingState, worldInfo.worldIndex);
    }

    // 2. Depth-Dependent Aerial Perspective Haze Pass
    if (this.depthHazeEnabled) {
      this.applyDepthHaze(ctx, w, h, time, profile);
    }

    // 3. Post-Processing Emissive Bloom Pass
    if (this.bloomEnabled) {
      this.applyPostProcessingBloom(ctx, w, h, time, profile);
    }

    // 4. Parallax Multi-Altitude Cloud Strata Pass (Layer 4 - Sinks below view as tower climbs)
    if (this.parallaxEnabled) {
      this.renderParallaxCloudStrataPass(ctx, w, h, time, this.currentAltitudePixels);
    }

    // 5. Parallax Vertical Altitude Milestone Markers & Ascending Thermals Pass (Layer 5)
    if (this.parallaxEnabled) {
      this.renderVerticalAltitudeMilestonesPass(ctx, w, h, time);
    }

    // 6. Stratospheric High-Altitude Curvature & Thinning Transition
    if (this.parallaxEnabled) {
      this.renderStratosphericAtmospherePass(ctx, w, h);
    }

    // 7. Dynamic Weather Particle Pass (Rain, Snow, Volcanic Ash, Pollen, Stardust)
    if (this.weatherEnabled && this.weatherIntensity > 0.05) {
      this.applyWeatherParticlePass(ctx, w, h, time, worldInfo);
    }
  }

  /**
   * Procedural multi-altitude cloud decks moving at Layer 4 speeds (1.15x)
   */
  private renderParallaxCloudStrataPass(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    altitude: number
  ) {
    if (!this.parallaxEnabled || !this.currentParallaxState) return;
    const p4 = this.currentParallaxState.layers[4] || { offsetX: 0, offsetY: 0 };
    const p1 = this.currentParallaxState.layers[1] || { offsetX: 0, offsetY: 0 };

    ctx.save();
    // 1. High Cirrus Strata (Layer 1, speed 0.20x)
    const cirrusAlpha = Math.min(0.4, 0.15 + (altitude / 800) * 0.25);
    ctx.fillStyle = `rgba(255, 255, 255, ${cirrusAlpha})`;
    for (let c = 0; c < 3; c++) {
      const cy = h * (0.16 + c * 0.1) + p1.offsetY;
      const cx = (((time * 0.012 * (c + 1) + c * 420 + p1.offsetX) % (w + 400)) + (w + 400)) % (w + 400) - 200;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 140, 16, -0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Volumetric Cumulus Cloud Deck (Layer 4, speed 1.15x - sinks below as tower rises)
    const deckY = h * 0.54 + p4.offsetY * 0.35;
    const cloudDeckAlpha = Math.max(0.1, Math.min(0.65, 0.55 - (altitude / 1200) * 0.3));

    for (let i = 0; i < 5; i++) {
      const spanW = Math.max(350, w + 350);
      const puffX = (((i * 260 + (time || 0) * 0.016 + (p4.offsetX || 0)) % spanW) + spanW) % spanW - 175;
      const puffY = deckY + Math.sin(puffX * 0.003 + i) * 20;
      const puffR = 60 + (i % 3) * 18;

      if (!Number.isFinite(puffX) || !Number.isFinite(puffY) || !Number.isFinite(puffR) || puffR <= 0) continue;

      const innerR = Math.max(0.1, puffR * 0.15);
      const cloudGrad = safeCreateRadialGradient(
        ctx,
        puffX,
        puffY - puffR * 0.3,
        innerR,
        puffX,
        puffY,
        puffR
      );
      if (cloudGrad) {
        cloudGrad.addColorStop(0, `rgba(255, 255, 255, ${cloudDeckAlpha * 0.85})`);
        cloudGrad.addColorStop(0.55, `rgba(226, 232, 240, ${cloudDeckAlpha * 0.55})`);
        cloudGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = cloudGrad;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${cloudDeckAlpha * 0.4})`;
      }

      ctx.beginPath();
      ctx.arc(puffX, puffY, puffR, 0, Math.PI * 2);
      ctx.arc(puffX + puffR * 0.55, puffY + 8, puffR * 0.7, 0, Math.PI * 2);
      ctx.arc(puffX - puffR * 0.55, puffY + 10, puffR * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Vertical altitude milestone markers and ascending thermals (Layer 5, 1.45x speed)
   */
  private renderVerticalAltitudeMilestonesPass(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number
  ) {
    if (!this.parallaxEnabled || !this.currentParallaxState) return;
    const currentMeters = this.currentAltitudeMeters;

    ctx.save();

    // 1. Kinetic Ascending Thermal Updraft Motes (Layer 5)
    const ascentSpeedBoost = Math.max(0, this.verticalVelocity * 0.035);
    for (let i = 0; i < this.thermalParticles.length; i++) {
      const p = this.thermalParticles[i];
      p.y -= (p.spd + ascentSpeedBoost) * 0.0022;
      if (p.y < 0) {
        p.y = 1.0;
        p.x = Math.random();
      }
      p.x += Math.sin(time * 0.002 + i) * 0.0003;

      const px = p.x * w;
      const py = p.y * h;

      ctx.globalAlpha = p.alpha * Math.min(1.0, 0.4 + (this.currentAltitudePixels / 400) * 0.6);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.sz, 0, Math.PI * 2);
      ctx.fill();

      // Motion streak when ascending
      if (ascentSpeedBoost > 0.4) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.sz * 0.6;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + p.sz * 4);
        ctx.stroke();
      }
    }

    // 2. Cinematic Vertical Altitude Milestone Ruler along left screen margin
    const rulerX = 20;
    for (let i = 0; i < ALTITUDE_MILESTONES.length; i++) {
      const milestone = ALTITUDE_MILESTONES[i];
      // Screen Y calculation: as altitude increases, milestones move downward past camera
      const screenY = h * 0.72 - (milestone.altitudeMeters - currentMeters) * 11;

      if (screenY >= -30 && screenY <= h + 30) {
        const distFromCenter = Math.abs(screenY - h * 0.5) / (h * 0.5);
        const alpha = Math.max(0.15, Math.min(0.85, 1.0 - distFromCenter * 0.75));

        ctx.globalAlpha = alpha;

        // Glowing tick mark
        ctx.strokeStyle = milestone.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(rulerX - 8, screenY);
        ctx.lineTo(rulerX + 16, screenY);
        ctx.stroke();

        // Milestone Pip
        ctx.fillStyle = milestone.color;
        ctx.beginPath();
        ctx.arc(rulerX + 16, screenY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Milestone Label
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = milestone.color;
        ctx.shadowBlur = 6;
        ctx.fillText(`${milestone.symbol} ${milestone.code}`, rulerX + 24, screenY + 3);

        ctx.font = '8px monospace';
        ctx.fillStyle = milestone.color;
        ctx.shadowBlur = 0;
        ctx.fillText(`${milestone.altitudeMeters}m • ${milestone.title}`, rulerX + 24, screenY + 12);
      }
    }

    ctx.restore();
  }

  /**
   * Stratospheric High-Altitude Curvature & Space Fade
   */
  private renderStratosphericAtmospherePass(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) {
    if (!this.parallaxEnabled) return;
    const altRatio = Math.min(1.0, Math.max(0, (this.currentAltitudeMeters - 30) / 320));
    if (altRatio <= 0.01) return;

    ctx.save();
    const spaceGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
    spaceGrad.addColorStop(0, `rgba(2, 6, 23, ${0.52 * altRatio})`);
    spaceGrad.addColorStop(0.6, `rgba(15, 23, 42, ${0.25 * altRatio})`);
    spaceGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h * 0.45);

    if (altRatio > 0.3) {
      const limbY = h * (0.85 + altRatio * 0.1);
      const limbGrad = ctx.createLinearGradient(0, limbY - 25, 0, limbY + 25);
      limbGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      limbGrad.addColorStop(0.5, `rgba(56, 189, 248, ${0.32 * altRatio})`);
      limbGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = limbGrad;
      ctx.fillRect(0, limbY - 25, w, 50);
    }
    ctx.restore();
  }

  /**
   * Environmental Lighting Pass:
   * Reflects dynamic light sources (lava heat radiation, neon sign scatter, lunar vacuum shadows)
   * onto the scene with real-time intensity modulation, and maps LightSource objects per biome
   * to radial gradients that follow dynamic environment objects like fireflies, lava streams, or neon signs.
   */
  private applyEnvironmentalLightingPass(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    light: CalculatedLightingState,
    worldIndex: number
  ) {
    ctx.save();

    const { identity, currentIntensity, sourceX, sourceY } = light;

    // 1. Directional Source Radiance Field
    const maxRadius = Math.max(50, Math.max(w, h) * 0.9);
    const safeSourceX = Number.isFinite(sourceX) ? sourceX : w * 0.5;
    const safeSourceY = Number.isFinite(sourceY) ? sourceY : h * 0.25;
    const innerRadius = Math.min(20, maxRadius * 0.1);

    if (Number.isFinite(safeSourceX) && Number.isFinite(safeSourceY) && Number.isFinite(maxRadius) && maxRadius > innerRadius) {
      const lightGrad = safeCreateRadialGradient(
        ctx,
        safeSourceX,
        safeSourceY,
        innerRadius,
        safeSourceX,
        safeSourceY,
        maxRadius
      );
      if (lightGrad) {
        lightGrad.addColorStop(0, identity.primaryColor);
        lightGrad.addColorStop(0.35, identity.ambientWashColor);
        lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = Math.min(0.45, currentIntensity * 0.38);
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, w, h);
      }
    }

    // 2. Specialized Environmental Light Behaviors:
    if (identity.type === 'lava-thermal') {
      const thermalGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
      thermalGrad.addColorStop(0, 'rgba(255, 69, 0, 0)');
      thermalGrad.addColorStop(0.5, `rgba(255, 85, 0, ${0.28 * currentIntensity})`);
      thermalGrad.addColorStop(1, `rgba(255, 200, 0, ${0.45 * currentIntensity})`);
      ctx.fillStyle = thermalGrad;
      ctx.fillRect(0, h * 0.75, w, h * 0.25);
    } else if (identity.type === 'neon-emissive') {
      const neonWobble = Math.sin((time || 0) * 0.015) * 20;
      const neonR = Math.max(30, w * 0.6);
      const neonGrad = safeCreateRadialGradient(
        ctx,
        safeSourceX + neonWobble,
        safeSourceY,
        15,
        safeSourceX,
        safeSourceY,
        neonR
      );
      if (neonGrad) {
        neonGrad.addColorStop(0, 'rgba(0, 240, 255, 0.32)');
        neonGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.18)');
        neonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = neonGrad;
        ctx.fillRect(0, h * 0.3, w, h * 0.7);
      }
    } else if (identity.type === 'lunar-directional') {
      const shadowGrad = ctx.createLinearGradient(0, 0, w, h);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shadowGrad.addColorStop(0.7, 'rgba(15, 23, 42, 0.15)');
      shadowGrad.addColorStop(1, 'rgba(2, 6, 23, 0.45)');
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = identity.shadowHardness * 0.5;
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(0, 0, w, h);
    } else if (identity.type === 'celestial-gilded') {
      const rayAngle = Math.sin(time * 0.001) * 0.1;
      ctx.save();
      ctx.translate(sourceX, sourceY);
      ctx.rotate(rayAngle);
      for (let r = -2; r <= 2; r++) {
        const rayG = ctx.createLinearGradient(0, 0, r * 120, h);
        rayG.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
        rayG.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rayG;
        ctx.fillRect(r * 120 - 40, 0, 80, h);
      }
      ctx.restore();
    }

    // 3. Dynamic Biome LightSource Objects:
    // Maps each LightSource defined per biome (fireflies, lava streams, neon signs, crystals, torches)
    // to radial gradients that follow dynamic environment objects with independent parallax movement.
    const biomeSources = BIOME_LIGHT_SOURCES[worldIndex] || [];
    if (biomeSources.length > 0) {
      this.renderDynamicBiomeLightSources(ctx, w, h, time, biomeSources, currentIntensity);
    }

    ctx.restore();
  }

  /**
   * Renders dynamic LightSource objects per biome mapped to radial gradients
   * that follow environment objects like fireflies, lava streams, neon signs, and torches.
   */
  private renderDynamicBiomeLightSources(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    sources: LightSource[],
    ambientIntensityMultiplier: number
  ) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < sources.length; i++) {
      const src = sources[i];
      const speed = src.pulseSpeed || 1.0;
      const amount = src.pulseAmount || 0.2;

      // 1. Dynamic object motion tracking:
      let motionOffsetX = 0;
      let motionOffsetY = 0;
      let motionScale = 1.0;
      let motionAlpha = 1.0;

      switch (src.motionType) {
        case 'firefly-drift': {
          // Lissajous curve drifting with organic bobbing for fireflies
          const t = time * 0.0014 * speed + i * 1.8;
          motionOffsetX = Math.sin(t) * 38 + Math.cos(t * 1.7) * 16;
          motionOffsetY = Math.cos(t * 0.9) * 26 + Math.sin(t * 2.3) * 12;
          motionScale = 0.85 + 0.3 * Math.sin(t * 2.5);
          motionAlpha = src.flicker
            ? (Math.sin(time * 0.008 * speed + i * 3) > 0.25 ? 0.95 : 0.4)
            : 0.85 + 0.25 * Math.sin(t);
          break;
        }
        case 'lava-stream': {
          // Convective surging along molten magma channel
          const t = time * 0.002 * speed + src.xRatio * 8;
          motionOffsetX = Math.sin(t) * 18;
          motionOffsetY = Math.cos(t * 0.8) * 10;
          motionScale = 1.0 + Math.sin(t * 1.5) * (amount * 0.6);
          motionAlpha = 0.85 + 0.25 * Math.sin(t * 1.2);
          break;
        }
        case 'neon-sign': {
          // High-frequency electric neon buzz & micro-flicker
          const jitter = Math.sin(time * 0.025 * speed + i * 4) * 4;
          motionOffsetX = jitter;
          motionOffsetY = Math.cos(time * 0.018 * speed) * 3;
          const isFlickering = src.flicker && Math.sin(time * 0.015 * speed + i * 5) > 0.86;
          motionAlpha = isFlickering ? 0.35 : 0.95 + 0.1 * Math.sin(time * 0.008);
          motionScale = isFlickering ? 0.85 : 1.0;
          break;
        }
        case 'torch-wobble': {
          // Wind flutter flame wobble
          const t = time * 0.006 * speed + i * 2.5;
          motionOffsetX = Math.sin(t) * 8;
          motionOffsetY = Math.cos(t * 1.3) * 6;
          motionAlpha = 0.8 + 0.35 * Math.sin(t * 2.1);
          motionScale = 0.9 + 0.2 * Math.cos(t * 1.7);
          break;
        }
        case 'crystal-pulse': {
          // Harmonic breathing crystal resonance
          const t = time * 0.0016 * speed + i * 2.1;
          motionScale = 1.0 + Math.sin(t) * amount;
          motionAlpha = 0.8 + 0.28 * Math.sin(t);
          break;
        }
        case 'celestial-drift': {
          // Slow celestial solar/lunar orbital drift
          motionOffsetX = Math.sin(time * 0.0004 * speed) * 14;
          motionOffsetY = Math.cos(time * 0.0003 * speed) * 8;
          motionScale = 1.0 + Math.sin(time * 0.0008 * speed) * amount;
          break;
        }
        case 'static':
        default: {
          motionScale = 1.0 + Math.sin(time * 0.002 * speed) * (amount * 0.5);
          break;
        }
      }

      // 2. Parallax layer displacement:
      const parallax = src.layer ? getParallaxTierOffset(src.layer) : { x: 0, y: 0 };
      const rawX = src.xRatio * w + motionOffsetX + (Number.isFinite(parallax.x) ? parallax.x : 0);
      const rawY = src.yRatio * h + motionOffsetY + (Number.isFinite(parallax.y) ? parallax.y : 0);
      const posX = Number.isFinite(rawX) ? rawX : w * 0.5;
      const posY = Number.isFinite(rawY) ? rawY : h * 0.5;

      // 3. Responsive radius & dynamic intensity:
      const viewportFactor = Math.max(0.1, Math.min(w, h) / 750);
      const safeMotionScale = Number.isFinite(motionScale) && motionScale > 0 ? motionScale : 1.0;
      const radius = Math.max(15, src.radius * viewportFactor * safeMotionScale);
      const netAlpha = Math.min(
        1.0,
        Math.max(0.05, src.intensity * motionAlpha * (0.6 + 0.4 * ambientIntensityMultiplier))
      );

      // 4. Map properties to dynamic Radial Gradient
      const grad = safeCreateRadialGradient(ctx, posX, posY, 0, posX, posY, radius);
      if (grad) {
        grad.addColorStop(0, colorToRgba(src.color, netAlpha * 0.95));
        grad.addColorStop(0.28, colorToRgba(src.color, netAlpha * 0.6));
        grad.addColorStop(0.65, colorToRgba(src.color, netAlpha * 0.2));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(posX, posY, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Special visual cores for distinct light objects:
      if (src.type === 'firefly') {
        // High intensity micro-specular core for fireflies
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = netAlpha * 0.95;
        ctx.beginPath();
        ctx.arc(posX, posY, Math.max(1, 2.5 * safeMotionScale), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (src.type === 'neon-sign') {
        // Linear emissive glow core for neon signs
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = netAlpha * 0.85;
        ctx.beginPath();
        ctx.moveTo(posX - 12, posY);
        ctx.lineTo(posX + 12, posY);
        ctx.stroke();
        ctx.restore();
      } else if (src.type === 'lava-stream') {
        // Convective thermal magma core
        const coreR = Math.max(2, radius * 0.35);
        const coreGrad = safeCreateRadialGradient(ctx, posX, posY, 0, posX, posY, coreR);
        if (coreGrad) {
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.4, '#ffdd00');
          coreGrad.addColorStop(1, 'rgba(255, 60, 0, 0)');
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(posX, posY, coreR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  /**
   * High-Altitude Freezing Frost Pass:
   * As the tower climbs to subzero altitudes in snow/blizzard biomes, creates an atmospheric
   * crystalline frost vignette and blowing ice haze along the screen perimeter.
   */
  private renderHighAltitudeFrostPass(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    heightFactor: number
  ) {
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return;
    if (this.currentTowerHeight < 6) return;
    const frostAlpha = Math.min(0.28, Math.max(0, ((this.currentTowerHeight - 6) / 20) * 0.28));
    if (frostAlpha <= 0.01) return;

    ctx.save();
    // Top icy vignette
    const frostH = Math.max(10, h * 0.22);
    const topFrost = ctx.createLinearGradient(0, 0, 0, frostH);
    topFrost.addColorStop(0, `rgba(224, 242, 254, ${frostAlpha})`);
    topFrost.addColorStop(0.5, `rgba(186, 230, 253, ${frostAlpha * 0.4})`);
    topFrost.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = topFrost;
    ctx.fillRect(0, 0, w, frostH);

    // Subtle horizontal blowing frost streamer
    const span = Math.max(100, w * 1.5);
    const streamerY = h * 0.25 + Math.sin((time || 0) * 0.001) * 30;
    const streamerX = (((((time || 0) * 0.08) % span) + span) % span) - w * 0.25;
    const streamerGrad = safeCreateRadialGradient(ctx, streamerX, streamerY, 0, streamerX, streamerY, 180);
    if (streamerGrad) {
      streamerGrad.addColorStop(0, `rgba(240, 249, 255, ${frostAlpha * 0.5})`);
      streamerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = streamerGrad;
      ctx.beginPath();
      ctx.ellipse(streamerX, streamerY, 180, 25, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Atmospheric Lightning & Cloud Flash Pass:
   * During heavy rainstorms and neon cyber downpours, occasional lightning pulses
   * illuminate the rain streaks and background sky as the tower pierces the storm clouds.
   */
  private renderStormLightningPass(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    config: WorldWeatherConfig,
    heightFactor: number
  ) {
    // Flash interval decreases as tower climbs higher into the storm
    const cycleMs = Math.max(4500, 11000 - Math.min(5500, (this.currentTowerHeight / 10) * 2000));
    const cyclePhase = time % cycleMs;
    const flashWindow = 220; // 220ms flash duration

    if (cyclePhase < flashWindow) {
      let flashAlpha = 0;
      if (cyclePhase < 60) {
        // First fast lightning surge
        flashAlpha = (cyclePhase / 60) * 0.16 * Math.min(1.5, heightFactor * 0.9);
      } else if (cyclePhase < 95) {
        // Quick lull between double strike
        flashAlpha = 0.04 * Math.min(1.5, heightFactor * 0.9);
      } else if (cyclePhase < 170) {
        // Secondary broader flash
        flashAlpha = (1 - (cyclePhase - 95) / 75) * 0.13 * Math.min(1.5, heightFactor * 0.9);
      } else {
        // Fade out
        flashAlpha = (1 - (cyclePhase - 170) / 50) * 0.05;
      }

      if (flashAlpha > 0.005) {
        ctx.save();
        ctx.fillStyle = colorToRgba(config.lightningColor || 'rgba(255, 255, 255, 0.18)', flashAlpha);
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
    }
  }

  /**
   * Dynamic Weather Particle Pass:
   * Simulates biome-reactive weather precipitation (falling snow, driving rain streaks, ground splashes,
   * volcanic ash embers, stardust) that dynamically scales in intensity, density, velocity,
   * and atmospheric turbulence as the tower climbs to high altitudes.
   */
  private applyWeatherParticlePass(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    worldInfo: ActiveWorldInfo
  ) {
    let config = WORLD_WEATHER_CONFIGS[worldInfo.worldIndex] || WORLD_WEATHER_CONFIGS[0];

    // Adapt weather to special accessibility and visual styling themes
    if (worldInfo.isSpecialTheme) {
      if (worldInfo.visualTheme === 'cyberpunk') {
        config = WORLD_WEATHER_CONFIGS[14]; // Neon acid rain
      } else if (worldInfo.visualTheme === 'high-contrast') {
        config = {
          ...config,
          colors: ['#ffffff', '#ffffff'],
          particleShape: 'crystal-flake',
          glowBlur: 0,
        };
      } else if (worldInfo.visualTheme === 'minimal-dark') {
        config = {
          ...config,
          colors: ['#ffffff', '#94a3b8', '#64748b'],
          glowBlur: 0,
        };
      } else if (worldInfo.visualTheme === 'solar-gold') {
        config = WORLD_WEATHER_CONFIGS[13]; // Gilded solar rain
      } else if (worldInfo.visualTheme === 'deep-cosmos') {
        config = WORLD_WEATHER_CONFIGS[3]; // Cosmic stardust shower
      }
    }

    // 1. Tower Height Dynamic Intensity Scaling:
    // As the tower stacks higher, weather intensity increases substantially (up to 3.4x)
    const heightFactor = 1.0 + Math.min(2.4, (this.currentTowerHeight / 10) * 0.75);
    this.activeWeatherHeightMultiplier = Number(heightFactor.toFixed(2));

    // Dynamic wind gust factor modulates speed and particle activity over time
    const gustFactor = 1.0 + Math.sin(time * 0.001 * config.windGustFrequency) * 0.35;
    const effectiveIntensity = this.weatherIntensity * gustFactor * heightFactor;
    this.activeWeatherEffectiveIntensity = Number(effectiveIntensity.toFixed(2));

    // Determine if altitude threshold is crossed for transitional weather
    let activeWeatherName = config.name;
    let currentCategory = config.category;
    let currentShape = config.particleShape;
    let colors = config.colors;

    if (config.altitudeTransitionThreshold && this.currentTowerHeight >= config.altitudeTransitionThreshold) {
      if (config.altitudeWeatherName) activeWeatherName = config.altitudeWeatherName;
      if (config.altitudeCategory) currentCategory = config.altitudeCategory;
      if (config.altitudeParticleShape) currentShape = config.altitudeParticleShape;
      if (config.altitudeColors) colors = config.altitudeColors;
    }

    const activeCount = Math.min(
      MAX_WEATHER_PARTICLES,
      Math.max(16, Math.round(config.baseCount * (effectiveIntensity / 1.0)))
    );
    this.activeWeatherCount = activeCount;
    this.activeWeatherName = activeWeatherName;
    this.activeWeatherType = config.type;
    this.activeWeatherCategory = currentCategory;

    // 2. High-Altitude Atmospheric Lightning (Rain/Storm Biomes)
    if (config.lightningEnabled && (currentCategory === 'rain' || currentCategory === 'storm')) {
      this.renderStormLightningPass(ctx, w, h, time, config, heightFactor);
    }

    // 3. High-Altitude Subzero Frost Vignette (Snow Biomes)
    if (currentCategory === 'snow' && this.currentTowerHeight >= 6) {
      this.renderHighAltitudeFrostPass(ctx, w, h, time, heightFactor);
    }

    ctx.save();

    // Emissive glow for sparks, embers, neon rain, or crystal flakes
    if (config.glowColor && config.glowBlur) {
      ctx.shadowColor = config.glowColor;
      ctx.shadowBlur = config.glowBlur;
    }

    // High altitude cross-wind and fall velocity escalation
    const altitudeWindMult = 1.0 + Math.min(1.8, (this.currentTowerHeight / 12) * 0.6);
    const vx = config.baseSpeedX * (0.8 + this.weatherIntensity * 0.3) * altitudeWindMult;
    const vy = config.baseSpeedY * (0.8 + this.weatherIntensity * 0.3) * Math.min(1.8, 1.0 + (this.currentTowerHeight / 15) * 0.45);

    for (let i = 0; i < activeCount; i++) {
      const seed = PARTICLE_SEED_POOL[i];
      
      // Multi-depth layer scaling (Layer 0 = background, Layer 1 = midground, Layer 2 = foreground)
      let speedMod = seed.speedFactor;
      let layerSizeMult = 1.0;
      let layerAlphaMult = 0.85;

      if (seed.depthLayer === 0) {
        speedMod *= 0.72;
        layerSizeMult = 0.55;
        layerAlphaMult = 0.45;
      } else if (seed.depthLayer === 2) {
        speedMod *= 1.35;
        layerSizeMult = 1.85;
        layerAlphaMult = 0.65;
      }

      // Organic sinusoidal horizontal sway (snow flutter, rain turbulence, spore drift)
      const flutter = Math.sin(time * 0.0018 * seed.flutterFreq + seed.phase) * (config.turbulence * (1.0 + (heightFactor - 1.0) * 0.4));

      // Coordinate calculation with wrap-around
      const px = (((seed.offsetX * w + time * vx * speedMod + flutter) % w) + w) % w;
      const py = (((seed.offsetY * h + time * vy * speedMod + Math.cos(time * 0.0012 + seed.phase) * (config.turbulence * 0.35)) % h) + h) % h;
      const color = colors[seed.colorIdx % colors.length];
      const sz = config.baseSize * seed.sizeFactor * layerSizeMult * (0.85 + this.weatherIntensity * 0.25);

      // Organic alpha breath
      const alphaPulse = 0.45 + 0.55 * Math.sin(time * 0.003 + seed.phase);
      ctx.globalAlpha = Math.max(0.12, Math.min(1.0, alphaPulse * Math.min(1.0, effectiveIntensity) * layerAlphaMult));
      ctx.fillStyle = color;
      ctx.strokeStyle = color;

      switch (currentShape) {
        case 'rain-drop':
        case 'streak': {
          // Dynamic angled rain streaks with motion blur
          const speed = Math.hypot(vx, vy) || 0.1;
          const streakLen = sz * (1.3 + Math.abs(vy) * 32) * (1.0 + (heightFactor - 1.0) * 0.35);
          const tailX = px - (vx / speed) * streakLen;
          const tailY = py - (vy / speed) * streakLen;

          const grad = ctx.createLinearGradient(tailX, tailY, px, py);
          grad.addColorStop(0, colorToRgba(color, 0));
          grad.addColorStop(0.4, colorToRgba(color, 0.45));
          grad.addColorStop(1.0, color);
          ctx.strokeStyle = grad;
          ctx.lineWidth = seed.depthLayer === 2 ? Math.max(1.8, sz * 0.35) : (seed.depthLayer === 1 ? Math.max(1.0, sz * 0.22) : 0.75);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(px, py);
          ctx.stroke();

          // Ground / surface impact splashes & ripples for rain
          if (py > h * 0.78 && (currentCategory === 'rain' || currentCategory === 'storm')) {
            const splashProgress = ((time * 0.004 + seed.phase * 5) % 1);
            const rippleR = sz * (1.5 + splashProgress * 4.5);
            const rippleAlpha = (1.0 - splashProgress) * 0.55;
            ctx.save();
            ctx.strokeStyle = colorToRgba(config.splashColor || color, rippleAlpha);
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.ellipse(px, py, rippleR, rippleR * 0.32, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Upward bounce droplet bead
            const bounceY = py - Math.sin(splashProgress * Math.PI) * (sz * 1.8);
            ctx.fillStyle = colorToRgba(color, rippleAlpha * 0.8);
            ctx.beginPath();
            ctx.arc(px + (seed.secondaryOffset - 0.5) * rippleR * 0.8, bounceY, Math.max(0.6, sz * 0.2), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          break;
        }

        case 'snow-crystal':
        case 'crystal-flake': {
          // Multi-tier snowfall
          if (seed.depthLayer === 2) {
            // Foreground large soft snowflake with dreamy radial gradient
            const flakeR = Math.max(1, sz * 1.4);
            const grad = safeCreateRadialGradient(ctx, px, py, 0, px, py, flakeR);
            if (grad) {
              grad.addColorStop(0, '#ffffff');
              grad.addColorStop(0.45, colorToRgba(color, 0.6));
              grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(px, py, flakeR, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (seed.depthLayer === 1) {
            // Midground intricate 6-point crystalline snowflake
            const rot = time * seed.rotSpeed + seed.phase;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(px, py, sz * 0.35, 0, Math.PI * 2);
            ctx.fill();

            // 6 radiating arms with cross-spurs
            ctx.beginPath();
            for (let a = 0; a < 6; a++) {
              const armAngle = rot + (a * Math.PI) / 3;
              const cosA = Math.cos(armAngle);
              const sinA = Math.sin(armAngle);
              ctx.moveTo(px, py);
              ctx.lineTo(px + cosA * sz, py + sinA * sz);

              if (seed.sizeFactor > 0.8) {
                const spurDist = sz * 0.6;
                const spurLen = sz * 0.35;
                const sx = px + cosA * spurDist;
                const sy = py + sinA * spurDist;
                const spur1 = armAngle + Math.PI / 4;
                const spur2 = armAngle - Math.PI / 4;
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + Math.cos(spur1) * spurLen, sy + Math.sin(spur1) * spurLen);
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx + Math.cos(spur2) * spurLen, sy + Math.sin(spur2) * spurLen);
              }
            }
            ctx.stroke();
          } else {
            // Background fine crystalline snow mote
            ctx.beginPath();
            ctx.arc(px, py, sz * 0.45, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'ember-spark': {
          // Volcanic ash ember, gold foil, or brass spark
          ctx.beginPath();
          ctx.arc(px, py, sz * 0.7, 0, Math.PI * 2);
          ctx.fill();

          // Spark trail
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - vx * 14, py - vy * 14);
          ctx.stroke();
          break;
        }

        case 'petal-oval': {
          // Sakura blossom petal with organic tumbling rotation
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(time * seed.rotSpeed + seed.phase);
          ctx.beginPath();
          ctx.ellipse(0, 0, sz, sz * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case 'bubble-ring': {
          // Translucent rising water bubble
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(px, py, sz, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Specular gleam on bubble rim
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px - sz * 0.35, py - sz * 0.35, sz * 0.25, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'soft-circle':
        default: {
          // Soft golden pollen or stardust mote
          ctx.beginPath();
          ctx.arc(px, py, sz, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }
    }

    ctx.restore();
  }

  /**
   * Depth-Dependent Haze Pass:
   * Simulates atmospheric optical scattering across distance planes (mountains, horizon, valleys).
   */
  private applyDepthHaze(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    profile: WorldAtmosphereProfile
  ) {
    ctx.save();

    const horizonY = h * profile.horizonRatio;
    const hazeBandH = h * 0.28;

    // Primary Horizon Depth Stratum (Exponential atmospheric scattering)
    const horizonHaze = ctx.createLinearGradient(0, horizonY - hazeBandH * 0.8, 0, horizonY + hazeBandH);
    horizonHaze.addColorStop(0, 'rgba(0, 0, 0, 0)');
    horizonHaze.addColorStop(0.35, profile.hazeColor);
    horizonHaze.addColorStop(0.7, profile.hazeColor);
    horizonHaze.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = horizonHaze;
    ctx.fillRect(0, horizonY - hazeBandH * 0.8, w, hazeBandH * 1.8);

    // Drifting Volumetric Valley Mist Band
    const mistY = horizonY + 25;
    const waveOffset = Math.sin(time * 0.001) * 8;
    ctx.fillStyle = profile.hazeColor;
    ctx.beginPath();
    ctx.moveTo(0, mistY + 35);
    for (let x = 0; x <= w; x += 35) {
      const nx = x * 0.006 + time * 0.0008;
      const y = mistY + Math.sin(nx) * 10 + Math.cos(nx * 2.1) * 5 + waveOffset;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, mistY + 35);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Post-Processing Bloom Pass:
   * Uses a fast 1/4 downscaled offscreen buffer with gaussian blur and screen composite
   * to create an atmospheric, luminous glow on high-energy emissive surfaces
   * (neon billboards, molten lava cracks, golden celestial structures, radioactive fluid).
   */
  private applyPostProcessingBloom(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    time: number,
    profile: WorldAtmosphereProfile
  ) {
    if (!this.bloomCanvas || !this.bloomCtx) return;

    ctx.save();

    const bloomScale = 0.25; // 1/4 downscale for peak 60 FPS performance
    const bw = Math.max(1, Math.floor(w * bloomScale));
    const bh = Math.max(1, Math.floor(h * bloomScale));

    if (this.bloomCanvas.width !== bw || this.bloomCanvas.height !== bh) {
      this.bloomCanvas.width = bw;
      this.bloomCanvas.height = bh;
    }

    // 1. Copy main canvas into downsampled bloom buffer with brightness extraction filter
    this.bloomCtx.clearRect(0, 0, bw, bh);

    try {
      if ('filter' in this.bloomCtx) {
        this.bloomCtx.filter = 'brightness(1.22) contrast(1.18) blur(6px)';
      }
      this.bloomCtx.drawImage(ctx.canvas, 0, 0, w, h, 0, 0, bw, bh);
      if ('filter' in this.bloomCtx) {
        this.bloomCtx.filter = 'none';
      }
    } catch (e) {
      this.bloomCtx.drawImage(ctx.canvas, 0, 0, w, h, 0, 0, bw, bh);
    }

    // 2. Composite soft blurred bloom back over main canvas using screen blend mode
    ctx.globalCompositeOperation = 'screen';
    const finalAlpha = Math.min(0.75, this.bloomIntensity * profile.emissiveIntensity * 1.25);
    ctx.globalAlpha = finalAlpha;
    ctx.drawImage(this.bloomCanvas, 0, 0, bw, bh, 0, 0, w, h);

    // 3. Emissive Atmospheric Spill Light: Add subtle radiant diffusion tint
    const horizonRatio = Number.isFinite(profile.horizonRatio) ? profile.horizonRatio : 0.65;
    const horizonY = h * horizonRatio;
    const innerR = Math.max(5, w * 0.1);
    const outerR = Math.max(innerR + 20, w * 0.75);

    const spillGrad = safeCreateRadialGradient(
      ctx,
      w * 0.5,
      horizonY,
      innerR,
      w * 0.5,
      horizonY,
      outerR
    );
    if (spillGrad) {
      spillGrad.addColorStop(0, profile.emissiveBloomColor);
      spillGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalAlpha = finalAlpha * 0.35;
      ctx.fillStyle = spillGrad;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  /**
   * Internal performance instrumentation (tracks FPS, frame budget, dropped frames)
   */
  private measurePerformance(time: number) {
    const now = performance.now();
    const delta = now - this.lastFrameTimestamp;
    this.lastFrameTimestamp = now;
    this.frameCount++;
    this.frameTimeMs = delta;

    if (delta > 34) {
      this.droppedFrames++;
    }

    if (now - this.lastFpsUpdate >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  /**
   * Public telemetry hook for diagnostics / performance inspection
   */
  getPerformanceMetrics(w: number, h: number): EnvironmentPerformanceMetrics {
    return {
      fps: this.currentFps,
      frameTimeMs: Number(this.frameTimeMs.toFixed(2)),
      droppedFrames: this.droppedFrames,
      renderCount: this.frameCount,
      canvasWidth: w,
      canvasHeight: h,
      bloomActive: this.bloomEnabled,
      depthHazeActive: this.depthHazeEnabled,
      lightingPassActive: this.lightingPassEnabled,
      weatherActive: this.weatherEnabled,
      parallaxActive: this.parallaxEnabled,
      parallaxAltitudeMeters: this.currentAltitudeMeters,
      parallaxAltitudePixels: Math.round(this.currentAltitudePixels),
      parallaxVerticalVelocity: this.verticalVelocity,
      parallaxIntensity: Number(this.parallaxIntensity.toFixed(2)),
      parallaxLayersCount: DEFAULT_PARALLAX_LAYERS.length,
      activeAltitudeTier: this.getCurrentAltitudeTier(),
      activeMilestoneTitle: this.getCurrentMilestoneTitle(),
      activeHazeColor: this.activeHazeColor,
      bloomIntensity: Number(this.bloomIntensity.toFixed(2)),
      weatherIntensity: Number(this.weatherIntensity.toFixed(2)),
      weatherHeightMultiplier: this.activeWeatherHeightMultiplier,
      effectiveWeatherIntensity: this.activeWeatherEffectiveIntensity,
      weatherName: this.activeWeatherName,
      weatherType: this.activeWeatherType,
      weatherCategory: this.activeWeatherCategory,
      activeParticleCount: this.activeWeatherCount,
      lightingState: this.currentLightingState,
    };
  }
}

// Global shared instance for application-wide consistency
export const environmentRenderer = new EnvironmentRenderer();

function colorToRgba(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha.toFixed(3)})`);
  }
  if (color.startsWith('rgba(')) {
    return color.replace(/[\d\.]+\)$/, `${alpha.toFixed(3)})`);
  }
  return color;
}

