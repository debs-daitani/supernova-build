import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/social/posts - List posts
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { userId: auth.userId }
    if (status) {
      where.status = status
    }

    const [posts, total] = await Promise.all([
      prisma.socialPost.findMany({
        where,
        orderBy: [
          { scheduledFor: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit,
      }),
      prisma.socialPost.count({ where })
    ])

    return NextResponse.json({
      posts,
      total,
      hasMore: offset + posts.length < total
    })
  } catch (error) {
    console.error('Error fetching social posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/social/posts - Create post
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, mediaUrls, platforms, scheduledFor, status = 'draft' } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: 'At least one platform must be selected' }, { status: 400 })
    }

    // Validate platforms are connected
    const connectedAccounts = await prisma.socialAccount.findMany({
      where: {
        userId: auth.userId,
        platform: { in: platforms },
        isActive: true
      },
      select: { platform: true }
    })

    const connectedPlatforms = connectedAccounts.map(a => a.platform)
    const missingPlatforms = platforms.filter((p: string) => !connectedPlatforms.includes(p))

    if (missingPlatforms.length > 0) {
      return NextResponse.json({
        error: `Not connected to: ${missingPlatforms.join(', ')}`,
        missingPlatforms
      }, { status: 400 })
    }

    // Create post
    const post = await prisma.socialPost.create({
      data: {
        userId: auth.userId,
        content,
        mediaUrls: mediaUrls || [],
        platforms,
        status: scheduledFor ? 'scheduled' : status,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating social post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

// DELETE /api/social/posts - Bulk delete
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const result = await prisma.socialPost.deleteMany({
      where: {
        id: { in: ids },
        userId: auth.userId,
        status: { not: 'published' } // Can't delete published posts
      }
    })

    return NextResponse.json({ deleted: result.count })
  } catch (error) {
    console.error('Error deleting social posts:', error)
    return NextResponse.json({ error: 'Failed to delete posts' }, { status: 500 })
  }
}
