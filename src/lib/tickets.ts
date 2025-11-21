import { prisma } from '@/lib/prisma'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
export type TicketCategory = 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG' | 'OTHER'

/**
 * SLA response times by tier (in hours)
 */
export const SLA_TIMES = {
  FREE: 72, // 72 hours
  UPGRADE: 48, // 48 hours (BRAVE)
  MEMBER: 24, // 24 hours (BOLD)
  ADMIN: 4, // 4 hours (BADASS - not a user tier but for completeness)
}

/**
 * Keywords that trigger URGENT priority
 */
const URGENT_KEYWORDS = [
  'down',
  'broken',
  'cant login',
  "can't login",
  'cannot login',
  'not working',
  'emergency',
  'urgent',
  'critical',
  'blocked',
  'lost access',
]

/**
 * Calculate ticket priority based on user tier, category, and content
 */
export function calculatePriority(
  userTier: string,
  category: TicketCategory,
  subject: string,
  description: string
): TicketPriority {
  const content = `${subject} ${description}`.toLowerCase()

  // Check for urgent keywords
  const hasUrgentKeyword = URGENT_KEYWORDS.some((keyword) => content.includes(keyword))

  // BADASS tier (ADMIN in our case) or urgent keywords
  if (userTier === 'ADMIN' || hasUrgentKeyword) {
    return 'URGENT'
  }

  // BOLD tier (MEMBER) or bug reports
  if (userTier === 'MEMBER' || category === 'BUG') {
    return 'HIGH'
  }

  // BRAVE tier (UPGRADE) or feature requests
  if (userTier === 'UPGRADE' || category === 'FEATURE_REQUEST') {
    return 'NORMAL'
  }

  // FREE tier general questions
  return 'LOW'
}

/**
 * Get SLA response time for a user tier (in hours)
 */
export function getSLATime(userTier: string): number {
  return SLA_TIMES[userTier as keyof typeof SLA_TIMES] || SLA_TIMES.FREE
}

/**
 * Check if ticket is overdue based on SLA
 */
export function isTicketOverdue(ticket: {
  createdAt: Date
  firstResponseAt: Date | null
  status: string
  user: { role: string }
}): boolean {
  // If already responded or closed, not overdue
  if (ticket.firstResponseAt || ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
    return false
  }

  const slaHours = getSLATime(ticket.user.role)
  const slaMilliseconds = slaHours * 60 * 60 * 1000
  const elapsedTime = Date.now() - ticket.createdAt.getTime()

  return elapsedTime > slaMilliseconds
}

/**
 * Get urgency color based on time remaining
 */
export function getUrgencyColor(ticket: {
  createdAt: Date
  firstResponseAt: Date | null
  status: string
  user: { role: string }
}): 'green' | 'amber' | 'red' {
  if (ticket.firstResponseAt || ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
    return 'green'
  }

  const slaHours = getSLATime(ticket.user.role)
  const slaMilliseconds = slaHours * 60 * 60 * 1000
  const elapsedTime = Date.now() - ticket.createdAt.getTime()
  const percentageElapsed = (elapsedTime / slaMilliseconds) * 100

  if (percentageElapsed >= 100) return 'red' // Overdue
  if (percentageElapsed >= 80) return 'amber' // 80% of SLA time used
  return 'green' // Still within good time
}

/**
 * Calculate average response time in hours
 */
export function calculateResponseTime(createdAt: Date, firstResponseAt: Date | null): number | null {
  if (!firstResponseAt) return null

  const diffMs = firstResponseAt.getTime() - createdAt.getTime()
  return diffMs / (1000 * 60 * 60) // Convert to hours
}

/**
 * Auto-assign ticket to an admin using round-robin
 */
export async function autoAssignTicket(ticketId: string): Promise<string | null> {
  try {
    // Get all ADMIN users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    if (admins.length === 0) {
      return null // No admins available
    }

    // Count tickets per admin
    const adminWorkload = await Promise.all(
      admins.map(async (admin) => {
        const openTickets = await prisma.supportTicket.count({
          where: {
            assignedToAdminId: admin.id,
            status: {
              in: ['OPEN', 'IN_PROGRESS', 'WAITING_USER'],
            },
          },
        })

        return { adminId: admin.id, openTickets }
      })
    )

    // Find admin with least open tickets
    const leastBusyAdmin = adminWorkload.reduce((min, current) =>
      current.openTickets < min.openTickets ? current : min
    )

    // Assign ticket
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        assignedToAdminId: leastBusyAdmin.adminId,
        status: 'IN_PROGRESS',
      },
    })

    return leastBusyAdmin.adminId
  } catch (error) {
    console.error('Error auto-assigning ticket:', error)
    return null
  }
}

