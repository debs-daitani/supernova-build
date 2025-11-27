import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuth } from '../../../../lib/auth-middleware'

// GET /api/venued/phases - Get phases for a project
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Verify project belongs to user
    const project = await prisma.venuedProject.findFirst({
      where: { id: projectId, userId: authResult.userId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const phases = await prisma.venuedPhase.findMany({
      where: { projectId },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ phases })
  } catch (error) {
    console.error('Get phases error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/venued/phases - Create a new phase
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, name, color, startDate, endDate } = body

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'Project ID and name are required' },
        { status: 400 }
      )
    }

    // Verify project belongs to user
    const project = await prisma.venuedProject.findFirst({
      where: { id: projectId, userId: authResult.userId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get next order number
    const lastPhase = await prisma.venuedPhase.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
    })

    const phase = await prisma.venuedPhase.create({
      data: {
        projectId,
        name,
        color: color || '#00F0E9',
        order: (lastPhase?.order || 0) + 1,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        tasks: true,
      },
    })

    return NextResponse.json({ phase }, { status: 201 })
  } catch (error) {
    console.error('Create phase error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
