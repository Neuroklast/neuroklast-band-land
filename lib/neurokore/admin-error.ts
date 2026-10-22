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
  if (message === 'Product has licences or orders') {
    return 'This product has licences or orders and cannot be deleted. Revoke the licences first, or keep it for accounting.'
  }
  if (/violates foreign key constraint/i.test(message)) {
    return 'This product is still referenced by another record. Remove or detach that record first.'
  }
  if (/Could not find the function|plugin_delete_product|plugin_public_catalog/i.test(message)) {
    return 'The database is missing the latest plugin function. Open Admin -> Products & Plugins -> Apply schema.sql (needs SUPABASE_DB_URL).'
  }
  if (/plugin_licenses|plugin_releases|plugin_orders|neurokore_licenses|schema cache|does not exist/i.test(message)) {
    return 'Database schema is out of date. Open Admin -> Products & Plugins -> Apply schema.sql (needs SUPABASE_DB_URL).'
  }
  return 'Request unavailable. Check your sign-in, licence and configuration, then retry.'
}

