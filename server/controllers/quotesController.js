import { quoteSchema } from "../validation/quoteSchema.js";
import { insertQuote, getLatestQuotes, deleteQuote } from "../services/quotesService.js";
import { sendQuoteNotification } from "../email.js";

/**
 * POST /api/quotes
 * Valide les données, enregistre le devis et envoie une notification email.
 *
 * @type {import('express').RequestHandler}
 */
export async function createQuote(request, response, next) {
  const parsed = quoteSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({
      error: "Validation failed",
      details: parsed.error.issues.map(({ path, message }) => ({
        field: path.join("."),
        message,
      })),
    });
    return;
  }

  try {
    const db = request.app.locals.db;
    const savedQuote = insertQuote(db, parsed.data);

    // Notification email asynchrone — on ne bloque pas la réponse
    Promise.resolve(
      sendQuoteNotification({ ...savedQuote, message: parsed.data.message })
    ).catch((error) =>
      console.error("Quote email notification failed:", error.message)
    );

    response.status(201).json({
      message: "Quote request received",
      quote: {
        id: savedQuote.id,
        eventType: savedQuote.eventType,
        status: savedQuote.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/quotes
 * Retourne les 200 derniers devis (réservé à l'admin).
 *
 * @type {import('express').RequestHandler}
 */
export function listQuotes(request, response) {
  const db = request.app.locals.db;
  const quotes = getLatestQuotes(db);
  response.json({ quotes });
}

/**
 * DELETE /api/admin/quotes/:id
 * Supprime un devis spécifique par son ID (réservé à l'admin).
 *
 * @type {import('express').RequestHandler}
 */
export function removeQuote(request, response) {
  const numericId = Number(request.params.id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    response.status(400).json({ error: "Invalid quote ID" });
    return;
  }

  const db = request.app.locals.db;
  const result = deleteQuote(db, numericId);

  if (result.changes === 0) {
    response.status(404).json({ error: "Quote not found" });
    return;
  }

  response.json({ message: "Quote deleted successfully", id: numericId });
}
