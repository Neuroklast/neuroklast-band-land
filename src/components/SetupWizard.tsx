import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MusicNote,
  Waveform,
  MicrophoneStage,
  VinylRecord,
  Briefcase,
  Code,
  Globe,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeSlash,
  Warning,
  CheckCircle,
  Key,
  type Icon,
} from '@phosphor-icons/react'
import { THEME_CATALOG, getTheme } from '@/lib/theme-registry'
import { applyThemeDefaults, applyThemeToDOM } from '@/lib/theme-application'
import { buildDefaultSections, toggleSection, reorderSections } from '@/lib/sections'
import { generateMetaTags, applyMetaTags } from '@/lib/meta-tags'
import { createSiteConfig } from '@/lib/site-config'
import { getContrastRatio, meetsWcagAA } from '@/lib/contrast'
import { fetchEnvStatus, REQUIRED_ENV_VARS, allRequiredSet, type EnvStatus } from '@/lib/env-check'
import { saveLocalActivationKey, getLocalActivationKey } from '@/hooks/use-activation-key'
import type { SiteConfig, SectionConfig } from '@/lib/types'

const VITE_ACTIVATION_KEY = import.meta.env.VITE_ACTIVATION_KEY as string | undefined
const IS_PRIMARY = import.meta.env.VITE_IS_PRIMARY === 'true'
const VALIDATE_URL =
  (import.meta.env.VITE_ACTIVATION_API_URL as string | undefined) ||
  'https://neuroklast-band-land.vercel.app/api/validate-key'

/** Returns true when the wizard should show the activation key step. */
function needsActivationStep(): boolean {
  if (IS_PRIMARY) return false
  if (VITE_ACTIVATION_KEY?.trim()) return false
  if (getLocalActivationKey()?.trim()) return false
  return true
}

// ─── Font options (same as ThemeCustomizerDialog) ─────────────────────────────

const FONT_OPTIONS = [
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace", google: false },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif", google: false },
  { label: 'System Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', google: false },
  { label: 'System Sans', value: 'ui-sans-serif, system-ui, sans-serif', google: false },
  { label: 'System Serif', value: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif", google: false },
  { label: 'Orbitron', value: "'Orbitron', sans-serif", google: true },
  { label: 'Share Tech Mono', value: "'Share Tech Mono', monospace", google: true },
  { label: 'VT323', value: "'VT323', monospace", google: true },
  { label: 'Press Start 2P', value: "'Press Start 2P', monospace", google: true },
  { label: 'Audiowide', value: "'Audiowide', sans-serif", google: true },
  { label: 'Rajdhani', value: "'Rajdhani', sans-serif", google: true },
  { label: 'Chakra Petch', value: "'Chakra Petch', sans-serif", google: true },
  { label: 'Exo 2', value: "'Exo 2', sans-serif", google: true },
  { label: 'Tektur', value: "'Tektur', sans-serif", google: true },
  { label: 'Oxanium', value: "'Oxanium', sans-serif", google: true },
  { label: 'Iceland', value: "'Iceland', monospace", google: true },
  { label: 'Michroma', value: "'Michroma', sans-serif", google: true },
  { label: 'Russo One', value: "'Russo One', sans-serif", google: true },
  { label: 'Bruno Ace', value: "'Bruno Ace', sans-serif", google: true },
  { label: 'Electrolize', value: "'Electrolize', sans-serif", google: true },
]

const loadedFonts = new Set<string>()
function loadGoogleFont(fontLabel: string) {
  if (loadedFonts.has(fontLabel)) return
  loadedFonts.add(fontLabel)
  const family = fontLabel.replace(/ /g, '+')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;700&display=swap`
  document.head.appendChild(link)
}

function loadAllGoogleFonts() {
  FONT_OPTIONS.filter((f) => f.google).forEach((f) => loadGoogleFont(f.label))
}

/** Convert Google Drive share links to direct image URLs */
function toPreviewUrl(url: string): string {
  const driveMatch = url.match(/\/file\/d\/([^/]+)/)
  if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`
  return url
}

// ─── oklch ↔ hex helpers (lightweight, same pattern as ThemeCustomizerDialog) ─

