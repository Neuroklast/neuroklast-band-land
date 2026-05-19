/**
 * @file use-setup-wizard.ts
 *
 * Custom hook encapsulating all state and business logic for the Setup Wizard.
 *
 * WHY a dedicated hook: SetupWizard.tsx previously mixed ~350 lines of state
 * management, side-effects, and async operations directly with ~750 lines of
 * JSX. This violates the Single Responsibility Principle (ISO/IEC 25010 –
 * Maintainability). Extracting the logic here makes it independently testable
 * and keeps the UI component "dumb" (pure presentation layer).
 *
 * Architecture Decision: see .github/ARCHITECTURE.md → ADR-001.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { THEME_CATALOG } from '@/lib/theme-registry'
import { applyThemeDefaults, applyThemeToDOM } from '@/lib/theme-application'
import { buildDefaultSections } from '@/lib/sections'
import { generateMetaTags, applyMetaTags } from '@/lib/meta-tags'
import { createSiteConfig } from '@/lib/site-config'
import { fetchEnvStatus, type EnvStatus } from '@/lib/env-check'
import { saveLocalActivationKey, getLocalActivationKey } from '@/hooks/use-activation-key'
import { isPrimaryInstance } from '@/lib/primary-check'
import {
  FONT_OPTIONS,
  getWizardSteps,
  type SocialLinksState,
} from '@/lib/setup-wizard-constants'
import type { SiteConfig, SectionConfig } from '@/lib/types'

// ─── Environment ──────────────────────────────────────────────────────────────

const NEXT_PUBLIC_ACTIVATION_KEY = process.env.NEXT_PUBLIC_ACTIVATION_KEY as string | undefined

/**
 * SECURITY: Hostname-based check prevents environment-variable spoofing.
 * See `isPrimaryInstance` for details.
 */
const IS_PRIMARY = isPrimaryInstance()

const VALIDATE_URL =
  (process.env.NEXT_PUBLIC_ACTIVATION_API_URL as string | undefined) ||
  'https://neuroklast-band-land.vercel.app/api/validate-key'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns `true` when the wizard must show the activation-key gate step.
 *
 * The gate is skipped for the primary (official) Neuroklast instance and for
 * deployments that embed the key via `NEXT_PUBLIC_ACTIVATION_KEY` at build time.
 */
export function needsActivationStep(): boolean {
  if (IS_PRIMARY) return false
  if (NEXT_PUBLIC_ACTIVATION_KEY?.trim()) return false
  if (getLocalActivationKey()?.trim()) return false
  return true
}

/**
 * Converts Google Drive share URLs to direct preview URLs so the logo
 * `<img>` tag can actually render them.
 *
 * @param url - Raw URL from the logo URL field.
 * @returns A direct-download URL for Drive paths; the original URL otherwise.
 */
export function toPreviewUrl(url: string): string {
  const driveMatch = url.match(/\/file\/d\/([^/]+)/)
  if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`
  return url
}

/** Set of Google Font family labels already injected into the document. */
const loadedFonts = new Set<string>()

/**
 * Lazily injects a `<link>` tag for a single Google Font.
 * Idempotent — subsequent calls for the same label are no-ops.
 *
 * @param fontLabel - Human-readable font name (e.g. `"Orbitron"`).
 */
export function loadGoogleFont(fontLabel: string): void {
  if (loadedFonts.has(fontLabel)) return
  loadedFonts.add(fontLabel)
  const family = fontLabel.replace(/ /g, '+')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;700&display=swap`
  document.head.appendChild(link)
}

/** Eagerly pre-loads every Google-hosted font from `FONT_OPTIONS`. */
export function loadAllGoogleFonts(): void {
  FONT_OPTIONS.filter((f) => f.google).forEach((f) => loadGoogleFont(f.label))
}

// ─── Hook props ───────────────────────────────────────────────────────────────

export interface UseSetupWizardProps {
  /** Called with the final `SiteConfig` when setup completes. */
  onComplete: (config: Partial<SiteConfig>) => void
  /** Called with the plaintext admin password so the parent can hash/store it. */
  onSetAdminPassword: (password: string) => Promise<void>
  /** Optional pre-filled values (e.g. during a re-setup flow). */
  initialConfig?: Partial<SiteConfig>
}

// ─── Hook return type ─────────────────────────────────────────────────────────

/** All state values exposed by the hook. */
export interface SetupWizardState {
  step: number
  direction: number
  showActivation: boolean
  steps: string[]

  // Activation key
  activationKeyInput: string
  activationValidating: boolean
  activationError: string
  activationValid: boolean

  // Site info
  siteType: SiteConfig['siteType']
  siteName: string
  tagline: string
  description: string
  genresInput: string
  domain: string

  // Design
  selectedPreset: string
  fontHeading: string
  fontBody: string
  fontMono: string
  colorPrimary: string
  colorAccent: string
  colorBackground: string
  colorForeground: string

  // Assets
  logoUrl: string
  ogImage: string
  favicon: string
  logoInputRef: React.RefObject<HTMLInputElement | null>

