/**
 * Retourne l'URL de base de l'API backend.
 * - Utilise VITE_API_BASE_URL si défini
 * - Si exécuté sur Vercel ou un domaine frontend séparé sans variable d'env,
 *   redirige automatiquement vers le backend Render de production
 * - Sur Render ou en local, utilise le chemin relatif ""
 */
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Détection Vercel ou domaine externe : fallback automatique vers Render backend
    if (
      host.includes("vercel.app") ||
      (!host.includes("onrender.com") && host !== "localhost" && host !== "127.0.0.1")
    ) {
      return "https://gladysa-signature-events-backend.onrender.com";
    }
  }

  return "";
}
