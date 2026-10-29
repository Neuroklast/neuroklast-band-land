import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

describe('architecture inventory', () => {
  it('keeps both stylesheet entrypoints on the single canonical animations CSS', () => {
    const rootCss = readFileSync('app/globals.css', 'utf8')
    const legacyCss = readFileSync('src/index.css', 'utf8')
    const animations = readFileSync('styles/animations.css', 'utf8')
    expect(rootCss).toContain("@import '../styles/animations.css';")
    expect(legacyCss).toContain("@import '../styles/animations.css';")
    expect(rootCss).not.toContain("../src/animations.css")
    expect(animations).toContain('@keyframes red-glitch')
    expect(animations).toContain('@keyframes terminal-cursor')
  })

  it('runs as a read-only check and emits parseable statistics', () => {
    const output = execFileSync(process.execPath, ['scripts/audit-architecture.mjs', '--check', '--json'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    })
    const result: {
      trackedFiles: number
      legacyFiles: number
      legacyTests: number
      legacyNameMirrors: number
      forbiddenRuntimeImports: Array<{ file: string; import: string }>
    } = JSON.parse(output)
    expect(result.trackedFiles).toBeGreaterThan(0)
    expect(result.legacyTests).toBeGreaterThan(0)
    expect(result.legacyFiles).toBeGreaterThanOrEqual(result.legacyTests)
    expect(result.legacyNameMirrors).toBeGreaterThan(0)
    expect(result.forbiddenRuntimeImports).toEqual([])
  })
})
