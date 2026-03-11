import { useGlitchNoirBgState } from '@/hooks/use-glitch-noir-bg-state'

export default function BackgroundEffects() {
  const { canvasRef, noiseCanvasRef, signalGlitch } = useGlitchNoirBgState()

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
