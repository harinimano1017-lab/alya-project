import { Heart, TrendingUp, BookOpen, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StatsCard } from '@/components/dashboard/StatsCard'

export const metadata = { title: 'Parent Dashboard — Alya' }

export default async function ParentPage() {
  const session = await auth()
  const userId = session!.user.id
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'

  const children = await prisma.childProfile.findMany({
    where: { userId },
    include: {
      progress: { select: { status: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const totalCompleted = children.reduce(
    (sum, child) => sum + child.progress.filter((p) => p.status === 'COMPLETED').length,
    0
  )
  const totalInProgress = children.reduce(
    (sum, child) => sum + child.progress.filter((p) => p.status === 'IN_PROGRESS').length,
    0
  )

  return (
    <div>
      <h1
        className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}
      >
        Welcome back, {firstName}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Track your {children.length === 1 ? "child's" : "children's"} learning journey.
      </p>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatsCard
          label="Children"
          value={children.length}
          icon={<Heart className="h-5 w-5" />}
        />
        <StatsCard
          label="Lessons Completed"
          value={totalCompleted}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatsCard
          label="In Progress"
          value={totalInProgress}
          icon={<BookOpen className="h-5 w-5" />}
        />
      </div>

      {/* Children list */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--alya-purple-dark)' }}
          >
            Your Children
          </h2>
          <Link
            href="/parent/children"
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--alya-purple)] hover:underline"
          >
            <PlusCircle className="h-4 w-4" />
            Add child
          </Link>
        </div>

        {children.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--alya-purple-light)] p-12 text-center">
            <Heart
              className="mx-auto mb-3 h-10 w-10"
              style={{ color: 'var(--alya-purple-light)' }}
            />
            <p className="font-medium text-[var(--alya-purple-dark)]">No children added yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Add your child&apos;s profile to start tracking their progress.
            </p>
            <Link
              href="/parent/children"
              className="mt-4 inline-block rounded-xl bg-[var(--alya-purple)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--alya-purple-dark)]"
            >
              Add a child
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => {
              const completed = child.progress.filter((p) => p.status === 'COMPLETED').length
              const inProgress = child.progress.filter((p) => p.status === 'IN_PROGRESS').length
              return (
                <Link
                  key={child.id}
                  href={`/parent/progress/${child.id}`}
                  className="group rounded-2xl border border-[var(--alya-purple-light)] bg-white p-5 shadow-sm transition hover:border-[var(--alya-purple)] hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: 'var(--alya-purple)' }}
                    >
                      {child.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--alya-purple-dark)]">
                        {child.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {child.preferredLang.toLowerCase()} · {child.dateOfBirth
                          ? new Date().getFullYear() - new Date(child.dateOfBirth).getFullYear() + ' yrs'
                          : 'Age not set'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 text-sm">
                    <span className="text-emerald-600 font-medium">{completed} done</span>
                    <span className="text-[var(--alya-purple)] font-medium">{inProgress} in progress</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
