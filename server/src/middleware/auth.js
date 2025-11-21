const { verifyToken } = require('../utils/jwt');
const { prisma } = require('../config/database');

/**
 * Middleware to require authentication
 * Validates JWT token and attaches user to request
 */
async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header or cookie
    let token = req.headers.authorization?.replace('Bearer ', '');

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        subscription: {
          include: {
            tier: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Middleware to optionally attach user if token is present
 * Does not fail if token is missing or invalid
 */
async function optionalAuth(req, res, next) {
  try {
    // Get token from Authorization header or cookie
    let token = req.headers.authorization?.replace('Bearer ', '');

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return next();
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        subscription: {
          include: {
            tier: true
          }
        }
      }
    });

    if (user) {
      req.user = user;
      req.userId = user.id;
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
}

/**
 * Middleware to require a specific subscription tier or higher
 * @param {string} requiredTier - Required tier name (BRAVE, BOLD, or BADASS)
 */
function requireTier(requiredTier) {
  const tierHierarchy = {
    'BRAVE': 1,
    'BOLD': 2,
    'BADASS': 3
  };

  return async function(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!req.user.subscription) {
      return res.status(403).json({
        success: false,
        error: 'Subscription required'
      });
    }

    const userTierLevel = tierHierarchy[req.user.subscription.tier.name];
    const requiredTierLevel = tierHierarchy[requiredTier];

    if (!userTierLevel || !requiredTierLevel) {
      return res.status(500).json({
        success: false,
        error: 'Invalid tier configuration'
      });
    }

    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        success: false,
        error: `${requiredTier} tier or higher required`,
        currentTier: req.user.subscription.tier.name,
        requiredTier
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  optionalAuth,
  requireTier
};
