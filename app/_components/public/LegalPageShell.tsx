import { createPublicClient } from '@/lib/supabaseServer'
import { DEFAULT_FOOTER_CONFIG, DEFAULT_LEGAL_CONFIG, loadLegalPageData } from '@/lib/legal-content'
import { PageLayout } from '@/layouts/PageLayout'
import { CookieConsent } from '@/components/CookieConsent'
import { navItemsFromSections } from '@/lib/nav-links'
import type { SectionConfig } from '@/lib/site-config-sections'
import { parseLookId } from '@/lib/looks'
import { LookFooter, LookNav } from './LookChrome'

interface LegalPageShellProps {
  children: React.ReactNode
}

export async function LegalPageShell({ children }: LegalPageShellProps) {
  let pageData = {
    legal: DEFAULT_LEGAL_CONFIG,
    footer: DEFAULT_FOOTER_CONFIG,
    appearance: {} as Record<string, unknown>,
    background: {} as Record<string, unknown>,
    hero: {} as Record<string, unknown>,
    sections: [] as SectionConfig[],
    social: [] as Array<{ id: string; platform: string; url: string; label: string | null }>,
  }

  try {
    // Cookie-less client: keeps legal/browse routes statically cached (ISR)
    // instead of running 3+ Supabase reads per request.
    const supabase = createPublicClient()
    pageData = await loadLegalPageData(supabase)
  } catch {
    // Safe defaults when Supabase is unavailable
  }

  const navItems = navItemsFromSections(pageData.sections)

  const appearance = pageData.appearance
  const lookId = parseLookId(typeof appearance.lookId === 'string' ? appearance.lookId : undefined)
  const privacyUrl = pageData.footer.privacyPolicyUrl
  const siteName =
    typeof pageData.hero.headline === 'string' && pageData.hero.headline.trim()
      ? pageData.hero.headline.trim()
      : 'NEUROKLAST'
  const genres = Array.isArray(pageData.hero.genres)
    ? pageData.hero.genres.filter((g): g is string => typeof g === 'string' && g.trim() !== '')
    : []

  return (
    <PageLayout
      backgroundLayers={
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 bg-black"
          style={{ zIndex: 'var(--z-bg-video)' }}
        />
      }
      contentClassName="bg-black"
      nav={
        <LookNav
          lookId={lookId}
          siteName={siteName}
          items={navItems}
        />
      }
      footer={
        <LookFooter
          lookId={lookId}
          siteName={siteName}
          genres={genres}
          socialLinks={Object.fromEntries(pageData.social.map((link) => [link.platform, link.url]))}
          legalNoticeUrl={pageData.footer.legalNoticeUrl}
          privacyPolicyUrl={privacyUrl}
        />
      }
      system={
        <CookieConsent privacyPolicyUrl={privacyUrl} />
      }
    >
      {children}
    </PageLayout>
  )
}