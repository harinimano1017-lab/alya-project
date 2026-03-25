
import { NextRequest, NextResponse } from 'next/server'
import { buildS3Key, getPresignedUploadUrl } from '@/server/media/r2Service'

export async function POST(req: NextRequest) {
  try {
    const { subModuleSlug, lessonSlug, type, lang, ext, mimeType } = await req.json()

    if (!subModuleSlug || !lessonSlug || !type || !mimeType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const s3Key = buildS3Key(subModuleSlug, lessonSlug, type, lang ?? 'en', ext ?? 'mp4')
    const result = await getPresignedUploadUrl(s3Key, mimeType)

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}