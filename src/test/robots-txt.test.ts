import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('public/robots.txt', () => {
  const robots = readFileSync(resolve(process.cwd(), 'public/robots.txt'), 'utf8')

  it('allows the public site and points crawlers at the sitemap', () => {
    expect(robots).toMatch(/User-agent:\s*\*/)
    expect(robots).toMatch(/Allow:\s*\//)
    expect(robots).toMatch(/Sitemap:\s*https:\/\/neuroklast\.net\/sitemap\.xml/)
  })

  it('disallows admin and API crawls', () => {
    expect(robots).toMatch(/Disallow:\s*\/admin\//)
    expect(robots).toMatch(/Disallow:\s*\/api\//)
  })
})
