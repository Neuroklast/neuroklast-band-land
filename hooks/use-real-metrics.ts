import { useEffect, useState } from 'react'

interface ParsedAgent {
  browser: string
  os: string
}

function parseUserAgent(): ParsedAgent {
  if (typeof navigator === 'undefined') return { browser: 'UNKNOWN', os: 'UNKNOWN' }
  const ua = navigator.userAgent
  let browser = 'UNKNOWN'
  let os = 'UNKNOWN'

  if (ua.includes('Firefox/')) {
    const m = ua.match(/Firefox\/([\d.]+)/)
    browser = `FIREFOX.${m?.[1]?.split('.')[0] ?? '?'}`
  } else if (ua.includes('Edg/')) {
    const m = ua.match(/Edg\/([\d.]+)/)
    browser = `EDGE.${m?.[1]?.split('.')[0] ?? '?'}`
  } else if (ua.includes('Chrome/')) {
    const m = ua.match(/Chrome\/([\d.]+)/)
    browser = `CHROME.${m?.[1]?.split('.')[0] ?? '?'}`
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    const m = ua.match(/Version\/([\d.]+)/)
    browser = `SAFARI.${m?.[1]?.split('.')[0] ?? '?'}`
  }

  if (ua.includes('Windows')) os = 'WINDOWS'
  else if (ua.includes('Mac OS X')) os = 'MACOS'
  else if (ua.includes('Linux')) os = 'LINUX'
  else if (ua.includes('Android')) os = 'ANDROID'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'IOS'

  return { browser, os }
}

function timezoneToSector(): string {
  if (typeof Intl === 'undefined') return 'UNKNOWN'
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!tz) return 'UNKNOWN'
    if (tz.startsWith('America/')) {
      if (['America/New_York', 'America/Toronto', 'America/Montreal'].includes(tz)) return 'NA-EAST'
      if (['America/Chicago', 'America/Denver'].includes(tz)) return 'NA-CENTRAL'
      if (['America/Los_Angeles', 'America/Vancouver'].includes(tz)) return 'NA-WEST'
      if (tz.includes('Sao_Paulo') || tz.includes('Buenos_Aires') || tz.includes('Bogota') || tz.includes('Caracas')) return 'SA-EAST'
      return 'NA-REGION'
    }
    if (tz.startsWith('Europe/')) {
      if (['Europe/London', 'Europe/Dublin', 'Europe/Lisbon'].includes(tz)) return 'EU-WEST'
      if (['Europe/Berlin', 'Europe/Paris', 'Europe/Madrid', 'Europe/Rome', 'Europe/Vienna', 'Europe/Zurich', 'Europe/Amsterdam', 'Europe/Brussels'].includes(tz)) return 'EU-CENTRAL'
      if (['Europe/Moscow', 'Europe/Kiev', 'Europe/Istanbul', 'Europe/Bucharest', 'Europe/Athens'].includes(tz)) return 'EU-EAST'
      return 'EU-REGION'
    }
    if (tz.startsWith('Asia/')) {
      if (['Asia/Tokyo', 'Asia/Seoul'].includes(tz)) return 'APAC-EAST'
      if (['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Taipei'].includes(tz)) return 'APAC-CN'
      if (['Asia/Kolkata', 'Asia/Mumbai'].includes(tz)) return 'APAC-SOUTH'
      if (['Asia/Dubai', 'Asia/Riyadh'].includes(tz)) return 'APAC-WEST'
      return 'APAC-REGION'
    }
    if (tz.startsWith('Australia/') || tz.startsWith('Pacific/')) return 'OCEANIA'
    if (tz.startsWith('Africa/')) return 'AF-REGION'
    return tz.split('/')[0].toUpperCase().slice(0, 10)
  } catch {
    return 'UNKNOWN'
  }
}

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  }
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  }
  return '00000000'
}

function getDownlink(): number | null {
  if (typeof navigator === 'undefined') return null
  const conn = (navigator as Navigator & { connection?: { downlink?: number } }).connection
  return conn?.downlink ?? null
}

export interface RealMetrics {
  browser: string
  os: string
  platform: string
  sector: string
  sessionId: string
  downlink: number | null
  buildVersion: string
  isSecure: boolean
  connectionStatus: string
}

const SSR_METRICS: RealMetrics = {
  browser: 'UNKNOWN',
  os: 'UNKNOWN',
  platform: 'UNKNOWN // UNKNOWN',
  sector: '--------',
  sessionId: '--------',
  downlink: null,
  buildVersion: '1.0.0.dev',
  isSecure: false,
  connectionStatus: 'HTTP // LOCAL',
}

function readMetrics(): RealMetrics {
  const { browser, os } = parseUserAgent()
  const isSecure = typeof location !== 'undefined' && location.protocol === 'https:'
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'
  const gitHash = typeof __GIT_HASH__ !== 'undefined' ? __GIT_HASH__ : 'dev'
  return {
    browser,
    os,
    platform: `${browser} // ${os}`,
    sector: timezoneToSector(),
    sessionId: generateSessionId(),
    downlink: getDownlink(),
    buildVersion: `${appVersion}.${gitHash}`,
    isSecure,
    connectionStatus: isSecure ? 'HTTPS // SECURE' : 'HTTP // LOCAL',
  }
}

export function useRealMetrics(): RealMetrics {
  const [metrics, setMetrics] = useState<RealMetrics>(SSR_METRICS)
  useEffect(() => {
    setMetrics(readMetrics())
  }, [])
  return metrics
}
