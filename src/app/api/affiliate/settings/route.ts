import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/affiliate/settings
 * Update affiliate payout settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { payoutMethod, payoutEmail, payoutDetails } = body

    // Validate payout method
    const validMethods = ['STRIPE', 'PAYPAL', 'BANK_TRANSFER']
    if (payoutMethod && !validMethods.includes(payoutMethod)) {
      return NextResponse.json({ error: 'Invalid payout method' }, { status: 400 })
    }

    // Validate email for Stripe/PayPal
    if ((payoutMethod === 'STRIPE' || payoutMethod === 'PAYPAL') && !payoutEmail) {
      return NextResponse.json(
        { error: 'Payout email is required for Stripe and PayPal' },
        { status: 400 }
      )
    }

    // Update affiliate profile
    const profile = await prisma.affiliateProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(payoutMethod && { payoutMethod }),
        ...(payoutEmail && { payoutEmail }),
        ...(payoutDetails && { payoutDetails }),
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating affiliate settings:', error)

    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Affiliate profile not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
