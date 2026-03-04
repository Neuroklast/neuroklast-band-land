/**
 * YouTubeWidget — Responsive YouTube iFrame embed.
 *
 * Config: { videoId?: string, playlistId?: string }
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'

interface YouTubeConfig {
  videoId?: string
  playlistId?: string
}

interface YouTubeWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

export default function YouTubeWidget({ widget, themeSettings }: YouTubeWidgetProps) {
  const config = (widget.config ?? {}) as YouTubeConfig
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  if (!config.videoId && !config.playlistId) {
    return (
      <div
        className="border border-primary/20 rounded p-6 text-center font-mono text-sm text-muted-foreground bg-card/30"
      >
        <div className="text-2xl mb-2">📺</div>
        <p className="font-semibold mb-1">YouTube Embed</p>
        <p className="text-xs opacity-70">
          Configure a Video ID or Playlist ID to embed YouTube content.
        </p>
      </div>
    )
  }

  let embedUrl: string
  if (config.videoId) {
    embedUrl = `https://www.youtube.com/embed/${config.videoId}`
  } else {
    embedUrl = `https://www.youtube.com/embed/videoseries?list=${config.playlistId}`
  }

  return (
    <div className="w-full relative" style={{ paddingBottom: '56.25%', height: 0 }}>
      <iframe
        src={embedUrl}
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: `${radiusPx}px`,
        }}
      />
    </div>
  )
}
