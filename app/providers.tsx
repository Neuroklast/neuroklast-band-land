'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LazyMotion, domAnimation } from 'framer-motion'
import { ErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'
import { LenisProvider } from '@/contexts/LenisContext'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { OverlayProvider } from '@/contexts/OverlayContext'
import { TerminalConfigProvider } from '@/contexts/TerminalConfigContext'
import { parseTerminalConfig, type TerminalConfig } from '@/lib/terminal-config'
import { OverlayHost } from '@/app/_components/public/OverlayHost'
import { AnalyticsTracker } from '@/components/AnalyticsTracker'
import { AppearanceBridge } from '@/app/_components/public/AppearanceBridge'
import type { AppearanceConfigInput } from '@/lib/apply-appearance-config'
import type { AnalyticsConfig } from '@/lib/analytics-config'
import type { SiteLanguage } from '@/lib/i18n'
import type { CustomTranslations } from '@/lib/translations-config'
import { useState } from 'react'

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-foreground">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">ERR://BOUNDARY</p>
      <h1 className="mt-4 font-mono text-3xl font-bold">Something went wrong</h1>
      <pre className="mt-4 max-w-xl overflow-auto font-mono text-xs text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </pre>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="mt-8 inline-flex min-h-[44px] items-center font-mono text-sm uppercase tracking-wider text-primary underline underline-offset-4"
      >
        Try again
      </button>
    </div>
  )
}

interface ProvidersProps {
  children: React.ReactNode
  customTranslations?: CustomTranslations
  analyticsConfig?: AnalyticsConfig
  languages?: SiteLanguage[]
  /** Applied on every public page — fonts never hardcoded outside Appearance. */
  appearance?: AppearanceConfigInput
  terminal?: TerminalConfig
}

export function Providers({
  children,
  customTranslations,
  analyticsConfig,
  languages,
  appearance = {},
  terminal,
}: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 5 * 60_000 },
        },
      }),
  )

  return (
    <LazyMotion features={domAnimation} strict={false}>
      <LenisProvider>
        <OverlayProvider>
          <LocaleProvider customTranslations={customTranslations} languages={languages}>
            <QueryClientProvider client={queryClient}>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <TerminalConfigProvider value={terminal ?? parseTerminalConfig(null)}>
                  <AppearanceBridge config={appearance} />
                  {children}
                  <OverlayHost lookId={appearance.lookId} />
                </TerminalConfigProvider>
              </ErrorBoundary>
            </QueryClientProvider>
            {analyticsConfig ? <AnalyticsTracker config={analyticsConfig} /> : null}
          </LocaleProvider>
        </OverlayProvider>
      </LenisProvider>
    </LazyMotion>
  )
}
