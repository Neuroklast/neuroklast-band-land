export default function SectionDivider() {
  return (
    <div className="relative w-full py-12 overflow-hidden">
      <div className="signal-static-divider-container">
        <svg 
          className="w-full h-8" 
          viewBox="0 0 1200 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <line 
            x1="0" 
            y1="16" 
            x2="1200" 
            y2="16" 
            stroke="currentColor" 
            strokeWidth="1" 
            className="text-border signal-static-divider-line"
          />
          
          <circle 
            cx="200" 
            cy="16" 
            r="3" 
            fill="currentColor" 
            className="text-accent signal-static-divider-dot"
          />
          <circle 
            cx="400" 
            cy="16" 
            r="2" 
            fill="currentColor" 
            className="text-muted-foreground signal-static-divider-dot"
            style={{ animationDelay: '0.5s' }}
          />
          <circle 
            cx="600" 
            cy="16" 
            r="3" 
            fill="currentColor" 
            className="text-accent signal-static-divider-dot"
            style={{ animationDelay: '1s' }}
          />
          <circle 
            cx="800" 
            cy="16" 
            r="2" 
            fill="currentColor" 
            className="text-muted-foreground signal-static-divider-dot"
            style={{ animationDelay: '1.5s' }}
          />
          <circle 
            cx="1000" 
            cy="16" 
            r="3" 
            fill="currentColor" 
            className="text-accent signal-static-divider-dot"
            style={{ animationDelay: '2s' }}
          />
          
          <path 
            d="M100,16 L150,8 L150,24 Z" 
            fill="currentColor" 
            className="text-border signal-static-divider-arrow"
          />
          <path 
            d="M1100,16 L1050,8 L1050,24 Z" 
            fill="currentColor" 
            className="text-border signal-static-divider-arrow"
          />
          
          <rect 
            x="580" 
            y="12" 
            width="40" 
            height="8" 
            fill="currentColor" 
            className="text-accent/20"
          />
          <text 
            x="600" 
            y="19" 
            fontSize="8" 
            fill="currentColor" 
            className="text-accent font-mono"
            textAnchor="middle"
          >
            DATA
          </text>
        </svg>
      </div>
      
      <div className="absolute top-1/2 left-0 right-0 flex items-center justify-center gap-8 font-mono text-xs text-muted-foreground -translate-y-1/2">
        <div className="signal-static-divider-label bg-background px-4 py-1 border border-border">
          <span className="text-accent">◆</span> SECTION BREAK
        </div>
      </div>
    </div>
  )
}
