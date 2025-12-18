import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/marketing/pages - List landing pages
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = { userId: auth.userId }
    if (status && status !== 'all') {
      where.status = status
    }

    const pages = await prisma.landingPage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { leadMagnets: true }
        }
      }
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching landing pages:', error)
    return NextResponse.json({ error: 'Failed to fetch landing pages' }, { status: 500 })
  }
}

// POST /api/marketing/pages - Create landing page
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, template, content, settings } = body

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
    }

    // Check if slug is unique
    const existing = await prisma.landingPage.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const page = await prisma.landingPage.create({
      data: {
        userId: auth.userId,
        title,
        slug,
        template,
        content: content || { blocks: [] },
        settings,
      }
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Error creating landing page:', error)
    return NextResponse.json({ error: 'Failed to create landing page' }, { status: 500 })
  }
}
