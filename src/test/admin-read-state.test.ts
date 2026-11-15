import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkAdminReadError, loadAdminData } from '@/lib/admin-read-state'

describe('admin database read contract', () => {
  afterEach(() => vi.restoreAllMocks())

  it('preserves a successful empty result', async () => {
    expect(await loadAdminData('site-config', async () => [])).toEqual({ ok: true, data: [] })
  })

  it('returns a distinct error state after a thrown network error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await loadAdminData('site-config', async () => { throw new Error('network offline') }))
      .toEqual({ ok: false })
  })

  it('converts non-throwing Supabase PostgREST failures into explicit errors', () => {
    expect(() => checkAdminReadError({ message: 'permission denied' }, 'site-config'))
      .toThrow('site-config: permission denied')
    expect(() => checkAdminReadError(null, 'site-config')).not.toThrow()
  })
})
