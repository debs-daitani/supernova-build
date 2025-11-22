import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getConnectedPlatforms,
  connectPlatform,
  canConnectPlatform,
} from '@/lib/social-media'

/**
 * GET /api/social/platforms
 * Get user's connected social platforms
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const platforms = await getConnectedPlatforms(session.user.id)
    const quota = await canConnectPlatform(session.user.id)

    return NextResponse.json({
      platforms,
      quota: {
        current: quota.current,
        limit: quota.limit,
        allowed: quota.allowed,
      },
    })
  } catch (error) {
    console.error('Failed to fetch platforms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platforms' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social/platforms
 * Connect a new social platform
 *
 * Body:
 * {
 *   platform: 'TWITTER' | 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK',
 *   accessToken: string,
 *   refreshToken?: string,
 *   tokenExpiresAt?: string (ISO date),
 *   platformUserId: string,
 *   platformUsername: string
 * }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      platform,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      platformUserId,
      platformUsername,
    } = body

    // Validate required fields
    if (!platform || !accessToken || !platformUserId || !platformUsername) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate platform type
    const validPlatforms = ['TWITTER', 'LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK']
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    const connectedPlatform = await connectPlatform(session.user.id, platform, {
      accessToken,
      refreshToken,
      tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : undefined,
      platformUserId,
      platformUsername,
    })

    return NextResponse.json(connectedPlatform, { status: 201 })
  } catch (error) {
    console.error('Failed to connect platform:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to connect platform'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
