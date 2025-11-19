import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        accountType: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireUpgradeOrMember = (req, res, next) => {
  if (!['UPGRADE', 'MEMBER'].includes(req.user?.accountType)) {
    return res.status(403).json({
      error: 'Upgrade or membership required',
      accountType: req.user?.accountType
    });
  }
  next();
};

export const requireMember = (req, res, next) => {
  if (req.user?.accountType !== 'MEMBER') {
    return res.status(403).json({
      error: 'Active membership required',
      accountType: req.user?.accountType
    });
  }
  next();
};
