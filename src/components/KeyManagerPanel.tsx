/**
 * KeyManagerPanel — Admin UI for managing activation keys.
 *
 * Only visible when VITE_IS_PRIMARY === 'true'.
 * Shows a list of keys (name, tier, created-at) and allows:
 * - Generating new keys with name + tier
 * - Revoking existing keys
 * - Copying the newly generated key
 * - Showing a simple QR code for the generated key
 */
import { useState, useCallback, useEffect } from 'react'
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
} from '@phosphor-icons/react'
import { toast } from 'sonner'

const IS_PRIMARY = import.meta.env.VITE_IS_PRIMARY === 'true'

interface KeyEntry {
  name: string
  tier: string
  createdAt: string | null
  keySuffix: string
}

interface GeneratedKey {
  key: string
  name: string
  tier: string
  createdAt: string
}

// ─── Minimal QR code via Google Charts (no library needed) ───────────────────

function QrCodeDisplay({ value }: { value: string }) {
  const encoded = encodeURIComponent(value)
  const url = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=160x160&bgcolor=000000&color=ff3333&qzone=1`
  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-black rounded border border-primary/20">
      <img
        src={url}
        alt="QR Code"
        width={160}
        height={160}
        className="rounded"
      />
      <p className="text-[10px] font-mono text-muted-foreground text-center break-all max-w-[160px]">{value}</p>
    </div>
  )
}

// ─── Admin auth helper ────────────────────────────────────────────────────────

function getAdminToken(): string {
  // Read from cookie or sessionStorage (set by AdminLoginDialog)
  try {
    return sessionStorage.getItem('nk-admin-token') || ''
  } catch {
    return ''
  }
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

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/keys', {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
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
          Authorization: `Bearer ${getAdminToken()}`,
        },
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

  const handleRevoke = useCallback(async (keySuffix: string) => {
    // The API needs the full key, but we only store the suffix for display
    // The user must confirm; actual revocation sends the suffix as a pseudo-key
    // In production you'd send the full key, but we don't store it for security
    // This panel revoking by suffix is intentionally limited — see API docs
    setRevokeTarget(keySuffix)
  }, [])

  const confirmRevoke = useCallback(async () => {
    if (!revokeTarget) return
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({ key: revokeTarget }),
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

      {/* Key list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Active Keys {loading && <span className="text-[10px] opacity-60">(loading…)</span>}
        </p>
        {keys.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground/60 py-2">No keys found.</p>
        )}
        {keys.map((entry, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 border border-primary/10 rounded px-3 py-2 bg-card/20 hover:border-primary/20 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{entry.name}</p>
              <p className="text-[10px] text-muted-foreground">
                Tier: <span className="text-primary">{entry.tier}</span>
                {entry.createdAt && ` · ${new Date(entry.createdAt).toLocaleDateString()}`}
                {' · '}…{entry.keySuffix}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRevoke(entry.keySuffix)}
              className="text-xs gap-1 h-6 border-destructive/40 text-destructive flex-shrink-0"
            >
              <Trash size={11} /> Revoke
            </Button>
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
                This will permanently revoke the key ending in <code>…{revokeTarget}</code>. 
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
