import { 
  exchangeNpssoForCode, 
  exchangeCodeForAccessToken, 
  getProfileFromUserName 
} from "psn-api";

export default async function handler(req, res) {
  try {
    const npsso = req.query.npsso || req.headers.authorization?.replace("Bearer ", "");

    if (!npsso) {
      return res.status(400).json({ error: "NPSSO requis" });
    }

    // 1. Authentification auprès des serveurs PSN
    const accessCode = await exchangeNpssoForCode(npsso);
    const authorization = await exchangeCodeForAccessToken(accessCode);

    // 2. Récupération du profil
    // Passer "me" à getProfileFromUserName cible directement le compte propriétaire du NPSSO
    const profileResponse = await getProfileFromUserName(authorization, "me");

    return res.status(200).json(profileResponse);

  } catch (error) {
    console.error("Erreur Profile:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
