import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      include: { clips: true, transcript: true },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const video = await prisma.video.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
      },
    })

    return NextResponse.json(video)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.video.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}
