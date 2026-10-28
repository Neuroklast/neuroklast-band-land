import { beforeEach, describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }))
vi.mock('@/app/admin/_actions/auth', () => auth)

import { GET } from '@/app/api/admin/ffmpeg/[asset]/route'

function request(asset: string) {
  return GET(new Request('https://neuroklast.net/api/admin/ffmpeg/' + encodeURIComponent(asset)), {
    params: Promise.resolve({ asset }),
  })
}

describe('private FFmpeg admin binary delivery', () => {
  beforeEach(() => auth.requireAdmin.mockReset())

  it('denies an anonymous request for every JS/WASM asset without reading bytes', async () => {
    auth.requireAdmin.mockRejectedValue(new Error('No admin session'))
    for (const asset of ['ffmpeg.js', '814.ffmpeg.js', 'ffmpeg-core.js', 'ffmpeg-core.wasm']) {
      const response = await request(asset)
      expect(response.status).toBe(403)
      expect(response.headers.get('cache-control')).toContain('no-store')
      expect(response.headers.get('vary')).toBe('Cookie')
      expect(await response.text()).not.toContain('createFFmpegCore')
    }
    expect(auth.requireAdmin).toHaveBeenCalledTimes(4)
  })

  it('returns 404 for paths outside the four whitelisted FFmpeg assets', async () => {
    auth.requireAdmin.mockResolvedValue(undefined)
    for (const asset of ['ffmpeg-core.wasm.map', '..', 'package.json', 'ffmpeg-core.wasm/other']) {
      const response = await request(asset)
      expect(response.status).toBe(404)
      expect(response.headers.get('cache-control')).toContain('no-store')
    }
  })

  it('does not return an asset if the runtime was not packaged in this function', async () => {
    auth.requireAdmin.mockResolvedValue(undefined)
    const response = await request('ffmpeg-core.wasm')
    // CI unit tests run before prebuild copies the private binary into place.
    if (response.status === 404) expect(await response.text()).toBe('Not found')
    else {
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('application/wasm')
      expect(response.headers.get('cache-control')).toContain('no-store')
      await response.body?.cancel()
    }
  })
})
