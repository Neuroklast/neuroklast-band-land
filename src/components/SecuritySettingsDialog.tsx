import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck } from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface SecuritySettings {
  honeytokensEnabled: boolean
  rateLimitEnabled: boolean
  robotsTrapEnabled: boolean
  entropyInjectionEnabled: boolean
  suspiciousUaBlockingEnabled: boolean
  sessionBindingEnabled: boolean
  maxAlertsStored: number
  tarpitMinMs: number
  tarpitMaxMs: number
  sessionTtlSeconds: number
}

const DEFAULT_SETTINGS: SecuritySettings = {
  honeytokensEnabled: true,
  rateLimitEnabled: true,
  robotsTrapEnabled: true,
  entropyInjectionEnabled: true,
  suspiciousUaBlockingEnabled: true,
  sessionBindingEnabled: true,
  maxAlertsStored: 500,
  tarpitMinMs: 3000,
  tarpitMaxMs: 8000,
  sessionTtlSeconds: 14400,
}

interface SecuritySettingsDialogProps {
  open: boolean
  onClose: () => void
}

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-primary/5">
      <div>
        <p className="font-mono text-[11px] text-foreground/80 uppercase tracking-wider">{label}</p>
        <p className="text-[9px] text-primary/40 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-primary/60' : 'bg-primary/15'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

interface NumberRowProps {
  label: string
  description: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}

function NumberRow({ label, description, value, onChange, min, max, step = 1, unit }: NumberRowProps) {
  return (
    <div className="py-2 border-b border-primary/5 space-y-1">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] text-foreground/80 uppercase tracking-wider">{label}</p>
          <p className="text-[9px] text-primary/40 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const n = Number(e.target.value)
              if (!isNaN(n) && n >= min && n <= max) onChange(n)
            }}
            min={min}
            max={max}
            step={step}
            className="w-24 bg-black/50 border border-primary/20 px-2 py-1 font-mono text-[11px] text-foreground/80 text-right focus:border-primary/50 focus:outline-none"
          />
          {unit && <span className="text-[9px] font-mono text-primary/40">{unit}</span>}
        </div>
      </div>
    </div>
  )
}

export default function SecuritySettingsDialog({ open, onClose }: SecuritySettingsDialogProps) {
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    fetch('/api/security-settings', { credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => setSettings({ ...DEFAULT_SETTINGS, ...data.settings }))
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

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/security-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      toast.success('Security settings saved')
    } catch (err) {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  const update = <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
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
            className="w-full max-w-2xl max-h-[85dvh] bg-card border border-primary/30 relative overflow-hidden flex flex-col"
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
                <ShieldCheck size={14} className="text-primary/70" />
                <span className="font-mono text-[10px] text-primary/70 tracking-wider uppercase">
                  SECURITY SETTINGS // SERVER-SIDE CONFIG
                </span>
              </div>
              <CyberCloseButton onClick={onClose} label="CLOSE" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                  <span className="ml-3 font-mono text-[10px] text-primary/50">LOADING SETTINGS...</span>
                </div>
              )}

              {error && (
                <div className="border border-red-500/30 bg-red-500/10 p-4 text-center">
                  <p className="font-mono text-[11px] text-red-400">FAILED TO LOAD: {error}</p>
                </div>
              )}

              {!loading && !error && (
                <>
                  {/* Info banner */}
                  <div className="border border-primary/15 bg-primary/5 p-3">
                    <p className="font-mono text-[9px] text-primary/50">
                      These settings are persisted server-side in encrypted storage. Changes take effect immediately
                      and are not included in the public band-data JSON export.
                    </p>
                  </div>

                  {/* Toggle settings */}
                  <div className="space-y-0">
                    <h3 className="text-[10px] font-mono text-primary/50 tracking-wider mb-2">
                      DEFENSE MODULES
                    </h3>
                    <ToggleRow
                      label="Honeytoken Detection"
                      description="Decoy database records that trigger silent alarms on unauthorized access"
                      checked={settings.honeytokensEnabled}
                      onChange={(v) => update('honeytokensEnabled', v)}
                    />
                    <ToggleRow
                      label="Rate Limiting"
                      description="Sliding window rate limit (5 req/10s) with GDPR-compliant IP hashing"
                      checked={settings.rateLimitEnabled}
                      onChange={(v) => update('rateLimitEnabled', v)}
                    />
                    <ToggleRow
                      label="Robots.txt Access Control"
                      description="Defensive tarpit for bots that ignore Disallow directives"
                      checked={settings.robotsTrapEnabled}
                      onChange={(v) => update('robotsTrapEnabled', v)}
                    />
                    <ToggleRow
                      label="Entropy Injection"
                      description="Inject noise headers into responses for flagged attacker IPs"
                      checked={settings.entropyInjectionEnabled}
                      onChange={(v) => update('entropyInjectionEnabled', v)}
                    />
                    <ToggleRow
                      label="Suspicious UA Blocking"
                      description="Block known hacking tools (wfuzz, nikto, sqlmap, etc.) with tarpit delay"
                      checked={settings.suspiciousUaBlockingEnabled}
                      onChange={(v) => update('suspiciousUaBlockingEnabled', v)}
                    />
                    <ToggleRow
                      label="Session Binding"
                      description="Bind admin sessions to User-Agent + IP subnet to detect hijacking"
                      checked={settings.sessionBindingEnabled}
                      onChange={(v) => update('sessionBindingEnabled', v)}
                    />
                  </div>

                  {/* Numeric settings */}
                  <div className="space-y-0">
                    <h3 className="text-[10px] font-mono text-primary/50 tracking-wider mb-2">
                      PARAMETERS
                    </h3>
                    <NumberRow
                      label="Max Alerts Stored"
                      description="Maximum number of security incidents kept in the alert log"
                      value={settings.maxAlertsStored}
                      onChange={(v) => update('maxAlertsStored', v)}
                      min={10}
                      max={10000}
                      step={10}
                    />
                    <NumberRow
                      label="Tarpit Min Delay"
                      description="Minimum delay applied to flagged requests"
                      value={settings.tarpitMinMs}
                      onChange={(v) => update('tarpitMinMs', v)}
                      min={0}
                      max={30000}
                      step={500}
                      unit="ms"
                    />
                    <NumberRow
                      label="Tarpit Max Delay"
                      description="Maximum delay applied to flagged requests"
                      value={settings.tarpitMaxMs}
                      onChange={(v) => update('tarpitMaxMs', v)}
                      min={0}
                      max={60000}
                      step={500}
                      unit="ms"
                    />
                    <NumberRow
                      label="Session TTL"
                      description="Admin session lifetime before re-authentication is required"
                      value={settings.sessionTtlSeconds}
                      onChange={(v) => update('sessionTtlSeconds', v)}
                      min={300}
                      max={86400}
                      step={300}
                      unit="sec"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-primary/80 hover:bg-primary text-white font-mono text-[11px] uppercase tracking-wider py-2 px-4 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'SAVING...' : 'SAVE SETTINGS'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="bg-primary/10 hover:bg-primary/20 text-primary/70 font-mono text-[11px] uppercase tracking-wider py-2 px-4 transition-colors"
                    >
                      RESET DEFAULTS
                    </button>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="flex items-center gap-2 text-[9px] text-primary/40 pt-2 border-t border-primary/10">
                <ShieldCheck size={10} className="text-primary/40" />
                <span>Settings stored in server-side encrypted storage (not in public JSON)</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
