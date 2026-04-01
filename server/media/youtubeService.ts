type MediaType = 'LIP_READING_VIDEO' | 'CONCEPT_IMAGE' | 'SIGN_LANGUAGE_VIDEO' | 'SIGN_LANGUAGE_IMAGE'
type LanguageCode = 'EN' | 'TA'
import { createMediaAsset, getMediaAssetByS3Key, linkMediaToLesson } from './mediaRepository'

export function buildYouTubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&rel=0&modestbranding=1&playlist=${videoId}`
}

export function extractYouTubeId(url: string): string | null {
  const pattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(pattern)
  return match ? match[1] : null
}

export async function saveYouTubeVideo(params: {
  videoId: string
  panelType: MediaType
  lessonId: string
  language?: LanguageCode
  altText?: string
  uploadedById?: string
}) {
  const { videoId, panelType, lessonId, language = 'EN', altText, uploadedById } = params

  const existing = await getMediaAssetByS3Key(videoId)
  const asset = existing ?? await createMediaAsset({
    s3Key: videoId,
    cdnUrl: buildYouTubeEmbedUrl(videoId),
    mediaType: panelType,
    mimeType: 'video/youtube',
    language,
    altText,
    uploadedById,
  })

  await linkMediaToLesson(lessonId, asset.id, panelType, language)

  return asset
}