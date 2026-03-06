/**
 * SiteContentRenderer – renders all public-facing sections of the site.
 *
 * Each section is wrapped in a SectionErrorBoundary so that a broken section
 * never takes down the whole page.
 */
import { motion } from 'framer-motion'
import { useThemeSlots } from '@/lib/theme-registry'
import { useCachedImage } from '@/hooks/useCachedImage'
import SectionErrorBoundary from '@/components/SectionErrorBoundary'
import NewsSection from '@/components/NewsSection'
import BiographySection from '@/components/BiographySection'
import GigsSection from '@/components/GigsSection'
import ReleasesSection from '@/components/ReleasesSection'
import MediaSection from '@/components/MediaSection'
import SocialSection from '@/components/SocialSection'
import PartnersAndFriendsSection from '@/components/PartnersAndFriendsSection'
import InstagramGallery from '@/components/InstagramGallery'
import ContactSection from '@/components/ContactSection'
import NewsletterWidget from '@/components/NewsletterWidget'
import { WidgetRenderer } from '@/components/widgets'
import { getActiveWidgets } from '@/lib/widget-plugins'
import type { SiteConfig, FontSizeSettings, SectionLabels, SectionVisibility } from '@/lib/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SiteContentRendererProps {
  data: SiteConfig
  defaultData: SiteConfig
  editMode: boolean
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

// ─── Section animation wrapper ────────────────────────────────────────────────

