'use server'

import { randomUUID } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireAdmin } from '@/app/admin/_actions/auth'
import { createR2S3Client } from '@/lib/r2-s3-client'
import { MEDIA_BUCKET } from '@/lib/constants'
import { headR2Object } from '@/lib/storage/r2'

const MAX_ARCHIVE_SIZE = 1024 * 1024 * 1024 // 1 GiB, single PUT. Larger packs need multipart.

function privateBucket(): string {
  const bucket = process.env.R2_BUCKET_DIGITAL_PRODUCTS
  if (!bucket) throw new Error('Set R2_BUCKET_DIGITAL_PRODUCTS to a PRIVATE R2 bucket before uploading.')
  if (bucket === MEDIA_BUCKET)
    throw new Error('Digital product bucket must differ from the public media bucket.')
  return bucket
}

/** Never return the public media URL for a paid ZIP. */
export async function signDigitalPackUpload(filename: string, bytes: number) {
  await requireAdmin()
  if (!/^.{1,180}\.zip$/i.test(filename) || /[/\\]/.test(filename))
    throw new Error('Upload a ZIP archive with a safe filename.')
  if (!Number.isSafeInteger(bytes) || bytes <= 0 || bytes > MAX_ARCHIVE_SIZE)
    throw new Error('Archive size must be between 1 byte and 1 GiB.')
  const key = 'digital-packs/' + randomUUID() + '.zip'
  const url = await getSignedUrl(createR2S3Client(),
    new PutObjectCommand({
      Bucket: privateBucket(), Key: key, ContentType: 'application/zip', ContentLength: bytes,
    }), { expiresIn: 900 })
  return { key, uploadUrl: url }
}

export async function verifyDigitalPackArchive(key: string, expectedBytes: number) {
  await requireAdmin()
  if (!/^digital-packs\/[a-f0-9-]{36}\.zip$/.test(key) ||
    !Number.isSafeInteger(expectedBytes) || expectedBytes <= 0 || expectedBytes > MAX_ARCHIVE_SIZE)
    throw new Error('Invalid digital archive reference.')
  const found = await headR2Object(privateBucket(), key)
  if (!found || found.size !== expectedBytes) throw new Error('Private archive not found or upload incomplete.')
  return { valid: true }
}
