import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAdminKey } from "../middleware/auth.js";
import { listPhotos, createPhoto, removePhoto } from "../controllers/photosController.js";

const router = Router();

const photosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.get("/photos", photosLimiter, listPhotos);
router.post("/admin/photos", requireAdminKey(), createPhoto);
router.post("/photos", requireAdminKey(), createPhoto);
router.delete("/admin/photos/:id", requireAdminKey(), removePhoto);
router.delete("/photos/:id", requireAdminKey(), removePhoto);

export default router;
