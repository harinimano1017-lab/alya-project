import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const module = await prisma.module.findUnique({
    where: { id },
    include: {
      subModules: {
        orderBy: { orderIndex: 'asc' },
        include: { lessons: { orderBy: { orderIndex: 'asc' } } },
      },
    },
  })
  if (!module) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ module })
}
