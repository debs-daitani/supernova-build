import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/brand-kit - Get user's brand kit
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    let brandKit = await db.brandKit.findUnique({
      where: { userId },
    })

    // Create default if doesn't exist
    if (!brandKit) {
      brandKit = await db.brandKit.create({
        data: {
          userId,
          colors: ['#ec4899', '#8b5cf6', '#f59e0b'],
        },
      })
    }

    return NextResponse.json(brandKit)
  } catch (error) {
    console.error('Error fetching brand kit:', error)
    return NextResponse.json({ error: 'Failed to fetch brand kit' }, { status: 500 })
  }
}

// PUT /api/brand-kit - Update brand kit
export async function PUT(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const body = await request.json()

    const brandKit = await db.brandKit.upsert({
      where: { userId },
      update: body,
      create: {
        userId,
        ...body,
      },
    })

    return NextResponse.json(brandKit)
  } catch (error) {
    console.error('Error updating brand kit:', error)
    return NextResponse.json({ error: 'Failed to update brand kit' }, { status: 500 })
  }
}
