import { createClient } from '@/lib/supabaseServer'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { AdminPageHeader } from '@/app/admin/_components/AdminPageHeader'
import { AnalyticsSettings } from './AnalyticsSettings'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { checkAdminReadError, loadAdminData } from '@/lib/admin-read-state'
import { AdminDataUnavailable } from '@/app/admin/_components/AdminDataUnavailable'
import {
  buildAnalyticsInsights,
  type AnalyticsEventRow,
} from '@/lib/analytics-insights'
import {
  ChartBar,
  Disc,
  Images,
  Calendar,
  Users,
} from '@phosphor-icons/react/dist/ssr'

const RANGE_DAYS = 30
const MAX_EVENTS = 5000

interface ContentCounts {
  releases: number
  gigs: number
  gallery: number
  partners: number
  socialLinks: number
}

async function fetchCounts(): Promise<ContentCounts> {
    const supabase = await createClient()
    const [r, g, gal, p, sl] = await Promise.all([
      supabase.from('releases').select('id', { count: 'exact', head: true }),
      supabase.from('gigs').select('id', { count: 'exact', head: true }),
      supabase.from('gallery').select('id', { count: 'exact', head: true }),
      supabase.from('partners').select('id', { count: 'exact', head: true }),
      supabase.from('social_links').select('id', { count: 'exact', head: true }),
    ])
    for (const [name, result] of [
      ['releases', r], ['gigs', g], ['gallery', gal], ['partners', p], ['social_links', sl],
    ] as const) checkAdminReadError(result.error, 'analytics ' + name)
    return {
      releases: r.count ?? 0,
      gigs: g.count ?? 0,
      gallery: gal.count ?? 0,
      partners: p.count ?? 0,
      socialLinks: sl.count ?? 0,
    }
}

async function fetchAnalyticsConfig(): Promise<Record<string, unknown>> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('site_config').select('value').eq('key', 'analytics').maybeSingle()
  checkAdminReadError(error, 'analytics config')
  return (data?.value as Record<string, unknown>) ?? {}
}

async function fetchAnalyticsEvents(): Promise<AnalyticsEventRow[]> {
    const since = new Date()
    since.setUTCDate(since.getUTCDate() - RANGE_DAYS)

    // Service role: analytics_events is insert-only from public; admin needs read.
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('analytics_events')
      .select('id, type, target, meta, heatmap, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(MAX_EVENTS)

    checkAdminReadError(error, 'analytics events')

    return (data ?? []).map((row: {
      id: string
      type: string
      target: string | null
      meta: unknown
      heatmap: unknown
      created_at: string
    }) => ({
      id: String(row.id),
      type: String(row.type),
      target: row.target == null ? null : String(row.target),
      meta: (row.meta as Record<string, unknown> | null) ?? null,
      heatmap: (row.heatmap as AnalyticsEventRow['heatmap']) ?? null,
      created_at: String(row.created_at),
    }))
}

export default async function AnalyticsPage() {
  const loaded = await loadAdminData('analytics', () => Promise.all([
    fetchCounts(),
    fetchAnalyticsConfig(),
    fetchAnalyticsEvents(),
  ]))
  if (!loaded.ok) return <AdminDataUnavailable title="Analytics" href="/admin/analytics" />
  const [counts, analyticsConfig, events] = loaded.data

  const insights = buildAnalyticsInsights(events, RANGE_DAYS)

  const stats = [
    { icon: Disc, label: 'Releases', value: counts.releases, href: '/admin/releases' },
    { icon: Calendar, label: 'Events', value: counts.gigs, href: '/admin/gigs' },
    { icon: Images, label: 'Gallery Images', value: counts.gallery, href: '/admin/gallery' },
    { icon: Users, label: 'Partners', value: counts.partners, href: '/admin/partners' },
    { icon: ChartBar, label: 'Social Links', value: counts.socialLinks, href: '/admin/social' },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Traffic, heatmaps, content stats, and tracking settings. Consent-gated first-party data only."
      />

      <section className="mb-10">
        <AnalyticsDashboard
          insights={insights}
          sampleSize={events.length}
          rangeDays={RANGE_DAYS}
        />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-zinc-300">Content overview</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <a
                key={s.label}
                href={s.href}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-600"
              >
                <div className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {s.label}
                </div>
                <div className="font-mono text-2xl font-bold text-white">{s.value}</div>
              </a>
            )
          })}
        </div>
      </section>

      <AnalyticsSettings initialConfig={analyticsConfig} />
    </div>
  )
}
