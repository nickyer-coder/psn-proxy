import { 
  exchangeNpssoForCode, 
  exchangeCodeForAccessToken, 
  getProfileFromUserName,
  getUserTrophySummary // Import de la fonction dédiée aux trophées
} from "psn-api";

export default async function handler(req, res) {
  try {
    const npsso = req.query.npsso || req.headers.authorization?.replace("Bearer ", "");
    if (!npsso) return res.status(400).json({ error: "NPSSO requis" });

    const accessCode = await exchangeNpssoForCode(npsso);
    const authorization = await exchangeCodeForAccessToken(accessCode);

    // 1. Récupération du profil standard
    const profileResponse = await getProfileFromUserName(authorization, "me");

    // 2. Récupération ciblée du résumé des trophées (plus frais)
    try {
      const trophySummary = await getUserTrophySummary(authorization, "me");
      if (trophySummary && trophySummary.earnedTrophies) {
        // On remplace le résumé de trophées du profil par celui plus récent
        profileResponse.profile.trophySummary = trophySummary;
      }
    } catch (e) {
      // Si l'appel échoue, on conserve celui du profil par défaut
    }

    return res.status(200).json(profileResponse);

  } catch (error) {
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
