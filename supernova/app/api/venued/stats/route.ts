import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuth } from '../../../../lib/auth-middleware'

// GET /api/venued/stats - Get user stats and achievements
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await prisma.venuedStats.findUnique({
      where: { userId: authResult.userId },
    })

    const achievements = await prisma.venuedAchievement.findMany({
      where: { userId: authResult.userId },
      orderBy: { earnedAt: 'desc' },
    })

    // If no stats exist, create default
    const userStats = stats || {
      id: '',
      userId: authResult.userId,
      totalPoints: 0,
      level: 1,
      tasksCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievements: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastTaskDate: null,
    }

    return NextResponse.json({
      stats: userStats,
      achievements,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
