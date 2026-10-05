import { Link } from "react-router-dom";
import "../styles/pages.css";

const timelineEvents = [
    {
        year: "2020",
        title: "Fondation de l'Agence",
        description: "Création de Gladysa Signature Events avec la volonté d'offrir un service événementiel haut de gamme et ultra-personnalisé."
    },
    {
        year: "2022",
        title: "Expansion Corporate & Galas",
        description: "Organisation de premiers sommets d'entreprises et événements de gala majeurs réunissant plus de 300 personnes."
    },
    {
        year: "2024",
        title: "Pôle Scénographie Florale",
        description: "Intégration d'un studio d'art floral interne pour créer des décors immersifs et sur mesure."
    },
    {
        year: "2026",
        title: "Excellence & Signature",
        description: "Plus de 150 événements réussis et une réputation fondée sur le soin du détail, l'élégance et la sérénité."
    }
];

function About() {
    return (
        <main className="content-page">
            <header className="page-heading">
                <p className="eyebrow">Notre Maison</p>
                <h1>Chaque célébration est une œuvre d'art unique.</h1>
                <p>
                    Gladysa Signature Events accompagne les particuliers exigeants, les institutions
                    et les entreprises dans la création de réceptions d'exception.
                </p>
            </header>

            <section className="about-grid">
                <div className="about-story">
                    <h2>Une d'organisation d'exception, guidée par la passion du détail.</h2>
                    <p>
                        Nous pensons que la vraie sérénité réside dans l'anticipation. Nous prenons le temps
                        d'étudier chaque facette de votre projet pour créer un événement sur mesure qui reflète
                        parfaitement vos aspirations.
                    </p>
                    <p style={{ marginTop: "14px" }}>
                        De la scénographie lumineuse à la sélection des partenaires d'excellence, chaque élément
                        est choisi avec prévenance pour offrir à vos invités une expérience sensorielle inoubliable.
                    </p>
                </div>
                <div className="about-values">
                    <article>
                        <h3>Écoute</h3>
                        <p>Chaque projet s'articule autour de vos désirs et de l'histoire que vous souhaitez raconter.</p>
                    </article>
                    <article>
                        <h3>Raffinement</h3>
                        <p>Scénographies élégantes, harmonie des teintes et attention méticuleuse aux détails.</p>
                    </article>
                    <article>
                        <h3>Sérénité</h3>
                        <p>Une prise en charge globale pour vous permettre de vivre pleinement l'instant présent.</p>
                    </article>
                </div>
            </section>

            <section className="about-timeline">
                <h2>Notre Parcours</h2>
                <ul className="timeline-list">
                    {timelineEvents.map((item) => (
                        <li key={item.year} className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <span className="timeline-year">{item.year}</span>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="page-cta">
                <div>
                    <h2>Prêt à donner vie à votre événement ?</h2>
                    <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                        Échangeons sur vos idées autour d'un premier rendez-vous conseil.
                    </p>
                </div>
                <Link className="text-button" to="/contact">Prendre rendez-vous</Link>
            </section>
        </main>
    );
}

export default About;