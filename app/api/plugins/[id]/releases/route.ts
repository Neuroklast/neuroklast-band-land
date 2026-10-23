import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { adminFailureMessage } from '@/lib/neurokore/admin-error'
import { MEDIA_BUCKET } from '@/lib/constants'
import { headR2Object, r2StorageProvider } from '@/lib/storage/r2'
import { admin, body, db, json, limit, sameOrigin } from '@/lib/neurokore/server'
import {
  PLATFORMS,
  PACKAGE_TYPES,
  RELEASE_CHANNELS,
  SIGNING_STATUSES,
  releaseArtifactsReady,
  releaseStorageKey,
  sha256Schema,
  versionSchema,
  type ArtifactLike,
} from '@/lib/plugins/releases'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

const metadata = {
  title: z.string().trim().max(200).nullable().optional(),
  changelog: z.string().trim().max(20000).nullable().optional(),
  release_notes: z.string().trim().max(20000).nullable().optional(),
  git_commit_sha: z.string().regex(/^[a-f0-9]{7,64}$/).nullable().optional(),
}

const inputSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create'),
    version: versionSchema,
    channel: z.enum(RELEASE_CHANNELS).default('stable'),
    ...metadata,
  }).strict(),
  z.object({
    action: z.literal('update'),
    id: z.uuid(),
    version: versionSchema.optional(),
    ...metadata,
  }).strict(),
  z.object({
    action: z.literal('artifact'),
    release_id: z.uuid(),
    platform: z.enum(PLATFORMS),
    architecture: z.enum(['x64', 'arm64']),
    package_type: z.enum(PACKAGE_TYPES),
    filename: z.string().trim().min(1).max(200).regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/),
    filesize_bytes: z.number().int().positive(),
    sha256: sha256Schema,
    signing_status: z.enum(SIGNING_STATUSES),
  }).strict(),
  z.object({ action: z.literal('delete_artifact'), release_id: z.uuid(), artifact_id: z.uuid() }).strict(),
  z.object({ action: z.literal('validate'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('publish'), id: z.uuid() }).strict(),
  z.object({ action: z.literal('withdraw'), id: z.uuid() }).strict(),
])

const artifactColumns = 'id,platform,architecture,package_type,filename,storage_key,filesize_bytes,sha256,signing_status,validation_status'

function revalidateProduct(slug: string) {
  revalidatePath('/plugins')
  revalidatePath('/plugins/' + slug)
  revalidatePath('/plugins/' + slug + '/download')
  revalidatePath('/')
}

async function audit(
  client: ReturnType<typeof db>,
  actor: string,
  productId: string,
  action: string,
  target: string,
  detail: Record<string, unknown> = {},
) {
  try {
    await client.from('plugin_admin_audit').insert({ actor, product_id: productId, action, target, detail })
  } catch {
    // Audit is best-effort; the primary mutation already succeeded.
  }
}

