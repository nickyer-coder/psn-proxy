import * as psn from "psn-api";

export default async function handler(req, res) {
  // Gestion des en-têtes CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ error: "Missing Authorization header" });
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();

  try {
    const authorization = { accessToken };
    
    // Détection dynamique de la bonne fonction selon la version de psn-api
    const fetchPresence = psn.getUserBasicPresence || psn.getUserPresence;
    
    if (typeof fetchPresence !== "function") {
      throw new Error("Aucune fonction de présence valide trouvée dans psn-api");
    }

    const presence = await fetchPresence(authorization, "me");
    return res.status(200).json(presence);

  } catch (error) {
    return res.status(500).json({ 
      error: "PSN API Error", 
      message: error.message || String(error)
    });
  }
}
