import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = 'user_placeholder'
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { userId }
    if (status) where.status = status

    const videos = await prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        clips: true,
        transcript: true,
      },
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder'
    const body = await request.json()

    // TODO: Check quota (BOLD: 4/month, BADASS: unlimited)

    const video = await prisma.video.create({
      data: {
        userId,
        title: body.title,
        description: body.description,
        originalUrl: body.originalUrl,
        duration: body.duration || 0,
        width: body.width || 1920,
        height: body.height || 1080,
        fileSize: body.fileSize || 0,
        format: body.format || 'MP4',
        status: 'UPLOADING',
      },
    })

    // TODO: Trigger video processing job

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}
