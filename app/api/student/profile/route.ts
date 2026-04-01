import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Find the child profile
    const childProfile = await prisma.childProfile.findFirst({
      where: { userId }
    })

    if (!childProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { name, preferredLang, avatarUrl } = await req.json()

    // Validate if provided
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (preferredLang !== undefined) updateData.preferredLang = preferredLang
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

    const updated = await prisma.childProfile.update({
      where: { id: childProfile.id },
      data: updateData
    })

    return NextResponse.json({ success: true, profile: updated })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
