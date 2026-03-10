import { useState, useEffect } from 'react'

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0)

  const phases = [
    'INITIALIZING NEURAL NETWORK',
    'ESTABLISHING SECURE CONNECTION',
    'DECRYPTING TRANSMISSION',
    'LOADING AUDIO PROTOCOLS',
    'SYNCHRONIZING FREQUENCY',
    'SYSTEM READY'
  ]

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    const phaseInterval = setInterval(() => {
      setPhase(prev => {
        if (prev >= phases.length - 1) {
          clearInterval(phaseInterval)
          return prev
        }
        return prev + 1
      })
    }, 500)

    return () => {
      clearInterval(progressInterval)
      clearInterval(phaseInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="signal-static-loading-noise"></div>
      <div className="signal-static-loading-scanlines"></div>
      
      <div className="relative z-10 max-w-2xl w-full px-6">
        <div className="text-center mb-12">
          <div className="signal-static-loading-logo text-6xl font-mono font-bold text-foreground mb-4 tracking-tighter">
            NKLST_
          </div>
          <div className="font-mono text-sm text-muted-foreground tracking-widest">
            NEURAL TECHNO COLLECTIVE
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative w-full h-2 bg-card border border-border overflow-hidden">
            <div 
              className="signal-static-loading-bar absolute inset-y-0 left-0 bg-accent transition-all duration-100"
              style={{ width: `${progress}%` }}
            >
              <div className="signal-static-loading-bar-shine"></div>
            </div>
          </div>

          <div className="font-mono text-sm text-center">
            <div className="text-foreground mb-2">
              {'>'} {phases[phase]}
            </div>
            <div className="text-accent tabular-nums">
              {progress}%
            </div>
          </div>

          <div className="signal-static-terminal-output border border-border bg-card/50 p-4 h-32 overflow-hidden font-mono text-xs">
            {phases.slice(0, phase + 1).map((p, i) => (
              <div 
                key={i} 
                className={`${i === phase ? 'text-accent' : 'text-muted-foreground'} mb-1 signal-static-terminal-line`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                [{'0'.repeat(4 - String(i + 1).length)}{i + 1}] {p}...
                <span className="text-accent ml-2">{i < phase ? '✓' : i === phase ? '◆' : ''}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 font-mono text-xs text-muted-foreground">
            <div className="signal-static-loading-dot"></div>
            <div>ESTABLISHING CONNECTION</div>
            <div className="signal-static-loading-dot" style={{ animationDelay: '0.3s' }}></div>
            <div>PLEASE WAIT</div>
            <div className="signal-static-loading-dot" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>

        <div className="mt-12 text-center font-mono text-xs text-muted-foreground">
          <div className="mb-2">[SECURITY CLEARANCE REQUIRED]</div>
          <div className="text-accent">TIMESTAMP: {new Date().toISOString()}</div>
        </div>
      </div>
    </div>
  )
}
