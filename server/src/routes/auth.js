import express from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { query } from '../db/database.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import crypto from 'crypto';

const router = express.Router();

// Sign up
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').notEmpty().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const result = await query(
        `INSERT INTO users (email, password, name, email_verification_token)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role, subscription_status, created_at`,
        [email, hashedPassword, name, emailVerificationToken]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = generateToken(user.id);

      // TODO: Send verification email
      console.log(`📧 Email verification token for ${email}: ${emailVerificationToken}`);

      res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionStatus: user.subscription_status
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Get user from database
      const result = await query(
        'SELECT id, email, password, name, role, subscription_status FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      res.json({
        message: 'Logged in successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionStatus: user.subscription_status
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to log in' });
    }
  }
);

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, name, avatar_url, bio, location, niche, skills, social_links,
              role, subscription_status, email_verified, profile_visibility, show_in_directory,
              created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        location: user.location,
        niche: user.niche,
        skills: user.skills || [],
        socialLinks: user.social_links || {},
        role: user.role,
        subscriptionStatus: user.subscription_status,
        emailVerified: user.email_verified,
        profileVisibility: user.profile_visibility,
        showInDirectory: user.show_in_directory,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Request password reset
router.post(
  '/password-reset/request',
  [body('email').isEmail().normalizeEmail()],
  validate,
  async (req, res) => {
    try {
      const { email } = req.body;

      // Find user
      const result = await query('SELECT id FROM users WHERE email = $1', [email]);

      if (result.rows.length === 0) {
        // Don't reveal if email exists
        return res.json({ message: 'If an account exists, a password reset email has been sent' });
      }

      const userId = result.rows[0].id;

      // Generate reset token (expires in 1 hour)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      // Save reset token
      await query(
        'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
        [resetToken, resetExpires, userId]
      );

      // TODO: Send password reset email
      console.log(`📧 Password reset token for ${email}: ${resetToken}`);

      res.json({ message: 'If an account exists, a password reset email has been sent' });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }
);

// Reset password
router.post(
  '/password-reset/confirm',
  [
    body('token').notEmpty(),
    body('newPassword').isLength({ min: 8 })
  ],
  validate,
  async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      // Find user with valid token
      const result = await query(
        'SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      const userId = result.rows[0].id;

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await query(
        'UPDATE users SET password = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
        [hashedPassword, userId]
      );

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
);

// Update user profile
router.patch(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().notEmpty(),
    body('bio').optional().trim(),
    body('location').optional().trim(),
    body('niche').optional().trim(),
    body('skills').optional().isArray(),
    body('socialLinks').optional().isObject()
  ],
  validate,
  async (req, res) => {
    try {
      const { name, bio, location, niche, skills, socialLinks } = req.body;

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (bio !== undefined) {
        updates.push(`bio = $${paramCount++}`);
        values.push(bio);
      }
      if (location !== undefined) {
        updates.push(`location = $${paramCount++}`);
        values.push(location);
      }
      if (niche !== undefined) {
        updates.push(`niche = $${paramCount++}`);
        values.push(niche);
      }
      if (skills !== undefined) {
        updates.push(`skills = $${paramCount++}`);
        values.push(skills);
      }
      if (socialLinks !== undefined) {
        updates.push(`social_links = $${paramCount++}`);
        values.push(JSON.stringify(socialLinks));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(req.user.id);

      const query_text = `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, name, bio, location, niche, skills, social_links
      `;

      const result = await query(query_text, values);
      const user = result.rows[0];

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          name: user.name,
          bio: user.bio,
          location: user.location,
          niche: user.niche,
          skills: user.skills || [],
          socialLinks: user.social_links || {}
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
);

export default router;
