import { useState, useEffect, useCallback, useRef, startTransition } from 'react'
import { toast } from 'sonner'
import type { ThemeSettings, SectionVisibility, SectionConfig } from '@/lib/types'
import { THEME_CATALOG } from '@/lib/theme-registry'
import { applyThemeToDocument, resetThemeDOM, applyThemeDefaults } from '@/lib/theme-application'
import { resolveSections, normalizeSections } from '@/lib/sections'
import { useKV } from '@/hooks/use-kv'

export interface PreviewConfig {
  theme: string
  themeSettings: ThemeSettings
}

interface UseThemeCustomizerOptions {
  open: boolean
  themeSettings: ThemeSettings | undefined
  sectionVisibility: SectionVisibility | undefined
  sections: SectionConfig[] | undefined
  onSaveTheme: (theme: ThemeSettings) => void
  onSaveSectionVisibility: (vis: SectionVisibility) => void
  onSaveSections: ((sections: SectionConfig[]) => void) | undefined
  onClose: () => void
}

export function useThemeCustomizer({
  open, themeSettings, sectionVisibility, sections,
  onSaveTheme, onSaveSectionVisibility, onSaveSections, onClose,
}: UseThemeCustomizerOptions) {
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>(() => ({
    theme: themeSettings?.activePreset || '',
    themeSettings: themeSettings || {},
  }))
  const [visDraft, setVisDraft] = useState<SectionVisibility>(sectionVisibility || {})
  const [layoutDraft, setLayoutDraft] = useState<SectionConfig[]>(() =>
    normalizeSections(resolveSections(sections ? { sections } : {}))
  )
  const [hasEdits, setHasEdits] = useState(false)
  const [unlockedThemeIds, setUnlockedThemeIds] = useKV<string[]>('unlocked-themes', [])
  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      startTransition(() => {
        setPreviewConfig({ theme: themeSettings?.activePreset || '', themeSettings: themeSettings || {} })
        setVisDraft(sectionVisibility || {})
        setLayoutDraft(normalizeSections(resolveSections(sections ? { sections } : {})))
        setHasEdits(false)
      })
    }
    prevOpenRef.current = open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (open) applyThemeToDocument(previewConfig.theme, previewConfig.themeSettings)
  }, [previewConfig, open])

  const patch = useCallback((p: Partial<ThemeSettings>) => {
    setPreviewConfig(prev => ({ ...prev, themeSettings: { ...prev.themeSettings, ...p } }))
    setHasEdits(true)
  }, [])

  const handleThemeSelect = useCallback((themeId: string) => {
    const themeDef = THEME_CATALOG.find(td => td.id === themeId)
    const structuralPatch: Partial<ThemeSettings> = {}
    if (themeDef?.theme.heroStyle) structuralPatch.heroStyle = themeDef.theme.heroStyle
    if (themeDef?.theme.loadingScreenType) structuralPatch.loadingScreenType = themeDef.theme.loadingScreenType
    setPreviewConfig(prev => ({ theme: themeId, themeSettings: { ...prev.themeSettings, ...structuralPatch } }))
    setHasEdits(true)
  }, [])

  const handleResetToThemeDefaults = useCallback(() => {
    if (!previewConfig.theme) return
    patch(applyThemeDefaults(previewConfig.theme))
    toast.success('Reset to theme defaults')
  }, [previewConfig.theme, patch])

  const handleSave = useCallback(() => {
    onSaveTheme({ ...previewConfig.themeSettings, activePreset: previewConfig.theme })
    onSaveSectionVisibility(visDraft)
    if (onSaveSections) onSaveSections(layoutDraft)
    toast.success('Theme saved')
    onClose()
  }, [previewConfig, visDraft, layoutDraft, onSaveTheme, onSaveSectionVisibility, onSaveSections, onClose])

  const handleReset = useCallback(() => {
    const firstTheme = THEME_CATALOG[0]
    if (firstTheme) {
      const defaults = applyThemeDefaults(firstTheme.id)
      setPreviewConfig({ theme: firstTheme.id, themeSettings: { ...defaults, activePreset: firstTheme.id } })
      resetThemeDOM()
      applyThemeToDocument(firstTheme.id, { ...defaults, activePreset: firstTheme.id })
    } else {
      setPreviewConfig({ theme: '', themeSettings: {} })
      resetThemeDOM()
    }
  }, [])

  const handleExportTheme = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ theme: previewConfig.theme, themeSettings: previewConfig.themeSettings, visibility: visDraft }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `theme-${(previewConfig.theme || 'custom').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Theme exported')
  }, [previewConfig, visDraft])

  const handleImportTheme = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (parsed.themeSettings && typeof parsed.theme === 'string') {
          setPreviewConfig({ theme: parsed.theme, themeSettings: parsed.themeSettings })
          if (parsed.visibility) setVisDraft(parsed.visibility)
          toast.success('Theme imported')
        } else if (parsed.theme && typeof parsed.theme === 'object') {
          const legacy: ThemeSettings = parsed.theme
          setPreviewConfig({ theme: legacy.activePreset || '', themeSettings: legacy })
          if (parsed.visibility) setVisDraft(parsed.visibility)
          toast.success('Theme imported')
        } else {
          toast.error('Invalid theme file')
        }
      } catch { toast.error('Failed to parse theme file') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const toggleVisibility = useCallback((key: keyof SectionVisibility) => {
    setVisDraft(prev => ({ ...prev, [key]: !(prev[key] !== false) }))
    setHasEdits(true)
  }, [])

  const updateThemeSettings = useCallback((ts: ThemeSettings) => {
    setPreviewConfig(prev => ({ ...prev, themeSettings: ts }))
    setHasEdits(true)
  }, [])

  const updateLayoutDraft = useCallback((s: SectionConfig[]) => {
    setLayoutDraft(s)
    setHasEdits(true)
  }, [])

  return {
    previewConfig,
    visDraft,
    layoutDraft,
    hasEdits,
    unlockedThemeIds: unlockedThemeIds ?? [],
    setUnlockedThemeIds,
    patch,
    handleThemeSelect,
    handleResetToThemeDefaults,
    handleSave,
    handleReset,
    handleExportTheme,
    handleImportTheme,
    toggleVisibility,
    updateThemeSettings,
    updateLayoutDraft,
  }
}
