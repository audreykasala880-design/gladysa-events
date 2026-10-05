import { useState } from "react";
import { FaPhone, FaEnvelope, FaLocationDot, FaWhatsapp } from "react-icons/fa6";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function Contact() {
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        setIsSubmitting(true);
        setStatus({ type: "", message: "" });

        const formData = new FormData(form);
        const request = Object.fromEntries(formData.entries());
        request.guestCount = request.guestCount ? Number(request.guestCount) : null;

        try {
            const response = await fetch(`${apiBaseUrl}/api/quotes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error("Request failed");
            }

            form.reset();
            setStatus({
                type: "success",
                message: "Votre demande a bien été envoyée. Merci de nous avoir contactés !",
            });
        } catch {
            setStatus({
                type: "error",
                message:
                    "L’envoi est momentanément indisponible. Vous pouvez nous joindre directement sur WhatsApp.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="contact-page">
            <section className="contact-intro">
                <p className="eyebrow">Parlons de votre événement</p>
                <h1>Une belle idée mérite une organisation à sa hauteur.</h1>
                <p>
                    Décrivez-nous votre projet. Nous reviendrons vers vous sous 48h pour échanger
                    sur vos envies et vous transmettre une proposition sur mesure.
                </p>

                <div className="contact-details">
                    <div className="contact-detail-item">
                        <FaPhone />
                        <span>+243 829 342 781</span>
                    </div>
                    <div className="contact-detail-item">
                        <FaEnvelope />
                        <span>contact@gladysa-events.fr</span>
                    </div>
                    <div className="contact-detail-item">
                        <FaLocationDot />
                        <span>Kinshasa — République Démocratique du Congo</span>
                    </div>
                    <a
                        href="https://wa.me/243829342781?text=Bonjour%20Gladysa%20Signature%20Events,%20je%20souhaite%20des%20informations"
                        target="_blank"
                        rel="noreferrer"
                        className="contact-detail-item"
                        style={{ color: "var(--gold-dark)", fontWeight: 600, textDecoration: "none", marginTop: "8px" }}
                    >
                        <FaWhatsapp style={{ color: "#25D366", fontSize: "1.1rem" }} />
                        <span>Contact direct sur WhatsApp</span>
                    </a>
                </div>
            </section>

            <form className="quote-form" onSubmit={handleSubmit}>
                <h2>Demander un devis</h2>
                <div className="quote-form-grid">
                    <label>
                        Nom complet *
                        <input name="name" autoComplete="name" required placeholder="ex: Jean Dupont" />
                    </label>
                    <label>
                        Adresse email *
                        <input name="email" type="email" autoComplete="email" required placeholder="ex: jean@exemple.fr" />
                    </label>
                    <label>
                        Téléphone
                        <input name="phone" type="tel" autoComplete="tel" placeholder="ex: 06 12 34 56 78" />
                    </label>
                    <label>
                        Type d’événement *
                        <select name="eventType" defaultValue="" required>
                            <option value="" disabled>Sélectionner</option>
                            <option>Mariage</option>
                            <option>Anniversaire Prestige</option>
                            <option>Conférence / Sommet</option>
                            <option>Gala d'Entreprise</option>
                            <option>Événement Culturel</option>
                            <option>Autre</option>
                        </select>
                    </label>
                    <label>
                        Date souhaitée
                        <input name="eventDate" type="date" />
                    </label>
                    <label>
                        Nombre d’invités estimé
                        <input name="guestCount" type="number" min="1" inputMode="numeric" placeholder="ex: 150" />
                    </label>
                    <label className="quote-form-wide">
                        Parlez-nous de votre projet *
                        <textarea name="message" rows="5" required placeholder="Lieu envisagé, thème, ambiance souhaitée, prestations recherchées..." />
                    </label>
                    <label className="quote-consent quote-form-wide">
                        <input name="privacyConsent" type="checkbox" value="true" required />
                        <span>J’accepte que mes informations soient utilisées pour traiter cette demande d'information.</span>
                    </label>
                </div>
                <button className="quote-submit" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Envoi en cours…" : "Envoyer ma demande"}
                </button>
                {status.message && (
                    <p className={`quote-status ${status.type}`} role="status">
                        {status.message}
                    </p>
                )}
            </form>
        </main>
    );
}

export default Contact;