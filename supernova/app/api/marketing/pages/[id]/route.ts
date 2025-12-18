import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/marketing/pages/[id] - Get single landing page
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const page = await prisma.landingPage.findFirst({
      where: { id, userId: auth.userId },
      include: { leadMagnets: true }
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
  }
}

// PUT /api/marketing/pages/[id] - Update landing page
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.landingPage.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const { title, slug, template, content, settings, status } = body

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.landingPage.findUnique({
        where: { slug }
      })
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    const page = await prisma.landingPage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(template !== undefined && { template }),
        ...(content !== undefined && { content }),
        ...(settings !== undefined && { settings }),
        ...(status !== undefined && {
          status,
          publishedAt: status === 'published' && !existing.publishedAt ? new Date() : existing.publishedAt
        }),
      }
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error updating landing page:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

// DELETE /api/marketing/pages/[id] - Delete landing page
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const existing = await prisma.landingPage.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    await prisma.landingPage.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting landing page:', error)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
