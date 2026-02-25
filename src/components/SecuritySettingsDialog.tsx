import { motion, AnimatePresence } from 'framer-motion'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import { ShieldCheck, ShieldWarning, Lock, Bug, Robot, Fingerprint, ChartLine, ProhibitInset, Package, BellRinging, Info, Lightning, FileText, Database, Detective } from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { t, tip, type Locale, LOCALES } from '@/lib/i18n-security'

export interface SecuritySettings {
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
  threatScoringEnabled: boolean
  zipBombEnabled: boolean
  alertingEnabled: boolean
  hardBlockEnabled: boolean
  autoBlockThreshold: number
  underAttackMode: boolean
  // Threat level thresholds — configurable
  warnThreshold: number
  tarpitThreshold: number
  // Threat reason points — configurable
  pointsRobotsViolation: number
  pointsHoneytokenAccess: number
  pointsSuspiciousUa: number
  pointsMissingHeaders: number
  pointsGenericAccept: number
  pointsRateLimitExceeded: number
  // Tarpit & Zip Bomb rules
  tarpitOnWarn: boolean
  tarpitOnSuspiciousUa: boolean
  tarpitOnRobotsViolation: boolean
  tarpitOnHoneytoken: boolean
  tarpitOnBlock: boolean
  zipBombOnBlock: boolean
  zipBombOnHoneytoken: boolean
  zipBombOnRepeatOffender: boolean
  zipBombOnRobotsViolation: boolean
  zipBombOnSuspiciousUa: boolean
  zipBombOnRateLimit: boolean
  // Countermeasures
  sqlBackfireEnabled: boolean
  canaryDocumentsEnabled: boolean
  logPoisoningEnabled: boolean
  // SQL Backfire rules
  sqlBackfireOnScannerDetection: boolean
  sqlBackfireOnHoneytokenAccess: boolean
  // Canary Document rules
  canaryPhoneHomeOnOpen: boolean
  canaryCollectFingerprint: boolean
  canaryAlertOnCallback: boolean
  // Log Poisoning rules
  logPoisonFakeHeaders: boolean
  logPoisonTerminalEscape: boolean
  logPoisonFakePaths: boolean
  // Alert channels — configurable (overrides env vars when set)
  discordWebhookUrl: string
  alertEmail: string
}

export const DEFAULT_SETTINGS: SecuritySettings = {
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
  threatScoringEnabled: true,
  zipBombEnabled: false,
  alertingEnabled: false,
  hardBlockEnabled: true,
  autoBlockThreshold: 12,
  underAttackMode: false,
  // Threat level thresholds — configurable
  warnThreshold: 3,
  tarpitThreshold: 7,
  // Threat reason points — configurable
  pointsRobotsViolation: 3,
  pointsHoneytokenAccess: 5,
  pointsSuspiciousUa: 4,
  pointsMissingHeaders: 2,
  pointsGenericAccept: 1,
  pointsRateLimitExceeded: 2,
  // Tarpit & Zip Bomb rules — defaults
  tarpitOnWarn: true,
  tarpitOnSuspiciousUa: true,
  tarpitOnRobotsViolation: true,
  tarpitOnHoneytoken: false,
  tarpitOnBlock: false,
  zipBombOnBlock: false,
  zipBombOnHoneytoken: false,
  zipBombOnRepeatOffender: false,
  zipBombOnRobotsViolation: false,
  zipBombOnSuspiciousUa: false,
  zipBombOnRateLimit: false,
  // Countermeasures — defaults (OFF until explicitly enabled)
  sqlBackfireEnabled: false,
  canaryDocumentsEnabled: false,
  logPoisoningEnabled: false,
  // SQL Backfire rules
  sqlBackfireOnScannerDetection: true,
  sqlBackfireOnHoneytokenAccess: false,
  // Canary Document rules
  canaryPhoneHomeOnOpen: true,
  canaryCollectFingerprint: true,
  canaryAlertOnCallback: true,
  // Log Poisoning rules
  logPoisonFakeHeaders: true,
  logPoisonTerminalEscape: true,
  logPoisonFakePaths: true,
  // Alert channels — configurable
  discordWebhookUrl: '',
  alertEmail: '',
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
  icon?: React.ComponentType<{ size: number; className?: string }>
  badge?: string
  tooltip?: string
  statusActive: string
  statusDisabled: string
}

