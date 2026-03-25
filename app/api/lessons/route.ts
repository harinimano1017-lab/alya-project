import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lessons = await prisma.lesson.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: 'asc' },
    include: {
      subModule: {
        include: { module: { select: { title: true, slug: true } } },
      },
    },
  })
  return NextResponse.json({ lessons })
}
