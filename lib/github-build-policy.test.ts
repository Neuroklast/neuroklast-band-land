import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

describe('build execution policy', () => {
  it('prevents Next.js / Vercel builds in GitHub Actions', () => {
    const output = execFileSync(process.execPath, ['scripts/check-github-builds.mjs'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    })
    expect(output).toContain('local builds only')
    const ci = readFileSync('.github/workflows/ci.yml', 'utf8')
    expect(ci).not.toMatch(/^\s+build:\s*$/m)
    expect(existsSync('.github/workflows/lighthouse.yml')).toBe(false)
  })
})
