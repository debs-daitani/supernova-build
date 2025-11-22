import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isPublic = searchParams.get('public')

    const where: any = {}

    if (category) where.category = category
    if (isPublic === 'true') where.isPublic = true

    const templates = await prisma.aIVideoTemplate.findMany({
      where,
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
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

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const body = await request.json()

    const template = await prisma.aIVideoTemplate.create({
      data: {
        userId,
        name: body.name,
        description: body.description,
        category: body.category,
        thumbnailUrl: body.thumbnailUrl,
        previewUrl: body.previewUrl,
        promptTemplate: body.promptTemplate,
        model: body.model,
        style: body.style,
        duration: body.duration,
        aspectRatio: body.aspectRatio,
        motionIntensity: body.motionIntensity,
        cameraMovement: body.cameraMovement,
        isPublic: body.isPublic !== false,
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

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
