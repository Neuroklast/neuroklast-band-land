'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateSiteConfig } from '@/app/admin/_actions/siteConfig'
import { broadcastAdminRefresh } from '@/lib/admin-draft-channel'
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes'
import { IMAGE_CDN_MODES, parseImageCdnMode, type ImageCdnMode } from '@/lib/image-cdn'

interface ImageCdnEditorProps {
  currentValue: Record<string, unknown>
}

const MODE_COPY: Record<ImageCdnMode, { label: string; description: string }> = {
  wsrv: {
    label: 'wsrv.nl proxy (default)',
    description:
      'Free image proxy. Resizes and converts to WebP, caches on a global CDN. No quota, no extra cost.',
  },
  vercel: {
    label: 'Vercel Image Optimization',
    description:
      'Serves images through /_next/image. Requires the deploy flag NEXT_PUBLIC_IMAGE_OPTIMIZATION=on and consumes the Vercel image quota (requests fail with 402 once exceeded). Falls back to the raw URL while the flag is off.',
  },
  direct: {
    label: 'Direct origin URL',
    description:
      'No proxy and no resizing. Fastest to configure, but every visitor downloads the original file size.',
  },
}

export function ImageCdnEditor({ currentValue }: ImageCdnEditorProps) {
  const router = useRouter()
  const initialMode = parseImageCdnMode(currentValue)
  const [mode, setMode] = useState<ImageCdnMode>(initialMode)
  const [savedMode, setSavedMode] = useState<ImageCdnMode>(initialMode)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useUnsavedChanges(mode !== savedMode)

  async function handleSave() {
    setStatus('saving')
    setErrorMsg(null)
    const fd = new FormData()
    fd.set('key', 'imageCdn')
    fd.set('value', JSON.stringify({ mode }))
    const result = await updateSiteConfig(fd)
    if (result.error) {
      setStatus('error')
      setErrorMsg(result.error)
      return
    }
    setStatus('saved')
    setSavedMode(mode)
    broadcastAdminRefresh()
    router.refresh()
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className="border border-zinc-800 rounded p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-200">Images</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          How remote artwork, photos and partner logos are delivered to visitors.
        </p>
      </div>

      <div className="space-y-2">
        {IMAGE_CDN_MODES.map((value) => {
          const copy = MODE_COPY[value]
          const checked = mode === value
          return (
            <label
              key={value}
              className={`flex gap-3 rounded border p-3 cursor-pointer transition-colors ${
                checked ? 'border-red-700/60 bg-red-950/20' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="image-cdn-mode"
                value={value}
                checked={checked}
                onChange={() => setMode(value)}
                className="mt-0.5 accent-red-600"
              />
              <span className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-widest text-zinc-200">
                  {copy.label}
                </span>
                <span className="block text-xs text-zinc-500">{copy.description}</span>
              </span>
            </label>
          )
        })}
      </div>

      {mode === 'vercel' && (
        <p className="rounded border border-amber-800/50 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
          Reminder: set <code className="font-mono">NEXT_PUBLIC_IMAGE_OPTIMIZATION=on</code> in the
          Vercel project (Production) and redeploy — otherwise images keep their original URL.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving' || mode === savedMode}
          className="px-3 py-1.5 text-sm rounded bg-zinc-700 hover:bg-zinc-600 text-white transition-colors disabled:opacity-50"
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {status === 'saved' && <span className="text-xs text-green-400">Saved</span>}
        {status === 'error' && <span className="text-xs text-red-400">{errorMsg ?? 'Error'}</span>}
      </div>
    </div>
  )
}
