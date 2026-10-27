'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { MediaSourcePicker } from '@/app/admin/_components/MediaSourcePicker'
import { createSoundpack, updateSoundpack } from '@/app/admin/_actions/soundpacks'
import { signDigitalPackUpload, verifyDigitalPackArchive } from '@/app/admin/_actions/digitalPacks'
import { r2Url } from '@/lib/r2'

export interface EditableSoundpack {
  id: string
  title: string
  image_storage_path: string | null
  image_url: string | null
  external_url: string | null
  display_order: number
  description: string
  pack_type: 'sample_pack' | 'preset_pack'
  is_free: boolean
  price_cents: number
  archive_key: string | null
  archive_filename: string | null
  archive_bytes: number | null
  sample_count: number
  format_description: string
  license_notes: string
}

const field = 'min-h-11 w-full border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none'
const label = 'block space-y-1 text-sm text-zinc-300'

export function SoundpackEditor({ item }: { item?: EditableSoundpack }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [image, setImage] = useState<string | null>(item?.image_storage_path || null)
  const [free, setFree] = useState(item?.is_free ?? true)
  const [archive, setArchive] = useState<{ key: string; filename: string; bytes: number } | null>(
    item?.archive_key && item.archive_filename && item.archive_bytes
      ? { key: item.archive_key, filename: item.archive_filename, bytes: item.archive_bytes }
      : null,
  )

  async function upload(file: File) {
    setError('')
    if (!file.name.toLowerCase().endsWith('.zip')) { setError('Only ZIP archives are accepted.'); return }
    setUploading(true)
    try {
      const signed = await signDigitalPackUpload(file.name, file.size)
      const response = await fetch(signed.uploadUrl, {
        method: 'PUT', headers: { 'Content-Type': 'application/zip' }, body: file,
      })
      if (!response.ok) throw new Error('Private R2 upload failed. Check bucket CORS settings.')
      await verifyDigitalPackArchive(signed.key, file.size)
      setArchive({ key: signed.key, filename: file.name, bytes: file.size })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Archive upload failed.')
    } finally { setUploading(false) }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || uploading) return
    setBusy(true)
    setError('')
    try {
      const fd = new FormData(event.currentTarget)
      if (image) { fd.set('image_storage_path', image); fd.set('image_url', '') }
      if (archive) {
        fd.set('archive_key', archive.key)
        fd.set('archive_filename', archive.filename)
        fd.set('archive_bytes', String(archive.bytes))
      }
      const euroValue = Number(fd.get('price_eur') || '0')
      if (!free && (!Number.isFinite(euroValue) || euroValue < 1 || euroValue > 1000))
        throw new Error('Price must be between 1 and 1000 EUR.')
      fd.set('price_cents', String(free ? 0 : Math.round(euroValue * 100)))
      fd.delete('price_eur')
      const result = item ? await updateSoundpack(item.id, fd) : await createSoundpack(fd)
      if (result.error) throw new Error(result.error)
      router.push('/admin/soundpacks')
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save the digital product.')
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={event => void save(event)} className="max-w-3xl space-y-6 border border-zinc-800 bg-zinc-950/40 p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={label}><span>Pack title</span><input required maxLength={150} name="title" defaultValue={item?.title || ''} className={field}/></label>
        <label className={label}><span>Pack category</span>
          <select name="pack_type" defaultValue={item?.pack_type || 'sample_pack'} className={field}>
            <option value="sample_pack">Sound / sample pack (WAV, loops, one-shots)</option>
            <option value="preset_pack">NEUROKORE preset pack</option>
          </select>
        </label>
      </div>
      <label className={label}><span>Description</span><textarea name="description" rows={5} maxLength={4000}
        defaultValue={item?.description || ''} className={field} placeholder="Sounds, genres, intended use, examples and what's included"/></label>
      <MediaSourcePicker label="Cover artwork" storagePrefix={item ? 'soundpacks/' + item.id : 'soundpacks'}
        currentUrl={item ? (r2Url(item.image_storage_path) ?? item.image_url) : undefined}
        onResolved={path=>{setImage(path);setError('')}} onError={setError}/>
      <section className="space-y-3 border border-zinc-700 p-4">
        <h2 className="font-semibold">Private downloadable ZIP</h2>
        <p className="text-xs leading-6 text-zinc-400">
          Archives are uploaded to a PRIVATE R2 bucket, never the public media bucket.
          Paid downloads are authorized by ownership. Supports archives up to 1 GiB.
        </p>
        <input type="file" accept=".zip,application/zip" disabled={uploading||busy}
          className="block w-full text-sm text-zinc-300" onChange={event=>{const file=event.target.files?.[0];if(file)void upload(file)}}/>
        <p role="status" className="text-xs text-zinc-300">
          {uploading?'Uploading and verifying archive…':archive
            ? archive.filename+' · '+(archive.bytes/1048576).toFixed(1)+' MiB'
            :'No archive uploaded. Product cannot be downloaded until one is added.'}
        </p>
      </section>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={label}><span>Approx. number of presets / samples</span>
          <input name="sample_count" type="number" min={0} max={1000000} defaultValue={item?.sample_count||0} className={field}/></label>
        <label className={label}><span>Audio or preset formats</span>
          <input name="format_description" maxLength={500} defaultValue={item?.format_description||''}
            placeholder="WAV 24-bit / 48 kHz or NEUROKORE 1.0+" className={field}/></label>
      </div>
      <label className={label}><span>Licence / permitted uses (review legally before selling)</span>
        <textarea name="license_notes" rows={4} maxLength={5000} defaultValue={item?.license_notes||''}
          className={field} placeholder="Explain commercial music use, redistribution restrictions and whether credit is required."/></label>
      <section className="space-y-4 border-t border-zinc-700 pt-5">
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="is_free" checked={free}
          onChange={event=>setFree(event.target.checked)}/> Free download</label>
        {!free && <label className={label}><span>One-time price in EUR, including applicable VAT</span>
          <input type="number" name="price_eur" step=".01" min="1" max="1000"
            defaultValue={((item?.price_cents||990)/100).toFixed(2)} className={field}/></label>}
        <label className={label}><span>Display order</span><input type="number" name="display_order"
          defaultValue={item?.display_order||0} className={field}/></label>
        <p className="text-xs text-amber-300">
          Paid pack sales remain locked behind DIGITAL_PACK_SALES_ENABLED. Existing purchases keep their original ZIP snapshot even after the pack is updated.
        </p>
      </section>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={busy||uploading}
        className="min-h-11 border border-red-600 bg-red-900/40 px-6 py-2 font-semibold text-white hover:bg-red-900/70 disabled:opacity-40">
        {busy?'Saving…':'Save digital pack'}
      </button>
    </form>
  )
}
