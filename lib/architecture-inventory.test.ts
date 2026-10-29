import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'

describe('architecture inventory', () => {
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
