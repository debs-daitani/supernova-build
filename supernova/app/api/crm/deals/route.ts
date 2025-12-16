import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/crm/deals - List deals
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')
    const assignedTo = searchParams.get('assignedTo')

    const where: any = {}

    if (stage && stage !== 'ALL') {
      where.stage = stage
    }

    if (assignedTo && assignedTo !== 'ALL') {
      where.assignedToId = assignedTo === 'UNASSIGNED' ? null : assignedTo
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            activities: true,
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Group by stage for Kanban view
    const dealsByStage = {
      LEAD: deals.filter((d) => d.stage === 'LEAD'),
      QUALIFIED: deals.filter((d) => d.stage === 'QUALIFIED'),
      PROPOSAL: deals.filter((d) => d.stage === 'PROPOSAL'),
      NEGOTIATION: deals.filter((d) => d.stage === 'NEGOTIATION'),
      WON: deals.filter((d) => d.stage === 'WON'),
      LOST: deals.filter((d) => d.stage === 'LOST'),
    }

    return NextResponse.json({
      deals,
      dealsByStage,
    })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
  }
}

// POST /api/crm/deals - Create deal
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      value,
      currency,
      contactId,
      stage,
      probability,
      expectedCloseDate,
      notes,
      customFields,
      assignedToId,
    } = body

    // Validate required fields
    if (!title || value === undefined || !contactId) {
      return NextResponse.json(
        { error: 'Title, value, and contactId are required' },
        { status: 400 }
      )
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        value,
        currency: currency || 'USD',
        contactId,
        stage: stage || 'LEAD',
        probability: probability || 0,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        notes,
        customFields: customFields || {},
        assignedToId,
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}
