/**
 * Service d'accès à la base de données pour les devis.
 * Toutes les requêtes SQL sont centralisées ici.
 */

const SELECT_COLUMNS = `
  id, name, email, phone,
  event_type AS eventType,
  event_date AS eventDate,
  guest_count AS guestCount,
  privacy_consent AS privacyConsent,
  status, created_at AS createdAt
`;

/**
 * Insère un devis en base et retourne l'enregistrement complet.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {object} data - Données validées par Zod
 * @returns {object} Le devis sauvegardé
 */
export function insertQuote(db, data) {
  const result = db
    .prepare(
      `INSERT INTO quotes
        (name, email, phone, event_type, event_date, guest_count, message, privacy_consent)
      VALUES
        (@name, @email, @phone, @eventType, @eventDate, @guestCount, @message, @privacyConsent)`
    )
    .run({
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone ?? null,
      eventType: data.eventType,
      eventDate: data.eventDate ?? null,
      guestCount: data.guestCount ?? null,
      message: data.message,
      privacyConsent: data.privacyConsent === "true" ? 1 : 0,
    });

  return db
    .prepare(`SELECT ${SELECT_COLUMNS} FROM quotes WHERE id = ?`)
    .get(result.lastInsertRowid);
}

/**
 * Récupère les 200 derniers devis (ordre décroissant).
 *
 * @param {import('better-sqlite3').Database} db
 * @returns {object[]}
 */
export function getLatestQuotes(db) {
  return db
    .prepare(
      `SELECT ${SELECT_COLUMNS}, message
       FROM quotes ORDER BY id DESC LIMIT 200`
    )
    .all();
}

/**
 * Supprime un devis par son identifiant.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number} id
 * @returns {import('better-sqlite3').RunResult}
 */
export function deleteQuote(db, id) {
  return db.prepare("DELETE FROM quotes WHERE id = ?").run(id);
}
