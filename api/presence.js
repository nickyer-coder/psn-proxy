import { getUserPresence } from "psn-api";

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

  const accessToken = authHeader.replace("Bearer ", "").trim();

  try {
    const authorization = { accessToken };
    const presence = await getUserPresence(authorization, "me");
    return res.status(200).json(presence);
  } catch (error) {
    return res.status(500).json({ 
      error: "PSN API Error", 
      message: error.message || error 
    });
  }
}
