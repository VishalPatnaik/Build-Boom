import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Permanent Google Play package name (cannot change after the first upload)
  appId: 'com.vesyron.towershift',
  appName: 'TOWER//SHIFT',
  webDir: 'dist',
  android: {
    // Game assets are bundled in the app; only the API (tournaments, leaderboards) goes online
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#030712',
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#030712',
      style: 'DARK',
    },
  },
};

export default config;
