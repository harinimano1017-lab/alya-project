'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function createModule(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'EDUCATOR' && session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const iconUrl = formData.get('iconUrl') as string
  const coverImgUrl = formData.get('coverImgUrl') as string
  const previewVideoUrl = formData.get('previewVideoUrl') as string
  const isPublished = formData.get('isPublished') === 'on'

  if (!title) throw new Error('Title is required')

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36)

  await prisma.module.create({
    data: {
      title,
      slug,
      description,
      iconUrl,
      coverImgUrl,
      previewVideoUrl,
      isPublished,
      subModules: {
        create: {
          title: 'General',
          slug: slug + '-general',
          isPublished: true,
        }
      }
    }
  })

  revalidatePath('/')
  revalidatePath('/educator/modules')
  redirect('/educator/modules')
}

export async function toggleModulePublish(id: string, isPublished: boolean) {
  const session = await auth()
  if (session?.user?.role !== 'EDUCATOR' && session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.module.update({
    where: { id },
    data: { isPublished }
  })

  revalidatePath('/')
  revalidatePath('/educator/modules')
}

export async function saveLesson(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'EDUCATOR' && session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

  const moduleId = formData.get('moduleId') as string
  const lessonIdStr = formData.get('lessonId') as string
  const lessonId = lessonIdStr || undefined
  const wordText = formData.get('wordText') as string
  const isPublished = formData.get('isPublished') === 'on'
  let imageUrl = formData.get('imageUrl') as string | null
  let lipUrl = formData.get('lipUrl') as string | null
  let signUrl = formData.get('signUrl') as string | null
  let signImgUrl = formData.get('signImgUrl') as string | null

  const imageFile = formData.get('imageFile') as File | null
  const signImageFile = formData.get('signImgFile') as File | null

  if (!wordText || !moduleId) throw new Error('Word Text and Module ID are required')

  async function uploadLocalFile(file: File, prefix: string): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    try { await mkdir(uploadDir, { recursive: true }) } catch (e) {}
    const extension = file.name.split('.').pop() || 'png'
    const filename = `${prefix}-${Date.now()}.${extension}`
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)
    return `/uploads/${filename}`
  }

  if (imageFile && imageFile.size > 0) imageUrl = await uploadLocalFile(imageFile, 'concept')
  if (signImageFile && signImageFile.size > 0) signImgUrl = await uploadLocalFile(signImageFile, 'sign')

  const getYouTubeEmbedUrl = (input: string | null) => {
    if (!input) return ''
    try {
      if (input.includes('youtube.com/embed/')) return input
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      const match = input.match(regex)
      return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}` : input
    } catch {
      return input || ''
    }
  }

  lipUrl = getYouTubeEmbedUrl(lipUrl)
  signUrl = getYouTubeEmbedUrl(signUrl)

  // Find the subModule
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { subModules: true }
  })
  
  if (!mod || !mod.subModules.length) throw new Error('Module/SubModule not found')
  
  const subModuleId = mod.subModules[0].id
  const slug = wordText.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36)

  // 1. Upsert Lesson
  const lesson = await prisma.lesson.upsert({
    where: { id: lessonId || 'new-lesson' },
    update: { wordText, isPublished },
    create: { wordText, slug, isPublished, subModuleId }
  })

  const userId = session.user.id

  // 2. Helper to attach MediaAsset & LessonMedia
  async function syncMedia(url: string, type: string) {
    if (!url) return

    // Create the media asset
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        s3Key: `${type}-${Date.now()}`,
        cdnUrl: url,
        mediaType: type,
        mimeType: 'url/external',
        uploadedById: userId,
      }
    })

    // Upsert LessonMedia linking
    // First find if there's an existing LessonMedia for this panelType and lesson
    const existing = await prisma.lessonMedia.findFirst({
      where: { lessonId: lesson.id, panelType: type }
    })

    if (existing) {
      await prisma.lessonMedia.update({
        where: { id: existing.id },
        data: { mediaAssetId: mediaAsset.id }
      })
    } else {
      await prisma.lessonMedia.create({
        data: {
          lessonId: lesson.id,
          mediaAssetId: mediaAsset.id,
          panelType: type,
        }
      })
    }
  }

  // Clear out old ones if URLs changed or empty? For simplicity, we just add/overwrite the active one.
  if (imageUrl) await syncMedia(imageUrl, 'CONCEPT_IMAGE')
  if (lipUrl) await syncMedia(lipUrl, 'LIP_READING_VIDEO')
  if (signUrl) await syncMedia(signUrl, 'SIGN_LANGUAGE_VIDEO')
  if (signImgUrl) await syncMedia(signImgUrl, 'SIGN_LANGUAGE_IMAGE')

  revalidatePath('/')
  revalidatePath(`/educator/modules/${moduleId}`)
  redirect(`/educator/modules/${moduleId}`)
}

export async function updateModule(moduleId: string, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== 'EDUCATOR' && session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const iconUrl = formData.get('iconUrl') as string
  const coverImgUrl = formData.get('coverImgUrl') as string
  const previewVideoUrl = formData.get('previewVideoUrl') as string
  const isPublished = formData.get('isPublished') === 'on'

  if (!title) throw new Error('Title is required')

  await prisma.module.update({
    where: { id: moduleId },
    data: {
      title,
      description,
      iconUrl,
      coverImgUrl,
      previewVideoUrl,
      isPublished,
    }
  })

  revalidatePath('/')
  revalidatePath('/educator/modules')
  revalidatePath(`/educator/modules/${moduleId}`)
  redirect(`/educator/modules/${moduleId}`)
}

export async function deleteModule(moduleId: string) {
  const session = await auth()
  if (session?.user?.role !== 'EDUCATOR' && session?.user?.role !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.$transaction(async (tx: any) => {
    const subModules = await tx.subModule.findMany({ where: { moduleId } })
    const subModuleIds = subModules.map((s: any) => s.id)

    const lessons = await tx.lesson.findMany({ where: { subModuleId: { in: subModuleIds } } })
    const lessonIds = lessons.map((l: any) => l.id)

    if (lessonIds.length > 0) {
      await tx.lessonMedia.deleteMany({ where: { lessonId: { in: lessonIds } } })
      await tx.lessonProgress.deleteMany({ where: { lessonId: { in: lessonIds } } })
      await tx.panelTimeLog.deleteMany({ where: { lessonId: { in: lessonIds } } })
      await tx.quizAttempt.deleteMany({ where: { lessonId: { in: lessonIds } } })
      await tx.lessonTranslation.deleteMany({ where: { lessonId: { in: lessonIds } } })
      await tx.lesson.deleteMany({ where: { id: { in: lessonIds } } })
    }

    if (subModuleIds.length > 0) {
      await tx.subModule.deleteMany({ where: { id: { in: subModuleIds } } })
    }

    await tx.module.delete({ where: { id: moduleId } })
  })

  revalidatePath('/')
  revalidatePath('/educator/modules')
  redirect('/educator/modules')
}
