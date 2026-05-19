import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import Providers from './providers'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '../main.css'

export const metadata: Metadata = {
  title: 'Band Site',
  description: 'Official band website.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Band Site',
    description: 'Official band website.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Band Site',
    description: 'Official band website.',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {/* Initialize theme before hydration to avoid flash-of-wrong-theme on first paint. */}
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <div id="root">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}
