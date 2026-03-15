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
import { useLocale } from '@/hooks/use-locale'
import type { WidgetPlugin } from '@/lib/types'

interface WidgetConfigDialogProps {
  open: boolean
  widget: WidgetPlugin
  onSave: (config: Record<string, unknown>) => void
  onClose: () => void
}

export default function WidgetConfigDialog({ widget, onSave, onClose }: WidgetConfigDialogProps) {
  const { t } = useLocale()
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
            <Field label={t('widgetConfig.artistName') || 'Artist Name'} hint="e.g. Zardonic">
              <Input
                value={String(config.artist ?? '')}
                onChange={(e) => set('artist', e.target.value)}
                placeholder="Artist name as on Bandsintown"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.appId') || 'App ID'} hint="Your Bandsintown App ID">
              <Input
                value={String(config.appId ?? '')}
                onChange={(e) => set('appId', e.target.value)}
                placeholder="bandsintown-app-id"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.displayLimit') || 'Events to Show'} hint="1–20 events">
              <Input
                type="number"
                min={1}
                max={20}
                value={String(config.displayLimit ?? 5)}
                onChange={(e) => set('displayLimit', parseInt(e.target.value, 10) || 5)}
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.layout') || 'Layout'}>
              <select
                value={String(config.layout ?? 'list')}
                onChange={(e) => set('layout', e.target.value)}
                className="w-full bg-secondary border border-input rounded px-3 py-2 text-sm font-mono text-foreground"
              >
                <option value="list">{t('widgetConfig.layoutList') || 'Full List'}</option>
                <option value="compact">{t('widgetConfig.layoutCompact') || 'Compact'}</option>
              </select>
            </Field>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showTicketLinks !== false}
                  onChange={(e) => set('showTicketLinks', e.target.checked)}
                  className="accent-primary"
                />
                {t('widgetConfig.showTicketLinks') || 'Show ticket links'}
              </label>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showVenueDetails !== false}
                  onChange={(e) => set('showVenueDetails', e.target.checked)}
                  className="accent-primary"
                />
                {t('widgetConfig.showVenueDetails') || 'Show venue & location details'}
              </label>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(config.showPastDates)}
                  onChange={(e) => set('showPastDates', e.target.checked)}
                  className="accent-primary"
                />
                {t('widgetConfig.showPastDates') || 'Include past dates'}
              </label>
            </div>
          </>
        )

      case 'spotify-player':
        return (
          <>
            <Field label={t('widgetConfig.spotifyUri') || 'Spotify URI'} hint='e.g. spotify:playlist:37i9dQZF1DX… or a plain ID'>
              <Input
                value={String(config.uri ?? '')}
                onChange={(e) => set('uri', e.target.value)}
                placeholder="spotify:playlist:…"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.typeLabel') || 'Type'}>
              <select
                value={String(config.type ?? 'playlist')}
                onChange={(e) => set('type', e.target.value)}
                className="w-full bg-secondary border border-input rounded px-3 py-2 text-sm font-mono text-foreground"
              >
                <option value="playlist">{t('widgetConfig.playlist')}</option>
                <option value="album">{t('widgetConfig.album')}</option>
                <option value="track">{t('widgetConfig.track')}</option>
              </select>
            </Field>
            <Field label={t('widgetConfig.playerTheme') || 'Player Theme'}>
              <select
                value={String(config.theme ?? 'dark')}
                onChange={(e) => set('theme', e.target.value)}
                className="w-full bg-secondary border border-input rounded px-3 py-2 text-sm font-mono text-foreground"
              >
                <option value="dark">{t('widgetConfig.darkMode')}</option>
                <option value="light">{t('widgetConfig.lightMode')}</option>
              </select>
            </Field>
            <Field label={t('widgetConfig.playerHeight') || 'Height (px)'} hint="152 for compact bar, 352 for full player">
              <Input
                type="number"
                min={80}
                max={800}
                value={String(config.height ?? 352)}
                onChange={(e) => set('height', parseInt(e.target.value, 10) || 352)}
                className="bg-secondary border-input text-sm"
              />
            </Field>
          </>
        )

      case 'youtube-embed':
        return (
          <>
            <Field label={t('widgetConfig.videoId') || 'Video ID'} hint="YouTube video ID (e.g. dQw4w9WgXcQ)">
              <Input
                value={String(config.videoId ?? '')}
                onChange={(e) => set('videoId', e.target.value)}
                placeholder="dQw4w9WgXcQ"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.playlistId') || 'Playlist ID'} hint="YouTube playlist ID (optional)">
              <Input
                value={String(config.playlistId ?? '')}
                onChange={(e) => set('playlistId', e.target.value)}
                placeholder="PLxxxxxxxxxxxxxxxxxx"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.startTime') || 'Start Time (seconds)'} hint="Start video at this offset (0 = beginning)">
              <Input
                type="number"
                min={0}
                value={String(config.startTime ?? 0)}
                onChange={(e) => set('startTime', parseInt(e.target.value, 10) || 0)}
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(config.autoplay)}
                onChange={(e) => set('autoplay', e.target.checked)}
                className="accent-primary"
              />
              {t('widgetConfig.autoplay') || 'Autoplay (requires user interaction on most browsers)'}
            </label>
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
            <p className="font-semibold mb-1">{t('widgetConfig.analyticsTitle')}</p>
            <p className="text-xs opacity-70">{t('widgetConfig.analyticsInfo')}</p>
          </div>
        )

      case 'newsletter':
        return (
          <>
            <Field label="Title" hint="Widget heading (optional, uses default if empty)">
              <Input
                value={String(config.title ?? '')}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Stay in the loop"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label="Description" hint="Short description shown below the title">
              <Input
                value={String(config.description ?? '')}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Subscribe to our newsletter"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label="Email Placeholder">
              <Input
                value={String(config.placeholder ?? '')}
                onChange={(e) => set('placeholder', e.target.value)}
                placeholder="your@email.com"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label="Button Text">
              <Input
                value={String(config.buttonText ?? '')}
                onChange={(e) => set('buttonText', e.target.value)}
                placeholder="Subscribe"
                className="bg-secondary border-input text-sm"
              />
            </Field>
          </>
        )

      case 'instagram-feed':
        return (
          <>
            <Field
              label="Profile URL"
              hint="Instagram profile URL — shows a 'View on Instagram' button"
            >
              <Input
                value={String(config.profileUrl ?? '')}
                onChange={(e) => set('profileUrl', e.target.value)}
                placeholder="https://www.instagram.com/yourhandle"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field
              label="Embed Code"
              hint="Paste an Instagram embed snippet to render it directly"
            >
              <textarea
                value={String(config.embedCode ?? '')}
                onChange={(e) => set('embedCode', e.target.value)}
                rows={4}
                className="w-full bg-secondary border border-input rounded px-3 py-2 text-xs font-mono text-foreground resize-y"
                spellCheck={false}
                placeholder='<blockquote class="instagram-media" …>'
              />
            </Field>
            <Field
              label="Number of Placeholders"
              hint="How many placeholder cells to show when no images are configured (1–24)"
            >
              <Input
                type="number"
                min={1}
                max={24}
                value={String(config.imageCount ?? 6)}
                onChange={(e) => set('imageCount', parseInt(e.target.value, 10) || 6)}
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <p className="text-[10px] text-muted-foreground">
              Configure either a Profile URL, an embed code, or add images via the widget's JSON config field.
            </p>
          </>
        )

      case 'soundcloud-player':
        return (
          <>
            <Field label={t('widgetConfig.soundcloudUrl') || 'SoundCloud URL'} hint="Track, playlist, or artist page URL">
              <Input
                value={String(config.url ?? '')}
                onChange={(e) => set('url', e.target.value)}
                placeholder="https://soundcloud.com/artist/track"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.accentColour') || 'Accent Colour'} hint="Player accent colour (hex, e.g. #ff5500)">
              <Input
                value={String(config.color ?? '#ff5500')}
                onChange={(e) => set('color', e.target.value)}
                placeholder="#ff5500"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(config.autoPlay)}
                  onChange={(e) => set('autoPlay', e.target.checked)}
                  className="accent-primary"
                />
                {t('widgetConfig.autoplay') || 'Autoplay'}
              </label>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(config.showVisualPlayer)}
                  onChange={(e) => set('showVisualPlayer', e.target.checked)}
                  className="accent-primary"
                />
                {t('widgetConfig.showVisualPlayer') || 'Full visual player (larger, shows artwork)'}
              </label>
            </div>
          </>
        )

      case 'apple-music-player':
        return (
          <>
            <Field label={t('widgetConfig.appleMusicEmbedUrl') || 'Apple Music Embed URL'} hint='From Share → Embed on Apple Music (starts with https://embed.music.apple.com/…)'>
              <Input
                value={String(config.embedUrl ?? '')}
                onChange={(e) => set('embedUrl', e.target.value)}
                placeholder="https://embed.music.apple.com/us/album/…"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.playerHeight') || 'Height (px)'} hint="175 for single track bar, 450 for full playlist">
              <Input
                type="number"
                min={80}
                max={800}
                value={String(config.height ?? 175)}
                onChange={(e) => set('height', parseInt(e.target.value, 10) || 175)}
                className="bg-secondary border-input text-sm"
              />
            </Field>
          </>
        )

      case 'custom-html':
        return (
          <>
            <Field label="Title" hint="Accessible title for the embed">
              <Input
                value={String(config.title ?? '')}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Custom Embed"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label="Height (px)" hint="Height of the embed in pixels">
              <Input
                type="number"
                min={100}
                value={String(config.height ?? 400)}
                onChange={(e) => set('height', parseInt(e.target.value, 10) || 400)}
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label="HTML / Embed Code" hint="Paste the raw HTML, script tag, or iFrame snippet here">
              <textarea
                value={String(config.html ?? '')}
                onChange={(e) => set('html', e.target.value)}
                rows={8}
                className="w-full bg-secondary border border-input rounded px-3 py-2 text-xs font-mono text-foreground resize-y"
                spellCheck={false}
                placeholder='<iframe src="https://…" width="100%" height="400"></iframe>'
              />
            </Field>
          </>
        )

      case 'discord-widget':
        return (
          <>
            <Field label={t('widgetConfig.serverId') || 'Server ID'} hint="Found in Discord Server Settings → Widget">
              <Input
                value={String(config.serverId ?? '')}
                onChange={(e) => set('serverId', e.target.value)}
                placeholder="123456789012345678"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.typeLabel') || 'Theme'}>
              <select
                value={String(config.theme ?? 'dark')}
                onChange={(e) => set('theme', e.target.value)}
                className="w-full bg-secondary border border-input rounded px-3 py-2 text-sm font-mono text-foreground"
              >
                <option value="dark">{t('widgetConfig.dark')}</option>
                <option value="light">{t('widgetConfig.light')}</option>
              </select>
            </Field>
            <Field label={t('widgetConfig.widgetHeight') || 'Height (px)'} hint="Default 500px">
              <Input
                type="number"
                min={200}
                max={1000}
                value={String(config.height ?? 500)}
                onChange={(e) => set('height', parseInt(e.target.value, 10) || 500)}
                className="bg-secondary border-input text-sm"
              />
            </Field>
          </>
        )

      case 'patreon-widget':
        return (
          <>
            <Field label="Creator Name" hint="Your name as it appears on Patreon">
              <Input
                value={String(config.creatorName ?? '')}
                onChange={(e) => set('creatorName', e.target.value)}
                placeholder="Your Name"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label="Patreon Page URL">
              <Input
                value={String(config.pageUrl ?? '')}
                onChange={(e) => set('pageUrl', e.target.value)}
                placeholder="https://www.patreon.com/yourname"
                className="bg-secondary border-input text-sm"
              />
            </Field>
          </>
        )

      case 'eventbrite-widget':
        return (
          <>
            <Field label={t('widgetConfig.organiserId') || 'Organiser ID'} hint="Your Eventbrite organiser ID (from your organiser page URL)">
              <Input
                value={String(config.organizerId ?? '')}
                onChange={(e) => set('organizerId', e.target.value)}
                placeholder="123456789"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.eventId') || 'Event ID (optional)'} hint="Leave blank to show all events for the organiser">
              <Input
                value={String(config.eventId ?? '')}
                onChange={(e) => set('eventId', e.target.value)}
                placeholder="987654321"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label={t('widgetConfig.widgetHeight') || 'Height (px)'} hint="Default 500px">
              <Input
                type="number"
                min={200}
                max={1200}
                value={String(config.height ?? 500)}
                onChange={(e) => set('height', parseInt(e.target.value, 10) || 500)}
                className="bg-secondary border-input text-sm"
              />
            </Field>
          </>
        )

      case 'setlistfm-widget':
        return (
          <>
            <Field label="Artist Name" hint="Display name for the artist">
              <Input
                value={String(config.artistName ?? '')}
                onChange={(e) => set('artistName', e.target.value)}
                placeholder="Zardonic"
                className="bg-secondary border-input text-sm"
              />
            </Field>
            <Field label="MusicBrainz ID (MBID)" hint="From the Setlist.fm artist page URL">
              <Input
                value={String(config.artistMbid ?? '')}
                onChange={(e) => set('artistMbid', e.target.value)}
                placeholder="e.g. 4b585938-f271-45e2-b19a-91215b125e38"
                className="bg-secondary border-input text-sm"
              />
            </Field>
          </>
        )

      default:
        return (
          <div className="text-sm text-muted-foreground font-mono py-4 text-center">
            <p className="text-xs opacity-70">{t('widgetConfig.noConfigAvailable')}</p>
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
                {t('widgetConfig.configure').replace('{0}', widget.name)}
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
                <X size={12} /> {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!!jsonError}
                className="text-xs gap-1 h-7"
              >
                {t('common.save')}
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
