import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAdminKey } from "../middleware/auth.js";
import {
  listPublicAnnouncements,
  listAdminAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  removeAnnouncement,
} from "../controllers/announcementsController.js";

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.get("/announcements", limiter, listPublicAnnouncements);
router.get("/admin/announcements", requireAdminKey(), listAdminAnnouncements);
router.post("/admin/announcements", requireAdminKey(), createAnnouncement);
router.patch("/admin/announcements/:id", requireAdminKey(), toggleAnnouncement);
router.delete("/admin/announcements/:id", requireAdminKey(), removeAnnouncement);

export default router;
