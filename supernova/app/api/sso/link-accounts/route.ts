import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '../../../../lib/auth-middleware'
import { prisma } from '../../../../lib/prisma'

/**
 * POST /api/sso/link-accounts
 *
 * Link accounts across the dAItaniverse ecosystem
 *
 * NOTE: Currently, SUPERNova and VENUED share the same User table,
 * so there's no need for explicit account linking. This endpoint
 * exists for:
 * 1. Future expansion to other apps with separate user tables
 * 2. Documenting the SSO architecture
 * 3. Potential external integrations
 *
 * Request body:
 * {
 *   "targetApp": "venued" | "supernova" | "other",
 *   "targetUserId": string (optional - for manual linking)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { targetApp, targetUserId } = body

    if (!targetApp) {
      return NextResponse.json(
        { error: 'targetApp is required' },
        { status: 400 }
      )
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Since SUPERNova and VENUED share the same User table,
    // accounts are automatically linked
    if (targetApp === 'venued' || targetApp === 'supernova') {
      // Initialize VENUED stats if they don't exist
      await prisma.venuedStats.upsert({
        where: { userId: authResult.userId },
        create: {
          userId: authResult.userId,
          totalPoints: 0,
          level: 1,
          tasksCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
        update: {}, // No update needed if already exists
      })

      return NextResponse.json({
        success: true,
        message: 'Accounts are already linked (shared user system)',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        linkedApps: ['supernova', 'venued'],
      })
    }

    // For future external apps, implement linking logic here
    // Example:
    // if (targetApp === 'external-app') {
    //   await prisma.appConnection.create({
    //     data: {
    //       supernovaUserId: authResult.userId,
    //       externalUserId: targetUserId,
    //       appName: targetApp,
    //       linked: true,
    //     },
    //   })
    // }

    return NextResponse.json({
      success: false,
      message: `Account linking for ${targetApp} is not yet implemented`,
    }, { status: 501 })
  } catch (error) {
    console.error('Link accounts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/sso/link-accounts
 *
 * Unlink accounts across applications
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const targetApp = searchParams.get('targetApp')

    if (!targetApp) {
      return NextResponse.json(
        { error: 'targetApp query parameter is required' },
        { status: 400 }
      )
    }

    // Since SUPERNova and VENUED share the same User table,
    // true account unlinking isn't possible without data loss
    // Instead, you could archive/disable VENUED data
    if (targetApp === 'venued') {
      // Archive all VENUED projects instead of unlinking
      await prisma.venuedProject.updateMany({
        where: { userId: authResult.userId },
        data: { archived: true },
      })

      return NextResponse.json({
        success: true,
        message: 'VENUED data archived (accounts still linked)',
        note: 'To fully disconnect, delete your account',
      })
    }

    return NextResponse.json({
      success: false,
      message: `Account unlinking for ${targetApp} is not yet implemented`,
    }, { status: 501 })
  } catch (error) {
    console.error('Unlink accounts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
