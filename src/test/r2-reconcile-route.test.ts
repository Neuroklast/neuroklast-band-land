import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  allowed: true,
  scanned: 0,
  dryRuns: [] as boolean[],
  revalidated: [] as string[],
}))

vi.mock('@/lib/api-admin-auth', () => ({
  isAdminSession: async () => state.allowed,
}))
vi.mock('@/lib/r2-inventory', () => ({
  listAllR2ObjectKeys: async () => {
    state.scanned += 1
    return ['covers/a.jpg']
  },
}))
vi.mock('@/lib/r2-reconcile', () => ({
  applyR2MediaReconcile: async (_client: unknown, options: { dryRun: boolean }) => {
    state.dryRuns.push(options.dryRun)
    return { objectCount: 1, rewrittenRows: 0, replacements: 0 }
  },
}))
vi.mock('@/lib/supabaseAdmin', () => ({
  createAdminClient: () => ({}),
}))
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => state.revalidated.push(path),
}))

import { GET, POST } from '@/app/api/r2-reconcile/route'

describe('R2 reconciliation route is admin-controlled', () => {
  beforeEach(() => {
    state.allowed = true
    state.scanned = 0
    state.dryRuns = []
    state.revalidated = []
  })

  it('GET always performs a dry-run without writes', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    expect(state.dryRuns).toEqual([true])
    expect(state.revalidated).toEqual([])
  })

  it('POST with dryRun=1 only previews', async () => {
    const response = await POST(new Request('https://neuroklast.net/api/r2-reconcile?dryRun=1', { method: 'POST' }))
    expect(response.status).toBe(200)
    expect(state.dryRuns).toEqual([true])
    expect(state.revalidated).toEqual([])
  })

  it('authenticated POST applies and revalidates media', async () => {
    const response = await POST(new Request('https://neuroklast.net/api/r2-reconcile', { method: 'POST' }))
    expect(response.status).toBe(200)
    expect(state.dryRuns).toEqual([false])
    expect(state.revalidated).toContain('/')
  })

  it('unauthenticated requests cannot list or change media', async () => {
    state.allowed = false
    const response = await POST(new Request('https://neuroklast.net/api/r2-reconcile', { method: 'POST' }))
    expect(response.status).toBe(401)
    expect(state.scanned).toBe(0)
    expect(state.dryRuns).toEqual([])
  })
})
