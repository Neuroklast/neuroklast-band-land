import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe('adminFailureMessage mapping', () => {
  it('maps known failures to operator copy', async () => {
    const { adminFailureMessage } = await import('@/lib/neurokore/admin-error')
    expect(adminFailureMessage(new z.ZodError([]))).toMatch(/Invalid request/)
    expect(adminFailureMessage(new Error('Invalid origin'))).toMatch(/NEUROKORE_SITE_URL/)
    expect(adminFailureMessage(new Error('Invalid license encryption key (need 64 hex chars, got 48)'))).toMatch(/got 48/)
    expect(adminFailureMessage({ message: 'Could not find the table public.neurokore_licenses in the schema cache' })).toMatch(/schema\.sql/)
    expect(adminFailureMessage(new Error('Product has licences or orders'))).toMatch(/cannot be deleted/)
    expect(adminFailureMessage(new Error('Could not find the function public.plugin_delete_product(p_product uuid) in the schema cache'))).toMatch(/schema\.sql/)
    expect(adminFailureMessage(new Error('update or delete on table "products" violates foreign key constraint'))).toMatch(/links this product/)
    expect(adminFailureMessage(new Error('Hide the product before deleting it'))).toMatch(/Make the product private/)
    expect(adminFailureMessage(new Error('Product has paid orders'))).toMatch(/paid orders/)
  })
})


describe('adminFailureStatus HTTP classification', () => {
  it('distinguishes authentication, authorization and MFA from input errors', async () => {
    const { adminFailureStatus } = await import('@/lib/neurokore/admin-error')
    expect(adminFailureStatus(new Error('Sign in first'))).toBe(401)
    expect(adminFailureStatus(new Error('Administrator required'))).toBe(403)
    expect(adminFailureStatus(new Error('MFA required'))).toBe(403)
    expect(adminFailureStatus(new Error('Invalid origin'))).toBe(403)
    expect(adminFailureStatus(new z.ZodError([]))).toBe(422)
    expect(adminFailureStatus(new SyntaxError('Invalid JSON'))).toBe(400)
    expect(adminFailureStatus(new Error('Request too large'))).toBe(413)
    expect(adminFailureStatus(new Error('Too many requests. Please try again later.'))).toBe(429)
  })

  it('distinguishes conflicts from temporarily unavailable infrastructure', async () => {
    const { adminFailureStatus } = await import('@/lib/neurokore/admin-error')
    expect(adminFailureStatus(new Error('Product has paid orders'))).toBe(409)
    expect(adminFailureStatus({ code: '23505', message: 'unique constraint' })).toBe(409)
    expect(adminFailureStatus({ code: '23503', message: 'foreign key failure' })).toBe(409)
    expect(adminFailureStatus({ code: '42P01', message: 'relation missing' })).toBe(503)
    expect(adminFailureStatus({ code: 'PGRST202', message: 'function missing' })).toBe(503)
    expect(adminFailureStatus(new Error('TypeError: fetch failed'))).toBe(503)
    expect(adminFailureStatus(new Error('Licensing configuration incomplete'))).toBe(503)
    expect(adminFailureStatus(new Error('Audit infrastructure unavailable'))).toBe(503)
    expect(adminFailureStatus(new Error('unexpected server failure'))).toBe(500)
  })
})
