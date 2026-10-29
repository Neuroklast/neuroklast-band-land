import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'
import { mkdtemp, open, readFile, rm } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { z } from 'zod'
import { db } from '@/lib/neurokore/server'
import { MEDIA_BUCKET } from '@/lib/constants'
import { createR2S3Client } from '@/lib/r2-s3-client'
import { assertSafeRemoteUrl } from '@/lib/ssrf-guard'
import { parseNeurokoreGitHubReleases } from './github-releases'
import { releaseStorageKey } from './releases'
import { importRelease, type ImportFile, type ImportPlan } from './release-import'

const source = 'https://api.github.com/repos/Neuroklast/NeuroKore-Releases'
export const importVersionSchema = z.string().max(64).regex(/^\d+\.\d+\.\d+(?:-(?:alpha|beta|rc)(?:[.-]\d+)?)?$/)
const recordSchema = z.object({ id: z.uuid(), status: z.enum(['draft', 'validated', 'published', 'withdrawn']), git_commit_sha: z.string().nullable() })

export function releaseImportAuthorized(request: Request): boolean {
  const token = process.env.NEUROKORE_RELEASE_SYNC_TOKEN
  if (!token || !/^[a-f0-9]{64}$/i.test(token)) return false
  const actual = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${token}`)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

async function githubJson(path: string): Promise<unknown> {
  const response = await fetch(source + path, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'neuroklast-release-sync' } })
  if (!response.ok) throw new Error('Official GitHub release is unavailable')
  return response.json()
}

export async function officialImportPlan(version: string): Promise<ImportPlan> {
  importVersionSchema.parse(version)
  const payload = await githubJson(`/releases/tags/v${version}`)
  const release = parseNeurokoreGitHubReleases([payload])[0]
  if (!release || release.version !== version || release.artifacts.length !== 2) throw new Error('Publish a complete official GitHub release first')
  const raw = z.object({ body: z.string(), assets: z.array(z.object({ name: z.string(), size: z.number(), digest: z.string() })) }).parse(payload)
  // The public release tag points to a harmless binary-repository commit.
  // The private source SHA is embedded by the publisher in release notes.
  const markers = [...raw.body.matchAll(/<!-- neurokore-source-commit:([0-9a-f]{40}) -->/g)]
  if (markers.length !== 1) throw new Error('Missing or ambiguous private source commit provenance')
  const commit = markers[0][1]
  return { version, channel: release.channel, commit, notes: release.release_notes ?? '',
    files: release.artifacts.flatMap(artifact => [artifact.filename, artifact.filename + '.sha256'].map(filename => {
      const asset = raw.assets.find(item => item.name === filename)!
      if (filename.endsWith('.sha256') && asset.size > 4096) throw new Error('Invalid checksum file')
      return { filename, size: asset.size, sha256: asset.digest.slice(7).toLowerCase(),
        packageType: filename === artifact.filename ? artifact.package_type as 'installer' | 'bundle' : null }
    })) }
}

async function assetResponse(plan: ImportPlan, file: ImportFile): Promise<Response> {
  let url = `https://github.com/Neuroklast/NeuroKore-Releases/releases/download/v${plan.version}/${file.filename}`
  for (let attempt = 0; attempt < 4; attempt++) {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || !['github.com', 'release-assets.githubusercontent.com', 'objects.githubusercontent.com'].includes(parsed.hostname)) throw new Error('Unexpected GitHub asset redirect')
    await assertSafeRemoteUrl(url)
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(90000), headers: { 'User-Agent': 'neuroklast-release-sync' } })
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location'); await response.body?.cancel()
      if (!location) throw new Error('Missing GitHub asset redirect')
      url = new URL(location, url).href; continue
    }
    if (!response.ok || !response.body) throw new Error('GitHub asset download failed')
    return response
  }
  throw new Error('Too many GitHub asset redirects')
}

async function verifyStored(client: ReturnType<typeof createR2S3Client>, key: string, file: ImportFile) {
  const object = await client.send(new GetObjectCommand({ Bucket: MEDIA_BUCKET, Key: key }), { abortSignal: AbortSignal.timeout(90000) })
  if (!object.Body || object.ContentLength !== file.size) throw new Error('R2 file size differs')
  const hash = createHash('sha256'); let bytes = 0
  const reader = object.Body.transformToWebStream().getReader()
  try {
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break
      bytes += chunk.value.length
      if (bytes > file.size) throw new Error('R2 file exceeds the expected size')
      hash.update(chunk.value)
    }
  } finally { await reader.cancel() }
  if (bytes !== file.size || hash.digest('hex') !== file.sha256) throw new Error('R2 checksum differs')
}

