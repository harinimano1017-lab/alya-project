import { BarChart3 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { StatsCard } from '@/components/dashboard/StatsCard'

export const metadata = { title: 'Analytics — Alya Admin' }

export default async function AdminAnalyticsPage() {
  const [totalProgress, completed, inProgress, childProfiles] = await Promise.all([
    prisma.lessonProgress.count(),
    prisma.lessonProgress.count({ where: { status: 'COMPLETED' } }),
    prisma.lessonProgress.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.childProfile.count(),
  ])

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[var(--alya-purple-light)] p-2.5 text-[var(--alya-purple)]">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}
          >
            Analytics
          </h1>
          <p className="text-sm text-gray-500">Platform learning metrics</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="Child Profiles"  value={childProfiles} icon={<BarChart3 className="h-5 w-5" />} />
        <StatsCard label="Lesson Attempts" value={totalProgress} icon={<BarChart3 className="h-5 w-5" />} />
        <StatsCard label="Completed"       value={completed}     icon={<BarChart3 className="h-5 w-5" />} />
        <StatsCard label="In Progress"     value={inProgress}    icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--alya-purple-light)] bg-white p-8 text-center shadow-sm">
        <BarChart3 className="mx-auto mb-3 h-10 w-10 text-[var(--alya-purple-light)]" />
        <p className="font-medium text-[var(--alya-purple-dark)]">Detailed charts coming soon</p>
        <p className="mt-1 text-sm text-gray-500">
          Time-series charts and per-lesson analytics will appear here.
        </p>
      </div>
    </div>
  )
}
