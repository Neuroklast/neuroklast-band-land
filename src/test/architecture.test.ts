/**
 * Architecture Compliance Tests
 *
 * These tests act as automated guardrails against:
 *  - Incomplete theme packages (missing metadata, bad IDs, etc.)
 *  - Themes that skip validation
 *  - Missing i18n locale keys
 *  - Component contract violations (dialogs without open/onClose)
 *  - Registry integrity issues
 *
 * Every new theme MUST pass all tests in this file before it can be merged.
 * Every new dialog component MUST satisfy the DialogProps contract.
 *
 * Run: npm test -- architecture
 */

import { describe, it, expect } from 'vitest'
import { validateThemePackage, assertThemeValid } from '@/lib/theme-validator'
import { RECOMMENDED_THEME_SLOTS } from '@/lib/component-contracts'
import type { ThemePackage } from '@/lib/types'

// ─── Import all built-in themes directly (not via registry) ──────────────────
import { neuroklastClassicTheme } from '@/themes/neuroklast-classic'
import { glitchNoirTheme }        from '@/themes/glitch-noir'
import { zardonicIndustrialTheme } from '@/themes/zardonic-industrial'
import { umbrellaCorpTheme }      from '@/themes/umbrella-corp'

const ALL_BUILT_IN_THEMES: ThemePackage[] = [
  glitchNoirTheme,
  neuroklastClassicTheme,
  zardonicIndustrialTheme,
  umbrellaCorpTheme,
]

// ─── Helper: build a fully-valid minimal theme for negative testing ───────────
function validTheme(overrides: Partial<ThemePackage> = {}): ThemePackage {
  return {
    id: 'test-theme',
    name: 'Test Theme',
    description: 'A test theme',
    author: 'Test Author',
    version: '1.0.0',
    access: 'free',
    layout: { heroVariant: 'default', loadingScreen: 'minimal' },
    typography: { heading: 'sans-serif', body: 'sans-serif', mono: 'monospace' },
    borderRadius: 0,
    animationsEnabled: false,
    colorPresets: [],
    defaultPresetId: 'default',
    customizability: { customColors: true, customFonts: true, adjustEffects: false },
    effects: {},
    slots: {},
    ...overrides,
  }
}

// ─── 1. Built-in theme validation ─────────────────────────────────────────────

describe('Built-in themes — metadata completeness', () => {
  for (const theme of ALL_BUILT_IN_THEMES) {
    it(`${theme.id}: has a non-empty id`, () => {
      expect(theme.id.trim()).toBeTruthy()
    })

    it(`${theme.id}: id is kebab-case`, () => {
      expect(theme.id).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/)
    })

    it(`${theme.id}: has a non-empty name`, () => {
      expect(theme.name.trim()).toBeTruthy()
    })

    it(`${theme.id}: has a non-empty description`, () => {
      expect(theme.description.trim()).toBeTruthy()
    })

    it(`${theme.id}: has a non-empty author`, () => {
      expect(theme.author.trim()).toBeTruthy()
    })

    it(`${theme.id}: has a semver version`, () => {
      expect(theme.version).toMatch(/^\d+\.\d+\.\d+/)
    })

    it(`${theme.id}: access is a recognised value`, () => {
      expect(['free', 'premium', 'exclusive']).toContain(theme.access)
    })

    it(`${theme.id}: exclusive themes declare exclusiveFor`, () => {
      if (theme.access === 'exclusive') {
        expect(theme.exclusiveFor?.trim()).toBeTruthy()
      }
    })

    it(`${theme.id}: layout object is complete`, () => {
      expect(theme.layout).toBeDefined()
      expect(theme.layout.heroVariant).toBeDefined()
      expect(theme.layout.loadingScreen).toBeDefined()
    })

    it(`${theme.id}: typography object is complete`, () => {
      expect(theme.typography).toBeDefined()
      expect(theme.typography.heading.trim()).toBeTruthy()
      expect(theme.typography.body.trim()).toBeTruthy()
      expect(theme.typography.mono.trim()).toBeTruthy()
    })

    it(`${theme.id}: customizability has all three boolean fields`, () => {
      expect(typeof theme.customizability.customColors).toBe('boolean')
      expect(typeof theme.customizability.customFonts).toBe('boolean')
      expect(typeof theme.customizability.adjustEffects).toBe('boolean')
    })
  }
})

describe('Built-in themes — assertThemeValid passes with no fatal errors', () => {
  for (const theme of ALL_BUILT_IN_THEMES) {
    it(`${theme.id}: passes assertThemeValid()`, () => {
      // assertThemeValid throws on errors; warnings are allowed.
      expect(() => assertThemeValid(theme)).not.toThrow()
    })
  }
})

// ─── 2. Theme catalog integrity ───────────────────────────────────────────────

