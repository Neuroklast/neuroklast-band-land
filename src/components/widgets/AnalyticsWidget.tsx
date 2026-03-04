/**
 * AnalyticsWidget — Visitor stats dashboard (demo data).
 *
 * Config: {}
 * Premium-Gate: Only available for pro tier or higher.
 */
import type { WidgetPlugin, ThemeSettings } from '@/lib/types'

interface AnalyticsWidgetProps {
  widget: WidgetPlugin
  themeSettings?: ThemeSettings
}

const DEMO_STATS = [
  { label: 'Visitors Today', value: '1,247', trend: '+12%', up: true },
  { label: 'Page Views', value: '3,891', trend: '+8%', up: true },
  { label: 'Avg. Session', value: '2m 34s', trend: '-3%', up: false },
  { label: 'Bounce Rate', value: '41.2%', trend: '-5%', up: true },
]

const DEMO_BARS = [40, 65, 45, 80, 60, 90, 55, 75, 50, 85, 70, 95, 60, 45, 80, 65, 55, 70, 88, 72, 50, 63, 77, 84, 58, 71, 49, 93, 66, 78]

export default function AnalyticsWidget({ themeSettings }: AnalyticsWidgetProps) {
  const primary = themeSettings?.primary ?? 'oklch(0.50 0.22 25)'
  const borderRadius = themeSettings?.borderRadius ?? 0.125
  const radiusPx = Math.round(borderRadius * 16)

  return (
    <div className="w-full space-y-4 font-mono">
      {/* Demo notice */}
      <p className="text-[10px] text-muted-foreground/60 text-right uppercase tracking-wider">
        Demo data — connect analytics to see real stats
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DEMO_STATS.map((stat) => (
          <div
            key={stat.label}
            className="border bg-card/50 p-3 space-y-1"
            style={{
              borderColor: `color-mix(in oklch, ${primary} 20%, transparent)`,
              borderRadius: `${radiusPx}px`,
            }}
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-bold" style={{ color: primary }}>{stat.value}</p>
            <p className={`text-[10px] ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
              {stat.trend} vs last week
            </p>
          </div>
        ))}
      </div>

      {/* Bar chart (demo) */}
      <div
        className="border bg-card/30 p-4"
        style={{
          borderColor: `color-mix(in oklch, ${primary} 15%, transparent)`,
          borderRadius: `${radiusPx}px`,
        }}
      >
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">
          Daily Visitors (Last 30 days)
        </p>
        <div className="flex items-end gap-0.5 h-16">
          {DEMO_BARS.map((h, i) => (
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
