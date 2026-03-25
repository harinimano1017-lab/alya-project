import { NextRequest, NextResponse } from 'next/server'
import { saveYouTubeVideo, extractYouTubeId } from '@/server/media/youtubeService'

export async function POST(req: NextRequest) {
  try {
    const { url, panelType, lessonId, language, altText, uploadedById } = await req.json()

    if (!url || !panelType || !lessonId) {
      return NextResponse.json({ error: 'url, panelType and lessonId are required' }, { status: 400 })
    }

    const videoId = extractYouTubeId(url)

    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    const asset = await saveYouTubeVideo({
      videoId,
      panelType,
      lessonId,
      language,
      altText,
      uploadedById,
    })

    return NextResponse.json({ success: true, asset })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save YouTube video' }, { status: 500 })
  }
}