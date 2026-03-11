import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { X, ArrowCounterClockwise, Export, ArrowSquareIn, FloppyDisk } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ThemeSettings, SectionVisibility, SectionConfig } from '@/lib/types'
import { THEME_CATALOG, getTheme } from '@/lib/theme-registry'
import ThemeLicenseDialog from '@/components/ThemeLicenseDialog'
import { applyThemeToDOM, resetThemeDOM, loadAllGoogleFonts } from '@/lib/theme-application'
import { useLocale } from '@/hooks/use-locale'
import { useThemeCustomizer } from '@/hooks/use-theme-customizer'
import ThemeCustomizerColorPanel from '@/components/ThemeCustomizerColorPanel'
import ThemeCustomizerTypographyPanel from '@/components/ThemeCustomizerTypographyPanel'
import ThemeCustomizerEffectsPanel from '@/components/ThemeCustomizerEffectsPanel'
import ThemeCustomizerSectionsPanel from '@/components/ThemeCustomizerSectionsPanel'
import ThemeCustomizerThemePanel from '@/components/ThemeCustomizerThemePanel'
import ThemeCustomizerTextsPanel from '@/components/ThemeCustomizerTextsPanel'

// eslint-disable-next-line react-refresh/only-export-components
export { applyThemeToDOM, resetThemeDOM }

export interface ThemeCustomizerDialogProps {
  open: boolean
  onClose: () => void
  themeSettings: ThemeSettings | undefined
  onSaveTheme: (theme: ThemeSettings) => void
  sectionVisibility: SectionVisibility | undefined
  onSaveSectionVisibility: (vis: SectionVisibility) => void
  isPrimary?: boolean
  themeAccessOverrides?: Record<string, import('@/lib/types').ThemeLicenseStatus>
  onSaveThemeAccessOverrides?: (overrides: Record<string, import('@/lib/types').ThemeLicenseStatus>) => void
  sections?: SectionConfig[]
  onSaveSections?: (sections: SectionConfig[]) => void
}

