import { Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Students — Alya Educator' }

export default async function EducatorStudentsPage() {
  const children = await prisma.childProfile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { progress: true } },
    },
  })

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[var(--alya-purple-light)] p-2.5 text-[var(--alya-purple)]">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}
          >
            Students
          </h1>
          <p className="text-sm text-gray-500">{children.length} child profiles</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--alya-purple-light)] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--alya-purple-light)] bg-[var(--alya-purple-pale)]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Child</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Parent</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Language</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Lessons</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--alya-purple-light)]">
            {children.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                  No students yet
                </td>
              </tr>
            ) : (
              children.map((child) => (
                <tr key={child.id} className="hover:bg-[var(--alya-purple-pale)]">
                  <td className="px-6 py-4 font-medium text-[var(--alya-purple-dark)]">
                    {child.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{child.user.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-[var(--alya-purple-light)] px-2.5 py-0.5 text-xs font-medium text-[var(--alya-purple)]">
                      {child.preferredLang}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{child._count.progress} tracked</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
