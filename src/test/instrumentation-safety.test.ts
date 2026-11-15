import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/** Serverless function startup must never run migrations or media reconciliation. */
describe('production instrumentation safety', () => {
  it('does not launch DDL, legacy migration or R2 reconcile during startup', () => {
    const hookPath = join(process.cwd(), 'instrumentation.ts')
    if (!existsSync(hookPath)) return

    const bootstrap = readFileSync(hookPath, 'utf8')
    for (const forbidden of [
      'runProductionDeploySchemaApply',
      'schema-apply-on-deploy',
      'runProductionDeployR2Reconcile',
      'r2-reconcile-on-deploy',
      'runProductionDeployLegacyUrlMigration',
      'legacy-url-migration-on-deploy',
    ]) {
      expect(bootstrap).not.toContain(forbidden)
    }
  })

  it('does not retain obsolete deploy-time media jobs', () => {
    for (const path of [
      'lib/r2-reconcile-on-deploy.ts',
      'lib/legacy-url-migration-on-deploy.ts',
    ]) {
      expect(existsSync(join(process.cwd(), path))).toBe(false)
    }
  })
})
