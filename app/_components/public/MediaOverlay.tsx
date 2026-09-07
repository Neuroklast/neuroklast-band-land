'use client'

import { useCallback, useEffect, useState, startTransition } from 'react'
import { motion } from 'framer-motion'
import { Folder, File, DownloadSimple } from '@phosphor-icons/react'
import CyberCloseButton from '@/components/CyberCloseButton'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import { useLocale } from '@/contexts/LocaleContext'
import type { MediaFile } from '@/lib/types'
import { downloadFile, type DownloadProgress } from '@/lib/download'

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/)
  return match?.[1] ?? null
}

function getFolders(files: MediaFile[]): string[] {
  const folders = new Set<string>()
  files.forEach((f) => {
    if (f.folder) folders.add(f.folder)
  })
  return Array.from(folders).sort()
}

function getFilesInFolder(files: MediaFile[], folder: string | null): MediaFile[] {
  if (folder === null) return files.filter((f) => !f.folder)
  return files.filter((f) => f.folder === folder)
}

function MediaLoadingScreen() {
  const { t } = useLocale()
  const [loadingText, setLoadingText] = useState(t('media.initFS'))

  useEffect(() => {
    const texts = [t('media.initFS'), t('media.decrypt'), t('media.accessGranted')]
    let idx = 0
    const interval = setInterval(() => {
      idx++
      if (idx < texts.length) setLoadingText(texts[idx])
    }, 500)
    return () => clearInterval(interval)
  }, [t])

  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-24 h-1 bg-primary/30 overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      </div>
      <p className="text-primary/70 font-mono text-xs tracking-wider">{loadingText}</p>
    </motion.div>
  )
}

