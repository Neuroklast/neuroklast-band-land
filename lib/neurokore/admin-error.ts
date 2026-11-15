import { z } from 'zod'

function adminErrorDetails(error: unknown): { message: string; code: string } {
  if (error instanceof Error) return { message: error.message, code: '' }
  if (!error || typeof error !== 'object') return { message: '', code: '' }
  const obj = error as Record<string, unknown>
  return {
    message: typeof obj.message === 'string' ? obj.message : '',
    code: typeof obj.code === 'string' ? obj.code : '',
  }
}

export function adminFailureMessage(error: unknown): string {
  if (error instanceof z.ZodError) return 'Invalid request. Check the email and days fields.'
  const { message } = adminErrorDetails(error)
  if (message === 'Invalid origin' || message === 'HTTPS required') {
    return 'Origin mismatch. Set NEUROKORE_SITE_URL or SITE_URL to https://neuroklast.net and redeploy.'
  }
  if (message === 'Licensing configuration incomplete' || message.startsWith('Invalid license encryption key')) {
    return message.startsWith('Invalid license encryption key')
      ? `${message}. In Vercel: no quotes, no spaces, exactly 64 characters 0-9a-f. Then redeploy.`
      : 'Set NEUROKORE_KEY_ENCRYPTION_SECRET (64 hex chars, not the PEM) and NEUROKORE_SIGNING_PRIVATE_KEY, then redeploy.'
  }
  if (message === 'MFA required') return 'Complete MFA, then retry.'
  if (message === 'Audit infrastructure unavailable') return 'Audit database migration is missing or unavailable. No changes were made.'
  if (message.startsWith('Too many requests')) return 'Too many requests. Please retry shortly.'
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


/** Classify admin API failures by cause, never return HTTP 400 for every failure. */
export function adminFailureStatus(error: unknown): 400 | 401 | 403 | 409 | 413 | 422 | 429 | 500 | 503 {
  if (error instanceof z.ZodError) return 422
  if (error instanceof SyntaxError) return 400

  const { message, code } = adminErrorDetails(error)
  if (message === 'Sign in first') return 401
  if (message === 'Administrator required' || message === 'MFA required' || message === 'Invalid origin') return 403
  if (message.startsWith('Too many requests')) return 429
  if (message === 'Request too large') return 413
  if (message === 'Missing request') return 400
  if (message === 'Hide the product before deleting it' ||
      message === 'Product has paid orders' ||
      message === 'Product has licences or orders' ||
      /violates foreign key constraint/i.test(message)) return 409
  if (code === '23505' || code === '23503') return 409

  // Schema/privilege/missing-RPC errors indicate an unavailable backend, not bad user input.
  if (['42P01', '42703', '42501', 'PGRST202', 'PGRST205'].includes(code) ||
      code.startsWith('08') || code.startsWith('PGRST5') ||
      message === 'Licensing configuration incomplete' || message === 'HTTPS required' ||
      message.startsWith('Invalid license encryption key') ||
      /Could not find the function|schema cache|does not exist|fetch failed|network error/i.test(message)) return 503

  return 500
}
