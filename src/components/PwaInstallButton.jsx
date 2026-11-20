import { useState, useEffect } from "react";
import { FaDownload, FaXmark, FaArrowUpFromBracket } from "react-icons/fa6";

function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem("pwa-prompt-dismissed") === "true";
  });

  useEffect(() => {
    // Vérifier si l'application fonctionne déjà en mode standalone (installée)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else if (isIos()) {
      setShowIosGuide(true);
    } else {
      // Navigateurs modernes desktop : informer sur l'icône dans la barre d'adresse
      alert(
        "Pour télécharger l'application : cliquez sur l'icône d'installation (écran ou flèche) dans la barre d'adresse de votre navigateur !"
      );
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      <aside
        className="pwa-install-banner"
        role="complementary"
        aria-label="Installation de l'application"
        style={{
          position: "fixed",
          bottom: "90px",
          left: "24px",
          zIndex: 998,
          background: "linear-gradient(135deg, rgba(28,28,25,0.96), rgba(18,18,16,0.98))",
          border: "1px solid rgba(197, 160, 89, 0.45)",
          borderRadius: "14px",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.5), 0 0 20px rgba(197, 160, 89, 0.15)",
          backdropFilter: "blur(10px)",
          maxWidth: "360px",
          animation: "fadeInUp 0.4s ease",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #f5e0a0, #c5a059)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#141412",
            flexShrink: 0,
            fontSize: "1.1rem",
            fontWeight: "bold",
          }}
        >
          G
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#fff" }}>
            Gladysa Events
          </p>
          <p style={{ margin: 0, fontSize: "0.76rem", color: "rgba(255,255,255,0.7)" }}>
            Téléchargez l'application sur votre appareil
          </p>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          style={{
            background: "var(--gold, #c5a059)",
            color: "#141412",
            border: "none",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <FaDownload size={12} />
          <span>Installer</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer"
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.45)",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            fontSize: "0.9rem",
          }}
        >
          <FaXmark />
        </button>
      </aside>

      {/* Guide pour iPhone / iPad Safari */}
      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setShowIosGuide(false)}
        >
          <div
            style={{
              background: "#1e1e1b",
              border: "1px solid rgba(197, 160, 89, 0.4)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "380px",
              width: "100%",
              color: "#fff",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--gold, #c5a059)" }}>
                Installer sur iPhone / iPad
              </h3>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer" }}
              >
                <FaXmark size={18} />
              </button>
            </div>
            <ol style={{ paddingLeft: "20px", marginTop: "16px", fontSize: "0.9rem", lineHeight: "1.7" }}>
              <li>
                Appuyez sur le bouton <strong>Partager</strong>{" "}
                <FaArrowUpFromBracket style={{ verticalAlign: "middle" }} /> dans la barre de Safari.
              </li>
              <li>Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong> ⊕.</li>
              <li>Appuyez sur <strong>Ajouter</strong> en haut à droite.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "10px",
                borderRadius: "8px",
                background: "var(--gold, #c5a059)",
                border: "none",
                color: "#141412",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PwaInstallButton;
