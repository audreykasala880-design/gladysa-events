import nodemailer from "nodemailer";

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendQuoteNotification(quote) {
  const transporter = createTransport();
  const recipient = process.env.ADMIN_EMAIL;
  if (!transporter || !recipient) return;

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const details = [
    `Nom : ${quote.name}`,
    `Email : ${quote.email}`,
    `Téléphone : ${quote.phone || "Non renseigné"}`,
    `Événement : ${quote.eventType}`,
    `Date : ${quote.eventDate || "Non précisée"}`,
    `Invités : ${quote.guestCount ?? "Non précisé"}`,
    "",
    quote.message,
  ].join("\n");

  await Promise.all([
    transporter.sendMail({
      from,
      to: recipient,
      replyTo: quote.email,
      subject: `Nouvelle demande de devis : ${quote.eventType}`,
      text: details,
    }),
    transporter.sendMail({
      from,
      to: quote.email,
      subject: "Nous avons bien reçu votre demande",
      text: `Bonjour ${quote.name},\n\nMerci d’avoir contacté Gladysa Signature Events. Nous avons bien reçu votre demande concernant : ${quote.eventType}. Notre équipe reviendra vers vous prochainement.\n\nÀ bientôt,\nGladysa Signature Events`,
    }),
  ]);
}