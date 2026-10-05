import { z } from "zod";

/**
 * Transforme une chaîne vide en null.
 * Utilisé pour rendre optionnels les champs qui arrivent vides depuis le formulaire.
 */
const emptyToNull = (value) => (value === "" ? null : value);

/**
 * Schéma de validation Zod pour une demande de devis.
 */
export const quoteSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email().trim().max(254),
    phone: z.preprocess(
      emptyToNull,
      z.string().trim().max(30).nullable().optional()
    ),
    eventType: z.enum([
      "Mariage",
      "Anniversaire",
      "Anniversaire Prestige",
      "Événement professionnel",
      "Conférence / Sommet",
      "Gala d'Entreprise",
      "Événement culturel ou religieux",
      "Événement Culturel",
      "Autre",
    ]),
    eventDate: z.preprocess(
      emptyToNull,
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .refine((value) => {
          const date = new Date(`${value}T00:00:00Z`);
          return (
            !Number.isNaN(date.valueOf()) &&
            date.toISOString().slice(0, 10) === value
          );
        })
        .nullable()
        .optional()
    ),
    guestCount: z.preprocess(
      emptyToNull,
      z.coerce.number().int().min(1).max(100000).nullable().optional()
    ),
    message: z.string().trim().min(10).max(4000),
    privacyConsent: z.literal("true"),
  })
  .strict();
