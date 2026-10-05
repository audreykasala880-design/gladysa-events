import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";

/**
 * Initialise la base de données SQLite avec le schéma de base.
 * Active le mode WAL et les clés étrangères.
 *
 * @param {string} databasePath - Chemin vers le fichier SQLite
 * @returns {import('better-sqlite3').Database}
 */
export function createDatabase(databasePath) {
  let targetPath = databasePath;
  try {
    const dir = dirname(resolve(targetPath));
    mkdirSync(dir, { recursive: true });
  } catch {
    targetPath = "/tmp/gladysa.sqlite";
    try {
      mkdirSync(dirname(targetPath), { recursive: true });
    } catch {}
  }

  let db;
  try {
    db = new Database(resolve(targetPath));
  } catch {
    targetPath = "/tmp/gladysa.sqlite";
    db = new Database(resolve(targetPath));
  }
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      event_type TEXT NOT NULL,
      event_date TEXT,
      guest_count INTEGER,
      message TEXT NOT NULL,
      privacy_consent INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'received',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes(created_at);
  `);

  // Migration : ajout de la colonne privacy_consent si absente (rétrocompatibilité)
  const columns = db.pragma("table_info(quotes)");
  if (!columns.some((col) => col.name === "privacy_consent")) {
    db.exec(
      "ALTER TABLE quotes ADD COLUMN privacy_consent INTEGER NOT NULL DEFAULT 0"
    );
  }

  return db;
}
