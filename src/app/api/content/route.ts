import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const filter = searchParams.get('filter') || 'all' // all, free, premium

    // Get user's role for access control
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build where clause
    const where: any = {
      isPublished: true,
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    if (type) {
      where.type = type
    }

    // Filter by access level
    if (filter === 'free') {
      where.isPremium = false
    } else if (filter === 'premium') {
      where.isPremium = true
    }

    // Determine sort order
    let orderBy: any = {}
    switch (sortBy) {
      case 'popular':
        orderBy = { viewCount: 'desc' }
        break
      case 'alphabetical':
        orderBy = { title: 'asc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    const contentItems = await prisma.contentItem.findMany({
      where,
      include: {
        category: true,
        progress: {
          where: { userId: session.user.id },
        },
        bookmarks: {
          where: { userId: session.user.id },
        },
      },
      orderBy,
    })

    // Filter out content user doesn't have access to
    const accessibleContent = contentItems.map((item) => {
      const hasAccess = checkAccess(user.role, item.requiredRole)
      return {
        ...item,
        hasAccess,
        isBookmarked: item.bookmarks.length > 0,
        userProgress: item.progress[0] || null,
      }
    })

    return NextResponse.json(accessibleContent)
  } catch (error) {
    console.error('Error fetching content:', error)
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
