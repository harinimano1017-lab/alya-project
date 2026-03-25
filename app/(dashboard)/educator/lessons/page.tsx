import { BookOpen } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Lessons — Alya Educator' }

export default async function EducatorLessonsPage() {
  const lessons = await prisma.lesson.findMany({
    orderBy: [{ subModule: { module: { orderIndex: 'asc' } } }, { orderIndex: 'asc' }],
    include: {
      subModule: { include: { module: { select: { title: true } } } },
      _count: { select: { media: true } },
    },
  })

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[var(--alya-purple-light)] p-2.5 text-[var(--alya-purple)]">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}
          >
            Lessons
          </h1>
          <p className="text-sm text-gray-500">{lessons.length} lessons total</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--alya-purple-light)] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--alya-purple-light)] bg-[var(--alya-purple-pale)]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Word</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Module</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Media</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--alya-purple-light)]">
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                  No lessons yet
                </td>
              </tr>
            ) : (
              lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-[var(--alya-purple-pale)]">
                  <td className="px-6 py-4 font-medium text-[var(--alya-purple-dark)]">
                    {lesson.wordText}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {lesson.subModule.module.title} / {lesson.subModule.title}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{lesson._count.media} files</td>
                  <td className="px-6 py-4">
                    {lesson.isPublished ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                        Draft
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
