import 'server-only'
import { createHash } from 'node:crypto'
import { GetObjectCommand, HeadBucketCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createR2S3Client } from '@/lib/r2-s3-client'

/** Dedicated append-only billing archive. Never use public media storage here.
 * R2 evaluates If-None-Match atomically, so two concurrent issues cannot overwrite.
 * Retries may only reuse an existing object whose bytes match exactly.
 */
const SHA256 = /^[a-f0-9]{64}$/
export type BillingFormat = 'pdf' | 'fodt' | 'odt'
export type BillingArtifact = { format: BillingFormat; key: string; sha256: string; size: number }
export type BillingPayload = { format: BillingFormat; key: string; bytes: Buffer }

export function billingArchiveBucket(env: NodeJS.ProcessEnv = process.env): string {
  const value = env.R2_BUCKET_BILLING
  if (!value || !/^[a-zA-Z0-9-]{3,64}$/.test(value)) {
    throw new Error('Dedicated private R2_BUCKET_BILLING is not configured')
  }
  if (value === env.R2_BUCKET_MEDIA) throw new Error('The private billing bucket must not be the media bucket')
  return value
}

/** Verify the bucket and S3 credentials before reserving a legal invoice number. */
export async function assertBillingArchiveReady(bucket:string):Promise<void> {
  try {
    await createR2S3Client().send(new HeadBucketCommand({Bucket:bucket}))
  } catch {
    throw new Error('Billing archive bucket is unavailable; no new invoice number was reserved')
  }
}

export function archiveKey(invoiceId: string, number: string, format: BillingFormat): string {
  if (!/^[a-f0-9-]{36}$/i.test(invoiceId)) throw new Error('Invalid invoice archive id')
  if (!/^[A-Z]{2,8}-\d{4}-\d{6}$/.test(number)) throw new Error('Invalid invoice number')
  return 'billing/' + invoiceId + '/' + number + '.' + format
}

export function documentSha(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function mediaType(format: BillingFormat): string {
  if (format === 'pdf') return 'application/pdf'
  if (format === 'odt') return 'application/vnd.oasis.opendocument.text'
  return 'application/vnd.oasis.opendocument.text-flat-xml'
}

function isPreconditionFailure(error: unknown): boolean {
  const e = error as { name?: unknown; $metadata?: { httpStatusCode?: number } } | null
  // R2 Bucket Lock may return 409 ObjectLockedByBucketPolicy instead of 412
  // for an existing key. Verify the actual stored bytes before accepting reuse.
  return e?.name === 'PreconditionFailed' || e?.$metadata?.httpStatusCode === 412 ||
    (e?.$metadata?.httpStatusCode === 409 && e?.name === 'ObjectLockedByBucketPolicy')
}

async function getExactObject(bucket: string, key: string, maxSize: number): Promise<Buffer> {
  const r = await createR2S3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  if (r.ContentLength !== undefined && r.ContentLength > maxSize) {
    throw new Error('Unexpectedly large archived document')
  }
  if (!r.Body) throw new Error('Archived document is empty')
  const bytes = Buffer.from(await r.Body.transformToByteArray())
  if (bytes.length > maxSize) throw new Error('Archived document exceeds size limit')
  return bytes
}

/** Upload once, or verify a previous identical write on retry.
 * The GET/hash check is intentional: metadata/ETag alone do not establish integrity.
 */
export async function archiveBillingDocument(
  bucket: string,
  payload: BillingPayload,
): Promise<BillingArtifact> {
  const sha256 = documentSha(payload.bytes)
  const size = payload.bytes.byteLength
  if (size === 0 || size > 8 * 1024 * 1024) throw new Error('Invoice artifact exceeds 8 MB limit')
  const client = createR2S3Client()
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: payload.key,
      Body: payload.bytes,
      ContentLength: size,
      ContentType: mediaType(payload.format),
      IfNoneMatch: '*',
      Metadata: { sha256 },
    }))
  } catch (error) {
    if (!isPreconditionFailure(error)) throw error
    // A previous request committed this key; never replace it. Verify the bytes.
  }
  const metadata = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: payload.key }))
  if (metadata.ContentLength !== size || metadata.ContentType !== mediaType(payload.format) ||
      metadata.Metadata?.sha256 !== sha256) {
    throw new Error('Archive object differs from the expected signed invoice snapshot')
  }
  const stored = await getExactObject(bucket, payload.key, size + 1)
  if (stored.length !== size || documentSha(stored) !== sha256) {
    throw new Error('Archive object SHA-256 verification failed')
  }
  return { format: payload.format, key: payload.key, sha256, size }
}

export async function archivedBillingDocumentUrl(
  bucket: string,
  key: string,
  expectedSha256: string,
): Promise<string> {
  if (!SHA256.test(expectedSha256)) throw new Error('Missing verified archive checksum')
  const bytes = await getExactObject(bucket, key, 8 * 1024 * 1024)
  if (documentSha(bytes) !== expectedSha256) throw new Error('Invoice archive failed integrity check')
  const client = createR2S3Client()
  return getSignedUrl(client, new GetObjectCommand({
    Bucket: bucket, Key: key, ResponseCacheControl: 'private, no-store',
  }), { expiresIn: 90 })
}
