import { motion } from 'framer-motion'
import { Trash, ShieldWarning, Globe, Clock, User, Hash, Eye, ShieldCheck, CaretDown, CaretUp, X, MagnifyingGlass, Export, SortAscending, SortDescending, FunnelSimple, Info, ArrowsDownUp } from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import { useState, useEffect, useMemo, Fragment } from 'react'
import { t, type Locale, LOCALES } from '@/lib/i18n-security'

export interface SecurityIncident {
  key: string
  method: string
  hashedIp: string
  userAgent: string
  timestamp: string
  threatScore?: number
  threatLevel?: string
  countermeasure?: string
  countermeasureDetails?: string
  autoBlocked?: boolean
  blockExpiry?: string
  requestBody?: string
  requestHeaders?: Record<string, string>
  requestPath?: string
}

interface SecurityIncidentsDashboardProps {
  open: boolean
  onClose: () => void
  onViewProfile?: (hashedIp: string) => void
}

type FilterType = 'all' | 'honeytoken' | 'robots' | 'threat' | 'blocked'
type SortField = 'time' | 'type' | 'score' | 'ip'
type SortDir = 'asc' | 'desc'
type GroupField = 'none' | 'type' | 'ip' | 'level' | 'countermeasure'

/** Classify incident type from the key field */
export function classifyIncident(key: string): { type: string; label: string; color: string } {
  if (key.startsWith('robots:')) return { type: 'robots', label: 'ROBOTS.TXT VIOLATION', color: 'text-orange-400' }
  if (key.startsWith('threat:')) return { type: 'threat', label: 'THREAT ESCALATION', color: 'text-purple-400' }
  if (key.startsWith('blocked:')) return { type: 'blocked', label: 'HARD BLOCK', color: 'text-red-600' }
  if (key.includes('backup') || key.includes('credential') || key.includes('master-key') || key.includes('password'))
    return { type: 'honeytoken', label: 'HONEYTOKEN ACCESS', color: 'text-red-400' }
  return { type: 'event', label: 'SECURITY EVENT', color: 'text-yellow-400' }
}

