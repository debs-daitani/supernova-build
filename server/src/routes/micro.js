import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ============================================
// POSTS
// ============================================

// Create post
router.post('/posts', authenticate, async (req, res) => {
  try {
    const {
      content,
      mediaUrls = [],
      mediaType,
      pollOptions,
      pollEndsAt,
      isThread = false,
      threadId,
      threadOrder,
      replyToId,
      repostOfId,
      isQuote = false,
      visibility = 'public',
      isSensitive = false,
    } = req.body;

    // Validate 280 character limit
    if (content && content.length > 280) {
      return res.status(400).json({ error: 'Content must be 280 characters or less' });
    }

    // For reposts without quote, content should be empty
    if (repostOfId && !isQuote && content) {
      return res.status(400).json({ error: 'Pure reposts cannot have content' });
    }

    // Quote reposts must have content
    if (repostOfId && isQuote && !content?.trim()) {
      return res.status(400).json({ error: 'Quote reposts must have content' });
    }

    // Regular posts must have content or media
    if (!repostOfId && !content?.trim() && mediaUrls.length === 0) {
      return res.status(400).json({ error: 'Post must have content or media' });
    }

    const post = await prisma.microPost.create({
      data: {
        userId: req.user.userId,
        content: content || '',
        mediaUrls,
        mediaType,
        pollOptions,
        pollEndsAt: pollEndsAt ? new Date(pollEndsAt) : null,
        isThread,
        threadId,
        threadOrder,
        replyToId,
        repostOfId,
        isQuote,
        visibility,
        isSensitive,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        repostOf: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Increment reply count on parent post
    if (replyToId) {
      await prisma.microPost.update({
        where: { id: replyToId },
        data: { repliesCount: { increment: 1 } },
      });
    }

    // Increment repost count on original post
    if (repostOfId) {
      await prisma.microPost.update({
        where: { id: repostOfId },
        data: { repostsCount: { increment: 1 } },
      });
    }

    res.json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get timeline (For You - algorithm based)
router.get('/timeline/for-you', authenticate, async (req, res) => {
  try {
    const { limit = 20, cursor } = req.query;

    // Simple algorithm: Recent posts + engagement weighted
    // In production, this would be much more sophisticated
    const posts = await prisma.microPost.findMany({
      where: {
        visibility: 'public',
        replyToId: null, // Don't show replies in main timeline
        ...(cursor && { id: { lt: cursor } }),
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        repostOf: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        likes: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
      },
    });

    // Add userLiked and userBookmarked flags
    const postsWithFlags = posts.map((post) => ({
      ...post,
      userLiked: post.likes.length > 0,
      userBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    res.json({
      posts: postsWithFlags,
      nextCursor: posts.length === parseInt(limit) ? posts[posts.length - 1].id : null,
    });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ error: 'Failed to load timeline' });
  }
});

// Get timeline (Following - chronological)
router.get('/timeline/following', authenticate, async (req, res) => {
  try {
    const { limit = 20, cursor } = req.query;

    // Get users the current user is following
    const following = await prisma.microFollow.findMany({
      where: { followerId: req.user.userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    // Get posts from followed users
    const posts = await prisma.microPost.findMany({
      where: {
        userId: { in: followingIds },
        replyToId: null, // Don't show replies in main timeline
        ...(cursor && { id: { lt: cursor } }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        repostOf: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        likes: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
      },
    });

    const postsWithFlags = posts.map((post) => ({
      ...post,
      userLiked: post.likes.length > 0,
      userBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    res.json({
      posts: postsWithFlags,
      nextCursor: posts.length === parseInt(limit) ? posts[posts.length - 1].id : null,
    });
  } catch (error) {
    console.error('Get following timeline error:', error);
    res.status(500).json({ error: 'Failed to load timeline' });
  }
});

// Get single post
router.get('/posts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.microPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        repostOf: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        likes: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await prisma.microPost.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    res.json({
      ...post,
      userLiked: post.likes.length > 0,
      userBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to load post' });
  }
});

// Get post replies
router.get('/posts/:id/replies', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const replies = await prisma.microPost.findMany({
      where: { replyToId: id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
      },
    });

    const repliesWithFlags = replies.map((reply) => ({
      ...reply,
      userLiked: reply.likes.length > 0,
      userBookmarked: reply.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    res.json({ replies: repliesWithFlags });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ error: 'Failed to load replies' });
  }
});

// Get thread posts
router.get('/threads/:threadId', authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;

    const posts = await prisma.microPost.findMany({
      where: { threadId },
      orderBy: { threadOrder: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
      },
    });

    const postsWithFlags = posts.map((post) => ({
      ...post,
      userLiked: post.likes.length > 0,
      userBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    res.json({ posts: postsWithFlags });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ error: 'Failed to load thread' });
  }
});

// Delete post
router.delete('/posts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.microPost.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await prisma.microPost.delete({
      where: { id },
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get user posts
router.get('/users/:userId/posts', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, cursor, filter = 'posts' } = req.query;

    let where = {
      userId,
      ...(cursor && { id: { lt: cursor } }),
    };

    // Filter types: 'posts', 'replies', 'media', 'likes'
    if (filter === 'posts') {
      where.replyToId = null;
      where.repostOfId = null;
    } else if (filter === 'replies') {
      where.replyToId = { not: null };
    } else if (filter === 'media') {
      where.mediaUrls = { isEmpty: false };
    }

    let posts;
    if (filter === 'likes') {
      const likes = await prisma.microLike.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        include: {
          post: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
      posts = likes.map((like) => like.post);
    } else {
      posts = await prisma.microPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          repostOf: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          likes: {
            where: { userId: req.user.userId },
            select: { id: true },
          },
          bookmarks: {
            where: { userId: req.user.userId },
            select: { id: true },
          },
        },
      });
    }

    const postsWithFlags = posts.map((post) => ({
      ...post,
      userLiked: post.likes?.length > 0,
      userBookmarked: post.bookmarks?.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    res.json({
      posts: postsWithFlags,
      nextCursor: posts.length === parseInt(limit) ? posts[posts.length - 1].id : null,
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// ============================================
// LIKES
// ============================================

// Like post
router.post('/posts/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if already liked
    const existingLike = await prisma.microLike.findUnique({
      where: {
        userId_postId: {
          userId: req.user.userId,
          postId: id,
        },
      },
    });

    if (existingLike) {
      return res.status(400).json({ error: 'Post already liked' });
    }

    const like = await prisma.microLike.create({
      data: {
        userId: req.user.userId,
        postId: id,
      },
    });

    // Increment like count
    await prisma.microPost.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
    });

    res.json(like);
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Unlike post
router.delete('/posts/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.microLike.delete({
      where: {
        userId_postId: {
          userId: req.user.userId,
          postId: id,
        },
      },
    });

    // Decrement like count
    await prisma.microPost.update({
      where: { id },
      data: { likesCount: { decrement: 1 } },
    });

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

// ============================================
// BOOKMARKS
// ============================================

// Bookmark post
router.post('/posts/:id/bookmark', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { collectionId } = req.body;

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: req.user.userId,
          postId: id,
        },
      },
    });

    if (existingBookmark) {
      return res.status(400).json({ error: 'Post already bookmarked' });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: req.user.userId,
        postId: id,
        collectionId,
      },
    });

    // Increment bookmark count
    await prisma.microPost.update({
      where: { id },
      data: { bookmarksCount: { increment: 1 } },
    });

    res.json(bookmark);
  } catch (error) {
    console.error('Bookmark post error:', error);
    res.status(500).json({ error: 'Failed to bookmark post' });
  }
});

// Remove bookmark
router.delete('/posts/:id/bookmark', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.bookmark.delete({
      where: {
        userId_postId: {
          userId: req.user.userId,
          postId: id,
        },
      },
    });

    // Decrement bookmark count
    await prisma.microPost.update({
      where: { id },
      data: { bookmarksCount: { decrement: 1 } },
    });

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// Get bookmarks
router.get('/bookmarks', authenticate, async (req, res) => {
  try {
    const { limit = 20, cursor, collectionId } = req.query;

    const where = {
      userId: req.user.userId,
      ...(collectionId && { collectionId }),
      ...(cursor && { id: { lt: cursor } }),
    };

    const bookmarks = await prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.json({
      bookmarks,
      nextCursor: bookmarks.length === parseInt(limit) ? bookmarks[bookmarks.length - 1].id : null,
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Failed to load bookmarks' });
  }
});

// Create bookmark collection
router.post('/bookmark-collections', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const collection = await prisma.bookmarkCollection.create({
      data: {
        userId: req.user.userId,
        name,
        description,
      },
    });

    res.json(collection);
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Get bookmark collections
router.get('/bookmark-collections', authenticate, async (req, res) => {
  try {
    const collections = await prisma.bookmarkCollection.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { bookmarks: true },
        },
      },
    });

    res.json({ collections });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to load collections' });
  }
});

// Update bookmark collection
router.put('/bookmark-collections/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const collection = await prisma.bookmarkCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.bookmarkCollection.update({
      where: { id },
      data: { name, description },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// Delete bookmark collection
router.delete('/bookmark-collections/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await prisma.bookmarkCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.bookmarkCollection.delete({
      where: { id },
    });

    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// ============================================
// FOLLOW
// ============================================

// Follow user
router.post('/users/:userId/follow', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { notificationsOn = true } = req.body;

    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await prisma.microFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.userId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    const follow = await prisma.microFollow.create({
      data: {
        followerId: req.user.userId,
        followingId: userId,
        notificationsOn,
      },
    });

    res.json(follow);
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
router.delete('/users/:userId/follow', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    await prisma.microFollow.delete({
      where: {
        followerId_followingId: {
          followerId: req.user.userId,
          followingId: userId,
        },
      },
    });

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get followers
router.get('/users/:userId/followers', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, cursor } = req.query;

    const followers = await prisma.microFollow.findMany({
      where: {
        followingId: userId,
        ...(cursor && { id: { lt: cursor } }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    // Check if current user follows each follower
    const followerIds = followers.map((f) => f.followerId);
    const currentUserFollowing = await prisma.microFollow.findMany({
      where: {
        followerId: req.user.userId,
        followingId: { in: followerIds },
      },
      select: { followingId: true },
    });

    const followingSet = new Set(currentUserFollowing.map((f) => f.followingId));

    const followersWithStatus = followers.map((f) => ({
      ...f.follower,
      isFollowing: followingSet.has(f.followerId),
      followedAt: f.createdAt,
    }));

    res.json({
      followers: followersWithStatus,
      nextCursor: followers.length === parseInt(limit) ? followers[followers.length - 1].id : null,
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to load followers' });
  }
});

// Get following
router.get('/users/:userId/following', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, cursor } = req.query;

    const following = await prisma.microFollow.findMany({
      where: {
        followerId: userId,
        ...(cursor && { id: { lt: cursor } }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        following: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    // Check if current user follows each user
    const followingIds = following.map((f) => f.followingId);
    const currentUserFollowing = await prisma.microFollow.findMany({
      where: {
        followerId: req.user.userId,
        followingId: { in: followingIds },
      },
      select: { followingId: true },
    });

    const followingSet = new Set(currentUserFollowing.map((f) => f.followingId));

    const followingWithStatus = following.map((f) => ({
      ...f.following,
      isFollowing: followingSet.has(f.followingId) || f.followingId === req.user.userId,
      followedAt: f.createdAt,
    }));

    res.json({
      following: followingWithStatus,
      nextCursor: following.length === parseInt(limit) ? following[following.length - 1].id : null,
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to load following' });
  }
});

// Get user profile stats
router.get('/users/:userId/stats', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    const [followersCount, followingCount, postsCount] = await Promise.all([
      prisma.microFollow.count({ where: { followingId: userId } }),
      prisma.microFollow.count({ where: { followerId: userId } }),
      prisma.microPost.count({ where: { userId, replyToId: null } }),
    ]);

    const isFollowing = await prisma.microFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.userId,
          followingId: userId,
        },
      },
    });

    res.json({
      followersCount,
      followingCount,
      postsCount,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to load user stats' });
  }
});

// ============================================
// LISTS
// ============================================

// Create list
router.post('/lists', authenticate, async (req, res) => {
  try {
    const { name, description, isPrivate = false } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'List name is required' });
    }

    const list = await prisma.microList.create({
      data: {
        userId: req.user.userId,
        name,
        description,
        isPrivate,
      },
    });

    res.json(list);
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Get lists
router.get('/lists', authenticate, async (req, res) => {
  try {
    const { userId } = req.query;

    const where = userId
      ? { userId, ...(userId !== req.user.userId && { isPrivate: false }) }
      : { userId: req.user.userId };

    const lists = await prisma.microList.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    res.json({ lists });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ error: 'Failed to load lists' });
  }
});

// Get single list
router.get('/lists/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const list = await prisma.microList.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.isPrivate && list.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to view this list' });
    }

    res.json(list);
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ error: 'Failed to load list' });
  }
});

