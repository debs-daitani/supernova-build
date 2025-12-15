import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

// GET /api/crm/deals/[id] - Get deal by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        activities: {
          include: {
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
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            dueDate: 'asc',
          },
        },
      },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error fetching deal:', error)
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 })
  }
}

// PATCH /api/crm/deals/[id] - Update deal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      value,
      currency,
      stage,
      probability,
      expectedCloseDate,
      notes,
      customFields,
      assignedToId,
      lostReason,
    } = body

    const existing = await prisma.deal.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const updateData: any = {
      title,
      value,
      currency,
      stage,
      probability,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
      notes,
      customFields,
      assignedToId,
      lostReason,
    }

    // Track stage changes
    if (stage && stage !== existing.stage) {
      if ((stage === 'WON' || stage === 'LOST') && !existing.actualCloseDate) {
        updateData.actualCloseDate = new Date()
      }
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        contact: {
          select: {
            id: true,
            name: true,
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

    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error updating deal:', error)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}

// DELETE /api/crm/deals/[id] - Delete deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.deal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
  }
}
