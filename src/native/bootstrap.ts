// Android app start-up: system bars, splash screen, back button and ads.
// Does nothing in a browser.
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useGameStore } from '../game/store';
import { audio } from '../audio/AudioEngine';
import { initAds } from '../ads/admob';
import { isNativeApp } from './platform';

export function startNativeApp() {
  if (!isNativeApp()) return;

  StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
  StatusBar.setBackgroundColor({ color: '#030712' }).catch(() => undefined);
  // Hide the splash once the first frame has had a moment to draw
  setTimeout(() => SplashScreen.hide().catch(() => undefined), 400);

  // Android back button: close the settings panel, leave a screen, or minimise from the menu
  CapApp.addListener('backButton', () => {
    const s = useGameStore.getState();
    if (s.settingsModalOpen) {
      s.setSettingsModalOpen(false);
    } else if (s.adState !== 'none') {
      // Let the ad or reward panel handle itself
    } else if (s.mode !== 'menu') {
      s.setMode('menu');
    } else {
      CapApp.minimizeApp().catch(() => undefined);
    }
  }).catch(() => undefined);

  // Pause sound when the app goes to the background
  CapApp.addListener('appStateChange', ({ isActive }) => {
    const ctx = audio.getAudioContext();
    if (ctx) (isActive ? ctx.resume() : ctx.suspend()).catch(() => undefined);
  }).catch(() => undefined);

  // Ask for ad consent (EU/UK) at start-up rather than in the middle of a game
  initAds();
}
