'use client'

import { useEffect, useState } from 'react'
import {
  PLATFORMS,
  PACKAGE_TYPES,
  RELEASE_CHANNELS,
  SIGNING_STATUSES,
  PLATFORM_META,
  MAX_RELEASE_UPLOAD_BYTES,
  MAX_AUTO_SHA_BYTES,
  MULTIPART_THRESHOLD_BYTES,
  RELEASE_FILE_EXTENSIONS,
  formatBytes,
  releaseEditable,
} from '@/lib/plugins/releases'
import { releasesResponseSchema, type Release } from '@/lib/plugins/release-schema'
import { createSignedUploadUrl } from '@/app/admin/_actions/r2Upload'
import { prepareReleaseUpload } from '@/app/admin/_actions/pluginReleaseUpload'
import { useR2MultipartUpload } from '@/hooks/useR2MultipartUpload'
import { describeR2UploadError } from '@/lib/r2-upload-error'

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  validated: 'Ready to publish',
  published: 'Published',
  withdrawn: 'Withdrawn',
}

const inputClass =
  'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600'
const primaryButton =
  'rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]'
const secondaryButton =
  'rounded border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]'

async function api(productId: string, body?: object): Promise<unknown> {
  const response = await fetch('/api/plugins/' + productId + '/releases', body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : { cache: 'no-store' })
  const payload: unknown = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Action failed. Check your session, MFA and release data.',
    )
  }
  return payload
}

function fileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

