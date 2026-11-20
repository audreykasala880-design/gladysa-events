import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import Database from "better-sqlite3";
import request from "supertest";
import { createApp } from "./app.js";

const validQuote = {
  name: "Amina K.",
  email: "amina@example.com",
  phone: "+243 900 000 000",
  eventType: "Mariage",
  eventDate: "2027-06-12",
  guestCount: 120,
  message: "Nous souhaitons organiser une réception pour notre mariage.",
  privacyConsent: "true",
};

let temporaryDirectory;
let app;

beforeEach(() => {
  temporaryDirectory = mkdtempSync(join(tmpdir(), "gladysa-api-"));
  app = createApp({
    databasePath: join(temporaryDirectory, "test.sqlite"),
    adminApiKey: "test-admin-key",
    notifyQuote: async () => {},
  });
});

afterEach(() => {
  app.locals.close();
  rmSync(temporaryDirectory, { recursive: true, force: true });
});

test("health endpoint reports that the API is ready", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("a valid quote is persisted and can be read by an authenticated admin", async () => {
  const created = await request(app).post("/api/quotes").send(validQuote);

  assert.equal(created.status, 201);
  assert.equal(created.body.quote.eventType, validQuote.eventType);
  assert.equal(created.body.quote.status, "received");

  const unauthorized = await request(app).get("/api/admin/quotes");
  assert.equal(unauthorized.status, 401);

  const listed = await request(app)
    .get("/api/admin/quotes")
    .set("Authorization", "Bearer test-admin-key");

  assert.equal(listed.status, 200);
  assert.equal(listed.body.quotes.length, 1);
  assert.equal(listed.body.quotes[0].email, validQuote.email);
  assert.equal(listed.body.quotes[0].privacyConsent, 1);
});

test("invalid quote data is rejected without being stored", async () => {
  const created = await request(app)
    .post("/api/quotes")
    .send({ ...validQuote, email: "not-an-email", guestCount: -2 });

  assert.equal(created.status, 400);
  assert.equal(created.body.error, "Validation failed");

  const listed = await request(app)
    .get("/api/admin/quotes")
    .set("Authorization", "Bearer test-admin-key");

  assert.equal(listed.body.quotes.length, 0);
});

test("an existing database is migrated before receiving a quote", async () => {
  const databasePath = join(temporaryDirectory, "test.sqlite");
  app.locals.close();

  const legacyDatabase = new Database(databasePath);
  legacyDatabase.exec(`
    DROP INDEX IF EXISTS quotes_created_at_idx;
    DROP TABLE quotes;
    CREATE TABLE quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      event_type TEXT NOT NULL,
      event_date TEXT,
      guest_count INTEGER,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'received',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  legacyDatabase.close();

  app = createApp({
    databasePath,
    adminApiKey: "test-admin-key",
    notifyQuote: async () => {},
  });

  const created = await request(app).post("/api/quotes").send(validQuote);
  assert.equal(created.status, 201);

  const listed = await request(app)
    .get("/api/admin/quotes")
    .set("Authorization", "Bearer test-admin-key");
  assert.equal(listed.body.quotes[0].privacyConsent, 1);
});

test("an admin can delete a quote by id", async () => {
  const created = await request(app).post("/api/quotes").send(validQuote);
  const quoteId = created.body.quote.id;

  const deleteUnauthorized = await request(app).delete(`/api/admin/quotes/${quoteId}`);
  assert.equal(deleteUnauthorized.status, 401);

  const deleteSuccess = await request(app)
    .delete(`/api/admin/quotes/${quoteId}`)
    .set("Authorization", "Bearer test-admin-key");
  assert.equal(deleteSuccess.status, 200);

  const deleteNotFound = await request(app)
    .delete(`/api/admin/quotes/${quoteId}`)
    .set("Authorization", "Bearer test-admin-key");
  assert.equal(deleteNotFound.status, 404);
});

test("announcements lifecycle: create, list public, toggle active, and delete", async () => {
  // Public list starts empty
  const initialPublic = await request(app).get("/api/announcements");
  assert.equal(initialPublic.status, 200);
  assert.equal(initialPublic.body.announcements.length, 0);

  // Unauthorized create rejected
  const unauthCreate = await request(app).post("/api/admin/announcements").send({
    title: "Offre d'automne",
    content: "-20% sur la scénographie florale pour les mariages 2027",
  });
  assert.equal(unauthCreate.status, 401);

  // Authenticated create
  const created = await request(app)
    .post("/api/admin/announcements")
    .set("Authorization", "Bearer test-admin-key")
    .send({
      title: "Offre d'automne",
      content: "-20% sur la scénographie florale pour les mariages 2027",
      badge: "Promo",
      linkUrl: "/contact",
      linkText: "En profiter",
    });
  assert.equal(created.status, 201);
  assert.equal(created.body.announcement.title, "Offre d'automne");
  const announcementId = created.body.announcement.id;

  // Appears in public list
  const activePublic = await request(app).get("/api/announcements");
  assert.equal(activePublic.body.announcements.length, 1);
  assert.equal(activePublic.body.announcements[0].id, announcementId);

  // Admin toggles active to 0
  const toggled = await request(app)
    .patch(`/api/admin/announcements/${announcementId}`)
    .set("Authorization", "Bearer test-admin-key")
    .send({ isActive: false });
  assert.equal(toggled.status, 200);

  // No longer appears in public list
  const hiddenPublic = await request(app).get("/api/announcements");
  assert.equal(hiddenPublic.body.announcements.length, 0);

  // Still appears in admin list
  const adminList = await request(app)
    .get("/api/admin/announcements")
    .set("Authorization", "Bearer test-admin-key");
  assert.equal(adminList.body.announcements.length, 1);
  assert.equal(adminList.body.announcements[0].isActive, 0);

  // Admin deletes announcement
  const deleted = await request(app)
    .delete(`/api/admin/announcements/${announcementId}`)
    .set("Authorization", "Bearer test-admin-key");
  assert.equal(deleted.status, 200);

  const emptyAdmin = await request(app)
    .get("/api/admin/announcements")
    .set("Authorization", "Bearer test-admin-key");
  assert.equal(emptyAdmin.body.announcements.length, 0);
});

test("photos endpoint can be retrieved publicly", async () => {
  const response = await request(app).get("/api/photos");
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.photos));
});