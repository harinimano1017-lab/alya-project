import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the active child profile
    const childProfile = await prisma.childProfile.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' }
    })

    const progressRecords = childProfile ? await prisma.lessonProgress.findMany({
      where: { childProfileId: childProfile.id }
    }) : []

    // Map of completed lesson IDs
    const completedLessonIds = new Set(
      progressRecords
        .filter(p => p.status === 'COMPLETED')
        .map(p => p.lessonId)
    )

    // Fetch all published modules with their published lessons
    const modules = await prisma.module.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: 'asc' },
      include: {
        subModules: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    })

    const inProgressAndNotStarted = []
    const completed = []

    for (const mod of modules) {
      let totalLessons = 0
      let completedCount = 0

      // Compute total lessons and completed lessons for the module
      for (const sub of mod.subModules) {
        for (const lesson of sub.lessons) {
          totalLessons++
          if (completedLessonIds.has(lesson.id)) {
            completedCount++
          }
        }
      }

      // Format module data like the Explore page
      const modData = {
        id: mod.id,
        slug: mod.slug,
        title: mod.title,
        icon: mod.iconUrl || '📚',
        cover: mod.coverImgUrl,
        totalLessons,
        completedCount,
        isCompleted: totalLessons > 0 && totalLessons === completedCount
      }

      if (modData.isCompleted) {
        completed.push(modData)
      } else {
        inProgressAndNotStarted.push(modData)
      }
    }

    return NextResponse.json({
      success: true,
      data: { inProgressAndNotStarted, completed }
    })

  } catch (error) {
    console.error('Error fetching my-path data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
