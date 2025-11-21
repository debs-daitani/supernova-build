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

    // Check if content exists
    const contentItem = await prisma.contentItem.findUnique({
      where: { id: params.id },
    })

    if (!contentItem) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Check if bookmark exists
    const existingBookmark = await prisma.contentBookmark.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId: params.id,
        },
      },
    })

    if (existingBookmark) {
      // Remove bookmark
      await prisma.contentBookmark.delete({
        where: { id: existingBookmark.id },
      })
      return NextResponse.json({ bookmarked: false })
    } else {
      // Add bookmark
      await prisma.contentBookmark.create({
        data: {
          userId: session.user.id,
          contentId: params.id,
        },
      })
      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
