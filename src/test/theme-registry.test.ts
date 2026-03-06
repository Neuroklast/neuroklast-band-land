import { describe, it, expect } from 'vitest'
import {
  getTheme,
  getAllThemes,
  getActiveTheme,
  useThemeSlots,
  THEME_CATALOG,
  cyberpunkTheme,
  minimalTheme,
  elegantTheme,
  neonTheme,
  retroTheme,
  zardonicTheme,
  neuroklastClassicTheme,
  artDecoCyberpunkTheme,
  vhsRetroTheme,
  steampunkTheme,
  analogDarkMetalTheme,
  glitchNoirTheme,
  signalStaticTheme,
} from '@/lib/theme-registry'
import { DESIGN_PRESETS } from '@/lib/design-presets'

// Ensure registry is populated (side effects run on import)

describe('Theme Registry — all themes registered', () => {
  it('has 13 built-in themes', () => {
    const themes = getAllThemes()
    expect(themes).toHaveLength(13)
  })

  it('has expected IDs', () => {
    const ids = getAllThemes().map((t) => t.id)
    expect(ids).toContain('cyberpunk')
    expect(ids).toContain('minimal')
    expect(ids).toContain('elegant')
    expect(ids).toContain('neon')
    expect(ids).toContain('retro')
    expect(ids).toContain('zardonic')
    expect(ids).toContain('neuroklast-classic')
    expect(ids).toContain('art-deco-cyberpunk')
    expect(ids).toContain('vhs-retro')
    expect(ids).toContain('steampunk')
    expect(ids).toContain('analog-dark-metal')
    expect(ids).toContain('glitch-noir')
    expect(ids).toContain('signal-static')
  })
})

describe('getTheme', () => {
  it('returns the correct theme for each ID', () => {
    expect(getTheme('cyberpunk')).toBe(cyberpunkTheme)
    expect(getTheme('minimal')).toBe(minimalTheme)
    expect(getTheme('elegant')).toBe(elegantTheme)
    expect(getTheme('neon')).toBe(neonTheme)
    expect(getTheme('retro')).toBe(retroTheme)
    expect(getTheme('zardonic')).toBe(zardonicTheme)
    expect(getTheme('neuroklast-classic')).toBe(neuroklastClassicTheme)
    expect(getTheme('art-deco-cyberpunk')).toBe(artDecoCyberpunkTheme)
    expect(getTheme('vhs-retro')).toBe(vhsRetroTheme)
    expect(getTheme('steampunk')).toBe(steampunkTheme)
    expect(getTheme('analog-dark-metal')).toBe(analogDarkMetalTheme)
    expect(getTheme('glitch-noir')).toBe(glitchNoirTheme)
    expect(getTheme('signal-static')).toBe(signalStaticTheme)
  })

  it('returns undefined for unknown ID', () => {
    expect(getTheme('unknown')).toBeUndefined()
    expect(getTheme('')).toBeUndefined()
  })
})

describe('getActiveTheme', () => {
  it('returns minimal when no ID is given', () => {
    expect(getActiveTheme()).toBe(minimalTheme)
  })

  it('returns the matching theme for a known ID', () => {
    expect(getActiveTheme('neon')).toBe(neonTheme)
    expect(getActiveTheme('elegant')).toBe(elegantTheme)
  })

  it('falls back to minimal for unknown ID', () => {
    expect(getActiveTheme('nonexistent')).toBe(minimalTheme)
  })
})

describe('Access levels', () => {
  it('minimal, elegant, neon, retro are free', () => {
    expect(minimalTheme.access).toBe('free')
    expect(elegantTheme.access).toBe('free')
    expect(neonTheme.access).toBe('free')
    expect(retroTheme.access).toBe('free')
  })

  it('cyberpunk, art-deco-cyberpunk, vhs-retro, steampunk, analog-dark-metal, glitch-noir, signal-static are premium', () => {
    expect(cyberpunkTheme.access).toBe('premium')
    expect(artDecoCyberpunkTheme.access).toBe('premium')
    expect(vhsRetroTheme.access).toBe('premium')
    expect(steampunkTheme.access).toBe('premium')
    expect(analogDarkMetalTheme.access).toBe('premium')
    expect(glitchNoirTheme.access).toBe('premium')
    expect(signalStaticTheme.access).toBe('premium')
  })

  it('zardonic is exclusive', () => {
    expect(zardonicTheme.access).toBe('exclusive')
    expect(zardonicTheme.exclusiveFor).toBe('zardonic')
    expect(zardonicTheme.lockedMessage).toBe('Exclusive to ZARDONIC')
  })

  it('neuroklast-classic is exclusive', () => {
    expect(neuroklastClassicTheme.access).toBe('exclusive')
    expect(neuroklastClassicTheme.exclusiveFor).toBe('neuroklast')
    expect(neuroklastClassicTheme.lockedMessage).toBe('Exclusive to NEUROKLAST')
  })
})