export default function ThemeCustomizerDialog({
  open, onClose, themeSettings, onSaveTheme, sectionVisibility,
  onSaveSectionVisibility, isPrimary, themeAccessOverrides,
  onSaveThemeAccessOverrides, sections, onSaveSections,
}: ThemeCustomizerDialogProps) {
  const { t } = useLocale()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [licenseDialog, setLicenseDialog] = useState<{ themeId: string; themeName: string; licenseKeyPrefix?: string } | null>(null)

  const {
    previewConfig, visDraft, layoutDraft, hasEdits,
    unlockedThemeIds, setUnlockedThemeIds,
    patch, handleThemeSelect, handleResetToThemeDefaults,
    handleSave, handleReset, handleExportTheme, handleImportTheme,
    toggleVisibility, updateThemeSettings, updateLayoutDraft,
  } = useThemeCustomizer({
    open, themeSettings, sectionVisibility, sections,
    onSaveTheme, onSaveSectionVisibility, onSaveSections, onClose,
  })

  const activeThemePkg = previewConfig.theme ? getTheme(previewConfig.theme) : undefined
  const activeThemeName = THEME_CATALOG.find(td => td.id === previewConfig.theme)?.name

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-sm flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="w-full sm:max-w-2xl bg-card sm:border sm:border-primary/30 sm:rounded-lg flex flex-col max-h-screen sm:max-h-[90vh]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                  <span className="font-mono text-xs text-primary/70 tracking-wider uppercase">{t('themeCustomizer.title')}</span>
                  {activeThemeName && (
                    <span className="font-mono text-[9px] text-primary bg-primary/15 px-2 py-0.5 rounded truncate">{activeThemeName}</span>
                  )}
                  {hasEdits && (
                    <Badge variant="outline" className="text-[9px] font-mono border-primary/50 text-primary px-1.5 h-4 flex-shrink-0">
                      UNSAVED
                    </Badge>
                  )}
                </div>
                <button onClick={onClose} className="text-primary/60 hover:text-primary p-1 flex-shrink-0 ml-2">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <ThemeCustomizerThemePanel
                    activeTheme={previewConfig.theme}
                    isPrimary={isPrimary}
                    themeAccessOverrides={themeAccessOverrides}
                    unlockedThemeIds={unlockedThemeIds}
                    onThemeSelect={handleThemeSelect}
                    onLicenseRequired={(id, name, prefix) => setLicenseDialog({ themeId: id, themeName: name, licenseKeyPrefix: prefix })}
                    onSaveThemeAccessOverrides={onSaveThemeAccessOverrides}
                  />
                </div>

                <div className="px-4 pb-4">
                  <Tabs defaultValue="colors" onValueChange={v => { if (v === 'typography') loadAllGoogleFonts() }}>
                    <TabsList className="w-full grid grid-cols-5 bg-muted/50">
                      <TabsTrigger value="colors" className="font-mono text-[10px] sm:text-xs">🎨 Colors</TabsTrigger>
                      <TabsTrigger value="typography" className="font-mono text-[10px] sm:text-xs">🔤 Fonts</TabsTrigger>
                      <TabsTrigger value="effects" className="font-mono text-[10px] sm:text-xs">✨ Effects</TabsTrigger>
                      <TabsTrigger value="texts" className="font-mono text-[10px] sm:text-xs">📝 Texts</TabsTrigger>
                      <TabsTrigger value="layout" className="font-mono text-[10px] sm:text-xs">📐 Layout</TabsTrigger>
                    </TabsList>
                    <div className="mt-4">
                      <TabsContent value="colors">
                        <ThemeCustomizerColorPanel
                          themeSettings={previewConfig.themeSettings}
                          activeTheme={previewConfig.theme}
                          onPatch={patch}
                          onResetToThemeDefaults={handleResetToThemeDefaults}
                        />
                      </TabsContent>
                      <TabsContent value="typography">
                        <ThemeCustomizerTypographyPanel
                          themeSettings={previewConfig.themeSettings}
                          activeTheme={previewConfig.theme}
                          activeThemePkg={activeThemePkg}
                          onPatch={patch}
                          onResetToThemeDefaults={handleResetToThemeDefaults}
                        />
                      </TabsContent>
                      <TabsContent value="effects">
                        <ThemeCustomizerEffectsPanel
                          themeSettings={previewConfig.themeSettings}
                          activeTheme={previewConfig.theme}
                          activeThemePkg={activeThemePkg}
                          onUpdate={updateThemeSettings}
                        />
                      </TabsContent>
                      <TabsContent value="texts">
                        <ThemeCustomizerTextsPanel
                          themeSettings={previewConfig.themeSettings}
                          onPatchTheme={patch}
                        />
                      </TabsContent>
                      <TabsContent value="layout">
                        <ThemeCustomizerSectionsPanel
                          themeSettings={previewConfig.themeSettings}
                          onPatchTheme={patch}
                          visDraft={visDraft}
                          onToggleVisibility={toggleVisibility}
                          layoutDraft={layoutDraft}
                          onUpdateLayout={updateLayoutDraft}
                          activeThemePkg={activeThemePkg}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>

              <div className="flex-shrink-0 border-t border-primary/20 px-4 py-3 flex flex-wrap gap-2 justify-between items-center bg-card">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportTheme} className="gap-1 text-xs border-primary/30">
                    <Export size={14} /> {t('common.export')}
                  </Button>
                  <label>
                    <input type="file" accept=".json,application/json" className="hidden" ref={fileInputRef} onChange={handleImportTheme} />
                    <Button variant="outline" size="sm" asChild className="gap-1 text-xs border-primary/30 cursor-pointer">
                      <span><ArrowSquareIn size={14} /> {t('common.import')}</span>
                    </Button>
                  </label>
                  <Button variant="outline" size="sm" onClick={handleReset} className="gap-1 text-xs border-primary/30">
                    <ArrowCounterClockwise size={14} /> {t('common.reset')}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className={`gap-1 ${hasEdits ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
                  >
                    <FloppyDisk size={14} /> {t('themeCustomizer.saveTheme')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {licenseDialog && (
        <ThemeLicenseDialog
          open={!!licenseDialog}
          onClose={() => setLicenseDialog(null)}
          themeId={licenseDialog.themeId}
          themeName={licenseDialog.themeName}
          licenseKeyPrefix={licenseDialog.licenseKeyPrefix}
          onUnlocked={themeId => {
            setUnlockedThemeIds([...unlockedThemeIds, themeId])
            handleThemeSelect(themeId)
          }}
        />
      )}
    </>
  )
}