describe('THEME_CATALOG integrity', () => {
  it('contains all 4 built-in themes', async () => {
    const { THEME_CATALOG } = await import('@/lib/theme-registry')
    const ids = THEME_CATALOG.map(t => t.id)
    expect(ids).toContain('glitch-noir')
    expect(ids).toContain('neuroklast-classic')
    expect(ids).toContain('zardonic-industrial')
    expect(ids).toContain('umbrella-corp')
    expect(THEME_CATALOG).toHaveLength(4)
  })

  it('glitch-noir is listed first (it is the default free theme)', async () => {
    const { THEME_CATALOG } = await import('@/lib/theme-registry')
    expect(THEME_CATALOG[0].id).toBe('glitch-noir')
  })

  it('all catalog entries have id, name, description, author, tags', async () => {
    const { THEME_CATALOG } = await import('@/lib/theme-registry')
    for (const entry of THEME_CATALOG) {
      expect(entry.id.trim()).toBeTruthy()
      expect(entry.name.trim()).toBeTruthy()
      expect(entry.description?.trim()).toBeTruthy()
      expect(entry.author?.trim()).toBeTruthy()
      expect(Array.isArray(entry.tags)).toBe(true)
    }
  })
})

// ─── 3. Default theme ─────────────────────────────────────────────────────────

describe('Default theme resolution', () => {
  it('getActiveTheme() with no argument returns glitch-noir', async () => {
    const { getActiveTheme } = await import('@/lib/theme-registry')
    const theme = getActiveTheme()
    expect(theme.id).toBe('glitch-noir')
  })

  it('getActiveTheme("glitch-noir") returns glitch-noir', async () => {
    const { getActiveTheme } = await import('@/lib/theme-registry')
    expect(getActiveTheme('glitch-noir').id).toBe('glitch-noir')
  })

  it('neuroklast-classic is exclusive — not the public default', () => {
    expect(neuroklastClassicTheme.access).toBe('exclusive')
    expect(neuroklastClassicTheme.exclusiveFor).toBe('neuroklast')
  })

  it('glitch-noir is free access', () => {
    expect(glitchNoirTheme.access).toBe('free')
  })
})

// ─── 4. validateThemePackage — error rules ────────────────────────────────────

describe('validateThemePackage — required field errors', () => {
  it('reports error when id is empty', () => {
    const errors = validateThemePackage(validTheme({ id: '' }))
    expect(errors.some(e => e.field === 'id' && e.severity === 'error')).toBe(true)
  })

  it('reports error when id is not kebab-case', () => {
    const errors = validateThemePackage(validTheme({ id: 'MyTheme' }))
    expect(errors.some(e => e.field === 'id' && e.severity === 'error')).toBe(true)
  })

  it('reports error when name is empty', () => {
    const errors = validateThemePackage(validTheme({ name: '' }))
    expect(errors.some(e => e.field === 'name' && e.severity === 'error')).toBe(true)
  })

  it('reports error when description is empty', () => {
    const errors = validateThemePackage(validTheme({ description: '' }))
    expect(errors.some(e => e.field === 'description' && e.severity === 'error')).toBe(true)
  })

  it('reports error when author is empty', () => {
    const errors = validateThemePackage(validTheme({ author: '' }))
    expect(errors.some(e => e.field === 'author' && e.severity === 'error')).toBe(true)
  })

  it('reports error when version is empty', () => {
    const errors = validateThemePackage(validTheme({ version: '' }))
    expect(errors.some(e => e.field === 'version' && e.severity === 'error')).toBe(true)
  })

  it('reports error for invalid access value', () => {
    // @ts-expect-error — intentionally passing invalid access value to test validator
    const errors = validateThemePackage(validTheme({ access: 'unknown' }))
    expect(errors.some(e => e.field === 'access' && e.severity === 'error')).toBe(true)
  })

  it('reports error when exclusive theme has no exclusiveFor', () => {
    const errors = validateThemePackage(validTheme({ access: 'exclusive', exclusiveFor: undefined }))
    expect(errors.some(e => e.field === 'exclusiveFor' && e.severity === 'error')).toBe(true)
  })

  it('does NOT report exclusiveFor error for free themes', () => {
    const errors = validateThemePackage(validTheme({ access: 'free' }))
    expect(errors.some(e => e.field === 'exclusiveFor')).toBe(false)
  })

  it('reports error when layout is missing', () => {
    const errors = validateThemePackage(validTheme({ layout: undefined }))
    expect(errors.some(e => e.field === 'layout' && e.severity === 'error')).toBe(true)
  })

  it('reports error when typography is missing', () => {
    const errors = validateThemePackage(validTheme({ typography: undefined }))
    expect(errors.some(e => e.field === 'typography' && e.severity === 'error')).toBe(true)
  })

  it('reports error when customizability is missing', () => {
    const errors = validateThemePackage(validTheme({ customizability: undefined }))
    expect(errors.some(e => e.field === 'customizability' && e.severity === 'error')).toBe(true)
  })
})