  // Content
  sections: SectionConfig[]
  sectionLabels: Record<string, string>
  socialLinks: SocialLinksState

  // Legal
  impressumName: string
  impressumStreet: string
  impressumZipCity: string
  impressumEmail: string
  datenschutzText: string

  // Admin
  adminPassword: string
  adminPasswordConfirm: string
  showPassword: boolean
  passwordError: string

  // Environment
  envStatus: EnvStatus | null
  envLoading: boolean
}

/** All action handlers exposed by the hook. */
export interface SetupWizardActions {
  goNext: () => void
  goBack: () => void

  setActivationKeyInput: (v: string) => void
  setActivationError: (v: string) => void
  handleActivationSubmit: () => Promise<void>

  setSiteType: (v: SiteConfig['siteType']) => void
  setSiteName: (v: string) => void
  setTagline: (v: string) => void
  setDescription: (v: string) => void
  setGenresInput: (v: string) => void
  setDomain: (v: string) => void

  applyPreset: (themeId: string) => void
  setFontHeading: (v: string) => void
  setFontBody: (v: string) => void
  setFontMono: (v: string) => void
  setColorPrimary: (v: string) => void
  setColorAccent: (v: string) => void
  setColorBackground: (v: string) => void
  setColorForeground: (v: string) => void

  setLogoUrl: (v: string) => void
  setOgImage: (v: string) => void
  setFavicon: (v: string) => void
  handleLogoFile: (file: File) => void

  setSections: React.Dispatch<React.SetStateAction<SectionConfig[]>>
  setSectionLabels: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setSocialLinks: React.Dispatch<React.SetStateAction<SocialLinksState>>

  setImpressumName: (v: string) => void
  setImpressumStreet: (v: string) => void
  setImpressumZipCity: (v: string) => void
  setImpressumEmail: (v: string) => void
  setDatenschutzText: (v: string) => void

  setAdminPassword: (v: string) => void
  setAdminPasswordConfirm: (v: string) => void
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  setPasswordError: (v: string) => void
  handlePasswordNext: () => Promise<void>
}

/** Combined return value: spread-destructure to access state and actions. */
export type UseSetupWizardReturn = SetupWizardState & SetupWizardActions

// ─── Hook implementation ──────────────────────────────────────────────────────

/**
 * Manages all Setup Wizard state and business logic.
 *
 * Usage:
 * ```tsx
 * const wizard = useSetupWizard({ onComplete, onSetAdminPassword, initialConfig })
 * // wizard.step, wizard.siteName, wizard.goNext(), …
 * ```
 *
 * @param props - See `UseSetupWizardProps`.
 * @returns Flat object containing every state value and action handler.
 */
