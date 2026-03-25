import { Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Users — Alya Admin' }

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
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
            Users
          </h1>
          <p className="text-sm text-gray-500">{users.length} registered accounts</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--alya-purple-light)] bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--alya-purple-light)] bg-[var(--alya-purple-pale)]">
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--alya-purple-light)]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                  No users yet
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--alya-purple-pale)]">
                  <td className="px-6 py-4 font-medium text-[var(--alya-purple-dark)]">{user.name}</td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-[var(--alya-purple-light)] px-2.5 py-0.5 text-xs font-medium text-[var(--alya-purple)]">
                      {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
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
