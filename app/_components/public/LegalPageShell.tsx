import { createPublicClient } from '@/lib/supabaseServer'
import { DEFAULT_FOOTER_CONFIG, DEFAULT_LEGAL_CONFIG, loadLegalPageData } from '@/lib/legal-content'
import { PageLayout } from '@/layouts/PageLayout'
import { CookieConsent } from '@/components/CookieConsent'
import { buildNeuroklastNavItems } from '@/lib/nav-links'
import { parseSections } from '@/lib/site-config-sections'
import { parseLookId } from '@/lib/looks'
import { LookBackground, LookEffects, LookFooter, LookNav } from './LookChrome'

interface LegalPageShellProps {
  children: React.ReactNode
}

export async function LegalPageShell({ children }: LegalPageShellProps) {
  let pageData = {
    legal: DEFAULT_LEGAL_CONFIG,
    footer: DEFAULT_FOOTER_CONFIG,
    appearance: {} as Record<string, unknown>,
    social: [] as Array<{ id: string; platform: string; url: string; label: string | null }>,
  }

  let navItems = buildNeuroklastNavItems()

  try {
    // Cookie-less client: keeps legal/browse routes statically cached (ISR)
    // instead of running 3+ Supabase reads per request.
    const supabase = createPublicClient()
    pageData = await loadLegalPageData(supabase)
    const { data: sectionsRow } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'sections')
      .single()
    if (sectionsRow?.value) {
      navItems = buildNeuroklastNavItems(parseSections(sectionsRow.value))
    }
  } catch {
    // Safe defaults when Supabase is unavailable
  }

  const appearance = pageData.appearance
  const lookId = parseLookId(typeof appearance.lookId === 'string' ? appearance.lookId : undefined)
  const privacyUrl = pageData.footer.privacyPolicyUrl

  return (
    <PageLayout
      backgroundLayers={<LookBackground lookId={lookId} siteName="NEUROKLAST" />}
      nav={
        <LookNav
          lookId={lookId}
          siteName="NEUROKLAST"
          items={navItems}
        />
      }
      footer={
        <LookFooter
          lookId={lookId}
          siteName="NEUROKLAST"
          genres={['Industrial', 'Electronic']}
          socialLinks={Object.fromEntries(pageData.social.map((link) => [link.platform, link.url]))}
          legalNoticeUrl={pageData.footer.legalNoticeUrl}
          privacyPolicyUrl={privacyUrl}
        />
      }
      globalEffects={<LookEffects lookId={lookId} />}
      system={
        <CookieConsent privacyPolicyUrl={privacyUrl} />
      }
    >
      {children}
    </PageLayout>
  )
}