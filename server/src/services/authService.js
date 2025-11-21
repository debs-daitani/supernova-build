const { prisma } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const crypto = require('crypto');

/**
 * Register a new user
 * @param {Object} data - User registration data
 * @param {string} data.email - User email
 * @param {string} data.password - User password (plain text)
 * @param {string} data.fullName - User's full name
 * @param {string} data.preferredName - User's preferred name
 * @param {string} data.pronouns - User's pronouns (optional)
 * @returns {Promise<Object>} User object and token
 */
async function register(data) {
  const { email, password, fullName, preferredName, pronouns } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user with profile
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      profile: {
        create: {
          fullName,
          preferredName,
          pronouns: pronouns || null,
          onboardingCompleted: false
        }
      }
    },
    include: {
      profile: true
    }
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
}

/**
 * Login a user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} User object and token
 */
async function login(credentials) {
  const { email, password } = credentials;

  // Find user with profile and subscription
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
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
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email
  });

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
}

/**
 * Request a password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Reset token (in production, email this to user)
 */
async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    // Don't reveal if user exists
    return {
      success: true,
      message: 'If an account exists, a password reset email will be sent'
    };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Save reset token to database
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    }
  });

  // In production, email this token to the user
  // For now, return it (for testing purposes only)
  return {
    success: true,
    message: 'Password reset email sent',
    resetToken // Remove this in production
  };
}

/**
 * Reset password using reset token
 * @param {Object} data - Reset data
 * @param {string} data.token - Reset token
 * @param {string} data.newPassword - New password
 * @returns {Promise<Object>} Success message
 */
async function resetPassword(data) {
  const { token, newPassword } = data;

  // Find valid reset token
  const passwordReset = await prisma.passwordReset.findFirst({
    where: {
      token,
      used: false,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  });

  if (!passwordReset) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and mark token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: passwordReset.userId },
      data: { password: hashedPassword }
    }),
    prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true }
    }),
    // Invalidate all existing sessions
    prisma.session.deleteMany({
      where: { userId: passwordReset.userId }
    })
  ]);

  return {
    success: true,
    message: 'Password reset successful'
  };
}

/**
 * Validate and get user session
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object
 */
async function validateSession(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    throw new Error('User not found');
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

/**
 * Logout a user (invalidate session)
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Success message
 */
async function logout(token) {
  // Delete session from database
  await prisma.session.deleteMany({
    where: { token }
  });

  return {
    success: true,
    message: 'Logged out successfully'
  };
}

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  validateSession,
  logout
};
