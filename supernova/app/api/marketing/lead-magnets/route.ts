import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/marketing/lead-magnets - List lead magnets
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leadMagnets = await prisma.leadMagnet.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        landingPage: {
          select: { id: true, title: true, slug: true }
        }
      }
    })

    return NextResponse.json(leadMagnets)
  } catch (error) {
    console.error('Error fetching lead magnets:', error)
    return NextResponse.json({ error: 'Failed to fetch lead magnets' }, { status: 500 })
  }
}

// POST /api/marketing/lead-magnets - Create lead magnet
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, fileUrl, fileName, landingPageId } = body

    if (!title || !fileUrl || !fileName) {
      return NextResponse.json({ error: 'Title, file URL, and file name are required' }, { status: 400 })
    }

    const leadMagnet = await prisma.leadMagnet.create({
      data: {
        userId: auth.userId,
        title,
        description,
        fileUrl,
        fileName,
        landingPageId,
      }
    })

    return NextResponse.json(leadMagnet, { status: 201 })
  } catch (error) {
    console.error('Error creating lead magnet:', error)
    return NextResponse.json({ error: 'Failed to create lead magnet' }, { status: 500 })
  }
}
