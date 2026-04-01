import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, FileText, CheckCircle2, Settings } from 'lucide-react'
import { DeleteModuleButton } from '@/components/DeleteModuleButton'

export const metadata = { title: 'Module Lessons — Alya' }

export default async function EducatorModuleLessonsPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'EDUCATOR' && session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const { moduleId } = await params

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      subModules: {
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            include: { media: { include: { mediaAsset: true } } }
          }
        }
      }
    }
  })

  if (!mod) return redirect('/educator/modules')

  // Flatten lessons from submodules for display since we are hiding submodules in the UI
  const lessons = mod.subModules.flatMap(s => s.lessons)

  return (
    <div>
      <div className="mb-8">
        <Link href="/educator/modules" className="text-sm font-medium text-[var(--alya-purple)] hover:underline mb-2 inline-block">
          &larr; Back to Modules
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--alya-purple-light)] text-2xl">
              {mod.iconUrl || '📚'}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}>
                {mod.title} Lessons
              </h1>
              <p className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${mod.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {mod.isPublished ? 'Published' : 'Draft'}
                </span>
                {lessons.length} Lesson{lessons.length !== 1 && 's'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DeleteModuleButton moduleId={mod.id} />
            <Link
              href={`/educator/modules/${mod.id}/edit`}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <Settings className="h-4 w-4" />
              Edit Settings
            </Link>
            <Link
              href={`/educator/lessons/new?moduleId=${mod.id}`}
              className="flex items-center gap-2 rounded-xl bg-[var(--alya-purple)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--alya-purple-dark)] transition"
            >
              <PlusCircle className="h-4 w-4" />
              Create Lesson
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {lessons.map((lesson) => {
          // Attempt to find concept image URL if available
          const imageMedia = lesson.media.find(m => m.panelType === 'CONCEPT_IMAGE')
          const imageUrl = imageMedia?.mediaAsset?.cdnUrl

          return (
            <Link key={lesson.id} href={`/educator/lessons/${lesson.id}/edit`}>
              <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--alya-purple-light)] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[var(--alya-purple)] hover:shadow-md cursor-pointer h-full">
                
                {/* Image Placeholder or Actual Image */}
                <div className="aspect-square w-full bg-[#F0EBF8] flex items-center justify-center border-b border-[var(--alya-purple-light)] relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt={lesson.wordText} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[var(--alya-purple)] opacity-50">
                      <FileText className="h-8 w-8" />
                      <span className="text-xs font-semibold">No Image</span>
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase ${lesson.isPublished ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {lesson.isPublished ? 'LIVE' : 'DRAFT'}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold truncate" style={{ color: 'var(--alya-purple-dark)', fontFamily: 'var(--font-display)' }}>
                      {lesson.wordText}
                    </h3>
                  </div>

                  {/* Panel Config status indicators */}
                  <div className="mt-4 flex gap-1.5 flex-wrap">
                    {['LIP_READING_VIDEO', 'CONCEPT_IMAGE', 'SIGN_LANGUAGE_VIDEO'].map((panelType) => {
                      const exists = lesson.media.some(m => m.panelType === panelType && m.mediaAsset?.cdnUrl)
                      const labels: Record<string, string> = {
                        LIP_READING_VIDEO: 'Lip',
                        CONCEPT_IMAGE: 'Img',
                        SIGN_LANGUAGE_VIDEO: 'Sign',
                      }
                      
                      return (
                        <div key={panelType} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${exists ? 'bg-[var(--alya-purple)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {exists && <CheckCircle2 className="h-2.5 w-2.5" />}
                          {labels[panelType]}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            </Link>
          )
        })}

        {lessons.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-[var(--alya-purple-light)] p-12 text-center bg-white/50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--alya-purple-light)] text-[var(--alya-purple)] mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--alya-purple-dark)]" style={{ fontFamily: 'var(--font-display)' }}>No lessons yet</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Ready to start? Add your first lesson to this module.
            </p>
            <div className="mt-6">
              <Link href={`/educator/lessons/new?moduleId=${mod.id}`} className="inline-flex items-center gap-2 rounded-xl bg-[var(--alya-purple)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--alya-purple-dark)] transition">
                <PlusCircle className="h-4 w-4" />
                Create Lesson
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
