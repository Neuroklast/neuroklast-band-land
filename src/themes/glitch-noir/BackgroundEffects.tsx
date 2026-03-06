import { useEffect, useRef, useState } from 'react'

export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null)
  const [signalGlitch, setSignalGlitch] = useState(false)

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setSignalGlitch(true)
        setTimeout(() => setSignalGlitch(false), Math.random() * 200 + 100)
      }
    }, 2000)

    return () => clearInterval(glitchInterval)
  }, [])

  useEffect(() => {
    const noiseCanvas = noiseCanvasRef.current
    if (!noiseCanvas) return

    const noiseCtx = noiseCanvas.getContext('2d')
    if (!noiseCtx) return

    noiseCanvas.width = 256
    noiseCanvas.height = 256

    const generateNoise = () => {
      const imageData = noiseCtx.createImageData(noiseCanvas.width, noiseCanvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = Math.random() * 50
      }

      noiseCtx.putImageData(imageData, 0, 0)
    }

    const noiseInterval = setInterval(generateNoise, 50)
    generateNoise()

    return () => clearInterval(noiseInterval)
  }, [])

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

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }> = []
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3
      })
    }

    const signals: Array<{ x: number; y: number; length: number; speed: number; opacity: number }> = []
    
    for (let i = 0; i < 5; i++) {
      signals.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 100 + 50,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1
      })
    }

    let animationId: number
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
        ctx.fillRect(p.x, p.y, p.size, p.size)
      })

      signals.forEach((s) => {
        s.y += s.speed
        if (s.y > canvas.height) {
          s.y = -s.length
          s.x = Math.random() * canvas.width
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x, s.y + s.length)
        ctx.stroke()
      })

      if (Math.random() > 0.95) {
        const y = Math.random() * canvas.height
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.fillRect(0, y, canvas.width, 2)
      }

      if (Math.random() > 0.98) {
        const x = Math.random() * canvas.width
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.fillRect(x, 0, 1, canvas.height)
      }

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas
        ref={noiseCanvasRef}
        className="absolute inset-0 w-full h-full opacity-[0.15] glitch-noir-noise-texture"
      />

      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-40"
      />
      
      <div className="glitch-noir-scanlines" />
      
      <div className={`glitch-noir-signal-interference ${signalGlitch ? 'glitch-noir-signal-active' : ''}`} />
      
      <div className="glitch-noir-vignette" />
      
      <div className="absolute inset-0 glitch-noir-grain" />

      <div className="glitch-noir-static-burst" />
    </div>
  )
}
