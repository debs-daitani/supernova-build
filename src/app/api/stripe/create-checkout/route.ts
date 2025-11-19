import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession, PRICES } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body // 'upgrade' | 'monthly' | 'annual'

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let priceId: string
    let mode: 'payment' | 'subscription'
    let metadata: Record<string, string> = {}

    switch (type) {
      case 'upgrade':
        priceId = PRICES.UPGRADE_ONE_TIME
        mode = 'payment'
        metadata = { type: 'upgrade_one_time' }
        break
      case 'monthly':
        priceId = PRICES.MONTHLY
        mode = 'subscription'
        metadata = { type: 'monthly_subscription' }
        break
      case 'annual':
        priceId = PRICES.ANNUAL
        mode = 'subscription'
        metadata = { type: 'annual_subscription' }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid payment type' },
          { status: 400 }
        )
    }

    const checkoutSession = await createCheckoutSession(
      user.id,
      user.email,
      priceId,
      mode,
      metadata
    )

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Create checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
