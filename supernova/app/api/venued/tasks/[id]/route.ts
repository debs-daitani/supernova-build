import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyAuth } from '../../../../../lib/auth-middleware'

// GET /api/venued/tasks/[id] - Get single task
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.venuedTask.findFirst({
      where: { id, userId: authResult.userId },
      include: {
        project: true,
        phase: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT/PATCH /api/venued/tasks/[id] - Update a task
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description,
      energyLevel,
      estimatedMins,
      difficulty,
      isHyperfocus,
      isQuickWin,
      dependencies,
      completed,
      scheduledDate,
      scheduledTime,
      timeSpent,
      phaseId,
      projectId,
      order,
    } = body

    // Check ownership
    const currentTask = await prisma.venuedTask.findFirst({
      where: { id, userId: authResult.userId },
    })

    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if completing the task
    const isCompleting = completed === true && !currentTask.completed

    const task = await prisma.venuedTask.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(energyLevel !== undefined && { energyLevel: energyLevel.toUpperCase() }),
        ...(estimatedMins !== undefined && { estimatedMins }),
        ...(difficulty !== undefined && { difficulty: difficulty.toUpperCase() }),
        ...(isHyperfocus !== undefined && { isHyperfocus }),
        ...(isQuickWin !== undefined && { isQuickWin }),
        ...(dependencies !== undefined && { dependencies }),
        ...(completed !== undefined && { completed }),
        ...(isCompleting && { completedAt: new Date() }),
        ...(scheduledDate !== undefined && { scheduledDate: scheduledDate ? new Date(scheduledDate) : null }),
        ...(scheduledTime !== undefined && { scheduledTime }),
        ...(timeSpent !== undefined && { timeSpent }),
        ...(phaseId !== undefined && { phaseId }),
        ...(projectId !== undefined && { projectId }),
        ...(order !== undefined && { order }),
      },
      include: {
        project: true,
        phase: true,
      },
    })

    // Update stats if completing
    if (isCompleting) {
      await prisma.venuedStats.upsert({
        where: { userId: authResult.userId },
        create: {
          userId: authResult.userId,
          totalPoints: 10,
          tasksCompleted: 1,
          focusMinutes: currentTask.timeSpent || 0,
          level: 1,
          currentStreak: 1,
          longestStreak: 1,
        },
        update: {
          totalPoints: { increment: 10 },
          tasksCompleted: { increment: 1 },
          focusMinutes: { increment: currentTask.timeSpent || 0 },
          lastActiveAt: new Date(),
        },
      })

      // Update streak logic
      const stats = await prisma.venuedStats.findUnique({
        where: { userId: authResult.userId },
      })

      if (stats) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const lastActive = new Date(stats.lastActiveAt)
        lastActive.setHours(0, 0, 0, 0)

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        let newStreak = stats.currentStreak
        if (lastActive.getTime() === yesterday.getTime()) {
          newStreak = stats.currentStreak + 1
        } else if (lastActive.getTime() < yesterday.getTime()) {
          newStreak = 1
        }

        await prisma.venuedStats.update({
          where: { userId: authResult.userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, stats.longestStreak),
            level: Math.floor((stats.totalPoints + 10) / 100) + 1,
          },
        })
      }
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params })
}

// DELETE /api/venued/tasks/[id] - Delete a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existing = await prisma.venuedTask.findFirst({
      where: { id, userId: authResult.userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.venuedTask.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
