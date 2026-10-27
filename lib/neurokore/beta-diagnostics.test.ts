import { describe, expect, it } from 'vitest'
import { betaDiagnosticSchema } from './beta-diagnostics'

const valid = {
  schema: 1, version: '0.8.3-beta', code: 'js-error', os: 'windows11',
  host: 'fl-studio', format: 'vst3', cpuCores: 16, memoryGb: 32,
  sampleRate: 48000, bufferSize: 256, bundle: 'app-123.js', line: 17,
}
describe('NEUROKORE beta diagnostics privacy contract', () => {
  it('accepts technical metadata only', () => {
    expect(betaDiagnosticSchema.safeParse(valid).success).toBe(true)
    for (const key of ['email', 'license', 'stack', 'message', 'deviceId', 'ip', 'preset', 'project']) {
      expect(betaDiagnosticSchema.safeParse({ ...valid, [key]: 'sensitive' }).success).toBe(false)
    }
  })
  it('rejects arbitrary bundle locations and oversized data', () => {
    expect(betaDiagnosticSchema.safeParse({ ...valid, bundle: 'C:/Users/me/foo.js' }).success).toBe(false)
    expect(betaDiagnosticSchema.safeParse({ ...valid, line: 100000000 }).success).toBe(false)
  })
})
