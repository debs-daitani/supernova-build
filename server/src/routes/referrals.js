import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate unique referral code
function generateReferralCode(name) {
  // Create code from name (first 4-8 chars) + random numbers
  const namepart = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .substring(0, 8);
  const randomPart = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0');
  return `${namepart}${randomPart}`;
}

// Check and award milestone rewards
async function checkMilestones(userId) {
  // Count qualified referrals
  const qualifiedCount = await prisma.referral.count({
    where: {
      referrerId: userId,
      qualified: true
    }
  });

  const milestones = [
    { count: 5, type: '5_referrals', reward: 'free_month', amount: 26, description: 'Bonus month for 5 referrals' },
    { count: 10, type: '10_referrals', reward: 'free_month', amount: 78, description: '3 months free for 10 referrals' },
    { count: 25, type: '25_referrals', reward: 'free_month', amount: 156, description: '6 months free for 25 referrals' },
    { count: 50, type: '50_referrals', reward: 'lifetime_free', amount: 10000, description: 'Lifetime free for 50 referrals!' }
  ];

  for (const milestone of milestones) {
    if (qualifiedCount >= milestone.count) {
      // Check if milestone reward already given
      const existing = await prisma.referralReward.findFirst({
        where: {
          userId,
          milestone: milestone.type
        }
      });

      if (!existing) {
        // Award milestone reward
        await prisma.referralReward.create({
          data: {
            userId,
            rewardType: milestone.reward,
            amount: milestone.amount,
            description: milestone.description,
            milestone: milestone.type,
            status: 'issued',
            issuedAt: new Date()
          }
        });

        // TODO: Send milestone celebration email
      }
    }
  }
}

// ============================================
// PUBLIC ROUTES
// ============================================

// Track referral click
router.get('/track/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const referralCode = await prisma.referralCode.findUnique({
      where: { code }
    });

    if (referralCode) {
      // Update click count
      await prisma.referralCode.update({
        where: { code },
        data: { clicks: { increment: 1 } }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking referral:', error);
    res.status(500).json({ error: 'Failed to track referral' });
  }
});

// ============================================
// USER ROUTES
// ============================================

// Get user's referral code (or create if doesn't exist)
router.get('/my-code', authenticate, async (req, res) => {
  try {
    let referralCode = await prisma.referralCode.findUnique({
      where: { userId: req.user.id }
    });

    if (!referralCode) {
      // Generate new code
      const code = generateReferralCode(req.user.name);

      referralCode = await prisma.referralCode.create({
        data: {
          userId: req.user.id,
          code
        }
      });
    }

    res.json(referralCode);
  } catch (error) {
    console.error('Error fetching referral code:', error);
    res.status(500).json({ error: 'Failed to fetch referral code' });
  }
});

