import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/pages/[id] - Get a specific page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await db.websitePage.findUnique({
      where: { id: params.id },
      include: {
        website: true,
      },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}

// PATCH /api/pages/[id] - Update a page
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const page = await db.websitePage.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    )
  }
}

// DELETE /api/pages/[id] - Delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await db.websitePage.findUnique({
      where: { id: params.id },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Don't allow deleting homepage
    if (page.isHomepage) {
      return NextResponse.json(
        { error: 'Cannot delete homepage' },
        { status: 400 }
      )
    }

    await db.websitePage.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    )
  }
}
