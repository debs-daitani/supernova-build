import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentItem = await prisma.contentItem.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        progress: {
          where: { userId: session.user.id },
        },
        bookmarks: {
          where: { userId: session.user.id },
        },
      },
    })

    if (!contentItem) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Get user's role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check access
    const hasAccess = checkAccess(user.role, contentItem.requiredRole)

    // Increment view count if user has access
    if (hasAccess) {
      await prisma.contentItem.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
      })
    }

    // Get related content from same category
    const relatedContent = await prisma.contentItem.findMany({
      where: {
        categoryId: contentItem.categoryId,
        id: { not: params.id },
        isPublished: true,
      },
      take: 4,
      orderBy: { viewCount: 'desc' },
    })

    return NextResponse.json({
      ...contentItem,
      hasAccess,
      isBookmarked: contentItem.bookmarks.length > 0,
      userProgress: contentItem.progress[0] || null,
      relatedContent,
    })
  } catch (error) {
    console.error('Error fetching content item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function checkAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    FREE: 0,
    UPGRADE: 1,
    MEMBER: 2,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
