import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

// Verify JWT token and attach user to request
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountType: true,
        isAdmin: true,
        subscription_status: true,
      },
    });

    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    console.error('Authentication error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional authentication: attach user if token present, otherwise continue
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, name: true, role: true, accountType: true, isAdmin: true, subscription_status: true } });
    if (user) req.user = user;
    return next();
  } catch (err) {
    // ignore invalid token and continue
    return next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

export const requireSubscription = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  const status = req.user.subscription_status || req.user.accountType;
  if (!['UPGRADE', 'MEMBER', 'upgraded', 'monthly', 'annual'].includes(status)) {
    return res.status(403).json({ error: 'Subscription required' });
  }
  next();
};

export const requireMember = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.accountType !== 'MEMBER') return res.status(403).json({ error: 'Active membership required' });
  next();
};
