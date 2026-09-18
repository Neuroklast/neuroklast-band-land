import type { SliderLatch } from '@/lib/terminal-auth-physics'

export interface FingerprintTelemetry {
  minutiae: number
  ridgeDelta: number
  liveness: 'PEND' | 'OK'
  capArray: string
  hexDump: string
}

export interface SliderTelemetry {
  latch: 'OPEN' | 'ARMED' | 'SEALED'
  torque: number
  vector: number
  crc: string
}

const LATCH_LABEL: Record<SliderLatch, SliderTelemetry['latch']> = {
  open: 'OPEN',
  armed: 'ARMED',
  sealed: 'SEALED',
}

function hash32(seed: number): number {
  let x = seed | 0
  x ^= x << 13
  x ^= x >>> 17
  x ^= x << 5
  return x >>> 0
}

export function sessionHex(seed: number): string {
  return hash32(seed * 2654435761).toString(16).toUpperCase().padStart(8, '0')
}

export function formatAuthClock(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const mm = String(date.getUTCMinutes()).padStart(2, '0')
  const ss = String(date.getUTCSeconds()).padStart(2, '0')
  const ms = String(date.getUTCMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

export function formatLocalAuthClock(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  const ms = String(date.getMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

function hexWord(seed: number): string {
  return `0x${(hash32(seed) & 0xffff).toString(16).toUpperCase().padStart(4, '0')}`
}

export function buildFingerprintTelemetry(progress: number, nowMs: number): FingerprintTelemetry {
  const t = Math.min(1, Math.max(0, progress))
  const bars = Math.round(t * 6)
  return {
    minutiae: Math.round(t * 24),
    ridgeDelta: Number((t * 0.91).toFixed(2)),
    liveness: t >= 0.7 ? 'OK' : 'PEND',
    capArray: `[${'|'.repeat(bars)}${'·'.repeat(6 - bars)}]`,
    hexDump: [0, 1, 2, 3].map((index) => hexWord(Math.floor(nowMs / 80) * 17 + index * 91)).join(' '),
  }
}

export function buildSliderTelemetry(
  progress: number,
  latch: SliderLatch,
  nowMs: number,
): SliderTelemetry {
  const t = Math.min(1, Math.max(0, progress))
  return {
    latch: LATCH_LABEL[latch],
    torque: Number((t * 48.6).toFixed(1)),
    vector: Number((t * 1.0).toFixed(3)),
    crc: hexWord(Math.floor(nowMs / 90) * 23 + Math.round(t * 100)).slice(2),
  }
}
