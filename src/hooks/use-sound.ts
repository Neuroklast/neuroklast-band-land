import { useCallback, useEffect, useRef, useState } from 'react'
import type { SoundSettings } from '@/lib/types'
import { toDirectImageUrl } from '@/lib/image-cache'

/** Convert Drive share links to direct download URLs for audio files */
function toDirectAudioUrl(url?: string): string {
  if (!url) return ''
  // Re-use the existing Drive → direct URL logic (works for any file type)
  return toDirectImageUrl(url)
}

const audioCache = new Map<string, HTMLAudioElement>()

function getCachedAudio(url: string): HTMLAudioElement | null {
  if (!url) return null
  const cached = audioCache.get(url)
  if (cached) return cached
  try {
    const audio = new Audio(url)
    audio.preload = 'auto'
    audioCache.set(url, audio)
    return audio
  } catch {
    return null
  }
}

export function useSound(settings?: SoundSettings, editMode?: boolean) {
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem('nk-sound-muted') === 'true' } catch { return false }
  })
  const cachedRef = useRef(false)

  // Determine whether any sounds are configured
  const hasSounds = !!(settings?.terminalSound || settings?.typingSound || settings?.buttonSound)

  // Pre-cache sounds when leaving edit mode
  useEffect(() => {
    if (editMode || cachedRef.current || !settings) return
    const urls = [
      toDirectAudioUrl(settings.terminalSound),
      toDirectAudioUrl(settings.typingSound),
      toDirectAudioUrl(settings.buttonSound),
    ].filter(Boolean)
    urls.forEach(getCachedAudio)
    cachedRef.current = true
  }, [settings, editMode])

  // Invalidate cache when settings change
  useEffect(() => {
    cachedRef.current = false
  }, [settings?.terminalSound, settings?.typingSound, settings?.buttonSound])

  // Persist mute preference
  useEffect(() => {
    try { localStorage.setItem('nk-sound-muted', String(muted)) } catch { /* noop */ }
  }, [muted])

  const play = useCallback((type: 'terminal' | 'typing' | 'button') => {
    if (muted || !settings) return
    const urlMap: Record<string, string | undefined> = {
      terminal: settings.terminalSound,
      typing: settings.typingSound,
      button: settings.buttonSound,
    }
    const rawUrl = urlMap[type]
    if (!rawUrl) return
    const url = toDirectAudioUrl(rawUrl)
    const audio = getCachedAudio(url)
    if (audio) {
      // Clone to allow overlapping playback
      const clone = audio.cloneNode() as HTMLAudioElement
      clone.volume = 0.4
      clone.play().catch(() => { /* ignore autoplay restrictions */ })
    }
  }, [muted, settings])

  const toggleMute = useCallback(() => setMuted(m => !m), [])

  return { play, muted, toggleMute, hasSounds }
}
