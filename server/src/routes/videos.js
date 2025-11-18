const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authMiddleware);

// ============================================================================
// CHANNEL ENDPOINTS
// ============================================================================

// Create or get channel
router.post('/channels', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { channelName, handle, description, avatar, banner } = req.body;

    // Check if channel already exists
    let channel = await prisma.videoChannel.findUnique({
      where: { userId },
    });

    if (channel) {
      return res.status(400).json({ error: 'Channel already exists for this user' });
    }

    // Check if handle is taken
    const existingHandle = await prisma.videoChannel.findUnique({
      where: { handle },
    });

    if (existingHandle) {
      return res.status(400).json({ error: 'Handle is already taken' });
    }

    // Create channel
    channel = await prisma.videoChannel.create({
      data: {
        userId,
        channelName,
        handle,
        description,
        avatar,
        banner,
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

    res.status(201).json(channel);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// Get channel by handle
router.get('/channels/:handle', async (req, res) => {
  try {
    const { handle } = req.params;

    const channel = await prisma.videoChannel.findUnique({
      where: { handle },
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
            videos: true,
            subscribers: true,
            playlists: true,
          },
        },
      },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if requesting user is subscribed
    let isSubscribed = false;
    if (req.user.userId) {
      const subscription = await prisma.subscription.findUnique({
        where: {
          subscriberId_channelId: {
            subscriberId: req.user.userId,
            channelId: channel.id,
          },
        },
      });
      isSubscribed = !!subscription;
    }

    res.json({
      ...channel,
      isSubscribed,
    });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
});

// Get own channel
router.get('/channels/me/info', async (req, res) => {
  try {
    const userId = req.user.userId;

    const channel = await prisma.videoChannel.findUnique({
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

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json(channel);
  } catch (error) {
    console.error('Get own channel error:', error);
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
});

// Update channel
router.patch('/channels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { channelName, description, avatar, banner } = req.body;

    // Check ownership
    const channel = await prisma.videoChannel.findUnique({
      where: { id },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this channel' });
    }

    // Update channel
    const updated = await prisma.videoChannel.update({
      where: { id },
      data: {
        ...(channelName && { channelName }),
        ...(description !== undefined && { description }),
        ...(avatar !== undefined && { avatar }),
        ...(banner !== undefined && { banner }),
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
    console.error('Update channel error:', error);
    res.status(500).json({ error: 'Failed to update channel' });
  }
});

// Subscribe to channel
router.post('/channels/:id/subscribe', async (req, res) => {
  try {
    const subscriberId = req.user.userId;
    const channelId = req.params.id;

    // Check if channel exists
    const channel = await prisma.videoChannel.findUnique({
      where: { id: channelId },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Can't subscribe to own channel
    if (channel.userId === subscriberId) {
      return res.status(400).json({ error: 'Cannot subscribe to your own channel' });
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        subscriberId,
        channelId,
        notificationLevel: req.body.notificationLevel || 'all',
      },
    });

    // Increment subscriber count
    await prisma.videoChannel.update({
      where: { id: channelId },
      data: { subscribersCount: { increment: 1 } },
    });

    res.json({ success: true, subscription });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already subscribed to this channel' });
    }
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Unsubscribe from channel
router.delete('/channels/:id/unsubscribe', async (req, res) => {
  try {
    const subscriberId = req.user.userId;
    const channelId = req.params.id;

    // Delete subscription
    await prisma.subscription.delete({
      where: {
        subscriberId_channelId: {
          subscriberId,
          channelId,
        },
      },
    });

    // Decrement subscriber count
    await prisma.videoChannel.update({
      where: { id: channelId },
      data: { subscribersCount: { decrement: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// Get subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriberId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const subscriptions = await prisma.subscription.findMany({
      where: { subscriberId },
      include: {
        channel: {
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
      skip,
      take: limit,
      orderBy: { subscribedAt: 'desc' },
    });

    const total = await prisma.subscription.count({
      where: { subscriberId },
    });

    res.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// ============================================================================
// VIDEO ENDPOINTS
// ============================================================================

// Upload video (initialize)
router.post('/upload/init', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      videoType,
      tags,
      category,
      visibility,
      adsEnabled,
    } = req.body;

    // Get or check channel
    let channel = await prisma.videoChannel.findUnique({
      where: { userId },
    });

    if (!channel) {
      return res.status(400).json({ error: 'You need to create a channel first' });
    }

    // Create video
    const video = await prisma.video.create({
      data: {
        channelId: channel.id,
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration,
        videoType: videoType || 'long',
        tags: tags || [],
        category,
        visibility: visibility || 'public',
        adsEnabled: adsEnabled || false,
        status: 'processing',
      },
    });

    // Increment videos count
    await prisma.videoChannel.update({
      where: { id: channel.id },
      data: { videosCount: { increment: 1 } },
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Publish video
router.post('/videos/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check ownership
    const video = await prisma.video.findUnique({
      where: { id },
      include: { channel: true },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.channel.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to publish this video' });
    }

    // Publish video
    const updated = await prisma.video.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
        status: 'ready',
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Publish video error:', error);
    res.status(500).json({ error: 'Failed to publish video' });
  }
});

// Get videos (with filters)
router.get('/videos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const {
      videoType,
      category,
      channelId,
      search,
      sort,
    } = req.query;

    // Build where clause
    const where = {
      isPublished: true,
      status: 'ready',
      ...(videoType && { videoType }),
      ...(category && { category }),
      ...(channelId && { channelId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
    };

    // Build order by
    let orderBy;
    switch (sort) {
      case 'views':
        orderBy = { viewsCount: 'desc' };
        break;
      case 'likes':
        orderBy = { likesCount: 'desc' };
        break;
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      default:
        orderBy = { publishedAt: 'desc' };
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        channel: {
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
      skip,
      take: limit,
      orderBy,
    });

    const total = await prisma.video.count({ where });

    res.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get single video
router.get('/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        channel: {
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
        _count: {
          select: {
            comments: true,
            likes: true,
            views: true,
          },
        },
      },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if user has liked/disliked
    let userLike = null;
    if (req.user.userId) {
      const like = await prisma.videoLike.findUnique({
        where: {
          videoId_userId: {
            videoId: id,
            userId: req.user.userId,
          },
        },
      });
      userLike = like?.likeType || null;
    }

    res.json({
      ...video,
      userLike,
    });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Update video
router.patch('/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      title,
      description,
      thumbnailUrl,
      tags,
      category,
      visibility,
      adsEnabled,
    } = req.body;

    // Check ownership
    const video = await prisma.video.findUnique({
      where: { id },
      include: { channel: true },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.channel.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this video' });
    }

    // Update video
    const updated = await prisma.video.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(tags && { tags }),
        ...(category && { category }),
        ...(visibility && { visibility }),
        ...(adsEnabled !== undefined && { adsEnabled }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video
router.delete('/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check ownership
    const video = await prisma.video.findUnique({
      where: { id },
      include: { channel: true },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.channel.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this video' });
    }

    // Delete video
    await prisma.video.delete({
      where: { id },
    });

    // Decrement videos count
    await prisma.videoChannel.update({
      where: { id: video.channelId },
      data: { videosCount: { decrement: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Like video
router.post('/videos/:id/like', async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.userId;
    const { likeType } = req.body; // 'like' or 'dislike'

    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if already liked/disliked
    const existingLike = await prisma.videoLike.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Update existing like
      if (existingLike.likeType !== likeType) {
        await prisma.videoLike.update({
          where: { id: existingLike.id },
          data: { likeType },
        });

        // Update counts
        if (likeType === 'like') {
          await prisma.video.update({
            where: { id: videoId },
            data: {
              likesCount: { increment: 1 },
              dislikesCount: { decrement: 1 },
            },
          });
        } else {
          await prisma.video.update({
            where: { id: videoId },
            data: {
              likesCount: { decrement: 1 },
              dislikesCount: { increment: 1 },
            },
          });
        }
      }
    } else {
      // Create new like
      await prisma.videoLike.create({
        data: {
          videoId,
          userId,
          likeType,
        },
      });

      // Update count
      if (likeType === 'like') {
        await prisma.video.update({
          where: { id: videoId },
          data: { likesCount: { increment: 1 } },
        });
      } else {
        await prisma.video.update({
          where: { id: videoId },
          data: { dislikesCount: { increment: 1 } },
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({ error: 'Failed to like video' });
  }
});

// Unlike video
router.delete('/videos/:id/like', async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.userId;

    const like = await prisma.videoLike.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId,
        },
      },
    });

    if (!like) {
      return res.status(404).json({ error: 'Like not found' });
    }

    // Delete like
    await prisma.videoLike.delete({
      where: { id: like.id },
    });

    // Update count
    if (like.likeType === 'like') {
      await prisma.video.update({
        where: { id: videoId },
        data: { likesCount: { decrement: 1 } },
      });
    } else {
      await prisma.video.update({
        where: { id: videoId },
        data: { dislikesCount: { decrement: 1 } },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Unlike video error:', error);
    res.status(500).json({ error: 'Failed to unlike video' });
  }
});

// Log video view
router.post('/videos/:id/view', async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.userId || null;
    const { watchTime, completed, ipAddress, userAgent, referrer } = req.body;

    // Create view record
    await prisma.videoView.create({
      data: {
        videoId,
        userId,
        watchTime: watchTime || 0,
        completed: completed || false,
        ipAddress,
        userAgent,
        referrer,
      },
    });

    // Update video stats
    await prisma.video.update({
      where: { id: videoId },
      data: {
        viewsCount: { increment: 1 },
        ...(completed && { watchedToEnd: { increment: 1 } }),
      },
    });

    // Update channel total views
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { channelId: true },
    });

    await prisma.videoChannel.update({
      where: { id: video.channelId },
      data: { totalViews: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Log view error:', error);
    res.status(500).json({ error: 'Failed to log view' });
  }
});

// ============================================================================
// COMMENT ENDPOINTS
// ============================================================================

// Add comment
router.post('/videos/:id/comments', async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.userId;
    const { content, timestamp, parentId } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Create comment
    const comment = await prisma.videoComment.create({
      data: {
        videoId,
        userId,
        content,
        timestamp,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    // Increment comments count
    await prisma.video.update({
      where: { id: videoId },
      data: { commentsCount: { increment: 1 } },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments
router.get('/videos/:id/comments', async (req, res) => {
  try {
    const videoId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'top'; // 'top' or 'newest'

    const parentId = req.query.parentId || null;

    // Build order by
    let orderBy;
    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else {
      orderBy = { likesCount: 'desc' };
    }

    const comments = await prisma.videoComment.findMany({
      where: {
        videoId,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    });

    const total = await prisma.videoComment.count({
      where: {
        videoId,
        parentId,
      },
    });

    res.json({
      comments,
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

// Delete comment
router.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const comment = await prisma.videoComment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
    }

    // Delete comment
    await prisma.videoComment.delete({
      where: { id },
    });

    // Decrement comments count
    await prisma.video.update({
      where: { id: comment.videoId },
      data: { commentsCount: { decrement: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ============================================================================
// PLAYLIST ENDPOINTS
// ============================================================================

// Create playlist
router.post('/playlists', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, visibility, thumbnailUrl } = req.body;

    // Get channel
    const channel = await prisma.videoChannel.findUnique({
      where: { userId },
    });

    if (!channel) {
      return res.status(400).json({ error: 'You need to create a channel first' });
    }

    // Create playlist
    const playlist = await prisma.playlist.create({
      data: {
        channelId: channel.id,
        title,
        description,
        visibility: visibility || 'public',
        thumbnailUrl,
      },
    });

    res.status(201).json(playlist);
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Get playlist
router.get('/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        channel: {
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
        items: {
          include: {
            video: {
              include: {
                channel: {
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
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// Get channel playlists
router.get('/channels/:id/playlists', async (req, res) => {
  try {
    const channelId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const playlists = await prisma.playlist.findMany({
      where: { channelId },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.playlist.count({
      where: { channelId },
    });

    res.json({
      playlists,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Add video to playlist
router.post('/playlists/:id/add', async (req, res) => {
  try {
    const playlistId = req.params.id;
    const userId = req.user.userId;
    const { videoId } = req.body;

    // Check ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { channel: true },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.channel.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this playlist' });
    }

    // Get next order number
    const maxOrder = await prisma.playlistItem.findFirst({
      where: { playlistId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = (maxOrder?.order || 0) + 1;

    // Add video to playlist
    const item = await prisma.playlistItem.create({
      data: {
        playlistId,
        videoId,
        order: nextOrder,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Video already in playlist' });
    }
    console.error('Add to playlist error:', error);
    res.status(500).json({ error: 'Failed to add video to playlist' });
  }
});

// Remove video from playlist
router.delete('/playlists/:id/remove/:videoId', async (req, res) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user.userId;

    // Check ownership
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: { channel: true },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.channel.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this playlist' });
    }

    // Remove video
    await prisma.playlistItem.delete({
      where: {
        playlistId_videoId: {
          playlistId: id,
          videoId,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Remove from playlist error:', error);
    res.status(500).json({ error: 'Failed to remove video from playlist' });
  }
});

// ============================================================================
// SEARCH & DISCOVERY
// ============================================================================

// Search videos
router.get('/search', async (req, res) => {
  try {
    const { q, type, duration, sort } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Build where clause
    const where = {
      isPublished: true,
      status: 'ready',
      ...(type && { videoType: type }),
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ],
    };

    // Duration filter
    if (duration === 'short') {
      where.duration = { lt: 240 }; // < 4 min
    } else if (duration === 'medium') {
      where.duration = { gte: 240, lte: 1200 }; // 4-20 min
    } else if (duration === 'long') {
      where.duration = { gt: 1200 }; // > 20 min
    }

    // Build order by
    let orderBy;
    switch (sort) {
      case 'views':
        orderBy = { viewsCount: 'desc' };
        break;
      case 'date':
        orderBy = { publishedAt: 'desc' };
        break;
      default:
        orderBy = { viewsCount: 'desc' }; // Relevance approximated by views
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        channel: {
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
      skip,
      take: limit,
      orderBy,
    });

    const total = await prisma.video.count({ where });

    res.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

// Get recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;

    // Simple recommendation: most viewed recent videos
    // TODO: Implement proper recommendation algorithm based on watch history, likes, subscriptions
    const videos = await prisma.video.findMany({
      where: {
        isPublished: true,
        status: 'ready',
      },
      include: {
        channel: {
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
      take: limit,
      orderBy: [
        { viewsCount: 'desc' },
        { publishedAt: 'desc' },
      ],
    });

    res.json({ videos });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get trending videos
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Trending: most views in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const videos = await prisma.video.findMany({
      where: {
        isPublished: true,
        status: 'ready',
        publishedAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        channel: {
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
      take: limit,
      orderBy: { viewsCount: 'desc' },
    });

    res.json({ videos });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ error: 'Failed to fetch trending videos' });
  }
});

// Get shorts feed
router.get('/shorts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const shorts = await prisma.video.findMany({
      where: {
        isPublished: true,
        status: 'ready',
        videoType: 'short',
      },
      include: {
        channel: {
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
      skip,
      take: limit,
      orderBy: [
        { viewsCount: 'desc' },
        { publishedAt: 'desc' },
      ],
    });

    const total = await prisma.video.count({
      where: {
        isPublished: true,
        status: 'ready',
        videoType: 'short',
      },
    });

    res.json({
      shorts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get shorts error:', error);
    res.status(500).json({ error: 'Failed to fetch shorts' });
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

// Get channel analytics
router.get('/analytics/channel/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check ownership
    const channel = await prisma.videoChannel.findUnique({
      where: { id },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to view these analytics' });
    }

    // Get stats
    const videos = await prisma.video.findMany({
      where: { channelId: id },
      select: {
        id: true,
        title: true,
        viewsCount: true,
        likesCount: true,
        commentsCount: true,
        revenue: true,
        publishedAt: true,
      },
      orderBy: { viewsCount: 'desc' },
      take: 10,
    });

    // Calculate total revenue
    const totalRevenue = await prisma.video.aggregate({
      where: { channelId: id },
      _sum: {
        revenue: true,
      },
    });

    res.json({
      channel: {
        subscribersCount: channel.subscribersCount,
        videosCount: channel.videosCount,
        totalViews: channel.totalViews,
      },
      topVideos: videos,
      totalRevenue: totalRevenue._sum.revenue || 0,
    });
  } catch (error) {
    console.error('Get channel analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch channel analytics' });
  }
});

// Get video analytics
router.get('/analytics/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check ownership
    const video = await prisma.video.findUnique({
      where: { id },
      include: { channel: true },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.channel.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to view these analytics' });
    }

    // Get view stats
    const views = await prisma.videoView.findMany({
      where: { videoId: id },
      select: {
        watchTime: true,
        completed: true,
        viewedAt: true,
      },
    });

    // Calculate average watch time
    const totalWatchTime = views.reduce((sum, v) => sum + v.watchTime, 0);
    const avgWatchTime = views.length > 0 ? Math.floor(totalWatchTime / views.length) : 0;

    // Calculate completion rate
    const completedViews = views.filter((v) => v.completed).length;
    const completionRate = views.length > 0 ? (completedViews / views.length) * 100 : 0;

    res.json({
      video: {
        title: video.title,
        viewsCount: video.viewsCount,
        likesCount: video.likesCount,
        dislikesCount: video.dislikesCount,
        commentsCount: video.commentsCount,
        sharesCount: video.sharesCount,
        revenue: video.revenue,
      },
      avgWatchTime,
      completionRate: completionRate.toFixed(2),
      totalViews: views.length,
    });
  } catch (error) {
    console.error('Get video analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch video analytics' });
  }
});

module.exports = router;
