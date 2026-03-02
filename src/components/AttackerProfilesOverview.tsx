import { motion } from 'framer-motion'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import CyberCloseButton from '@/components/CyberCloseButton'
import { useState, useEffect, useMemo, startTransition } from 'react'
import { Shield, Eye, Trash, MagnifyingGlass, Warning, ArrowsDownUp, SortAscending, SortDescending, UsersFour } from '@phosphor-icons/react'
import { t, type Locale, LOCALES } from '@/lib/i18n-security'

interface ProfileSummary {
  hashedIp: string
  firstSeen: string
  lastSeen: string
  totalIncidents: number
  attackTypes: Record<string, number>
  userAgents: Record<string, number>
  threatScoreHistory: Array<{ score: number; level: string; timestamp: string }>
  behavioralPatterns: Array<{ type: string; severity: string; description: string }>
}

interface AttackerProfilesOverviewProps {
  open: boolean
  onClose: () => void
  onViewProfile: (hashedIp: string) => void
}

const THREAT_LEVEL_COLORS: Record<string, string> = {
  BLOCK: '#dc2626',
  TARPIT: '#f97316',
  WARN: '#eab308',
  CLEAN: '#22c55e',
}

type SortField = 'score' | 'incidents' | 'lastSeen' | 'firstSeen'
type SortDir = 'asc' | 'desc'

function shortHash(hash: string): string {
  if (!hash || hash.length < 12) return hash || '—'
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`
}

function formatTime(ts: string, locale: Locale): string {
  try {
    return new Date(ts).toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return ts
  }
}

function formatRelativeTime(ts: string, locale: Locale): string {
  try {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return locale === 'de' ? `vor ${mins}m` : `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return locale === 'de' ? `vor ${hours}h` : `${hours}h ago`
    const days = Math.floor(hours / 24)
    return locale === 'de' ? `vor ${days}d` : `${days}d ago`
  } catch {
    return ts
  }
}

function getLatestScore(profile: ProfileSummary): number {
  const history = profile.threatScoreHistory
  if (!history || history.length === 0) return 0
  return history[history.length - 1].score
}

function getLatestLevel(profile: ProfileSummary): string {
  const history = profile.threatScoreHistory
  if (!history || history.length === 0) return 'CLEAN'
  return history[history.length - 1].level || 'CLEAN'
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ArrowsDownUp size={10} className="opacity-30" />
  return sortDir === 'asc' ? <SortAscending size={10} /> : <SortDescending size={10} />
}

