import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  generateImage,
  getUserGeneratedImages,
  saveToLibrary,
  markImageAsUsed,
  deleteGeneratedImage
} from '../services/imageGenerationService.js';

const router = express.Router();

/**
 * Generate an image using DALL-E 3
 * POST /api/ai/generate-image
 */
router.post('/generate-image', authenticate, async (req, res) => {
  try {
    const { prompt, size, style, quality, conversationId, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Validate size
    const validSizes = ['1024x1024', '1792x1024', '1024x1792'];
    if (size && !validSizes.includes(size)) {
      return res.status(400).json({ error: 'Invalid size. Must be 1024x1024, 1792x1024, or 1024x1792' });
    }

    // Validate style
    const validStyles = ['vivid', 'natural'];
    if (style && !validStyles.includes(style)) {
      return res.status(400).json({ error: 'Invalid style. Must be "vivid" or "natural"' });
    }

    const result = await generateImage(prompt, {
      userId: req.user.id,
      size: size || '1024x1024',
      style: style || 'vivid',
      quality: quality || 'hd',
      conversationId,
      context
    });

    res.json(result);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

/**
 * Get user's generated images
 * GET /api/ai/images
 */
router.get('/images', authenticate, async (req, res) => {
  try {
    const { conversationId, savedToLibrary, limit } = req.query;

    const images = await getUserGeneratedImages(req.user.id, {
      conversationId,
      savedToLibrary: savedToLibrary === 'true',
      limit: parseInt(limit) || 50
    });

    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

/**
 * Get specific generated image
 * GET /api/ai/images/:id
 */
router.get('/images/:id', authenticate, async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const image = await prisma.generatedImage.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

/**
 * Save image to library
 * POST /api/ai/images/:id/save
 */
router.post('/images/:id/save', authenticate, async (req, res) => {
  try {
    const updated = await saveToLibrary(req.params.id, req.user.id);
    res.json(updated);
  } catch (error) {
    console.error('Error saving to library:', error);
    res.status(500).json({ error: error.message || 'Failed to save to library' });
  }
});

/**
 * Mark image as used
 * POST /api/ai/images/:id/mark-used
 */
router.post('/images/:id/mark-used', authenticate, async (req, res) => {
  try {
    const { usedIn } = req.body;

    if (!usedIn) {
      return res.status(400).json({ error: 'usedIn field is required' });
    }

    const updated = await markImageAsUsed(req.params.id, req.user.id, usedIn);
    res.json(updated);
  } catch (error) {
    console.error('Error marking image as used:', error);
    res.status(500).json({ error: error.message || 'Failed to mark image as used' });
  }
});

/**
 * Delete generated image
 * DELETE /api/ai/images/:id
 */
router.delete('/images/:id', authenticate, async (req, res) => {
  try {
    await deleteGeneratedImage(req.params.id, req.user.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: error.message || 'Failed to delete image' });
  }
});

export default router;
