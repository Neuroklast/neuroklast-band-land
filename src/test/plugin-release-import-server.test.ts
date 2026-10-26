import { afterEach, describe, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({ filters: [] as unknown[][] }))
vi.mock('@/lib/neurokore/server', () => ({ db: () => ({ from: () => ({ select: () => {
  const chain = { eq: (...args: unknown[]) => { state.filters.push(args); return chain }, maybeSingle: async () => ({ data: { id: '00000000-0000-4000-8000-000000000003', demo_downloads_enabled: true }, error: null }) }
  return chain
} }) }) }))
import { releaseImportAuthorized, importedReleaseStatus } from '@/lib/plugins/release-import-server'
afterEach(() => { vi.unstubAllEnvs(); state.filters = [] })
describe('release sync authentication and product ownership', () => {
  it('requires the configured bearer token and fails closed without one', () => {
    vi.stubEnv('NEUROKORE_RELEASE_SYNC_TOKEN', '')
    expect(releaseImportAuthorized(new Request('https://neuroklast.net'))).toBe(false)
    vi.stubEnv('NEUROKORE_RELEASE_SYNC_TOKEN', 'a'.repeat(64))
    expect(releaseImportAuthorized(new Request('https://neuroklast.net', { headers: { authorization: `Bearer ${'b'.repeat(64)}` } }))).toBe(false)
    expect(releaseImportAuthorized(new Request('https://neuroklast.net', { headers: { authorization: `Bearer ${'a'.repeat(64)}` } }))).toBe(true)
  })
  it('resolves only the active NEUROKORE plugin using the actual products schema', async () => {
    await importedReleaseStatus('0.8.2-beta')
    expect(state.filters).toContainEqual(['slug', 'neurokore'])
    expect(state.filters).toContainEqual(['kind', 'plugin'])
    expect(state.filters).toContainEqual(['active', true])
    expect(state.filters).not.toContainEqual(['status', 'active'])
  })
})
