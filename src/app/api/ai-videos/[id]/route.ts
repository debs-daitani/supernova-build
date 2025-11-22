import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const video = await prisma.aIVideo.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePhotoUrl: true,
          },
        },
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error fetching AI video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI video' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const { id } = params
    const body = await request.json()

    // Check ownership
    const existing = await prisma.aIVideo.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update video (only allow updating isPublic)
    const video = await prisma.aIVideo.update({
      where: { id },
      data: {
        isPublic: body.isPublic,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePhotoUrl: true,
          },
        },
      },
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error updating AI video:', error)
    return NextResponse.json(
      { error: 'Failed to update AI video' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const { id } = params

    // Check ownership
    const existing = await prisma.aIVideo.findUnique({
      where: { id },
      select: { userId: true, videoUrl: true },
    })

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete video
    await prisma.aIVideo.delete({ where: { id } })

    // TODO: Delete video file from storage
    if (existing.videoUrl) {
      console.log(`TODO: Delete video file: ${existing.videoUrl}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting AI video:', error)
    return NextResponse.json(
      { error: 'Failed to delete AI video' },
      { status: 500 }
    )
  }
}
