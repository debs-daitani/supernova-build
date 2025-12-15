import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyAuth } from '../../../../../lib/auth-middleware'

// GET /api/venued/projects/[id] - Get a specific project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.venuedProject.findFirst({
      where: {
        id: id,
        userId: authResult.userId,
      },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        goals: {
          orderBy: { targetDate: 'asc' },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/venued/projects/[id] - Update a project
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, emoji, color, status, archived } = body

    const project = await prisma.venuedProject.updateMany({
      where: {
        id: id,
        userId: authResult.userId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(emoji !== undefined && { emoji }),
        ...(color !== undefined && { color }),
        ...(status !== undefined && { status }),
        ...(archived !== undefined && { archived }),
      },
    })

    if (project.count === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const updatedProject = await prisma.venuedProject.findUnique({
      where: { id: id },
      include: {
        phases: true,
        tasks: true,
        goals: true,
      },
    })

    return NextResponse.json({ project: updatedProject })
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/venued/projects/[id] - Delete a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await prisma.venuedProject.deleteMany({
      where: {
        id: id,
        userId: authResult.userId,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
