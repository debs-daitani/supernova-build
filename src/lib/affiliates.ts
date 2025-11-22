import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * Commission rates by tier
 */
export const COMMISSION_RATES = {
  FREE: 0,
  UPGRADE: 0.20, // 20% for BRAVE tier (£6/month)
  MEMBER: 0.30, // 30% for BOLD tier (£26/month)
  ADMIN: 0.40, // 40% for BADASS tier (£260/year)
}

/**
 * Minimum payout amounts by tier (in £)
 */
export const MINIMUM_PAYOUTS = {
  FREE: 0,
  UPGRADE: 25, // £25 for BRAVE
  MEMBER: 25, // £25 for BOLD
  ADMIN: 0, // No minimum for BADASS
}

/**
 * Subscription prices by tier (in £ per month)
 */
export const SUBSCRIPTION_PRICES = {
  FREE: 0,
  UPGRADE: 6, // BRAVE £6/month
  MEMBER: 26, // BOLD £26/month
  ADMIN: 21.67, // BADASS £260/year = £21.67/month
}

/**
 * Generate unique affiliate code
 * Format: FIRSTNAME-ABC123
 */
export async function generateAffiliateCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get first name or fallback to email prefix
  const firstName = user.profile?.firstName || user.email.split('@')[0]
  const prefix = firstName.toUpperCase().substring(0, 8)

  // Generate random suffix
  let code: string
  let attempts = 0
  const maxAttempts = 10

  do {
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase()
    code = `${prefix}-${randomSuffix}`

    // Check if code already exists
    const existing = await prisma.affiliateProfile.findUnique({
      where: { affiliateCode: code },
    })

    if (!existing) {
      break
    }

    attempts++
  } while (attempts < maxAttempts)

  if (attempts >= maxAttempts) {
    // Fallback to fully random code
    code = `AFF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
  }

  return code
}

/**
 * Create affiliate profile for user
 */
export async function createAffiliateProfile(userId: string) {
  // Check if user already has affiliate profile
  const existing = await prisma.affiliateProfile.findUnique({
    where: { userId },
  })

  if (existing) {
    return existing
  }

  // Get user to determine commission rate
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Generate affiliate code
  const affiliateCode = await generateAffiliateCode(userId)

  // Determine commission rate based on tier
  const commissionRate = COMMISSION_RATES[user.role as keyof typeof COMMISSION_RATES] || 0

  // Create affiliate profile
  const profile = await prisma.affiliateProfile.create({
    data: {
      userId,
      affiliateCode,
      commissionRate,
      isActive: true,
    },
  })

  return profile
}

/**
 * Track affiliate click
 */
export async function trackAffiliateClick(
  affiliateCode: string,
  ipAddress?: string,
  userAgent?: string,
  referer?: string
) {
  await prisma.affiliateClick.create({
    data: {
      affiliateCode,
      ipAddress,
      userAgent,
      referer,
      clickedAt: new Date(),
    },
  })
}

/**
 * Create referral when user signs up with affiliate code
 */
export async function createReferral(
  referredUserId: string,
  affiliateCode: string,
  source: 'LINK' | 'SOCIAL' | 'EMAIL' | 'OTHER' = 'LINK'
) {
  // Find affiliate profile
  const affiliateProfile = await prisma.affiliateProfile.findUnique({
    where: { affiliateCode },
    include: { user: true },
  })

  if (!affiliateProfile || !affiliateProfile.isActive) {
    throw new Error('Invalid or inactive affiliate code')
  }

  // Prevent self-referral
  if (affiliateProfile.userId === referredUserId) {
    throw new Error('Cannot refer yourself')
  }

  // Check if referral already exists
  const existing = await prisma.referral.findFirst({
    where: {
      referredUserId,
    },
  })

  if (existing) {
    // User already referred, don't create duplicate
    return existing
  }

  // Create referral
  const referral = await prisma.referral.create({
    data: {
      affiliateUserId: affiliateProfile.userId,
      referredUserId,
      affiliateCode,
      referralSource: source,
      signedUpAt: new Date(),
      status: 'PENDING',
    },
  })

  return referral
}

/**
 * Mark referral as converted (user made first payment)
 */
export async function convertReferral(referredUserId: string, subscriptionTier: string) {
  const referral = await prisma.referral.findFirst({
    where: {
      referredUserId,
      status: 'PENDING',
    },
    include: {
      affiliate: {
        include: {
          affiliateProfile: true,
        },
      },
    },
  })

  if (!referral) {
    return null // No pending referral found
  }

  // Update referral status
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      convertedAt: new Date(),
      status: 'ACTIVE',
    },
  })

  // Calculate commission
  const subscriptionPrice = SUBSCRIPTION_PRICES[subscriptionTier as keyof typeof SUBSCRIPTION_PRICES] || 0
  const commissionRate = referral.affiliate.affiliateProfile?.commissionRate || 0
  const commissionAmount = subscriptionPrice * parseFloat(commissionRate.toString())

  // Create commission record
  const commission = await prisma.affiliateCommission.create({
    data: {
      affiliateUserId: referral.affiliateUserId,
      referralId: referral.id,
      amount: commissionAmount,
      commissionType: 'RECURRING_MONTHLY',
      status: 'PENDING', // Will be approved after 30 days
      subscriptionMonth: getCurrentMonth(),
    },
  })

  // Update affiliate earnings
  await updateAffiliateEarnings(referral.affiliateUserId)

  return commission
}

/**
 * Create recurring commission for active subscription
 */
export async function createRecurringCommission(
  referredUserId: string,
  subscriptionTier: string
) {
  const referral = await prisma.referral.findFirst({
    where: {
      referredUserId,
      status: 'ACTIVE',
    },
    include: {
      affiliate: {
        include: {
          affiliateProfile: true,
        },
      },
    },
  })

  if (!referral) {
    return null
  }

  const currentMonth = getCurrentMonth()

  // Check if commission already created for this month
  const existingCommission = await prisma.affiliateCommission.findFirst({
    where: {
      referralId: referral.id,
      subscriptionMonth: currentMonth,
    },
  })

  if (existingCommission) {
    return existingCommission // Already created
  }

  // Calculate commission
  const subscriptionPrice = SUBSCRIPTION_PRICES[subscriptionTier as keyof typeof SUBSCRIPTION_PRICES] || 0
  const commissionRate = referral.affiliate.affiliateProfile?.commissionRate || 0
  const commissionAmount = subscriptionPrice * parseFloat(commissionRate.toString())

  // Create commission
  const commission = await prisma.affiliateCommission.create({
    data: {
      affiliateUserId: referral.affiliateUserId,
      referralId: referral.id,
      amount: commissionAmount,
      commissionType: 'RECURRING_MONTHLY',
      status: 'PENDING',
      subscriptionMonth: currentMonth,
    },
  })

  // Update affiliate earnings
  await updateAffiliateEarnings(referral.affiliateUserId)

  return commission
}

/**
 * Auto-approve commissions older than 30 days (after refund window)
 */
export async function approveCommissions() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const approvedCommissions = await prisma.affiliateCommission.updateMany({
    where: {
      status: 'PENDING',
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
    data: {
      status: 'APPROVED',
    },
  })

  // Update all affected affiliates' earnings
  const affectedCommissions = await prisma.affiliateCommission.findMany({
    where: {
      status: 'APPROVED',
      paidAt: null,
    },
    select: { affiliateUserId: true },
    distinct: ['affiliateUserId'],
  })

  for (const commission of affectedCommissions) {
    await updateAffiliateEarnings(commission.affiliateUserId)
  }

  return approvedCommissions.count
}

/**
 * Update affiliate's total, pending, and paid earnings
 */
async function updateAffiliateEarnings(affiliateUserId: string) {
  const [totalResult, pendingResult, paidResult] = await Promise.all([
    prisma.affiliateCommission.aggregate({
      where: { affiliateUserId },
      _sum: { amount: true },
    }),
    prisma.affiliateCommission.aggregate({
      where: {
        affiliateUserId,
        status: { in: ['PENDING', 'APPROVED'] },
        paidAt: null,
      },
      _sum: { amount: true },
    }),
    prisma.affiliateCommission.aggregate({
      where: {
        affiliateUserId,
        status: 'PAID',
      },
      _sum: { amount: true },
    }),
  ])

  await prisma.affiliateProfile.update({
    where: { userId: affiliateUserId },
    data: {
      totalEarnings: totalResult._sum.amount || 0,
      pendingEarnings: pendingResult._sum.amount || 0,
      paidEarnings: paidResult._sum.amount || 0,
    },
  })
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
 * Get affiliate dashboard stats
 */
export async function getAffiliateDashboardStats(userId: string) {
  const profile = await prisma.affiliateProfile.findUnique({
    where: { userId },
  })

  if (!profile) {
    return null
  }

  const [activeReferrals, totalClicks, totalCommissions, recentReferrals] = await Promise.all([
    // Active referrals count
    prisma.referral.count({
      where: {
        affiliateUserId: userId,
        status: 'ACTIVE',
      },
    }),

    // Total clicks
    prisma.affiliateClick.count({
      where: { affiliateCode: profile.affiliateCode },
    }),

    // Total commissions
    prisma.affiliateCommission.count({
      where: { affiliateUserId: userId },
    }),

    // Recent referrals
    prisma.referral.findMany({
      where: { affiliateUserId: userId },
      include: {
        referredUser: {
          select: {
            email: true,
            role: true,
            createdAt: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  // Get user tier for minimum payout
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  const minimumPayout = MINIMUM_PAYOUTS[user?.role as keyof typeof MINIMUM_PAYOUTS] || 25

  return {
    profile,
    activeReferrals,
    totalClicks,
    totalCommissions,
    recentReferrals,
    minimumPayout,
    canRequestPayout: parseFloat(profile.pendingEarnings.toString()) >= minimumPayout,
  }
}

/**
 * Get affiliate earnings history
 */
export async function getAffiliateEarnings(userId: string, options?: {
  status?: string
  limit?: number
  offset?: number
}) {
  const where: any = { affiliateUserId: userId }

  if (options?.status) {
    where.status = options.status
  }

  const [commissions, total] = await Promise.all([
    prisma.affiliateCommission.findMany({
      where,
      include: {
        referral: {
          include: {
            referredUser: {
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
          },
        },
        payout: {
          select: {
            id: true,
            amount: true,
            completedAt: true,
            transactionId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.affiliateCommission.count({ where }),
  ])

  return { commissions, total }
}

/**
 * Get affiliate analytics for admin
 */
export async function getAffiliateAnalytics() {
  const [
    totalAffiliates,
    activeAffiliates,
    totalReferrals,
    activeReferrals,
    totalCommissions,
    totalEarnings,
    topAffiliates,
  ] = await Promise.all([
    prisma.affiliateProfile.count(),
    prisma.affiliateProfile.count({ where: { isActive: true } }),
    prisma.referral.count(),
    prisma.referral.count({ where: { status: 'ACTIVE' } }),
    prisma.affiliateCommission.count(),
    prisma.affiliateCommission.aggregate({
      _sum: { amount: true },
    }),
    prisma.affiliateProfile.findMany({
      orderBy: { totalEarnings: 'desc' },
      take: 10,
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
        _count: {
          select: {
            referralsMade: true,
          },
        },
      },
    }),
  ])

  return {
    totalAffiliates,
    activeAffiliates,
    totalReferrals,
    activeReferrals,
    totalCommissions,
    totalEarnings: totalEarnings._sum.amount || 0,
    topAffiliates,
  }
}

/**
 * Process payouts for eligible affiliates
 */
export async function processPayouts() {
  // Get all affiliates eligible for payout
  const eligibleAffiliates = await prisma.affiliateProfile.findMany({
    where: {
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          role: true,
          email: true,
        },
      },
    },
  })

  const payoutsCreated: any[] = []

  for (const affiliate of eligibleAffiliates) {
    const minimumPayout = MINIMUM_PAYOUTS[affiliate.user.role as keyof typeof MINIMUM_PAYOUTS] || 25
    const pendingEarnings = parseFloat(affiliate.pendingEarnings.toString())

    if (pendingEarnings < minimumPayout) {
      continue // Not eligible
    }

    // Get approved unpaid commissions
    const approvedCommissions = await prisma.affiliateCommission.findMany({
      where: {
        affiliateUserId: affiliate.userId,
        status: 'APPROVED',
        paidAt: null,
      },
    })

    if (approvedCommissions.length === 0) {
      continue
    }

    const totalAmount = approvedCommissions.reduce(
      (sum, c) => sum + parseFloat(c.amount.toString()),
      0
    )

    // Create payout
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateUserId: affiliate.userId,
        amount: totalAmount,
        commissionIds: approvedCommissions.map((c) => c.id),
        method: affiliate.payoutMethod,
        status: 'PENDING',
      },
    })

    payoutsCreated.push(payout)
  }

  return payoutsCreated
}

/**
 * Mark payout as completed
 */
export async function completePayout(payoutId: string, transactionId: string) {
  const payout = await prisma.affiliatePayout.findUnique({
    where: { id: payoutId },
    include: {
      commissions: true,
    },
  })

  if (!payout) {
    throw new Error('Payout not found')
  }

  // Update payout
  await prisma.affiliatePayout.update({
    where: { id: payoutId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      transactionId,
    },
  })

  // Mark all commissions as paid
  const commissionIds = JSON.parse(payout.commissionIds as any)
  await prisma.affiliateCommission.updateMany({
    where: {
      id: { in: commissionIds },
    },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      payoutId,
    },
  })

  // Update affiliate earnings
  await updateAffiliateEarnings(payout.affiliateUserId)
}
