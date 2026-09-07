import { describe, expect, it } from 'vitest'
import {
  DEFAULT_LOADING_BOOT_LABEL,
  DEFAULT_LOADING_DURATION_MS,
  DEFAULT_LOADING_LOGO,
  parseLoadingScreenConfig,
} from '@/lib/loading-screen-config'

describe('parseLoadingScreenConfig', () => {
  it('uses defaults when empty', () => {
    const config = parseLoadingScreenConfig({})
    expect(config.enabled).toBe(true)
    expect(config.logoUrl).toBe(DEFAULT_LOADING_LOGO)
    expect(config.bootLabel).toBe(DEFAULT_LOADING_BOOT_LABEL)
    expect(config.durationMs).toBe(DEFAULT_LOADING_DURATION_MS)
    expect(config.hackingTexts.length).toBeGreaterThan(3)
  })

  it('parses newline status lines and duration seconds', () => {
    const config = parseLoadingScreenConfig({
      enabled: false,
      logoUrl: '/custom.svg',
      bootLabel: 'BOOT',
      hackingTexts: '> A...\n> B...',
      durationSeconds: 5,
    })
    expect(config.enabled).toBe(false)
    expect(config.logoUrl).toBe('/custom.svg')
    expect(config.bootLabel).toBe('BOOT')
    expect(config.hackingTexts).toEqual(['> A...', '> B...'])
    expect(config.durationMs).toBe(5000)
  })
})
