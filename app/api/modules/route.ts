import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  try {
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

    return NextResponse.json({ success: true, data: modules })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch modules' }, { status: 500 })
  }
}
