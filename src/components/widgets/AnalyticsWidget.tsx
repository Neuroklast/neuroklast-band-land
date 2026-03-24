/**
 * AnalyticsWidget — Visitor stats dashboard.
 *
 * Fetches real data from /api/analytics (GET, admin-scoped).
 * Falls back to demo data with a clear "DEMO" label when the API is
 * unavailable (KV not configured → 503) or returns an error.
 *
 * Config: {}
 * Premium-Gate: Only available for pro tier or higher.
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'
import { useLocale } from '@/hooks/use-locale'

interface DailyStats {
  date: string
  pageViews: number
  sectionViews: number
  interactions: number
}

export interface SiteAnalytics {
  totalPageViews: number
  totalSessions: number
  avgSessionDurationMs?: number
  bounceRate?: number
  dailyStats: DailyStats[]
}

interface AnalyticsWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
  analytics: SiteAnalytics | null
  loading: boolean
  isDemo: boolean
}

const DEMO_BARS = [40, 65, 45, 80, 60, 90, 55, 75, 50, 85, 70, 95, 60, 45, 80, 65, 55, 70, 88, 72, 50, 63, 77, 84, 58, 71, 49, 93, 66, 78]

/** Format a duration in milliseconds as "Xm Ys". */
function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}m ${sec}s`
}

/** Format a rate (0–1) as a percentage string. */
function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

export default function AnalyticsWidget({ widget, themeSettings, analytics, loading, isDemo }: AnalyticsWidgetProps) {
  const { t } = useLocale()
  const primary = themeSettings?.primary ?? 'oklch(0.50 0.22 25)'
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  // Suppress unused-variable warning while keeping the prop in the signature.
  // `widget.config` is intentionally not read here — the analytics data is
  // fetched from the API and the widget config has no user-configurable options.
  void widget.config

  const cardStyle = {
    borderColor: `color-mix(in oklch, ${primary} 20%, transparent)`,
    borderRadius: `${radiusPx}px`,
  }
  const chartStyle = {
    borderColor: `color-mix(in oklch, ${primary} 15%, transparent)`,
    borderRadius: `${radiusPx}px`,
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full space-y-4 font-mono">
        <p className="text-[10px] text-muted-foreground/60 text-right uppercase tracking-wider animate-pulse">
          {t('common.loading')}…
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border bg-card/50 p-3 h-16 animate-pulse" style={cardStyle} />
          ))}
        </div>
        <div className="border bg-card/30 p-4 h-28 animate-pulse" style={chartStyle} />
      </div>
    )
  }

  // ── Real stats ──────────────────────────────────────────────────────────────
  const stats = analytics
    ? [
        {
          label: t('widget.analytics.statPageViews'),
          value: analytics.totalPageViews.toLocaleString(),
          up: true,
        },
        {
          label: t('widget.analytics.statSessions'),
          value: analytics.totalSessions.toLocaleString(),
          up: true,
        },
        {
          label: t('widget.analytics.statAvgSession'),
          value: analytics.avgSessionDurationMs != null
            ? formatDuration(analytics.avgSessionDurationMs)
            : '—',
          up: true,
        },
        {
          label: t('widget.analytics.statBounceRate'),
          value: analytics.bounceRate != null
            ? formatRate(analytics.bounceRate)
            : '—',
          up: false,
        },
      ]
    : null

  // ── Bar heights from last 30 days of real data (or demo) ────────────────────
  const bars: number[] = (() => {
    if (analytics?.dailyStats && analytics.dailyStats.length > 0) {
      const last30 = analytics.dailyStats.slice(-30)
      const maxViews = Math.max(...last30.map((d) => d.pageViews), 1)
      return last30.map((d) => Math.max(5, Math.round((d.pageViews / maxViews) * 100)))
    }
    return DEMO_BARS
  })()

  return (
    <div className="w-full space-y-4 font-mono">
      {/* Notice row */}
      <p className="text-[10px] text-muted-foreground/60 text-right uppercase tracking-wider">
        {isDemo ? t('widget.analytics.demoNotice') : t('widget.analytics.liveNotice')}
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(stats ?? [
          { label: t('widget.analytics.statPageViews'), value: '3,891', up: true },
          { label: t('widget.analytics.statSessions'), value: '1,247', up: true },
          { label: t('widget.analytics.statAvgSession'), value: '2m 34s', up: true },
          { label: t('widget.analytics.statBounceRate'), value: '41.2%', up: false },
        ]).map((stat) => (
          <div key={stat.label} className="border bg-card/50 p-3 space-y-1" style={cardStyle}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-bold" style={{ color: primary }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="border bg-card/30 p-4" style={chartStyle}>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">
          {t('widget.analytics.dailyVisitors')}
        </p>
        <div className="flex items-end gap-0.5 h-16">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 transition-all"
              style={{
                height: `${h}%`,
                background: `color-mix(in oklch, ${primary} ${40 + h * 0.4}%, transparent)`,
                borderRadius: '2px 2px 0 0',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
