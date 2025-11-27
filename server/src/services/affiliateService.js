/**
 * Affiliate Service
 * Handles affiliate program logic, tracking, commissions, and payouts
 */

const crypto = require('crypto');

/**
 * Generate unique affiliate code
 * @param {string} userId - User ID
 * @param {string} userName - User's name
 * @returns {string} Unique affiliate code
 */
function generateAffiliateCode(userId, userName = '') {
  // Create code from name (first 4 letters) + random string
  const namePrefix = userName
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .substring(0, 4)
    .padEnd(4, 'X');

  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();

  return `${namePrefix}${randomSuffix}`;
}

/**
 * Create affiliate profile for user
 * @param {string} userId - User ID
 * @param {object} paymentInfo - Payment details
 * @param {object} prisma - Prisma client
 * @returns {Promise<object>} Affiliate profile
 */
async function createAffiliateProfile(userId, paymentInfo, prisma) {
  if (!prisma) {
    throw new Error('Prisma client required');
  }

  // Check if user already has affiliate profile
  const existing = await prisma.affiliateProfile.findUnique({
    where: { userId }
  });

  if (existing) {
    throw new Error('User already has an affiliate profile');
  }

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Generate unique affiliate code
  let affiliateCode;
  let attempts = 0;

  while (attempts < 10) {
    affiliateCode = generateAffiliateCode(userId, user.name);

    // Check if code is unique
    const codeExists = await prisma.affiliateProfile.findUnique({
      where: { affiliateCode }
    });

    if (!codeExists) break;
    attempts++;
  }

  if (attempts >= 10) {
    throw new Error('Failed to generate unique affiliate code');
  }

  // Create referral link
  const baseUrl = process.env.APP_URL || 'https://thedaitaniverse.com';
  const referralLink = `${baseUrl}?ref=${affiliateCode}`;

  // Create affiliate profile
  const profile = await prisma.affiliateProfile.create({
    data: {
      userId,
      affiliateCode,
      referralLink,
      commissionRate: 0.20, // 20% default
      status: 'ACTIVE',
      paymentMethod: paymentInfo.method || 'paypal',
      paymentEmail: paymentInfo.email,
      paymentDetails: paymentInfo.details || null
    }
  });

  return profile;
}

/**
 * Track referral click
 * @param {string} referralCode - Affiliate code
 * @param {object} trackingData - IP, user agent, etc.
 * @param {object} prisma - Prisma client
 */
async function trackReferralClick(referralCode, trackingData, prisma) {
  if (!prisma) return;

  try {
    // Find affiliate
    const affiliate = await prisma.affiliateProfile.findUnique({
      where: { affiliateCode: referralCode }
    });

    if (!affiliate) {
      console.warn(`Invalid referral code: ${referralCode}`);
      return;
    }

    // Record click
    await prisma.referralClick.create({
      data: {
        affiliateCode: referralCode,
        affiliateId: affiliate.id,
        ipAddress: trackingData.ipAddress || 'unknown',
        userAgent: trackingData.userAgent,
        referer: trackingData.referer,
        landingPage: trackingData.landingPage,
        utmSource: trackingData.utmSource,
        utmMedium: trackingData.utmMedium,
        utmCampaign: trackingData.utmCampaign
      }
    });

    // Increment click count
    await prisma.affiliateProfile.update({
      where: { id: affiliate.id },
      data: { totalClicks: { increment: 1 } }
    });
  } catch (error) {
    console.error('Error tracking referral click:', error);
  }
}

/**
 * Record signup from referral
 * @param {string} userId - New user ID
 * @param {string} referralCode - Affiliate code used
 * @param {object} prisma - Prisma client
 */
async function recordSignup(userId, referralCode, prisma) {
  if (!prisma || !referralCode) return;

  try {
    // Find affiliate
    const affiliate = await prisma.affiliateProfile.findUnique({
      where: { affiliateCode: referralCode }
    });

    if (!affiliate) {
      console.warn(`Invalid referral code for signup: ${referralCode}`);
      return;
    }

    // Create referral record
    await prisma.referral.create({
      data: {
        affiliateId: affiliate.id,
        referredUserId: userId,
        referralCode,
        status: 'SIGNED_UP'
      }
    });

    // Update affiliate stats
    await prisma.affiliateProfile.update({
      where: { id: affiliate.id },
      data: { totalSignups: { increment: 1 } }
    });

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode }
    });

    // TODO: Send notification email to affiliate

  } catch (error) {
    console.error('Error recording signup:', error);
  }
}

/**
 * Calculate commission amount
 * @param {number} subscriptionAmount - Monthly subscription amount
 * @param {number} affiliateRate - Commission rate (0.20 = 20%)
 * @returns {number} Commission amount
 */
function calculateCommission(subscriptionAmount, affiliateRate = 0.20) {
  return parseFloat((subscriptionAmount * affiliateRate).toFixed(2));
}

