export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ erreur: "Méthode non autorisée" });
    return;
  }
  res.status(200).json({ pret: true });
}
