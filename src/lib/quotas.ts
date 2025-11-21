import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export type QuotaFeature =
  | 'supernovaMessages'
  | 'emailSubscribers'
  | 'socialPostsScheduled'
  | 'contentVideosRepurposed'
  | 'aiImagesGenerated'
  | 'aiVideosGenerated'
  | 'storageUsedBytes'
  | 'coursesHosted'
  | 'productsListed'

interface QuotaCheckResult {
  allowed: boolean
  currentUsage: number
  limit: number
  remaining: number
  percentage: number
  message?: string
}

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Get or create usage tracking record for current month
 */
async function getOrCreateUsageTracking(userId: string) {
  const month = getCurrentMonth()

  let usage = await prisma.usageTracking.findUnique({
    where: {
      userId_month: {
        userId,
        month,
      },
    },
  })

  if (!usage) {
    usage = await prisma.usageTracking.create({
      data: {
        userId,
        month,
      },
    })
  }

  return usage
}

/**
 * Get tier quota limit for a specific feature
 */
async function getTierLimit(tier: UserRole, feature: QuotaFeature): Promise<number> {
  const quota = await prisma.tierQuota.findUnique({
    where: {
      tier_feature: {
        tier: tier as string,
        feature,
      },
    },
  })

  return quota?.monthlyLimit ?? -1 // -1 means unlimited
}

/**
 * Check if user has quota available for a feature
 */
export async function checkQuota(
  userId: string,
  feature: QuotaFeature,
  amount: number = 1
): Promise<QuotaCheckResult> {
  // Get user's role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    return {
      allowed: false,
      currentUsage: 0,
      limit: 0,
      remaining: 0,
      percentage: 100,
      message: 'User not found',
    }
  }

  // ADMIN has unlimited access
  if (user.role === 'ADMIN') {
    return {
      allowed: true,
      currentUsage: 0,
      limit: -1,
      remaining: -1,
      percentage: 0,
      message: 'Unlimited access (ADMIN)',
    }
  }

  // Get tier limit
  const limit = await getTierLimit(user.role, feature)

  // -1 means unlimited
  if (limit === -1) {
    return {
      allowed: true,
      currentUsage: 0,
      limit: -1,
      remaining: -1,
      percentage: 0,
      message: 'Unlimited access',
    }
  }

  // 0 means no access
  if (limit === 0) {
    return {
      allowed: false,
      currentUsage: 0,
      limit: 0,
      remaining: 0,
      percentage: 100,
      message: `This feature is not available on your ${user.role} plan. Please upgrade to access this feature.`,
    }
  }

  // Get current usage
  const usage = await getOrCreateUsageTracking(userId)
  const currentUsage = usage[feature] as number

  // Check if adding the amount would exceed limit
  const newUsage = currentUsage + amount
  const allowed = newUsage <= limit
  const remaining = Math.max(0, limit - currentUsage)
  const percentage = Math.round((currentUsage / limit) * 100)

  let message: string | undefined
  if (!allowed) {
    message = `You've reached your monthly limit of ${limit} ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}. Upgrade your plan to increase your limits.`
  } else if (percentage >= 90) {
    message = `You've used ${percentage}% of your monthly quota. Consider upgrading for higher limits.`
  }

  return {
    allowed,
    currentUsage,
    limit,
    remaining,
    percentage,
    message,
  }
}

/**
 * Increment usage for a feature
 */
export async function incrementUsage(
  userId: string,
  feature: QuotaFeature,
  amount: number = 1
): Promise<void> {
  const usage = await getOrCreateUsageTracking(userId)

  await prisma.usageTracking.update({
    where: { id: usage.id },
    data: {
      [feature]: {
        increment: amount,
      },
    },
  })
}

/**
 * Get current usage for all features
 */