export async function storeOfficialAsset(file: ImportFile, plan: ImportPlan): Promise<void> {
  const client = createR2S3Client()
  const key = releaseStorageKey('neurokore', plan.version, 'windows-x64', file.filename)
  try {
    await client.send(new HeadObjectCommand({ Bucket: MEDIA_BUCKET, Key: key }))
    await verifyStored(client, key, file); return
  } catch (error) {
    if (!(error instanceof Error) || !['NotFound', 'NoSuchKey'].includes(error.name)) throw error
  }
  const folder = await mkdtemp(join(tmpdir(), 'neurokore-release-'))
  const local = join(folder, 'asset')
  try {
    const response = await assetResponse(plan, file)
    const reader = response.body!.getReader(); const output = await open(local, 'wx')
    const hash = createHash('sha256'), md5 = createHash('md5'); let bytes = 0
    try {
      while (true) {
        const chunk = await reader.read(); if (chunk.done) break
        bytes += chunk.value.length
        if (bytes > file.size || bytes > 524288000) throw new Error('GitHub asset exceeds its declared size')
        hash.update(chunk.value); md5.update(chunk.value); await output.writeFile(chunk.value)
      }
    } finally { await reader.cancel(); await output.close() }
    if (bytes !== file.size || hash.digest('hex') !== file.sha256) throw new Error('GitHub asset checksum differs')
    if (file.filename.endsWith('.sha256')) {
      const expected = plan.files.find(item => item.filename + '.sha256' === file.filename)
      const checksum = /^(\w{64})\s+\*?([^\r\n]+)$/.exec((await readFile(local, 'utf8')).trim())
      if (!expected || !checksum || checksum[1].toLowerCase() !== expected.sha256 || checksum[2] !== expected.filename) throw new Error('Checksum sidecar does not identify its release file')
    }
    try {
      await client.send(new PutObjectCommand({ Bucket: MEDIA_BUCKET, Key: key, Body: createReadStream(local), ContentLength: bytes,
        ContentMD5: md5.digest('base64'), IfNoneMatch: '*', Metadata: { sha256: file.sha256 },
        ContentType: file.filename.endsWith('.sha256') ? 'text/plain' : file.filename.endsWith('.zip') ? 'application/zip' : 'application/octet-stream' }), { abortSignal: AbortSignal.timeout(90000) })
    } catch (error) { if (!(error instanceof Error) || error.name !== 'PreconditionFailed') throw error }
    await verifyStored(client, key, file)
  } finally { await rm(folder, { recursive: true, force: true }) }
}

async function product(client: ReturnType<typeof db>): Promise<string> {
  const result = await client.from('products').select('id,demo_downloads_enabled').eq('slug', 'neurokore').eq('kind', 'plugin').eq('active', true).maybeSingle()
  if (result.error) throw result.error
  const row = z.object({ id: z.uuid(), demo_downloads_enabled: z.literal(true) }).safeParse(result.data)
  if (!row.success) throw new Error('NEUROKORE downloads are disabled')
  return row.data.id
}

export async function importedReleaseStatus(version: string) {
  importVersionSchema.parse(version)
  const client = db(), productId = await product(client)
  const channel = version.includes('-alpha') ? 'alpha' : version.includes('-') ? 'beta' : 'stable'
  const result = await client.from('plugin_releases').select('status,plugin_release_artifacts(platform,package_type,validation_status)')
    .eq('product_id', productId).eq('version', version).eq('channel', channel).maybeSingle()
  if (result.error) throw result.error
  const artifacts = z.array(z.object({ platform: z.string(), package_type: z.string(), validation_status: z.string() })).parse(result.data?.plugin_release_artifacts ?? [])
  const ready = result.data?.status === 'published' && ['installer', 'bundle'].every(type => artifacts.some(a => a.platform === 'windows-x64' && a.package_type === type && a.validation_status === 'validated'))
  return { version, ready, status: result.data?.status ?? 'missing' }
}

export async function importOfficialRelease(version: string) {
  const client = db(), productId = await product(client)
  return importRelease(version, {
    load: officialImportPlan,
    prepare: async plan => {
      const inserted = await client.from('plugin_releases').upsert({ product_id: productId, version: plan.version, channel: plan.channel,
        title: `NEUROKORE ${plan.version}`, release_notes: plan.notes, git_commit_sha: plan.commit }, { onConflict: 'product_id,version,channel', ignoreDuplicates: true })
      if (inserted.error) throw inserted.error
      const result = await client.from('plugin_releases').select('id,status,git_commit_sha').eq('product_id', productId).eq('version', plan.version).eq('channel', plan.channel).single()
      if (result.error) throw result.error
      const record = recordSchema.parse(result.data)
      if (record.git_commit_sha !== plan.commit) throw new Error('This website version belongs to another source commit')
      return record
    },
    store: storeOfficialAsset,
    register: async (id, plan) => {
      for (const file of plan.files.filter(file => file.packageType)) {
        const key = releaseStorageKey('neurokore', plan.version, 'windows-x64', file.filename)
        const result = await client.from('plugin_release_artifacts').upsert({ release_id: id, platform: 'windows-x64', architecture: 'x64',
          package_type: file.packageType, filename: file.filename, storage_key: key, filesize_bytes: file.size, sha256: file.sha256,
          signing_status: 'unsigned', validation_status: 'validated' }, { onConflict: 'release_id,platform,package_type', ignoreDuplicates: true })
        if (result.error) throw result.error
      }
    },
    verify: async (id, plan) => {
      for (const file of plan.files.filter(file => file.packageType)) {
        const key = releaseStorageKey('neurokore', plan.version, 'windows-x64', file.filename)
        const registered = await client.from('plugin_release_artifacts').select('sha256,filesize_bytes,storage_key,validation_status')
          .eq('release_id', id).eq('platform', 'windows-x64').eq('package_type', file.packageType).single()
        if (registered.error) throw registered.error
        const row = registered.data
        if (row.sha256 !== file.sha256 || row.filesize_bytes !== file.size || row.storage_key !== key || row.validation_status !== 'validated') throw new Error('Existing website download differs; no files were replaced')
      }
    },
    publish: async id => {
      const result = await client.rpc('plugin_publish_release', { p_release: id, p_admin: null })
      if (result.error) {
        // A simultaneous retry may already have published the same immutable files.
        if (!(await importedReleaseStatus(version)).ready) throw result.error
      }
      await client.from('plugin_admin_audit').insert({ actor: null, product_id: productId, action: 'release.import', target: id, detail: { source: 'Neuroklast/NeuroKore-Releases', sourceRepository: 'Neuroklast/NeuroCore', trigger: 'release-manager' } })
    },
  })
}
