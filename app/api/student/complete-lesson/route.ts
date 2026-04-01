import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { lessonId } = body

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
    }

    // Get or create first child profile for this user
    let childProfile = await prisma.childProfile.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' }
    })

    if (!childProfile) {
      childProfile = await prisma.childProfile.create({
        data: {
          name: 'My Child',
          userId: session.user.id,
          preferredLang: 'EN'
        }
      })
    }

    // Mark the lesson as completed
    const progress = await prisma.lessonProgress.upsert({
      where: { 
        childProfileId_lessonId: { 
          childProfileId: childProfile.id, 
          lessonId 
        } 
      },
      update: { 
        status: 'COMPLETED',
        completedAt: new Date(),
        viewCount: { increment: 1 }
      },
      create: { 
        childProfileId: childProfile.id, 
        lessonId, 
        status: 'COMPLETED',
        completedAt: new Date(),
        viewCount: 1
      },
    })

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('Error completing lesson:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
