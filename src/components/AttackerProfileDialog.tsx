import { motion } from 'framer-motion'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import { Warning, Globe, User, ChartLine, List, Shield, Fingerprint } from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { t, tip, type Locale, LOCALES } from '@/lib/i18n-security'

interface AttackerProfileDialogProps {
  open: boolean
  onClose: () => void
  hashedIp: string
}

interface ThreatScoreEntry {
  score: number
  level: string
  timestamp: string
  reason: string
}

interface Incident {
  type: string
  key: string
  method: string
  timestamp: string
  threatScore?: number
  threatLevel?: string
}

interface BehavioralPattern {
  type: string
  severity: string
  description: string
  details: Record<string, unknown>
}

interface UserAgentInfo {
  userAgent: string
  count: number
  category: string
}

interface JsFingerprint {
  timezone: string | null
  language: string | null
  platform: string | null
  cores: number | null
  memory: number | null
  screenWidth: number | null
  screenHeight: number | null
  colorDepth: number | null
  touchSupport: boolean | null
  canvasHash: string | null
  realIp: string | null
}

interface ForensicEntry {
  token: string
  event: string
  timestamp: string
  documentPath: string
  userAgent: string
  acceptLanguage: string
  openerIp: string
  downloaderIp: string
  jsFingerprint: JsFingerprint | null
}

interface Profile {
  hashedIp: string
  firstSeen: string
  lastSeen: string
  totalIncidents: number
  attackTypes: Record<string, number>
  userAgents: Record<string, number>
  threatScoreHistory: ThreatScoreEntry[]
  incidents: Incident[]
  behavioralPatterns: BehavioralPattern[]
  forensicData?: ForensicEntry[]
  userAgentAnalysis: {
    total: number
    unique: number
    userAgents: UserAgentInfo[]
    topUserAgent: UserAgentInfo | null
    diversity: string
  }
}

const SEVERITY_COLORS = {
  high: '#ef4444',
  medium: '#f97316',
  low: '#eab308',
}

const ATTACK_TYPE_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#8b5cf6', // purple
  '#ec4899', // pink
]

const THREAT_LEVEL_COLORS = {
  BLOCK: '#dc2626',
  TARPIT: '#f97316',
  WARN: '#eab308',
  CLEAN: '#22c55e',
}

