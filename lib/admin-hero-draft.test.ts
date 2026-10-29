import { describe, expect, it } from 'vitest'
import {
  composeHeroPayload,
  createHeroEditorDraft,
  heroEditorReducer,
} from '@/lib/admin-hero-draft'

describe('hero editor draft and persisted serialization', () => {
  it('restores historic defaults and preserves preview-only fallback behavior', () => {
    const draft = createHeroEditorDraft({})
    expect(draft).toMatchObject({
      headline: 'NEUROKLAST',
      tagline: 'Industrial Metal / Drum & Bass',
      ctaLabel: 'Listen Now',
      ctaUrl: '#releases',
      logoImageStoragePath: '',
      logoImageUrl: '',
      backgroundImageStoragePath: '',
      backgroundImageUrl: '',
      backgroundImageOpacity: 0.35,
      bootSequenceEnabled: true,
      logoWidthPercent: 55,
      logoWidthPercentMobile: 90,
      powerGlitch: {
        mode: 'off', durationMs: 2000, sliceCount: 6,
        shake: true, hueRotate: true, pulse: false, continuous: false,
      },
    })
    const payload = composeHeroPayload(draft)
    expect(payload.logoImageUrl).toBeNull()
    expect(payload.logoImageStoragePath).toBeNull()
    expect(payload.backgroundImageUrl).toBeNull()
    expect(payload.backgroundImageStoragePath).toBeNull()
  })

  it('retains full stored JSON field order and the nested PowerGlitch schema', () => {
    const draft = createHeroEditorDraft({
      headline: 'Custom text',
      tagline: '',
      ctaLabel: '',
      ctaUrl: '',
      backgroundImageOpacity: 0,
      bootSequenceEnabled: false,
      logoWidthPercent: 66,
      logoWidthPercentMobile: 97,
      powerGlitch: {
        mode: 'always', durationMs: 3200, sliceCount: 4, shake: false,
        hueRotate: false, pulse: true, continuous: true,
      },
    })
    const payload = composeHeroPayload(draft)
    expect(Object.keys(payload)).toEqual([
      'headline', 'tagline', 'ctaLabel', 'ctaUrl',
      'logoImageStoragePath', 'logoImageUrl',
      'backgroundImageStoragePath', 'backgroundImageUrl',
      'backgroundImageOpacity', 'bootSequenceEnabled',
      'logoWidthPercent', 'logoWidthPercentMobile', 'powerGlitch',
    ])
    expect(Object.keys(payload.powerGlitch)).toEqual([
      'mode', 'durationMs', 'sliceCount', 'shake', 'hueRotate', 'pulse', 'continuous',
    ])
    expect(payload).toMatchObject({
      headline: 'Custom text',
      tagline: '',
      ctaLabel: '',
      ctaUrl: '',
      backgroundImageOpacity: 0,
      bootSequenceEnabled: false,
      logoWidthPercent: 66,
      logoWidthPercentMobile: 97,
      powerGlitch: {
        mode: 'always', durationMs: 3200, sliceCount: 4, shake: false,
        hueRotate: false, pulse: true, continuous: true,
      },
    })
  })

  it('uses legacy wordmark widths and existing clamping rules', () => {
    const draft = createHeroEditorDraft({
      logoMaxHeightRem: 24,
      logoWidthPercentMobile: 88,
      powerGlitch: { durationMs: 12000, sliceCount: 1, mode: 'hover' },
    })
    expect(draft.logoWidthPercent).toBe(50)
    expect(draft.logoWidthPercentMobile).toBe(88)
    expect(draft.powerGlitch).toMatchObject({ mode: 'hover', durationMs: 8000, sliceCount: 2 })
  })

  it('resolves media paths together and retains the current URL for path-only uploads', () => {
    const previous = createHeroEditorDraft({
      logoImageUrl: 'https://cdn.example/logo.png',
      backgroundImageUrl: 'https://cdn.example/background.png',
    })
    const next = heroEditorReducer(previous, { type: 'logoResolved', path: 'hero/logo/new.png' })
    expect(next.logoImageStoragePath).toBe('hero/logo/new.png')
    expect(next.logoImageUrl).toBe(previous.logoImageUrl)
    const withBackground = heroEditorReducer(next, {
      type: 'backgroundResolved',
      path: 'hero/background/new.png',
      publicUrl: 'https://cdn.example/new-background.png',
    })
    expect(withBackground.backgroundImageStoragePath).toBe('hero/background/new.png')
    expect(withBackground.backgroundImageUrl).toBe('https://cdn.example/new-background.png')
    expect(previous.logoImageStoragePath).toBe('')
    expect(previous.backgroundImageStoragePath).toBe('')
  })

  it('resets logo and clears background without changing unrelated hero fields', () => {
    const initial = createHeroEditorDraft({ tagline: 'Keep this', logoImageUrl: 'https://cdn.example/logo.png' })
    const started = heroEditorReducer(initial, {
      type: 'backgroundResolved', path: 'hero/background/new.png',
      publicUrl: 'https://cdn.example/bg.png',
    })
    const noLogo = heroEditorReducer(started, { type: 'resetLogo' })
    const result = heroEditorReducer(noLogo, { type: 'clearBackground' })
    expect(composeHeroPayload(result)).toMatchObject({
      tagline: 'Keep this',
      logoImageUrl: null,
      logoImageStoragePath: null,
      backgroundImageUrl: null,
      backgroundImageStoragePath: null,
    })
    expect(result.powerGlitch).toBe(initial.powerGlitch)
  })

  it('merges rapidly queued field and glitch edits without losing sibling values', () => {
    const initial = createHeroEditorDraft({})
    const one = heroEditorReducer(initial, {
      type: 'patch', changes: { headline: 'NEW', backgroundImageOpacity: 0 },
    })
    const two = heroEditorReducer(one, { type: 'powerGlitch', changes: { mode: 'hover', shake: false } })
    const three = heroEditorReducer(two, { type: 'powerGlitch', changes: { pulse: true, sliceCount: 9 } })
    const four = heroEditorReducer(three, { type: 'toggleBoot' })
    expect(composeHeroPayload(four)).toMatchObject({
      headline: 'NEW', backgroundImageOpacity: 0, bootSequenceEnabled: false,
      powerGlitch: { mode: 'hover', shake: false, pulse: true, sliceCount: 9, durationMs: 2000 },
    })
    expect(four.powerGlitch).not.toBe(initial.powerGlitch)
    expect(initial.headline).toBe('NEUROKLAST')
    expect(initial.bootSequenceEnabled).toBe(true)
  })
})
