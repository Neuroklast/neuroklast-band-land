import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { GET } from '@/app/api/media-fix/route'

describe('GET /api/media-fix', () => {
  it('does not list the bucket and returns a null url', async () => {
    const source = readFileSync('app/api/media-fix/route.ts', 'utf8')
    expect(source).not.toMatch(/listAllR2|ListObjects|listObjects|@\/lib\/r2/)

    const res = await GET(new Request('http://local.test/api/media-fix?path=covers%2Fa.jpg'))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true, url: null })
  })

  it('rejects a missing path', async () => {
    const res = await GET(new Request('http://local.test/api/media-fix'))
    expect(res.status).toBe(400)
  })

  it('does not call the rate limiter', () => {
    const source = readFileSync('app/api/media-fix/route.ts', 'utf8')
    expect(source).not.toContain('consumeRateLimitForRequest')
  })
})
