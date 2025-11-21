import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  getTicketStats,
  getAverageResponseTimeByTier,
  getTicketsByCategory,
  getAdminWorkload,
} from '@/lib/tickets'

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

    const [stats, avgResponseTime, ticketsByCategory, adminWorkload] = await Promise.all([
      getTicketStats(),
      getAverageResponseTimeByTier(),
      getTicketsByCategory(),
      getAdminWorkload(),
    ])

    return NextResponse.json({
      stats,
      avgResponseTime,
      ticketsByCategory,
      adminWorkload,
    })
  } catch (error) {
    console.error('Error fetching support stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
