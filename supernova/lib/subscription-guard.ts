import { prisma } from './prisma'

/**
 * Check if user has an active subscription
 * @param userId - The user ID to check
 * @returns boolean indicating if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
        currentPeriodEnd: {
          gte: new Date(),
        },
      },
    })

    return !!subscription
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return false
  }
}

/**
 * Require active subscription or throw error
 * @param userId - The user ID to check
 * @throws Error if user doesn't have active subscription
 */
export async function requireActiveSubscription(userId: string): Promise<void> {
  const hasSubscription = await hasActiveSubscription(userId)

  if (!hasSubscription) {
    throw new Error('Active subscription required')
  }
}

/**
 * Get user's current subscription
 * @param userId - The user ID
 * @returns Subscription or null
 */
export async function getUserSubscription(userId: string) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return subscription
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }
}

/**
 * Check if user is in trial period
 * @param userId - The user ID
 * @returns boolean indicating if user is in trial
 */
export async function isInTrial(userId: string): Promise<boolean> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'TRIALING',
        trialEnd: {
          gte: new Date(),
        },
      },
    })

    return !!subscription
  } catch (error) {
    console.error('Error checking trial status:', error)
    return false
  }
}

/**
 * Get trial days remaining
 * @param userId - The user ID
 * @returns number of days remaining in trial or 0
 */
export async function getTrialDaysRemaining(userId: string): Promise<number> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'TRIALING',
        trialEnd: {
          gte: new Date(),
        },
      },
    })

    if (!subscription || !subscription.trialEnd) {
      return 0
    }

    const now = new Date()
    const daysRemaining = Math.ceil(
      (subscription.trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    return Math.max(0, daysRemaining)
  } catch (error) {
    console.error('Error calculating trial days:', error)
    return 0
  }
}

/**
 * Update user subscription tier based on Stripe subscription status
 * @param userId - The user ID
 * @param status - Stripe subscription status
 */
export async function updateUserTier(
  userId: string,
  status: string
): Promise<void> {
  try {
    const activeStatuses = ['active', 'trialing']
    const subscriptionTier = activeStatuses.includes(status.toLowerCase())
      ? 'PRO'
      : 'FREE'
    const subscriptionStatus = activeStatuses.includes(status.toLowerCase())
      ? 'ACTIVE'
      : 'INACTIVE'

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier,
        subscriptionStatus,
      },
    })
  } catch (error) {
    console.error('Error updating user tier:', error)
    throw error
  }
}
