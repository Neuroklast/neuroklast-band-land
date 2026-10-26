import type { ReleaseChannel } from './releases'

export interface ImportFile {
  filename: string
  size: number
  sha256: string
  packageType: 'installer' | 'bundle' | null
}
export interface ImportPlan {
  version: string
  channel: ReleaseChannel
  commit: string
  notes: string
  files: ImportFile[]
}
export interface ImportDependencies {
  load(version: string): Promise<ImportPlan>
  prepare(plan: ImportPlan): Promise<{ id: string; status: string }>
  store(file: ImportFile, plan: ImportPlan): Promise<void>
  register(id: string, plan: ImportPlan): Promise<void>
  verify(id: string, plan: ImportPlan): Promise<void>
  publish(id: string): Promise<void>
}

/** A partial transfer stays unpublished and is safe to retry. */
export async function importRelease(version: string, dependencies: ImportDependencies): Promise<{ id: string; version: string }> {
  const plan = await dependencies.load(version)
  if (plan.version !== version || plan.files.length !== 4) throw new Error('Incomplete official release')
  const release = await dependencies.prepare(plan)
  if (release.status === 'withdrawn') throw new Error('Release is withdrawn; restore it explicitly in Admin first')
  for (const file of plan.files) await dependencies.store(file, plan)
  if (release.status !== 'published') {
    await dependencies.register(release.id, plan)
    await dependencies.verify(release.id, plan)
    await dependencies.publish(release.id)
  } else await dependencies.verify(release.id, plan)
  return { id: release.id, version }
}
