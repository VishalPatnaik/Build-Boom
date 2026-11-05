# TOWER//SHIFT · Data safety form answers

Play Console → Policy → App content → Data safety. These answers match the code in this
repository (version 1.0.0) and the Google AdMob SDK. Check Google's current guide for AdMob
before submitting: https://developers.google.com/admob/android/privacy/play-data-disclosure

**Does your app collect or share any of the required user data types?** Yes
**Is all of the user data collected by your app encrypted in transit?** Yes (HTTPS server and Google SDKs)
**Do you provide a way for users to request that their data is deleted?** Yes, by email (see privacy policy)

| Data type | Collected | Shared | Why | Optional? | Source |
|---|---|---|---|---|---|
| Personal info › Name (player nickname) | Yes | No | App functionality (leaderboards) | Yes, players choose it | Game server |
| Device or other IDs (random in-game player ID) | Yes | No | App functionality | No | Game server |
| Device or other IDs (advertising ID) | Yes | Yes (Google) | Advertising, analytics, fraud prevention | No | AdMob SDK |
| Location › Approximate location (from IP) | Yes | Yes (Google) | Advertising, fraud prevention | No | AdMob SDK |
| App activity › Other actions (scores, blocks built, combos) | Yes | No | App functionality | No | Game server |
| App activity › App interactions (ad interactions) | Yes | Yes (Google) | Advertising, analytics | No | AdMob SDK |
| App info and performance › Diagnostics | Yes | Yes (Google) | Analytics, fraud prevention | No | AdMob SDK |

**Not collected:** email, phone number, contacts, photos, files, precise location, health,
messages, financial details. Purchases are processed by Google Play; the game only receives
which product was bought.

**Data processed ephemerally?** The game server sees your IP address only to answer requests;
it is not stored by the game.
