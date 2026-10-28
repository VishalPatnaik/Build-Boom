import { audio } from './AudioEngine';

export interface AmbienceInstance {
  worldIndex: number;
  worldKey: string;
  soundscapeName: string;
  setVolume: (vol: number) => void;
  stop: (fadeDuration?: number) => void;
}

// Helper to generate pink/white noise buffer
function createNoiseBuffer(ctx: AudioContext, seconds: number = 3): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const bufferSize = Math.floor(sampleRate * seconds);
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const output = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // Pink noise filtering approximation
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
 * Creates world-specific ambient soundscapes using procedural Web Audio synthesis
 */
function buildAmbienceForWorld(
  worldIndex: number,
  visualTheme: string | undefined,
  ctx: AudioContext,
  destNode: AudioNode,
  initialVolume: number = 1.0,
  crossFadeInDuration: number = 1.0
): AmbienceInstance {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(initialVolume, ctx.currentTime + crossFadeInDuration);
  masterGain.connect(destNode);

  const activeNodes: (AudioNode | { stop: () => void })[] = [];
  const cleanupCallbacks: (() => void)[] = [];

  let soundscapeName = 'Ambient Atmosphere';

  // Override by visual theme if special
  const effectiveWorld = visualTheme === 'cyberpunk' ? 14 : worldIndex;

  switch (effectiveWorld) {
    case 10: {
      // ❄️ FROZEN ARCTIC TUNDRA: Howling winter blizzard wind & whistling icy drafts
      soundscapeName = 'Glacial Blizzard Howl';

      // 1. Looping pink noise with oscillating bandpass wind gust filter
      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(420, ctx.currentTime);
      windFilter.Q.setValueAtTime(5.0, ctx.currentTime);

      // Low frequency oscillator for wind gust modulation (howling rise and fall)
      const gustLfo = ctx.createOscillator();
      gustLfo.type = 'sine';
      gustLfo.frequency.setValueAtTime(0.18, ctx.currentTime); // ~5.5s gust cycle

      const gustGain = ctx.createGain();
      gustGain.gain.setValueAtTime(260, ctx.currentTime); // mod depth: 420 +/- 260 Hz
      gustLfo.connect(gustGain);
      gustGain.connect(windFilter.frequency);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.42, ctx.currentTime);

      noiseSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);

      // 2. High whistling wind tone (resonant cold draft)
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

      // Start nodes
      noiseSource.start();
      gustLfo.start();
      whistleLfo.start();
      whistleOsc.start();

      activeNodes.push(noiseSource, gustLfo, whistleLfo, whistleOsc);
      break;
    }

    case 14: {
      // ⚡ CYBERPUNK MEGACITY: Distant city hum, transformer grid drone & neon buzz
      soundscapeName = 'Neon Megacity Hum';

      // 1. Mains power transformer drone (60Hz + 120Hz harmonics)
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
      const noiseBuffer = createNoiseBuffer(ctx, 3);
      const trafficNoise = ctx.createBufferSource();
      trafficNoise.buffer = noiseBuffer;
      trafficNoise.loop = true;

      const subFilter = ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(75, ctx.currentTime);
      subFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.48, ctx.currentTime);

      trafficNoise.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(masterGain);

      // 3. Faint neon tube high frequency buzz
      const neonNoise = ctx.createBufferSource();
      neonNoise.buffer = noiseBuffer;
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
      trafficNoise.start();
      neonNoise.start();

      activeNodes.push(hum60, hum120, trafficNoise, neonNoise);
      break;
    }

    case 2: {
      // 🪐 MARTIAN CANYON: Hollow dusty canyon wind
      soundscapeName = 'Martian Canyon Draft';
      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const canyonNoise = ctx.createBufferSource();
      canyonNoise.buffer = noiseBuffer;
      canyonNoise.loop = true;

      const bandFilter = ctx.createBiquadFilter();
      bandFilter.type = 'bandpass';
      bandFilter.frequency.setValueAtTime(340, ctx.currentTime);
      bandFilter.Q.setValueAtTime(3.2, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(180, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(bandFilter.frequency);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, ctx.currentTime);

      canyonNoise.connect(bandFilter);
      bandFilter.connect(gain);
      gain.connect(masterGain);

      canyonNoise.start();
      lfo.start();
      activeNodes.push(canyonNoise, lfo);
      break;
    }

    case 3: {
      // 🌌 DEEP SPACE NEBULA: Ethereal cosmic drone
      soundscapeName = 'Cosmic Nebula Drone';
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(110.0, ctx.currentTime); // A2
      osc2.frequency.setValueAtTime(110.35, ctx.currentTime); // slight detune for space chorus

      const padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(260, ctx.currentTime);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.24, ctx.currentTime);

      osc1.connect(padFilter);
      osc2.connect(padFilter);
      padFilter.connect(droneGain);
      droneGain.connect(masterGain);

      osc1.start();
      osc2.start();
      activeNodes.push(osc1, osc2);
      break;
    }

    case 4: {
      // 🌊 ABYSSAL CORAL REEF: Underwater muffled sub-ocean drone
      soundscapeName = 'Abyssal Depth Resonance';
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(48, ctx.currentTime);

      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const oceanNoise = ctx.createBufferSource();
      oceanNoise.buffer = noiseBuffer;
      oceanNoise.loop = true;

      const waterFilter = ctx.createBiquadFilter();
      waterFilter.type = 'lowpass';
      waterFilter.frequency.setValueAtTime(140, ctx.currentTime);

      const swellLfo = ctx.createOscillator();
      swellLfo.frequency.setValueAtTime(0.08, ctx.currentTime);
      const swellGain = ctx.createGain();
      swellGain.gain.setValueAtTime(60, ctx.currentTime);
      swellLfo.connect(swellGain);
      swellGain.connect(waterFilter.frequency);

      const waterGain = ctx.createGain();
      waterGain.gain.setValueAtTime(0.38, ctx.currentTime);

      oceanNoise.connect(waterFilter);
      subOsc.connect(waterFilter);
      waterFilter.connect(waterGain);
      waterGain.connect(masterGain);

      subOsc.start();
      oceanNoise.start();
      swellLfo.start();
      activeNodes.push(subOsc, oceanNoise, swellLfo);
      break;
    }

    case 5: {
      // 🏖️ TROPICAL SUNSET BEACH: Gentle rhythmic ocean surf waves
      soundscapeName = 'Ocean Surf Waves';
      const noiseBuffer = createNoiseBuffer(ctx, 5);
      const surfNoise = ctx.createBufferSource();
      surfNoise.buffer = noiseBuffer;
      surfNoise.loop = true;

      const surfFilter = ctx.createBiquadFilter();
      surfFilter.type = 'lowpass';
      surfFilter.frequency.setValueAtTime(450, ctx.currentTime);

      const waveLfo = ctx.createOscillator();
      waveLfo.type = 'sine';
      waveLfo.frequency.setValueAtTime(0.09, ctx.currentTime); // ~11s wave cycle

      const surfGain = ctx.createGain();
      surfGain.gain.setValueAtTime(0.2, ctx.currentTime);

      const waveMod = ctx.createGain();
      waveMod.gain.setValueAtTime(0.18, ctx.currentTime);
      waveLfo.connect(waveMod);
      waveMod.connect(surfGain.gain);

      surfNoise.connect(surfFilter);
      surfFilter.connect(surfGain);
      surfGain.connect(masterGain);

      surfNoise.start();
      waveLfo.start();
      activeNodes.push(surfNoise, waveLfo);
      break;
    }

    case 6: {
      // 🌋 VOLCANIC CALDERA: Low subterranean magma rumble
      soundscapeName = 'Subterranean Magma Rumble';
      const rumbleOsc = ctx.createOscillator();
      rumbleOsc.type = 'sawtooth';
      rumbleOsc.frequency.setValueAtTime(36, ctx.currentTime);

      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(90, ctx.currentTime);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.38, ctx.currentTime);

      rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(masterGain);

      rumbleOsc.start();
      activeNodes.push(rumbleOsc);
      break;
    }

    case 7: {
      // 🏰 ANCIENT STONE CITADEL: Cavernous stone resonance
      soundscapeName = 'Citadel Acoustic Drone';
      const oscA = ctx.createOscillator();
      const oscE = ctx.createOscillator();
      oscA.type = 'sine';
      oscE.type = 'sine';
      oscA.frequency.setValueAtTime(55, ctx.currentTime); // A1
      oscE.frequency.setValueAtTime(82.5, ctx.currentTime); // E2

      const stoneGain = ctx.createGain();
      stoneGain.gain.setValueAtTime(0.22, ctx.currentTime);

      oscA.connect(stoneGain);
      oscE.connect(stoneGain);
      stoneGain.connect(masterGain);

      oscA.start();
      oscE.start();
      activeNodes.push(oscA, oscE);
      break;
    }

    case 8: {
      // 🌲 ENCHANTED REDWOOD FOREST: Canopy rustle & forest resonance
      soundscapeName = 'Redwood Canopy Breeze';
      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const canopyNoise = ctx.createBufferSource();
      canopyNoise.buffer = noiseBuffer;
      canopyNoise.loop = true;

      const canopyFilter = ctx.createBiquadFilter();
      canopyFilter.type = 'bandpass';
      canopyFilter.frequency.setValueAtTime(500, ctx.currentTime);
      canopyFilter.Q.setValueAtTime(2.0, ctx.currentTime);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(92.5, ctx.currentTime); // F#2 warm root

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.12, ctx.currentTime);

      const canopyGain = ctx.createGain();
      canopyGain.gain.setValueAtTime(0.25, ctx.currentTime);

      canopyNoise.connect(canopyFilter);
      canopyFilter.connect(canopyGain);
      canopyGain.connect(masterGain);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      canopyNoise.start();
      osc.start();
      activeNodes.push(canopyNoise, osc);
      break;
    }

    case 9: {
      // 🏜️ GOLDEN DESERT OASIS: Sirocco desert wind
      soundscapeName = 'Desert Sirocco Breeze';
      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const desertNoise = ctx.createBufferSource();
      desertNoise.buffer = noiseBuffer;
      desertNoise.loop = true;

      const desertFilter = ctx.createBiquadFilter();
      desertFilter.type = 'bandpass';
      desertFilter.frequency.setValueAtTime(680, ctx.currentTime);
      desertFilter.Q.setValueAtTime(3.5, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.14, ctx.currentTime);
      const lfoMod = ctx.createGain();
      lfoMod.gain.setValueAtTime(250, ctx.currentTime);
      lfo.connect(lfoMod);
      lfoMod.connect(desertFilter.frequency);

      const desertGain = ctx.createGain();
      desertGain.gain.setValueAtTime(0.28, ctx.currentTime);

      desertNoise.connect(desertFilter);
      desertFilter.connect(desertGain);
      desertGain.connect(masterGain);

      desertNoise.start();
      lfo.start();
      activeNodes.push(desertNoise, lfo);
      break;
    }

    case 13: {
      // 👑 GOLDEN EL DORADO: Resonant metallic singing chime drone
      soundscapeName = 'Sun Temple Chime Resonance';
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
      break;
    }

    case 15: {
      // 🏭 TOXIC INDUSTRIAL WASTELAND: Factory thrum & steam pressure
      soundscapeName = 'Industrial Foundry Thrum';
      const motor = ctx.createOscillator();
      motor.type = 'sawtooth';
      motor.frequency.setValueAtTime(62, ctx.currentTime);

      const motorFilter = ctx.createBiquadFilter();
      motorFilter.type = 'lowpass';
      motorFilter.frequency.setValueAtTime(120, ctx.currentTime);

      const motorGain = ctx.createGain();
      motorGain.gain.setValueAtTime(0.3, ctx.currentTime);

      motor.connect(motorFilter);
      motorFilter.connect(motorGain);
      motorGain.connect(masterGain);

      motor.start();
      activeNodes.push(motor);
      break;
    }

    case 16: {
      // ☁️ FLOATING SKY ISLANDS: High-altitude rushing troposphere wind
      soundscapeName = 'High Altitude Jetstream';
      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const skyNoise = ctx.createBufferSource();
      skyNoise.buffer = noiseBuffer;
      skyNoise.loop = true;

      const skyFilter = ctx.createBiquadFilter();
      skyFilter.type = 'bandpass';
      skyFilter.frequency.setValueAtTime(580, ctx.currentTime);
      skyFilter.Q.setValueAtTime(2.4, ctx.currentTime);

      const skyGain = ctx.createGain();
      skyGain.gain.setValueAtTime(0.3, ctx.currentTime);

      skyNoise.connect(skyFilter);
      skyFilter.connect(skyGain);
      skyGain.connect(masterGain);

      skyNoise.start();
      activeNodes.push(skyNoise);
      break;
    }

    case 17: {
      // ⏳ CHRONO CLOCKWORK REALM: Clockwork escapement resonance
      soundscapeName = 'Clockwork Mechanism Pulse';
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(87.3, ctx.currentTime); // F2

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.18, ctx.currentTime);

      drone.connect(droneGain);
      droneGain.connect(masterGain);
      drone.start();
      activeNodes.push(drone);
      break;
    }

    case 18: {
      // 🌸 SAKURA BLOSSOM SHRINE: Peaceful Zen temple singing bowl
      soundscapeName = 'Zen Temple Meditation Tone';
      const bowl = ctx.createOscillator();
      bowl.type = 'sine';
      bowl.frequency.setValueAtTime(146.83, ctx.currentTime); // D3

      const bowlGain = ctx.createGain();
      bowlGain.gain.setValueAtTime(0.16, ctx.currentTime);

      bowl.connect(bowlGain);
      bowlGain.connect(masterGain);
      bowl.start();
      activeNodes.push(bowl);
      break;
    }

    case 19: {
      // 💎 CRYSTALLINE GEODE CORE: Solfeggio singing crystal overtone
      soundscapeName = 'Singing Quartz Crystal Resonance';
      const crystal528 = ctx.createOscillator();
      const crystalHarmonic = ctx.createOscillator();
      crystal528.type = 'sine';
      crystalHarmonic.type = 'sine';
      crystal528.frequency.setValueAtTime(528, ctx.currentTime); // Solfeggio frequency
      crystalHarmonic.frequency.setValueAtTime(1056, ctx.currentTime);

      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();
      gain1.gain.setValueAtTime(0.14, ctx.currentTime);
      gain2.gain.setValueAtTime(0.04, ctx.currentTime);

      crystal528.connect(gain1);
      gain1.connect(masterGain);

      crystalHarmonic.connect(gain2);
      gain2.connect(masterGain);

      crystal528.start();
      crystalHarmonic.start();
      activeNodes.push(crystal528, crystalHarmonic);
      break;
    }

    case 1: {
      // 🌕 LUNAR SURFACE: Eerie cosmic vacuum hum
      soundscapeName = 'Lunar Vacuum Silence';
      const vacuum = ctx.createOscillator();
      vacuum.type = 'sine';
      vacuum.frequency.setValueAtTime(45, ctx.currentTime);

      const vacuumGain = ctx.createGain();
      vacuumGain.gain.setValueAtTime(0.2, ctx.currentTime);

      vacuum.connect(vacuumGain);
      vacuumGain.connect(masterGain);
      vacuum.start();
      activeNodes.push(vacuum);
      break;
    }

    default: {
      // 🌿 SPRING MEADOW / DEFAULT: Gentle meadow breeze
      soundscapeName = 'Meadow Zephyr Breeze';
      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const meadowNoise = ctx.createBufferSource();
      meadowNoise.buffer = noiseBuffer;
      meadowNoise.loop = true;

      const meadowFilter = ctx.createBiquadFilter();
      meadowFilter.type = 'lowpass';
      meadowFilter.frequency.setValueAtTime(320, ctx.currentTime);

      const meadowGain = ctx.createGain();
      meadowGain.gain.setValueAtTime(0.24, ctx.currentTime);

      meadowNoise.connect(meadowFilter);
      meadowFilter.connect(meadowGain);
      meadowGain.connect(masterGain);

      meadowNoise.start();
      activeNodes.push(meadowNoise);
      break;
    }
  }

  const setVolume = (vol: number) => {
    if (!ctx) return;
    try {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, vol)), ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const stop = (fadeDuration: number = 0.8) => {
    if (!ctx) return;
    try {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + fadeDuration);

      setTimeout(() => {
        activeNodes.forEach((node) => {
          try {
            if ('stop' in node && typeof (node as any).stop === 'function') {
              (node as any).stop();
            }
            if ('disconnect' in node && typeof (node as any).disconnect === 'function') {
              (node as any).disconnect();
            }
          } catch (e) {}
        });
        cleanupCallbacks.forEach((cb) => cb());
        try {
          masterGain.disconnect();
        } catch (e) {}
      }, fadeDuration * 1000 + 100);
    } catch (e) {}
  };

  const worldKey = visualTheme === 'cyberpunk'
    ? 'Cyberpunk'
    : (WORLD_KEYS[effectiveWorld] || 'Meadow');

  return {
    worldIndex: effectiveWorld,
    worldKey,
    soundscapeName,
    setVolume,
    stop,
  };
}

