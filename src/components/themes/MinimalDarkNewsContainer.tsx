import { useSiteConfig } from '@/hooks/use-site-config'
import NewsSection from '../../themes/minimal-dark/NewsSection'
import type { SectionLabels } from '@/lib/types'

export default function MinimalDarkNewsContainer() {
  const { config } = useSiteConfig()

  return (
    <NewsSection
      news={config.news || []}
      siteName={config.siteName || ''}
      sectionLabels={config.sectionLabels as SectionLabels}
    />
  )
}
