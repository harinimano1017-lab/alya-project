import { LessonMediaItem } from "./media"

export type Module = {
  id: string
  slug: string
  title: string
  description: string | null
  iconUrl: string | null
  orderIndex: number
  isPublished: boolean
  createdAt: Date
  subModules?: SubModule[]
}

export type SubModule = {
  id: string
  slug: string
  title: string
  description: string | null
  iconUrl: string | null
  orderIndex: number
  isPublished: boolean
  moduleId: string
  lessons?: Lesson[]
}

export type Lesson = {
  id: string
  slug: string
  wordText: string
  orderIndex: number
  isPublished: boolean
  subModuleId: string
  media?: LessonMediaItem[]
  translations?: LessonTranslation[]
}

export type LessonTranslation = {
  id: string
  lessonId: string
  language: LanguageCode
  wordText: string
}

export type LanguageCode = 'EN' | 'TA'