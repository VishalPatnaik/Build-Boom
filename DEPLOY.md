# Deploying TOWER//SHIFT

The game is one Node server (`server.ts`) that serves the built game from `dist/`
and a small API (tournaments, leaderboards, Stripe checkout).

## Requirements

- Node 22.18 or newer (the server runs as TypeScript directly with `node server.ts`)
- Environment variables (see `.env.example`):
  - `STRIPE_SECRET_KEY`: required for real purchases. Without it, checkout answers
    "Payments are not configured" and nothing is granted.
  - `PORT`: set by most hosts; defaults to 3000.
  - `NODE_ENV=production`

## Build and run

```bash
npm ci
npm test            # physics, billing and progression checks
npm run build       # builds dist/
NODE_ENV=production npm start
```

## Container (Cloud Run, Fly.io, Render...)

```bash
docker build -t tower-shift .
docker run -p 8080:8080 -e STRIPE_SECRET_KEY=sk_live_... tower-shift
```

## Stripe

1. Create the account and copy the secret key into `STRIPE_SECRET_KEY`.
2. Make one real test purchase on the deployed site. Rewards are granted only after the
   server confirms with Stripe that the session was paid, and each payment is redeemed once.

## Things that live on the server's disk

`tournaments_store.json` (tournaments and leaderboards) and `checkout_fulfilled.json` are
plain files. On hosts with a temporary disk (Cloud Run, most containers) they reset when the
server restarts or scales out, so leaderboards are not permanent there. Payments stay safe
because the "already redeemed" flag is also stored on the Stripe payment itself.
