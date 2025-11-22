import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAffiliateDashboardStats } from '@/lib/affiliates'

/**
 * GET /api/affiliate/stats
 * Get affiliate dashboard statistics
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await getAffiliateDashboardStats(session.user.id)

    if (!stats) {
      return NextResponse.json({ error: 'Affiliate profile not found' }, { status: 404 })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching affiliate stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
