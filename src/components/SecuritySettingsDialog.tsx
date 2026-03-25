/**
 * @file SecuritySettingsDialog.tsx
 *
 * Thin orchestration layer for the Security Settings admin dialog.
 *
 * WHY this refactoring: The original file was 1 155 lines mixing type
 * definitions, constants, primitive UI components, tab panels, and a 843-line
 * main component — violating the Single Responsibility Principle and making
 * independent testing impossible.
 *
 * After the refactoring each concern lives in its own module:
 *   - Types & defaults   → src/lib/security-settings-types.ts
 *   - API fetch/save     → src/hooks/use-security-settings.ts
 *   - Toggle/Slider/Text → src/components/security-settings/SecuritySettingsPrimitives.tsx
 *   - Tab panels         → src/components/security-settings/tabs/
 *
 * This file is now purely presentational: dialog chrome + tab routing.
 * It delegates ALL state and data access to `useSecuritySettings`.
 *
 * Architecture Decision: see .github/ARCHITECTURE.md → ADR-004.
 *
 * @backward-compat `SecuritySettings` and `DEFAULT_SETTINGS` are re-exported
 * here so existing test files that import from this path continue to work
 * without modification.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck } from '@phosphor-icons/react'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import CyberCloseButton from '@/components/CyberCloseButton'
import { useLocale } from '@/hooks/use-locale'
import { t } from '@/lib/i18n-security'
import {
  useSecuritySettings,
  TOTAL_MODULES,
  SECURITY_LEVEL_HIGH_THRESHOLD,
  SECURITY_LEVEL_MEDIUM_THRESHOLD,
} from '@/hooks/use-security-settings'
import { ModulesTab } from '@/components/security-settings/tabs/ModulesTab'
import { ParametersTab } from '@/components/security-settings/tabs/ParametersTab'
import { RulesTab } from '@/components/security-settings/tabs/RulesTab'
import {
  CountermeasuresTab,
  DetectionPanels,
  SettingsActionBar,
  SettingsFooter,
} from '@/components/security-settings/tabs/CountermeasuresTab'

// ─── Re-exports for backward compatibility ────────────────────────────────────
// Tests in src/test/ import these names from this path. Keeping the re-exports
// avoids churn in test files while the canonical definitions live in the types
// module (per SRP).
export type { SecuritySettings } from '@/lib/security-settings-types'
export { DEFAULT_SECURITY_SETTINGS as DEFAULT_SETTINGS } from '@/lib/security-settings-types'

// ─── Tab types ────────────────────────────────────────────────────────────────

type TabKey = 'modules' | 'parameters' | 'rules' | 'countermeasures'

// ─── Dialog props ─────────────────────────────────────────────────────────────

interface SecuritySettingsDialogProps {
  open: boolean
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Modal dialog for configuring server-side security settings.
 *
 * All data is fetched from and persisted to `/api/security-settings` via the
 * `useSecuritySettings` hook — no security logic runs in the browser.
 */
export default function SecuritySettingsDialog({ open, onClose }: SecuritySettingsDialogProps) {
  const { locale } = useLocale()
  const L = (key: string) => t(key, locale)

  const {
    settings,
    loading,
    saving,
    error,
    activeModules,
    update,
    handleSave,
    handleReset,
    handleExportJson,
  } = useSecuritySettings(open)

  const [activeTab, setActiveTab] = useState<TabKey>('modules')

  const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
    { key: 'modules', label: L('settings.tabModules') },
    { key: 'parameters', label: L('settings.tabParameters') },
    { key: 'rules', label: L('settings.tabRules') },
    { key: 'countermeasures', label: L('settings.tabCountermeasures') },
  ]

  const securityLevel =
    activeModules >= SECURITY_LEVEL_HIGH_THRESHOLD
      ? L('settings.high')
      : activeModules >= SECURITY_LEVEL_MEDIUM_THRESHOLD
        ? L('settings.medium')
        : L('settings.low')

  const levelDotClass =
    activeModules >= SECURITY_LEVEL_HIGH_THRESHOLD
      ? 'bg-status-success-em'
      : activeModules >= SECURITY_LEVEL_MEDIUM_THRESHOLD
        ? 'bg-status-warning-em'
        : 'bg-status-error-em'

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
          <CyberCloseButton onClick={onClose} label={L('sec.close')} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
              <span className="ml-3 font-mono text-[11px] text-primary/50">{L('settings.loading')}</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="border border-status-error-em/30 bg-status-error-em/10 p-4 text-center">
              <p className="font-mono text-[12px] text-status-error">{L('sec.failedToLoad')}: {error}</p>
            </div>
          )}

          {/* Main content — shown once loaded with no error */}
          {!loading && !error && (
            <>
              {/* Security level indicator */}
              <div className="border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${levelDotClass} animate-pulse`} />
                  <div>
                    <p className="font-mono text-[12px] text-foreground/85 uppercase">
                      {L('settings.securityLevel')}: {securityLevel}
                    </p>
                    <p className="font-mono text-[10px] text-primary/50 mt-0.5">
                      {activeModules}/{TOTAL_MODULES} {L('settings.defenseModulesActive')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(TOTAL_MODULES)].map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-4 ${index < activeModules ? 'bg-primary/60' : 'bg-primary/10'}`}
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
                {TABS.map((tab) => (
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

              {/* Tab panels */}
              {activeTab === 'modules' && (
                <ModulesTab settings={settings} update={update} locale={locale} />
              )}
              {activeTab === 'parameters' && (
                <ParametersTab settings={settings} update={update} locale={locale} />
              )}
              {activeTab === 'rules' && (
                <RulesTab settings={settings} update={update} locale={locale} />
              )}
              {activeTab === 'countermeasures' && (
                <CountermeasuresTab settings={settings} update={update} locale={locale} />
              )}

              {/* Always-visible detection panels */}
              <DetectionPanels settings={settings} update={update} locale={locale} />

              {/* Action bar */}
              <SettingsActionBar
                saving={saving}
                onSave={handleSave}
                onExport={handleExportJson}
                onReset={handleReset}
                locale={locale}
              />

              {/* Footer */}
              <SettingsFooter locale={locale} />
            </>
          )}
        </div>
      </motion.div>
    </CyberModalBackdrop>
  )
}
