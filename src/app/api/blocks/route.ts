import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/blocks - List all blocks (user's + public)
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {
      OR: [{ userId }, { isPublic: true }],
    }

    if (category) {
      where.category = category
    }

    const blocks = await db.websiteBlock.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(blocks)
  } catch (error) {
    console.error('Error fetching blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocks' },
      { status: 500 }
    )
  }
}

// POST /api/blocks - Create a new block
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const body = await request.json()

    const block = await db.websiteBlock.create({
      data: {
        ...body,
        userId,
      },
    })

    return NextResponse.json(block, { status: 201 })
  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json(
      { error: 'Failed to create block' },
      { status: 500 }
    )
  }
}
