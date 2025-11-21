import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getMigrationHistory } from '@/lib/migration'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const history = await getMigrationHistory()

    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching migration history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
