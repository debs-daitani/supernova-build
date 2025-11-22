import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/websites/[id] - Get a specific website
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const website = await db.website.findUnique({
      where: { id: params.id },
      include: {
        pages: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(website)
  } catch (error) {
    console.error('Error fetching website:', error)
    return NextResponse.json(
      { error: 'Failed to fetch website' },
      { status: 500 }
    )
  }
}

// PATCH /api/websites/[id] - Update a website
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const website = await db.website.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(website)
  } catch (error) {
    console.error('Error updating website:', error)
    return NextResponse.json(
      { error: 'Failed to update website' },
      { status: 500 }
    )
  }
}

// DELETE /api/websites/[id] - Delete a website
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.website.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting website:', error)
    return NextResponse.json(
      { error: 'Failed to delete website' },
      { status: 500 }
    )
  }
}
