/**
 * useDocumentTitle – Updates document.title based on the currently visible section.
 *
 * Uses IntersectionObserver to detect which section is in the viewport and
 * updates the browser tab title accordingly.
 */
import { useEffect } from 'react'

const SECTION_TITLES: Record<string, string> = {
  bio: 'Biography | NEUROKLAST',
  music: 'Music | NEUROKLAST',
  gigs: 'Upcoming Shows | NEUROKLAST',
  releases: 'Releases | NEUROKLAST',
  gallery: 'Gallery | NEUROKLAST',
  connect: 'Connect | NEUROKLAST',
  contact: 'Contact | NEUROKLAST',
  shell: 'Team | NEUROKLAST',
  creditHighlights: 'Credits | NEUROKLAST',
  media: 'Media | NEUROKLAST',
}

const DEFAULT_TITLE = 'NEUROKLAST'

export function useDocumentTitle(artistName: string) {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    const sectionIds = Object.keys(SECTION_TITLES)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id
            const title = SECTION_TITLES[id]
            if (title) {
              document.title = artistName ? title.replace('NEUROKLAST', artistName) : title
              return
            }
          }
        }
      },
      { threshold: 0.3 },
    )

    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    elements.forEach(el => observer.observe(el))

    return () => {
      observer.disconnect()
      document.title = artistName || DEFAULT_TITLE
    }
  }, [artistName])
}
