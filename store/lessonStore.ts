import { create } from 'zustand'

type LessonStore = {
  currentSlug: string | null
  currentWord: string | null
  lessonSlugs: string[]
  currentIndex: number
  setLesson: (slug: string, word: string) => void
  setLessonList: (slugs: string[]) => void
  nextLesson: () => string | null
  prevLesson: () => string | null
}

export const useLessonStore = create<LessonStore>((set, get) => ({
  currentSlug: null,
  currentWord: null,
  lessonSlugs: [],
  currentIndex: 0,

  setLesson: (slug, word) =>
    set((state) => ({
      currentSlug: slug,
      currentWord: word,
      currentIndex: state.lessonSlugs.indexOf(slug),
    })),

  setLessonList: (slugs) => set({ lessonSlugs: slugs }),

  nextLesson: () => {
    const { lessonSlugs, currentIndex } = get()
    const next = currentIndex + 1
    return next < lessonSlugs.length ? lessonSlugs[next] : null
  },

  prevLesson: () => {
    const { lessonSlugs, currentIndex } = get()
    const prev = currentIndex - 1
    return prev >= 0 ? lessonSlugs[prev] : null
  },
}))