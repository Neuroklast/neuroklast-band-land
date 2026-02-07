import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useKV } from '@/hooks/use-kv'

describe('useKV', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns undefined initially and then the default value when API returns nothing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: null }), { status: 200 })
    )

    const { result } = renderHook(() => useKV('test-key', { foo: 'bar' }))

    // Initially undefined and not loaded
    expect(result.current[0]).toBeUndefined()
    expect(result.current[2]).toBe(false)

    // After loading
    await waitFor(() => expect(result.current[2]).toBe(true))
    expect(result.current[0]).toEqual({ foo: 'bar' })
  })

  it('returns value from API when available', async () => {
    const apiData = { name: 'NEUROKLAST', genres: ['Techno'] }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: apiData }), { status: 200 })
    )

    const { result } = renderHook(() => useKV('band-data', { name: '', genres: [] }))

    await waitFor(() => expect(result.current[2]).toBe(true))
    expect(result.current[0]).toEqual(apiData)
  })

  it('syncs API data to localStorage as backup', async () => {
    const apiData = { name: 'TEST' }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: apiData }), { status: 200 })
    )

    renderHook(() => useKV('sync-key', {}))

    await waitFor(() => {
      const stored = localStorage.getItem('kv:sync-key')
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toEqual(apiData)
    })
  })

  it('falls back to localStorage when API fails', async () => {
    localStorage.setItem('kv:fallback-key', JSON.stringify({ saved: true }))
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useKV('fallback-key', { saved: false }))

    await waitFor(() => expect(result.current[2]).toBe(true))
    expect(result.current[0]).toEqual({ saved: true })
  })

  it('updateValue persists to localStorage immediately', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: null }), { status: 200 })
    )

    const { result } = renderHook(() => useKV('update-key', 'initial'))

    await waitFor(() => expect(result.current[2]).toBe(true))

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(localStorage.getItem('kv:update-key')!)).toBe('updated')
  })

  it('updateValue with updater function receives current value', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: 10 }), { status: 200 })
    )

    const { result } = renderHook(() => useKV<number>('counter', 0))

    await waitFor(() => expect(result.current[2]).toBe(true))

    act(() => {
      result.current[1]((prev) => (prev || 0) + 5)
    })

    expect(result.current[0]).toBe(15)
  })

  it('does not POST to KV before initial load completes', async () => {
    let resolveApi: (v: Response) => void
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/kv?')) {
        return new Promise((res) => { resolveApi = res })
      }
      return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))
    })

    const { result } = renderHook(() => useKV('race-key', 'default'))

    // Update BEFORE load completes
    act(() => {
      result.current[1]('premature-update')
    })

    // Only the initial GET should have been called, no POST
    const postCalls = fetchSpy.mock.calls.filter(
      (call) => call[1] && (call[1] as RequestInit).method === 'POST'
    )
    expect(postCalls).toHaveLength(0)

    // Now resolve the initial load
    resolveApi!(new Response(JSON.stringify({ value: 'real-data' }), { status: 200 }))

    await waitFor(() => expect(result.current[2]).toBe(true))
  })
})
