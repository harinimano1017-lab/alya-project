import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const childProfileId = searchParams.get('childProfileId')
  if (!childProfileId) return NextResponse.json({ error: 'childProfileId required' }, { status: 400 })

  const progress = await prisma.lessonProgress.findMany({
    where: { childProfileId },
    include: { lesson: { select: { slug: true, wordText: true } } },
  })
  return NextResponse.json({ progress })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { childProfileId, lessonId, status } = await req.json()
  if (!childProfileId || !lessonId || !status) {
    return NextResponse.json({ error: 'childProfileId, lessonId, and status are required' }, { status: 400 })
  }

  const progress = await prisma.lessonProgress.upsert({
    where: { childProfileId_lessonId: { childProfileId, lessonId } },
    update: { status, ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}) },
    create: { childProfileId, lessonId, status },
  })
  return NextResponse.json({ progress })
}
