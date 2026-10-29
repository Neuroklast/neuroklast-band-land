import { afterEach, describe, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({ filters: [] as unknown[][] }))
vi.mock('@/lib/neurokore/server', () => ({ db: () => ({ from: () => ({ select: () => {
  const chain = { eq: (...args: unknown[]) => { state.filters.push(args); return chain }, maybeSingle: async () => ({ data: { id: '00000000-0000-4000-8000-000000000003', demo_downloads_enabled: true }, error: null }) }
  return chain
} }) }) }))
import { releaseImportAuthorized, importedReleaseStatus, officialImportPlan } from '@/lib/plugins/release-import-server'
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); state.filters = [] })
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

describe('public binary repository provenance', () => {
  const version = '0.8.8-beta'
  const sha = 'a'.repeat(40)
  const url = 'https://github.com/Neuroklast/NeuroKore-Releases/releases/download/v' + version + '/'
  const assets = ['NEUROKORE-' + version + '-Setup.exe', 'NEUROKORE-' + version + '-win64.zip']
    .flatMap(name => [name, name + '.sha256'])
    .map(name => ({
      name, size: name.endsWith('.sha256') ? 100 : 200_000,
      state: 'uploaded', digest: 'sha256:' + 'b'.repeat(64),
      browser_download_url: url + name
    }))
  const payload = { id: 123, tag_name: 'v' + version, draft: false, prerelease: true,
    published_at: '2026-10-29T00:00:00Z', assets, body: 'Notes\\n\\n<!-- neurokore-source-commit:' + sha + ' -->' }

  it('uses embedded private source commit, never public README tag commit', async () => {
    const requested: string[] = []
    vi.stubGlobal('fetch', async (requestUrl: string) => {
      requested.push(requestUrl)
      return Response.json(payload)
    })
    const plan = await officialImportPlan(version)
    expect(plan.commit).toBe(sha)
    expect(plan.files).toHaveLength(4)
    expect(requested).toEqual(['https://api.github.com/repos/Neuroklast/NeuroKore-Releases/releases/tags/v' + version])
  })

  it('rejects releases lacking verifiable private source provenance', async () => {
    for (const body of ['', '<!-- neurokore-source-commit:' + sha + ' --><!-- neurokore-source-commit:' + sha + ' -->']) {
      vi.stubGlobal('fetch', async () => Response.json({ ...payload, body }))
      await expect(officialImportPlan(version)).rejects.toThrow(/source commit provenance/)
    }
  })
})
