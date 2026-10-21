import { z } from 'zod'

export function adminFailureMessage(error: unknown): string {
  if (error instanceof z.ZodError) return 'Invalid request. Check the email and days fields.'
  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string'
        ? (error as { message: string }).message
        : ''
  if (message === 'Invalid origin' || message === 'HTTPS required') {
    return 'Origin mismatch. Set NEUROKORE_SITE_URL or SITE_URL to https://neuroklast.net and redeploy.'
  }
  if (message === 'Licensing configuration incomplete' || message.startsWith('Invalid license encryption key')) {
    return message.startsWith('Invalid license encryption key')
      ? `${message}. In Vercel: no quotes, no spaces, exactly 64 characters 0-9a-f. Then redeploy.`
      : 'Set NEUROKORE_KEY_ENCRYPTION_SECRET (64 hex chars, not the PEM) and NEUROKORE_SIGNING_PRIVATE_KEY, then redeploy.'
  }
  if (message === 'MFA required') return 'Complete MFA, then retry.'
  if (message === 'Administrator required') return 'Administrator sign-in required.'
  if (/neurokore_licenses|schema cache|does not exist/i.test(message)) {
    return 'License tables are missing. Production must apply supabase/schema.sql (needs SUPABASE_DB_URL).'
  }
  return 'Request unavailable. Check your sign-in, license and configuration, then retry.'
}
