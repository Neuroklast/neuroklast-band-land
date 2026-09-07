import { S3Client } from '@aws-sdk/client-s3'

const DEFAULT_JURISDICTION = 'eu'

export function r2S3Endpoint(
  accountId: string,
  jurisdiction: string | undefined = process.env.R2_JURISDICTION,
): string {
  const raw = (jurisdiction ?? DEFAULT_JURISDICTION).trim().toLowerCase()
  if (!raw || raw === 'default' || raw === 'global') {
    return `https://${accountId}.r2.cloudflarestorage.com`
  }
  if (!/^[a-z0-9]+$/.test(raw)) {
    throw new Error('Invalid R2_JURISDICTION')
  }
  return `https://${accountId}.${raw}.r2.cloudflarestorage.com`
}

export function createR2S3Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Missing R2 credentials: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY must be set',
    )
  }

  return new S3Client({
    region: 'auto',
    endpoint: r2S3Endpoint(accountId),
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
  })
}
