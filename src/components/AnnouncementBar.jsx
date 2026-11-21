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
        background: "linear-gradient(90deg, #181815 0%, #29261f 50%, #181815 100%)",
        borderBottom: "1px solid rgba(197, 160, 89, 0.35)",
        color: "#f5f3ef",
        padding: "8px 16px",
        fontSize: "0.86rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        position: "relative",
        zIndex: 999,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <span
          style={{
            background: "var(--gold, #c5a059)",
            color: "#141412",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.72rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <FaBullhorn size={10} />
          {current.badge || "Annonce"}
        </span>

        <span style={{ fontWeight: 600, color: "#fff" }}>{current.title}</span>
        <span style={{ color: "rgba(255,255,255,0.75)" }}>— {current.content}</span>

        {current.linkUrl && (
          <Link
            to={current.linkUrl}
            style={{
              color: "var(--gold, #c5a059)",
              fontWeight: 700,
              textDecoration: "underline",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              marginLeft: "4px",
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
        style={{
          position: "absolute",
          right: "12px",
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.6)",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <FaXmark size={14} />
      </button>
    </div>
  );
}

export default AnnouncementBar;
