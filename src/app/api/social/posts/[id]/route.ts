import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  updateSocialPost,
  deleteSocialPost,
  validatePostForPlatforms,
} from '@/lib/social-media'

/**
 * GET /api/social/posts/[id]
 * Get a specific social post
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.socialPost.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        platformPosts: {
          include: {
            platform: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to fetch post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/social/posts/[id]
 * Update a social post (only DRAFT or SCHEDULED)
 *
 * Body:
 * {
 *   content?: string,
 *   mediaUrls?: string[],
 *   platforms?: string[],
 *   scheduledFor?: string (ISO date),
 *   status?: 'DRAFT' | 'SCHEDULED'
 * }
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, mediaUrls, platforms, scheduledFor, status } = body

    // If content is being updated, validate character limits
    if (content && platforms) {
      const validation = validatePostForPlatforms(content, platforms)
      if (!validation.valid) {
        return NextResponse.json(
          {
            error: 'Content exceeds character limits',
            details: validation.errors,
          },
          { status: 400 }
        )
      }
    }

    const post = await updateSocialPost(params.id, session.user.id, {
      content,
      mediaUrls,
      platforms,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      status,
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Failed to update post:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to update post'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * DELETE /api/social/posts/[id]
 * Delete a social post (only DRAFT or SCHEDULED)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteSocialPost(params.id, session.user.id)

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Failed to delete post:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete post'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
