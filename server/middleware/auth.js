import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Compare deux clés API de façon sécurisée (résistant aux timing attacks et fuites de longueur).
 *
 * @param {string|undefined} providedKey - Clé fournie par le client
 * @param {string|undefined} expectedKey - Clé configurée sur le serveur
 * @returns {boolean}
 */
function hasValidAdminKey(providedKey, expectedKey) {
  if (!providedKey || !expectedKey) return false;
  const providedHash = createHash("sha256").update(providedKey).digest();
  const expectedHash = createHash("sha256").update(expectedKey).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

/**
 * Middleware Express : vérifie que la requête porte une clé admin valide
 * dans l'en-tête `Authorization: Bearer <key>`.
 *
 * Retourne 503 si la clé admin n'est pas configurée côté serveur.
 * Retourne 401 si la clé est absente ou invalide.
 *
 * @param {string} adminApiKey - Clé attendue (issue des variables d'environnement)
 * @returns {import('express').RequestHandler}
 */
export function requireAdminKey(adminApiKey) {
  return (request, response, next) => {
    const expectedKey = adminApiKey || request.app.locals.adminApiKey || process.env.ADMIN_API_KEY;
    const authorization = request.get("authorization") || "";
    const providedKey = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!expectedKey) {
      response.status(503).json({ error: "Admin API is not configured" });
      return;
    }

    if (!hasValidAdminKey(providedKey, expectedKey)) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    next();
  };
}
