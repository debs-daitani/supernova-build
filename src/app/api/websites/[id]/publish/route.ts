import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/websites/[id]/publish - Publish a website
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const website = await db.website.update({
      where: { id: params.id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    })

    // TODO: Trigger build/deploy process
    // - Generate static HTML from page content JSON
    // - Upload to CDN
    // - Update DNS/routing

    return NextResponse.json(website)
  } catch (error) {
    console.error('Error publishing website:', error)
    return NextResponse.json(
      { error: 'Failed to publish website' },
      { status: 500 }
    )
  }
}
