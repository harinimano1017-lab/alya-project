import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { createModule } from '@/app/(dashboard)/educator/actions'
import { YouTubePreviewInput } from '@/components/YouTubePreviewInput'

export const metadata = { title: 'Create Module — Alya' }

export default async function NewModulePage() {
  const session = await auth()
  if (session?.user?.role !== 'EDUCATOR' && session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/educator/modules" className="text-sm font-medium text-[var(--alya-purple)] hover:underline mb-2 inline-block">
          &larr; Back to Modules
        </Link>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--alya-purple-dark)' }}>
          Create New Module
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up a new learning category for your students.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--alya-purple-light)] bg-white p-6 shadow-sm">
        <form action={createModule} className="space-y-6">
          
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-sm font-semibold text-[var(--alya-purple-dark)]">
              Module Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="e.g. Animals, Feelings, Colors"
              className="w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5 text-sm text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-semibold text-[var(--alya-purple-dark)]">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="What will students learn in this module?"
              className="w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5 text-sm text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20"
            ></textarea>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="previewVideoUrl" className="block text-sm font-semibold text-[var(--alya-purple-dark)]">
              Preview Video URL (YouTube)
            </label>
            <YouTubePreviewInput
              id="previewVideoUrl"
              name="previewVideoUrl"
              placeholder="https://youtube.com/watch?v=..."
              className="w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5 text-sm text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20"
            />
            <p className="text-xs text-gray-500 mt-1">Add a YouTube video link to showcase an overview of this module to parents and students.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="coverImgUrl" className="block text-sm font-semibold text-[var(--alya-purple-dark)]">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              id="coverImgUrl"
              name="coverImgUrl"
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-[var(--alya-purple-light)] bg-white px-4 py-2.5 text-sm text-[var(--alya-purple-dark)] outline-none transition focus:border-[var(--alya-purple)] focus:ring-2 focus:ring-[var(--alya-purple)]/20"
            />
            <p className="text-xs text-gray-500 mt-1">A cover image displayed prominently on the Module cards.</p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[var(--alya-purple-light)] p-4 bg-gray-50/50">
            <div className="flex h-5 items-center">
              <input
                id="isPublished"
                name="isPublished"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[var(--alya-purple)] focus:ring-[var(--alya-purple)]"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="isPublished" className="font-semibold text-[var(--alya-purple-dark)]">
                Publish immediately
              </label>
              <p className="text-gray-500">
                If unchecked, it will be saved as a Draft and hidden from students.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link
              href="/educator/modules"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-[var(--alya-purple)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--alya-purple-dark)] transition"
            >
              Save Module
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
