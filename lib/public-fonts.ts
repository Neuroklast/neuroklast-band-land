/**
 * Public font resolution — fonts are NEVER hard-locked in CSS/components.
 * Admin Appearance (site_config.appearance.theme) is the source of truth.
 * System stacks are the only CSS fallbacks until theme applies.
 */

import type { AppearanceTheme } from '@/lib/appearance-presets'
import { extractGoogleFontName } from '@/lib/font-loader'

/** Generic fallbacks only — no brand faces (Orbitron etc.) unless admin chooses them. */
export const SYSTEM_FONT_HEADING = "var(--font-jetbrains-mono), ui-monospace, monospace"
export const SYSTEM_FONT_BODY = "var(--font-space-grotesk), system-ui, sans-serif"
export const SYSTEM_FONT_MONO = "var(--font-jetbrains-mono), ui-monospace, monospace"

export interface ResolvedPublicFonts {
  fontHeading: string
  fontBody: string
  fontMono: string
}

const SELF_HOSTED_STACKS: Record<string, string> = {
  'JetBrains Mono': 'var(--font-jetbrains-mono), ui-monospace, monospace',
  'Space Grotesk': 'var(--font-space-grotesk), system-ui, sans-serif',
  'Orbitron': 'var(--font-orbitron), sans-serif',
  'Share Tech Mono': 'var(--font-share-tech-mono), ui-monospace, monospace',
  'Space Mono': 'var(--font-space-mono), ui-monospace, monospace',
}
const SELF_HOSTED_VARIABLES = new Map(
  Object.entries(SELF_HOSTED_STACKS).map(([name, stack]) => [stack.split(',')[0], name]),
)

/** Normalize old theme font selections to locally bundled or system fonts. */
export function resolvePrivacySafeFontStack(value: string | undefined, fallback: string): string {
  if (!value?.trim()) return fallback
  const stack = value.trim()
  const first = stack.split(',')[0].trim()
  const localName = SELF_HOSTED_VARIABLES.get(first)
  if (localName) return SELF_HOSTED_STACKS[localName]
  const name = extractGoogleFontName(stack)
  if (name) return SELF_HOSTED_STACKS[name] ?? fallback
  return /^(system-ui|ui-monospace|ui-sans-serif|ui-serif|monospace|sans-serif|serif)(\\s*,|$)/.test(stack) ? stack : fallback
}

export function resolvePublicFonts(theme?: AppearanceTheme | null): ResolvedPublicFonts {
  const t = theme && typeof theme === 'object' ? theme : {}
  return {
    fontHeading: resolvePrivacySafeFontStack(t.fontHeading, SYSTEM_FONT_HEADING),
    fontBody: resolvePrivacySafeFontStack(t.fontBody, SYSTEM_FONT_BODY),
    fontMono: resolvePrivacySafeFontStack(t.fontMono, SYSTEM_FONT_MONO),
  }
}

/** Keep an admin-supplied value inside a `<style>` declaration. */
export function escapeCssDeclarationValue(value: string): string {
  return value
    .replace(/\\/g, '\\5c ')
    .replace(/</g, '\\3c ')
    .replace(/>/g, '\\3e ')
    .replace(/\{/g, '\\7b ')
    .replace(/\}/g, '\\7d ')
    .replace(/;/g, '\\3b ')
    .replace(/\r?\n/g, '')
}

/** CSS text for :root — safe for SSR <style> inject. */
export function buildPublicFontCssVars(fonts: ResolvedPublicFonts): string {
  const esc = escapeCssDeclarationValue
  return `:root{--font-heading:${esc(fonts.fontHeading)};--font-body:${esc(fonts.fontBody)};--font-mono:${esc(fonts.fontMono)};}`
}

/** Legacy callers may request fonts, but never trigger a runtime CDN connection. */
export function remoteFontFamiliesToLoad(_fonts: ResolvedPublicFonts): string[] { return [] }
export function ensureRemoteFontsLoaded(_fonts: ResolvedPublicFonts): void {}
