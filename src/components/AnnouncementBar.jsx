import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBullhorn, FaXmark, FaArrowRight } from "react-icons/fa6";
import { getApiBaseUrl } from "../utils/api";

const apiBaseUrl = getApiBaseUrl();

function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("dismissed-announcements") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    fetch(`${apiBaseUrl}/api/announcements`)
      .then((res) => (res.ok ? res.json() : { announcements: [] }))
      .then((data) => {
        if (isMounted && data.announcements) {
          setAnnouncements(data.announcements);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedIds.includes(a.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  const current = visibleAnnouncements[0];

  const handleDismiss = (id) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      sessionStorage.setItem("dismissed-announcements", JSON.stringify(updated));
    } catch {}
  };

  return (
    <div
      role="banner"
      aria-label="Annonce du site"
      style={{
        width: "100%",
        maxWidth: "1060px",
        margin: "0 auto",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1b1915 0%, #28241b 50%, #171512 100%)",
          border: "1px solid rgba(197, 160, 89, 0.45)",
          borderRadius: "14px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35), 0 0 16px rgba(197, 160, 89, 0.15)",
          color: "#f5f3ef",
          padding: "14px 22px",
          fontSize: "0.92rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          position: "relative",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            textAlign: "center",
            paddingRight: "24px",
          }}
        >
          <span
            style={{
              background: "var(--gold, #c5a059)",
              color: "#141412",
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "0.74rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FaBullhorn size={11} />
            {current.badge || "Annonce"}
          </span>

          <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>
            {current.title}
          </span>
          <span style={{ color: "rgba(255, 255, 255, 0.82)" }}>
            — {current.content}
          </span>

          {current.linkUrl && (
            <Link
              to={current.linkUrl}
              style={{
                color: "var(--gold, #c5a059)",
                fontWeight: 700,
                textDecoration: "underline",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                marginLeft: "6px",
              }}
            >
              {current.linkText || "En savoir plus"} <FaArrowRight size={10} />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleDismiss(current.id)}
          aria-label="Fermer l'annonce"
          title="Fermer"
          style={{
            position: "absolute",
            right: "12px",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "50%",
            color: "rgba(255, 255, 255, 0.75)",
            cursor: "pointer",
            width: "26px",
            height: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease",
          }}
        >
          <FaXmark size={12} />
        </button>
      </div>
    </div>
  );
}

export default AnnouncementBar;
