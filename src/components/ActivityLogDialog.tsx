import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash, ClockClockwise, Funnel } from '@phosphor-icons/react'
import { getActivityLog, clearActivityLog, ACTION_LABELS } from '@/lib/activity-log'
import type { ActivityLogEntry, ActivityLogAction } from '@/lib/activity-log'
import { useLocale } from '@/hooks/use-locale'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const ACTION_COLORS: Record<ActivityLogAction, string> = {
  'theme-change': 'text-primary',
  'config-change': 'text-status-info',
  'login-attempt': 'text-status-warning',
  'login-success': 'text-status-success',
  'login-failure': 'text-status-error',
  'logout': 'text-muted-foreground',
  'section-toggle': 'text-primary/70',
  'widget-install': 'text-status-success',
  'widget-uninstall': 'text-status-error',
  'widget-toggle': 'text-primary/70',
  'password-change': 'text-status-warning',
  'setup-reset': 'text-status-error',
  'export-config': 'text-status-info',
  'import-config': 'text-status-info',
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function ActivityLogDialog({ open, onClose }: Props) {
  const { t } = useLocale()
  // Initialize from localStorage when the component mounts (lazy initializer).
  // The key prop on this component in AdminDialogManager resets it on each open.
  const [entries, setEntries] = useState<ActivityLogEntry[]>(() =>
    open ? getActivityLog() : [],
  )
  const [filterAction, setFilterAction] = useState<ActivityLogAction | undefined>()

  function handleClear() {
    clearActivityLog()
    setEntries([])
  }

  const filtered = filterAction
    ? entries.filter(e => e.action === filterAction)
    : entries

  const uniqueActions = [...new Set(entries.map(e => e.action))] as ActivityLogAction[]

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-4 pb-0 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-mono text-sm tracking-widest uppercase flex items-center gap-2">
              <ClockClockwise size={16} className="text-primary" />
              {t('hub.activityLog') || 'Activity Log'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="gap-1 text-xs text-status-error hover:bg-status-error-em/10 h-7"
            >
              <Trash size={12} />
              {t('common.clear') || 'Clear'}
            </Button>
          </div>
          {uniqueActions.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pb-3 pt-2">
              <Funnel size={12} className="text-muted-foreground/50 shrink-0" />
              <button
                onClick={() => setFilterAction(undefined)}
                className={`font-mono text-[10px] px-2 py-0.5 rounded transition-colors ${!filterAction ? 'bg-primary/20 text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
              >
                {t('common.all') || 'All'} ({entries.length})
              </button>
              {uniqueActions.map(action => (
                <button
                  key={action}
                  onClick={() => setFilterAction(action === filterAction ? undefined : action)}
                  className={`font-mono text-[10px] px-2 py-0.5 rounded transition-colors ${filterAction === action ? 'bg-primary/20 text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
                >
                  {ACTION_LABELS[action]} ({entries.filter(e => e.action === action).length})
                </button>
              ))}
            </div>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground/50 font-mono text-xs">
              {t('hub.activityLogEmpty') || 'No activity recorded yet.'}
            </div>
          ) : (
            filtered.map(entry => (
              <div
                key={entry.id}
                className="flex items-start gap-3 py-2 px-3 rounded bg-muted/10 border border-border/30 hover:border-border/60 transition-colors"
              >
                <span className={`font-mono text-[9px] pt-0.5 w-36 shrink-0 text-muted-foreground/50`}>
                  {formatDate(entry.timestamp)}
                </span>
                <span className={`font-mono text-[10px] font-bold w-28 shrink-0 ${ACTION_COLORS[entry.action]}`}>
                  {ACTION_LABELS[entry.action]}
                </span>
                <span className="font-mono text-[10px] text-foreground/80 flex-1">
                  {entry.detail}
                </span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
