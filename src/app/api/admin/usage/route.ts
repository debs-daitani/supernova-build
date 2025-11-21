import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAdminUsageStats } from '@/lib/quotas'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is ADMIN
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const stats = await getAdminUsageStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin usage stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
