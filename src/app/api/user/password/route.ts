import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validatePassword, hashPassword, verifyPassword } from '@/lib/password'

// PUT /api/user/password - Change user password
export async function PUT(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'user_1'

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    if (user.passwordHash) {
      const isValid = await verifyPassword(currentPassword, user.passwordHash)
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
    }

    // Validate new password
    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'New password does not meet requirements', errors: validation.errors },
        { status: 400 }
      )
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    })

    // TODO: Send confirmation email
    // TODO: Invalidate all sessions except current

    return NextResponse.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
