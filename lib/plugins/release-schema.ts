import { z } from 'zod'

/** Shape returned by `/api/plugins/<id>/releases`. Keep the relation name in
 * sync with the server select; a mismatch silently hides registered builds. */
export const artifactSchema = z.object({
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

export const releaseSchema = z.object({
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
  plugin_release_artifacts: z.array(artifactSchema).default([]),
})

export const releasesResponseSchema = z.object({ releases: z.array(releaseSchema) })

export type ReleaseArtifact = z.infer<typeof artifactSchema>
export type Release = z.infer<typeof releaseSchema>
