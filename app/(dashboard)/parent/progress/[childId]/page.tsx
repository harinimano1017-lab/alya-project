import { TrendingUp } from 'lucide-react'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Progress — Alya' }

export default async function ChildProgressPage({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params
  const session = await auth()

  const child = await prisma.childProfile.findFirst({
    where: { id: childId, userId: session!.user.id },
    include: {
      progress: {
        include: { lesson: { select: { wordText: true, slug: true } } },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  if (!child) notFound()

  const completed  = child.progress.filter((p) => p.status === 'COMPLETED')
  const inProgress = child.progress.filter((p) => p.status === 'IN_PROGRESS')

  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ background: 'var(--alya-purple)' }}
        >
          {child.name[0].toUpperCase()}
        </div>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}
          >
            {child.name}&apos;s Progress
          </h1>
          <p className="text-sm text-gray-500">
            {completed.length} completed · {inProgress.length} in progress
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {child.progress.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[var(--alya-purple-light)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-[var(--alya-purple-dark)]">Completion</span>
            <span className="text-gray-500">
              {completed.length} / {child.progress.length} lessons
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[var(--alya-purple-light)]">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${(completed.length / child.progress.length) * 100}%`,
                background: 'var(--alya-purple)',
              }}
            />
          </div>
        </div>
      )}

      {/* Lesson list */}
      <div className="mt-6 space-y-2">
        {child.progress.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--alya-purple-light)] p-12 text-center">
            <TrendingUp className="mx-auto mb-3 h-10 w-10 text-[var(--alya-purple-light)]" />
            <p className="font-medium text-[var(--alya-purple-dark)]">No lessons started yet</p>
            <p className="mt-1 text-sm text-gray-500">Progress will appear here as {child.name} learns.</p>
          </div>
        ) : (
          child.progress.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-2xl border border-[var(--alya-purple-light)] bg-white px-5 py-4 shadow-sm"
            >
              <span className="font-medium text-[var(--alya-purple-dark)]">
                {p.lesson.wordText}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  p.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-600'
                    : p.status === 'IN_PROGRESS'
                    ? 'bg-[var(--alya-purple-light)] text-[var(--alya-purple)]'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {p.status === 'COMPLETED'
                  ? 'Done'
                  : p.status === 'IN_PROGRESS'
                  ? 'In progress'
                  : 'Not started'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
