import { describe, expect, it } from 'vitest'
import {
  buildFingerprintTelemetry,
  buildSliderTelemetry,
  formatAuthClock,
  formatLocalAuthClock,
  sessionHex,
} from '@/lib/terminal-auth-telemetry'

describe('sessionHex', () => {
  it('returns an 8-character uppercase hex id', () => {
    expect(sessionHex(123456)).toMatch(/^[0-9A-F]{8}$/)
  })

  it('changes with the seed', () => {
    expect(sessionHex(1)).not.toBe(sessionHex(2))
  })
})

describe('formatAuthClock', () => {
  it('formats hours minutes seconds and milliseconds', () => {
    expect(formatAuthClock(new Date('2026-09-14T08:07:09.045Z'))).toBe('08:07:09.045')
  })
})

describe('formatLocalAuthClock', () => {
  it('pads local time fields', () => {
    const date = new Date(2026, 8, 14, 7, 5, 9, 4)
    expect(formatLocalAuthClock(date)).toBe('07:05:09.004')
  })
})

describe('buildFingerprintTelemetry', () => {
  it('counts minutiae toward 24 as progress rises', () => {
    expect(buildFingerprintTelemetry(0, 0).minutiae).toBe(0)
    expect(buildFingerprintTelemetry(0.5, 0).minutiae).toBe(12)
    expect(buildFingerprintTelemetry(1, 0).minutiae).toBe(24)
  })

  it('marks liveness only after 70% contact', () => {
    expect(buildFingerprintTelemetry(0.69, 0).liveness).toBe('PEND')
    expect(buildFingerprintTelemetry(0.7, 0).liveness).toBe('OK')
  })

  it('ticks the hex dump with time', () => {
    const a = buildFingerprintTelemetry(0.4, 100)
    const b = buildFingerprintTelemetry(0.4, 280)
    expect(a.hexDump).toMatch(/^0x[0-9A-F]{4}(?: 0x[0-9A-F]{4}){3}$/)
    expect(a.hexDump).not.toBe(b.hexDump)
  })
})

describe('buildSliderTelemetry', () => {
  it('maps latch to HUD labels', () => {
    expect(buildSliderTelemetry(0, 'open', 0).latch).toBe('OPEN')
    expect(buildSliderTelemetry(0.4, 'armed', 0).latch).toBe('ARMED')
    expect(buildSliderTelemetry(1, 'sealed', 0).latch).toBe('SEALED')
  })

  it('scales torque and vector with progress', () => {
    const idle = buildSliderTelemetry(0, 'open', 0)
    const mid = buildSliderTelemetry(0.5, 'armed', 0)
    expect(idle.torque).toBe(0)
    expect(mid.torque).toBeGreaterThan(idle.torque)
    expect(mid.vector).toBeGreaterThan(idle.vector)
  })
})
