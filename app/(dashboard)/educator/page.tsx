import { BookOpen, CheckCircle2, Layers, FileEdit } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StatsCard } from '@/components/dashboard/StatsCard'

export const metadata = { title: 'Educator Dashboard — Alya' }

export default async function EducatorPage() {
  const session = await auth()
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'

  const [totalLessons, publishedLessons, draftLessons, totalModules] = await Promise.all([
    prisma.lesson.count(),
    prisma.lesson.count({ where: { isPublished: true } }),
    prisma.lesson.count({ where: { isPublished: false } }),
    prisma.module.count(),
  ])

  return (
    <div>
      <h1
        className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}
      >
        Welcome back, {firstName}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your lessons and track student progress.
      </p>

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total Lessons"
          value={totalLessons}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatsCard
          label="Published"
          value={publishedLessons}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatsCard
          label="Drafts"
          value={draftLessons}
          icon={<FileEdit className="h-5 w-5" />}
        />
        <StatsCard
          label="Modules"
          value={totalModules}
          icon={<Layers className="h-5 w-5" />}
        />
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: 'var(--alya-purple-dark)' }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            href="/educator/lessons"
            className="flex items-center gap-4 rounded-2xl border border-[var(--alya-purple-light)] bg-white p-5 shadow-sm transition hover:border-[var(--alya-purple)] hover:shadow-md"
          >
            <div className="rounded-xl bg-[var(--alya-purple-light)] p-3 text-[var(--alya-purple)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-[var(--alya-purple-dark)]">Manage Lessons</p>
              <p className="text-sm text-gray-500">Add, edit, or publish lessons</p>
            </div>
          </a>
          <a
            href="/educator/students"
            className="flex items-center gap-4 rounded-2xl border border-[var(--alya-purple-light)] bg-white p-5 shadow-sm transition hover:border-[var(--alya-purple)] hover:shadow-md"
          >
            <div className="rounded-xl bg-[var(--alya-purple-light)] p-3 text-[var(--alya-purple)]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-[var(--alya-purple-dark)]">View Students</p>
              <p className="text-sm text-gray-500">Track learner progress</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
