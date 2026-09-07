'use client'

import { useEffect, useState } from 'react'
import { CRT_GLITCH_MS, crtGlitchVars, scheduleCrtIdle } from './crtGlitch'

interface CrtGlitchMarkProps {
  src: string
  alt: string
  imgClassName: string
  variant?: 'mark' | 'word'
}

export function CrtGlitchMark({ src, alt, imgClassName, variant = 'mark' }: CrtGlitchMarkProps) {
  const [on, setOn] = useState(false)
  const [seed, setSeed] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let wait = 0
    let burst = 0
    let first = true
    const arm = () => {
      wait = window.setTimeout(() => {
        first = false
        setSeed(Math.floor(Math.random() * 1000))
        setOn(true)
        burst = window.setTimeout(() => {
          setOn(false)
          arm()
        }, CRT_GLITCH_MS)
      }, scheduleCrtIdle(Math.random(), first))
    }
    arm()
    return () => {
      window.clearTimeout(wait)
      window.clearTimeout(burst)
    }
  }, [])

  return (
    <div
      className={`nk-crt-mark${variant === 'word' ? ' nk-crt-mark--word' : ''}${on ? ' nk-crt-g-on' : ''}`}
      style={{ ['--nk-mark' as string]: `url("${src}")`, ...crtGlitchVars(seed) }}
    >
      <img src={src} alt={alt} className={`nk-crt-mark__base ${imgClassName}`} decoding="async" />
      <img src={src} alt="" className="nk-crt-mark__ghost nk-crt-mark__ghost--a" />
      <img src={src} alt="" className="nk-crt-mark__ghost nk-crt-mark__ghost--b" />
      <img src={src} alt="" className="nk-crt-mark__ghost nk-crt-mark__ghost--c" />
      <span className="nk-crt-mark__static" aria-hidden />
    </div>
  )
}
