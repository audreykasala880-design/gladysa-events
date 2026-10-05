import { FaWhatsapp } from "react-icons/fa";

const DEFAULT_WHATSAPP = "243829342781";
const whatsappNumber =
	import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, "") || DEFAULT_WHATSAPP;
const message = encodeURIComponent(
	"Bonjour Gladysa Signature Events, je souhaite obtenir des informations sur vos services."
);
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

function WhatsAppButton() {
	return (
		<a
			className="whatsapp-float"
			href={whatsappUrl}
			target="_blank"
			rel="noreferrer"
			aria-label="Contacter Gladysa Signature Events sur WhatsApp"
			title="Nous contacter sur WhatsApp"
		>
			<FaWhatsapp aria-hidden="true" />
		</a>
	);
}

export default WhatsAppButton;
