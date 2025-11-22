import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { completePayout } from '@/lib/affiliates'

/**
 * GET /api/admin/affiliates/payouts
 * Get all payouts with filtering (Admin only)
 * Query params: status, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    if (status) {
      where.status = status
    }

    const [payouts, total] = await Promise.all([
      prisma.affiliatePayout.findMany({
        where,
        include: {
          affiliate: {
            select: {
              email: true,
              role: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              affiliateProfile: {
                select: {
                  affiliateCode: true,
                  payoutEmail: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.affiliatePayout.count({ where }),
    ])

    return NextResponse.json({ payouts, total })
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/affiliates/payouts/:id/approve
 * Approve and process a payout (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { payoutId, transactionId, notes } = body

    if (!payoutId || !transactionId) {
      return NextResponse.json(
        { error: 'Payout ID and transaction ID are required' },
        { status: 400 }
      )
    }

    // Update payout status to processing
    await prisma.affiliatePayout.update({
      where: { id: payoutId },
      data: {
        status: 'PROCESSING',
        processedAt: new Date(),
        ...(notes && { notes }),
      },
    })

    // Complete the payout (marks commissions as paid)
    await completePayout(payoutId, transactionId)

    // Get updated payout
    const payout = await prisma.affiliatePayout.findUnique({
      where: { id: payoutId },
      include: {
        affiliate: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    // TODO: Send email notification to affiliate

    return NextResponse.json(payout)
  } catch (error) {
    console.error('Error approving payout:', error)

    if ((error as any).message === 'Payout not found') {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
