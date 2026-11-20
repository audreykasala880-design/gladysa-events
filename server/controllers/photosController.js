import cloudinary from "../services/cloudinary.js";
import { getPhotos, insertPhoto, deletePhoto } from "../services/photosService.js";

/**
 * Catégories valides pour la galerie
 */
const CATEGORY_LABELS = {
  mariages: "Mariages",
  prive: "Événement Privé",
  corporate: "Corporate",
  gala: "Gala",
  decoration: "Décoration",
};

/**
 * Récupère toutes les photos (public).
 */
export async function listPhotos(request, response) {
  try {
    const { category } = request.query;
    const photos = getPhotos(request.app.locals.db, category);
    response.json({ photos });
  } catch (error) {
    console.error("Erreur listPhotos:", error);
    response.status(500).json({ error: "Impossible de récupérer les photos" });
  }
}

/**
 * Ajoute une nouvelle photo à la galerie (Admin).
 * Prend en charge l'upload direct vers Cloudinary via base64 ou URL externe.
 */
export async function createPhoto(request, response) {
  try {
    const { title, category, caption, image } = request.body || {};

    if (!title || !title.trim()) {
      return response.status(400).json({ error: "Le titre est requis" });
    }
    if (!category || !category.trim()) {
      return response.status(400).json({ error: "La catégorie est requise" });
    }
    if (!image) {
      return response.status(400).json({ error: "L'image est requise (fichier ou URL)" });
    }

    const normalizedCategory = category.toLowerCase().trim();
    const categoryLabel = CATEGORY_LABELS[normalizedCategory] || title;

    let imageUrl = "";
    let publicId = null;

    // Si c'est un format base64 ou data URL ou lien web
    if (typeof image === "string") {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "gladysa_events_gallery",
        resource_type: "image",
        transformation: [
          { quality: "auto:good", fetch_format: "auto" }
        ],
      });
      imageUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      return response.status(400).json({ error: "Format d'image non valide" });
    }

    const photo = insertPhoto(request.app.locals.db, {
      title: title.trim(),
      category: normalizedCategory,
      categoryLabel,
      imageUrl,
      publicId,
      caption: caption ? caption.trim() : "",
    });

    response.status(201).json({ photo });
  } catch (error) {
    console.error("Erreur createPhoto:", error);
    response.status(500).json({ error: error.message || "Échec de l'upload de la photo" });
  }
}

/**
 * Supprime une photo (Admin).
 */
export async function removePhoto(request, response) {
  try {
    const id = Number(request.params.id);
    if (!id || Number.isNaN(id)) {
      return response.status(400).json({ error: "ID invalide" });
    }

    const success = await deletePhoto(request.app.locals.db, id);
    if (!success) {
      return response.status(404).json({ error: "Photo introuvable" });
    }

    response.json({ success: true, message: "Photo supprimée" });
  } catch (error) {
    console.error("Erreur removePhoto:", error);
    response.status(500).json({ error: "Échec de la suppression de la photo" });
  }
}
