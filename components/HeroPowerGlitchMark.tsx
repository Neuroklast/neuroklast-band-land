'use client'

import { useReducedMotion } from 'framer-motion'
import { useGlitch, type GlitchHandle } from 'react-powerglitch'
import type { RecursivePartial } from 'powerglitch'
import type { PowerGlitchOptions } from 'powerglitch'
import {
  parseHeroPowerGlitch,
  toPowerGlitchOptions,
  type HeroPowerGlitchConfig,
} from '@/lib/hero-glitch-config'
import { CrtGlitchMark } from '@/themes/neuroklast-classic/CrtGlitchMark'

export function HeroPowerGlitchMark({
  src,
  alt,
  imgClassName,
  config,
}: {
  src: string
  alt: string
  imgClassName: string
  config?: HeroPowerGlitchConfig | unknown
}) {
  const parsed = parseHeroPowerGlitch(config)
  const prefersReducedMotion = useReducedMotion()
  const enabled = parsed.mode !== 'off' && !prefersReducedMotion
  const glitchOptions: RecursivePartial<PowerGlitchOptions> = enabled
    ? toPowerGlitchOptions(parsed)
    : { playMode: 'always', timing: { duration: 1, iterations: 1 } }
  const glitch: GlitchHandle = useGlitch(glitchOptions)
  const attachGlitch = glitch.ref

  if (!enabled) {
    return <CrtGlitchMark src={src} alt={alt} variant="word" imgClassName={imgClassName} />
  }

  return (
    <div className="hero-powerglitch w-full">
      <img
        ref={attachGlitch}
        src={src}
        alt={alt}
        className={imgClassName}
        decoding="async"
        data-draft-target="hero-logo"
      />
    </div>
  )
}
