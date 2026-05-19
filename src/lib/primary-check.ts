/**
 * Primary instance detection utilities.
 *
 * SECURITY: This module is the ONLY source of truth for superadmin bypass.
 * Never use environment variables (like NEXT_PUBLIC_IS_PRIMARY) for this check,
 * because tenants can set arbitrary env vars on their own deployments.
 * Detection must be based on the runtime hostname.
 *
 * Configuration:
 * - Set NEXT_PUBLIC_PRIMARY_HOSTNAMES to a comma-separated list of hostnames that
 *   should bypass activation (e.g. "my-band.com,www.my-band.com").
 * - When NEXT_PUBLIC_PRIMARY_HOSTNAMES is not set, the legacy hardcoded Neuroklast
 *   list is used for backward-compatibility.
 * - When NEXT_PUBLIC_PRIMARY_HOSTNAMES is set to an empty string, NO hostname is
 *   treated as primary (fully open-source mode).
 */

/**
 * LEGACY_PRIMARY_HOSTNAMES — fallback list used when NEXT_PUBLIC_PRIMARY_HOSTNAMES
 * is not configured.  Keeps existing Neuroklast deployments working without
 * any configuration change.
 */
const LEGACY_PRIMARY_HOSTNAMES: string[] = [
  'neuroklast.net',
  'www.neuroklast.net',
  'neuroklast-band-land.vercel.app',
]

/**
 * Resolve the active primary hostname list at call time so that vi.stubEnv
 * works correctly in tests (module-level consts are frozen at import time).
 */
function getPrimaryHostnames(): string[] {
  const envVar = process.env.NEXT_PUBLIC_PRIMARY_HOSTNAMES as string | undefined
  // Env var not set at all → use legacy list for backward-compat
  if (envVar === undefined) {
    return LEGACY_PRIMARY_HOSTNAMES
  }
  // Env var set (even to empty string) → use it exclusively
  return envVar
    .split(',')
    .map(h => h.trim())
    .filter(Boolean)
}

/** Client-side check: Is the current browser on the master instance? */
export function isPrimaryInstance(): boolean {
  if (typeof window === 'undefined') return false
  return getPrimaryHostnames().includes(window.location.hostname)
}
