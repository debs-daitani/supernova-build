import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/ai-images/[id]
 * Get a specific AI image by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const aiImage = await prisma.aIImage.findUnique({
      where: { id },
    })

    if (!aiImage) {
      return NextResponse.json(
        { error: 'AI image not found' },
        { status: 404 }
      )
    }

    // TODO: Check if user has access to this image
    // For public images, allow anyone
    // For private images, check userId

    return NextResponse.json(aiImage)
  } catch (error) {
    console.error('Error fetching AI image:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI image' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/ai-images/[id]
 * Update an AI image (e.g., make public, update metadata)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // TODO: Get userId from authentication
    const userId = 'user_placeholder' // Replace with actual auth

    const {
      isPublic,
      usedInDesign,
    } = body

    // Check if image exists and belongs to user
    const existing = await prisma.aIImage.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'AI image not found' },
        { status: 404 }
      )
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update image
    const aiImage = await prisma.aIImage.update({
      where: { id },
      data: {
        isPublic: isPublic !== undefined ? isPublic : existing.isPublic,
        usedInDesign: usedInDesign !== undefined ? usedInDesign : existing.usedInDesign,
      },
    })

    return NextResponse.json(aiImage)
  } catch (error) {
    console.error('Error updating AI image:', error)
    return NextResponse.json(
      { error: 'Failed to update AI image' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ai-images/[id]
 * Delete an AI image
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // TODO: Get userId from authentication
    const userId = 'user_placeholder' // Replace with actual auth

    // Check if image exists and belongs to user
    const existing = await prisma.aIImage.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'AI image not found' },
        { status: 404 }
      )
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete image
    await prisma.aIImage.delete({
      where: { id },
    })

    // TODO: Also delete the actual image file from storage

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting AI image:', error)
    return NextResponse.json(
      { error: 'Failed to delete AI image' },
      { status: 500 }
    )
  }
}
