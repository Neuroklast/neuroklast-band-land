/**
 * SectionGuard — declarative visibility wrapper for site sections.
 *
 * Encapsulates the repeated pattern of checking section visibility,
 * wrapping content in an animation container (SectionMotion), and
 * providing an error boundary.
 *
 * Before:
 *   {activeSectionIds.includes('news') && (
 *     <SectionMotion delay={0.7}>
 *       <SectionErrorBoundary sectionName="News">
 *         <NewsSection ... />
 *       </SectionErrorBoundary>
 *     </SectionMotion>
 *   )}
 *
 * After:
 *   <SectionGuard sectionId="news" activeSectionIds={activeSectionIds}
 *                 delay={0.7} label="News">
 *     <NewsSection ... />
 *   </SectionGuard>
 */
import { motion } from 'framer-motion'
import SectionErrorBoundary from '@/components/SectionErrorBoundary'

interface SectionGuardProps {
  /** The section identifier to check (e.g. 'news', 'gigs'). */
  sectionId: string
  /** Currently active (enabled) section IDs. */
  activeSectionIds: string[]
  /** Entrance animation delay in seconds. */
  delay: number
  /** Human-readable label shown in the error boundary. */
  label: string
  children: React.ReactNode
}

export default function SectionGuard({
  sectionId,
  activeSectionIds,
  delay,
  label,
  children,
}: SectionGuardProps) {
  if (!activeSectionIds.includes(sectionId)) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <SectionErrorBoundary sectionName={label}>
        {children}
      </SectionErrorBoundary>
    </motion.div>
  )
}
