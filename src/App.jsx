import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Quote from "./pages/Quote";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apropos" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/evenements" element={<Events />} />
          <Route path="/galerie" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/devis" element={<Quote />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/connexion" element={<Login />} />
          <Route
            path="*"
            element={(
              <main className="not-found content-page">
                <p className="eyebrow">Erreur 404</p>
                <h1>Cette page n’existe pas.</h1>
                <Link className="text-button" to="/">Retour à l’accueil</Link>
              </main>
            )}
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;