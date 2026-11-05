import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CONTACT_SPAM_CONFIG,
  isContactSpam,
  normalizeBlockedWords,
  parseContactSpamConfig,
} from './contact-spam-filter'

describe('contact spam word blacklist', () => {
  const enabled = { enabled: true, blockedWords: ['free money', 'werbung', 'gift'] }

  it('blocks whole words in the subject or message, case-insensitively', () => {
    expect(isContactSpam('WerBung hier', 'A normal message', enabled)).toBe(true)
    expect(isContactSpam('Hello', 'Get FREE   MONEY now!', enabled)).toBe(true)
    expect(isContactSpam('Hello', 'A GIFT for you', enabled)).toBe(true)
  })

  it('does not match a multiword phrase across subject and message fields', () => {
    expect(isContactSpam('free', 'money is irrelevant here', enabled)).toBe(false)
  })

  it('does not block substrings in ordinary words', () => {
    expect(isContactSpam('Hello', 'A gifted musician discusses a giftshop', enabled)).toBe(false)
    expect(isContactSpam('Hello', 'Werbungsagentur and gifts', enabled)).toBe(false)
  })

  it('handles Unicode, punctuation and literal regex characters', () => {
    const config = { enabled: true, blockedWords: ['café', 'a+b', 'gewinn'] }
    expect(isContactSpam('Hello', 'CAFE\u0301!', config)).toBe(true)
    expect(isContactSpam('Hello', 'Please claim a+b now', config)).toBe(true)
    expect(isContactSpam('Hello', 'Gewinn!', config)).toBe(true)
    expect(isContactSpam('Hello', 'cafe and ab', config)).toBe(false)
  })

  it('deduplicates case and whitespace in admin input', () => {
    expect(normalizeBlockedWords([' Werbung ', 'werbung', 'FREE  MONEY', 'free money']))
      .toEqual(['werbung', 'free money'])
  })

  it('is inactive for an empty list or disabled setting', () => {
    expect(isContactSpam('werbung', 'free money', DEFAULT_CONTACT_SPAM_CONFIG)).toBe(false)
    expect(isContactSpam('werbung', 'free money', { ...enabled, enabled: false })).toBe(false)
  })

  it('rejects malformed configuration instead of silently dropping its rules', () => {
    expect(parseContactSpamConfig({ enabled: true, blockedWords: ['valid', ''] })).toBeNull()
    expect(parseContactSpamConfig({ enabled: 'yes', blockedWords: ['spam'] })).toBeNull()
    expect(parseContactSpamConfig(null)).toEqual(DEFAULT_CONTACT_SPAM_CONFIG)
  })
})
