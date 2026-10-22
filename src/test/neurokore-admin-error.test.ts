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

