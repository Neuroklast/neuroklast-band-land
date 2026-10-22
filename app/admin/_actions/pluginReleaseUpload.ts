'use server'

import { requireAdmin } from '@/app/admin/_actions/auth'
import { createAdminClient } from '@/lib/supabaseAdmin'
import {
  MAX_RELEASE_UPLOAD_BYTES,
  PLATFORMS,
  releaseStorageKey,
  type Platform,
} from '@/lib/plugins/releases'

interface PrepareInput {
  productId: string
  releaseId: string
  platform: Platform
  filename: string
  filesizeBytes: number
}

export type PrepareReleaseUploadResult = { storageKey: string } | { error: string }

/**
 * Returns the canonical R2 key for a release upload after checking that the
 * release belongs to the product and is still editable. The client uploads to
 * exactly this key; the registration step re-derives and verifies it.
 */
export async function prepareReleaseUpload(input: PrepareInput): Promise<PrepareReleaseUploadResult> {
  try {
    await requireAdmin()
    if (!PLATFORMS.includes(input.platform)) return { error: 'Unknown platform' }
    if (!Number.isInteger(input.filesizeBytes) || input.filesizeBytes <= 0) {
      return { error: 'The file is empty' }
    }
    if (input.filesizeBytes > MAX_RELEASE_UPLOAD_BYTES) return { error: 'File too large (max 2 GB)' }

    const admin = createAdminClient()
    const { data: release, error: releaseError } = await admin
      .from('plugin_releases')
      .select('version,status,product_id')
      .eq('id', input.releaseId)
      .maybeSingle()
    if (releaseError) throw releaseError
    if (!release || release.product_id !== input.productId) return { error: 'Version not found' }
    if (release.status === 'published') return { error: 'Withdraw the version before uploading' }

    const { data: product, error: productError } = await admin
      .from('products')
      .select('slug')
      .eq('id', input.productId)
      .maybeSingle()
    if (productError) throw productError
    if (!product?.slug) return { error: 'Set a URL slug before uploading' }

    return {
      storageKey: releaseStorageKey(product.slug, release.version, input.platform, input.filename),
    }
  } catch {
    return { error: 'Upload could not be prepared. Check your admin session and the plugin data.' }
  }
}
