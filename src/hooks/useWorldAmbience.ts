import { useEffect, useRef, useState, useCallback, useMemo, startTransition } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore, VisualThemeMode } from '../game/store';
import { useWorldTheme, WorldThemeResult } from './useWorldTheme';
import { audio } from '../audio/AudioEngine';
import { 
  getAmbientAssetForWorldAndTheme, 
  AmbientSoundAsset, 
  WORLD_AMBIENT_ASSETS,
  VISUAL_THEME_AMBIENT_ASSETS 
} from '../audio/AmbientSoundAssets';
import { resolveWorldEnvironment, AmbienceInstance } from '../audio/WorldAmbience';

export interface UseWorldAmbienceOptions {
  enabled?: boolean;
  volume?: number;
  crossFadeDuration?: number; // seconds for smooth equal-power cross-fade between world themes (default: 1.4s)
  overrideWorld?: string | number | null;
  overrideVisualTheme?: VisualThemeMode | null;
}

export interface UseWorldAmbienceResult {
  activeWorldIndex: number;
  activeWorldKey: string;
  visualTheme: VisualThemeMode;
  soundscapeName: string;
  soundscapeDescription: string;
  activeAsset: AmbientSoundAsset;
  isPlaying: boolean;
  isMuted: boolean;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  play: (targetWorld?: string | number, targetTheme?: VisualThemeMode) => void;
  stop: (fadeDuration?: number) => void;
  /**
   * Directly triggers the AudioEngine cross-fading utility with custom duration
   */
  crossFade: (targetWorld?: string | number, targetTheme?: VisualThemeMode, duration?: number) => void;
  /**
   * Atomic batch switch for world theme and audio ambience:
   * Updates store state, environment shaders, and audio loops in a single pass
   * to eliminate staggered re-renders during high-intensity gameplay.
   */
  switchAmbienceAndTheme: (
    targetWorld: string | number,
    options?: {
      visualTheme?: VisualThemeMode;
      equipMatchingSet?: boolean;
      transitionMessage?: string;
      skipTransition?: boolean;
    }
  ) => void;
  worldTheme: WorldThemeResult;
}

/**
 * useWorldAmbience:
 * React hook that connects with the AudioEngine to map each world type
 * to a specific looping ambient sound asset and executes smooth cross-fading
 * between background audio clips when the 'visualTheme' or world environment changes.
 */
