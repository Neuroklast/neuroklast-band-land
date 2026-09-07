'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLenisContext } from '@/contexts/LenisContext'
import OverlayEffectsLayer from '@/components/OverlayEffectsLayer'
import { SiteBgVideo } from './SiteBgVideo'
import { getLook, type LookDefinition } from '@/lib/looks'
import type { NavigationSlotProps, FooterSlotProps, HeroSlotProps } from '@/lib/types'
import {
  parseLoadingScreenConfig,
  type LoadingScreenConfig,
} from '@/lib/loading-screen-config'

import ClassicNav from '@/themes/neuroklast-classic/Navigation'
import ClassicHero from '@/themes/neuroklast-classic/Hero'
import ClassicFooter from '@/themes/neuroklast-classic/Footer'
import ClassicBg from '@/themes/neuroklast-classic/BackgroundEffects'
import ClassicLoader from '@/themes/neuroklast-classic/LoadingScreen'

import GlitchNav from '@/themes/glitch-noir/Navigation'
import GlitchHero from '@/themes/glitch-noir/Hero'
import GlitchBg from '@/themes/glitch-noir/BackgroundEffects'
import GlitchLoader from '@/themes/glitch-noir/LoadingScreen'

import ZardonicNav from '@/themes/zardonic-industrial/Navigation'
import ZardonicHero from '@/themes/zardonic-industrial/Hero'
import ZardonicFooter from '@/themes/zardonic-industrial/Footer'
import ZardonicBg from '@/themes/zardonic-industrial/BackgroundEffects'
import ZardonicLoader from '@/themes/zardonic-industrial/LoadingScreen'

import UmbrellaNav from '@/themes/umbrella-corp/Navigation'
import UmbrellaHero from '@/themes/umbrella-corp/Hero'
import UmbrellaFooter from '@/themes/umbrella-corp/Footer'
import UmbrellaBg from '@/themes/umbrella-corp/BackgroundEffects'
import UmbrellaLoader from '@/themes/umbrella-corp/LoadingScreen'

function slotsFor(look: LookDefinition) {
  switch (look.id) {
    case 'glitch-noir':
      return {
        Navigation: GlitchNav,
        Hero: GlitchHero,
        Footer: ClassicFooter,
        Background: GlitchBg,
        Loader: GlitchLoader,
      }
    case 'zardonic-industrial':
      return {
        Navigation: ZardonicNav,
        Hero: ZardonicHero,
        Footer: ZardonicFooter,
        Background: ZardonicBg,
        Loader: ZardonicLoader,
      }
    case 'umbrella-corp':
      return {
        Navigation: UmbrellaNav,
        Hero: UmbrellaHero,
        Footer: UmbrellaFooter,
        Background: UmbrellaBg,
        Loader: UmbrellaLoader,
      }
    default:
      return {
        Navigation: ClassicNav,
        Hero: ClassicHero,
        Footer: ClassicFooter,
        Background: ClassicBg,
        Loader: ClassicLoader,
      }
  }
}

export function LookBootScreen({
  lookId,
  onComplete,
  config,
}: {
  lookId?: string
  onComplete: () => void
  config?: LoadingScreenConfig
}) {
  const look = getLook(lookId)
  const { Loader } = slotsFor(look)
  return <Loader onComplete={onComplete} config={config} />
}

export function LookBackground({
  videoOpacity,
}: {
  lookId?: string
  siteName: string
  videoOpacity?: number
}) {
  return <SiteBgVideo opacity={videoOpacity} />
}

export function LookNav({
  siteName,
  items,
}: {
  lookId?: string
  siteName: string
  items: NavigationSlotProps['items']
}) {
  const { scrollTo } = useLenisContext()
  const onNavigate = useCallback((id: string) => {
    if (id === 'hero') {
      scrollTo(0, { offset: 0 })
      return
    }
    scrollTo(`#${id}`, { offset: -64 })
  }, [scrollTo])
  return <ClassicNav items={items} siteName={siteName} onNavigate={onNavigate} />
}

export function LookHero(props: HeroSlotProps & { lookId?: string }) {
  const look = getLook(props.lookId)
  const { Hero } = slotsFor(look)
  return <Hero {...props} />
}

export function LookFooter({
  lookId,
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
  const look = getLook(lookId)
  const { Footer } = slotsFor(look)
  const router = useRouter()
  return (
    <Footer
      siteName={siteName}
      genres={genres}
      socialLinks={socialLinks}
      onImpressum={() => router.push(legalNoticeUrl)}
      onDatenschutz={() => router.push(privacyPolicyUrl)}
      onAdminLogin={() => router.push('/admin/login')}
    />
  )
}

export function LookEffects({ lookId }: { lookId?: string }) {
  const look = getLook(lookId)
  return (
    <>
      <OverlayEffectsLayer effects={look.overlayEffects} />
    </>
  )
}

export function PublicBoot({
  lookId,
  loadingScreen,
}: {
  lookId?: string
  loadingScreen?: Record<string, unknown>
}) {
  const config = parseLoadingScreenConfig(loadingScreen)
  const [ready, setReady] = useState(!config.enabled)
  if (ready) return null
  return <LookBootScreen lookId={lookId} config={config} onComplete={() => setReady(true)} />
}

export function LookBootGate({ lookId, children }: { lookId?: string; children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  return (
    <>
      {!ready ? <LookBootScreen lookId={lookId} onComplete={() => setReady(true)} /> : null}
      <div style={{ visibility: ready ? 'visible' : 'hidden' }}>{children}</div>
    </>
  )
}


