import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuth } from '../../../../lib/auth-middleware'

// GET /api/venued/tasks - Get tasks (optionally filtered by projectId)
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const phaseId = searchParams.get('phaseId')
    const status = searchParams.get('status')

    const tasks = await prisma.venuedTask.findMany({
      where: {
        userId: authResult.userId,
        ...(projectId && { projectId }),
        ...(phaseId && { phaseId }),
        ...(status && { status: status as any }),
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            emoji: true,
            color: true,
          },
        },
        phase: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/venued/tasks - Create a new task
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      projectId,
      phaseId,
      title,
      description,
      priority,
      dueDate,
      points,
      tags,
    } = body

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      )
    }

    // Verify project belongs to user
    const project = await prisma.venuedProject.findFirst({
      where: {
        id: projectId,
        userId: authResult.userId,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const task = await prisma.venuedTask.create({
      data: {
        userId: authResult.userId,
        projectId,
        phaseId,
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        points: points || 10,
        tags: tags || [],
      },
      include: {
        project: true,
        phase: true,
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
