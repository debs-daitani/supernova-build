import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { progress, completed, lastPosition } = body

    // Check if content exists
    const contentItem = await prisma.contentItem.findUnique({
      where: { id: params.id },
    })

    if (!contentItem) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Upsert user progress
    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId: params.id,
        },
      },
      update: {
        progress: progress !== undefined ? progress : undefined,
        completedAt: completed ? new Date() : undefined,
        lastPosition: lastPosition || undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        contentId: params.id,
        progress: progress || 0,
        completedAt: completed ? new Date() : null,
        lastPosition: lastPosition || null,
      },
    })

    return NextResponse.json(userProgress)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
