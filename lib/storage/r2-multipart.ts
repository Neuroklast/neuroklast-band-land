import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createR2S3Client } from '@/lib/r2-s3-client'

export interface CompletedPart {
  PartNumber: number
  ETag: string
}

function getR2Client() {
  return createR2S3Client()
}

export async function createMultipartUpload(
  bucket: string,
  key: string,
  contentType: string,
): Promise<{ uploadId: string }> {
  const client = getR2Client()
  const command = new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType })
  const response = await client.send(command)
  if (!response.UploadId) throw new Error('Failed to create multipart upload: no UploadId returned')
  return { uploadId: response.UploadId }
}

export async function signMultipartPart(
  bucket: string,
  key: string,
  uploadId: string,
  partNumber: number,
): Promise<{ signedUrl: string }> {
  const client = getR2Client()
  const command = new UploadPartCommand({ Bucket: bucket, Key: key, UploadId: uploadId, PartNumber: partNumber })
  const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 })
  return { signedUrl }
}

export async function completeMultipartUpload(
  bucket: string,
  key: string,
  uploadId: string,
  parts: CompletedPart[],
): Promise<void> {
  const client = getR2Client()
  const command = new CompleteMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts.map((p) => ({ PartNumber: p.PartNumber, ETag: p.ETag })) },
  })
  await client.send(command)
}

export async function abortMultipartUpload(
  bucket: string,
  key: string,
  uploadId: string,
): Promise<void> {
  const client = getR2Client()
  const command = new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId })
  await client.send(command)
}
