import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { checkQuota, QuotaFeature } from '@/lib/quotas'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { feature, amount = 1 } = body

    if (!feature) {
      return NextResponse.json({ error: 'Feature is required' }, { status: 400 })
    }

    const result = await checkQuota(session.user.id, feature as QuotaFeature, amount)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking quota:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