export function useWorldAmbience(options: UseWorldAmbienceOptions = {}): UseWorldAmbienceResult {
  const {
    enabled = true,
    volume,
    crossFadeDuration = 1.4,
    overrideWorld = null,
    overrideVisualTheme = null,
  } = options;

  const worldTheme = useWorldTheme(overrideWorld);

  // Shallow store selector to monitor audio state and visualTheme changes
  const { musicEnabled, musicVolume, gameState, visualTheme: storeVisualTheme } = useGameStore(
    useShallow((s) => ({
      musicEnabled: s.musicEnabled,
      musicVolume: s.musicVolume,
      gameState: s.state,
      visualTheme: s.visualTheme,
    }))
  );

  const effectiveVisualTheme: VisualThemeMode = overrideVisualTheme !== null && overrideVisualTheme !== undefined
    ? overrideVisualTheme
    : storeVisualTheme;

  // Resolved active world environment info
  const targetEnvironment = overrideWorld !== null && overrideWorld !== undefined
    ? resolveWorldEnvironment(overrideWorld)
    : {
        worldIndex: worldTheme.worldIndex,
        worldKey: worldTheme.worldKey,
        worldName: worldTheme.worldName,
        visualTheme: effectiveVisualTheme,
      };

  // Resolved ambient sound asset from registry
  const currentAsset = useMemo(() => {
    return getAmbientAssetForWorldAndTheme(targetEnvironment.worldKey, effectiveVisualTheme);
  }, [targetEnvironment.worldKey, effectiveVisualTheme]);

  const targetVolume = volume !== undefined ? volume : musicVolume;

  // Local state consolidated for atomic low-priority React transitions
  const [ambienceState, setAmbienceState] = useState<{
    soundscapeName: string;
    soundscapeDescription: string;
    isPlaying: boolean;
    isMuted: boolean;
  }>({
    soundscapeName: currentAsset.name,
    soundscapeDescription: currentAsset.description,
    isPlaying: false,
    isMuted: false,
  });

  const activeSignatureRef = useRef<string>('');
  const volumeRef = useRef(targetVolume);
  volumeRef.current = targetVolume;
  const isMutedRef = useRef(ambienceState.isMuted);
  isMutedRef.current = ambienceState.isMuted;

  // Primary Cross-Fading Lifecycle Effect:
  // Runs whenever visualTheme, world environment, or gameplay play-state changes
  useEffect(() => {
    const shouldPlay = enabled && musicEnabled && (gameState === 'playing' || gameState === 'idle');

    if (!shouldPlay) {
      if (activeSignatureRef.current !== '') {
        activeSignatureRef.current = '';
        audio.stopWorldAmbience(0.6);
        startTransition(() => {
          setAmbienceState((prev) => ({
            ...prev,
            isPlaying: false,
            soundscapeName: 'Inactive',
            soundscapeDescription: 'Ambience stopped',
          }));
        });
      }
      return;
    }

    const nextSignature = `${targetEnvironment.worldKey}:${effectiveVisualTheme}:${currentAsset.id}`;
    if (activeSignatureRef.current === nextSignature && audio.isWorldAmbiencePlaying()) {
      return;
    }
    activeSignatureRef.current = nextSignature;

    // Ensure AudioContext is operational
    audio.resume();

    // Trigger AudioEngine cross-fading utility
    const asset = audio.crossFadeToWorldTheme(
      targetEnvironment.worldKey,
      effectiveVisualTheme,
      crossFadeDuration,
      isMutedRef.current ? 0 : volumeRef.current
    );

    startTransition(() => {
      setAmbienceState((prev) => ({
        ...prev,
        soundscapeName: asset?.name || currentAsset.name,
        soundscapeDescription: asset?.description || currentAsset.description,
        isPlaying: !!asset,
      }));
    });

    return () => {
      activeSignatureRef.current = '';
      audio.stopWorldAmbience(0.5);
      startTransition(() => {
        setAmbienceState((prev) => ({
          ...prev,
          isPlaying: false,
        }));
      });
    };
  }, [
    enabled,
    musicEnabled,
    gameState,
    targetEnvironment.worldKey,
    effectiveVisualTheme,
    currentAsset,
    crossFadeDuration,
  ]);

  // Synchronize master ambience volume adjustments smoothly
  useEffect(() => {
    if (audio.isWorldAmbiencePlaying()) {
      audio.setAmbienceVolume(ambienceState.isMuted ? 0 : targetVolume);
    }
  }, [targetVolume, ambienceState.isMuted]);

  const setAmbienceVolume = useCallback((vol: number) => {
    audio.setAmbienceVolume(vol);
  }, []);

  const toggleMute = useCallback(() => {
    setAmbienceState((prev) => {
      const nextMuted = !prev.isMuted;
      audio.setAmbienceVolume(nextMuted ? 0 : targetVolume);
      return {
        ...prev,
        isMuted: nextMuted,
      };
    });
  }, [targetVolume]);

  const play = useCallback((targetWorld?: string | number, targetTheme?: VisualThemeMode) => {
    audio.resume();
    const envKey = targetWorld !== undefined ? targetWorld : targetEnvironment.worldKey;
    const themeKey = targetTheme !== undefined ? targetTheme : effectiveVisualTheme;

    const asset = audio.crossFadeToWorldTheme(
      envKey,
      themeKey,
      crossFadeDuration,
      ambienceState.isMuted ? 0 : targetVolume
    );

    if (asset) {
      activeSignatureRef.current = `${envKey}:${themeKey}:${asset.id}`;
      startTransition(() => {
        setAmbienceState((prev) => ({
          ...prev,
          soundscapeName: asset.name,
          soundscapeDescription: asset.description,
          isPlaying: true,
        }));
      });
    }
  }, [targetEnvironment.worldKey, effectiveVisualTheme, crossFadeDuration, ambienceState.isMuted, targetVolume]);

  const stop = useCallback((fadeDuration: number = 0.8) => {
    activeSignatureRef.current = '';
    audio.stopWorldAmbience(fadeDuration);
    startTransition(() => {
      setAmbienceState((prev) => ({
        ...prev,
        isPlaying: false,
        soundscapeName: 'Inactive',
        soundscapeDescription: 'Ambience stopped',
      }));
    });
  }, []);

  const crossFade = useCallback((
    targetWorld?: string | number,
    targetTheme?: VisualThemeMode,
    duration?: number
  ) => {
    audio.resume();
    const envKey = targetWorld !== undefined ? targetWorld : targetEnvironment.worldKey;
    const themeKey = targetTheme !== undefined ? targetTheme : effectiveVisualTheme;
    const fadeDuration = duration !== undefined ? duration : crossFadeDuration;

    const asset = audio.crossFadeToWorldTheme(
      envKey,
      themeKey,
      fadeDuration,
      ambienceState.isMuted ? 0 : targetVolume
    );

    if (asset) {
      activeSignatureRef.current = `${envKey}:${themeKey}:${asset.id}`;
      startTransition(() => {
        setAmbienceState((prev) => ({
          ...prev,
          soundscapeName: asset.name,
          soundscapeDescription: asset.description,
          isPlaying: true,
        }));
      });
    }
  }, [targetEnvironment.worldKey, effectiveVisualTheme, crossFadeDuration, ambienceState.isMuted, targetVolume]);

  const switchAmbienceAndTheme = useCallback((
    targetWorld: string | number,
    options?: {
      visualTheme?: VisualThemeMode;
      equipMatchingSet?: boolean;
      transitionMessage?: string;
      skipTransition?: boolean;
    }
  ) => {
    // 1. Single atomic batch update on the game store
    useGameStore.getState().batchUpdateWorldTheme(targetWorld, options);

    // 2. Cross-fade the background audio clip in AudioEngine
    audio.resume();
    const themeKey = options?.visualTheme || effectiveVisualTheme;
    const asset = audio.crossFadeToWorldTheme(
      targetWorld,
      themeKey,
      crossFadeDuration,
      ambienceState.isMuted ? 0 : targetVolume
    );

    if (asset) {
      activeSignatureRef.current = `${targetWorld}:${themeKey}:${asset.id}`;
      startTransition(() => {
        setAmbienceState((prev) => ({
          ...prev,
          soundscapeName: asset.name,
          soundscapeDescription: asset.description,
          isPlaying: true,
        }));
      });
    }
  }, [effectiveVisualTheme, crossFadeDuration, ambienceState.isMuted, targetVolume]);

  return useMemo(() => ({
    activeWorldIndex: targetEnvironment.worldIndex,
    activeWorldKey: targetEnvironment.worldKey,
    visualTheme: effectiveVisualTheme,
    soundscapeName: ambienceState.soundscapeName,
    soundscapeDescription: ambienceState.soundscapeDescription,
    activeAsset: currentAsset,
    isPlaying: ambienceState.isPlaying,
    isMuted: ambienceState.isMuted,
    setVolume: setAmbienceVolume,
    toggleMute,
    play,
    stop,
    crossFade,
    switchAmbienceAndTheme,
    worldTheme,
  }), [
    targetEnvironment.worldIndex,
    targetEnvironment.worldKey,
    effectiveVisualTheme,
    ambienceState.soundscapeName,
    ambienceState.soundscapeDescription,
    ambienceState.isPlaying,
    ambienceState.isMuted,
    currentAsset,
    setAmbienceVolume,
    toggleMute,
    play,
    stop,
    crossFade,
    switchAmbienceAndTheme,
    worldTheme,
  ]);
}
