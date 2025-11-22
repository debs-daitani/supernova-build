/**
 * Affiliate Program Routes
 * API endpoints for affiliate/referral system
 */

const express = require('express');
const router = express.Router();

const {
  createAffiliateProfile,
  getAffiliateStats,
  validateReferralCode,
  requestPayout,
  processPayout,
  approveCommission,
  cancelCommission,
  updateAffiliateTier
} = require('../services/affiliateService');

// Middleware (assumes you have auth middleware)
// const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * PUBLIC ROUTES
 */

// Validate referral code
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const isValid = await validateReferralCode(code, req.prisma);

    res.json({
      valid: isValid,
      code: isValid ? code : null
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({ error: 'Failed to validate code' });
  }
});

// Get affiliate program info (public)
router.get('/program-info', async (req, res) => {
  res.json({
    tiers: [
      {
        name: 'Bronze',
        commissionRate: 0.20,
        requirements: '0-10 active referrals',
        benefits: ['20% commission', 'Basic support']
      },
      {
        name: 'Silver',
        commissionRate: 0.25,
        requirements: '11-50 active referrals',
        benefits: ['25% commission', 'Priority support', 'Featured listing']
      },
      {
        name: 'Gold',
        commissionRate: 0.30,
        requirements: '51+ active referrals',
        benefits: ['30% commission', 'Dedicated manager', 'Custom materials']
      }
    ],
    terms: {
      minimumPayout: 50,
      payoutCurrency: 'GBP',
      cookieDuration: 30,
      commissionHoldPeriod: 30,
      paymentMethods: ['PayPal', 'Bank Transfer', 'Stripe']
    }
  });
});

/**
 * AUTHENTICATED USER ROUTES
 * (Add authenticate middleware in production)
 */

// Join affiliate program
router.post('/join', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId; // Development fallback
    const { paymentMethod, paymentEmail, paymentDetails } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!paymentEmail) {
      return res.status(400).json({ error: 'Payment email required' });
    }

    const paymentInfo = {
      method: paymentMethod || 'paypal',
      email: paymentEmail,
      details: paymentDetails || null
    };

    const profile = await createAffiliateProfile(userId, paymentInfo, req.prisma);

    res.status(201).json({
      success: true,
      message: 'Welcome to the affiliate program!',
      profile: {
        id: profile.id,
        affiliateCode: profile.affiliateCode,
        referralLink: profile.referralLink,
        commissionRate: profile.commissionRate,
        tier: profile.tier
      }
    });
  } catch (error) {
    console.error('Error joining affiliate program:', error);

    if (error.message.includes('already has an affiliate profile')) {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to create affiliate profile' });
  }
});

// Get my affiliate profile
router.get('/my-profile', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId; // Development fallback

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = await req.prisma.affiliateProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Not an affiliate member' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update payment information
router.put('/payment-info', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { paymentMethod, paymentEmail, paymentDetails } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = await req.prisma.affiliateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Not an affiliate member' });
    }

    const updated = await req.prisma.affiliateProfile.update({
      where: { id: profile.id },
      data: {
        paymentMethod: paymentMethod || profile.paymentMethod,
        paymentEmail: paymentEmail || profile.paymentEmail,
        paymentDetails: paymentDetails || profile.paymentDetails
      }
    });

    res.json({
      success: true,
      message: 'Payment information updated',
      profile: updated
    });
  } catch (error) {
    console.error('Error updating payment info:', error);
    res.status(500).json({ error: 'Failed to update payment information' });
  }
});

// Get my affiliate stats
router.get('/my-stats', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = await req.prisma.affiliateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Not an affiliate member' });
    }

    const stats = await getAffiliateStats(profile.id, req.prisma);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get my referrals
