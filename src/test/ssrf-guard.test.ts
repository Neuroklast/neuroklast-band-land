import { describe, expect, it, vi } from 'vitest'

vi.mock('node:dns/promises', () => {
  const resolve4 = vi.fn(async () => ['8.8.8.8'])
  const resolve6 = vi.fn(async () => [] as string[])
  return { resolve4, resolve6, default: { resolve4, resolve6 } }
})

import { fetchUrlWithResolvedCheck, isBlockedHost, isBlockedResolvedIp, lookupPinnedTo } from '@/lib/ssrf-guard'

describe('ssrf-guard', () => {
  it('blocks localhost and private host patterns', () => {
    expect(isBlockedHost('localhost')).toBe(true)
    expect(isBlockedHost('127.0.0.1')).toBe(true)
    expect(isBlockedHost('10.0.0.1')).toBe(true)
    expect(isBlockedHost('metadata.google.internal')).toBe(true)
  })

  it('allows public hostnames', () => {
    expect(isBlockedHost('cdn.example.com')).toBe(false)
    expect(isBlockedHost('drive.google.com')).toBe(false)
  })

  it('blocks private resolved IPs', () => {
    expect(isBlockedResolvedIp('127.0.0.1')).toBe(true)
    expect(isBlockedResolvedIp('192.168.1.1')).toBe(true)
    expect(isBlockedResolvedIp('::ffff:169.254.169.254')).toBe(true)
    expect(isBlockedResolvedIp('8.8.8.8')).toBe(false)
  })

  it('does not follow a redirect after the DNS check', async () => {
    const fetchMock = vi.fn(
      async () => new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/' } }),
    )
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchUrlWithResolvedCheck('https://cdn.example.com/a.png')).rejects.toThrow(
      'Blocked redirect',
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'https://cdn.example.com/a.png',
      expect.objectContaining({ redirect: 'manual', dispatcher: expect.anything() }),
    )
  })

  it('pins the download to the address already approved', () => {
    const lookup = lookupPinnedTo('8.8.8.8')
    lookup('cdn.example.com', {}, (err, address) => {
      expect(err).toBeNull()
      expect(address).toBe('8.8.8.8')
    })
    lookup('cdn.example.com', { all: true }, (err, address) => {
      expect(err).toBeNull()
      expect(address).toEqual([{ address: '8.8.8.8', family: 4 }])
    })
  })
})