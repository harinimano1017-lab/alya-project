import { prisma } from '@/lib/prisma'
type MediaType = 'LIP_READING_VIDEO' | 'CONCEPT_IMAGE' | 'SIGN_LANGUAGE_VIDEO' | 'SIGN_LANGUAGE_IMAGE'
type LanguageCode = 'EN' | 'TA'

export async function getMediaByLesson(lessonId: string, language: LanguageCode = 'EN') {
  return prisma.lessonMedia.findMany({
    where: { lessonId, language },
    include: { mediaAsset: true },
  })
}

export async function getMediaAssetById(id: string) {
  return prisma.mediaAsset.findUnique({
    where: { id },
  })
}

export async function createMediaAsset(data: {
  s3Key: string
  cdnUrl: string
  mediaType: MediaType
  mimeType: string
  language?: LanguageCode
  altText?: string
  fileSizeBytes?: bigint
  durationSeconds?: number
  widthPx?: number
  heightPx?: number
  uploadedById?: string
}) {
  return prisma.mediaAsset.create({ data })
}

export async function linkMediaToLesson(
  lessonId: string,
  mediaAssetId: string,
  panelType: MediaType,
  language: LanguageCode = 'EN'
) {
  return prisma.lessonMedia.upsert({
    where: {
      lessonId_panelType_language: { lessonId, panelType, language },
    },
    update: { mediaAssetId },
    create: { lessonId, mediaAssetId, panelType, language },
  })
}

export async function deleteMediaAsset(id: string) {
  await prisma.lessonMedia.deleteMany({ where: { mediaAssetId: id } })
  return prisma.mediaAsset.delete({ where: { id } })
}

export async function getMediaAssetByS3Key(s3Key: string) {
  return prisma.mediaAsset.findUnique({ where: { s3Key } })
}