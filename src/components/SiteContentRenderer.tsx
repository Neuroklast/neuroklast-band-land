/**
 * SiteContentRenderer – renders all public-facing sections of the site.
 *
 * Each section is wrapped in a SectionGuard so that visibility checks,
 * entrance animations, and error boundaries are managed in one place.
 *
 * All content-section components are resolved via the theme slot mechanism,
 * allowing themes to override any section with their own implementation.
 */
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useThemeSlots } from '@/lib/theme-registry'
import { useCachedImage } from '@/hooks/useCachedImage'
import SectionErrorBoundary from '@/components/SectionErrorBoundary'
import SectionGuard from '@/components/SectionGuard'
import NewsletterWidget from '@/components/NewsletterWidget'
import { WidgetRenderer } from '@/components/widgets'
import { getActiveWidgets } from '@/lib/widget-plugins'
import { resolveSections, getEnabledSectionIds } from '@/lib/sections'
import type { SiteConfig, FontSizeSettings, SectionLabels, SectionVisibility } from '@/lib/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SiteContentRendererProps {
  data: SiteConfig
  defaultData: SiteConfig
  isOwner: boolean
  siteConfigLoaded: boolean
  vis: SectionVisibility
  onUpdate: <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => void
  onFontSizeChange: (key: keyof FontSizeSettings, value: string) => void
  onLabelChange: (key: keyof SectionLabels, value: string) => void
  onShowBandInfoEdit: () => void
  onSetCyberpunkOverlay: (overlay: { type: string; data: unknown } | null) => void
  onShowLogin: () => void
  onShowImpressum: () => void
  onShowDatenschutz: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SiteContentRenderer({
  data,
  defaultData,
  isOwner,
  siteConfigLoaded,
  vis: _vis,
  onUpdate,
  onFontSizeChange,
  onLabelChange,
  onShowBandInfoEdit,
  onSetCyberpunkOverlay,
  onShowLogin,
  onShowImpressum,
  onShowDatenschutz,
}: SiteContentRendererProps) {
  const safeSocialLinks = data.socialLinks || defaultData.socialLinks
  const {
    BackgroundEffects: ThemeBackgroundEffects,
    Hero: ThemeHero,
    Footer: ThemeFooter,
    SectionDivider: ThemeSectionDivider,
    GigsSection: ThemeGigsSection,
    ReleasesSection: ThemeReleasesSection,
    BiographySection: ThemeBiographySection,
    NewsSection: ThemeNewsSection,
    MediaSection: ThemeMediaSection,
    GallerySection: ThemeGallerySection,
    SocialSection: ThemeSocialSection,
    ContactSection: ThemeContactSection,
    PartnersSection: ThemePartnersSection,
  } = useThemeSlots(data.themeSettings?.activePreset)
  const cachedLogoUrl = useCachedImage(data.logoUrl)
  const cachedTitleImageUrl = useCachedImage(data.titleImageUrl)

  const activeSectionIds = useMemo(
    () => getEnabledSectionIds(resolveSections({
      sections: data.sections,
      sectionOrder: data.sectionOrder,
    })),
    [data.sections, data.sectionOrder]
  )

  return (
    <>
      <ThemeBackgroundEffects key={data.themeSettings?.activePreset ?? 'default'} siteName={data.siteName} hudTexts={data.hudTexts} />
      {/* Hero */}
      <SectionErrorBoundary sectionName="Hero">
        <ThemeHero
          name={data.siteName}
          genres={data.genres}
          
          onEdit={onShowBandInfoEdit}
          logoUrl={cachedLogoUrl || undefined}
          titleImageUrl={cachedTitleImageUrl || undefined}
          heroStyle={data.themeSettings?.heroStyle}
        />
      </SectionErrorBoundary>

      <main id="main-content" className="relative">
        <SectionGuard sectionId="news" activeSectionIds={activeSectionIds} delay={0.7} label="News">
          <ThemeNewsSection
            news={data.news}
            editMode={isOwner}
            onUpdate={(news) => onUpdate('news', news)}
            sectionLabels={data.sectionLabels}
            onLabelChange={onLabelChange}
            onNewsClick={(item) => onSetCyberpunkOverlay({ type: 'news', data: item })}
          />
        </SectionGuard>

        <SectionGuard sectionId="biography" activeSectionIds={activeSectionIds} delay={0.8} label="Biography">
          <ThemeBiographySection
            biography={data.biography}
            editMode={isOwner}
            onUpdate={(biography) => onUpdate('biography', biography)}
            fontSizes={data.fontSizes}
            onFontSizeChange={onFontSizeChange}
            sectionLabels={data.sectionLabels}
            onLabelChange={onLabelChange}
            siteName={data.siteName}
            onMemberClick={(member) => onSetCyberpunkOverlay({ type: 'member', data: member })}
          />
        </SectionGuard>

        <SectionGuard sectionId="gallery" activeSectionIds={activeSectionIds} delay={0.9} label="Gallery">
          <ThemeGallerySection
            galleryImages={data.galleryImages}
            editMode={isOwner}
            onUpdate={(galleryImages) => onUpdate('galleryImages', galleryImages)}
            driveFolderUrl={data.galleryDriveFolderUrl}
            onDriveFolderUrlChange={(galleryDriveFolderUrl) => onUpdate('galleryDriveFolderUrl', galleryDriveFolderUrl)}
            sectionLabels={data.sectionLabels}
            onLabelChange={onLabelChange}
            siteName={data.siteName}
          />
        </SectionGuard>

        <SectionGuard sectionId="gigs" activeSectionIds={activeSectionIds} delay={1.0} label="Gigs">
          <ThemeGigsSection
            gigs={data.gigs}
            editMode={isOwner}
            onUpdate={(gigs) => onUpdate('gigs', gigs)}
            fontSizes={data.fontSizes}
            onFontSizeChange={onFontSizeChange}
            dataLoaded={siteConfigLoaded}
            sectionLabels={data.sectionLabels}
            onLabelChange={onLabelChange}
            onGigClick={(gig) => onSetCyberpunkOverlay({ type: 'gig', data: gig })}
          />
        </SectionGuard>

        {(data.newsletterSettings?.showAfterGigs !== false && data.newsletterSettings?.enabled) && (
          <div className="py-8 px-4 max-w-2xl mx-auto">
            <NewsletterWidget
              enabled={data.newsletterSettings?.enabled}
              title={data.newsletterSettings?.title}
              description={data.newsletterSettings?.description}
              placeholder={data.newsletterSettings?.placeholder}
              buttonText={data.newsletterSettings?.buttonText}
              source="gigs-section"
            />
          </div>
        )}

        <SectionGuard sectionId="releases" activeSectionIds={activeSectionIds} delay={1.2} label="Releases">
          <ThemeReleasesSection
            releases={data.releases}
            editMode={isOwner}
            onUpdate={(releases) => onUpdate('releases', releases)}
            fontSizes={data.fontSizes}
            onFontSizeChange={onFontSizeChange}
            dataLoaded={siteConfigLoaded}
            sectionLabels={data.sectionLabels}
            onLabelChange={onLabelChange}
            siteName={data.siteName}
            onReleaseClick={(release) => onSetCyberpunkOverlay({ type: 'release', data: release })}
          />
        </SectionGuard>

        <SectionGuard sectionId="media" activeSectionIds={activeSectionIds} delay={1.3} label="Media">
          <ThemeMediaSection
            mediaFiles={data.mediaFiles}
            editMode={isOwner}
            onUpdate={(mediaFiles) => onUpdate('mediaFiles', mediaFiles)}
            sectionLabels={data.sectionLabels}
            onLabelChange={onLabelChange}
          />
        </SectionGuard>

        <SectionGuard sectionId="social" activeSectionIds={activeSectionIds} delay={1.4} label="Social">
          <ThemeSocialSection
            socialLinks={safeSocialLinks}
            editMode={isOwner}
            onUpdate={(socialLinks) => onUpdate('socialLinks', socialLinks)}
            fontSizes={data.fontSizes}
            onFontSizeChange={onFontSizeChange}
            sectionLabels={data.sectionLabels}
            onLabelChange={onLabelChange}
          />
        </SectionGuard>

        <SectionGuard sectionId="contact" activeSectionIds={activeSectionIds} delay={1.45} label="Contact">
          <ThemeContactSection
            contactSettings={data.contactSettings}
            editMode={isOwner}
            onUpdate={(contactSettings) => onUpdate('contactSettings', contactSettings)}
            sectionLabels={data.sectionLabels}
            onLabelChange={onLabelChange}
          />
        </SectionGuard>

        <SectionGuard sectionId="partners" activeSectionIds={activeSectionIds} delay={1.5} label="Partners & Friends">
          <ThemePartnersSection
            friends={data.biography?.friends}
            editMode={isOwner}
            onUpdate={(friends) => onUpdate('biography', {
              ...(data.biography || { story: '', members: [], achievements: [] }),
              friends,
            })}
            sectionLabels={data.sectionLabels}
            onLabelChange={onLabelChange}
            onFriendClick={(friend) => onSetCyberpunkOverlay({ type: 'friend', data: friend })}
          />
        </SectionGuard>

        {/* Active widget sections */}
        {getActiveWidgets(data.widgetPlugins ?? []).map((widget, i) => (
          <motion.section
            key={widget.id}
            id={`widget-${widget.id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.55 + i * 0.05 }}
            className="py-16 px-4 max-w-5xl mx-auto w-full"
          >
            <h2 className="font-mono text-xs uppercase tracking-widest text-primary/60 mb-6 border-b border-primary/10 pb-2">
              {widget.name}
            </h2>
            <SectionErrorBoundary sectionName={`Widget: ${widget.name}`}>
              <WidgetRenderer widget={widget} themeSettings={data.themeSettings} />
            </SectionErrorBoundary>
          </motion.section>
        ))}
      </main>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.6 }}
      >
        <SectionErrorBoundary sectionName="Footer">
          <ThemeSectionDivider />
          <ThemeFooter
            socialLinks={safeSocialLinks}
            genres={data.genres}
            label={data.label}
            siteName={data.siteName}
            onAdminLogin={!isOwner ? onShowLogin : undefined}
            onImpressum={onShowImpressum}
            onDatenschutz={onShowDatenschutz}
          />
        </SectionErrorBoundary>
      </motion.div>

      {data.newsletterSettings?.showInFooter && data.newsletterSettings?.enabled && (
        <div className="py-8 px-4 max-w-2xl mx-auto">
          <NewsletterWidget
            enabled={data.newsletterSettings?.enabled}
            title={data.newsletterSettings?.title}
            description={data.newsletterSettings?.description}
            placeholder={data.newsletterSettings?.placeholder}
            buttonText={data.newsletterSettings?.buttonText}
            source="footer"
          />
        </div>
      )}
    </>
  )
}
