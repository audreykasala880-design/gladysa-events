/**
 * Récupère les annonces actives destinées aux visiteurs.
 *
 * @param {import('better-sqlite3').Database} db
 * @returns {Array<object>}
 */
export function getActiveAnnouncements(db) {
  const statement = db.prepare(`
    SELECT id, title, content, badge,
           link_url AS linkUrl, link_text AS linkText,
           is_active AS isActive, created_at AS createdAt
    FROM announcements
    WHERE is_active = 1
    ORDER BY id DESC
  `);
  return statement.all();
}

/**
 * Récupère toutes les annonces (pour le Dashboard Admin).
 *
 * @param {import('better-sqlite3').Database} db
 * @returns {Array<object>}
 */
export function getAllAnnouncements(db) {
  const statement = db.prepare(`
    SELECT id, title, content, badge,
           link_url AS linkUrl, link_text AS linkText,
           is_active AS isActive, created_at AS createdAt
    FROM announcements
    ORDER BY id DESC
  `);
  return statement.all();
}

/**
 * Crée une nouvelle annonce.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {object} announcement
 * @returns {object}
 */
export function insertAnnouncement(db, { title, content, badge, linkUrl, linkText, isActive = 1 }) {
  const statement = db.prepare(`
    INSERT INTO announcements (title, content, badge, link_url, link_text, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    title,
    content,
    badge || "Annonce",
    linkUrl || null,
    linkText || null,
    isActive ? 1 : 0
  );

  return {
    id: Number(result.lastInsertRowid),
    title,
    content,
    badge: badge || "Annonce",
    linkUrl: linkUrl || null,
    linkText: linkText || null,
    isActive: isActive ? 1 : 0,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Active ou désactive une annonce.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number} id
 * @param {boolean|number} isActive
 * @returns {boolean}
 */
export function updateAnnouncementStatus(db, id, isActive) {
  const statement = db.prepare("UPDATE announcements SET is_active = ? WHERE id = ?");
  const result = statement.run(isActive ? 1 : 0, id);
  return result.changes > 0;
}

/**
 * Supprime une annonce.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number} id
 * @returns {boolean}
 */
export function deleteAnnouncement(db, id) {
  const statement = db.prepare("DELETE FROM announcements WHERE id = ?");
  const result = statement.run(id);
  return result.changes > 0;
}
