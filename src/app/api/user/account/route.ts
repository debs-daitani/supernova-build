import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/user/account - Get account information
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        username: true,
        timezone: true,
        language: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 })
  }
}

// PUT /api/user/account - Update account settings
export async function PUT(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const body = await request.json()
    const { timezone, language } = body

    const user = await db.user.update({
      where: { id: userId },
      data: {
        timezone: timezone || undefined,
        language: language || undefined,
      },
      select: {
        id: true,
        timezone: true,
        language: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

// DELETE /api/user/account - Delete user account (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const body = await request.json()
    const { password, confirmation } = body

    if (confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Please type DELETE to confirm account deletion' },
        { status: 400 }
      )
    }

    // TODO: Verify password
    // const user = await db.user.findUnique({ where: { id: userId } })
    // const isValid = await verifyPassword(password, user.passwordHash)
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
    // }

    // Soft delete (set deletedAt timestamp)
    const deletedUser = await db.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        // Optionally anonymize data
        email: `deleted_${userId}@deleted.com`,
        firstName: null,
        lastName: null,
        profilePhotoUrl: null,
        bio: null,
      },
    })

    // TODO: Send confirmation email
    // TODO: Schedule permanent deletion after 30 days
    // TODO: Log out user from all sessions

    return NextResponse.json({
      message: 'Account scheduled for deletion',
      deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
