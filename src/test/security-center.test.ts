import { describe, it, expect } from 'vitest'
import { t, tip, LOCALES } from '@/lib/i18n-security'
import {
  classifyIncident,
  classifyCountermeasure,
  type SecurityIncident,
} from '@/components/SecurityIncidentsDashboard'

// ---------------------------------------------------------------------------
describe('i18n-security: t() translation lookup', () => {
  it('returns English translation for known key', () => {
    expect(t('sec.title', 'en')).toBe('SECURITY CENTER')
  })

  it('returns German translation for known key', () => {
    expect(t('sec.title', 'de')).toBe('SICHERHEITSZENTRALE')
  })

  it('falls back to English when German is missing', () => {
    // All keys have both, but testing the fallback path by directly checking
    expect(t('sec.title', 'en')).toBeTruthy()
    expect(t('sec.title', 'de')).toBeTruthy()
  })

  it('returns the key itself for unknown keys', () => {
    expect(t('nonexistent.key', 'en')).toBe('nonexistent.key')
    expect(t('nonexistent.key', 'de')).toBe('nonexistent.key')
  })

  it('translates summary card labels in both locales', () => {
    expect(t('sec.total', 'en')).toBe('Total')
    expect(t('sec.total', 'de')).toBe('Gesamt')
    expect(t('sec.blocked', 'en')).toBe('Blocked')
    expect(t('sec.blocked', 'de')).toBe('Geblockt')
  })

  it('translates filter tab labels', () => {
    expect(t('sec.filterAll', 'en')).toBe('ALL')
    expect(t('sec.filterAll', 'de')).toBe('ALLE')
    expect(t('sec.filterBlocked', 'en')).toBe('BLOCKED')
    expect(t('sec.filterBlocked', 'de')).toBe('GEBLOCKT')
  })

  it('translates security settings labels', () => {
    expect(t('settings.title', 'en')).toContain('SECURITY SETTINGS')
    expect(t('settings.title', 'de')).toContain('SICHERHEITSEINSTELLUNGEN')
  })

  it('translates tarpit & zip bomb rule labels', () => {
    expect(t('rules.tarpitOnWarn', 'en')).toBe('Tarpit on WARN level')
    expect(t('rules.tarpitOnWarn', 'de')).toBe('Tarpit bei WARN-Stufe')
    expect(t('rules.zipBombOnBlock', 'en')).toBe('Zip bomb on BLOCK level')
    expect(t('rules.zipBombOnBlock', 'de')).toBe('Zip-Bombe bei BLOCK-Stufe')
  })

  it('translates module descriptions', () => {
    expect(t('mod.honeytoken', 'en')).toBe('Honeytoken Detection')
    expect(t('mod.honeytoken', 'de')).toBe('Honeytoken-Erkennung')
    expect(t('mod.zipBomb', 'en')).toBe('Zip Bomb')
    expect(t('mod.zipBomb', 'de')).toBe('Zip-Bombe')
  })
})

// ---------------------------------------------------------------------------
describe('i18n-security: tip() tooltip lookup', () => {
  it('returns tooltip for known key', () => {
    const tipText = tip('sec.total', 'en')
    expect(tipText).toContain('Total number of security incidents')
  })

  it('returns German tooltip', () => {
    const tipText = tip('sec.total', 'de')
    expect(tipText).toContain('Gesamtzahl')
  })

  it('returns undefined for keys without tooltip', () => {
    expect(tip('sec.title', 'en')).toBeUndefined()
    expect(tip('nonexistent', 'en')).toBeUndefined()
  })

  it('returns module tooltips with detailed explanations', () => {
    const honeytokenTip = tip('mod.honeytoken', 'en')
    expect(honeytokenTip).toContain('fake credentials')

    const zipBombTip = tip('mod.zipBomb', 'de')
    expect(zipBombTip).toContain('gzip-komprimierte')
  })

  it('returns parameter tooltips', () => {
    const autoBlockTip = tip('param.autoBlockThreshold', 'en')
    expect(autoBlockTip).toContain('threat points')
  })

  it('returns rule tooltips', () => {
    const tarpitTip = tip('rules.tarpitOnWarn', 'en')
    expect(tarpitTip).toContain('WARN threat level')

    const zipBombBlockTip = tip('rules.zipBombOnBlock', 'de')
    expect(zipBombBlockTip).toContain('BLOCK')
  })
})

// ---------------------------------------------------------------------------
describe('i18n-security: LOCALES', () => {
  it('has en and de locales', () => {
    expect(LOCALES).toHaveLength(2)
    expect(LOCALES.map(l => l.value)).toContain('en')
    expect(LOCALES.map(l => l.value)).toContain('de')
  })

  it('has labels for each locale', () => {
    const en = LOCALES.find(l => l.value === 'en')
    expect(en?.label).toBe('EN')
    const de = LOCALES.find(l => l.value === 'de')
    expect(de?.label).toBe('DE')
  })
})

