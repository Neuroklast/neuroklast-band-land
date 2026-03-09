import { Suspense, lazy } from 'react'
import CyberModalBackdrop from '@/components/CyberModalBackdrop'
import CyberCloseButton from '@/components/CyberCloseButton'
import CyberSpinner from '@/components/CyberSpinner'
import type { SiteConfig } from '@/lib/types'

const ContentForms = lazy(() => import('./ContentForms').then(m => ({ default: m.ContentForms })))

interface ContentViewProps {
  open: boolean
  onClose: () => void
  siteConfig: SiteConfig
  onUpdate: (key: keyof SiteConfig, value: unknown) => void
}

export default function ContentView({ open, onClose, siteConfig, onUpdate }: ContentViewProps) {
  if (!open) return null

  return (
    <CyberModalBackdrop onClose={onClose}>
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-mono font-bold text-lg text-foreground">Content</h2>
          <CyberCloseButton onClose={onClose} />
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <Suspense fallback={<CyberSpinner />}>
            <ContentForms data={siteConfig} onUpdate={onUpdate} />
          </Suspense>
        </div>
      </div>
    </CyberModalBackdrop>
  )
}
