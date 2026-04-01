import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveLesson } from '@/app/(dashboard)/educator/actions'
import { YouTubePreviewInput } from '@/components/YouTubePreviewInput'
import { ImageUploader } from '@/components/ImageUploader'
import { LetterTilesInput } from '@/components/LetterTilesInput'

export const metadata = { title: 'Create Lesson — Alya' }

export default async function NewLessonPage({ searchParams }: { searchParams: Promise<{ moduleId: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'EDUCATOR' && session?.user?.role !== 'ADMIN') redirect('/')

  const { moduleId } = await searchParams
  if (!moduleId) return redirect('/educator/modules')

  const mod = await prisma.module.findUnique({ where: { id: moduleId } })
  if (!mod) return redirect('/educator/modules')

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-[var(--alya-purple-light)]">
        <Link href={`/educator/modules/${moduleId}`} className="text-sm font-medium text-[var(--alya-purple)] hover:text-[var(--alya-purple-dark)] transition mb-3 inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-[var(--alya-purple-light)] shadow-sm">
          &larr; Back to {mod.title}
        </Link>
        <h1 className="text-3xl font-black tracking-tight mt-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}>
          Create New Lesson
        </h1>
        <p className="mt-2 text-base text-gray-500 font-medium">
          Design the multimodal 4-panel learning experience for your students.
        </p>
      </div>

      <div className="rounded-[32px] border border-[var(--alya-purple-light)] bg-white p-6 md:p-10 shadow-xl shadow-purple-900/5">
        <form action={saveLesson} className="space-y-12">
          <input type="hidden" name="moduleId" value={moduleId} />

          {/* 1. TEXT PANEL */}
          <section>
            <h2 className="text-xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--alya-purple-dark)' }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--alya-purple-light)] text-sm font-black text-[var(--alya-purple)]">1</span>
              Text Panel
            </h2>
            <LetterTilesInput />
          </section>

          <hr className="border-[var(--alya-purple-light)] opacity-50" />

          {/* 2. IMAGE URL PANEL */}
          <section>
            <h2 className="text-xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--alya-purple-dark)' }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--alya-purple-light)] text-sm font-black text-[var(--alya-purple)]">2</span>
              Concept Image
            </h2>
            <div className="ml-11">
              <ImageUploader name="image" label="Word Visualization" />
            </div>
          </section>

          <hr className="border-[var(--alya-purple-light)] opacity-50" />

          {/* 3. LIP READING VIDEO */}
          <section>
            <h2 className="text-xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--alya-purple-dark)' }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--alya-purple-light)] text-sm font-black text-[var(--alya-purple)]">3</span>
              Lip Reading Video
            </h2>
            <div className="ml-11">
              <label htmlFor="lipUrl" className="block text-sm font-semibold text-[var(--alya-purple-dark)] mb-2">
                YouTube Embed Validation
              </label>
              <YouTubePreviewInput
                id="lipUrl"
                name="lipUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-2xl border border-[var(--alya-purple-light)] bg-white px-5 py-3.5 text-base text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-4 focus:ring-[var(--alya-purple)]/10"
              />
            </div>
          </section>

          <hr className="border-[var(--alya-purple-light)] opacity-50" />

          {/* 4. SIGN LANGUAGE MEDIA */}
          <section>
            <h2 className="text-xl font-black mb-6 flex items-center gap-3" style={{ color: 'var(--alya-purple-dark)' }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--alya-purple-light)] text-sm font-black text-[var(--alya-purple)]">4</span>
              Sign Language
            </h2>
            
            <div className="ml-11 grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-[var(--alya-purple-dark)] mb-2">
                  <span className="bg-purple-100 text-[var(--alya-purple)] px-2 py-0.5 rounded mr-2 text-xs">OPTION A</span>
                  Sign Language Video
                </label>
                <YouTubePreviewInput
                  id="signUrl"
                  name="signUrl"
                  placeholder="Paste YouTube URL..."
                  className="w-full rounded-2xl border border-[var(--alya-purple-light)] bg-white px-5 py-3.5 text-base text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-4 focus:ring-[var(--alya-purple)]/10"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-[var(--alya-purple-dark)] mb-2">
                  <span className="bg-purple-100 text-[var(--alya-purple)] px-2 py-0.5 rounded mr-2 text-xs">OPTION B</span>
                  Sign Language Image
                </label>
                <div className="-mt-3 flex-1 h-full">
                   <ImageUploader name="signImg" label="Static Sign Language Image Fallback" />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-[var(--alya-purple-dark)] opacity-10" />

          {/* PUBLISH TOGGLE */}
          <div className="flex items-start gap-4 rounded-[24px] border-2 border-[var(--alya-purple-light)] p-6 bg-gradient-to-br from-white to-[var(--alya-purple-light)]/20 shadow-sm transition hover:border-[var(--alya-purple)]">
            <div className="flex pt-1 items-center">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                defaultChecked
                className="h-6 w-6 rounded-md border-gray-300 text-[var(--alya-purple)] focus:ring-[var(--alya-purple)]"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="isPublished" className="font-black text-[var(--alya-purple-dark)] text-lg cursor-pointer">
                Publish Immediately
              </label>
              <p className="text-gray-600 mt-1 text-base">
                When checked, this lesson will instantly appear under <span className="font-bold text-[var(--alya-purple)]">{mod.title}</span> in the Parent/Student Explorer dashboard. Uncheck to save it silently as a Draft.
              </p>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="pt-4 flex justify-end gap-4 border-t border-gray-100 mt-8">
            <Link
              href={`/educator/modules/${moduleId}`}
              className="rounded-2xl px-6 py-4 text-base font-bold text-gray-500 hover:bg-gray-100 transition flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-2xl bg-[#1A0A3A] hover:bg-black px-10 py-4 text-base font-black tracking-widest text-white shadow-xl shadow-[#1A0A3A]/20 transition flex items-center justify-center"
            >
              SAVE LESSON &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
