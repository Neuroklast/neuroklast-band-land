import { afterEach, describe, expect, it, vi } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fetchWithRetry } from '@/lib/fetch-retry'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('canonical legacy utility reuse', () => {
  it('preserves canonical imports and removes old copies', () => {
    for (const [file, expected] of [
      ['src/lib/odesli.ts', "from '@/lib/fetch-retry'"],
      ['src/lib/itunes.ts', "from '@/lib/fetch-retry'"],
      ['src/lib/color-utils.ts', "from '@/lib/contrast'"],
    ]) {
      expect(readFileSync(file, 'utf8')).toContain(expected)
    }
    expect(existsSync('src/lib/fetch-retry.ts')).toBe(false)
    expect(existsSync('src/lib/contrast.ts')).toBe(false)
    expect(existsSync('lib/fetch-retry.ts')).toBe(true)
    expect(existsSync('lib/contrast.ts')).toBe(true)
  })

  it('keeps Retry-After behavior for the common fetch implementation', async () => {
    const mock = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 429, headers: { 'Retry-After': '0' } }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }))
    vi.stubGlobal('fetch', mock)

    const response = await fetchWithRetry('https://example.com/releases')
    expect(response.status).toBe(200)
    expect(mock).toHaveBeenCalledTimes(2)
    expect(mock).toHaveBeenCalledWith('https://example.com/releases', undefined)
  })

  it('reports legacy mirror references without changing files', () => {
    const raw = execFileSync(process.execPath, ['scripts/audit-legacy-imports.mjs', '--json'], {
      encoding: 'utf8',
      cwd: process.cwd(),
    })
    const report: {
      legacyFiles: number
      sameNameMirrors: number
      exactMirrors: number
      exactMirrorReferences: { legacy: string; staticImporters: unknown[] }[]
    } = JSON.parse(raw)
    expect(report.legacyFiles).toBeGreaterThan(100)
    expect(report.sameNameMirrors).toBeGreaterThanOrEqual(report.exactMirrors)
    expect(report.exactMirrorReferences).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ legacy: 'src/lib/fetch-retry.ts' }),
      expect.objectContaining({ legacy: 'src/lib/contrast.ts' }),
    ]))
  })
})
