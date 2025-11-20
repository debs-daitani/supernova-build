/**
 * Viral Content Routes
 *
 * API endpoints for viral content analyzer
 */

import { Router } from 'express';
import { ViralContentService } from '../services/viralContentService';
import { ViralAnalysisService } from '../services/viralAnalysisService';
import { ContentPatternService } from '../services/contentPatternService';
import { TrendService } from '../services/trendService';
import { ContentIdeaService } from '../services/contentIdeaService';
import { ContentSubmissionService } from '../services/contentSubmissionService';

const router = Router();

// ============================================
// VIRAL CONTENT DISCOVERY
// ============================================

/**
 * GET /api/viral/trending
 * Get trending viral content
 */
router.get('/trending', async (req, res) => {
  try {
    const { platform, industry, contentType, minViralScore, page = '1', limit = '20' } = req.query;

    const filters: any = {};
    if (platform) filters.platform = platform;
    if (industry) filters.industry = industry;
    if (contentType) filters.contentType = contentType;
    if (minViralScore) filters.minViralScore = Number(minViralScore);

    const result = await ViralContentService.getTrendingContent(
      filters,
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
 * GET /api/viral/search
 * Search viral content
 */
router.get('/search', async (req, res) => {
  try {
    const { query, platform, industry, contentType, page = '1', limit = '20' } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const filters: any = {};
    if (platform) filters.platform = platform;
    if (industry) filters.industry = industry;
    if (contentType) filters.contentType = contentType;

    const result = await ViralContentService.searchViralContent(
      query as string,
      filters,
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
 * GET /api/viral/stats
 * Get viral content statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { platform, industry } = req.query;

    const filters: any = {};
    if (platform) filters.platform = platform;
    if (industry) filters.industry = industry;

    const stats = await ViralContentService.getStats(filters);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// VIRAL CONTENT ANALYSIS
// ============================================

/**
 * POST /api/viral/analyze
 * Analyze viral content by URL
 */
router.post('/analyze', async (req, res) => {
  try {
    const { url, userId } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    // Check if content already analyzed
    let viralContent = await ViralContentService.getViralContentByUrl(url);

    if (!viralContent) {
      // TODO: Scrape content from URL
      // For now, return error - this needs URL scraping implementation
      return res.status(400).json({
        success: false,
        error: 'URL scraping not yet implemented. Please use existing viral content.',
      });
    }

    // Perform analysis if not already done
    let analysis = await ViralAnalysisService.getAnalysis(viralContent.id);

    if (!analysis) {
      analysis = await ViralAnalysisService.analyzeViralContent(viralContent.id);
    }

    res.json({
      success: true,
      data: {
        content: viralContent,
        analysis,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/viral/:id
 * Get viral content details with analysis
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const content = await ViralContentService.getViralContentById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Viral content not found',
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// CONTENT PATTERNS
// ============================================

/**
 * GET /api/viral/patterns
 * Get content patterns
 */
router.get('/patterns/list', async (req, res) => {
  try {
    const { platform, patternType } = req.query;

    const filters: any = {};
    if (platform) filters.platform = platform;
    if (patternType) filters.patternType = patternType;

    const patterns = await ContentPatternService.getPatterns(filters);

    res.json({
      success: true,
      data: patterns,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/viral/patterns/:id
 * Get pattern details
 */
router.get('/patterns/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pattern = await ContentPatternService.getPatternById(id);

    if (!pattern) {
      return res.status(404).json({
        success: false,
        error: 'Pattern not found',
      });
    }

    res.json({
      success: true,
      data: pattern,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/viral/patterns/discover
 * Discover new patterns from viral content
 */
router.post('/patterns/discover', async (req, res) => {
  try {
    const { platform } = req.body;

    const patterns = await ContentPatternService.discoverPatterns(platform);

    res.json({
      success: true,
      data: patterns,
      message: `Discovered ${patterns.length} patterns`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// CONTENT IDEAS
// ============================================

/**
 * POST /api/viral/ideas/generate
 * Generate content ideas
 */
router.post('/ideas/generate', async (req, res) => {
  try {
    const { userId, platform, topic, industry, count } = req.body;

    if (!userId || !platform) {
      return res.status(400).json({
        success: false,
        error: 'userId and platform are required',
      });
    }

    const ideas = await ContentIdeaService.generateIdeas({
      userId,
      platform,
      topic,
      industry,
      count,
    });

    res.json({
      success: true,
      data: ideas,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/viral/ideas
 * Get user's content ideas
 */
router.get('/ideas/my-ideas', async (req, res) => {
  try {
    const { userId, platform, status, page = '1', limit = '20' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const filters: any = {};
    if (platform) filters.platform = platform;
    if (status) filters.status = status;

    const result = await ContentIdeaService.getUserContentIdeas(
      userId as string,
      filters,
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
 * POST /api/viral/ideas
 * Create content idea
 */
router.post('/ideas', async (req, res) => {
  try {
    const idea = await ContentIdeaService.createContentIdea(req.body);

    res.json({
      success: true,
      data: idea,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/viral/ideas/:id
 * Get content idea details
 */
router.get('/ideas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await ContentIdeaService.getContentIdeaById(id);

    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Content idea not found',
      });
    }

    res.json({
      success: true,
      data: idea,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/viral/ideas/:id
 * Update content idea
 */
router.put('/ideas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await ContentIdeaService.updateContentIdea(id, req.body);

    res.json({
      success: true,
      data: idea,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/viral/ideas/:id
 * Delete content idea
 */
router.delete('/ideas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await ContentIdeaService.deleteContentIdea(id);

    res.json({
      success: true,
      message: 'Content idea deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// CONTENT BUILDER
// ============================================

/**
 * POST /api/viral/build
 * Build content with AI guidance
 */
router.post('/build', async (req, res) => {
  try {
    const guide = await ContentIdeaService.buildContent(req.body);

    res.json({
      success: true,
      data: guide,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/viral/predict
 * Predict virality of content draft
 */
router.post('/predict', async (req, res) => {
  try {
    const { platform, idea, hook, content, hashtags } = req.body;

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required',
      });
    }

    const viralScore = await ContentIdeaService.predictViralScore({
      platform,
      idea,
      hook,
      content,
      hashtags,
    });

    res.json({
      success: true,
      data: {
        viralScore,
        level: viralScore >= 80 ? 'MEGA_VIRAL' : viralScore >= 60 ? 'VIRAL' : viralScore >= 40 ? 'TRENDING' : 'LOW',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// TRENDS
// ============================================

/**
 * GET /api/viral/trends
 * Get current trends
 */
router.get('/trends/current', async (req, res) => {
  try {
    const { platform, category, status } = req.query;

    const filters: any = {};
    if (platform) filters.platform = platform;
    if (category) filters.category = category;
    if (status) filters.status = status;

    const trends = await TrendService.getCurrentTrends(filters);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/viral/trends/:id
 * Get trend details
 */
router.get('/trends/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const trend = await TrendService.getTrendById(id);

    if (!trend) {
      return res.status(404).json({
        success: false,
        error: 'Trend not found',
      });
    }

    const stats = await TrendService.getTrendStats(id);

    res.json({
      success: true,
      data: {
        ...trend,
        stats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/viral/trends/discover
 * Discover new trends
 */
router.post('/trends/discover', async (req, res) => {
  try {
    const { platform } = req.body;

    const trends = await TrendService.discoverTrends(platform);

    res.json({
      success: true,
      data: trends,
      message: `Discovered ${trends.length} trends`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// USER CONTENT SUBMISSIONS
// ============================================

/**
 * POST /api/viral/submit
 * Submit user's content for analysis
 */
router.post('/submit', async (req, res) => {
  try {
    const submission = await ContentSubmissionService.submitContent(req.body);

    res.json({
      success: true,
      data: submission,
      message: 'Content submitted for analysis',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/viral/my-content
 * Get user's submitted content
 */
router.get('/my-content', async (req, res) => {
  try {
    const { userId, page = '1', limit = '20' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const result = await ContentSubmissionService.getUserSubmissions(
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
 * GET /api/viral/my-content/:id/compare
 * Compare user's content with viral content
 */
router.get('/my-content/:id/compare', async (req, res) => {
  try {
    const { id } = req.params;

    const comparison = await ContentSubmissionService.compareWithViral(id);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/viral/analytics
 * Get user's viral content analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const [performanceSummary, ideaStats] = await Promise.all([
      ContentSubmissionService.getUserPerformanceSummary(userId as string),
      ContentIdeaService.getUserStats(userId as string),
    ]);

    res.json({
      success: true,
      data: {
        performance: performanceSummary,
        ideas: ideaStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
