import "dotenv/config";
import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3001;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

// Fermeture propre de la base de données à l'arrêt du processus
process.on("SIGTERM", () => {
  server.close(() => {
    app.locals.close?.();
    console.log("Serveur arrêté proprement.");
  });
});