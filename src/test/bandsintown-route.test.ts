import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/rate-limit', () => ({
  consumeRateLimitForRequest: vi.fn(async () => ({ allowed: true, namespace: 'bandsintown' })),
}))

vi.mock('@/lib/api-secrets', () => ({
  getApiSecret: vi.fn(async () => 'site-key'),
}))

vi.mock('@/lib/supabaseServer', () => ({
  createPublicClient: vi.fn(() => ({ kind: 'public' })),
}))

vi.mock('@/lib/bandsintown-sync', () => ({
  resolveBandsintownArtistName: vi.fn(async () => 'Neuroklast'),
  fetchBandsintownEventsFromApi: vi.fn(async () => [{ id: '101' }]),
}))

import { fetchBandsintownEventsFromApi, resolveBandsintownArtistName } from '@/lib/bandsintown-sync'
import { GET } from '@/app/api/bandsintown/route'

describe('GET /api/bandsintown', () => {
  it('ignores the query artist and uses the configured name', async () => {
    const res = await GET(
      new Request('http://local.test/api/bandsintown?artist=Other%20Band&include_past=true'),
    )
    expect(res.status).toBe(200)
    expect(resolveBandsintownArtistName).toHaveBeenCalled()
    expect(fetchBandsintownEventsFromApi).toHaveBeenCalledWith('Neuroklast', 'site-key', true)
    expect(fetchBandsintownEventsFromApi).not.toHaveBeenCalledWith(
      'Other Band',
      expect.anything(),
      expect.anything(),
    )
  })
})
