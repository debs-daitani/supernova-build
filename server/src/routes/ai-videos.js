import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  generateVideo,
  getVideoStatus,
  getUserGeneratedVideos,
  saveVideoToLibrary,
  deleteGeneratedVideo
} from '../services/videoGenerationService.js';

const router = express.Router();

/**
 * Generate a video using AI
 * POST /api/ai/generate-video
 */
router.post('/generate-video', authenticate, async (req, res) => {
  try {
    const {
      prompt,
      duration,
      resolution,
      model,
      videoType,
      conversationId,
      context
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Validate duration (5-60 seconds)
    if (duration && (duration < 5 || duration > 60)) {
      return res.status(400).json({ error: 'Duration must be between 5 and 60 seconds' });
    }

    // Validate resolution
    const validResolutions = ['720p', '1080p', '4k'];
    if (resolution && !validResolutions.includes(resolution)) {
      return res.status(400).json({ error: 'Invalid resolution. Must be 720p, 1080p, or 4k' });
    }

    // Validate video type
    const validTypes = ['text-to-video', 'image-to-video', 'ai-avatar'];
    if (videoType && !validTypes.includes(videoType)) {
      return res.status(400).json({ error: 'Invalid video type' });
    }

    const result = await generateVideo(prompt, {
      userId: req.user.id,
      duration: duration || 5,
      resolution: resolution || '1080p',
      model: model || 'runway-gen3',
      videoType: videoType || 'text-to-video',
      conversationId,
      context
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating video:', error);
    res.status(500).json({ error: error.message || 'Failed to generate video' });
  }
});

/**
 * Get video status
 * GET /api/ai/videos/:id/status
 */
router.get('/videos/:id/status', authenticate, async (req, res) => {
  try {
    const status = await getVideoStatus(req.params.id, req.user.id);
    res.json(status);
  } catch (error) {
    console.error('Error getting video status:', error);
    res.status(500).json({ error: error.message || 'Failed to get video status' });
  }
});

/**
 * Get user's generated videos
 * GET /api/ai/videos
 */
router.get('/videos', authenticate, async (req, res) => {
  try {
    const { status, conversationId, limit } = req.query;

    const videos = await getUserGeneratedVideos(req.user.id, {
      status,
      conversationId,
      limit: parseInt(limit) || 50
    });

    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

/**
 * Get specific generated video
 * GET /api/ai/videos/:id
 */
router.get('/videos/:id', authenticate, async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const video = await prisma.generatedVideo.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

/**
 * Save video to library
 * POST /api/ai/videos/:id/save
 */
router.post('/videos/:id/save', authenticate, async (req, res) => {
  try {
    const updated = await saveVideoToLibrary(req.params.id, req.user.id);
    res.json(updated);
  } catch (error) {
    console.error('Error saving to library:', error);
    res.status(500).json({ error: error.message || 'Failed to save to library' });
  }
});

/**
 * Delete generated video
 * DELETE /api/ai/videos/:id
 */
router.delete('/videos/:id', authenticate, async (req, res) => {
  try {
    await deleteGeneratedVideo(req.params.id, req.user.id);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: error.message || 'Failed to delete video' });
  }
});

export default router;
