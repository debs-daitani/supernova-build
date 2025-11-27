import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { verifyAuth } from '../../../../../lib/auth-middleware'

// PATCH /api/venued/tasks/[id] - Update a task
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      phaseId,
      points,
      tags,
    } = body

    // Handle task completion - award points and update stats
    const currentTask = await prisma.venuedTask.findFirst({
      where: { id: params.id, userId: authResult.userId },
    })

    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const isCompleting =
      status === 'COMPLETED' && currentTask.status !== 'COMPLETED'

    const task = await prisma.venuedTask.updateMany({
      where: {
        id: params.id,
        userId: authResult.userId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(phaseId !== undefined && { phaseId }),
        ...(points !== undefined && { points }),
        ...(tags !== undefined && { tags }),
        ...(isCompleting && { completedAt: new Date() }),
      },
    })

    if (task.count === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Award points if completing
    if (isCompleting) {
      const stats = await prisma.venuedStats.upsert({
        where: { userId: authResult.userId },
        create: {
          userId: authResult.userId,
          totalPoints: currentTask.points,
          tasksCompleted: 1,
          level: 1,
          currentStreak: 1,
          longestStreak: 1,
          lastTaskDate: new Date(),
        },
        update: {
          totalPoints: { increment: currentTask.points },
          tasksCompleted: { increment: 1 },
          lastTaskDate: new Date(),
        },
      })

      // Calculate streak
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      const lastTaskDate = stats.lastTaskDate
        ? new Date(stats.lastTaskDate)
        : null
      if (lastTaskDate) {
        lastTaskDate.setHours(0, 0, 0, 0)
      }

      let newStreak = stats.currentStreak
      if (
        lastTaskDate &&
        lastTaskDate.getTime() === yesterday.getTime()
      ) {
        newStreak = stats.currentStreak + 1
      } else if (
        !lastTaskDate ||
        lastTaskDate.getTime() < yesterday.getTime()
      ) {
        newStreak = 1
      }

      await prisma.venuedStats.update({
        where: { userId: authResult.userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, stats.longestStreak),
          level: Math.floor(stats.totalPoints / 100) + 1,
        },
      })
    }

    const updatedTask = await prisma.venuedTask.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        phase: true,
      },
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/venued/tasks/[id] - Delete a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await prisma.venuedTask.deleteMany({
      where: {
        id: params.id,
        userId: authResult.userId,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
