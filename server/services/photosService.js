import cloudinary from "./cloudinary.js";

/**
 * Récupère les photos de la galerie (filtrage optionnel par catégorie).
 *
 * @param {import('better-sqlite3').Database} db
 * @param {string} [category]
 * @returns {Array<object>}
 */
export function getPhotos(db, category) {
  if (category && category !== "all") {
    const statement = db.prepare(`
      SELECT id, title, category, category_label AS categoryLabel,
             image_url AS imageUrl, public_id AS publicId, caption, created_at AS createdAt
      FROM photos
      WHERE category = ?
      ORDER BY id DESC
    `);
    return statement.all(category);
  }

  const statement = db.prepare(`
    SELECT id, title, category, category_label AS categoryLabel,
           image_url AS imageUrl, public_id AS publicId, caption, created_at AS createdAt
    FROM photos
    ORDER BY id DESC
  `);
  return statement.all();
}

/**
 * Ajoute une photo dans la base de données.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {object} photoData
 * @returns {object}
 */
export function insertPhoto(db, { title, category, categoryLabel, imageUrl, publicId, caption }) {
  const statement = db.prepare(`
    INSERT INTO photos (title, category, category_label, image_url, public_id, caption)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    title,
    category,
    categoryLabel || category,
    imageUrl,
    publicId || null,
    caption || ""
  );

  return {
    id: Number(result.lastInsertRowid),
    title,
    category,
    categoryLabel: categoryLabel || category,
    imageUrl,
    publicId: publicId || null,
    caption: caption || "",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Supprime une photo de Cloudinary et de la base de données SQLite.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function deletePhoto(db, id) {
  const photo = db.prepare("SELECT * FROM photos WHERE id = ?").get(id);
  if (!photo) return false;

  // Suppression sur Cloudinary si un public_id existe
  if (photo.public_id) {
    try {
      await cloudinary.uploader.destroy(photo.public_id);
    } catch (error) {
      console.warn("Échec suppression Cloudinary pour public_id:", photo.public_id, error.message);
    }
  }

  const result = db.prepare("DELETE FROM photos WHERE id = ?").run(id);
  return result.changes > 0;
}
