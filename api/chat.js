import { repondre } from "../server/ia.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({ pret: true });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ erreur: "Méthode non autorisée" });
    return;
  }
  const corps = req.body ?? {};
  const reponse = await repondre({
    message: corps.message,
    historique: Array.isArray(corps.historique) ? corps.historique : []
  });
  if (reponse.invalide === true) {
    res.status(400).json({ erreur: reponse.texte });
    return;
  }
  res.status(200).json({ texte: reponse.texte, source: reponse.source });
}
