import { motion, AnimatePresence } from 'framer-motion'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import { ProhibitInset, Trash, Plus, CheckCircle } from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { t, tip, type Locale, LOCALES } from '@/lib/i18n-security'

interface BlockedEntry {
  hashedIp: string
  reason: string
  blockedAt: string
  autoBlocked?: boolean
}

interface BlocklistManagerDialogProps {
  open: boolean
  onClose: () => void
}

export default function BlocklistManagerDialog({ open, onClose }: BlocklistManagerDialogProps) {
  const [entries, setEntries] = useState<BlockedEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('de')) return 'de'
    return 'en'
  })
  
  const L = (key: string) => t(key, locale)
  const LT = (key: string) => tip(key, locale)

  // Add form state
  const [newHashedIp, setNewHashedIp] = useState('')
  const [newReason, setNewReason] = useState('')
  const [newTtl, setNewTtl] = useState<number>(604800) // 7 days default
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!open) return
    loadBlocklist()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const loadBlocklist = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/blocklist', { credentials: 'same-origin' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setEntries(data.blocked || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async (hashedIp: string) => {
    if (!window.confirm(`${L('blocklist.unblockConfirm')} ${hashedIp.slice(0, 12)}...? ${L('blocklist.cannotBeUndone')}`)) return
    try {
      const res = await fetch('/api/blocklist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ hashedIp }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      toast.success(L('blocklist.ipUnblocked'))
      loadBlocklist()
    } catch (err) {
      toast.error(`${L('blocklist.failedUnblock')}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleAddBlock = async () => {
    if (!newHashedIp.trim()) {
      toast.error(L('blocklist.ipHashRequired'))
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          hashedIp: newHashedIp.trim(),
          reason: newReason.trim() || 'manual',
          ttlSeconds: newTtl,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      toast.success(L('blocklist.ipBlocked'))
      setNewHashedIp('')
      setNewReason('')
      setNewTtl(604800)
      setShowAddForm(false)
      loadBlocklist()
    } catch (err) {
      toast.error(`${L('blocklist.failedBlock')}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setAdding(false)
    }
  }

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    } catch {
      return ts
    }
  }

  const getExpiryTime = (blockedAt: string, ttl: number = 604800) => {
    try {
      const blocked = new Date(blockedAt).getTime()
      const expiry = new Date(blocked + ttl * 1000)
      const now = Date.now()
      const remaining = expiry.getTime() - now
      if (remaining < 0) return L('blocklist.expired')
      const hours = Math.floor(remaining / 3600000)
      const days = Math.floor(hours / 24)
      if (days > 0) return `${days}d ${hours % 24}h`
      return `${hours}h`
    } catch {
      return '—'
    }
  }

  const totalBlocked = entries.length
  const autoBlocked = entries.filter(e => e.autoBlocked).length
  const manualBlocked = totalBlocked - autoBlocked

  return (
    <CyberModalBackdrop open={open} zIndex="z-[9999]">
          <motion.div
            className="w-full max-w-4xl max-h-[90dvh] bg-card border border-primary/30 relative overflow-hidden flex flex-col"
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
                <ProhibitInset size={16} className="text-primary/70" />
                <span className="font-mono text-[11px] text-primary/70 tracking-wider uppercase">
                  {L('blocklist.title')}
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
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-primary/20 bg-primary/5 p-3" title={LT('blocklist.totalBlocked')}>
                  <p className="font-mono text-[10px] text-primary/50 uppercase tracking-wider mb-1">{L('blocklist.totalBlocked')}</p>
                  <p className="font-mono text-[20px] text-foreground/90 font-bold">{totalBlocked}</p>
                </div>
                <div className="border border-orange-500/20 bg-orange-500/5 p-3" title={LT('blocklist.autoBlocked')}>
                  <p className="font-mono text-[10px] text-orange-400/70 uppercase tracking-wider mb-1">{L('blocklist.autoBlocked')}</p>
                  <p className="font-mono text-[20px] text-orange-400 font-bold">{autoBlocked}</p>
                </div>
                <div className="border border-blue-500/20 bg-blue-500/5 p-3" title={LT('blocklist.manualBlocked')}>
                  <p className="font-mono text-[10px] text-blue-400/70 uppercase tracking-wider mb-1">{L('blocklist.manualBlocked')}</p>
                  <p className="font-mono text-[20px] text-blue-400 font-bold">{manualBlocked}</p>
                </div>
              </div>

              {/* Add button */}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full border border-primary/30 bg-primary/5 hover:bg-primary/10 p-3 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} className="text-primary/70" />
                <span className="font-mono text-[11px] text-primary/70 uppercase tracking-wider">
                  {showAddForm ? L('blocklist.cancel') : L('blocklist.addBlock')}
                </span>
              </button>

              {/* Add form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-primary/20 bg-primary/5 p-4 space-y-3 overflow-hidden"
                  >
                    <div>
                      <label className="block font-mono text-[11px] text-primary/60 uppercase tracking-wider mb-2">
                        {L('blocklist.ipHashLabel')}
                      </label>
                      <input
                        type="text"
                        value={newHashedIp}
                        onChange={(e) => setNewHashedIp(e.target.value)}
                        placeholder={L('blocklist.ipHashPlaceholder')}
                        className="w-full bg-black/50 border border-primary/20 px-3 py-2 font-mono text-[12px] text-foreground/80 focus:border-primary/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-primary/60 uppercase tracking-wider mb-2">
                        {L('blocklist.reasonLabel')}
                      </label>
                      <input
                        type="text"
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        placeholder={L('blocklist.reasonPlaceholder')}
                        className="w-full bg-black/50 border border-primary/20 px-3 py-2 font-mono text-[12px] text-foreground/80 focus:border-primary/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] text-primary/60 uppercase tracking-wider mb-2" title={LT('blocklist.durationTip')}>
                        {L('blocklist.durationLabel')}
                      </label>
                      <select
                        value={newTtl}
                        onChange={(e) => setNewTtl(Number(e.target.value))}
                        className="w-full bg-black/50 border border-primary/20 px-3 py-2 font-mono text-[12px] text-foreground/80 focus:border-primary/50 focus:outline-none"
                      >
                        <option value={3600}>{L('blocklist.dur1h')}</option>
                        <option value={86400}>{L('blocklist.dur24h')}</option>
                        <option value={604800}>{L('blocklist.dur7d')}</option>
                        <option value={2592000}>{L('blocklist.dur30d')}</option>
                        <option value={31536000}>{L('blocklist.dur1y')}</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAddBlock}
                      disabled={adding}
                      className="w-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed p-3 flex items-center justify-center gap-2 transition-colors"
                    >
                      <ProhibitInset size={16} className="text-red-400" />
                      <span className="font-mono text-[11px] text-red-400 uppercase tracking-wider">
                        {adding ? L('blocklist.blocking') : L('blocklist.blockIp')}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                  <span className="ml-3 font-mono text-[11px] text-primary/50">{L('blocklist.loading')}</span>
                </div>
              )}

              {error && (
                <div className="border border-red-500/30 bg-red-500/10 p-4 text-center">
                  <p className="font-mono text-[12px] text-red-400">{L('blocklist.failedToLoad')}: {error}</p>
                </div>
              )}

              {!loading && !error && entries.length === 0 && (
                <div className="border border-primary/15 bg-primary/5 p-8 text-center">
                  <CheckCircle size={32} className="text-green-400/50 mx-auto mb-2" />
                  <p className="font-mono text-[12px] text-primary/50">{L('blocklist.noBlocked')}</p>
                  <p className="font-mono text-[10px] text-primary/40 mt-1">{L('blocklist.allClear')}</p>
                </div>
              )}

              {!loading && !error && entries.length > 0 && (
                <div className="border border-primary/20 overflow-hidden">
                  {/* Table header */}
                  <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 grid grid-cols-[2fr,2fr,1.5fr,1fr,auto] gap-4">
                    <span className="font-mono text-[10px] text-primary/60 uppercase tracking-wider">{L('blocklist.colIpHash')}</span>
                    <span className="font-mono text-[10px] text-primary/60 uppercase tracking-wider">{L('blocklist.colReason')}</span>
                    <span className="font-mono text-[10px] text-primary/60 uppercase tracking-wider">{L('blocklist.colBlockedAt')}</span>
                    <span className="font-mono text-[10px] text-primary/60 uppercase tracking-wider">{L('blocklist.colExpires')}</span>
                    <span className="font-mono text-[10px] text-primary/60 uppercase tracking-wider">{L('blocklist.colAction')}</span>
                  </div>

                  {/* Table rows */}
                  <div className="divide-y divide-primary/10">
                    {entries.map((entry) => (
                      <div
                        key={entry.hashedIp}
                        className="px-4 py-3 grid grid-cols-[2fr,2fr,1.5fr,1fr,auto] gap-4 items-center hover:bg-primary/5 transition-colors"
                      >
                        <div>
                          <p className="font-mono text-[11px] text-foreground/80 truncate" title={entry.hashedIp}>
                            {entry.hashedIp.slice(0, 12)}...{entry.hashedIp.slice(-8)}
                          </p>
                          {entry.autoBlocked && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                              {L('blocklist.auto')}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-primary/60 truncate" title={entry.reason}>
                          {entry.reason}
                        </p>
                        <p className="font-mono text-[10px] text-primary/50">{formatTime(entry.blockedAt)}</p>
                        <p className="font-mono text-[10px] text-primary/50">{getExpiryTime(entry.blockedAt)}</p>
                        <button
                          onClick={() => handleUnblock(entry.hashedIp)}
                          className="px-3 py-1.5 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                        >
                          <Trash size={12} className="text-red-400" />
                          <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider">{L('blocklist.unblock')}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
    </CyberModalBackdrop>
  )
}
