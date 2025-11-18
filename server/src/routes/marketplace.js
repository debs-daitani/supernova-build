import express from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import { query } from '../db/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Get all listings (public + browse)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, niche, minPrice, maxPrice, minProgress, maxProgress, sort = 'newest' } = req.query;

    let query_text = `
      SELECT l.*,
             u.name as seller_name,
             u.avatar_url as seller_avatar,
             (SELECT AVG(rating) FROM marketplace_reviews WHERE listing_id = l.id) as avg_rating,
             (SELECT COUNT(*) FROM marketplace_reviews WHERE listing_id = l.id) as review_count
      FROM marketplace_listings l
      JOIN users u ON l.seller_id = u.id
      WHERE l.status = 'published'
    `;
    const values = [];
    let paramCount = 1;

    if (search) {
      query_text += ` AND to_tsvector('english', l.title || ' ' || l.description) @@ plainto_tsquery('english', $${paramCount++})`;
      values.push(search);
    }

    if (niche) {
      query_text += ` AND l.niche ILIKE $${paramCount++}`;
      values.push(`%${niche}%`);
    }

    if (minPrice) {
      query_text += ` AND l.price >= $${paramCount++}`;
      values.push(minPrice);
    }

    if (maxPrice) {
      query_text += ` AND l.price <= $${paramCount++}`;
      values.push(maxPrice);
    }

    if (minProgress) {
      query_text += ` AND l.progress_percentage >= $${paramCount++}`;
      values.push(minProgress);
    }

    if (maxProgress) {
      query_text += ` AND l.progress_percentage <= $${paramCount++}`;
      values.push(maxProgress);
    }

    // Sorting
    switch (sort) {
      case 'price-low':
        query_text += ` ORDER BY l.price ASC`;
        break;
      case 'price-high':
        query_text += ` ORDER BY l.price DESC`;
        break;
      case 'popular':
        query_text += ` ORDER BY l.view_count DESC`;
        break;
      case 'newest':
      default:
        query_text += ` ORDER BY l.created_at DESC`;
    }

    query_text += ` LIMIT 50`;

    const result = await query(query_text, values);

    res.json({
      listings: result.rows.map(l => ({
        id: l.id,
        title: l.title,
        description: l.description.substring(0, 200) + '...', // Truncate for list view
        niche: l.niche,
        price: l.price,
        progressPercentage: l.progress_percentage,
        images: l.images,
        viewCount: l.view_count,
        isFeatured: l.is_featured,
        seller: {
          id: l.seller_id,
          name: l.seller_name,
          avatar: l.seller_avatar
        },
        avgRating: l.avg_rating ? parseFloat(l.avg_rating).toFixed(1) : null,
        reviewCount: parseInt(l.review_count),
        createdAt: l.created_at
      }))
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

// Get single listing (public)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    // Increment view count
    await query(
      'UPDATE marketplace_listings SET view_count = view_count + 1 WHERE id = $1',
      [req.params.id]
    );

    // Get listing details
    const listingResult = await query(
      `SELECT l.*,
              u.id as seller_id, u.name as seller_name, u.avatar_url as seller_avatar,
              u.created_at as seller_member_since,
              (SELECT AVG(rating) FROM marketplace_reviews WHERE listing_id = l.id) as avg_rating,
              (SELECT COUNT(*) FROM marketplace_reviews WHERE listing_id = l.id) as review_count
       FROM marketplace_listings l
       JOIN users u ON l.seller_id = u.id
       WHERE l.id = $1 AND l.status = 'published'`,
      [req.params.id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingResult.rows[0];

    // Get reviews
    const reviewsResult = await query(
      `SELECT r.*, u.name as buyer_name, u.avatar_url as buyer_avatar
       FROM marketplace_reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.listing_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    res.json({
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        niche: listing.niche,
        price: listing.price,
        progressPercentage: listing.progress_percentage,
        whatIncluded: listing.what_included || [],
        whatNeeded: listing.what_needed,
        images: listing.images || [],
        viewCount: listing.view_count,
        isFeatured: listing.is_featured,
        seller: {
          id: listing.seller_id,
          name: listing.seller_name,
          avatar: listing.seller_avatar,
          memberSince: listing.seller_member_since
        },
        avgRating: listing.avg_rating ? parseFloat(listing.avg_rating).toFixed(1) : null,
        reviewCount: parseInt(listing.review_count),
        createdAt: listing.created_at,
        updatedAt: listing.updated_at
      },
      reviews: reviewsResult.rows.map(r => ({
        id: r.id,
        rating: r.rating,
        text: r.review_text,
        buyer: {
          name: r.buyer_name,
          avatar: r.buyer_avatar
        },
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Failed to get listing' });
  }
});

// Create listing (seller)
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('niche').optional().trim(),
    body('progressPercentage').optional().isInt({ min: 0, max: 100 }),
    body('whatIncluded').optional().isArray(),
    body('whatNeeded').optional().trim(),
    body('images').optional().isArray(),
    body('status').optional().isIn(['draft', 'published'])
  ],
  validate,
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        niche = null,
        progressPercentage = 0,
        whatIncluded = [],
        whatNeeded = '',
        images = [],
        status = 'draft'
      } = req.body;

      const result = await query(
        `INSERT INTO marketplace_listings
         (seller_id, title, description, price, niche, progress_percentage,
          what_included, what_needed, images, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [req.user.id, title, description, price, niche, progressPercentage,
         whatIncluded, whatNeeded, JSON.stringify(images), status]
      );

      const listing = result.rows[0];

      res.status(201).json({
        listing: {
          id: listing.id,
          title: listing.title,
          description: listing.description,
          price: listing.price,
          status: listing.status,
          createdAt: listing.created_at
        }
      });
    } catch (error) {
      console.error('Create listing error:', error);
      res.status(500).json({ error: 'Failed to create listing' });
    }
  }
);

// Get seller's listings
router.get('/seller/my-listings', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT l.*,
              (SELECT COUNT(*) FROM marketplace_messages WHERE listing_id = l.id) as message_count
       FROM marketplace_listings l
       WHERE l.seller_id = $1
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );

    res.json({
      listings: result.rows.map(l => ({
        id: l.id,
        title: l.title,
        price: l.price,
        status: l.status,
        viewCount: l.view_count,
        messageCount: parseInt(l.message_count),
        soldAt: l.sold_at,
        createdAt: l.created_at
      }))
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

// Update listing
router.patch(
  '/:id',
  authenticate,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { title, description, price, status, whatIncluded, whatNeeded, images, niche, progressPercentage } = req.body;

      // Build update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (price !== undefined) {
        updates.push(`price = $${paramCount++}`);
        values.push(price);
      }
      if (status !== undefined) {
        updates.push(`status = $${paramCount++}`);
        values.push(status);
      }
      if (whatIncluded !== undefined) {
        updates.push(`what_included = $${paramCount++}`);
        values.push(whatIncluded);
      }
      if (whatNeeded !== undefined) {
        updates.push(`what_needed = $${paramCount++}`);
        values.push(whatNeeded);
      }
      if (images !== undefined) {
        updates.push(`images = $${paramCount++}`);
        values.push(JSON.stringify(images));
      }
      if (niche !== undefined) {
        updates.push(`niche = $${paramCount++}`);
        values.push(niche);
      }
      if (progressPercentage !== undefined) {
        updates.push(`progress_percentage = $${paramCount++}`);
        values.push(progressPercentage);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(req.params.id);
      values.push(req.user.id);

      const query_text = `
        UPDATE marketplace_listings
        SET ${updates.join(', ')}
        WHERE id = $${paramCount++} AND seller_id = $${paramCount}
        RETURNING *
      `;

      const result = await query(query_text, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found or you are not the seller' });
      }

      res.json({ listing: result.rows[0] });
    } catch (error) {
      console.error('Update listing error:', error);
      res.status(500).json({ error: 'Failed to update listing' });
    }
  }
);

// Delete listing
router.delete(
  '/:id',
  authenticate,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const result = await query(
        'DELETE FROM marketplace_listings WHERE id = $1 AND seller_id = $2 RETURNING id',
        [req.params.id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found or you are not the seller' });
      }

      res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
      console.error('Delete listing error:', error);
      res.status(500).json({ error: 'Failed to delete listing' });
    }
  }
);

// Send message to seller
router.post(
  '/:id/messages',
  authenticate,
  [
    param('id').isUUID(),
    body('message').notEmpty().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const { message } = req.body;

      // Get listing and seller
      const listingResult = await query(
        'SELECT seller_id FROM marketplace_listings WHERE id = $1',
        [req.params.id]
      );

      if (listingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      const sellerId = listingResult.rows[0].seller_id;

      if (sellerId === req.user.id) {
        return res.status(400).json({ error: 'Cannot message your own listing' });
      }

      // Create message
      await query(
        `INSERT INTO marketplace_messages (listing_id, sender_id, recipient_id, message)
         VALUES ($1, $2, $3, $4)`,
        [req.params.id, req.user.id, sellerId, message]
      );

      // TODO: Send email notification to seller

      res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Send marketplace message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// Get messages for a listing (seller or buyer)
router.get('/:id/messages', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
       FROM marketplace_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.listing_id = $1 AND (m.sender_id = $2 OR m.recipient_id = $2)
       ORDER BY m.created_at ASC`,
      [req.params.id, req.user.id]
    );

    res.json({
      messages: result.rows.map(m => ({
        id: m.id,
        message: m.message,
        senderId: m.sender_id,
        senderName: m.sender_name,
        senderAvatar: m.sender_avatar,
        isRead: m.is_read,
        createdAt: m.created_at
      }))
    });
  } catch (error) {
    console.error('Get marketplace messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;
