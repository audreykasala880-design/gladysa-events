import { useState } from "react";
import { Link } from "react-router-dom";
import { FaExpand, FaXmark } from "react-icons/fa6";
import "../styles/pages.css";

import imgWedding from "../assets/gallery-wedding.png";
import imgAnniversary from "../assets/gallery-anniversary.png";
import imgConference from "../assets/gallery-conference.png";
import imgCultural from "../assets/gallery-cultural.png";
import imgDecoration from "../assets/gallery-decoration.png";

const galleryItems = [
    {
        id: 1,
        title: "Mariage d'Exception au Château",
        category: "mariages",
        categoryLabel: "Mariage",
        src: imgWedding,
        caption: "Réception féerique sous les lustres en cristal du domaine"
    },
    {
        id: 2,
        title: "Anniversaire d'Or & Égérie",
        category: "prive",
        categoryLabel: "Événement Privé",
        src: imgAnniversary,
        caption: "Décoration thématique or et champagne pour 120 convives"
    },
    {
        id: 3,
        title: "Sommet Leadership & Innovation",
        category: "corporate",
        categoryLabel: "Corporate",
        src: imgConference,
        caption: "Scénographie scénique et cocktail networking haute gamme"
    },
    {
        id: 4,
        title: "Gala de Charité Prestige",
        category: "gala",
        categoryLabel: "Gala",
        src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&q=80",
        caption: "Soirée de gala caritative dans la grande salle des fêtes"
    },
    {
        id: 5,
        title: "Célébration Culturelle sur Mesure",
        category: "prive",
        categoryLabel: "Culturel",
        src: imgCultural,
        caption: "Mariage traditionnel réinventé avec une touche contemporaine"
    },
    {
        id: 6,
        title: "Scénographie Florale & Art de la Table",
        category: "decoration",
        categoryLabel: "Décoration",
        src: imgDecoration,
        caption: "Composition florale personnalisée et arts de la table dorés"
    }
];

function Gallery() {
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedImg, setSelectedImg] = useState(null);

    const filteredItems = activeFilter === "all"
        ? galleryItems
        : galleryItems.filter(item => item.category === activeFilter);

    return (
        <main className="content-page">
            <header className="page-heading">
                <p className="eyebrow">Galerie & Réalisations</p>
                <h1>L'art de créer des moments inoubliables.</h1>
                <p>
                    Découvrez une sélection de nos plus belles scénographies et réceptions
                    conçues sur mesure pour nos clients.
                </p>
            </header>

            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
                {[
                    { key: "all", label: "Tous" },
                    { key: "mariages", label: "Mariages" },
                    { key: "prive", label: "Privé" },
                    { key: "corporate", label: "Corporate" },
                    { key: "gala", label: "Galas" },
                    { key: "decoration", label: "Décoration" }
                ].map(filter => (
                    <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        style={{
                            padding: "8px 20px",
                            borderRadius: "30px",
                            border: "1px solid " + (activeFilter === filter.key ? "var(--gold)" : "var(--border)"),
                            background: activeFilter === filter.key ? "var(--gold)" : "transparent",
                            color: activeFilter === filter.key ? "#fff" : "var(--charcoal)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.25s ease"
                        }}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <section className="gallery-grid" aria-label="Galerie photos">
                {filteredItems.map(item => (
                    <div
                        key={item.id}
                        className="gallery-item"
                        onClick={() => setSelectedImg(item)}
                    >
                        <img src={item.src} alt={item.title} loading="lazy" />
                        <div className="gallery-item-overlay">
                            <FaExpand />
                        </div>
                    </div>
                ))}
            </section>

            {selectedImg && (
                <div className="lightbox" onClick={() => setSelectedImg(null)}>
                    <button
                        className="lightbox-close"
                        onClick={(e) => { e.stopPropagation(); setSelectedImg(null); }}
                        aria-label="Fermer"
                    >
                        <FaXmark />
                    </button>
                    <img src={selectedImg.src} alt={selectedImg.title} onClick={(e) => e.stopPropagation()} />
                    <div className="lightbox-caption">
                        <strong>{selectedImg.title}</strong> — {selectedImg.caption}
                    </div>
                </div>
            )}

            <div className="gallery-cta">
                <div className="page-cta">
                    <div>
                        <h2>Envie de créer un événement à votre image ?</h2>
                        <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                            Contactez notre équipe pour une étude personnalisée.
                        </p>
                    </div>
                    <Link className="text-button" to="/contact">Discuter de mon projet</Link>
                </div>
            </div>
        </main>
    );
}

export default Gallery;