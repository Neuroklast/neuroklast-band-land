import { motion } from 'framer-motion'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import { Trash, Eye, CursorClick, Users, DeviceMobile, Desktop, ArrowSquareOut, Globe, Browser, Monitor, TrendUp, ChartBar, Target, MapPin, LinkSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import CyberCloseButton from '@/components/CyberCloseButton'
import { loadServerAnalytics, loadHeatmapData, resetAnalytics, loadAnalytics } from '@/lib/analytics'
import type { SiteAnalytics, DailyStats, HeatmapPoint } from '@/lib/analytics'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface StatsDashboardProps {
  open: boolean
  onClose: () => void
}

type TabId = 'overview' | 'traffic' | 'engagement' | 'heatmap' | 'utm'

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size: number; className?: string }> }[] = [
  { id: 'overview', label: 'OVERVIEW', icon: TrendUp },
  { id: 'traffic', label: 'TRAFFIC', icon: Globe },
  { id: 'engagement', label: 'ENGAGEMENT', icon: Target },
  { id: 'heatmap', label: 'HEATMAP', icon: MapPin },
  { id: 'utm', label: 'UTM BUILDER', icon: LinkSimple },
]

/** Simple bar chart for daily stats */
function MiniBarChart({ data, dataKey, color = 'bg-primary' }: { data: DailyStats[]; dataKey: keyof DailyStats; color?: string }) {
  const values = data.map(d => d[dataKey] as number)
  const max = Math.max(...values, 1)

  return (
    <div className="flex items-end gap-[2px] h-16">
      {data.map((d, i) => {
        const value = d[dataKey] as number
        const height = (value / max) * 100
        return (
          <div
            key={d.date}
            className="flex-1 min-w-[3px] group relative"
            title={`${d.date}: ${value}`}
          >
            <div
              className={`${color} opacity-70 hover:opacity-100 transition-opacity rounded-t-[1px]`}
              style={{ height: `${Math.max(height, 2)}%` }}
            />
            {i === data.length - 1 && (
              <span className="absolute -top-5 right-0 text-[8px] text-primary/60 font-mono">{value}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Stat card with icon and value */
function StatCard({ icon: Icon, label, value, sublabel }: { icon: React.ComponentType<{ size: number }>; label: string; value: number | string; sublabel?: string }) {
  return (
    <div className="border border-primary/20 bg-black/30 p-3 space-y-1">
      <div className="flex items-center gap-2 text-primary/60">
        <Icon size={14} />
        <span className="text-[10px] font-mono tracking-wider uppercase">{label}</span>
      </div>
      <p className="text-xl font-mono font-bold text-foreground">{value}</p>
      {sublabel && <p className="text-[9px] font-mono text-primary/40">{sublabel}</p>}
    </div>
  )
}

/** Top items list */
function TopList({ items, limit = 5 }: { items: Record<string, number>; limit?: number }) {
  const sorted = Object.entries(items)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)

  if (sorted.length === 0) {
    return <p className="text-[10px] text-primary/30 font-mono">NO DATA YET</p>
  }

  const max = sorted[0][1]

  return (
    <div className="space-y-1.5">
      {sorted.map(([name, count]) => (
        <div key={name} className="space-y-0.5">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-foreground/70 truncate mr-2">{name}</span>
            <span className="text-primary/60 flex-shrink-0">{count}</span>
          </div>
          <div className="h-[3px] bg-primary/10 overflow-hidden">
            <div className="h-full bg-primary/50" style={{ width: `${(count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Heatmap canvas visualization — uses full available width with 16:9 aspect ratio */
function HeatmapCanvas({ points }: { points: HeatmapPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || points.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Size canvas to container width with a comfortable aspect ratio
    const containerWidth = container.clientWidth
    const dpr = window.devicePixelRatio || 1
    const displayWidth = containerWidth
    const displayHeight = Math.round(containerWidth * 0.5625) // 16:9 aspect ratio

    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`
    ctx.scale(dpr, dpr)

    const w = displayWidth
    const h = displayHeight
    ctx.clearRect(0, 0, w, h)

    // Draw grid lines for reference
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo((w / 4) * i, 0)
      ctx.lineTo((w / 4) * i, h)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, (h / 4) * i)
      ctx.lineTo(w, (h / 4) * i)
      ctx.stroke()
    }

    // Draw grid labels
    ctx.font = '10px monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillText('TOP', 4, 14)
    ctx.fillText('BOTTOM', 4, h - 6)
    ctx.fillText('LEFT', 4, h / 2)
    ctx.textAlign = 'right'
    ctx.fillText('RIGHT', w - 4, h / 2)
    ctx.textAlign = 'left'

    // Draw each point as a radial gradient
    for (const p of points) {
      const px = p.x * w
      const py = p.y * h
      const radius = 16

      const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius)
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)')
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)')

      ctx.beginPath()
      ctx.fillStyle = gradient
      ctx.arc(px, py, radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [points])

  useEffect(() => {
    draw()
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  if (points.length === 0) {
    return <p className="text-[10px] text-primary/30 font-mono">NO HEATMAP DATA YET</p>
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="w-full border border-primary/10 bg-black/50 rounded"
      />
      <div className="flex items-center gap-4 text-[9px] font-mono text-primary/40">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: 'radial-gradient(rgba(255,0,0,0.6), rgba(255,0,0,0))' }} />
          <span>HIGH ACTIVITY</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: 'radial-gradient(rgba(255,0,0,0.2), rgba(255,0,0,0))' }} />
          <span>LOW ACTIVITY</span>
        </div>
        <span className="ml-auto">X/Y = viewport position ratio</span>
      </div>
    </div>
  )
}

/** Table showing click counts per component/element */
function ClickTable({ points }: { points: HeatmapPoint[] }) {
  const elementCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of points) {
      const key = p.el || 'unknown'
      counts[key] = (counts[key] || 0) + 1
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
  }, [points])

  if (elementCounts.length === 0) {
    return <p className="text-[10px] text-primary/30 font-mono">NO CLICK DATA YET</p>
  }

  const total = elementCounts.reduce((sum, [, c]) => sum + c, 0)

  return (
    <div className="border border-primary/10 overflow-hidden">
      <table className="w-full text-[10px] font-mono">
        <thead>
          <tr className="bg-primary/10 text-primary/70">
            <th className="text-left px-3 py-1.5 tracking-wider">ELEMENT</th>
            <th className="text-right px-3 py-1.5 tracking-wider">CLICKS</th>
            <th className="text-right px-3 py-1.5 tracking-wider">%</th>
          </tr>
        </thead>
        <tbody>
          {elementCounts.map(([el, count]) => (
            <tr key={el} className="border-t border-primary/5 hover:bg-primary/5 transition-colors">
              <td className="px-3 py-1 text-foreground/70 uppercase">{el}</td>
              <td className="px-3 py-1 text-right text-foreground/60">{count}</td>
              <td className="px-3 py-1 text-right text-primary/50">{((count / total) * 100).toFixed(1)}%</td>
            </tr>
          ))}
          <tr className="border-t border-primary/20 bg-primary/5">
            <td className="px-3 py-1 text-foreground/80 font-bold">TOTAL</td>
            <td className="px-3 py-1 text-right text-foreground/80 font-bold">{total}</td>
            <td className="px-3 py-1 text-right text-primary/60">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function StatsDashboard({ open, onClose }: StatsDashboardProps) {
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null)
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([])
  const [dataSource, setDataSource] = useState<'server' | 'local'>('server')
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  // UTM Builder state
  const [utmBase, setUtmBase] = useState('https://neuroklast.com')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [utmContent, setUtmContent] = useState('')
  const [utmTerm, setUtmTerm] = useState('')
  const [utmHistory, setUtmHistory] = useState<Array<{ url: string; campaign: string; date: string }>>(() => {
    try { return JSON.parse(localStorage.getItem('nk-utm-history') || '[]') } catch (e) { console.warn('Failed to parse UTM history:', e); return [] }
  })

  useEffect(() => {
    if (open) {
      loadServerAnalytics()
        .then(data => {
          setAnalytics(data)
          setDataSource('server')
        })
        .catch((err) => {
          console.warn('Failed to load server analytics, using local fallback:', err)
          setAnalytics(loadAnalytics())
          setDataSource('local')
        })

      loadHeatmapData()
        .then(setHeatmapPoints)
        .catch(() => setHeatmapPoints([]))
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const stats = useMemo(() => {
    if (!analytics) return null
    const totalSectionViews = Object.values(analytics.sectionViews).reduce((a, b) => a + b, 0)
    const totalInteractions = Object.values(analytics.interactions).reduce((a, b) => a + b, 0)
    const last7Days = analytics.dailyStats.slice(-7)
    const last30Days = analytics.dailyStats.slice(-30)
    const avgDailyViews = last30Days.length > 0
      ? Math.round(last30Days.reduce((a, d) => a + d.pageViews, 0) / last30Days.length)
      : 0
    const totalClicks = last30Days.reduce((a, d) => a + (d.clicks || 0), 0)
    const nonInteractionRate = analytics.totalSessions > 0
      ? Math.round((1 - totalInteractions / Math.max(analytics.totalPageViews, 1)) * 100)
      : 0

    return { totalSectionViews, totalInteractions, last7Days, last30Days, avgDailyViews, totalClicks, nonInteractionRate }
  }, [analytics])

  const generatedUrl = useMemo(() => {
    if (!utmBase) return ''
    try {
      const url = new URL(utmBase)
      if (utmSource) url.searchParams.set('utm_source', utmSource)
      if (utmMedium) url.searchParams.set('utm_medium', utmMedium)
      if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign)
      if (utmContent) url.searchParams.set('utm_content', utmContent)
      if (utmTerm) url.searchParams.set('utm_term', utmTerm)
      return url.toString()
    } catch {
      return utmBase
    }
  }, [utmBase, utmSource, utmMedium, utmCampaign, utmContent, utmTerm])

  const handleReset = async () => {
    if (window.confirm('Reset all analytics data? This cannot be undone.')) {
      await resetAnalytics()
      setAnalytics(loadAnalytics())
      setHeatmapPoints([])
    }
  }

  return (
    <CyberModalBackdrop open={open} zIndex="z-[9999]">
          <motion.div
            className="w-full max-w-5xl max-h-[90dvh] bg-card border border-primary/30 relative overflow-hidden flex flex-col"
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HUD corners */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

            {/* Header */}
            <div className="h-10 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-mono text-[10px] text-primary/70 tracking-wider uppercase">
                  SITE ANALYTICS // MARKETING DASHBOARD
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="text-destructive/60 hover:text-destructive transition-colors"
                  title="Reset analytics"
                >
                  <Trash size={16} />
                </button>
                <CyberCloseButton onClick={onClose} label="CLOSE" />
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-primary/20 bg-black/20 flex-shrink-0 overflow-x-auto">
              {TABS.map(tab => {
                const TabIcon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] tracking-wider transition-colors border-b-2 flex-shrink-0 ${
                      isActive
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-primary/40 hover:text-primary/70 hover:bg-primary/5'
                    }`}
                  >
                    <TabIcon size={12} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {analytics && stats && (
                <>
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <>
                      {/* KPI cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard
                          icon={Eye}
                          label="Page Views"
                          value={analytics.totalPageViews}
                          sublabel={`~${stats.avgDailyViews}/day avg`}
                        />
                        <StatCard
                          icon={Users}
                          label="Sessions"
                          value={analytics.totalSessions}
                          sublabel={analytics.firstTracked ? `Since ${analytics.firstTracked}` : undefined}
                        />
                        <StatCard
                          icon={ArrowSquareOut}
                          label="Section Views"
                          value={stats.totalSectionViews}
                        />
                        <StatCard
                          icon={CursorClick}
                          label="Interactions"
                          value={stats.totalInteractions}
                        />
                      </div>

                      {/* Engagement rate & bounce estimate */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard
                          icon={ChartBar}
                          label="Total Clicks"
                          value={stats.totalClicks}
                          sublabel="Last 30 days"
                        />
                        <StatCard
                          icon={Target}
                          label="Est. Bounce Rate"
                          value={`${Math.max(0, Math.min(100, stats.nonInteractionRate))}%`}
                          sublabel="Non-interaction rate (lower is better)"
                        />
                        <StatCard
                          icon={TrendUp}
                          label="Views/Session"
                          value={analytics.totalSessions > 0 ? (analytics.totalPageViews / analytics.totalSessions).toFixed(1) : '—'}
                          sublabel="Engagement depth"
                        />
                        <StatCard
                          icon={Eye}
                          label="Tracking Period"
                          value={stats.last30Days.length}
                          sublabel="Days with data"
                        />
                        <StatCard
                          icon={Users}
                          label="Newsletter Signups"
                          value={analytics.interactions['newsletter_signup'] || 0}
                          sublabel="Total signups"
                        />
                      </div>

                      {/* Daily activity mini-charts */}
                      {stats.last30Days.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                            DAILY ACTIVITY // LAST {stats.last30Days.length} DAYS
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="border border-primary/10 p-3 space-y-2">
                              <p className="text-[9px] font-mono text-primary/40">PAGE VIEWS</p>
                              <MiniBarChart data={stats.last30Days} dataKey="pageViews" color="bg-primary" />
                            </div>
                            <div className="border border-primary/10 p-3 space-y-2">
                              <p className="text-[9px] font-mono text-primary/40">SECTION VIEWS</p>
                              <MiniBarChart data={stats.last30Days} dataKey="sectionViews" color="bg-accent" />
                            </div>
                            <div className="border border-primary/10 p-3 space-y-2">
                              <p className="text-[9px] font-mono text-primary/40">INTERACTIONS</p>
                              <MiniBarChart data={stats.last30Days} dataKey="interactions" color="bg-primary/70" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Trend line chart */}
                      {stats.last30Days.length > 0 && (
                        <div className="border border-primary/20 bg-black/30 p-4 space-y-3">
                          <p className="text-[10px] font-mono text-primary/60 uppercase">Activity Trends (Last 30 Days)</p>
                          <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={stats.last30Days}>
                              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.50 0.22 25 / 0.1)" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fill: 'oklch(0.50 0.22 25 / 0.6)', fontSize: 9 }}
                                tickFormatter={(value) => value.slice(-5)}
                                stroke="oklch(0.50 0.22 25 / 0.3)"
                              />
                              <YAxis 
                                tick={{ fill: 'oklch(0.50 0.22 25 / 0.6)', fontSize: 9 }}
                                stroke="oklch(0.50 0.22 25 / 0.3)"
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'oklch(0 0 0 / 0.95)', 
                                  border: '1px solid oklch(0.50 0.22 25 / 0.5)',
                                  borderRadius: '2px',
                                  fontSize: '10px',
                                  fontFamily: 'var(--font-mono)'
                                }}
                                labelStyle={{ color: 'oklch(0.50 0.22 25)' }}
                              />
                              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }} />
                              <Line type="monotone" dataKey="pageViews" stroke="oklch(0.50 0.22 25)" strokeWidth={2} dot={{ fill: 'oklch(0.50 0.22 25)', r: 3 }} activeDot={{ r: 5 }} name="Page Views" />
                              <Line type="monotone" dataKey="sectionViews" stroke="oklch(0.60 0.24 25)" strokeWidth={2} dot={{ fill: 'oklch(0.60 0.24 25)', r: 3 }} activeDot={{ r: 5 }} name="Section Views" />
                              <Line type="monotone" dataKey="interactions" stroke="oklch(0.70 0.20 25)" strokeWidth={2} dot={{ fill: 'oklch(0.70 0.20 25)', r: 3 }} activeDot={{ r: 5 }} name="Interactions" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </>
                  )}

                  {/* TRAFFIC TAB */}
                  {activeTab === 'traffic' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Referrers */}
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                            TRAFFIC SOURCES
                          </h3>
                          <TopList items={analytics.referrers} limit={10} />
                        </div>

                        {/* Devices */}
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                            DEVICES
                          </h3>
                          <div className="flex gap-4 flex-wrap">
                            {Object.entries(analytics.devices).map(([device, count]) => (
                              <div key={device} className="flex items-center gap-2">
                                {device === 'mobile' ? <DeviceMobile size={16} className="text-primary/60" /> : <Desktop size={16} className="text-primary/60" />}
                                <div>
                                  <p className="text-xs font-mono text-foreground/80 capitalize">{device}</p>
                                  <p className="text-[9px] font-mono text-primary/40">{count} visits</p>
                                </div>
                              </div>
                            ))}
                            {Object.keys(analytics.devices).length === 0 && (
                              <p className="text-[10px] text-primary/30 font-mono">NO DATA YET</p>
                            )}
                          </div>
                        </div>

                        {/* Browsers */}
                        {analytics.browsers && Object.keys(analytics.browsers).length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                              <Browser size={12} className="inline mr-1" />BROWSERS
                            </h3>
                            <TopList items={analytics.browsers} limit={10} />
                          </div>
                        )}

                        {/* Screen Resolutions */}
                        {analytics.screenResolutions && Object.keys(analytics.screenResolutions).length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                              <Monitor size={12} className="inline mr-1" />SCREEN RESOLUTIONS
                            </h3>
                            <TopList items={analytics.screenResolutions} limit={10} />
                          </div>
                        )}

                        {/* Landing Pages */}
                        {analytics.landingPages && Object.keys(analytics.landingPages).length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                              LANDING PAGES
                            </h3>
                            <TopList items={analytics.landingPages} limit={10} />
                          </div>
                        )}
                      </div>

                      {/* Device distribution pie chart */}
                      {Object.keys(analytics.devices).length > 0 && (
                        <div className="border border-primary/20 bg-black/30 p-4 space-y-3">
                          <p className="text-[10px] font-mono text-primary/60 uppercase">Device Distribution</p>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={Object.entries(analytics.devices).map(([name, value]) => ({ name, value }))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={70}
                                fill="oklch(0.50 0.22 25)"
                                dataKey="value"
                              >
                                {Object.entries(analytics.devices).map((_, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={['oklch(0.50 0.22 25)', 'oklch(0.60 0.24 25)', 'oklch(0.45 0.18 25)'][index % 3]} 
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'oklch(0 0 0 / 0.95)', 
                                  border: '1px solid oklch(0.50 0.22 25 / 0.5)',
                                  borderRadius: '2px',
                                  fontSize: '10px',
                                  fontFamily: 'var(--font-mono)'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* UTM Marketing sources */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analytics.utmSources && Object.keys(analytics.utmSources).length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                              <Globe size={12} className="inline mr-1" />UTM SOURCES
                            </h3>
                            <TopList items={analytics.utmSources} limit={10} />
                          </div>
                        )}

                        {analytics.utmMediums && Object.keys(analytics.utmMediums).length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                              UTM MEDIUMS
                            </h3>
                            <TopList items={analytics.utmMediums} limit={10} />
                          </div>
                        )}

                        {analytics.utmCampaigns && Object.keys(analytics.utmCampaigns).length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                              UTM CAMPAIGNS
                            </h3>
                            <TopList items={analytics.utmCampaigns} limit={10} />
                          </div>
                        )}
                      </div>

                      {/* Tageszeit / Hourly visits */}
                      {analytics.hourlyVisits && Object.keys(analytics.hourlyVisits).length > 0 ? (
                        <div className="border border-primary/20 bg-black/30 p-4 space-y-3">
                          <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                            BESTE POSTING-ZEITEN
                          </h3>
                          {(() => {
                            const hourlyData = Array.from({ length: 24 }, (_, h) => ({
                              hour: `${h.toString().padStart(2, '0')}`,
                              visits: analytics.hourlyVisits?.[String(h)] || 0,
                            }))
                            const sorted = [...hourlyData].sort((a, b) => b.visits - a.visits)
                            const top3 = new Set(sorted.slice(0, 3).map(d => d.hour))
                            const bestTimes = sorted.slice(0, 3).filter(d => d.visits > 0).map(d => `${d.hour}:00`)
                            return (
                              <>
                                <ResponsiveContainer width="100%" height={160}>
                                  <BarChart data={hourlyData} barSize={8}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.50 0.22 25 / 0.1)" />
                                    <XAxis dataKey="hour" tick={{ fill: 'oklch(0.50 0.22 25 / 0.6)', fontSize: 8 }} stroke="oklch(0.50 0.22 25 / 0.3)" />
                                    <YAxis tick={{ fill: 'oklch(0.50 0.22 25 / 0.6)', fontSize: 8 }} stroke="oklch(0.50 0.22 25 / 0.3)" />
                                    <Tooltip contentStyle={{ backgroundColor: 'oklch(0 0 0 / 0.95)', border: '1px solid oklch(0.50 0.22 25 / 0.5)', borderRadius: '2px', fontSize: '10px', fontFamily: 'var(--font-mono)' }} />
                                    <Bar dataKey="visits" fill="oklch(0.50 0.22 25 / 0.6)">
                                      {hourlyData.map((entry) => (
                                        <Cell key={entry.hour} fill={top3.has(entry.hour) ? 'oklch(0.60 0.24 25)' : 'oklch(0.50 0.22 25 / 0.4)'} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                                {bestTimes.length > 0 && (
                                  <div className="space-y-1 text-[10px] font-mono text-foreground/60">
                                    <p>🕐 Beste Posting-Zeiten: {bestTimes.join(', ')} Uhr (UTC)</p>
                                    <p className="text-primary/50">→ Poste auf Instagram/Facebook ca. 30 Minuten vor dem Peak für maximale Reichweite</p>
                                  </div>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      ) : (
                        <div className="border border-primary/20 bg-black/30 p-4">
                          <h3 className="text-[10px] font-mono text-primary/50 tracking-wider mb-2">BESTE POSTING-ZEITEN</h3>
                          <p className="text-[10px] font-mono text-primary/30">Noch nicht genug Daten (min. 7 Tage)</p>
                        </div>
                      )}
                    </>
                  )}
                  {activeTab === 'engagement' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Section views */}
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                            TOP SECTIONS
                          </h3>
                          <TopList items={analytics.sectionViews} limit={10} />
                        </div>

                        {/* Interactions */}
                        <div className="space-y-3">
                          <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                            TOP INTERACTIONS
                          </h3>
                          <TopList items={analytics.interactions} limit={10} />
                        </div>
                      </div>

                      {/* Weekly comparison bar chart */}
                      {stats.last7Days.length > 0 && (
                        <div className="border border-primary/20 bg-black/30 p-4 space-y-3">
                          <p className="text-[10px] font-mono text-primary/60 uppercase">Weekly Comparison (Last 7 Days)</p>
                          <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={stats.last7Days}>
                              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.50 0.22 25 / 0.1)" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fill: 'oklch(0.50 0.22 25 / 0.6)', fontSize: 9 }}
                                tickFormatter={(value) => value.slice(-5)}
                                stroke="oklch(0.50 0.22 25 / 0.3)"
                              />
                              <YAxis 
                                tick={{ fill: 'oklch(0.50 0.22 25 / 0.6)', fontSize: 9 }}
                                stroke="oklch(0.50 0.22 25 / 0.3)"
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'oklch(0 0 0 / 0.95)', 
                                  border: '1px solid oklch(0.50 0.22 25 / 0.5)',
                                  borderRadius: '2px',
                                  fontSize: '10px',
                                  fontFamily: 'var(--font-mono)'
                                }}
                                labelStyle={{ color: 'oklch(0.50 0.22 25)' }}
                              />
                              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }} />
                              <Bar dataKey="pageViews" fill="oklch(0.50 0.22 25 / 0.8)" name="Page Views" />
                              <Bar dataKey="sectionViews" fill="oklch(0.60 0.24 25 / 0.8)" name="Section Views" />
                              <Bar dataKey="interactions" fill="oklch(0.70 0.20 25 / 0.8)" name="Interactions" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Social click tracking */}
                      <div className="space-y-3 md:col-span-2">
                        <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                          SOCIAL KLICK-TRACKING
                        </h3>
                        {(() => {
                          const socialData = Object.fromEntries(
                            Object.entries(analytics.interactions)
                              .filter(([k]) => k.startsWith('social_click_'))
                              .map(([k, v]) => [k.replace('social_click_', ''), v])
                          )
                          if (Object.keys(socialData).length === 0) {
                            return <p className="text-[10px] text-primary/30 font-mono">Noch keine Social-Klicks getrackt</p>
                          }
                          return <TopList items={socialData} limit={10} />
                        })()}
                      </div>
                    </>
                  )}
                  {activeTab === 'heatmap' && (
                    <>
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                          CLICK HEATMAP // {heatmapPoints.length} POINTS
                        </h3>
                        <p className="text-[9px] font-mono text-primary/30">
                          Shows where users click on the page. Red areas = more clicks. X axis = horizontal position, Y axis = vertical scroll position.
                        </p>
                        <HeatmapCanvas points={heatmapPoints} />
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                          CLICKS BY ELEMENT TYPE
                        </h3>
                        <ClickTable points={heatmapPoints} />
                      </div>
                    </>
                  )}

                  {/* UTM BUILDER TAB */}
                  {activeTab === 'utm' && (
                    <>
                      {/* UTM Link Generator */}
                      <div className="border border-primary/20 bg-black/30 p-4 space-y-4">
                        <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">UTM LINK GENERATOR</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-primary/50">Base URL *</label>
                            <input
                              type="url"
                              value={utmBase}
                              onChange={e => setUtmBase(e.target.value)}
                              className="w-full bg-transparent border border-primary/30 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                              placeholder="https://neuroklast.com"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-primary/50">utm_source *</label>
                            <input
                              type="text"
                              value={utmSource}
                              onChange={e => setUtmSource(e.target.value)}
                              className="w-full bg-transparent border border-primary/30 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                              placeholder="instagram"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-primary/50">utm_medium</label>
                            <input
                              type="text"
                              value={utmMedium}
                              onChange={e => setUtmMedium(e.target.value)}
                              className="w-full bg-transparent border border-primary/30 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                              placeholder="social"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-primary/50">utm_campaign</label>
                            <input
                              type="text"
                              value={utmCampaign}
                              onChange={e => setUtmCampaign(e.target.value)}
                              className="w-full bg-transparent border border-primary/30 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                              placeholder="release-2025"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-primary/50">utm_content</label>
                            <input
                              type="text"
                              value={utmContent}
                              onChange={e => setUtmContent(e.target.value)}
                              className="w-full bg-transparent border border-primary/30 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                              placeholder="banner-top"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-primary/50">utm_term</label>
                            <input
                              type="text"
                              value={utmTerm}
                              onChange={e => setUtmTerm(e.target.value)}
                              className="w-full bg-transparent border border-primary/30 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                              placeholder="techno"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-primary/50">GENERIERTER LINK</label>
                          <textarea
                            readOnly
                            value={generatedUrl}
                            className="w-full bg-transparent border border-primary/20 px-3 py-2 text-[10px] font-mono text-foreground/70 resize-none focus:outline-none"
                            rows={3}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (!generatedUrl) return
                                navigator.clipboard.writeText(generatedUrl).then(() => {
                                  toast('Link kopiert!')
                                  if (utmSource) {
                                    const entry = { url: generatedUrl, campaign: utmCampaign || utmSource, date: new Date().toLocaleDateString('de-DE') }
                                    setUtmHistory(prev => {
                                      const updated = [entry, ...prev].slice(0, 10)
                                      try { localStorage.setItem('nk-utm-history', JSON.stringify(updated)) } catch (e) { console.warn('Failed to save UTM history:', e) }
                                      return updated
                                    })
                                  }
                                }).catch(() => {})
                              }}
                              className="px-3 py-1.5 bg-primary/20 border border-primary/50 text-primary text-[10px] font-mono tracking-wider hover:bg-primary/30 transition-colors"
                            >
                              KOPIEREN
                            </button>
                          </div>
                          <p className="text-[9px] font-mono text-primary/30">Tipp: Nutze einen QR-Code-Generator für Flyer/Merch</p>
                        </div>
                      </div>

                      {/* Gespeicherte Kampagnen */}
                      <div className="border border-primary/20 bg-black/30 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">GESPEICHERTE KAMPAGNEN</h3>
                          {utmHistory.length > 0 && (
                            <button
                              onClick={() => {
                                try { localStorage.removeItem('nk-utm-history') } catch (e) { console.warn('Failed to clear UTM history:', e) }
                                setUtmHistory([])
                              }}
                              className="text-[9px] font-mono text-destructive/60 hover:text-destructive transition-colors"
                            >
                              Verlauf löschen
                            </button>
                          )}
                        </div>
                        {utmHistory.length === 0 ? (
                          <p className="text-[10px] text-primary/30 font-mono">Noch keine Kampagnen gespeichert</p>
                        ) : (
                          <div className="space-y-2">
                            {utmHistory.map((entry, i) => (
                              <div key={i} className="flex items-center justify-between border border-primary/10 px-3 py-2">
                                <div>
                                  <p className="text-[10px] font-mono text-foreground/70">{entry.campaign || '—'}</p>
                                  <p className="text-[9px] font-mono text-primary/40">{entry.date}</p>
                                </div>
                                <button
                                  onClick={() => navigator.clipboard.writeText(entry.url).then(() => toast('Link kopiert!')).catch(() => {})}
                                  className="text-[9px] font-mono text-primary/50 hover:text-primary transition-colors border border-primary/20 px-2 py-1"
                                >
                                  COPY
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* UTM Performance */}
                      {analytics && (
                        <div className="border border-primary/20 bg-black/30 p-4 space-y-4">
                          <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">KAMPAGNEN-PERFORMANCE (Live)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {analytics.utmSources && Object.keys(analytics.utmSources).length > 0 && (
                              <div className="space-y-2">
                                <p className="text-[9px] font-mono text-primary/40 uppercase">UTM Sources</p>
                                <TopList items={analytics.utmSources} limit={10} />
                              </div>
                            )}
                            {analytics.utmMediums && Object.keys(analytics.utmMediums).length > 0 && (
                              <div className="space-y-2">
                                <p className="text-[9px] font-mono text-primary/40 uppercase">UTM Mediums</p>
                                <TopList items={analytics.utmMediums} limit={10} />
                              </div>
                            )}
                            {analytics.utmCampaigns && Object.keys(analytics.utmCampaigns).length > 0 && (
                              <div className="space-y-2">
                                <p className="text-[9px] font-mono text-primary/40 uppercase">UTM Campaigns</p>
                                <TopList items={analytics.utmCampaigns} limit={10} />
                              </div>
                            )}
                            {(!analytics.utmSources || Object.keys(analytics.utmSources).length === 0) &&
                             (!analytics.utmMediums || Object.keys(analytics.utmMediums).length === 0) &&
                             (!analytics.utmCampaigns || Object.keys(analytics.utmCampaigns).length === 0) && (
                              <p className="text-[10px] text-primary/30 font-mono md:col-span-3">Noch keine UTM-Daten vorhanden</p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Footer */}
              <div className="flex items-center gap-2 text-[9px] text-primary/40 pt-2 border-t border-primary/10">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                <span>ANALYTICS MODULE ACTIVE</span>
                <span className="ml-auto">
                  {dataSource === 'server' ? 'Data from persistent server storage' : 'Data stored locally in browser'}
                </span>
              </div>
            </div>
          </motion.div>
    </CyberModalBackdrop>
  )
}
