// tsx injects globalThis.__dirname as '.', which confuses some ESM packages. Delete it before Vite imports.
if (typeof (globalThis as any).__dirname !== "undefined") {
  delete (globalThis as any).__dirname;
}

import http from "http";
import express from "express";
import compression from "compression";
import "dotenv/config";
import { serverTournamentManager } from "./serverTournaments.ts";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

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
  app.disable('x-powered-by');

  // Basic hardening headers for every response
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // The Android app runs from https://localhost inside its WebView and calls this API
  const APP_ORIGINS = new Set(['https://localhost', 'capacitor://localhost', 'http://localhost']);
  app.use('/api', (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && APP_ORIGINS.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Compress API responses
  app.use(compression());
  const httpServer = http.createServer(app);
  // Hosting platforms (Cloud Run, Render, Railway...) pass the port in PORT
  const PORT = Number(process.env.PORT) || 3000;

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

  // Development only: serve the game through Vite so it can be tested in a desktop browser.
  // In production this server is ONLY the API for the Android app; the game itself ships inside the APK.
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
