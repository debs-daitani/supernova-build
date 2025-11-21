import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getCurrentUsage } from '@/lib/quotas'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await getCurrentUsage(session.user.id)

    return NextResponse.json(usage)
  } catch (error) {
    console.error('Error fetching usage stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
