import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/ai-images
 * List user's AI-generated images
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from authentication
    const userId = 'user_placeholder' // Replace with actual auth

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const model = searchParams.get('model')
    const style = searchParams.get('style')
    const isPublic = searchParams.get('public')

    const where: any = { userId }

    if (status) {
      where.status = status
    }

    if (model) {
      where.model = model
    }

    if (style) {
      where.style = style
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true'
    }

    const images = await prisma.aIImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching AI images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI images' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ai-images
 * Create a new AI image generation request
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from authentication
    const userId = 'user_placeholder' // Replace with actual auth

    const body = await request.json()
    const {
      prompt,
      negativePrompt,
      model = 'DALLE3',
      style,
      size = '1024x1024',
      steps,
      cfgScale,
      seed,
    } = body

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // TODO: Check user's quota/tier limits
    // For now, we'll create the record
    // In production, check UsageTracking.aiImagesGenerated

    // Create AI image record
    const aiImage = await prisma.aIImage.create({
      data: {
        userId,
        prompt,
        negativePrompt,
        model,
        style,
        size,
        steps: steps ? parseInt(steps) : null,
        cfgScale: cfgScale ? parseFloat(cfgScale) : null,
        seed,
        status: 'GENERATING',
      },
    })

    // TODO: Trigger actual AI generation in background
    // This would be done via a queue system or background job
    // For now, return the created record

    return NextResponse.json(aiImage, { status: 201 })
  } catch (error) {
    console.error('Error creating AI image:', error)
    return NextResponse.json(
      { error: 'Failed to create AI image request' },
      { status: 500 }
    )
  }
}
