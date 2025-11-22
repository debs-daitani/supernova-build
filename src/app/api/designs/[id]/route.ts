import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/designs/[id] - Get design
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const design = await db.userDesign.findUnique({
      where: { id: params.id },
      include: {
        template: true,
      },
    })

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 })
    }

    return NextResponse.json(design)
  } catch (error) {
    console.error('Error fetching design:', error)
    return NextResponse.json({ error: 'Failed to fetch design' }, { status: 500 })
  }
}

// PUT /api/designs/[id] - Update design
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const design = await db.userDesign.update({
      where: { id: params.id },
      data: {
        ...body,
        lastEditedAt: new Date(),
      },
    })

    return NextResponse.json(design)
  } catch (error) {
    console.error('Error updating design:', error)
    return NextResponse.json({ error: 'Failed to update design' }, { status: 500 })
  }
}

// DELETE /api/designs/[id] - Delete design
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.userDesign.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting design:', error)
    return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 })
  }
}
