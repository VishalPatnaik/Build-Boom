import { useState, useEffect, useCallback } from 'react';

/**
 * useFullscreen Hook
 * Provides seamless cross-browser fullscreen control for mobile and desktop devices.
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported = typeof document !== 'undefined' && (
      'fullscreenEnabled' in document ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).webkitFullscreenEnabled ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).mozFullScreenEnabled ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).msFullscreenEnabled
    );
    setIsSupported(!!supported);

    const updateFullscreenState = () => {
      const active = !!(
        document.fullscreenElement ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).webkitFullscreenElement ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).mozFullScreenElement ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).msFullscreenElement
      );
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', updateFullscreenState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenState);
    document.addEventListener('mozfullscreenchange', updateFullscreenState);
    document.addEventListener('MSFullscreenChange', updateFullscreenState);

    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreenState);
      document.removeEventListener('webkitfullscreenchange', updateFullscreenState);
      document.removeEventListener('mozfullscreenchange', updateFullscreenState);
      document.removeEventListener('MSFullscreenChange', updateFullscreenState);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return false;
    const elem = document.documentElement as HTMLElement & {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webkitRequestFullscreen?: () => Promise<void>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mozRequestFullScreen?: () => Promise<void>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      msRequestFullscreen?: () => Promise<void>;
    };

    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen({ navigationUI: 'hide' });
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return false;
    const doc = document as Document & {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      webkitExitFullscreen?: () => Promise<void>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mozCancelFullScreen?: () => Promise<void>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      msExitFullscreen?: () => Promise<void>;
    };

    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
      setIsFullscreen(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      return exitFullscreen();
    } else {
      return enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}
