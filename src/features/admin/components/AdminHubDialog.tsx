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
  Layout,
  Storefront,
  ShieldChevron
} from '@phosphor-icons/react'
import { useLocale } from '@/contexts/LocaleContext'
import type { AdminDialog, SiteConfig } from '@/lib/types'

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

type TabKey = 'content' | 'design' | 'store' | 'system'

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

  const tabs = [
    { id: 'content', label: t('hub.content') || 'Content', icon: Article },
    { id: 'design', label: t('hub.appearance') || 'Design & Theme', icon: Palette },
    { id: 'store', label: t('hub.store') || 'Store & Apps', icon: Storefront },
    { id: 'system', label: t('hub.system') || 'System & Security', icon: ShieldChevron },
  ] as const

  const contentItems = [] // Rendered directly

  const storeItems = [
    {
      icon: Palette,
      label: t('hub.storeThemes') || 'Theme Store',
      description: t('hub.storeThemesDesc') || 'Install premium themes',
      action: () => { onClose(); onOpenDialog('store') },
    },
    {
      icon: Sliders,
      label: t('hub.storeWidgets') || 'Widget Store',
      description: t('hub.storeWidgetsDesc') || 'Add new widgets to the site',
      action: () => { onClose(); onOpenDialog('store') },
    },
  ]

  const systemItems = [
    {
      icon: UploadSimple,
      label: t('hub.exportConfig') || 'Export Configuration',
      action: () => { onClose(); onExportData() },
    },
    {
      icon: DownloadSimple,
      label: t('hub.importConfig') || 'Import Configuration',
      action: () => { onClose(); onImportFile() },
    },
    {
      icon: Globe,
      label: t('hub.syncUrl') || 'Sync Configuration URL',
      action: () => { onClose(); onImportUrl() },
    },
    {
      icon: GearSix,
      label: t('hub.configEditor') || 'JSON Configuration Editor',
      action: () => { onClose(); onOpenDialog('config') },
    },
    {
      icon: Terminal,
      label: t('hub.terminal') || 'Terminal Console',
      action: () => { onClose(); onOpenDialog('terminal') },
    },
    {
      icon: SpeakerHigh,
      label: t('hub.audio') || 'Audio System',
      action: () => { onClose(); onOpenDialog('sound') },
    },
    {
      icon: ChartBar,
      label: t('hub.analytics') || 'Analytics Dashboard',
      action: () => { onClose(); onOpenDialog('analytics') },
    },
    {
      icon: ShieldWarning,
      label: t('hub.securityLogs') || 'Security Logs',
      action: () => { onClose(); onOpenDialog('security-log') },
    },
    {
      icon: ShieldCheck,
      label: t('hub.securitySettings') || 'Security Settings',
      action: () => { onClose(); onOpenDialog('security-settings') },
    },
    {
      icon: Prohibit,
      label: t('hub.blocklist') || 'Blocklist Manager',
      action: () => { onClose(); onOpenDialog('blocklist') },
    },
    {
      icon: UserCircle,
      label: t('hub.attackerProfiles') || 'Attacker Profiles',
      action: () => { onClose(); onOpenDialog('attacker-profiles') },
    },
    {
      icon: EnvelopeSimple,
      label: t('hub.inbox') || 'Inbox',
      action: () => { onClose(); onOpenDialog('inbox') },
    },
    {
      icon: UsersThree,
      label: t('hub.subscribers') || 'Subscribers',
      action: () => { onClose(); onOpenDialog('subscribers') },
    },
    {
      icon: MegaphoneSimple,
      label: t('hub.marketing') || 'Marketing Settings',
      action: () => { onClose(); onOpenDialog('marketing') },
    },
    {
      icon: LinkSimple,
      label: t('hub.oauth') || 'OAuth Connections',
      action: () => { onClose(); onOpenDialog('oauth') },
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
      action: () => { onClose(); onChangePassword() },
    },
    ...(onResetSetup
      ? [
          {
            icon: ArrowCounterClockwise,
            label: t('hub.resetSetup') || 'Reset Setup',
            action: () => { onClose(); onResetSetup?.() },
          },
        ]
      : []),
    ...(onLogout
      ? [
          {
            icon: SignOut,
            label: t('hub.logout') || 'Logout',
            action: () => { onClose(); onLogout?.() },
          },
        ]
      : []),
  ]

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
          themeSettings={{} as unknown as SiteConfig["themeSettings"]} // The customizer will use the global hook state or be passed properly in AdminButton if we lift state up
          onSaveTheme={(ts) => { window.dispatchEvent(new CustomEvent('save-theme-event', { detail: ts })) }}
          sectionVisibility={{} as unknown as SiteConfig["sectionVisibility"]}
          onSaveSectionVisibility={(vs) => { window.dispatchEvent(new CustomEvent('save-visibility-event', { detail: vs })) }}
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
            <div className="bg-card border border-border rounded-lg w-full max-w-4xl flex overflow-hidden min-h-[600px] max-h-[85vh]">
              {/* Sidebar Tabs */}
              <div className="w-64 bg-muted/20 border-r border-border flex flex-col">
                <div className="flex items-center gap-2 px-6 py-5 border-b border-border/50">
                  <Lightning size={20} weight="fill" className="text-primary" />
                  <h2 className="text-sm font-mono font-bold tracking-widest text-foreground uppercase">
                    {t('hub.title') || 'Admin Hub'}
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-1 px-3">
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon
                      const isActive = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-left transition-colors font-mono text-xs uppercase tracking-wider ${
                            isActive
                              ? 'bg-primary/10 text-primary font-bold'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`}
                        >
                          <IconComponent size={18} className={isActive ? 'text-primary' : 'text-muted-foreground/70'} />
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col relative bg-card">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors p-2"
                    aria-label="Close"
                  >
                    <X size={20} weight="bold" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                  <h3 className="text-lg font-mono font-bold text-foreground mb-6 pb-2 border-b border-border/50 uppercase tracking-widest">
                    {tabs.find((t) => t.id === activeTab)?.label}
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

                    {activeTab === 'store' &&
                      storeItems.map((item) => <HubItem key={item.label} item={item} />)}

                    {activeTab === 'system' &&
                      systemItems.map((item) => <HubItem key={item.label} item={item} />)}
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

function HubItem({ item }: { item: any }) {
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
