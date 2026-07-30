import { 
  exchangeNpssoForCode, 
  exchangeCodeForAccessToken, 
  getProfileFromAccountId // <-- C'est cette fonction exacte qu'il faut utiliser
} from "psn-api";

export default async function handler(req, res) {
  try {
    const { npsso, accountId } = req.query;

    if (!npsso) {
      return res.status(400).json({ error: "Le paramètre NPSSO est requis" });
    }

    // 1. Authentification
    const accessCode = await exchangeNpssoForCode(npsso);
    const authorization = await exchangeCodeForAccessToken(accessCode);

    // 2. Si aucun accountId n'est fourni, on utilise 'me' pour cibler son propre compte
    const targetAccountId = accountId || "me";

    // 3. Appel de la bonne fonction
    const profileResponse = await getProfileFromAccountId(
      authorization, 
      targetAccountId
    );

    return res.status(200).json(profileResponse);

  } catch (error) {
    console.error("Erreur Profile PSN:", error);
    return res.status(500).json({ 
      error: error.message || "Erreur lors de la récupération du profil" 
    });
  }
}
