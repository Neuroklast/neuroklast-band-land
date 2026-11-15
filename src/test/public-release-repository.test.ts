import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchPublicReleaseRows, PUBLIC_RELEASE_COLUMNS } from '@/lib/public-fetch'
import { createPublicClient } from '@/lib/supabaseServer'

function makeClient(result: { data: unknown[] | null; error: { message: string; code: string } | null }) {
  const order = vi.fn().mockResolvedValue(result)
  const eq = vi.fn().mockReturnValue({ order })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockReturnValue({ select })
  return { client: { from } as unknown as ReturnType<typeof createPublicClient>, from, select, eq, order }
}

describe('canonical public release query', () => {
  afterEach(() => vi.restoreAllMocks())

  it('queries only the canonical active release projection', async () => {
    const entry = { id: 'r1', title: 'Album', type: 'album', release_date: '2025-01-01' }
    const { client, from, select, eq, order } = makeClient({ data: [entry], error: null })
    expect(await fetchPublicReleaseRows(client)).toEqual([entry])
    expect(from).toHaveBeenCalledWith('releases')
    expect(select).toHaveBeenCalledWith(PUBLIC_RELEASE_COLUMNS)
    expect(eq).toHaveBeenCalledWith('active', true)
    expect(order).toHaveBeenCalledWith('display_order', { ascending: true })
  })

  it('treats a successful zero-row query as empty', async () => {
    expect(await fetchPublicReleaseRows(makeClient({ data: [], error: null }).client)).toEqual([])
  })

  it('does not hide schema/database failure by returning an empty discography or retrying a weaker query', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { client, select } = makeClient({ data: null, error: { code: '42703', message: 'unknown column' } })
    await expect(fetchPublicReleaseRows(client)).rejects.toThrow('Unable to load public releases')
    expect(select).toHaveBeenCalledTimes(1)
  })
})
