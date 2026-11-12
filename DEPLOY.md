# TOWER//SHIFT online API

TOWER//SHIFT is a **mobile app only**. The game ships inside the Android app (see
`PLAYSTORE.md`); it is not published as a website.

`server.ts` is a small API the app calls for tournaments and leaderboards. The app works
offline without it; those online features just stay hidden until `VITE_API_BASE_URL` points at a
deployed copy of this server when you build the APK.

## Run locally (for testing on your PC)

```bash
npm ci
npm test
npm run dev        # http://localhost:3000 serves the game + API for desktop testing only
```

## Deploy the API (production)

In production the server answers `/api/*` only and does not serve the game.

```bash
docker build -t tower-shift-api .
docker run -p 8080:8080 tower-shift-api
```

Then build the app with `VITE_API_BASE_URL=https://<your-api-host>` (see `PLAYSTORE.md`).

## Payments

All purchases (coins, packs, Remove Ads) go through **Google Play Billing** in the app.
There is no web or card checkout.

## Things that live on the server's disk

`tournaments_store.json` holds tournaments and leaderboards as a plain file. On hosts with a
temporary disk (Cloud Run, most containers) it resets when the server restarts or scales out,
so leaderboards are not permanent there until a database is added.
