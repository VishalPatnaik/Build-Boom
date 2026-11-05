import { Capacitor } from '@capacitor/core';

/** True inside the Android (or iOS) app, false in a browser. */
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/**
 * Base URL for the game's online API (tournaments, leaderboards).
 * In a browser the API is on the same site; the app must call the deployed server,
 * set at build time with VITE_API_BASE_URL (for example https://play.vesyron.com).
 */
const API_BASE = ((import.meta.env?.VITE_API_BASE_URL as string | undefined) || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/** Whether the app has an online API to talk to (always true on the web). */
export const hasOnlineApi = (): boolean => !isNativeApp() || API_BASE.length > 0;
