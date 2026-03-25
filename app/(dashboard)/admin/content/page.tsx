import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Content — Alya Admin' }

export default async function AdminContentPage() {
  const modules = await prisma.module.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      subModules: {
        include: { _count: { select: { lessons: true } } },
      },
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
            Content
          </h1>
          <p className="text-sm text-gray-500">{modules.length} modules</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {modules.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--alya-purple-light)] p-12 text-center">
            <p className="font-medium text-[var(--alya-purple-dark)]">No modules yet</p>
            <p className="mt-1 text-sm text-gray-500">Modules will appear here once created.</p>
          </div>
        ) : (
          modules.map((mod) => {
            const totalLessons = mod.subModules.reduce((sum, sm) => sum + sm._count.lessons, 0)
            return (
              <div
                key={mod.id}
                className="rounded-2xl border border-[var(--alya-purple-light)] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-[var(--alya-purple-dark)]">{mod.title}</h2>
                      {mod.isPublished ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                          Published
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {mod.subModules.length} sub-modules · {totalLessons} lessons
                    </p>
                  </div>
                  <Link
                    href="/library"
                    className="text-sm font-medium text-[var(--alya-purple)] hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