describe('Color presets', () => {
  it('each theme has at least one color preset', () => {
    for (const theme of getAllThemes()) {
      expect(theme.colorPresets.length, `${theme.id} has colorPresets`).toBeGreaterThan(0)
    }
  })

  it('cyberpunk has 5 color presets', () => {
    expect(cyberpunkTheme.colorPresets).toHaveLength(5)
  })

  it('minimal has 2 color presets', () => {
    expect(minimalTheme.colorPresets).toHaveLength(2)
  })

  it('neuroklast-classic has 1 color preset', () => {
    expect(neuroklastClassicTheme.colorPresets).toHaveLength(1)
  })

  it('each preset has all required color fields', () => {
    for (const theme of getAllThemes()) {
      for (const preset of theme.colorPresets) {
        expect(preset.id, `${theme.id}/${preset.id}.id`).toBeTruthy()
        expect(preset.name, `${theme.id}/${preset.id}.name`).toBeTruthy()
        expect(preset.colors.primary, `${theme.id}/${preset.id}.primary`).toBeTruthy()
        expect(preset.colors.background, `${theme.id}/${preset.id}.background`).toBeTruthy()
      }
    }
  })

  it('defaultPresetId matches an existing preset ID', () => {
    for (const theme of getAllThemes()) {
      const found = theme.colorPresets.find((p) => p.id === theme.defaultPresetId)
      expect(found, `${theme.id}.defaultPresetId`).toBeDefined()
    }
  })
})

describe('Customizability', () => {
  it('free themes allow full customization', () => {
    for (const theme of [minimalTheme, elegantTheme, neonTheme, retroTheme]) {
      expect(theme.customizability.customColors, `${theme.id}.customColors`).toBe(true)
      expect(theme.customizability.customFonts, `${theme.id}.customFonts`).toBe(true)
      expect(theme.customizability.adjustEffects, `${theme.id}.adjustEffects`).toBe(true)
    }
  })

  it('premium themes allow full customization', () => {
    for (const theme of [cyberpunkTheme, artDecoCyberpunkTheme, vhsRetroTheme, steampunkTheme, analogDarkMetalTheme]) {
      expect(theme.customizability.customColors, `${theme.id}.customColors`).toBe(true)
      expect(theme.customizability.customFonts, `${theme.id}.customFonts`).toBe(true)
      expect(theme.customizability.adjustEffects, `${theme.id}.adjustEffects`).toBe(true)
    }
  })

  it('zardonic locks font customization', () => {
    expect(zardonicTheme.customizability.customFonts).toBe(false)
    expect(zardonicTheme.customizability.customColors).toBe(true)
    expect(zardonicTheme.customizability.adjustEffects).toBe(true)
  })

  it('neuroklast-classic locks all customization', () => {
    expect(neuroklastClassicTheme.customizability.customColors).toBe(false)
    expect(neuroklastClassicTheme.customizability.customFonts).toBe(false)
    expect(neuroklastClassicTheme.customizability.adjustEffects).toBe(false)
  })
})

describe('useThemeSlots — slot fallbacks', () => {
  it('returns an object with all 7 slot component keys', () => {
    const slots = useThemeSlots()
    expect(slots.Hero).toBeDefined()
    expect(slots.Navigation).toBeDefined()
    expect(slots.LoadingScreen).toBeDefined()
    expect(slots.SectionDivider).toBeDefined()
    expect(slots.Card).toBeDefined()
    expect(slots.BackgroundEffects).toBeDefined()
    expect(slots.Footer).toBeDefined()
  })

  it('all slot values are functions (React components)', () => {
    const slots = useThemeSlots('cyberpunk')
    for (const [key, component] of Object.entries(slots)) {
      expect(typeof component, `${key} is a function`).toBe('function')
    }
  })

  it('uses fallbacks for themes with no custom slots', () => {
    const slots = useThemeSlots('minimal')
    expect(typeof slots.Hero).toBe('function')
    expect(typeof slots.Footer).toBe('function')
  })
})

