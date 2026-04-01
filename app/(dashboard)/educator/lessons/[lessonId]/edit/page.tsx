import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveLesson } from '@/app/(dashboard)/educator/actions'
import { YouTubePreviewInput } from '@/components/YouTubePreviewInput'

export const metadata = { title: 'Edit Lesson — Alya' }

export default async function EditLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'EDUCATOR' && session?.user?.role !== 'ADMIN') redirect('/')

  const { lessonId } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      subModule: { include: { module: true } },
      media: { include: { mediaAsset: true } }
    }
  })

  if (!lesson) return redirect('/educator/modules')

  const moduleId = lesson.subModule.module.id
  const modTitle = lesson.subModule.module.title

  // Extract panel URLs
  const imageUrl = lesson.media.find(m => m.panelType === 'CONCEPT_IMAGE')?.mediaAsset?.cdnUrl || ''
  const lipUrl = lesson.media.find(m => m.panelType === 'LIP_READING_VIDEO')?.mediaAsset?.cdnUrl || ''
  const signUrl = lesson.media.find(m => m.panelType === 'SIGN_LANGUAGE_VIDEO')?.mediaAsset?.cdnUrl || ''

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href={`/educator/modules/${moduleId}`} className="text-sm font-medium text-[var(--alya-purple)] hover:underline mb-2 inline-block">
          &larr; Back to {modTitle} Lessons
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}>
              Edit Lesson
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Update the 4-panel learning experience for {lesson.wordText}.
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${lesson.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {lesson.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--alya-purple-light)] bg-white p-6 md:p-8 shadow-sm">
        <form action={saveLesson} className="space-y-8">
          <input type="hidden" name="moduleId" value={moduleId} />
          <input type="hidden" name="lessonId" value={lessonId} />

          {/* 1. TEXT PANEL */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--alya-purple-dark)' }}>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--alya-purple-light)] text-xs text-[var(--alya-purple)]">1</span>
              Text Panel
            </h2>
            <div className="space-y-1.5 ml-8">
              <label htmlFor="wordText" className="block text-sm font-semibold text-[var(--alya-purple-dark)]">
                Target Word / Text
              </label>
              <input
                type="text"
                id="wordText"
                name="wordText"
                required
                defaultValue={lesson.wordText}
                className="w-full text-lg uppercase font-bold rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-3 text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* 2. IMAGE URL PANEL */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--alya-purple-dark)' }}>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--alya-purple-light)] text-xs text-[var(--alya-purple)]">2</span>
              Concept Image
            </h2>
            <div className="space-y-1.5 ml-8">
              <label htmlFor="imageUrl" className="block text-sm font-semibold text-[var(--alya-purple-dark)]">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                defaultValue={imageUrl}
                className="w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5 text-sm text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* 3. LIP READING VIDEO */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--alya-purple-dark)' }}>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--alya-purple-light)] text-xs text-[var(--alya-purple)]">3</span>
              Lip Reading Video
            </h2>
            <div className="space-y-1.5 ml-8">
              <label htmlFor="lipUrl" className="block text-sm font-semibold text-[var(--alya-purple-dark)]">
                YouTube Embed URL
              </label>
              <YouTubePreviewInput
                id="lipUrl"
                name="lipUrl"
                defaultValue={lipUrl}
                className="w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5 text-sm text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* 4. SIGN LANGUAGE VIDEO */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--alya-purple-dark)' }}>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--alya-purple-light)] text-xs text-[var(--alya-purple)]">4</span>
              Sign Language Video (Live View Panel)
            </h2>
            <div className="space-y-1.5 ml-8">
              <label htmlFor="signUrl" className="block text-sm font-semibold text-[var(--alya-purple-dark)]">
                YouTube Embed URL
              </label>
              <YouTubePreviewInput
                id="signUrl"
                name="signUrl"
                defaultValue={signUrl}
                className="w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5 text-sm text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20"
              />
            </div>
          </div>

          <hr className="border-[var(--alya-purple-light)]" />

          <div className="flex items-center gap-3 rounded-xl border border-[var(--alya-purple-light)] p-4 bg-[var(--alya-purple-light)]/20">
            <div className="flex h-5 items-center">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                defaultChecked={lesson.isPublished}
                className="h-4 w-4 rounded border-gray-300 text-[var(--alya-purple)] focus:ring-[var(--alya-purple)]"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="isPublished" className="font-bold text-[var(--alya-purple-dark)] text-base">
                Publish to Dashboard
              </label>
              <p className="text-gray-600 mt-1">
                Make this lesson instantly available to students exploring the <strong>{modTitle}</strong> module.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Link
              href={`/educator/modules/${moduleId}`}
              className="rounded-xl px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-[var(--alya-purple)] px-8 py-3 text-sm font-bold tracking-wide text-white shadow-sm hover:bg-[var(--alya-purple-dark)] transition"
            >
              Update Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
