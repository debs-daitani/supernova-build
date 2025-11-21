import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateTicketReplyEmail, sendEmail } from '@/lib/email'

// POST - Add message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, isInternal = false } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get user and ticket
    const [user, ticket] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          role: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.supportTicket.findUnique({
        where: { id: params.id },
        include: {
          user: {
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
      }),
    ])

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permissions
    const isAdmin = user.role === 'ADMIN'
    const isOwner = ticket.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only admins can create internal messages
    if (isInternal && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admins can create internal messages' },
        { status: 403 }
      )
    }

    // Create message
    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        userId: session.user.id,
        message,
        isInternal,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
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

    // Update ticket
    const updateData: any = {
      lastActivityAt: new Date(),
    }

    // If admin's first response, mark firstResponseAt
    if (isAdmin && !ticket.firstResponseAt) {
      updateData.firstResponseAt = new Date()
    }

    // If ticket was resolved and user replies, reopen it
    if (isOwner && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')) {
      updateData.status = 'WAITING_USER'
    } else if (isAdmin && ticket.status === 'OPEN') {
      updateData.status = 'IN_PROGRESS'
    }

    await prisma.supportTicket.update({
      where: { id: params.id },
      data: updateData,
    })

    // Send email notification
    if (!isInternal) {
      // If admin replied, notify user
      if (isAdmin) {
        const adminName = user.profile
          ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() ||
            user.email
          : user.email

        const emailTemplate = generateTicketReplyEmail(
          ticket.user.email,
          ticket.user.profile?.firstName || '',
          ticket.id,
          ticket.subject,
          message,
          adminName
        )
        await sendEmail(emailTemplate)
      }
      // If user replied and assigned admin exists, notify admin (TODO in production)
    }

    return NextResponse.json(ticketMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
