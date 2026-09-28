import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import "dotenv/config";
import { serverTournamentManager } from "./serverTournaments";

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
    stripeClient = new Stripe(key, { apiVersion: "2025-02-24.acacia" as any });
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
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
      const { packId, coins } = req.body;
      const stripe = getStripe();
      
      // If we don't have a real stripe key, return a mock session URL for testing
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.json({ 
          url: `/?success=true&coins=${coins}&mock_checkout=1` 
        });
      }

      // Real Stripe integration
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${coins} Coins Pack`,
                description: `Unlock cosmetics and revives.`,
              },
              unit_amount: packId === 'pack1' ? 99 : packId === 'pack2' ? 299 : 499,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/?success=true&coins=${coins}`,
        cancel_url: `${req.protocol}://${req.get("host")}/?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