/**
 * Get ticket statistics for dashboard
 */
export async function getTicketStats(adminId?: string) {
  const where = adminId ? { assignedToAdminId: adminId } : {}

  const [total, open, inProgress, waitingUser, resolved, closed, urgent, overdue] =
    await Promise.all([
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.count({ where: { ...where, status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.supportTicket.count({ where: { ...where, status: 'WAITING_USER' } }),
      prisma.supportTicket.count({ where: { ...where, status: 'RESOLVED' } }),
      prisma.supportTicket.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.supportTicket.count({ where: { ...where, priority: 'URGENT' } }),
      // Overdue tickets (no first response and past SLA)
      prisma.supportTicket.count({
        where: {
          ...where,
          firstResponseAt: null,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
    ])

  return {
    total,
    byStatus: {
      open,
      inProgress,
      waitingUser,
      resolved,
      closed,
    },
    urgent,
    overdue,
  }
}

/**
 * Get average response time by tier
 */
export async function getAverageResponseTimeByTier() {
  const tickets = await prisma.supportTicket.findMany({
    where: {
      firstResponseAt: { not: null },
    },
    select: {
      createdAt: true,
      firstResponseAt: true,
      user: {
        select: { role: true },
      },
    },
  })

  const responseTimesByTier: Record<string, number[]> = {
    FREE: [],
    UPGRADE: [],
    MEMBER: [],
    ADMIN: [],
  }

  tickets.forEach((ticket) => {
    if (ticket.firstResponseAt) {
      const responseTime = calculateResponseTime(ticket.createdAt, ticket.firstResponseAt)
      if (responseTime !== null) {
        responseTimesByTier[ticket.user.role].push(responseTime)
      }
    }
  })

  const averages: Record<string, number> = {}

  Object.keys(responseTimesByTier).forEach((tier) => {
    const times = responseTimesByTier[tier]
    if (times.length > 0) {
      const sum = times.reduce((a, b) => a + b, 0)
      averages[tier] = sum / times.length
    } else {
      averages[tier] = 0
    }
  })

  return averages
}

/**
 * Get ticket count by category
 */
export async function getTicketsByCategory() {
  const tickets = await prisma.supportTicket.groupBy({
    by: ['category'],
    _count: { category: true },
  })

  return tickets.map((item) => ({
    category: item.category,
    count: item._count.category,
  }))
}

/**
 * Get admin workload statistics
 */
export async function getAdminWorkload() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  const workload = await Promise.all(
    admins.map(async (admin) => {
      const [total, open, resolved] = await Promise.all([
        prisma.supportTicket.count({
          where: { assignedToAdminId: admin.id },
        }),
        prisma.supportTicket.count({
          where: {
            assignedToAdminId: admin.id,
            status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_USER'] },
          },
        }),
        prisma.supportTicket.count({
          where: {
            assignedToAdminId: admin.id,
            status: 'RESOLVED',
          },
        }),
      ])

      return {
        adminId: admin.id,
        email: admin.email,
        name: admin.profile
          ? `${admin.profile.firstName || ''} ${admin.profile.lastName || ''}`.trim()
          : admin.email,
        total,
        open,
        resolved,
      }
    })
  )

  return workload
}

/**
 * Search tickets by keyword
 */
export async function searchTickets(query: string, userId?: string) {
  const where: any = {
    OR: [
      { subject: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
  }

  if (userId) {
    where.userId = userId
  }

  return await prisma.supportTicket.findMany({
    where,
    include: {
      user: {
        select: {
          email: true,
          role: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      assignedAdmin: {
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

/**
 * Close inactive resolved tickets
 */
export async function autoCloseInactiveTickets() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const closedTickets = await prisma.supportTicket.updateMany({
    where: {
      status: 'RESOLVED',
      resolvedAt: { lt: sevenDaysAgo },
    },
    data: {
      status: 'CLOSED',
      closedAt: new Date(),
    },
  })

  return closedTickets.count
}

/**
 * Escalate high priority tickets with no response
 */
export async function escalateOverdueTickets() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const escalated = await prisma.supportTicket.updateMany({
    where: {
      priority: 'HIGH',
      firstResponseAt: null,
      status: { in: ['OPEN', 'IN_PROGRESS'] },
      createdAt: { lt: twentyFourHoursAgo },
    },
    data: {
      priority: 'URGENT',
    },
  })

  return escalated.count
}
