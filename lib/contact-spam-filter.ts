import { z } from 'zod'

export const CONTACT_SPAM_CONFIG_KEY = 'contact_spam_filter'
export const MAX_CONTACT_SPAM_WORDS = 200

const blockedWordSchema = z.string().trim().min(2).max(80)
  .refine((value) => !Array.from(value).some((char) => {
    const code = char.codePointAt(0) ?? 0
    return code < 32 || code === 127
  }), 'Control characters are not allowed')

export const contactSpamConfigSchema = z.object({
  enabled: z.boolean(),
  blockedWords: z.array(blockedWordSchema).max(MAX_CONTACT_SPAM_WORDS),
}).strict()

export type ContactSpamConfig = z.infer<typeof contactSpamConfigSchema>

export const DEFAULT_CONTACT_SPAM_CONFIG: ContactSpamConfig = {
  enabled: true,
  blockedWords: [],
}

/** Each entry is an exact word or phrase; no user-authored regular expressions. */
function normalize(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim()
}

export function normalizeBlockedWords(words: string[]): string[] {
  return [...new Set(words.map(normalize).filter(Boolean))]
}

/** Do not silently accept malformed stored rules: callers can deny sending instead. */
export function parseContactSpamConfig(raw: unknown): ContactSpamConfig | null {
  const parsed = contactSpamConfigSchema.safeParse(raw ?? DEFAULT_CONTACT_SPAM_CONFIG)
  if (!parsed.success) return null
  return { enabled: parsed.data.enabled, blockedWords: normalizeBlockedWords(parsed.data.blockedWords) }
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Only whole Unicode words / phrases in subject or body are blocked. */
export function isContactSpam(subject: string, message: string, config: ContactSpamConfig): boolean {
  if (!config.enabled || !config.blockedWords.length) return false

  const contentFields = [normalize(subject), normalize(message)]
  return config.blockedWords.some((entry) => {
    const word = normalize(entry)
    if (!word) return false
    const pattern = escapeRegex(word).replace(/ /g, '\\s+')
    const expression = new RegExp('(?:^|[^\\p{L}\\p{N}])' + pattern + '(?=$|[^\\p{L}\\p{N}])', 'u')
    return contentFields.some((content) => expression.test(content))
  })
}
