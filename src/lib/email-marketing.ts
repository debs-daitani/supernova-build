import { prisma } from './prisma'

// Tier-based subscriber limits
export const SUBSCRIBER_LIMITS = {
  FREE: 0,
  UPGRADE: 300,   // BRAVE
  MEMBER: 1000,   // BOLD
  ADMIN: Infinity, // BADASS - unlimited
}

/**
 * Check if user can add more subscribers based on their tier
 */
export async function canAddSubscribers(userId: string, count: number = 1): Promise<{ allowed: boolean; current: number; limit: number; message?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    return { allowed: false, current: 0, limit: 0, message: 'User not found' }
  }

  const limit = SUBSCRIBER_LIMITS[user.role]

  const current = await prisma.emailSubscriber.count({
    where: { userId, status: 'SUBSCRIBED' },
  })

  if (current + count > limit) {
    return {
      allowed: false,
      current,
      limit,
      message: `You've reached your subscriber limit (${current}/${limit}). Upgrade your plan to add more subscribers.`,
    }
  }

  return { allowed: true, current, limit }
}

/**
 * Add a single subscriber
 */
export async function addSubscriber(
  userId: string,
  data: {
    email: string
    firstName?: string
    lastName?: string
    tags?: string[]
    source?: 'MANUAL' | 'IMPORT' | 'FORM' | 'API'
  }
) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    throw new Error('Invalid email format')
  }

  // Check quota
  const quota = await canAddSubscribers(userId, 1)
  if (!quota.allowed) {
    throw new Error(quota.message || 'Subscriber limit reached')
  }

  // Check for duplicate
  const existing = await prisma.emailSubscriber.findUnique({
    where: {
      userId_email: {
        userId,
        email: data.email,
      },
    },
  })

  if (existing) {
    if (existing.status === 'UNSUBSCRIBED') {
      // Resubscribe
      return await prisma.emailSubscriber.update({
        where: { id: existing.id },
        data: {
          status: 'SUBSCRIBED',
          subscribedAt: new Date(),
          unsubscribedAt: null,
          firstName: data.firstName || existing.firstName,
          lastName: data.lastName || existing.lastName,
          tags: data.tags || existing.tags,
        },
      })
    }
    throw new Error('Subscriber already exists')
  }

  // Create new subscriber
  return await prisma.emailSubscriber.create({
    data: {
      userId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      tags: data.tags || [],
      source: data.source || 'MANUAL',
      status: 'SUBSCRIBED',
    },
  })
}

/**
 * Import subscribers from CSV data
 */
export async function importSubscribers(
  userId: string,
  subscribers: Array<{
    email: string
    firstName?: string
    lastName?: string
    tags?: string[]
  }>
) {
  const results = {
    total: subscribers.length,
    added: 0,
    skipped: 0,
    errors: [] as string[],
  }

  // Check quota for all subscribers
  const quota = await canAddSubscribers(userId, subscribers.length)
  if (!quota.allowed) {
    throw new Error(quota.message || 'Subscriber limit reached')
  }

  for (const sub of subscribers) {
    try {
      await addSubscriber(userId, { ...sub, source: 'IMPORT' })
      results.added++
    } catch (error) {
      results.skipped++
      results.errors.push(`${sub.email}: ${(error as Error).message}`)
    }
  }

  return results
}

/**
 * Update subscriber tags
 */
export async function updateSubscriberTags(
  subscriberId: string,
  tags: string[],
  action: 'add' | 'remove' | 'replace'
) {
  const subscriber = await prisma.emailSubscriber.findUnique({
    where: { id: subscriberId },
  })

  if (!subscriber) {
    throw new Error('Subscriber not found')
  }

  let newTags: string[]

  if (action === 'replace') {
    newTags = tags
  } else if (action === 'add') {
    newTags = [...new Set([...subscriber.tags, ...tags])]
  } else {
    newTags = subscriber.tags.filter((t) => !tags.includes(t))
  }

  return await prisma.emailSubscriber.update({
    where: { id: subscriberId },
    data: { tags: newTags },
  })
}

/**
 * Unsubscribe a subscriber
 */
export async function unsubscribeSubscriber(subscriberId: string) {
  return await prisma.emailSubscriber.update({
    where: { id: subscriberId },
    data: {
      status: 'UNSUBSCRIBED',
      unsubscribedAt: new Date(),
    },
  })
}

/**
 * Create a new email campaign
 */
export async function createCampaign(
  userId: string,
  data: {
    name: string
    subject: string
    previewText?: string
    htmlContent: string
    textContent?: string
    fromName: string
    fromEmail: string
    replyTo?: string
  }
) {
  return await prisma.emailCampaign.create({
    data: {
      userId,
      ...data,
      status: 'DRAFT',
    },
  })
}

/**
 * Get campaign recipients based on filters
 */
