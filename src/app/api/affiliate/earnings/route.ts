import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAffiliateEarnings } from '@/lib/affiliates'

/**
 * GET /api/affiliate/earnings
 * Get affiliate earnings history with pagination and filtering
 * Query params: status, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getAffiliateEarnings(session.user.id, {
      status,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching affiliate earnings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
