import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.CF_R2_BUCKET_NAME!
const CDN    = process.env.CF_R2_PUBLIC_DOMAIN!

export function buildS3Key(
  subModuleSlug: string,
  lessonSlug: string,
  type: 'lip-reading' | 'sign-language' | 'concept-image',
  lang: string,
  ext: string,
  version = 'v1'
) {
  return `media/${subModuleSlug}/${lessonSlug}/${type}-${lang}-${version}.${ext}`
}

export function buildCdnUrl(s3Key: string) {
  return `${CDN}/${s3Key}`
}

export async function getPresignedUploadUrl(s3Key: string, mimeType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    ContentType: mimeType,
  })
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 })
  return { uploadUrl, s3Key, cdnUrl: buildCdnUrl(s3Key) }
}

export async function deleteS3Object(s3Key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: s3Key }))
}