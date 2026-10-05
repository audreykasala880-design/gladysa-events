import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import "../styles/pages.css";

import imgWedding from "../assets/gallery-wedding.png";
import imgConference from "../assets/gallery-conference.png";
import imgCultural from "../assets/gallery-cultural.png";

const eventTypes = [
    {
        title: "Célébrations Privées & Mariages",
        description: "Mariages d'exception, anniversaires prestigieux et réceptions privées orchestrés avec une précision absolue.",
        img: imgWedding
    },
    {
        title: "Événements Corporate & Séminaires",
        description: "Conférences, galas d'entreprise et lancements de produits conçus pour marquer les esprits de vos collaborateurs.",
        img: imgConference
    },
    {
        title: "Rendez-vous Culturels & Communautaires",
        description: "Festivals, rencontres culturelles et célébrations traditionnelles organisés dans le respect des coutumes et du public.",
        img: imgCultural
    },
];

function Events() {
    return (
        <main className="content-page">
            <header className="page-heading">
                <p className="eyebrow">Nos Expertises</p>
                <h1>Un moment d'exception, pensé dans le moindre détail.</h1>
                <p>
                    De la conception scénographique à la coordination le jour J, nous transformons
                    vos idées en une expérience mémorable.
                </p>
            </header>
            <section className="event-grid" aria-label="Types d’événements accompagnés">
                {eventTypes.map((event, index) => (
                    <article className="event-card" key={event.title}>
                        <img className="event-card-img" src={event.img} alt={event.title} loading="lazy" />
                        <div className="event-card-overlay">
                            <span className="event-index">{String(index + 1).padStart(2, "0")}</span>
                            <h2>{event.title}</h2>
                            <p>{event.description}</p>
                            <Link to="/contact">
                                Imaginer ce projet <FaArrowRight style={{ fontSize: "0.8rem" }} />
                            </Link>
                        </div>
                    </article>
                ))}
            </section>
            <section className="page-cta">
                <div>
                    <h2>Vous avez une date en tête ?</h2>
                    <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                        Contactez Gladysa Signature Events pour réserver votre date.
                    </p>
                </div>
                <Link className="text-button" to="/contact">Décrire mon projet</Link>
            </section>
        </main>
    );
}

export default Events;