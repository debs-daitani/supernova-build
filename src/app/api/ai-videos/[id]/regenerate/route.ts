import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  canGenerateVideo,
  generateSeed,
} from '@/lib/ai-video-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const userTier = 'BOLD' as 'BRAVE' | 'BOLD' | 'BADASS' // TODO: Get from user
    const { id } = params

    // Get original video
    const original = await prisma.aIVideo.findUnique({
      where: { id },
    })

    if (!original) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check ownership
    if (original.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check quota
    const currentMonth = new Date().toISOString().substring(0, 7)
    const monthlyCount = await prisma.aIVideo.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(`${currentMonth}-01`),
        },
      },
    })

    const quotaCheck = canGenerateVideo(userTier, monthlyCount)
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: quotaCheck.reason },
        { status: 403 }
      )
    }

    // Create new video with same settings but new seed
    const video = await prisma.aIVideo.create({
      data: {
        userId,
        prompt: original.prompt,
        negativePrompt: original.negativePrompt,
        model: original.model,
        style: original.style,
        duration: original.duration,
        aspectRatio: original.aspectRatio,
        motionIntensity: original.motionIntensity,
        cameraMovement: original.cameraMovement,
        seed: generateSeed(), // Generate new seed for variation
        status: 'QUEUED',
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

    // TODO: Add to generation queue
    console.log(`Video ${video.id} queued for regeneration`)

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error regenerating AI video:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate AI video' },
      { status: 500 }
    )
  }
}
