import { describe, expect, it } from 'vitest'
import { SOFTWARE_LICENSE_CONDITIONS, softwareLicenseEmailText } from '@/lib/plugins/consumer-license-terms'

describe('NEUROKORE consumer licence contract parity', () => {
  it('keeps website and emailed licence grant aligned with permanent offline access', () => {
    const activation = SOFTWARE_LICENSE_CONDITIONS.find(x => x.title === 'Aktivierung und Geräte')?.body ?? ''
    expect(activation).toContain('zwei Geräteaktivierungen')
    expect(activation).toContain('dauerhaft nutzbar')
    expect(activation).not.toMatch(/regelmäßig zu erneuernd|periodisch zu erneuernd/i)
    expect(softwareLicenseEmailText()).toContain(activation)
  })
})
