import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { importSubscribers } from '@/lib/email-marketing'

/**
 * POST /api/email/subscribers/import
 * Import subscribers from CSV data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscribers } = body

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json({ error: 'Subscribers array is required' }, { status: 400 })
    }

    const results = await importSubscribers(session.user.id, subscribers)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error importing subscribers:', error)
    const message = (error as Error).message || 'Internal server error'
    const status = message.includes('limit') ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
