import { useState, useRef } from 'react'
import { get } from '@/lib/config'

interface GlitchImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
}

/**
 * GlitchImage - Image component with glitch/slice effect on hover
 * Creates a digital tearing/slicing effect when hovering over the image
 */
export function GlitchImage({ src, alt, className = '', width, height }: GlitchImageProps) {
  const [isHovering, setIsHovering] = useState(false)
  const enabled = get('IMAGE_GLITCH_ON_HOVER_ENABLED')
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (enabled) {
      setIsHovering(true)
      setTimeout(() => setIsHovering(false), get('IMAGE_GLITCH_DURATION_MS'))
    }
  }

  if (!enabled) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
      />
    )
  }

  const sliceCount = get('IMAGE_GLITCH_SLICE_COUNT')
  const duration = get('IMAGE_GLITCH_DURATION_MS')

  return (
    /*
      ALPHA-KANAL-GLOW: filter: drop-shadow() MUSS auf dem Wrapper-<div> sitzen,
      nicht auf dem inneren Container mit overflow:hidden. Der Wrapper darf KEIN
      overflow:hidden haben — nur der innere Container hält den Clip.
    */
    <div
      style={isHovering ? { filter: 'drop-shadow(4px 0 0 oklch(0.50 0.22 25 / 0.7)) drop-shadow(-4px 0 0 oklch(0.60 0.24 200 / 0.7))' } : undefined}
    >
      <div
        ref={imageRef}
        className={`relative overflow-hidden ${className}`}
        onMouseEnter={handleMouseEnter}
        style={{ width, height }}
      >
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-all duration-150 ${
            isHovering ? 'brightness-125' : 'brightness-100'
          }`}
          width={width}
          height={height}
        />
        
        {isHovering && (
          <>
            {Array.from({ length: sliceCount }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 overflow-hidden"
                style={{
                  top: `${(i / sliceCount) * 100}%`,
                  height: `${100 / sliceCount}%`,
                  animation: `glitch-slice-${i % 3} ${duration}ms ease-out`,
                  animationDelay: `${i * (duration / sliceCount / 2)}ms`,
                }}
              >
                <img
                  src={src}
                  alt=""
                  className="absolute h-full w-full object-cover"
                  style={{
                    top: `${(-i / sliceCount) * 100}%`,
                    height: `${sliceCount * 100}%`,
                  }}
                />
              </div>
            ))}
            
            <style>
              {`
                @keyframes glitch-slice-0 {
                  0%, 100% { transform: translateX(0); }
                  10% { transform: translateX(-8px); }
                  20% { transform: translateX(6px); }
                  30% { transform: translateX(-4px); }
                  40% { transform: translateX(0); }
                }
                
                @keyframes glitch-slice-1 {
                  0%, 100% { transform: translateX(0); }
                  15% { transform: translateX(10px); }
                  25% { transform: translateX(-7px); }
                  35% { transform: translateX(3px); }
                  45% { transform: translateX(0); }
                }
                
                @keyframes glitch-slice-2 {
                  0%, 100% { transform: translateX(0); }
                  12% { transform: translateX(5px); }
                  22% { transform: translateX(-9px); }
                  32% { transform: translateX(4px); }
                  42% { transform: translateX(0); }
                }
              `}
            </style>
          </>
        )}
      </div>
    </div>
  )
}
