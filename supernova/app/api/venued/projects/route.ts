import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuth } from '../../../../lib/auth-middleware'

// GET /api/venued/projects - Get all projects for user
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const includeArchived = searchParams.get('includeArchived') === 'true'
    const status = searchParams.get('status')

    const projects = await prisma.venuedProject.findMany({
      where: {
        userId: authResult.userId,
        ...(includeArchived ? {} : { archived: false }),
        ...(status ? { status: status.toUpperCase() as 'PLANNING' | 'LIVE' | 'COMPLETE' } : {}),
      },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
        tasks: true,
        _count: {
          select: {
            tasks: true,
            phases: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Calculate stats for each project
    const projectsWithStats = projects.map(project => {
      const totalTasks = project.tasks.length
      const completedTasks = project.tasks.filter(t => t.completed).length
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return {
        ...project,
        tasksTotal: totalTasks,
        tasksCompleted: completedTasks,
        progress,
      }
    })

    return NextResponse.json({ projects: projectsWithStats })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/venued/projects - Create a new project
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, status, startDate, targetDate, priority, tags, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const project = await prisma.venuedProject.create({
      data: {
        userId: authResult.userId,
        name,
        description,
        status: status?.toUpperCase() || 'PLANNING',
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        priority: priority?.toUpperCase() || 'MEDIUM',
        tags: tags || [],
        color: color || '#FF008E',
      },
      include: {
        phases: true,
        tasks: true,
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