function ToggleRow({ label, description, checked, onChange, icon: Icon, badge, tooltip, statusActive, statusDisabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-primary/5">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={`mt-0.5 ${checked ? 'text-primary/70' : 'text-primary/20'}`}>
            <Icon size={18} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-[12px] text-foreground/85 uppercase tracking-wider">{label}</p>
            {badge && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                {badge}
              </span>
            )}
            {tooltip && (
              <span className="relative group/tip cursor-help">
                <Info size={12} className="text-primary/30 hover:text-primary/60 transition-colors" />
                <span className="absolute z-50 left-0 bottom-full mb-1.5 hidden group-hover/tip:block w-64 px-2 py-1.5 bg-black border border-primary/30 text-[10px] text-primary/80 font-mono leading-relaxed pointer-events-none whitespace-normal">
                  {tooltip}
                </span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-primary/50 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`font-mono text-[9px] tracking-wider ${checked ? 'text-green-400/70' : 'text-red-400/50'}`}>
          {checked ? statusActive : statusDisabled}
        </span>
        <button
          onClick={() => onChange(!checked)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            checked ? 'bg-primary/60' : 'bg-primary/15'
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              checked ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

interface SliderRowProps {
  label: string
  description: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  unit?: string
  tooltip?: string
}

function SliderRow({ label, description, value, onChange, min, max, step = 1, unit, tooltip }: SliderRowProps) {
  return (
    <div className="py-3 border-b border-primary/5 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-[12px] text-foreground/85 uppercase tracking-wider">{label}</p>
            {tooltip && (
              <span className="relative group/tip cursor-help">
                <Info size={12} className="text-primary/30 hover:text-primary/60 transition-colors" />
                <span className="absolute z-50 left-0 bottom-full mb-1.5 hidden group-hover/tip:block w-64 px-2 py-1.5 bg-black border border-primary/30 text-[10px] text-primary/80 font-mono leading-relaxed pointer-events-none whitespace-normal">
                  {tooltip}
                </span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-primary/50 mt-1 leading-relaxed">{description}</p>
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
            className="w-24 bg-black/50 border border-primary/20 px-2 py-1 font-mono text-[12px] text-foreground/80 text-right focus:border-primary/50 focus:outline-none"
          />
          {unit && <span className="text-[10px] font-mono text-primary/40 min-w-[2rem]">{unit}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-primary/30 w-12 text-right">{min}{unit}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 accent-primary cursor-pointer"
        />
        <span className="font-mono text-[9px] text-primary/30 w-12">{max}{unit}</span>
      </div>
    </div>
  )
}

interface TextInputRowProps {
  label: string
  description: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  tooltip?: string
}

function TextInputRow({ label, description, value, onChange, placeholder, tooltip }: TextInputRowProps) {
  return (
    <div className="py-3 border-b border-primary/5 space-y-2">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-mono text-[12px] text-foreground/85 uppercase tracking-wider">{label}</p>
          {tooltip && (
            <span className="relative group/tip cursor-help">
              <Info size={12} className="text-primary/30 hover:text-primary/60 transition-colors" />
              <span className="absolute z-50 left-0 bottom-full mb-1.5 hidden group-hover/tip:block w-64 px-2 py-1.5 bg-black border border-primary/30 text-[10px] text-primary/80 font-mono leading-relaxed pointer-events-none whitespace-normal">
                {tooltip}
              </span>
            </span>
          )}
        </div>
        <p className="text-[11px] text-primary/50 mt-1 leading-relaxed">{description}</p>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black/50 border border-primary/20 px-2 py-1.5 font-mono text-[12px] text-foreground/80 focus:border-primary/50 focus:outline-none placeholder:text-primary/20"
      />
    </div>
  )
}

export default function SecuritySettingsDialog({ open, onClose }: SecuritySettingsDialogProps) {
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('de')) return 'de'
    return 'en'
  })

  const L = (key: string) => t(key, locale)
  const LT = (key: string) => tip(key, locale)

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
      toast.success(L('settings.saved'))
    } catch (err) {
      toast.error(`${L('settings.failedSave')}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `neuroklast-security-config-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(L('settings.exported'))
  }

  const update = <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const [activeTab, setActiveTab] = useState<string>('modules')

  const TOTAL_MODULES = 14
  const SECURITY_LEVEL_HIGH_THRESHOLD = 9
  const SECURITY_LEVEL_MEDIUM_THRESHOLD = 6

  const activeModules = useMemo(() => {
    const bools: (keyof SecuritySettings)[] = [
      'underAttackMode',
      'honeytokensEnabled', 'rateLimitEnabled', 'robotsTrapEnabled',
      'entropyInjectionEnabled', 'suspiciousUaBlockingEnabled', 'sessionBindingEnabled',
      'threatScoringEnabled', 'hardBlockEnabled', 'zipBombEnabled', 'alertingEnabled',
      'sqlBackfireEnabled', 'canaryDocumentsEnabled', 'logPoisoningEnabled'
    ]
    return bools.filter(k => settings[k]).length
  }, [settings])

  return (
    <CyberModalBackdrop open={open} zIndex="z-[9999]">
          <motion.div
            className="w-full max-w-2xl max-h-[90dvh] bg-card border border-primary/30 relative overflow-hidden flex flex-col"
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
                <ShieldCheck size={16} className="text-primary/70" />
                <span className="font-mono text-[11px] text-primary/70 tracking-wider uppercase">
                  {L('settings.title')}
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
                <CyberCloseButton onClick={onClose} label={L('sec.close')} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                  <span className="ml-3 font-mono text-[11px] text-primary/50">{L('settings.loading')}</span>
                </div>
              )}

              {error && (
                <div className="border border-red-500/30 bg-red-500/10 p-4 text-center">
                  <p className="font-mono text-[12px] text-red-400">{L('sec.failedToLoad')}: {error}</p>
                </div>
              )}

              {!loading && !error && (
                <>
                  {/* Security status overview */}
                  <div className="border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${activeModules >= SECURITY_LEVEL_HIGH_THRESHOLD ? 'bg-green-500' : activeModules >= SECURITY_LEVEL_MEDIUM_THRESHOLD ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
                      <div>
                        <p className="font-mono text-[12px] text-foreground/85 uppercase">
                          {L('settings.securityLevel')}: {activeModules >= SECURITY_LEVEL_HIGH_THRESHOLD ? L('settings.high') : activeModules >= SECURITY_LEVEL_MEDIUM_THRESHOLD ? L('settings.medium') : L('settings.low')}
                        </p>
                        <p className="font-mono text-[10px] text-primary/50 mt-0.5">
                          {activeModules}/{TOTAL_MODULES} {L('settings.defenseModulesActive')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(TOTAL_MODULES)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-4 ${i < activeModules ? 'bg-primary/60' : 'bg-primary/10'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Info banner */}
                  <div className="border border-primary/15 bg-primary/5 p-3">
                    <p className="font-mono text-[10px] text-primary/50 leading-relaxed">
                      {L('settings.infoText')}
                    </p>
                  </div>

                  {/* Tab navigation */}
                  <div className="flex border-b border-primary/15">
                    {([
                      { key: 'modules', label: L('settings.tabModules') },
                      { key: 'parameters', label: L('settings.tabParameters') },
                      { key: 'rules', label: L('settings.tabRules') },
                      { key: 'countermeasures', label: L('settings.tabCountermeasures') },
                    ] as const).map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                          activeTab === tab.key
                            ? 'bg-primary/20 text-primary border-b-2 border-primary'
                            : 'text-primary/40 hover:text-primary/60'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab 1: MODULES */}
                  {activeTab === 'modules' && (
                    <div className="space-y-0">
                      {/* Under Attack Mode */}
                      <div className="border border-red-500/30 bg-red-500/5 p-3 mb-3">
                        <ToggleRow
                          icon={ShieldWarning}
                          label={L('mod.underAttack')}
                          description={L('mod.underAttackDesc')}
                          tooltip={LT('mod.underAttack')}
                          checked={settings.underAttackMode}
                          onChange={(v) => update('underAttackMode', v)}
                          badge="⚠ EMERGENCY"
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                      </div>

                      <ToggleRow
                        icon={Bug}
                        label={L('mod.honeytoken')}
                        description={L('mod.honeytokenDesc')}
                        tooltip={LT('mod.honeytoken')}
                        checked={settings.honeytokensEnabled}
                        onChange={(v) => update('honeytokensEnabled', v)}
                        statusActive={L('settings.active')}
                        statusDisabled={L('settings.disabled')}
                      />
                      <ToggleRow
                        icon={ShieldCheck}
                        label={L('mod.rateLimit')}
                        description={L('mod.rateLimitDesc')}
                        tooltip={LT('mod.rateLimit')}
                        checked={settings.rateLimitEnabled}
                        onChange={(v) => update('rateLimitEnabled', v)}
                        statusActive={L('settings.active')}
                        statusDisabled={L('settings.disabled')}
                      />
                      <ToggleRow
                        icon={Robot}
                        label={L('mod.robotsTrap')}
                        description={L('mod.robotsTrapDesc')}
                        tooltip={LT('mod.robotsTrap')}
                        checked={settings.robotsTrapEnabled}
                        onChange={(v) => update('robotsTrapEnabled', v)}
                        statusActive={L('settings.active')}
                        statusDisabled={L('settings.disabled')}
                      />
                      <ToggleRow
                        icon={ChartLine}
                        label={L('mod.threatScoring')}
                        description={L('mod.threatScoringDesc')}
                        tooltip={LT('mod.threatScoring')}
                        checked={settings.threatScoringEnabled}
                        onChange={(v) => update('threatScoringEnabled', v)}
                        statusActive={L('settings.active')}
                        statusDisabled={L('settings.disabled')}
                      />
                      <ToggleRow
                        icon={ProhibitInset}
                        label={L('mod.hardBlock')}
                        description={L('mod.hardBlockDesc')}
                        tooltip={LT('mod.hardBlock')}
                        checked={settings.hardBlockEnabled}
                        onChange={(v) => update('hardBlockEnabled', v)}
                        statusActive={L('settings.active')}
                        statusDisabled={L('settings.disabled')}
                      />
                      <ToggleRow
                        icon={Lock}
                        label={L('mod.entropy')}
                        description={L('mod.entropyDesc')}
                        tooltip={LT('mod.entropy')}
                        checked={settings.entropyInjectionEnabled}
                        onChange={(v) => update('entropyInjectionEnabled', v)}
                        statusActive={L('settings.active')}
                        statusDisabled={L('settings.disabled')}
                      />
                      <ToggleRow
                        icon={Package}
                        label={L('mod.zipBomb')}
                        description={L('mod.zipBombDesc')}
                        tooltip={LT('mod.zipBomb')}
                        checked={settings.zipBombEnabled}
                        onChange={(v) => update('zipBombEnabled', v)}
                        badge="⚠ AGGRESSIVE"
                        statusActive={L('settings.active')}
                        statusDisabled={L('settings.disabled')}
                      />
                      <ToggleRow
                        icon={BellRinging}
                        label={L('mod.alerting')}
                        description={L('mod.alertingDesc')}
                        tooltip={LT('mod.alerting')}
                        checked={settings.alertingEnabled}
                        onChange={(v) => update('alertingEnabled', v)}
                        statusActive={L('settings.active')}
                        statusDisabled={L('settings.disabled')}
                      />
                      <ToggleRow
                        icon={ShieldWarning}
                        label={L('mod.suspiciousUa')}
                        description={L('mod.suspiciousUaDesc')}
                        tooltip={LT('mod.suspiciousUa')}
                        checked={settings.suspiciousUaBlockingEnabled}
                        onChange={(v) => update('suspiciousUaBlockingEnabled', v)}
                        statusActive={L('settings.active')}
                        statusDisabled={L('settings.disabled')}
                      />
                      <ToggleRow
                        icon={Fingerprint}
                        label={L('mod.sessionBinding')}
                        description={L('mod.sessionBindingDesc')}
                        tooltip={LT('mod.sessionBinding')}
                        checked={settings.sessionBindingEnabled}
                        onChange={(v) => update('sessionBindingEnabled', v)}
                        statusActive={L('settings.active')}
                        statusDisabled={L('settings.disabled')}
                      />
                    </div>
                  )}

                  {/* Tab 2: PARAMETERS */}
                  {activeTab === 'parameters' && (
                    <div className="space-y-0">
                      <SliderRow
                        label={L('param.autoBlockThreshold')}
                        description={L('param.autoBlockThresholdDesc')}
                        tooltip={LT('param.autoBlockThreshold')}
                        value={settings.autoBlockThreshold}
                        onChange={(v) => update('autoBlockThreshold', v)}
                        min={3}
                        max={50}
                        step={1}
                        unit="pts"
                      />
                      <SliderRow
                        label={L('param.maxAlerts')}
                        description={L('param.maxAlertsDesc')}
                        value={settings.maxAlertsStored}
                        onChange={(v) => update('maxAlertsStored', v)}
                        min={10}
                        max={10000}
                        step={10}
                      />
                      <SliderRow
                        label={L('param.tarpitMin')}
                        description={L('param.tarpitMinDesc')}
                        tooltip={LT('param.tarpitMin')}
                        value={settings.tarpitMinMs}
                        onChange={(v) => update('tarpitMinMs', v)}
                        min={0}
                        max={30000}
                        step={500}
                        unit="ms"
                      />
                      <SliderRow
                        label={L('param.tarpitMax')}
                        description={L('param.tarpitMaxDesc')}
                        tooltip={LT('param.tarpitMax')}
                        value={settings.tarpitMaxMs}
                        onChange={(v) => update('tarpitMaxMs', v)}
                        min={0}
                        max={60000}
                        step={500}
                        unit="ms"
                      />
                      <SliderRow
                        label={L('param.sessionTtl')}
                        description={L('param.sessionTtlDesc')}
                        tooltip={LT('param.sessionTtl')}
                        value={settings.sessionTtlSeconds}
                        onChange={(v) => update('sessionTtlSeconds', v)}
                        min={300}
                        max={86400}
                        step={300}
                        unit="s"
                      />

                      {/* Threat Level Thresholds */}
                      <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mt-4 mb-2 flex items-center gap-2">
                        <ChartLine size={14} />
                        {L('param.thresholds')}
                      </h3>
                      <SliderRow
                        label={L('param.warnThreshold')}
                        description={L('param.warnThresholdDesc')}
                        tooltip={LT('param.warnThreshold')}
                        value={settings.warnThreshold}
                        onChange={(v) => update('warnThreshold', v)}
                        min={1}
                        max={50}
                        step={1}
                        unit="pts"
                      />
                      <SliderRow
                        label={L('param.tarpitThreshold')}
                        description={L('param.tarpitThresholdDesc')}
                        tooltip={LT('param.tarpitThreshold')}
                        value={settings.tarpitThreshold}
                        onChange={(v) => update('tarpitThreshold', v)}
                        min={2}
                        max={50}
                        step={1}
                        unit="pts"
                      />

                      {/* Threat Reason Points */}
                      <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mt-4 mb-2 flex items-center gap-2">
                        <ShieldWarning size={14} />
                        {L('param.reasonPoints')}
                      </h3>
                      <SliderRow
                        label={L('param.pointsHoneytoken')}
                        description={L('param.pointsHoneytokenDesc')}
                        value={settings.pointsHoneytokenAccess}
                        onChange={(v) => update('pointsHoneytokenAccess', v)}
                        min={0}
                        max={20}
                        step={1}
                        unit="pts"
                      />
                      <SliderRow
                        label={L('param.pointsSuspiciousUa')}
                        description={L('param.pointsSuspiciousUaDesc')}
                        value={settings.pointsSuspiciousUa}
                        onChange={(v) => update('pointsSuspiciousUa', v)}
                        min={0}
                        max={20}
                        step={1}
                        unit="pts"
                      />
                      <SliderRow
                        label={L('param.pointsRobotsViolation')}
                        description={L('param.pointsRobotsViolationDesc')}
                        value={settings.pointsRobotsViolation}
                        onChange={(v) => update('pointsRobotsViolation', v)}
                        min={0}
                        max={20}
                        step={1}
                        unit="pts"
                      />
                      <SliderRow
                        label={L('param.pointsMissingHeaders')}
                        description={L('param.pointsMissingHeadersDesc')}
                        value={settings.pointsMissingHeaders}
                        onChange={(v) => update('pointsMissingHeaders', v)}
                        min={0}
                        max={20}
                        step={1}
                        unit="pts"
                      />
                      <SliderRow
                        label={L('param.pointsRateLimit')}
                        description={L('param.pointsRateLimitDesc')}
                        value={settings.pointsRateLimitExceeded}
                        onChange={(v) => update('pointsRateLimitExceeded', v)}
                        min={0}
                        max={20}
                        step={1}
                        unit="pts"
                      />
                      <SliderRow
                        label={L('param.pointsGenericAccept')}
                        description={L('param.pointsGenericAcceptDesc')}
                        value={settings.pointsGenericAccept}
                        onChange={(v) => update('pointsGenericAccept', v)}
                        min={0}
                        max={20}
                        step={1}
                        unit="pts"
                      />

                      {/* Alert Channels */}
                      <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mt-4 mb-2 flex items-center gap-2">
                        <BellRinging size={14} />
                        {L('param.alertChannels')}
                      </h3>
                      <TextInputRow
                        label={L('param.discordWebhook')}
                        description={L('param.discordWebhookDesc')}
                        tooltip={LT('param.discordWebhook')}
                        value={settings.discordWebhookUrl}
                        onChange={(v) => update('discordWebhookUrl', v)}
                        placeholder="https://discord.com/api/webhooks/..."
                      />
                      <TextInputRow
                        label={L('param.alertEmail')}
                        description={L('param.alertEmailDesc')}
                        tooltip={LT('param.alertEmail')}
                        value={settings.alertEmail}
                        onChange={(v) => update('alertEmail', v)}
                        placeholder="admin@example.com"
                      />
                    </div>
                  )}

                  {/* Tab 3: RULES */}
                  {activeTab === 'rules' && (
                    <div className="space-y-4">
                      {/* Tarpit Rules Section */}
                      <div className="space-y-0">
                        <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mb-3 flex items-center gap-2">
                          <Lightning size={14} />
                          {L('rules.tarpitRulesHeader')}
                        </h3>
                        <ToggleRow
                          label={L('rules.tarpitOnWarn')}
                          description={L('rules.tarpitOnWarnDesc')}
                          tooltip={LT('rules.tarpitOnWarn')}
                          checked={settings.tarpitOnWarn}
                          onChange={(v) => update('tarpitOnWarn', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.tarpitOnSuspiciousUa')}
                          description={L('rules.tarpitOnSuspiciousUaDesc')}
                          tooltip={LT('rules.tarpitOnSuspiciousUa')}
                          checked={settings.tarpitOnSuspiciousUa}
                          onChange={(v) => update('tarpitOnSuspiciousUa', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.tarpitOnRobotsViolation')}
                          description={L('rules.tarpitOnRobotsViolationDesc')}
                          checked={settings.tarpitOnRobotsViolation}
                          onChange={(v) => update('tarpitOnRobotsViolation', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.tarpitOnHoneytoken')}
                          description={L('rules.tarpitOnHoneytokenDesc')}
                          tooltip={LT('rules.tarpitOnHoneytoken')}
                          checked={settings.tarpitOnHoneytoken}
                          onChange={(v) => update('tarpitOnHoneytoken', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.tarpitOnBlock')}
                          description={L('rules.tarpitOnBlockDesc')}
                          tooltip={LT('rules.tarpitOnBlock')}
                          checked={settings.tarpitOnBlock}
                          onChange={(v) => update('tarpitOnBlock', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                      </div>

                      {/* Zip Bomb Rules Section */}
                      <div className="space-y-0">
                        <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mb-3 flex items-center gap-2">
                          <Package size={14} />
                          {L('rules.zipBombRulesHeader')}
                        </h3>
                        <ToggleRow
                          label={L('rules.zipBombOnBlock')}
                          description={L('rules.zipBombOnBlockDesc')}
                          tooltip={LT('rules.zipBombOnBlock')}
                          checked={settings.zipBombOnBlock}
                          onChange={(v) => update('zipBombOnBlock', v)}
                          badge="⚠ AGGRESSIVE"
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.zipBombOnHoneytoken')}
                          description={L('rules.zipBombOnHoneytokenDesc')}
                          tooltip={LT('rules.zipBombOnHoneytoken')}
                          checked={settings.zipBombOnHoneytoken}
                          onChange={(v) => update('zipBombOnHoneytoken', v)}
                          badge="⚠ AGGRESSIVE"
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.zipBombOnRepeatOffender')}
                          description={L('rules.zipBombOnRepeatOffenderDesc')}
                          tooltip={LT('rules.zipBombOnRepeatOffender')}
                          checked={settings.zipBombOnRepeatOffender}
                          onChange={(v) => update('zipBombOnRepeatOffender', v)}
                          badge="⚠ AGGRESSIVE"
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.zipBombOnRobotsViolation')}
                          description={L('rules.zipBombOnRobotsViolationDesc')}
                          tooltip={LT('rules.zipBombOnRobotsViolation')}
                          checked={settings.zipBombOnRobotsViolation}
                          onChange={(v) => update('zipBombOnRobotsViolation', v)}
                          badge="⚠ AGGRESSIVE"
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.zipBombOnSuspiciousUa')}
                          description={L('rules.zipBombOnSuspiciousUaDesc')}
                          tooltip={LT('rules.zipBombOnSuspiciousUa')}
                          checked={settings.zipBombOnSuspiciousUa}
                          onChange={(v) => update('zipBombOnSuspiciousUa', v)}
                          badge="⚠ AGGRESSIVE"
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.zipBombOnRateLimit')}
                          description={L('rules.zipBombOnRateLimitDesc')}
                          tooltip={LT('rules.zipBombOnRateLimit')}
                          checked={settings.zipBombOnRateLimit}
                          onChange={(v) => update('zipBombOnRateLimit', v)}
                          badge="⚠ AGGRESSIVE"
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 4: COUNTERMEASURES */}
                  {activeTab === 'countermeasures' && (
                    <div className="space-y-4">
                      {/* SQL Injection Backfire */}
                      <div className="space-y-0">
                        <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mb-3 flex items-center gap-2">
                          <Database size={14} />
                          {L('settings.sqlBackfire')}
                        </h3>
                        <ToggleRow
                          icon={Database}
                          label={L('mod.sqlBackfire')}
                          description={L('mod.sqlBackfireDesc')}
                          tooltip={LT('mod.sqlBackfire')}
                          checked={settings.sqlBackfireEnabled}
                          onChange={(v) => update('sqlBackfireEnabled', v)}
                          badge="⚠ OFFENSIVE"
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.sqlBackfireOnScanner')}
                          description={L('rules.sqlBackfireOnScannerDesc')}
                          checked={settings.sqlBackfireOnScannerDetection}
                          onChange={(v) => update('sqlBackfireOnScannerDetection', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.sqlBackfireOnHoneytoken')}
                          description={L('rules.sqlBackfireOnHoneytokenDesc')}
                          checked={settings.sqlBackfireOnHoneytokenAccess}
                          onChange={(v) => update('sqlBackfireOnHoneytokenAccess', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                      </div>

                      {/* Canary Documents */}
                      <div className="space-y-0">
                        <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mb-3 flex items-center gap-2">
                          <FileText size={14} />
                          {L('settings.canaryDocuments')}
                        </h3>
                        <ToggleRow
                          icon={FileText}
                          label={L('mod.canaryDocuments')}
                          description={L('mod.canaryDocumentsDesc')}
                          tooltip={LT('mod.canaryDocuments')}
                          checked={settings.canaryDocumentsEnabled}
                          onChange={(v) => update('canaryDocumentsEnabled', v)}
                          badge="⚠ OFFENSIVE"
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.canaryPhoneHome')}
                          description={L('rules.canaryPhoneHomeDesc')}
                          checked={settings.canaryPhoneHomeOnOpen}
                          onChange={(v) => update('canaryPhoneHomeOnOpen', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.canaryFingerprint')}
                          description={L('rules.canaryFingerprintDesc')}
                          checked={settings.canaryCollectFingerprint}
                          onChange={(v) => update('canaryCollectFingerprint', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.canaryAlert')}
                          description={L('rules.canaryAlertDesc')}
                          checked={settings.canaryAlertOnCallback}
                          onChange={(v) => update('canaryAlertOnCallback', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                      </div>

                      {/* Log Poisoning */}
                      <div className="space-y-0">
                        <h3 className="text-[11px] font-mono text-primary/50 tracking-wider mb-3 flex items-center gap-2">
                          <Detective size={14} />
                          {L('settings.logPoisoning')}
                        </h3>
                        <ToggleRow
                          icon={Detective}
                          label={L('mod.logPoisoning')}
                          description={L('mod.logPoisoningDesc')}
                          tooltip={LT('mod.logPoisoning')}
                          checked={settings.logPoisoningEnabled}
                          onChange={(v) => update('logPoisoningEnabled', v)}
                          badge="⚠ OFFENSIVE"
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.logPoisonFakeHeaders')}
                          description={L('rules.logPoisonFakeHeadersDesc')}
                          checked={settings.logPoisonFakeHeaders}
                          onChange={(v) => update('logPoisonFakeHeaders', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.logPoisonTerminal')}
                          description={L('rules.logPoisonTerminalDesc')}
                          checked={settings.logPoisonTerminalEscape}
                          onChange={(v) => update('logPoisonTerminalEscape', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                        <ToggleRow
                          label={L('rules.logPoisonFakePaths')}
                          description={L('rules.logPoisonFakePathsDesc')}
                          checked={settings.logPoisonFakePaths}
                          onChange={(v) => update('logPoisonFakePaths', v)}
                          statusActive={L('settings.active')}
                          statusDisabled={L('settings.disabled')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-primary/80 hover:bg-primary text-white font-mono text-[11px] uppercase tracking-wider py-2 px-4 transition-colors disabled:opacity-50"
                    >
                      {saving ? L('settings.saving') : L('settings.save')}
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="bg-primary/10 hover:bg-primary/20 text-primary/70 font-mono text-[11px] uppercase tracking-wider py-2 px-4 transition-colors"
                    >
                      {L('settings.exportJson')}
                    </button>
                    <button
                      onClick={handleReset}
                      className="bg-primary/10 hover:bg-primary/20 text-primary/70 font-mono text-[11px] uppercase tracking-wider py-2 px-4 transition-colors"
                    >
                      {L('settings.resetDefaults')}
                    </button>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="flex items-center gap-2 text-[9px] text-primary/40 pt-2 border-t border-primary/10">
                <ShieldCheck size={10} className="text-primary/40" />
                <span>{L('settings.footer')}</span>
              </div>
            </div>
          </motion.div>
    </CyberModalBackdrop>
  )
}
