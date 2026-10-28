import { describe, expect, it } from 'vitest'
import { isBlockedCrawlerUserAgent } from '@/lib/crawler-blocklist'

describe('crawler policy', () => {
  it.each([
    'GPTBot/1.0',
    'ChatGPT-User/1.0',
    'OAI-SearchBot/1.0',
    'OpenAI-WebBot',
    'ClaudeBot',
    'Claude-Search',
    'PerplexityBot',
    'Perplexity-User',
    'Googlebot',
    'Bingbot',
    'facebookexternalhit',
    'Twitterbot',
    'AhrefsBot',
    'SemrushBot',
    'CCBot',
    'Applebot-Extended',
  ])('allows legitimate crawler %s', ua => {
    expect(isBlockedCrawlerUserAgent(ua)).toBe(false)
  })

  it.each(['sqlmap/1.9', 'Nikto/2.5.0', 'zgrab/0.x', 'masscan/1.3.2', 'nuclei/3.0'])(
    'blocks explicit vulnerability scanner %s', ua => {
      expect(isBlockedCrawlerUserAgent(ua)).toBe(true)
    },
  )

  it('allows ordinary clients without a user agent', () => {
    expect(isBlockedCrawlerUserAgent(null)).toBe(false)
    expect(isBlockedCrawlerUserAgent('')).toBe(false)
    expect(isBlockedCrawlerUserAgent('Mozilla/5.0')).toBe(false)
  })
})
