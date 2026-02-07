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
    let resolveApi: ((v: Response) => void) | undefined
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

  it('handles race conditions between fetch and update', async () => {
    let resolveApi: ((v: Response) => void) | undefined
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/kv?')) {
        return new Promise((res) => { resolveApi = res })
      }
      return Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))
    })

    const { result } = renderHook(() => useKV('race-key', 'default'))

    // Update before initial load
    act(() => { result.current[1]('premature') })
    expect(result.current[0]).toBe('premature')

    // Resolve load
    resolveApi!(new Response(JSON.stringify({ value: 'server-data' }), { status: 200 }))
    await waitFor(() => expect(result.current[2]).toBe(true))
  })

  it('sends admin token with POST when authenticated', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: 'data' }), { status: 200 })
    )

    sessionStorage.setItem('admin-token', 'my-token')

    const { result } = renderHook(() => useKV('auth-key', 'default'))
    await waitFor(() => expect(result.current[2]).toBe(true))

    act(() => { result.current[1]('new-value') })

    await waitFor(() => {
      const postCalls = fetchSpy.mock.calls.filter(
        (call) => call[1] && (call[1] as RequestInit).method === 'POST'
      )
      expect(postCalls).toHaveLength(1)
      const headers = (postCalls[0][1] as RequestInit).headers as Record<string, string>
      expect(headers['x-admin-token']).toBe('my-token')
    })
  })

  it('does not POST when no admin token is present', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: 'data' }), { status: 200 })
    )

    // Make sure no admin token
    sessionStorage.removeItem('admin-token')

    const { result } = renderHook(() => useKV('no-auth-key', 'default'))
    await waitFor(() => expect(result.current[2]).toBe(true))

    act(() => { result.current[1]('new-value') })

    // Wait a tick to ensure any pending POSTs would have been initiated
    await new Promise(r => setTimeout(r, 50))

    const postCalls = fetchSpy.mock.calls.filter(
      (call) => call[1] && (call[1] as RequestInit).method === 'POST'
    )
    expect(postCalls).toHaveLength(0)
  })

  it('still updates local state and localStorage when POST fails', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // Initial GET succeeds
        return Promise.resolve(new Response(JSON.stringify({ value: 'initial' }), { status: 200 }))
      }
      // POST fails
      return Promise.resolve(new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 }))
    })

    sessionStorage.setItem('admin-token', 'token')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useKV('fail-post-key', 'default'))
    await waitFor(() => expect(result.current[2]).toBe(true))

    act(() => { result.current[1]('updated-locally') })

    // Local state should be updated regardless
    expect(result.current[0]).toBe('updated-locally')
    // localStorage should be updated
    expect(JSON.parse(localStorage.getItem('kv:fail-post-key')!)).toBe('updated-locally')

    warnSpy.mockRestore()
  })

  it('still updates local state when POST network error occurs', async () => {
    let callCount = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve(new Response(JSON.stringify({ value: 'initial' }), { status: 200 }))
      }
      return Promise.reject(new Error('Network error'))
    })

    sessionStorage.setItem('admin-token', 'token')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useKV('network-err-key', 'default'))
    await waitFor(() => expect(result.current[2]).toBe(true))

    act(() => { result.current[1]('updated-offline') })

    expect(result.current[0]).toBe('updated-offline')
    expect(JSON.parse(localStorage.getItem('kv:network-err-key')!)).toBe('updated-offline')

    warnSpy.mockRestore()
  })

  it('handles non-200 GET response gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Server Error', { status: 500 })
    )

    const { result } = renderHook(() => useKV('server-error-key', 'fallback'))
    await waitFor(() => expect(result.current[2]).toBe(true))
    expect(result.current[0]).toBe('fallback')
  })

  it('allows value to be explicitly null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ value: 'initial' }), { status: 200 })
    )

    const { result } = renderHook(() => useKV<string | null>('null-key', 'default'))
    await waitFor(() => expect(result.current[2]).toBe(true))

    sessionStorage.setItem('admin-token', 'token')
    act(() => { result.current[1](null) })
    expect(result.current[0]).toBeNull()
  })
})
