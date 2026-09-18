export type HeroPowerGlitchMode = 'off' | 'always' | 'hover'

export interface HeroPowerGlitchConfig {
  mode: HeroPowerGlitchMode
  durationMs: number
  sliceCount: number
  shake: boolean
  hueRotate: boolean
  pulse: boolean
  continuous: boolean
}

export const DEFAULT_HERO_POWER_GLITCH: HeroPowerGlitchConfig = {
  mode: 'off',
  durationMs: 2000,
  sliceCount: 6,
  shake: true,
  hueRotate: true,
  pulse: false,
  continuous: false,
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function parseHeroPowerGlitch(raw: unknown): HeroPowerGlitchConfig {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const mode = source.mode
  return {
    mode: mode === 'always' || mode === 'hover' || mode === 'off' ? mode : DEFAULT_HERO_POWER_GLITCH.mode,
    durationMs:
      typeof source.durationMs === 'number' && Number.isFinite(source.durationMs)
        ? clamp(Math.round(source.durationMs), 120, 8000)
        : DEFAULT_HERO_POWER_GLITCH.durationMs,
    sliceCount:
      typeof source.sliceCount === 'number' && Number.isFinite(source.sliceCount)
        ? clamp(Math.round(source.sliceCount), 2, 16)
        : DEFAULT_HERO_POWER_GLITCH.sliceCount,
    shake: typeof source.shake === 'boolean' ? source.shake : DEFAULT_HERO_POWER_GLITCH.shake,
    hueRotate: typeof source.hueRotate === 'boolean' ? source.hueRotate : DEFAULT_HERO_POWER_GLITCH.hueRotate,
    pulse: typeof source.pulse === 'boolean' ? source.pulse : DEFAULT_HERO_POWER_GLITCH.pulse,
    continuous: typeof source.continuous === 'boolean' ? source.continuous : DEFAULT_HERO_POWER_GLITCH.continuous,
  }
}

export function toPowerGlitchOptions(config: HeroPowerGlitchConfig) {
  const hover = config.mode === 'hover'
  return {
    playMode: hover ? 'hover' as const : 'always' as const,
    createContainers: true,
    hideOverflow: true,
    optimizeSeo: true,
    timing: {
      duration: hover ? Math.min(config.durationMs, 800) : config.durationMs,
      iterations: hover ? 1 : Infinity,
    },
    glitchTimeSpan: (config.continuous || hover ? false : { start: 0.45, end: 0.72 }) as
      | false
      | { start: number; end: number },
    shake: config.shake
      ? { velocity: 15, amplitudeX: 0.18, amplitudeY: 0.12 }
      : (false as const),
    slice: {
      count: config.sliceCount,
      velocity: hover ? 20 : 15,
      minHeight: 0.02,
      maxHeight: 0.15,
      hueRotate: config.hueRotate,
    },
    pulse: config.pulse ? { scale: 1.04 } : (false as const),
  }
}
