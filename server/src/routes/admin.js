import express from 'express';
import { body, param } from 'express-validator';
import { query } from '../db/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Total users
    const totalUsersResult = await query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Active users (last 30 days)
    const activeUsersResult = await query(
      `SELECT COUNT(DISTINCT user_id) FROM conversations
       WHERE last_message_at > NOW() - INTERVAL '30 days'`
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Total revenue
    const revenueResult = await query(
      `SELECT SUM(amount) as total FROM payments WHERE status = 'succeeded'`
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0;

    // MRR (Monthly Recurring Revenue)
    const mrrResult = await query(
      `SELECT SUM(
         CASE
           WHEN subscription_status = 'monthly' THEN 26
           WHEN subscription_status = 'annual' THEN 21.67
           ELSE 0
         END
       ) as mrr FROM users`
    );
    const mrr = parseFloat(mrrResult.rows[0].mrr) || 0;

    // New signups (last 30 days)
    const newSignupsResult = await query(
      `SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'`
    );
    const newSignups = parseInt(newSignupsResult.rows[0].count);

    // Subscription breakdown
    const subsResult = await query(
      `SELECT subscription_status, COUNT(*) as count
       FROM users
       GROUP BY subscription_status`
    );

    const subscriptionBreakdown = {};
    subsResult.rows.forEach(row => {
      subscriptionBreakdown[row.subscription_status] = parseInt(row.count);
    });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalRevenue,
        mrr,
        newSignups,
        subscriptionBreakdown
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get all users with filters
router.get('/users', async (req, res) => {
  try {
    const { search, role, subscriptionStatus, limit = 50, offset = 0 } = req.query;

    let query_text = `
      SELECT id, email, name, role, subscription_status, email_verified, created_at
      FROM users
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (search) {
      query_text += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      query_text += ` AND role = $${paramCount++}`;
      values.push(role);
    }

    if (subscriptionStatus) {
      query_text += ` AND subscription_status = $${paramCount++}`;
      values.push(subscriptionStatus);
    }

    query_text += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await query(query_text, values);

    res.json({
      users: result.rows.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        subscriptionStatus: u.subscription_status,
        emailVerified: u.email_verified,
        createdAt: u.created_at
      }))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user role/subscription
router.patch(
  '/users/:id',
  [
    param('id').isUUID(),
    body('role').optional().isIn(['user', 'admin']),
    body('subscriptionStatus').optional().isIn(['free', 'upgraded', 'monthly', 'annual'])
  ],
  validate,
  async (req, res) => {
    try {
      const { role, subscriptionStatus } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (role !== undefined) {
        updates.push(`role = $${paramCount++}`);
        values.push(role);
      }

      if (subscriptionStatus !== undefined) {
        updates.push(`subscription_status = $${paramCount++}`);
        values.push(subscriptionStatus);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(req.params.id);

      const query_text = `
        UPDATE users
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING id, email, name, role, subscription_status
      `;

      const result = await query(query_text, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

// Get all content library items
router.get('/content', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM content_library ORDER BY created_at DESC`
    );

    res.json({
      content: result.rows
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to get content' });
  }
});

// Create content library item
router.post(
  '/content',
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('contentType').isIn(['video', 'pdf', 'audio', 'template', 'article']),
    body('pillar').optional().isIn(['body', 'brain', 'business', 'all']),
    body('fileUrl').notEmpty().trim(),
    body('accessLevel').optional().isIn(['free', 'upgraded', 'subscription'])
  ],
  validate,
  async (req, res) => {
    try {
      const {
        title,
        description,
        contentType,
        pillar = 'all',
        thumbnailUrl = null,
        fileUrl,
        duration = null,
        tags = [],
        accessLevel = 'free'
      } = req.body;

      const result = await query(
        `INSERT INTO content_library
         (title, description, content_type, pillar, thumbnail_url, file_url, duration, tags, access_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [title, description, contentType, pillar, thumbnailUrl, fileUrl, duration, tags, accessLevel]
      );

      res.status(201).json({ content: result.rows[0] });
    } catch (error) {
      console.error('Create content error:', error);
      res.status(500).json({ error: 'Failed to create content' });
    }
  }
);

// Delete content item
router.delete(
  '/content/:id',
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      await query('DELETE FROM content_library WHERE id = $1', [req.params.id]);
      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Delete content error:', error);
      res.status(500).json({ error: 'Failed to delete content' });
    }
  }
);

// Get all marketplace listings (including drafts)
router.get('/marketplace', async (req, res) => {
  try {
    const result = await query(
      `SELECT l.*, u.name as seller_name
       FROM marketplace_listings l
       JOIN users u ON l.seller_id = u.id
       ORDER BY l.created_at DESC`
    );

    res.json({ listings: result.rows });
  } catch (error) {
    console.error('Get marketplace listings error:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

// Feature/unfeature listing
router.patch(
  '/marketplace/:id/feature',
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const result = await query(
        `UPDATE marketplace_listings
         SET is_featured = NOT is_featured
         WHERE id = $1
         RETURNING is_featured`,
        [req.params.id]
      );

      res.json({ isFeatured: result.rows[0].is_featured });
    } catch (error) {
      console.error('Feature listing error:', error);
      res.status(500).json({ error: 'Failed to feature listing' });
    }
  }
);

// Remove listing
router.delete(
  '/marketplace/:id',
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      await query('DELETE FROM marketplace_listings WHERE id = $1', [req.params.id]);
      res.json({ message: 'Listing removed successfully' });
    } catch (error) {
      console.error('Remove listing error:', error);
      res.status(500).json({ error: 'Failed to remove listing' });
    }
  }
);

// Get all forum posts (for moderation)
router.get('/forums/posts', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, u.name as author_name, c.name as category_name
       FROM forum_posts p
       JOIN users u ON p.author_id = u.id
       JOIN forum_categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC
       LIMIT 100`
    );

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Delete forum post
router.delete(
  '/forums/posts/:id',
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      await query('DELETE FROM forum_posts WHERE id = $1', [req.params.id]);
      res.json({ message: 'Post removed successfully' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  }
);

// Get all payments
router.get('/payments', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    let query_text = `
      SELECT p.*, u.name as user_name, u.email as user_email
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (startDate) {
      query_text += ` AND p.created_at >= $${paramCount++}`;
      values.push(startDate);
    }

    if (endDate) {
      query_text += ` AND p.created_at <= $${paramCount++}`;
      values.push(endDate);
    }

    if (type) {
      query_text += ` AND p.payment_type = $${paramCount++}`;
      values.push(type);
    }

    query_text += ` ORDER BY p.created_at DESC LIMIT 100`;

    const result = await query(query_text, values);

    res.json({
      payments: result.rows.map(p => ({
        id: p.id,
        user: {
          name: p.user_name,
          email: p.user_email
        },
        amount: p.amount,
        currency: p.currency,
        type: p.payment_type,
        status: p.status,
        createdAt: p.created_at
      }))
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

export default router;