export function useSetupWizard({
  onComplete,
  onSetAdminPassword,
  initialConfig,
}: UseSetupWizardProps): UseSetupWizardReturn {
  const [showActivation] = useState(() => needsActivationStep())
  const steps = getWizardSteps(showActivation)

  // ── Navigation ──────────────────────────────────────────────────────────────

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)

  const goNext = useCallback(() => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }, [steps.length])

  const goBack = useCallback(() => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  // ── Activation key ──────────────────────────────────────────────────────────

  const [activationKeyInput, setActivationKeyInput] = useState('')
  const [activationValidating, setActivationValidating] = useState(false)
  const [activationError, setActivationError] = useState('')
  const [activationValid, setActivationValid] = useState(false)

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
      const data = await res.json() as { valid?: boolean }
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

  // ── Site info ───────────────────────────────────────────────────────────────

  const [siteType, setSiteType] = useState<SiteConfig['siteType']>(initialConfig?.siteType ?? 'band')
  const [siteName, setSiteName] = useState(initialConfig?.siteName ?? '')
  const [tagline, setTagline] = useState(initialConfig?.tagline ?? '')
  const [description, setDescription] = useState(initialConfig?.description ?? '')
  const [genresInput, setGenresInput] = useState((initialConfig?.genres ?? []).join(', '))
  const [domain, setDomain] = useState(initialConfig?.domain ?? '')

  // ── Design ──────────────────────────────────────────────────────────────────

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
  const [colorPrimary, setColorPrimary] = useState(initialConfig?.themeSettings?.primary ?? 'oklch(0.50 0.22 25)')
  const [colorAccent, setColorAccent] = useState(initialConfig?.themeSettings?.accent ?? 'oklch(0.60 0.24 25)')
  const [colorBackground, setColorBackground] = useState(initialConfig?.themeSettings?.background ?? 'oklch(0 0 0)')
  const [colorForeground, setColorForeground] = useState(initialConfig?.themeSettings?.foreground ?? 'oklch(0.95 0 0)')

  /**
   * Applies a theme preset to the DOM preview and updates all related state.
   * Uses `applyThemeDefaults` to prevent stale colours from the previous
   * preset bleeding through.
   */
  const applyPreset = useCallback((themeId: string) => {
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
  }, [])

  // ── Assets ──────────────────────────────────────────────────────────────────

  const [logoUrl, setLogoUrl] = useState(initialConfig?.logoUrl ?? '')
  const [ogImage, setOgImage] = useState(initialConfig?.seo?.ogImage ?? '')
  const [favicon, setFavicon] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleLogoFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') setLogoUrl(result)
    }
    reader.readAsDataURL(file)
  }, [])

  // ── Sections ─────────────────────────────────────────────────────────────────

  const [sections, setSections] = useState<SectionConfig[]>(
    initialConfig?.sections ?? buildDefaultSections(),
  )
  const [sectionLabels, setSectionLabels] = useState<Record<string, string>>(() => {
    const labels = initialConfig?.sectionLabels ?? {}
    const defaultSecs = initialConfig?.sections ?? buildDefaultSections()
    const result: Record<string, string> = {}
    for (const sec of defaultSecs) {
      result[sec.id] = (labels as Record<string, string>)[sec.id] ?? ''
    }
    return result
  })

  // ── Social links ─────────────────────────────────────────────────────────────

  const [socialLinks, setSocialLinks] = useState<SocialLinksState>({
    instagram: initialConfig?.socialLinks?.instagram ?? '',
    spotify: initialConfig?.socialLinks?.spotify ?? '',
    soundcloud: initialConfig?.socialLinks?.soundcloud ?? '',
    bandcamp: initialConfig?.socialLinks?.bandcamp ?? '',
    youtube: initialConfig?.socialLinks?.youtube ?? '',
    facebook: initialConfig?.socialLinks?.facebook ?? '',
    tiktok: initialConfig?.socialLinks?.tiktok ?? '',
    twitter: initialConfig?.socialLinks?.twitter ?? '',
  })

  // ── Legal ────────────────────────────────────────────────────────────────────

  const [impressumName, setImpressumName] = useState(initialConfig?.impressum?.name ?? '')
  const [impressumStreet, setImpressumStreet] = useState(initialConfig?.impressum?.street ?? '')
  const [impressumZipCity, setImpressumZipCity] = useState(initialConfig?.impressum?.zipCity ?? '')
  const [impressumEmail, setImpressumEmail] = useState(initialConfig?.impressum?.email ?? '')
  const [datenschutzText, setDatenschutzText] = useState(initialConfig?.datenschutz?.customText ?? '')

  // ── Admin password ───────────────────────────────────────────────────────────

  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // ── ENV variable status ───────────────────────────────────────────────────────

  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)
  const [envLoading, setEnvLoading] = useState(true)

  useEffect(() => {
    fetchEnvStatus().then((status) => {
      setEnvStatus(status)
      setEnvLoading(false)
    })
  }, [])

  // ── Final submit ─────────────────────────────────────────────────────────────

  const handleFinish = useCallback(async () => {
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
      seo: { ogImage: ogImage || undefined },
      sections,
      sectionLabels: Object.keys(cleanLabels).length > 0 ? cleanLabels as SiteConfig['sectionLabels'] : undefined,
      socialLinks: Object.fromEntries(Object.entries(socialLinks).filter(([, v]) => v)),
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

  /**
   * Validates the admin-password form fields and triggers `handleFinish`.
   * Inline validation keeps error messages in sync with the form without
   * needing an external validation library.
   */
  const handlePasswordNext = useCallback(async () => {
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
  }, [adminPassword, adminPasswordConfirm, handleFinish])

  // ─────────────────────────────────────────────────────────────────────────────

  return {
    // Navigation
    step,
    direction,
    showActivation,
    steps,
    goNext,
    goBack,

    // Activation
    activationKeyInput,
    activationValidating,
    activationError,
    activationValid,
    setActivationKeyInput,
    setActivationError,
    handleActivationSubmit,

    // Site info
    siteType,
    siteName,
    tagline,
    description,
    genresInput,
    domain,
    setSiteType,
    setSiteName,
    setTagline,
    setDescription,
    setGenresInput,
    setDomain,

    // Design
    selectedPreset,
    fontHeading,
    fontBody,
    fontMono,
    colorPrimary,
    colorAccent,
    colorBackground,
    colorForeground,
    applyPreset,
    setFontHeading,
    setFontBody,
    setFontMono,
    setColorPrimary,
    setColorAccent,
    setColorBackground,
    setColorForeground,

    // Assets
    logoUrl,
    ogImage,
    favicon,
    logoInputRef,
    setLogoUrl,
    setOgImage,
    setFavicon,
    handleLogoFile,

    // Content
    sections,
    sectionLabels,
    socialLinks,
    setSections,
    setSectionLabels,
    setSocialLinks,

    // Legal
    impressumName,
    impressumStreet,
    impressumZipCity,
    impressumEmail,
    datenschutzText,
    setImpressumName,
    setImpressumStreet,
    setImpressumZipCity,
    setImpressumEmail,
    setDatenschutzText,

    // Admin
    adminPassword,
    adminPasswordConfirm,
    showPassword,
    passwordError,
    setAdminPassword,
    setAdminPasswordConfirm,
    setShowPassword,
    setPasswordError,
    handlePasswordNext,

    // Environment
    envStatus,
    envLoading,
  }
}