export async function getCurrentUsage(userId: string) {
  const usage = await getOrCreateUsageTracking(userId)

  // Get user's role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get all tier quotas for this user's tier
  const tierQuotas = await prisma.tierQuota.findMany({
    where: { tier: user.role as string },
  })

  const quotaMap: Record<string, number> = {}
  tierQuotas.forEach((quota) => {
    quotaMap[quota.feature] = quota.monthlyLimit
  })

  return {
    month: usage.month,
    usage: {
      supernovaMessages: {
        current: usage.supernovaMessages,
        limit: quotaMap['supernovaMessages'] ?? 0,
        percentage: calculatePercentage(usage.supernovaMessages, quotaMap['supernovaMessages']),
      },
      emailSubscribers: {
        current: usage.emailSubscribers,
        limit: quotaMap['emailSubscribers'] ?? 0,
        percentage: calculatePercentage(usage.emailSubscribers, quotaMap['emailSubscribers']),
      },
      socialPostsScheduled: {
        current: usage.socialPostsScheduled,
        limit: quotaMap['socialPostsScheduled'] ?? 0,
        percentage: calculatePercentage(usage.socialPostsScheduled, quotaMap['socialPostsScheduled']),
      },
      contentVideosRepurposed: {
        current: usage.contentVideosRepurposed,
        limit: quotaMap['contentVideosRepurposed'] ?? 0,
        percentage: calculatePercentage(
          usage.contentVideosRepurposed,
          quotaMap['contentVideosRepurposed']
        ),
      },
      aiImagesGenerated: {
        current: usage.aiImagesGenerated,
        limit: quotaMap['aiImagesGenerated'] ?? 0,
        percentage: calculatePercentage(usage.aiImagesGenerated, quotaMap['aiImagesGenerated']),
      },
      aiVideosGenerated: {
        current: usage.aiVideosGenerated,
        limit: quotaMap['aiVideosGenerated'] ?? 0,
        percentage: calculatePercentage(usage.aiVideosGenerated, quotaMap['aiVideosGenerated']),
      },
      storageUsedBytes: {
        current: Number(usage.storageUsedBytes),
        limit: quotaMap['storageUsedBytes'] ?? 0,
        percentage: calculatePercentage(Number(usage.storageUsedBytes), quotaMap['storageUsedBytes']),
      },
      coursesHosted: {
        current: usage.coursesHosted,
        limit: quotaMap['coursesHosted'] ?? 0,
        percentage: calculatePercentage(usage.coursesHosted, quotaMap['coursesHosted']),
      },
      productsListed: {
        current: usage.productsListed,
        limit: quotaMap['productsListed'] ?? 0,
        percentage: calculatePercentage(usage.productsListed, quotaMap['productsListed']),
      },
    },
    userRole: user.role,
  }
}

/**
 * Calculate percentage (0-100), return 0 for unlimited (-1)
 */
function calculatePercentage(current: number, limit: number): number {
  if (limit === -1) return 0 // Unlimited
  if (limit === 0) return 100 // No access
  return Math.min(100, Math.round((current / limit) * 100))
}

/**
 * Reset monthly usage for all users (to be run on 1st of each month)
 */
export async function resetMonthlyUsage(): Promise<void> {
  // This would typically be run as a cron job
  // For now, we just create new records for the new month
  // Old records are kept for historical tracking
  console.log('Monthly usage reset completed for new month')
}

/**
 * Get usage statistics for admin
 */
export async function getAdminUsageStats() {
  const currentMonth = getCurrentMonth()

  // Get all usage for current month
  const allUsage = await prisma.usageTracking.findMany({
    where: { month: currentMonth },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  })

  // Calculate totals
  const totals = {
    totalUsers: allUsage.length,
    supernovaMessages: allUsage.reduce((sum, u) => sum + u.supernovaMessages, 0),
    emailSubscribers: allUsage.reduce((sum, u) => sum + u.emailSubscribers, 0),
    socialPostsScheduled: allUsage.reduce((sum, u) => sum + u.socialPostsScheduled, 0),
    contentVideosRepurposed: allUsage.reduce((sum, u) => sum + u.contentVideosRepurposed, 0),
    aiImagesGenerated: allUsage.reduce((sum, u) => sum + u.aiImagesGenerated, 0),
    aiVideosGenerated: allUsage.reduce((sum, u) => sum + u.aiVideosGenerated, 0),
    storageUsedBytes: allUsage.reduce((sum, u) => sum + Number(u.storageUsedBytes), 0),
  }

  // Group by tier
  const byTier = {
    FREE: allUsage.filter((u) => u.user.role === 'FREE').length,
    UPGRADE: allUsage.filter((u) => u.user.role === 'UPGRADE').length,
    MEMBER: allUsage.filter((u) => u.user.role === 'MEMBER').length,
    ADMIN: allUsage.filter((u) => u.user.role === 'ADMIN').length,
  }

  // Top users by SUPERNova usage
  const topUsers = allUsage
    .sort((a, b) => b.supernovaMessages - a.supernovaMessages)
    .slice(0, 10)
    .map((u) => ({
      email: u.user.email,
      role: u.user.role,
      supernovaMessages: u.supernovaMessages,
    }))

  return {
    month: currentMonth,
    totals,
    byTier,
    topUsers,
  }
}
