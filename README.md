# React + Vite

## Gladysa Signature Events

Site React/Vite avec une API Node/Express et une base SQLite pour recevoir et
consulter les demandes de devis.

### Démarrage local

1. Installer les dépendances avec `npm install`.
2. Copier `.env.example` vers `.env.local`.
3. Remplacer `ADMIN_API_KEY` par une valeur aléatoire longue. Cette clé protège
	 l’espace privé `/admin` et l’endpoint de consultation des demandes.
4. Compléter les paramètres SMTP pour activer les emails au client et à l’équipe.
5. Lancer `npm run dev` puis ouvrir l’adresse affichée par Vite.

Le script `dev` démarre Vite et l’API Express ensemble. Vite relaie `/api` vers
`http://127.0.0.1:3001`. Les devis sont conservés dans `data/gladysa.sqlite`.

### API

- `GET /api/health` vérifie que l’API répond.
- `POST /api/quotes` valide et enregistre une demande, puis déclenche les emails
	configurés. Les champs attendus sont `name`, `email`, `phone`, `eventType`,
	`eventDate`, `guestCount` et `message`.
- `GET /api/admin/quotes` retourne les 200 demandes les plus récentes. Il exige
	`Authorization: Bearer <ADMIN_API_KEY>`.

L’API limite les demandes publiques, valide les données côté serveur et n’expose
pas le texte du devis dans la réponse publique. Pour un déploiement sur un
domaine distinct, renseigner `CORS_ORIGIN` avec l’origine exacte du frontend.

### Emails et paiements

Les variables SMTP et l’adresse `ADMIN_EMAIL` activent une notification à
l’équipe et un accusé de réception au client. Sans ces paramètres, les devis
restent enregistrés, mais aucun email ne part.

Aucun prestataire de paiement n’a été choisi. Le frontend ne collecte aucune
donnée bancaire ; le paiement devra être créé et confirmé côté serveur après
choix du fournisseur, du pays, de la devise et des règles d’acompte.

### Vérifications

- `npm run lint`
- `npm test`
- `npm run build`

## Configuration

Copiez `.env.example` dans `.env.local`, puis renseignez l’URL de votre API et
le numéro WhatsApp professionnel au format international, sans `+` ni espaces.
Les variables `VITE_` sont publiques dans le navigateur : n’y placez jamais de
clé privée, de secret de paiement ou de clé d’email.

Le formulaire de devis envoie une requête `POST /api/quotes` avec les champs
`name`, `email`, `phone`, `eventType`, `eventDate`, `guestCount` et `message`.
Configurez `VITE_API_BASE_URL` avec l’adresse du backend. Le backend devra
valider et enregistrer la demande, puis déclencher les emails côté serveur.
Les paiements devront également être créés et confirmés côté serveur avec le
fournisseur choisi ; aucune donnée bancaire ne doit transiter par ce frontend.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
