import { prisma } from './prisma'

// Tier-based limits for social media
export const SOCIAL_LIMITS = {
  FREE: {
    platforms: 0,
    postsPerMonth: 0,
  },
  UPGRADE: {
    platforms: 1, // BRAVE - 1 platform
    postsPerMonth: 20,
  },
  MEMBER: {
    platforms: Infinity, // BOLD - all platforms
    postsPerMonth: 60,
  },
  ADMIN: {
    platforms: Infinity, // BADASS - unlimited
    postsPerMonth: Infinity,
  },
}

// Character limits per platform
export const CHARACTER_LIMITS = {
  TWITTER: 280,
  LINKEDIN: 3000,
  INSTAGRAM: 2200,
  FACEBOOK: 63206,
  TIKTOK: 2200,
}

// Platform display names and colors
export const PLATFORM_CONFIG = {
  TWITTER: {
    name: 'Twitter / X',
    color: 'bg-black text-white',
    icon: 'Twitter',
  },
  LINKEDIN: {
    name: 'LinkedIn',
    color: 'bg-blue-600 text-white',
    icon: 'Linkedin',
  },
  INSTAGRAM: {
    name: 'Instagram',
    color: 'bg-gradient-to-br from-purple-600 to-pink-600 text-white',
    icon: 'Instagram',
  },
  FACEBOOK: {
    name: 'Facebook',
    color: 'bg-blue-500 text-white',
    icon: 'Facebook',
  },
  TIKTOK: {
    name: 'TikTok',
    color: 'bg-black text-white',
    icon: 'Music',
  },
}

/**
 * Check if user can connect more platforms
 */
export async function canConnectPlatform(userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  message?: string
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    return { allowed: false, current: 0, limit: 0, message: 'User not found' }
  }

  const limit = SOCIAL_LIMITS[user.role].platforms

  const current = await prisma.socialPlatform.count({
    where: { userId, isConnected: true },
  })

  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      message: `You've reached your platform limit (${current}/${limit}). Upgrade to connect more platforms.`,
    }
  }

  return { allowed: true, current, limit }
}

/**
 * Check if user can schedule more posts this month
 */
export async function canSchedulePost(userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  message?: string
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    return { allowed: false, current: 0, limit: 0, message: 'User not found' }
  }

  const limit = SOCIAL_LIMITS[user.role].postsPerMonth

  // Count posts scheduled/published this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const current = await prisma.socialPost.count({
    where: {
      userId,
      status: { in: ['SCHEDULED', 'PUBLISHING', 'PUBLISHED'] },
      createdAt: { gte: startOfMonth },
    },
  })

  if (current >= limit) {
    return {
      allowed: false,
      current,
      limit,
      message: `You've reached your monthly post limit (${current}/${limit}). Upgrade to schedule more posts.`,
    }
  }

  return { allowed: true, current, limit }
}

/**
 * Create or update a social platform connection
 */
export async function connectPlatform(
  userId: string,
  platform: 'TWITTER' | 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK',
  data: {
    accessToken: string
    refreshToken?: string
    tokenExpiresAt?: Date
    platformUserId: string
    platformUsername: string
  }
) {
  // Check quota
  const quota = await canConnectPlatform(userId)
  const existing = await prisma.socialPlatform.findUnique({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
  })

  // If connecting new platform and quota exceeded
  if (!existing && !quota.allowed) {
    throw new Error(quota.message || 'Platform limit reached')
  }

  return await prisma.socialPlatform.upsert({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
    create: {
      userId,
      platform,
      isConnected: true,
      accessToken: data.accessToken, // TODO: Encrypt in production
      refreshToken: data.refreshToken,
      tokenExpiresAt: data.tokenExpiresAt,
      platformUserId: data.platformUserId,
      platformUsername: data.platformUsername,
      connectedAt: new Date(),
    },
    update: {
      isConnected: true,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExpiresAt: data.tokenExpiresAt,
      platformUserId: data.platformUserId,
      platformUsername: data.platformUsername,
      connectedAt: new Date(),
    },
  })
}

/**
 * Disconnect a platform
 */
export async function disconnectPlatform(userId: string, platformId: string) {
  return await prisma.socialPlatform.update({
    where: { id: platformId, userId },
    data: {
      isConnected: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
    },
  })
}

/**
 * Get user's connected platforms
 */