/**
 * Record commission for a subscription
 * @param {string} referralId - Referral ID
 * @param {number} amount - Subscription amount
 * @param {object} details - Order/subscription details
 * @param {object} prisma - Prisma client
 */
async function recordCommission(referralId, amount, details, prisma) {
  if (!prisma) return;

  try {
    // Get referral with affiliate
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { affiliate: true }
    });

    if (!referral) {
      console.warn(`Referral not found: ${referralId}`);
      return;
    }

    // Calculate commission
    const commissionAmount = calculateCommission(amount, referral.affiliate.commissionRate);

    // Create commission record
    const commission = await prisma.commission.create({
      data: {
        affiliateId: referral.affiliateId,
        referralId: referral.id,
        amount: commissionAmount,
        percentage: referral.affiliate.commissionRate,
        baseAmount: amount,
        orderId: details.orderId,
        subscriptionId: details.subscriptionId,
        invoiceId: details.invoiceId,
        status: 'PENDING',
        description: details.description || `Commission from subscription £${amount}`
      }
    });

    // Update referral status
    if (referral.status === 'SIGNED_UP' || referral.status === 'TRIAL') {
      await prisma.referral.update({
        where: { id: referralId },
        data: {
          status: 'SUBSCRIBED',
          firstPurchaseDate: new Date(),
          totalValue: { increment: amount }
        }
      });
    } else {
      await prisma.referral.update({
        where: { id: referralId },
        data: { totalValue: { increment: amount } }
      });
    }

    // Update affiliate totals
    await prisma.affiliateProfile.update({
      where: { id: referral.affiliateId },
      data: {
        totalEarnings: { increment: commissionAmount },
        pendingEarnings: { increment: commissionAmount },
        totalConversions: { increment: 1 }
      }
    });

    // TODO: Send commission earned notification

    return commission;
  } catch (error) {
    console.error('Error recording commission:', error);
    throw error;
  }
}

/**
 * Approve commission after refund period (30 days)
 * @param {string} commissionId - Commission ID
 * @param {object} prisma - Prisma client
 */
async function approveCommission(commissionId, prisma) {
  if (!prisma) return;

  try {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
      include: { affiliate: true }
    });

    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status !== 'PENDING') {
      throw new Error('Commission is not pending');
    }

    // Approve commission
    await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });

    // No change to totals (already added when created)
    // Just moving from pending to approved status

    // TODO: Send approval notification

  } catch (error) {
    console.error('Error approving commission:', error);
    throw error;
  }
}

/**
 * Cancel commission (refund, cancellation)
 * @param {string} commissionId - Commission ID
 * @param {string} reason - Cancellation reason
 * @param {object} prisma - Prisma client
 */
async function cancelCommission(commissionId, reason, prisma) {
  if (!prisma) return;

  try {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId }
    });

    if (!commission) {
      throw new Error('Commission not found');
    }

    // Cancel commission
    await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'CANCELLED',
        notes: reason,
        cancelledAt: new Date()
      }
    });

    // Adjust affiliate totals
    await prisma.affiliateProfile.update({
      where: { id: commission.affiliateId },
      data: {
        totalEarnings: { decrement: commission.amount },
        pendingEarnings: { decrement: commission.amount }
      }
    });

  } catch (error) {
    console.error('Error cancelling commission:', error);
    throw error;
  }
}

/**
 * Request payout
 * @param {string} affiliateId - Affiliate ID
 * @param {number} amount - Requested amount
 * @param {object} prisma - Prisma client
 */
async function requestPayout(affiliateId, amount, prisma) {
  if (!prisma) {
    throw new Error('Prisma client required');
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { id: affiliateId }
  });

  if (!affiliate) {
    throw new Error('Affiliate not found');
  }

  // Check minimum payout (£50)
  const minimumPayout = 50;
  if (amount < minimumPayout) {
    throw new Error(`Minimum payout is £${minimumPayout}`);
  }

  // Check if affiliate has enough approved earnings
  const approvedCommissions = await prisma.commission.aggregate({
    where: {
      affiliateId,
      status: 'APPROVED'
    },
    _sum: {
      amount: true
    }
  });

  const availableBalance = approvedCommissions._sum.amount || 0;

  if (amount > availableBalance) {
    throw new Error(`Insufficient balance. Available: £${availableBalance.toFixed(2)}`);
  }

  // Get approved commissions to include in payout
  const commissions = await prisma.commission.findMany({
    where: {
      affiliateId,
      status: 'APPROVED'
    },
    take: 1000 // Reasonable limit
  });

  // Create payout request
  const payout = await prisma.payout.create({
    data: {
      affiliateId,
      amount,
      method: affiliate.paymentMethod || 'PAYPAL',
      paymentEmail: affiliate.paymentEmail,
      paymentDetails: affiliate.paymentDetails,
      status: 'PENDING',
      commissionCount: commissions.length
    }
  });

  // Link commissions to payout and mark as paid
  await prisma.commission.updateMany({
    where: {
      id: { in: commissions.map(c => c.id) }
    },
    data: {
      status: 'PAID',
      payoutId: payout.id,
      paidAt: new Date()
    }
  });

  // Update affiliate balances
  await prisma.affiliateProfile.update({
    where: { id: affiliateId },
    data: {
      pendingEarnings: { decrement: amount }
    }
  });

  // TODO: Send payout request notification

  return payout;
}