function oklchToHex(oklch: string): string {
  try {
    const el = document.createElement('div')
    el.style.color = oklch
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (m) {
      const [, r, g, b] = m
      return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`
    }
  } catch { /* fallback */ }
  return '#ff3333'
}

function hexToOklch(hex: string): string {
  try {
    const el = document.createElement('div')
    el.style.color = hex
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (m) {
      const [, rs, gs, bs] = m
      const r = Number(rs) / 255
      const g = Number(gs) / 255
      const b = Number(bs) / 255
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const c = max - min
      let h = 0
      if (c > 0) {
        if (max === r) h = ((g - b) / c + 6) % 6 * 60
        else if (max === g) h = ((b - r) / c + 2) * 60
        else h = ((r - g) / c + 4) * 60
      }
      return `oklch(${l.toFixed(2)} ${(c * 0.4).toFixed(2)} ${Math.round(h)})`
    }
  } catch { /* fallback */ }
  return 'oklch(0.50 0.22 25)'
}

// ─── Site type definitions ────────────────────────────────────────────────────

const SITE_TYPES: Array<{
  id: SiteConfig['siteType']
  label: string
  description: string
  Icon: Icon
}> = [
  { id: 'band', label: 'Band', description: 'Rock, metal, punk, indie — any group', Icon: MusicNote },
  { id: 'dj', label: 'DJ', description: 'Electronic, club, festival DJ', Icon: Waveform },
  { id: 'artist', label: 'Artist', description: 'Solo musician or singer-songwriter', Icon: MicrophoneStage },
  { id: 'label', label: 'Label', description: 'Record label or music collective', Icon: VinylRecord },
  { id: 'portfolio', label: 'Portfolio', description: 'Music producer or studio portfolio', Icon: Briefcase },
  { id: 'custom', label: 'Custom', description: 'Anything else — full control', Icon: Code },
]

// ─── Step labels ──────────────────────────────────────────────────────────────

const ENV_WARNING_COLOR = 'oklch(0.7 0.15 60)'
const ENV_WARNING_BG = 'oklch(0.7 0.15 60 / 0.08)'

/** Step names (the activation step is injected at index 0 when needed). */
const STEPS_BASE = [
  'Welcome',
  'Site Type',
  'Basic Info',
  'Theme',
  'Colors',
  'Fonts',
  'Logo & Assets',
  'Sections',
  'Social Links',
  'Legal',
  'Admin Password',
  'Done',
]

const ACTIVATION_STEP = 'Activation Key'

function getSteps(withActivation: boolean): string[] {
  return withActivation ? [ACTIVATION_STEP, ...STEPS_BASE] : STEPS_BASE
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SetupWizardProps {
  onComplete: (config: Partial<SiteConfig>) => void
  onSetAdminPassword: (password: string) => Promise<void>
  initialConfig?: Partial<SiteConfig>
}

// ─── Corner decoration ────────────────────────────────────────────────────────

function CornerDecorations() {
  return (
    <>
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50 pointer-events-none" />
    </>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`transition-all duration-300 rounded-full ${
            i === current
              ? 'w-6 h-2 bg-primary'
              : i < current
                ? 'w-2 h-2 bg-primary/50'
                : 'w-2 h-2 bg-primary/20'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SetupWizard({ onComplete, onSetAdminPassword, initialConfig }: SetupWizardProps) {
  const [showActivation] = useState(() => needsActivationStep())
  const STEPS = getSteps(showActivation)

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  // Activation key state (step 0 when needed)
  const [activationKeyInput, setActivationKeyInput] = useState('')
  const [activationValidating, setActivationValidating] = useState(false)
  const [activationError, setActivationError] = useState('')
  const [activationValid, setActivationValid] = useState(false)

  // Wizard data
  const [siteType, setSiteType] = useState<SiteConfig['siteType']>(initialConfig?.siteType ?? 'band')
  const [siteName, setSiteName] = useState(initialConfig?.siteName ?? '')
  const [tagline, setTagline] = useState(initialConfig?.tagline ?? '')
  const [description, setDescription] = useState(initialConfig?.description ?? '')
  const [genresInput, setGenresInput] = useState((initialConfig?.genres ?? []).join(', '))
  const [domain, setDomain] = useState(initialConfig?.domain ?? '')
  const [selectedPreset, setSelectedPreset] = useState(
    initialConfig?.themeSettings?.activePreset ?? THEME_CATALOG[0]?.id ?? 'neuroklast-classic',
  )
  const [fontHeading, setFontHeading] = useState(
    initialConfig?.themeSettings?.fontHeading ?? FONT_OPTIONS[0].value,
  )
  const [fontBody, setFontBody] = useState(
    initialConfig?.themeSettings?.fontBody ?? FONT_OPTIONS[1].value,
  )
  const [fontMono, setFontMono] = useState(
    initialConfig?.themeSettings?.fontMono ?? FONT_OPTIONS[0].value,
  )
  // Color state
  const [colorPrimary, setColorPrimary] = useState(initialConfig?.themeSettings?.primary ?? 'oklch(0.50 0.22 25)')
  const [colorAccent, setColorAccent] = useState(initialConfig?.themeSettings?.accent ?? 'oklch(0.60 0.24 25)')
  const [colorBackground, setColorBackground] = useState(initialConfig?.themeSettings?.background ?? 'oklch(0 0 0)')
  const [colorForeground, setColorForeground] = useState(initialConfig?.themeSettings?.foreground ?? 'oklch(0.95 0 0)')
  const [logoUrl, setLogoUrl] = useState(initialConfig?.logoUrl ?? '')
  const [ogImage, setOgImage] = useState(initialConfig?.seo?.ogImage ?? '')
  const [favicon, setFavicon] = useState('')
  const [sections, setSections] = useState<SectionConfig[]>(
    initialConfig?.sections ?? buildDefaultSections(),
  )
  // Section labels
  const [sectionLabels, setSectionLabels] = useState<Record<string, string>>(() => {
    const labels = initialConfig?.sectionLabels ?? {}
    const result: Record<string, string> = {}
    const defaultSecs = initialConfig?.sections ?? buildDefaultSections()
    for (const sec of defaultSecs) {
      result[sec.id] = (labels as Record<string, string>)[sec.id] ?? ''
    }
    return result
  })
  const [socialLinks, setSocialLinks] = useState({
    instagram: initialConfig?.socialLinks?.instagram ?? '',
    spotify: initialConfig?.socialLinks?.spotify ?? '',
    soundcloud: initialConfig?.socialLinks?.soundcloud ?? '',
    bandcamp: initialConfig?.socialLinks?.bandcamp ?? '',
    youtube: initialConfig?.socialLinks?.youtube ?? '',
    facebook: initialConfig?.socialLinks?.facebook ?? '',
    tiktok: initialConfig?.socialLinks?.tiktok ?? '',
    twitter: initialConfig?.socialLinks?.twitter ?? '',
  })
  const [impressumName, setImpressumName] = useState(initialConfig?.impressum?.name ?? '')
  const [impressumStreet, setImpressumStreet] = useState(initialConfig?.impressum?.street ?? '')
  const [impressumZipCity, setImpressumZipCity] = useState(initialConfig?.impressum?.zipCity ?? '')
  const [impressumEmail, setImpressumEmail] = useState(initialConfig?.impressum?.email ?? '')
  const [datenschutzText, setDatenschutzText] = useState(initialConfig?.datenschutz?.customText ?? '')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // ENV variable status (fetched once on mount)
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)
  const [envLoading, setEnvLoading] = useState(true)

  useEffect(() => {
    fetchEnvStatus().then((status) => {
      setEnvStatus(status)
      setEnvLoading(false)
    })
  }, [])

  const logoInputRef = useRef<HTMLInputElement>(null)

  // ── Navigation ──────────────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }, [STEPS.length])

  const goBack = useCallback(() => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  // ── Activation key validation ────────────────────────────────────────────────

  const handleActivationSubmit = useCallback(async () => {
    const key = activationKeyInput.trim()
    if (!key) {
      setActivationError('Please enter your activation key')
      return
    }
    setActivationValidating(true)
    setActivationError('')
    try {
      const res = await fetch(VALIDATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
        signal: AbortSignal.timeout(10000),
      })
      const data = await res.json()
      if (data?.valid) {
        saveLocalActivationKey(key)
        setActivationValid(true)
        toast.success('Key activated successfully!')
        goNext()
      } else {
        setActivationError('Key invalid, please check and try again')
      }
    } catch {
      setActivationError('Could not reach validation server. Please try again.')
    } finally {
      setActivationValidating(false)
    }
  }, [activationKeyInput, goNext])

  // ── Theme application ──────────────────────────────────────────────────────

  const applyPreset = useCallback(
    (themeId: string) => {
      setSelectedPreset(themeId)
      const defaults = applyThemeDefaults(themeId)
      applyThemeToDOM(defaults)
      if (defaults.fontHeading) setFontHeading(defaults.fontHeading)
      if (defaults.fontBody) setFontBody(defaults.fontBody)
      if (defaults.fontMono) setFontMono(defaults.fontMono)
      if (defaults.primary) setColorPrimary(defaults.primary)
      if (defaults.accent) setColorAccent(defaults.accent)
      if (defaults.background) setColorBackground(defaults.background)
      if (defaults.foreground) setColorForeground(defaults.foreground)
    },
    [],
  )

  // ── Logo file upload ────────────────────────────────────────────────────────

  const handleLogoFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') setLogoUrl(result)
    }
    reader.readAsDataURL(file)
  }

  // ── Final submit ────────────────────────────────────────────────────────────

  const handleFinish = useCallback(async () => {
    // Set admin password
    if (adminPassword) {
      try {
        await onSetAdminPassword(adminPassword)
      } catch {
        toast.error('Failed to set admin password')
        return
      }
    }

    const themeDefaults = applyThemeDefaults(selectedPreset)
    const themeSettings = {
      ...themeDefaults,
      activePreset: selectedPreset,
      fontHeading,
      fontBody,
      fontMono,
      primary: colorPrimary,
      accent: colorAccent,
      background: colorBackground,
      foreground: colorForeground,
    }

    const genres = genresInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)

    // Build section labels (only include non-empty values)
    const cleanLabels = Object.fromEntries(
      Object.entries(sectionLabels).filter(([, v]) => v),
    )

    const finalConfig = createSiteConfig({
      ...initialConfig,
      siteType,
      siteName,
      tagline: tagline || undefined,
      description: description || undefined,
      genres,
      domain: domain || undefined,
      themeSettings,
      logoUrl: logoUrl || favicon || undefined,
      seo: {
        ogImage: ogImage || undefined,
      },
      sections,
      sectionLabels: Object.keys(cleanLabels).length > 0 ? cleanLabels as SiteConfig['sectionLabels'] : undefined,
      socialLinks: Object.fromEntries(
        Object.entries(socialLinks).filter(([, v]) => v),
      ),
      impressum: impressumName
        ? {
            name: impressumName,
            street: impressumStreet || undefined,
            zipCity: impressumZipCity || undefined,
            email: impressumEmail || undefined,
          }
        : undefined,
      datenschutz: datenschutzText ? { customText: datenschutzText } : undefined,
      setupComplete: true,
    })

    applyMetaTags(generateMetaTags(finalConfig))
    onComplete(finalConfig)
    goNext()
  }, [
    adminPassword,
    onSetAdminPassword,
    selectedPreset,
    fontHeading,
    fontBody,
    fontMono,
    colorPrimary,
    colorAccent,
    colorBackground,
    colorForeground,
    genresInput,
    initialConfig,
    siteType,
    siteName,
    tagline,
    description,
    domain,
    logoUrl,
    ogImage,
    favicon,
    sections,
    sectionLabels,
    socialLinks,
    impressumName,
    impressumStreet,
    impressumZipCity,
    impressumEmail,
    datenschutzText,
    onComplete,
    goNext,
  ])

  // ── Validate admin password step ────────────────────────────────────────────

  const handlePasswordNext = async () => {
    if (!adminPassword) {
      setPasswordError('Password is required')
      return
    }
    if (adminPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    if (adminPassword !== adminPasswordConfirm) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordError('')
    await handleFinish()
  }

  // ── Animation variants ──────────────────────────────────────────────────────

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  // ── Step content ────────────────────────────────────────────────────────────

  const renderStep = () => {
    // When the activation step is shown, it is step 0.
    // All other steps are offset by +1.
    const baseStep = showActivation ? step - 1 : step

    if (showActivation && step === 0) {
      // ── Activation Key step ───────────────────────────────────────────────
      return (
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <div className="text-4xl mb-2">🔑</div>
            <h1 className="text-2xl font-mono font-bold text-primary tracking-tight">
              ACTIVATION KEY
            </h1>
            <p className="text-muted-foreground font-mono text-sm leading-relaxed">
              Enter your activation key to get started.
            </p>
          </div>

          {activationValid ? (
            <div className="flex items-center justify-center gap-2 text-green-400 font-mono text-sm">
              <Check size={16} weight="bold" /> Key activated!
            </div>
          ) : (
            <div className="space-y-3 text-left">
              <div className="space-y-1.5">
                <Label className="font-mono text-xs">Activation Key</Label>
                <Input
                  value={activationKeyInput}
                  onChange={(e) => { setActivationKeyInput(e.target.value); setActivationError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleActivationSubmit()}
                  placeholder="nk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="bg-secondary border-input font-mono text-sm"
                  autoFocus
                />
                {activationError && (
                  <p className="text-xs text-destructive font-mono">{activationError}</p>
                )}
              </div>

              <Button
                onClick={handleActivationSubmit}
                disabled={activationValidating || !activationKeyInput.trim()}
                className="w-full font-mono tracking-wider gap-2"
              >
                <Key size={16} />
                {activationValidating ? 'Validating…' : 'Activate'}
              </Button>

              <p className="text-xs text-center text-muted-foreground font-mono">
                No key yet?{' '}
                <a
                  href="https://neuroklast.net/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Contact Neuroklast →
                </a>
              </p>
            </div>
          )}
        </div>
      )
    }

    switch (baseStep) {
      // ── 0. Welcome ──────────────────────────────────────────────────────────
      case 0:
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <p className="font-mono text-[10px] text-primary/60 tracking-[0.3em] uppercase">
                Band Land Template
              </p>
              <h1 className="text-3xl font-mono font-bold text-primary tracking-tight">
                SETUP WIZARD
              </h1>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Welcome. This wizard will help you configure your site in a few steps.
                <br />
                You can always change everything later from the admin panel.
              </p>
            </div>
            <div className="border border-primary/20 rounded p-4 bg-primary/5 text-left space-y-2">
              {STEPS_BASE.slice(1, -1).map((s, i) => (
                <div key={s} className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <span className="text-primary/60 w-4">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            {/* ENV variable status */}
            {!envLoading && envStatus && (
              <div className="border rounded p-4 text-left space-y-2"
                style={{
                  borderColor: allRequiredSet(envStatus) ? 'var(--primary)' : ENV_WARNING_COLOR,
                  backgroundColor: allRequiredSet(envStatus) ? 'hsl(var(--primary) / 0.05)' : ENV_WARNING_BG,
                }}
              >
                <p className="font-mono text-xs font-bold" style={{ color: allRequiredSet(envStatus) ? 'var(--primary)' : ENV_WARNING_COLOR }}>
                  {allRequiredSet(envStatus) ? '✓ ENVIRONMENT CONFIGURED' : '⚠ ENVIRONMENT VARIABLES'}
                </p>
                {!allRequiredSet(envStatus) && (
                  <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                    Some required variables are missing. Set them in your Vercel project settings or <code className="text-primary">.env</code> file for full functionality.
                  </p>
                )}
                <div className="space-y-1">
                  {REQUIRED_ENV_VARS.map((v) => (
                    <div key={v.key} className="flex items-center gap-2 font-mono text-[11px]">
                      {envStatus[v.key]
                        ? <CheckCircle size={14} weight="fill" className="text-green-500 shrink-0" />
                        : <Warning size={14} weight="fill" className="shrink-0" style={{ color: v.required ? ENV_WARNING_COLOR : 'var(--muted-foreground)' }} />
                      }
                      <span className={envStatus[v.key] ? 'text-muted-foreground' : v.required ? 'text-foreground' : 'text-muted-foreground'}>
                        {v.label}
                        {!v.required && <span className="text-muted-foreground/60 ml-1">(optional)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={goNext} className="font-mono tracking-wider gap-2 w-full">
              START SETUP
              <ArrowRight size={16} />
            </Button>
          </div>
        )

      // ── 1. Site Type ─────────────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-mono font-bold text-primary tracking-tight">SITE TYPE</h2>
              <p className="font-mono text-xs text-muted-foreground">
                What kind of site are you creating?
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SITE_TYPES.map(({ id, label, description: desc, Icon }) => (
                <button
                  key={id}
                  onClick={() => setSiteType(id)}
                  className={`border rounded p-3 text-left transition-all hover:border-primary/50 ${
                    siteType === id
                      ? 'border-primary bg-primary/10'
                      : 'border-primary/15 bg-card'
                  }`}
                >
                  <Icon
                    size={20}
                    weight={siteType === id ? 'fill' : 'regular'}
                    className="text-primary mb-1"
                  />
                  <div className="font-mono text-xs font-bold text-foreground">{label}</div>
                  <div className="font-mono text-[10px] text-muted-foreground leading-tight mt-0.5">
                    {desc}
                  </div>
                </button>
              ))}
            </div>
            <NavigationButtons onBack={goBack} onNext={goNext} />
          </div>
        )

      // ── 2. Basic Info ────────────────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-mono font-bold text-primary tracking-tight">BASIC INFO</h2>
              <p className="font-mono text-xs text-muted-foreground">
                Tell us about your site.
              </p>
            </div>
            <div className="space-y-3">
              <Field label="Site Name *">
                <Input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Neuroklast"
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Tagline">
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Industrial Techno from Berlin"
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Description">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short SEO description"
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Genres (comma-separated)">
                <Input
                  value={genresInput}
                  onChange={(e) => setGenresInput(e.target.value)}
                  placeholder="e.g. Techno, Industrial, EBM"
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Domain (optional)">
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. neuroklast.net"
                  className="font-mono text-sm"
                />
              </Field>
            </div>
            <NavigationButtons
              onBack={goBack}
              onNext={siteName.trim() ? goNext : undefined}
              nextDisabled={!siteName.trim()}
              nextLabel="NEXT"
            />
          </div>
        )

      // ── 3. Design Preset ─────────────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-mono font-bold text-primary tracking-tight">
                THEME WÄHLEN
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                Choose a theme. Preview changes live as you hover.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {THEME_CATALOG.map((themeDefn) => {
                const themePkg = getTheme(themeDefn.id)
                const colors = themePkg?.defaultColors
                return (
                  <button
                    key={themeDefn.id}
                    onClick={() => applyPreset(themeDefn.id)}
                    onMouseEnter={() => {
                      const defaults = applyThemeDefaults(themeDefn.id)
                      applyThemeToDOM(defaults)
                    }}
                    onMouseLeave={() => {
                      const defaults = applyThemeDefaults(selectedPreset)
                      applyThemeToDOM(defaults)
                    }}
                    className={`border rounded p-3 text-left transition-all hover:border-primary/50 ${
                      selectedPreset === themeDefn.id
                        ? 'border-primary bg-primary/10'
                        : 'border-primary/15 bg-card'
                    }`}
                  >
                    {colors && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ background: colors.primary }} />
                        <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ background: colors.accent }} />
                        <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ background: colors.background }} />
                      </div>
                    )}
                    <div className="font-mono text-xs font-bold text-foreground">{themeDefn.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground leading-tight mt-0.5">
                      {themeDefn.description}
                    </div>
                  </button>
                )
              })}
            </div>
            <NavigationButtons onBack={goBack} onNext={goNext} />
          </div>
        )

      // ── 4. Colors ───────────────────────────────────────────────────────────
      case 4: {
        const ratio = getContrastRatio(colorForeground, colorBackground)
        const passesAA = ratio != null && meetsWcagAA(ratio)
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-mono font-bold text-primary tracking-tight">COLORS</h2>
              <p className="font-mono text-xs text-muted-foreground">
                Fine-tune your color palette. Contrast is checked automatically.
              </p>
            </div>
            <div className="space-y-2">
              <WizardColorInput label="Primary" value={colorPrimary} onChange={(v) => { setColorPrimary(v); applyThemeToDOM({ primary: v }) }} />
              <WizardColorInput label="Accent" value={colorAccent} onChange={(v) => { setColorAccent(v); applyThemeToDOM({ accent: v }) }} />
              <WizardColorInput label="Background" value={colorBackground} onChange={(v) => { setColorBackground(v); applyThemeToDOM({ background: v }) }} />
              <WizardColorInput label="Foreground" value={colorForeground} onChange={(v) => { setColorForeground(v); applyThemeToDOM({ foreground: v }) }} />
            </div>
            {ratio != null && (
              <div
                className={`flex items-center gap-2 border rounded px-3 py-2 font-mono text-xs ${
                  passesAA
                    ? 'border-green-500/30 bg-green-500/5 text-green-400'
                    : 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
                }`}
              >
                {passesAA ? <CheckCircle size={16} /> : <Warning size={16} />}
                <span>
                  Contrast ratio: {ratio.toFixed(1)}:1
                  {passesAA ? ' — WCAG AA ✓' : ' — Below WCAG AA (4.5:1 recommended)'}
                </span>
              </div>
            )}
            <NavigationButtons onBack={goBack} onNext={goNext} />
          </div>
        )
      }

      // ── 5. Fonts ─────────────────────────────────────────────────────────────
      case 5: {
        const FontSelect = ({
          label,
          value,
          onChange,
        }: {
          label: string
          value: string
          onChange: (v: string) => void
        }) => (
          <Field label={label}>
            <select
              value={value}
              onChange={(e) => {
                const v = e.target.value
                const match = FONT_OPTIONS.find((f) => f.value === v)
                if (match?.google) loadGoogleFont(match.label)
                onChange(v)
              }}
              className="w-full bg-background border border-primary/30 rounded px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary"
              onFocus={() => loadAllGoogleFonts()}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </select>
            <p className="font-mono text-[10px] text-muted-foreground mt-1" style={{ fontFamily: value }}>
              Preview: The quick brown fox jumps over the lazy dog — 0123456789
            </p>
          </Field>
        )
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-mono font-bold text-primary tracking-tight">FONTS</h2>
              <p className="font-mono text-xs text-muted-foreground">
                Choose fonts for your site. Changes preview live.
              </p>
            </div>
            <div className="space-y-3">
              <FontSelect
                label="Heading Font"
                value={fontHeading}
                onChange={(v) => {
                  setFontHeading(v)
                  applyThemeToDOM({ fontHeading: v, fontBody, fontMono })
                }}
              />
              <FontSelect
                label="Body Font"
                value={fontBody}
                onChange={(v) => {
                  setFontBody(v)
                  applyThemeToDOM({ fontHeading, fontBody: v, fontMono })
                }}
              />
              <FontSelect
                label="Mono Font"
                value={fontMono}
                onChange={(v) => {
                  setFontMono(v)
                  applyThemeToDOM({ fontHeading, fontBody, fontMono: v })
                }}
              />
            </div>
            <NavigationButtons onBack={goBack} onNext={goNext} />
          </div>
        )
      }

      // ── 6. Logo & Assets ─────────────────────────────────────────────────────
      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-mono font-bold text-primary tracking-tight">
                LOGO &amp; ASSETS
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                Upload or link your logo and social preview image.
              </p>
            </div>
            <div className="space-y-3">
              <Field label="Logo URL or Upload">
                <div className="flex gap-2">
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://... or upload below"
                    className="font-mono text-sm flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    className="font-mono text-xs shrink-0"
                  >
                    Upload
                  </Button>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleLogoFile(file)
                  }}
                />
                {logoUrl && (
                  <div style={{ filter: 'drop-shadow(0 0 8px var(--primary))' }}>
                    <img
                      src={toPreviewUrl(logoUrl)}
                      alt="Logo preview"
                      className="mt-2 h-16 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                )}
              </Field>
              <Field label="OG Image URL (social preview)">
                <Input
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://..."
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Favicon URL">
                <Input
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  placeholder="https://... (optional)"
                  className="font-mono text-sm"
                />
              </Field>
            </div>
            <NavigationButtons onBack={goBack} onNext={goNext} />
          </div>
        )

      // ── 7. Sections ──────────────────────────────────────────────────────────
      case 7: {
        const sorted = [...sections].sort((a, b) => a.order - b.order)
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-mono font-bold text-primary tracking-tight">SECTIONS</h2>
              <p className="font-mono text-xs text-muted-foreground">
                Choose which sections to show, their order, and custom labels.
              </p>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {sorted.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="flex items-center gap-2 border border-primary/15 rounded px-3 py-2 bg-card"
                >
                  <input
                    type="checkbox"
                    checked={sec.enabled}
                    onChange={() => setSections((prev) => toggleSection(prev, sec.id))}
                    className="accent-primary"
                    id={`section-${sec.id}`}
                  />
                  <label
                    htmlFor={`section-${sec.id}`}
                    className="font-mono text-xs text-foreground min-w-20 capitalize cursor-pointer select-none flex-shrink-0"
                  >
                    {sec.id}
                  </label>
                  <Input
                    value={sectionLabels[sec.id] ?? ''}
                    onChange={(e) =>
                      setSectionLabels((prev) => ({ ...prev, [sec.id]: e.target.value }))
                    }
                    placeholder="Custom label"
                    className="font-mono text-[10px] h-7 flex-1"
                  />
                  <button
                    onClick={() =>
                      idx > 0 && setSections((prev) => reorderSections(prev, sec.id, idx - 1))
                    }
                    disabled={idx === 0}
                    className="text-muted-foreground hover:text-primary disabled:opacity-30 p-0.5"
                    aria-label={`Move ${sec.id} up`}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() =>
                      idx < sorted.length - 1 &&
                      setSections((prev) => reorderSections(prev, sec.id, idx + 1))
                    }
                    disabled={idx === sorted.length - 1}
                    className="text-muted-foreground hover:text-primary disabled:opacity-30 p-0.5"
                    aria-label={`Move ${sec.id} down`}
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
              ))}
            </div>
            <NavigationButtons onBack={goBack} onNext={goNext} />
          </div>
        )
      }

      // ── 8. Social Links ──────────────────────────────────────────────────────
      case 8: {
        const socialFields: Array<{ key: keyof typeof socialLinks; label: string; placeholder: string }> = [
          { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
          { key: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...' },
          { key: 'soundcloud', label: 'SoundCloud', placeholder: 'https://soundcloud.com/...' },
          { key: 'bandcamp', label: 'Bandcamp', placeholder: 'https://....bandcamp.com' },
          { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
          { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
          { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
          { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
        ]
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-mono font-bold text-primary tracking-tight">
                SOCIAL LINKS
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                Add your social media profiles. All fields are optional.
              </p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {socialFields.map(({ key, label, placeholder }) => (
                <Field key={key} label={label}>
                  <Input
                    value={socialLinks[key]}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="font-mono text-sm"
                  />
                </Field>
              ))}
            </div>
            <NavigationButtons onBack={goBack} onNext={goNext} />
          </div>
        )
      }

      // ── 9. Legal ─────────────────────────────────────────────────────────────
      case 9:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-mono font-bold text-primary tracking-tight">LEGAL</h2>
              <p className="font-mono text-xs text-muted-foreground">
                Impressum / legal notice &amp; privacy policy.
              </p>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <Field label="Name / Organisation">
                <Input
                  value={impressumName}
                  onChange={(e) => setImpressumName(e.target.value)}
                  placeholder="e.g. Max Mustermann or Neuroklast GbR"
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Street &amp; House Number">
                <Input
                  value={impressumStreet}
                  onChange={(e) => setImpressumStreet(e.target.value)}
                  placeholder="e.g. Musterstraße 42"
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="ZIP Code &amp; City">
                <Input
                  value={impressumZipCity}
                  onChange={(e) => setImpressumZipCity(e.target.value)}
                  placeholder="e.g. 10115 Berlin"
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Contact Email">
                <Input
                  type="email"
                  value={impressumEmail}
                  onChange={(e) => setImpressumEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="font-mono text-sm"
                />
              </Field>
              <Field label="Privacy Policy (Datenschutz) — custom text">
                <textarea
                  value={datenschutzText}
                  onChange={(e) => setDatenschutzText(e.target.value)}
                  placeholder="Optional: Paste your custom privacy policy text here…"
                  rows={3}
                  className="w-full bg-background border border-primary/30 rounded px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:border-primary resize-y"
                />
              </Field>
            </div>
            <div className="border border-primary/10 rounded p-3 bg-primary/5">
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                ⚠️ This data will be shown in the legal notice (Impressum) of your site. By German
                law (§ 5 TMG) a legally responsible person must be named. You can edit this later.
              </p>
            </div>
            <NavigationButtons onBack={goBack} onNext={goNext} />
          </div>
        )

      // ── 10. Admin Password ────────────────────────────────────────────────────
      case 10:
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-mono font-bold text-primary tracking-tight">
                ADMIN PASSWORD
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                Set a password to protect the admin panel. Minimum 8 characters.
              </p>
            </div>
            <div className="space-y-3">
              <Field label="Password">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value)
                      setPasswordError('')
                    }}
                    placeholder="Min. 8 characters"
                    className="font-mono text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm Password">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={adminPasswordConfirm}
                  onChange={(e) => {
                    setAdminPasswordConfirm(e.target.value)
                    setPasswordError('')
                  }}
                  placeholder="Repeat password"
                  className="font-mono text-sm"
                />
              </Field>
              {passwordError && (
                <p className="font-mono text-xs text-destructive">{passwordError}</p>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                onClick={goBack}
                className="font-mono text-xs gap-1 flex-1"
              >
                <ArrowLeft size={14} />
                BACK
              </Button>
              <Button
                onClick={handlePasswordNext}
                className="font-mono text-xs gap-1 flex-1"
              >
                FINISH SETUP
                <Check size={14} />
              </Button>
            </div>
          </div>
        )

      // ── 11. Done ─────────────────────────────────────────────────────────────
      case 11:
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center mx-auto">
                <Check size={32} weight="bold" className="text-primary" />
              </div>
              <h2 className="text-2xl font-mono font-bold text-primary tracking-tight">
                SETUP COMPLETE
              </h2>
              <p className="text-muted-foreground font-mono text-sm">
                Your site has been configured.
                <br />
                You can always adjust settings from the admin panel.
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="font-mono tracking-wider gap-2 w-full"
            >
              <Globe size={16} />
              GO TO SITE
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 overflow-y-auto">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-2xl">
        <div className="relative bg-card border border-primary/30 rounded p-6 sm:p-8 shadow-2xl">
          <CornerDecorations />

          {/* Step indicator — hide on first/last step */}
          {step > 0 && step < STEPS.length - 1 && (
            <div className="mb-6 space-y-2">
              <StepIndicator current={step - 1} total={STEPS.length - 2} />
              <p className="text-center font-mono text-[10px] text-muted-foreground tracking-wider">
                STEP {step} / {STEPS.length - 2} — {STEPS[step].toUpperCase()}
              </p>
            </div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
        {label}
      </Label>
      {children}
    </div>
  )
}

function NavigationButtons({
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel = 'NEXT',
}: {
  onBack: () => void
  onNext?: () => void
  nextDisabled?: boolean
  nextLabel?: string
}) {
  return (
    <div className="flex gap-2 mt-2">
      <Button
        variant="outline"
        onClick={onBack}
        className="font-mono text-xs gap-1 flex-1"
      >
        <ArrowLeft size={14} />
        BACK
      </Button>
      <Button
        onClick={onNext}
        disabled={nextDisabled || !onNext}
        className="font-mono text-xs gap-1 flex-1"
      >
        {nextLabel}
        <ArrowRight size={14} />
      </Button>
    </div>
  )
}

function WizardColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <Label className="font-mono text-[10px] text-muted-foreground w-24 flex-shrink-0 uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={oklchToHex(value)}
          onChange={(e) => onChange(hexToOklch(e.target.value))}
          className="w-8 h-8 rounded cursor-pointer border border-primary/20 bg-transparent"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs h-8 flex-1"
          placeholder="oklch(0.50 0.22 25)"
        />
      </div>
    </div>
  )
}
