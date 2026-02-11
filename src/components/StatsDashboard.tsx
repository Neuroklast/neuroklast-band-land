import { motion, AnimatePresence } from 'framer-motion'
import { Trash, Eye, CursorClick, Users, DeviceMobile, Desktop, ArrowSquareOut, Globe, Browser, Monitor } from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import { loadServerAnalytics, loadHeatmapData, resetAnalytics, loadAnalytics } from '@/lib/analytics'
import type { SiteAnalytics, DailyStats, HeatmapPoint } from '@/lib/analytics'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

interface StatsDashboardProps {
  open: boolean
  onClose: () => void
}

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

/** Heatmap canvas visualization */
function HeatmapCanvas({ points }: { points: HeatmapPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || points.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // Draw each point as a radial gradient
    for (const p of points) {
      const px = p.x * w
      const py = p.y * h
      const radius = 12

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
  }, [draw])

  if (points.length === 0) {
    return <p className="text-[10px] text-primary/30 font-mono">NO HEATMAP DATA YET</p>
  }

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="w-full h-48 border border-primary/10 bg-black/50 rounded"
    />
  )
}

export default function StatsDashboard({ open, onClose }: StatsDashboardProps) {
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null)
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([])
  const [dataSource, setDataSource] = useState<'server' | 'local'>('server')

  useEffect(() => {
    if (open) {
      // Try loading from server first, fall back to localStorage
      loadServerAnalytics()
        .then(data => {
          setAnalytics(data)
          setDataSource('server')
        })
        .catch(() => {
          setAnalytics(loadAnalytics())
          setDataSource('local')
        })

      loadHeatmapData()
        .then(setHeatmapPoints)
        .catch(() => setHeatmapPoints([]))
    }
  }, [open])

  const stats = useMemo(() => {
    if (!analytics) return null
    const totalSectionViews = Object.values(analytics.sectionViews).reduce((a, b) => a + b, 0)
    const totalInteractions = Object.values(analytics.interactions).reduce((a, b) => a + b, 0)
    const last7Days = analytics.dailyStats.slice(-7)
    const last30Days = analytics.dailyStats.slice(-30)
    const avgDailyViews = last30Days.length > 0
      ? Math.round(last30Days.reduce((a, d) => a + d.pageViews, 0) / last30Days.length)
      : 0

    return { totalSectionViews, totalInteractions, last7Days, last30Days, avgDailyViews }
  }, [analytics])

  const handleReset = async () => {
    if (window.confirm('Reset all analytics data? This cannot be undone.')) {
      await resetAnalytics()
      setAnalytics(loadAnalytics())
      setHeatmapPoints([])
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 hud-scanline opacity-20 pointer-events-none" />

          <motion.div
            className="w-full max-w-4xl max-h-[85dvh] bg-card border border-primary/30 relative overflow-hidden flex flex-col"
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
                  SITE ANALYTICS // ADMIN DASHBOARD
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {analytics && stats && (
                <>
                  {/* Overview stats */}
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

                  {/* Daily charts */}
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

                  {/* Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Section views */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                        TOP SECTIONS
                      </h3>
                      <TopList items={analytics.sectionViews} />
                    </div>

                    {/* Interactions */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                        TOP INTERACTIONS
                      </h3>
                      <TopList items={analytics.interactions} />
                    </div>

                    {/* Referrers */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                        TRAFFIC SOURCES
                      </h3>
                      <TopList items={analytics.referrers} />
                    </div>

                    {/* Devices */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                        DEVICES
                      </h3>
                      <div className="flex gap-4">
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
                        <TopList items={analytics.browsers} />
                      </div>
                    )}

                    {/* Screen Resolutions */}
                    {analytics.screenResolutions && Object.keys(analytics.screenResolutions).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                          <Monitor size={12} className="inline mr-1" />SCREEN RESOLUTIONS
                        </h3>
                        <TopList items={analytics.screenResolutions} />
                      </div>
                    )}

                    {/* Landing Pages */}
                    {analytics.landingPages && Object.keys(analytics.landingPages).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                          LANDING PAGES
                        </h3>
                        <TopList items={analytics.landingPages} />
                      </div>
                    )}

                    {/* UTM Sources */}
                    {analytics.utmSources && Object.keys(analytics.utmSources).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                          <Globe size={12} className="inline mr-1" />UTM SOURCES
                        </h3>
                        <TopList items={analytics.utmSources} />
                      </div>
                    )}

                    {/* UTM Campaigns */}
                    {analytics.utmCampaigns && Object.keys(analytics.utmCampaigns).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                          UTM CAMPAIGNS
                        </h3>
                        <TopList items={analytics.utmCampaigns} />
                      </div>
                    )}
                  </div>

                  {/* Heatmap */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-mono text-primary/50 tracking-wider">
                      CLICK HEATMAP // {heatmapPoints.length} POINTS
                    </h3>
                    <HeatmapCanvas points={heatmapPoints} />
                  </div>
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
