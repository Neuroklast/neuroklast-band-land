import { useEffect, useRef, memo } from 'react'
import {
  getCanvasDpr,
  shouldSkipFrame,
  subscribeScrollActivity,
  targetFpsForRuntime,
} from '@/lib/canvas-perf'

interface Star {
  x: number
  y: number
  z: number
  pz: number
}

/**
 * StarField – Canvas-based warp-speed star field.
 * Stars fly towards the viewer giving a hyperspace feel.
 * Respects `prefers-reduced-motion` and pauses when the tab is hidden.
 */
interface StarFieldProps {
  transparent?: boolean
  /** Number of stars (50–500). Default 200. */
  starCount?: number
  /** Speed multiplier (0.5–3). Default 1. */
  starSpeed?: number
  perfMode?: boolean
}

const StarField = memo(function StarField({ transparent, starCount = 200, starSpeed = 1, perfMode = false }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return

    const NUM_STARS = Math.max(50, Math.min(500, starCount))
    let animId: number
    let stars: Star[] = []
    let cx = 0
    let cy = 0
    let cssW = 0
    let cssH = 0
    let lastDraw = 0
    let isScrolling = false
    const unsubscribeScroll = subscribeScrollActivity((scrolling) => { isScrolling = scrolling })
    const dpr = getCanvasDpr(perfMode)
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary').trim() || '#cc3300'
    const supportsColorMix = typeof CSS !== 'undefined' &&
      CSS.supports('color', 'color-mix(in srgb, red 50%, blue)')

    const resize = () => {
      cssW = window.innerWidth
      cssH = window.innerHeight
      canvas.width = Math.floor(cssW * dpr)
      canvas.height = Math.floor(cssH * dpr)
      canvas.style.width = cssW + 'px'
      canvas.style.height = cssH + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cx = cssW / 2
      cy = cssH / 2
    }

    const initStars = () => {
      stars = Array.from({ length: NUM_STARS }, () => ({
        x: (Math.random() - 0.5) * cssW,
        y: (Math.random() - 0.5) * cssH,
        z: Math.random() * cssW,
        pz: 0,
      }))
      stars.forEach(s => { s.pz = s.z })
    }

    resize()
    initStars()
    const handleResize = () => { resize(); initStars() }
    window.addEventListener('resize', handleResize)

    const baseSpeed = 6 * starSpeed

    let running = !document.hidden
    const draw = (now: number) => {
      if (!running) return
      if (shouldSkipFrame(lastDraw, now, targetFpsForRuntime(perfMode, isScrolling))) {
        animId = requestAnimationFrame(draw)
        return
      }
      const timeScale = lastDraw ? Math.min(2, (now - lastDraw) / (1000 / 30)) : 1
      lastDraw = now

      // Clear or fade: in transparent (overlay) mode clear the canvas so the
      // background image shows through; otherwise use a semi-transparent fill
      // to create the motion-blur trail effect.
      if (transparent) {
        ctx.clearRect(0, 0, cssW, cssH)
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.fillRect(0, 0, cssW, cssH)
      }

      stars.forEach(star => {
        star.pz = star.z
        star.z -= baseSpeed * timeScale

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * cssW
          star.y = (Math.random() - 0.5) * cssH
          star.z = cssW
          star.pz = star.z
        }

        const sx = (star.x / star.z) * cssW + cx
        const sy = (star.y / star.z) * cssH + cy
        const px = (star.x / star.pz) * cssW + cx
        const py = (star.y / star.pz) * cssH + cy

        const size = Math.max(0.5, (1 - star.z / cssW) * 3)

        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx, sy)
        ctx.strokeStyle = supportsColorMix
          ? `color-mix(in srgb, ${primaryColor} 60%, white)`
          : primaryColor
        ctx.lineWidth = size
        ctx.globalAlpha = (1 - star.z / cssW) * 0.8
        ctx.stroke()
        ctx.globalAlpha = 1
      })

      animId = requestAnimationFrame(draw)
    }

    const handleVisibility = () => {
      running = !document.hidden
      if (!running) cancelAnimationFrame(animId)
      else {
        lastDraw = 0
        animId = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    if (running) animId = requestAnimationFrame(draw)

    return () => {
      running = false
      cancelAnimationFrame(animId)
      unsubscribeScroll()
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [transparent, starCount, starSpeed, perfMode])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-30"
      aria-hidden="true"
    />
  )
})

export default StarField
