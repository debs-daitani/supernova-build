import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getCampaignAnalytics } from '@/lib/email-marketing'

/**
 * GET /api/email/campaigns/:id
 * Get campaign details and analytics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = await prisma.emailCampaign.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const analytics = await getCampaignAnalytics(params.id)

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/email/campaigns/:id
 * Update campaign details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = await prisma.emailCampaign.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const body = await request.json()

    // Only allow updating draft campaigns
    if (campaign.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft campaigns can be updated' },
        { status: 400 }
      )
    }

    const updated = await prisma.emailCampaign.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
