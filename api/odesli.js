import { applyRateLimit } from './_ratelimit.js'
import { odesliQuerySchema, validate } from './_schemas.js'

export default async function handler(req, res) {
  // Rate limiting (GDPR-compliant, IP is hashed)
  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  // Zod validation
  const parsed = validate(odesliQuerySchema, req.query)
  if (!parsed.success) return res.status(400).json({ error: parsed.error })
  const { url } = parsed.data;

  try {
    const response = await fetch(
      `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}&userCountry=DE`
    );

    if (!response.ok) {
      throw new Error(`Odesli API responded with ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Odesli API error:', error);
    return res.status(500).json({ error: 'Failed to fetch from Odesli API' });
  }
}
