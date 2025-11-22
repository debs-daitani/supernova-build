import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/pages/reorder - Reorder pages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pages } = body // Array of { id, order }

    // Update all pages in a transaction
    await db.$transaction(
      pages.map((page: { id: string; order: number }) =>
        db.websitePage.update({
          where: { id: page.id },
          data: { order: page.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering pages:', error)
    return NextResponse.json(
      { error: 'Failed to reorder pages' },
      { status: 500 }
    )
  }
}
