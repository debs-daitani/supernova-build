import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '../../../../lib/auth-middleware'
import { prisma } from '../../../../lib/prisma'

/**
 * GET /api/sso/status
 *
 * Check the current user's SSO connection status
 * Returns information about connected applications and user data
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        subscriptionTier: true,
        subscriptionStatus: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has any VENUED data (indicates they've used VENUED)
    const venuedProjectCount = await prisma.venuedProject.count({
      where: { userId: authResult.userId },
    })

    const venuedTaskCount = await prisma.venuedTask.count({
      where: { userId: authResult.userId },
    })

    const venuedStats = await prisma.venuedStats.findUnique({
      where: { userId: authResult.userId },
    })

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        subscription: {
          tier: user.subscriptionTier,
          status: user.subscriptionStatus,
        },
      },
      connectedApps: [
        {
          name: 'SUPERNova AI',
          status: 'active',
          url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
        },
        {
          name: 'VENUED',
          status: venuedProjectCount > 0 || venuedTaskCount > 0 ? 'active' : 'available',
          url: process.env.VENUED_URL || 'http://localhost:3000',
          stats: venuedStats ? {
            projects: venuedProjectCount,
            tasks: venuedTaskCount,
            points: venuedStats.totalPoints,
            level: venuedStats.level,
          } : null,
        },
      ],
    })
  } catch (error) {
    console.error('SSO status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
