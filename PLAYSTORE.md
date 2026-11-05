# Releasing TOWER//SHIFT on Google Play

Publisher: **Vesyron** · Package name: **`com.vesyron.towershift`** (permanent once uploaded)

The Android app is the same game wrapped with Capacitor. Game files ship inside the app,
so it plays offline. Purchases use Google Play Billing; ads use Google AdMob.

---

## 1. One-time accounts (in your browser)

1. **Google Play Console** as an organisation: https://play.google.com/console
   (one-off USD 25 fee). Google asks organisations for a D-U-N-S number and a company website,
   and verifies them; allow a few days.
2. **AdMob**: https://apps.admob.com → Apps → Add app → Android → "TOWER//SHIFT".
   - Copy the **App ID** (`ca-app-pub-…~…`).
   - Create two ad units: **Rewarded** and **Interstitial**. Copy both IDs (`ca-app-pub-…/…`).
   - Privacy & messaging → create a **GDPR consent message** (the game shows it automatically).
3. **Host the privacy policy.** It is in the game at `/privacy.html`, so once the web version is
   deployed it is at `https://<your-domain>/privacy.html` (for example `https://play.vesyron.com/privacy.html`).

## 2. Configure the build (on your PC)

Keep the project and caches on D: (C: is short on space).

```powershell
cd D:\dev
git clone https://github.com/VishalPatnaik/Build-Boom build-boom
cd build-boom
git checkout claude/physics-and-payment-fixes
setx GRADLE_USER_HOME D:\gradle-cache     # new terminals keep Gradle's cache on D:
```

1. Copy `.env.android.example` to `.env.android` and fill in:
   - `VITE_API_BASE_URL`: your deployed game server (tournaments/leaderboards). Must be `https://`.
     Leave it empty to ship offline-only (sample tournaments are used).
   - `VITE_ADMOB_REWARDED_ID`, `VITE_ADMOB_INTERSTITIAL_ID`: your two ad unit IDs.
2. In `android/gradle.properties` set `ADMOB_APP_ID=` to your AdMob App ID.
   (The defaults are Google's **test** IDs: fine for testing, but they earn nothing.)

## 3. Create your upload key (once, keep it safe)

```powershell
mkdir D:\keys
& "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkeypair -v `
  -keystore D:\keys\vesyron-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

Then create `android/keystore.properties` (it is git-ignored, never commit it):

```properties
storeFile=D:/keys/vesyron-upload.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=upload
keyPassword=YOUR_KEY_PASSWORD
```

Back up the `.jks` file and passwords somewhere safe (password manager plus an offline copy).
With Play App Signing, Google holds the real signing key, so a lost upload key can be reset,
but it takes time.

## 4. Build

```powershell
npm ci
npm test
npm run build:android            # builds the game and copies it into android/
cd android
.\gradlew.bat assembleDebug      # test build: android\app\build\outputs\apk\debug\app-debug.apk
.\gradlew.bat bundleRelease      # store build: android\app\build\outputs\bundle\release\app-release.aab
```

Or open the `android` folder in Android Studio (`npm run android:open`) and use
Build → Generate Signed App Bundle. Capacitor 8 needs a recent Android Studio (JDK 21 is bundled).

**Test on your S24 Ultra first:** enable USB debugging, plug in, and press Run in Android Studio
(or `adb install app-debug.apk`). Check: the consent form appears (from an EU VPN or the AdMob
test device setting), a test rewarded video plays and grants the reward, back button behaviour,
and that the game runs smoothly.

**Every new upload:** raise `versionCode` (and `versionName`) in `android/app/build.gradle`.

## 5. In-app products (Play Console → Monetise → Products → In-app products)

Create each with **exactly** this Product ID. Prices are the current web prices in USD; set
your own and let Play convert them for other countries.

| Product ID | Name | Price (USD) | Type |
|---|---|---|---|
| `coins_100` | Starter Coins | 0.99 | consumable |
| `coins_500` | Value Pack | 3.99 | consumable |
| `coins_1200` | Mega Pack | 7.99 | consumable |
| `coins_2500` | Ultra Pack | 14.99 | consumable |
| `coins_5000` | Legend Pack | 24.99 | consumable |
| `powerup_stasis_10` | Stasis Pack | 1.99 | consumable |
| `powerup_emp_10` | EMP Pack | 1.99 | consumable |
| `powerup_shield_10` | Shield Pack | 1.99 | consumable |
| `powerup_tactical_pack` | Tactical Arsenal Pack | 2.99 | consumable |
| `bundle_starter_architect` | Starter Architect Pack | 4.99 | consumable |
| `bundle_tactical_architect` | Tactical Architect Pack | 9.99 | consumable |
| `bundle_legend_architect` | Legend Architect Pack | 19.99 | consumable |
| `remove_ads` | Ad Blocker VIP Pass | 4.99 | one-time (non-consumable) |

Products only become buyable after an app build containing billing has been uploaded to a
testing track. Add your Google account as a **licence tester** (Settings → Licence testing) so
your test purchases are free.

## 6. Store listing (Grow → Store presence → Main store listing)

Ready-made text is in `store/listing.md`. Graphics in `store/`:

- App icon 512×512: `store/icon-512.png`
- Feature graphic 1024×500: `store/feature-graphic-1024x500.png`
- Phone screenshots 1080×1920: `store/screenshots/` (2–8 needed; take more on your phone if you like)

## 7. App content declarations (Policy → App content)

- **Privacy policy:** the hosted `/privacy.html` URL.
- **Ads:** Yes, the app contains ads.
- **App access:** all functionality is available without an account.
- **Target audience:** 13 and over. (Choosing under-13 puts the app in the Families programme,
  which needs certified child-safe ad settings.)
- **Content rating (IARC questionnaire):** category Game. Cartoon objects and cartoon explosions
  only, no blood, no realistic violence; no gambling; no user-to-user chat (players only see
  leaderboard nicknames); has in-app purchases; no random paid items (mystery chests are free
  daily rewards).
- **Data safety:** see `store/data-safety.md`.
- **Government apps / financial features / health:** No.

## 8. Release

1. Testing → **Internal testing** → create release → upload `app-release.aab` → add yourself as tester
   → install from the opt-in link on your phone and buy a product with the licence tester account.
2. When happy, promote to **Production** (or Closed testing first). Organisation accounts don't need
   the 14-day/12-tester closed test that new personal accounts must do.
3. Google's review usually takes from a few hours to a few days.

## Known limits of version 1.0.0

- Google Play purchases are confirmed on the device, not by our server. That is enough for launch;
  for stronger protection against modified devices, add server-side purchase verification later.
- Leaderboards need the deployed server (`VITE_API_BASE_URL`); without it the app plays fully
  offline with built-in sample tournaments.
- Progress is saved on the device (no cloud save). Uninstalling loses progress, except purchases:
  "Restore Purchases" brings back Ad Blocker VIP Pass.