export const WORLD_ENVIRONMENT_NAMES: Record<number, string> = {
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

export const WORLD_KEYS: Record<number, string> = {
  0: 'Meadow',
  1: 'Lunar',
  2: 'Canyon',
  3: 'Space',
  4: 'Ocean',
  5: 'Beach',
  6: 'Volcano',
  7: 'Citadel',
  8: 'Forest',
  9: 'Desert',
  10: 'Winter',
  11: 'Pirate',
  12: 'Candy',
  13: 'ElDorado',
  14: 'Cyberpunk',
  15: 'Industrial',
  16: 'Sky',
  17: 'Clockwork',
  18: 'Sakura',
  19: 'Crystal',
};

export function resolveWorldEnvironment(input: string | number | undefined | null): {
  worldIndex: number;
  worldKey: string;
  worldName: string;
  visualTheme: string;
} {
  if (typeof input === 'number') {
    const idx = Math.abs(Math.round(input)) % 20;
    return {
      worldIndex: idx,
      worldKey: WORLD_KEYS[idx] || 'Meadow',
      worldName: WORLD_ENVIRONMENT_NAMES[idx] || 'World Environment',
      visualTheme: idx === 14 ? 'cyberpunk' : idx === 13 ? 'solar-gold' : idx === 3 ? 'deep-cosmos' : 'default',
    };
  }

  const str = (input || '').trim().toLowerCase();
  if (!str) {
    return { worldIndex: 0, worldKey: 'Meadow', worldName: WORLD_ENVIRONMENT_NAMES[0], visualTheme: 'default' };
  }

  if (str.includes('winter') || str.includes('arctic') || str.includes('tundra') || str === 'bg-10' || str === '10') {
    return { worldIndex: 10, worldKey: 'Winter', worldName: WORLD_ENVIRONMENT_NAMES[10], visualTheme: 'default' };
  }
  if (str.includes('cyber') || str.includes('neon') || str.includes('megacity') || str === 'bg-14' || str === '14') {
    return { worldIndex: 14, worldKey: 'Cyberpunk', worldName: WORLD_ENVIRONMENT_NAMES[14], visualTheme: 'cyberpunk' };
  }
  if (str.includes('space') || str.includes('nebula') || str.includes('cosmos') || str === 'bg-3' || str === '3') {
    return { worldIndex: 3, worldKey: 'Space', worldName: WORLD_ENVIRONMENT_NAMES[3], visualTheme: 'deep-cosmos' };
  }
  if (str.includes('gold') || str.includes('eldorado') || str === 'bg-13' || str === '13') {
    return { worldIndex: 13, worldKey: 'ElDorado', worldName: WORLD_ENVIRONMENT_NAMES[13], visualTheme: 'solar-gold' };
  }
  if (str.includes('ocean') || str.includes('reef') || str.includes('abyss') || str === 'bg-4' || str === '4') {
    return { worldIndex: 4, worldKey: 'Ocean', worldName: WORLD_ENVIRONMENT_NAMES[4], visualTheme: 'default' };
  }
  if (str.includes('beach') || str.includes('sunset') || str === 'bg-5' || str === '5') {
    return { worldIndex: 5, worldKey: 'Beach', worldName: WORLD_ENVIRONMENT_NAMES[5], visualTheme: 'default' };
  }
  if (str.includes('volcano') || str.includes('caldera') || str === 'bg-6' || str === '6') {
    return { worldIndex: 6, worldKey: 'Volcano', worldName: WORLD_ENVIRONMENT_NAMES[6], visualTheme: 'default' };
  }
  if (str.includes('citadel') || str.includes('castle') || str === 'bg-7' || str === '7') {
    return { worldIndex: 7, worldKey: 'Citadel', worldName: WORLD_ENVIRONMENT_NAMES[7], visualTheme: 'default' };
  }
  if (str.includes('forest') || str.includes('redwood') || str === 'bg-8' || str === '8') {
    return { worldIndex: 8, worldKey: 'Forest', worldName: WORLD_ENVIRONMENT_NAMES[8], visualTheme: 'default' };
  }
  if (str.includes('desert') || str.includes('oasis') || str === 'bg-9' || str === '9') {
    return { worldIndex: 9, worldKey: 'Desert', worldName: WORLD_ENVIRONMENT_NAMES[9], visualTheme: 'default' };
  }
  if (str.includes('lunar') || str.includes('moon') || str === 'bg-1' || str === '1') {
    return { worldIndex: 1, worldKey: 'Lunar', worldName: WORLD_ENVIRONMENT_NAMES[1], visualTheme: 'default' };
  }
  if (str.includes('canyon') || str.includes('mars') || str === 'bg-2' || str === '2') {
    return { worldIndex: 2, worldKey: 'Canyon', worldName: WORLD_ENVIRONMENT_NAMES[2], visualTheme: 'default' };
  }
  if (str.includes('pirate') || str.includes('cove') || str === 'bg-11' || str === '11') {
    return { worldIndex: 11, worldKey: 'Pirate', worldName: WORLD_ENVIRONMENT_NAMES[11], visualTheme: 'default' };
  }
  if (str.includes('candy') || str.includes('sugar') || str === 'bg-12' || str === '12') {
    return { worldIndex: 12, worldKey: 'Candy', worldName: WORLD_ENVIRONMENT_NAMES[12], visualTheme: 'default' };
  }
  if (str.includes('industrial') || str.includes('toxic') || str === 'bg-15' || str === '15') {
    return { worldIndex: 15, worldKey: 'Industrial', worldName: WORLD_ENVIRONMENT_NAMES[15], visualTheme: 'default' };
  }
  if (str.includes('sky') || str.includes('floating') || str === 'bg-16' || str === '16') {
    return { worldIndex: 16, worldKey: 'Sky', worldName: WORLD_ENVIRONMENT_NAMES[16], visualTheme: 'default' };
  }
  if (str.includes('clock') || str.includes('chrono') || str === 'bg-17' || str === '17') {
    return { worldIndex: 17, worldKey: 'Clockwork', worldName: WORLD_ENVIRONMENT_NAMES[17], visualTheme: 'default' };
  }
  if (str.includes('sakura') || str.includes('shrine') || str === 'bg-18' || str === '18') {
    return { worldIndex: 18, worldKey: 'Sakura', worldName: WORLD_ENVIRONMENT_NAMES[18], visualTheme: 'default' };
  }
  if (str.includes('crystal') || str.includes('geode') || str === 'bg-19' || str === '19') {
    return { worldIndex: 19, worldKey: 'Crystal', worldName: WORLD_ENVIRONMENT_NAMES[19], visualTheme: 'default' };
  }

  const parsed = parseInt(str.replace('bg-', '').replace('campaign-', ''));
  const idx = (!isNaN(parsed) ? Math.abs(parsed) : 0) % 20;
  return {
    worldIndex: idx,
    worldKey: WORLD_KEYS[idx] || 'Meadow',
    worldName: WORLD_ENVIRONMENT_NAMES[idx] || 'World Environment',
    visualTheme: idx === 14 ? 'cyberpunk' : idx === 13 ? 'solar-gold' : idx === 3 ? 'deep-cosmos' : 'default',
  };
}

/**
 * WorldAmbienceManager: Singleton that manages active world soundscapes,
 * cross-fading smoothly when worlds shift or when entering/exiting GameBoard.
 */
class WorldAmbienceManager {
  private currentInstance: AmbienceInstance | null = null;
  private currentWorldKey: string | null = null;
  private currentWorldIndex: number | null = null;
  private currentVisualTheme: string | null = null;
  private isMuted: boolean = false;
  private volume: number = 1.0;

  public startAmbience(
    worldInput: string | number,
    visualThemeOverride?: string,
    crossFadeDuration: number = 1.0,
    customVolume?: number
  ): AmbienceInstance | null {
    const ctx = audio.getAudioContext();
    if (!ctx) return null;

    if (customVolume !== undefined) {
      this.volume = customVolume;
    }

    const env = resolveWorldEnvironment(worldInput);
    const effectiveTheme = visualThemeOverride || env.visualTheme;

    // If already playing the exact same world & theme, simply update volume
    if (
      this.currentInstance &&
      this.currentWorldKey === env.worldKey &&
      this.currentVisualTheme === effectiveTheme
    ) {
      this.currentInstance.setVolume(this.isMuted ? 0 : this.volume);
      return this.currentInstance;
    }

    // Smoothly cross-fade: fade out previous ambience over crossFadeDuration
    if (this.currentInstance) {
      this.currentInstance.stop(crossFadeDuration);
      this.currentInstance = null;
    }

    this.currentWorldIndex = env.worldIndex;
    this.currentWorldKey = env.worldKey;
    this.currentVisualTheme = effectiveTheme;

    const dest = audio.getAmbienceDestination();
    if (!dest) return null;

    // Concurrently fade in the new world track over crossFadeDuration
    const instance = buildAmbienceForWorld(
      env.worldIndex,
      effectiveTheme,
      ctx,
      dest,
      this.isMuted ? 0 : this.volume,
      crossFadeDuration
    );

    this.currentInstance = instance;
    return instance;
  }

  public stopAmbience(fadeDuration: number = 0.8) {
    if (this.currentInstance) {
      this.currentInstance.stop(fadeDuration);
      this.currentInstance = null;
    }
    this.currentWorldIndex = null;
    this.currentWorldKey = null;
    this.currentVisualTheme = null;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentInstance && !this.isMuted) {
      this.currentInstance.setVolume(this.volume);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.currentInstance) {
      this.currentInstance.setVolume(muted ? 0 : this.volume);
    }
  }

  public getCurrentSoundscapeName(): string {
    return this.currentInstance?.soundscapeName || 'Inactive';
  }

  public getCurrentWorldKey(): string | null {
    return this.currentWorldKey;
  }

  public isPlaying(): boolean {
    return this.currentInstance !== null;
  }

  public getActiveWorldIndex(): number | null {
    return this.currentWorldIndex;
  }
}

export const worldAmbienceManager = new WorldAmbienceManager();
