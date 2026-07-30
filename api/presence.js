import { 
  exchangeNpssoForCode, 
  exchangeCodeForAccessToken, 
  getBasicPresence 
} from "psn-api";

export default async function handler(req, res) {
  // Gestion CORS
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
      // 1. Échange du NPSSO contre un code d'accès
      const accessCode = await exchangeNpssoForCode(tokenInput);
      // 2. Échange du code contre l'Access Token
      authorization = await exchangeCodeForAccessToken(accessCode);
    }

    // 3. Récupération de la présence avec me
    const response = await getBasicPresence(authorization, "me");
    return res.status(200).json(response);

  } catch (error) {
    return res.status(500).json({ 
      error: "PSN API Error", 
      message: error.message || String(error)
    });
  }
}
