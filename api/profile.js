import { exchangeNpssoForCode, exchangeCodeForAccessToken, getUserProfileFromAccountId } from "psn-api";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

  const npsso = authHeader.replace("Bearer ", "").trim();

  try {
    const accessCode = await exchangeNpssoForCode(npsso);
    const authorization = await exchangeCodeForAccessToken(accessCode);
    const profile = await getUserProfileFromAccountId(authorization, "me");

    return res.status(200).json({ onlineId: profile.onlineId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
