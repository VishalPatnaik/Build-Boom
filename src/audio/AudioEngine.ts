export type SoundPackTheme = 'default' | 'retro' | 'scifi' | 'organic';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private initialized = false;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  public sfxEnabled: boolean = true;
  public musicEnabled: boolean = true;
  public sfxVolume: number = 0.8;
  public musicVolume: number = 0.6;
  public soundPack: SoundPackTheme = 'retro';

  public setSoundPack(pack: SoundPackTheme) {
    this.soundPack = pack;
  }

  private isMusicPlaying: boolean = false;
  private musicTimer: any = null;
  private musicStep: number = 0;
  private activeMusicNodes: AudioNode[] = [];

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? this.sfxVolume : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? this.musicVolume : 0, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);

      this.initialized = true;

      if (this.musicEnabled) {
        this.startMusic();
      }
    } catch (e) {
      console.error('AudioContext not supported');
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getDestination(): AudioNode {
    if (!this.ctx) return null as any;
    if (this.sfxGain) return this.sfxGain;
    return this.ctx.destination;
  }

  setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(enabled ? this.sfxVolume : 0, this.ctx.currentTime);
    }
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx && this.sfxEnabled) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx && this.musicEnabled) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  startMusic() {
    if (!this.musicEnabled) return;
    this.init();
    this.resume();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(this.musicVolume, this.ctx.currentTime + 1.2);
    }
    this.scheduleMusicStep();
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    }
    const currentNodes = [...this.activeMusicNodes];
    this.activeMusicNodes = [];
    setTimeout(() => {
      currentNodes.forEach((node) => {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          node.disconnect();
        } catch (e) {}
      });
    }, 450);
  }

  private scheduleMusicStep() {
    if (!this.isMusicPlaying || !this.ctx || !this.musicEnabled) return;
    this.resume();

    const t = this.ctx.currentTime;
    const dest = this.musicGain || this.ctx.destination;

    // Atmospheric Cyber Orbit Ambient Chord Progression: Dm9 -> Bbmaj7 -> Fmaj7 -> C/E
    const chords = [
      { bass: 73.42, notes: [146.83, 220.00, 261.63, 329.63] }, // D2, D3, A3, C4, E4
      { bass: 58.27, notes: [116.54, 174.61, 220.00, 293.66] }, // Bb1, Bb2, F3, A3, D4
      { bass: 87.31, notes: [174.61, 261.63, 329.63, 392.00] }, // F2, F3, C4, E4, G4
      { bass: 65.41, notes: [130.81, 196.00, 261.63, 329.63] }, // C2, C3, G3, C4, E4
    ];

    const chord = chords[this.musicStep % chords.length];
    const barDuration = 3.6; // Seconds per chord bar

    // 1. Warm atmospheric pad for the chord
    const padGain = this.ctx.createGain();
    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(650 + Math.sin(t * 0.2) * 150, t);
    padFilter.Q.value = 1.2;

    padGain.gain.setValueAtTime(0, t);
    padGain.gain.linearRampToValueAtTime(0.11, t + 0.9);
    padGain.gain.setValueAtTime(0.11, t + barDuration - 0.9);
    padGain.gain.exponentialRampToValueAtTime(0.001, t + barDuration);

    padFilter.connect(padGain);
    padGain.connect(dest);

    chord.notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (idx === 1 ? 0.6 : idx === 3 ? -0.5 : 0), t);
      osc.connect(padFilter);
      osc.start(t);
      osc.stop(t + barDuration);
      this.activeMusicNodes.push(osc);
    });

    // 2. Sub-bass pulse
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(chord.bass, t);
    bassGain.gain.setValueAtTime(0, t);
    bassGain.gain.linearRampToValueAtTime(0.18, t + 0.1);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + barDuration * 0.7);

    bassOsc.connect(bassGain);
    bassGain.connect(dest);
    bassOsc.start(t);
    bassOsc.stop(t + barDuration * 0.75);
    this.activeMusicNodes.push(bassOsc);

    // 3. Ethereal crystal arpeggio chimes (4 notes during the bar)
    const arpeggioNotes = [
      chord.notes[0] * 2,
      chord.notes[1] * 2,
      chord.notes[2] * 2,
      chord.notes[3] * 2,
      chord.notes[1] * 3,
    ];

    for (let i = 0; i < 4; i++) {
      const noteTime = t + 0.4 + i * 0.65;
      const arpFreq = arpeggioNotes[(this.musicStep + i * 2) % arpeggioNotes.length];
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();

      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(arpFreq, noteTime);

      arpGain.gain.setValueAtTime(0, noteTime);
      arpGain.gain.linearRampToValueAtTime(0.05, noteTime + 0.03);
      arpGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

      arpOsc.connect(arpGain);
      arpGain.connect(dest);

      arpOsc.start(noteTime);
      arpOsc.stop(noteTime + 0.65);
      this.activeMusicNodes.push(arpOsc);
    }

    this.activeMusicNodes = this.activeMusicNodes.slice(-20);

    this.musicStep++;
    this.musicTimer = setTimeout(() => {
      this.scheduleMusicStep();
    }, barDuration * 980);
  }

  playBuildSound(pitchMult: number = 1, mass: number = 1) {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    // Vary pitch inversely based on block mass (1/sqrt(mass))
    const massPitch = Math.pow(1 / Math.max(0.2, mass), 0.45);
    const effectivePitch = pitchMult * massPitch;

    // Synth click + harmonic chord
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc2.type = 'triangle';
    
    osc.frequency.setValueAtTime(440 * effectivePitch, t);
    osc.frequency.exponentialRampToValueAtTime(880 * effectivePitch, t + 0.1);
    
    osc2.frequency.setValueAtTime(554.37 * effectivePitch, t); // Major 3rd
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.getDestination());
    
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.3);
    osc2.stop(t + 0.3);
  }

  /**
   * Stacking sound effect: Plays when a block locks into the tower structure.
   * Modulated by Sound Pack Theme (Retro, Sci-Fi, Organic, Default), block mass, and combo streaks.
   */
  playStackSound(
    mass: number = 1.0,
    options?: {
      archetype?: string;
      isPerfect?: boolean;
      combo?: number;
    }
  ) {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Mass-to-pitch relationship: f ~ 1/sqrt(mass)
    const massPitch = Math.pow(1 / Math.max(0.25, mass), 0.45);
    const comboFactor = Math.min(1.8, 1 + ((options?.combo || 0) * 0.035));
    const effectivePitch = massPitch * comboFactor;

    switch (this.soundPack) {
      case 'retro':
        this.playStackSoundRetro(mass, effectivePitch, t, options);
        break;
      case 'scifi':
        this.playStackSoundSciFi(mass, effectivePitch, t, options);
        break;
      case 'organic':
        this.playStackSoundOrganic(mass, effectivePitch, t, options);
        break;
      case 'default':
      default:
        this.playStackSoundDefault(mass, effectivePitch, t, options);
        break;
    }
  }

  /**
   * RETRO SOUND PACK: Chiptune 8-bit arcade arpeggiated square/pulse waves
   */
  private playStackSoundRetro(
    mass: number,
    effectivePitch: number,
    t: number,
    options?: { archetype?: string; isPerfect?: boolean; combo?: number }
  ) {
    if (!this.ctx) return;
    const baseFreq = (options?.isPerfect ? 392 : 293.66) * effectivePitch; // G4 / D4

    // 1. 8-Bit Noise Blip Transient
    const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.025), this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    noiseSource.connect(noiseGain);
    noiseGain.connect(this.getDestination());
    noiseSource.start(t);

    // 2. Chiptune Square Wave Rapid Arpeggio
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';

    if (options?.isPerfect) {
      // Ascending arcade chime: Tonic -> Mediant -> Dominant -> Octave
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.setValueAtTime(baseFreq * 1.25, t + 0.035);
      osc.frequency.setValueAtTime(baseFreq * 1.5, t + 0.07);
      osc.frequency.setValueAtTime(baseFreq * 2.0, t + 0.105);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start(t);
      osc.stop(t + 0.28);
    } else {
      // 8-bit double-blip lock
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.setValueAtTime(baseFreq * 1.5, t + 0.04);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start(t);
      osc.stop(t + 0.2);
    }

    // Heavy mass low sub-blip
    if (mass >= 1.4) {
      const sub = this.ctx.createOscillator();
      const subG = this.ctx.createGain();
      sub.type = 'square';
      sub.frequency.setValueAtTime(baseFreq * 0.5, t);
      subG.gain.setValueAtTime(0.18, t);
      subG.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      sub.connect(subG);
      subG.connect(this.getDestination());
      sub.start(t);
      sub.stop(t + 0.22);
    }
  }

  /**
   * SCI-FI SOUND PACK: Futuristic FM synthesis, metallic resonant sweeps, quantum tractor lock
   */
  private playStackSoundSciFi(
    mass: number,
    effectivePitch: number,
    t: number,
    options?: { archetype?: string; isPerfect?: boolean; combo?: number }
  ) {
    if (!this.ctx) return;
    const carrierFreq = 440 * effectivePitch;

    // 1. FM Modulator
    const modOsc = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    modOsc.type = 'sawtooth';
    modOsc.frequency.setValueAtTime(carrierFreq * 2.5, t);
    modGain.gain.setValueAtTime(320 * effectivePitch, t);
    modGain.gain.exponentialRampToValueAtTime(10, t + 0.2);

    // 2. FM Carrier with Resonant Sweep Filter
    const carrierOsc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    carrierOsc.type = 'sine';
    carrierOsc.frequency.setValueAtTime(carrierFreq, t);
    carrierOsc.frequency.exponentialRampToValueAtTime(carrierFreq * 0.75, t + 0.25);

    modOsc.connect(modGain);
    modGain.connect(carrierOsc.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800 * effectivePitch, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.25);
    filter.Q.value = 4.5; // High resonant laser sizzle

    const dur = Math.min(0.45, 0.25 + mass * 0.06);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    carrierOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination());

    modOsc.start(t);
    carrierOsc.start(t);
    modOsc.stop(t + dur);
    carrierOsc.stop(t + dur);

    // Holographic shimmer ping for perfect / high combo
    if (options?.isPerfect || (options?.combo || 0) >= 3) {
      const ping = this.ctx.createOscillator();
      const pingG = this.ctx.createGain();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(1760 * effectivePitch, t);
      pingG.gain.setValueAtTime(0.18, t);
      pingG.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      ping.connect(pingG);
      pingG.connect(this.getDestination());
      ping.start(t);
      ping.stop(t + 0.35);
    }
  }

  /**
   * ORGANIC SOUND PACK: Warm acoustic wooden marimba, kalimba strike & bamboo resonance
   */
  private playStackSoundOrganic(
    mass: number,
    effectivePitch: number,
    t: number,
    options?: { archetype?: string; isPerfect?: boolean; combo?: number }
  ) {
    if (!this.ctx) return;
    const baseFreq = 261.63 * effectivePitch; // C4 nominal warm acoustic wood tone

    // 1. Acoustic Wood Strike (Instantaneous mallet transient)
    const malletOsc = this.ctx.createOscillator();
    const malletFilter = this.ctx.createBiquadFilter();
    const malletGain = this.ctx.createGain();

    malletOsc.type = 'triangle';
    malletOsc.frequency.setValueAtTime(1100 * effectivePitch, t);
    malletOsc.frequency.exponentialRampToValueAtTime(220, t + 0.02);

    malletFilter.type = 'lowpass';
    malletFilter.frequency.setValueAtTime(1400, t); // Soft warm wooden impact

    malletGain.gain.setValueAtTime(0.32, t);
    malletGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    malletOsc.connect(malletFilter);
    malletFilter.connect(malletGain);
    malletGain.connect(this.getDestination());
    malletOsc.start(t);
    malletOsc.stop(t + 0.025);

    // 2. Resonant Wooden Bar Fundamental & Overtone (natural 2.76x non-harmonic wood mode)
    const barOsc = this.ctx.createOscillator();
    const overtoneOsc = this.ctx.createOscillator();
    const barGain = this.ctx.createGain();

    barOsc.type = 'sine';
    barOsc.frequency.setValueAtTime(baseFreq, t);

    overtoneOsc.type = 'sine';
    overtoneOsc.frequency.setValueAtTime(baseFreq * 2.76, t); // Authentic wooden bar physics

    const dur = Math.min(0.48, 0.2 + mass * 0.08);
    barGain.gain.setValueAtTime(0.35, t);
    barGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    barOsc.connect(barGain);
    overtoneOsc.connect(barGain);
    barGain.connect(this.getDestination());

    barOsc.start(t);
    overtoneOsc.start(t);
    barOsc.stop(t + dur);
    overtoneOsc.stop(t + dur * 0.45); // Overtone damps faster

    // Bamboo rattle for perfect stacks
    if (options?.isPerfect) {
      const bell = this.ctx.createOscillator();
      const bellG = this.ctx.createGain();
      bell.type = 'triangle';
      bell.frequency.setValueAtTime(baseFreq * 4.0, t);
      bellG.gain.setValueAtTime(0.16, t);
      bellG.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      bell.connect(bellG);
      bellG.connect(this.getDestination());
      bell.start(t);
      bell.stop(t + 0.3);
    }
  }

  /**
   * DEFAULT SOUND PACK: Crisp mechanical kinetic snap + foundation body tone
   */
  private playStackSoundDefault(
    mass: number,
    effectivePitch: number,
    t: number,
    options?: { archetype?: string; isPerfect?: boolean; combo?: number }
  ) {
    if (!this.ctx) return;

    // 1. Transient click (physical contact/snap into place)
    const clickOsc = this.ctx.createOscillator();
    const clickFilter = this.ctx.createBiquadFilter();
    const clickGain = this.ctx.createGain();

    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1400 * effectivePitch, t);
    clickOsc.frequency.exponentialRampToValueAtTime(320, t + 0.03);

    clickFilter.type = 'bandpass';
    clickFilter.frequency.setValueAtTime(1600 * effectivePitch, t);
    clickFilter.Q.value = 2.0;

    clickGain.gain.setValueAtTime(0.26, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.getDestination());
    clickOsc.start(t);
    clickOsc.stop(t + 0.035);

    // 2. Foundation body tone (resonant frequency based on mass)
    const baseFreq = 330 * effectivePitch; // E4 nominal for mass 1.0
    const bodyOsc = this.ctx.createOscillator();
    const bodyOscHarmonic = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();

    bodyOsc.type = 'sine';
    bodyOscHarmonic.type = 'triangle';

    bodyOsc.frequency.setValueAtTime(baseFreq, t);
    bodyOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.05, t + 0.08);

    bodyOscHarmonic.frequency.setValueAtTime(baseFreq * 1.5, t); // Perfect fifth overtone

    // Duration and decay: heavier mass rings longer, lighter mass is snappy
    const duration = Math.min(0.55, 0.22 + (mass * 0.07));
    const maxGain = Math.min(0.35, 0.22 + (mass * 0.04));

    bodyGain.gain.setValueAtTime(0, t);
    bodyGain.gain.linearRampToValueAtTime(maxGain, t + 0.015);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    bodyOsc.connect(bodyGain);
    bodyOscHarmonic.connect(bodyGain);
    bodyGain.connect(this.getDestination());

    bodyOsc.start(t);
    bodyOscHarmonic.start(t);
    bodyOsc.stop(t + duration);
    bodyOscHarmonic.stop(t + duration);

    // 3. Sub-bass thump for dense, heavy mass blocks (mass >= 1.4 e.g. Titan, Gold)
    if (mass >= 1.4) {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = 'sine';
      const subFreq = Math.max(35, 75 / Math.sqrt(mass));
      subOsc.frequency.setValueAtTime(subFreq, t);
      subOsc.frequency.exponentialRampToValueAtTime(28, t + 0.25);

      const subVolume = Math.min(0.35, 0.15 + mass * 0.06);
      subGain.gain.setValueAtTime(subVolume, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      subOsc.connect(subGain);
      subGain.connect(this.getDestination());

      subOsc.start(t);
      subOsc.stop(t + 0.28);
    }

    // 4. Archetype-specific color
    if (options?.archetype === 'prism') {
      const prismOsc = this.ctx.createOscillator();
      const prismGain = this.ctx.createGain();
      prismOsc.type = 'sine';
      prismOsc.frequency.setValueAtTime(1318.51 * effectivePitch, t); // E6
      prismGain.gain.setValueAtTime(0.18, t);
      prismGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      prismOsc.connect(prismGain);
      prismGain.connect(this.getDestination());
      prismOsc.start(t);
      prismOsc.stop(t + 0.35);
    } else if (options?.archetype === 'gold_ingot') {
      const goldOsc = this.ctx.createOscillator();
      const goldGain = this.ctx.createGain();
      goldOsc.type = 'triangle';
      goldOsc.frequency.setValueAtTime(880 * effectivePitch, t);
      goldGain.gain.setValueAtTime(0.2, t);
      goldGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      goldOsc.connect(goldGain);
      goldGain.connect(this.getDestination());
      goldOsc.start(t);
      goldOsc.stop(t + 0.4);
    }
  }

  /**
   * Collision sound effect: Plays when blocks collide with tower surfaces, boundaries,
   * or enter collision proximity. Pitch inversely scales with block mass.
   */
  playCollisionSound(
    mass: number = 1.0,
    options?: {
      type?: 'impact' | 'crash' | 'glance' | 'deflect' | 'contact';
      velocity?: number;
      speed?: number;
    }
  ) {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    const type = options?.type || 'impact';

    // Mass-to-pitch relationship: f ~ 1/sqrt(mass)
    const massPitch = Math.max(0.35, Math.min(2.5, 1 / Math.sqrt(Math.max(0.15, mass))));

    if (type === 'contact') {
      // Subtle rhythmic contact tick when block enters landing zone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100 * massPitch, t);
      osc.frequency.exponentialRampToValueAtTime(300 * massPitch, t + 0.025);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start(t);
      osc.stop(t + 0.025);
      return;
    }

    if (type === 'glance') {
      // High-pitched glancing deflection
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580 * massPitch, t);
      osc.frequency.exponentialRampToValueAtTime(880 * massPitch, t + 0.08);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start(t);
      osc.stop(t + 0.1);
      return;
    }

    if (type === 'deflect') {
      // Aegis shield kinetic deflection ping
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(740 * massPitch, t);
      osc2.frequency.setValueAtTime(1110 * massPitch, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.getDestination());
      osc.start(t);
      osc2.start(t);
      osc.stop(t + 0.2);
      osc2.stop(t + 0.2);
      return;
    }

    if (type === 'crash') {
      // Destructive collision crash
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140 * massPitch, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start(t);
      osc.stop(t + 0.35);

      // Noise crunch
      try {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.2);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 * massPitch, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.2);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.28, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.getDestination());
        noise.start(t);
      } catch (e) {}
      return;
    }

    // Default: 'impact' (Kinetic physical collision with tower deck)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    const startFreq = 220 * massPitch;
    const endFreq = 65 * massPitch;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(12000, 1800 * massPitch), t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.12);

    const impactVolume = Math.min(0.38, 0.2 + mass * 0.05);
    const duration = Math.min(0.35, 0.12 + mass * 0.05);

    gain.gain.setValueAtTime(impactVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination());

    osc.start(t);
    osc.stop(t + duration);

    // Physical crack transient
    try {
      const clickSize = Math.floor(this.ctx.sampleRate * 0.02);
      const clickBuffer = this.ctx.createBuffer(1, clickSize, this.ctx.sampleRate);
      const clickData = clickBuffer.getChannelData(0);
      for (let i = 0; i < clickSize; i++) clickData[i] = (Math.random() * 2 - 1) * (1 - i / clickSize);
      const clickSource = this.ctx.createBufferSource();
      clickSource.buffer = clickBuffer;

      const clickBpf = this.ctx.createBiquadFilter();
      clickBpf.type = 'bandpass';
      clickBpf.frequency.setValueAtTime(Math.min(8000, 950 * massPitch), t);
      clickBpf.Q.value = 1.8;

      const clickGainNode = this.ctx.createGain();
      clickGainNode.gain.setValueAtTime(0.18, t);
      clickGainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      clickSource.connect(clickBpf);
      clickBpf.connect(clickGainNode);
      clickGainNode.connect(this.getDestination());
      clickSource.start(t);
    } catch (e) {}
  }

  playBoomSound() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Low frequency explosion
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(10, t + 0.5);
    
    // Noise
    const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    
    osc.connect(gain);
    gain.connect(this.getDestination());
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.getDestination());
    
    osc.start(t);
    osc.stop(t + 0.5);
    
    noise.start(t);
  }

  playPerfectSound() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    
    const freqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, t + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.2, t + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.5);
      
      osc.connect(gain);
      gain.connect(this.getDestination());
      
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.5);
    });
  }

  // TACTICAL AUDIO SYNTHESIS
  playStasisSound(activate: boolean) {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';

    if (activate) {
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.4);
      filter.frequency.setValueAtTime(2000, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.4);
    } else {
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.3);
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(2500, t + 0.3);
    }

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination());

    osc.start(t);
    osc.stop(t + 0.45);
  }

  playEmpBlast() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;

    // High frequency electric sweep + sub burst
    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const subGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.25);

    sub.type = 'triangle';
    sub.frequency.setValueAtTime(90, t);
    sub.frequency.exponentialRampToValueAtTime(30, t + 0.4);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    subGain.gain.setValueAtTime(0.4, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    sub.connect(subGain);
    gain.connect(this.getDestination());
    subGain.connect(this.getDestination());

    osc.start(t);
    osc.stop(t + 0.25);
    sub.start(t);
    sub.stop(t + 0.4);
  }

  playShieldBreak() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Crystalline barrier shatter
    [587.33, 880, 1174.66, 1760].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 40 - 20), t + idx * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + idx * 0.03 + 0.35);

      gain.gain.setValueAtTime(0.2, t + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.03 + 0.35);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t + idx * 0.03);
      osc.stop(t + idx * 0.03 + 0.35);
    });
  }

  playComboSurge(tier: number) {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Harmonic arpeggio based on tier
    const baseFreq = 330 * Math.pow(1.05946, Math.min(18, tier * 2));
    const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

    chord.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.04);

      gain.gain.setValueAtTime(0.18, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 0.4);
    });
  }

  playTiltWarning() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.setValueAtTime(600, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.getDestination());

    osc.start(t);
    osc.stop(t + 0.18);
  }

  playTitanAnchor() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Deep metallic anvil clang
    const osc = this.ctx.createOscillator();
    const clang = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.6);

    clang.type = 'sine';
    clang.frequency.setValueAtTime(1240, t);
    clang.frequency.exponentialRampToValueAtTime(320, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    clang.connect(gain);
    gain.connect(this.getDestination());

    osc.start(t);
    clang.start(t);
    osc.stop(t + 0.6);
    clang.stop(t + 0.15);
  }

  playAchievementSound() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Joyous celebratory arpeggio: C5, E5, G5, C6, E6
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.5, t + idx * 0.07);

      const noteStart = t + idx * 0.07;
      const noteDuration = idx === freqs.length - 1 ? 0.7 : 0.25;

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.getDestination());

      osc.start(noteStart);
      osc2.start(noteStart);
      osc.stop(noteStart + noteDuration);
      osc2.stop(noteStart + noteDuration);
    });
  }

  /**
   * Rapid Perfect Combo Stacking Audio Feedback
   * Escalating crystalline arpeggio chords with punchy sub impact as multiplier climbs
   */
  playRapidPerfectCombo(streak: number, multiplier: number) {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Pentatonic scale frequency root mapping based on streak tier
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
    const rootIndex = Math.min(scale.length - 3, Math.max(0, streak));
    const chord = [
      scale[rootIndex],
      scale[rootIndex + 1],
      scale[rootIndex + 2]
    ];

    // 1. Ascending crystal chime chord
    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const shimmer = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      shimmer.type = 'triangle';

      osc.frequency.setValueAtTime(freq, t + i * 0.038);
      shimmer.frequency.setValueAtTime(freq * 2.01, t + i * 0.038);

      const noteStart = t + i * 0.038;
      const duration = 0.32 + Math.min(0.25, multiplier * 0.05);

      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(Math.min(0.28, 0.16 + streak * 0.02), noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + duration);

      osc.connect(gain);
      shimmer.connect(gain);
      gain.connect(this.getDestination());

      osc.start(noteStart);
      shimmer.start(noteStart);
      osc.stop(noteStart + duration);
      shimmer.stop(noteStart + duration);
    });

    // 2. Sub-bass kinetic pulse for tactile weight
    try {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(110 + Math.min(60, streak * 8), t);
      subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.18);

      subGain.gain.setValueAtTime(0.24, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      subOsc.connect(subGain);
      subGain.connect(this.getDestination());
      subOsc.start(t);
      subOsc.stop(t + 0.18);
    } catch (e) {}
  }

  /**
   * Sound played when the rapid succession combo decay window expires
   */
  playRapidComboExpired() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    const t = this.ctx.currentTime;

    const freqs = [587.33, 440.00, 329.63];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.055);

      const noteStart = t + idx * 0.055;
      gain.gain.setValueAtTime(0.12, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.22);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(noteStart);
      osc.stop(noteStart + 0.22);
    });
  }

  /**
   * Crisp UI interaction click sound
   */
  playClickSound() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.04);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  /**
   * Low discordant error / buzz sound
   */
  playErrorSound() {
    if (!this.ctx || !this.sfxEnabled) return;
    this.resume();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.15);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }
}

export const audio = new AudioEngine();
