import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-middleware'

// GET /api/crm/analytics - Get CRM analytics
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Total contacts by status
    const contactsByStatus = await prisma.contact.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    // Total contacts by source
    const contactsBySource = await prisma.contact.groupBy({
      by: ['source'],
      _count: {
        id: true,
      },
    })

    // Deals by stage with total value
    const dealsByStage = await prisma.deal.groupBy({
      by: ['stage'],
      _count: {
        id: true,
      },
      _sum: {
        value: true,
      },
    })

    // Total pipeline value
    const pipelineValue = await prisma.deal.aggregate({
      where: {
        stage: {
          in: ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'],
        },
      },
      _sum: {
        value: true,
      },
    })

    // Won deals this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const wonThisMonth = await prisma.deal.aggregate({
      where: {
        stage: 'WON',
        actualCloseDate: {
          gte: startOfMonth,
        },
      },
      _sum: {
        value: true,
      },
      _count: {
        id: true,
      },
    })

    // Conversion rate (won / total closed)
    const totalClosed = await prisma.deal.count({
      where: {
        stage: {
          in: ['WON', 'LOST'],
        },
      },
    })

    const wonCount = await prisma.deal.count({
      where: {
        stage: 'WON',
      },
    })

    const conversionRate = totalClosed > 0 ? (wonCount / totalClosed) * 100 : 0

    // Activities summary
    const activitiesCount = await prisma.activity.count()

    const activitiesByType = await prisma.activity.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    })

    // Tasks summary
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    })

    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      _count: {
        id: true,
      },
    })

    // Overdue tasks
    const overdueTasks = await prisma.task.count({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
        dueDate: {
          lt: new Date(),
        },
      },
    })

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentContacts = await prisma.contact.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const recentDeals = await prisma.deal.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    return NextResponse.json({
      contacts: {
        total: await prisma.contact.count(),
        byStatus: contactsByStatus,
        bySource: contactsBySource,
        recent: recentContacts,
      },
      deals: {
        total: await prisma.deal.count(),
        byStage: dealsByStage,
        pipelineValue: pipelineValue._sum.value || 0,
        wonThisMonth: {
          count: wonThisMonth._count.id,
          value: wonThisMonth._sum.value || 0,
        },
        conversionRate: Math.round(conversionRate * 100) / 100,
        recent: recentDeals,
      },
      activities: {
        total: activitiesCount,
        byType: activitiesByType,
      },
      tasks: {
        total: await prisma.task.count(),
        byStatus: tasksByStatus,
        byPriority: tasksByPriority,
        overdue: overdueTasks,
      },
    })
  } catch (error) {
    console.error('Error fetching CRM analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
