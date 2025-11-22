import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { MINIMUM_PAYOUTS } from '@/lib/affiliates'

/**
 * POST /api/affiliate/payout/request
 * Request a payout for approved commissions
 */
export async function POST() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's affiliate profile and role
    const [profile, user] = await Promise.all([
      prisma.affiliateProfile.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      }),
    ])

    if (!profile) {
      return NextResponse.json({ error: 'Affiliate profile not found' }, { status: 404 })
    }

    if (!profile.isActive) {
      return NextResponse.json({ error: 'Affiliate account is inactive' }, { status: 403 })
    }

    // Check minimum payout threshold
    const minimumPayout = MINIMUM_PAYOUTS[user?.role as keyof typeof MINIMUM_PAYOUTS] || 25
    const pendingEarnings = parseFloat(profile.pendingEarnings.toString())

    if (pendingEarnings < minimumPayout) {
      return NextResponse.json(
        {
          error: `Minimum payout is £${minimumPayout}. Current pending earnings: £${pendingEarnings.toFixed(2)}`,
        },
        { status: 400 }
      )
    }

    // Check payout method is configured
    if (!profile.payoutEmail && profile.payoutMethod !== 'BANK_TRANSFER') {
      return NextResponse.json(
        { error: 'Please configure your payout email in settings first' },
        { status: 400 }
      )
    }

    // Get approved unpaid commissions
    const approvedCommissions = await prisma.affiliateCommission.findMany({
      where: {
        affiliateUserId: session.user.id,
        status: 'APPROVED',
        paidAt: null,
      },
    })

    if (approvedCommissions.length === 0) {
      return NextResponse.json({ error: 'No approved commissions available for payout' }, { status: 400 })
    }

    const totalAmount = approvedCommissions.reduce(
      (sum, c) => sum + parseFloat(c.amount.toString()),
      0
    )

    // Create payout request
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateUserId: session.user.id,
        amount: totalAmount,
        commissionIds: approvedCommissions.map((c) => c.id),
        method: profile.payoutMethod,
        status: 'PENDING',
      },
    })

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    return NextResponse.json(payout, { status: 201 })
  } catch (error) {
    console.error('Error requesting payout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
