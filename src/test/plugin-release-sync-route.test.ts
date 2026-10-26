import { beforeEach, describe, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({ authorized: true, ready: true, imported: vi.fn(), paths: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: state.paths }))
vi.mock('@/lib/neurokore/server', () => ({ limit: async () => undefined, body: async (r: Request) => r.json(), json: (value: unknown, status = 200) => Response.json(value, { status }) }))
vi.mock('@/lib/plugins/release-import-server', async () => {
  const { z } = await import('zod')
  return { releaseImportAuthorized: () => state.authorized, importVersionSchema: z.string().regex(/^\d+\.\d+\.\d+-beta$/),
    importedReleaseStatus: async (version: string) => ({ version, ready: state.ready, status: state.ready ? 'published' : 'missing' }),
    importOfficialRelease: async (version: string) => { state.imported(version); return { id: 'release', version } } }
})
import { GET, POST } from '@/app/api/plugins/neurokore/release-sync/route'
beforeEach(() => { state.authorized = true; state.ready = true; state.imported.mockClear(); state.paths.mockClear() })
describe('authenticated release sync route', () => {
  it('denies writes and reads without the separate sync credential', async () => {
    state.authorized = false
    expect((await GET(new Request('https://neuroklast.net?version=0.8.2-beta'))).status).toBe(401)
    expect((await POST(new Request('https://neuroklast.net', { method: 'POST', body: '{}' }))).status).toBe(401)
    expect(state.imported).not.toHaveBeenCalled()
  })
  it('publishes the confirmed product version and invalidates public and admin views', async () => {
    const response = await POST(new Request('https://neuroklast.net', { method: 'POST', body: JSON.stringify({ version: '0.8.2-beta' }) }))
    expect(await response.json()).toMatchObject({ version: '0.8.2-beta', ready: true })
    expect(state.paths).toHaveBeenCalledWith('/')
    expect(state.paths).toHaveBeenCalledWith('/plugins/neurokore/download')
    expect(state.paths).toHaveBeenCalledWith('/admin/products')
    expect(state.paths).toHaveBeenCalledWith('/admin/plugins/[id]', 'page')
  })
  it('does not report success or invalidate pages while the product version is incomplete', async () => {
    state.ready = false
    const response = await POST(new Request('https://neuroklast.net', { method: 'POST', body: JSON.stringify({ version: '0.8.2-beta' }) }))
    expect(response.status).toBe(409)
    expect(state.paths).not.toHaveBeenCalled()
  })
})
