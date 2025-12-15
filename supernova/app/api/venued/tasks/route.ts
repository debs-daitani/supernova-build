import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuth } from '../../../../lib/auth-middleware'

// GET /api/venued/tasks - Get all tasks for user
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const phaseId = searchParams.get('phaseId')
    const completed = searchParams.get('completed')
    const scheduledDate = searchParams.get('scheduledDate')
    const energyLevel = searchParams.get('energyLevel')

    const tasks = await prisma.venuedTask.findMany({
      where: {
        userId: authResult.userId,
        ...(projectId && { projectId }),
        ...(phaseId && { phaseId }),
        ...(completed !== null && { completed: completed === 'true' }),
        ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
        ...(energyLevel && { energyLevel: energyLevel.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
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
        { completed: 'asc' },
        { scheduledDate: 'asc' },
        { order: 'asc' },
      ],
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      energyLevel,
      estimatedMins,
      difficulty,
      isHyperfocus,
      isQuickWin,
      dependencies,
      scheduledDate,
      scheduledTime,
      order,
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
    }

    // If projectId provided, verify ownership
    if (projectId) {
      const project = await prisma.venuedProject.findFirst({
        where: { id: projectId, userId: authResult.userId },
      })
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
    }

    const task = await prisma.venuedTask.create({
      data: {
        userId: authResult.userId,
        projectId,
        phaseId,
        title,
        description,
        energyLevel: energyLevel?.toUpperCase() || 'MEDIUM',
        estimatedMins,
        difficulty: difficulty?.toUpperCase() || 'MEDIUM',
        isHyperfocus: isHyperfocus || false,
        isQuickWin: isQuickWin || false,
        dependencies: dependencies || [],
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime,
        order: order || 0,
      },
      include: {
        project: true,
        phase: true,
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
