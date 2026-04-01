import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Layers, Eye } from 'lucide-react'

export const metadata = { title: 'Manage Modules — Alya' }

export default async function EducatorModulesPage() {
  const session = await auth()
  if (session?.user?.role !== 'EDUCATOR' && session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  // Fetch all modules created
  const modules = await prisma.module.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      subModules: {
        include: { _count: { select: { lessons: true } } }
      }
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}>
            Manage Modules
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and organize learning modules for your curriculum.
          </p>
        </div>
        <Link
          href="/educator/modules/new"
          className="flex items-center gap-2 rounded-xl bg-[var(--alya-purple)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--alya-purple-dark)] transition"
        >
          <PlusCircle className="h-4 w-4" />
          Create Module
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => {
          const totalLessons = mod.subModules.reduce((acc, sub) => acc + sub._count.lessons, 0)

          return (
            <Link key={mod.id} href={`/educator/modules/${mod.id}`}>
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--alya-purple-light)] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[var(--alya-purple)] hover:shadow-md cursor-pointer h-full">
                
                {mod.coverImgUrl ? (
                  <div className="relative h-40 w-full bg-slate-100 border-b border-[var(--alya-purple-light)]">
                    <img src={mod.coverImgUrl} alt={mod.title} className="h-full w-full object-cover" />
                    <div className="absolute top-3 right-3 shadow-md rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                      <span className={mod.isPublished ? 'text-green-600' : 'text-amber-600'}>
                        {mod.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full items-start justify-between p-6 pb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--alya-purple-light)] text-2xl">
                      {mod.iconUrl || '📚'}
                    </div>
                    <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${mod.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {mod.isPublished ? 'Published' : 'Draft'}
                    </div>
                  </div>
                )}

                {/* Middle: Title & Description */}
                <div className={`flex-1 w-full flex flex-col ${mod.coverImgUrl ? 'px-6 pt-5 pb-4' : 'px-6 pb-4 pt-2'}`}>
                  <h3 className="line-clamp-1 text-lg font-bold" style={{ color: 'var(--alya-purple-dark)', fontFamily: 'var(--font-display)' }}>
                    {mod.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-gray-500 line-clamp-2">
                    {mod.description || 'No description provided.'}
                  </p>
                </div>

                {/* Bottom: Stats */}
                <div className="flex w-full items-center justify-between border-t border-[var(--alya-purple-light)]/50 bg-[var(--alya-purple-pale)] px-6 py-3.5 text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-medium text-[var(--alya-purple-dark)]">
                      <Layers className="h-4 w-4 text-[var(--alya-purple)]" />
                      {totalLessons}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-[var(--alya-purple-dark)]">
                      <Eye className="h-4 w-4 text-[var(--alya-purple)]" />
                      {mod.viewCount || 0}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 font-semibold text-[var(--alya-purple)] transition group-hover:text-[var(--alya-purple-dark)]">
                    Manage <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>

              </div>
            </Link>
          )
        })}

        {modules.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-[var(--alya-purple-light)] p-12 text-center bg-white/50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--alya-purple-light)] text-[var(--alya-purple)] mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--alya-purple-dark)]" style={{ fontFamily: 'var(--font-display)' }}>No modules yet</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Get started by creating your first module to organize lessons for your students.
            </p>
            <div className="mt-6">
              <Link href="/educator/modules/new" className="inline-flex items-center gap-2 rounded-xl bg-[var(--alya-purple)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--alya-purple-dark)] transition">
                <PlusCircle className="h-4 w-4" />
                Create Module
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
