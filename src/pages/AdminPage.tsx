/**
 * @file AdminPage.tsx
 *
 * Standalone admin panel rendered at the /admin route.
 *
 * This page:
 * 1. Checks authentication via `useAdminAuth`.
 * 2. Shows `AdminLoginDialog` when not logged in.
 * 3. Shows `AdminButton` (which opens AdminHubDialog) once logged in.
 * 4. Renders `AdminDialogManager` for all sub-dialogs.
 * 5. Reads / writes site config via `useSiteConfig` (same hook as the
 *    public band site — changes made here are reflected immediately there).
 */
import { lazy, Suspense } from 'react'
import { Toaster } from '@/components/ui/sonner'
import CyberSpinner from '@/components/CyberSpinner'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useSiteConfig } from '@/hooks/use-site-config'
import { useAdminDialogState } from '@/hooks/use-admin-dialog-state'
import { isPrimaryInstance } from '@/lib/primary-check'
import { createSiteConfig } from '@/lib/site-config'
import { DEFAULT_LABEL } from '@/lib/config'
import bandDataJson from '@/assets/documents/band-data.json'
import type { SoundSettings, ThemeSettings, SectionVisibility } from '@/lib/types'

const AdminButton = lazy(() => import('@/components/AdminButton'))
const AdminLoginDialog = lazy(() => import('@/components/AdminLoginDialog'))
const AdminDialogManager = lazy(() => import('@/components/AdminDialogManager'))

const defaultSiteConfig = createSiteConfig({
  siteName: bandDataJson.band.name,
  genres: bandDataJson.band.genres,
  label: bandDataJson.band.label || DEFAULT_LABEL,
  socialLinks: {},
  gigs: [],
  releases: [],
  biography: {
    story: bandDataJson.biography.story,
    founded: bandDataJson.biography.founded,
    members: bandDataJson.biography.members,
    achievements: bandDataJson.biography.achievements,
  },
})

/**
 * AdminPage — always shown when navigating to /admin.
 *
 * Relies on AdminRoute to redirect unauthenticated visitors to / after the
 * login flow completes, so this page can always assume it has been reached
 * intentionally.
 */
export default function AdminPage() {
  const {
    isOwner,
    needsSetup,
    totpEnabled,
    setupTokenRequired,
    handleAdminLogin,
    handleAdminLogout,
    handleSetAdminPassword,
    handleSetupAdminPassword,
    handleChangeAdminPassword,
  } = useAdminAuth()

  const { config, updateConfig, setConfig } = useSiteConfig()
  const data = config

  const {
    activeDialog, setActiveDialog,
    showLoginDialog, setShowLoginDialog,
    setShowSetupDialog: _setShowSetupDialog,
    showAttackerProfile, setShowAttackerProfile,
    selectedAttackerIp, setSelectedAttackerIp,
    openAdminHubOnMount,
  } = useAdminDialogState()

  const isPrimary = isPrimaryInstance()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />

      {/* Login dialogs — shown when the admin is not yet authenticated */}
      <Suspense fallback={null}>
        <AdminLoginDialog
          open={showLoginDialog || (!isOwner && !needsSetup)}
          onOpenChange={(open) => { if (!open) setShowLoginDialog(false) }}
          mode="login"
          totpEnabled={totpEnabled}
          onLogin={handleAdminLogin}
          onSetPassword={handleSetAdminPassword}
        />
        <AdminLoginDialog
          open={needsSetup}
          onOpenChange={(open) => { if (!open) setShowLoginDialog(false) }}
          mode="setup"
          setupTokenRequired={setupTokenRequired}
          onSetPassword={handleSetupAdminPassword}
        />
      </Suspense>

      {/* Admin button + hub — shown once authenticated */}
      {isOwner && (
        <Suspense fallback={<CyberSpinner />}>
          <div className="flex items-center justify-center min-h-screen">
            <AdminButton
              hasPassword={!needsSetup}
              onChangePassword={handleChangeAdminPassword}
              onSetPassword={handleSetAdminPassword}
              onLogout={handleAdminLogout}
              onResetSetup={() => {
                updateConfig({ setupComplete: false })
              }}
              siteConfig={data}
              onUpdateSiteConfig={(key, value) => updateConfig({ [key]: value })}
              onImportData={(imported) => setConfig(imported)}
              onOpenDialog={setActiveDialog}
              isPrimary={isPrimary}
              openHubOnMount={openAdminHubOnMount ?? true}
            />
          </div>

          <AdminDialogManager
            activeDialog={activeDialog}
            setActiveDialog={setActiveDialog}
            showAttackerProfile={showAttackerProfile}
            setShowAttackerProfile={setShowAttackerProfile}
            selectedAttackerIp={selectedAttackerIp}
            setSelectedAttackerIp={setSelectedAttackerIp}
            isPrimary={isPrimary}
            domain={data.domain}
            configOverrides={data.configOverrides || {}}
            onSaveConfigOverrides={(co) => updateConfig({ configOverrides: co })}
            themeSettings={data.themeSettings}
            onSaveTheme={(ts: ThemeSettings) => updateConfig({ themeSettings: ts })}
            sectionVisibility={data.sectionVisibility}
            onSaveSectionVisibility={(sv: SectionVisibility) => updateConfig({ sectionVisibility: sv })}
            terminalCommands={data.terminalCommands || []}
            secretCode={data.secretCode}
            terminalMorseCode={data.terminalMorseCode}
            defaultMorseCode={defaultSiteConfig.terminalMorseCode || '...'}
            onSaveTerminal={(tc, sc, mc) => updateConfig({
              terminalCommands: tc,
              secretCode: sc,
              terminalMorseCode: mc?.trim() || defaultSiteConfig.terminalMorseCode || '...',
            })}
            soundSettings={data.soundSettings}
            onSaveSoundSettings={(ss: SoundSettings) => updateConfig({ soundSettings: ss })}
            widgetPlugins={data.widgetPlugins ?? []}
            onUpdatePlugins={(wp) => updateConfig({ widgetPlugins: wp })}
            activePresetId={data.themeSettings?.activePreset}
            newsletterSettings={data.newsletterSettings}
            contactSettings={data.contactSettings}
            onSaveNewsletter={(ns) => updateConfig({ newsletterSettings: ns })}
            onSaveContact={(cs) => updateConfig({ contactSettings: cs })}
            themeAccessOverrides={data.themeAccessOverrides}
            onSaveThemeAccessOverrides={(tao) => updateConfig({ themeAccessOverrides: tao })}
            siteConfig={data}
            onUpdateSiteConfig={(key, value) => updateConfig({ [key]: value })}
            sections={data.sections}
            onSaveSections={(sections) => updateConfig({ sections })}
          />
        </Suspense>
      )}
    </div>
  )
}
