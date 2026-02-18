import { motion, AnimatePresence } from 'framer-motion'
import { Trash, ShieldWarning, Globe, Clock, User, Hash } from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import { useState, useEffect } from 'react'

interface SecurityIncident {
  key: string
  method: string
  hashedIp: string
  userAgent: string
  timestamp: string
}

interface SecurityIncidentsDashboardProps {
  open: boolean
  onClose: () => void
}

/** Classify incident type from the key field */
function classifyIncident(key: string): { label: string; color: string } {
  if (key.startsWith('robots:')) return { label: 'ROBOTS.TXT VIOLATION', color: 'text-orange-400' }
  if (key.includes('backup') || key.includes('credential') || key.includes('master-key') || key.includes('password'))
    return { label: 'HONEYTOKEN ACCESS', color: 'text-red-400' }
  return { label: 'SECURITY EVENT', color: 'text-yellow-400' }
}

/** Shorten hashed IP for display */
function shortHash(hash: string): string {
  if (!hash || hash.length < 12) return hash || '—'
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`
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

export default function SecurityIncidentsDashboard({ open, onClose }: SecurityIncidentsDashboardProps) {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'honeytoken' | 'robots'>('all')

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

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'all') return true
    if (filter === 'honeytoken') return !inc.key.startsWith('robots:')
    if (filter === 'robots') return inc.key.startsWith('robots:')
    return true
  })

  // Aggregate stats
  const uniqueIps = new Set(incidents.map(i => i.hashedIp)).size
  const honeytokenCount = incidents.filter(i => !i.key.startsWith('robots:')).length
  const robotsCount = incidents.filter(i => i.key.startsWith('robots:')).length

  const handleClear = async () => {
    if (!window.confirm('Clear all security incident records? This cannot be undone.')) return
    try {
      const res = await fetch('/api/security-incidents', { method: 'DELETE', credentials: 'same-origin' })
      if (res.ok) setIncidents([])
    } catch { /* ignore */ }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 hud-scanline opacity-20 pointer-events-none" />

          <motion.div
            className="w-full max-w-5xl max-h-[85dvh] bg-card border border-primary/30 relative overflow-hidden flex flex-col"
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
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-[10px] text-primary/70 tracking-wider uppercase">
                  SECURITY INCIDENTS // THREAT MONITOR
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="text-destructive/60 hover:text-destructive transition-colors"
                  title="Clear all incidents"
                >
                  <Trash size={16} />
                </button>
                <CyberCloseButton onClick={onClose} label="CLOSE" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                  <span className="ml-3 font-mono text-[10px] text-primary/50">LOADING SECURITY DATA...</span>
                </div>
              )}

              {error && (
                <div className="border border-red-500/30 bg-red-500/10 p-4 text-center">
                  <p className="font-mono text-[11px] text-red-400">FAILED TO LOAD: {error}</p>
                </div>
              )}

              {!loading && !error && (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                      <div className="flex items-center gap-2 text-primary/60">
                        <ShieldWarning size={14} />
                        <span className="text-[10px] font-mono tracking-wider uppercase">Total Events</span>
                      </div>
                      <p className="text-xl font-mono font-bold text-foreground">{incidents.length}</p>
                    </div>
                    <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                      <div className="flex items-center gap-2 text-red-400/60">
                        <Hash size={14} />
                        <span className="text-[10px] font-mono tracking-wider uppercase">Honeytoken</span>
                      </div>
                      <p className="text-xl font-mono font-bold text-red-400">{honeytokenCount}</p>
                    </div>
                    <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                      <div className="flex items-center gap-2 text-orange-400/60">
                        <Globe size={14} />
                        <span className="text-[10px] font-mono tracking-wider uppercase">Robots Violations</span>
                      </div>
                      <p className="text-xl font-mono font-bold text-orange-400">{robotsCount}</p>
                    </div>
                    <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
                      <div className="flex items-center gap-2 text-primary/60">
                        <User size={14} />
                        <span className="text-[10px] font-mono tracking-wider uppercase">Unique IPs</span>
                      </div>
                      <p className="text-xl font-mono font-bold text-foreground">{uniqueIps}</p>
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-2 border-b border-primary/10 pb-2">
                    {(['all', 'honeytoken', 'robots'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`font-mono text-[10px] px-3 py-1 uppercase tracking-wider transition-colors ${
                          filter === f
                            ? 'text-primary bg-primary/10 border border-primary/30'
                            : 'text-primary/40 hover:text-primary/70'
                        }`}
                      >
                        {f === 'all' ? `ALL (${incidents.length})` :
                         f === 'honeytoken' ? `HONEYTOKEN (${honeytokenCount})` :
                         `ROBOTS (${robotsCount})`}
                      </button>
                    ))}
                  </div>

                  {/* Incident list */}
                  {filteredIncidents.length === 0 ? (
                    <div className="text-center py-12">
                      <ShieldWarning size={32} className="text-primary/20 mx-auto mb-3" />
                      <p className="font-mono text-[11px] text-primary/30">NO INCIDENTS RECORDED</p>
                    </div>
                  ) : (
                    <div className="border border-primary/10 overflow-hidden">
                      <table className="w-full text-[10px] font-mono">
                        <thead>
                          <tr className="bg-primary/10 text-primary/70">
                            <th className="text-left px-3 py-1.5 tracking-wider">TIME</th>
                            <th className="text-left px-3 py-1.5 tracking-wider">TYPE</th>
                            <th className="text-left px-3 py-1.5 tracking-wider">TARGET</th>
                            <th className="text-left px-3 py-1.5 tracking-wider hidden md:table-cell">METHOD</th>
                            <th className="text-left px-3 py-1.5 tracking-wider hidden md:table-cell">IP HASH</th>
                            <th className="text-left px-3 py-1.5 tracking-wider hidden lg:table-cell">USER AGENT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIncidents.map((inc, i) => {
                            const { label, color } = classifyIncident(inc.key)
                            return (
                              <tr
                                key={`${inc.timestamp}-${i}`}
                                className="border-t border-primary/5 hover:bg-primary/5 transition-colors"
                              >
                                <td className="px-3 py-1.5 text-foreground/50 whitespace-nowrap">
                                  <Clock size={10} className="inline mr-1 opacity-50" />
                                  {formatTime(inc.timestamp)}
                                </td>
                                <td className={`px-3 py-1.5 ${color} whitespace-nowrap`}>
                                  {label}
                                </td>
                                <td className="px-3 py-1.5 text-foreground/70 max-w-[200px] truncate" title={inc.key}>
                                  {inc.key}
                                </td>
                                <td className="px-3 py-1.5 text-foreground/50 hidden md:table-cell">
                                  {inc.method}
                                </td>
                                <td className="px-3 py-1.5 text-foreground/40 hidden md:table-cell font-mono" title={inc.hashedIp}>
                                  {shortHash(inc.hashedIp)}
                                </td>
                                <td className="px-3 py-1.5 text-foreground/30 hidden lg:table-cell max-w-[200px] truncate" title={inc.userAgent}>
                                  {inc.userAgent || '—'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* Footer */}
              <div className="flex items-center gap-2 text-[9px] text-primary/40 pt-2 border-t border-primary/10">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 animate-pulse" />
                <span>THREAT MONITOR ACTIVE</span>
                <span className="ml-auto">
                  Showing last {incidents.length} events &middot; IPs are SHA-256 hashed (GDPR compliant)
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