export default function AttackerProfileDialog({ open, onClose, hashedIp }: AttackerProfileDialogProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('de')) return 'de'
    return 'en'
  })
  const L = (key: string) => t(key, locale)
  const LT = (key: string) => tip(key, locale)

  useEffect(() => {
    if (!open || !hashedIp) return
    loadProfile()
  }, [open, hashedIp])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const loadProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/attacker-profile?hashedIp=${hashedIp}`, { credentials: 'same-origin' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setProfile(data.profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('en-GB', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    } catch {
      return ts
    }
  }

  const formatShortTime = (ts: string) => {
    try {
      const date = new Date(ts)
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ts
    }
  }

  // Prepare chart data
  const threatScoreChartData = profile?.threatScoreHistory.map((entry, idx) => ({
    index: idx + 1,
    score: entry.score,
    level: entry.level,
    time: formatShortTime(entry.timestamp),
    reason: entry.reason,
  })) || []

  const attackTypeChartData = Object.entries(profile?.attackTypes || {})
    .map(([type, count]) => ({
      name: type.replace(/_/g, ' ').toUpperCase(),
      value: count,
    }))
    .sort((a, b) => b.value - a.value)

  const uaCategoryData = profile?.userAgentAnalysis.userAgents.reduce((acc, ua) => {
    const existing = acc.find(item => item.name === ua.category)
    if (existing) {
      existing.value += ua.count
    } else {
      acc.push({ name: ua.category.toUpperCase(), value: ua.count })
    }
    return acc
  }, [] as { name: string; value: number }[]) || []

  const getSeverityIcon = (severity: string) => {
    if (severity === 'high') return <Warning size={18} className="text-red-400" weight="bold" />
    if (severity === 'medium') return <Warning size={18} className="text-orange-400" />
    return <Warning size={18} className="text-yellow-400" />
  }

  return (
    <CyberModalBackdrop open={open} zIndex="z-[9999]">
          <motion.div
            className="w-full max-w-6xl max-h-[90dvh] bg-card border border-primary/30 relative overflow-hidden flex flex-col"
            style={{ textShadow: 'none' }}
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HUD corners */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

            {/* Header */}
            <div className="h-10 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-primary/70" />
                <span className="font-mono text-[11px] text-primary/70 tracking-wider uppercase">
                  {L('profile.title')}
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
                  <span className="ml-3 font-mono text-[11px] text-primary/50">{L('profile.loading')}</span>
                </div>
              )}

              {error && (
                <div className="border border-red-500/30 bg-red-500/10 p-4 text-center">
                  <p className="font-mono text-[12px] text-red-400">{L('profile.failedToLoad')}: {error}</p>
                </div>
              )}

              {!loading && !error && profile && (
                <>
                  {/* Summary Stats */}
                  <div className="border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-[10px] text-primary/50 uppercase" title={LT('profile.ipHash')}>{L('profile.ipHash')}</p>
                        <p className="font-mono text-[12px] text-foreground/90 mt-1">{hashedIp}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[10px] text-primary/50 uppercase">{L('profile.currentScore')}</p>
                        {(() => {
                          const lastEntry = profile.threatScoreHistory[profile.threatScoreHistory.length - 1]
                          const threatColor = lastEntry?.level 
                            ? THREAT_LEVEL_COLORS[lastEntry.level as keyof typeof THREAT_LEVEL_COLORS] || '#22c55e'
                            : '#22c55e'
                          return (
                            <p className="font-mono text-[24px] font-bold" style={{ color: threatColor }}>
                              {lastEntry?.score || 0}
                            </p>
                          )
                        })()}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 pt-2 border-t border-primary/10">
                      <div>
                        <p className="font-mono text-[10px] text-primary/50" title={LT('profile.totalIncidents')}>{L('profile.totalIncidents')}</p>
                        <p className="font-mono text-[16px] text-foreground/90 font-bold">{profile.totalIncidents}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-primary/50" title={LT('profile.firstSeen')}>{L('profile.firstSeen')}</p>
                        <p className="font-mono text-[11px] text-foreground/80">{formatTime(profile.firstSeen)}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-primary/50" title={LT('profile.lastSeen')}>{L('profile.lastSeen')}</p>
                        <p className="font-mono text-[11px] text-foreground/80">{formatTime(profile.lastSeen)}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-primary/50" title={LT('profile.uaDiversity')}>{L('profile.uaDiversity')}</p>
                        <p className="font-mono text-[11px] text-foreground/80">{profile.userAgentAnalysis.diversity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Behavioral Patterns */}
                  {profile.behavioralPatterns.length > 0 && (
                    <div className="border border-primary/20 bg-card p-4">
                      <h3 className="font-mono text-[12px] text-primary/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ChartLine size={14} />
                        {L('profile.behavioralPatterns')} ({profile.behavioralPatterns.length})
                      </h3>
                      <div className="space-y-2">
                        {profile.behavioralPatterns.map((pattern, idx) => (
                          <div key={idx} className="border border-primary/10 bg-primary/5 p-3 flex items-start gap-3">
                            {getSeverityIcon(pattern.severity)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-mono text-[11px] text-foreground/90 uppercase">{pattern.type.replace(/_/g, ' ')}</p>
                                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded`} style={{ backgroundColor: SEVERITY_COLORS[pattern.severity as keyof typeof SEVERITY_COLORS] + '30', color: SEVERITY_COLORS[pattern.severity as keyof typeof SEVERITY_COLORS] }}>
                                  {pattern.severity.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[10px] text-primary/60">{pattern.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Threat Score Timeline */}
                    <div className="border border-primary/20 bg-card p-4">
                      <h3 className="font-mono text-[12px] text-primary/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ChartLine size={14} />
                        {L('profile.threatTimeline')}
                      </h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={threatScoreChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#666" 
                            style={{ fontSize: '10px' }}
                            tick={{ fill: '#999' }}
                          />
                          <YAxis 
                            stroke="#666" 
                            style={{ fontSize: '10px' }}
                            tick={{ fill: '#999' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#000', 
                              border: '1px solid #333',
                              borderRadius: 0,
                              fontSize: '11px',
                              fontFamily: 'monospace'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#ef4444' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Attack Type Distribution */}
                    <div className="border border-primary/20 bg-card p-4">
                      <h3 className="font-mono text-[12px] text-primary/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Globe size={14} />
                        {L('profile.attackDistribution')}
                      </h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={attackTypeChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {attackTypeChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={ATTACK_TYPE_COLORS[index % ATTACK_TYPE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#000', 
                              border: '1px solid #333',
                              fontSize: '11px',
                              fontFamily: 'monospace'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* User-Agent Analysis */}
                  <div className="border border-primary/20 bg-card p-4">
                    <h3 className="font-mono text-[12px] text-primary/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <User size={14} />
                      {L('profile.uaAnalysis')} ({profile.userAgentAnalysis.unique} {L('profile.unique')})
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Category breakdown chart */}
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={uaCategoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#666" 
                            style={{ fontSize: '10px' }}
                            tick={{ fill: '#999' }}
                          />
                          <YAxis 
                            stroke="#666" 
                            style={{ fontSize: '10px' }}
                            tick={{ fill: '#999' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#000', 
                              border: '1px solid #333',
                              fontSize: '11px',
                              fontFamily: 'monospace'
                            }}
                          />
                          <Bar dataKey="value" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>

                      {/* Top User-Agents table */}
                      <div className="border border-primary/10 overflow-hidden">
                        <div className="bg-primary/10 px-3 py-2 font-mono text-[10px] text-primary/60 uppercase">
                          {L('profile.topUserAgents')}
                        </div>
                        <div className="divide-y divide-primary/10 max-h-[180px] overflow-y-auto">
                          {profile.userAgentAnalysis.userAgents.slice(0, 10).map((ua, idx) => (
                            <div key={idx} className="px-3 py-2 flex items-center justify-between hover:bg-primary/5">
                              <div className="flex-1 mr-2">
                                <p className="font-mono text-[10px] text-foreground/80 truncate" title={ua.userAgent}>
                                  {ua.userAgent}
                                </p>
                                <span className={`inline-block mt-1 px-1.5 py-0.5 text-[8px] font-mono rounded ${
                                  ua.category === 'attack_tool' ? 'bg-red-500/20 text-red-400' :
                                  ua.category === 'bot' ? 'bg-orange-500/20 text-orange-400' :
                                  ua.category === 'script' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {ua.category}
                                </span>
                              </div>
                              <span className="font-mono text-[11px] text-primary/60">{ua.count}×</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Incident Timeline */}
                  <div className="border border-primary/20 bg-card p-4">
                    <h3 className="font-mono text-[12px] text-primary/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <List size={14} />
                      {L('profile.recentIncidents')} ({profile.incidents.length})
                    </h3>
                    <div className="border border-primary/10 overflow-hidden">
                      <div className="bg-primary/10 px-3 py-2 grid grid-cols-[1fr,2fr,1fr,1fr,1fr] gap-2 font-mono text-[10px] text-primary/60 uppercase">
                        <span>{L('profile.colTime')}</span>
                        <span>{L('profile.colType')}</span>
                        <span>{L('profile.colMethod')}</span>
                        <span>{L('profile.colScore')}</span>
                        <span>{L('profile.colLevel')}</span>
                      </div>
                      <div className="divide-y divide-primary/10 max-h-[250px] overflow-y-auto">
                        {profile.incidents.slice().reverse().map((incident, idx) => (
                          <div key={idx} className="px-3 py-2 grid grid-cols-[1fr,2fr,1fr,1fr,1fr] gap-2 hover:bg-primary/5">
                            <span className="font-mono text-[10px] text-primary/50">{formatShortTime(incident.timestamp)}</span>
                            <span className="font-mono text-[10px] text-foreground/80 truncate" title={incident.key}>
                              {incident.type.replace(/_/g, ' ')}
                            </span>
                            <span className="font-mono text-[10px] text-primary/60">{incident.method}</span>
                            <span className="font-mono text-[10px] text-foreground/80">{incident.threatScore || '—'}</span>
                            <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded w-fit`} style={{ 
                              backgroundColor: incident.threatLevel ? THREAT_LEVEL_COLORS[incident.threatLevel as keyof typeof THREAT_LEVEL_COLORS] + '30' : '#33333330',
                              color: incident.threatLevel ? THREAT_LEVEL_COLORS[incident.threatLevel as keyof typeof THREAT_LEVEL_COLORS] : '#666'
                            }}>
                              {incident.threatLevel || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Automatische Reaktionen */}
                  <div className="border border-primary/20 bg-card p-4">
                    <h3 className="font-mono text-[12px] text-primary/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Shield size={14} />
                      {L('profile.autoReactions')}
                    </h3>
                    {(() => {
                      const blocked = profile.incidents.filter(i => i.threatLevel === 'BLOCK' || i.key?.startsWith('blocked:'))
                      const tarpitted = profile.incidents.filter(i => i.threatLevel === 'TARPIT' || i.key?.startsWith('threat:'))
                      const warned = profile.incidents.filter(i => i.threatLevel === 'WARN')
                      const firstAlert = profile.incidents.length > 0
                        ? [...profile.incidents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0]
                        : null
                      return (
                        <div className="space-y-2 text-[11px] font-mono">
                          {firstAlert && (
                            <p className="text-foreground/60">
                              <span className="text-primary/50">{L('profile.firstAlert')}</span>{' '}
                              {new Date(firstAlert.timestamp).toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB')}
                            </p>
                          )}
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="border border-red-500/20 bg-red-500/5 p-2 text-center">
                              <p className="text-red-400 text-lg font-bold">{blocked.length}</p>
                              <p className="text-[9px] text-red-400/60 uppercase">{L('profile.blocked')}</p>
                            </div>
                            <div className="border border-orange-500/20 bg-orange-500/5 p-2 text-center">
                              <p className="text-orange-400 text-lg font-bold">{tarpitted.length}</p>
                              <p className="text-[9px] text-orange-400/60 uppercase">{L('profile.tarpitted')}</p>
                            </div>
                            <div className="border border-yellow-500/20 bg-yellow-500/5 p-2 text-center">
                              <p className="text-yellow-400 text-lg font-bold">{warned.length}</p>
                              <p className="text-[9px] text-yellow-400/60 uppercase">{L('profile.warned')}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-foreground/40 mt-2">
                            {L('profile.ipStatus')}: {blocked.length > 0 ? `🔴 ${L('profile.wasBlocked')}` : tarpitted.length > 0 ? `🟠 ${L('profile.wasTarpitted')}` : `🟡 ${L('profile.monitored')}`}
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                  {/* Forensic Data — Canary Document Callbacks */}
                  {profile.forensicData && profile.forensicData.length > 0 && (
                    <div className="border border-primary/20 bg-card p-4">
                      <h3 className="font-mono text-[12px] text-primary/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Fingerprint size={14} />
                        {L('profile.forensicData')} ({profile.forensicData.length} {L('profile.canaryCallbacks')})
                      </h3>
                      <p className="text-[9px] text-primary/40 mb-3 font-mono">
                        {L('profile.gdprNote')}
                      </p>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {profile.forensicData.slice().reverse().map((entry, idx) => (
                          <div key={idx} className="border border-primary/10 bg-primary/5 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-primary/60">
                                {formatTime(entry.timestamp)}
                              </span>
                              <span className="font-mono text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                                {entry.event === 'js' ? 'JS FINGERPRINT' : entry.event === 'img' ? 'TRACKING PIXEL' : (entry.event || 'CALLBACK').toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <div>
                                <p className="font-mono text-[9px] text-primary/40">{L('profile.canaryToken')}</p>
                                <p className="font-mono text-[10px] text-foreground/80 truncate" title={entry.token}>{entry.token}</p>
                              </div>
                              <div>
                                <p className="font-mono text-[9px] text-primary/40">{L('profile.document')}</p>
                                <p className="font-mono text-[10px] text-foreground/80 truncate" title={entry.documentPath}>{entry.documentPath}</p>
                              </div>
                              <div>
                                <p className="font-mono text-[9px] text-primary/40">{L('profile.openerIp')}</p>
                                <p className="font-mono text-[10px] text-foreground/80 truncate" title={entry.openerIp}>{entry.openerIp || '—'}</p>
                              </div>
                              <div>
                                <p className="font-mono text-[9px] text-primary/40">{L('profile.downloaderIp')}</p>
                                <p className="font-mono text-[10px] text-foreground/80 truncate" title={entry.downloaderIp}>{entry.downloaderIp || '—'}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="font-mono text-[9px] text-primary/40">{L('sec.userAgent')}</p>
                                <p className="font-mono text-[10px] text-foreground/80 truncate" title={entry.userAgent}>{entry.userAgent || '—'}</p>
                              </div>
                              {entry.acceptLanguage && (
                                <div className="col-span-2">
                                  <p className="font-mono text-[9px] text-primary/40">Accept-Language</p>
                                  <p className="font-mono text-[10px] text-foreground/80">{entry.acceptLanguage}</p>
                                </div>
                              )}
                            </div>

                            {entry.jsFingerprint && (
                              <div className="border-t border-primary/10 pt-2 mt-2">
                                <p className="font-mono text-[9px] text-red-400/70 uppercase mb-1">{L('profile.jsFingerprint')}</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                                  {entry.jsFingerprint.realIp && (
                                    <div>
                                      <p className="font-mono text-[9px] text-primary/40">{L('profile.realIp')}</p>
                                      <p className="font-mono text-[10px] text-red-400 font-bold truncate" title={entry.jsFingerprint.realIp}>{entry.jsFingerprint.realIp}</p>
                                    </div>
                                  )}
                                  {entry.jsFingerprint.timezone && (
                                    <div>
                                      <p className="font-mono text-[9px] text-primary/40">{L('profile.timezone')}</p>
                                      <p className="font-mono text-[10px] text-foreground/80">{entry.jsFingerprint.timezone}</p>
                                    </div>
                                  )}
                                  {entry.jsFingerprint.language && (
                                    <div>
                                      <p className="font-mono text-[9px] text-primary/40">{L('profile.language')}</p>
                                      <p className="font-mono text-[10px] text-foreground/80">{entry.jsFingerprint.language}</p>
                                    </div>
                                  )}
                                  {entry.jsFingerprint.platform && (
                                    <div>
                                      <p className="font-mono text-[9px] text-primary/40">{L('profile.platform')}</p>
                                      <p className="font-mono text-[10px] text-foreground/80">{entry.jsFingerprint.platform}</p>
                                    </div>
                                  )}
                                  {entry.jsFingerprint.screenWidth != null && entry.jsFingerprint.screenHeight != null && (
                                    <div>
                                      <p className="font-mono text-[9px] text-primary/40">{L('profile.screen')}</p>
                                      <p className="font-mono text-[10px] text-foreground/80">{entry.jsFingerprint.screenWidth}×{entry.jsFingerprint.screenHeight} ({entry.jsFingerprint.colorDepth || '?'}bit)</p>
                                    </div>
                                  )}
                                  {entry.jsFingerprint.cores != null && (
                                    <div>
                                      <p className="font-mono text-[9px] text-primary/40">{L('profile.cpuCores')}</p>
                                      <p className="font-mono text-[10px] text-foreground/80">{entry.jsFingerprint.cores}</p>
                                    </div>
                                  )}
                                  {entry.jsFingerprint.memory != null && entry.jsFingerprint.memory > 0 && (
                                    <div>
                                      <p className="font-mono text-[9px] text-primary/40">{L('profile.ram')}</p>
                                      <p className="font-mono text-[10px] text-foreground/80">{entry.jsFingerprint.memory}</p>
                                    </div>
                                  )}
                                  {entry.jsFingerprint.touchSupport != null && (
                                    <div>
                                      <p className="font-mono text-[9px] text-primary/40">{L('profile.touch')}</p>
                                      <p className="font-mono text-[10px] text-foreground/80">{entry.jsFingerprint.touchSupport ? L('profile.yes') : L('profile.no')}</p>
                                    </div>
                                  )}
                                  {entry.jsFingerprint.canvasHash && (
                                    <div>
                                      <p className="font-mono text-[9px] text-primary/40">{L('profile.canvasHash')}</p>
                                      <p className="font-mono text-[10px] text-foreground/80 truncate" title={entry.jsFingerprint.canvasHash}>{entry.jsFingerprint.canvasHash}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
    </CyberModalBackdrop>
  )
}
