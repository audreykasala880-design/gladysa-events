import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaXmark } from "react-icons/fa6";
import logo from "../assets/logo.jpeg";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  // Effet glassmorphism activé après 40px de scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu mobile si la fenêtre est agrandie
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 760) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = [
    ["Accueil", "/"],
    ["À propos", "/apropos"],
    ["Services", "/services"],
    ["Événements", "/evenements"],
    ["Galerie", "/galerie"],
    ["Contact", "/contact"],
    ["Dashboard", "/admin"],
  ];

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}${menuOpen ? " menu-open" : ""}`}>
      <Link
        className="brand"
        to="/"
        aria-label="Gladysa Signature Events, accueil"
        onClick={closeMenu}
      >
        <img src={logo} alt="Gladysa Signature Events" className="logo" />
      </Link>

      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {menuOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
      </button>

      <div className="nav-content" id="primary-navigation">
        <ul className="nav-links">
          {navLinks.map(([label, path]) => (
            <li key={path}>
              <NavLink to={path} end={path === "/"} onClick={closeMenu}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Link className="nav-cta" to="/contact" onClick={closeMenu}>
          Demander un devis
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;