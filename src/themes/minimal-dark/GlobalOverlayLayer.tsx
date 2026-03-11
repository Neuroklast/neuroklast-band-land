interface GlobalOverlayLayerProps {
  noiseIntensity?: number
  scanlineIntensity?: number
  flickerIntensity?: number
}

export default function GlobalOverlayLayer({ 
  noiseIntensity = 0.6, 
  scanlineIntensity = 1,
  flickerIntensity = 0.05
}: GlobalOverlayLayerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <div 
        className="signal-static-global-noise"
        style={{ opacity: noiseIntensity }}
      ></div>
      
      <div 
        className="signal-static-global-scanlines"
        style={{ opacity: scanlineIntensity }}
      ></div>
      
      <div 
        className="signal-static-global-flicker"
        style={{ opacity: flickerIntensity }}
      ></div>
      
      <div className="signal-static-global-grain"></div>
    </div>
  )
}
