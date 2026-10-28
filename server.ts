import http from "http";
import express from "express";
import path from "path";
import Stripe from "stripe";
import "dotenv/config";
import fs from "fs";
import { serverTournamentManager } from "./serverTournaments.ts";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Products sold through Stripe Checkout. Prices live only on the server.
const CHECKOUT_PRODUCTS: Record<string, { name: string; description?: string; unitAmount: number }> = {
  coins_100: { name: "100 Architectural Credits", unitAmount: 99 },
  coins_500: { name: "500 Architectural Credits (Value Pack)", unitAmount: 399 },
  coins_1200: { name: "1,200 Architectural Credits (Mega Pack)", unitAmount: 799 },
  coins_2500: { name: "2,500 Architectural Credits (Ultra Pack)", unitAmount: 1499 },
  coins_5000: { name: "5,000 Architectural Credits (Legend Pack)", unitAmount: 2499 },
  remove_ads: { name: "Ad Blocker VIP Pass (Permanent)", description: "Permanent ad removal & VIP instant claim rewards.", unitAmount: 499 },
  powerup_tactical_pack: { name: "Tactical Arsenal Pack (5 Stasis • 5 EMP • 5 Shields)", unitAmount: 299 },
  powerup_stasis_10: { name: "Tactical Powerup Munitions Pack (Stasis)", unitAmount: 199 },
  powerup_emp_10: { name: "Tactical Powerup Munitions Pack (EMP)", unitAmount: 199 },
  powerup_shield_10: { name: "Tactical Powerup Munitions Pack (Shield)", unitAmount: 199 },
  bundle_starter_architect: { name: "Starter Architect Pack (350 Coins + 15 Powerups + Lunar Skin)", unitAmount: 499 },
  bundle_tactical_architect: { name: "Tactical Architect Pack (1,000 Coins + 36 Powerups + Nebula Skin)", unitAmount: 999 },
  bundle_legend_architect: { name: "Legend Architect Pack (3,500 Coins + 75 Powerups + 2 Master Skins)", unitAmount: 1999 },
};

// Checkout sessions that have already been redeemed, so a success link can't be replayed
const FULFILLED_PATH = path.join(process.cwd(), "checkout_fulfilled.json");
const fulfilledSessions = new Set<string>(
  (() => {
    try {
      return JSON.parse(fs.readFileSync(FULFILLED_PATH, "utf8")) as string[];
    } catch {
      return [];
    }
  })()
);
function markFulfilled(sessionId: string) {
  fulfilledSessions.add(sessionId);
  try {
    fs.writeFileSync(FULFILLED_PATH, JSON.stringify([...fulfilledSessions]));
  } catch (err) {
    console.error("Could not persist fulfilled checkout sessions:", err);
  }
}

// Setup Stripe with optional env var (lazy initialization or handle missing gently for dev)
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn('STRIPE_SECRET_KEY is missing. Using simulated Stripe mode.');
      // Create a mock Stripe client for dev if no key is provided
      return {} as Stripe; 
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// --- Score submission hygiene -------------------------------------------------
// There are no player accounts, so a determined cheater can still post a fake
// score. These checks stop malformed data, absurd values and request flooding.
const MAX_SCORE = 50_000_000;
const MAX_BLOCKS = 1000;
const recentSubmissions = new Map<string, number>();

function cleanText(value: unknown, max: number, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max);
  return cleaned || fallback;
}

function cleanInt(value: unknown, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max) return null;
  return Math.floor(value);
}

