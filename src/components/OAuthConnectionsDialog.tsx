import { useState, useEffect, useCallback, startTransition } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import CyberCloseButton from '@/components/CyberCloseButton'
import { LinkSimple, LinkBreak, CheckCircle, XCircle, ArrowsClockwise, Clock } from '@phosphor-icons/react'

interface ProviderStatus {
  connected: boolean
  displayName?: string | null
  email?: string | null
  connectedAt?: string | null
}

interface OAuthStatuses {
  spotify?: ProviderStatus
  'google-drive'?: ProviderStatus
}

interface OAuthLogEntry {
  timestamp: string
  provider: string
  action: 'connect' | 'disconnect'
  success: boolean
  displayName?: string | null
  email?: string | null
  reason?: string
}

interface OAuthConnectionsDialogProps {
  open: boolean
  onClose: () => void
}

const PROVIDER_META: Record<string, { label: string; color: string; hint: string }> = {
  spotify: {
    label: 'Spotify',
    color: 'text-green-400',
    hint: 'Requires SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET env vars.',
  },
  'google-drive': {
    label: 'Google Drive',
    color: 'text-blue-400',
    hint: 'Requires GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET env vars.',
  },
}

export default function OAuthConnectionsDialog({ open, onClose }: OAuthConnectionsDialogProps) {
  const [statuses, setStatuses] = useState<OAuthStatuses>({})
  const [logs, setLogs] = useState<OAuthLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [disconnectingProvider, setDisconnectingProvider] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/oauth?action=status', { credentials: 'same-origin' })
      if (!res.ok) throw new Error('Failed to load connection status')
      const data = await res.json()
      startTransition(() => {
        setStatuses(data.statuses || {})
        setLogs((data.logs || []).slice().reverse())
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchStatus()
    }
  }, [open, fetchStatus])

  const handleConnect = async (provider: string) => {
    setConnectingProvider(provider)
    setError(null)
    try {
      const res = await fetch(`/api/oauth?action=authorize&provider=${provider}`, {
        credentials: 'same-origin',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to start OAuth flow' }))
        throw new Error(data.error || 'Failed to start OAuth flow')
      }
      const { authUrl } = await res.json()

      // Open the OAuth popup and listen for the result
      const popup = window.open(authUrl, `oauth-${provider}`, 'width=600,height=700,scrollbars=yes')
      if (!popup) {
        throw new Error('Popup was blocked. Please allow popups for this site.')
      }

      await new Promise<void>((resolve, reject) => {
        let checkClosed: ReturnType<typeof setInterval>

        const cleanup = () => {
          clearInterval(checkClosed)
          window.removeEventListener('message', handler)
        }

        const handler = (event: MessageEvent) => {
          if (event.data?.type !== 'oauth-callback') return
          cleanup()
          if (event.data.success) {
            resolve()
          } else {
            reject(new Error(event.data.error || 'OAuth flow failed'))
          }
        }
        window.addEventListener('message', handler)

        // Fallback: if popup closes without message, resolve and refresh
        checkClosed = setInterval(() => {
          if (popup.closed) {
            cleanup()
            resolve()
          }
        }, 500)
      })

      await fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setConnectingProvider(null)
    }
  }

  const handleDisconnect = async (provider: string) => {
    setDisconnectingProvider(provider)
    setError(null)
    try {
      const res = await fetch('/api/oauth', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', provider }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Disconnect failed' }))
        throw new Error(data.error || 'Disconnect failed')
      }
      await fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Disconnect failed')
    } finally {
      setDisconnectingProvider(null)
    }
  }

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—'
    try {
      return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return iso
    }
  }

  return (
    <CyberModalBackdrop open={open} zIndex="z-[10001]" bgClass="bg-background/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-lg mt-8 bg-card border-2 border-primary/30 relative overflow-hidden flex flex-col font-mono"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-primary/30">
          <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest">
            <LinkSimple size={14} weight="bold" /> OAuth Connections
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="text-primary/40 hover:text-primary transition-colors disabled:opacity-30"
              title="Refresh status"
            >
              <ArrowsClockwise size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <CyberCloseButton onClick={onClose} label="CLOSE" />
          </div>
        </div>

        <div className="px-4 py-3 space-y-4 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="text-[10px] font-mono text-red-400 bg-red-400/10 border border-red-400/30 px-3 py-2">
              ⚠ {error}
            </div>
          )}

          {/* Provider cards */}
          <div className="space-y-3">
            <div className="text-[10px] text-primary/50 uppercase tracking-wider">Connected Accounts</div>
            {Object.entries(PROVIDER_META).map(([key, meta]) => {
              const status = statuses[key as keyof OAuthStatuses]
              const isConnecting = connectingProvider === key
              const isDisconnecting = disconnectingProvider === key

              return (
                <div
                  key={key}
                  className="border border-primary/20 p-3 space-y-2 bg-primary/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {status?.connected ? (
                        <CheckCircle size={14} className="text-green-400 shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-primary/30 shrink-0" />
                      )}
                      <span className={`text-xs font-mono font-semibold ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    {status?.connected ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isDisconnecting}
                        onClick={() => handleDisconnect(key)}
                        className="text-[10px] font-mono border-red-400/40 text-red-400/80 hover:text-red-400 hover:border-red-400 gap-1 h-6 px-2"
                      >
                        <LinkBreak size={11} />
                        {isDisconnecting ? 'Disconnecting…' : 'Disconnect'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={isConnecting}
                        onClick={() => handleConnect(key)}
                        className="text-[10px] font-mono gap-1 h-6 px-2"
                      >
                        <LinkSimple size={11} />
                        {isConnecting ? 'Connecting…' : 'Connect Account'}
                      </Button>
                    )}
                  </div>

                  {status?.connected && (
                    <div className="pl-5 space-y-0.5">
                      {status.displayName && (
                        <div className="text-[10px] text-foreground/70">
                          <span className="text-primary/40">NAME: </span>
                          {status.displayName}
                        </div>
                      )}
                      {status.email && (
                        <div className="text-[10px] text-foreground/70">
                          <span className="text-primary/40">EMAIL: </span>
                          {status.email}
                        </div>
                      )}
                      <div className="text-[10px] text-foreground/50">
                        <span className="text-primary/40">CONNECTED: </span>
                        {formatDate(status.connectedAt)}
                      </div>
                    </div>
                  )}

                  {!status?.connected && (
                    <div className="pl-5 text-[9px] text-primary/30">{meta.hint}</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Auth log */}
          <div className="space-y-2">
            <div className="text-[10px] text-primary/50 uppercase tracking-wider flex items-center gap-1">
              <Clock size={10} /> Auth Log
            </div>
            {logs.length === 0 ? (
              <div className="text-[10px] text-primary/20 py-2">No auth events recorded yet.</div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {logs.slice(0, 20).map((entry, i) => (
                  <div
                    key={`${entry.timestamp}-${entry.provider}-${i}`}
                    className="text-[9px] font-mono flex items-start gap-2 py-0.5 border-b border-primary/5 last:border-0"
                  >
                    <span
                      className={`shrink-0 mt-0.5 ${entry.success ? 'text-green-400/70' : 'text-red-400/70'}`}
                    >
                      {entry.success ? '✓' : '✗'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-primary/60 uppercase">
                        {PROVIDER_META[entry.provider]?.label ?? entry.provider}
                      </span>
                      {' '}
                      <span className="text-foreground/60">{entry.action}</span>
                      {entry.displayName && (
                        <span className="text-foreground/40"> · {entry.displayName}</span>
                      )}
                      {!entry.success && entry.reason && (
                        <span className="text-red-400/60"> · {entry.reason}</span>
                      )}
                    </div>
                    <span className="text-primary/20 shrink-0 whitespace-nowrap">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-primary/20 bg-primary/5 px-4 py-2 flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-xs font-mono text-primary/50 hover:text-primary"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </CyberModalBackdrop>
  )
}
