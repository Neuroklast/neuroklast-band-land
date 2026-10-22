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
  if (message === 'Hide the product before deleting it') {
    return 'Make the product private (Hide) before deleting it.'
  }
  if (message === 'Product has paid orders') {
    return 'This product has paid orders. Keep it for accounting; deleting would remove real purchase records.'
  }
  if (message === 'Product has licences or orders') {
    return 'This product has licences or orders and cannot be deleted with the old database function. Apply the current supabase/schema.sql.'
  }
  if (/violates foreign key constraint/i.test(message)) {
    return 'The database still links this product to another record. Apply the current supabase/schema.sql, then retry.'
  }
  if (/Could not find the function|plugin_delete_product|plugin_public_catalog/i.test(message)) {
    return 'The database is missing the latest plugin function. Apply supabase/schema.sql in Supabase and redeploy.'
  }
  if (/plugin_licenses|plugin_releases|plugin_orders|neurokore_licenses|schema cache|does not exist/i.test(message)) {
    return 'Database schema is out of date. Apply supabase/schema.sql in Supabase and redeploy.'
  }
  return 'Request unavailable. Check your sign-in, licence and configuration, then retry.'
}

