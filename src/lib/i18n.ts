/**
 * Global i18n utility for the site.
 * Powered by i18next with JSON dictionary files in public/locales/.
 * Supports English (en) and German (de).
 */

import i18n from './i18n-config'

export type Locale = 'en' | 'de'

const NAMESPACES = ['common', 'admin', 'security'] as const

/** Get a translated string for a key and locale, searching all namespaces */
export function t(key: string, locale: Locale): string {
  for (const ns of NAMESPACES) {
    if (i18n.exists(key, { lng: locale, ns })) {
      return i18n.getFixedT(locale, ns)(key)
    }
  }
  return key
}
