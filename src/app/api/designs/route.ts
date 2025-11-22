import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/designs - List user's designs
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const designs = await db.userDesign.findMany({
      where: { userId },
      orderBy: { lastEditedAt: 'desc' },
      include: {
        template: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    })

    return NextResponse.json(designs)
  } catch (error) {
    console.error('Error fetching designs:', error)
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 })
  }
}

// POST /api/designs - Create new design
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const body = await request.json()
    const { name, templateId, width, height, jsonData, category } = body

    const design = await db.userDesign.create({
      data: {
        userId,
        name,
        templateId: templateId || null,
        width: width || 1080,
        height: height || 1080,
        jsonData: jsonData || {},
        category,
      },
    })

    return NextResponse.json(design, { status: 201 })
  } catch (error) {
    console.error('Error creating design:', error)
    return NextResponse.json({ error: 'Failed to create design' }, { status: 500 })
  }
}
