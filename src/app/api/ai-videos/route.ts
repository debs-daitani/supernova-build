import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  enhancePrompt,
  validatePrompt,
  validateNegativePrompt,
  canGenerateVideo,
  canUseDuration,
  canUseStyle,
  canUseModel,
  generateSeed,
} from '@/lib/ai-video-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const style = searchParams.get('style')
    const model = searchParams.get('model')
    const isPublic = searchParams.get('public')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const where: any = {}

    if (userId) where.userId = userId
    if (status) where.status = status
    if (style) where.style = style
    if (model) where.model = model
    if (isPublic === 'true') where.isPublic = true

    const [videos, total] = await Promise.all([
      prisma.aIVideo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.aIVideo.count({ where }),
    ])

    return NextResponse.json({
      videos,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching AI videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const userTier = 'BOLD' as 'BRAVE' | 'BOLD' | 'BADASS' // TODO: Get from user
    const body = await request.json()

    const {
      prompt,
      negativePrompt,
      model,
      style,
      duration,
      aspectRatio = '16:9',
      motionIntensity,
      cameraMovement,
      seed,
    } = body

    // Validate prompt
    const promptValidation = validatePrompt(prompt)
    if (!promptValidation.valid) {
      return NextResponse.json(
        { error: promptValidation.error },
        { status: 400 }
      )
    }

    // Validate negative prompt
    if (negativePrompt) {
      const negativeValidation = validateNegativePrompt(negativePrompt)
      if (!negativeValidation.valid) {
        return NextResponse.json(
          { error: negativeValidation.error },
          { status: 400 }
        )
      }
    }

    // Check quota
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
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

    // Check duration limit
    const durationCheck = canUseDuration(userTier, duration)
    if (!durationCheck.allowed) {
      return NextResponse.json(
        { error: durationCheck.reason },
        { status: 403 }
      )
    }

    // Check style availability
    const styleCheck = canUseStyle(userTier, style)
    if (!styleCheck.allowed) {
      return NextResponse.json(
        { error: styleCheck.reason },
        { status: 403 }
      )
    }

    // Check model availability
    const modelCheck = canUseModel(userTier, model)
    if (!modelCheck.allowed) {
      return NextResponse.json(
        { error: modelCheck.reason },
        { status: 403 }
      )
    }

    // Enhance prompt
    const enhancedPrompt = enhancePrompt(prompt, style)

    // Generate seed if not provided
    const videoSeed = seed || generateSeed()

    // Create video record
    const video = await prisma.aIVideo.create({
      data: {
        userId,
        prompt: enhancedPrompt,
        negativePrompt,
        model,
        style,
        duration,
        aspectRatio,
        motionIntensity,
        cameraMovement,
        seed: videoSeed,
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
    // In production, this would:
    // 1. Add video to Redis queue or similar
    // 2. Trigger background worker to process
    // 3. Call Runway/Pika API to generate video
    // 4. Update video record with videoUrl and status

    // For now, simulate queuing
    console.log(`Video ${video.id} queued for generation`)

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating AI video:', error)
    return NextResponse.json(
      { error: 'Failed to create AI video' },
      { status: 500 }
    )
  }
}
