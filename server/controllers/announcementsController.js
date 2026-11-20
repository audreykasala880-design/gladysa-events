import {
  getActiveAnnouncements,
  getAllAnnouncements,
  insertAnnouncement,
  updateAnnouncementStatus,
  deleteAnnouncement,
} from "../services/announcementsService.js";

/**
 * Liste les annonces actives (Public).
 */
export async function listPublicAnnouncements(request, response) {
  try {
    const announcements = getActiveAnnouncements(request.app.locals.db);
    response.json({ announcements });
  } catch (error) {
    console.error("Erreur listPublicAnnouncements:", error);
    response.status(500).json({ error: "Impossible de récupérer les annonces" });
  }
}

/**
 * Liste toutes les annonces (Admin).
 */
export async function listAdminAnnouncements(request, response) {
  try {
    const announcements = getAllAnnouncements(request.app.locals.db);
    response.json({ announcements });
  } catch (error) {
    console.error("Erreur listAdminAnnouncements:", error);
    response.status(500).json({ error: "Impossible de récupérer les annonces" });
  }
}

/**
 * Crée une annonce (Admin).
 */
export async function createAnnouncement(request, response) {
  try {
    const { title, content, badge, linkUrl, linkText, isActive } = request.body || {};

    if (!title || !title.trim()) {
      return response.status(400).json({ error: "Le titre de l'annonce est requis" });
    }
    if (!content || !content.trim()) {
      return response.status(400).json({ error: "Le contenu de l'annonce est requis" });
    }

    const announcement = insertAnnouncement(request.app.locals.db, {
      title: title.trim(),
      content: content.trim(),
      badge: badge ? badge.trim() : "Annonce",
      linkUrl: linkUrl ? linkUrl.trim() : null,
      linkText: linkText ? linkText.trim() : null,
      isActive: isActive !== false && isActive !== 0,
    });

    response.status(201).json({ announcement });
  } catch (error) {
    console.error("Erreur createAnnouncement:", error);
    response.status(500).json({ error: "Impossible de créer l'annonce" });
  }
}

/**
 * Active / désactive une annonce (Admin).
 */
export async function toggleAnnouncement(request, response) {
  try {
    const id = Number(request.params.id);
    const { isActive } = request.body;

    if (!id || Number.isNaN(id)) {
      return response.status(400).json({ error: "ID invalide" });
    }

    const success = updateAnnouncementStatus(request.app.locals.db, id, isActive);
    if (!success) {
      return response.status(404).json({ error: "Annonce introuvable" });
    }

    response.json({ success: true, isActive: Boolean(isActive) });
  } catch (error) {
    console.error("Erreur toggleAnnouncement:", error);
    response.status(500).json({ error: "Impossible de modifier l'annonce" });
  }
}

/**
 * Supprime une annonce (Admin).
 */
export async function removeAnnouncement(request, response) {
  try {
    const id = Number(request.params.id);
    if (!id || Number.isNaN(id)) {
      return response.status(400).json({ error: "ID invalide" });
    }

    const success = deleteAnnouncement(request.app.locals.db, id);
    if (!success) {
      return response.status(404).json({ error: "Annonce introuvable" });
    }

    response.json({ success: true });
  } catch (error) {
    console.error("Erreur removeAnnouncement:", error);
    response.status(500).json({ error: "Impossible de supprimer l'annonce" });
  }
}
