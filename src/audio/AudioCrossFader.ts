/**
 * AudioCrossFader.ts
 * High-precision Web Audio cross-fading utility for background audio clips and ambient soundscapes.
 * Smoothly transitions between audio tracks when world type or visualTheme changes,
 * preventing clicks, pops, and resource leaks.
 */

import { AmbientSoundAsset } from './AmbientSoundAssets';

export interface ActiveAmbienceVoice {
  asset: AmbientSoundAsset;
  masterGain: GainNode;
  activeNodes: (AudioNode | { stop: () => void })[];
  cleanupCallbacks: (() => void)[] ;
  createdAt: number;
  isFadingOut: boolean;
}

export interface CrossFadeOptions {
  duration?: number;      // Cross-fade window in seconds (default: 1.4s)
  targetVolume?: number;  // Target playback volume (0.0 to 1.0)
  isMuted?: boolean;      // Mute override
}

export class AudioCrossFader {
  private activeVoice: ActiveAmbienceVoice | null = null;
  private fadingOutVoices: Set<ActiveAmbienceVoice> = new Set();
  private volume: number = 0.55;
  private isMuted: boolean = false;

  /**
   * Smoothly cross-fades from the current audio track to a target ambient sound asset.
   */
  public crossFadeTo(
    asset: AmbientSoundAsset,
    ctx: AudioContext,
    destinationNode: AudioNode,
    options: CrossFadeOptions = {}
  ): ActiveAmbienceVoice | null {
    if (!ctx) return null;

    const duration = Math.max(0.2, options.duration !== undefined ? options.duration : 1.4);
    if (options.targetVolume !== undefined) {
      this.volume = Math.max(0, Math.min(1, options.targetVolume));
    }
    if (options.isMuted !== undefined) {
      this.isMuted = options.isMuted;
    }

    const effectiveTargetVolume = this.isMuted ? 0.0001 : Math.max(0.0001, this.volume);

    // If the exact same asset is already playing and not fading out, smoothly adapt volume
    if (this.activeVoice && this.activeVoice.asset.id === asset.id && !this.activeVoice.isFadingOut) {
      this.setGainSmoothly(this.activeVoice.masterGain, effectiveTargetVolume, ctx, 0.2);
      return this.activeVoice;
    }

    const now = ctx.currentTime;

    // 1. Smoothly fade out the currently active voice
    if (this.activeVoice) {
      const outgoing = this.activeVoice;
      outgoing.isFadingOut = true;
      this.fadingOutVoices.add(outgoing);

      // Cancel scheduled ramps & smoothly ramp to silence
      try {
        outgoing.masterGain.gain.cancelScheduledValues(now);
        const currentGain = outgoing.masterGain.gain.value;
        outgoing.masterGain.gain.setValueAtTime(Math.max(0.0001, currentGain), now);
        outgoing.masterGain.gain.linearRampToValueAtTime(0.0001, now + duration);
      } catch (e) {}

      // Schedule cleanup and resource release once fade-out completes
      setTimeout(() => {
        this.disposeVoice(outgoing);
      }, Math.round((duration * 1000) + 120));

      this.activeVoice = null;
    }

    // 2. Prepare and fade in the incoming voice
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(effectiveTargetVolume, now + duration);
    masterGain.connect(destinationNode);

    const activeNodes: (AudioNode | { stop: () => void })[] = [];
    const cleanupCallbacks: (() => void)[] = [];

    try {
      asset.buildTrack(ctx, masterGain, activeNodes, cleanupCallbacks);
    } catch (err) {
      console.warn('[AudioCrossFader] Failed to build ambient track:', err);
      try { masterGain.disconnect(); } catch (e) {}
      return null;
    }

    const incomingVoice: ActiveAmbienceVoice = {
      asset,
      masterGain,
      activeNodes,
      cleanupCallbacks,
      createdAt: performance.now(),
      isFadingOut: false,
    };

    this.activeVoice = incomingVoice;
    return incomingVoice;
  }

  /**
   * Smoothly stops and fades out all ambient voices over the specified duration.
   */
  public stopAll(ctx: AudioContext | null, fadeDuration: number = 0.8) {
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = Math.max(0.1, fadeDuration);

    if (this.activeVoice) {
      const voice = this.activeVoice;
      voice.isFadingOut = true;
      this.fadingOutVoices.add(voice);

      try {
        voice.masterGain.gain.cancelScheduledValues(now);
        voice.masterGain.gain.setValueAtTime(voice.masterGain.gain.value, now);
        voice.masterGain.gain.linearRampToValueAtTime(0.0001, now + duration);
      } catch (e) {}

      setTimeout(() => {
        this.disposeVoice(voice);
      }, Math.round((duration * 1000) + 100));

      this.activeVoice = null;
    }

    // Also expedite cleanup of any previously fading voices
    this.fadingOutVoices.forEach((voice) => {
      try {
        voice.masterGain.gain.cancelScheduledValues(now);
        voice.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
      } catch (e) {}
      setTimeout(() => {
        this.disposeVoice(voice);
      }, 250);
    });
  }

  /**
   * Dynamically adjusts master volume with an anti-pop linear ramp
   */
  public setVolume(vol: number, ctx?: AudioContext | null) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.activeVoice && ctx) {
      const target = this.isMuted ? 0.0001 : Math.max(0.0001, this.volume);
      this.setGainSmoothly(this.activeVoice.masterGain, target, ctx, 0.15);
    }
  }

  /**
   * Mute or unmute the cross-fader
   */
  public setMuted(muted: boolean, ctx?: AudioContext | null) {
    this.isMuted = muted;
    if (this.activeVoice && ctx) {
      const target = muted ? 0.0001 : Math.max(0.0001, this.volume);
      this.setGainSmoothly(this.activeVoice.masterGain, target, ctx, 0.2);
    }
  }

  public getActiveAsset(): AmbientSoundAsset | null {
    return this.activeVoice?.asset || null;
  }

  public isPlaying(): boolean {
    return this.activeVoice !== null && !this.activeVoice.isFadingOut;
  }

  private setGainSmoothly(gainNode: GainNode, targetValue: number, ctx: AudioContext, rampTime: number) {
    try {
      const now = ctx.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(targetValue, now + rampTime);
    } catch (e) {}
  }

  private disposeVoice(voice: ActiveAmbienceVoice) {
    this.fadingOutVoices.delete(voice);

    voice.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
      } catch (e) {}
      try {
        if ('disconnect' in node && typeof (node as any).disconnect === 'function') {
          (node as any).disconnect();
        }
      } catch (e) {}
    });

    voice.cleanupCallbacks.forEach((cb) => {
      try { cb(); } catch (e) {}
    });

    try {
      voice.masterGain.disconnect();
    } catch (e) {}
  }
}

export const audioCrossFader = new AudioCrossFader();
