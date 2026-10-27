/**
 * Next.js server boot hook.
 *
 * Database schema changes MUST be applied and verified by the explicit
 * `npm run db:schema` deployment operation before a release. Never run DDL
 * during a Vercel function's startup: a missing or stale Postgres password
 * would otherwise trigger repeated authentication failures on live traffic.
 *
 * Only the existing non-schema, best-effort maintenance jobs run here.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.VERCEL_ENV !== 'production') return

  const { runProductionDeployR2Reconcile } = await import('@/lib/r2-reconcile-on-deploy')
  void runProductionDeployR2Reconcile()

  const { runProductionDeployLegacyUrlMigration } = await import('@/lib/legacy-url-migration-on-deploy')
  void runProductionDeployLegacyUrlMigration()
}