export async function getCampaignRecipients(
  userId: string,
  filter: {
    all?: boolean
    tags?: string[]
    subscriberIds?: string[]
  }
) {
  const where: any = {
    userId,
    status: 'SUBSCRIBED',
  }

  if (filter.subscriberIds && filter.subscriberIds.length > 0) {
    where.id = { in: filter.subscriberIds }
  } else if (filter.tags && filter.tags.length > 0) {
    where.tags = { hasSome: filter.tags }
  }

  return await prisma.emailSubscriber.findMany({ where })
}

/**
 * Schedule or send a campaign
 */
export async function scheduleCampaign(
  campaignId: string,
  options: {
    scheduledFor?: Date
    recipientFilter: {
      all?: boolean
      tags?: string[]
      subscriberIds?: string[]
    }
  }
) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  // Get recipients
  const recipients = await getCampaignRecipients(campaign.userId, options.recipientFilter)

  // Create recipient records
  await prisma.emailCampaignRecipient.createMany({
    data: recipients.map((r) => ({
      campaignId,
      subscriberId: r.id,
      status: 'PENDING',
    })),
    skipDuplicates: true,
  })

  // Update campaign
  const updateData: any = {
    totalRecipients: recipients.length,
  }

  if (options.scheduledFor) {
    updateData.status = 'SCHEDULED'
    updateData.scheduledFor = options.scheduledFor
  } else {
    updateData.status = 'SENDING'
  }

  return await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: updateData,
  })
}

/**
 * Replace template variables in content
 */
export function replaceTemplateVariables(
  content: string,
  variables: {
    firstName?: string
    lastName?: string
    email?: string
    unsubscribeUrl?: string
    [key: string]: string | undefined
  }
) {
  let result = content

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value || '')
  })

  return result
}

/**
 * Generate tracking pixel URL for opens
 */
export function generateTrackingPixel(campaignId: string, recipientId: string): string {
  return `/api/email/track/open/${campaignId}/${recipientId}`
}

/**
 * Generate tracking URL for clicks
 */
export function generateTrackingUrl(
  campaignId: string,
  recipientId: string,
  originalUrl: string
): string {
  const encoded = encodeURIComponent(originalUrl)
  return `/api/email/track/click/${campaignId}/${recipientId}?url=${encoded}`
}

/**
 * Track email open
 */
export async function trackEmailOpen(campaignId: string, recipientId: string) {
  const recipient = await prisma.emailCampaignRecipient.findUnique({
    where: { id: recipientId },
  })

  if (!recipient) return

  const isFirstOpen = recipient.status === 'SENT'

  await prisma.emailCampaignRecipient.update({
    where: { id: recipientId },
    data: {
      status: isFirstOpen ? 'OPENED' : recipient.status,
      openedAt: isFirstOpen ? new Date() : recipient.openedAt,
      openCount: { increment: 1 },
    },
  })

  if (isFirstOpen) {
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { openedCount: { increment: 1 } },
    })
  }
}

/**
 * Track email click
 */
export async function trackEmailClick(
  campaignId: string,
  recipientId: string,
  userAgent?: string
) {
  const recipient = await prisma.emailCampaignRecipient.findUnique({
    where: { id: recipientId },
  })

  if (!recipient) return

  const isFirstClick = recipient.status !== 'CLICKED'

  await prisma.emailCampaignRecipient.update({
    where: { id: recipientId },
    data: {
      status: 'CLICKED',
      clickedAt: isFirstClick ? new Date() : recipient.clickedAt,
      clickCount: { increment: 1 },
      userAgent: userAgent || recipient.userAgent,
    },
  })

  if (isFirstClick) {
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { clickedCount: { increment: 1 } },
    })
  }
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      recipients: {
        include: {
          subscriber: true,
        },
      },
    },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  const total = campaign.totalRecipients
  const openRate = total > 0 ? (campaign.openedCount / total) * 100 : 0
  const clickRate = total > 0 ? (campaign.clickedCount / total) * 100 : 0
  const bounceRate = total > 0 ? (campaign.bouncedCount / total) * 100 : 0

  return {
    campaign: {
      id: campaign.id,
      name: campaign.name,
      subject: campaign.subject,
      status: campaign.status,
      sentAt: campaign.sentAt,
    },
    stats: {
      totalRecipients: total,
      sentCount: campaign.sentCount,
      openedCount: campaign.openedCount,
      clickedCount: campaign.clickedCount,
      bouncedCount: campaign.bouncedCount,
      openRate: Math.round(openRate * 10) / 10,
      clickRate: Math.round(clickRate * 10) / 10,
      bounceRate: Math.round(bounceRate * 10) / 10,
    },
    recipients: campaign.recipients,
  }
}

/**
 * Export subscribers to CSV format
 */
export function exportSubscribersToCSV(
  subscribers: Array<{
    email: string
    firstName: string | null
    lastName: string | null
    status: string
    tags: string[]
    subscribedAt: Date
  }>
): string {
  const headers = ['Email', 'First Name', 'Last Name', 'Status', 'Tags', 'Subscribed At']
  const rows = subscribers.map((sub) => [
    sub.email,
    sub.firstName || '',
    sub.lastName || '',
    sub.status,
    sub.tags.join('; '),
    sub.subscribedAt.toISOString().split('T')[0],
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}
