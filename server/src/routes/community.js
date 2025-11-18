import express from 'express';
import { body, param, query as queryValidator } from 'express-validator';
import { query } from '../db/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Get member directory
router.get('/members', optionalAuth, async (req, res) => {
  try {
    const { search, niche, location } = req.query;

    let query_text = `
      SELECT id, name, avatar_url, bio, location, niche, skills, created_at
      FROM users
      WHERE show_in_directory = true
    `;
    const values = [];
    let paramCount = 1;

    if (search) {
      query_text += ` AND name ILIKE $${paramCount++}`;
      values.push(`%${search}%`);
    }

    if (niche) {
      query_text += ` AND niche ILIKE $${paramCount++}`;
      values.push(`%${niche}%`);
    }

    if (location) {
      query_text += ` AND location ILIKE $${paramCount++}`;
      values.push(`%${location}%`);
    }

    query_text += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await query(query_text, values);

    res.json({
      members: result.rows.map(m => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar_url,
        bio: m.bio,
        location: m.location,
        niche: m.niche,
        skills: m.skills || [],
        memberSince: m.created_at
      }))
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
});

// Get member profile
router.get('/members/:id', optionalAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, avatar_url, bio, location, niche, skills, social_links, created_at
       FROM users
       WHERE id = $1 AND (show_in_directory = true OR profile_visibility = 'public')`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found or profile is private' });
    }

    const member = result.rows[0];

    // Get recent forum posts
    const postsResult = await query(
      `SELECT p.id, p.title, p.created_at, c.name as category_name
       FROM forum_posts p
       JOIN forum_categories c ON p.category_id = c.id
       WHERE p.author_id = $1
       ORDER BY p.created_at DESC
       LIMIT 5`,
      [req.params.id]
    );

    res.json({
      member: {
        id: member.id,
        name: member.name,
        avatar: member.avatar_url,
        bio: member.bio,
        location: member.location,
        niche: member.niche,
        skills: member.skills || [],
        socialLinks: member.social_links || {},
        memberSince: member.created_at,
        recentPosts: postsResult.rows
      }
    });
  } catch (error) {
    console.error('Get member profile error:', error);
    res.status(500).json({ error: 'Failed to get member profile' });
  }
});

// Get forum categories
router.get('/forums/categories', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM forum_posts WHERE category_id = c.id) as post_count
       FROM forum_categories c
       ORDER BY c.id ASC`
    );

    res.json({
      categories: result.rows.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        pillar: c.pillar,
        postCount: parseInt(c.post_count)
      }))
    });
  } catch (error) {
    console.error('Get forum categories error:', error);
    res.status(500).json({ error: 'Failed to get forum categories' });
  }
});

