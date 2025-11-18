import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// PATCH - Update memory importance or content
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { importanceScore, content } = body

    const updated = await prisma.userMemory.updateMany({
      where: {
        id: params.id,
        userId: session.userId,
      },
      data: {
        ...(importanceScore !== undefined && { importanceScore }),
        ...(content !== undefined && { content }),
      },
    })

    if (updated.count === 0) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update memory error:', error)
    return NextResponse.json(
      { error: 'Failed to update memory' },
      { status: 500 }
    )
  }
}

// DELETE - Delete memory
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deleted = await prisma.userMemory.deleteMany({
      where: {
        id: params.id,
        userId: session.userId,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete memory error:', error)
    return NextResponse.json(
      { error: 'Failed to delete memory' },
      { status: 500 }
    )
  }
}
