import { Users, BookOpen, Layers, GraduationCap } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { StatsCard } from '@/components/dashboard/StatsCard'

export const metadata = { title: 'Admin — Alya' }

export default async function AdminPage() {
  const [totalUsers, roleBreakdown, totalModules, totalLessons, publishedLessons] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.module.count(),
      prisma.lesson.count(),
      prisma.lesson.count({ where: { isPublished: true } }),
    ])

  const roleCounts = Object.fromEntries(
    roleBreakdown.map((r) => [r.role, r._count._all])
  ) as Record<string, number>

  return (
    <div>
      <h1
        className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}
      >
        Platform Overview
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        All systems active. Here&apos;s a snapshot of Alya today.
      </p>

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Total Users"
          value={totalUsers}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          label="Modules"
          value={totalModules}
          icon={<Layers className="h-5 w-5" />}
        />
        <StatsCard
          label="Lessons"
          value={totalLessons}
          icon={<BookOpen className="h-5 w-5" />}
        />
        <StatsCard
          label="Published Lessons"
          value={publishedLessons}
          icon={<GraduationCap className="h-5 w-5" />}
        />
      </div>

      {/* Role breakdown */}
      <div className="mt-8">
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: 'var(--alya-purple-dark)' }}
        >
          Users by Role
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(['ADMIN', 'EDUCATOR', 'PARENT', 'CHILD'] as const).map((role) => (
            <div
              key={role}
              className="rounded-2xl border border-[var(--alya-purple-light)] bg-white px-5 py-4 text-center shadow-sm"
            >
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--alya-purple)', fontFamily: 'var(--font-display)' }}
              >
                {roleCounts[role] ?? 0}
              </p>
              <p className="mt-1 text-xs font-medium capitalize text-gray-500">
                {role.charAt(0) + role.slice(1).toLowerCase()}
                {(roleCounts[role] ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Content health */}
      <div className="mt-8 rounded-2xl border border-[var(--alya-purple-light)] bg-white p-6 shadow-sm">
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: 'var(--alya-purple-dark)' }}
        >
          Content Health
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 overflow-hidden rounded-full bg-[var(--alya-purple-light)] h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: totalLessons > 0 ? `${(publishedLessons / totalLessons) * 100}%` : '0%',
                background: 'var(--alya-purple)',
              }}
            />
          </div>
          <span className="shrink-0 text-sm font-medium text-[var(--alya-purple-dark)]">
            {totalLessons > 0
              ? `${Math.round((publishedLessons / totalLessons) * 100)}% published`
              : 'No lessons yet'}
          </span>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {publishedLessons} of {totalLessons} lessons are live
        </p>
      </div>
    </div>
  )
}
