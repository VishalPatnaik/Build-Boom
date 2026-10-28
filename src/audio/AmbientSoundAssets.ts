/**
 * AmbientSoundAssets.ts
 * Specific looping ambient sound assets mapped to each active world type and visual theme.
 * Implements procedural Web Audio synthesis graphs engineered for seamless infinite looping.
 */

export interface AmbientSoundAsset {
  id: string;
  name: string;
  worldType: string;
  category: 'natural' | 'cosmic' | 'sci-fi' | 'elemental' | 'whimsical' | 'void';
  description: string;
  buildTrack: (
    ctx: AudioContext,
    masterGain: GainNode,
    activeNodes: (AudioNode | { stop: () => void })[],
    cleanupCallbacks: (() => void)[]
  ) => void;
}

// Utility to generate loopable noise buffer (pink noise approximation)
export function createLoopingNoiseBuffer(ctx: AudioContext, durationSeconds: number = 3): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.floor(sampleRate * durationSeconds);
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const output = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

/**
 * Registry of all looping ambient sound assets by World Type (0-19)
 */
export const WORLD_AMBIENT_ASSETS: Record<number, AmbientSoundAsset> = {
  // 0: Spring Meadow
  0: {
    id: 'ambient_meadow',
    name: 'Spring Meadow Breeze',
    worldType: 'Meadow',
    category: 'natural',
    description: 'Gentle pastoral breeze with soft resonant octave warmth',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(110, ctx.currentTime); // A2

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.18, ctx.currentTime);
      drone.connect(droneGain);
      droneGain.connect(masterGain);

      const noise = ctx.createBufferSource();
      noise.buffer = createLoopingNoiseBuffer(ctx, 4);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.24, ctx.currentTime);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);

      drone.start();
      noise.start();
      activeNodes.push(drone, noise);
    },
  },

  // 1: Lunar Surface
  1: {
    id: 'ambient_lunar',
    name: 'Lunar Regolith Void',
    worldType: 'Lunar',
    category: 'void',
    description: 'Sub-bass vacuum resonance and airless lunar seismic hum',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(48, ctx.currentTime); // Low G1

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(90, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.42, ctx.currentTime);

      sub.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      sub.start();
      activeNodes.push(sub);
    },
  },

  // 2: Martian Canyon
  2: {
    id: 'ambient_canyon',
    name: 'Martian Canyon Sirocco',
    worldType: 'Canyon',
    category: 'elemental',
    description: 'Hollow canyon red-dust wind and acoustic chasm resonance',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const noise = ctx.createBufferSource();
      noise.buffer = createLoopingNoiseBuffer(ctx, 3.5);
      noise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(360, ctx.currentTime);
      bandpass.Q.setValueAtTime(3.2, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.38, ctx.currentTime);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(masterGain);

      noise.start();
      activeNodes.push(noise);
    },
  },

  // 3: Deep Space Nebula
  3: {
    id: 'ambient_space',
    name: 'Deep Space Nebula',
    worldType: 'Space',
    category: 'cosmic',
    description: 'Low cosmic radiation drone with high crystalline celestial shimmer',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(55, ctx.currentTime); // A1

      const high = ctx.createOscillator();
      high.type = 'sine';
      high.frequency.setValueAtTime(880, ctx.currentTime); // A5 celestial

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.35, ctx.currentTime);

      const highGain = ctx.createGain();
      highGain.gain.setValueAtTime(0.04, ctx.currentTime);

      sub.connect(subGain);
      subGain.connect(masterGain);

      high.connect(highGain);
      highGain.connect(masterGain);

      sub.start();
      high.start();
      activeNodes.push(sub, high);
    },
  },

  // 4: Abyssal Coral Reef
  4: {
    id: 'ambient_ocean',
    name: 'Abyssal Coral Reef',
    worldType: 'Ocean',
    category: 'natural',
    description: 'Deep hydroacoustic ocean current swell and resonant pressure hum',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const oceanNoise = ctx.createBufferSource();
      oceanNoise.buffer = createLoopingNoiseBuffer(ctx, 4);
      oceanNoise.loop = true;

      const oceanFilter = ctx.createBiquadFilter();
      oceanFilter.type = 'lowpass';
      oceanFilter.frequency.setValueAtTime(140, ctx.currentTime);

      const oceanGain = ctx.createGain();
      oceanGain.gain.setValueAtTime(0.55, ctx.currentTime);

      oceanNoise.connect(oceanFilter);
      oceanFilter.connect(oceanGain);
      oceanGain.connect(masterGain);

      oceanNoise.start();
      activeNodes.push(oceanNoise);
    },
  },

  // 5: Tropical Sunset Beach
  5: {
    id: 'ambient_beach',
    name: 'Tropical Sunset Surf',
    worldType: 'Beach',
    category: 'natural',
    description: 'Cyclic surf whitewash and warm evening shoreline air',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const noise = ctx.createBufferSource();
      noise.buffer = createLoopingNoiseBuffer(ctx, 4);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.32, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start();
      activeNodes.push(noise);
    },
  },

  // 6: Volcanic Caldera
  6: {
    id: 'ambient_volcano',
    name: 'Volcanic Magma Hearth',
    worldType: 'Volcano',
    category: 'elemental',
    description: 'Subterranean lava rumble and thermal pressure turbulence',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const rumble = ctx.createOscillator();
      rumble.type = 'sawtooth';
      rumble.frequency.setValueAtTime(42, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(85, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.44, ctx.currentTime);

      rumble.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      rumble.start();
      activeNodes.push(rumble);
    },
  },

  // 7: Ancient Stone Citadel
  7: {
    id: 'ambient_citadel',
    name: 'Ancient Stone Citadel',
    worldType: 'Citadel',
    category: 'natural',
    description: 'Hollow cathedral acoustics, stone hall drone, and medieval fortress wind',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(98, ctx.currentTime); // G2

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.24, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start();
      activeNodes.push(osc);
    },
  },

  // 8: Enchanted Redwood Forest
  8: {
    id: 'ambient_forest',
    name: 'Enchanted Redwood Canopy',
    worldType: 'Forest',
    category: 'natural',
    description: 'Ancient tree canopy breeze with deep organic roots resonance',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(146.83, ctx.currentTime); // D3

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();
      activeNodes.push(osc);
    },
  },

  // 9: Golden Desert Oasis
  9: {
    id: 'ambient_desert',
    name: 'Golden Desert Oasis',
    worldType: 'Desert',
    category: 'elemental',
    description: 'Dry desert heat shimmer drone and rolling sand dune wind',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const noise = ctx.createBufferSource();
      noise.buffer = createLoopingNoiseBuffer(ctx, 3);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(520, ctx.currentTime);
      filter.Q.setValueAtTime(2.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start();
      activeNodes.push(noise);
    },
  },

  // 10: Frozen Arctic Tundra
  10: {
    id: 'ambient_winter',
    name: 'Glacial Blizzard Howl',
    worldType: 'Winter',
    category: 'elemental',
    description: 'Howling winter blizzard wind with modulating LFO filter & whistling icy drafts',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const noise = ctx.createBufferSource();
      noise.buffer = createLoopingNoiseBuffer(ctx, 4);
      noise.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(420, ctx.currentTime);
      windFilter.Q.setValueAtTime(5.0, ctx.currentTime);

      // Low frequency oscillator for wind gust modulation
      const gustLfo = ctx.createOscillator();
      gustLfo.type = 'sine';
      gustLfo.frequency.setValueAtTime(0.18, ctx.currentTime);

      const gustGain = ctx.createGain();
      gustGain.gain.setValueAtTime(260, ctx.currentTime);
      gustLfo.connect(gustGain);
      gustGain.connect(windFilter.frequency);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.42, ctx.currentTime);

      noise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);

      // Whistling icy draft tone
      const whistleOsc = ctx.createOscillator();
      whistleOsc.type = 'sine';
      whistleOsc.frequency.setValueAtTime(520, ctx.currentTime);

      const whistleLfo = ctx.createOscillator();
      whistleLfo.type = 'sine';
      whistleLfo.frequency.setValueAtTime(0.35, ctx.currentTime);

      const whistleMod = ctx.createGain();
      whistleMod.gain.setValueAtTime(45, ctx.currentTime);
      whistleLfo.connect(whistleMod);
      whistleMod.connect(whistleOsc.frequency);

      const whistleGain = ctx.createGain();
      whistleGain.gain.setValueAtTime(0.08, ctx.currentTime);

      whistleOsc.connect(whistleGain);
      whistleGain.connect(masterGain);

      noise.start();
      gustLfo.start();
      whistleLfo.start();
      whistleOsc.start();
      activeNodes.push(noise, gustLfo, whistleLfo, whistleOsc);
    },
  },

  // 11: Pirate Corsair Cove
  11: {
    id: 'ambient_pirate',
    name: 'Pirate Corsair Cove',
    worldType: 'Pirate',
    category: 'natural',
    description: 'Wooden galleon timbers creaking resonance and salty sea breeze',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const drone = ctx.createOscillator();
      drone.type = 'triangle';
      drone.frequency.setValueAtTime(82.4, ctx.currentTime); // E2

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.22, ctx.currentTime);

      drone.connect(droneGain);
      droneGain.connect(masterGain);

      drone.start();
      activeNodes.push(drone);
    },
  },

  // 12: Candyland Confection
  12: {
    id: 'ambient_candy',
    name: 'Candyland Confection',
    worldType: 'Candy',
    category: 'whimsical',
    description: 'Playful crystal sugar drone with sparkling musical bell harmonics',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const bell = ctx.createOscillator();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(392, ctx.currentTime); // G4

      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0.12, ctx.currentTime);

      bell.connect(bellGain);
      bellGain.connect(masterGain);

      bell.start();
      activeNodes.push(bell);
    },
  },

  // 13: Golden El Dorado
  13: {
    id: 'ambient_eldorado',
    name: 'Golden El Dorado Shimmer',
    worldType: 'ElDorado',
    category: 'cosmic',
    description: 'Warm solar harmonic drone with shimmering golden overtones',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const root = ctx.createOscillator();
      const third = ctx.createOscillator();
      const fifth = ctx.createOscillator();

      root.type = 'sine';
      third.type = 'sine';
      fifth.type = 'sine';

      root.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
      third.frequency.setValueAtTime(164.81, ctx.currentTime); // E3
      fifth.frequency.setValueAtTime(196.0, ctx.currentTime);  // G3

      const chordGain = ctx.createGain();
      chordGain.gain.setValueAtTime(0.16, ctx.currentTime);

      root.connect(chordGain);
      third.connect(chordGain);
      fifth.connect(chordGain);
      chordGain.connect(masterGain);

      root.start();
      third.start();
      fifth.start();
      activeNodes.push(root, third, fifth);
    },
  },

  // 14: Cyberpunk Megacity
  14: {
    id: 'ambient_cyberpunk',
    name: 'Neon Megacity Hum',
    worldType: 'Cyberpunk',
    category: 'sci-fi',
    description: '60Hz/120Hz transformer grid drone, distant traffic sub-rumble, and neon filament buzz',
    buildTrack: (ctx, masterGain, activeNodes) => {
      // 1. Dual power grid hum (60Hz & 120Hz)
      const hum60 = ctx.createOscillator();
      hum60.type = 'sine';
      hum60.frequency.setValueAtTime(60, ctx.currentTime);

      const hum120 = ctx.createOscillator();
      hum120.type = 'sine';
      hum120.frequency.setValueAtTime(120, ctx.currentTime);

      const humFilter = ctx.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.setValueAtTime(180, ctx.currentTime);

      const humGain = ctx.createGain();
      humGain.gain.setValueAtTime(0.32, ctx.currentTime);

      hum60.connect(humFilter);
      hum120.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(masterGain);

      // 2. Distant urban traffic sub-rumble
      const noise = ctx.createBufferSource();
      noise.buffer = createLoopingNoiseBuffer(ctx, 3);
      noise.loop = true;

      const subFilter = ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(75, ctx.currentTime);
      subFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.48, ctx.currentTime);

      noise.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(masterGain);

      // 3. Faint neon tube high frequency buzz
      const neonNoise = ctx.createBufferSource();
      neonNoise.buffer = noise.buffer;
      neonNoise.loop = true;

      const neonFilter = ctx.createBiquadFilter();
      neonFilter.type = 'bandpass';
      neonFilter.frequency.setValueAtTime(2600, ctx.currentTime);
      neonFilter.Q.setValueAtTime(8.0, ctx.currentTime);

      const neonGain = ctx.createGain();
      neonGain.gain.setValueAtTime(0.04, ctx.currentTime);

      neonNoise.connect(neonFilter);
      neonFilter.connect(neonGain);
      neonGain.connect(masterGain);

      hum60.start();
      hum120.start();
      noise.start();
      neonNoise.start();
      activeNodes.push(hum60, hum120, noise, neonNoise);
    },
  },

  // 15: Toxic Industrial Wasteland
  15: {
    id: 'ambient_industrial',
    name: 'Toxic Industrial Foundry',
    worldType: 'Industrial',
    category: 'sci-fi',
    description: 'Heavy machinery motor thrum, lowpass factory resonance, and pneumatic hum',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const motor = ctx.createOscillator();
      motor.type = 'sawtooth';
      motor.frequency.setValueAtTime(62, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      motor.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      motor.start();
      activeNodes.push(motor);
    },
  },

  // 16: Floating Sky Islands
  16: {
    id: 'ambient_sky',
    name: 'High Altitude Jetstream',
    worldType: 'Sky',
    category: 'elemental',
    description: 'High-altitude rushing troposphere wind and soaring open skies',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const noise = ctx.createBufferSource();
      noise.buffer = createLoopingNoiseBuffer(ctx, 4);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(580, ctx.currentTime);
      filter.Q.setValueAtTime(2.4, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start();
      activeNodes.push(noise);
    },
  },

  // 17: Chrono Clockwork Realm
  17: {
    id: 'ambient_clockwork',
    name: 'Chrono Clockwork Pulse',
    worldType: 'Clockwork',
    category: 'sci-fi',
    description: 'Precision clockwork escapement resonance and rhythmic mechanical hum',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(87.3, ctx.currentTime); // F2

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.2, ctx.currentTime);

      drone.connect(droneGain);
      droneGain.connect(masterGain);

      drone.start();
      activeNodes.push(drone);
    },
  },

  // 18: Sakura Blossom Shrine
  18: {
    id: 'ambient_sakura',
    name: 'Sakura Shrine Breeze',
    worldType: 'Sakura',
    category: 'natural',
    description: 'Peaceful mountain shrine breeze and harmonic bell drone',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const bell = ctx.createOscillator();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(220, ctx.currentTime); // A3

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.16, ctx.currentTime);

      bell.connect(gain);
      gain.connect(masterGain);

      bell.start();
      activeNodes.push(bell);
    },
  },

  // 19: Crystalline Geode Core
  19: {
    id: 'ambient_crystal',
    name: 'Crystalline Geode Core',
    worldType: 'Crystal',
    category: 'cosmic',
    description: 'Prismatic quartz harmonic resonance and pure crystalline chord',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const root = ctx.createOscillator();
      const overtone = ctx.createOscillator();

      root.type = 'sine';
      overtone.type = 'sine';

      root.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
      overtone.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 harmonic

      const gainR = ctx.createGain();
      const gainO = ctx.createGain();
      gainR.gain.setValueAtTime(0.2, ctx.currentTime);
      gainO.gain.setValueAtTime(0.06, ctx.currentTime);

      root.connect(gainR);
      gainR.connect(masterGain);

      overtone.connect(gainO);
      gainO.connect(masterGain);

      root.start();
      overtone.start();
      activeNodes.push(root, overtone);
    },
  },
};

