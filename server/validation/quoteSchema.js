import { z } from "zod";

/**
 * Transforme une chaîne vide en null.
 * Utilisé pour rendre optionnels les champs qui arrivent vides depuis le formulaire.
 */
const emptyToNull = (value) => (value === "" || value === undefined ? null : value);

/**
 * Schéma de validation Zod pour une demande de devis.
 */
export const quoteSchema = z
  .object({
    name: z.string().trim().min(2, "Le nom doit comporter au moins 2 caractères").max(100),
    email: z.string().trim().email("Adresse email invalide").max(254),
    phone: z.preprocess(
      emptyToNull,
      z.string().trim().max(30).nullable().optional()
    ),
    eventType: z.string().trim().min(1, "Veuillez sélectionner un type d'événement"),
    eventDate: z.preprocess(
      emptyToNull,
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide")
        .refine((value) => {
          const date = new Date(`${value}T00:00:00Z`);
          return (
            !Number.isNaN(date.valueOf()) &&
            date.toISOString().slice(0, 10) === value
          );
        }, "Date invalide")
        .nullable()
        .optional()
    ),
    guestCount: z.preprocess(
      emptyToNull,
      z.coerce.number().int().min(1, "Le nombre d'invités doit être au moins 1").max(100000).nullable().optional()
    ),
    message: z.string().trim().min(2, "Le message doit comporter au moins 2 caractères").max(4000),
    privacyConsent: z.preprocess(
      (val) => (val === true || val === "true" || val === "on" || val === 1 || val === "1" ? "true" : val),
      z.literal("true")
    ),
  })
  .strict();
