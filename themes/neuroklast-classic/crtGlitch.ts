export const CRT_GLITCH_MS = 110

export function scheduleCrtIdle(roll: number, first = false): number {
  const t = Math.max(0, Math.min(1, roll))
  if (first) return 700 + Math.floor(t * 500)
  return 2800 + Math.floor(t * 3200)
}

export function crtGlitchVars(seed: number): Record<string, string> {
  const n = Math.abs(Math.floor(seed)) % 1000
  const y1 = 8 + (n % 62)
  const h1 = 7 + (n % 8)
  const y2 = 18 + ((n * 7) % 54)
  const h2 = 5 + ((n * 3) % 7)
  const y3 = 28 + ((n * 13) % 48)
  const h3 = 6 + ((n * 5) % 6)
  return {
    '--nk-g-amp': `${2.6 + (n % 16) / 10}%`,
    '--nk-g-amp2': `${-(2 + (n % 12) / 10)}%`,
    '--nk-g-y1': `${y1}%`,
    '--nk-g-bot1': `${Math.max(0, 100 - y1 - h1)}%`,
    '--nk-g-y2': `${y2}%`,
    '--nk-g-bot2': `${Math.max(0, 100 - y2 - h2)}%`,
    '--nk-g-y3': `${y3}%`,
    '--nk-g-bot3': `${Math.max(0, 100 - y3 - h3)}%`,
  }
}
