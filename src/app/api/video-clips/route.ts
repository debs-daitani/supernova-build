import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = 'user_placeholder'
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    const where: any = { userId }
    if (videoId) where.videoId = videoId

    const clips = await prisma.videoClip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { video: true },
    })

    return NextResponse.json(clips)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clips' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder'
    const body = await request.json()

    const clip = await prisma.videoClip.create({
      data: {
        userId,
        videoId: body.videoId,
        title: body.title,
        startTime: body.startTime,
        endTime: body.endTime,
        duration: body.endTime - body.startTime,
        aspectRatio: body.aspectRatio || '16:9',
        width: body.width || 1920,
        height: body.height || 1080,
        captions: body.captions,
        status: 'PROCESSING',
      },
    })

    // TODO: Trigger clip generation job with FFmpeg

    return NextResponse.json(clip, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create clip' }, { status: 500 })
  }
}