async function sha256Hex(file: File): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function ReleaseCard({ release, productId, onChanged }: {
  release: Release
  productId: string
  onChanged: () => Promise<void>
}) {
  const [versionNumber, setVersionNumber] = useState(release.version)
  const [title, setTitle] = useState(release.title ?? '')
  const [changelog, setChangelog] = useState(release.changelog ?? '')
  const [notes, setNotes] = useState(release.release_notes ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [manualSha, setManualSha] = useState('')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [upload, setUpload] = useState({
    platform: 'windows-x64' as (typeof PLATFORMS)[number],
    package_type: 'installer' as (typeof PACKAGE_TYPES)[number],
    signing_status: 'unsigned' as (typeof SIGNING_STATUSES)[number],
  })
  const multipart = useR2MultipartUpload()

  async function run(action: () => Promise<unknown>, ok: string) {
    setBusy(true)
    setMessage('')
    try {
      await action()
      await onChanged()
      setMessage(ok)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please retry.')
    } finally {
      setBusy(false)
    }
  }

  function pickFile(next: File | null) {
    setFile(next)
    setProgress(0)
    setMessage('')
    if (!next) return
    if (next.size > MAX_RELEASE_UPLOAD_BYTES) {
      setMessage('File too large (max 2 GB).')
      setFile(null)
      return
    }
    if (!(RELEASE_FILE_EXTENSIONS as readonly string[]).includes(fileExtension(next.name))) {
      setMessage('Use a ZIP, EXE, MSI, PKG, DMG, DEB, TAR/GZ, VST3 or AU file.')
      setFile(null)
      return
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(next.name)) {
      setMessage('Rename the file: only letters, digits, dots, dashes and underscores (no spaces).')
      setFile(null)
      return
    }
  }

  async function uploadFile() {
    if (!file) return
    setUploading(true)
    setMessage('')
    setProgress(0)
    try {
      const checksum = file.size <= MAX_AUTO_SHA_BYTES
        ? await sha256Hex(file)
        : manualSha.trim().toLowerCase()
      if (!/^[a-f0-9]{64}$/.test(checksum)) {
        throw new Error('Checksum missing. Run sha256sum and paste the 64 hex characters.')
      }

      const prepared = await prepareReleaseUpload({
        productId,
        releaseId: release.id,
        platform: upload.platform,
        filename: file.name,
        filesizeBytes: file.size,
      })
      if ('error' in prepared) throw new Error(prepared.error)
      const storageKey = prepared.storageKey

      if (file.size >= MULTIPART_THRESHOLD_BYTES) {
        const key = await multipart.upload(file, 'releases', storageKey)
        if (!key) throw new Error(multipart.error ?? 'Upload failed')
      } else {
        const signed = await createSignedUploadUrl(storageKey)
        const response = await fetch(signed.url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
        })
        if (!response.ok) throw new Error('Upload failed (' + response.status + ')')
      }
      setProgress(1)

      await api(productId, {
        action: 'artifact',
        release_id: release.id,
        platform: upload.platform,
        architecture: upload.platform === 'macos-arm64' ? 'arm64' : 'x64',
        package_type: upload.package_type,
        filename: file.name,
        filesize_bytes: file.size,
        sha256: checksum,
        signing_status: upload.signing_status,
      })
      await onChanged()
      setFile(null)
      setManualSha('')
      setMessage('Uploaded and registered. Mark the version as ready, then publish.')
    } catch (error) {
      setMessage(describeR2UploadError(error, 'Upload'))
    } finally {
      setUploading(false)
    }
  }

  const artifacts = release.plugin_release_artifacts
  const editable = releaseEditable(release.status)
  const unsigned = artifacts.some((item) => item.signing_status === 'unsigned')
  const macUnsigned = artifacts.some(
    (item) => item.platform.startsWith('macos') && item.signing_status !== 'notarized',
  )
  const ready = artifacts.length > 0 && artifacts.every((item) => item.validation_status === 'validated')

  return (
    <li className="space-y-4 rounded border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex flex-wrap items-baseline gap-3">
        {editable ? (
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            Version
            <input
              className={inputClass + ' w-36'}
              value={versionNumber}
              onChange={(event) => setVersionNumber(event.target.value)}
            />
          </label>
        ) : (
          <h2 className="text-lg font-semibold text-zinc-100">{release.version}</h2>
        )}
        {editable && (
          <button
            type="button"
            className={secondaryButton}
            disabled={busy || uploading || versionNumber.trim() === release.version}
            onClick={() => void run(
              () => api(productId, { action: 'update', id: release.id, version: versionNumber.trim() }),
              'Version number saved.',
            )}
          >
            Save version
          </button>
        )}
        <span className="text-xs uppercase tracking-widest text-zinc-500">{release.channel}</span>
        <span className="rounded border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
          {STATUS_LABEL[release.status] ?? release.status}
        </span>
        {release.published_at && (
          <span className="text-xs text-zinc-500">
            Published {new Date(release.published_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {unsigned && <p className="text-xs text-amber-300">Contains unsigned downloads.</p>}
      {macUnsigned && release.channel === 'stable' && (
        <p className="text-xs text-amber-300">
          macOS builds are not notarized. Keep this out of Stable until they are signed and notarized.
        </p>
      )}
      {!ready && editable && (
        <p className="text-xs text-zinc-400">Upload at least one file, then mark the version as ready.</p>
      )}

      <details className="rounded border border-zinc-800 p-3">
        <summary className="cursor-pointer text-sm text-zinc-300">Release notes and changelog</summary>
        <div className="mt-3 space-y-3">
          <label className="block text-sm text-zinc-300">
            Title
            <input className={inputClass + ' mt-1'} value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="block text-sm text-zinc-300">
            Changelog
            <textarea className={inputClass + ' mt-1 min-h-24'} value={changelog}
              onChange={(event) => setChangelog(event.target.value)} />
          </label>
          <label className="block text-sm text-zinc-300">
            Release notes
            <textarea className={inputClass + ' mt-1 min-h-24'} value={notes}
              onChange={(event) => setNotes(event.target.value)} />
          </label>
          <button
            className={secondaryButton}
            disabled={busy || release.status === 'published'}
            onClick={() => void run(
              () => api(productId, { action: 'update', id: release.id, title: title || null, changelog: changelog || null, release_notes: notes || null }),
              'Release notes saved.',
            )}
          >
            Save notes
          </button>
        </div>
      </details>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-200">Downloads</h3>
        {artifacts.length === 0 ? (
          <p className="text-sm text-zinc-500">No downloads uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {artifacts.map((item) => (
              <li key={item.id} className="rounded border border-zinc-800 p-3 text-sm text-zinc-300">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-zinc-100">{PLATFORM_META[item.platform as keyof typeof PLATFORM_META]?.label ?? item.platform}</span>
                  <span className="text-xs uppercase tracking-wide text-zinc-500">{item.package_type}</span>
                  <span className="text-xs text-zinc-500">{formatBytes(item.filesize_bytes)}</span>
                  <span className={`text-xs ${item.validation_status === 'validated' ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {item.validation_status === 'validated' ? 'Checked' : 'Needs check'}
                  </span>
                  <span className="text-xs text-zinc-500">{item.signing_status}</span>
                  {editable && (
                    <span className="ml-auto flex gap-3">
                      <button
                        type="button"
                        className="text-xs text-zinc-400 hover:text-zinc-200"
                        disabled={busy || uploading}
                        onClick={() => {
                          setUpload({
                            ...upload,
                            platform: item.platform as typeof upload.platform,
                            package_type: item.package_type as typeof upload.package_type,
                          })
                          setMessage('Choose a new file below to replace this download.')
                        }}
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-400 hover:text-red-300"
                        disabled={busy || uploading}
                        onClick={() => {
                          if (window.confirm('Delete this download and its file?')) {
                            void run(
                              () => api(productId, { action: 'delete_artifact', release_id: release.id, artifact_id: item.id }),
                              'Download deleted.',
                            )
                          }
                        }}
                      >
                        Delete
                      </button>
                    </span>
                  )}
                </div>
                <p className="mt-1 break-all font-mono text-xs text-zinc-500">{item.filename}</p>
                <p className="mt-1 break-all font-mono text-[11px] text-zinc-600">SHA-256 {item.sha256}</p>
              </li>
            ))}
          </ul>
        )}

        {editable && (
          <div className="space-y-3 rounded border border-zinc-800 p-3">
            <p className="text-sm font-medium text-zinc-200">Upload or replace a build</p>
            <p className="text-xs text-zinc-500">Same platform and file type replaces the current download.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-sm text-zinc-300">
                Platform
                <select className={inputClass + ' mt-1'} value={upload.platform}
                  onChange={(event) => setUpload({ ...upload, platform: event.target.value as typeof upload.platform })}>
                  {PLATFORMS.map((platform) => <option key={platform} value={platform}>{PLATFORM_META[platform].label}</option>)}
                </select>
              </label>
              <label className="text-sm text-zinc-300">
                File type
                <select className={inputClass + ' mt-1'} value={upload.package_type}
                  onChange={(event) => setUpload({ ...upload, package_type: event.target.value as typeof upload.package_type })}>
                  {PACKAGE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="text-sm text-zinc-300 sm:col-span-2">
                File (max 2 GB)
                <input
                  type="file"
                  className={inputClass + ' mt-1'}
                  onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
                />
              </label>
              {file && (
                <p className="text-xs text-zinc-400 sm:col-span-2">
                  {file.name} · {formatBytes(file.size)}
                  {file.size > MAX_AUTO_SHA_BYTES && ' · checksum required below'}
                </p>
              )}
              <label className="text-sm text-zinc-300 sm:col-span-2">
                SHA-256 {file && file.size <= MAX_AUTO_SHA_BYTES ? '(computed automatically)' : '(sha256sum <file>)'}
                <input
                  className={inputClass + ' mt-1 font-mono'}
                  value={manualSha}
                  placeholder={file && file.size <= MAX_AUTO_SHA_BYTES ? 'computed on upload' : '64 hex characters'}
                  onChange={(event) => setManualSha(event.target.value)}
                />
              </label>
              <label className="text-sm text-zinc-300">
                Signature
                <select className={inputClass + ' mt-1'} value={upload.signing_status}
                  onChange={(event) => setUpload({ ...upload, signing_status: event.target.value as typeof upload.signing_status })}>
                  {SIGNING_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <div className="flex items-end">
                <button type="button" className={secondaryButton} disabled={!file || uploading || busy}
                  onClick={() => void uploadFile()}>
                  {uploading ? `Uploading ${Math.round(progress * 100)}%` : 'Upload'}
                </button>
              </div>
            </div>
            {uploading && progress > 0 && (
              <div className="h-1 w-full overflow-hidden rounded bg-zinc-800">
                <div className="h-full bg-red-600 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={secondaryButton}
          disabled={busy || !editable || artifacts.length === 0}
          onClick={() => void run(() => api(productId, { action: 'validate', id: release.id }), 'Version is ready to publish.')}
        >
          Mark as ready
        </button>
        <button
          className={primaryButton}
          disabled={busy || release.status === 'published' || artifacts.length === 0}
          onClick={() => {
            if (window.confirm(`Publish version ${release.version} (${release.channel}) to the public page?`)) {
              void run(() => api(productId, { action: 'publish', id: release.id }), 'Version published.')
            }
          }}
        >
          {release.status === 'withdrawn' ? 'Publish again' : 'Publish'}
        </button>
        <button
          className={secondaryButton}
          disabled={busy || release.status !== 'published'}
          onClick={() => {
            if (window.confirm('Withdraw this version? It stops being offered, but its files stay in storage.')) {
              void run(() => api(productId, { action: 'withdraw', id: release.id }), 'Version withdrawn.')
            }
          }}
        >
          Withdraw
        </button>
      </div>

      <p role="status" className="min-h-6 text-sm text-zinc-400">{message}</p>
    </li>
  )
}

export function ReleasePanel({ productId }: { productId: string }) {
  const [releases, setReleases] = useState<Release[]>([])
  const [version, setVersion] = useState('')
  const [channel, setChannel] = useState('stable')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function refresh() {
    const payload = await api(productId)
    setReleases(releasesResponseSchema.parse(payload).releases)
  }

  useEffect(() => {
    void refresh().catch((error) =>
      setMessage(error instanceof Error ? error.message : 'Could not load versions.'),
    )
  }, [productId])

  return (
    <div className="space-y-6">
      <form
        className="space-y-3 rounded border border-zinc-800 bg-zinc-950/60 p-4"
        onSubmit={(event) => {
          event.preventDefault()
          setBusy(true)
          setMessage('')
          void api(productId, { action: 'create', version, channel })
            .then(async () => {
              setVersion('')
              await refresh()
              setMessage('Version created. Upload its builds next.')
            })
            .catch((error) => setMessage(error instanceof Error ? error.message : 'Please retry.'))
            .finally(() => setBusy(false))
        }}
      >
        <h2 className="text-sm font-semibold text-zinc-200">New version</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[12rem] flex-1 text-sm text-zinc-300">
            Version
            <input required className={inputClass + ' mt-1'} placeholder="1.4.0" value={version}
              onChange={(event) => setVersion(event.target.value)} />
          </label>
          <label className="w-36 text-sm text-zinc-300">
            Channel
            <select className={inputClass + ' mt-1'} value={channel} onChange={(event) => setChannel(event.target.value)}>
              {RELEASE_CHANNELS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button className={primaryButton} disabled={busy}>{busy ? 'Working…' : 'Create'}</button>
        </div>
      </form>

      <p role="status" className="min-h-6 text-sm text-zinc-400">{message}</p>

      {releases.length === 0 ? (
        <p className="rounded border border-zinc-800 p-4 text-sm text-zinc-500">
          No versions yet. Create one to upload a build.
        </p>
      ) : (
        <ul className="space-y-4">
          {releases.map((release) => (
            <ReleaseCard key={release.id} release={release} productId={productId} onChanged={refresh} />
          ))}
        </ul>
      )}
    </div>
  )
}


