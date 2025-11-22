import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

// GET /api/pages?websiteId=xxx - List all pages for a website
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json(
        { error: 'websiteId is required' },
        { status: 400 }
      )
    }

    const pages = await db.websitePage.findMany({
      where: { websiteId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { websiteId, title, slug, content = [] } = body

    // Auto-generate slug if not provided
    const pageSlug = slug || generateSlug(title)

    // Check if slug already exists for this website
    const existing = await db.websitePage.findFirst({
      where: {
        websiteId,
        slug: pageSlug,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Page with this slug already exists' },
        { status: 400 }
      )
    }

    // Get max order
    const maxOrderPage = await db.websitePage.findFirst({
      where: { websiteId },
      orderBy: { order: 'desc' },
    })

    const order = (maxOrderPage?.order || 0) + 1

    const page = await db.websitePage.create({
      data: {
        websiteId,
        title,
        slug: pageSlug,
        content,
        order,
      },
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Error creating page:', error)
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    )
  }
}
