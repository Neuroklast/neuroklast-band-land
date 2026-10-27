import { PUBLIC_LOCALES, type SiteLanguage } from '@/lib/i18n'

export type { SiteLanguage }

const LOCALE_CODE_RE = /^[a-z]{2}(-[a-z]{2})?$/

/** BCP-47-style locale codes: en, de, pt-br */
export function isValidLocaleCode(code: string): boolean {
  return LOCALE_CODE_RE.test(code)
}

/**
 * Public site is English and German only. Historic admin configuration and
 * other translations are retained, but never exposed to visitors.
 */
export function parseLanguagesConfig(raw: unknown): SiteLanguage[] {
  const supported = PUBLIC_LOCALES
  if (!Array.isArray(raw)) return [...supported]
  const configured = new Map<string, SiteLanguage>()
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const row = item as Record<string, unknown>
    const code = typeof row.code === 'string' ? row.code.trim().toLowerCase() : ''
    if (!supported.some((language) => language.code === code)) continue
    const builtin = supported.find((language) => language.code === code)!
    configured.set(code, {
      ...builtin,
      label: typeof row.label === 'string' && row.label.trim()
        ? row.label.trim()
        : builtin.label,
    })
  }
  // Both languages remain available even if a stale config lists only one.
  return supported.map((language) => configured.get(language.code) ?? language)
}

/** Locale codes enabled on the public site. */
export function getEnabledLocaleCodes(languages: SiteLanguage[]): string[] {
  return languages.map((l) => l.code)
}