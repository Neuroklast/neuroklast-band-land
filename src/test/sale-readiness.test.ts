import { describe, it, expect } from 'vitest'
import { hasSellableRelease, saleReleaseSchema } from '@/lib/plugins/sale-readiness'

const good = {
  id: '7e330130-916e-4c3c-9d77-fc761202aaba',
  status: 'published' as const,
  withdrawn_at: null,
  plugin_release_artifacts: [{
    id: '6e240130-916e-4c3c-9d77-fc761202aaba',
    validation_status: 'validated' as const,
    storage_key: 'releases/neurokore/v1.0.0/windows-x64/neurokore.zip',
    filesize_bytes: 4096,
    sha256: 'a'.repeat(64),
  }],
}

describe('paid plugin sale readiness', () => {
  it('permits a validated artifact from a published build', () => {
    expect(hasSellableRelease([saleReleaseSchema.parse(good)])).toBe(true)
  })
  it('does not require public demo downloads to be turned on', () => {
    expect(hasSellableRelease([good])).toBe(true)
  })
  it('rejects missing builds, drafts and withdrawn builds', () => {
    expect(hasSellableRelease([])).toBe(false)
    expect(hasSellableRelease([{ ...good, status: 'draft' }])).toBe(false)
    expect(hasSellableRelease([{ ...good, withdrawn_at: '2026-10-22T12:00:00Z' }])).toBe(false)
  })
  it('rejects unvalidated files, empty artifact lists and unsafe paths', () => {
    expect(hasSellableRelease([{ ...good, plugin_release_artifacts: [] }])).toBe(false)
    expect(hasSellableRelease([{ ...good, plugin_release_artifacts: [{ ...good.plugin_release_artifacts[0], validation_status: 'pending' }] }])).toBe(false)
    expect(hasSellableRelease([{ ...good, plugin_release_artifacts: [{ ...good.plugin_release_artifacts[0], storage_key: '../private/file.zip' }] }])).toBe(false)
    expect(hasSellableRelease([{ ...good, plugin_release_artifacts: [{ ...good.plugin_release_artifacts[0], sha256: 'INVALID' }] }])).toBe(false)
  })
})
