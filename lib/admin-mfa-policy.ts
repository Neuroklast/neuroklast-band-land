/**
 * Single source of truth for admin pages that already use the strict
 * NEUROKORE admin + MFA guard. Keep this list in sync with page-level
 * admin() calls; API routes/server actions enforce auth themselves.
 *
 * The MFA enrollment and recovery UI is intentionally not gated here.
 */
const MFA_ADMIN_PAGES = new Set([
  '/admin/orders',
  '/admin/contact-inbox',
  '/admin/contact-spam',
  '/admin/privacy',
  '/admin/withdrawals',
  '/admin/plugins/beta-diagnostics',
])

export function requiresAdminMfaPage(pathname: string, method: string): boolean {
  if (method !== 'GET' && method !== 'HEAD') return false
  const normalized = pathname !== '/' ? pathname.replace(/\/$/, '') : pathname
  if (MFA_ADMIN_PAGES.has(normalized) || normalized === '/admin/billing' || normalized.startsWith('/admin/billing/')) return true
  const soundpackId = /^\/admin\/soundpacks\/([^/]+)$/.exec(normalized)?.[1]
  return Boolean(soundpackId && soundpackId !== 'new')
}

/** Match the server-side admin() AAL2 contract, failing closed on auth errors. */
export function requiresAdminMfaChallenge(
  assurance: { currentLevel: string | null; nextLevel: string | null } | null | undefined,
  error: unknown,
): boolean {
  return Boolean(error || !assurance || !assurance.currentLevel || !assurance.nextLevel ||
    (assurance.nextLevel === 'aal2' && assurance.currentLevel !== 'aal2'))
}
