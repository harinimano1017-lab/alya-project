import { NextRequest, NextResponse } from 'next/server'
import { createMediaAsset, linkMediaToLesson } from '@/server/media/mediaRepository'
import { buildCdnUrl } from '@/server/media/r2Service'

export async function POST(req: NextRequest) {
  try {
    const {
      s3Key, mediaType, mimeType, lessonId,
      language, altText, fileSizeBytes,
      durationSeconds, widthPx, heightPx, uploadedById
    } = await req.json()

    if (!s3Key || !mediaType || !mimeType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const asset = await createMediaAsset({
      s3Key,
      cdnUrl: buildCdnUrl(s3Key),
      mediaType,
      mimeType,
      language: language ?? 'EN',
      altText,
      fileSizeBytes: fileSizeBytes ? parseInt(fileSizeBytes, 10) : undefined,
      durationSeconds,
      widthPx,
      heightPx,
      uploadedById,
    })

    if (lessonId) {
      await linkMediaToLesson(lessonId, asset.id, mediaType, language ?? 'EN')
    }

    return NextResponse.json({ success: true, asset })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to confirm upload' }, { status: 500 })
  }
}