function SectionMotion({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SiteContentRenderer({
  data,
  defaultData,
  editMode,
  isOwner,
  siteConfigLoaded,
  vis,
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
  const { BackgroundEffects: ThemeBackgroundEffects, Hero: ThemeHero, Footer: ThemeFooter, SectionDivider: ThemeSectionDivider } = useThemeSlots(data.themeSettings?.activePreset)
  const cachedLogoUrl = useCachedImage(data.logoUrl)
  const cachedTitleImageUrl = useCachedImage(data.titleImageUrl)

  return (
    <>
      <ThemeBackgroundEffects />
      {/* Hero */}
      <SectionErrorBoundary sectionName="Hero">
        <ThemeHero
          name={data.siteName}
          genres={data.genres}
          editMode={editMode && isOwner}
          onEdit={onShowBandInfoEdit}
          logoUrl={cachedLogoUrl || undefined}
          titleImageUrl={cachedTitleImageUrl || undefined}
          heroStyle={data.themeSettings?.heroStyle}
        />
      </SectionErrorBoundary>

      <main id="main-content" className="relative">
        {vis.news !== false && (
          <SectionMotion delay={0.7}>
            <SectionErrorBoundary sectionName="News">
              <NewsSection
                news={data.news}
                editMode={editMode && isOwner}
                onUpdate={(news) => onUpdate('news', news)}
                sectionLabels={data.sectionLabels}
                onLabelChange={onLabelChange}
                onNewsClick={(item) => onSetCyberpunkOverlay({ type: 'news', data: item })}
              />
            </SectionErrorBoundary>
          </SectionMotion>
        )}

        {vis.biography !== false && (
          <SectionMotion delay={0.8}>
            <SectionErrorBoundary sectionName="Biography">
              <BiographySection
                biography={data.biography}
                editMode={editMode && isOwner}
                onUpdate={(biography) => onUpdate('biography', biography)}
                fontSizes={data.fontSizes}
                onFontSizeChange={onFontSizeChange}
                sectionLabels={data.sectionLabels}
                onLabelChange={onLabelChange}
                siteName={data.siteName}
                onMemberClick={(member) => onSetCyberpunkOverlay({ type: 'member', data: member })}
              />
            </SectionErrorBoundary>
          </SectionMotion>
        )}

        {vis.gallery !== false && (
          <SectionMotion delay={0.9}>
            <SectionErrorBoundary sectionName="Gallery">
              <InstagramGallery
                galleryImages={data.galleryImages}
                editMode={editMode && isOwner}
                onUpdate={(galleryImages) => onUpdate('galleryImages', galleryImages)}
                driveFolderUrl={data.galleryDriveFolderUrl}
                onDriveFolderUrlChange={(galleryDriveFolderUrl) => onUpdate('galleryDriveFolderUrl', galleryDriveFolderUrl)}
                sectionLabels={data.sectionLabels}
                onLabelChange={onLabelChange}
                siteName={data.siteName}
              />
            </SectionErrorBoundary>
          </SectionMotion>
        )}

        {vis.gigs !== false && (
          <SectionMotion delay={1.0}>
            <SectionErrorBoundary sectionName="Gigs">
              <GigsSection
                gigs={data.gigs}
                editMode={editMode && isOwner}
                onUpdate={(gigs) => onUpdate('gigs', gigs)}
                fontSizes={data.fontSizes}
                onFontSizeChange={onFontSizeChange}
                dataLoaded={siteConfigLoaded}
                sectionLabels={data.sectionLabels}
                onLabelChange={onLabelChange}
                onGigClick={(gig) => onSetCyberpunkOverlay({ type: 'gig', data: gig })}
              />
            </SectionErrorBoundary>
          </SectionMotion>
        )}

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

        {vis.releases !== false && (
          <SectionMotion delay={1.2}>
            <SectionErrorBoundary sectionName="Releases">
              <ReleasesSection
                releases={data.releases}
                editMode={editMode && isOwner}
                onUpdate={(releases) => onUpdate('releases', releases)}
                fontSizes={data.fontSizes}
                onFontSizeChange={onFontSizeChange}
                dataLoaded={siteConfigLoaded}
                sectionLabels={data.sectionLabels}
                onLabelChange={onLabelChange}
                siteName={data.siteName}
                onReleaseClick={(release) => onSetCyberpunkOverlay({ type: 'release', data: release })}
              />
            </SectionErrorBoundary>
          </SectionMotion>
        )}

        {vis.media !== false && (
          <SectionMotion delay={1.3}>
            <SectionErrorBoundary sectionName="Media">
              <MediaSection
                mediaFiles={data.mediaFiles}
                editMode={editMode && isOwner}
                onUpdate={(mediaFiles) => onUpdate('mediaFiles', mediaFiles)}
                sectionLabels={data.sectionLabels}
                onLabelChange={onLabelChange}
              />
            </SectionErrorBoundary>
          </SectionMotion>
        )}

        {vis.social !== false && (
          <SectionMotion delay={1.4}>
            <SectionErrorBoundary sectionName="Social">
              <SocialSection
                socialLinks={safeSocialLinks}
                editMode={editMode && isOwner}
                onUpdate={(socialLinks) => onUpdate('socialLinks', socialLinks)}
                fontSizes={data.fontSizes}
                onFontSizeChange={onFontSizeChange}
                sectionLabels={data.sectionLabels}
                onLabelChange={onLabelChange}
              />
            </SectionErrorBoundary>
          </SectionMotion>
        )}

        {(vis.contact !== false || (editMode && isOwner)) && (
          <SectionMotion delay={1.45}>
            <SectionErrorBoundary sectionName="Contact">
              <ContactSection
                contactSettings={data.contactSettings}
                editMode={editMode && isOwner}
                onUpdate={(contactSettings) => onUpdate('contactSettings', contactSettings)}
                sectionLabels={data.sectionLabels}
                onLabelChange={onLabelChange}
              />
            </SectionErrorBoundary>
          </SectionMotion>
        )}

        {vis.partnersAndFriends !== false && (
          <SectionMotion delay={1.5}>
            <SectionErrorBoundary sectionName="Partners & Friends">
              <PartnersAndFriendsSection
                friends={data.biography?.friends}
                editMode={editMode && isOwner}
                onUpdate={(friends) => onUpdate('biography', {
                  ...(data.biography || { story: '', members: [], achievements: [] }),
                  friends,
                })}
                sectionLabels={data.sectionLabels}
                onLabelChange={onLabelChange}
                onFriendClick={(friend) => onSetCyberpunkOverlay({ type: 'friend', data: friend })}
              />
            </SectionErrorBoundary>
          </SectionMotion>
        )}

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
