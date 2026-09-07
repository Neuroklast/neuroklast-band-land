export const DEFAULT_LOADING_LOGO = '/assets/images/baphomet.svg'
export const DEFAULT_LOADING_BOOT_LABEL = 'NEUROKLAST // BOOT SEQUENCE'
export const DEFAULT_LOADING_DURATION_MS = 3000

export const DEFAULT_LOADING_HACKING_TEXTS = [
  '> INITIALIZING NEURAL INTERFACE...',
  '> LOADING CORE MODULES...',
  '> ESTABLISHING SECURE LINK...',
  '> DECRYPTING DATASTREAM...',
  '> COMPILING AUDIO ENGINE...',
  '> SYNCING FREQUENCY MATRIX...',
  '> ACTIVATING HUD OVERLAY...',
  '> LOADING VISUAL CORTEX...',
  '> PROCESSING SIGNAL CHAIN...',
  '> CALIBRATING BPM RESONANCE...',
  '> FINALIZING BOOT SEQUENCE...',
  '> SYSTEM ONLINE // ACCESS GRANTED',
]

export const DEFAULT_LOADING_CODE_FRAGMENTS = [
  'fn init_neural() -> Result<()> {',
  '  let freq = 150.0_f64;',
  '  signal::process(bpm);',
  '  audio.connect(output)?;',
  '  hud.render(frame)?;',
  'const NK = 0xFF2222;',
  'mov eax, [neuro+0x1A]',
  'jmp 0xDEADBEEF',
  'syscall.exec("init")',
  '  decrypt(stream, key);',
  'KERNEL: audio_engine [OK]',
  'SUBSYS: hud_display [OK]',
  'NODE: freq_matrix v2.0.1',
  'HASH: 0xA3F7B2C1D8E9',
  '00110101 01001110 01001011',
  'export NK_MODE=ACTIVATED',
]

export interface LoadingScreenConfig {
  enabled: boolean
  logoStoragePath: string
  logoUrl: string
  bootLabel: string
  hackingTexts: string[]
  codeFragments: string[]
  durationMs: number
}

function asStringList(value: unknown, fallback: string[]): string[] {
  if (typeof value === 'string') {
    const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    return lines.length > 0 ? lines : fallback
  }
  if (Array.isArray(value)) {
    const lines = value.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    return lines.length > 0 ? lines : fallback
  }
  return fallback
}

export function parseLoadingScreenConfig(raw: unknown): LoadingScreenConfig {
  const source =
    raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const durationRaw = source.durationMs
  const durationSec = source.durationSeconds
  let durationMs = DEFAULT_LOADING_DURATION_MS
  if (typeof durationRaw === 'number' && Number.isFinite(durationRaw)) durationMs = durationRaw
  else if (typeof durationSec === 'number' && Number.isFinite(durationSec)) durationMs = durationSec * 1000
  durationMs = Math.max(1000, Math.min(8000, Math.round(durationMs)))

  const logoUrl =
    typeof source.logoUrl === 'string' && source.logoUrl.trim()
      ? source.logoUrl.trim()
      : DEFAULT_LOADING_LOGO

  return {
    enabled: source.enabled !== false,
    logoStoragePath: typeof source.logoStoragePath === 'string' ? source.logoStoragePath : '',
    logoUrl,
    bootLabel:
      typeof source.bootLabel === 'string' && source.bootLabel.trim()
        ? source.bootLabel.trim()
        : DEFAULT_LOADING_BOOT_LABEL,
    hackingTexts: asStringList(source.hackingTexts, DEFAULT_LOADING_HACKING_TEXTS),
    codeFragments: asStringList(source.codeFragments, DEFAULT_LOADING_CODE_FRAGMENTS),
    durationMs,
  }
}
