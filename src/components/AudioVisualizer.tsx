import { useEffect, useRef, useState } from 'react'

export default function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [bars] = useState<Array<{
    height: number
    speed: number
    phase: number
    glitchOffset: number
    glitchTime: number
  }>>(() => 
    Array.from({ length: 40 }, () => ({
      height: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
      glitchOffset: 0,
      glitchTime: 0
    }))
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = canvas.width / bars.length
      const centerY = canvas.height / 2

      time += 0.01

      bars.forEach((bar, i) => {
        bar.height = Math.sin(time * bar.speed + bar.phase) * 0.3 + 0.5
        
        if (Math.random() < 0.002) {
          bar.glitchOffset = (Math.random() - 0.5) * 20
          bar.glitchTime = 10
        }
        
        if (bar.glitchTime > 0) {
          bar.glitchTime--
        } else {
          bar.glitchOffset *= 0.9
        }

        const x = i * barWidth + bar.glitchOffset
        const height = bar.height * (canvas.height * 0.15)
        
        const gradient = ctx.createLinearGradient(x, centerY - height, x, centerY + height)
        gradient.addColorStop(0, 'oklch(0.50 0.22 25 / 0.05)')
        gradient.addColorStop(0.5, 'oklch(0.50 0.22 25 / 0.15)')
        gradient.addColorStop(1, 'oklch(0.50 0.22 25 / 0.05)')

        ctx.fillStyle = gradient
        ctx.fillRect(x, centerY - height, barWidth - 2, height * 2)

        if (bar.glitchTime > 0 && Math.random() < 0.5) {
          ctx.fillStyle = 'oklch(0.60 0.24 25 / 0.3)'
          ctx.fillRect(x + (Math.random() - 0.5) * 15, centerY - height, barWidth - 2, height * 2)
        }
      })

      if (Math.random() < 0.01) {
        const randomBar = bars[Math.floor(Math.random() * bars.length)]
        randomBar.glitchOffset = (Math.random() - 0.5) * 30
        randomBar.glitchTime = 15
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [bars])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-40 mix-blend-screen"
      style={{ filter: 'blur(1px)' }}
    />
  )
}
