/**
 * AdminDialogManager – renders all admin dialogs.
 *
 * Heavy dialogs are lazy-loaded so their code is only downloaded when an
 * admin actually opens them.  Each lazy component is wrapped in a Suspense
 * boundary with a CyberSpinner fallback.  A SectionErrorBoundary prevents a
 * broken dialog from taking down the rest of the app.
 */
import { lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import SectionErrorBoundary from '@/components/SectionErrorBoundary'
import CyberSpinner from '@/components/CyberSpinner'
import KeyManagerPanel from '@/components/KeyManagerPanel'
import type { AdminDialog, SoundSettings, ThemeSettings, SectionVisibility, NewsletterSettings, ContactSettings, SiteConfig, SectionConfig } from '@/lib/types'
import type { ActivationResult } from '@/lib/activation'
import type { WidgetPlugin } from '@/lib/types'

// ─── Lazy-loaded heavy admin components ──────────────────────────────────────

const StatsDashboard = lazy(() => import('@/components/StatsDashboard'))
const SecurityIncidentsDashboard = lazy(() => import('@/components/SecurityIncidentsDashboard'))
const SecuritySettingsDialog = lazy(() => import('@/components/SecuritySettingsDialog'))
const BlocklistManagerDialog = lazy(() => import('@/components/BlocklistManagerDialog'))
const AttackerProfileDialog = lazy(() => import('@/components/AttackerProfileDialog'))
const AttackerProfilesOverview = lazy(() => import('@/components/AttackerProfilesOverview'))
const StoreDialog = lazy(() => import('@/components/StoreDialog'))
const OAuthConnectionsDialog = lazy(() => import('@/components/OAuthConnectionsDialog'))
const ConfigEditorDialog = lazy(() => import('@/components/ConfigEditorDialog'))
const ThemeCustomizerDialog = lazy(() => import('@/components/ThemeCustomizerDialog'))
const TerminalSettingsDialog = lazy(() => import('@/components/TerminalSettingsDialog'))
const SoundSettingsDialog = lazy(() => import('@/components/SoundSettingsDialog'))
const ContactInboxDialog = lazy(() => import('@/components/ContactInboxDialog'))
const SubscriberListDialog = lazy(() => import('@/components/SubscriberListDialog'))
const MarketingToolsDialog = lazy(() => import('@/components/MarketingToolsDialog'))
const ContentView = lazy(() => import('@/features/admin/components/ContentView'))

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AdminDialogManagerProps {
  activeDialog: AdminDialog
  setActiveDialog: (dialog: AdminDialog) => void
  showAttackerProfile: boolean
  setShowAttackerProfile: (show: boolean) => void
  selectedAttackerIp: string
  setSelectedAttackerIp: (ip: string) => void
  isPrimary: boolean
  domain?: string
  // Config-related
  configOverrides: Record<string, unknown>
  onSaveConfigOverrides: (overrides: Record<string, unknown>) => void
  themeSettings?: ThemeSettings
  onSaveTheme: (themeSettings: ThemeSettings) => void
  sectionVisibility?: SectionVisibility
  onSaveSectionVisibility: (sectionVisibility: SectionVisibility) => void
  terminalCommands: Array<{ name: string; description: string; output: string[] }>
  secretCode?: string[]
  terminalMorseCode?: string
  defaultMorseCode: string
  onSaveTerminal: (commands: Array<{ name: string; description: string; output: string[] }>, secretCode: string[], morseCode: string) => void
  soundSettings?: SoundSettings
  onSaveSoundSettings: (soundSettings: SoundSettings) => void
  widgetPlugins: WidgetPlugin[]
  onUpdatePlugins: (widgetPlugins: WidgetPlugin[]) => void
  activePresetId?: string
  activationResult: ActivationResult | null
  newsletterSettings?: NewsletterSettings
  contactSettings?: ContactSettings
  onSaveNewsletter: (settings: NewsletterSettings) => void
  onSaveContact: (settings: ContactSettings) => void
  themeAccessOverrides?: Record<string, import('@/lib/types').ThemeLicenseStatus>
  onSaveThemeAccessOverrides?: (overrides: Record<string, import('@/lib/types').ThemeLicenseStatus>) => void
  siteConfig?: SiteConfig
  onUpdateSiteConfig?: (key: keyof SiteConfig, value: unknown) => void
  sections?: SectionConfig[]
  onSaveSections?: (sections: SectionConfig[]) => void
}

// ─── Suspense wrapper helper ──────────────────────────────────────────────────

function LazyBoundary({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <SectionErrorBoundary sectionName={name}>
      <Suspense fallback={<CyberSpinner />}>
        {children}
      </Suspense>
    </SectionErrorBoundary>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDialogManager({
  activeDialog,
  setActiveDialog,
  showAttackerProfile,
  setShowAttackerProfile,
  selectedAttackerIp,
  setSelectedAttackerIp,
  isPrimary,
  domain,
  configOverrides,
  onSaveConfigOverrides,
  themeSettings,
  onSaveTheme,
  sectionVisibility,
  onSaveSectionVisibility,
  terminalCommands,
  secretCode,
  terminalMorseCode,
  defaultMorseCode,
  onSaveTerminal,
  soundSettings,
  onSaveSoundSettings,
  widgetPlugins,
  onUpdatePlugins,
  activePresetId,
  activationResult,
  newsletterSettings,
  contactSettings,
  onSaveNewsletter,
  onSaveContact,
  themeAccessOverrides,
  onSaveThemeAccessOverrides,
  siteConfig,
  onUpdateSiteConfig,
  sections,
  onSaveSections,
}: AdminDialogManagerProps) {
  return (
    <>
      {/* Key Manager — only on primary deployment, no lazy needed (lightweight) */}
      {isPrimary && activeDialog === 'keys' && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4 pt-10">
          <div className="bg-card border border-border rounded-lg w-full max-w-xl p-6 relative">
            <button
              onClick={() => setActiveDialog(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              ✕
            </button>
            <KeyManagerPanel />
          </div>
        </div>
      )}

      <LazyBoundary name="StatsDashboard">
        <StatsDashboard
          open={activeDialog === 'analytics'}
          onClose={() => setActiveDialog(null)}
          domain={domain}
        />
      </LazyBoundary>

      <LazyBoundary name="SecurityIncidentsDashboard">
        <SecurityIncidentsDashboard
          open={activeDialog === 'security-log'}
          onClose={() => setActiveDialog(null)}
          onViewProfile={(hashedIp) => {
            setSelectedAttackerIp(hashedIp)
            setShowAttackerProfile(true)
          }}
        />
      </LazyBoundary>

      <LazyBoundary name="SecuritySettingsDialog">
        <SecuritySettingsDialog
          open={activeDialog === 'security-settings'}
          onClose={() => setActiveDialog(null)}
        />
      </LazyBoundary>

      <LazyBoundary name="BlocklistManagerDialog">
        <BlocklistManagerDialog
          open={activeDialog === 'blocklist'}
          onClose={() => setActiveDialog(null)}
        />
      </LazyBoundary>

      <LazyBoundary name="AttackerProfileDialog">
        <AttackerProfileDialog
          open={showAttackerProfile}
          onClose={() => setShowAttackerProfile(false)}
          hashedIp={selectedAttackerIp}
        />
      </LazyBoundary>

      <LazyBoundary name="AttackerProfilesOverview">
        <AttackerProfilesOverview
          open={activeDialog === 'attacker-profiles'}
          onClose={() => setActiveDialog(null)}
          onViewProfile={(hashedIp) => {
            setSelectedAttackerIp(hashedIp)
            setShowAttackerProfile(true)
          }}
        />
      </LazyBoundary>

      <LazyBoundary name="ContactInboxDialog">
        <ContactInboxDialog
          open={activeDialog === 'inbox'}
          onClose={() => setActiveDialog(null)}
        />
      </LazyBoundary>

      <LazyBoundary name="SubscriberListDialog">
        <SubscriberListDialog
          open={activeDialog === 'subscribers'}
          onClose={() => setActiveDialog(null)}
        />
      </LazyBoundary>

      <LazyBoundary name="MarketingToolsDialog">
        <MarketingToolsDialog
          open={activeDialog === 'marketing'}
          onClose={() => setActiveDialog(null)}
          newsletterSettings={newsletterSettings}
          contactSettings={contactSettings}
          onSaveNewsletter={onSaveNewsletter}
          onSaveContact={onSaveContact}
        />
      </LazyBoundary>

      <LazyBoundary name="OAuthConnectionsDialog">
        <OAuthConnectionsDialog
          open={activeDialog === 'oauth'}
          onClose={() => setActiveDialog(null)}
        />
      </LazyBoundary>

      <LazyBoundary name="StoreDialog">
        <StoreDialog
          open={activeDialog === 'store'}
          onClose={() => setActiveDialog(null)}
          widgetPlugins={widgetPlugins}
          onUpdatePlugins={onUpdatePlugins}
          activePresetId={activePresetId}
          onApplyTheme={(ts: ThemeSettings) => onSaveTheme(ts)}
          licenseTier={activationResult?.tier}
        />
      </LazyBoundary>

      <LazyBoundary name="SoundSettingsDialog">
        <AnimatePresence>
          {activeDialog === 'sound' && (
            <SoundSettingsDialog
              settings={soundSettings}
              onSave={(ss: SoundSettings) => onSaveSoundSettings(ss)}
              onClose={() => setActiveDialog(null)}
            />
          )}
        </AnimatePresence>
      </LazyBoundary>

      <LazyBoundary name="ConfigEditorDialog">
        <ConfigEditorDialog
          open={activeDialog === 'config'}
          onClose={() => setActiveDialog(null)}
          overrides={configOverrides}
          onSave={onSaveConfigOverrides}
        />
      </LazyBoundary>

      <LazyBoundary name="ThemeCustomizerDialog">
        <ThemeCustomizerDialog
          open={activeDialog === 'design'}
          onClose={() => setActiveDialog(null)}
          themeSettings={themeSettings}
          onSaveTheme={onSaveTheme}
          sectionVisibility={sectionVisibility}
          onSaveSectionVisibility={onSaveSectionVisibility}
          isPrimary={isPrimary}
          themeAccessOverrides={themeAccessOverrides}
          onSaveThemeAccessOverrides={onSaveThemeAccessOverrides}
          sections={sections}
          onSaveSections={onSaveSections}
        />
      </LazyBoundary>

      <LazyBoundary name="ContentView">
        {siteConfig && onUpdateSiteConfig && (
          <ContentView
            open={activeDialog === 'content'}
            onClose={() => setActiveDialog(null)}
            siteConfig={siteConfig}
            onUpdate={onUpdateSiteConfig}
          />
        )}
      </LazyBoundary>

      <LazyBoundary name="TerminalSettingsDialog">
        <TerminalSettingsDialog
          open={activeDialog === 'terminal'}
          onClose={() => setActiveDialog(null)}
          commands={terminalCommands}
          secretCode={secretCode || []}
          morseCode={terminalMorseCode || defaultMorseCode}
          onSave={onSaveTerminal}
        />
      </LazyBoundary>
    </>
  )
}
