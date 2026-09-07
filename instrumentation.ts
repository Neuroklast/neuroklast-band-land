/**
 * Next.js server boot hook. On Vercel Production this runs the R2↔DB
 * filename reconcile once per git SHA (see lib/r2-reconcile-on-deploy.ts) and
 * the legacy `*.supabase.co` storage URL migration (lib/legacy-url-migration-on-deploy.ts).
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.VERCEL_ENV !== 'production') return

  const { runProductionDeploySchemaApply } = await import('@/lib/schema-apply-on-deploy')
  void runProductionDeploySchemaApply()

  const { runProductionDeployR2Reconcile } = await import('@/lib/r2-reconcile-on-deploy')
  void runProductionDeployR2Reconcile()

  const { runProductionDeployLegacyUrlMigration } = await import('@/lib/legacy-url-migration-on-deploy')
  void runProductionDeployLegacyUrlMigration()
}
