import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/** A deploy must never run DDL while a live request boots a serverless worker. */
describe('production instrumentation safety', () => {
  it('does not execute schema migration in the Next.js startup hook', () => {
    const bootstrap = readFileSync(join(process.cwd(), 'instrumentation.ts'), 'utf8')
    expect(bootstrap.includes('runProductionDeploySchemaApply(')).toBe(false)
    expect(bootstrap.includes('schema-apply-on-deploy')).toBe(false)
  })
})
