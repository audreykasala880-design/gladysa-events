import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaRing, FaBriefcase, FaMusic, FaCamera, FaPalette, FaTicket,
} from "react-icons/fa6";
import "../styles/services.css";

/* ── Données ─────────────────────────────────────────────── */
const SERVICES = [
  {
    icon: <FaRing />,
    title: "Événements privés",
    desc: "Mariages, anniversaires, fêtes familiales et célébrations spéciales.",
  },
  {
    icon: <FaBriefcase />,
    title: "Événements professionnels",
    desc: "Conférences, séminaires, forums et lancements de produits.",
  },
  {
    icon: <FaMusic />,
    title: "Événements culturels",
    desc: "Rencontres culturelles, spectacles et activités communautaires.",
  },
  {
    icon: <FaCamera />,
    title: "Photo & vidéo",
    desc: "Captation vidéo professionnelle et photographie événementielle.",
  },
  {
    icon: <FaPalette />,
    title: "Décoration",
    desc: "Décoration élégante et personnalisée selon votre thème.",
  },
  {
    icon: <FaTicket />,
    title: "Billetterie & accueil",
    desc: "Gestion des inscriptions, réservations et billets en ligne.",
  },
];

const STATS = [
  { number: "01", label: "Écouter votre idée" },
  { number: "02", label: "Construire le projet" },
  { number: "03", label: "Coordonner le jour J" },
];

/* ── Hook animation au scroll ────────────────────────────── */
function useRevealOnScroll(selector) {
  useEffect(() => {
    const items = document.querySelectorAll(selector);
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);
}

/* ── Composant ───────────────────────────────────────────── */
function Home() {
  useRevealOnScroll(".reveal");

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="hero" aria-label="Présentation">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-overlay">
          <p className="hero-eyebrow">Organisation événementielle</p>
          <h1>Gladysa Signature Events</h1>
          <p className="hero-sub">
            Vos idées prennent vie. Chaque détail compte.
          </p>
          <div className="hero-buttons">
            <Link className="btn-gold" to="/contact">Demander un devis</Link>
            <Link className="btn-outline" to="/evenements">Voir nos événements</Link>
          </div>
        </div>
        <div className="hero-scroll-hint" aria-hidden="true">
          <span>Découvrir</span>
          <div className="hero-scroll-arrow" />
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────── */}
      <section className="services-section" aria-labelledby="services-title">
        <div className="section-header reveal">
          <p className="eyebrow">Ce que nous faisons</p>
          <h2 id="services-title" className="section-title">Nos Services</h2>
          <div className="gold-divider" />
          <p>Nous créons des événements mémorables adaptés à vos besoins.</p>
        </div>

        <div className="services-grid">
          {SERVICES.map((service, i) => (
            <article
              key={service.title}
              className={`service-card reveal reveal-delay-${(i % 3) + 1}`}
            >
              <div className="service-card-icon" aria-hidden="true">
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── STATS / ÉTAPES ────────────────────────────────── */}
      <section className="stats-section" aria-label="Notre accompagnement en 3 étapes">
        {STATS.map((stat, i) => (
          <div key={stat.number} className={`stat-card reveal reveal-delay-${i + 1}`}>
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ── À PROPOS (APERÇU) ─────────────────────────────── */}
      <section className="about-home-section" aria-labelledby="about-home-title">
        <div className="about-home-grid">
          <div className="about-home-image reveal">
            <img
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"
              alt="Équipe Gladysa Signature Events en action lors d'un événement"
              loading="lazy"
            />
            <div className="about-home-badge">
              <strong>+3</strong>
              années<br />d'expérience
            </div>
          </div>

          <div className="about-home-content reveal">
            <p className="eyebrow">À propos de nous</p>
            <h2 id="about-home-title" className="section-title">
              Une passion, des événements inoubliables.
            </h2>
            <div className="gold-divider" style={{ margin: "20px 0" }} />
            <p>
              Gladysa Signature Events accompagne les particuliers, entreprises,
              associations et organisations dans la conception et la réalisation
              d'événements mémorables.
            </p>
            <p>
              Notre mission est de transformer chaque idée en une expérience
              unique grâce à notre créativité, notre professionnalisme et notre
              souci du détail.
            </p>
            <Link className="btn-dark" to="/apropos" style={{ marginTop: "28px" }}>
              Découvrir l'agence
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;