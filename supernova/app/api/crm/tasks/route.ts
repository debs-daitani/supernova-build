import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/crm/tasks - List tasks
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('contactId')
    const dealId = searchParams.get('dealId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const myTasks = searchParams.get('myTasks') === 'true'

    const where: any = {}

    if (contactId) {
      where.contactId = contactId
    }

    if (dealId) {
      where.dealId = dealId
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority
    }

    if (myTasks) {
      where.assignedToId = userId
    } else if (assignedTo && assignedTo !== 'ALL') {
      where.assignedToId = assignedTo === 'UNASSIGNED' ? null : assignedTo
    }

    const tasks = await prisma.task.findMany({
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
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
      ],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/crm/tasks - Create task
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = auth.userId

    const body = await request.json()
    const {
      title,
      description,
      priority,
      status,
      contactId,
      dealId,
      assignedToId,
      dueDate,
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        contactId,
        dealId,
        assignedToId: assignedToId || userId,
        dueDate: dueDate ? new Date(dueDate) : null,
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

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
