import { useState } from 'react'

interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  draggable?: boolean
  loading?: 'lazy' | 'eager'
}

/**
 * Image component with a progress bar shown while loading.
 */
export default function ProgressiveImage({ src, alt, className, style, draggable, loading }: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-[1]">
          <div className="w-3/4 max-w-[200px]">
            <div className="h-[2px] bg-primary/20 overflow-hidden">
              <div
                className="h-full bg-primary/80 animate-progress-bar"
              />
            </div>
            <p className="text-[9px] font-mono text-primary/40 text-center mt-1 tracking-wider">LOADING...</p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease-in' }}
        draggable={draggable}
        loading={loading}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
