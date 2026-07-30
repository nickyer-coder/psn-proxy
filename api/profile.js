import { 
  exchangeNpssoForCode, 
  exchangeCodeForAccessToken, 
  getProfileFromAccountId 
} from "psn-api";

export default async function handler(req, res) {
  try {
    const npsso = req.query.npsso || req.headers.authorization?.replace("Bearer ", "");

    if (!npsso) {
      return res.status(400).json({ error: "NPSSO requis" });
    }

    // 1. Authentification PSN
    const accessCode = await exchangeNpssoForCode(npsso);
    const authorization = await exchangeCodeForAccessToken(accessCode);

    // 2. Récupérer l'accountId : soit passé en paramètre, soit extrait directement du token
    let accountId = req.query.accountId;
    
    if (!accountId || accountId === "me") {
      // authorization contient directement l'accountId du jeton connecté !
      accountId = authorization.accountId; 
    }

    // 3. Récupération du profil
    const profileResponse = await getProfileFromAccountId(authorization, accountId);

    return res.status(200).json(profileResponse);

  } catch (error) {
    console.error("Erreur Profile:", error);
    return res.status(500).json({ error: error.message || "Erreur serveur" });
  }
}
