import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

describe('legacy duplicate source boundary', () => {
  it('contains no byte-identical src/ mirrors of canonical modules', () => {
    const stdout = execFileSync(process.execPath, ['scripts/audit-legacy-imports.mjs', '--json'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    })
    const result: {
      legacyFiles: number
      exactMirrors: number
      exactMirrorReferences: Array<{ legacy: string }>
      directlyImportedLegacy: Array<{ path: string }>
    } = JSON.parse(stdout)

    // The legacy project is deliberately still present, including its tests.
    expect(result.legacyFiles).toBeGreaterThan(100)
    // Byte-identical root/src twins have no reason to diverge under two paths.
    expect(result.exactMirrors).toBe(0)
    expect(result.exactMirrorReferences).toEqual([])
    // Other legacy modules may still be used and must not be bulk deleted.
    expect(Array.isArray(result.directlyImportedLegacy)).toBe(true)
  })
})
