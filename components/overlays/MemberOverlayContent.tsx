import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { InstagramLogo } from '@phosphor-icons/react'
import type { Member } from '@/lib/app-types'
import type { DecorativeTexts } from '@/lib/types'
import { sanitizeExternalHref } from '@/lib/sanitize-href'

interface MemberOverlayContentProps {
  data: Member
  decorativeTexts?: DecorativeTexts
}

export function MemberOverlayContent({ data, decorativeTexts }: MemberOverlayContentProps) {
  const profileLabel = decorativeTexts?.memberProfileLabel ?? '// MEMBER.PROFILE'
  return (
    <motion.div
      data-theme-color="card card-foreground border"
      className="space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-col gap-6 md:flex-row"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {data.image ? (
          <div className="relative h-40 w-40 shrink-0 bg-muted sm:h-48 sm:w-48">
            <img
              src={data.image}
              alt={data.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">{profileLabel}</div>
          <h2 className="mb-2 font-mono text-2xl font-bold uppercase crt-flash-in sm:text-4xl" data-text={data.name}>
            {data.name}
          </h2>
          {data.role ? (
            <p className="mb-4 font-mono text-base text-muted-foreground sm:text-xl">{data.role}</p>
          ) : null}
          {data.bio ? (
            <p className="leading-relaxed text-foreground/90">{data.bio}</p>
          ) : null}
          {data.instagram && (
            <Button asChild variant="outline" className="mt-4 font-mono">
              <a href={sanitizeExternalHref(data.instagram)} target="_blank" rel="noopener noreferrer">
                <InstagramLogo className="w-5 h-5 mr-2" weight="fill" />
                Follow
              </a>
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
