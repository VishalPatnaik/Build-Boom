/**
 * Progression Storage Utility
 *
 * Automatically saves and persists the player's current coin balance and campaign progression
 * to local storage whenever a level is completed or a purchase is finalized.
 */

import { useGameStore } from '../game/store';

export const PROGRESSION_STORAGE_KEY = 'buildOrBoomProgressV5';
export const PROGRESSION_SNAPSHOT_KEY = 'buildOrBoom_progressionSnapshot';

export type AutoSaveTrigger = 
  | 'level_complete' 
  | 'purchase_finalized' 
  | 'store_transaction' 
  | 'campaign_advance' 
  | 'manual';

export interface ProgressionPayload {
  coins: number;
  unlockedLevels: number;
  levelCompleted?: number;
  trigger: AutoSaveTrigger;
  timestamp: number;
  dateIso: string;
}

export interface SaveProgressionResult {
  success: boolean;
  coins: number;
  unlockedLevels: number;
  trigger: AutoSaveTrigger;
  timestamp: number;
  error?: string;
}

/**
 * Automatically saves the player's current coin balance and campaign progression to local storage.
 * 
 * @param trigger The event that caused this auto-save ('level_complete' | 'purchase_finalized' | etc.)
 * @param overrides Optional override values for coins or unlockedLevels if they differ from current in-memory store
 * @returns SaveProgressionResult with status, persisted coins, and unlocked level count
 */
export function autoSaveProgression(
  trigger: AutoSaveTrigger = 'manual',
  overrides?: {
    coins?: number;
    unlockedLevels?: number;
    levelCompleted?: number;
  }
): SaveProgressionResult {
  const timestamp = Date.now();
  const dateIso = new Date(timestamp).toISOString();

  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        success: false,
        coins: 0,
        unlockedLevels: 1,
        trigger,
        timestamp,
        error: 'localStorage is not available in this environment',
      };
    }

    // Get current live state from the Zustand store
    const storeState = useGameStore.getState();

    // Determine target coins and unlocked level, honoring overrides and sanitizing numbers
    const currentCoins = Number.isFinite(overrides?.coins) 
      ? Math.max(0, Math.round(overrides!.coins!)) 
      : Number.isFinite(storeState.coins) 
      ? Math.max(0, Math.round(storeState.coins)) 
      : 0;

    const currentUnlockedLevels = Number.isFinite(overrides?.unlockedLevels)
      ? Math.max(1, Math.min(200, Math.round(overrides!.unlockedLevels!)))
      : Number.isFinite(storeState.unlockedLevels)
      ? Math.max(1, Math.min(200, Math.round(storeState.unlockedLevels)))
      : 1;

    // 1. Read existing full storage to preserve other metadata (cosmetics, high scores, etc.)
    let existingData: Record<string, any> = {};
    try {
      const raw = localStorage.getItem(PROGRESSION_STORAGE_KEY);
      if (raw) {
        existingData = JSON.parse(raw);
      }
    } catch (readErr) {
      console.warn('[progressionStorage] Corrupt storage data found, generating clean payload', readErr);
    }

    // 2. Merge updated coin balance and campaign progression
    const updatedData = {
      ...existingData,
      coins: currentCoins,
      unlockedLevels: currentUnlockedLevels,
      lastSavedTimestamp: timestamp,
      lastSaveTrigger: trigger,
    };

    localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(updatedData));

    // 3. Write a high-integrity progression snapshot for instant recovery and verification
    const snapshot: ProgressionPayload = {
      coins: currentCoins,
      unlockedLevels: currentUnlockedLevels,
      levelCompleted: overrides?.levelCompleted,
      trigger,
      timestamp,
      dateIso,
    };

    localStorage.setItem(PROGRESSION_SNAPSHOT_KEY, JSON.stringify(snapshot));

    // 4. Dispatch a browser custom event for any live UI listeners
    try {
      const event = new CustomEvent('progression:saved', { detail: snapshot });
      window.dispatchEvent(event);
    } catch (eventErr) {
      // Safe fallback if CustomEvent is restricted
    }

    return {
      success: true,
      coins: currentCoins,
      unlockedLevels: currentUnlockedLevels,
      trigger,
      timestamp,
    };
  } catch (error: any) {
    console.error(`[progressionStorage] Failed to auto-save progression on trigger [${trigger}]:`, error);
    return {
      success: false,
      coins: 0,
      unlockedLevels: 1,
      trigger,
      timestamp,
      error: error?.message || 'Unknown storage error',
    };
  }
}

/**
 * Reads the latest verified progression snapshot from local storage.
 */
export function getProgressionSnapshot(): ProgressionPayload | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = localStorage.getItem(PROGRESSION_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as ProgressionPayload;
    }
  } catch (e) {
    console.warn('[progressionStorage] Error reading progression snapshot:', e);
  }
  return null;
}
