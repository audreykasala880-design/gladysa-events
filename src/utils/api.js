/**
 * Retourne l'URL de base de l'API backend.
 * - Utilise VITE_API_BASE_URL si défini
 * - En local (localhost, 127.0.0.1, IPv6, réseau local), utilise le chemin relatif ""
 * - Sur Render (même domaine fullstack), utilise le chemin relatif ""
 * - Sur Vercel ou domaine séparé sans variable d'env, utilise le backend Render de production
 */
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    // Détection environnement local / réseau privé / IPv6
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "[::1]" ||
      host === "::1" ||
      host.endsWith(".local") ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.startsWith("172.");

    if (isLocal || host.includes("onrender.com")) {
      return "";
    }

    // Détection frontend hébergé séparément (Vercel ou autre)
    if (host.includes("vercel.app")) {
      return "https://gladysa-signature-events-backend.onrender.com";
    }
  }

  return "";
}