async function loadProduct(client: ReturnType<typeof db>, id: string) {
  const { data, error } = await client.from('products').select('id,slug,title').eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function GET(request: Request, context: RouteContext) {
  try {
    await limit(request, 'plugin-releases-read', 60)
    await admin()
    const { id } = await context.params
    if (!z.uuid().safeParse(id).success) return json({ error: 'Plugin not found.' }, 404)
    const client = db()
    if (!(await loadProduct(client, id))) return json({ error: 'Plugin not found.' }, 404)
    const { data, error } = await client
      .from('plugin_releases')
      .select(`id,version,channel,status,title,changelog,release_notes,git_commit_sha,created_at,validated_at,published_at,withdrawn_at,plugin_release_artifacts(${artifactColumns})`)
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) throw error
    return json({ releases: data ?? [] })
  } catch (error) {
    return json({ error: adminFailureMessage(error) }, 400)
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    sameOrigin(request)
    await limit(request, 'plugin-releases-write', 30)
    const actor = await admin()
    const { id: productId } = await context.params
    if (!z.uuid().safeParse(productId).success) return json({ error: 'Plugin not found.' }, 404)
    const input = inputSchema.parse(await body(request))
    const client = db()
    const product = await loadProduct(client, productId)
    if (!product) return json({ error: 'Plugin not found.' }, 404)

    if (input.action === 'create') {
      const { data, error } = await client.from('plugin_releases').insert({
        product_id: productId,
        version: input.version,
        channel: input.channel,
        title: input.title ?? null,
        changelog: input.changelog ?? null,
        release_notes: input.release_notes ?? null,
        git_commit_sha: input.git_commit_sha ?? null,
      }).select('id').single()
      if (error) {
        if (error.code === '23505') return json({ error: 'That version already exists on this channel.' }, 409)
        throw error
      }
      await audit(client, actor, productId, 'release.create', data.id, { version: input.version, channel: input.channel })
      return json({ id: data.id })
    }

    if (input.action === 'update') {
      const { data: existing, error: findError } = await client.from('plugin_releases')
        .select('id,status').eq('id', input.id).eq('product_id', productId).maybeSingle()
      if (findError) throw findError
      if (!existing) return json({ error: 'Version not found.' }, 404)
      if (input.version !== undefined && existing.status === 'published') {
        return json({ error: 'Withdraw the version before changing its number.' }, 409)
      }
      const patch: Record<string, unknown> = {}
      if (input.version !== undefined) patch.version = input.version
      for (const key of ['title', 'changelog', 'release_notes', 'git_commit_sha'] as const) {
        if (input[key] !== undefined) patch[key] = input[key]
      }
      if (Object.keys(patch).length === 0) return json({ ok: true })
      const { error } = await client.from('plugin_releases').update(patch).eq('id', input.id)
      if (error) {
        if (error.code === '23505') return json({ error: 'That version already exists on this channel.' }, 409)
        throw error
      }
      await audit(client, actor, productId, 'release.update', input.id, { fields: Object.keys(patch) })
      return json({ ok: true })
    }

    if (input.action === 'artifact') {
      const { data: release, error: releaseError } = await client
        .from('plugin_releases')
        .select('version,status')
        .eq('id', input.release_id)
        .eq('product_id', productId)
        .maybeSingle()
      if (releaseError) throw releaseError
      if (!release) return json({ error: 'Version not found.' }, 404)
      if (release.status === 'published') {
        return json({ error: 'Withdraw the version before changing its downloads.' }, 409)
      }
      const storageKey = releaseStorageKey(product.slug, release.version, input.platform, input.filename)
      const object = await headR2Object(MEDIA_BUCKET, storageKey)
      if (!object) return json({ error: 'The file is not in storage yet. Upload it first.' }, 409)
      if (object.size !== input.filesize_bytes) {
        return json({ error: 'The uploaded file size does not match. Upload it again.' }, 409)
      }
      const { data: previous, error: previousError } = await client.from('plugin_release_artifacts')
        .select('storage_key')
        .eq('release_id', input.release_id)
        .eq('platform', input.platform)
        .eq('package_type', input.package_type)
        .maybeSingle()
      if (previousError) throw previousError
      const { error } = await client.from('plugin_release_artifacts').upsert({
        release_id: input.release_id,
        platform: input.platform,
        architecture: input.architecture,
        package_type: input.package_type,
        filename: input.filename,
        storage_key: storageKey,
        filesize_bytes: input.filesize_bytes,
        sha256: input.sha256,
        signing_status: input.signing_status,
        validation_status: 'pending',
      }, { onConflict: 'release_id,platform,package_type' })
      if (error) throw error
      if (release.status === 'validated' || release.status === 'withdrawn') {
        const { error: demoteError } = await client.from('plugin_releases')
          .update({ status: 'draft' })
          .eq('id', input.release_id)
          .in('status', ['validated', 'withdrawn'])
        if (demoteError) throw demoteError
      }
      if (previous?.storage_key && previous.storage_key !== storageKey) {
        try {
          await r2StorageProvider.deleteObject(MEDIA_BUCKET, previous.storage_key)
        } catch {
          // The new file is registered; an orphaned object must not block the admin.
        }
      }
      await audit(client, actor, productId, 'artifact.register', input.release_id, {
        platform: input.platform,
        package_type: input.package_type,
      })
      return json({ ok: true })
    }

    if (input.action === 'delete_artifact') {
      const { data: release, error: releaseError } = await client.from('plugin_releases')
        .select('status').eq('id', input.release_id).eq('product_id', productId).maybeSingle()
      if (releaseError) throw releaseError
      if (!release) return json({ error: 'Version not found.' }, 404)
      if (release.status === 'published') {
        return json({ error: 'Withdraw the version before deleting its downloads.' }, 409)
      }
      const { data: artifact, error: artifactError } = await client
        .from('plugin_release_artifacts')
        .select('id,storage_key')
        .eq('id', input.artifact_id)
        .eq('release_id', input.release_id)
        .maybeSingle()
      if (artifactError) throw artifactError
      if (!artifact) return json({ error: 'Download not found.' }, 404)
      const { error: deleteError } = await client.from('plugin_release_artifacts')
        .delete().eq('id', input.artifact_id)
      if (deleteError) throw deleteError
      try {
        await r2StorageProvider.deleteObject(MEDIA_BUCKET, artifact.storage_key)
      } catch {
        // The database row is gone; an orphaned object must not block the admin.
      }
      await audit(client, actor, productId, 'artifact.delete', input.release_id, { artifact: input.artifact_id })
      return json({ ok: true })
    }

    const { data: releaseOwner, error: ownerError } = await client.from('plugin_releases')
      .select('id').eq('id', input.id).eq('product_id', productId).maybeSingle()
    if (ownerError) throw ownerError
    if (!releaseOwner) return json({ error: 'Version not found.' }, 404)

    const { data: artifacts, error: artifactError } = await client
      .from('plugin_release_artifacts')
      .select(artifactColumns)
      .eq('release_id', input.id)
    if (artifactError) throw artifactError

    if (input.action === 'publish') {
      if (!releaseArtifactsReady((artifacts ?? []) as ArtifactLike[])) {
        return json({ error: 'Add and validate at least one download before publishing.' }, 409)
      }
      const { error } = await client.rpc('plugin_publish_release', { p_release: input.id, p_admin: actor })
      if (error) throw error
      await audit(client, actor, productId, 'release.publish', input.id)
      revalidateProduct(product.slug)
      return json({ ok: true })
    }

    if (input.action === 'withdraw') {
      const { error } = await client.rpc('plugin_withdraw_release', { p_release: input.id })
      if (error) throw error
      await audit(client, actor, productId, 'release.withdraw', input.id)
      revalidateProduct(product.slug)
      return json({ ok: true })
    }

    if ((artifacts ?? []).length === 0) {
      return json({ error: 'Add at least one download before validating.' }, 409)
    }
    if ((artifacts ?? []).some((artifact) => artifact.validation_status === 'failed')) {
      return json({ error: 'Fix or remove failed downloads before validating.' }, 409)
    }
    const { error: artifactUpdateError } = await client.from('plugin_release_artifacts')
      .update({ validation_status: 'validated' })
      .eq('release_id', input.id)
      .eq('validation_status', 'pending')
    if (artifactUpdateError) throw artifactUpdateError
    const { error: releaseError } = await client.from('plugin_releases')
      .update({ status: 'validated', validated_at: new Date().toISOString() })
      .eq('id', input.id)
      .in('status', ['draft', 'validated', 'withdrawn'])
    if (releaseError) throw releaseError
    await audit(client, actor, productId, 'release.validate', input.id)
    return json({ ok: true })
  } catch (error) {
    return json({ error: adminFailureMessage(error) }, 400)
  }
}



