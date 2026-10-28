import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useWakeLock Hook
 * Keeps mobile and desktop screens awake during active gameplay sessions.
 * Automatically releases the lock when paused, inactive, or when tab is hidden,
 * and re-acquires it upon returning to the active game.
 */
export function useWakeLock(enabled: boolean = true) {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sentinelRef = useRef<any>(null);

  useEffect(() => {
    const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
    setIsSupported(supported);
  }, []);

  const requestLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    if (document.visibilityState !== 'visible') return;

    try {
      if (sentinelRef.current && !sentinelRef.current.released) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lock = await (navigator as any).wakeLock.request('screen');
      sentinelRef.current = lock;
      setIsActive(true);

      lock.addEventListener('release', () => {
        setIsActive(false);
        sentinelRef.current = null;
      });
    } catch {
      // Graceful fallback if low battery or browser permission denied
      setIsActive(false);
      sentinelRef.current = null;
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch {
        // Safe fallback
      }
      sentinelRef.current = null;
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    if (enabled && isSupported) {
      requestLock();
    } else {
      releaseLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && isSupported) {
        requestLock();
      } else {
        releaseLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [enabled, isSupported, requestLock, releaseLock]);

  return {
    isSupported,
    isActive,
    requestLock,
    releaseLock,
  };
}