// Get referral dashboard stats
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get referral code
    const referralCode = await prisma.referralCode.findUnique({
      where: { userId }
    });

    if (!referralCode) {
      return res.json({
        code: null,
        stats: {
          clicks: 0,
          signups: 0,
          conversions: 0,
          totalRewards: 0
        },
        recentReferrals: [],
        pendingRewards: 0,
        issuedRewards: 0
      });
    }

    // Get recent referrals
    const recentReferrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    // Count pending and issued rewards
    const pendingRewards = await prisma.referralReward.count({
      where: {
        userId,
        status: 'pending'
      }
    });

    const issuedRewards = await prisma.referralReward.count({
      where: {
        userId,
        status: { in: ['issued', 'redeemed'] }
      }
    });

    res.json({
      code: referralCode,
      stats: {
        clicks: referralCode.clicks,
        signups: referralCode.signups,
        conversions: referralCode.conversions,
        totalRewards: referralCode.totalRewards
      },
      recentReferrals,
      pendingRewards,
      issuedRewards
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let where = {};
    if (period === 'month') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      where.createdAt = { gte: startOfMonth };
    }

    // Get top referrers
    const topReferrers = await prisma.referralCode.findMany({
      orderBy: { conversions: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.json(topReferrers);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user's rewards
router.get('/rewards', authenticate, async (req, res) => {
  try {
    const rewards = await prisma.referralReward.findMany({
      where: { userId: req.user.id },
      orderBy: { earnedAt: 'desc' },
      include: {
        referral: {
          include: {
            referred: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Calculate totals
    const totalPending = rewards
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const totalIssued = rewards
      .filter(r => r.status === 'issued')
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const totalRedeemed = rewards
      .filter(r => r.status === 'redeemed')
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    res.json({
      rewards,
      totals: {
        pending: totalPending,
        issued: totalIssued,
        redeemed: totalRedeemed,
        total: totalPending + totalIssued + totalRedeemed
      }
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// Redeem reward
router.post('/redeem/:rewardId', authenticate, async (req, res) => {
  try {
    const { rewardId } = req.params;

    const reward = await prisma.referralReward.findUnique({
      where: { id: rewardId }
    });

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    if (reward.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (reward.status === 'redeemed') {
      return res.status(400).json({ error: 'Reward already redeemed' });
    }

    if (reward.status !== 'issued') {
      return res.status(400).json({ error: 'Reward not yet issued' });
    }

    // Update reward status
    const updated = await prisma.referralReward.update({
      where: { id: rewardId },
      data: {
        status: 'redeemed',
        redeemedAt: new Date()
      }
    });

    // TODO: Apply reward to user's account (extend subscription, add credits, etc.)

    res.json(updated);
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get analytics
router.get('/admin/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    // Overall stats
    const totalReferrals = await prisma.referral.count();
    const qualifiedReferrals = await prisma.referral.count({
      where: { qualified: true }
    });

    const totalRewards = await prisma.referralReward.aggregate({
      _sum: { amount: true }
    });

    const avgReferralsPerUser = await prisma.referralCode.aggregate({
      _avg: { conversions: true }
    });

    // Top referrers
    const topReferrers = await prisma.referralCode.findMany({
      orderBy: { conversions: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Conversion funnel
    const totalClicks = await prisma.referralCode.aggregate({
      _sum: { clicks: true }
    });
    const totalSignups = await prisma.referralCode.aggregate({
      _sum: { signups: true }
    });
    const totalConversions = await prisma.referralCode.aggregate({
      _sum: { conversions: true }
    });

    // Recent referrals
    const recentReferrals = await prisma.referral.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        referrer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        referred: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      overview: {
        totalReferrals,
        qualifiedReferrals,
        conversionRate: totalReferrals > 0 ? (qualifiedReferrals / totalReferrals * 100).toFixed(1) : 0,
        totalRewardsIssued: totalRewards._sum.amount || 0,
        avgReferralsPerUser: avgReferralsPerUser._avg.conversions || 0
      },
      funnel: {
        clicks: totalClicks._sum.clicks || 0,
        signups: totalSignups._sum.signups || 0,
        conversions: totalConversions._sum.conversions || 0
      },
      topReferrers,
      recentReferrals
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all referral codes
router.get('/admin/codes', authenticate, requireAdmin, async (req, res) => {
  try {
    const codes = await prisma.referralCode.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { conversions: 'desc' }
    });

    res.json(codes);
  } catch (error) {
    console.error('Error fetching codes:', error);
    res.status(500).json({ error: 'Failed to fetch codes' });
  }
});

// Get all campaigns
router.get('/admin/campaigns', authenticate, requireAdmin, async (req, res) => {
  try {
    const campaigns = await prisma.referralCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Create campaign
router.post('/admin/campaigns', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      referrerReward,
      referredReward,
      requiresPayment,
      minSubscriptionDays,
      milestones,
      startDate,
      endDate
    } = req.body;

    if (!name || !referrerReward || !referredReward) {
      return res.status(400).json({ error: 'Name and rewards are required' });
    }

    const campaign = await prisma.referralCampaign.create({
      data: {
        name,
        description,
        referrerReward,
        referredReward,
        requiresPayment: requiresPayment !== false,
        minSubscriptionDays,
        milestones,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign
router.patch('/admin/campaigns/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.referralCampaign.update({
      where: { id },
      data: req.body
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete campaign
router.delete('/admin/campaigns/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.referralCampaign.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router;
