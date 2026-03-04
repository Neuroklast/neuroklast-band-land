/**
 * AdminHubDialog — Central admin panel replacing the 21-button grid.
 *
 * Opens as a fullscreen overlay when the admin FAB is clicked in edit mode.
 * Organizes all admin actions into logical category sections.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { useLocale } from '@/contexts/LocaleContext'
import type { AdminDialog } from '@/lib/types'

interface AdminHubItem {
  icon: string
  label: string
  description?: string
  action: () => void
  disabled?: boolean
}

interface AdminHubSection {
  title: string
  items: AdminHubItem[]
}

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
}

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
}: AdminHubDialogProps) {
  const { t } = useLocale()

  const sections: AdminHubSection[] = [
    {
      title: t('hub.content'),
      items: [
        {
          icon: '📤',
          label: t('hub.exportData'),
          action: () => { onClose(); onExportData() },
        },
        {
          icon: '📥',
          label: t('hub.importFile'),
          action: () => { onClose(); onImportFile() },
        },
        {
          icon: '🌐',
          label: t('hub.syncUrl'),
          action: () => { onClose(); onImportUrl() },
        },
        {
          icon: '⚙️',
          label: t('hub.configEditor'),
          action: () => { onClose(); onOpenDialog('config') },
        },
      ],
    },
    {
      title: t('hub.appearance'),
      items: [
        {
          icon: '🎨',
          label: t('hub.themeStore'),
          action: () => { onClose(); onOpenDialog('store') },
        },
        {
          icon: '🎛️',
          label: t('hub.customizer'),
          action: () => { onClose(); onOpenDialog('design') },
        },
        {
          icon: '🖥️',
          label: t('hub.terminal'),
          action: () => { onClose(); onOpenDialog('terminal') },
        },
        {
          icon: '🔊',
          label: t('hub.sound'),
          action: () => { onClose(); onOpenDialog('sound') },
        },
      ],
    },
    {
      title: t('hub.analytics'),
      items: [
        {
          icon: '📈',
          label: t('hub.analyticsDashboard'),
          action: () => { onClose(); onOpenDialog('analytics') },
        },
        {
          icon: '🛡️',
          label: t('hub.securityLog'),
          action: () => { onClose(); onOpenDialog('security-log') },
        },
        {
          icon: '⚙️',
          label: t('hub.securitySettings'),
          action: () => { onClose(); onOpenDialog('security-settings') },
        },
        {
          icon: '🚫',
          label: t('hub.blocklist'),
          action: () => { onClose(); onOpenDialog('blocklist') },
        },
        {
          icon: '👤',
          label: t('hub.attackerProfiles'),
          action: () => { onClose(); onOpenDialog('attacker-profiles') },
        },
      ],
    },
    {
      title: t('hub.communication'),
      items: [
        {
          icon: '📨',
          label: t('hub.inbox'),
          action: () => { onClose(); onOpenDialog('inbox') },
        },
        {
          icon: '👥',
          label: t('hub.subscribers'),
          action: () => { onClose(); onOpenDialog('subscribers') },
        },
        {
          icon: '📣',
          label: t('hub.marketing'),
          action: () => { onClose(); onOpenDialog('marketing') },
        },
        {
          icon: '🔗',
          label: t('hub.oauth'),
          action: () => { onClose(); onOpenDialog('oauth') },
        },
      ],
    },
  ]

  const systemItems: AdminHubItem[] = [
    ...(isPrimary
      ? [
          {
            icon: '🔑',
            label: t('hub.keyManager'),
            description: 'Manage activation keys',
            action: () => { onClose(); onOpenDialog('keys') },
          },
        ]
      : []),
    {
      icon: '🔒',
      label: t('hub.changePassword'),
      action: () => { onClose(); onChangePassword() },
    },
    ...(onResetSetup
      ? [
          {
            icon: '🔄',
            label: t('hub.resetSetup'),
            action: () => { onClose(); onResetSetup!() },
          },
        ]
      : []),
    ...(onLogout
      ? [
          {
            icon: '🚪',
            label: t('hub.logout'),
            action: () => { onClose(); onLogout!() },
          },
        ]
      : []),
  ]

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
            className="min-h-full flex items-start justify-center p-4 py-8"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card border border-border rounded-lg w-full max-w-3xl relative">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xl">⚡</span>
                  <h2 className="text-sm font-mono font-bold tracking-widest text-foreground">
                    {t('hub.title')}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Close"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => (
                  <div key={section.title} className="space-y-2">
                    <h3 className="text-[10px] font-mono font-bold tracking-widest text-primary/70 uppercase border-b border-primary/10 pb-1">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <HubItem key={item.label} item={item} />
                      ))}
                    </div>
                  </div>
                ))}

                {/* System section — full width */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <h3 className="text-[10px] font-mono font-bold tracking-widest text-primary/70 uppercase border-b border-primary/10 pb-1">
                    {t('hub.system')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {systemItems.map((item) => (
                      <HubItem key={item.label} item={item} />
                    ))}
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

function HubItem({ item }: { item: AdminHubItem }) {
  return (
    <button
      onClick={item.disabled ? undefined : item.action}
      disabled={item.disabled}
      className="w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-primary/10 active:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
    >
      <span className="text-base flex-shrink-0 w-6 text-center">{item.icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
          {item.label}
        </p>
        {item.description && (
          <p className="text-[10px] text-muted-foreground/70">{item.description}</p>
        )}
      </div>
    </button>
  )
}
