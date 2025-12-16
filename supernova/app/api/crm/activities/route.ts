import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/crm/activities - List activities
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')
    const dealId = searchParams.get('dealId')
    const type = searchParams.get('type')

    const where: any = {}

    if (contactId) {
      where.contactId = contactId
    }

    if (dealId) {
      where.dealId = dealId
    }

    if (type && type !== 'ALL') {
      where.type = type
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST /api/crm/activities - Create activity
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const body = await request.json()
    const {
      type,
      subject,
      description,
      contactId,
      dealId,
      assignedToId,
      dueDate,
      completedAt,
    } = body

    if (!type || !subject) {
      return NextResponse.json(
        { error: 'Type and subject are required' },
        { status: 400 }
      )
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        subject,
        description,
        contactId,
        dealId,
        assignedToId: assignedToId || userId,
        dueDate: dueDate ? new Date(dueDate) : null,
        completedAt: completedAt ? new Date(completedAt) : null,
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
