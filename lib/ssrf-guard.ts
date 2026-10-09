import { resolve4, resolve6 } from 'node:dns/promises'
import { Agent, type Dispatcher } from 'undici'

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

export const BLOCKED_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^::ffff:(127\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i,
  /^fe80:/i,
  /^fc/i,
  /^fd/i,
]

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

export function isBlockedHost(hostname: string): boolean {
  if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(hostname))) return true
  if (/^\d+$/.test(hostname)) return true
  if (!hostname.includes('.') && !hostname.startsWith('[')) return true
  return false
}

export function isBlockedResolvedIp(ip: string): boolean {
  return BLOCKED_IP_PATTERNS.some((pattern) => pattern.test(ip))
}

export async function resolvePublicAddresses(hostname: string): Promise<string[]> {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname.startsWith('[')) {
    return [hostname]
  }

  const [ipv4, ipv6] = await Promise.all([
    resolve4(hostname).catch(() => [] as string[]),
    resolve6(hostname).catch(() => [] as string[]),
  ])

  return [...ipv4, ...ipv6]
}

export async function assertSafeRemoteUrl(url: string): Promise<URL> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Invalid URL')
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error('Invalid URL protocol')
  }

  if (isBlockedHost(parsed.hostname)) {
    throw new Error('Blocked host')
  }

  const addresses = await resolvePublicAddresses(parsed.hostname)
  if (addresses.length === 0) {
    throw new Error('Blocked host')
  }

  if (addresses.some((ip) => isBlockedResolvedIp(ip))) {
    throw new Error('Blocked host')
  }

  return parsed
}

/** DNS lookup that returns the address already approved. No second resolve. */
export function lookupPinnedTo(ip: string) {
  const family = ip.includes(':') ? 6 : 4
  return (
    _hostname: string,
    options: { all?: boolean },
    callback: (
      err: NodeJS.ErrnoException | null,
      address: string | Array<{ address: string; family: number }>,
      family?: number,
    ) => void,
  ) => {
    if (options.all) {
      callback(null, [{ address: ip, family }])
      return
    }
    callback(null, ip, family)
  }
}

function agentPinnedTo(ip: string): Dispatcher {
  const family = ip.includes(':') ? 6 : 4
  return new Agent({
    keepAliveTimeout: 1_000,
    keepAliveMaxTimeout: 1_000,
    connect: {
      family,
      autoSelectFamily: false,
      lookup: lookupPinnedTo(ip),
    },
  })
}

export async function fetchUrlWithResolvedCheck(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const parsed = await assertSafeRemoteUrl(url)
  const addresses = await resolvePublicAddresses(parsed.hostname)
  const ip = addresses.find((address) => !isBlockedResolvedIp(address))?.replace(/^\[|\]$/g, '')
  if (!ip || isBlockedResolvedIp(ip)) throw new Error('Blocked host')

  const response = await fetch(parsed.toString(), {
    ...init,
    redirect: 'manual',
    dispatcher: agentPinnedTo(ip),
  } as RequestInit)
  if (response.status >= 300 && response.status < 400) {
    throw new Error('Blocked redirect')
  }
  return response
}