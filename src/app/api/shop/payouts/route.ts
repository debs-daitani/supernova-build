import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const payouts = await prisma.payoutRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: 'desc' },
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'user_placeholder' // TODO: Get from auth
    const body = await request.json()
    const { amount, method, details } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!method || !['STRIPE', 'PAYPAL', 'BANK'].includes(method)) {
      return NextResponse.json({ error: 'Invalid payout method' }, { status: 400 })
    }

    const payout = await prisma.payoutRequest.create({
      data: {
        userId,
        amount,
        method,
        details,
        status: 'PENDING',
        requestedAt: new Date(),
      },
    })

    return NextResponse.json(payout, { status: 201 })
  } catch (error) {
    console.error('Error creating payout request:', error)
    return NextResponse.json(
      { error: 'Failed to create payout request' },
      { status: 500 }
    )
  }
}
