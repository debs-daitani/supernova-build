/**
 * Content Repurpose Routes
 *
 * API endpoints for content repurposing system
 */

import { Router } from 'express';
import { ContentProcessingService } from '../services/contentProcessingService';
import { ContentGeneratorService } from '../services/contentGeneratorService';
import { ContentRepurposerService } from '../services/contentRepurposerService';

const router = Router();

// ============================================
// SOURCE CONTENT MANAGEMENT
// ============================================

/**
 * POST /api/repurpose/upload
 * Upload source content
 */
router.post('/upload', async (req, res) => {
  try {
    const { userId, title, contentType, sourceFile, sourceUrl, duration, wordCount, fileSize } = req.body;

    if (!userId || !title || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'userId, title, and contentType are required',
      });
    }

    const sourceContent = await ContentProcessingService.uploadSourceContent({
      userId,
      title,
      contentType,
      sourceFile,
      sourceUrl,
      duration,
      wordCount,
      fileSize,
    });

    res.json({
      success: true,
      data: sourceContent,
      message: 'Source content uploaded and processing started',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/repurpose/sources
 * List user's source content
 */
router.get('/sources', async (req, res) => {
  try {
    const { userId, page = '1', limit = '20' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const result = await ContentProcessingService.getUserSourceContent(
      userId as string,
      Number(page),
      Number(limit)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/repurpose/sources/:id
 * Get source content details
 */
router.get('/sources/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sourceContent = await ContentProcessingService.getSourceContent(id);

    if (!sourceContent) {
      return res.status(404).json({
        success: false,
        error: 'Source content not found',
      });
    }

    res.json({
      success: true,
      data: sourceContent,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/repurpose/sources/:id
 * Delete source content
 */
router.delete('/sources/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await ContentProcessingService.deleteSourceContent(id);

    res.json({
      success: true,
      message: 'Source content deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// CONTENT PROCESSING
// ============================================

/**
 * POST /api/repurpose/sources/:id/process
 * Manually trigger processing
 */
router.post('/sources/:id/process', async (req, res) => {
  try {
    const { id } = req.params;

    ContentProcessingService.processContent(id).catch(err => {
      console.error('Processing error:', err);
    });

    res.json({
      success: true,
      message: 'Processing started',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/repurpose/sources/:id/status
 * Check processing status
 */
router.get('/sources/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const status = await ContentProcessingService.getProcessingStatus(id);

    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Source content not found',
      });
    }

    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// CONTENT GENERATION
// ============================================

/**
 * POST /api/repurpose/sources/:id/generate
 * Generate repurposed outputs
 */
router.post('/sources/:id/generate', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, config } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const job = await ContentGeneratorService.generateAllOutputs(id, userId, config);

    res.json({
      success: true,
      data: job,
      message: 'Content generation started',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/repurpose/sources/:id/outputs
 * List outputs for source content
 */
router.get('/sources/:id/outputs', async (req, res) => {
  try {
    const { id } = req.params;
    const { outputType, platform, status } = req.query;

    const filters: any = {};
    if (outputType) filters.outputType = outputType;
    if (platform) filters.platform = platform;
    if (status) filters.status = status;

    const outputs = await ContentRepurposerService.getSourceOutputs(id, filters);

    res.json({
      success: true,
      data: outputs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// REPURPOSED CONTENT MANAGEMENT
// ============================================

/**
 * GET /api/repurpose/outputs/:id
 * Get output details
 */
router.get('/outputs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const output = await ContentRepurposerService.getRepurposedContent(id);

    if (!output) {
      return res.status(404).json({
        success: false,
        error: 'Output not found',
      });
    }

    res.json({
      success: true,
      data: output,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/repurpose/outputs/:id
 * Edit output
 */
router.patch('/outputs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const output = await ContentRepurposerService.updateRepurposedContent(id, updates);

    res.json({
      success: true,
      data: output,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/repurpose/outputs/:id
 * Delete output
 */
router.delete('/outputs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await ContentRepurposerService.deleteRepurposedContent(id);

    res.json({
      success: true,
      message: 'Output deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// SCHEDULING & PUBLISHING
// ============================================

/**
 * POST /api/repurpose/outputs/:id/schedule
 * Schedule output for publishing
 */
router.post('/outputs/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledFor } = req.body;

    if (!scheduledFor) {
      return res.status(400).json({
        success: false,
        error: 'scheduledFor date is required',
      });
    }

    const output = await ContentRepurposerService.scheduleContent(id, new Date(scheduledFor));

    res.json({
      success: true,
      data: output,
      message: 'Content scheduled successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/repurpose/outputs/:id/publish
 * Publish output immediately
 */
router.post('/outputs/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { publishedUrl } = req.body;

    const output = await ContentRepurposerService.publishContent(id, publishedUrl);

    res.json({
      success: true,
      data: output,
      message: 'Content published successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/repurpose/outputs/:id/performance
 * Update performance metrics
 */
router.post('/outputs/:id/performance', async (req, res) => {
  try {
    const { id } = req.params;
    const { performance } = req.body;

    const output = await ContentRepurposerService.updatePerformance(id, performance);

    res.json({
      success: true,
      data: output,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// CONTENT CALENDAR
// ============================================

/**
 * GET /api/repurpose/calendar
 * Get content calendar
 */
router.get('/calendar', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'userId, startDate, and endDate are required',
      });
    }

    const calendar = await ContentRepurposerService.getContentCalendar(
      userId as string,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({
      success: true,
      data: calendar,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/repurpose/calendar
 * Add content to calendar
 */
router.post('/calendar', async (req, res) => {
  try {
    const { userId, date, contentId, platform } = req.body;

    if (!userId || !date || !contentId) {
      return res.status(400).json({
        success: false,
        error: 'userId, date, and contentId are required',
      });
    }

    const entry = await ContentRepurposerService.addToCalendar(
      userId,
      new Date(date),
      contentId,
      platform
    );

    res.json({
      success: true,
      data: entry,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// JOBS & ANALYTICS
// ============================================

/**
 * GET /api/repurpose/jobs/:id
 * Get job status
 */
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await ContentRepurposerService.getJobStatus(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/repurpose/sources/:id/analytics
 * Get analytics for source content
 */
router.get('/sources/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;

    const analytics = await ContentRepurposerService.getSourceAnalytics(id);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