function FileTreeView({
  files,
  selectedFolder,
  onSelectFolder,
  selectedFile,
  onSelectFile,
}: {
  files: MediaFile[]
  selectedFolder: string | null
  onSelectFolder: (folder: string | null) => void
  selectedFile: MediaFile | null
  onSelectFile: (file: MediaFile) => void
}) {
  const { t } = useLocale()
  const folders = getFolders(files)
  const rootFiles = getFilesInFolder(files, null)

  return (
    <div className="space-y-1 font-mono text-xs">
      <button
        className={`w-full text-left px-2 py-1.5 flex items-center gap-2 transition-colors ${
          selectedFolder === null ? 'text-primary bg-primary/10' : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
        }`}
        onClick={() => onSelectFolder(null)}
      >
        <Folder size={14} weight="fill" className="text-primary/60 flex-shrink-0" />
        <span className="truncate">{t('media.root')}</span>
      </button>

      {folders.map((folder) => (
        <div key={folder}>
          <button
            className={`w-full text-left px-2 py-1.5 pl-4 flex items-center gap-2 transition-colors ${
              selectedFolder === folder ? 'text-primary bg-primary/10' : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
            }`}
            onClick={() => onSelectFolder(folder)}
          >
            <Folder size={14} weight="fill" className="text-primary/60 flex-shrink-0" />
            <span className="truncate">/{folder.toUpperCase()}</span>
          </button>
          {selectedFolder === folder &&
            getFilesInFolder(files, folder).map((file) => (
              <button
                key={file.id}
                className={`w-full text-left px-2 py-1 pl-8 flex items-center gap-2 transition-colors ${
                  selectedFile?.id === file.id ? 'text-primary bg-primary/10' : 'text-foreground/60 hover:text-primary hover:bg-primary/5'
                }`}
                onClick={() => onSelectFile(file)}
              >
                <File size={12} className="text-primary/40 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
        </div>
      ))}

      {selectedFolder === null &&
        rootFiles.map((file) => (
          <button
            key={file.id}
            className={`w-full text-left px-2 py-1 pl-4 flex items-center gap-2 transition-colors ${
              selectedFile?.id === file.id ? 'text-primary bg-primary/10' : 'text-foreground/60 hover:text-primary hover:bg-primary/5'
            }`}
            onClick={() => onSelectFile(file)}
          >
            <File size={12} className="text-primary/40 flex-shrink-0" />
            <span className="truncate">{file.name}</span>
          </button>
        ))}

      {files.length === 0 && (
        <p className="text-primary/30 text-[10px] px-2 py-4">{t('media.noFiles')}</p>
      )}
    </div>
  )
}

function FileDetailPanel({ file, allFiles }: { file: MediaFile | null; allFiles: MediaFile[] }) {
  const { t } = useLocale()
  const [dlProgress, setDlProgress] = useState<DownloadProgress>({ state: 'idle', progress: 0 })

  const handleDownload = useCallback(() => {
    if (!file || dlProgress.state === 'downloading') return
    void downloadFile(file.url, file.name, setDlProgress)
  }, [file, dlProgress.state])

  useEffect(() => {
    startTransition(() => setDlProgress({ state: 'idle', progress: 0 }))
  }, [file?.id])

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <File size={48} className="text-primary/20 mb-3" />
        <p className="text-primary/40 font-mono text-xs tracking-wider">{t('media.selectFile')}</p>
      </div>
    )
  }

  const youtubeId = file.type === 'youtube' ? extractYouTubeId(file.url) : null
  const audioTracks = allFiles.filter((f) => f.type === 'audio').map((f) => ({ title: f.name, src: f.url }))
  const audioIndex = file.type === 'audio' ? audioTracks.findIndex((track) => track.src === file.url) : -1

  return (
    <motion.div
      key={file.id}
      className="p-4 md:p-6 space-y-4"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-[10px] text-primary/50 tracking-wider mb-2">
        {'>'} {t('media.fileDataPrefix')} {file.name.toUpperCase()}
      </div>

      {youtubeId && <YouTubeEmbed videoId={youtubeId} title={file.name} />}

      {file.type === 'audio' && audioTracks.length > 0 && audioIndex >= 0 && (
        <audio src={file.url} controls className="w-full" />
      )}

      <div className="bg-black/50 border border-primary/20 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <File size={16} className="text-primary/60" />
          <span className="font-mono text-sm text-foreground/90">{file.name}</span>
        </div>

        {file.folder && (
          <div className="text-xs font-mono text-foreground/50">
            <span className="text-primary/40">{t('media.folderLabel')}</span> /{file.folder.toUpperCase()}
          </div>
        )}

        {file.description && (
          <div className="border-t border-primary/10 pt-3">
            <p className="text-xs text-foreground/70 leading-relaxed">{file.description}</p>
          </div>
        )}
      </div>

      {!youtubeId && (
        <div className="space-y-2">
          <button
            onClick={handleDownload}
            disabled={dlProgress.state === 'downloading'}
            className="inline-flex items-center gap-2 px-4 py-2 border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-xs tracking-wider transition-all hover:shadow-[0_0_15px_var(--primary-glow)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadSimple size={16} />
            {dlProgress.state === 'downloading'
              ? t('media.downloading')
              : dlProgress.state === 'complete'
                ? t('media.downloaded')
                : t('media.download')}
          </button>

          {dlProgress.state === 'downloading' && (
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-primary/20 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.max(dlProgress.progress * 100, 5)}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <p className="font-mono text-[9px] text-primary/50 tracking-wider">
                {t('media.downloadProgress').replace('{0}', String(Math.round(dlProgress.progress * 100)))}
              </p>
            </div>
          )}

          {dlProgress.state === 'complete' && (
            <p className="font-mono text-[9px] text-primary/70 tracking-wider">{t('media.downloadComplete')}</p>
          )}

          {dlProgress.state === 'error' && (
            <p className="font-mono text-[9px] text-destructive/70 tracking-wider">
              {t('media.error').replace('{0}', dlProgress.error || 'Download failed')}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-[9px] text-primary/40 pt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
        <span>{t('media.fileReady')}</span>
        <span className="ml-auto">{t('media.version')}</span>
      </div>
    </motion.div>
  )
}

export function MediaExplorerBody({ files }: { files: MediaFile[] }) {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const { t } = useLocale()

  return (
    <div className="-mx-4 mt-2 flex min-h-[min(420px,60dvh)] flex-col border-t border-primary/20 md:-mx-12 md:flex-row">
      <div className="max-h-[200px] overflow-y-auto border-b border-primary/20 p-3 md:max-h-none md:w-2/5 md:border-b-0 md:border-r">
        <div className="mb-2 px-2 text-[9px] tracking-wider text-primary/40">{t('media.directory')}</div>
        <FileTreeView
          files={files}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
        />
      </div>
      <div className="flex-1 overflow-y-auto md:w-3/5">
        <FileDetailPanel file={selectedFile} allFiles={files} />
      </div>
    </div>
  )
}

export function MediaOverlay({ files, onClose }: { files: MediaFile[]; onClose: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'ready'>('loading')
  const { t } = useLocale()

  useEffect(() => {
    const timer = setTimeout(() => setPhase('ready'), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 bg-black/95 backdrop-blur-md overflow-y-auto flex items-center justify-center p-4 md:p-6"
      style={{ zIndex: 'var(--z-overlay)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {phase === 'loading' && <MediaLoadingScreen />}

      {phase === 'ready' && (
        <motion.div
          className="w-full max-w-4xl h-[min(600px,80dvh)] bg-card border border-primary/30 relative overflow-hidden flex flex-col"
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 30, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/50" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/50" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/50" />

          <div className="h-10 bg-primary/10 border-b border-primary/30 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[10px] text-primary/70 tracking-wider uppercase">
                {t('media.explorerTitle')}
              </span>
            </div>
            <CyberCloseButton onClick={onClose} label={t('media.close')} />
          </div>

          <MediaExplorerBody files={files} />
        </motion.div>
      )}
    </motion.div>
  )
}