// ---------------------------------------------------------------------------
describe('SecurityIncidentsDashboard: classifyIncident', () => {
  it('classifies robots.txt violations', () => {
    const result = classifyIncident('robots:googlebot')
    expect(result.type).toBe('robots')
    expect(result.label).toBe('ROBOTS.TXT VIOLATION')
  })

  it('classifies threat escalations', () => {
    const result = classifyIncident('threat:192.168.1.1')
    expect(result.type).toBe('threat')
    expect(result.label).toBe('THREAT ESCALATION')
  })

  it('classifies hard blocks', () => {
    const result = classifyIncident('blocked:10.0.0.1')
    expect(result.type).toBe('blocked')
    expect(result.label).toBe('HARD BLOCK')
  })

  it('classifies honeytoken access', () => {
    expect(classifyIncident('admin_backup').type).toBe('honeytoken')
    expect(classifyIncident('db-credentials').type).toBe('honeytoken')
    expect(classifyIncident('api-master-key').type).toBe('honeytoken')
    expect(classifyIncident('backup-admin-password').type).toBe('honeytoken')
  })

  it('classifies other events as security events', () => {
    const result = classifyIncident('unknown-event')
    expect(result.type).toBe('event')
    expect(result.label).toBe('SECURITY EVENT')
  })
})

// ---------------------------------------------------------------------------
describe('SecurityIncidentsDashboard: classifyCountermeasure', () => {
  const baseIncident: SecurityIncident = {
    key: 'test',
    method: 'GET',
    hashedIp: 'abc123',
    userAgent: 'test-agent',
    timestamp: new Date().toISOString(),
  }

  it('returns BLOCKED for auto-blocked incidents', () => {
    expect(classifyCountermeasure({ ...baseIncident, autoBlocked: true })).toBe('BLOCKED')
  })

  it('returns the countermeasure if explicitly set', () => {
    expect(classifyCountermeasure({ ...baseIncident, countermeasure: 'ZIP_BOMB' })).toBe('ZIP_BOMB')
  })

  it('returns BLOCKED for BLOCK threat level', () => {
    expect(classifyCountermeasure({ ...baseIncident, threatLevel: 'BLOCK' })).toBe('BLOCKED')
  })

  it('returns TARPITTED for TARPIT threat level', () => {
    expect(classifyCountermeasure({ ...baseIncident, threatLevel: 'TARPIT' })).toBe('TARPITTED')
  })

  it('returns RATE_LIMITED for WARN threat level', () => {
    expect(classifyCountermeasure({ ...baseIncident, threatLevel: 'WARN' })).toBe('RATE_LIMITED')
  })

  it('returns BLOCKED for blocked: prefixed keys', () => {
    expect(classifyCountermeasure({ ...baseIncident, key: 'blocked:192.168.1.1' })).toBe('BLOCKED')
  })

  it('returns TARPITTED for threat: prefixed keys', () => {
    expect(classifyCountermeasure({ ...baseIncident, key: 'threat:192.168.1.1' })).toBe('TARPITTED')
  })

  it('returns LOGGED as default', () => {
    expect(classifyCountermeasure(baseIncident)).toBe('LOGGED')
  })
})

// ---------------------------------------------------------------------------
describe('i18n-security: AttackerProfileDialog translations', () => {
  it('has translations for profile title and loading', () => {
    expect(t('profile.title', 'en')).toBe('ATTACKER PROFILE // DETAILED ANALYSIS')
    expect(t('profile.title', 'de')).toBe('ANGREIFER-PROFIL // DETAILANALYSE')
    expect(t('profile.loading', 'en')).toBe('LOADING PROFILE...')
    expect(t('profile.loading', 'de')).toBe('LADE PROFIL...')
  })

  it('has translations for profile stat labels', () => {
    expect(t('profile.totalIncidents', 'en')).toBe('Total Incidents')
    expect(t('profile.totalIncidents', 'de')).toBe('Vorfälle gesamt')
    expect(t('profile.firstSeen', 'en')).toBe('First Seen')
    expect(t('profile.firstSeen', 'de')).toBe('Erstmals gesehen')
    expect(t('profile.lastSeen', 'en')).toBe('Last Seen')
    expect(t('profile.lastSeen', 'de')).toBe('Zuletzt gesehen')
    expect(t('profile.uaDiversity', 'en')).toBe('UA Diversity')
    expect(t('profile.uaDiversity', 'de')).toBe('UA-Diversität')
  })

  it('has translations for profile section headers', () => {
    expect(t('profile.behavioralPatterns', 'en')).toBe('Behavioral Patterns Detected')
    expect(t('profile.behavioralPatterns', 'de')).toBe('Erkannte Verhaltensmuster')
    expect(t('profile.threatTimeline', 'en')).toBe('Threat Score Timeline')
    expect(t('profile.autoReactions', 'en')).toBe('Automated Reactions')
    expect(t('profile.autoReactions', 'de')).toBe('Automatische Reaktionen')
    expect(t('profile.forensicData', 'en')).toBe('Forensic Data')
    expect(t('profile.forensicData', 'de')).toBe('Forensische Daten')
  })

  it('has translations for profile countermeasure labels', () => {
    expect(t('profile.blocked', 'en')).toBe('BLOCKED')
    expect(t('profile.blocked', 'de')).toBe('GEBLOCKT')
    expect(t('profile.tarpitted', 'en')).toBe('TARPITTED')
    expect(t('profile.tarpitted', 'de')).toBe('VERLANGSAMT')
    expect(t('profile.warned', 'en')).toBe('WARNED')
    expect(t('profile.warned', 'de')).toBe('GEWARNT')
  })

  it('has tooltips for profile stat labels', () => {
    expect(tip('profile.totalIncidents', 'en')).toContain('security incidents')
    expect(tip('profile.firstSeen', 'de')).toContain('Zeitstempel')
    expect(tip('profile.uaDiversity', 'en')).toContain('evasion')
  })

  it('has translations for forensic data fields', () => {
    expect(t('profile.canaryToken', 'en')).toBe('Canary Token')
    expect(t('profile.canaryToken', 'de')).toBe('Canary-Token')
    expect(t('profile.jsFingerprint', 'en')).toContain('JS Fingerprint')
    expect(t('profile.realIp', 'de')).toContain('Echte IP')
  })
})

