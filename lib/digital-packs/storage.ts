import 'server-only'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createR2S3Client } from '@/lib/r2-s3-client'

export function digitalPackBucket(env: Record<string,string|undefined> = process.env): string {
  const bucket = env.R2_BUCKET_DIGITAL_PRODUCTS
  if (!bucket || bucket === env.R2_BUCKET_MEDIA)
    throw new Error('A separate non-public R2_BUCKET_DIGITAL_PRODUCTS is required.')
  return bucket
}
export function validDigitalArchiveKey(key: string): boolean {
  return /^digital-packs\/[a-f0-9-]{36}\.zip$/.test(key)
}
export function safeArchiveFilename(filename: string): string {
  const name = filename.replace(/[^a-z0-9._ -]/gi,'_').replace(/^\.+/,'').slice(0,180)
  return /^[a-z0-9_ -].*\.zip$/i.test(name) ? name : 'NEUROKLAST-Pack.zip'
}

/** A 60-second single-object URL, never a public bucket address. */
export async function signedPackDownload(key: string, filename: string): Promise<string> {
  if (!validDigitalArchiveKey(key)) throw new Error('Invalid private archive.')
  const command = new GetObjectCommand({
    Bucket: digitalPackBucket(), Key: key,
    ResponseContentDisposition: 'attachment; filename="' + safeArchiveFilename(filename) + '"',
    ResponseContentType: 'application/zip',
  })
  return getSignedUrl(createR2S3Client(), command, { expiresIn: 60 })
}
