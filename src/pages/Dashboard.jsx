import { useEffect, useState, useRef, useCallback } from "react";
import {
  FaTrash,
  FaBell,
  FaImages,
  FaBullhorn,
  FaListCheck,
  FaCloudArrowUp,
  FaToggleOn,
  FaToggleOff,
  FaVolumeHigh,
  FaEye,
  FaXmark,
} from "react-icons/fa6";
import { getApiBaseUrl } from "../utils/api";
import "../styles/pages.css";

const apiBaseUrl = getApiBaseUrl();

// Compression & redimensionnement d'image dans le navigateur (évite "Request body too large")
function compressImageToDataUrl(file, maxWidth = 1920, maxHeight = 1920, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Synthétiseur audio Web Audio API pour le carillon de notification de luxe
function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq, start, duration, vol) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(vol, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // Mélodie carillon 3 notes dorées (Mi5, Sol#5, Si5)
    playTone(659.25, now, 0.45, 0.25);
    playTone(830.61, now + 0.16, 0.55, 0.3);
    playTone(987.77, now + 0.32, 0.9, 0.35);
  } catch (err) {
    console.warn("Audio non disponible :", err);
  }
}

function Dashboard() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("gladysa-admin-key") || "");
  const [keyInput, setKeyInput] = useState("");
  const [activeTab, setActiveTab] = useState("quotes"); // "quotes" | "photos" | "announcements"

  // Quotes state
  const [quotes, setQuotes] = useState([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(() => Boolean(sessionStorage.getItem("gladysa-admin-key")));
  const [deletingQuoteId, setDeletingQuoteId] = useState(null);
  const [newQuoteAlert, setNewQuoteAlert] = useState(null);
  const previousQuotesRef = useRef([]);

  // Photos state
  const [photos, setPhotos] = useState([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCategory, setPhotoCategory] = useState("mariages");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoImageBase64, setPhotoImageBase64] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [compressedInfo, setCompressedInfo] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState("");
  const [photoUploadSuccess, setPhotoUploadSuccess] = useState("");
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementBadge, setAnnouncementBadge] = useState("Annonce");
  const [announcementLinkUrl, setAnnouncementLinkUrl] = useState("");
  const [announcementLinkText, setAnnouncementLinkText] = useState("");
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState("");
  const [togglingAnnouncementId, setTogglingAnnouncementId] = useState(null);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState(null);

  // Notifications state
  const [notificationsAllowed, setNotificationsAllowed] = useState(
    () => typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );

  const [generalError, setGeneralError] = useState("");

  // Demander la permission des notifications navigateur
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Votre navigateur ne supporte pas les notifications de bureau.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsAllowed(true);
        playNotificationSound();
        new Notification("Gladysa Signature Events", {
          body: "Notifications activées ! Vous serez alerté à chaque nouvelle demande de devis.",
          icon: "/icons/icon-192.png",
        });
      } else {
        alert("Les notifications n'ont pas été autorisées.");
      }
    } catch (e) {
      console.warn("Erreur permission notifications :", e);
    }
  };

  // Chargement des devis
  const fetchQuotes = useCallback(async (isPolling = false) => {
    if (!apiKey) return;
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/quotes`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de charger les demandes.");

      const fetchedQuotes = data.quotes || [];

      // Détection de nouvelle demande lors du polling
      if (isPolling && previousQuotesRef.current.length > 0) {
        const previousMaxId = Math.max(...previousQuotesRef.current.map((q) => q.id), 0);
        const newItems = fetchedQuotes.filter((q) => q.id > previousMaxId);

        if (newItems.length > 0) {
          const latest = newItems[0];
          playNotificationSound();

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Gladysa Signature Events", {
              body: `🔔 Nouvelle demande reçue de ${latest.name} (${latest.eventType})`,
              icon: "/icons/icon-192.png",
            });
          }

          setNewQuoteAlert(
            `🔔 ${newItems.length} nouvelle(s) demande(s) reçue(s) ! Dernier client : ${latest.name}`
          );
        }
      }

      previousQuotesRef.current = fetchedQuotes;
      setQuotes(fetchedQuotes);
      setGeneralError("");
    } catch (err) {
      if (!isPolling) {
        setGeneralError(err.message);
      }
    } finally {
      if (!isPolling) setIsLoadingQuotes(false);
    }
  }, [apiKey]);

  // Chargement des photos
  const fetchPhotos = useCallback(async () => {
    if (!apiKey) return;
    setIsLoadingPhotos(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/photos`);
      const data = await response.json();
      if (data.photos) setPhotos(data.photos);
    } catch (err) {
      console.warn("Erreur chargement photos :", err);
    } finally {
      setIsLoadingPhotos(false);
    }
  }, [apiKey]);

  // Chargement des annonces
  const fetchAnnouncements = useCallback(async () => {
    if (!apiKey) return;
    setIsLoadingAnnouncements(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/announcements`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await response.json();
      if (data.announcements) setAnnouncements(data.announcements);
    } catch (err) {
      console.warn("Erreur chargement annonces :", err);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }, [apiKey]);

  // Effet initial & Polling automatique toutes les 15 secondes pour les devis
  useEffect(() => {
    if (!apiKey) return;

    fetchQuotes(false);
    fetchPhotos();
    fetchAnnouncements();

    const interval = setInterval(() => {
      fetchQuotes(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [apiKey, fetchQuotes, fetchPhotos, fetchAnnouncements]);

  function handleLogin(event) {
    event.preventDefault();
    sessionStorage.setItem("gladysa-admin-key", keyInput);
    setApiKey(keyInput);
    setKeyInput("");
  }

  function handleLogout() {
    sessionStorage.removeItem("gladysa-admin-key");
    setApiKey("");
    setQuotes([]);
    setPhotos([]);
    setAnnouncements([]);
    setGeneralError("");
  }

  // Suppression d'un devis
  async function handleDeleteQuote(id, clientName) {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la demande de devis de "${clientName}" ?`)) {
      return;
    }
    setDeletingQuoteId(id);
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/quotes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Échec de la suppression.");
      }
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      previousQuotesRef.current = previousQuotesRef.current.filter((q) => q.id !== id);
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setDeletingQuoteId(null);
    }
  }

  // Sélection d'image pour upload avec compression automatique
  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoUploadError("Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setPhotoUploadError("La taille de l'image ne doit pas dépasser 20 Mo");
      return;
    }

    setPhotoUploadError("");
    setCompressedInfo("Compression de l'image en cours…");
    try {
      const compressed = await compressImageToDataUrl(file, 1920, 1920, 0.85);
      setPhotoImageBase64(compressed);
      setPhotoPreview(compressed);
      const sizeMb = ((compressed.length * 0.75) / 1024 / 1024).toFixed(2);
      setCompressedInfo(`✅ Image optimisée (≈${sizeMb} Mo)`);
    } catch (err) {
      setPhotoUploadError("Impossible de lire l'image : " + err.message);
      setCompressedInfo("");
    }
  }

  // Upload photo Cloudinary
  async function handleAddPhoto(e) {
    e.preventDefault();
    if (!photoImageBase64) {
      setPhotoUploadError("Veuillez choisir une image.");
      return;
    }
    if (!photoTitle.trim()) {
      setPhotoUploadError("Veuillez indiquer un titre.");
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoUploadError("");
    setPhotoUploadSuccess("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/photos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          title: photoTitle,
          category: photoCategory,
          caption: photoCaption,
          image: photoImageBase64,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Échec du téléversement sur Cloudinary");

      setPhotoUploadSuccess("Photo téléversée sur Cloudinary et publiée avec succès !");
      setPhotoTitle("");
      setPhotoCaption("");
      setPhotoImageBase64("");
      setPhotoPreview("");
      setCompressedInfo("");
      if (data.photo) {
        setPhotos((prev) => [data.photo, ...prev]);
      }
    } catch (err) {
      setPhotoUploadError(err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  // Suppression d'une photo de Cloudinary & DB
  async function handleDeletePhoto(id, title) {
    if (!window.confirm(`Supprimer la photo "${title}" ? Elle sera retirée de Cloudinary et du site.`)) {
      return;
    }
    setDeletingPhotoId(id);
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/photos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Échec de suppression");
      }
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setDeletingPhotoId(null);
    }
  }

  // Création d'une annonce
  async function handleCreateAnnouncement(e) {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      setAnnouncementError("Le titre et le contenu sont requis.");
      return;
    }

    setIsCreatingAnnouncement(true);
    setAnnouncementError("");
    setAnnouncementSuccess("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent,
          badge: announcementBadge,
          linkUrl: announcementLinkUrl,
          linkText: announcementLinkText,
          isActive: 1,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Échec de création de l'annonce");

      setAnnouncementSuccess("Annonce publiée avec succès !");
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementLinkUrl("");
      setAnnouncementLinkText("");
      if (data.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
      }
    } catch (err) {
      setAnnouncementError(err.message);
    } finally {
      setIsCreatingAnnouncement(false);
    }
  }

  // Basculer l'état actif/inactif d'une annonce
  async function handleToggleAnnouncement(id, currentStatus) {
    setTogglingAnnouncementId(id);
    const newStatus = currentStatus === 1 ? 0 : 1;
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!response.ok) throw new Error("Échec de modification");
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: newStatus } : a))
      );
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setTogglingAnnouncementId(null);
    }
  }

  // Suppression d'une annonce
  async function handleDeleteAnnouncement(id, title) {
    if (!window.confirm(`Supprimer l'annonce "${title}" ?`)) return;
    setDeletingAnnouncementId(id);
    try {
      const response = await fetch(`${apiBaseUrl}/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!response.ok) throw new Error("Échec de suppression");
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setDeletingAnnouncementId(null);
    }
  }

  // Formulaire de connexion si non connecté
  if (!apiKey) {
    return (
      <main className="admin-page content-page">
        <section className="admin-login">
          <p className="eyebrow">Espace privé Gladysa Signature</p>
          <h1>Administration & Gestion</h1>
          <p>Entrez la clé d’administration pour accéder aux devis, à la galerie et aux annonces.</p>
          <form onSubmit={handleLogin}>
            <label htmlFor="admin-key">Clé d’administration</label>
            <input
              id="admin-key"
              type="password"
              autoComplete="current-password"
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              placeholder="••••••••••••••••"
              required
            />
            <button className="quote-submit" type="submit">
              Accéder au tableau de bord
            </button>
          </form>
          {generalError && (
            <p className="quote-status error" role="alert">
              {generalError}
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page content-page" style={{ maxWidth: "1280px" }}>
      {/* Toast Alerte Nouvelle Demande */}
      {newQuoteAlert && (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: "80px",
            right: "24px",
            zIndex: 9999,
            background: "linear-gradient(135deg, #2a251b, #191712)",
            border: "2px solid var(--gold, #c5a059)",
            borderRadius: "12px",
            padding: "16px 20px",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <FaBell size={20} color="var(--gold, #c5a059)" />
          <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{newQuoteAlert}</span>
          <button
            type="button"
            onClick={() => setNewQuoteAlert(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#aaa",
              cursor: "pointer",
              marginLeft: "8px",
            }}
          >
            <FaXmark size={16} />
          </button>
        </div>
      )}

      {/* En-tête Espace Admin */}
      <header className="admin-heading" style={{ alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p className="eyebrow">Espace d'administration</p>
          <h1>Gladysa Signature Events</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>
            Gestion en temps réel des demandes clients, de la galerie photo Cloudinary et des annonces.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Bouton Notification */}
          <button
            type="button"
            onClick={requestNotificationPermission}
            title={
              notificationsAllowed
                ? "Notifications et alertes sonores actives"
                : "Cliquer pour activer les notifications de bureau"
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: `1px solid ${notificationsAllowed ? "rgba(76, 175, 80, 0.5)" : "var(--border)"}`,
              background: notificationsAllowed ? "rgba(76, 175, 80, 0.12)" : "rgba(255,255,255,0.05)",
              color: notificationsAllowed ? "#4caf50" : "var(--charcoal)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <FaBell />
            <span>{notificationsAllowed ? "Alertes actives" : "Activer alertes"}</span>
          </button>

          <button
            type="button"
            onClick={playNotificationSound}
            title="Tester le carillon sonore de notification"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--charcoal)",
              cursor: "pointer",
            }}
          >
            <FaVolumeHigh />
          </button>

          <button className="admin-logout" type="button" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      {/* Navigation par Onglets */}
      <nav
        aria-label="Navigation administration"
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border)",
          margin: "32px 0 28px",
          overflowX: "auto",
        }}
      >
        {[
          { key: "quotes", label: "Demandes de devis & Avis", icon: FaListCheck, count: quotes.length },
          { key: "photos", label: "Galerie Photos (Cloudinary)", icon: FaImages, count: photos.length },
          { key: "announcements", label: "Annonces & Actualités", icon: FaBullhorn, count: announcements.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                border: "none",
                background: "transparent",
                borderBottom: isActive ? "3px solid var(--gold)" : "3px solid transparent",
                color: isActive ? "var(--gold)" : "var(--text-muted)",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.95rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              <Icon />
              <span>{tab.label}</span>
              <span
                style={{
                  background: isActive ? "var(--gold)" : "rgba(0,0,0,0.08)",
                  color: isActive ? "#fff" : "var(--charcoal)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          ONGLET 1 : DEMANDES DE DEVIS & AVIS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "quotes" && (
        <section aria-labelledby="heading-quotes">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 id="heading-quotes" style={{ margin: 0, fontSize: "1.3rem", fontFamily: "var(--font-serif)" }}>
              Demandes reçues ({quotes.length})
            </h2>
            <small style={{ color: "var(--text-muted)" }}>
              Actualisation automatique toutes les 15s • Alerte sonore instantanée
            </small>
          </div>

          {isLoadingQuotes && <p role="status">Chargement des demandes…</p>}
          {generalError && (
            <p className="quote-status error" role="alert">
              {generalError}
            </p>
          )}

          {!isLoadingQuotes && quotes.length === 0 && !generalError && (
            <p className="admin-empty">Aucune demande reçue pour le moment.</p>
          )}

          {quotes.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Statut</th>
                    <th>Reçue le</th>
                    <th>Client</th>
                    <th>Événement</th>
                    <th>Date souhaitée</th>
                    <th>Invités</th>
                    <th>Message</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td>
                        <span className="status-badge received">Nouveau</span>
                      </td>
                      <td>{new Date(`${quote.createdAt}Z`).toLocaleString("fr-FR")}</td>
                      <td>
                        <strong>{quote.name}</strong>
                        <a href={`mailto:${quote.email}`}>{quote.email}</a>
                        {quote.phone && <a href={`tel:${quote.phone}`}>{quote.phone}</a>}
                      </td>
                      <td>{quote.eventType}</td>
                      <td>{quote.eventDate || "Non précisée"}</td>
                      <td>{quote.guestCount ?? "Non précisé"}</td>
                      <td>
                        <details>
                          <summary>Lire le détail</summary>
                          <p>{quote.message}</p>
                        </details>
                      </td>
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuote(quote.id, quote.name)}
                          disabled={deletingQuoteId === quote.id}
                          title="Supprimer la demande"
                          style={{
                            background: "rgba(224, 86, 86, 0.1)",
                            border: "1px solid rgba(224, 86, 86, 0.3)",
                            color: "#d32f2f",
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ONGLET 2 : GALERIE PHOTOS (CLOUDINARY)
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "photos" && (
        <section aria-labelledby="heading-photos">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px", marginBottom: "40px" }}>
            {/* Formulaire d'upload photo */}
            <div
              style={{
                background: "var(--bg-cream, #f8f6f0)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "28px",
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontFamily: "var(--font-serif)" }}>
                📸 Ajouter une photo à la galerie (Cloudinary)
              </h3>

              {photoUploadError && (
                <p className="quote-status error" style={{ marginBottom: "16px" }} role="alert">
                  {photoUploadError}
                </p>
              )}
              {photoUploadSuccess && (
                <p className="quote-status success" style={{ marginBottom: "16px" }}>
                  {photoUploadSuccess}
                </p>
              )}

              <form onSubmit={handleAddPhoto}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                      Titre de la réalisation *
                    </label>
                    <input
                      type="text"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      placeholder="Ex: Réception au Domaine des Lys"
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "#fff",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                      Catégorie d'événement *
                    </label>
                    <select
                      value={photoCategory}
                      onChange={(e) => setPhotoCategory(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "#fff",
                        fontSize: "0.9rem",
                      }}
                    >
                      <option value="mariages">Mariages</option>
                      <option value="prive">Événement Privé</option>
                      <option value="corporate">Corporate & Conférences</option>
                      <option value="gala">Gala & Réceptions</option>
                      <option value="decoration">Décoration & Scénographie</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                    Description ou légende (optionnel)
                  </label>
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="Ex: Scénographie florale personnalisée et lustres dorés"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "#fff",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                    Fichier image (JPG, PNG, WEBP — max 10 Mo) *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    required={!photoImageBase64}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px dashed var(--border)",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  />
                </div>

                {photoPreview && (
                  <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <img
                      src={photoPreview}
                      alt="Aperçu"
                      style={{
                        width: "120px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <div>
                      <small style={{ color: "var(--text-muted)" }}>Aperçu avant envoi vers Cloudinary</small>
                      {compressedInfo && (
                        <div style={{ fontSize: "12px", color: compressedInfo.startsWith("✅") ? "var(--gold)" : "var(--text-muted)", marginTop: "4px" }}>
                          {compressedInfo}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "24px" }}>
                  <button
                    type="submit"
                    disabled={isUploadingPhoto}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "8px",
                      background: "var(--gold)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      cursor: isUploadingPhoto ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.95rem",
                    }}
                  >
                    <FaCloudArrowUp />
                    <span>{isUploadingPhoto ? "Téléversement sur Cloudinary en cours…" : "Publier sur la galerie"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Liste des photos téléversées */}
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontFamily: "var(--font-serif)" }}>
                Photos enregistrées ({photos.length})
              </h3>

              {isLoadingPhotos && <p>Chargement des photos…</p>}

              {!isLoadingPhotos && photos.length === 0 && (
                <p className="admin-empty">Aucune photo personnalisée pour l'instant. Utilisez le formulaire ci-dessus pour en ajouter.</p>
              )}

              {photos.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {photos.map((photo) => (
                    <article
                      key={photo.id}
                      style={{
                        background: "#fff",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div style={{ position: "relative", height: "180px", background: "#f0f0f0" }}>
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            background: "rgba(0,0,0,0.75)",
                            color: "var(--gold)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {photo.categoryLabel || photo.category}
                        </span>
                      </div>

                      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <h4 style={{ margin: "0 0 6px", fontSize: "1rem" }}>{photo.title}</h4>
                          {photo.caption && (
                            <p style={{ margin: "0 0 12px", fontSize: "0.84rem", color: "var(--text-muted)" }}>
                              {photo.caption}
                            </p>
                          )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-light)" }}>
                          <a
                            href={photo.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "var(--gold-dark)",
                              fontSize: "0.82rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              textDecoration: "none",
                              fontWeight: 600,
                            }}
                          >
                            <FaEye size={12} /> Voir HD
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id, photo.title)}
                            disabled={deletingPhotoId === photo.id}
                            title="Supprimer la photo"
                            style={{
                              background: "rgba(224, 86, 86, 0.1)",
                              border: "1px solid rgba(224, 86, 86, 0.3)",
                              color: "#d32f2f",
                              padding: "6px 10px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <FaTrash size={12} /> Supprimer
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ONGLET 3 : ANNONCES & BANNIÈRE DU SITE
         ───────────────────────────────────────────────────────────── */}
      {activeTab === "announcements" && (
        <section aria-labelledby="heading-announcements">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
            {/* Formulaire de création d'annonce */}
            <div
              style={{
                background: "var(--bg-cream, #f8f6f0)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "28px",
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontFamily: "var(--font-serif)" }}>
                📢 Publier une nouvelle annonce
              </h3>

              {announcementError && (
                <p className="quote-status error" style={{ marginBottom: "16px" }} role="alert">
                  {announcementError}
                </p>
              )}
              {announcementSuccess && (
                <p className="quote-status success" style={{ marginBottom: "16px" }}>
                  {announcementSuccess}
                </p>
              )}

              <form onSubmit={handleCreateAnnouncement}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                      Titre de l'annonce *
                    </label>
                    <input
                      type="text"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder="Ex: Saison Mariages 2027 ouverte !"
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "#fff",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                      Badge / Type *
                    </label>
                    <select
                      value={announcementBadge}
                      onChange={(e) => setAnnouncementBadge(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "#fff",
                        fontSize: "0.9rem",
                      }}
                    >
                      <option value="Annonce">Annonce</option>
                      <option value="Important">Important</option>
                      <option value="Offre Spéciale">Offre Spéciale</option>
                      <option value="Nouveauté">Nouveauté</option>
                      <option value="Événement">Événement</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                    Message ou contenu de l'annonce *
                  </label>
                  <textarea
                    rows={3}
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    placeholder="Ex: Bénéficiez d'une réduction exclusive de 15% sur la scénographie pour toute réservation confirmée ce mois-ci."
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "#fff",
                      fontSize: "0.9rem",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                      Lien optionnel (ex: /contact ou /galerie)
                    </label>
                    <input
                      type="text"
                      value={announcementLinkUrl}
                      onChange={(e) => setAnnouncementLinkUrl(e.target.value)}
                      placeholder="/contact"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "#fff",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                      Texte du lien (ex: Réserver mon créneau)
                    </label>
                    <input
                      type="text"
                      value={announcementLinkText}
                      onChange={(e) => setAnnouncementLinkText(e.target.value)}
                      placeholder="Réserver mon créneau"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "#fff",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  <button
                    type="submit"
                    disabled={isCreatingAnnouncement}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "8px",
                      background: "var(--gold)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      cursor: isCreatingAnnouncement ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.95rem",
                    }}
                  >
                    <FaBullhorn />
                    <span>{isCreatingAnnouncement ? "Publication en cours…" : "Diffuser l'annonce"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Liste des annonces existantes */}
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontFamily: "var(--font-serif)" }}>
                Annonces créées ({announcements.length})
              </h3>

              {isLoadingAnnouncements && <p>Chargement des annonces…</p>}

              {!isLoadingAnnouncements && announcements.length === 0 && (
                <p className="admin-empty">Aucune annonce enregistrée pour l'instant.</p>
              )}

              {announcements.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {announcements.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "#fff",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "18px 22px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "14px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: "260px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span
                            style={{
                              background: "var(--gold)",
                              color: "#fff",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {item.badge}
                          </span>
                          <strong style={{ fontSize: "1rem" }}>{item.title}</strong>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: item.isActive ? "#2e7d32" : "#757575",
                              background: item.isActive ? "#e8f5e9" : "#eeeeee",
                              padding: "2px 8px",
                              borderRadius: "10px",
                            }}
                          >
                            {item.isActive ? "En ligne" : "Masquée"}
                          </span>
                        </div>
                        <p style={{ margin: "0 0 4px", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                          {item.content}
                        </p>
                        {item.linkUrl && (
                          <small style={{ color: "var(--gold-dark)" }}>
                            Lien : {item.linkText || item.linkUrl} ({item.linkUrl})
                          </small>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleAnnouncement(item.id, item.isActive)}
                          disabled={togglingAnnouncementId === item.id}
                          title={item.isActive ? "Désactiver l'annonce" : "Activer l'annonce"}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: item.isActive ? "#2e7d32" : "#757575",
                            cursor: "pointer",
                            fontSize: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {item.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(item.id, item.title)}
                          disabled={deletingAnnouncementId === item.id}
                          title="Supprimer l'annonce"
                          style={{
                            background: "rgba(224, 86, 86, 0.1)",
                            border: "1px solid rgba(224, 86, 86, 0.3)",
                            color: "#d32f2f",
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default Dashboard;
