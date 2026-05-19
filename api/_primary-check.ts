/**
 * Primary instance detection — server-side utility for API routes.
 *
 * SECURITY: This module is the ONLY source of truth for superadmin bypass in API routes.
 * Never use environment variables (like NEXT_PUBLIC_IS_PRIMARY) for this check,
 * because tenants can set arbitrary env vars on their own deployments.
 * Detection must be based on the request Host header.
 *
 * Configuration:
 * - Set PRIMARY_HOSTNAMES to a comma-separated list of hostnames.
 * - When not set the legacy hardcoded Neuroklast list is used (backward-compat).
 * - When set to an empty string, NO hostname is treated as primary.
 */

/**
 * LEGACY_PRIMARY_HOSTNAMES — fallback when PRIMARY_HOSTNAMES env var is absent.
 */
const LEGACY_PRIMARY_HOSTNAMES = [
  'neuroklast.net',
  'www.neuroklast.net',
  'neuroklast-band-land.vercel.app',
]

function getPrimaryHostnames(): string[] {
  const envVar = process.env.PRIMARY_HOSTNAMES
  if (envVar === undefined) {
    return LEGACY_PRIMARY_HOSTNAMES
  }
  return envVar
    .split(',')
    .map(h => h.trim())
    .filter(Boolean)
}

/**
 * Server-side check: Is this request hitting the master instance?
 * Strips port numbers (e.g. "neuroklast.net:443" → "neuroklast.net").
 *
 * @param host - Value of the `Host` request header (req.headers.host)
 */
export function isPrimaryHost(host: string | undefined): boolean {
  if (!host) return false
  const hostname = host.split(':')[0]
  return getPrimaryHostnames().includes(hostname)
}
