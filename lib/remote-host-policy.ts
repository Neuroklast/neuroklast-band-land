// Pure hostname policy shared by browser URL validation and server SSRF checks.
export const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^\[::1\]/,
  /^\[::ffff:/i,
  /^\[fe80:/i,
  /^\[fc/i,
  /^\[fd/i,
  /^metadata\.google\.internal$/i,
  /^0x[0-9a-f]+$/i,
  /^0[0-7]+\./,
]

export function isBlockedHost(hostname: string): boolean {
  if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) return true
  if (/^\d+$/.test(hostname)) return true
  if (!hostname.includes('.') && !hostname.startsWith('[')) return true
  return false
}

