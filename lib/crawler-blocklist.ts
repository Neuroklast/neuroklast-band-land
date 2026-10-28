/**
 * Only recognizable automated vulnerability scanners are blocked by User-Agent.
 * Do NOT block search engines, AI assistants, link previews or SEO crawlers:
 * they are legitimate visitors and often important for discoverability.
 *
 * User-Agent is spoofable. This is a low-cost noise filter, NOT a security
 * boundary. Protect private routes with authentication, and use rate limiting
 * and infrastructure bot mitigation to stop abusive traffic.
 */
export const CRAWLER_BLOCKLIST: readonly string[] = [
  'sqlmap/',
  'nikto/',
  'zgrab/',
  'masscan/',
  'gobuster/',
  'dirbuster/',
  'wpscan/',
  'nuclei/',
]

export function isBlockedCrawlerUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return CRAWLER_BLOCKLIST.some((token) => ua.includes(token))
}
