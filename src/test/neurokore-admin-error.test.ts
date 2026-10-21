import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('adminFailureMessage mapping', () => {
  it('maps known failures to operator copy', async () => {
    const { adminFailureMessage } = await import('@/lib/neurokore/admin-error')
    expect(adminFailureMessage(new z.ZodError([]))).toMatch(/Invalid request/)
    expect(adminFailureMessage(new Error('Invalid origin'))).toMatch(/NEUROKORE_SITE_URL/)
    expect(adminFailureMessage(new Error('Invalid license encryption key (need 64 hex chars, got 48)'))).toMatch(/got 48/)
    expect(adminFailureMessage({ message: 'Could not find the table public.neurokore_licenses in the schema cache' })).toMatch(/schema\.sql/)
  })
})
