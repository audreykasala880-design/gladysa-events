import { Link } from "react-router-dom";
import { FaPhone, FaEnvelope, FaLocationDot } from "react-icons/fa6";
import { FaWhatsapp, FaFacebookF, FaInstagram } from "react-icons/fa";

const navLinks = [
  ["Services", "/services"],
  ["Événements", "/evenements"],
  ["Galerie", "/galerie"],
  ["À propos", "/apropos"],
  ["Contact", "/contact"],
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Colonne marque */}
        <div className="footer-brand-col">
          <Link className="footer-brand" to="/">
            Gladysa
            <span>Signature Events</span>
          </Link>
          <p className="footer-tagline">
            Des événements imaginés avec soin, du premier échange au jour J.
            Chaque moment est une histoire unique.
          </p>
        </div>

        {/* Colonne navigation */}
        <div>
          <p className="footer-col-title">Navigation</p>
          <nav className="footer-links" aria-label="Navigation de pied de page">
            {navLinks.map(([label, path]) => (
              <Link key={path} to={path}>{label}</Link>
            ))}
          </nav>
        </div>

        {/* Colonne contact */}
        <div>
          <p className="footer-col-title">Contact</p>
          <div className="footer-contact-item">
            <FaPhone size={14} />
            <span>+243 829 342 781</span>
          </div>
          <div className="footer-contact-item">
            <FaEnvelope size={14} />
            <span>contact@gladysa-events.com</span>
          </div>
          <div className="footer-contact-item">
            <FaLocationDot size={14} />
            <span>RD CONGO</span>
          </div>

          <div className="footer-social" style={{ display: "flex", gap: "12px", marginTop: "18px" }}>
            {[
              { Icon: FaFacebookF, label: "Facebook", href: "#" },
              { Icon: FaInstagram, label: "Instagram", href: "#" },
              {
                Icon: FaWhatsapp,
                label: "WhatsApp",
                href: "https://wa.me/243829342781?text=" + encodeURIComponent("Bonjour Gladysa Signature Events, je souhaite obtenir des informations sur vos services."),
              },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                style={{
                  display: "inline-flex",
                  width: "36px",
                  height: "36px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  color: "#c5c1b8",
                  fontSize: "15px",
                  transition: "background 0.25s, color 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--gold)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#c5c1b8";
                }}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} Gladysa Signature Events. Tous droits réservés.</small>
        <div className="footer-bottom-links">
          <Link to="/contact">Mentions légales</Link>
          <Link to="/contact">Politique de confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;