import { describe, expect, it, vi } from 'vitest'
import { importRelease, type ImportPlan, type ImportDependencies } from '@/lib/plugins/release-import'

const plan: ImportPlan = { version: '0.8.0-beta', channel: 'beta', commit: 'a'.repeat(40), notes: 'Release notes',
  files: ['Setup.exe', 'Setup.exe.sha256', 'win64.zip', 'win64.zip.sha256'].map((suffix, i) => ({
    filename: `NEUROKORE-0.8.0-beta-${suffix}`, size: 100 + i, sha256: 'b'.repeat(64),
    packageType: i === 0 ? 'installer' as const : i === 2 ? 'bundle' as const : null,
  })) }
function fixture(status = 'draft') {
  const events: string[] = []
  const deps: ImportDependencies = {
    load: async () => plan,
    prepare: async () => ({ id: 'release-id', status }),
    store: async file => { events.push(file.filename) },
    register: async () => { events.push('register') },
    verify: async () => { events.push('verify') },
    publish: async () => { events.push('publish') },
  }
  return { events, deps }
}
describe('official release import into R2', () => {
  it('copies all four verified assets before registering and publishing', async () => {
    const f = fixture(); await importRelease(plan.version, f.deps)
    expect(f.events).toEqual([...plan.files.map(f => f.filename), 'register', 'verify', 'publish'])
  })
  it('never publishes a partial upload and resumes without recreating a version', async () => {
    const f = fixture(); f.deps.store = vi.fn().mockRejectedValueOnce(new Error('R2 unavailable')).mockResolvedValue(undefined)
    await expect(importRelease(plan.version, f.deps)).rejects.toThrow('R2 unavailable')
    expect(f.events).not.toContain('publish')
    await importRelease(plan.version, f.deps); expect(f.events.at(-1)).toBe('publish')
  })
  it('does not republish a withdrawn version or change published metadata', async () => {
    const withdrawn = fixture('withdrawn'); await expect(importRelease(plan.version, withdrawn.deps)).rejects.toThrow(/withdrawn/)
    expect(withdrawn.events).toEqual([])
    const published = fixture('published'); await importRelease(plan.version, published.deps)
    expect(published.events).not.toContain('publish')
    expect(published.events).not.toContain('register')
  })
})
