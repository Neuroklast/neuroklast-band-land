'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import {
  PLATFORMS,
  PACKAGE_TYPES,
  RELEASE_CHANNELS,
  SIGNING_STATUSES,
  PLATFORM_META,
  formatBytes,
} from '@/lib/neurokore/releases'

const artifactSchema = z.object({
  id: z.string(),
  platform: z.string(),
  architecture: z.string(),
  package_type: z.string(),
  filename: z.string(),
  storage_key: z.string().default(''),
  filesize_bytes: z.number(),
  sha256: z.string(),
  signing_status: z.string(),
  validation_status: z.string(),
})

const releaseSchema = z.object({
  id: z.string(),
  version: z.string(),
  channel: z.string(),
  status: z.string(),
  title: z.string().nullable(),
  changelog: z.string().nullable(),
  release_notes: z.string().nullable(),
  git_commit_sha: z.string().nullable(),
  created_at: z.string(),
  validated_at: z.string().nullable(),
  published_at: z.string().nullable(),
  withdrawn_at: z.string().nullable(),
  neurokore_release_artifacts: z.array(artifactSchema).default([]),
})

type Release = z.infer<typeof releaseSchema>

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

async function api(body?: object): Promise<unknown> {
  const response = await fetch('/api/neurokore/releases', body
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

function ReleaseCard({ release, onChanged }: { release: Release; onChanged: () => Promise<void> }) {
  const [title, setTitle] = useState(release.title ?? '')
  const [changelog, setChangelog] = useState(release.changelog ?? '')
  const [notes, setNotes] = useState(release.release_notes ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [artifact, setArtifact] = useState({
    platform: 'windows-x64' as (typeof PLATFORMS)[number],
    architecture: 'x64',
    package_type: 'installer' as (typeof PACKAGE_TYPES)[number],
    filename: '',
    filesize_bytes: '',
    sha256: '',
    signing_status: 'unsigned' as (typeof SIGNING_STATUSES)[number],
  })

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

  const unpublished = release.status === 'draft' || release.status === 'validated'
  const unsigned = release.neurokore_release_artifacts.some((item) => item.signing_status === 'unsigned')
  const macUnsigned = release.neurokore_release_artifacts.some(
    (item) => item.platform.startsWith('macos') && item.signing_status !== 'notarized',
  )
  const ready = release.neurokore_release_artifacts.length > 0 &&
    release.neurokore_release_artifacts.every((item) => item.validation_status === 'validated')

  return (
    <li className="space-y-4 rounded border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-lg font-semibold text-zinc-100">{release.version}</h2>
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
      {!ready && unpublished && (
        <p className="text-xs text-zinc-400">Add at least one download, then mark the version as ready.</p>
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
              () => api({ action: 'update', id: release.id, title: title || null, changelog: changelog || null, release_notes: notes || null }),
              'Release notes saved.',
            )}
          >
            Save notes
          </button>
        </div>
      </details>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-zinc-200">Downloads</h3>
        {release.neurokore_release_artifacts.length === 0 ? (
          <p className="text-sm text-zinc-500">No downloads registered yet.</p>
        ) : (
          <ul className="space-y-2">
            {release.neurokore_release_artifacts.map((item) => (
              <li key={item.id} className="rounded border border-zinc-800 p-3 text-sm text-zinc-300">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-zinc-100">{PLATFORM_META[item.platform as keyof typeof PLATFORM_META]?.label ?? item.platform}</span>
                  <span className="text-xs uppercase tracking-wide text-zinc-500">{item.package_type}</span>
                  <span className="text-xs text-zinc-500">{formatBytes(item.filesize_bytes)}</span>
                  <span className={`text-xs ${item.validation_status === 'validated' ? 'text-emerald-400' : 'text-amber-300'}`}>
                    {item.validation_status === 'validated' ? 'Checked' : 'Needs check'}
                  </span>
                  <span className="text-xs text-zinc-500">{item.signing_status}</span>
                </div>
                <p className="mt-1 break-all font-mono text-xs text-zinc-500">{item.filename}</p>
                {item.storage_key && (
                  <p className="mt-1 break-all font-mono text-[11px] text-zinc-600">Storage: {item.storage_key}</p>
                )}
                <p className="mt-1 break-all font-mono text-[11px] text-zinc-600">SHA-256 {item.sha256}</p>
              </li>
            ))}
          </ul>
        )}
        {unpublished && (
          <form
            className="grid gap-2 rounded border border-zinc-800 p-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault()
              void run(() => api({
                action: 'artifact',
                release_id: release.id,
                platform: artifact.platform,
                architecture: artifact.platform === 'macos-arm64' ? 'arm64' : 'x64',
                package_type: artifact.package_type,
                filename: artifact.filename,
                filesize_bytes: Number(artifact.filesize_bytes),
                sha256: artifact.sha256.trim().toLowerCase(),
                signing_status: artifact.signing_status,
              }), 'Download registered. Check the checksum, then mark the version ready.')
            }}
          >
            <label className="text-sm text-zinc-300">
              Platform
              <select className={inputClass + ' mt-1'} value={artifact.platform}
                onChange={(event) => setArtifact({ ...artifact, platform: event.target.value as typeof artifact.platform })}>
                {PLATFORMS.map((platform) => <option key={platform} value={platform}>{PLATFORM_META[platform].label}</option>)}
              </select>
            </label>
            <label className="text-sm text-zinc-300">
              File type
              <select className={inputClass + ' mt-1'} value={artifact.package_type}
                onChange={(event) => setArtifact({ ...artifact, package_type: event.target.value as typeof artifact.package_type })}>
                {PACKAGE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="text-sm text-zinc-300">
              File name
              <input required className={inputClass + ' mt-1'} value={artifact.filename}
                placeholder="NEUROKORE-1.4.0-Windows.exe"
                onChange={(event) => setArtifact({ ...artifact, filename: event.target.value })} />
            </label>
            <label className="text-sm text-zinc-300">
              Size in bytes
              <input required type="number" min={1} className={inputClass + ' mt-1'} value={artifact.filesize_bytes}
                onChange={(event) => setArtifact({ ...artifact, filesize_bytes: event.target.value })} />
            </label>
            <label className="text-sm text-zinc-300 sm:col-span-2">
              SHA-256
              <input required pattern="[a-fA-F0-9]{64}" className={inputClass + ' mt-1 font-mono'} value={artifact.sha256}
                onChange={(event) => setArtifact({ ...artifact, sha256: event.target.value })} />
            </label>
            <label className="text-sm text-zinc-300">
              Signature
              <select className={inputClass + ' mt-1'} value={artifact.signing_status}
                onChange={(event) => setArtifact({ ...artifact, signing_status: event.target.value as typeof artifact.signing_status })}>
                {SIGNING_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <div className="flex items-end">
              <button className={secondaryButton} disabled={busy}>Add download</button>
            </div>
          </form>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className={secondaryButton}
          disabled={busy || !unpublished || release.neurokore_release_artifacts.length === 0}
          onClick={() => void run(() => api({ action: 'validate', id: release.id }), 'Version is ready to publish.')}
        >
          Mark as ready
        </button>
        <button
          className={primaryButton}
          disabled={busy || release.status === 'published' || release.neurokore_release_artifacts.length === 0}
          onClick={() => {
            if (window.confirm(`Publish NEUROKORE ${release.version} (${release.channel}) to the public download page?`)) {
              void run(() => api({ action: 'publish', id: release.id }), 'Version published.')
            }
          }}
        >
          {release.status === 'withdrawn' ? 'Publish again' : 'Publish'}
        </button>
        <button
          className={secondaryButton}
          disabled={busy || release.status !== 'published'}
          onClick={() => {
            if (window.confirm('Withdraw this version? It will stop being offered, but its files stay available for support.')) {
              void run(() => api({ action: 'withdraw', id: release.id }), 'Version withdrawn.')
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

export function ReleaseAdmin({ publicEnabled, salesEnabled }: { publicEnabled: boolean; salesEnabled: boolean }) {
  const [releases, setReleases] = useState<Release[]>([])
  const [version, setVersion] = useState('')
  const [channel, setChannel] = useState('stable')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function refresh() {
    const payload = await api()
    setReleases(z.object({ releases: z.array(releaseSchema) }).parse(payload).releases)
  }

  useEffect(() => {
    void refresh().catch((error) =>
      setMessage(error instanceof Error ? error.message : 'Could not load versions.'),
    )
  }, [])

  return (
    <div className="space-y-6">
      <div role="status" className="rounded border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-400">
        Public product section: <span className={publicEnabled ? 'text-amber-300' : 'text-zinc-200'}>{publicEnabled ? 'on' : 'off'}</span>.
        {' '}Sales: <span className={salesEnabled ? 'text-amber-300' : 'text-zinc-200'}>{salesEnabled ? 'open' : 'closed'}</span>.
        {' '}Downloads work without sales or sign-in.
      </div>

      <form
        className="space-y-3 rounded border border-zinc-800 bg-zinc-950/60 p-4"
        onSubmit={(event) => {
          event.preventDefault()
          setBusy(true)
          setMessage('')
          void api({ action: 'create', version, channel })
            .then(async () => {
              setVersion('')
              await refresh()
              setMessage('Version created. Register its downloads next.')
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
          No versions yet. Create one to register a validated build.
        </p>
      ) : (
        <ul className="space-y-4">
          {releases.map((release) => (
            <ReleaseCard key={release.id} release={release} onChanged={refresh} />
          ))}
        </ul>
      )}
    </div>
  )
}
