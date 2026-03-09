import { useEffect, useRef } from 'react'

export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const lines: Array<{
      x1: number
      y1: number
      x2: number
      y2: number
      opacity: number
      type: 'horizontal' | 'vertical' | 'diagonal'
    }> = []

    for (let i = 0; i < 30; i++) {
      const type = ['horizontal', 'vertical', 'diagonal'][Math.floor(Math.random() * 3)] as 'horizontal' | 'vertical' | 'diagonal'

      if (type === 'horizontal') {
        const y = Math.random() * canvas.height
        lines.push({
          x1: 0,
          y1: y,
          x2: canvas.width,
          y2: y,
          opacity: 0.02 + Math.random() * 0.05,
          type
        })
      } else if (type === 'vertical') {
        const x = Math.random() * canvas.width
        lines.push({
          x1: x,
          y1: 0,
          x2: x,
          y2: canvas.height,
          opacity: 0.02 + Math.random() * 0.05,
          type
        })
      } else {
        lines.push({
          x1: Math.random() * canvas.width,
          y1: 0,
          x2: Math.random() * canvas.width,
          y2: canvas.height,
          opacity: 0.02 + Math.random() * 0.05,
          type
        })
      }
    }

    let scrollY = 0

    const handleScroll = () => {
      scrollY = window.scrollY
    }

    window.addEventListener('scroll', handleScroll)

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.shadowBlur = 8
      ctx.shadowColor = 'var(--foreground)'
      ctx.globalAlpha = 0.3

      lines.forEach((line, index) => {
        const parallaxSpeed = 0.1 + (index % 3) * 0.05
        const offset = scrollY * parallaxSpeed

        ctx.strokeStyle = 'var(--primary)'
        ctx.globalAlpha = line.opacity
        ctx.lineWidth = 1

        ctx.beginPath()

        if (line.type === 'horizontal') {
          ctx.moveTo(line.x1, line.y1 + offset % canvas.height)
          ctx.lineTo(line.x2, line.y2 + offset % canvas.height)
        } else if (line.type === 'vertical') {
          ctx.moveTo(line.x1, line.y1)
          ctx.lineTo(line.x2, line.y2)
        } else {
          ctx.moveTo(line.x1, line.y1 + offset % canvas.height)
          ctx.lineTo(line.x2, line.y2 + offset % canvas.height)
        }

        ctx.stroke()
      })

      requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
        style={{ filter: 'blur(1px)' }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
    </div>
  )
}
