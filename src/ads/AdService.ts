// TOWER//SHIFT — Universal Ad Engine & Native Mobile Ads (AdMob) Bridge
// Real ads run through Google AdMob in the Android app; the browser fallback is a test stand-in for desktop development only.

import { useGameStore } from '../game/store';
import { initAds, showRewardedAd } from './admob';
import { isNativeApp } from '../native/platform';
import { audio } from '../audio/AudioEngine';
import { haptics } from '../utils/haptics';

export type AdType = 'interstitial' | 'rewarded-revive' | 'rewarded-double-coins' | 'rewarded-shop-item' | 'rewarded-powerup' | 'rewarded-perk';

export interface AdCreative {
  id: string;
  title: string;
  tagline: string;
  category: string;
  icon: string;
  gradient: string;
  borderColor: string;
}

export const SPONSOR_CREATIVES: AdCreative[] = [
  {
    id: 'arcade-blast',
    title: 'Arcade Blast Pro',
    tagline: 'High-speed retro shooter with dynamic neon pulse visuals. Install now!',
    category: 'RETRO ARCADE',
    icon: '🚀',
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-400',
  },
  {
    id: 'cyber-shift-2077',
    title: 'Cyber Shift 2077',
    tagline: 'Futuristic megastructure stacking simulator. Master gravity and kinetic balance.',
    category: 'SCI-FI SIMULATOR',
    icon: '⚡',
    gradient: 'from-fuchsia-500 to-purple-700',
    borderColor: 'border-fuchsia-400',
  },
  {
    id: 'orbital-stacker',
    title: 'Orbital Stacker DX',
    tagline: 'Zero-gravity precision physics engine. Build planetary communication arrays.',
    category: 'PHYSICS PUZZLE',
    icon: '🪐',
    gradient: 'from-amber-400 to-orange-600',
    borderColor: 'border-amber-400',
  },
];

export interface AdSystemStatus {
  isAvailable: boolean;
  provider: 'admob_native' | 'sponsor_engine' | 'vip_ad_free';
  providerLabel: string;
  hasAdFreeVIP: boolean;
  canShowAds: boolean;
}

// Google AdMob Official Test Ad Unit IDs (Android & iOS)
export const ADMOB_TEST_CONFIG = {
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713',
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458602516',
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  },
};

export class AdService {
  private static isInitialized = false;

  /**
   * Initializes native ad SDKs if present (e.g. Capacitor AdMob, Cordova AdMob, Android WebBridge)
   */
  public static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const win = typeof window !== 'undefined' ? (window as any) : {};
      
      // 1. Real AdMob in the Android app (with consent form where required)
      if (isNativeApp()) {
        await initAds();
      }
      // 2. Cordova AdMob plugin
      else if (win.admob || win.AdMob) {
        console.log('[TOWER//SHIFT Ads] Initializing Cordova AdMob plugin...');
        const admob = win.admob || win.AdMob;
        if (typeof admob.setOptions === 'function') {
          admob.setOptions({ isTesting: true });
        }
      }
      // 3. Native Android JavascriptInterface
      else if (win.AndroidAds) {
        console.log('[TOWER//SHIFT Ads] Native AndroidAds JavascriptInterface detected.');
      }
    } catch (e) {
      console.warn('[TOWER//SHIFT Ads] Native Ad initialization fallback to internal engine:', e);
    }
  }

  /**
   * Returns current ad system status and active provider
   */
  public static getStatus(): AdSystemStatus {
    const store = useGameStore.getState();
    const win = typeof window !== 'undefined' ? (window as any) : {};

    const hasAdFree = !!store.adsRemoved;
    const isNativeAdMob = !!(
      isNativeApp() ||
      win.Capacitor?.isPluginAvailable?.('AdMob') ||
      win.admob ||
      win.AdMob ||
      win.AndroidAds
    );

    if (hasAdFree) {
      return {
        isAvailable: true,
        provider: 'vip_ad_free',
        providerLabel: 'VIP Ad-Free (Instant Claim Enabled)',
        hasAdFreeVIP: true,
        canShowAds: false,
      };
    }

    if (isNativeAdMob) {
      return {
        isAvailable: true,
        provider: 'admob_native',
        providerLabel: 'Google Mobile Ads (AdMob Native Bridge)',
        hasAdFreeVIP: false,
        canShowAds: true,
      };
    }

    return {
      isAvailable: true,
      provider: 'sponsor_engine',
      providerLabel: 'Test ads (desktop development preview)',
      hasAdFreeVIP: false,
      canShowAds: true,
    };
  }

  /**
   * Request a Rewarded Ad. Handles VIP instant unlock or delegates to native/UI player.
   */
  public static async requestRewardedAd(
    type: AdType,
    payload?: { shopItemId?: string; powerupType?: any; perkId?: string }
  ): Promise<void> {
    await this.initialize();
    const status = this.getStatus();

    // 1. VIP Bypass
    if (status.hasAdFreeVIP) {
      audio.playComboSurge(2);
      haptics.success();
      this.grantRewardImmediately(type, payload);
      return;
    }

    // 2. Real AdMob rewarded video in the Android app
    if (isNativeApp()) {
      const outcome = await showRewardedAd();
      if (outcome === 'rewarded') this.grantRewardImmediately(type, payload);
      return;
    }

    // 3. Fallback to interactive in-game AdOverlay
    this.openOverlayAd(type, payload);
  }

  /**
   * Triggers the appropriate in-store adState
   */
  private static openOverlayAd(
    type: AdType,
    payload?: { shopItemId?: string; powerupType?: any; perkId?: string }
  ) {
    const store = useGameStore.getState();
    switch (type) {
      case 'rewarded-revive':
        store.showReviveAd();
        break;
      case 'rewarded-double-coins':
        store.showDoubleCoinsAd();
        break;
      case 'rewarded-shop-item':
        if (payload?.shopItemId) store.showShopAd(payload.shopItemId);
        break;
      case 'rewarded-powerup':
        if (payload?.powerupType) store.showPowerupAd(payload.powerupType);
        break;
      case 'rewarded-perk':
        if (payload?.perkId) store.showPerkAd(payload.perkId);
        break;
      case 'interstitial':
        store.checkAndTriggerAd(false);
        break;
    }
  }

  /**
   * Instantly grants reward for VIP users or completed native ads
   */
  public static grantRewardImmediately(
    type: AdType,
    payload?: { shopItemId?: string; powerupType?: any; perkId?: string }
  ) {
    const store = useGameStore.getState();
    switch (type) {
      case 'rewarded-revive':
        store.acceptRevive();
        break;
      case 'rewarded-double-coins':
        store.acceptDoubleCoins();
        break;
      case 'rewarded-shop-item':
        if (payload?.shopItemId) {
          store.unlockCosmetic(payload.shopItemId);
        } else {
          store.acceptShopAd();
        }
        break;
      case 'rewarded-powerup':
        if (payload?.powerupType) {
          store.rewardPowerupWithAd(payload.powerupType);
        } else {
          store.acceptPowerupAd();
        }
        break;
      case 'rewarded-perk':
        if (payload?.perkId) {
          store.unlockPerkWithAd(payload.perkId);
        } else {
          store.acceptPerkAd();
        }
        break;
    }
  }
}
