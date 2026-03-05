/**
 * KeyManagerPanel — Admin UI for managing activation keys.
 *
 * Only visible when VITE_IS_PRIMARY === 'true'.
 * Shows a list of keys (name, tier, created-at) and allows:
 * - Generating new keys with name + tier
 * - Revoking existing keys (by revokeId — never exposes the key value)
 * - Copying the newly generated key
 * - Showing a client-side QR code for the generated key (no external services)
 * - Editing key holder metadata (holderName, holderEmail, holderWebsite, notes, assignedThemes)
 * - Searching/filtering keys by name, holder, or tier
 * - Stats overview (total keys, by tier, recent)
 */
import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Key,
  Plus,
  Trash,
  Copy,
  Check,
  QrCode,
  Warning,
  X,
  MagnifyingGlass,
  CaretDown,
  CaretUp,
  FloppyDisk,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import QRCode from 'qrcode'

const IS_PRIMARY = import.meta.env.VITE_IS_PRIMARY === 'true'

interface KeyEntry {
  name: string
  tier: string
  createdAt: string | null
  revokeId: string | null
  holderName?: string | null
  holderEmail?: string | null
  holderWebsite?: string | null
  notes?: string | null
  assignedThemes?: string[]
}

interface GeneratedKey {
  key: string
  revokeId: string
  name: string
  tier: string
  createdAt: string
}

// ─── Client-side QR code display ─────────────────────────────────────────────

function QrCodeDisplay({ value }: { value: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: 160,
      margin: 1,
      color: { dark: '#ff3333', light: '#000000' },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(null))
  }, [value])

  if (!dataUrl) {
    return (
      <div className="w-[160px] h-[160px] border border-primary/20 rounded flex items-center justify-center text-xs text-muted-foreground">
        Generating QR…
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-black rounded border border-primary/20">
      <img src={dataUrl} alt="QR Code" width={160} height={160} className="rounded" />
      <p className="text-[10px] font-mono text-muted-foreground text-center break-all max-w-[160px]">{value}</p>
    </div>
  )
}

// ─── KeyManagerPanel ─────────────────────────────────────────────────────────

