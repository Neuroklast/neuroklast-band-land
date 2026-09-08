'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLenisContext } from '@/contexts/LenisContext'
import { useOverlay } from '@/contexts/OverlayContext'
import { useTerminalConfig } from '@/contexts/TerminalConfigContext'
import { useMorseCode } from '@/hooks/use-morse-code'
import OverlayEffectsLayer from '@/components/OverlayEffectsLayer'
import { SiteBgVideo } from './SiteBgVideo'
import { getLook } from '@/lib/looks'
import type { NavigationSlotProps, FooterSlotProps, HeroSlotProps } from '@/lib/types'
import {
  parseLoadingScreenConfig,
  type LoadingScreenConfig,
} from '@/lib/loading-screen-config'

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
  const { openOverlay } = useOverlay()
  const { morseCode } = useTerminalConfig()
  const router = useRouter()
  const pathname = usePathname()
  const openTerminal = useCallback(() => openOverlay({ type: 'terminal' }), [openOverlay])
  const morseHandlers = useMorseCode({
    targetCode: morseCode,
    onMatch: openTerminal,
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

export function PublicBoot({
  lookId: _lookId,
  loadingScreen,
}: {
  lookId?: string
  loadingScreen?: Record<string, unknown>
}) {
  const config = parseLoadingScreenConfig(loadingScreen)
  const [ready, setReady] = useState(!config.enabled)
  if (ready) return null
  return <LookBootScreen config={config} onComplete={() => setReady(true)} />
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
