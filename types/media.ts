export type MediaType =
  | 'LIP_READING_VIDEO'
  | 'CONCEPT_IMAGE'
  | 'SIGN_LANGUAGE_VIDEO'

export type MediaAsset = {
  id: string
  s3Key: string
  cdnUrl: string
  mediaType: MediaType
  mimeType: string
  fileSizeBytes?: bigint | null
  durationSeconds?: number | null
  widthPx?: number | null
  heightPx?: number | null
  altText?: string | null
  language: string
  uploadedById?: string | null
  createdAt: Date
}

export type LessonMediaItem = {
  id: string
  lessonId: string
  mediaAssetId: string
  panelType: MediaType
  language: string
  mediaAsset: MediaAsset
}