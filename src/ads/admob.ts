// Real Google AdMob ads for the Android app.
//
// Ad unit IDs come from the build (VITE_ADMOB_REWARDED_ID, VITE_ADMOB_INTERSTITIAL_ID).
// Until they are set, Google's official test units are used so nothing earns or breaks
// policy by accident. The AdMob App ID lives in android/gradle.properties (ADMOB_APP_ID).
import {
  AdMob,
  AdmobConsentStatus,
  InterstitialAdPluginEvents,
  MaxAdContentRating,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';
import { isNativeApp } from '../native/platform';

const TEST_REWARDED = 'ca-app-pub-3940256099942544/5224354917';
const TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';

const REWARDED_ID = (import.meta.env?.VITE_ADMOB_REWARDED_ID as string | undefined) || '';
const INTERSTITIAL_ID = (import.meta.env?.VITE_ADMOB_INTERSTITIAL_ID as string | undefined) || '';

/** True when the build still uses Google's test ads (no real ad units configured). */
export const usingTestAds = !REWARDED_ID || !INTERSTITIAL_ID;

let ready: Promise<boolean> | null = null;

/** Starts AdMob once, after asking for ad consent where the law requires it (EU/UK). */
export function initAds(): Promise<boolean> {
  if (!isNativeApp()) return Promise.resolve(false);
  if (ready) return ready;
  ready = (async () => {
    try {
      await AdMob.initialize({
        initializeForTesting: usingTestAds,
        // Family-friendly ads only: the game is rated for teens and up, played by a broad audience
        maxAdContentRating: MaxAdContentRating.ParentalGuidance,
      });
      try {
        const info = await AdMob.requestConsentInfo();
        if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
          await AdMob.showConsentForm();
        }
      } catch (err) {
        // Consent form unavailable (offline): ads still load as non-personalised
        console.warn('[Ads] consent check failed', err);
      }
      return true;
    } catch (err) {
      console.warn('[Ads] AdMob failed to start', err);
      return false;
    }
  })();
  return ready;
}

export type RewardedOutcome = 'rewarded' | 'dismissed' | 'unavailable';

/** Shows a rewarded video. Resolves 'rewarded' only if the player watched it to the end. */
export async function showRewardedAd(): Promise<RewardedOutcome> {
  if (!(await initAds())) return 'unavailable';
  try {
    await AdMob.prepareRewardVideoAd({ adId: REWARDED_ID || TEST_REWARDED, isTesting: usingTestAds });
  } catch {
    return 'unavailable';
  }
  return new Promise<RewardedOutcome>((resolve) => {
    let rewarded = false;
    let done = false;
    const handles: { remove: () => Promise<void> }[] = [];
    const finish = (outcome: RewardedOutcome) => {
      if (done) return;
      done = true;
      handles.forEach((h) => h.remove().catch(() => undefined));
      resolve(outcome);
    };
    Promise.all([
      AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        rewarded = true;
      }),
      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => finish(rewarded ? 'rewarded' : 'dismissed')),
      AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish('unavailable')),
    ])
      .then((h) => {
        handles.push(...h);
        return AdMob.showRewardVideoAd();
      })
      .catch(() => finish(rewarded ? 'rewarded' : 'unavailable'));
  });
}

/** Shows a full-screen ad between games. Resolves when it closes (or could not load). */
export async function showInterstitialAd(): Promise<void> {
  if (!(await initAds())) return;
  try {
    await AdMob.prepareInterstitial({ adId: INTERSTITIAL_ID || TEST_INTERSTITIAL, isTesting: usingTestAds });
  } catch {
    return;
  }
  await new Promise<void>((resolve) => {
    const handles: { remove: () => Promise<void> }[] = [];
    const finish = () => {
      handles.forEach((h) => h.remove().catch(() => undefined));
      resolve();
    };
    Promise.all([
      AdMob.addListener(InterstitialAdPluginEvents.Dismissed, finish),
      AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, finish),
    ])
      .then((h) => {
        handles.push(...h);
        return AdMob.showInterstitial();
      })
      .catch(finish);
  });
}

/** Opens Google's ad privacy form so players can change their consent (shown in Settings). */
export async function showAdPrivacyOptions(): Promise<void> {
  if (!(await initAds())) return;
  try {
    await AdMob.showPrivacyOptionsForm();
  } catch (err) {
    console.warn('[Ads] privacy options unavailable', err);
  }
}