export default function AttackerProfilesOverview({ open, onClose, onViewProfile }: AttackerProfilesOverviewProps) {
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('de')) return 'de'
    return 'en'
  })
  const [now, setNow] = useState(() => Date.now())

  const L = (key: string) => t(key, locale)

  useEffect(() => {
    if (!open) return
    startTransition(() => {
      setLoading(true)
      setError(null)
    })
    fetch('/api/attacker-profile?limit=100', { credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setProfiles(data.profiles || [])
        setTotal(data.total || 0)
        setNow(Date.now())
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const handleDelete = async (hashedIp: string) => {
    if (!window.confirm(L('profiles.deleteConfirm'))) return
    try {
      const res = await fetch(`/api/attacker-profile?hashedIp=${encodeURIComponent(hashedIp)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      if (res.ok) {
        setProfiles(prev => prev.filter(p => p.hashedIp !== hashedIp))
        setTotal(prev => prev - 1)
      }
    } catch { /* ignore */ }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  // Aggregate stats
  const { highThreatCount, active24h, totalIncidents } = useMemo(() => {
    return {
      highThreatCount: profiles.filter(p => getLatestLevel(p) === 'BLOCK' || getLatestLevel(p) === 'TARPIT').length,
      active24h: profiles.filter(p => {
        try { return now - new Date(p.lastSeen).getTime() < 86400000 } catch { return false }
      }).length,
      totalIncidents: profiles.reduce((sum, p) => sum + (p.totalIncidents || 0), 0),
    }
  }, [profiles, now])

  // Filter + sort
  const processedProfiles = useMemo(() => {
    let result = [...profiles]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.hashedIp?.toLowerCase().includes(q) ||
        Object.keys(p.attackTypes || {}).some(t => t.toLowerCase().includes(q))
      )
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'score': cmp = getLatestScore(a) - getLatestScore(b); break
        case 'incidents': cmp = (a.totalIncidents || 0) - (b.totalIncidents || 0); break
        case 'lastSeen': cmp = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime(); break
        case 'firstSeen': cmp = new Date(a.firstSeen).getTime() - new Date(b.firstSeen).getTime(); break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [profiles, search, sortField, sortDir])

  return (
    <CyberModalBackdrop open={open} zIndex="z-[9999]">
      <motion.div
        className="w-full max-w-6xl max-h-[90dvh] bg-card border border-primary/30 relative flex flex-col overflow-hidden"
        style={{ textShadow: 'none' }}
        initial={{ scale: 0.85, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.85, y: 30, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HUD corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50 pointer-events-none" />

        {/* Header */}
        <div className="h-10 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <UsersFour size={16} className="text-primary/70" />
            <span className="font-mono text-[11px] text-primary/70 tracking-wider uppercase">
              {L('profiles.title')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-primary/20">
              {LOCALES.map(loc => (
                <button
                  key={loc.value}
                  onClick={() => setLocale(loc.value)}
                  className={`px-2 py-0.5 text-[9px] font-mono transition-colors ${
                    locale === loc.value ? 'bg-primary/30 text-primary' : 'text-primary/40 hover:text-primary/70'
                  }`}
                  title={loc.value === 'en' ? 'English' : 'Deutsch'}
                >
                  {loc.label}
                </button>
              ))}
            </div>
            <CyberCloseButton onClick={onClose} label={L('sec.close')} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
              <span className="ml-3 font-mono text-[11px] text-primary/50">{L('profiles.loading')}</span>
            </div>
          )}

          {error && (
            <div className="border border-red-500/30 bg-red-500/10 p-4 text-center">
              <p className="font-mono text-[12px] text-red-400">{L('profiles.failedToLoad')}: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-primary/60">
                    <UsersFour size={16} />
                    <span className="text-[11px] font-mono tracking-wider uppercase">{L('profiles.totalProfiles')}</span>
                  </div>
                  <p className="text-xl font-mono font-bold text-foreground">{total}</p>
                </div>
                <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-red-400/60">
                    <Warning size={16} />
                    <span className="text-[11px] font-mono tracking-wider uppercase">{L('profiles.highThreat')}</span>
                  </div>
                  <p className="text-xl font-mono font-bold text-red-400">{highThreatCount}</p>
                </div>
                <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-orange-400/60">
                    <Eye size={16} />
                    <span className="text-[11px] font-mono tracking-wider uppercase">{L('profiles.activeAttackers')}</span>
                  </div>
                  <p className="text-xl font-mono font-bold text-orange-400">{active24h}</p>
                </div>
                <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-primary/60">
                    <Shield size={16} />
                    <span className="text-[11px] font-mono tracking-wider uppercase">{L('profiles.totalIncidents')}</span>
                  </div>
                  <p className="text-xl font-mono font-bold text-foreground">{totalIncidents}</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/40" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={L('profiles.search')}
                  className="w-full bg-black/30 border border-primary/20 pl-8 pr-3 py-1.5 font-mono text-[11px] text-foreground/80 placeholder:text-primary/30 focus:border-primary/50 focus:outline-none"
                />
              </div>

              {/* Profiles list */}
              {processedProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <UsersFour size={32} className="text-primary/20 mx-auto mb-3" />
                  <p className="font-mono text-[12px] text-primary/30">{L('profiles.noProfiles')}</p>
                  <p className="font-mono text-[10px] text-primary/20 mt-1">{L('profiles.noProfilesDesc')}</p>
                </div>
              ) : (
                <>
                  {/* Desktop table view */}
                  <div className="hidden md:block border border-primary/10 overflow-x-auto">
                    <table className="w-full text-[11px] font-mono">
                      <thead>
                        <tr className="bg-primary/10 text-primary/70">
                          <th className="text-left px-3 py-2 tracking-wider">{L('profiles.colIpHash')}</th>
                          <th className="text-left px-3 py-2 tracking-wider cursor-pointer select-none" onClick={() => handleSort('score')}>
                            <span className="flex items-center gap-1">{L('profiles.colScore')} <SortIcon field="score" sortField={sortField} sortDir={sortDir} /></span>
                          </th>
                          <th className="text-left px-3 py-2 tracking-wider cursor-pointer select-none" onClick={() => handleSort('incidents')}>
                            <span className="flex items-center gap-1">{L('profiles.colIncidents')} <SortIcon field="incidents" sortField={sortField} sortDir={sortDir} /></span>
                          </th>
                          <th className="text-left px-3 py-2 tracking-wider">{L('profiles.colAttackTypes')}</th>
                          <th className="text-left px-3 py-2 tracking-wider hidden lg:table-cell">{L('profiles.colPatterns')}</th>
                          <th className="text-left px-3 py-2 tracking-wider cursor-pointer select-none" onClick={() => handleSort('lastSeen')}>
                            <span className="flex items-center gap-1">{L('profiles.colLastSeen')} <SortIcon field="lastSeen" sortField={sortField} sortDir={sortDir} /></span>
                          </th>
                          <th className="text-left px-3 py-2 tracking-wider">{L('profiles.colAction')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedProfiles.map(profile => {
                          const score = getLatestScore(profile)
                          const level = getLatestLevel(profile)
                          const threatColor = THREAT_LEVEL_COLORS[level] || '#22c55e'
                          const attackTypes = Object.keys(profile.attackTypes || {})
                          const patterns = profile.behavioralPatterns || []
                          const highPatterns = patterns.filter(p => p.severity === 'high').length

                          return (
                            <tr key={profile.hashedIp} className="border-t border-primary/5 hover:bg-primary/5 transition-colors">
                              <td className="px-3 py-2.5 text-foreground/60" title={profile.hashedIp}>
                                {shortHash(profile.hashedIp)}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="font-bold text-[13px]" style={{ color: threatColor }}>{score}</span>
                                <span className="ml-1.5 px-1.5 py-0.5 text-[8px] font-bold tracking-wider border" style={{
                                  backgroundColor: threatColor + '20',
                                  color: threatColor,
                                  borderColor: threatColor + '40',
                                }}>{level}</span>
                              </td>
                              <td className="px-3 py-2.5 text-foreground/80">{profile.totalIncidents}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex flex-wrap gap-1">
                                  {attackTypes.slice(0, 3).map(type => (
                                    <span key={type} className="px-1.5 py-0.5 text-[8px] bg-primary/10 text-primary/60 border border-primary/20">
                                      {type.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                  ))}
                                  {attackTypes.length > 3 && (
                                    <span className="px-1.5 py-0.5 text-[8px] text-primary/40">+{attackTypes.length - 3}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 hidden lg:table-cell">
                                {patterns.length > 0 ? (
                                  <div className="flex items-center gap-1.5">
                                    {highPatterns > 0 && (
                                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] bg-red-500/10 text-red-400 border border-red-500/20">
                                        <Warning size={9} /> {highPatterns} HIGH
                                      </span>
                                    )}
                                    {patterns.length - highPatterns > 0 && (
                                      <span className="px-1.5 py-0.5 text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                        {patterns.length - highPatterns} MED
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-primary/20 text-[9px]">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-foreground/50 whitespace-nowrap" title={formatTime(profile.lastSeen, locale)}>
                                {formatRelativeTime(profile.lastSeen, locale)}
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => onViewProfile(profile.hashedIp)}
                                    className="px-2 py-1 border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-1"
                                    title={L('profiles.viewDetail')}
                                  >
                                    <Eye size={12} />
                                    <span className="text-[10px] font-mono uppercase">{L('profiles.viewDetail')}</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(profile.hashedIp)}
                                    className="px-1.5 py-1 border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title={L('profiles.deleteProfile')}
                                  >
                                    <Trash size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card view */}
                  <div className="md:hidden space-y-3">
                    {processedProfiles.map(profile => {
                      const score = getLatestScore(profile)
                      const level = getLatestLevel(profile)
                      const threatColor = THREAT_LEVEL_COLORS[level] || '#22c55e'
                      const attackTypes = Object.keys(profile.attackTypes || {})
                      const patterns = profile.behavioralPatterns || []
                      const highPatterns = patterns.filter(p => p.severity === 'high').length

                      return (
                        <div key={profile.hashedIp} className="border border-primary/20 bg-primary/5 p-3 space-y-2">
                          {/* Top row: IP hash + score */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] text-foreground/70" title={profile.hashedIp}>
                              {shortHash(profile.hashedIp)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[16px] font-mono" style={{ color: threatColor }}>{score}</span>
                              <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-wider border" style={{
                                backgroundColor: threatColor + '20',
                                color: threatColor,
                                borderColor: threatColor + '40',
                              }}>{level}</span>
                            </div>
                          </div>

                          {/* Stats row */}
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="font-mono text-[9px] text-primary/40 uppercase">{L('profiles.colIncidents')}</p>
                              <p className="font-mono text-[13px] text-foreground/80 font-bold">{profile.totalIncidents}</p>
                            </div>
                            <div>
                              <p className="font-mono text-[9px] text-primary/40 uppercase">{L('profiles.colAttackTypes')}</p>
                              <p className="font-mono text-[13px] text-foreground/80 font-bold">{attackTypes.length}</p>
                            </div>
                            <div>
                              <p className="font-mono text-[9px] text-primary/40 uppercase">{L('profiles.colPatterns')}</p>
                              <p className="font-mono text-[13px] text-foreground/80 font-bold">
                                {patterns.length > 0 ? (
                                  <span>
                                    {highPatterns > 0 && <span className="text-red-400">{highPatterns}</span>}
                                    {highPatterns > 0 && patterns.length - highPatterns > 0 && '/'}
                                    {patterns.length - highPatterns > 0 && <span className="text-yellow-400">{patterns.length - highPatterns}</span>}
                                  </span>
                                ) : '—'}
                              </p>
                            </div>
                          </div>

                          {/* Attack types */}
                          {attackTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {attackTypes.slice(0, 4).map(type => (
                                <span key={type} className="px-1.5 py-0.5 text-[8px] bg-primary/10 text-primary/60 border border-primary/20">
                                  {type.replace(/_/g, ' ').toUpperCase()}
                                </span>
                              ))}
                              {attackTypes.length > 4 && (
                                <span className="px-1.5 py-0.5 text-[8px] text-primary/40">+{attackTypes.length - 4}</span>
                              )}
                            </div>
                          )}

                          {/* Last seen + actions */}
                          <div className="flex items-center justify-between pt-1 border-t border-primary/10">
                            <span className="font-mono text-[9px] text-primary/40" title={formatTime(profile.lastSeen, locale)}>
                              {L('profiles.colLastSeen')}: {formatRelativeTime(profile.lastSeen, locale)}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onViewProfile(profile.hashedIp)}
                                className="px-2 py-1 border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-1"
                              >
                                <Eye size={11} />
                                <span className="text-[9px] font-mono uppercase">{L('profiles.viewDetail')}</span>
                              </button>
                              <button
                                onClick={() => handleDelete(profile.hashedIp)}
                                className="px-1.5 py-1 border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title={L('profiles.deleteProfile')}
                              >
                                <Trash size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 text-[10px] text-primary/40 pt-2 border-t border-primary/10">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
            <span>{L('profiles.footer')}</span>
            <span className="ml-auto">
              {total} {locale === 'de' ? 'Profile' : 'profiles'} &middot; {L('sec.gdprNote')}
            </span>
          </div>
        </div>
      </motion.div>
    </CyberModalBackdrop>
  )
}
