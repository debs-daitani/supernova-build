const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticate = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authenticate);

// ============================================================================
// PROFILE ENDPOINTS
// ============================================================================

// Get user profile (public or own)
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;

    const profile = await prisma.socialProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Check if requesting user is following this profile
    let isFollowing = false;
    if (requestingUserId !== userId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: requestingUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    // Respect privacy settings
    if (profile.isPrivate && !isFollowing && requestingUserId !== userId) {
      return res.status(403).json({ error: 'This profile is private' });
    }

    res.json({
      ...profile,
      isFollowing,
      isOwnProfile: requestingUserId === userId,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get or create own profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;

    let profile = await prisma.socialProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Auto-create profile if doesn't exist
    if (!profile) {
      profile = await prisma.socialProfile.create({
        data: {
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get own profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.patch('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      bio,
      location,
      website,
      headline,
      company,
      jobTitle,
      coverPhoto,
      isPrivate,
    } = req.body;

    // Get or create profile first
    let profile = await prisma.socialProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.socialProfile.create({
        data: { userId },
      });
    }

    // Update profile
    const updated = await prisma.socialProfile.update({
      where: { userId },
      data: {
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(headline !== undefined && { headline }),
        ...(company !== undefined && { company }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(coverPhoto !== undefined && { coverPhoto }),
        ...(isPrivate !== undefined && { isPrivate }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Follow user
router.post('/follow/:userId', async (req, res) => {
  try {
    const followerId = req.user.userId;
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if target user exists
    const targetProfile = await prisma.socialProfile.findUnique({
      where: { userId: followingId },
    });

    if (!targetProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Update counts
    await Promise.all([
      prisma.socialProfile.update({
        where: { userId: followerId },
        data: { followingCount: { increment: 1 } },
      }),
      prisma.socialProfile.update({
        where: { userId: followingId },
        data: { followersCount: { increment: 1 } },
      }),
    ]);

    // Create notification
    await prisma.socialNotification.create({
      data: {
        userId: followingId,
        actorId: followerId,
        type: 'follow',
        message: 'started following you',
      },
    });

    res.json({ success: true, follow });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already following this user' });
    }
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
router.delete('/follow/:userId', async (req, res) => {
  try {
    const followerId = req.user.userId;
    const followingId = req.params.userId;

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    // Update counts
    await Promise.all([
      prisma.socialProfile.update({
        where: { userId: followerId },
        data: { followingCount: { decrement: 1 } },
      }),
      prisma.socialProfile.update({
        where: { userId: followingId },
        data: { followersCount: { decrement: 1 } },
      }),
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get followers
router.get('/followers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.follow.count({
      where: { followingId: userId },
    });

    res.json({
      followers: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Get following
router.get('/following/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.follow.count({
      where: { followerId: userId },
    });

    res.json({
      following: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// ============================================================================
// FEED ENDPOINTS
// ============================================================================

// Get personalized feed
router.get('/feed', async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const algorithm = req.query.algorithm || 'chronological'; // 'chronological' or 'engagement'

    // Get list of users the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId); // Include own posts

    // Build query
    const where = {
      userId: { in: followingIds },
      isDeleted: false,
      OR: [
        { visibility: 'public' },
        { visibility: 'followers', userId: { in: followingIds } },
        { visibility: 'private', userId },
      ],
    };

    // Determine order
    let orderBy;
    if (algorithm === 'engagement') {
      // Sort by engagement (likes + comments), then by recency
      orderBy = [
        { likesCount: 'desc' },
        { commentsCount: 'desc' },
        { createdAt: 'desc' },
      ];
    } else {
      // Chronological (default)
      orderBy = { createdAt: 'desc' };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        likes: {
          where: { userId },
          select: { id: true, reactionType: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    });

    const total = await prisma.post.count({ where });

    // Format response
    const formattedPosts = posts.map((post) => ({
      ...post,
      hasLiked: post.likes.length > 0,
      userReaction: post.likes[0]?.reactionType || null,
      likes: post._count.likes,
      comments: post._count.comments,
      shares: post._count.shares,
    }));

    res.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// ============================================================================
// POST ENDPOINTS
// ============================================================================

// Create post
router.post('/posts', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      content,
      mediaUrls,
      mediaType,
      pollOptions,
      pollEndsAt,
      linkUrl,
      linkTitle,
      linkDescription,
      linkImage,
      visibility,
      postType,
    } = req.body;

    // Ensure user has a social profile
    let profile = await prisma.socialProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.socialProfile.create({
        data: { userId },
      });
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        userId,
        content,
        mediaUrls: mediaUrls || [],
        mediaType,
        pollOptions: pollOptions ? JSON.parse(JSON.stringify(pollOptions)) : null,
        pollEndsAt: pollEndsAt ? new Date(pollEndsAt) : null,
        linkUrl,
        linkTitle,
        linkDescription,
        linkImage,
        visibility: visibility || 'public',
        postType: postType || 'post',
      },
      include: {
        user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Update posts count
    await prisma.socialProfile.update({
      where: { userId },
      data: { postsCount: { increment: 1 } },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get single post
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        likes: {
          where: { userId },
          select: { id: true, reactionType: true },
        },
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            likes: {
              where: { userId },
              select: { id: true },
            },
            _count: {
              select: {
                replies: true,
                likes: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.isDeleted) {
      return res.status(404).json({ error: 'Post has been deleted' });
    }

    // Check visibility permissions
    if (post.visibility === 'private' && post.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to view this post' });
    }

    // Format response
    const formattedPost = {
      ...post,
      hasLiked: post.likes.length > 0,
      userReaction: post.likes[0]?.reactionType || null,
      likes: post._count.likes,
      commentsCount: post._count.comments,
      shares: post._count.shares,
      topComments: post.comments.map((comment) => ({
        ...comment,
        hasLiked: comment.likes.length > 0,
        likesCount: comment._count.likes,
        repliesCount: comment._count.replies,
      })),
    };

    delete formattedPost._count;
    delete formattedPost.comments;

    // Increment views
    await prisma.post.update({
      where: { id: postId },
      data: { viewsCount: { increment: 1 } },
    });

    res.json(formattedPost);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Get user posts
router.get('/posts/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if requesting user can view posts
    const profile = await prisma.socialProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Build visibility filter
    let visibilityFilter;
    if (userId === requestingUserId) {
      // Own posts - see everything
      visibilityFilter = {};
    } else if (profile.isPrivate) {
      // Check if following
      const isFollowing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: requestingUserId,
            followingId: userId,
          },
        },
      });

      if (!isFollowing) {
        return res.status(403).json({ error: 'This profile is private' });
      }

      visibilityFilter = {
        OR: [{ visibility: 'public' }, { visibility: 'followers' }],
      };
    } else {
      // Public profile
      visibilityFilter = {
        OR: [{ visibility: 'public' }, { visibility: 'followers' }],
      };
    }

    const posts = await prisma.post.findMany({
      where: {
        userId,
        isDeleted: false,
        ...visibilityFilter,
      },
      include: {
        user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        likes: {
          where: { userId: requestingUserId },
          select: { id: true, reactionType: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.post.count({
      where: {
        userId,
        isDeleted: false,
        ...visibilityFilter,
      },
    });

    const formattedPosts = posts.map((post) => ({
      ...post,
      hasLiked: post.likes.length > 0,
      userReaction: post.likes[0]?.reactionType || null,
      likes: post._count.likes,
      comments: post._count.comments,
      shares: post._count.shares,
    }));

    res.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Update post
router.patch('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const { content, visibility, isPinned } = req.body;

    // Check ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this post' });
    }

    // Update post
    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(content !== undefined && { content }),
        ...(visibility !== undefined && { visibility }),
        ...(isPinned !== undefined && { isPinned }),
      },
      include: {
        user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
router.delete('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this post' });
    }

    // Soft delete
    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true },
    });

    // Update posts count
    await prisma.socialProfile.update({
      where: { userId },
      data: { postsCount: { decrement: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ============================================================================
// LIKE ENDPOINTS
// ============================================================================

// Like/react to post
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const { reactionType } = req.body; // 'like', 'love', 'celebrate', 'support', 'insightful'

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let like;
    if (existingLike) {
      // Update reaction type
      like = await prisma.like.update({
        where: { id: existingLike.id },
        data: { reactionType: reactionType || 'like' },
      });
    } else {
      // Create new like
      like = await prisma.like.create({
        data: {
          userId,
          postId,
          reactionType: reactionType || 'like',
        },
      });

      // Increment likes count
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });

      // Create notification (if not own post)
      if (post.userId !== userId) {
        await prisma.socialNotification.create({
          data: {
            userId: post.userId,
            actorId: userId,
            type: 'like',
            postId,
            message: `reacted to your post`,
          },
        });
      }
    }

    res.json({ success: true, like });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Unlike post
router.delete('/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    // Decrement likes count
    await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

// ============================================================================
// COMMENT ENDPOINTS
// ============================================================================

// Create comment
router.post('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const { content, parentId } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // If replying to a comment, check it exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.postId !== postId) {
        return res.status(400).json({ error: 'Invalid parent comment' });
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    // Increment comments count on post
    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    // Create notification (if not own post)
    if (post.userId !== userId) {
      await prisma.socialNotification.create({
        data: {
          userId: post.userId,
          actorId: userId,
          type: 'comment',
          postId,
          commentId: comment.id,
          message: 'commented on your post',
        },
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Get comments for post
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const parentId = req.query.parentId || null;

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.comment.count({
      where: {
        postId,
        parentId,
        isDeleted: false,
      },
    });

    const formattedComments = comments.map((comment) => ({
      ...comment,
      hasLiked: comment.likes.length > 0,
      likesCount: comment._count.likes,
      repliesCount: comment._count.replies,
    }));

    res.json({
      comments: formattedComments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Update comment
router.patch('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this comment' });
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
        isEdited: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
    }

    // Soft delete
    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    // Decrement comments count on post
    await prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Like comment
router.post('/comments/:commentId/like', async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Create like
    const like = await prisma.commentLike.create({
      data: {
        userId,
        commentId,
      },
    });

    res.json({ success: true, like });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already liked this comment' });
    }
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

// Unlike comment
router.delete('/comments/:commentId/like', async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    await prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ error: 'Failed to unlike comment' });
  }
});

// ============================================================================
// SHARE ENDPOINTS
// ============================================================================

// Share post
router.post('/posts/:postId/share', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const { caption } = req.body;

    const originalPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!originalPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create share
    const share = await prisma.share.create({
      data: {
        userId,
        postId,
        caption,
      },
    });

    // Increment shares count
    await prisma.post.update({
      where: { id: postId },
      data: { sharesCount: { increment: 1 } },
    });

    // Create notification (if not own post)
    if (originalPost.userId !== userId) {
      await prisma.socialNotification.create({
        data: {
          userId: originalPost.userId,
          actorId: userId,
          type: 'share',
          postId,
          message: 'shared your post',
        },
      });
    }

    res.status(201).json({ success: true, share });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ error: 'Failed to share post' });
  }
});

// ============================================================================
// STORY ENDPOINTS
// ============================================================================

// Create story
router.post('/stories', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      mediaType,
      mediaUrl,
      backgroundColor,
      textContent,
      visibility,
    } = req.body;

    if (!mediaType || !['image', 'video', 'text'].includes(mediaType)) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    // Stories expire after 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await prisma.story.create({
      data: {
        userId,
        mediaType,
        mediaUrl,
        backgroundColor,
        textContent,
        visibility: visibility || 'followers',
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(story);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// Get stories from following
router.get('/stories', async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get list of users the current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId); // Include own stories

    // Get active stories (not expired)
    const stories = await prisma.story.findMany({
      where: {
        userId: { in: followingIds },
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        views: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const key = story.userId;
      if (!acc[key]) {
        acc[key] = {
          user: story.user,
          stories: [],
          hasViewed: false,
        };
      }
      acc[key].stories.push({
        ...story,
        hasViewed: story.views.length > 0,
      });
      if (story.views.length === 0) {
        acc[key].hasViewed = false;
      }
      return acc;
    }, {});

    res.json({ storyGroups: Object.values(groupedStories) });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// Mark story as viewed
router.post('/stories/:storyId/view', async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.userId;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    if (new Date() > story.expiresAt) {
      return res.status(410).json({ error: 'Story has expired' });
    }

    // Create view record
    await prisma.storyView.create({
      data: {
        userId,
        storyId,
      },
    });

    // Increment views count
    await prisma.story.update({
      where: { id: storyId },
      data: { viewsCount: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Story already viewed' });
    }
    console.error('View story error:', error);
    res.status(500).json({ error: 'Failed to mark story as viewed' });
  }
});

// ============================================================================
// GROUP ENDPOINTS
// ============================================================================

// Create group
router.post('/groups', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      description,
      groupType,
      coverPhoto,
      rules,
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = await prisma.socialGroup.create({
      data: {
        ownerId: userId,
        name,
        description,
        groupType: groupType || 'public',
        coverPhoto,
        rules,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Add creator as admin member
    await prisma.groupMember.create({
      data: {
        userId,
        groupId: group.id,
        role: 'admin',
      },
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get groups
router.get('/groups', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const groupType = req.query.groupType;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(groupType && { groupType }),
    };

    const groups = await prisma.socialGroup.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.socialGroup.count({ where });

    res.json({
      groups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Join group
router.post('/groups/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    const group = await prisma.socialGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.groupType === 'secret') {
      return res.status(403).json({ error: 'Cannot join secret groups without invitation' });
    }

    // Create membership
    const member = await prisma.groupMember.create({
      data: {
        userId,
        groupId,
        role: 'member',
      },
    });

    // Increment members count
    await prisma.socialGroup.update({
      where: { id: groupId },
      data: { membersCount: { increment: 1 } },
    });

    res.json({ success: true, member });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already a member of this group' });
    }
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group
router.delete('/groups/:groupId/leave', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;

    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    // Decrement members count
    await prisma.socialGroup.update({
      where: { id: groupId },
      data: { membersCount: { decrement: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Create group post
router.post('/groups/:groupId/posts', async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.userId;
    const { content, mediaUrls, mediaType } = req.body;

    // Check membership
    const member = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({ error: 'You must be a member to post in this group' });
    }

    const post = await prisma.groupPost.create({
      data: {
        userId,
        groupId,
        content,
        mediaUrls: mediaUrls || [],
        mediaType,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Create group post error:', error);
    res.status(500).json({ error: 'Failed to create group post' });
  }
});

// ============================================================================
// NOTIFICATION ENDPOINTS
// ============================================================================

// Get notifications
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    const where = {
      userId,
      ...(unreadOnly && { isRead: false }),
    };

    const notifications = await prisma.socialNotification.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.socialNotification.count({ where });
    const unreadCount = await prisma.socialNotification.count({
      where: { userId, isRead: false },
    });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await prisma.socialNotification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to modify this notification' });
    }

    await prisma.socialNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/notifications/read-all', async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.socialNotification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// ============================================================================
// SEARCH ENDPOINTS
// ============================================================================

// Search users
router.get('/search/users', async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        socialProfile: {
          select: {
            bio: true,
            headline: true,
            followersCount: true,
            isVerified: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const total = await prisma.user.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Search posts
router.get('/search/posts', async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const posts = await prisma.post.findMany({
      where: {
        content: { contains: query, mode: 'insensitive' },
        isDeleted: false,
        visibility: 'public',
      },
      include: {
        user: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.post.count({
      where: {
        content: { contains: query, mode: 'insensitive' },
        isDeleted: false,
        visibility: 'public',
      },
    });

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ error: 'Failed to search posts' });
  }
});

export default router;
