import { describe, expect, it } from 'vitest'
import { shouldRunSchemaApply } from '@/lib/schema-apply-on-deploy'

describe('shouldRunSchemaApply', () => {
  it('skips non-production', () => {
    const result = shouldRunSchemaApply({
      vercelEnv: 'preview',
      commitSha: 'abc',
      last: null,
    })
    expect(result.run).toBe(false)
  })

  it('runs once per production SHA', () => {
    const result = shouldRunSchemaApply({
      vercelEnv: 'production',
      commitSha: 'abc123',
      last: null,
    })
    expect(result.run).toBe(true)
  })

  it('skips when SHA already succeeded', () => {
    const result = shouldRunSchemaApply({
      vercelEnv: 'production',
      commitSha: 'abc123',
      last: { sha: 'abc123', status: 'ok' },
    })
    expect(result.run).toBe(false)
  })
})
