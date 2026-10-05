
import { Link } from "react-router-dom";
import { FaRing, FaBriefcase, FaMusic, FaCamera, FaPalette, FaTicket } from "react-icons/fa6";
import "../styles/pages.css";
import "../styles/services.css";

function Services() {
  const services = [
    {
      icon: <FaRing />,
      title: "Mariages & Célébrations",
      description: "Organisation sur mesure, scénographie raffinée et coordination le jour J pour un mariage inoubliable."
    },
    {
      icon: <FaBriefcase />,
      title: "Anniversaires Prestige",
      description: "Célébrations thématiques et réceptions personnalisées pour créer des souvenirs impérissables."
    },
    {
      icon: <FaCamera />,
      title: "Conférences & Sommets",
      description: "Gestion logistique et technique intégrée pour vos conventions et réunions d'affaires de haut niveau."
    },
    {
      icon: <FaTicket />,
      title: "Galas & Séminaires",
      description: "Soirées de gala, remises de prix et séminaires d'entreprise orchestrés avec distinction."
    },
    {
      icon: <FaMusic />,
      title: "Célébrations Culturelles",
      description: "Rassemblements traditionnels, concerts et cérémonies organisés dans la sérénité et le respect du protocole."
    },
    {
      icon: <FaPalette />,
      title: "Scénographie & Art Floral",
      description: "Conception visuelle, choix du mobilier et créations florales uniques pour sublimer chaque espace."
    }
  ];

  return (
    <main className="services-page content-page">
      <header className="page-heading">
        <p className="eyebrow">Nos Prestations</p>
        <h1>Une équipe d'experts à vos côtés.</h1>
        <p>
          De la première esquisse à l'extinction des feux, Gladysa Signature Events met son savoir-faire
          et son réseau de partenaires d'exception au service de vos événements.
        </p>
      </header>

      <div className="services-grid">
        {services.map((service) => (
          <article className="service-card" key={service.title}>
            <div className="service-card-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>

      <div className="page-cta">
        <div>
          <h2>Un projet d'événement à nous confier ?</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Recevez un devis estimatif gratuit et sans engagement sous 48h.
          </p>
        </div>
        <Link className="text-button" to="/contact">Demander un devis</Link>
      </div>
    </main>
  );
}

export default Services;