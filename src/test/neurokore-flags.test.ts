import { describe, expect, it } from 'vitest'
import { isNeurokoreSalesEnabled } from '@/lib/neurokore/flags'

describe('isNeurokoreSalesEnabled', () => {
  it('is off unless the env value is the string true', () => {
    expect(isNeurokoreSalesEnabled({})).toBe(false)
    expect(isNeurokoreSalesEnabled({ NEUROKORE_SALES_ENABLED: 'false' })).toBe(false)
    expect(isNeurokoreSalesEnabled({ NEUROKORE_SALES_ENABLED: '1' })).toBe(false)
    expect(isNeurokoreSalesEnabled({ NEUROKORE_SALES_ENABLED: 'true' })).toBe(true)
  })
})
