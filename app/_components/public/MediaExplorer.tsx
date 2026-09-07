'use client'

import { Folder } from '@phosphor-icons/react'
import { useLocale } from '@/contexts/LocaleContext'
import { useOverlay } from '@/contexts/OverlayContext'
import { mediaKindFromMime, type MediaDownloadItem } from '@/lib/media-download'
import type { MediaFile } from '@/lib/types'

export function toExplorerFiles(items: MediaDownloadItem[]): MediaFile[] {
  return items
    .filter((item) => Boolean(item.fileUrl))
    .map((item) => {
      const kind = mediaKindFromMime(item.fileMime, item.originalFilename)
      return {
        id: item.id,
        name: item.title,
        url: item.fileUrl as string,
        folder: item.category,
        type: kind === 'audio' ? 'audio' : 'download',
        description: item.description ?? undefined,
      }
    })
}

export function MediaArchiveCard({ items }: { items: MediaDownloadItem[] }) {
  const { t } = useLocale()
  const { openOverlay } = useOverlay()
  const count = toExplorerFiles(items).length

  return (
    <button
      type="button"
      className="nk-os-frame flex w-full items-center gap-4 p-6 text-left md:p-8"
      onClick={() => openOverlay({ type: 'explorer', data: { items } })}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-primary/30 bg-primary/5">
        <Folder size={24} weight="fill" className="text-primary/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm uppercase tracking-wider">{t('media.openArchive')}</p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          {count > 0
            ? t('media.filesAvailable').replace('{0}', String(count)).replace('{1}', count === 1 ? '' : 'S')
            : t('media.pressKits')}
        </p>
      </div>
      <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-wider text-primary/40 md:inline">
        {t('media.clickToAccess')}
      </span>
    </button>
  )
}
