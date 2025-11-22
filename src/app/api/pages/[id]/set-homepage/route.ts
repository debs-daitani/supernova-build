import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/pages/[id]/set-homepage - Set a page as homepage
export async function POST(
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

    // Unset current homepage
    await db.websitePage.updateMany({
      where: {
        websiteId: page.websiteId,
        isHomepage: true,
      },
      data: {
        isHomepage: false,
      },
    })

    // Set new homepage
    const updatedPage = await db.websitePage.update({
      where: { id: params.id },
      data: {
        isHomepage: true,
      },
    })

    return NextResponse.json(updatedPage)
  } catch (error) {
    console.error('Error setting homepage:', error)
    return NextResponse.json(
      { error: 'Failed to set homepage' },
      { status: 500 }
    )
  }
}
