export type LessonStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

export type LessonProgress = {
  id: string
  childProfileId: string
  lessonId: string
  status: LessonStatus
  completedAt: Date | null
  totalViewTimeSec: number
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

export type PanelTimeLog = {
  id: string
  childProfileId: string
  lessonId: string
  panelType: string
  durationSeconds: number
  sessionDate: Date
}

export type QuizAttempt = {
  id: string
  childProfileId: string
  lessonId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  attemptedAt: Date
}