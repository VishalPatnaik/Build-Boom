import http from "http";
import express from "express";
import path from "path";
import Stripe from "stripe";
import "dotenv/config";
import { serverTournamentManager } from "./serverTournaments.ts";

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
      const { playerId, playerName, score, blocksBuilt, maxCombo, cosmeticId, avatar, country } = req.body;
      if (!playerId || typeof score !== 'number') {
        return res.status(400).json({ error: "Invalid submission data" });
      }
      const result = serverTournamentManager.submitScore(req.params.id, {
        playerId,
        playerName: playerName || 'Player',
        score,
        blocksBuilt: blocksBuilt || 0,
        maxCombo: maxCombo || 0,
        cosmeticId,
        avatar,
        country,
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
      const { playerId, playerName, score, secondaryStat, avatar, country } = req.body;
      if (!playerId || typeof score !== 'number') {
        return res.status(400).json({ error: "Invalid submission" });
      }
      const result = serverTournamentManager.submitGlobalScore(type, {
        playerId,
        playerName: playerName || 'Player',
        score,
        secondaryStat,
        avatar,
        country,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const { productId, packId, coins, paymentMethod } = req.body;
      const stripe = getStripe();
      
      // Determine product name and amount in cents
      let name = "TOWER//SHIFT In-App Purchase";
      let description = "Architectural credits and tactical powerups.";
      let unitAmount = 99; // in cents ($0.99)
      const targetId = productId || packId || 'coins_100';

      if (targetId === 'coins_100') {
        name = "100 Architectural Credits";
        unitAmount = 99;
      } else if (targetId === 'coins_500') {
        name = "500 Architectural Credits (Value Pack)";
        unitAmount = 399;
      } else if (targetId === 'coins_1200') {
        name = "1,200 Architectural Credits (Mega Pack)";
        unitAmount = 799;
      } else if (targetId === 'coins_2500') {
        name = "2,500 Architectural Credits (Ultra Pack)";
        unitAmount = 1499;
      } else if (targetId === 'coins_5000') {
        name = "5,000 Architectural Credits (Legend Pack)";
        unitAmount = 2499;
      } else if (targetId === 'remove_ads') {
        name = "Ad Blocker VIP Pass (Permanent)";
        description = "Permanent ad removal & VIP instant claim rewards.";
        unitAmount = 499;
      } else if (targetId === 'powerup_tactical_pack') {
        name = "Tactical Arsenal Pack (5 Stasis • 5 EMP • 5 Shields)";
        unitAmount = 299;
      } else if (targetId.startsWith('powerup_')) {
        name = "Tactical Powerup Munitions Pack";
        unitAmount = 199;
      } else if (targetId === 'bundle_starter_architect') {
        name = "Starter Architect Pack (350 Coins + 15 Powerups + Lunar Skin)";
        unitAmount = 499;
      } else if (targetId === 'bundle_tactical_architect') {
        name = "Tactical Architect Pack (1,000 Coins + 36 Powerups + Nebula Skin)";
        unitAmount = 999;
      } else if (targetId === 'bundle_legend_architect') {
        name = "Legend Architect Pack (3,500 Coins + 75 Powerups + 2 Master Skins)";
        unitAmount = 1999;
      } else if (targetId.startsWith('bundle_')) {
        name = "Architect Tactical Bundle";
        unitAmount = 499;
      }

      // If we don't have a real stripe key, return a mock session URL for testing
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.json({ 
          url: `/?success=true&productId=${encodeURIComponent(targetId)}&coins=${coins || 0}&method=${encodeURIComponent(paymentMethod || 'universal')}&mock_checkout=1` 
        });
      }

      // Real Stripe integration with multi-payment methods: Card, Google Pay, Apple Pay, PayPal, Link
      const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
      const host = (req.headers['x-forwarded-host'] as string) || req.get("host");
      const baseUrl = `${proto}://${host}`;

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name,
                description,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/?success=true&productId=${encodeURIComponent(targetId)}&coins=${coins || 0}`,
        cancel_url: `${baseUrl}/?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: error.message });
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
