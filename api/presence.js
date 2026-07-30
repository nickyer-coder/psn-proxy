import { exchangeNpssoForCode, exchangeCodeForAccessToken, getBasicPresence } from "psn-api";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ error: "Missing Authorization header" });
  }

  const tokenInput = authHeader.replace("Bearer ", "").trim();

  try {
    let authorization;

    // Si le token commence par 'v1.' c'est déjà un access_token, sinon c'est un npsso
    if (tokenInput.startsWith("v1.")) {
      authorization = { accessToken: tokenInput };
    } else {
      // Étape 1: Échange du NPSSO contre un code d'accès
      const accessCode = await exchangeNpssoForCode(tokenInput);
      // Étape 2: Échange du code contre le véritable Access Token
      authorization = await exchangeCodeForAccessToken(accessCode);
    }

    // Étape 3: Récupération de la présence
    const presence = await getBasicPresence(authorization, "me");
    return res.status(200).json(presence);

  } catch (error) {
    return res.status(500).json({ 
      error: "PSN API Error", 
      message: error.message || String(error)
    });
  }
}
