import { describe, expect, it } from 'vitest'
import { CRAWLER_BLOCKLIST, isBlockedCrawlerUserAgent } from '@/lib/crawler-blocklist'

describe('crawler allow-first policy', () => {
  it.each([
    'Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    'ChatGPT-User/1.0',
    'OAI-SearchBot/1.0',
    'Bytespider/0.1',
    'Mozilla/5.0 (compatible; ClaudeBot/1.0)',
    'Mozilla/5.0 (compatible; CCBot/2.0)',
    'Mozilla/5.0 (compatible; MJ12bot/v1.4.8)',
    'Mozilla/5.0 (compatible; SemrushBot/7~bl)',
    'PerplexityBot/1.0',
    'PetalBot',
    'Mozilla/5.0 (compatible; Googlebot/2.1)',
    'Mozilla/5.0 (compatible; bingbot/2.0)',
    'Mozilla/5.0 (compatible; DuckDuckGoBot/1.0)',
    'facebookexternalhit/1.1',
    'Twitterbot/1.0',
    'FacebookBot/1.0',
  ])('allows legitimate crawler and preview requests: %s', userAgent => {
    expect(isBlockedCrawlerUserAgent(userAgent)).toBe(false)
  })

  it('allows real visitors and empty user agents', () => {
    expect(isBlockedCrawlerUserAgent(null)).toBe(false)
    expect(isBlockedCrawlerUserAgent('')).toBe(false)
    expect(isBlockedCrawlerUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/156.0 Safari/537.36')).toBe(false)
  })

  it('filters only explicit scanner signatures case-insensitively', () => {
    expect(CRAWLER_BLOCKLIST.length).toBeGreaterThan(0)
    expect(isBlockedCrawlerUserAgent('sqlmap/1.9')).toBe(true)
    expect(isBlockedCrawlerUserAgent('NIKTO/2.5')).toBe(true)
    expect(isBlockedCrawlerUserAgent('Masscan/1.3')).toBe(true)
    expect(isBlockedCrawlerUserAgent('nuclei/3.0')).toBe(true)
  })
})
