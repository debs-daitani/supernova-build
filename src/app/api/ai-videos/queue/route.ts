import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateQueuePosition, estimateWaitTime } from '@/lib/ai-video-utils'

export async function GET(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const userTier = 'BOLD' as 'BRAVE' | 'BOLD' | 'BADASS' // TODO: Get from user

    // Get queued and generating videos
    const queuedVideos = await prisma.aIVideo.findMany({
      where: {
        status: {
          in: ['QUEUED', 'GENERATING'],
        },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    // Get currently generating video
    const currentlyGenerating = queuedVideos.find((v) => v.status === 'GENERATING')

    // Get user's videos in queue
    const userVideos = queuedVideos.filter((v) => v.userId === userId)

    // Calculate queue positions
    const isPriority = userTier === 'BADASS'
    const priorityCount = queuedVideos.filter(
      (v) => v.status === 'QUEUED' && isPriority
    ).length

    const queue = userVideos.map((video) => {
      const position = calculateQueuePosition(
        isPriority,
        queuedVideos.length,
        priorityCount
      )
      const waitTime = estimateWaitTime(position)

      return {
        ...video,
        queuePosition: position,
        estimatedWaitTime: waitTime,
      }
    })

    // Get completed videos
    const completed = await prisma.aIVideo.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      orderBy: { generatedAt: 'desc' },
      take: 10,
    })

    // Get failed videos
    const failed = await prisma.aIVideo.findMany({
      where: {
        userId,
        status: 'FAILED',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      queue,
      currentlyGenerating,
      completed,
      failed,
      totalInQueue: queuedVideos.length,
      userPosition: queue.length > 0 ? queue[0].queuePosition : null,
    })
  } catch (error) {
    console.error('Error fetching queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue' },
      { status: 500 }
    )
  }
}
