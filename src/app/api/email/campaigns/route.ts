import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createCampaign } from '@/lib/email-marketing'

/**
 * GET /api/email/campaigns
 * List all campaigns for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { userId: session.user.id }

    if (status) {
      where.status = status
    }

    const campaigns = await prisma.emailCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { recipients: true },
        },
      },
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/email/campaigns
 * Create a new email campaign
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, previewText, htmlContent, textContent, fromName, fromEmail, replyTo } =
      body

    if (!name || !subject || !htmlContent || !fromName || !fromEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, htmlContent, fromName, fromEmail' },
        { status: 400 }
      )
    }

    const campaign = await createCampaign(session.user.id, {
      name,
      subject,
      previewText,
      htmlContent,
      textContent,
      fromName,
      fromEmail,
      replyTo,
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
