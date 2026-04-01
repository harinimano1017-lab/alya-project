'use client'
import { useEffect, useState } from 'react'
import {
  fetchLesson,
  getMediaUrl,
  LessonResponse,
} from '@/client/media/mediaClient'

export function useLessonMedia(slug: string) {
  const [lesson, setLesson] = useState<LessonResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetchLesson(slug)
      .then(setLesson)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  const lipReadingUrl = lesson
    ? getMediaUrl(lesson.media, 'LIP_READING_VIDEO')
    : null

  const conceptImageUrl = lesson
    ? getMediaUrl(lesson.media, 'CONCEPT_IMAGE')
    : null

  const signLangUrl = lesson
    ? getMediaUrl(lesson.media, 'SIGN_LANGUAGE_VIDEO') || getMediaUrl(lesson.media, 'SIGN_LANGUAGE_IMAGE')
    : null

  return {
    lesson,
    loading,
    error,
    lipReadingUrl,
    conceptImageUrl,
    signLangUrl,
  }
}