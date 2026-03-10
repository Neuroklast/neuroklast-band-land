# Forensic Peer-Audit Report

> Post-refactoring audit of `src/` — hardcoded colors, i18n violations, direct localStorage access, and architectural compliance.

## 1. Hardcoded Tailwind Colors → Semantic Design Tokens

**Status: ✅ Complete (0 violations remaining)**

### Problem
232 hardcoded Tailwind palette colors (e.g. `text-red-400`, `bg-green-500/20`, `border-yellow-500/30`) were scattered across 21 component files. These bypass the theme system and break when switching between themes/presets.

### Solution
Added 14 semantic CSS custom properties to `src/index.css` with two tiers per status:

| Token | Purpose | Example utility |
|-------|---------|-----------------|
| `--status-error` | Text/icon color | `text-status-error` |
| `--status-error-em` | Background/border with opacity | `bg-status-error-em/20` |
| `--status-success` | Text/icon color | `text-status-success` |
| `--status-success-em` | Background/border with opacity | `bg-status-success-em/10` |
| `--status-warning` | Text/icon color | `text-status-warning` |
| `--status-warning-em` | Background/border with opacity | `border-status-warning-em/30` |
| `--status-alert` | Critical status text | `text-status-alert` |
| `--status-alert-em` | Critical status bg | `bg-status-alert-em/10` |
| `--status-info` | Informational text | `text-status-info` |
| `--status-info-em` | Informational bg | `bg-status-info-em/15` |
| `--status-special` | Special/highlight text | `text-status-special` |
| `--status-special-em` | Special/highlight bg | `bg-status-special-em/20` |
| `--status-neutral-border` | Neutral borders/dividers | `border-status-neutral-border` |

All tokens are registered in the `@theme` block and available as standard Tailwind utilities. The oklch values match the original Tailwind palette exactly — visual output is identical.

### Files Changed
21 component files with 232 color class replacements.

---

## 2. Internationalization (i18n) — Hardcoded JSX Strings

**Status: ✅ Complete (3 remaining in test file — expected)**

### Problem
499 `i18next/no-literal-string` ESLint warnings across 61 files. User-visible text was hardcoded in English, bypassing the translation system.

### Solution
- Added 60+ shared `common.*` keys and 300+ component-specific keys to both `public/locales/en/common.json` and `public/locales/de/common.json`
- Migrated **50+ component files** to use `t()` calls via the `useLocale()` hook
- Key namespaces added: `stats.*`, `setup.*`, `activation.*`, `themeCustomizer.*`, `themePreview.*`, `monitor.*`, `keyManager.*`, `terminalSettings.*`, `secretTerminal.*`, `marketing.*`, `oauth.*`, `media.*`, `releasesSection.*`, `systemSettings.*`, `configImport.*`, `configEditor.*`, `widgetConfig.*`, `adminLogin.*`, `themeLicense.*`, `releaseOverlay.*`, `gigOverlay.*`, `friendOverlay.*`, `memberOverlay.*`, `newsSection.*`, `contentForms.*`, `attackerProfile.*`, `instagram.*`, `profile.*`, `widgetImport.*`, `configExport.*`

### Remaining
3 warnings in `src/test/section-guard.test.tsx` — these are test fixture strings (`<div>News Content</div>`) and are intentionally not translated.

---

## 3. localStorage Migration → useKV Abstraction

**Status: ✅ Complete**

### Problem
Three component files accessed `localStorage` directly instead of using the `useKV` abstraction hook. They were listed in the ESLint `APPROVED_FILES` allowlist as legacy exceptions.

### Migrated Files

| File | Old Key | New useKV Key | Data |
|------|---------|---------------|------|
| `CookieBanner.tsx` | `nk-cookie-consent` | `kv:cookie-consent` | `'accepted'` \| `'declined'` |
| `ThemeCustomizerDialog.tsx` | `nk-unlocked-themes` | `kv:unlocked-themes` | `string[]` theme IDs |
| `StatsDashboard.tsx` | `nk-utm-history` | `kv:utm-history` | UTM link history entries |

### APPROVED_FILES After Migration
Only core abstraction files remain in the ESLint allowlist:
- `use-kv.ts` — The KV abstraction itself
- `ThemeContext.tsx` — Theme state engine (writes `nk-theme-cache` for FOUC prevention)
- `LocaleContext.tsx` — Locale persistence
- `use-activation-key.ts` — Activation key storage
- `use-sound.ts` — Sound preference
- `analytics.ts` — Analytics data collection

---

## 4. Architectural Compliance

### Theme Context Access
**✅ No violations.** All theme access goes through `useThemeEngine()` hook. The custom ESLint rule `no-direct-theme-context` enforces this at lint time.

### Section Visibility
**✅ No violations.** All section visibility checks use `SectionGuard` component. No inline `activeSectionIds.includes()` patterns found.

### Design Token Usage
**✅ No violations.** No hardcoded Tailwind palette colors remain in production code. All status colors use `--status-*` semantic tokens.

---

## Test Coverage

All 1005 tests across 61 test files pass after all changes. No test modifications were required (except adding `useLocale` mock to `widget-renderer.test.ts` for compatibility).