/** Shorten hashed IP for display */
function shortHash(hash: string): string {
  if (!hash || hash.length < 12) return hash || '—'
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`
}

export function classifyCountermeasure(incident: SecurityIncident): string {
  if (incident.autoBlocked) return 'BLOCKED'
  if (incident.countermeasure) return incident.countermeasure
  if (incident.threatLevel === 'BLOCK') return 'BLOCKED'
  if (incident.threatLevel === 'TARPIT') return 'TARPITTED'
  if (incident.threatLevel === 'WARN') return 'RATE_LIMITED'
  if (incident.key.startsWith('blocked:')) return 'BLOCKED'
  if (incident.key.startsWith('threat:')) return 'TARPITTED'
  return 'LOGGED'
}

/** Format timestamp for display */
function formatTime(ts: string): string {
  try {
    const d = new Date(ts)
    return d.toLocaleString('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  } catch {
    return ts
  }
}

/** Export incidents as JSON file download */
function exportJson(incidents: SecurityIncident[]) {
  const blob = new Blob([JSON.stringify(incidents, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `security-incidents-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Export incidents as CSV file download */
function exportCsv(incidents: SecurityIncident[]) {
  const headers = ['timestamp', 'type', 'key', 'method', 'hashedIp', 'userAgent', 'threatScore', 'threatLevel', 'countermeasure', 'autoBlocked']
  const rows = incidents.map(inc => {
    const { label } = classifyIncident(inc.key)
    const cm = classifyCountermeasure(inc)
    return [inc.timestamp, label, inc.key, inc.method, inc.hashedIp, inc.userAgent, inc.threatScore ?? '', inc.threatLevel ?? '', cm, inc.autoBlocked ? 'true' : 'false']
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  })
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `security-incidents-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/** Tooltip wrapper */
function Tip({ text, children }: { text?: string; children: React.ReactNode }) {
  if (!text) return <>{children}</>
  return (
    <span className="relative group/tip cursor-help">
      {children}
      <span className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover/tip:block w-56 px-2 py-1.5 bg-black border border-primary/30 text-[10px] text-primary/80 font-mono leading-relaxed pointer-events-none whitespace-normal">
        {text}
      </span>
    </span>
  )
}

export default function SecurityIncidentsDashboard({ open, onClose, onViewProfile }: SecurityIncidentsDashboardProps) {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('time')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [groupBy, setGroupBy] = useState<GroupField>('none')
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('de')) return 'de'
    return 'en'
  })
  const [showExportMenu, setShowExportMenu] = useState(false)

  const L = (key: string) => t(key, locale)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    fetch('/api/security-incidents', { credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setIncidents(data.incidents || []))
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

  // Aggregate stats
  const uniqueIps = new Set(incidents.map(i => i.hashedIp)).size
  const honeytokenCount = incidents.filter(i => {
    const { type } = classifyIncident(i.key)
    return type === 'honeytoken'
  }).length
  const robotsCount = incidents.filter(i => i.key.startsWith('robots:')).length
  const threatCount = incidents.filter(i => i.key.startsWith('threat:')).length
  const autoBlockedCount = incidents.filter(i => i.autoBlocked || i.key?.startsWith('blocked:')).length

  // Filter, search, sort pipeline
  const processedIncidents = useMemo(() => {
    let result = [...incidents]

    // Filter
    if (filter === 'honeytoken') result = result.filter(i => classifyIncident(i.key).type === 'honeytoken')
    else if (filter === 'robots') result = result.filter(i => i.key.startsWith('robots:'))
    else if (filter === 'threat') result = result.filter(i => i.key.startsWith('threat:'))
    else if (filter === 'blocked') result = result.filter(i => i.autoBlocked || i.key?.startsWith('blocked:'))

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(i =>
        i.key.toLowerCase().includes(q) ||
        i.hashedIp?.toLowerCase().includes(q) ||
        i.userAgent?.toLowerCase().includes(q) ||
        i.method?.toLowerCase().includes(q) ||
        classifyIncident(i.key).label.toLowerCase().includes(q) ||
        classifyCountermeasure(i).toLowerCase().includes(q)
      )
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'time':
          cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case 'type':
          cmp = classifyIncident(a.key).label.localeCompare(classifyIncident(b.key).label)
          break
        case 'score':
          cmp = (a.threatScore ?? 0) - (b.threatScore ?? 0)
          break
        case 'ip':
          cmp = (a.hashedIp || '').localeCompare(b.hashedIp || '')
          break
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [incidents, filter, search, sortField, sortDir])

  // Grouping
  const groupedIncidents = useMemo(() => {
    if (groupBy === 'none') return null
    const groups = new Map<string, SecurityIncident[]>()
    for (const inc of processedIncidents) {
      let groupKey: string
      switch (groupBy) {
        case 'type': groupKey = classifyIncident(inc.key).label; break
        case 'ip': groupKey = inc.hashedIp || 'Unknown'; break
        case 'level': groupKey = inc.threatLevel || 'CLEAN'; break
        case 'countermeasure': groupKey = classifyCountermeasure(inc); break
        default: groupKey = 'Other'
      }
      if (!groups.has(groupKey)) groups.set(groupKey, [])
      groups.get(groupKey)!.push(inc)
    }
    return groups
  }, [processedIncidents, groupBy])

  const handleClear = async () => {
    if (!window.confirm(L('sec.clearConfirm'))) return
    try {
      const res = await fetch('/api/security-incidents', { method: 'DELETE', credentials: 'same-origin' })
      if (res.ok) setIncidents([])
    } catch { /* ignore */ }
  }

  const toggleExpand = (rowKey: string) => {
    setExpandedKey(prev => prev === rowKey ? null : rowKey)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowsDownUp size={10} className="opacity-30" />
    return sortDir === 'asc' ? <SortAscending size={10} /> : <SortDescending size={10} />
  }

  const cmColors: Record<string, string> = {
    BLOCKED: 'bg-red-500/20 text-red-400 border-red-500/30',
    TARPITTED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    RATE_LIMITED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOGGED: 'bg-primary/20 text-primary border-primary/30',
    ZIP_BOMB: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  }

  const threatColors: Record<string, string> = {
    BLOCK: 'bg-red-500/20 text-red-400 border-red-500/30',
    TARPIT: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    WARN: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CLEAN: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  const renderIncidentRow = (inc: SecurityIncident, i: number) => {
    const { label, color } = classifyIncident(inc.key)
    const rowKey = `${inc.timestamp}-${i}`
    const isExpanded = expandedKey === rowKey
    const cm = classifyCountermeasure(inc)

    return (
      <Fragment key={rowKey}>
        <tr
          className="border-t border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer"
          onClick={() => toggleExpand(rowKey)}
        >
          <td className="px-3 py-2 text-primary/40">
            {isExpanded ? <CaretUp size={11} /> : <CaretDown size={11} />}
          </td>
          <td className="px-3 py-2 text-foreground/50 whitespace-nowrap">
            <Clock size={11} className="inline mr-1 opacity-50" />
            {formatTime(inc.timestamp)}
          </td>
          <td className={`px-3 py-2 ${color} whitespace-nowrap`}>
            {label}
          </td>
          <td className="px-3 py-2 text-foreground/70 max-w-[200px] truncate" title={inc.key}>
            {inc.key}
          </td>
          <td className="px-3 py-2 text-foreground/50 hidden md:table-cell">
            {inc.method}
          </td>
          <td className="px-3 py-2 text-foreground/40 hidden md:table-cell font-mono" title={inc.hashedIp}>
            {shortHash(inc.hashedIp)}
          </td>
          <td className="px-3 py-2 text-foreground/50 hidden lg:table-cell">
            {inc.threatScore != null ? inc.threatScore : '—'}
          </td>
          {onViewProfile && (
            <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onViewProfile(inc.hashedIp)}
                className="px-2 py-1 border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors flex items-center gap-1"
                title={L('sec.viewProfileTip')}
              >
                <Eye size={12} />
                <span className="text-[10px] font-mono uppercase">{L('sec.viewProfile')}</span>
              </button>
            </td>
          )}
        </tr>
        {isExpanded && (
          <tr className="bg-primary/5 border-t border-primary/10">
            <td colSpan={onViewProfile ? 8 : 7} className="px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-[11px]">
                {/* Threat assessment */}
                <div className="space-y-2">
                  <p className="text-primary/50 uppercase tracking-wider text-[10px] mb-2">{L('sec.threatAssessment')}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/40 w-28">{L('sec.levelLabel')}</span>
                    {inc.threatLevel ? (
                      <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold tracking-wider border ${threatColors[inc.threatLevel] || threatColors.CLEAN}`}>
                        {inc.threatLevel} {inc.threatScore ? `(score: ${inc.threatScore})` : ''}
                      </span>
                    ) : <span className="text-foreground/30">—</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/40 w-28">{L('sec.countermeasure')}</span>
                    <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold tracking-wider border ${cmColors[cm] || cmColors.LOGGED}`}>
                      {cm}
                    </span>
                  </div>
                  {inc.countermeasureDetails && (
                    <div className="flex items-start gap-2">
                      <span className="text-foreground/40 w-28 flex-shrink-0">{L('sec.details')}</span>
                      <span className="text-foreground/60">{inc.countermeasureDetails}</span>
                    </div>
                  )}
                  {inc.autoBlocked && inc.blockExpiry && (
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/40 w-28">{L('sec.blockExpiry')}</span>
                      <span className="text-red-400/80">{new Date(inc.blockExpiry).toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB')}</span>
                    </div>
                  )}
                </div>
                {/* Request details */}
                <div className="space-y-2">
                  <p className="text-primary/50 uppercase tracking-wider text-[10px] mb-2">{L('sec.requestDetails')}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/40 w-28">{L('sec.fullTarget')}</span>
                    <span className="text-foreground/70 break-all">{inc.key}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/40 w-28">{L('sec.method')}</span>
                    <span className="text-foreground/70">{inc.method || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-foreground/40 w-28 flex-shrink-0">{L('sec.ipHash')}</span>
                    <span className="text-foreground/40 break-all" title={inc.hashedIp}>{inc.hashedIp || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-foreground/40 w-28 flex-shrink-0">{L('sec.userAgent')}</span>
                    <span className="text-foreground/40 break-all">{inc.userAgent || '—'}</span>
                  </div>
                </div>
                {/* Request content from suspicious actors */}
                <div className="space-y-2">
                  <p className="text-primary/50 uppercase tracking-wider text-[10px] mb-2">{L('sec.requestContent')}</p>
                  {inc.requestPath && (
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/40 w-28">{L('sec.requestPath')}</span>
                      <span className="text-foreground/60 break-all">{inc.requestPath}</span>
                    </div>
                  )}
                  {inc.requestHeaders && Object.keys(inc.requestHeaders).length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-foreground/40 w-28 flex-shrink-0">{L('sec.requestHeaders')}</span>
                      <pre className="text-foreground/40 break-all text-[9px] bg-black/30 p-1.5 border border-primary/10 max-h-24 overflow-y-auto w-full">
                        {Object.entries(inc.requestHeaders).map(([k, v]) => `${k}: ${v}`).join('\n')}
                      </pre>
                    </div>
                  )}
                  {inc.requestBody && (
                    <div className="flex items-start gap-2">
                      <span className="text-foreground/40 w-28 flex-shrink-0">{L('sec.requestBody')}</span>
                      <pre className="text-foreground/40 break-all text-[9px] bg-black/30 p-1.5 border border-primary/10 max-h-24 overflow-y-auto w-full">
                        {inc.requestBody}
                      </pre>
                    </div>
                  )}
                  {!inc.requestPath && !inc.requestHeaders && !inc.requestBody && (
                    <p className="text-foreground/20 text-[10px] italic">{L('sec.noContent')}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleExpand(rowKey)}
                className="mt-3 flex items-center gap-1 text-primary/40 hover:text-primary/70 transition-colors text-[10px]"
              >
                <X size={10} /> {L('sec.collapse')}
              </button>
            </td>
          </tr>
        )}
      </Fragment>
    )
  }

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
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[11px] text-primary/70 tracking-wider uppercase">
              {L('sec.title')} // {L('sec.subtitle')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language switch */}
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
            {/* Export */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="text-primary/60 hover:text-primary transition-colors"
                title={L('sec.exportTip')}
              >
                <Export size={16} />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-primary/30 shadow-lg">
                  <button
                    onClick={() => { exportJson(processedIncidents); setShowExportMenu(false) }}
                    className="block w-full px-4 py-2 text-left font-mono text-[11px] text-primary/70 hover:bg-primary/10 transition-colors whitespace-nowrap"
                  >
                    {L('sec.exportJson')}
                  </button>
                  <button
                    onClick={() => { exportCsv(processedIncidents); setShowExportMenu(false) }}
                    className="block w-full px-4 py-2 text-left font-mono text-[11px] text-primary/70 hover:bg-primary/10 transition-colors whitespace-nowrap"
                  >
                    {L('sec.exportCsv')}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleClear}
              className="text-destructive/60 hover:text-destructive transition-colors"
              title={L('sec.clearAll')}
            >
              <Trash size={16} />
            </button>
            <CyberCloseButton onClick={onClose} label={L('sec.close')} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
              <span className="ml-3 font-mono text-[11px] text-primary/50">{L('sec.loading')}</span>
            </div>
          )}

          {error && (
            <div className="border border-red-500/30 bg-red-500/10 p-4 text-center">
              <p className="font-mono text-[12px] text-red-400">{L('sec.failedToLoad')}: {error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Tip text={L('sec.totalTip')}>
                  <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                    <div className="flex items-center gap-2 text-primary/60">
                      <ShieldWarning size={16} />
                      <span className="text-[11px] font-mono tracking-wider uppercase">{L('sec.total')}</span>
                      <Info size={10} className="opacity-30" />
                    </div>
                    <p className="text-xl font-mono font-bold text-foreground">{incidents.length}</p>
                  </div>
                </Tip>
                <Tip text={L('sec.honeytokenTip')}>
                  <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                    <div className="flex items-center gap-2 text-red-400/60">
                      <Hash size={16} />
                      <span className="text-[11px] font-mono tracking-wider uppercase">{L('sec.honeytoken')}</span>
                      <Info size={10} className="opacity-30" />
                    </div>
                    <p className="text-xl font-mono font-bold text-red-400">{honeytokenCount}</p>
                  </div>
                </Tip>
                <Tip text={L('sec.robotsTip')}>
                  <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                    <div className="flex items-center gap-2 text-orange-400/60">
                      <Globe size={16} />
                      <span className="text-[11px] font-mono tracking-wider uppercase">{L('sec.robots')}</span>
                      <Info size={10} className="opacity-30" />
                    </div>
                    <p className="text-xl font-mono font-bold text-orange-400">{robotsCount}</p>
                  </div>
                </Tip>
                <Tip text={L('sec.uniqueIpsTip')}>
                  <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                    <div className="flex items-center gap-2 text-primary/60">
                      <User size={16} />
                      <span className="text-[11px] font-mono tracking-wider uppercase">{L('sec.uniqueIps')}</span>
                      <Info size={10} className="opacity-30" />
                    </div>
                    <p className="text-xl font-mono font-bold text-foreground">{uniqueIps}</p>
                  </div>
                </Tip>
                <Tip text={L('sec.blockedTip')}>
                  <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                    <div className="flex items-center gap-2 text-green-400/60">
                      <ShieldCheck size={16} />
                      <span className="text-[11px] font-mono tracking-wider uppercase">{L('sec.blocked')}</span>
                      <Info size={10} className="opacity-30" />
                    </div>
                    <p className="text-xl font-mono font-bold text-green-400">{autoBlockedCount}</p>
                  </div>
                </Tip>
              </div>

              {/* Search + Group controls */}
              <div className="flex flex-wrap gap-2 items-center">
                {/* Search */}
                <div className="flex-1 min-w-[200px] relative">
                  <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={L('sec.search')}
                    title={L('sec.searchTip')}
                    className="w-full bg-black/30 border border-primary/20 pl-8 pr-3 py-1.5 font-mono text-[11px] text-foreground/80 placeholder:text-primary/30 focus:border-primary/50 focus:outline-none"
                  />
                </div>
                {/* Group by */}
                <div className="flex items-center gap-1.5">
                  <FunnelSimple size={14} className="text-primary/40" />
                  <select
                    value={groupBy}
                    onChange={e => setGroupBy(e.target.value as GroupField)}
                    className="bg-black/30 border border-primary/20 px-2 py-1.5 font-mono text-[10px] text-primary/70 focus:border-primary/50 focus:outline-none cursor-pointer"
                    title={L('sec.groupBy')}
                  >
                    <option value="none">{L('sec.groupBy')}: {L('sec.groupNone')}</option>
                    <option value="type">{L('sec.groupBy')}: {L('sec.groupType')}</option>
                    <option value="ip">{L('sec.groupBy')}: {L('sec.groupIp')}</option>
                    <option value="level">{L('sec.groupBy')}: {L('sec.groupLevel')}</option>
                    <option value="countermeasure">{L('sec.groupBy')}: {L('sec.groupCountermeasure')}</option>
                  </select>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 border-b border-primary/10 pb-2 flex-wrap">
                {([
                  { key: 'all' as FilterType, label: L('sec.filterAll'), count: incidents.length },
                  { key: 'honeytoken' as FilterType, label: L('sec.filterHoneytoken'), count: honeytokenCount },
                  { key: 'robots' as FilterType, label: L('sec.filterRobots'), count: robotsCount },
                  { key: 'threat' as FilterType, label: L('sec.filterThreat'), count: threatCount },
                  { key: 'blocked' as FilterType, label: L('sec.filterBlocked'), count: autoBlockedCount },
                ]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`font-mono text-[11px] px-3 py-1.5 uppercase tracking-wider transition-colors ${
                      filter === f.key
                        ? 'text-primary bg-primary/10 border border-primary/30'
                        : 'text-primary/40 hover:text-primary/70'
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              {/* Incident list */}
              {processedIncidents.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldWarning size={32} className="text-primary/20 mx-auto mb-3" />
                  <p className="font-mono text-[12px] text-primary/30">{L('sec.noIncidents')}</p>
                </div>
              ) : groupedIncidents ? (
                /* Grouped view */
                <div className="space-y-4">
                  {Array.from(groupedIncidents.entries()).map(([groupKey, groupInc]) => (
                    <div key={groupKey} className="border border-primary/10">
                      <div className="bg-primary/10 px-3 py-2 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-primary/70 uppercase tracking-wider">{groupKey}</span>
                        <span className="font-mono text-[10px] text-primary/50">{groupInc.length} {L('sec.events')}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] font-mono min-w-[480px]">
                          <tbody>
                            {groupInc.map((inc, i) => renderIncidentRow(inc, i))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Flat view */
                <div className="border border-primary/10 overflow-x-auto">
                  <table className="w-full text-[11px] font-mono min-w-[480px]">
                    <thead>
                      <tr className="bg-primary/10 text-primary/70">
                        <th className="text-left px-3 py-2 tracking-wider w-8" />
                        <th className="text-left px-3 py-2 tracking-wider cursor-pointer select-none" onClick={() => handleSort('time')}>
                          <span className="flex items-center gap-1">{L('sec.colTime')} <SortIcon field="time" /></span>
                        </th>
                        <th className="text-left px-3 py-2 tracking-wider cursor-pointer select-none" onClick={() => handleSort('type')}>
                          <span className="flex items-center gap-1">{L('sec.colType')} <SortIcon field="type" /></span>
                        </th>
                        <th className="text-left px-3 py-2 tracking-wider">{L('sec.colTarget')}</th>
                        <th className="text-left px-3 py-2 tracking-wider hidden md:table-cell">{L('sec.colMethod')}</th>
                        <th className="text-left px-3 py-2 tracking-wider hidden md:table-cell cursor-pointer select-none" onClick={() => handleSort('ip')}>
                          <span className="flex items-center gap-1">{L('sec.colIpHash')} <SortIcon field="ip" /></span>
                        </th>
                        <th className="text-left px-3 py-2 tracking-wider hidden lg:table-cell cursor-pointer select-none" onClick={() => handleSort('score')}>
                          <span className="flex items-center gap-1">{L('sec.colScore')} <SortIcon field="score" /></span>
                        </th>
                        {onViewProfile && <th className="text-left px-3 py-2 tracking-wider">{L('sec.colAction')}</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {processedIncidents.map((inc, i) => renderIncidentRow(inc, i))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 text-[10px] text-primary/40 pt-2 border-t border-primary/10">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 animate-pulse" />
            <span>{L('sec.threatMonitorActive')}</span>
            <span className="ml-auto">
              {incidents.length} {L('sec.events')} &middot; {L('sec.gdprNote')}
            </span>
          </div>
        </div>
      </motion.div>
    </CyberModalBackdrop>
  )
}
