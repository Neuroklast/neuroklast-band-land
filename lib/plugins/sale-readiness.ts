import { z } from 'zod'
import { safeReleaseStorageKey, sha256Schema } from './releases'

export const saleArtifactSchema = z.object({
  id: z.uuid(),
  validation_status: z.enum(['pending', 'validated', 'failed']),
  storage_key: z.string(),
  filesize_bytes: z.number().int().positive(),
  sha256: z.string(),
})

export const saleReleaseSchema = z.object({
  id: z.uuid(),
  status: z.enum(['draft', 'validated', 'published', 'withdrawn']),
  withdrawn_at: z.string().nullable(),
  plugin_release_artifacts: z.array(saleArtifactSchema),
})

export type SaleRelease = z.infer<typeof saleReleaseSchema>

/**
 * Release readiness is independent of public demo availability.
 * It must be impossible to create a paid checkout for an unshipped plugin.
 */
export function hasSellableRelease(releases: readonly SaleRelease[]): boolean {
  return releases.some(release =>
    release.status === 'published' &&
    release.withdrawn_at === null &&
    release.plugin_release_artifacts.some(artifact =>
      artifact.validation_status === 'validated' &&
      artifact.filesize_bytes > 0 &&
      sha256Schema.safeParse(artifact.sha256).success &&
      safeReleaseStorageKey(artifact.storage_key),
    ),
  )
}
