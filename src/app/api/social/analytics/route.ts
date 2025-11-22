import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSocialAnalytics } from '@/lib/social-media'

/**
 * GET /api/social/analytics
 * Get social media analytics for the user
 *
 * Query params:
 * - days: number (default: 30)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const analytics = await getSocialAnalytics(session.user.id, days)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