// Get posts in category
router.get('/forums/categories/:slug/posts', async (req, res) => {
  try {
    const { sort = 'recent' } = req.query;

    // Get category
    const catResult = await query(
      'SELECT id FROM forum_categories WHERE slug = $1',
      [req.params.slug]
    );

    if (catResult.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryId = catResult.rows[0].id;

    // Get posts
    let sortClause = 'ORDER BY p.created_at DESC';
    if (sort === 'popular') {
      sortClause = 'ORDER BY p.like_count DESC, p.comment_count DESC';
    }

    const result = await query(
      `SELECT p.*, u.name as author_name, u.avatar_url as author_avatar
       FROM forum_posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.category_id = $1
       ${sortClause}
       LIMIT 50`,
      [categoryId]
    );

    res.json({
      posts: result.rows.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content.substring(0, 200) + '...', // Truncate
        author: {
          id: p.author_id,
          name: p.author_name,
          avatar: p.author_avatar
        },
        likeCount: p.like_count,
        commentCount: p.comment_count,
        viewCount: p.view_count,
        isPinned: p.is_pinned,
        createdAt: p.created_at
      }))
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Get single post with comments
router.get('/forums/posts/:id', async (req, res) => {
  try {
    // Increment view count
    await query(
      'UPDATE forum_posts SET view_count = view_count + 1 WHERE id = $1',
      [req.params.id]
    );

    // Get post
    const postResult = await query(
      `SELECT p.*, u.name as author_name, u.avatar_url as author_avatar,
              c.name as category_name, c.slug as category_slug
       FROM forum_posts p
       JOIN users u ON p.author_id = u.id
       JOIN forum_categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];

    // Get comments
    const commentsResult = await query(
      `SELECT c.*, u.name as author_name, u.avatar_url as author_avatar
       FROM forum_comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );

    res.json({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        author: {
          id: post.author_id,
          name: post.author_name,
          avatar: post.author_avatar
        },
        category: {
          name: post.category_name,
          slug: post.category_slug
        },
        likeCount: post.like_count,
        commentCount: post.comment_count,
        viewCount: post.view_count,
        isPinned: post.is_pinned,
        createdAt: post.created_at,
        updatedAt: post.updated_at
      },
      comments: commentsResult.rows.map(c => ({
        id: c.id,
        content: c.content,
        author: {
          id: c.author_id,
          name: c.author_name,
          avatar: c.author_avatar
        },
        parentCommentId: c.parent_comment_id,
        likeCount: c.like_count,
        createdAt: c.created_at
      }))
    });
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// Create post
router.post(
  '/forums/posts',
  authenticate,
  [
    body('categoryId').isUUID(),
    body('title').notEmpty().trim(),
    body('content').notEmpty().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const { categoryId, title, content } = req.body;

      const result = await query(
        `INSERT INTO forum_posts (category_id, author_id, title, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [categoryId, req.user.id, title, content]
      );

      // Update category post count
      await query(
        'UPDATE forum_categories SET post_count = post_count + 1 WHERE id = $1',
        [categoryId]
      );

      res.status(201).json({ post: result.rows[0] });
    } catch (error) {
      console.error('Create forum post error:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }
);

// Create comment
router.post(
  '/forums/posts/:id/comments',
  authenticate,
  [
    param('id').isUUID(),
    body('content').notEmpty().trim(),
    body('parentCommentId').optional().isUUID()
  ],
  validate,
  async (req, res) => {
    try {
      const { content, parentCommentId = null } = req.body;

      const result = await query(
        `INSERT INTO forum_comments (post_id, author_id, parent_comment_id, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.params.id, req.user.id, parentCommentId, content]
      );

      // Update post comment count
      await query(
        'UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = $1',
        [req.params.id]
      );

      res.status(201).json({ comment: result.rows[0] });
    } catch (error) {
      console.error('Create forum comment error:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }
);

// Like post
router.post(
  '/forums/posts/:id/like',
  authenticate,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      // Check if already liked
      const existing = await query(
        'SELECT id FROM forum_post_likes WHERE post_id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );

      if (existing.rows.length > 0) {
        // Unlike
        await query(
          'DELETE FROM forum_post_likes WHERE post_id = $1 AND user_id = $2',
          [req.params.id, req.user.id]
        );
        await query(
          'UPDATE forum_posts SET like_count = like_count - 1 WHERE id = $1',
          [req.params.id]
        );
        return res.json({ liked: false });
      } else {
        // Like
        await query(
          'INSERT INTO forum_post_likes (post_id, user_id) VALUES ($1, $2)',
          [req.params.id, req.user.id]
        );
        await query(
          'UPDATE forum_posts SET like_count = like_count + 1 WHERE id = $1',
          [req.params.id]
        );
        return res.json({ liked: true });
      }
    } catch (error) {
      console.error('Like post error:', error);
      res.status(500).json({ error: 'Failed to like post' });
    }
  }
);

// Direct messages
router.get('/messages', authenticate, async (req, res) => {
  try {
    // Get all conversations (grouped by other user)
    const result = await query(
      `SELECT DISTINCT ON (other_user_id)
              other_user_id, other_user_name, other_user_avatar,
              message, is_read, created_at
       FROM (
         SELECT
           CASE WHEN sender_id = $1 THEN recipient_id ELSE sender_id END as other_user_id,
           u.name as other_user_name,
           u.avatar_url as other_user_avatar,
           message,
           is_read,
           created_at
         FROM direct_messages dm
         JOIN users u ON u.id = CASE WHEN dm.sender_id = $1 THEN dm.recipient_id ELSE dm.sender_id END
         WHERE sender_id = $1 OR recipient_id = $1
         ORDER BY created_at DESC
       ) conversations
       ORDER BY other_user_id, created_at DESC`,
      [req.user.id]
    );

    res.json({
      conversations: result.rows.map(c => ({
        userId: c.other_user_id,
        userName: c.other_user_name,
        userAvatar: c.other_user_avatar,
        lastMessage: c.message,
        isRead: c.is_read,
        lastMessageAt: c.created_at
      }))
    });
  } catch (error) {
    console.error('Get DM conversations error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get messages with specific user
router.get('/messages/:userId', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT dm.*, u.name as sender_name, u.avatar_url as sender_avatar
       FROM direct_messages dm
       JOIN users u ON dm.sender_id = u.id
       WHERE (sender_id = $1 AND recipient_id = $2)
          OR (sender_id = $2 AND recipient_id = $1)
       ORDER BY created_at ASC`,
      [req.user.id, req.params.userId]
    );

    // Mark messages as read
    await query(
      `UPDATE direct_messages
       SET is_read = true
       WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false`,
      [req.user.id, req.params.userId]
    );

    res.json({
      messages: result.rows.map(m => ({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        senderAvatar: m.sender_avatar,
        message: m.message,
        isRead: m.is_read,
        createdAt: m.created_at
      }))
    });
  } catch (error) {
    console.error('Get DM messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send direct message
router.post(
  '/messages/:userId',
  authenticate,
  [
    param('userId').isUUID(),
    body('message').notEmpty().trim()
  ],
  validate,
  async (req, res) => {
    try {
      const { message } = req.body;

      const result = await query(
        `INSERT INTO direct_messages (sender_id, recipient_id, message)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [req.user.id, req.params.userId, message]
      );

      // TODO: Send email/push notification

      res.status(201).json({ message: result.rows[0] });
    } catch (error) {
      console.error('Send DM error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

export default router;