/**
 * Dedicated visualTheme ambient asset mappings
 */
export const VISUAL_THEME_AMBIENT_ASSETS: Record<string, AmbientSoundAsset> = {
  cyberpunk: WORLD_AMBIENT_ASSETS[14], // Neon Megacity Hum
  'deep-cosmos': WORLD_AMBIENT_ASSETS[3], // Deep Space Nebula
  'solar-gold': WORLD_AMBIENT_ASSETS[13], // Golden El Dorado Shimmer
  'high-contrast': {
    id: 'ambient_high_contrast',
    name: 'Tactical Acoustic Void',
    worldType: 'HighContrast',
    category: 'void',
    description: 'Sterile high-focus acoustic void with grounding 45Hz sub-fundamental tone',
    buildTrack: (ctx, masterGain, activeNodes) => {
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(45, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(70, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25, ctx.currentTime);

      sub.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      sub.start();
      activeNodes.push(sub);
    },
  },
};

/**
 * Resolves the appropriate AmbientSoundAsset for a given world type and visual theme
 */
export function getAmbientAssetForWorldAndTheme(
  worldIdentifier: string | number,
  visualTheme?: string
): AmbientSoundAsset {
  // If a specific special visual theme is active, it takes priority for cohesive styling
  if (visualTheme && VISUAL_THEME_AMBIENT_ASSETS[visualTheme]) {
    return VISUAL_THEME_AMBIENT_ASSETS[visualTheme];
  }

  // Otherwise map from world identifier
  if (typeof worldIdentifier === 'number') {
    const safeIdx = Math.abs(Math.round(worldIdentifier)) % 20;
    return WORLD_AMBIENT_ASSETS[safeIdx] || WORLD_AMBIENT_ASSETS[0];
  }

  const str = (worldIdentifier || '').trim().toLowerCase();
  if (str.includes('winter') || str.includes('arctic') || str.includes('tundra') || str === 'bg-10' || str === '10') {
    return WORLD_AMBIENT_ASSETS[10];
  }
  if (str.includes('cyber') || str.includes('neon') || str.includes('megacity') || str === 'bg-14' || str === '14') {
    return WORLD_AMBIENT_ASSETS[14];
  }
  if (str.includes('space') || str.includes('nebula') || str.includes('cosmos') || str === 'bg-3' || str === '3') {
    return WORLD_AMBIENT_ASSETS[3];
  }
  if (str.includes('gold') || str.includes('eldorado') || str === 'bg-13' || str === '13') {
    return WORLD_AMBIENT_ASSETS[13];
  }
  if (str.includes('ocean') || str.includes('reef') || str.includes('abyss') || str === 'bg-4' || str === '4') {
    return WORLD_AMBIENT_ASSETS[4];
  }
  if (str.includes('beach') || str.includes('sunset') || str === 'bg-5' || str === '5') {
    return WORLD_AMBIENT_ASSETS[5];
  }
  if (str.includes('volcano') || str.includes('caldera') || str === 'bg-6' || str === '6') {
    return WORLD_AMBIENT_ASSETS[6];
  }
  if (str.includes('citadel') || str.includes('castle') || str === 'bg-7' || str === '7') {
    return WORLD_AMBIENT_ASSETS[7];
  }
  if (str.includes('forest') || str.includes('redwood') || str === 'bg-8' || str === '8') {
    return WORLD_AMBIENT_ASSETS[8];
  }
  if (str.includes('desert') || str.includes('oasis') || str === 'bg-9' || str === '9') {
    return WORLD_AMBIENT_ASSETS[9];
  }
  if (str.includes('lunar') || str.includes('moon') || str === 'bg-1' || str === '1') {
    return WORLD_AMBIENT_ASSETS[1];
  }
  if (str.includes('canyon') || str.includes('mars') || str === 'bg-2' || str === '2') {
    return WORLD_AMBIENT_ASSETS[2];
  }
  if (str.includes('pirate') || str.includes('cove') || str === 'bg-11' || str === '11') {
    return WORLD_AMBIENT_ASSETS[11];
  }
  if (str.includes('candy') || str.includes('sugar') || str === 'bg-12' || str === '12') {
    return WORLD_AMBIENT_ASSETS[12];
  }
  if (str.includes('industrial') || str.includes('toxic') || str === 'bg-15' || str === '15') {
    return WORLD_AMBIENT_ASSETS[15];
  }
  if (str.includes('sky') || str.includes('floating') || str === 'bg-16' || str === '16') {
    return WORLD_AMBIENT_ASSETS[16];
  }
  if (str.includes('clock') || str.includes('chrono') || str === 'bg-17' || str === '17') {
    return WORLD_AMBIENT_ASSETS[17];
  }
  if (str.includes('sakura') || str.includes('shrine') || str === 'bg-18' || str === '18') {
    return WORLD_AMBIENT_ASSETS[18];
  }
  if (str.includes('crystal') || str.includes('geode') || str === 'bg-19' || str === '19') {
    return WORLD_AMBIENT_ASSETS[19];
  }

  const parsed = parseInt(str.replace('bg-', '').replace('campaign-', ''));
  const idx = (!isNaN(parsed) ? Math.abs(parsed) : 0) % 20;
  return WORLD_AMBIENT_ASSETS[idx] || WORLD_AMBIENT_ASSETS[0];
}