// ─── Cross-layer consistency ──────────────────────────────────────────────────

describe('Cross-layer consistency — ThemePackage ↔ THEME_CATALOG ↔ DesignPreset', () => {
  it('every ThemePackage has a matching THEME_CATALOG entry', () => {
    for (const pkg of getAllThemes()) {
      const catalogEntry = THEME_CATALOG.find((t) => t.id === pkg.id)
      expect(catalogEntry, `${pkg.id} missing from THEME_CATALOG`).toBeDefined()
    }
  })

  it('every ThemePackage has a matching DesignPreset', () => {
    for (const pkg of getAllThemes()) {
      expect(DESIGN_PRESETS[pkg.id], `${pkg.id} missing from DESIGN_PRESETS`).toBeDefined()
    }
  })

  it('names match between ThemePackage and THEME_CATALOG', () => {
    for (const pkg of getAllThemes()) {
      const catalogEntry = THEME_CATALOG.find((t) => t.id === pkg.id)!
      expect(catalogEntry.name, `${pkg.id} name`).toBe(pkg.name)
    }
  })

  it('descriptions match between ThemePackage and THEME_CATALOG', () => {
    for (const pkg of getAllThemes()) {
      const catalogEntry = THEME_CATALOG.find((t) => t.id === pkg.id)!
      expect(catalogEntry.description, `${pkg.id} description`).toBe(pkg.description)
    }
  })

  it('authors match between ThemePackage and THEME_CATALOG', () => {
    for (const pkg of getAllThemes()) {
      const catalogEntry = THEME_CATALOG.find((t) => t.id === pkg.id)!
      expect(catalogEntry.author, `${pkg.id} author`).toBe(pkg.author)
    }
  })

  it('overlay effect values in ThemePackage match DesignPreset', () => {
    for (const pkg of getAllThemes()) {
      const preset = DESIGN_PRESETS[pkg.id]
      const pkgOverlay = pkg.effects.overlayEffects
      const presetOverlay = preset.overlayEffects
      // Only compare when both define overlay effects
      if (pkgOverlay && presetOverlay) {
        for (const key of Object.keys(pkgOverlay) as (keyof typeof pkgOverlay)[]) {
          expect(
            pkgOverlay[key].intensity,
            `${pkg.id}.overlayEffects.${key}.intensity`,
          ).toBe(presetOverlay[key].intensity)
          expect(
            pkgOverlay[key].enabled,
            `${pkg.id}.overlayEffects.${key}.enabled`,
          ).toBe(presetOverlay[key].enabled)
        }
      }
    }
  })
})

// ─── Theme type classification ────────────────────────────────────────────────

describe('Theme type classification (themeType)', () => {
  it('every THEME_CATALOG entry has a themeType', () => {
    for (const entry of THEME_CATALOG) {
      expect(entry.themeType, `${entry.id} should have themeType`).toBeDefined()
    }
  })

  it('preset themes are: minimal, elegant, neon, retro', () => {
    const presets = THEME_CATALOG.filter((t) => t.themeType === 'preset').map((t) => t.id)
    expect(presets).toEqual(expect.arrayContaining(['minimal', 'elegant', 'neon', 'retro']))
    expect(presets).toHaveLength(4)
  })

  it('full themes have overlay effects defined in their ThemePackage', () => {
    const fullThemes = THEME_CATALOG.filter((t) => t.themeType === 'full')
    for (const def of fullThemes) {
      const pkg = getTheme(def.id)
      expect(pkg, `${def.id} should exist as ThemePackage`).toBeDefined()
      const hasEffects =
        pkg!.effects.overlayEffects !== undefined ||
        pkg!.effects.animationSettings !== undefined
      expect(hasEffects, `${def.id} should have overlay or animation effects`).toBe(true)
    }
  })

  it('preset themes have empty effects in their ThemePackage', () => {
    const presetThemes = THEME_CATALOG.filter((t) => t.themeType === 'preset')
    for (const def of presetThemes) {
      const pkg = getTheme(def.id)
      expect(pkg, `${def.id} should exist as ThemePackage`).toBeDefined()
      expect(
        pkg!.effects.overlayEffects,
        `${def.id} should have no overlayEffects`,
      ).toBeUndefined()
    }
  })
})