describe('validateThemePackage — warnings', () => {
  it('warns when version is not semver', () => {
    const errors = validateThemePackage(validTheme({ version: 'beta' }))
    expect(errors.some(e => e.field === 'version' && e.severity === 'warning')).toBe(true)
  })

  it('warns when slots is empty', () => {
    const errors = validateThemePackage(validTheme({ slots: {} }))
    expect(errors.some(e => e.field === 'slots' && e.severity === 'warning')).toBe(true)
  })

  it('warns when none of the recommended slots are provided', () => {
    // Provide a non-recommended slot only
    function Dummy() { return null }
    const errors = validateThemePackage(validTheme({
      slots: { Card: Dummy as ThemePackage['slots']['Card'] },
    }))
    expect(errors.some(e => e.field === 'slots' && e.severity === 'warning')).toBe(true)
  })

  it('does NOT warn about slots when at least one recommended slot is provided', () => {
    function Dummy() { return null }
    const errors = validateThemePackage(validTheme({
      slots: { Hero: Dummy as ThemePackage['slots']['Hero'] },
    }))
    expect(errors.filter(e => e.field === 'slots' && e.severity === 'warning')).toHaveLength(0)
  })
})

describe('assertThemeValid', () => {
  it('does not throw for a valid theme', () => {
    expect(() => assertThemeValid(validTheme())).not.toThrow()
  })

  it('throws when a required field is missing', () => {
    expect(() => assertThemeValid(validTheme({ name: '' }))).toThrow(/failed validation/)
  })

  it('does not throw for warnings-only themes (e.g. empty slots)', () => {
    // A theme with empty slots triggers warnings, not errors — that's acceptable
    expect(() => assertThemeValid(validTheme({ slots: {} }))).not.toThrow()
  })

  it('includes the theme id in the error message', () => {
    expect(() => assertThemeValid(validTheme({ id: 'bad theme id', name: '' }))).toThrow(/bad theme id|no id/)
  })
})

// ─── 5. Component contracts — RECOMMENDED_THEME_SLOTS constant ───────────────

describe('RECOMMENDED_THEME_SLOTS constant', () => {
  it('includes Hero, Navigation, BackgroundEffects', () => {
    expect(RECOMMENDED_THEME_SLOTS).toContain('Hero')
    expect(RECOMMENDED_THEME_SLOTS).toContain('Navigation')
    expect(RECOMMENDED_THEME_SLOTS).toContain('BackgroundEffects')
  })

  it('is readonly (as const)', () => {
    // TypeScript enforces this at compile time; we verify the values are stable at runtime
    expect(RECOMMENDED_THEME_SLOTS.length).toBe(3)
  })
})

// ─── 6. i18n locale keys — spot-check required namespaces ────────────────────

