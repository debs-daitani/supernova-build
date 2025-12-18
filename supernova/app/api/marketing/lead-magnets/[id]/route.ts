import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/marketing/lead-magnets/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const leadMagnet = await prisma.leadMagnet.findFirst({
      where: { id, userId: auth.userId },
      include: { landingPage: true }
    })

    if (!leadMagnet) {
      return NextResponse.json({ error: 'Lead magnet not found' }, { status: 404 })
    }

    return NextResponse.json(leadMagnet)
  } catch (error) {
    console.error('Error fetching lead magnet:', error)
    return NextResponse.json({ error: 'Failed to fetch lead magnet' }, { status: 500 })
  }
}

// PUT /api/marketing/lead-magnets/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const existing = await prisma.leadMagnet.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Lead magnet not found' }, { status: 404 })
    }

    const { title, description, fileUrl, fileName, landingPageId } = body

    const leadMagnet = await prisma.leadMagnet.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(fileName !== undefined && { fileName }),
        ...(landingPageId !== undefined && { landingPageId }),
      }
    })

    return NextResponse.json(leadMagnet)
  } catch (error) {
    console.error('Error updating lead magnet:', error)
    return NextResponse.json({ error: 'Failed to update lead magnet' }, { status: 500 })
  }
}

// DELETE /api/marketing/lead-magnets/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const existing = await prisma.leadMagnet.findFirst({
      where: { id, userId: auth.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Lead magnet not found' }, { status: 404 })
    }

    await prisma.leadMagnet.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lead magnet:', error)
    return NextResponse.json({ error: 'Failed to delete lead magnet' }, { status: 500 })
  }
}

// POST /api/marketing/lead-magnets/[id]/download - Track download
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const leadMagnet = await prisma.leadMagnet.findUnique({
      where: { id }
    })

    if (!leadMagnet) {
      return NextResponse.json({ error: 'Lead magnet not found' }, { status: 404 })
    }

    await prisma.leadMagnet.update({
      where: { id },
      data: { downloads: { increment: 1 } }
    })

    return NextResponse.json({ fileUrl: leadMagnet.fileUrl })
  } catch (error) {
    console.error('Error tracking download:', error)
    return NextResponse.json({ error: 'Failed to track download' }, { status: 500 })
  }
}