function tooFrequent(key: string, windowMs = 3000): boolean {
  const now = Date.now();
  const last = recentSubmissions.get(key) || 0;
  recentSubmissions.set(key, now);
  if (recentSubmissions.size > 5000) {
    for (const [k, t] of recentSubmissions) if (now - t > 60_000) recentSubmissions.delete(k);
  }
  return now - last < windowMs;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const httpServer = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Tournaments Endpoints
  app.get("/api/tournaments", (req, res) => {
    try {
      const playerId = (req.query.playerId as string) || undefined;
      const tournaments = serverTournamentManager.getTournaments(playerId);
      res.setHeader("Content-Type", "application/json");
      res.json(tournaments);
    } catch (err: any) {
      console.error("Error in /api/tournaments:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/tournaments/:id", (req, res) => {
    try {
      const playerId = (req.query.playerId as string) || undefined;
      const tournament = serverTournamentManager.getTournament(req.params.id, playerId);
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      res.setHeader("Content-Type", "application/json");
      res.json(tournament);
    } catch (err: any) {
      console.error(`Error in /api/tournaments/${req.params.id}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/tournaments/:id/submit", (req, res) => {
    try {
      const body = req.body || {};
      const playerId = cleanText(body.playerId, 64);
      const score = cleanInt(body.score, MAX_SCORE);
      const blocksBuilt = cleanInt(body.blocksBuilt ?? 0, MAX_BLOCKS);
      const maxCombo = cleanInt(body.maxCombo ?? 0, MAX_BLOCKS);
      if (!playerId || score === null || blocksBuilt === null || maxCombo === null || maxCombo > Math.max(1, blocksBuilt)) {
        return res.status(400).json({ error: "Invalid submission data" });
      }
      // Scoring is at most ~60x (prism x perfect x rapid streak) of blocks x 10 x combo
      if (score > Math.max(1000, blocksBuilt * 10 * Math.max(1, maxCombo) * 60)) {
        return res.status(400).json({ error: "Score is not possible for that run" });
      }
      if (tooFrequent(`t:${req.params.id}:${playerId}`)) {
        return res.status(429).json({ error: "Too many submissions" });
      }
      const result = serverTournamentManager.submitScore(req.params.id, {
        playerId,
        playerName: cleanText(body.playerName, 24, 'Player'),
        score,
        blocksBuilt,
        maxCombo,
        cosmeticId: cleanText(body.cosmeticId, 64) || undefined,
        avatar: cleanText(body.avatar, 16) || undefined,
        country: cleanText(body.country, 8) || undefined,
      });
      res.setHeader("Content-Type", "application/json");
      res.json(result);
    } catch (err: any) {
      console.error(`Error in /api/tournaments/${req.params.id}/submit:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // Global Leaderboards Endpoints
  app.get("/api/leaderboard", (req, res) => {
    try {
      const playerId = (req.query.playerId as string) || undefined;
      const entries = serverTournamentManager.getGlobalLeaderboard('endless', playerId);
      res.setHeader("Content-Type", "application/json");
      res.json(entries);
    } catch (err: any) {
      console.error("Error in /api/leaderboard:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/leaderboard/:type", (req, res) => {
    const type = req.params.type as 'endless' | 'tournament' | 'campaign';
    if (type !== 'endless' && type !== 'tournament' && type !== 'campaign') {
      return res.status(400).json({ error: "Invalid leaderboard type" });
    }
    try {
      const playerId = (req.query.playerId as string) || undefined;
      const entries = serverTournamentManager.getGlobalLeaderboard(type, playerId);
      res.setHeader("Content-Type", "application/json");
      res.json(entries);
    } catch (err: any) {
      console.error(`Error in /api/leaderboard/${type}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/leaderboard/:type/submit", (req, res) => {
    const type = req.params.type as 'endless' | 'tournament' | 'campaign';
    if (type !== 'endless' && type !== 'tournament' && type !== 'campaign') {
      return res.status(400).json({ error: "Invalid leaderboard type" });
    }
    try {
      const body = req.body || {};
      const playerId = cleanText(body.playerId, 64);
      const score = cleanInt(body.score, MAX_SCORE);
      if (!playerId || score === null) {
        return res.status(400).json({ error: "Invalid submission" });
      }
      if (tooFrequent(`g:${type}:${playerId}`)) {
        return res.status(429).json({ error: "Too many submissions" });
      }
      const result = serverTournamentManager.submitGlobalScore(type, {
        playerId,
        playerName: cleanText(body.playerName, 24, 'Player'),
        score,
        secondaryStat: cleanText(body.secondaryStat, 40) || undefined,
        avatar: cleanText(body.avatar, 16) || undefined,
        country: cleanText(body.country, 8) || undefined,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const { productId, packId } = req.body || {};
      const targetId = String(productId || packId || "");
      const product = CHECKOUT_PRODUCTS[targetId];
      if (!product) {
        return res.status(400).json({ error: "Unknown product." });
      }

      // Without a Stripe key, a simulated checkout is allowed for local development only
      if (!process.env.STRIPE_SECRET_KEY) {
        if (IS_PRODUCTION) {
          return res.status(503).json({ error: "Payments are not configured." });
        }
        return res.json({ url: `/?checkout_session=mock_${encodeURIComponent(targetId)}` });
      }

      const stripe = getStripe();
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = (req.headers['x-forwarded-host'] as string) || req.get("host");
      const baseUrl = `${proto}://${host}`;

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: product.name,
                description: product.description || "Architectural credits and tactical powerups.",
              },
              unit_amount: product.unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        metadata: { productId: targetId },
        // Stripe substitutes the real session id; the client must verify it with the server
        success_url: `${baseUrl}/?checkout_session={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: "Could not start checkout." });
    }
  });

  // Confirms with Stripe that a checkout session was actually paid, once per session
  app.post("/api/checkout/verify", async (req, res) => {
    try {
      const sessionId = String(req.body?.sessionId || "");
      if (!sessionId || sessionId.length > 255) {
        return res.status(400).json({ error: "Missing session." });
      }

      if (sessionId.startsWith("mock_")) {
        if (IS_PRODUCTION || process.env.STRIPE_SECRET_KEY) {
          return res.status(403).json({ error: "Simulated purchases are disabled." });
        }
        const productId = decodeURIComponent(sessionId.slice(5));
        if (!CHECKOUT_PRODUCTS[productId]) return res.status(400).json({ error: "Unknown product." });
        if (fulfilledSessions.has(sessionId)) return res.json({ status: "already_fulfilled", productId });
        markFulfilled(sessionId);
        return res.json({ status: "paid", productId, simulated: true });
      }

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(503).json({ error: "Payments are not configured." });
      }

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
      const productId = session.metadata?.productId || "";
      if (session.payment_status !== "paid" || !CHECKOUT_PRODUCTS[productId]) {
        return res.status(402).json({ error: "Payment not completed." });
      }
      // The redeemed flag is stored on Stripe's payment record so it survives server restarts
      const intent = typeof session.payment_intent === "object" ? session.payment_intent : null;
      if (fulfilledSessions.has(session.id) || intent?.metadata?.towershift_fulfilled === "true") {
        return res.json({ status: "already_fulfilled", productId });
      }
      if (intent) {
        await stripe.paymentIntents.update(intent.id, { metadata: { towershift_fulfilled: "true" } });
      }
      markFulfilled(session.id);
      res.json({ status: "paid", productId });
    } catch (error: any) {
      console.error("Checkout verification error:", error?.message || error);
      res.status(400).json({ error: "Could not verify payment." });
    }
  });

  // Vite middleware for development (HMR disabled for iframe / cloud container stability)
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Using express 4 wildcard route
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
