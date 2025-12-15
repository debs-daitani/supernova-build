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
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
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
          orderBy: { order: 'asc' },
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    const { projectId, name, description, color, order } = body

    if (!projectId || !name) {
      return NextResponse.json({ error: 'Project ID and name are required' }, { status: 400 })
    }

    // Verify project belongs to user
    const project = await prisma.venuedProject.findFirst({
      where: { id: projectId, userId: authResult.userId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get next order number if not provided
    let phaseOrder = order
    if (phaseOrder === undefined) {
      const lastPhase = await prisma.venuedPhase.findFirst({
        where: { projectId },
        orderBy: { order: 'desc' },
      })
      phaseOrder = (lastPhase?.order || 0) + 1
    }

    const phase = await prisma.venuedPhase.create({
      data: {
        projectId,
        name,
        description,
        color: color || '#00F0E9',
        order: phaseOrder,
      },
      include: {
        tasks: true,
      },
    })

    return NextResponse.json({ phase }, { status: 201 })
  } catch (error) {
    console.error('Create phase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/venued/phases - Update phase order (bulk)
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { phases } = body // Array of { id, order }

    if (!phases || !Array.isArray(phases)) {
      return NextResponse.json({ error: 'Phases array is required' }, { status: 400 })
    }

    // Update each phase order
    await Promise.all(
      phases.map((phase: { id: string; order: number }) =>
        prisma.venuedPhase.update({
          where: { id: phase.id },
          data: { order: phase.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update phases error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/venued/phases - Delete a phase (via query param)
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const phaseId = searchParams.get('id')

    if (!phaseId) {
      return NextResponse.json({ error: 'Phase ID is required' }, { status: 400 })
    }

    // Verify ownership through project
    const phase = await prisma.venuedPhase.findFirst({
      where: { id: phaseId },
      include: {
        project: {
          select: { userId: true },
        },
      },
    })

    if (!phase || phase.project.userId !== authResult.userId) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 })
    }

    await prisma.venuedPhase.delete({ where: { id: phaseId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete phase error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
