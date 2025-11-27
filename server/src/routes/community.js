import express from 'express';
import prisma from '../config/database.js';
import { authenticate, requireMember } from '../middleware/auth.js';
import { validateForumPost } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

// GET /api/community/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.forumCategory.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/community/posts
router.get('/posts', async (req, res) => {
  try {
    const { categoryId, search, filter = 'all', limit = 20, offset = 0 } = req.query;

    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = [];

    if (filter === 'unanswered') {
      where.comments = { none: {} };
    } else if (filter === 'popular') {
      orderBy.push({ viewCount: 'desc' });
    }

    orderBy.push({ isPinned: 'desc' }, { createdAt: 'desc' });

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          category: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy,
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.forumPost.count({ where }),
    ]);

    res.json({ posts, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /api/community/posts
router.post('/posts', requireMember, validateForumPost, async (req, res) => {
  try {
    const { categoryId, title, content } = req.body;

    const post = await prisma.forumPost.create({
      data: {
        userId: req.user.id,
        categoryId,
        title,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET /api/community/posts/:id
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await prisma.forumPost.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            createdAt: true,
          },
        },
        category: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          where: { parentId: null }, // Only root comments
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await prisma.forumPost.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } },
    });

    // Check if user has liked
    const userLike = await prisma.forumLike.findUnique({
      where: {
        postId_userId: {
          postId: req.params.id,
          userId: req.user.id,
        },
      },
    });

    res.json({ ...post, userHasLiked: !!userLike });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { content, parentId } = req.body;

    const comment = await prisma.forumComment.create({
      data: {
        postId: req.params.id,
        userId: req.user.id,
        content,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', async (req, res) => {
  try {
    const existingLike = await prisma.forumLike.findUnique({
      where: {
        postId_userId: {
          postId: req.params.id,
          userId: req.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.forumLike.delete({
        where: { id: existingLike.id },
      });
      return res.json({ liked: false });
    } else {
      // Like
      await prisma.forumLike.create({
        data: {
          postId: req.params.id,
          userId: req.user.id,
        },
      });
      return res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// DELETE /api/community/posts/:id
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await prisma.forumPost.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found or access denied' });
    }

    await prisma.forumPost.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