export async function getConnectedPlatforms(userId: string) {
  return await prisma.socialPlatform.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Create a new social post
 */
export async function createSocialPost(
  userId: string,
  data: {
    content: string
    mediaUrls?: string[]
    platforms: string[]
    scheduledFor?: Date
  }
) {
  // Check quota
  if (data.scheduledFor || data.scheduledFor === undefined) {
    const quota = await canSchedulePost(userId)
    if (!quota.allowed) {
      throw new Error(quota.message || 'Post limit reached')
    }
  }

  // Validate platforms are connected
  const connectedPlatforms = await prisma.socialPlatform.findMany({
    where: {
      userId,
      platform: { in: data.platforms as any[] },
      isConnected: true,
    },
  })

  if (connectedPlatforms.length !== data.platforms.length) {
    throw new Error('One or more selected platforms are not connected')
  }

  // Determine status
  const status = data.scheduledFor ? 'SCHEDULED' : 'DRAFT'

  // Create post
  const post = await prisma.socialPost.create({
    data: {
      userId,
      content: data.content,
      mediaUrls: data.mediaUrls || [],
      platforms: data.platforms,
      status,
      scheduledFor: data.scheduledFor,
    },
  })

  // Create platform posts
  for (const platformData of connectedPlatforms) {
    await prisma.socialPostPlatform.create({
      data: {
        socialPostId: post.id,
        platformId: platformData.id,
        platform: platformData.platform,
        status: status === 'DRAFT' ? 'DRAFT' : 'DRAFT', // Will be updated when published
      },
    })
  }

  // Add to queue if scheduled
  if (data.scheduledFor) {
    await prisma.socialMediaQueue.create({
      data: {
        userId,
        socialPostId: post.id,
        scheduledFor: data.scheduledFor,
        status: 'PENDING',
      },
    })
  }

  return post
}

/**
 * Update a social post (only if draft or scheduled)
 */
export async function updateSocialPost(
  postId: string,
  userId: string,
  data: {
    content?: string
    mediaUrls?: string[]
    platforms?: string[]
    scheduledFor?: Date
    status?: 'DRAFT' | 'SCHEDULED'
  }
) {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId, userId },
  })

  if (!post) {
    throw new Error('Post not found')
  }

  if (post.status !== 'DRAFT' && post.status !== 'SCHEDULED') {
    throw new Error('Cannot edit published or failed posts')
  }

  return await prisma.socialPost.update({
    where: { id: postId },
    data: {
      ...data,
      platforms: data.platforms || post.platforms,
    },
  })
}

/**
 * Delete a social post (only if draft or scheduled)
 */
export async function deleteSocialPost(postId: string, userId: string) {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId, userId },
  })

  if (!post) {
    throw new Error('Post not found')
  }

  if (post.status !== 'DRAFT' && post.status !== 'SCHEDULED') {
    throw new Error('Cannot delete published posts')
  }

  // Delete queue items, platform posts, and post
  await prisma.socialMediaQueue.deleteMany({
    where: { socialPostId: postId },
  })

  await prisma.socialPostPlatform.deleteMany({
    where: { socialPostId: postId },
  })

  return await prisma.socialPost.delete({
    where: { id: postId },
  })
}

/**
 * Duplicate a social post
 */
export async function duplicateSocialPost(postId: string, userId: string) {
  const original = await prisma.socialPost.findUnique({
    where: { id: postId, userId },
    include: {
      platformPosts: true,
    },
  })

  if (!original) {
    throw new Error('Post not found')
  }

  return await createSocialPost(userId, {
    content: original.content,
    mediaUrls: (original.mediaUrls as string[]) || [],
    platforms: original.platforms,
  })
}

/**
 * Get posts with filters
 */
export async function getUserPosts(
  userId: string,
  filters?: {
    status?: string
    platform?: string
    dateFrom?: Date
    dateTo?: Date
  }
) {
  const where: any = { userId }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.platform) {
    where.platforms = { has: filters.platform }
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {}
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
    if (filters.dateTo) where.createdAt.lte = filters.dateTo
  }

  return await prisma.socialPost.findMany({
    where,
    include: {
      platformPosts: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Validate character count for platform
 */
export function validateCharacterCount(
  content: string,
  platform: 'TWITTER' | 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK'
): {
  valid: boolean
  count: number
  limit: number
  message?: string
} {
  const count = content.length
  const limit = CHARACTER_LIMITS[platform]

  if (count > limit) {
    return {
      valid: false,
      count,
      limit,
      message: `Content exceeds ${platform} character limit (${count}/${limit})`,
    }
  }

  return { valid: true, count, limit }
}

/**
 * Validate all platforms for a post
 */
export function validatePostForPlatforms(
  content: string,
  platforms: string[]
): {
  valid: boolean
  errors: Array<{ platform: string; message: string }>
} {
  const errors: Array<{ platform: string; message: string }> = []

  for (const platform of platforms) {
    const validation = validateCharacterCount(
      content,
      platform as 'TWITTER' | 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK'
    )

    if (!validation.valid) {
      errors.push({
        platform,
        message: validation.message || 'Invalid content',
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get analytics for user's posts
 */
export async function getSocialAnalytics(userId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const posts = await prisma.socialPost.findMany({
    where: {
      userId,
      status: 'PUBLISHED',
      publishedAt: { gte: startDate },
    },
    include: {
      platformPosts: true,
    },
  })

  // Calculate totals
  let totalEngagement = 0
  const platformStats: any = {}

  for (const post of posts) {
    if (post.engagementStats) {
      const stats = post.engagementStats as any
      totalEngagement += (stats.likes || 0) + (stats.comments || 0) + (stats.shares || 0)
    }

    for (const platformPost of post.platformPosts) {
      if (!platformStats[platformPost.platform]) {
        platformStats[platformPost.platform] = {
          posts: 0,
          engagement: 0,
        }
      }

      platformStats[platformPost.platform].posts++

      if (platformPost.engagementStats) {
        const stats = platformPost.engagementStats as any
        platformStats[platformPost.platform].engagement +=
          (stats.likes || 0) + (stats.comments || 0) + (stats.shares || 0)
      }
    }
  }

  return {
    totalPosts: posts.length,
    totalEngagement,
    averageEngagement: posts.length > 0 ? Math.round(totalEngagement / posts.length) : 0,
    platformStats,
    posts: posts.slice(0, 10), // Top 10 recent posts
  }
}

/**
 * Check if token needs refresh
 */
export function needsTokenRefresh(platform: any): boolean {
  if (!platform.tokenExpiresAt) return false

  // Refresh if expiring within 24 hours
  const expiryDate = new Date(platform.tokenExpiresAt)
  const now = new Date()
  const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  return hoursUntilExpiry < 24
}