/**
 * Process payout (admin action)
 * @param {string} payoutId - Payout ID
 * @param {string} transactionId - Payment processor transaction ID
 * @param {object} prisma - Prisma client
 */
async function processPayout(payoutId, transactionId, prisma) {
  if (!prisma) {
    throw new Error('Prisma client required');
  }

  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
    include: { affiliate: true }
  });

  if (!payout) {
    throw new Error('Payout not found');
  }

  if (payout.status !== 'PENDING') {
    throw new Error('Payout is not pending');
  }

  // Mark as completed
  await prisma.payout.update({
    where: { id: payoutId },
    data: {
      status: 'COMPLETED',
      transactionId,
      paidAt: new Date(),
      processedAt: new Date()
    }
  });

  // Update affiliate paid earnings
  await prisma.affiliateProfile.update({
    where: { id: payout.affiliateId },
    data: {
      paidEarnings: { increment: payout.amount }
    }
  });

  // TODO: Send payout completed notification

  return payout;
}

/**
 * Get affiliate statistics
 * @param {string} affiliateId - Affiliate ID
 * @param {object} prisma - Prisma client
 */
async function getAffiliateStats(affiliateId, prisma) {
  if (!prisma) {
    return null;
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { id: affiliateId },
    include: {
      referrals: {
        include: {
          referredUser: {
            select: { id: true, email: true, name: true, createdAt: true }
          }
        }
      },
      commissions: {
        orderBy: { createdAt: 'desc' },
        take: 100
      },
      payouts: {
        orderBy: { requestedAt: 'desc' },
        take: 20
      }
    }
  });

  if (!affiliate) {
    return null;
  }

  // Calculate stats
  const activeReferrals = affiliate.referrals.filter(r => r.status === 'SUBSCRIBED').length;
  const conversionRate = affiliate.totalSignups > 0
    ? (activeReferrals / affiliate.totalSignups) * 100
    : 0;

  // This month's earnings
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCommissions = affiliate.commissions.filter(
    c => c.createdAt >= monthStart
  );
  const thisMonthEarnings = thisMonthCommissions.reduce((sum, c) => sum + c.amount, 0);

  return {
    profile: affiliate,
    stats: {
      totalClicks: affiliate.totalClicks,
      totalSignups: affiliate.totalSignups,
      activeReferrals,
      conversionRate: conversionRate.toFixed(2),
      totalEarnings: affiliate.totalEarnings,
      pendingEarnings: affiliate.pendingEarnings,
      paidEarnings: affiliate.paidEarnings,
      thisMonthEarnings
    },
    recentReferrals: affiliate.referrals.slice(0, 10),
    recentCommissions: affiliate.commissions.slice(0, 10),
    recentPayouts: affiliate.payouts.slice(0, 5)
  };
}

/**
 * Validate referral code
 * @param {string} code - Referral code
 * @param {object} prisma - Prisma client
 * @returns {Promise<boolean>} True if valid
 */
async function validateReferralCode(code, prisma) {
  if (!prisma || !code) {
    return false;
  }

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { affiliateCode: code }
  });

  return affiliate && affiliate.status === 'ACTIVE';
}

/**
 * Update affiliate tier based on referral count
 * @param {string} affiliateId - Affiliate ID
 * @param {object} prisma - Prisma client
 */
async function updateAffiliateTier(affiliateId, prisma) {
  if (!prisma) return;

  const affiliate = await prisma.affiliateProfile.findUnique({
    where: { id: affiliateId },
    include: {
      _count: {
        select: { referrals: true }
      }
    }
  });

  if (!affiliate) return;

  const referralCount = affiliate._count.referrals;
  let newTier = 'BRONZE';
  let newRate = 0.20;

  if (referralCount >= 51) {
    newTier = 'GOLD';
    newRate = 0.30;
  } else if (referralCount >= 11) {
    newTier = 'SILVER';
    newRate = 0.25;
  }

  if (affiliate.tier !== newTier) {
    await prisma.affiliateProfile.update({
      where: { id: affiliateId },
      data: {
        tier: newTier,
        commissionRate: newRate
      }
    });

    // TODO: Send tier upgrade notification
  }
}

module.exports = {
  generateAffiliateCode,
  createAffiliateProfile,
  trackReferralClick,
  recordSignup,
  calculateCommission,
  recordCommission,
  approveCommission,
  cancelCommission,
  requestPayout,
  processPayout,
  getAffiliateStats,
  validateReferralCode,
  updateAffiliateTier
};
