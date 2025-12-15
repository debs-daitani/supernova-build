import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verifyAuth } from '../../../../lib/auth-middleware'

// GET /api/venued/entourage - Get all ADHD tool data
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tool = searchParams.get('tool') // time-tracking, hyperfocus, energy, brain-dump, dopamine
    const limit = parseInt(searchParams.get('limit') || '50')

    const userId = authResult.userId

    // Fetch based on tool type or all
    const data: Record<string, unknown> = {}

    if (!tool || tool === 'time-tracking') {
      data.timeTracking = await prisma.venuedTimeTracking.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: limit,
      })
    }

    if (!tool || tool === 'hyperfocus') {
      data.hyperfocus = await prisma.venuedHyperfocus.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: limit,
      })
    }

    if (!tool || tool === 'energy') {
      data.energyLogs = await prisma.venuedEnergyLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      })
    }

    if (!tool || tool === 'brain-dump') {
      data.brainDumps = await prisma.venuedBrainDump.findMany({
        where: { userId, archived: false },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
    }

    if (!tool || tool === 'dopamine') {
      data.dopamineRewards = await prisma.venuedDopamineReward.findMany({
        where: { userId },
        orderBy: { usageCount: 'desc' },
        take: limit,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get entourage data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/venued/entourage - Create ADHD tool entry
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { tool, ...data } = body

    if (!tool) {
      return NextResponse.json({ error: 'Tool type is required' }, { status: 400 })
    }

    const userId = authResult.userId
    let result

    switch (tool) {
      case 'time-tracking':
        result = await prisma.venuedTimeTracking.create({
          data: {
            userId,
            taskName: data.taskName,
            taskType: data.taskType,
            taskId: data.taskId,
            estimatedMins: data.estimatedMins || 0,
            actualMins: data.actualMins || 0,
            date: data.date ? new Date(data.date) : new Date(),
            energyLevel: data.energyLevel?.toUpperCase() || 'MEDIUM',
          },
        })
        break

      case 'hyperfocus':
        result = await prisma.venuedHyperfocus.create({
          data: {
            userId,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            durationMins: data.durationMins,
            trigger: data.trigger,
            taskType: data.taskType,
            taskName: data.taskName,
            productivityRating: data.productivityRating,
            notes: data.notes,
          },
        })
        break

      case 'energy':
        result = await prisma.venuedEnergyLog.create({
          data: {
            userId,
            level: data.level?.toUpperCase() || 'MEDIUM',
            notes: data.notes,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          },
        })
        break

      case 'brain-dump':
        result = await prisma.venuedBrainDump.create({
          data: {
            userId,
            content: data.content,
            tags: data.tags || [],
          },
        })
        break

      case 'dopamine':
        result = await prisma.venuedDopamineReward.create({
          data: {
            userId,
            reward: data.reward,
            category: data.category?.toUpperCase() || 'OTHER',
            motivationRating: data.motivationRating,
          },
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid tool type' }, { status: 400 })
    }

    return NextResponse.json({ [tool]: result }, { status: 201 })
  } catch (error) {
    console.error('Create entourage entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/venued/entourage - Update ADHD tool entry
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { tool, id, ...data } = body

    if (!tool || !id) {
      return NextResponse.json({ error: 'Tool type and ID are required' }, { status: 400 })
    }

    let result

    switch (tool) {
      case 'brain-dump':
        result = await prisma.venuedBrainDump.update({
          where: { id },
          data: {
            ...(data.content !== undefined && { content: data.content }),
            ...(data.converted !== undefined && { converted: data.converted }),
            ...(data.convertedTaskId !== undefined && { convertedTaskId: data.convertedTaskId }),
            ...(data.archived !== undefined && { archived: data.archived }),
            ...(data.tags !== undefined && { tags: data.tags }),
          },
        })
        break

      case 'dopamine':
        result = await prisma.venuedDopamineReward.update({
          where: { id },
          data: {
            ...(data.reward !== undefined && { reward: data.reward }),
            ...(data.category !== undefined && { category: data.category.toUpperCase() }),
            ...(data.usageCount !== undefined && { usageCount: data.usageCount }),
            ...(data.motivationRating !== undefined && { motivationRating: data.motivationRating }),
          },
        })
        // Increment usage if used
        if (data.used) {
          await prisma.venuedDopamineReward.update({
            where: { id },
            data: { usageCount: { increment: 1 } },
          })
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid tool type for update' }, { status: 400 })
    }

    return NextResponse.json({ [tool]: result })
  } catch (error) {
    console.error('Update entourage entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/venued/entourage - Delete ADHD tool entry
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tool = searchParams.get('tool')
    const id = searchParams.get('id')

    if (!tool || !id) {
      return NextResponse.json({ error: 'Tool type and ID are required' }, { status: 400 })
    }

    switch (tool) {
      case 'time-tracking':
        await prisma.venuedTimeTracking.delete({ where: { id } })
        break
      case 'hyperfocus':
        await prisma.venuedHyperfocus.delete({ where: { id } })
        break
      case 'energy':
        await prisma.venuedEnergyLog.delete({ where: { id } })
        break
      case 'brain-dump':
        await prisma.venuedBrainDump.delete({ where: { id } })
        break
      case 'dopamine':
        await prisma.venuedDopamineReward.delete({ where: { id } })
        break
      default:
        return NextResponse.json({ error: 'Invalid tool type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete entourage entry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
