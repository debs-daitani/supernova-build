import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuth } from '../../../../lib/auth-middleware'

// GET /api/venued/projects - Get all projects for a user
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const includeArchived = searchParams.get('includeArchived') === 'true'

    const projects = await prisma.venuedProject.findMany({
      where: {
        userId: authResult.userId,
        ...(includeArchived ? {} : { archived: false }),
      },
      include: {
        phases: {
          orderBy: { order: 'asc' },
        },
        tasks: {
          where: { status: { not: 'COMPLETED' } },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        goals: {
          where: { completedAt: null },
          take: 3,
        },
        _count: {
          select: {
            tasks: true,
            phases: true,
            goals: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/venued/projects - Create a new project
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description, emoji, color, status } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Project title is required' },
        { status: 400 }
      )
    }

    const project = await prisma.venuedProject.create({
      data: {
        userId: authResult.userId,
        title,
        description,
        emoji: emoji || '🎸',
        color: color || '#FF008E',
        status: status || 'BACKSTAGE',
      },
      include: {
        phases: true,
        tasks: true,
        goals: true,
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
