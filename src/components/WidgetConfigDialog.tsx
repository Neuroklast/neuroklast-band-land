/**
 * WidgetConfigDialog — Modal for configuring widget-specific settings.
 *
 * Renders per-widget config fields and calls onSave with the updated config.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sliders, X, ChartBar } from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import type { WidgetPlugin } from '@/lib/types'

interface WidgetConfigDialogProps {
  widget: WidgetPlugin
  onSave: (config: Record<string, unknown>) => void
  onClose: () => void
}

export default function WidgetConfigDialog({ widget, onSave, onClose }: WidgetConfigDialogProps) {
  const [config, setConfig] = useState<Record<string, unknown>>(
    (widget.config as Record<string, unknown>) ?? {}
  )
  const [itemsJson, setItemsJson] = useState<string>(
    JSON.stringify((widget.config as Record<string, unknown>)?.items ?? [], null, 2)
  )
  const [jsonError, setJsonError] = useState('')

  useEffect(() => {
    setConfig((widget.config as Record<string, unknown>) ?? {})
    setItemsJson(
      JSON.stringify((widget.config as Record<string, unknown>)?.items ?? [], null, 2)
    )
    setJsonError('')
  }, [widget])

  function set(key: string, value: unknown) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  function handleItemsJson(raw: string) {
    setItemsJson(raw)
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) throw new Error('Must be an array')
      setConfig((prev) => ({ ...prev, items: parsed }))
      setJsonError('')
    } catch (e) {
      setJsonError((e as Error).message)
    }
  }

  function handleSave() {
    onSave(config)
    onClose()
  }

  function renderFields() {
    switch (widget.id) {
      case 'bandsintown':
        return (
          <>
            <Field label="Artist Name" hint="e.g. Zardonic">
              <Input
                value={String(config.artist ?? '')}
                onChange={(e) => set('artist', e.target.value)}
                placeholder="Artist name as on Bandsintown"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label="App ID" hint="Your Bandsintown App ID">
              <Input
                value={String(config.appId ?? '')}
                onChange={(e) => set('appId', e.target.value)}
                placeholder="bandsintown-app-id"
                className="bg-secondary border-input text-sm"
              />
            </Field>
          </>
        )

      case 'spotify-player':
        return (
          <>
            <Field label="Spotify URI" hint='e.g. spotify:playlist:37i9dQZF1DX… or a plain ID'>
              <Input
                value={String(config.uri ?? '')}
                onChange={(e) => set('uri', e.target.value)}
                placeholder="spotify:playlist:…"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label="Type">
              <select
                value={String(config.type ?? 'playlist')}
                onChange={(e) => set('type', e.target.value)}
                className="w-full bg-secondary border border-input rounded px-3 py-2 text-sm font-mono text-foreground"
              >
                <option value="playlist">Playlist</option>
                <option value="album">Album</option>
                <option value="track">Track</option>
              </select>
            </Field>
          </>
        )

      case 'youtube-embed':
        return (
          <>
            <Field label="Video ID" hint="YouTube video ID (e.g. dQw4w9WgXcQ)">
              <Input
                value={String(config.videoId ?? '')}
                onChange={(e) => set('videoId', e.target.value)}
                placeholder="dQw4w9WgXcQ"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label="Playlist ID" hint="YouTube playlist ID (optional)">
              <Input
                value={String(config.playlistId ?? '')}
                onChange={(e) => set('playlistId', e.target.value)}
                placeholder="PLxxxxxxxxxxxxxxxxxx"
                className="bg-secondary border-input text-sm"
              />
            </Field>
          </>
        )

      case 'merch-store':
        return (
          <>
            <Field label="Shop URL" hint="Link to your external shop">
              <Input
                value={String(config.shopUrl ?? '')}
                onChange={(e) => set('shopUrl', e.target.value)}
                placeholder="https://yourshop.com"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field
              label="Items (JSON)"
              hint='Array of { name, price, imageUrl?, link }'
              error={jsonError}
            >
              <textarea
                value={itemsJson}
                onChange={(e) => handleItemsJson(e.target.value)}
                rows={8}
                className="w-full bg-secondary border border-input rounded px-3 py-2 text-xs font-mono text-foreground resize-y"
                spellCheck={false}
              />
            </Field>
          </>
        )

      case 'analytics-dashboard':
        return (
          <div className="text-sm text-muted-foreground font-mono py-4 text-center">
            <ChartBar size={24} className="text-primary/60 mx-auto mb-2" />
            <p className="font-semibold mb-1">Analytics Dashboard</p>
            <p className="text-xs opacity-70">No configuration required — demo data is shown automatically.</p>
          </div>
        )

      default:
        return (
          <div className="text-sm text-muted-foreground font-mono py-4 text-center">
            <p className="text-xs opacity-70">No configuration available for this widget.</p>
          </div>
        )
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card border border-border rounded-[var(--radius-lg)] w-full max-w-md flex flex-col relative"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-primary" />
              <h2 className="font-mono text-sm font-bold tracking-wider">
                Configure: {widget.name}
              </h2>
            </div>
            <CyberCloseButton onClick={onClose} label="CLOSE" />
          </div>

          {/* Fields */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
            {renderFields()}
          </div>

          {/* Footer */}
          {widget.id !== 'analytics-dashboard' && (
            <div className="p-4 border-t border-primary/10 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={onClose} className="text-xs gap-1 h-7 border-primary/30">
                <X size={12} /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!!jsonError}
                className="text-xs gap-1 h-7"
              >
                Save
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-mono">{label}</Label>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      {children}
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  )
}