export default function KeyManagerPanel() {
  const [keys, setKeys] = useState<KeyEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTier, setNewTier] = useState<string>('free')
  const [generating, setGenerating] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<GeneratedKey | null>(null)
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRevokeId, setExpandedRevokeId] = useState<string | null>(null)
  const [editingMeta, setEditingMeta] = useState<Record<string, string>>({})
  const [savingMeta, setSavingMeta] = useState(false)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/keys', {
        credentials: 'same-origin',
      })
      if (!res.ok) {
        toast.error('Failed to load keys')
        return
      }
      const data = await res.json() as { keys: KeyEntry[] }
      setKeys(data.keys ?? [])
    } catch {
      toast.error('Failed to load keys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (IS_PRIMARY) fetchKeys()
  }, [fetchKeys])

  const handleGenerate = useCallback(async () => {
    if (!newName.trim()) {
      toast.error('Enter a name for the key')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ name: newName.trim(), tier: newTier }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(String(err.error ?? 'Failed to generate key'))
        return
      }
      const data = await res.json() as GeneratedKey
      setGeneratedKey(data)
      setNewName('')
      setNewTier('free')
      await fetchKeys()
    } catch {
      toast.error('Failed to generate key')
    } finally {
      setGenerating(false)
    }
  }, [newName, newTier, fetchKeys])

  const handleRevoke = useCallback((revokeId: string) => {
    setRevokeTarget(revokeId)
  }, [])

  const confirmRevoke = useCallback(async () => {
    if (!revokeTarget) return
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ revokeId: revokeTarget }),
      })
      if (!res.ok) {
        toast.error('Failed to revoke key')
      } else {
        toast.success('Key revoked')
        await fetchKeys()
      }
    } catch {
      toast.error('Failed to revoke key')
    } finally {
      setRevokeTarget(null)
    }
  }, [revokeTarget, fetchKeys])

  const handleCopy = useCallback(async () => {
    if (!generatedKey) return
    try {
      await navigator.clipboard.writeText(generatedKey.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Key copied to clipboard')
    } catch {
      toast.error('Failed to copy key')
    }
  }, [generatedKey])

  const handleSaveMeta = useCallback(async (revokeId: string) => {
    setSavingMeta(true)
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ revokeId, ...editingMeta }),
      })
      if (!res.ok) {
        toast.error('Failed to save metadata')
      } else {
        toast.success('Metadata saved')
        setExpandedRevokeId(null)
        setEditingMeta({})
        await fetchKeys()
      }
    } catch {
      toast.error('Failed to save metadata')
    } finally {
      setSavingMeta(false)
    }
  }, [editingMeta, fetchKeys])

  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) return keys
    const q = searchQuery.toLowerCase()
    return keys.filter((k) =>
      k.name.toLowerCase().includes(q) ||
      k.tier.toLowerCase().includes(q) ||
      (k.holderName ?? '').toLowerCase().includes(q) ||
      (k.holderEmail ?? '').toLowerCase().includes(q)
    )
  }, [keys, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const byTier: Record<string, number> = {}
    let recentCount = 0
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    for (const k of keys) {
      byTier[k.tier] = (byTier[k.tier] ?? 0) + 1
      if (k.createdAt && new Date(k.createdAt).getTime() > weekAgo) recentCount++
    }
    return { total: keys.length, byTier, recentCount }
  }, [keys])

  if (!IS_PRIMARY) return null

  return (
    <div className="space-y-5 font-mono">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Key size={18} className="text-primary" />
        <h3 className="text-sm font-bold tracking-wider">KEY MANAGER</h3>
        <span className="text-[10px] bg-primary/10 text-primary/80 px-2 py-0.5 rounded border border-primary/20">
          PRIMARY ONLY
        </span>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="border border-primary/10 rounded p-2 bg-card/20 text-center">
          <p className="text-lg font-bold text-primary">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Total Keys</p>
        </div>
        <div className="border border-primary/10 rounded p-2 bg-card/20 text-center">
          <p className="text-lg font-bold text-green-400">{stats.recentCount}</p>
          <p className="text-[10px] text-muted-foreground">Last 7 Days</p>
        </div>
        <div className="border border-primary/10 rounded p-2 bg-card/20 text-center">
          <p className="text-[10px] font-bold text-foreground/80 leading-relaxed">
            {Object.entries(stats.byTier).map(([tier, count]) => (
              <span key={tier} className="block">{tier}: {count}</span>
            ))}
            {Object.keys(stats.byTier).length === 0 && <span className="text-muted-foreground">–</span>}
          </p>
          <p className="text-[10px] text-muted-foreground">By Tier</p>
        </div>
      </div>

      {/* Generate new key */}
      <div className="border border-primary/20 rounded bg-card/30 p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generate New Key</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px]">Key Name</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Band XY – Pro"
              className="bg-secondary border-input text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Tier</Label>
            <select
              value={newTier}
              onChange={(e) => setNewTier(e.target.value)}
              className="w-full bg-secondary border border-input rounded px-2 py-1.5 text-xs text-foreground h-8"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="agency">Agency</option>
              <option value="saas">SaaS</option>
            </select>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={generating || !newName.trim()}
          className="text-xs gap-1.5 h-7"
        >
          <Plus size={12} /> {generating ? 'Generating…' : 'Generate Key'}
        </Button>
      </div>

      {/* Generated key display */}
      <AnimatePresence>
        {generatedKey && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border border-green-500/40 rounded bg-green-500/10 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-green-400 flex items-center gap-1.5">
                <Check size={14} /> Key Generated — copy it now!
              </p>
              <button onClick={() => setGeneratedKey(null)} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>
            <div className="bg-black/60 rounded px-3 py-2 flex items-center gap-2">
              <code className="text-xs text-green-300 flex-1 break-all">{generatedKey.key}</code>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs gap-1.5 h-7 border-green-500/30 text-green-400 hover:text-green-300">
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : '📋 Copy'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowQr(!showQr)} className="text-xs gap-1.5 h-7 border-primary/30">
                <QrCode size={12} /> 📱 QR Code
              </Button>
            </div>
            {showQr && <QrCodeDisplay value={generatedKey.key} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search keys…"
          className="pl-8 bg-secondary border-input text-xs h-8"
        />
      </div>

      {/* Key list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Active Keys {loading && <span className="text-[10px] opacity-60">(loading…)</span>}
          {searchQuery && <span className="text-[10px] opacity-60"> ({filteredKeys.length} / {keys.length})</span>}
        </p>
        {filteredKeys.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground/60 py-2">{searchQuery ? 'No matching keys.' : 'No keys found.'}</p>
        )}
        {filteredKeys.map((entry, idx) => (
          <div key={entry.revokeId ?? idx} className="border border-primary/10 rounded bg-card/20 hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{entry.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  Tier: <span className="text-primary">{entry.tier}</span>
                  {entry.createdAt && ` · ${new Date(entry.createdAt).toLocaleDateString()}`}
                  {entry.holderName && ` · ${entry.holderName}`}
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {entry.revokeId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (expandedRevokeId === entry.revokeId) {
                        setExpandedRevokeId(null)
                        setEditingMeta({})
                      } else {
                        setExpandedRevokeId(entry.revokeId!)
                        setEditingMeta({
                          holderName: entry.holderName ?? '',
                          holderEmail: entry.holderEmail ?? '',
                          holderWebsite: entry.holderWebsite ?? '',
                          notes: entry.notes ?? '',
                        })
                      }
                    }}
                    className="text-[10px] h-6 px-2 text-muted-foreground"
                  >
                    {expandedRevokeId === entry.revokeId ? <CaretUp size={11} /> : <CaretDown size={11} />}
                  </Button>
                )}
                {entry.revokeId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevoke(entry.revokeId!)}
                    className="text-xs gap-1 h-6 border-destructive/40 text-destructive"
                  >
                    <Trash size={11} /> Revoke
                  </Button>
                )}
              </div>
            </div>
            {/* Expanded metadata editor */}
            <AnimatePresence>
              {expandedRevokeId === entry.revokeId && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 border-t border-primary/10 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px]">Holder Name</Label>
                        <Input
                          value={editingMeta.holderName ?? ''}
                          onChange={(e) => setEditingMeta((m) => ({ ...m, holderName: e.target.value }))}
                          placeholder="Organization / Person"
                          className="bg-secondary border-input text-xs h-7"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Holder Email</Label>
                        <Input
                          value={editingMeta.holderEmail ?? ''}
                          onChange={(e) => setEditingMeta((m) => ({ ...m, holderEmail: e.target.value }))}
                          placeholder="contact@example.com"
                          className="bg-secondary border-input text-xs h-7"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Website</Label>
                      <Input
                        value={editingMeta.holderWebsite ?? ''}
                        onChange={(e) => setEditingMeta((m) => ({ ...m, holderWebsite: e.target.value }))}
                        placeholder="https://example.com"
                        className="bg-secondary border-input text-xs h-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Notes</Label>
                      <textarea
                        value={editingMeta.notes ?? ''}
                        onChange={(e) => setEditingMeta((m) => ({ ...m, notes: e.target.value }))}
                        placeholder="Internal notes…"
                        rows={2}
                        className="w-full bg-secondary border border-input rounded px-2 py-1.5 text-xs text-foreground resize-none"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => entry.revokeId && handleSaveMeta(entry.revokeId)}
                      disabled={savingMeta}
                      className="text-xs gap-1.5 h-7"
                    >
                      <FloppyDisk size={12} /> {savingMeta ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Revoke confirmation dialog */}
      <AnimatePresence>
        {revokeTarget && (
          <motion.div
            className="fixed inset-0 z-[10001] bg-black/70 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card border border-destructive/40 rounded-lg p-5 max-w-sm w-full space-y-4"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2 text-destructive">
                <Warning size={18} />
                <p className="font-semibold text-sm">Revoke Key?</p>
              </div>
              <p className="text-xs text-muted-foreground">
                This will permanently revoke this activation key.
                Any deployment using this key will be locked out.
              </p>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setRevokeTarget(null)} className="text-xs h-7">
                  Cancel
                </Button>
                <Button size="sm" onClick={confirmRevoke} className="text-xs h-7 bg-destructive hover:bg-destructive/80 text-destructive-foreground gap-1">
                  <Trash size={12} /> Revoke
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
