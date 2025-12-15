import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuth } from '../../../../lib/auth-middleware'

// GET /api/venued/stats - Get user stats
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create stats
    let stats = await prisma.venuedStats.findUnique({
      where: { userId: authResult.userId },
    })

    if (!stats) {
      stats = await prisma.venuedStats.create({
        data: {
          userId: authResult.userId,
          totalPoints: 0,
          level: 1,
          tasksCompleted: 0,
          focusMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
      })
    }

    // Get additional stats
    const [projectCount, taskStats, recentTasks] = await Promise.all([
      prisma.venuedProject.count({
        where: { userId: authResult.userId, archived: false },
      }),
      prisma.venuedTask.groupBy({
        by: ['completed'],
        where: { userId: authResult.userId },
        _count: true,
      }),
      prisma.venuedTask.findMany({
        where: { userId: authResult.userId, completed: true },
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          completedAt: true,
          timeSpent: true,
        },
      }),
    ])

    const totalTasks = taskStats.reduce((sum, s) => sum + s._count, 0)
    const completedTasks = taskStats.find(s => s.completed)?._count || 0
    const pendingTasks = taskStats.find(s => !s.completed)?._count || 0

    return NextResponse.json({
      stats: {
        ...stats,
        projectCount,
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      recentCompletedTasks: recentTasks,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/venued/stats - Update stats (for focus time tracking)
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { focusMinutes } = body

    const stats = await prisma.venuedStats.upsert({
      where: { userId: authResult.userId },
      create: {
        userId: authResult.userId,
        focusMinutes: focusMinutes || 0,
      },
      update: {
        ...(focusMinutes && { focusMinutes: { increment: focusMinutes } }),
        lastActiveAt: new Date(),
      },
    })

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Update stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
