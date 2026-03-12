import { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Lightning,
  UploadSimple,
  DownloadSimple,
  Globe,
  GearSix,
  Palette,
  Sliders,
  Terminal,
  SpeakerHigh,
  ChartBar,
  ShieldWarning,
  ShieldCheck,
  Prohibit,
  UserCircle,
  EnvelopeSimple,
  UsersThree,
  MegaphoneSimple,
  LinkSimple,
  Key,
  Lock,
  ArrowCounterClockwise,
  SignOut,
  Article,
  Storefront,
  ClockClockwise,
  ChatCircleText,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { useLocale } from '@/hooks/use-locale'
import type { AdminDialog, SiteConfig } from '@/lib/types'

interface HubItemData {
  icon: Icon
  label: string
  description?: string
  action: () => void
  disabled?: boolean
}

// Lazy load the underlying forms/modals to keep bundle lean
const ThemeCustomizerDialog = lazy(() => import('@/components/ThemeCustomizerDialog'))
const ContentForms = lazy(() => import('./ContentForms').then(m => ({ default: m.ContentForms })))

interface AdminHubDialogProps {
  open: boolean
  onClose: () => void
  onOpenDialog: (dialog: AdminDialog) => void
  onExportData: () => void
  onImportFile: () => void
  onImportUrl: () => void
  onChangePassword: () => void
  onLogout?: () => void
  onResetSetup?: () => void
  isPrimary?: boolean
  siteConfig?: SiteConfig
  onUpdateSiteConfig?: (key: keyof SiteConfig, value: unknown) => void
}

type TabKey = 'content' | 'design' | 'store' | 'communication' | 'analytics-logs' | 'security' | 'system'

export default function AdminHubDialog({
  open,
  onClose,
  onOpenDialog,
  onExportData,
  onImportFile,
  onImportUrl,
  onChangePassword,
  onLogout,
  onResetSetup,
  isPrimary = false,
  siteConfig,
  onUpdateSiteConfig,
}: AdminHubDialogProps) {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<TabKey>('content')
  // For the customizer we mount it when the design tab is active.
  const [showCustomizer, setShowCustomizer] = useState(false)

  const tabs: { id: TabKey; label: string; icon: Icon }[] = [
    { id: 'content', label: t('hub.content') || 'Content', icon: Article },
    { id: 'design', label: t('hub.appearance') || 'Design & Theme', icon: Palette },
    { id: 'store', label: t('hub.store') || 'Store & Apps', icon: Storefront },
    { id: 'communication', label: t('hub.communication') || 'Communication', icon: ChatCircleText },
    { id: 'analytics-logs', label: t('hub.analyticsLogs') || 'Analytics & Logs', icon: ChartBar },
    { id: 'security', label: t('hub.security') || 'Security', icon: ShieldCheck },
    { id: 'system', label: t('hub.system') || 'System', icon: GearSix },
  ]

  const storeItems: HubItemData[] = [
    {
      icon: Palette,
      label: t('hub.storeThemes') || 'Theme Store',
      description: t('hub.storeThemesDesc') || 'Install premium themes',
      action: () => { onClose(); onOpenDialog('store-themes') },
    },
    {
      icon: Sliders,
      label: t('hub.storeWidgets') || 'Widget Store',
      description: t('hub.storeWidgetsDesc') || 'Add new widgets to the site',
      action: () => { onClose(); onOpenDialog('store-widgets') },
    },
  ]

  const communicationItems: HubItemData[] = [
    {
      icon: EnvelopeSimple,
      label: t('hub.inbox') || 'Inbox',
      description: t('hub.inboxDesc') || 'Read and manage contact messages',
      action: () => { onClose(); onOpenDialog('inbox') },
    },
    {
      icon: UsersThree,
      label: t('hub.subscribers') || 'Subscribers',
      description: t('hub.subscribersDesc') || 'Manage newsletter subscribers',
      action: () => { onClose(); onOpenDialog('subscribers') },
    },
    {
      icon: MegaphoneSimple,
      label: t('hub.marketing') || 'Marketing Settings',
      description: t('hub.marketingDesc') || 'Newsletter and campaign settings',
      action: () => { onClose(); onOpenDialog('marketing') },
    },
  ]

  const analyticsItems: HubItemData[] = [
    {
      icon: ChartBar,
      label: t('hub.analytics') || 'Analytics Dashboard',
      description: t('hub.analyticsDesc') || 'Visitor statistics and engagement',
      action: () => { onClose(); onOpenDialog('analytics') },
    },
    {
      icon: ClockClockwise,
      label: t('hub.activityLog') || 'Activity Log',
      description: t('hub.activityLogDesc') || 'Audit log of admin actions',
      action: () => { onClose(); onOpenDialog('activity-log') },
    },
  ]

  const securityItems: HubItemData[] = [
    {
      icon: ShieldCheck,
      label: t('hub.securitySettings') || 'Security Settings',
      description: t('hub.securitySettingsDesc') || 'Configure rate limiting and protection',
      action: () => { onClose(); onOpenDialog('security-settings') },
    },
    {
      icon: ShieldWarning,
      label: t('hub.securityLogs') || 'Security Logs',
      description: t('hub.securityLogsDesc') || 'View blocked requests and incidents',
      action: () => { onClose(); onOpenDialog('security-log') },
    },
    {
      icon: Prohibit,
      label: t('hub.blocklist') || 'Blocklist Manager',
      description: t('hub.blocklistDesc') || 'Manage blocked IPs and patterns',
      action: () => { onClose(); onOpenDialog('blocklist') },
    },
    {
      icon: UserCircle,
      label: t('hub.attackerProfiles') || 'Attacker Profiles',
      description: t('hub.attackerProfilesDesc') || 'Detailed attacker intelligence',
      action: () => { onClose(); onOpenDialog('attacker-profiles') },
    },
    {
      icon: LinkSimple,
      label: t('hub.oauth') || 'OAuth Connections',
      description: t('hub.oauthDesc') || 'Manage third-party authentication',
      action: () => { onClose(); onOpenDialog('oauth') },
    },
  ]

  const systemItems: HubItemData[] = [
    {
      icon: UploadSimple,
      label: t('hub.exportConfig') || 'Export Configuration',
      description: t('hub.exportConfigDesc') || 'Download site config as JSON',
      action: () => { onClose(); onExportData() },
    },
    {
      icon: DownloadSimple,
      label: t('hub.importConfig') || 'Import Configuration',
      description: t('hub.importConfigDesc') || 'Restore config from a JSON file',
      action: () => { onClose(); onImportFile() },
    },
    {
      icon: Globe,
      label: t('hub.syncUrl') || 'Sync Configuration URL',
      description: t('hub.syncUrlDesc') || 'Pull config from a remote URL',
      action: () => { onClose(); onImportUrl() },
    },
    {
      icon: GearSix,
      label: t('hub.configEditor') || 'JSON Configuration Editor',
      description: t('hub.configEditorDesc') || 'Advanced raw config editing',
      action: () => { onClose(); onOpenDialog('config') },
    },
    {
      icon: Terminal,
      label: t('hub.terminal') || 'Terminal Console',
      description: t('hub.terminalDesc') || 'Manage terminal commands and morse code',
      action: () => { onClose(); onOpenDialog('terminal') },
    },
    {
      icon: SpeakerHigh,
      label: t('hub.audio') || 'Audio System',
      description: t('hub.audioDesc') || 'Configure ambient sound and effects',
      action: () => { onClose(); onOpenDialog('sound') },
    },
    ...(isPrimary
      ? [
          {
            icon: Key,
            label: t('hub.keyManager') || 'Key Manager',
            description: t('hub.keyManagerDesc') || 'Manage activation keys',
            action: () => { onClose(); onOpenDialog('keys') },
          },
        ]
      : []),
    {
      icon: Lock,
      label: t('hub.changePassword') || 'Change Password',
      description: t('hub.changePasswordDesc') || 'Update admin login password',
      action: () => { onClose(); onChangePassword() },
    },
    ...(onResetSetup
      ? [
          {
            icon: ArrowCounterClockwise,
            label: t('hub.resetSetup') || 'Reset Setup',
            description: t('hub.resetSetupDesc') || 'Wipe all settings and restart',
            action: () => { onClose(); onResetSetup?.() },
          },
        ]
      : []),
  ]

  // Tab content mapping for list-based tabs
  const tabItems: Partial<Record<TabKey, HubItemData[]>> = {
    store: storeItems,
    communication: communicationItems,
    'analytics-logs': analyticsItems,
    security: securityItems,
    system: systemItems,
  }

  // If the user wants the customizer, we unmount the hub and let the customizer run.
  // We don't want to completely embed the customizer into this modal because it needs
  // side-by-side previewing capabilities (it shrinks the site view).
  if (showCustomizer) {
    return (
      <Suspense fallback={null}>
        <ThemeCustomizerDialog
          open={true}
          onClose={() => {
            setShowCustomizer(false)
            onClose()
          }}
          themeSettings={siteConfig?.themeSettings}
          onSaveTheme={(ts) => onUpdateSiteConfig?.('themeSettings', ts)}
          sectionVisibility={siteConfig?.sectionVisibility}
          onSaveSectionVisibility={(vs) => onUpdateSiteConfig?.('sectionVisibility', vs)}
        />
      </Suspense>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="min-h-full flex items-center justify-center p-4 py-8"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card border border-border rounded-lg w-full max-w-4xl flex flex-col md:flex-row overflow-hidden min-h-[600px] max-h-[85vh]">
              {/* Sidebar Tabs */}
              <div className="w-full md:w-64 bg-muted/20 border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0">
                <div className="flex items-center justify-between md:justify-start gap-2 px-4 md:px-6 py-4 md:py-5 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Lightning size={20} weight="fill" className="text-primary" />
                    <h2 className="text-sm font-mono font-bold tracking-widest text-foreground uppercase">
                      {t('hub.title') || 'Admin Hub'}
                    </h2>
                  </div>
                  {/* Close button for mobile inside the header */}
                  <button
                    onClick={onClose}
                    className="md:hidden text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors p-1"
                    aria-label={t('common.close')}
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>

                {/* Horizontal scroll on mobile, vertical on desktop */}
                <div className="overflow-x-auto md:overflow-y-auto flex-none md:flex-1 py-2 md:py-4 flex flex-row md:flex-col items-center md:items-stretch">
                  <div className="flex md:flex-col gap-1 px-3 min-w-max md:min-w-0 flex-1">
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon
                      const isActive = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-3 rounded-md text-left transition-colors font-mono text-xs uppercase tracking-wider ${
                            isActive
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                        >
                          <IconComponent size={18} className={isActive ? 'text-primary' : 'text-muted-foreground/70 shrink-0'} />
                          <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                      )
                    })}

                    {/* Mobile logout inside horizontal scroll, integrated with tabs */}
                    {onLogout && (
                      <div className="md:hidden flex items-center pl-2 ml-2 border-l border-border/50">
                        <button
                          onClick={() => { onClose(); onLogout?.() }}
                          className="flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors font-mono text-xs uppercase tracking-wider text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <SignOut size={18} className="shrink-0" />
                          <span className="whitespace-nowrap">{t('hub.logout') || 'Logout'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account / Bottom Actions for Desktop */}
                <div className="hidden md:block p-4 mt-auto border-t border-border/50">
                  {onLogout && (
                    <button
                      onClick={() => { onClose(); onLogout?.() }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-left transition-colors font-mono text-xs uppercase tracking-wider text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <SignOut size={18} className="shrink-0" />
                      <span className="whitespace-nowrap">{t('hub.logout') || 'Logout'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col relative bg-card overflow-hidden">
                <div className="hidden md:block absolute top-4 right-4 z-10">
                  <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors p-2"
                    aria-label={t('common.close')}
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                  <h3 className="text-lg font-mono font-bold text-foreground mb-6 pb-2 border-b border-border/50 uppercase tracking-widest">
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTab === 'content' && siteConfig && onUpdateSiteConfig && (
                      <div className="col-span-1 md:col-span-2">
                        <Suspense fallback={null}>
                          <ContentForms data={siteConfig} onUpdate={onUpdateSiteConfig} />
                        </Suspense>
                      </div>
                    )}

                    {activeTab === 'design' && (
                      <div className="col-span-1 md:col-span-2 space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          {t('hub.designDesc') || 'Launch the Theme Customizer to visually edit your site\'s layout, fonts, colors, and visual effects side-by-side with your content.'}
                        </p>
                        <button
                          onClick={() => setShowCustomizer(true)}
                          className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-sm tracking-wider uppercase shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                          <Sliders size={20} weight="bold" />
                          {t('hub.launchCustomizer') || 'Launch Design Customizer'}
                        </button>
                      </div>
                    )}

                    {activeTab in tabItems &&
                      tabItems[activeTab]?.map((item) => <HubItem key={item.label} item={item} />)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function HubItem({ item }: { item: HubItemData }) {
  const IconComponent = item.icon
  return (
    <button
      onClick={item.disabled ? undefined : item.action}
      disabled={item.disabled}
      className="w-full flex items-center gap-4 px-4 py-3 rounded-md text-left bg-muted/10 border border-border/50 hover:bg-primary/10 hover:border-primary/30 active:bg-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
    >
      <div className="flex-shrink-0 p-2 rounded bg-background group-hover:bg-background border border-border/50 group-hover:border-primary/20 transition-colors">
        <IconComponent size={20} className="text-primary/70 group-hover:text-primary transition-colors" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {item.label}
        </p>
        {item.description && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{item.description}</p>
        )}
      </div>
    </button>
  )
}
