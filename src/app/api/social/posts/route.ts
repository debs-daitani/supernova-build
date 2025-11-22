import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getUserPosts,
  createSocialPost,
  validatePostForPlatforms,
} from '@/lib/social-media'

/**
 * GET /api/social/posts
 * Get user's social posts with optional filters
 *
 * Query params:
 * - status: DRAFT | SCHEDULED | PUBLISHING | PUBLISHED | FAILED
 * - platform: TWITTER | LINKEDIN | INSTAGRAM | FACEBOOK | TIKTOK
 * - dateFrom: ISO date string
 * - dateTo: ISO date string
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const platform = searchParams.get('platform') || undefined
    const dateFrom = searchParams.get('dateFrom')
      ? new Date(searchParams.get('dateFrom')!)
      : undefined
    const dateTo = searchParams.get('dateTo')
      ? new Date(searchParams.get('dateTo')!)
      : undefined

    const posts = await getUserPosts(session.user.id, {
      status,
      platform,
      dateFrom,
      dateTo,
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social/posts
 * Create a new social post
 *
 * Body:
 * {
 *   content: string,
 *   mediaUrls?: string[],
 *   platforms: string[],
 *   scheduledFor?: string (ISO date) - optional, if not provided = DRAFT
 * }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, mediaUrls, platforms, scheduledFor } = body

    // Validate required fields
    if (!content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Content and at least one platform are required' },
        { status: 400 }
      )
    }

    // Validate character limits for all platforms
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

    const post = await createSocialPost(session.user.id, {
      content,
      mediaUrls,
      platforms,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Failed to create post:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create post'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
