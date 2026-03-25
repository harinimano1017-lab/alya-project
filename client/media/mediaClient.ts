import type { MediaType } from '@/types/media'
import type { LanguageCode } from '@/types/curriculum'

export type LessonMediaItem = {
  panelType: MediaType
  language: string
  mediaAsset: {
    id: string
    cdnUrl: string
    mimeType: string
    altText: string | null
    durationSeconds: number | null
    widthPx: number | null
    heightPx: number | null
  }
}

export type LessonResponse = {
  id: string
  slug: string
  wordText: string
  media: LessonMediaItem[]
  subModule: {
    id: string
    slug: string
    title: string
    module: { title: string }
  }
}

export async function fetchLesson(slug: string): Promise<LessonResponse> {
  const res = await fetch(`/api/lessons/${slug}`)
  if (!res.ok) throw new Error('Failed to fetch lesson')
  const json = await res.json()
  return json.data
}

export async function fetchModules() {
  const res = await fetch('/api/modules')
  if (!res.ok) throw new Error('Failed to fetch modules')
  const json = await res.json()
  return json.data
}

export function getMediaUrl(
  media: LessonMediaItem[],
  panelType: MediaType,
  lang = 'EN'
): string | null {
  return (
    media.find(
      (m) => m.panelType === panelType && m.language === lang
    )?.mediaAsset.cdnUrl ?? null
  )
}

export function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com/embed')
}

export async function saveYouTubeVideo(params: {
  url: string
  panelType: MediaType
  lessonId: string
  language?: LanguageCode
  altText?: string
}) {
  const res = await fetch('/api/media/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return res.json()
}

export async function uploadFileToR2(params: {
  file: File
  subModuleSlug: string
  lessonSlug: string
  type: 'lip-reading' | 'sign-language' | 'concept-image'
  lang?: string
}) {
  const ext = params.file.name.split('.').pop() ?? 'mp4'

  const urlRes = await fetch('/api/media/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subModuleSlug: params.subModuleSlug,
      lessonSlug: params.lessonSlug,
      type: params.type,
      lang: params.lang ?? 'en',
      ext,
      mimeType: params.file.type,
    }),
  })

  const { uploadUrl, s3Key, cdnUrl } = await urlRes.json()

  await fetch(uploadUrl, {
    method: 'PUT',
    body: params.file,
    headers: { 'Content-Type': params.file.type },
  })

  return { s3Key, cdnUrl }
}