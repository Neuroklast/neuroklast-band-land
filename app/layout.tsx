import type { Metadata } from 'next'
import { JetBrains_Mono, Orbitron, Share_Tech_Mono, Space_Grotesk, Space_Mono } from 'next/font/google'
import { createPublicClient } from '@/lib/supabaseServer'
import { getPublicSiteBootstrap } from '@/lib/site-config-bootstrap'
import { parseLookId } from '@/lib/looks'
import {
  buildPublicFontCssVars,
  googleFontsStylesheetHref,
  remoteFontFamiliesToLoad,
  resolvePublicFonts,
} from '@/lib/public-fonts'
import { Providers } from './providers'
import './globals.css'

/**
 * next/font only registers file variables for when Appearance selects them.
 * They are NOT forced as site body/heading — admin theme is source of truth.
 */
const fontJetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

const fontSpaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const fontOrbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-orbitron',
  display: 'swap',
})

const fontShareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-share-tech-mono',
  display: 'swap',
})

const fontSpaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const revalidate = 60

const DEFAULT_ICON = '/brand/nk-logo-red-bold.png'

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl: string | undefined

  try {
    // Cookie-less client: keeps the root layout static (ISR) — a cookie-based
    // client would force every route dynamic and multiply Supabase egress per
    // request (see docs/LESSONS_LEARNED.md: postgrest egress spike).
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'appearance')
      .maybeSingle()

    faviconUrl = (data?.value as { faviconUrl?: string } | null)?.faviconUrl
  } catch {
    faviconUrl = undefined
  }

  return {
    title: 'Neuroklast',
    description: 'Official website of Neuroklast – industrial / electronic',
    icons: {
      icon: faviconUrl || DEFAULT_ICON,
    },
    openGraph: {
      title: 'Neuroklast',
      description: 'Official website of Neuroklast – industrial / electronic',
      type: 'website',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { customTranslations, analyticsConfig, languages, appearance, terminal } =
    await getPublicSiteBootstrap()

  const fonts = resolvePublicFonts(appearance.theme)
  const fontCss = buildPublicFontCssVars(fonts)
  const remoteFonts = remoteFontFamiliesToLoad(fonts)
  const lookId = parseLookId(appearance.lookId)

  return (
    <html
      lang="en"
      data-theme={lookId}
      className={`${fontJetBrainsMono.variable} ${fontSpaceGrotesk.variable} ${fontOrbitron.variable} ${fontShareTechMono.variable} ${fontSpaceMono.variable}`}
    >
      <head>
        {/* Admin-configured remote faces — only when theme requests them */}
        {remoteFonts.map((name) => (
          <link
            key={name}
            rel="stylesheet"
            href={googleFontsStylesheetHref(name)}
            data-zd-font={name}
          />
        ))}
        {/* SSR: apply Appearance fonts before paint (all routes, not only homepage) */}
        <style dangerouslySetInnerHTML={{ __html: fontCss }} />
      </head>
      <body className="font-public-root">
        <Providers
          customTranslations={customTranslations}
          analyticsConfig={analyticsConfig}
          languages={languages}
          appearance={appearance}
          terminal={terminal}
        >
          {children}
        </Providers>
      </body>
    </html>
  )
}
