import { Heart, PlusCircle } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Children — Alya' }

export default async function ParentChildrenPage() {
  const session = await auth()
  const children = await prisma.childProfile.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { progress: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--alya-purple-light)] p-2.5 text-[var(--alya-purple)]">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}
            >
              Children
            </h1>
            <p className="text-sm text-gray-500">{children.length} profile{children.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-[var(--alya-purple)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--alya-purple-dark)]"
        >
          <PlusCircle className="h-4 w-4" />
          Add child
        </button>
      </div>

      <div className="mt-8">
        {children.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--alya-purple-light)] p-16 text-center">
            <Heart className="mx-auto mb-3 h-10 w-10 text-[var(--alya-purple-light)]" />
            <p className="font-medium text-[var(--alya-purple-dark)]">No children added yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Add your child&apos;s profile to start tracking their learning journey.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <div
                key={child.id}
                className="rounded-2xl border border-[var(--alya-purple-light)] bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ background: 'var(--alya-purple)' }}
                  >
                    {child.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--alya-purple-dark)]">{child.name}</p>
                    <p className="text-sm text-gray-500">
                      {child.preferredLang} · {child._count.progress} lessons tracked
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