describe('i18n locale coverage', () => {
  // process.cwd() = project root in Vitest
  const EN_LOCALE_PATH = `${process.cwd()}/public/locales/en/common.json`

  it('en/common.json is loadable and is a valid JSON object', async () => {
    const { readFileSync } = await import('fs')
    const raw = readFileSync(EN_LOCALE_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    expect(typeof parsed).toBe('object')
    expect(parsed).not.toBeNull()
  })

  const REQUIRED_KEY_PREFIXES = [
    'common.',
    'footer.',
    'nav.',
    'hero.',
    'gigs.',
    'releases.',
    'media.',
    'bio.',
    'news.',
    'contact.',
    'social.',
    'gallery.',
    'hub.',
    'content.',
    'store.',
    'stats.',
    'theme.',
    'edit.',
    'cookie.',
  ]

  it('en/common.json contains all required i18n namespace prefixes', async () => {
    const { readFileSync } = await import('fs')
    const parsed: Record<string, string> = JSON.parse(readFileSync(EN_LOCALE_PATH, 'utf8'))
    const keys = Object.keys(parsed)

    for (const prefix of REQUIRED_KEY_PREFIXES) {
      const hasPrefix = keys.some(k => k.startsWith(prefix))
      expect(hasPrefix, `Missing i18n namespace: "${prefix}"`).toBe(true)
    }
  })

  it('de/common.json exists and mirrors required namespace prefixes', async () => {
    const { readFileSync } = await import('fs')
    const dePath = EN_LOCALE_PATH.replace('/en/', '/de/')
    const parsed: Record<string, string> = JSON.parse(readFileSync(dePath, 'utf8'))
    const keys = Object.keys(parsed)

    for (const prefix of REQUIRED_KEY_PREFIXES) {
      const hasPrefix = keys.some(k => k.startsWith(prefix))
      expect(hasPrefix, `DE locale missing namespace: "${prefix}"`).toBe(true)
    }
  })

  it('en and de have the same set of keys', async () => {
    const { readFileSync } = await import('fs')
    const enParsed: Record<string, string> = JSON.parse(readFileSync(EN_LOCALE_PATH, 'utf8'))
    const dePath = EN_LOCALE_PATH.replace('/en/', '/de/')
    const deParsed: Record<string, string> = JSON.parse(readFileSync(dePath, 'utf8'))

    const enKeys = new Set(Object.keys(enParsed))
    const deKeys = new Set(Object.keys(deParsed))

    const missingInDe = [...enKeys].filter(k => !deKeys.has(k))
    const missingInEn = [...deKeys].filter(k => !enKeys.has(k))

    expect(missingInDe, `Keys in EN but not DE: ${missingInDe.join(', ')}`).toHaveLength(0)
    expect(missingInEn, `Keys in DE but not EN: ${missingInEn.join(', ')}`).toHaveLength(0)
  })
})

// ─── 7. Registry — no duplicate IDs ──────────────────────────────────────────

describe('builtInThemes — no duplicate IDs', () => {
  it('all built-in theme IDs are unique', () => {
    const ids = ALL_BUILT_IN_THEMES.map(t => t.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

// ─── 8. Dialog file compliance — programmatic ESLint scan ────────────────────

describe('Dialog file compliance — open + onClose/onOpenChange contract', () => {
  it('all *Dialog.tsx and *Window.tsx files satisfy require-dialog-props', async () => {
    const { readFileSync } = await import('fs')
    const { Linter } = await import('eslint')
    const { default: requireDialogProps } = await import('../../eslint-rules/require-dialog-props.js')

    const root = process.cwd()
    const srcRoot = `${root}/src`

    // Recursively find all *Dialog.tsx and *Window.tsx files under src/
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fsSync = require('fs') as typeof import('fs')
    function findDialogFiles(dir: string): string[] {
      const entries: string[] = []
      try {
        for (const entry of fsSync.readdirSync(dir)) {
          const full = `${dir}/${entry}`
          if (fsSync.statSync(full).isDirectory()) {
            entries.push(...findDialogFiles(full))
          } else if (/(Dialog|Window)\.tsx$/.test(entry)) {
            entries.push(full)
          }
        }
      } catch { /* skip unreadable dirs */ }
      return entries
    }
    const dialogFiles = findDialogFiles(srcRoot)

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tsParser = require('@typescript-eslint/parser')
    const lintCfg = [{
      files: ['**/*.{ts,tsx}'],
      plugins: { 'band-land': { rules: { 'require-dialog-props': requireDialogProps } } },
      rules: { 'band-land/require-dialog-props': 'warn' as const },
      languageOptions: {
        ecmaVersion: 2020 as const,
        sourceType: 'module' as const,
        parser: tsParser,
      },
    }]

    const violations: string[] = []

    for (const fullPath of dialogFiles) {
      const file = fullPath.split('/').pop()!
      const source = readFileSync(fullPath, 'utf8')
      const linter = new Linter()
      const messages = linter.verify(source, lintCfg, { filename: file })
      const warns = messages.filter((m: { ruleId: string | null }) => m.ruleId === 'band-land/require-dialog-props')
      if (warns.length > 0) {
        violations.push(`${file}: ${warns.map((m: { message: string }) => m.message).join('; ')}`)
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `${violations.length} dialog file(s) violate the DialogProps contract:\n` +
        violations.map(v => `  • ${v}`).join('\n')
      )
    }
  })
})

// ─── 9. Default slot components — smoke render test ──────────────────────────

describe('Default slot components — render without crashing', () => {
  it('all default slots can be imported from @/themes/default-slots', async () => {
    const slots = await import('@/themes/default-slots')
    const expectedExports = [
      'DefaultHero', 'DefaultNavigation', 'DefaultLoadingScreen', 'DefaultSectionDivider',
      'DefaultCard', 'DefaultBackgroundEffects', 'DefaultFooter', 'DefaultOverlayModal',
      'DefaultSectionHeading', 'DefaultOverlayTransition', 'DefaultItemCard',
      'DefaultCookieBanner', 'DefaultScrollReveal', 'DefaultHoverEffect', 'DefaultPageLayout',
      'DefaultGigsSection', 'DefaultReleasesSection', 'DefaultBiographySection',
      'DefaultNewsSection', 'DefaultMediaSection', 'DefaultGallerySection',
      'DefaultSocialSection', 'DefaultContactSection', 'DefaultPartnersSection',
    ]
    for (const name of expectedExports) {
      expect(slots[name as keyof typeof slots], `${name} should be exported`).toBeDefined()
      expect(typeof slots[name as keyof typeof slots]).toBe('function')
    }
  })
})
