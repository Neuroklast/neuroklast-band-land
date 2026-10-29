import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
import { loadNeurokoreGitHubReleases } from '@/lib/plugins/github-releases-server'

afterEach(() => vi.unstubAllGlobals())

describe('cached server-side release discovery', () => {
  it('loads the fixed public feed and rejects drafts without browser state', async () => {
    let endpoint = ''
    let received: { next: { revalidate: number }; redirect: string } | undefined
    vi.stubGlobal('fetch', async (url: string, options: { next: { revalidate: number }; redirect: string }) => {
      endpoint = url
      received = options
      return Response.json([{ id: 1, draft: true }])
    })
    expect(await loadNeurokoreGitHubReleases()).toEqual([])
    expect(endpoint).toBe('https://api.github.com/repos/Neuroklast/vst-releases/releases?per_page=100')
    expect(received?.next.revalidate).toBe(300)
    expect(received?.redirect).toBe('error')
  })

  it('returns no additions when GitHub fails, is rate-limited or sends malformed JSON', async () => {
    for (const response of [() => { throw new Error('offline') }, () => new Response('', { status: 403 }), () => new Response('{')]) {
      vi.stubGlobal('fetch', response)
      expect(await loadNeurokoreGitHubReleases()).toEqual([])
    }
  })
})