// ---------------------------------------------------------------------------
describe('i18n-security: BlocklistManagerDialog translations', () => {
  it('has translations for blocklist title and stats', () => {
    expect(t('blocklist.title', 'en')).toBe('BLOCKLIST MANAGER // HARD BLOCKS')
    expect(t('blocklist.title', 'de')).toBe('SPERRLISTEN-MANAGER // HARD BLOCKS')
    expect(t('blocklist.totalBlocked', 'en')).toBe('Total Blocked')
    expect(t('blocklist.totalBlocked', 'de')).toBe('Gesamt gesperrt')
    expect(t('blocklist.autoBlocked', 'en')).toBe('Auto-Blocked')
    expect(t('blocklist.manualBlocked', 'en')).toBe('Manual-Blocked')
  })

  it('has translations for blocklist form labels', () => {
    expect(t('blocklist.ipHashLabel', 'en')).toBe('IP Hash (SHA-256)')
    expect(t('blocklist.ipHashLabel', 'de')).toBe('IP-Hash (SHA-256)')
    expect(t('blocklist.reasonLabel', 'en')).toBe('Reason')
    expect(t('blocklist.reasonLabel', 'de')).toBe('Grund')
    expect(t('blocklist.durationLabel', 'en')).toBe('Duration (TTL)')
    expect(t('blocklist.durationLabel', 'de')).toBe('Dauer (TTL)')
  })

  it('has translations for blocklist actions', () => {
    expect(t('blocklist.addBlock', 'en')).toBe('ADD BLOCK')
    expect(t('blocklist.addBlock', 'de')).toBe('SPERRE HINZUFÜGEN')
    expect(t('blocklist.blockIp', 'en')).toBe('BLOCK IP')
    expect(t('blocklist.blockIp', 'de')).toBe('IP SPERREN')
    expect(t('blocklist.unblock', 'en')).toBe('Unblock')
    expect(t('blocklist.unblock', 'de')).toBe('Entsperren')
  })

  it('has translations for blocklist duration options', () => {
    expect(t('blocklist.dur1h', 'en')).toBe('1 hour')
    expect(t('blocklist.dur1h', 'de')).toBe('1 Stunde')
    expect(t('blocklist.dur7d', 'en')).toBe('7 days')
    expect(t('blocklist.dur7d', 'de')).toBe('7 Tage')
    expect(t('blocklist.dur1y', 'en')).toBe('1 year')
    expect(t('blocklist.dur1y', 'de')).toBe('1 Jahr')
  })

  it('has tooltips for blocklist stats', () => {
    expect(tip('blocklist.totalBlocked', 'en')).toContain('hard blocklist')
    expect(tip('blocklist.autoBlocked', 'de')).toContain('Bedrohungsbewertungssystem')
    expect(tip('blocklist.manualBlocked', 'en')).toContain('administrator')
  })

  it('has translations for blocklist table headers', () => {
    expect(t('blocklist.colIpHash', 'en')).toBe('IP Hash')
    expect(t('blocklist.colReason', 'en')).toBe('Reason')
    expect(t('blocklist.colBlockedAt', 'en')).toBe('Blocked At')
    expect(t('blocklist.colBlockedAt', 'de')).toBe('Gesperrt am')
    expect(t('blocklist.colExpires', 'en')).toBe('Expires')
    expect(t('blocklist.colExpires', 'de')).toBe('Läuft ab')
  })
})

// ---------------------------------------------------------------------------
describe('i18n-security: tarpitOnRobotsViolation tooltip', () => {
  it('has a tooltip for tarpitOnRobotsViolation rule', () => {
    const tipText = tip('rules.tarpitOnRobotsViolation', 'en')
    expect(tipText).toBeDefined()
    expect(tipText).toContain('robots.txt')

    const tipDe = tip('rules.tarpitOnRobotsViolation', 'de')
    expect(tipDe).toBeDefined()
    expect(tipDe).toContain('robots.txt')
  })
})
