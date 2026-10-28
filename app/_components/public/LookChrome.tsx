'use client'

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLenisContext } from '@/contexts/LenisContext'
import { useTerminalConfig } from '@/contexts/TerminalConfigContext'
import { useMorseCode } from '@/hooks/use-morse-code'
import { requestSecretTerminal } from '@/lib/terminal-config'
import OverlayEffectsLayer from '@/components/OverlayEffectsLayer'
import { SiteBgVideo } from './SiteBgVideo'
import { getLook } from '@/lib/looks'
import type { NavigationSlotProps, FooterSlotProps, HeroSlotProps } from '@/lib/types'
import {
  parseLoadingScreenConfig,
  type LoadingScreenConfig,
} from '@/lib/loading-screen-config'
import { hasCompletedPublicBoot, markPublicBootComplete } from '@/lib/public-boot-session'

import ClassicNav from '@/themes/neuroklast-classic/Navigation'
import ClassicHero from '@/themes/neuroklast-classic/Hero'
import ClassicFooter from '@/themes/neuroklast-classic/Footer'
import ClassicLoader from '@/themes/neuroklast-classic/LoadingScreen'

export function LookBootScreen({
  onComplete,
  config,
}: {
  lookId?: string
  onComplete: () => void
  config?: LoadingScreenConfig
}) {
  return <ClassicLoader onComplete={onComplete} config={config} />
}

export function LookBackground({
  videoUrl,
  videoOpacity,
  videoEnabled,
}: {
  lookId?: string
  siteName: string
  videoUrl?: string
  videoOpacity?: number
  videoEnabled?: boolean
}) {
  return <SiteBgVideo src={videoUrl} opacity={videoOpacity} enabled={videoEnabled} />
}

export function LookNav({
  lookId: _lookId,
  siteName,
  items,
}: {
  lookId?: string
  siteName: string
  items: NavigationSlotProps['items']
}) {
  const { scrollTo } = useLenisContext()
  const { morseCode } = useTerminalConfig()
  const router = useRouter()
  const pathname = usePathname()
  const morseHandlers = useMorseCode({
    targetCode: morseCode,
    onMatch: requestSecretTerminal,
  })

  useEffect(() => {
    if (pathname !== '/') return
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const timer = window.setTimeout(() => {
      if (hash === 'hero') scrollTo(0, { offset: 0 })
      else scrollTo(`#${hash}`, { offset: -64 })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [pathname, scrollTo])

  const onNavigate = useCallback((id: string) => {
    if (pathname !== '/') {
      router.push(id === 'hero' ? '/' : `/#${id}`)
      return
    }
    if (id === 'hero') {
      scrollTo(0, { offset: 0 })
      return
    }
    scrollTo(`#${id}`, { offset: -64 })
  }, [pathname, router, scrollTo])

  return (
    <ClassicNav
      items={items}
      siteName={siteName}
      onNavigate={onNavigate}
      morseHandlers={morseCode ? morseHandlers : undefined}
    />
  )
}

export function LookHero({ lookId: _lookId, ...props }: HeroSlotProps & { lookId?: string }) {
  return <ClassicHero {...props} />
}

export function LookFooter({
  lookId: _lookId,
  siteName,
  genres,
  socialLinks,
  legalNoticeUrl,
  privacyPolicyUrl,
}: {
  lookId?: string
  siteName: string
  genres: string[]
  socialLinks: FooterSlotProps['socialLinks']
  legalNoticeUrl: string
  privacyPolicyUrl: string
}) {
  const router = useRouter()
  return (
    <ClassicFooter
      siteName={siteName}
      genres={genres}
      socialLinks={socialLinks}
      privacyPolicyUrl={privacyPolicyUrl}
      onImpressum={() => router.push(legalNoticeUrl)}
      onDatenschutz={() => router.push(privacyPolicyUrl)}
      onAdminLogin={() => router.push('/admin/login')}
    />
  )
}

export function LookEffects({ lookId }: { lookId?: string }) {
  const look = getLook(lookId)
  return <OverlayEffectsLayer effects={look.overlayEffects} />
}

function subscribePublicBoot(): () => void {
  return () => {}
}

function subscribeCompactBoot(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
  const media = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)')
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function getCompactBoot(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches
}

export function PublicBoot({
  lookId: _lookId,
  loadingScreen,
}: {
  lookId?: string
  loadingScreen?: Record<string, unknown>
}) {
  const config = parseLoadingScreenConfig(loadingScreen)
  const already = useSyncExternalStore(subscribePublicBoot, hasCompletedPublicBoot, () => false)
  const compact = useSyncExternalStore(subscribeCompactBoot, getCompactBoot, () => false)
  const [finished, setFinished] = useState(!config.enabled)
  const showing = config.enabled && !already && !finished && !compact

  useEffect(() => {
    // Mobile and reduced-motion visitors see content immediately, not a
    // multi-second fake loading animation that delays the page's first LCP.
    if (showing || compact) markPublicBootComplete()
  }, [showing, compact])

  if (!showing) return null

  return (
    <LookBootScreen
      config={config}
      onComplete={() => setFinished(true)}
    />
  )
}

export function LookBootGate({ lookId: _lookId, children }: { lookId?: string; children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  return (
    <>
      {!ready ? <LookBootScreen onComplete={() => setReady(true)} /> : null}
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>{children}</div>
    </>
  )
}
