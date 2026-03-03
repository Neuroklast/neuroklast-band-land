/**
 * GET /api/env-check
 *
 * Returns the presence status of required environment variables.
 * Only reports whether each variable is set (boolean) — never exposes values.
 * Used by the SetupWizard to guide new users through ENV configuration.
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const vars = {
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    ADMIN_SETUP_TOKEN: !!process.env.ADMIN_SETUP_TOKEN,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
  }

  return res.status(200).json({ vars })
}
