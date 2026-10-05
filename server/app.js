import cors from "cors";
import express from "express";
import helmet from "helmet";
import { createDatabase } from "./db/database.js";
import quotesRouter from "./routes/quotes.js";

/**
 * Crée et configure l'application Express.
 *
 * @param {object} [options]
 * @param {string} [options.databasePath] - Chemin du fichier SQLite
 * @returns {import('express').Application}
 */
export function createApp({
  databasePath = process.env.DATABASE_PATH || "data/gladysa.sqlite",
  adminApiKey = process.env.ADMIN_API_KEY,
} = {}) {
  const db = createDatabase(databasePath);
  const app = express();

  // ── Reverse Proxy (Render / Vercel rate-limit IP detection) ──────────────
  app.set("trust proxy", 1);

  // ── Sécurité ─────────────────────────────────────────────────────────────
  app.disable("x-powered-by");
  app.use(helmet());

  // ── CORS ─────────────────────────────────────────────────────────────────
  const configuredOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = configuredOrigins.length
    ? configuredOrigins
    : ["http://localhost:5173", "http://127.0.0.1:5173"];

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Origin not allowed"));
      },
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ── Parseur JSON ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: "16kb" }));

  // ── Base de données (accessible via req.app.locals.db) ───────────────────
  app.locals.db = db;
  app.locals.adminApiKey = adminApiKey;
  app.locals.close = () => db.close();

  // ── Routes ────────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", quotesRouter);

  // ── 404 API ───────────────────────────────────────────────────────────────
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // ── Gestionnaire d'erreurs global ─────────────────────────────────────────
  // eslint-disable-next-line no-unused-vars
  app.use((error, _req, res, _next) => {
    if (error.type === "entity.parse.failed") {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
    if (error.type === "entity.too.large") {
      res.status(413).json({ error: "Request body too large" });
      return;
    }
    if (error.message === "Origin not allowed") {
      res.status(403).json({ error: "Origin not allowed" });
      return;
    }
    console.error("API request failed:", error.message);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}