/**
 * Global i18n utility for the site.
 * Powered by i18next with JSON dictionary files in public/locales/.
 * Supports English (en) and German (de).
 */

import i18n from './i18n-config'

export type Locale = 'en' | 'de'

/** Get a translated string for a key and locale */
export function t(key: string, locale: Locale): string {
  return i18n.getFixedT(locale, 'common')(key, { defaultValue: key })
}
