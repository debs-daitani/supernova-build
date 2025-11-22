import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Export user analytics data (GDPR data portability)
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    // Fetch all analytics data for this user
    const [events, sessions, activities] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analyticsSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
      }),
      prisma.userActivity.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      }),
    ])

    const exportData = {
      userId,
      exportDate: new Date().toISOString(),
      events,
      sessions,
      activities,
      summary: {
        totalEvents: events.length,
        totalSessions: sessions.length,
        totalActivityDays: activities.length,
        dateRange: {
          first: events.length > 0 ? events[events.length - 1].createdAt : null,
          last: events.length > 0 ? events[0].createdAt : null,
        },
      },
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Error exporting user analytics:', error)
    return NextResponse.json(
      { error: 'Failed to export user analytics' },
      { status: 500 }
    )
  }
}
