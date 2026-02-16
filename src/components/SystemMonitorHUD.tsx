import { useEffect, useState } from 'react'
import { get } from '@/lib/config'

interface SystemMetrics {
  timestamp: string
  pseudoIp: string
  uptime: string
  sector: string
  scrollSpeed: number
}

/**
 * SystemMonitorHUD - Displays system metadata in corners like an active CRT monitor
 * Shows timestamps, pseudo-IP, uptime, sector designation, and scroll speed
 */
export function SystemMonitorHUD() {
  const [enabled, setEnabled] = useState(true)
  const [metrics, setMetrics] = useState<SystemMetrics>({
    timestamp: '',
    pseudoIp: '192.168.7.42',
    uptime: '00:00:00',
    sector: '7-B',
    scrollSpeed: 0,
  })

  const [startTime] = useState(Date.now())
  const [lastScrollPos, setLastScrollPos] = useState(0)
  const [lastScrollTime, setLastScrollTime] = useState(Date.now())

  useEffect(() => {
    const isEnabled = get('HUD_METADATA_ENABLED')
    setEnabled(Boolean(isEnabled))
  }, [])

  useEffect(() => {
    if (!enabled) return

    const updateInterval = get('HUD_METADATA_UPDATE_INTERVAL_MS')

    const updateMetrics = () => {
      const now = new Date()
      const uptime = Date.now() - startTime
      const hours = Math.floor(uptime / 3600000)
      const minutes = Math.floor((uptime % 3600000) / 60000)
      const seconds = Math.floor((uptime % 60000) / 1000)

      setMetrics((prev) => ({
        ...prev,
        timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
        uptime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      }))
    }

    const intervalId = setInterval(updateMetrics, updateInterval)
    updateMetrics()

    return () => clearInterval(intervalId)
  }, [enabled, startTime])

  useEffect(() => {
    if (!enabled) return

    const handleScroll = () => {
      const now = Date.now()
      const currentScrollPos = window.scrollY
      const timeDiff = (now - lastScrollTime) / 1000 // Convert to seconds
      const scrollDiff = Math.abs(currentScrollPos - lastScrollPos)
      
      if (timeDiff > 0.1) {
        // Calculate scroll speed in pixels per second, then convert to "KB/s" aesthetic
        const speed = Math.round((scrollDiff / timeDiff) / 10)
        setMetrics((prev) => ({
          ...prev,
          scrollSpeed: speed,
        }))
        setLastScrollPos(currentScrollPos)
        setLastScrollTime(now)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enabled, lastScrollPos, lastScrollTime])

  if (!enabled) return null

  const showTimestamp = get('HUD_SHOW_TIMESTAMP')
  const showPseudoIp = get('HUD_SHOW_PSEUDO_IP')
  const showUptime = get('HUD_SHOW_UPTIME')
  const showSector = get('HUD_SHOW_SECTOR')
  const showScrollSpeed = get('HUD_SHOW_SCROLL_SPEED')

  return (
    <>
      {/* Top Left Corner */}
      <div className="pointer-events-none fixed left-2 top-2 z-40 font-mono text-[9px] leading-tight tracking-wider text-primary/60 sm:left-4 sm:top-4 sm:text-[10px]">
        {showTimestamp && (
          <div className="animate-pulse">
            <span className="text-primary/40">SYS_TIME:</span> {metrics.timestamp}
          </div>
        )}
        {showPseudoIp && (
          <div className="mt-1">
            <span className="text-primary/40">NODE_IP:</span> {metrics.pseudoIp}
          </div>
        )}
      </div>

      {/* Top Right Corner */}
      <div className="pointer-events-none fixed right-2 top-2 z-40 font-mono text-[9px] leading-tight tracking-wider text-primary/60 sm:right-4 sm:top-4 sm:text-[10px]">
        {showUptime && (
          <div className="text-right">
            <span className="text-primary/40">UPTIME:</span> {metrics.uptime}
          </div>
        )}
        {showSector && (
          <div className="mt-1 text-right">
            <span className="text-primary/40">SECTOR:</span> {metrics.sector}
          </div>
        )}
      </div>

      {/* Bottom Right Corner */}
      {showScrollSpeed && (
        <div className="pointer-events-none fixed bottom-2 right-2 z-40 font-mono text-[9px] leading-tight tracking-wider text-primary/60 sm:bottom-4 sm:right-4 sm:text-[10px]">
          <div className="text-right">
            <span className="text-primary/40">DATA_RATE:</span> {metrics.scrollSpeed} KB/s
          </div>
        </div>
      )}
    </>
  )
}