router.get('/my-referrals', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { page = 1, limit = 20, status } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = await req.prisma.affiliateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Not an affiliate member' });
    }

    const where = {
      affiliateId: profile.id,
      ...(status && { status })
    };

    const [referrals, total] = await Promise.all([
      req.prisma.referral.findMany({
        where,
        include: {
          referredUser: {
            select: { id: true, email: true, name: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      req.prisma.referral.count({ where })
    ]);

    res.json({
      referrals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get my commissions
router.get('/my-commissions', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { page = 1, limit = 50, status } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = await req.prisma.affiliateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Not an affiliate member' });
    }

    const where = {
      affiliateId: profile.id,
      ...(status && { status })
    };

    const [commissions, total] = await Promise.all([
      req.prisma.commission.findMany({
        where,
        include: {
          referral: {
            include: {
              referredUser: {
                select: { email: true, name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      req.prisma.commission.count({ where })
    ]);

    res.json({
      commissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
});

// Request payout
router.post('/request-payout', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { amount } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payout amount' });
    }

    const profile = await req.prisma.affiliateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Not an affiliate member' });
    }

    const payout = await requestPayout(profile.id, parseFloat(amount), req.prisma);

    res.status(201).json({
      success: true,
      message: 'Payout requested successfully',
      payout
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(400).json({ error: error.message || 'Failed to request payout' });
  }
});

// Get my payouts
router.get('/my-payouts', /* authenticate, */ async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const profile = await req.prisma.affiliateProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Not an affiliate member' });
    }

    const [payouts, total] = await Promise.all([
      req.prisma.payout.findMany({
        where: { affiliateId: profile.id },
        orderBy: { requestedAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      req.prisma.payout.count({
        where: { affiliateId: profile.id }
      })
    ]);

    res.json({
      payouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// Get marketing materials
router.get('/materials', /* authenticate, */ async (req, res) => {
  try {
    const { type, category } = req.query;

    const where = {
      isActive: true,
      ...(type && { type }),
      ...(category && { category })
    };

    const materials = await req.prisma.affiliateMaterial.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ materials });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

// Download marketing material
router.post('/materials/:id/download', /* authenticate, */ async (req, res) => {
  try {
    const { id } = req.params;

    // Increment download count
    await req.prisma.affiliateMaterial.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ error: 'Failed to track download' });
  }
});

/**
 * ADMIN ROUTES
 * (Add requireAdmin middleware in production)
 */

// Get all affiliates (admin)
router.get('/admin/affiliates', /* requireAdmin, */ async (req, res) => {
  try {
    const { page = 1, limit = 50, status, tier, search } = req.query;

    const where = {
      ...(status && { status }),
      ...(tier && { tier }),
      ...(search && {
        OR: [
          { affiliateCode: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { name: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    const [affiliates, total] = await Promise.all([
      req.prisma.affiliateProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, name: true }
          },
          _count: {
            select: {
              referrals: true,
              commissions: true,
              payouts: true
            }
          }
        },
        orderBy: { joinedAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      req.prisma.affiliateProfile.count({ where })
    ]);

    res.json({
      affiliates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    res.status(500).json({ error: 'Failed to fetch affiliates' });
  }
});

// Get pending payouts (admin)
router.get('/admin/payouts/pending', /* requireAdmin, */ async (req, res) => {
  try {
    const payouts = await req.prisma.payout.findMany({
      where: { status: 'PENDING' },
      include: {
        affiliate: {
          include: {
            user: {
              select: { email: true, name: true }
            }
          }
        }
      },
      orderBy: { requestedAt: 'asc' }
    });

    res.json({ payouts });
  } catch (error) {
    console.error('Error fetching pending payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// Process payout (admin)
router.post('/admin/payouts/:id/process', /* requireAdmin, */ async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID required' });
    }

    const payout = await processPayout(id, transactionId, req.prisma);

    res.json({
      success: true,
      message: 'Payout processed successfully',
      payout
    });
  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(400).json({ error: error.message || 'Failed to process payout' });
  }
});

// Approve commission (admin)
router.post('/admin/commissions/:id/approve', /* requireAdmin, */ async (req, res) => {
  try {
    const { id } = req.params;

    await approveCommission(id, req.prisma);

    res.json({
      success: true,
      message: 'Commission approved'
    });
  } catch (error) {
    console.error('Error approving commission:', error);
    res.status(400).json({ error: error.message || 'Failed to approve commission' });
  }
});

// Cancel commission (admin)
router.post('/admin/commissions/:id/cancel', /* requireAdmin, */ async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await cancelCommission(id, reason || 'Cancelled by admin', req.prisma);

    res.json({
      success: true,
      message: 'Commission cancelled'
    });
  } catch (error) {
    console.error('Error cancelling commission:', error);
    res.status(400).json({ error: error.message || 'Failed to cancel commission' });
  }
});

// Update affiliate tier (admin)
router.post('/admin/affiliates/:id/update-tier', /* requireAdmin, */ async (req, res) => {
  try {
    const { id } = req.params;

    await updateAffiliateTier(id, req.prisma);

    res.json({
      success: true,
      message: 'Tier updated based on performance'
    });
  } catch (error) {
    console.error('Error updating tier:', error);
    res.status(500).json({ error: 'Failed to update tier' });
  }
});

// Create marketing material (admin)
router.post('/admin/materials', /* requireAdmin, */ async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      fileUrl,
      thumbnailUrl,
      content,
      category,
      tags,
      dimensions,
      fileSize
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type required' });
    }

    const material = await req.prisma.affiliateMaterial.create({
      data: {
        title,
        description,
        type,
        fileUrl,
        thumbnailUrl,
        content,
        category,
        tags: tags || [],
        dimensions,
        fileSize
      }
    });

    res.status(201).json({
      success: true,
      message: 'Marketing material created',
      material
    });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

// Get affiliate analytics (admin)
router.get('/admin/analytics', /* requireAdmin, */ async (req, res) => {
  try {
    const [
      totalAffiliates,
      activeAffiliates,
      totalReferrals,
      totalCommissions,
      pendingPayouts,
      totalPaid
    ] = await Promise.all([
      req.prisma.affiliateProfile.count(),
      req.prisma.affiliateProfile.count({ where: { status: 'ACTIVE' } }),
      req.prisma.referral.count(),
      req.prisma.commission.aggregate({ _sum: { amount: true } }),
      req.prisma.payout.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true }
      }),
      req.prisma.payout.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);

    res.json({
      affiliates: {
        total: totalAffiliates,
        active: activeAffiliates
      },
      referrals: {
        total: totalReferrals
      },
      commissions: {
        total: totalCommissions._sum.amount || 0
      },
      payouts: {
        pending: pendingPayouts._sum.amount || 0,
        completed: totalPaid._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
