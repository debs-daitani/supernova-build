/**
 * Affiliate Tracking Middleware
 * Tracks referral links via cookies and URLs
 */

const { trackReferralClick, validateReferralCode } = require('../services/affiliateService');

/**
 * Cookie configuration
 */
const REFERRAL_COOKIE_NAME = 'supernova_referral';
const REFERRAL_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Extract referral code from various URL patterns
 * @param {object} req - Express request object
 * @returns {string|null} Referral code if found
 */
function extractReferralCode(req) {
  // Check query parameters: ?ref=CODE or ?affiliate=CODE
  if (req.query.ref) {
    return req.query.ref.toUpperCase();
  }

  if (req.query.affiliate) {
    return req.query.affiliate.toUpperCase();
  }

  // Check short URL pattern: /r/CODE
  if (req.path.startsWith('/r/')) {
    const code = req.path.split('/r/')[1]?.split('/')[0];
    return code ? code.toUpperCase() : null;
  }

  return null;
}

/**
 * Get tracking data from request
 * @param {object} req - Express request
 * @returns {object} Tracking data
 */
function getTrackingData(req) {
  return {
    ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
    userAgent: req.get('user-agent'),
    referer: req.get('referer') || req.get('referrer'),
    landingPage: req.originalUrl || req.url,
    utmSource: req.query.utm_source,
    utmMedium: req.query.utm_medium,
    utmCampaign: req.query.utm_campaign
  };
}

/**
 * Main tracking middleware
 * Automatically tracks referral codes and sets cookies
 */
function trackReferrals(prisma) {
  return async (req, res, next) => {
    try {
      // Extract referral code from URL
      const referralCode = extractReferralCode(req);

      if (referralCode) {
        // Validate code exists and is active
        const isValid = await validateReferralCode(referralCode, prisma);

        if (isValid) {
          // Set cookie for attribution (30 days)
          res.cookie(REFERRAL_COOKIE_NAME, referralCode, {
            maxAge: REFERRAL_COOKIE_MAX_AGE,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
          });

          // Track the click in database
          const trackingData = getTrackingData(req);
          await trackReferralClick(referralCode, trackingData, prisma);

          console.log(`[Affiliate] Tracked referral click: ${referralCode}`);
        } else {
          console.warn(`[Affiliate] Invalid referral code: ${referralCode}`);
        }
      }

      // Attach referral code to request (from cookie or URL)
      req.referralCode = referralCode || req.cookies?.[REFERRAL_COOKIE_NAME] || null;

      next();
    } catch (error) {
      // Don't block request if tracking fails
      console.error('[Affiliate] Tracking error:', error);
      next();
    }
  };
}

/**
 * Get current referral code for user
 * Use in signup/registration routes
 * @param {object} req - Express request
 * @returns {string|null} Referral code
 */
function getReferralCode(req) {
  // Priority: URL parameter > Cookie
  const urlCode = extractReferralCode(req);
  const cookieCode = req.cookies?.[REFERRAL_COOKIE_NAME];

  return urlCode || cookieCode || null;
}

/**
 * Clear referral cookie (after signup attribution)
 * @param {object} res - Express response
 */
function clearReferralCookie(res) {
  res.clearCookie(REFERRAL_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

/**
 * Middleware to attach referral info to request
 * Use this in authentication/signup routes
 */
function attachReferralInfo(req, res, next) {
  req.referralCode = getReferralCode(req);
  next();
}

/**
 * Short URL redirect handler
 * Handles /r/CODE format and redirects to homepage
 */
function handleShortUrl(prisma) {
  return async (req, res) => {
    const referralCode = req.params.code?.toUpperCase();

    if (!referralCode) {
      return res.redirect('/');
    }

    try {
      // Validate code
      const isValid = await validateReferralCode(referralCode, prisma);

      if (!isValid) {
        console.warn(`[Affiliate] Invalid short URL code: ${referralCode}`);
        return res.redirect('/');
      }

      // Set cookie
      res.cookie(REFERRAL_COOKIE_NAME, referralCode, {
        maxAge: REFERRAL_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });

      // Track click
      const trackingData = getTrackingData(req);
      await trackReferralClick(referralCode, trackingData, prisma);

      // Redirect to signup or homepage
      const redirectTo = req.query.to || '/signup';
      res.redirect(redirectTo);

    } catch (error) {
      console.error('[Affiliate] Short URL error:', error);
      res.redirect('/');
    }
  };
}

/**
 * Conversion tracking helper
 * Call this after successful signup/purchase
 * @param {string} referralCode - Referral code
 * @param {string} userId - New user ID
 * @param {object} prisma - Prisma client
 */
async function markConversion(referralCode, userId, prisma) {
  if (!referralCode || !userId) return;

  try {
    // Update referral click record
    await prisma.referralClick.updateMany({
      where: {
        affiliateCode: referralCode,
        converted: false,
        // Only update recent clicks (within 30 days)
        clickedAt: {
          gte: new Date(Date.now() - REFERRAL_COOKIE_MAX_AGE)
        }
      },
      data: {
        converted: true,
        convertedUserId: userId
      }
    });

    console.log(`[Affiliate] Marked conversion for ${referralCode} -> User ${userId}`);
  } catch (error) {
    console.error('[Affiliate] Conversion tracking error:', error);
  }
}

/**
 * Analytics helper - get referral stats
 * @param {string} affiliateCode - Affiliate code
 * @param {object} prisma - Prisma client
 * @returns {object} Click and conversion stats
 */
async function getReferralStats(affiliateCode, prisma) {
  if (!affiliateCode) return null;

  try {
    const clicks = await prisma.referralClick.count({
      where: { affiliateCode }
    });

    const conversions = await prisma.referralClick.count({
      where: {
        affiliateCode,
        converted: true
      }
    });

    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

    return {
      clicks,
      conversions,
      conversionRate: conversionRate.toFixed(2)
    };
  } catch (error) {
    console.error('[Affiliate] Stats error:', error);
    return null;
  }
}

module.exports = {
  trackReferrals,
  getReferralCode,
  clearReferralCookie,
  attachReferralInfo,
  handleShortUrl,
  markConversion,
  getReferralStats,
  REFERRAL_COOKIE_NAME,
  REFERRAL_COOKIE_MAX_AGE
};
