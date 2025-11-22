import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/user/theme - Update user theme preference
export async function PUT(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const body = await request.json()
    const { theme } = body

    if (!theme || !['LIGHT', 'DARK', 'SYSTEM'].includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme value' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { theme },
      select: { id: true, theme: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating theme:', error)
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 })
  }
}