// Update list
router.put('/lists/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPrivate } = req.body;

    const list = await prisma.microList.findUnique({
      where: { id },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.microList.update({
      where: { id },
      data: { name, description, isPrivate },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// Delete list
router.delete('/lists/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const list = await prisma.microList.findUnique({
      where: { id },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.microList.delete({
      where: { id },
    });

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// Add member to list
router.post('/lists/:id/members', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const list = await prisma.microList.findUnique({
      where: { id },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if already a member
    const existingMember = await prisma.listMember.findUnique({
      where: {
        listId_userId: {
          listId: id,
          userId,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User already in list' });
    }

    const member = await prisma.listMember.create({
      data: {
        listId: id,
        userId,
      },
    });

    res.json(member);
  } catch (error) {
    console.error('Add list member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from list
router.delete('/lists/:id/members/:userId', authenticate, async (req, res) => {
  try {
    const { id, userId } = req.params;

    const list = await prisma.microList.findUnique({
      where: { id },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.listMember.delete({
      where: {
        listId_userId: {
          listId: id,
          userId,
        },
      },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove list member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get list members
router.get('/lists/:id/members', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, cursor } = req.query;

    const list = await prisma.microList.findUnique({
      where: { id },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.isPrivate && list.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const members = await prisma.listMember.findMany({
      where: {
        listId: id,
        ...(cursor && { id: { lt: cursor } }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    res.json({
      members: members.map((m) => m.user),
      nextCursor: members.length === parseInt(limit) ? members[members.length - 1].id : null,
    });
  } catch (error) {
    console.error('Get list members error:', error);
    res.status(500).json({ error: 'Failed to load members' });
  }
});

// Get list timeline
router.get('/lists/:id/timeline', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, cursor } = req.query;

    const list = await prisma.microList.findUnique({
      where: { id },
    });

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.isPrivate && list.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get list member IDs
    const members = await prisma.listMember.findMany({
      where: { listId: id },
      select: { userId: true },
    });

    const memberIds = members.map((m) => m.userId);

    const posts = await prisma.microPost.findMany({
      where: {
        userId: { in: memberIds },
        replyToId: null,
        ...(cursor && { id: { lt: cursor } }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        repostOf: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        likes: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
      },
    });

    const postsWithFlags = posts.map((post) => ({
      ...post,
      userLiked: post.likes.length > 0,
      userBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    res.json({
      posts: postsWithFlags,
      nextCursor: posts.length === parseInt(limit) ? posts[posts.length - 1].id : null,
    });
  } catch (error) {
    console.error('Get list timeline error:', error);
    res.status(500).json({ error: 'Failed to load list timeline' });
  }
});

// ============================================
// TRENDING
// ============================================

// Get trending topics
router.get('/trending', authenticate, async (req, res) => {
  try {
    const { limit = 10, category } = req.query;

    // Get topics from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const where = {
      updatedAt: { gte: oneDayAgo },
      ...(category && { category }),
    };

    const topics = await prisma.trendingTopic.findMany({
      where,
      orderBy: { postCount: 'desc' },
      take: parseInt(limit),
    });

    res.json({ topics });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ error: 'Failed to load trending topics' });
  }
});

// Search posts by hashtag
router.get('/search/hashtag/:tag', authenticate, async (req, res) => {
  try {
    const { tag } = req.params;
    const { limit = 20, cursor } = req.query;

    const posts = await prisma.microPost.findMany({
      where: {
        content: { contains: `#${tag}`, mode: 'insensitive' },
        ...(cursor && { id: { lt: cursor } }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
      },
    });

    const postsWithFlags = posts.map((post) => ({
      ...post,
      userLiked: post.likes.length > 0,
      userBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    res.json({
      posts: postsWithFlags,
      nextCursor: posts.length === parseInt(limit) ? posts[posts.length - 1].id : null,
    });
  } catch (error) {
    console.error('Search hashtag error:', error);
    res.status(500).json({ error: 'Failed to search hashtag' });
  }
});

// ============================================
// SEARCH
// ============================================

// Search posts
router.get('/search/posts', authenticate, async (req, res) => {
  try {
    const { q, limit = 20, cursor } = req.query;

    if (!q?.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const posts = await prisma.microPost.findMany({
      where: {
        content: { contains: q, mode: 'insensitive' },
        ...(cursor && { id: { lt: cursor } }),
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        likes: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId: req.user.userId },
          select: { id: true },
        },
      },
    });

    const postsWithFlags = posts.map((post) => ({
      ...post,
      userLiked: post.likes.length > 0,
      userBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    res.json({
      posts: postsWithFlags,
      nextCursor: posts.length === parseInt(limit) ? posts[posts.length - 1].id : null,
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

// Search users
router.get('/search/users', authenticate, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q?.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { bio: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
      },
      take: parseInt(limit),
    });

    // Check if current user follows each user
    const userIds = users.map((u) => u.id);
    const following = await prisma.microFollow.findMany({
      where: {
        followerId: req.user.userId,
        followingId: { in: userIds },
      },
      select: { followingId: true },
    });

    const followingSet = new Set(following.map((f) => f.followingId));

    const usersWithStatus = users.map((u) => ({
      ...u,
      isFollowing: followingSet.has(u.id),
    }));

    res.json({ users: usersWithStatus });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// ============================================
// SPACES (Audio Conversations)
// ============================================

// Create space
router.post('/spaces', authenticate, async (req, res) => {
  try {
    const { title, description, scheduledFor } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Space title is required' });
    }

    const space = await prisma.space.create({
      data: {
        hostId: req.user.userId,
        title,
        description,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? 'scheduled' : 'live',
        startedAt: scheduledFor ? null : new Date(),
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.json(space);
  } catch (error) {
    console.error('Create space error:', error);
    res.status(500).json({ error: 'Failed to create space' });
  }
});

// Get spaces
router.get('/spaces', authenticate, async (req, res) => {
  try {
    const { status = 'live', limit = 20 } = req.query;

    const spaces = await prisma.space.findMany({
      where: { status },
      orderBy: status === 'live' ? { startedAt: 'desc' } : { scheduledFor: 'asc' },
      take: parseInt(limit),
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            speakers: true,
            listeners: true,
          },
        },
      },
    });

    res.json({ spaces });
  } catch (error) {
    console.error('Get spaces error:', error);
    res.status(500).json({ error: 'Failed to load spaces' });
  }
});

// Get single space
router.get('/spaces/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const space = await prisma.space.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        speakers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        listeners: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    res.json(space);
  } catch (error) {
    console.error('Get space error:', error);
    res.status(500).json({ error: 'Failed to load space' });
  }
});

// Join space as listener
router.post('/spaces/:id/join', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    if (space.status !== 'live') {
      return res.status(400).json({ error: 'Space is not live' });
    }

    // Check if already a listener or speaker
    const [existingListener, existingSpeaker] = await Promise.all([
      prisma.spaceListener.findUnique({
        where: {
          spaceId_userId: {
            spaceId: id,
            userId: req.user.userId,
          },
        },
      }),
      prisma.spaceSpeaker.findUnique({
        where: {
          spaceId_userId: {
            spaceId: id,
            userId: req.user.userId,
          },
        },
      }),
    ]);

    if (existingListener || existingSpeaker) {
      return res.status(400).json({ error: 'Already in space' });
    }

    const listener = await prisma.spaceListener.create({
      data: {
        spaceId: id,
        userId: req.user.userId,
      },
    });

    // Increment listener count
    await prisma.space.update({
      where: { id },
      data: { listenersCount: { increment: 1 } },
    });

    res.json(listener);
  } catch (error) {
    console.error('Join space error:', error);
    res.status(500).json({ error: 'Failed to join space' });
  }
});

// Request to speak
router.post('/spaces/:id/request-speak', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    if (space.status !== 'live') {
      return res.status(400).json({ error: 'Space is not live' });
    }

    // Remove from listeners if present
    await prisma.spaceListener.deleteMany({
      where: {
        spaceId: id,
        userId: req.user.userId,
      },
    });

    // Add as speaker (host will need to approve canSpeak)
    const speaker = await prisma.spaceSpeaker.create({
      data: {
        spaceId: id,
        userId: req.user.userId,
        canSpeak: space.hostId === req.user.userId, // Auto-approve host
        isModerator: space.hostId === req.user.userId,
      },
    });

    res.json(speaker);
  } catch (error) {
    console.error('Request speak error:', error);
    res.status(500).json({ error: 'Failed to request speak' });
  }
});

// Update speaker permissions (host only)
router.put('/spaces/:id/speakers/:userId', authenticate, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { canSpeak, isModerator } = req.body;

    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    if (space.hostId !== req.user.userId) {
      return res.status(403).json({ error: 'Only host can update speaker permissions' });
    }

    const speaker = await prisma.spaceSpeaker.update({
      where: {
        spaceId_userId: {
          spaceId: id,
          userId,
        },
      },
      data: { canSpeak, isModerator },
    });

    res.json(speaker);
  } catch (error) {
    console.error('Update speaker error:', error);
    res.status(500).json({ error: 'Failed to update speaker' });
  }
});

// Leave space
router.post('/spaces/:id/leave', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Remove from both listeners and speakers
    await Promise.all([
      prisma.spaceListener.deleteMany({
        where: {
          spaceId: id,
          userId: req.user.userId,
        },
      }),
      prisma.spaceSpeaker.deleteMany({
        where: {
          spaceId: id,
          userId: req.user.userId,
        },
      }),
    ]);

    res.json({ message: 'Left space successfully' });
  } catch (error) {
    console.error('Leave space error:', error);
    res.status(500).json({ error: 'Failed to leave space' });
  }
});

// End space (host only)
router.post('/spaces/:id/end', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { recordingUrl } = req.body;

    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    if (space.hostId !== req.user.userId) {
      return res.status(403).json({ error: 'Only host can end space' });
    }

    const updated = await prisma.space.update({
      where: { id },
      data: {
        status: 'ended',
        endedAt: new Date(),
        recordingUrl,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('End space error:', error);
    res.status(500).json({ error: 'Failed to end space' });
  }
});

export default router;
