import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAdminKey } from "../middleware/auth.js";
import { createQuote, listQuotes, removeQuote } from "../controllers/quotesController.js";

const router = Router();

/** Limite les soumissions de devis : 8 par IP toutes les 15 minutes */
const quoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

/** Limite les appels à l'API admin : 50 par IP toutes les 15 minutes */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

/**
 * @route POST /api/quotes
 * @desc  Créer une nouvelle demande de devis
 * @access Public
 */
router.post("/quotes", quoteLimiter, createQuote);

/**
 * @route GET /api/admin/quotes
 * @desc  Lister les 200 dernières demandes de devis
 * @access Admin (clé API requise)
 */
router.get(
  "/admin/quotes",
  adminLimiter,
  requireAdminKey(),
  listQuotes
);

/**
 * @route DELETE /api/admin/quotes/:id
 * @desc  Supprimer une demande de devis par son ID
 * @access Admin (clé API requise)
 */
router.delete(
  "/admin/quotes/:id",
  adminLimiter,
  requireAdminKey(),
  removeQuote
);

export default router;
