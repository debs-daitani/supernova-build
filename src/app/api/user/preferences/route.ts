import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/user/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    let preferences = await db.userPreferences.findUnique({
      where: { userId },
    })

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await db.userPreferences.create({
        data: { userId },
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const body = await request.json()

    // Upsert preferences
    const preferences = await db.userPreferences.upsert({
      where: { userId },
      update: body,
      create: {
        userId,
        ...body,
      },
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
