import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAffiliateAnalytics } from '@/lib/affiliates'

/**
 * GET /api/admin/affiliates/analytics
 * Get affiliate program analytics (Admin only)
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const analytics = await getAffiliateAnalytics()

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching affiliate analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
